/**
 * Plans d'entretien par famille de moteur (catalogue HR Automobiles, novembre 2026).
 *
 * Aucun concessionnaire algérien ne publie de forfait d'entretien : les montants ci-dessous
 * sont des ESTIMATIONS construites ainsi :
 *  - base : barème TALHA AUTO déjà utilisé par le simulateur (main-d'œuvre 1 347,89 DA/h HT,
 *    huile 5W40 1 600 DA/L, filtre à huile 1 380 DA, pièces des opérations du catalogue SMR) ;
 *  - contrôle : vidange d'une Clio en Algérie à 10 150 DA (huile 5 L 6 000 DA, filtres 2 100 DA,
 *    main-d'œuvre 1 500 DA), visa-algerie.com, juin 2025 ;
 *  - intervalles : préconisations constructeur, ramenées aux conditions algériennes (poussière,
 *    chaleur, carburant) quand le constructeur prévoit un plan « conditions sévères » ;
 *  - marques premium et pièces importées : coefficient sur les pièces et taux horaire plus élevé.
 * À confirmer par devis du prestataire SAV ou du concessionnaire pour chaque famille.
 */

export interface Distribution {
  type: 'chaine' | 'courroie';
  km?: number;   // échéance de remplacement (courroie)
  ans?: number;
}

export interface PlanEntretien {
  id: string;
  label: string;
  palierKm: number;       // intervalle de révision (km)
  palierMois: number;     // intervalle de révision (mois)
  huileL: number;         // contenance carter avec filtre (L)
  prixHuileL: number;     // DA HT par litre (norme constructeur)
  filtreHuile: number;    // DA HT
  tauxHoraire: number;    // DA HT par heure (main-d'œuvre de révision)
  coefPieces: number;     // coefficient appliqué aux autres pièces du barème TALHA
  distribution: Distribution;
  note: string;           // hypothèses et sources
}

export const TAUX_REFERENCE = 1347.89;

const P = (p: PlanEntretien) => p;

