/**
 * Travail en équipe : cotations partagées, circuit de validation, objectifs.
 *
 * Les données vivent dans la base partagée de l'application publiée sur Claude
 * (capacités `db` et `user`). Rôles, selon le niveau de partage de la page :
 *  - Contributeur (commercial) : crée et suit les cotations ;
 *  - Éditeur / propriétaire (chef de département) : valide ou refuse les
 *    cotations hors délégation et fixe les objectifs.
 *
 * Chemins :
 *  - cotations/<ref>      une cotation (ref = LLD-AAAA-NNNN)
 *  - validations/<ref>    visa du chef de département (écriture réservée aux éditeurs)
 *  - config/objectifs     objectifs annuels (écriture réservée aux éditeurs)
 *  - meta/compteur        compteur de numérotation
 */
import { SimulatorParams, CATALOG, DEFAULTS } from "./types";
import { computeEngine, computePnL } from "./engine";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Cap = any;

declare global {
  interface Window { claude?: { use(name: string): Promise<Cap | null> } }
}

export function useCapability(name: string): Promise<Cap | null> {
  try {
    return window.claude?.use ? window.claude.use(name) : Promise.resolve(null);
  } catch {
    return Promise.resolve(null);
  }
}

export type Statut = 'brouillon' | 'a_valider' | 'soumise' | 'acceptee' | 'refusee' | 'abandonnee';

export const STATUTS: Record<Statut, { label: string; color: string }> = {
  brouillon: { label: 'Brouillon', color: '#8a9bb5' },
  a_valider: { label: 'À valider', color: '#e0a04a' },
  soumise: { label: 'Soumise au client', color: '#5fa0e0' },
  acceptee: { label: 'Acceptée', color: '#39c98a' },
  refusee: { label: 'Refusée par le client', color: '#ef7070' },
  abandonnee: { label: 'Abandonnée', color: '#6b7a90' },
};

export interface HistoryEntry { at: string; by: string | null; statut: Statut; note?: string }

export interface Cotation {
  ref: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
  statut: Statut;
  statutAt: string;
  client: string;
  vehicule: string;
  duree: number;
  km: number;
  besoin: number;
  loyerHT: number;
  loyerTTC: number;
  marge: number;
  roe: number;
  irr: number;
  resultatNet: number;
  stressNet: number;
  vrPct: number;
  alerts: string[];
  params: SimulatorParams;
  history: HistoryEntry[];
}

export interface Validation {
  decision: 'validee' | 'refusee';
  by: string | null;
  at: string;
  comment: string;
  /** updatedAt de la cotation au moment du visa : un visa ne vaut que pour cette version */
  version: string;
}

export interface Objectifs { annee: number; vehicules: number; phasage: number[]; roeCible: number }

// Phasage des livraisons du budget 2027 (onglet Hypothèses, % des livraisons annuelles par mois)
export const DEFAULT_OBJECTIFS: Objectifs = {
  annee: 2027,
  vehicules: 200,
  phasage: [6, 7, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9],
  roeCible: 15,
};

/**
 * Points hors délégation : la cotation doit être visée par le chef de département
 * avant d'être soumise au client.
 */
const pc = (v: number, d = 1) => v.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

export function validationAlerts(params: SimulatorParams, r = computeEngine(params), pl = computePnL(r)): string[] {
  const a: string[] = [];
  if (pl.roeEff < r.atroe) a.push(`ROE ${pc(pl.roeEff * 100)} % sous la cible de ${pc(r.atroe * 100)} %`);
  if (pl.irrAnn < r.hurdle) a.push(`TRI ${pc(pl.irrAnn * 100)} % sous le seuil de ${pc(r.hurdle * 100)} %`);
  if (params.p_target_margin < DEFAULTS.p_target_margin) a.push(`Marge ${pc(params.p_target_margin, 2)} % sous la marge budget de ${pc(DEFAULTS.p_target_margin, 2)} %`);
  if (params.p_lease_adj < 0) a.push(`Remise commerciale de ${Math.round(-params.p_lease_adj).toLocaleString('fr-FR')} DA/mois`);
  if (params.p_vr_pct > 55) a.push(`VR élevée (${pc(params.p_vr_pct)} %)`);
  if ((params.p_duree_min && r.duree < params.p_duree_min) || (params.p_duree_max && r.duree > params.p_duree_max)) a.push(`Durée de ${r.duree} mois hors politique`);
  if (r.vrNegative) a.push('VR nette négative');
  return a;
}

