/**
 * Catalogue et moteur de simulation d'entretien programmé SMR (Services, Maintenance & Réparation)
 * Basé sur le plan constructeur Stellantis / FCA et le barème officiel SARL TALHA AUTO EUCALYPTUS (Alger)
 * Intervalles réguliers : tous les 10 000 km et échéances temporelles annuelles.
 */

export interface LaborRates {
  revision: number;    // 1 347.89 DA/h HT
  freinage: number;    // 1 347.89 DA/h HT
  diagnostic: number;  // 1 514.28 DA/h HT
  ht: number;          // 1 680.67 DA/h HT (Haute technicité)
}

export const DEFAULT_LABOR_RATES: LaborRates = {
  revision: 1347.89,
  freinage: 1347.89,
  diagnostic: 1514.28,
  ht: 1680.67,
};

export type FuelType = 'diesel' | 'essence' | 'gpl' | 'all';
export type OpType = 'revision' | 'consommable' | 'freinage' | 'ht' | 'diagnostic';

export interface SmrOperation {
  id: string;
  name: string;
  shortName: string;
  labor: keyof LaborRates;
  hours: number;
  partPrice: number;
  intervalKm: number;
  intervalAns: number;
  severeKm?: number;
  severeAns?: number;
  fuel: FuelType;      // Compatibilité moteur
  big?: boolean;       // Grosse opération (distribution, réservoir...)
  type: OpType;
  description?: string;
}

