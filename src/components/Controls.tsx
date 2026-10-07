import React from 'react';
import { useStateContext } from '../Store';
import { fmt } from '../lib/utils';
import { InputRow } from './ui/InputRow';

export function ControlsV10() {

  const { params, dispatch, engineResult, pnlResult } = useStateContext();

  const handleNumChange = (key: string, value: string) => {
    dispatch({ type: 'SET_PARAM', payload: { key, value: parseFloat(value) || 0 } });
  };
  const handleCheckChange = (key: string, value: boolean) => {
    dispatch({ type: 'SET_PARAM', payload: { key, value } });
  };

  const getValidation = () => {
    const msgs: string[] = [];
    let level = 'success';
    const dmin = params.p_duree_min;
    const dmax = params.p_duree_max;
    
    if (dmin && dmax && (engineResult.duree < dmin || engineResult.duree > dmax)) {
      msgs.push(`Durée hors politique ${dmin}–${dmax} mois`);
      level = 'danger';
    }
    if (engineResult.vrNegative) {
      msgs.push('VR nette négative : frais > VR brute');
      level = 'danger';
    }
    if (engineResult.besoin <= 0) {
      msgs.push('Capital financé ≤ 0');
      level = 'danger';
    }
    if (engineResult.eqPct < 0 || engineResult.eqPct >= 1) {
      msgs.push('Ratio Equity invalide');
      level = 'danger';
    }
    if (engineResult.loyerTTC <= 0) {
      msgs.push('Loyer TTC non positif');
      level = 'danger';
    }
    
    const target = params.p_target_rent;
    if (engineResult.targetMargin > 0) {
      msgs.push(`Marge cible pricing : ${fmt(engineResult.targetMargin * 100, 2)}%/an`);
    }
    if (target > 0) {
      const delta = (engineResult.loyerTTC - target) / target * 100;
      msgs.push(`Écart objectif loyer : ${fmt(delta, 1)}%`);
      if (Math.abs(delta) > 10 && level === 'success') level = 'warning';
    }
    
    const vrRatio = engineResult.vrBrute / engineResult.achat * 100;
    if (vrRatio > 55) {
      msgs.push('VR > 55% : revue risque de valeur recommandée');
      if (level === 'success') level = 'warning';
    }
    
    if (pnlResult.irrAnn < engineResult.waccAnn && level === 'success') level = 'warning';
    msgs.push(`TRI ${fmt(pnlResult.irrAnn * 100, 2)}% vs WACC ${fmt(engineResult.waccAnn * 100, 2)}%`);
    msgs.push('Fiscalité LLD DZ : Takaful & Vignette refacturés en débours exonérés (Art. 9 CTCA). TVA 19% appliquée sur Finance, Services SMR et Lease Adjustment.');

    return { level, msgs };
  };

  const handleGoalSeek = () => {
    if (!params.p_target_rent || params.p_target_rent <= 0) return;
    // loyerTTC = (blocFi + blocSe + leaseAdj) * (1 + TVA) + blocTa
    // leaseAdj = (targetTTC - blocTa) / (1 + TVA) - (blocFi + blocSe)
    const targetTTC = params.p_target_rent;
    const blocTa = engineResult.blocTa;
    const blocFi = engineResult.blocFi;
    const blocSe = engineResult.blocSe;
    const TVA_RATE = 0.19;
    const targetBaseHT = (targetTTC - blocTa) / (1 + TVA_RATE);
    const neededAdj = Math.round(targetBaseHT - (blocFi + blocSe));
    dispatch({ type: 'SET_PARAM', payload: { key: 'p_lease_adj', value: neededAdj } });
    dispatch({ type: 'SET_PARAM', payload: { key: 'p_adj_type', value: 'commercial' } });
  };

  const validation = getValidation();
  let badgeClass = "flex items-start gap-2 rounded-md p-2 mt-2.5 text-[10.5px] leading-[1.4] ";
  if (validation.level === 'danger') badgeClass += "bg-[#c0392b1a] border border-[#c0392b4d] text-[#e57373]";
  else if (validation.level === 'warning') badgeClass += "bg-[#d4882a14] border border-[#d4882a40] text-[#e8aa60]";
  else badgeClass += "bg-[#456fbd14] border border-[#2d6fbd33] text-[#7ab5e8]";

  const icon = validation.level === 'danger' ? '🚨' : validation.level === 'warning' ? '⚠️' : '✓';

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)] mb-3.5">
      <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-cyan)]">
        <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-cyan-d)]">
          ⚙️
        </div>
        <div>
          <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Contrôles v10 & Règles de Pricing</div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.7px] mt-0.5">Validation · politique commerciale · scénarios</div>
        </div>
      </div>
      
      <div className="p-3 px-3.5">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3">
          <InputRow label="Durée minimale autorisée" sub="Politique LLD" val={params.p_duree_min} suffix="mois" onChange={v => handleNumChange('p_duree_min', v)} />
          <InputRow label="Durée maximale autorisée" sub="Politique LLD" val={params.p_duree_max} suffix="mois" onChange={v => handleNumChange('p_duree_max', v)} />
          <InputRow label="Marge commerciale cible" sub="Benchmark indépendant" val={params.p_target_margin} suffix="%/an" step="0.1" onChange={v => handleNumChange('p_target_margin', v)} />
          
          <div className="flex items-start justify-between py-1.5 border-b border-[var(--color-border-light)] gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-[11.5px] font-medium text-[var(--color-txt)] leading-[1.3]">Inclure LGD dans le loyer</div>
              <div className="text-[9.5px] text-[var(--color-txt3)] mt-0.5">OFF = charge interne P&L uniquement</div>
            </div>
            <label className="flex items-center gap-1.5 self-center">
              <input type="checkbox" checked={params.p_pass_lgd} onChange={e => handleCheckChange('p_pass_lgd', e.target.checked)} className="rounded border-[var(--color-border-main)] bg-[var(--color-bg2)]" /> 
              <span className="text-[10px]">Client</span>
            </label>
          </div>

          <div className="flex items-start justify-between py-1.5 border-b border-[var(--color-border-light)] gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-[11.5px] font-medium text-[var(--color-txt)] leading-[1.3]">Inclure frais admin dans le loyer</div>
              <div className="text-[9.5px] text-[var(--color-txt3)] mt-0.5">OFF = charge interne P&L uniquement</div>
            </div>
            <label className="flex items-center gap-1.5 self-center">
              <input type="checkbox" checked={params.p_pass_admin} onChange={e => handleCheckChange('p_pass_admin', e.target.checked)} className="rounded border-[var(--color-border-main)] bg-[var(--color-bg2)]" /> 
              <span className="text-[10px]">Client</span>
            </label>
          </div>

          <div>
            <InputRow label="Objectif de loyer TTC" sub="Optionnel · contrôle commercial" val={params.p_target_rent} suffix="DZA/mois" onChange={v => handleNumChange('p_target_rent', v)} />
            {params.p_target_rent > 0 && Math.abs(engineResult.loyerTTC - params.p_target_rent) > 1 && (
              <button
                type="button"
                onClick={handleGoalSeek}
                className="w-full mt-1.5 py-1 px-2.5 bg-gradient-to-r from-[var(--color-purple)] to-[#6c3483] hover:opacity-90 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>⚡ Calibrer le loyer à l'objectif (Goal Seek)</span>
              </button>
            )}
          </div>
        </div>
        
        <div className={badgeClass}>
          <span className="text-[13px] shrink-0 mt-[1px]">{icon}</span>
          <div>{validation.msgs.join(' · ')}</div>
        </div>
      </div>
    </div>
  );
}