/** Résumé chiffré d'une simulation, enregistré avec la cotation. */
export function cotationSummary(params: SimulatorParams) {
  const r = computeEngine(params);
  const pl = computePnL(r);
  const stress = computePnL(r, { vr: -0.08, cost: 0.01 });
  const veh = params.veh_idx >= 0 && CATALOG[params.veh_idx] ? `${CATALOG[params.veh_idx].model} ${CATALOG[params.veh_idx].version}` : 'Saisie manuelle';
  return {
    client: params.clientName || 'Client',
    vehicule: veh,
    duree: r.duree,
    km: Math.round(r.kmTotal),
    besoin: Math.round(r.besoin),
    loyerHT: Math.round(r.loyerHT),
    loyerTTC: Math.round(r.loyerTTC),
    marge: params.p_target_margin,
    roe: pl.roeEff,
    irr: pl.irrAnn,
    resultatNet: Math.round(pl.resultatNet),
    stressNet: Math.round(stress.resultatNet),
    vrPct: params.p_vr_pct,
    alerts: validationAlerts(params, r, pl),
  };
}

/** Un visa ne vaut que pour la version de la cotation qu'il a examinée. */
export function validationFor(c: Cotation, v: Validation | undefined) {
  return v && v.version === c.updatedAt ? v : undefined;
}

export function canSubmit(c: Cotation, v: Validation | undefined) {
  // Points recalculés à partir des chiffres enregistrés, pas de la liste stockée
  if (validationAlerts(c.params).length === 0) return true;
  return validationFor(c, v)?.decision === 'validee';
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Numéro suivant LLD-AAAA-NNNN, attribué sous bail pour éviter les doublons. */
export async function nextRef(db: Cap, holder: string): Promise<string> {
  const ref = db.doc('meta/compteur');
  const year = new Date().getFullYear();
  for (let i = 0; i < 12; i++) {
    const lease = await ref.acquire({ holder, ttlMs: 8000 });
    if (lease.acquired) {
      const snap = await ref.get();
      const d = (snap.exists ? snap.data() : {}) as { n?: number; year?: number };
      const n = d.year === year ? (d.n || 0) + 1 : 1;
      await ref.set({ n, year });
      return `LLD-${year}-${String(n).padStart(4, '0')}`;
    }
    await sleep(300 + Math.random() * 500);
  }
  throw new Error('Numérotation occupée, réessayez dans un instant.');
}

const clean = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

export async function createCotation(db: Cap, uid: string | null, params: SimulatorParams): Promise<string> {
  const ref = await nextRef(db, (uid || 'anon') + ':' + Math.random().toString(36).slice(2));
  const now = new Date().toISOString();
  const s = cotationSummary(params);
  const statut: Statut = 'brouillon';
  const c: Cotation = {
    ref, createdAt: now, createdBy: uid, updatedAt: now, statut, statutAt: now,
    ...s, params: clean({ ...params, clientRef: ref }),
    history: [{ at: now, by: uid, statut, note: 'Création' }],
  };
  await db.doc('cotations/' + ref).set(clean(c) as any);
  return ref;
}

/** Enregistre la nouvelle version des chiffres ; un visa précédent ne vaut plus. */
export async function updateCotation(db: Cap, uid: string | null, c: Cotation, params: SimulatorParams) {
  const now = new Date().toISOString();
  const s = cotationSummary(params);
  const statut: Statut = c.statut === 'a_valider' || c.statut === 'soumise' ? 'brouillon' : c.statut;
  await db.doc('cotations/' + c.ref).update(clean({
    ...s, updatedAt: now, statut, statutAt: statut !== c.statut ? now : c.statutAt,
    params: { ...params, clientRef: c.ref },
    history: [...c.history, { at: now, by: uid, statut, note: 'Chiffres modifiés' }],
  }) as any);
}

export async function setStatut(db: Cap, uid: string | null, c: Cotation, statut: Statut, note?: string) {
  const now = new Date().toISOString();
  const entry: HistoryEntry = { at: now, by: uid, statut };
  if (note) entry.note = note;
  await db.doc('cotations/' + c.ref).update(clean({ statut, statutAt: now, history: [...c.history, entry] }) as any);
}

export async function decide(db: Cap, uid: string | null, c: Cotation, decision: 'validee' | 'refusee', comment: string) {
  const v: Validation = { decision, by: uid, at: new Date().toISOString(), comment, version: c.updatedAt };
  await db.doc('validations/' + c.ref).set(clean(v) as any);
  await setStatut(db, uid, c, decision === 'validee' ? 'a_valider' : 'brouillon',
    decision === 'validee' ? `Visa accordé${comment ? ' : ' + comment : ''}` : `Visa refusé${comment ? ' : ' + comment : ''}`);
}

/** Règles d'accès à déclarer à la publication. */
export const DB_RULES = [
  { path: '', read: 'interact', write: 'interact' },
  { path: 'validations', write: 'admin' },
  { path: 'config', write: 'admin' },
];
