export interface SimulatorParams {
  clientName: string;
  clientRef: string;
  clientDate: string;
  optRevente: boolean;

  // Controls
  p_duree_min: number;
  p_duree_max: number;
  p_target_margin: number;
  p_pass_lgd: boolean;
  p_pass_admin: boolean;
  p_target_rent: number;

  // Ijarah
  p_achat: number;
  p_liv: number;
  p_duree: number;
  p_km: number;
  p_apport: number;
  p_depot: number;
  p_vr_pct: number;
  p_vr_frais: number;
  // Grille d'options : baisse de VR (points de %) par 12 mois et par 10 000 km/an supplémentaires
  p_vr_pente_mois: number;
  p_vr_pente_km: number;

  // Capital & Yield
  p_cost_debt: number;
  p_equity_pct: number;
  p_atroe: number;
  p_ibs: number;            // Taux IBS appliqué au résultat du contrat (%)
  p_hurdle_externe: number;
  p_risk: number;
  p_risk_vr: number;
  p_admin: number;
  p_lease_adj: number;
  p_adj_type: string;

  // Services SMR Avancé (Plan constructeur 10 000 km)
  smr_engine_type: 'diesel' | 'essence' | 'gpl';
  smr_severe: boolean;
  smr_include_big: boolean;
  smr_remise: number;       // Remise conventionnelle TALHA AUTO (0, 5, 7%)
  smr_aleas: number;        // Provision pour aléas / imprévus (ex: 10%)
  smr_custom_prices?: Record<string, number>;
  smr_custom_hours?: Record<string, number>;

  p_smr_margin: number;
  p_inflation: number;
  c_10k: number;
  c_40k: number;
  c_60k: number;
  c_freins: number;
  km_freins: number;
  c_batterie: number;
  mois_batterie: number;
  c_ct: number;
  mois_ct: number;
  c_pneu: number;
  km_pneu: number;
  c_mob: number;
  c_assistance: number;
  c_gestion: number;
  c_veh_j: number;
  c_veh_d: number;

  // Takaful
  p_tak_md: number;
  p_tak_rc: number;
  p_vignette: number;
  tak_catalog_mode: boolean;
  veh_idx: number;

  // Km
  p_km_coef: number;
  p_km_franchise: number;

  // V11
  v11_profile: string;
  v11_scenario: string;

  // Lot 5 : éléments de prix et options de méthode (valeurs par défaut = calcul historique)
  p_frais_dossier: number;        // Frais de dossier HT encaissés à la signature (DA)
  p_remise_fournisseur: number;   // Remise du concessionnaire sur le prix d'achat (%)
  p_delai_livraison: number;      // Mois entre le paiement du véhicule et sa livraison (portage)
  p_terme_echoir: boolean;        // Loyer payé en début de mois (terme à échoir)
  p_depot_ressource: boolean;     // Dépôt de garantie compté comme ressource gratuite
  p_vr_decote_on: boolean;        // Décote de VR du profil client appliquée au loyer
  p_infl_services: boolean;       // Services (remplacement, assistance, mobilité, gestion) indexés
  p_km_mode: 'loyer' | 'cout';    // Prix du km sup. : loyer / km, ou coût réel / km
}

// Valeurs par défaut = contrat type du budget LLD 2027
// (Doblo Panorama club, 48 mois, 120 000 km, VR 45,7 %, sukuk 6 %, fonds propres 12 %, risque client 1,5 %)
export const DEFAULTS: SimulatorParams = {
  clientName: "Entreprise XYZ",
  clientRef: "LLD-2026-4782",
  clientDate: new Date().toLocaleDateString("fr-FR"),
  optRevente: true,

  p_duree_min: 24,
  p_duree_max: 59, // durée maximale des conditions générales Ijara
  p_target_margin: 4.8,
  p_pass_lgd: false,
  p_pass_admin: false,
  p_target_rent: 0,

  p_achat: 3774000,
  p_liv: 30000,
  p_duree: 48,
  p_km: 120000,
  p_apport: 0,
  p_depot: 380000,
  p_vr_pct: 45.7,
  p_vr_frais: 0,
  p_vr_pente_mois: 7,
  p_vr_pente_km: 3,

  p_cost_debt: 6.0,
  p_equity_pct: 12,
  p_atroe: 15,
  p_ibs: 26,
  p_hurdle_externe: 15,
  p_risk: 1.5,
  p_risk_vr: 5,
  p_admin: 1500,
  p_lease_adj: 0,
  p_adj_type: "commercial",

  smr_engine_type: "essence",
  smr_severe: false,
  smr_include_big: true,
  smr_remise: 5,
  smr_aleas: 10,
  smr_custom_prices: {},
  smr_custom_hours: {},

  p_smr_margin: 10,
  p_inflation: 5.0,
  c_10k: 12000,
  c_40k: 35000,
  c_60k: 75000,
  c_freins: 18000,
  km_freins: 40000,
  c_batterie: 15000,
  mois_batterie: 24,
  c_ct: 3500,
  mois_ct: 12,
  c_pneu: 25000,
  km_pneu: 40000,
  c_mob: 3000,
  c_assistance: 3000,
  c_gestion: 0,
  c_veh_j: 12,
  c_veh_d: 8000,

  p_tak_md: 0.75,
  p_tak_rc: 10000,
  p_vignette: 8000,
  tak_catalog_mode: true,
  veh_idx: 2,

  p_km_coef: 1.20,
  p_km_franchise: 1000,

  v11_profile: "standard",
  v11_scenario: "base",

  p_frais_dossier: 0,
  p_remise_fournisseur: 0,
  p_delai_livraison: 0,
  p_terme_echoir: false,
  p_depot_ressource: false,
  p_vr_decote_on: false,
  p_infl_services: false,
  p_km_mode: 'loyer'
};