export const SMR_OPERATIONS_CATALOG: SmrOperation[] = [
  // 1. RÉVISION GÉNÉRALE PRÉVENTIVE (Chaque 10 000 km - Commun à tous)
  {
    id: "revision",
    name: "Révision générale préventive (contrôles réglementaires 1-22 : sécurité, éclairage, trains, suspension, niveaux, batterie, essai sur route)",
    shortName: "Révision générale 10k",
    labor: "revision",
    hours: 1.5,
    partPrice: 0,
    intervalKm: 10000,
    intervalAns: 1,
    fuel: "all",
    type: "revision",
    description: "Contrôles réglementaires constructeur Stellantis effectués à chaque palier de 10 000 km."
  },

  // 2. VIDANGE & HUILE MOTEUR HOMOLOGUÉE (Chaque 10 000 km - Différenciée selon motorisation)
  {
    id: "vidangeDiesel",
    name: "Vidange huile homologuée Low-SAPS FAP (5.0L - 0W30/5W30 C2 Stellantis) + filtre à huile & joint",
    shortName: "Vidange & Huile 5L Diesel FAP",
    labor: "revision",
    hours: 0.6,
    partPrice: 14200, // Huile synthèse Low-SAPS FAP 5L (12 000 DA) + cartouche filtre (2 200 DA)
    intervalKm: 10000,
    intervalAns: 1,
    fuel: "diesel",
    type: "consommable",
    description: "Huile de synthèse 0W30/5W30 C2 homologuée Stellantis/FCA anti-colmatage FAP (contenance carter 5.0L)."
  },
  {
    id: "vidangeEssence",
    name: "Vidange huile de synthèse moteur essence (3.2L - 5W40) + filtre à huile & joint",
    shortName: "Vidange & Huile 3.2L Essence",
    labor: "revision",
    hours: 0.4,
    partPrice: 6500, // Huile synthèse 5W40 3.2L (5 120 DA) + filtre (1 380 DA)
    intervalKm: 10000,
    intervalAns: 1,
    fuel: "essence",
    type: "consommable",
    description: "Huile de synthèse 5W40 pour moteur thermique essence 1.4 Fire / 1.2 PureTech (contenance 3.2L)."
  },
  {
    id: "vidangeGpl",
    name: "Vidange huile moteur bicarburation adaptée GPL (3.2L - 5W40) + filtre à huile & joint",
    shortName: "Vidange & Huile 3.2L GPL",
    labor: "revision",
    hours: 0.4,
    partPrice: 6800,
    intervalKm: 10000,
    intervalAns: 1,
    fuel: "gpl",
    type: "consommable",
    description: "Huile spécifique bicarburation GPL / Essence."
  },

  // 3. FILTRATION CARBURANT & PURGE
  {
    id: "purgeGazoleDiesel",
    name: "Purge d'eau du décanteur du filtre à gazole & contrôle circuit injection",
    shortName: "Purge décanteur gazole",
    labor: "revision",
    hours: 0.3,
    partPrice: 0,
    intervalKm: 10000,
    intervalAns: 1,
    fuel: "diesel",
    type: "consommable",
    description: "Évacuation de l'eau décantée pour préserver la pompe d'injection Common Rail haute pression."
  },
  {
    id: "filtreGazoleDiesel",
    name: "Remplacement cartouche filtre à gazole avec séparateur d'eau & réchauffeur électrique",
    shortName: "Filtre à gazole haute pression",
    labor: "revision",
    hours: 0.6,
    partPrice: 7200,
    intervalKm: 20000,
    intervalAns: 2,
    severeKm: 10000,
    severeAns: 1,
    fuel: "diesel",
    type: "consommable",
    description: "Filtration gazole 2000 bars. Crucial en Algérie, ramené à 10 000 km en conditions sévères."
  },
  {
    id: "filtreEssence",
    name: "Remplacement cartouche filtre à carburant essence",
    shortName: "Filtre à essence",
    labor: "revision",
    hours: 0.3,
    partPrice: 2200,
    intervalKm: 40000,
    intervalAns: 4,
    fuel: "essence",
    type: "consommable"
  },

  // 4. FILTRATION AIR & HABITACLE (Commun)
  {
    id: "filtreHabitacle",
    name: "Remplacement filtre habitacle anti-pollen & particules fines",
    shortName: "Filtre habitacle",
    labor: "revision",
    hours: 0.3,
    partPrice: 2200,
    intervalKm: 20000,
    intervalAns: 1,
    fuel: "all",
    type: "consommable"
  },
  {
    id: "filtreAir",
    name: "Remplacement filtre à air moteur",
    shortName: "Filtre à air",
    labor: "revision",
    hours: 0.4,
    partPrice: 2500,
    intervalKm: 20000,
    intervalAns: 2,
    severeKm: 10000,
    severeAns: 1,
    fuel: "all",
    type: "consommable",
    description: "Ramené à 10 000 km en conditions sévères (poussière/climat algérien)."
  },

  // 5. BOUGIES & SYSTÈME D'ALLUMAGE / PRÉCHAUFFAGE
  {
    id: "bougiesAllumage",
    name: "Remplacement des 4 bougies d'allumage moteur essence",
    shortName: "Bougies allumage Essence",
    labor: "revision",
    hours: 0.5,
    partPrice: 3200,
    intervalKm: 20000,
    intervalAns: 2,
    fuel: "essence",
    type: "consommable"
  },
  {
    id: "bougiesGpl",
    name: "Remplacement des 4 bougies d'allumage renforcées haute température spécifiques GPL",
    shortName: "Bougies renforcées GPL",
    labor: "revision",
    hours: 0.5,
    partPrice: 4600,
    intervalKm: 20000,
    intervalAns: 2,
    fuel: "gpl",
    type: "consommable"
  },
  {
    id: "bougiesPrechauffage",
    name: "Remplacement des 4 bougies de préchauffage haute résistance Diesel",
    shortName: "Bougies préchauffage Diesel",
    labor: "ht",
    hours: 1.2,
    partPrice: 8800,
    intervalKm: 60000,
    intervalAns: 4,
    fuel: "diesel",
    big: true,
    type: "ht",
    description: "Bougies haute température assurant le démarrage à froid et le cycle de post-chauffage régénération FAP."
  },

  // 6. SYSTÈME DÉPOLLUTION DIESEL (FAP & VANNE EGR)
  {
    id: "diagnosticFAP_EGR",
    name: "Diagnostic électronique saturation FAP, débitmètre & test vanne EGR",
    shortName: "Diagnostic FAP / EGR",
    labor: "diagnostic",
    hours: 0.5,
    partPrice: 0,
    intervalKm: 20000,
    intervalAns: 2,
    fuel: "diesel",
    type: "diagnostic"
  },
  {
    id: "nettoyageEGR",
    name: "Décalaminage et nettoyage vanne EGR & conduit d'admission",
    shortName: "Nettoyage vanne EGR",
    labor: "ht",
    hours: 1.2,
    partPrice: 3200, // Solvant décalaminant et joints neufs
    intervalKm: 40000,
    intervalAns: 3,
    fuel: "diesel",
    big: true,
    type: "ht",
    description: "Nettoyage préventif vanne EGR pour éviter le colmatage par les suies d'échappement."
  },
  {
    id: "additifFAP",
    name: "Niveau & appoint additif FAP (Cérine / AdBlue) + réinitialisation calculateur",
    shortName: "Additif FAP Diesel",
    labor: "ht",
    hours: 0.5,
    partPrice: 5800,
    intervalKm: 40000,
    intervalAns: 3,
    severeKm: 20000,
    severeAns: 2,
    fuel: "diesel",
    type: "ht",
    description: "Recharge additif catalytique et remise à zéro compteur d'additivation via outil diagnostic."
  },

  // 7. SYSTÈME DE FREINAGE (Commun à tous)
  {
    id: "plaquettesAv",
    name: "Remplacement plaquettes de frein avant",
    shortName: "Plaquettes de frein AV",
    labor: "freinage",
    hours: 1.0,
    partPrice: 6500,
    intervalKm: 30000,
    intervalAns: 2,
    fuel: "all",
    type: "freinage"
  },
  {
    id: "plaquettesAr",
    name: "Remplacement plaquettes de frein arrière",
    shortName: "Plaquettes de frein AR",
    labor: "freinage",
    hours: 1.0,
    partPrice: 5500,
    intervalKm: 50000,
    intervalAns: 3,
    fuel: "all",
    type: "freinage"
  },
  {
    id: "liquideFrein",
    name: "Purge et remplacement complet liquide de frein DOT4",
    shortName: "Liquide de frein (2 ans)",
    labor: "freinage",
    hours: 0.8,
    partPrice: 1200,
    intervalKm: 999999, // Échéance strictement temporelle
    intervalAns: 2,
    fuel: "all",
    type: "freinage"
  },

  // 8. CIRCUITS, REFROIDISSEMENT & ESSUIE-GLACES (Commun)
  {
    id: "liquideRefroid",
    name: "Contrôle pH et remplacement liquide de refroidissement",
    shortName: "Liquide refroidissement",
    labor: "revision",
    hours: 1.0,
    partPrice: 2800,
    intervalKm: 120000,
    intervalAns: 4,
    fuel: "all",
    type: "consommable"
  },
  {
    id: "balais",
    name: "Remplacement balais d'essuie-glace (paire avant)",
    shortName: "Balais essuie-glace",
    labor: "revision",
    hours: 0.2,
    partPrice: 2800,
    intervalKm: 30000,
    intervalAns: 2,
    fuel: "all",
    type: "consommable"
  },

  // 9. COURROIES & DISTRIBUTION (Différenciées selon contraintes moteur)
  {
    id: "courroieAccDiesel",
    name: "Remplacement courroie d'accessoires renforcée (alternateur Heavy Duty & compresseur)",
    shortName: "Courroie accessoires Diesel",
    labor: "ht",
    hours: 1.0,
    partPrice: 4200,
    intervalKm: 90000,
    intervalAns: 5,
    severeKm: 60000,
    severeAns: 4,
    fuel: "diesel",
    big: true,
    type: "ht"
  },
  {
    id: "courroieAccEssence",
    name: "Remplacement courroie de commande des accessoires moteur essence",
    shortName: "Courroie accessoires Essence",
    labor: "ht",
    hours: 0.8,
    partPrice: 3200,
    intervalKm: 120000,
    intervalAns: 6,
    fuel: "essence",
    big: true,
    type: "ht"
  },
  {
    id: "courroieAccGpl",
    name: "Remplacement courroie de commande des accessoires moteur base GPL",
    shortName: "Courroie accessoires GPL",
    labor: "ht",
    hours: 0.8,
    partPrice: 3200,
    intervalKm: 120000,
    intervalAns: 6,
    fuel: "gpl",
    big: true,
    type: "ht"
  },
  {
    id: "kitCalagePompeDiesel",
    name: "Kit distribution crantée renforcée + pompe à eau moteur Diesel (Multijet / HDi)",
    shortName: "Kit distribution + pompe eau Diesel",
    labor: "ht",
    hours: 5.5,
    partPrice: 26500,
    intervalKm: 60000,
    intervalAns: 5,
    fuel: "diesel",
    big: true,
    type: "ht",
    description: "Courroie haute résistance, galets tendeurs dynamiques renforcés et pompe à eau pour fort couple moteur Diesel."
  },
  {
    id: "kitCalagePompeEssence",
    name: "Kit complet distribution crantée + pompe à eau moteur Essence",
    shortName: "Kit distribution + pompe eau Essence",
    labor: "ht",
    hours: 4.0,
    partPrice: 17500,
    intervalKm: 60000,
    intervalAns: 5,
    fuel: "essence",
    big: true,
    type: "ht",
    description: "Distribution et pompe à eau pour motorisation essence."
  },
  {
    id: "kitCalagePompeGpl",
    name: "Kit complet distribution crantée + pompe à eau moteur base GPL",
    shortName: "Kit distribution + pompe eau GPL",
    labor: "ht",
    hours: 4.2,
    partPrice: 18500,
    intervalKm: 60000,
    intervalAns: 5,
    fuel: "gpl",
    big: true,
    type: "ht",
    description: "Distribution et pompe à eau pour moteur bicarburation GPL."
  },

  // 7. OPÉRATIONS SPÉCIFIQUES SYSTÈME GPL (BICARBURATION)
  {
    id: "controleGPL",
    name: "Contrôle visuel fixations réservoir/raccords & diagnostic électronique GPL",
    shortName: "Contrôle système GPL",
    labor: "diagnostic",
    hours: 0.5,
    partPrice: 0,
    intervalKm: 10000,
    intervalAns: 1,
    fuel: "gpl",
    type: "diagnostic"
  },
  {
    id: "filtreGazeuxGPL",
    name: "Remplacement filtre phase gazeuse GPL",
    shortName: "Filtre phase gazeuse GPL",
    labor: "revision",
    hours: 0.4,
    partPrice: 4500,
    intervalKm: 30000,
    intervalAns: 3,
    severeKm: 15000,
    severeAns: 2,
    fuel: "gpl",
    type: "consommable"
  },
  {
    id: "vanneMultipleGPL",
    name: "Contrôle étanchéité & révision vanne multiple GPL",
    shortName: "Vanne multiple GPL",
    labor: "diagnostic",
    hours: 0.8,
    partPrice: 1500,
    intervalKm: 30000,
    intervalAns: 3,
    fuel: "gpl",
    type: "consommable"
  },
  {
    id: "electrovanneGPL",
    name: "Remise en état de l'électrovanne GPL",
    shortName: "Électrovanne GPL",
    labor: "ht",
    hours: 1.0,
    partPrice: 8500,
    intervalKm: 60000,
    intervalAns: 6,
    fuel: "gpl",
    type: "ht"
  },
  {
    id: "filtrePhaseLiquideGPL",
    name: "Remplacement filtre phase liquide GPL + joints d'étanchéité",
    shortName: "Filtre phase liquide GPL",
    labor: "ht",
    hours: 0.6,
    partPrice: 3800,
    intervalKm: 60000,
    intervalAns: 6,
    fuel: "gpl",
    type: "ht"
  },
  {
    id: "injecteursGPL",
    name: "Révision et tarage des injecteurs GPL",
    shortName: "Injecteurs GPL",
    labor: "ht",
    hours: 2.0,
    partPrice: 12000,
    intervalKm: 60000,
    intervalAns: 6,
    fuel: "gpl",
    big: true,
    type: "ht"
  },
  {
    id: "regulateurGPL",
    name: "Révision régulateur de pression GPL (membranes & joints toriques)",
    shortName: "Régulateur GPL",
    labor: "ht",
    hours: 1.5,
    partPrice: 9000,
    intervalKm: 120000,
    intervalAns: 12,
    fuel: "gpl",
    big: true,
    type: "ht"
  },
  {
    id: "installElecGPL",
    name: "Vérification faisceau & connexions électriques du système GPL",
    shortName: "Faisceau électrique GPL",
    labor: "diagnostic",
    hours: 1.0,
    partPrice: 0,
    intervalKm: 150000,
    intervalAns: 10,
    fuel: "gpl",
    type: "diagnostic"
  },
  {
    id: "reservoirGPL",
    name: "Épreuve et remplacement du réservoir GPL (expiration décennale)",
    shortName: "Réservoir GPL décennal",
    labor: "ht",
    hours: 3.0,
    partPrice: 55000,
    intervalKm: 999999,
    intervalAns: 10,
    fuel: "gpl",
    big: true,
    type: "ht"
  }
];

