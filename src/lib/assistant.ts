/**
 * Assistant de l'application : explication d'une offre, aide à la
 * négociation et lecture d'une demande client.
 *
 * Claude est appelé par la capacité `sample` de l'application publiée, sur
 * le compte Claude de la personne qui l'utilise. Les chiffres viennent
 * toujours du moteur de calcul : Claude choisit des leviers et rédige, la
 * page recalcule chaque proposition avant de l'afficher.
 */
import { SimulatorParams, CATALOG } from "./types";
import { computeEngine, computePnL } from "./engine";
import { adjustedVrPct, scenarioTable } from "./pricing";
import { validationAlerts } from "./team";
import type { Lang } from "./offerDoc";

const n0 = (v: number) => Math.round(v).toLocaleString('fr-FR').replace(/ | /g, ' ');
const pc = (v: number, d = 1) => (v * 100).toLocaleString('fr-FR', { maximumFractionDigits: d });

export const vehLabel = (p: SimulatorParams) =>
  p.veh_idx >= 0 && CATALOG[p.veh_idx] ? `${CATALOG[p.veh_idx].model} ${CATALOG[p.veh_idx].version}` : 'Véhicule saisi manuellement';

/* ------------------------------------------------------------ leviers */

/** Changements qu'on peut proposer au client. Tout champ absent reste inchangé. */
export interface Changes {
  duree?: number;          // mois
  km_an?: number;          // km par an
  apport?: number;         // DA
  vr_pct?: number;         // % du prix d'achat
  marge?: number;          // marge commerciale, %/an
  sans_remplacement?: boolean;
  sans_assistance?: boolean;
  sans_mobilite?: boolean;
}

export const kmAnOf = (p: SimulatorParams) => Math.round(p.p_km / p.p_duree * 12);

/** Applique des changements ; une nouvelle durée ou un nouveau kilométrage ajuste la VR (pente de la grille d'options). */
export function applyChanges(params: SimulatorParams, c: Changes): SimulatorParams {
  const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : undefined);
  const duree = num(c.duree) ? Math.min(84, Math.max(12, Math.round(c.duree!))) : params.p_duree;
  const kmAn = num(c.km_an) ? Math.min(100000, Math.max(5000, Math.round(c.km_an!))) : kmAnOf(params);
  const p: SimulatorParams = { ...params, p_duree: duree, p_km: Math.round(kmAn * duree / 12) };
  p.p_vr_pct = num(c.vr_pct) ?? (duree !== params.p_duree || kmAn !== kmAnOf(params) ? adjustedVrPct(params, duree, kmAn) : params.p_vr_pct);
  p.p_vr_pct = Math.min(70, Math.max(0, p.p_vr_pct));
  if (num(c.apport) !== undefined) p.p_apport = Math.max(0, Math.round(c.apport!));
  if (num(c.marge) !== undefined) p.p_target_margin = Math.round(Math.min(20, Math.max(-5, c.marge!)) * 100) / 100;
  if (c.sans_remplacement) p.c_veh_d = 0;
  if (c.sans_assistance) p.c_assistance = 0;
  if (c.sans_mobilite) p.c_mob = 0;
  return p;
}

/** Chiffres clés d'une simulation, tous issus du moteur. */
export function snapshot(params: SimulatorParams) {
  const r = computeEngine(params);
  const pl = computePnL(r);
  const stress = computePnL(r, { vr: -0.08, cost: 0.01 });
  return {
    loyerHT: Math.round(r.loyerHT),
    loyerTTC: Math.round(r.loyerTTC),
    roe: pl.roeEff,
    tri: pl.irrAnn,
    roeCible: r.atroe,
    resultatNet: Math.round(pl.resultatNet),
    resultatStress: Math.round(stress.resultatNet),
    duree: r.duree,
    kmAn: kmAnOf(params),
    apport: Math.round(r.apport),
    vrPct: params.p_vr_pct,
    marge: params.p_target_margin,
    alerts: validationAlerts(params, r, pl),
  };
}
export type Snapshot = ReturnType<typeof snapshot>;

const snapText = (s: Snapshot) =>
  `loyer ${n0(s.loyerHT)} DA HT, ${n0(s.loyerTTC)} DA TTC par mois ; ROE ${pc(s.roe)} % (cible ${pc(s.roeCible)} %) ; TRI ${pc(s.tri)} % ; résultat net du contrat ${n0(s.resultatNet)} DA (${n0(s.resultatStress)} DA en stress VR −8 pts et coût +1 pt) ; durée ${s.duree} mois, ${n0(s.kmAn)} km/an, apport ${n0(s.apport)} DA, VR ${s.vrPct} %, marge ${s.marge} %/an${s.alerts.length ? ` ; hors délégation : ${s.alerts.join(' ; ')}` : ' ; dans la délégation'}`;