export interface Vehicle {
  model: string;
  version: string;
  cv: string;
  prix: number;
  prime_ttc: number;
  fuel?: 'diesel' | 'essence' | 'gpl';
}

export const CATALOG: Vehicle[] = [
  { model: 'Doblo', version: '1,6 hdi', cv: '05 CV', prix: 2915000, prime_ttc: 43137.17, fuel: 'diesel' },
  { model: 'DOBLO PANORAMA', version: '1,4 Fire', cv: '06 CV', prix: 3374000, prime_ttc: 48022.82, fuel: 'essence' },
  { model: 'DOBLO PANORAMA club', version: '1,4 Fire', cv: '06 CV', prix: 3774000, prime_ttc: 52035.69, fuel: 'essence' },
  { model: 'DOBLO PANORAMA club GPL', version: '1,4 Fire GPL', cv: '06 CV', prix: 3974000, prime_ttc: 54660.21, fuel: 'gpl' },
  { model: 'Scudo', version: '2,0 hdi', cv: '08 CV', prix: 3855000, prime_ttc: 53752.73, fuel: 'diesel' },
  { model: 'Ducato Leger', version: 'l1h1 (2.2 Multijet)', cv: '08 CV', prix: 4049000, prime_ttc: 55882.88, fuel: 'diesel' },
  { model: 'Ducato Leger', version: 'l2h2 (2.2 Multijet)', cv: '08 CV', prix: 4349000, prime_ttc: 59176.93, fuel: 'diesel' },
  { model: 'Ducato Leger', version: 'l3h2 (2.2 Multijet)', cv: '08 CV', prix: 4519000, prime_ttc: 61043.56, fuel: 'diesel' },
  { model: 'ASTRA', version: '1,2 Turbo', cv: '07 CV', prix: 4659000, prime_ttc: 62540.51, fuel: 'essence' },
  { model: 'MOKKA', version: '1,2 Turbo', cv: '07 CV', prix: 4209000, prime_ttc: 57599.44, fuel: 'essence' },
  { model: 'GRANDLAND', version: '1,5 Diesel', cv: '09 CV', prix: 4729000, prime_ttc: 63309.12, fuel: 'diesel' },
];

export const V11_PROFILES: Record<string, any> = {
  premium: { label: 'Premium / Faible risque', vrHaircut: .05, lgd: .005, roe: .125, hurdle: .13, smr: .05, desc: 'Client solide, véhicule liquide, hypothèses prudentes mais compétitives.' },
  standard: { label: 'Corporate Standard', vrHaircut: .10, lgd: .01, roe: .15, hurdle: .15, smr: .10, desc: 'Paramètres équilibrés pour une offre corporate standard.' },
  plus: { label: 'Standard+', vrHaircut: .15, lgd: .015, roe: .17, hurdle: .17, smr: .10, desc: 'Protection renforcée de la marge et du risque de valeur.' },
  high: { label: 'Risque élevé', vrHaircut: .20, lgd: .025, roe: .20, hurdle: .20, smr: .10, desc: 'Profil nécessitant une discipline forte sur VR, risque et rentabilité.' }
};

export const V11_SCENARIOS: Record<string, any> = {
  base: { vr: 0, cost: 0, desc: 'Hypothèses contractuelles courantes.' },
  optimiste: { vr: .03, cost: -.005, desc: 'Meilleure réalisation de VR et coût de ressource plus favorable.' },
  prudent: { vr: -.03, cost: .005, desc: 'VR moins favorable et coût de ressource plus élevé.' },
  stress: { vr: -.08, cost: .01, desc: 'Choc combiné sur VR et coût de ressource.' }
};

export const TVA = 0.19;
