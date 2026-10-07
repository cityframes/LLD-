import React from 'react';
import { useStateContext } from '../Store';
import { CATALOG } from '../lib/types';
import { fmt, fDZA } from '../lib/utils';

export function Catalog() {
  const { params, dispatch } = useStateContext();
  const v = params.veh_idx >= 0 ? CATALOG[params.veh_idx] : null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value);
    if (isNaN(idx) || idx < 0) {
      dispatch({ type: 'SET_PARAM', payload: { key: 'veh_idx', value: -1 } });
      dispatch({ type: 'SET_PARAM', payload: { key: 'tak_catalog_mode', value: false } });
    } else {
      const selected = CATALOG[idx];
      dispatch({ type: 'SET_PARAM', payload: { key: 'veh_idx', value: idx } });
      dispatch({ type: 'SET_PARAM', payload: { key: 'p_achat', value: selected.prix } });
      dispatch({ type: 'SET_PARAM', payload: { key: 'tak_catalog_mode', value: true } });
      if (selected.fuel) {
        dispatch({ type: 'SET_PARAM', payload: { key: 'smr_engine_type', value: selected.fuel } });
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0d1e38] via-[#112030] to-[#0a1a30] border border-[var(--color-border-main)] rounded-[10px] mb-3.5 overflow-hidden shadow-[0_6px_28px_rgba(0,0,0,0.45)]">
      <div className="flex items-center gap-2.5 p-3 px-4.5 border-b border-[var(--color-border-light)]">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[var(--color-gold)] to-[#9a6c1a] flex items-center justify-center text-[15px] shrink-0">
          🚗
        </div>
        <div>
          <div className="font-cormorant text-[15px] font-bold text-[var(--color-gold-l)]">Catalogue Véhicules & Primes Takaful</div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[1px]">Sélection automatique du prix d'acquisition et de la prime d'assurance annuelle (DZA TTC)</div>
        </div>
        <div className="ml-auto font-jetbrains text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-green-d)] text-[var(--color-green)] border border-[#27ae7a33] tracking-[0.5px] hidden sm:block">
          ✓ Tarifs officiels · DZA TTC
        </div>
      </div>
      
      <div className="p-3.5 px-4.5 flex items-start gap-4.5 flex-wrap">
        <div className="shrink-0">
          <div className="text-[9.5px] text-[var(--color-txt3)] uppercase tracking-[1px] mb-1.5 flex items-center gap-1.5">
            <span className="text-[var(--color-gold)] text-[11px]">🚗</span> Sélectionner un véhicule du catalogue
          </div>
          <select 
            value={params.veh_idx} 
            onChange={handleChange}
            className="bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-[var(--color-txt)] font-mulish text-[12px] font-semibold py-2 px-3 pr-9 cursor-pointer min-w-[280px] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold-d)] appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23c9a84c'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center'
            }}
          >
            <option value="-1">— Saisie manuelle —</option>
            {CATALOG.map((c, i) => (
              <option key={i} value={i} className="bg-[#0d1e38] text-[var(--color-txt)]">
                {c.model} {c.version !== '—' ? c.version : ''} · {c.cv}
              </option>
            ))}
          </select>
          {!v && (
            <div className="text-[11px] text-[var(--color-txt3)] italic py-2">
              ↑ Choisissez un véhicule pour auto-remplir le prix et la prime Takaful
            </div>
          )}
        </div>

        {v && (
          <div className="flex-1 min-w-[280px] bg-black/20 border border-[var(--color-border-light)] rounded-lg p-3 px-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-0.5">
              <div>
                <div className="text-[8.5px] uppercase tracking-[1px] text-[var(--color-txt3)] mb-0.5">Modèle</div>
                <div className="font-jetbrains text-[12px] font-bold text-[var(--color-txt)]">{v.model}</div>
              </div>
              <div>
                <div className="text-[8.5px] uppercase tracking-[1px] text-[var(--color-txt3)] mb-0.5">Version</div>
                <div className="font-jetbrains text-[12px] font-bold text-[var(--color-txt)]">{v.version}</div>
              </div>
              <div>
                <div className="text-[8.5px] uppercase tracking-[1px] text-[var(--color-txt3)] mb-0.5">Puissance</div>
                <div className="font-jetbrains text-[12px] font-bold text-[var(--color-txt)]">{v.cv}</div>
              </div>
              <div>
                <div className="text-[8.5px] uppercase tracking-[1px] text-[var(--color-txt3)] mb-0.5">Prix Acquisition HT</div>
                <div className="font-jetbrains text-[12px] font-bold text-[var(--color-gold-l)]">{fDZA(v.prix)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-[#27ae7a12] border border-[#27ae7a2e] rounded-md p-2 px-3 mt-2.5">
              <span className="text-[16px]">🛡️</span>
              <div className="text-[11px] text-[var(--color-txt2)] flex-1">
                Prime <strong>Takaful Tous Risques</strong> annuelle (catalogue officiel)
              </div>
              <div>
                <div className="font-jetbrains text-[13px] font-bold text-[var(--color-green)]">{fDZA(v.prime_ttc)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
