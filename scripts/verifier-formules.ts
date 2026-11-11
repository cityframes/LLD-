/**
 * Contrôles automatiques des formules du simulateur Ijarah LLD.
 * Lancer : npm test
 */
import assert from 'node:assert/strict';
import { DEFAULTS, SimulatorParams } from '../src/lib/types';
import { computeEngine, computePnL, resiliationTable } from '../src/lib/engine';
import { irr, pmt } from '../src/lib/utils';
import { validationAlerts, canSubmit, nextRef, Cotation } from '../src/lib/team';
import { applyChanges, snapshot, sanitizeChanges, paramsFromRequest, kmAnOf } from '../src/lib/assistant';
import { fleetTotals } from '../src/lib/offerDoc';
import { marginForRentTTC, marginForRoe, scenarioTable, optionsGrid, adjustedVrPct } from '../src/lib/pricing';

let ok = 0;
function check(name: string, fn: () => void) {
  try { fn(); ok++; console.log('✓ ' + name); }
  catch (e) { console.error('✗ ' + name + '\n  ' + (e as Error).message); process.exitCode = 1; }
}
const near = (a: number, b: number, tol = 0.5, msg = '') =>
  assert.ok(Math.abs(a - b) <= tol, `${msg} attendu ${b}, obtenu ${a}`);
const run = (p: Partial<SimulatorParams> = {}) => {
  const r = computeEngine({ ...DEFAULTS, ...p });
  return { r, pl: computePnL(r) };
};

check('PMT et TRI : valeurs de référence', () => {
  near(pmt(0.01, 12, 100000, 0), 8884.88, 0.01, 'PMT 1%/12 mois');
  near(irr([-1000, 1100]), 0.10, 1e-9, 'TRI');
});

check("Tableau d'amortissement réconcilié avec la VR nette", () => {
  const { r } = run();
  near(r.rows[r.rows.length - 1].capFin, r.vrNette, 0.01, 'capital final');
  near(r.rows.reduce((a, x) => a + x.amortM, 0), r.besoin - r.vrNette, 0.01, 'somme amortissements');
});

check('Le taux locatif = WACC + marge cible', () => {
  const { r } = run({ p_target_margin: 3 });
  near(r.rateLocAnn, r.waccAnn + 0.03, 1e-12);
  const sans = run({ p_target_margin: 0 }).r;
  assert.ok(r.loyerHT > sans.loyerHT, 'la marge doit augmenter le loyer');
});

check("L'offre par défaut est rentable", () => {
  const { pl } = run();
  assert.ok(pl.mfn > 0, `marge nette ${pl.mfn}`);
});

check('Une remise de 10 000 DZA/mois réduit la marge de 10 000 × durée', () => {
  const base = run().pl;
  const { r, pl } = run({ p_lease_adj: -10000 });
  near(base.mfn - pl.mfn, 10000 * r.duree, 0.5);
});

check('LGD et frais refacturés augmentent les revenus du même montant que le loyer', () => {
  const base = run();
  const pass = run({ p_pass_lgd: true, p_pass_admin: true });
  const hausseLoyer = (pass.r.loyerHT - base.r.loyerHT) * base.r.duree;
  near(pass.pl.mfn - base.pl.mfn, hausseLoyer, 0.5);
});

check('Résultat net = marge nette × (1 − IBS)', () => {
  const { pl } = run({ p_ibs: 26 });
  near(pl.resultatNet, pl.mfn * 0.74, 0.01);
});

check('Le scénario stress dégrade la rentabilité sans changer le loyer', () => {
  const { r, pl } = run();
  const stress = computePnL(r, { vr: -0.08, cost: 0.01 });
  assert.ok(stress.mfn < pl.mfn && stress.irrAnn < pl.irrAnn);
  near(stress.vrLoss, 0.08 * r.achat, 0.01, 'perte de VR');
});

