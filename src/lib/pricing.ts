import { SimulatorParams, V11_SCENARIOS } from "./types";
import { computeEngine, computePnL } from "./engine";

/**
 * Outils de pricing : calcul inverse de la marge, scénarios et grille d'options.
 */

// Bornes de recherche de la marge commerciale (%/an)
const MARGIN_MIN = -10;
const MARGIN_MAX = 40;

/**
 * Recherche par dichotomie de la marge commerciale (%/an) qui amène `metric` à `target`.
 * `metric` doit être croissante avec la marge (loyer, ROE…). Renvoie null si la cible
 * est hors d'atteinte dans les bornes.
 */
export function solveMargin(
  params: SimulatorParams,
  metric: (p: SimulatorParams) => number,
  target: number
): number | null {
  const at = (m: number) => metric({ ...params, p_target_margin: m });
  let lo = MARGIN_MIN, hi = MARGIN_MAX;
  if (at(lo) > target || at(hi) < target) return null;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (at(mid) < target) lo = mid; else hi = mid;
  }
  // Arrondi au centième supérieur : la cible est atteinte (et non manquée de peu)
  return Math.ceil(hi * 100 - 1e-9) / 100;
}

/** Marge commerciale qui donne le loyer TTC demandé par le client. */
export function marginForRentTTC(params: SimulatorParams, loyerTTC: number) {
  return solveMargin(params, p => computeEngine(p).loyerTTC, loyerTTC);
}

/** Marge commerciale qui atteint le ROE cible (après IBS), ROE en %/an. */
export function marginForRoe(params: SimulatorParams, roePct: number) {
  return solveMargin(params, p => computePnL(computeEngine(p)).roeEff * 100, roePct);
}

/** Rentabilité de l'offre (loyer du contrat inchangé) sous chacun des scénarios. */
export function scenarioTable(r: ReturnType<typeof computeEngine>) {
  return Object.entries(V11_SCENARIOS).map(([key, sc]) => {
    const pl = computePnL(r, { vr: sc.vr, cost: sc.cost });
    const roeOk = pl.roeEff >= r.atroe;
    const roeMin = pl.roeEff >= r.atroe * 0.9;
    const irrOk = pl.irrAnn >= r.hurdle;
    const status: 'good' | 'warn' | 'bad' =
      roeOk && irrOk ? 'good' : roeMin && pl.irrAnn >= r.hurdle * 0.9 ? 'warn' : 'bad';
    return { key, sc, pl, status };
  });
}

/** VR (% du prix d'achat) ajustée pour une autre durée et un autre kilométrage annuel. */
export function adjustedVrPct(params: SimulatorParams, duree: number, kmAn: number) {
  const kmAnRef = (params.p_km / params.p_duree) * 12;
  const vr = params.p_vr_pct
    - (params.p_vr_pente_mois ?? 7) * (duree - params.p_duree) / 12
    - (params.p_vr_pente_km ?? 3) * (kmAn - kmAnRef) / 10000;
  return Math.round(Math.min(70, Math.max(5, vr)) * 10) / 10;
}

/** Paramètres d'une option durée × kilométrage annuel. */
export function optionParams(params: SimulatorParams, duree: number, kmAn: number): SimulatorParams {
  return {
    ...params,
    p_duree: duree,
    p_km: Math.round(kmAn * duree / 12),
    p_vr_pct: adjustedVrPct(params, duree, kmAn),
  };
}

export const GRID_DUREES = [24, 36, 48, 60];
export const GRID_KM_AN = [20000, 30000, 40000];

/** Grille des options : loyer et rentabilité pour chaque durée × kilométrage annuel. */
export function optionsGrid(params: SimulatorParams, durees = GRID_DUREES, kmsAn = GRID_KM_AN) {
  return kmsAn.map(kmAn => durees.map(duree => {
    const p = optionParams(params, duree, kmAn);
    const r = computeEngine(p);
    const pl = computePnL(r);
    return { duree, kmAn, vrPct: p.p_vr_pct, loyerHT: r.loyerHT, loyerTTC: r.loyerTTC, roe: pl.roeEff, irr: pl.irrAnn, atroe: r.atroe };
  }));
}