/** Effet de chaque levier pris seul, pour guider la négociation. */
export function leverTable(params: SimulatorParams) {
  const base = snapshot(params);
  const tries: [string, Changes][] = [
    ['Durée +12 mois', { duree: params.p_duree + 12 }],
    ['Durée −12 mois', { duree: Math.max(12, params.p_duree - 12) }],
    ['Kilométrage −10 000 km/an', { km_an: Math.max(5000, kmAnOf(params) - 10000) }],
    ['Apport de 10 % du prix', { apport: (params.p_apport || 0) + Math.round(params.p_achat * 0.1) }],
    ['VR +5 points', { vr_pct: params.p_vr_pct + 5 }],
    ['Marge −0,5 point', { marge: params.p_target_margin - 0.5 }],
    ['Marge −1 point', { marge: params.p_target_margin - 1 }],
  ];
  if (params.c_veh_d > 0) tries.push(['Sans véhicule de remplacement', { sans_remplacement: true }]);
  if (params.c_assistance > 0) tries.push(['Sans assistance', { sans_assistance: true }]);
  if (params.c_mob > 0) tries.push(['Sans mobilité / télématique', { sans_mobilite: true }]);
  return {
    base,
    rows: tries.map(([label, c]) => {
      const s = snapshot(applyChanges(params, c));
      return { label, changes: c, s, dTTC: s.loyerTTC - base.loyerTTC };
    }),
  };
}

/* ------------------------------------------------------------ contexte */

/** Résumé chiffré de la simulation, lisible par Claude. */
export function offerContext(params: SimulatorParams) {
  const r = computeEngine(params);
  const s = snapshot(params);
  const sc = scenarioTable(r).map(x => `${x.key} (${x.sc.desc.replace(/\.$/, "")}) : ROE ${pc(x.pl.roeEff)} %, résultat net ${n0(x.pl.resultatNet)} DA`).join(' ; ');
  const services = [
    'entretien constructeur',
    params.c_pneu > 0 && 'pneumatiques',
    'Takaful dommages et responsabilité civile',
    params.c_assistance > 0 && 'assistance 24 h/24',
    params.c_veh_d > 0 && 'véhicule de remplacement',
    params.c_mob > 0 && 'mobilité / télématique',
    params.p_vignette > 0 && 'vignette',
  ].filter(Boolean).join(', ');
  return [
    `Client : ${params.clientName || 'non renseigné'} ; référence ${params.clientRef || '—'}.`,
    `Véhicule : ${vehLabel(params)}, prix d'acquisition ${n0(r.achat)} DA HT.`,
    `Contrat : ${r.duree} mois, ${n0(r.kmTotal)} km au total (${n0(s.kmAn)} km/an), apport ${n0(r.apport)} DA, Hamish Jiddiyyah (dépôt restitué) ${n0(r.depot)} DA, option d'achat ${params.optRevente ? `au prix de cession ${n0(r.vrNette)} DA HT (VR ${params.p_vr_pct} %)` : 'non proposée'}.`,
    `Prestations incluses : ${services}. Km supplémentaire facturé ${r.kmSup.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} DA HT.`,
    `Loyer : ${n0(r.loyerHT)} DA HT, TVA ${n0(r.tvaFi)} DA, ${n0(r.loyerTTC)} DA TTC par mois.`,
    `Rentabilité banque : taux locatif ${pc(r.rateLocAnn, 2)} %/an (coût de ressource ${pc(r.waccAnn, 2)} % + marge ${params.p_target_margin} %), ROE après IBS ${pc(s.roe)} % pour une cible de ${pc(s.roeCible)} %, TRI ${pc(s.tri)} % pour un seuil de ${pc(r.hurdle)} %, résultat net du contrat ${n0(s.resultatNet)} DA.`,
    `Scénarios : ${sc}.`,
    s.alerts.length ? `Hors délégation commerciale (visa du chef de département requis) : ${s.alerts.join(' ; ')}.` : 'Dans la délégation commerciale.',
  ].join('\n');
}

const CADRE = `Tu assistes le département Location longue durée (Ijara opérationnelle) d'Al Salam Bank Algeria, banque participative. Le bailleur reste propriétaire du véhicule ; le loyer couvre la jouissance du véhicule et les services inclus ; pas d'intérêts de retard ni de vocabulaire de crédit conventionnel (parle de loyer, de marge, d'Ijara). Montants en dinars algériens (DA). N'invente aucun chiffre : utilise uniquement ceux fournis.`;

/* ------------------------------------------------------------ 19. Expliquer */

