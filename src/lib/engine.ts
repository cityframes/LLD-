import { CATALOG, SimulatorParams, TVA } from "./types";
import { irr, npv, pmt, r2m } from "./utils";
import { computeDetailedSmrPlan, SmrSimulationResult } from "./smrCatalog";

export function computeEngine(params: SimulatorParams, customDuree?: number) {
  const duree = customDuree || params.p_duree;
  const achat = params.p_achat;
  const liv = params.p_liv;
  const kmAnn = (params.p_km / params.p_duree) * 12;
  const kmTotal = (kmAnn * duree) / 12;
  const apport = params.p_apport;
  const depot = params.p_depot;

  const vrPctRaw = params.p_vr_pct / 100;
  const vrPct = Math.min(Math.max(vrPctRaw, 0), 0.70);
  const vrFrais = params.p_vr_frais;

  const costDebt = params.p_cost_debt / 100;
  const eqPct = params.p_equity_pct / 100;
  const atroe = params.p_atroe / 100;
  const lgd = params.p_risk / 100;
  const riskVrPct = params.p_risk_vr / 100;
  const admin = params.p_admin;
  const leaseAdj = params.p_lease_adj;
  const passLGD = params.p_pass_lgd;
  const passAdmin = params.p_pass_admin;
  const targetMargin = params.p_target_margin / 100;

  const smrMkup = (params.p_smr_margin ?? 10) / 100;
  const inflAnn = params.p_inflation ?? 5.0;

  // Calcul du plan d'entretien détaillé 10 000 km Stellantis / TALHA AUTO
  const smrPlan: SmrSimulationResult = computeDetailedSmrPlan({
    dureeMois: duree,
    kmTotal: kmTotal,
    kmActuel: 0,
    fuel: params.smr_engine_type || 'diesel',
    severe: !!params.smr_severe,
    includeBig: params.smr_include_big !== undefined ? params.smr_include_big : true,
    remiseConcessionnaire: params.smr_remise !== undefined ? params.smr_remise : 5,
    margeBanque: params.p_smr_margin !== undefined ? params.p_smr_margin : 10,
    provisionAleas: params.smr_aleas !== undefined ? params.smr_aleas : 10,
    inflationAnnuelle: inflAnn,
    tauxTva: 19,
    customPrices: params.smr_custom_prices,
    customHours: params.smr_custom_hours,
  });

  // Calcul pneumatiques
  const kmParMois = kmTotal / duree;
  const kmPneuI = params.km_pneu || 40000;
  const prixPneu = params.c_pneu ?? 25000;
  let coutPneu = 0;
  const pneuEventsMap = new Set<number>();
  for (let m = 1; m <= duree; m++) {
    const kmCur = m * kmParMois;
    const kmPrev = (m - 1) * kmParMois;
    const pneuEv = Math.floor(kmCur / kmPneuI) > Math.floor(kmPrev / kmPneuI);
    if (pneuEv && m !== duree) {
      const factor = Math.pow(1 + inflAnn / 100, m / 12);
      coutPneu += 4 * prixPneu * factor;
      pneuEventsMap.add(m);
    }
  }
  const provPneu = coutPneu / duree;
  const pneuMkupM = provPneu * smrMkup;

  // Entretien mécanique après remise conventionnelle
  const provSMR = smrPlan.totalApresRemiseHT / duree;
  const smrMkupM = (smrPlan.margeBanqueAmountHT / duree) + pneuMkupM;
  const provAleasM = smrPlan.provisionAleasAmountHT / duree;

  const provMob = params.c_mob;
  const provAssist = params.c_assistance;
  const provGestion = params.c_gestion;
  const vehJ = params.c_veh_j;
  const vehD = params.c_veh_d;
  const vehMens = (vehJ * vehD) / 12;

  // Bloc Services total mensuel
  const blocSe = provSMR + provAleasM + provPneu + smrMkupM + provMob + provAssist + provGestion + vehMens;

  const takRC = params.p_tak_rc;
  const vign = params.p_vignette;

  const capex = achat + liv;
  const vrBrute = achat * vrPct;
  const vrNette = Math.max(0, vrBrute - vrFrais);
  const vrBruteTTC = vrBrute * (1 + TVA);
  const vrNetteTTC = vrNette * (1 + TVA);
  const vrNegative = vrFrais > vrBrute;
  const vrRiskProv = vrNette * riskVrPct;

  const besoin = capex - apport;

  const waccAnn = costDebt * (1 - eqPct) + atroe * eqPct;
  const waccM = r2m(waccAnn);
  // Taux locatif Ijarah = coût des ressources (WACC) + marge commerciale cible
  const rateLocAnn = waccAnn + targetMargin;
  const rateLocM = r2m(rateLocAnn);
  const pmtFin = pmt(rateLocM, duree, besoin, vrNette);

  let takMDmensHT = 0;
  if (params.veh_idx >= 0 && CATALOG[params.veh_idx]) {
    takMDmensHT = CATALOG[params.veh_idx].prime_ttc / 12;
  } else {
    takMDmensHT = (achat * (params.p_tak_md / 100)) / 12;
  }
  
  const takRCmensHT = takRC / 12;
  const takHT = takMDmensHT + takRCmensHT;
  const vignM = vign / 12;
  const blocTa = takHT + vignM;
  const blocLa = leaseAdj;

  // Premier passage pour calculer avec exactitude la somme LGD et les flux
  let tempBal = besoin;
  let sumLGD = 0;
  let sumRevIj = 0;
  for (let m = 1; m <= duree; m++) {
    const revIj = tempBal * rateLocM;
    const amortC = m === duree ? (tempBal - vrNette) : (pmtFin - revIj);
    const lgdM = tempBal * lgd / 12;
    sumLGD += lgdM;
    sumRevIj += revIj;
    tempBal = m === duree ? vrNette : tempBal - amortC;
  }

  const riskM = sumLGD / duree;
  const revM_avg = sumRevIj / duree;
  const amortM_avg = (besoin - vrNette) / duree;
  const blocFi = pmtFin + (passLGD ? riskM : 0) + (passAdmin ? admin : 0);
  const loyerHT2 = blocFi + blocSe + blocTa + blocLa;
  const tvaFi2 = (blocFi + blocSe + blocLa) * TVA;
  const loyerTTC = loyerHT2 + tvaFi2;
  const prk = loyerHT2 * duree / kmTotal;
  const kmSup = prk * params.p_km_coef;

  // Construction du tableau d'amortissement parfaitement réconcilié
  let bal = besoin;
  const rows = [];

  for (let m = 1; m <= duree; m++) {
    const capDeb = bal;
    const revIj = bal * rateLocM;
    const amortC = m === duree ? (capDeb - vrNette) : (pmtFin - revIj);
    const lgdM = capDeb * lgd / 12;
    const capFin = m === duree ? vrNette : bal - amortC;

    const smrM = provSMR + provAleasM;
    const pneuM = provPneu;
    const vehM = vehMens;
    const mkupM = smrMkupM;
    const mobM = provMob + provAssist + provGestion;
    const adj = leaseAdj;

    // Loyer contractuel lissé et cohérent
    const finBase = amortC + revIj + (passLGD ? riskM : 0) + (passAdmin ? admin : 0);
    const seBase = smrM + pneuM + mobM + vehM + mkupM;
    const htM = finBase + seBase + takHT + vignM + adj;
    const tvaM = (finBase + seBase + adj) * TVA;
    const ttcM = htM + tvaM;

    const isSmrMilestone = smrPlan.monthsWithEvents.has(m);
    const isPneuMilestone = pneuEventsMap.has(m);

    rows.push({
      m, capDeb, revM: revIj, amortM: amortC, lgdM, capFin,
      smrM, pneuM, mobM, vehM, mkupM, takHT, vigM: vignM, adj,
      htM, tvaM, ttcM, smrEv: isSmrMilestone, pneuEv: isPneuMilestone
    });
    bal = capFin;
  }

  return {
    achat, capex, apport, depot, vrBrute, vrNette, vrBruteTTC, vrNetteTTC, vrFrais, vrNegative,
    waccAnn, waccM, rateLocAnn, rateLocM, besoin, duree, kmTotal,
    pmtFin, amortM_avg, revM_avg, riskM, admin, blocFi, sumLGD,
    provSMR, provPneu, smrMkupM, provAleasM, provMob, provAssist, provGestion, vehMens, blocSe,
    takMDmensHT, takRCmensHT, takHT, vignM, blocTa,
    leaseAdj, blocLa,
    loyerHT: loyerHT2, tvaFi: tvaFi2, loyerTTC,
    prk, kmSup, rows, smrPlan,
    costDebt, eqPct, atroe, lgd, riskVrPct, vrRiskProv, passLGD, passAdmin, targetMargin,
    ibs: (params.p_ibs ?? 26) / 100,
    hurdle: (params.p_hurdle_externe || params.p_atroe) / 100
  };
}

