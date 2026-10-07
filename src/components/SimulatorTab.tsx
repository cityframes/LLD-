import React from 'react';
import { useStateContext } from '../Store';
import { Params } from './Params';
import { ResultsPanel } from './ResultsPanel';
import { ControlsV10 } from './Controls';
import { Catalog } from './Catalog';
import { PricingCenterV11 } from './PricingCenter';
import { ClientInfo } from './ClientInfo';
import { OptionsGrid } from './OptionsGrid';
import { fmt, fDZA } from '../lib/utils';
import { InputRow } from './ui/InputRow';

export function SimulatorTab() {
  const { params, dispatch, engineResult } = useStateContext();
  
  const coef = params.p_km_coef;
  const fr = params.p_km_franchise;
  const kmsup = engineResult.kmSup;

  const handleNumChange = (key: string, value: string) => {
    dispatch({ type: 'SET_PARAM', payload: { key, value: parseFloat(value) || 0 } });
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-4.5 hidden lg:grid">
        <KpiTop label="Loyer TTC / Mois" val={fDZA(engineResult.loyerTTC)} sub="Tout inclus" main />
        <KpiTop label="Loyer HT / Mois" val={fDZA(engineResult.loyerHT)} sub="Hors taxes" color="var(--color-blue)" />
        <KpiTop label="Revenu Ijarah Total" val={fDZA(engineResult.revM_avg * engineResult.duree)} sub="Marge totale contrat" color="var(--color-green)" />
        <KpiTop label="Prix Revient / km" val={`${fmt(engineResult.prk, 2)} DZA/km`} sub="DZA / km HT" color="var(--color-teal)" />
        <KpiTop label="Provision Entretien" val={fDZA(engineResult.provSMR + engineResult.provPneu)} sub="SMR + Pneus / mois" color="var(--color-orange)" />
        <KpiTop label="Prix km Dépassement" val={`${fmt(engineResult.kmSup, 2)} DZA/km`} sub="DZA / km sup." color="var(--color-purple)" />
        <KpiTop label="VR Nette HT" val={fDZA(engineResult.vrNette)} sub="Base cession fin contrat" color="var(--color-red)" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-4.5 items-start">
        <div>
          <ClientInfo />
          <ControlsV10 />
          <Catalog />
          <PricingCenterV11 />
          <OptionsGrid />
          <Params />
        </div>
        <div>
          <ResultsPanel />
        </div>
      </div>

      {/* KM DEPASSEMENT */}
      <div className="mt-4.5 bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-purple)]" style={{ background: 'rgba(0,0,0,.1)' }}>
          <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-purple-d)]">📏</div>
          <div>
            <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Tarification du Kilométrage Supplémentaire</div>
            <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.7px] mt-0.5">Coefficient · Franchise · Simulation</div>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <InputRow label="Coefficient de Dépassement" sub="Norme marché : 1,15 à 1,30 × PRK" val={params.p_km_coef} suffix="×PRK" step="0.01" onChange={v => handleNumChange('p_km_coef', v)} />
              <InputRow label="Franchise Kilométrique (tolérance)" val={params.p_km_franchise} suffix="km" onChange={v => handleNumChange('p_km_franchise', v)} />
            </div>
            <div>
              <div className="bg-gradient-to-br from-[#8e44ad12] to-[#8e44ad08] border border-[#8e44ad33] rounded-lg p-3.5 h-full">
                <div className="text-[9px] font-bold uppercase tracking-[1.2px] text-[var(--color-purple)] mb-2.5">📐 Résultat Km Dépassement</div>
                <div className="flex justify-between items-center py-1 border-b border-[#8e44ad1a]"><span className="text-[11px] text-[var(--color-txt2)]">PRK HT (base)</span><span className="font-jetbrains text-[12px] font-bold text-[var(--color-purple)]">{fmt(engineResult.prk, 2)} DZA/km</span></div>
                <div className="flex justify-between items-center py-1 border-b border-[#8e44ad1a]"><span className="text-[11px] text-[var(--color-txt2)]">Coefficient appliqué</span><span className="font-jetbrains text-[12px] font-bold text-[var(--color-purple)]">× {fmt(coef, 2)}</span></div>
                <div className="flex justify-between items-center py-1 border-b border-[#8e44ad1a]"><span className="text-[11px] text-[var(--color-txt2)]">Franchise (gratuite)</span><span className="font-jetbrains text-[12px] font-bold text-[var(--color-purple)]">{fmt(fr)} km</span></div>
                <div className="flex justify-between items-center py-2 mt-1 border-t border-[#8e44ad26]"><span className="text-[11px] text-[var(--color-txt)] font-bold">Prix / km supplémentaire</span><span className="font-jetbrains text-[18px] font-bold text-[var(--color-gold-l)]">{fmt(kmsup, 2)} DZA/km</span></div>
              </div>
            </div>
            <div>
              <div className="bg-[var(--color-bg2)] border border-[var(--color-border-light)] rounded-lg p-3 h-full">
                <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[1px] mb-2">Simulation Dépassement</div>
                <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-light)]"><span className="text-[11px] text-[var(--color-txt2)]">+5 000 km</span><span className="font-jetbrains text-[12px] font-bold text-[var(--color-purple)]">{fDZA(Math.max(0, 5000 - fr) * kmsup)}</span></div>
                <div className="flex justify-between items-center py-1 border-b border-[var(--color-border-light)]"><span className="text-[11px] text-[var(--color-txt2)]">+10 000 km</span><span className="font-jetbrains text-[12px] font-bold text-[var(--color-purple)]">{fDZA(Math.max(0, 10000 - fr) * kmsup)}</span></div>
                <div className="flex justify-between items-center py-1"><span className="text-[11px] text-[var(--color-txt2)]">+20 000 km</span><span className="font-jetbrains text-[12px] font-bold text-[var(--color-purple)]">{fDZA(Math.max(0, 20000 - fr) * kmsup)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiTop({ label, val, sub, main, color = 'var(--color-gold)' }: any) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] p-3 relative overflow-hidden flex flex-col justify-between" style={{ borderColor: main ? 'var(--color-border-main)' : 'rgba(180,150,80,.07)', background: main ? 'linear-gradient(135deg,#1a2f50,#0f2035)' : 'var(--color-card)' }}>
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: color }}></div>
      <div className="text-[9px] font-bold uppercase tracking-[1.3px] text-[var(--color-txt3)] mb-1">{label}</div>
      <div className="font-jetbrains text-[14px] font-bold text-[var(--color-txt)] whitespace-nowrap overflow-hidden text-ellipsis" style={main ? { fontSize: '17px', color: 'var(--color-gold-l)' } : {}}>{val}</div>
      <div className="text-[9px] text-[var(--color-txt3)] mt-px font-jetbrains">{sub}</div>
    </div>
  );
}