check('Entretien annuel assuré même à faible kilométrage (20 000 km / 48 mois)', () => {
  const { r } = run({ p_km: 20000 });
  const mois = r.smrPlan.milestones.map(m => m.approxMonth);
  assert.deepEqual(mois, [12, 24, 36, 48]);
  assert.ok(r.smrPlan.milestones.every(m => m.items.some(i => i.opId.startsWith('vidange'))), 'vidange à chaque passage');
});

check('Entretien non nul sous 10 000 km au total', () => {
  const { r } = run({ p_km: 8000 });
  assert.ok(r.provSMR > 0);
});

check('Provision aléas calculée sur le coût atelier, hors marge banque', () => {
  const { r } = run({ smr_aleas: 10 });
  near(r.smrPlan.provisionAleasAmountHT, r.smrPlan.totalApresRemiseHT * 0.10, 0.01);
});

check('Valeurs par défaut = contrat type du budget 2027 (Doblo Panorama club)', () => {
  const { r } = run();
  near(r.amortM_avg, 43318.375, 0.01, 'remboursement du capital');
  near(r.revM_avg, 26919, 300, 'marge de location');
  near(r.vehMens, 8000, 0.01, 'véhicule de remplacement');
});

check('Calcul inverse : la marge trouvée redonne le loyer TTC demandé', () => {
  const m = marginForRentTTC(DEFAULTS, 120000);
  assert.ok(m !== null);
  near(computeEngine({ ...DEFAULTS, p_target_margin: m! }).loyerTTC, 120000, 15);
});

check('Calcul inverse : la marge trouvée atteint le ROE cible', () => {
  const m = marginForRoe(DEFAULTS, 15);
  assert.ok(m !== null);
  const roe = computePnL(computeEngine({ ...DEFAULTS, p_target_margin: m! })).roeEff * 100;
  assert.ok(roe >= 15 && roe < 15.05, `ROE ${roe}`);
});

check('Calcul inverse : cible hors d\'atteinte signalée', () => {
  assert.equal(marginForRentTTC(DEFAULTS, 1000), null);
});

check('Scénarios côte à côte : du plus favorable au stress', () => {
  const t = Object.fromEntries(scenarioTable(run().r).map(x => [x.key, x.pl.resultatNet]));
  assert.ok(t.optimiste > t.base && t.base > t.prudent && t.prudent > t.stress);
});

check('Grille d\'options : la case courante redonne la simulation, et la VR baisse avec la durée', () => {
  const g = optionsGrid(DEFAULTS);
  const cur = g.find(row => row[0].kmAn === 30000)!.find(c => c.duree === 48)!;
  near(cur.loyerHT, run().r.loyerHT, 0.01);
  assert.ok(adjustedVrPct(DEFAULTS, 60, 30000) < adjustedVrPct(DEFAULTS, 36, 30000));
  assert.ok(g.every(row => row[0].loyerHT > row[3].loyerHT), '24 mois plus cher que 59 mois');
});

check('Délégation : l\'offre budget passe sans visa, une remise demande le visa', () => {
  assert.deepEqual(validationAlerts(DEFAULTS), []);
  assert.ok(validationAlerts({ ...DEFAULTS, p_lease_adj: -5000 }).some(a => a.startsWith('Remise')));
  assert.ok(validationAlerts({ ...DEFAULTS, p_target_margin: 3 }).some(a => a.startsWith('Marge')));
});

check('Visa : valable seulement pour la version visée', () => {
  const c = { params: { ...DEFAULTS, p_lease_adj: -5000 }, updatedAt: 'v2', alerts: [] } as unknown as Cotation;
  assert.equal(canSubmit(c, undefined), false, 'sans visa');
  assert.equal(canSubmit(c, { decision: 'validee', by: 'x', at: '', comment: '', version: 'v1' }), false, 'visa d\'une ancienne version');
  assert.equal(canSubmit(c, { decision: 'validee', by: 'x', at: '', comment: '', version: 'v2' }), true);
});


