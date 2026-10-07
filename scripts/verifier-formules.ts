/**
 * Contrôles automatiques des formules du simulateur Ijarah LLD.
 * Lancer : npm test
 */
import assert from 'node:assert/strict';
import { DEFAULTS, SimulatorParams } from '../src/lib/types';
import { computeEngine, computePnL } from '../src/lib/engine';
import { irr, pmt } from '../src/lib/utils';

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

console.log(`\n${ok} contrôle(s) réussi(s)`);