export interface SmrSimulationConfig {
  dureeMois: number;          // Ex: 48 mois
  kmTotal: number;            // Ex: 120 000 km
  kmActuel?: number;          // Ex: 0 km
  fuel: FuelType;             // 'diesel' | 'essence' | 'gpl'
  severe: boolean;            // Conditions d'utilisation sévères
  includeBig: boolean;        // Inclure grosses opérations (distribution, etc.)
  remiseConcessionnaire: number; // Remise TALHA AUTO (ex: 5%)
  margeBanque: number;        // Markup SMR (ex: 10%)
  provisionAleas: number;     // Provision imprévus (ex: 10%)
  inflationAnnuelle: number;  // Inflation pièces et MO (ex: 5%)
  tauxTva?: number;           // 19%
  customPrices?: Record<string, number>;
  customHours?: Record<string, number>;
  laborRates?: LaborRates;
}

export interface MilestoneItem {
  opId: string;
  name: string;
  shortName: string;
  hours: number;
  partPrice: number;
  laborCost: number;
  totalCostHT: number;
  isSevereTrigger?: boolean;
  isBig?: boolean;
  isGpl?: boolean;
}

export interface SmrMilestone {
  milestoneKm: number;        // Ex: 10000, 20000, 30000...
  approxMonth: number;        // Ex: 4, 8, 12...
  approxYear: number;
  items: MilestoneItem[];
  totalPartsHT: number;
  totalLaborHT: number;
  totalHours: number;
  subTotalHT: number;
  inflationFactor: number;
  totalInflatedHT: number;
}

