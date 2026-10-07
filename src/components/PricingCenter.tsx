import React from 'react';
import { useStateContext } from '../Store';
import { V11_PROFILES, V11_SCENARIOS } from '../lib/types';
import { fmt, fDZA } from '../lib/utils';
import { computePnL } from '../lib/engine';
import { scenarioTable } from '../lib/pricing';
import { cn } from '../lib/utils';

export function PricingCenterV11() {
  const { params, dispatch, engineResult, pnlResult: pnlBase } = useStateContext();
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pKey = e.target.value;
    dispatch({ type: 'SET_PARAM', payload: { key: 'v11_profile', value: pKey } });
    const p = V11_PROFILES[pKey];
    if (p) {
      dispatch({ type: 'SET_PARAM', payload: { key: 'p_atroe', value: p.roe * 100 } });
      dispatch({ type: 'SET_PARAM', payload: { key: 'p_hurdle_externe', value: p.hurdle * 100 } });
      dispatch({ type: 'SET_PARAM', payload: { key: 'p_risk', value: p.lgd * 100 } });
      dispatch({ type: 'SET_PARAM', payload: { key: 'p_smr_margin', value: p.smr * 100 } });
    }
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_PARAM', payload: { key: 'v11_scenario', value: e.target.value } });
  };

  const prof = V11_PROFILES[params.v11_profile] || V11_PROFILES.standard;
  const sc = V11_SCENARIOS[params.v11_scenario] || V11_SCENARIOS.base;

  const mvr = Math.max(0, Math.min(0.70, engineResult.vrBrute / engineResult.achat + sc.vr));
  const rv = Math.max(0, mvr * (1 - prof.vrHaircut));
  const ftp = Math.max(0, engineResult.costDebt + sc.cost);
  // Rentabilité recalculée sous le scénario : le loyer reste celui du contrat,
  // la VR réalisée et le coût de refinancement subissent le choc.
  const pnlResult = (sc.vr === 0 && sc.cost === 0) ? pnlBase : computePnL(engineResult, { vr: sc.vr, cost: sc.cost });

  let cls = 'good', label = '✓ ACCEPTABLE', why: string[] = [];
  const dmin = params.p_duree_min || 36;
  const dmax = params.p_duree_max || 60;
  
  if (engineResult.duree < dmin || engineResult.duree > dmax) { cls = 'bad'; label = '✗ HORS POLITIQUE'; why.push('durée hors limites'); }
  if (engineResult.vrNegative) { cls = 'bad'; label = '✗ HORS POLITIQUE'; why.push('VR nette négative'); }
  if (pnlResult.roeEff < engineResult.atroe * 0.90) { cls = 'bad'; label = '✗ RENTABILITÉ INSUFFISANTE'; why.push('ROE sous seuil'); }
  else if (pnlResult.roeEff < engineResult.atroe && cls === 'good') { cls = 'warn'; label = '⚠ À VALIDER'; why.push('ROE sous cible'); }
  
  if (pnlResult.irrAnn < engineResult.hurdle * 0.90) { cls = 'bad'; label = '✗ TRI INSUFFISANT'; why.push('TRI sous seuil'); }
  else if (pnlResult.irrAnn < engineResult.hurdle && cls === 'good') { cls = 'warn'; label = '⚠ À VALIDER'; why.push('TRI sous le seuil cible'); }
  
  if (mvr > 0.60 && cls === 'good') { cls = 'warn'; label = '⚠ À VALIDER'; why.push('VR élevée'); }

  return (
    <div className="bg-[var(--color-card)] border border-[#2196f32e] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)] mb-3.5">
      <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-cyan)]">
        <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-cyan-d)]">
          🎯
        </div>
        <div>
          <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Centre de Contrôle Pricing LLD</div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.7px] mt-0.5">Politique · Profil · Scénario · Décision</div>
        </div>
      </div>
      
      <div className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1.1fr_1.6fr] gap-3">
          <div className="p-3 border border-[var(--color-border-main)] rounded-lg bg-gradient-to-br from-white/5 to-transparent min-h-[96px]">
            <div className="text-[10px] uppercase tracking-[1px] font-extrabold text-[var(--color-gold)] mb-2">Profil pricing</div>
            <select value={params.v11_profile} onChange={handleProfileChange} className="w-full p-2 rounded-md bg-[var(--color-bg2)] border border-[var(--color-border-main)] text-[var(--color-txt)] font-mulish text-[11px] font-bold outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold-d)]">
              {Object.keys(V11_PROFILES).map(k => (
                <option key={k} value={k}>{V11_PROFILES[k].label}</option>
              ))}
            </select>
            <div className="text-[9px] text-[var(--color-txt3)] mt-2 leading-[1.45]">{prof.desc}</div>
          </div>
          
          <div className="p-3 border border-[var(--color-border-main)] rounded-lg bg-gradient-to-br from-white/5 to-transparent min-h-[96px]">
            <div className="text-[10px] uppercase tracking-[1px] font-extrabold text-[var(--color-gold)] mb-2">Scénario</div>
            <select value={params.v11_scenario} onChange={handleScenarioChange} className="w-full p-2 rounded-md bg-[var(--color-bg2)] border border-[var(--color-border-main)] text-[var(--color-txt)] font-mulish text-[11px] font-bold outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold-d)]">
              {Object.keys(V11_SCENARIOS).map(k => (
                <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
              ))}
            </select>
            <div className="text-[9px] text-[var(--color-txt3)] mt-2 leading-[1.45]">{sc.desc}</div>
          </div>
          
          <div className="p-3 border border-[var(--color-border-main)] rounded-lg bg-gradient-to-br from-white/5 to-transparent min-h-[96px]">
            <div className="text-[10px] uppercase tracking-[1px] font-extrabold text-[var(--color-gold)] mb-2">Décision pricing</div>
            <div className={cn(
              "text-[18px] font-black tracking-[0.5px] px-2.5 py-1.5 rounded-md inline-block",
              cls === 'good' && "bg-[#27ae7a1e] text-[#39c98a] border border-[#27ae7a40]",
              cls === 'warn' && "bg-[#d4882a1e] text-[#e0a04a] border border-[#d4882a40]",
              cls === 'bad' && "bg-[#dc46461e] text-[#ef7070] border border-[#dc464640]"
            )}>
              {label}
            </div>
            <div className="text-[9px] text-[var(--color-txt3)] mt-2 leading-[1.45]">
              {why.length ? why.join(' · ') : 'Paramètres dans les seuils de décision du profil.'}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-1.5 mt-2.5">
          <KpiBox label="VR marché" val={`${fmt(mvr * 100, 1)} %`} />
          <KpiBox label="VR retenue" val={`${fmt(rv * 100, 1)} %`} />
          <KpiBox label="FTP / ressource" val={`${fmt(ftp * 100, 2)} %`} />
          <KpiBox label="ROE après IBS (scénario)" val={`${fmt(pnlResult.roeEff * 100, 2)} %`} />
          <KpiBox label="TRI après IBS (scénario)" val={`${fmt(pnlResult.irrAnn * 100, 2)} %`} />
          <KpiBox label="Marge nette (scénario)" val={fDZA(pnlResult.mfn)} />
        </div>

        <ScenarioTable onPick={k => dispatch({ type: 'SET_PARAM', payload: { key: 'v11_scenario', value: k } })} selected={params.v11_scenario} />
      </div>
    </div>
  );
}