check('Assistant : un levier change seulement ce qu\'il dit, et la VR suit la durée', () => {
  const p = applyChanges(DEFAULTS, { duree: 59 });
  assert.equal(p.p_duree, 59);
  assert.equal(kmAnOf(p), kmAnOf(DEFAULTS), 'kilométrage annuel conservé');
  assert.equal(p.p_vr_pct, adjustedVrPct(DEFAULTS, 59, kmAnOf(DEFAULTS)), 'VR ajustée');
  assert.equal(p.p_target_margin, DEFAULTS.p_target_margin);
  const q = applyChanges(DEFAULTS, { marge: 4 });
  assert.equal(q.p_vr_pct, DEFAULTS.p_vr_pct); assert.equal(q.p_duree, DEFAULTS.p_duree);
  assert.ok(snapshot(q).loyerTTC < snapshot(DEFAULTS).loyerTTC, 'marge plus basse, loyer plus bas');
  assert.ok(snapshot(applyChanges(DEFAULTS, { sans_remplacement: true })).loyerTTC < snapshot(DEFAULTS).loyerTTC);
});

check('Assistant : les valeurs renvoyées par Claude sont filtrées', () => {
  assert.deepEqual(sanitizeChanges({ duree: '60', marge: 'abc', sans_assistance: 'oui', inconnu: 3 }), { duree: 60 });
  const p = applyChanges(DEFAULTS, { duree: 500, marge: 99, apport: -10 });
  assert.equal(p.p_duree, 59, 'durée plafonnée à 59 mois (conditions générales)'); assert.equal(p.p_target_margin, 20); assert.equal(p.p_apport, 0);
});

check('Assistant : pré-remplissage depuis une demande client', () => {
  const p = paramsFromRequest(DEFAULTS, { client: 'SARL Test', vehicule_index: 5, duree_mois: 36, km_total: 90000, apport: null });
  assert.equal(p.clientName, 'SARL Test');
  assert.equal(p.veh_idx, 5); assert.equal(p.p_achat, 4049000);
  assert.equal(p.p_duree, 36); assert.equal(p.p_km, 90000);
  assert.equal(p.p_apport, DEFAULTS.p_apport);
  const z = paramsFromRequest(DEFAULTS, { vehicule_index: 99 });
  assert.equal(z.veh_idx, DEFAULTS.veh_idx, 'index hors catalogue ignoré');
});

check('Devis flotte : totaux = somme des lignes × quantités', () => {
  const t = fleetTotals([{ id: 'a', qty: 3, params: DEFAULTS }, { id: 'b', qty: 2, params: { ...DEFAULTS, p_duree: 36, p_km: 90000 } }]);
  const a = computeEngine(DEFAULTS), b = computeEngine({ ...DEFAULTS, p_duree: 36, p_km: 90000 });
  assert.equal(t.nb, 5);
  near(t.ttc, 3 * a.loyerTTC + 2 * b.loyerTTC, 0.01);
  near(t.contrat, 3 * a.loyerTTC * 48 + 2 * b.loyerTTC * 36, 0.1);
});

await (async () => {
  const docs: Record<string, any> = {};
  const db = { doc: (p: string) => ({
    acquire: async () => ({ acquired: true }),
    get: async () => ({ exists: p in docs, data: () => docs[p] }),
    set: async (d: any) => { docs[p] = d; },
  }) };
  const a = await nextRef(db, 'h'); const b = await nextRef(db, 'h');
  check('Numérotation des cotations : LLD-AAAA-0001 puis 0002', () => {
    const y = new Date().getFullYear();
    assert.equal(a, `LLD-${y}-0001`); assert.equal(b, `LLD-${y}-0002`);
  });
})();

