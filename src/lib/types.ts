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
  prix_ttc?: number;          // prix du tarif fournisseur (TTC)
  prime_estimee?: boolean;    // prime Takaful estimée (pas de cotation de l'assureur)
  entretien?: string;         // plan d'entretien (clé de PLANS_ENTRETIEN)
  source?: string;            // tarif d'origine
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
  // Tarif HR Automobiles, novembre 2026 (année modèle 2026). Prix HT = prix TTC du tarif / 1,19.
  // Prime Takaful estimée par régression sur les primes du catalogue Fiat ci-dessus
  // (10 155 DA + 1,125 % du prix HT) : à remplacer par la cotation de l'assureur.
  // Ajoutés à la fin pour garder les numéros des véhicules des cotations existantes.
  { model: 'RENAULT CAPTUR ALPINE', version: '1.3 TCE 155ch · BVA', cv: '—', prix: 6974790, prix_ttc: 8300000, prime_ttc: 88604.12, prime_estimee: true, fuel: 'essence', entretien: 'renault_tce', source: 'HR Automobiles · nov. 2026' },
  { model: 'RENAULT CLIO 5 ALPINE', version: '1.5 DCI 115ch · BVM', cv: '—', prix: 5630252, prix_ttc: 6700000, prime_ttc: 73481.33, prime_estimee: true, fuel: 'diesel', entretien: 'renault_dci15', source: 'HR Automobiles · nov. 2026' },
  { model: 'RENAULT CLIO 5 ALPINE', version: '1.0 TCE 90ch · BVA', cv: '—', prix: 5588235, prix_ttc: 6650000, prime_ttc: 73008.74, prime_estimee: true, fuel: 'essence', entretien: 'renault_tce', source: 'HR Automobiles · nov. 2026' },
  { model: 'DACIA DUSTER EXTREME GOLD', version: '1.3 TCE 150ch · BVA', cv: '—', prix: 6050420, prix_ttc: 7200000, prime_ttc: 78207.2, prime_estimee: true, fuel: 'essence', entretien: 'renault_tce', source: 'HR Automobiles · nov. 2026' },
  { model: 'DACIA LOGAN', version: '1.0 TCe 110 ch · BVM', cv: '—', prix: 4201681, prix_ttc: 5000000, prime_ttc: 57413.38, prime_estimee: true, fuel: 'essence', entretien: 'renault_tce', source: 'HR Automobiles · nov. 2026' },
  { model: 'DFSK MINI BUS 7 PLACES', version: '1.0 Essence 58ch · BVM', cv: '—', prix: 3025210, prix_ttc: 3600000, prime_ttc: 44180.94, prime_estimee: true, fuel: 'essence', entretien: 'dfsk_10', source: 'HR Automobiles · nov. 2026' },
  { model: 'BMW X3 PACK 1', version: '1.6 Essence 193ch · BVA', cv: '—', prix: 17134454, prix_ttc: 20390000, prime_ttc: 202875.66, prime_estimee: true, fuel: 'essence', entretien: 'bmw', source: 'HR Automobiles · nov. 2026' },
  { model: 'BMW X3 PACK 1 *', version: '1.6 Essence 193ch · BVA', cv: '—', prix: 16344538, prix_ttc: 19450000, prime_ttc: 193991.03, prime_estimee: true, fuel: 'essence', entretien: 'bmw', source: 'HR Automobiles · nov. 2026' },
  { model: 'BMW X3 PACK 2', version: '1.6 Essence 193ch · BVA', cv: '—', prix: 15924370, prix_ttc: 18950000, prime_ttc: 189265.16, prime_estimee: true, fuel: 'essence', entretien: 'bmw', source: 'HR Automobiles · nov. 2026' },
  { model: 'BMW 320I PACK 1', version: '1.6 Essence 190ch · BVA', cv: '—', prix: 16596639, prix_ttc: 19750000, prime_ttc: 196826.55, prime_estimee: true, fuel: 'essence', entretien: 'bmw', source: 'HR Automobiles · nov. 2026' },
  { model: 'BMW 520I PACK 1', version: '1.6 Essence 197ch · BVA', cv: '—', prix: 19201681, prix_ttc: 22850000, prime_ttc: 226126.95, prime_estimee: true, fuel: 'essence', entretien: 'bmw', source: 'HR Automobiles · nov. 2026' },
  { model: 'BMW 520I PACK 2', version: '1.6 Essence 197ch · BVA', cv: '—', prix: 17084034, prix_ttc: 20330000, prime_ttc: 202308.56, prime_estimee: true, fuel: 'essence', entretien: 'bmw', source: 'HR Automobiles · nov. 2026' },
  { model: 'PEUGEOT TRAVELLER 9 PLACES', version: '2.0 HDI 150ch · BVA', cv: '—', prix: 9411765, prix_ttc: 11200000, prime_ttc: 116014.17, prime_estimee: true, fuel: 'diesel', entretien: 'psa_diesel_20', source: 'HR Automobiles · nov. 2026' },
  { model: 'PEUGEOT TRAVELLER 9 PLACES', version: '2.0 HDI 150ch · BVM', cv: '—', prix: 8697479, prix_ttc: 10350000, prime_ttc: 107980.19, prime_estimee: true, fuel: 'diesel', entretien: 'psa_diesel_20', source: 'HR Automobiles · nov. 2026' },
  { model: 'PEUGEOT 3008 GT', version: '1.6 Essence 180ch · BVA', cv: '—', prix: 10084034, prix_ttc: 12000000, prime_ttc: 123575.56, prime_estimee: true, fuel: 'essence', entretien: 'psa_essence_16', source: 'HR Automobiles · nov. 2026' },
  { model: 'PEUGEOT RIFTER GT', version: '1.6 HDi 92 ch · BVM', cv: '—', prix: 7563025, prix_ttc: 9000000, prime_ttc: 95220.34, prime_estimee: true, fuel: 'diesel', entretien: 'psa_diesel_16', source: 'HR Automobiles · nov. 2026' },
  { model: 'GEELY COOLRAY FULL OPTION', version: '1.5T 180ch · BVA', cv: '—', prix: 4369748, prix_ttc: 5200000, prime_ttc: 59303.73, prime_estimee: true, fuel: 'essence', entretien: 'geely_15t', source: 'HR Automobiles · nov. 2026' },
  { model: 'GEELY BATTLE', version: '1.5T 181 ch · BVA', cv: '—', prix: 4453782, prix_ttc: 5300000, prime_ttc: 60248.9, prime_estimee: true, fuel: 'essence', entretien: 'geely_15t', source: 'HR Automobiles · nov. 2026' },
  { model: 'ROEWE I5', version: '1.5 129 ch · BVA', cv: '—', prix: 3025210, prix_ttc: 3600000, prime_ttc: 44180.94, prime_estimee: true, fuel: 'essence', entretien: 'chinois_15', source: 'HR Automobiles · nov. 2026' },
  { model: 'VOLKSWAGEN PASSAT PRO', version: '1.5 TSI 160ch · BVA', cv: '—', prix: 7310924, prix_ttc: 8700000, prime_ttc: 92384.81, prime_estimee: true, fuel: 'essence', entretien: 'vw_tsi', source: 'HR Automobiles · nov. 2026' },
  { model: 'VOLKSWAGEN T-ROC R LINE', version: '1.5 TSI 160ch · BVA', cv: '—', prix: 6386555, prix_ttc: 7600000, prime_ttc: 81987.91, prime_estimee: true, fuel: 'essence', entretien: 'vw_tsi', source: 'HR Automobiles · nov. 2026' },
  { model: 'VOLKSWAGEN GOLF 8.5', version: '1.5 TSI 160 ch · BVA', cv: '—', prix: 7436975, prix_ttc: 8850000, prime_ttc: 93802.58, prime_estimee: true, fuel: 'essence', entretien: 'vw_tsi', source: 'HR Automobiles · nov. 2026' },
  { model: 'VOLKSWAGEN LAVIDA', version: '1.5 MPI 115 ch · BVA', cv: '—', prix: 4411765, prix_ttc: 5250000, prime_ttc: 59776.31, prime_estimee: true, fuel: 'essence', entretien: 'vw_mpi', source: 'HR Automobiles · nov. 2026' },
  { model: 'VOLKSWAGEN POLO', version: '1.5 MPI · BVA', cv: '—', prix: 4957983, prix_ttc: 5900000, prime_ttc: 65919.94, prime_estimee: true, fuel: 'essence', entretien: 'vw_mpi', source: 'HR Automobiles · nov. 2026' },
  { model: 'VOLKSWAGEN THARU XR', version: '1.5T 160 ch · BVA', cv: '—', prix: 5613445, prix_ttc: 6680000, prime_ttc: 73292.3, prime_estimee: true, fuel: 'essence', entretien: 'vw_tsi', source: 'HR Automobiles · nov. 2026' },
  { model: 'KIA K3', version: '1.5 115ch · BVA', cv: '—', prix: 4495798, prix_ttc: 5350000, prime_ttc: 60721.48, prime_estimee: true, fuel: 'essence', entretien: 'hyundai_kia_15', source: 'HR Automobiles · nov. 2026' },
  { model: 'HYUNDAI ELANTRA', version: '1.5 115ch · BVA', cv: '—', prix: 4327731, prix_ttc: 5150000, prime_ttc: 58831.14, prime_estimee: true, fuel: 'essence', entretien: 'hyundai_kia_15', source: 'HR Automobiles · nov. 2026' },
  { model: 'AUDI Q3', version: '1.5T 160 ch 35 TFSI · BVA', cv: '—', prix: 8907563, prix_ttc: 10600000, prime_ttc: 110343.12, prime_estimee: true, fuel: 'essence', entretien: 'audi_tfsi', source: 'HR Automobiles · nov. 2026' },
  { model: 'JETOUR X70 PLUS', version: '1.6 197ch · BVA', cv: '—', prix: 7478992, prix_ttc: 8900000, prime_ttc: 94275.17, prime_estimee: true, fuel: 'essence', entretien: 'jetour_16t', source: 'HR Automobiles · nov. 2026' },
  { model: 'FIAT 500X CLUB', version: '1.4 Essence · BVA', cv: '—', prix: 4537815, prix_ttc: 5400000, prime_ttc: 61194.07, prime_estimee: true, fuel: 'essence', entretien: 'fiat_14', source: 'HR Automobiles · nov. 2026' },
  { model: 'FIAT TIPO', version: '1.4 Essence · BVM', cv: '—', prix: 4369748, prix_ttc: 5200000, prime_ttc: 59303.73, prime_estimee: true, fuel: 'essence', entretien: 'fiat_14', source: 'HR Automobiles · nov. 2026' },
  { model: 'CITROEN BERLINGO XTR', version: '1.6 HDI 92ch · BVM', cv: '—', prix: 7436975, prix_ttc: 8850000, prime_ttc: 93802.58, prime_estimee: true, fuel: 'diesel', entretien: 'psa_diesel_16', source: 'HR Automobiles · nov. 2026' },
  { model: 'CITROEN JUMPY 8 PLACES', version: '2.0 HDI 150ch · BVA', cv: '—', prix: 8991597, prix_ttc: 10700000, prime_ttc: 111288.3, prime_estimee: true, fuel: 'diesel', entretien: 'psa_diesel_20', source: 'HR Automobiles · nov. 2026' },
  { model: 'LIVAN X3 PRO', version: '1.5 113ch · BVA', cv: '—', prix: 3277311, prix_ttc: 3900000, prime_ttc: 47016.46, prime_estimee: true, fuel: 'essence', entretien: 'chinois_15', source: 'HR Automobiles · nov. 2026' },
  { model: 'LIVAN X3 PRO', version: '1.5 113 ch · BVM', cv: '—', prix: 3193277, prix_ttc: 3800000, prime_ttc: 46071.28, prime_estimee: true, fuel: 'essence', entretien: 'chinois_15', source: 'HR Automobiles · nov. 2026' },
  { model: 'MG MG5 COMFORT', version: '1.5 Essence 128ch · BVM', cv: '—', prix: 3109244, prix_ttc: 3700000, prime_ttc: 45126.12, prime_estimee: true, fuel: 'essence', entretien: 'chinois_15', source: 'HR Automobiles · nov. 2026' },
  { model: 'TOYOTA COROLLA', version: '1.2T 130 ch · BVA', cv: '—', prix: 5042017, prix_ttc: 6000000, prime_ttc: 66865.12, prime_estimee: true, fuel: 'essence', entretien: 'toyota_12t', source: 'HR Automobiles · nov. 2026' },
  { model: 'BMW 520I PACK 1 *', version: '1.6 Essence 197ch · BVA', cv: '—', prix: 17789916, prix_ttc: 21170000, prime_ttc: 210248.02, prime_estimee: true, fuel: 'essence', entretien: 'bmw', source: 'HR Automobiles · nov. 2026' },
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
