import React, { useState } from 'react';
import { SimulatorTab } from './SimulatorTab';
import { SmrTab } from './SmrTab';
import { PnLTab } from './PnLTab';
import { AmortizationTab } from './AmortizationTab';
import { cn } from '../lib/utils';

export function Tabs() {
  const [activeTab, setActiveTab] = useState('sim');

  return (
    <>
      <div className="flex mb-4.5 bg-[var(--color-card)] border border-[var(--color-border-main)] rounded-[10px] overflow-hidden">
        <TabButton active={activeTab === 'sim'} onClick={() => setActiveTab('sim')}>🧮 Simulateur & Pricing</TabButton>
        <TabButton active={activeTab === 'smr'} onClick={() => setActiveTab('smr')}>🔧 Plan SMR 10 000 KM</TabButton>
        <TabButton active={activeTab === 'pnl'} onClick={() => setActiveTab('pnl')}>📊 Rentabilité Banque & P&L</TabButton>
        <TabButton active={activeTab === 'amort'} onClick={() => setActiveTab('amort')}>📋 Tableau d'Amortissement</TabButton>
      </div>

      <div className={cn("hidden", activeTab === 'sim' && "block")}>
        <SimulatorTab />
      </div>
      <div className={cn("hidden", activeTab === 'smr' && "block")}>
        <SmrTab />
      </div>
      <div className={cn("hidden", activeTab === 'pnl' && "block")}>
        <PnLTab />
      </div>
      <div className={cn("hidden", activeTab === 'amort' && "block")}>
        <AmortizationTab />
      </div>
    </>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 p-3 border-none bg-transparent cursor-pointer font-mulish text-[11px] font-bold uppercase tracking-[1px] text-[var(--color-txt3)] transition-all duration-200 flex items-center justify-center gap-1.5 border-b-2 border-transparent hover:text-[var(--color-txt2)] hover:bg-white/5",
        active && "text-[var(--color-gold-l)] border-b-[var(--color-gold)] bg-[#c9a84c0f]"
      )}
    >
      {children}
    </button>
  );
}