export interface PnLShock {
  vr: number;   // Choc sur la VR réalisée, en fraction du prix d'achat (ex: -0.08)
  cost: number; // Choc sur le coût de refinancement annuel (ex: +0.01)
}

export function computePnL(r: ReturnType<typeof computeEngine>, shock: PnLShock = { vr: 0, cost: 0 }) {
  const eqPct = r.eqPct;
  const costDebtM = r2m(Math.max(0, r.costDebt + shock.cost));
  const equityInvested = r.besoin * eqPct;
  const cfEquity = [-equityInvested];

  // Montants refacturés au client et inclus dans le loyer (cf. blocFi)
  const passM = (r.passLGD ? r.riskM : 0) + (r.passAdmin ? r.admin : 0);

  // VR réellement encaissée dans le scénario (le loyer, lui, reste celui du contrat)
  const vrRealisee = Math.max(0, r.vrNette + shock.vr * r.achat);
  const vrLoss = r.vrNette - vrRealisee;

  let sumDebtCost = 0;
  let sumBal = 0;

  for (const row of r.rows) {
    const debtCostM = row.capDeb * (1 - eqPct) * costDebtM;
    sumDebtCost += debtCostM;
    sumBal += row.capDeb;
    // Résultat avant impôt du mois :
    // Revenu locatif + Markup SMR + Ajustement de loyer (+/-) + LGD/frais refacturés - LGD - Frais admin - Coût dette
    let profitM = (row.revM + r.smrMkupM + r.leaseAdj + passM)
      - (row.lgdM + r.admin + debtCostM);
    if (row.m === r.duree) profitM -= r.vrRiskProv + vrLoss;
    // Flux fonds propres : résultat après IBS + quote-part equity de l'amortissement
    cfEquity.push(profitM * (1 - r.ibs) + row.amortM * eqPct);
  }

  // Encaissement terminal de la quote-part de valeur résiduelle nette sur fonds propres
  cfEquity[r.duree] += r.vrNette * eqPct;

  const sumAdmin = r.admin * r.duree;
  const smrMkupTot = r.smrMkupM * r.duree;
  const laTotal = r.leaseAdj * r.duree;
  const passTotal = passM * r.duree;
  const sumRevIj = r.rows.reduce((a, x) => a + x.revM, 0);
  const sumLGD = r.rows.reduce((a, x) => a + x.lgdM, 0);
  const vrCharge = r.vrRiskProv + vrLoss;

  const pnbBrut = sumRevIj + smrMkupTot + laTotal + passTotal;
  const chargesTotal = sumDebtCost + sumLGD + sumAdmin + vrCharge;
  const mfn = pnbBrut - chargesTotal;
  const ibsAmount = mfn * r.ibs;
  const resultatNet = mfn - ibsAmount;

  const irrM = irr(cfEquity, 0.005);
  const irrAnn = Math.pow(1 + irrM, 12) - 1;

  // VAN (Valeur Actuelle Nette) au taux cible Equity (atroe)
  const atroeM = r2m(r.atroe);
  const vanEquity = npv(atroeM, cfEquity);

  // VAN au taux WACC du contrat
  const vanWacc = npv(r.waccM, cfEquity);

  // ROE après IBS, rapporté aux fonds propres moyens immobilisés (l'encours décroît)
  const encoursMoy = sumBal / r.duree;
  const equityMoy = encoursMoy * eqPct;
  const resultatNetAnn = (resultatNet / r.duree) * 12;
  const roeEff = equityMoy > 0 ? resultatNetAnn / equityMoy : 0;
  const mfnAnn = (mfn / r.duree) * 12;
  const spread = r.rateLocAnn - r.costDebt;
  const mfnRate = encoursMoy > 0 ? mfnAnn / encoursMoy : 0;

  return {
    equityInvested, equityMoy, sumRevIj, sumLGD, sumDebtCost, sumAdmin,
    smrMkupTot, laTotal, passTotal, pnbBrut, chargesTotal, mfn, ibsAmount, resultatNet,
    irrAnn, vanEquity, vanWacc, roeEff, spread, mfnRate, vrRiskProv: r.vrRiskProv, vrLoss, vrCharge
  };
}