check('Un paramètre mis à zéro est respecté (pneus, inflation, marge entretien)', () => {
  assert.equal(run({ c_pneu: 0 }).r.provPneu, 0, 'pneus non inclus = 0 DA');
  assert.ok(run({ c_pneu: 0 }).r.loyerHT < run().r.loyerHT);
  assert.ok(run({ p_inflation: 0 }).r.loyerHT < run().r.loyerHT, 'inflation 0 % plus basse que 5 %');
  assert.equal(run({ p_smr_margin: 0 }).r.smrMkupM, 0, 'aucune marge entretien ni pneus');
});

check('Durée maximale : 59 mois (conditions générales)', () => {
  assert.ok(DEFAULTS.p_duree_max <= 59);
  assert.ok(optionsGrid(DEFAULTS).every(row => row.every(c => c.duree <= 59)));
});

check('Lot 5 : par défaut, le calcul historique est inchangé', () => {
  const { r, pl } = run();
  near(r.loyerHT, 102952, 1, 'loyer HT de référence');
  near(pl.roeEff * 100, 22.96, 0.01, 'ROE de référence');
});

check('Terme à échoir : loyer plus bas, amortissement réconcilié', () => {
  const a = run({ p_terme_echoir: true }).r, b = run().r;
  near(a.pmtFin, b.pmtFin / (1 + b.rateLocM), 0.01);
  near(a.rows[a.duree - 1].capFin, a.vrNette, 0.01, 'capital final = VR nette');
  a.rows.slice(0, -1).forEach(x => near(x.amortM + x.revM, a.pmtFin, 0.01, `mois ${x.m}`));
});

check('Dépôt compté comme ressource : coût de la dette plus bas, loyer inchangé', () => {
  const a = run({ p_depot_ressource: true }), b = run();
  assert.equal(a.r.loyerHT, b.r.loyerHT);
  assert.ok(a.pl.sumDebtCost < b.pl.sumDebtCost && a.pl.roeEff > b.pl.roeEff);
});

check('Frais de dossier : revenu en plus, loyer inchangé', () => {
  const a = run({ p_frais_dossier: 20000 }), b = run();
  assert.equal(a.r.loyerHT, b.r.loyerHT);
  near(a.pl.pnbBrut - b.pl.pnbBrut, 20000, 0.01);
  assert.ok(a.pl.irrAnn > b.pl.irrAnn);
});

check('Remise concessionnaire et portage changent le montant financé, pas la VR', () => {
  const a = run({ p_remise_fournisseur: 5 }).r, b = run().r;
  near(b.besoin - a.besoin, DEFAULTS.p_achat * 0.05, 0.01);
  assert.equal(a.vrBrute, b.vrBrute);
  const c = run({ p_delai_livraison: 3 }).r;
  assert.ok(c.portage > 0 && c.besoin > b.besoin && c.loyerHT > b.loyerHT);
});

check('Décote de VR et indexation des services augmentent le loyer', () => {
  const b = run().r;
  near(run({ p_vr_decote_on: true }).r.vrBrute, b.vrBrute * 0.9, 0.01, 'profil standard −10 %');
  assert.ok(run({ p_vr_decote_on: true }).r.loyerHT > b.loyerHT);
  assert.ok(run({ p_infl_services: true }).r.loyerHT > b.loyerHT);
});

check('Km supplémentaire au coût réel', () => {
  const a = run({ p_km_mode: 'cout' }).r;
  near(a.kmSup, a.coutKm * DEFAULTS.p_km_coef, 1e-9);
  assert.ok(a.kmSup < run().r.kmSup);
});

check('Résiliation : 6 loyers avant le 13e mois, puis barème des conditions générales', () => {
  const { r } = run();
  const t = resiliationTable(r, [6, 24]);
  near(t[0].indemnite, 6 * r.loyerTTC, 0.01);
  near(t[1].indemnite, r.loyerTTC * 48 * 0.32 * 24 / 44, 0.01);
});

console.log(`\n${ok} contrôle(s) réussi(s)`);