function KpiBox({ label, val }: { label: string, val: string }) {
  return (
    <div className="p-2 bg-[var(--color-bg2)] border border-[var(--color-border-light)] rounded-md">
      <span className="block text-[8px] text-[var(--color-txt3)] uppercase tracking-[0.7px]">{label}</span>
      <strong className="block mt-1 font-mono text-[13px] text-[var(--color-txt)] font-bold">{val}</strong>
    </div>
  );
}

const SC_LABELS: Record<string, string> = { base: 'Base', optimiste: 'Optimiste', prudent: 'Prudent', stress: 'Stress' };

function ScenarioTable({ onPick, selected }: { onPick: (k: string) => void, selected: string }) {
  const { engineResult } = useStateContext();
  const rows = scenarioTable(engineResult);
  const pct = (v: number) => `${fmt(v * 100, 1)} %`;
  return (
    <div className="mt-3 overflow-x-auto">
      <div className="text-[10px] uppercase tracking-[1px] font-extrabold text-[var(--color-gold)] mb-1.5">Scénarios côte à côte · loyer du contrat inchangé</div>
      <table className="w-full border-collapse text-[11px] min-w-[520px]">
        <thead>
          <tr className="text-[8.5px] uppercase tracking-[0.7px] text-[var(--color-txt3)]">
            <th className="text-left p-1.5">Scénario</th>
            <th className="text-right p-1.5">Choc VR</th>
            <th className="text-right p-1.5">Choc ressource</th>
            <th className="text-right p-1.5">Résultat net</th>
            <th className="text-right p-1.5">ROE après IBS</th>
            <th className="text-right p-1.5">TRI après IBS</th>
            <th className="text-center p-1.5">Verdict</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, sc, pl, status }) => (
            <tr key={key} onClick={() => onPick(key)} className={cn("border-t border-[var(--color-border-light)] cursor-pointer hover:bg-white/5", selected === key && "bg-[#c9a84c14]")}>
              <td className="p-1.5 font-bold text-[var(--color-txt)]">{SC_LABELS[key] || key}</td>
              <td className="p-1.5 text-right font-jetbrains text-[var(--color-txt2)]">{sc.vr === 0 ? '—' : `${sc.vr > 0 ? '+' : ''}${fmt(sc.vr * 100, 0)} pts`}</td>
              <td className="p-1.5 text-right font-jetbrains text-[var(--color-txt2)]">{sc.cost === 0 ? '—' : `${sc.cost > 0 ? '+' : ''}${fmt(sc.cost * 100, 1)} %`}</td>
              <td className="p-1.5 text-right font-jetbrains" style={{ color: pl.resultatNet < 0 ? 'var(--color-red)' : 'var(--color-green)' }}>{fDZA(pl.resultatNet)}</td>
              <td className="p-1.5 text-right font-jetbrains text-[var(--color-txt)]">{pct(pl.roeEff)}</td>
              <td className="p-1.5 text-right font-jetbrains text-[var(--color-txt)]">{pct(pl.irrAnn)}</td>
              <td className="p-1.5 text-center">
                <span className={cn("px-2 py-0.5 rounded text-[9.5px] font-bold",
                  status === 'good' && "bg-[#27ae7a1e] text-[#39c98a]",
                  status === 'warn' && "bg-[#d4882a1e] text-[#e0a04a]",
                  status === 'bad' && "bg-[#dc46461e] text-[#ef7070]")}>
                  {status === 'good' ? '✓ OK' : status === 'warn' ? '⚠ À valider' : '✗ Insuffisant'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