export interface SmrYearSummary {
  year: number;
  kmEnd: number;
  milestonesCount: number;
  partsHT: number;
  laborHT: number;
  hours: number;
  rawTotalHT: number;
  inflatedTotalHT: number;
  monthlyEquivalentHT: number;
}

export interface SmrSimulationResult {
  totalKm: number;
  dureeAnnees: number;
  milestones: SmrMilestone[];
  yearlySummaries: SmrYearSummary[];
  
  // Totaux purs plan constructeur
  totalPartsRawHT: number;
  totalLaborRawHT: number;
  totalHours: number;
  totalPlanRawHT: number;
  totalPlanInflatedHT: number;

  // Après remise conventionnelle concessionnaire
  remiseAmountHT: number;
  totalApresRemiseHT: number;

  // Marge bancaire SMR
  margeBanqueAmountHT: number;
  totalAvecMargeHT: number;

  // Provision pour aléas
  provisionAleasAmountHT: number;
  budgetTotalHT: number;
  budgetTotalTTC: number;

  // Ratios & Indicateurs
  monthlySmoothedHT: number;      // Mensualité mécanique lissée recommandée pour le loyer LLD
  monthlySmoothedTTC: number;
  costPerKmHT: number;           // DZA / km
  avgAnnualCostHT: number;
  peakMonthCostHT: number;
  