export type ExplainKind = 'comite' | 'client';

export function explainPrompt(params: SimulatorParams, kind: ExplainKind, lang: Lang) {
  const langue = lang === 'ar' ? 'en arabe' : 'en français';
  const consigne = kind === 'comite'
    ? `Rédige ${langue} une note courte pour le comité ou le chef de département sur cette offre : 1) l'opération en deux phrases ; 2) les points forts ; 3) les risques (valeur résiduelle, coût de ressource, kilométrage, délégation) en t'appuyant sur les scénarios ; 4) un avis : à accepter, à accepter sous conditions (lesquelles) ou à revoir. 250 mots au plus.`
    : `Rédige ${langue} un argumentaire à envoyer au client pour présenter cette offre : ce qui est inclus dans le loyer, ce qui le rend avantageux par rapport à l'achat (pas d'immobilisation de trésorerie, coûts maîtrisés, entretien et assurance inclus, conformité à la finance participative), et les conditions principales. Ton professionnel et chaleureux, 200 mots au plus. Ne mentionne ni la marge, ni le ROE, ni le TRI, ni les scénarios internes.`;
  return `${CADRE}\n\n${consigne}\nÉcris en texte simple : des titres courts sur leur propre ligne et des listes avec « - ». Pas de tableau, pas de gras.\n\nSimulation :\n${offerContext(params)}`;
}

/* ------------------------------------------------------------ 20. Négocier */

export interface NegotiationOption { titre: string; changes: Changes; argument: string }
export interface NegotiationAnswer { analyse: string; options: NegotiationOption[] }

export function negotiationPrompt(params: SimulatorParams, demande: string, tools = true) {
  const lt = leverTable(params);
  const table = lt.rows.map(r => `- ${r.label} : loyer ${n0(r.s.loyerTTC)} DA TTC (${r.dTTC >= 0 ? '+' : ''}${n0(r.dTTC)}), ROE ${pc(r.s.roe)} %${r.s.alerts.length ? ', hors délégation' : ''}`).join('\n');
  return `${CADRE}

Un commercial négocie cette offre. Le client demande :
« ${demande.slice(0, 2000)} »

Offre actuelle :
${offerContext(params)}

Effet de chaque levier pris seul :
${table}

${tools ? 'Utilise l\'outil simulate pour tester des combinaisons de leviers (au plus 6 essais) et trouve' : 'À partir de ces effets, propose'} 2 ou 3 options qui répondent au mieux à la demande en préservant la rentabilité : privilégie les options qui restent dans la délégation (ROE au-dessus de la cible) ; une baisse de marge est le dernier levier. Leviers possibles : duree (mois, 24 à 60), km_an, apport (DA), vr_pct, marge (%/an), sans_remplacement, sans_assistance, sans_mobilite.

Réponds uniquement avec un objet JSON :
{"analyse": "2 ou 3 phrases en français sur ce que demande le client et la marge de manœuvre", "options": [{"titre": "titre court", "changes": {"duree": 60}, "argument": "1 ou 2 phrases à dire au client"}]}
Dans "changes", ne mets que les leviers modifiés, avec les valeurs finales (pas des écarts).`;
}

/** Outil offert à Claude : simule une combinaison de leviers avec le moteur de l'application. */
export function simulateTool(params: SimulatorParams, onTry?: (c: Changes, s: Snapshot) => void) {
  return {
    name: 'simulate',
    description: "Recalcule l'offre avec le moteur de pricing de la banque après application des leviers donnés (valeurs finales). Renvoie le loyer HT et TTC mensuel, le ROE après IBS, le TRI, le résultat net du contrat et les points hors délégation.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        duree: { type: 'number', description: 'Durée en mois' },
        km_an: { type: 'number', description: 'Kilométrage annuel' },
        apport: { type: 'number', description: 'Apport initial en DA' },
        vr_pct: { type: 'number', description: 'Valeur résiduelle en % du prix' },
        marge: { type: 'number', description: 'Marge commerciale en %/an' },
        sans_remplacement: { type: 'boolean' },
        sans_assistance: { type: 'boolean' },
        sans_mobilite: { type: 'boolean' },
      },
    },
    execute(input: { [k: string]: unknown }) {
      const c = sanitizeChanges(input);
      const s = snapshot(applyChanges(params, c));
      onTry?.(c, s);
      return { loyerHT: s.loyerHT, loyerTTC: s.loyerTTC, roe_pct: +(s.roe * 100).toFixed(2), roe_cible_pct: +(s.roeCible * 100).toFixed(2), tri_pct: +(s.tri * 100).toFixed(2), resultatNet: s.resultatNet, hors_delegation: s.alerts };
    },
  };
}

