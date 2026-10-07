import React, { useMemo } from 'react';
import { useStateContext } from '../Store';
import { fmt, fDZA, cn } from '../lib/utils';
import { InputRow } from './ui/InputRow';
import { optionsGrid, optionParams } from '../lib/pricing';

export function OptionsGrid() {
  const { params, dispatch } = useStateContext();
  const grid = useMemo(() => optionsGrid(params), [params]);
  const kmAnActuel = Math.round((params.p_km / params.p_duree) * 12);

  const handleNumChange = (key: string, value: string) => {
    dispatch({ type: 'SET_PARAM', payload: { key, value: parseFloat(value) || 0 } });
  };

  // Applique l'option choisie à la simulation (durée, kilométrage total, VR ajustée)
  const apply = (duree: number, kmAn: number) => {
    const p = optionParams(params, duree, kmAn);
    dispatch({ type: 'LOAD', payload: p });
  };

  const inPolicy = (d: number) => (!params.p_duree_min || d >= params.p_duree_min) && (!params.p_duree_max || d <= params.p_duree_max);

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)] mb-3.5">
      <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-gold)]">
        <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-gold-d)]">🗂️</div>
        <div>
          <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Grille d'options · durée × kilométrage</div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.7px] mt-0.5">Loyer HT · Loyer TTC · ROE après IBS · cliquer une case pour l'appliquer</div>
        </div>
      </div>
      <div className="p-3 overflow-x-auto">
        <table className="w-full border-collapse text-[11px] min-w-[560px]">
          <thead>
            <tr className="text-[8.5px] uppercase tracking-[0.7px] text-[var(--color-txt3)]">
              <th className="text-left p-1.5">Km / an</th>
              {grid[0].map(c => (
                <th key={c.duree} className={cn("text-center p-1.5", !inPolicy(c.duree) && "opacity-50")}>{c.duree} mois{!inPolicy(c.duree) && ' · hors politique'}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map(row => (
              <tr key={row[0].kmAn} className="border-t border-[var(--color-border-light)]">
                <td className="p-1.5 font-bold text-[var(--color-txt)] whitespace-nowrap">{fmt(row[0].kmAn)} km</td>
                {row.map(c => {
                  const current = c.duree === params.p_duree && c.kmAn === kmAnActuel;
                  const roeOk = c.roe >= c.atroe;
                  return (
                    <td key={c.duree} className="p-1">
                      <button
                        type="button"
                        onClick={() => apply(c.duree, c.kmAn)}
                        className={cn(
                          "w-full text-center rounded-md p-1.5 border cursor-pointer transition-all hover:border-[var(--color-gold)]",
                          current ? "border-[var(--color-gold)] bg-[#c9a84c1a]" : "border-[var(--color-border-light)] bg-[var(--color-bg2)]",
                          !inPolicy(c.duree) && "opacity-50"
                        )}
                      >
                        <span className="block font-jetbrains text-[12px] font-bold text-[var(--color-gold-l)]">{fDZA(c.loyerHT)}</span>
                        <span className="block font-jetbrains text-[9.5px] text-[var(--color-txt3)]">TTC {fmt(c.loyerTTC)} · VR {fmt(c.vrPct, 1)} %</span>
                        <span className="block font-jetbrains text-[10px] font-bold mt-0.5" style={{ color: roeOk ? 'var(--color-green)' : 'var(--color-red)' }}>ROE {fmt(c.roe * 100, 1)} %</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 mt-2.5">
          <InputRow label="Baisse de VR par 12 mois de plus" sub="Hypothèse de dépréciation, à remplacer par la grille de VR" val={params.p_vr_pente_mois} suffix="pts" step="0.5" onChange={v => handleNumChange('p_vr_pente_mois', v)} />
          <InputRow label="Baisse de VR par 10 000 km/an de plus" sub={`Référence : ${fmt(params.p_vr_pct, 1)} % à ${params.p_duree} mois et ${fmt(kmAnActuel)} km/an`} val={params.p_vr_pente_km} suffix="pts" step="0.5" onChange={v => handleNumChange('p_vr_pente_km', v)} />
        </div>
      </div>
    </div>
  );
}