  // Mois avec présence d'interventions pour calendrier
  monthsWithEvents: Set<number>;
}

export function isOpCompatible(op: SmrOperation, fuel: FuelType): boolean {
  if (op.fuel === 'all') return true;
  if (op.fuel === fuel) return true;
  // Un véhicule GPL possède une bicarburation avec alimentation essence de démarrage
  if (fuel === 'gpl' && op.id === 'filtreEssence') return true;
  return false;
}

export function getEffectiveInterval(op: SmrOperation, severe: boolean) {
  if (severe && (op.severeKm || op.severeAns)) {
    return {
      km: op.severeKm || op.intervalKm,
      ans: op.severeAns || op.intervalAns,
      isSevere: true,
    };
  }
  return {
    km: op.intervalKm,
    ans: op.intervalAns,
    isSevere: false,
  };
}

/**
 * Calculateur central du plan d'entretien 10 000 KM
 */
export function computeDetailedSmrPlan(cfg: SmrSimulationConfig): SmrSimulationResult {
  const kmTotal = Math.max(1000, cfg.kmTotal);
  const dureeMois = Math.max(1, cfg.dureeMois);
  const dureeAnnees = dureeMois / 12;
  const kmActuel = cfg.kmActuel || 0;
  const rates = cfg.laborRates || DEFAULT_LABOR_RATES;
  const inflationRate = (cfg.inflationAnnuelle || 0) / 100;
  const remisePct = (cfg.remiseConcessionnaire || 0) / 100;
  const margePct = (cfg.margeBanque || 0) / 100;
  const aleasPct = (cfg.provisionAleas || 0) / 100;
  const tva = (cfg.tauxTva !== undefined ? cfg.tauxTva : 19) / 100;

  // Liste des opérations actives
  const activeOps = SMR_OPERATIONS_CATALOG.filter(op => {
    if (!isOpCompatible(op, cfg.fuel)) return false;
    if (op.big && !cfg.includeBig) return false;
    return true;
  });

  // Détermination des paliers de 10 000 km
  // Ex: pour 120 000 km -> 10k, 20k, 30k, 40k, 50k, 60k, 70k, 80k, 90k, 100k, 110k, 120k
  const maxKm = kmActuel + kmTotal;
  const milestones: SmrMilestone[] = [];
  const monthsWithEvents = new Set<number>();

  let prevKm = kmActuel;
  const stepKm = 10000;
  const startStep = Math.floor(kmActuel / stepKm) * stepKm + stepKm;

  // Pour suivre quand une opération a été faite précédemment
  const lastDoneKm: Record<string, number> = {};
  const lastDoneMonth: Record<string, number> = {};
  activeOps.forEach(op => {
    lastDoneKm[op.id] = kmActuel;
    lastDoneMonth[op.id] = 0;
  });

  // Paliers de 10 000 km
  for (let mKm = startStep; mKm <= maxKm; mKm += stepKm) {
    const kmDoneSinceStart = mKm - kmActuel;
    const progressRatio = kmDoneSinceStart / kmTotal;
    const approxMonth = Math.min(dureeMois, Math.max(1, Math.round(progressRatio * dureeMois)));
    const approxYear = Math.ceil(approxMonth / 12);
    const inflationFactor = Math.pow(1 + inflationRate, (approxMonth - 1) / 12);

    const milestoneItems: MilestoneItem[] = [];

    activeOps.forEach(op => {
      const { km: intervalKm, ans: intervalAns, isSevere } = getEffectiveInterval(op, cfg.severe);
      const kmSinceLast = mKm - (lastDoneKm[op.id] || 0);
      const monthsSinceLast = approxMonth - (lastDoneMonth[op.id] || 0);
      const yearsSinceLast = monthsSinceLast / 12;

      // Déclenchement par kilométrage OU par temps révolu
      const triggerKm = intervalKm < 999999 && kmSinceLast >= intervalKm - 500; // tolérance
      const triggerTime = intervalAns > 0 && yearsSinceLast >= intervalAns - 0.1;

      // Cas spécial liquide de frein : tous les 2 ans
      const triggerSpecial = op.id === 'liquideFrein' && yearsSinceLast >= 2;

      if (triggerKm || triggerTime || triggerSpecial) {
        const partPrice = cfg.customPrices && cfg.customPrices[op.id] !== undefined
          ? cfg.customPrices[op.id]
          : op.partPrice;
        const hours = cfg.customHours && cfg.customHours[op.id] !== undefined
          ? cfg.customHours[op.id]
          : op.hours;
        const laborRate = rates[op.labor] || rates.revision;
        const laborCost = laborRate * hours;
        const totalCostHT = partPrice + laborCost;

        milestoneItems.push({
          opId: op.id,
          name: op.name,
          shortName: op.shortName,
          hours,
          partPrice,
          laborCost,
          totalCostHT,
          isSevereTrigger: isSevere,
          isBig: op.big,
          isGpl: op.fuel === 'gpl'
        });

        lastDoneKm[op.id] = mKm;
        lastDoneMonth[op.id] = approxMonth;
      }
    });

    if (milestoneItems.length > 0) {
      const totalPartsHT = milestoneItems.reduce((acc, it) => acc + it.partPrice, 0);
      const totalLaborHT = milestoneItems.reduce((acc, it) => acc + it.laborCost, 0);
      const totalHours = milestoneItems.reduce((acc, it) => acc + it.hours, 0);
      const subTotalHT = totalPartsHT + totalLaborHT;
      const totalInflatedHT = subTotalHT * inflationFactor;

      milestones.push({
        milestoneKm: mKm,
        approxMonth,
        approxYear,
        items: milestoneItems,
        totalPartsHT,
        totalLaborHT,
        totalHours,
        subTotalHT,
        inflationFactor,
        totalInflatedHT
      });

      monthsWithEvents.add(approxMonth);
    }
  }

  // Synthèse annuelle
  const numYears = Math.ceil(dureeAnnees);
  const yearlySummaries: SmrYearSummary[] = [];

  for (let y = 1; y <= numYears; y++) {
    const yearMilestones = milestones.filter(m => m.approxYear === y);
    const partsHT = yearMilestones.reduce((acc, m) => acc + m.totalPartsHT, 0);
    const laborHT = yearMilestones.reduce((acc, m) => acc + m.totalLaborHT, 0);
    const hours = yearMilestones.reduce((acc, m) => acc + m.totalHours, 0);
    const rawTotalHT = partsHT + laborHT;
    const inflatedTotalHT = yearMilestones.reduce((acc, m) => acc + m.totalInflatedHT, 0);
    const yearKmEnd = Math.min(maxKm, kmActuel + Math.round((y / dureeAnnees) * kmTotal));

    yearlySummaries.push({
      year: y,
      kmEnd: yearKmEnd,
      milestonesCount: yearMilestones.length,
      partsHT,
      laborHT,
      hours,
      rawTotalHT,
      inflatedTotalHT,
      monthlyEquivalentHT: inflatedTotalHT / 12
    });
  }

  // Totaux
  const totalPartsRawHT = milestones.reduce((acc, m) => acc + m.totalPartsHT, 0);
  const totalLaborRawHT = milestones.reduce((acc, m) => acc + m.totalLaborHT, 0);
  const totalHours = milestones.reduce((acc, m) => acc + m.totalHours, 0);
  const totalPlanRawHT = totalPartsRawHT + totalLaborRawHT;
  const totalPlanInflatedHT = milestones.reduce((acc, m) => acc + m.totalInflatedHT, 0);

  // Application de la remise concessionnaire TALHA AUTO
  const remiseAmountHT = totalPlanInflatedHT * remisePct;
  const totalApresRemiseHT = totalPlanInflatedHT - remiseAmountHT;

  // Application du markup / marge banque sur l'entretien mécanique
  const margeBanqueAmountHT = totalApresRemiseHT * margePct;
  const totalAvecMargeHT = totalApresRemiseHT + margeBanqueAmountHT;

  // Provision pour aléas / imprévus
  const provisionAleasAmountHT = totalAvecMargeHT * aleasPct;
  const budgetTotalHT = totalAvecMargeHT + provisionAleasAmountHT;
  const budgetTotalTTC = budgetTotalHT * (1 + tva);

  const monthlySmoothedHT = budgetTotalHT / dureeMois;
  const monthlySmoothedTTC = budgetTotalTTC / dureeMois;
  const costPerKmHT = kmTotal > 0 ? budgetTotalHT / kmTotal : 0;
  const avgAnnualCostHT = budgetTotalHT / dureeAnnees;
  const peakMonthCostHT = Math.max(...yearlySummaries.map(s => s.monthlyEquivalentHT), 0);

  return {
    totalKm: kmTotal,
    dureeAnnees,
    milestones,
    yearlySummaries,
    totalPartsRawHT,
    totalLaborRawHT,
    totalHours,
    totalPlanRawHT,
    totalPlanInflatedHT,
    remiseAmountHT,
    totalApresRemiseHT,
    margeBanqueAmountHT,
    totalAvecMargeHT,
    provisionAleasAmountHT,
    budgetTotalHT,
    budgetTotalTTC,
    monthlySmoothedHT,
    monthlySmoothedTTC,
    costPerKmHT,
    avgAnnualCostHT,
    peakMonthCostHT,
    monthsWithEvents
  };
}