export function sanitizeChanges(input: unknown): Changes {
  const o = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const c: Changes = {};
  for (const k of ['duree', 'km_an', 'apport', 'vr_pct', 'marge'] as const) {
    const v = Number(o[k]);
    if (o[k] !== undefined && o[k] !== null && isFinite(v)) c[k] = v;
  }
  for (const k of ['sans_remplacement', 'sans_assistance', 'sans_mobilite'] as const) if (o[k] === true) c[k] = true;
  return c;
}

export function describeChanges(params: SimulatorParams, c: Changes): string {
  const parts: string[] = [];
  if (c.duree !== undefined && c.duree !== params.p_duree) parts.push(`durée ${params.p_duree} → ${Math.round(c.duree)} mois`);
  if (c.km_an !== undefined && Math.round(c.km_an) !== kmAnOf(params)) parts.push(`${n0(kmAnOf(params))} → ${n0(c.km_an)} km/an`);
  if (c.apport !== undefined && c.apport !== params.p_apport) parts.push(`apport ${n0(c.apport)} DA`);
  if (c.vr_pct !== undefined && c.vr_pct !== params.p_vr_pct) parts.push(`VR ${params.p_vr_pct} → ${c.vr_pct} %`);
  if (c.marge !== undefined && c.marge !== params.p_target_margin) parts.push(`marge ${params.p_target_margin} → ${c.marge} %`);
  if (c.sans_remplacement) parts.push('sans véhicule de remplacement');
  if (c.sans_assistance) parts.push('sans assistance');
  if (c.sans_mobilite) parts.push('sans mobilité');
  return parts.join(' · ') || 'aucun changement';
}

/* ------------------------------------------------------------ 21. Lire une demande */

export interface ClientRequest {
  client?: string | null;
  vehicule_index?: number | null;
  vehicule_texte?: string | null;
  quantite?: number | null;
  duree_mois?: number | null;
  km_an?: number | null;
  km_total?: number | null;
  apport?: number | null;
  loyer_max_ttc?: number | null;
  options_demandees?: string[];
  manquants?: string[];
  resume?: string;
}

export function requestPrompt(text: string, withImage: boolean) {
  const cat = CATALOG.map((v, i) => `${i} : ${v.model} ${v.version} (${v.prix.toLocaleString('fr-FR')} DA)`).join('\n');
  return `${CADRE}

Voici une demande de location reçue d'un client${withImage ? ' (texte ci-dessous et/ou image jointe : courrier, e-mail ou bon de demande)' : ''}. Extrais les éléments utiles à la cotation.

Catalogue des véhicules (index : modèle) :
${cat}

Demande :
« ${text.slice(0, 12000) || '(voir image)'} »

Réponds uniquement avec un objet JSON, en mettant null quand l'information n'est pas donnée :
{"client": "raison sociale", "vehicule_index": index du catalogue le plus proche ou null, "vehicule_texte": "véhicule tel que demandé", "quantite": nombre de véhicules, "duree_mois": nombre, "km_an": kilométrage annuel, "km_total": kilométrage total, "apport": DA, "loyer_max_ttc": budget mensuel TTC par véhicule en DA, "options_demandees": ["services demandés"], "manquants": ["informations à demander au client"], "resume": "la demande en une phrase"}`;
}

/** Paramètres pré-remplis à partir d'une demande lue. */
export function paramsFromRequest(params: SimulatorParams, d: ClientRequest): SimulatorParams {
  const p: SimulatorParams = { ...params };
  if (d.client) p.clientName = String(d.client).slice(0, 120);
  const idx = Number(d.vehicule_index);
  if (d.vehicule_index !== null && d.vehicule_index !== undefined && Number.isInteger(idx) && CATALOG[idx]) {
    p.veh_idx = idx;
    p.p_achat = CATALOG[idx].prix;
    p.tak_catalog_mode = true;
    if (CATALOG[idx].fuel) p.smr_engine_type = CATALOG[idx].fuel as SimulatorParams['smr_engine_type'];
  }
  const duree = Number(d.duree_mois);
  const changes: Changes = {};
  if (isFinite(duree) && duree >= 12 && duree <= 84) changes.duree = duree;
  const kmAn = Number(d.km_an);
  const kmTot = Number(d.km_total);
  if (isFinite(kmAn) && kmAn > 0) changes.km_an = kmAn;
  else if (isFinite(kmTot) && kmTot > 0) changes.km_an = kmTot / (changes.duree ?? p.p_duree) * 12;
  const apport = Number(d.apport);
  if (d.apport !== null && d.apport !== undefined && isFinite(apport) && apport >= 0) changes.apport = apport;
  return applyChanges(p, changes);
}
