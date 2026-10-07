import React from 'react';
import { useStateContext } from '../Store';

export function ClientInfo() {
  const { isCorporate, params, dispatch } = useStateContext();

  if (!isCorporate) return null;

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)] mb-3.5">
      <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-blue)]">
        <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-blue-d)]">
          👤
        </div>
        <div>
          <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Informations Client & Simulation</div>
        </div>
      </div>
      
      <div className="p-3 px-3.5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
        <div>
          <span className="text-[11.5px] font-medium text-[var(--color-txt)] leading-[1.3]">Nom / Raison sociale</span>
          <input 
            type="text" 
            value={params.clientName}
            onChange={e => dispatch({ type: 'SET_PARAM', payload: { key: 'clientName', value: e.target.value } })}
            className="w-full mt-1 p-2 bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-[var(--color-txt)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold-d)]" 
          />
        </div>
        <div>
          <span className="text-[11.5px] font-medium text-[var(--color-txt)] leading-[1.3]">N° de contrat / Référence</span>
          <input 
            type="text" 
            value={params.clientRef}
            onChange={e => dispatch({ type: 'SET_PARAM', payload: { key: 'clientRef', value: e.target.value } })}
            className="w-full mt-1 p-2 bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-[var(--color-txt)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold-d)]" 
          />
        </div>
        <div>
          <span className="text-[11.5px] font-medium text-[var(--color-txt)] leading-[1.3]">Date de simulation</span>
          <input 
            type="text" 
            value={params.clientDate}
            onChange={e => dispatch({ type: 'SET_PARAM', payload: { key: 'clientDate', value: e.target.value } })}
            className="w-full mt-1 p-2 bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-[var(--color-txt)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold-d)]" 
          />
        </div>
      </div>
      
      <div className="mt-3 pt-3 p-3 px-3.5 border-t border-[var(--color-border-main)]">
        <label className="flex items-center gap-2 cursor-pointer text-[13px] font-semibold text-[var(--color-txt)]">
          <input 
            type="checkbox" 
            checked={params.optRevente}
            onChange={e => dispatch({ type: 'SET_PARAM', payload: { key: 'optRevente', value: e.target.checked } })}
            className="rounded border-[var(--color-border-main)] bg-[var(--color-bg2)]"
          />
          <span>🏷️ Proposer la possibilité de revente au client en fin de contrat (affiche la VR sur le bon de commande)</span>
        </label>
      </div>
    </div>
  );
}