export const PLANS_ENTRETIEN: Record<string, PlanEntretien> = {
  renault_tce: P({
    id: 'renault_tce', label: 'Renault / Dacia TCe essence (1.0 et 1.3)',
    palierKm: 10000, palierMois: 12, huileL: 4.5, prixHuileL: 1700, filtreHuile: 1500,
    tauxHoraire: 1500, coefPieces: 1.0, distribution: { type: 'chaine' },
    note: 'Renault prévoit 30 000 km ou 1 an en Europe ; vidange à 10 000 km retenue pour les conditions algériennes. Distribution par chaîne.',
  }),
  renault_dci15: P({
    id: 'renault_dci15', label: 'Renault 1.5 dCi diesel',
    palierKm: 10000, palierMois: 12, huileL: 4.5, prixHuileL: 2400, filtreHuile: 2000,
    tauxHoraire: 1500, coefPieces: 1.0, distribution: { type: 'courroie', km: 160000, ans: 6 },
    note: 'Huile Low-SAPS (filtre à particules). Courroie de distribution à 160 000 km ou 6 ans : hors durée des contrats.',
  }),
  dfsk_10: P({
    id: 'dfsk_10', label: 'DFSK 1.0 essence (minibus)',
    palierKm: 5000, palierMois: 6, huileL: 3.0, prixHuileL: 1300, filtreHuile: 900,
    tauxHoraire: 1300, coefPieces: 0.7, distribution: { type: 'chaine' },
    note: 'Utilitaire chinois : vidange tous les 5 000 km ou 6 mois. Pièces moins chères que le barème Stellantis.',
  }),
  bmw: P({
    id: 'bmw', label: 'BMW essence turbo (X3, Série 3, Série 5)',
    palierKm: 15000, palierMois: 12, huileL: 5.25, prixHuileL: 3200, filtreHuile: 3500,
    tauxHoraire: 3500, coefPieces: 2.8, distribution: { type: 'chaine' },
    note: 'Entretien BMW selon l\'indicateur de service (environ 1 an), plafonné à 15 000 km pour les conditions algériennes. Huile BMW Longlife, pièces importées.',
  }),
  psa_diesel_20: P({
    id: 'psa_diesel_20', label: 'Peugeot / Citroën 2.0 HDi 150 (Traveller, Jumpy)',
    palierKm: 10000, palierMois: 12, huileL: 5.3, prixHuileL: 2400, filtreHuile: 2200,
    tauxHoraire: TAUX_REFERENCE, coefPieces: 1.15, distribution: { type: 'courroie', km: 150000, ans: 10 },
    note: 'Barème Stellantis (TALHA AUTO). Courroie à 150 000 km en conditions sévères : hors durée des contrats sauf très gros kilométrage.',
  }),
  psa_diesel_16: P({
    id: 'psa_diesel_16', label: 'Peugeot / Citroën 1.6 HDi 92 (Rifter, Berlingo)',
    palierKm: 10000, palierMois: 12, huileL: 3.75, prixHuileL: 2400, filtreHuile: 2200,
    tauxHoraire: TAUX_REFERENCE, coefPieces: 1.0, distribution: { type: 'courroie', km: 150000, ans: 10 },
    note: 'Barème Stellantis (TALHA AUTO). Courroie à 150 000 km en conditions sévères.',
  }),
  psa_essence_16: P({
    id: 'psa_essence_16', label: 'Peugeot 1.6 essence turbo (3008 GT)',
    palierKm: 10000, palierMois: 12, huileL: 4.25, prixHuileL: 2000, filtreHuile: 1500,
    tauxHoraire: TAUX_REFERENCE, coefPieces: 1.2, distribution: { type: 'chaine' },
    note: 'Barème Stellantis. Distribution par chaîne.',
  }),
  fiat_14: P({
    id: 'fiat_14', label: 'Fiat 1.4 essence (Tipo, 500X)',
    palierKm: 10000, palierMois: 12, huileL: 3.5, prixHuileL: 1600, filtreHuile: 1380,
    tauxHoraire: TAUX_REFERENCE, coefPieces: 1.0, distribution: { type: 'courroie', km: 60000, ans: 5 },
    note: 'Barème TALHA AUTO tel quel (plan de référence du simulateur), courroie à 60 000 km ou 5 ans.',
  }),
  vw_tsi: P({
    id: 'vw_tsi', label: 'Volkswagen 1.5 TSI / 1.5T (Passat, T-Roc, Golf, Tharu)',
    palierKm: 15000, palierMois: 12, huileL: 4.0, prixHuileL: 2600, filtreHuile: 2000,
    tauxHoraire: 2000, coefPieces: 1.4, distribution: { type: 'courroie', km: 210000, ans: 10 },
    note: 'Entretien Volkswagen à intervalle fixe : 15 000 km ou 1 an. Huile VW 508.00. Courroie hors durée des contrats.',
  }),
  vw_mpi: P({
    id: 'vw_mpi', label: 'Volkswagen 1.5 MPI (Lavida, Polo)',
    palierKm: 15000, palierMois: 12, huileL: 4.0, prixHuileL: 2000, filtreHuile: 1800,
    tauxHoraire: 2000, coefPieces: 1.2, distribution: { type: 'courroie', km: 210000, ans: 10 },
    note: 'Entretien Volkswagen à intervalle fixe : 15 000 km ou 1 an. Courroie hors durée des contrats.',
  }),
  audi_tfsi: P({
    id: 'audi_tfsi', label: 'Audi 1.5 TFSI (Q3 35 TFSI)',
    palierKm: 15000, palierMois: 12, huileL: 4.0, prixHuileL: 2800, filtreHuile: 2500,
    tauxHoraire: 2800, coefPieces: 1.9, distribution: { type: 'courroie', km: 210000, ans: 10 },
    note: 'Entretien Audi à intervalle fixe : 15 000 km ou 1 an. Marque premium : pièces et main-d\'œuvre plus chères.',
  }),
  geely_15t: P({
    id: 'geely_15t', label: 'Geely 1.5T (Coolray, Battle)',
    palierKm: 10000, palierMois: 12, huileL: 4.2, prixHuileL: 1800, filtreHuile: 1300,
    tauxHoraire: 1400, coefPieces: 0.95, distribution: { type: 'chaine' },
    note: 'Geely : une visite tous les 10 000 km ou 12 mois (barème Geely Chili, 2026). Prix construits sur le barème TALHA.',
  }),
  jetour_16t: P({
    id: 'jetour_16t', label: 'Jetour 1.6T (X70 Plus)',
    palierKm: 10000, palierMois: 12, huileL: 4.5, prixHuileL: 1800, filtreHuile: 1300,
    tauxHoraire: 1400, coefPieces: 0.95, distribution: { type: 'chaine' },
    note: 'Moteur Chery 1.6 TGDI : 10 000 km ou 12 mois. Prix construits sur le barème TALHA.',
  }),
  chinois_15: P({
    id: 'chinois_15', label: 'Berlines et SUV chinois 1.5 atmosphérique (Roewe, MG, Livan)',
    palierKm: 10000, palierMois: 12, huileL: 4.0, prixHuileL: 1600, filtreHuile: 1100,
    tauxHoraire: 1350, coefPieces: 0.85, distribution: { type: 'chaine' },
    note: '10 000 km ou 12 mois. Pièces moins chères que le barème Stellantis.',
  }),
  hyundai_kia_15: P({
    id: 'hyundai_kia_15', label: 'Hyundai / Kia 1.5 (Elantra, K3)',
    palierKm: 10000, palierMois: 12, huileL: 3.6, prixHuileL: 2000, filtreHuile: 1400,
    tauxHoraire: 1600, coefPieces: 1.0, distribution: { type: 'chaine' },
    note: 'Hyundai et Kia : 15 000 km ou 1 an, 7 500 km en conditions sévères ; 10 000 km retenu.',
  }),
  toyota_12t: P({
    id: 'toyota_12t', label: 'Toyota 1.2T (Corolla)',
    palierKm: 10000, palierMois: 12, huileL: 4.2, prixHuileL: 2200, filtreHuile: 1500,
    tauxHoraire: 1700, coefPieces: 1.1, distribution: { type: 'chaine' },
    note: 'Toyota : 10 000 km ou 12 mois sur les marchés à conditions sévères. Huile 0W20.',
  }),
};

/** Prix HT d'une vidange (huile + filtre) selon le plan. */
export const vidangeHT = (p: PlanEntretien) => Math.round(p.huileL * p.prixHuileL + p.filtreHuile);
