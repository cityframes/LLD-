import React, { useState } from 'react';
import { useStateContext } from '../Store';
import { fDZA, fmt } from '../lib/utils';
import { CATALOG, TVA } from '../lib/types';
import { cn } from '../lib/utils';

export function ResultsPanel() {
  const { engineResult, params } = useStateContext();
  const d = engineResult.duree;

  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({
    fi: true, se: true, ta: true, la: true, vr: false
  });

  const toggleBlock = (id: string) => {
    setOpenBlocks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const adjTypes: Record<string, string> = {
    commercial: 'Remise commerciale', index: 'Indexation marché',
    volume: 'Remise volume flotte', surcharge: 'Surcharge risque', other: 'Autre'
  };

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border-main)] rounded-[10px] overflow-hidden sticky top-[18px] shadow-[0_6px_28px_rgba(0,0,0,0.45)]">
      <div className="p-3.5 px-4.5 bg-gradient-to-br from-[#13253f] to-[#0d1e35] border-b border-[var(--color-border-main)] flex items-center justify-between">
        <div>
          <div className="font-cormorant text-[16px] font-semibold text-[var(--color-gold-l)]">Structure du Loyer Ijarah</div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.9px] mt-0.5">Décomposition mensuelle HT + taxes</div>
        </div>
        <div className="flex items-center gap-1 bg-[var(--color-green-d)] border border-[#27ae7a38] rounded-full px-2 py-0.5 text-[9px] font-bold text-[var(--color-green)] tracking-[0.4px]">
          ☽ Ijarah
        </div>
      </div>
      
      <div className="p-3.5">
        <div className="grid grid-cols-3 gap-2 bg-[var(--color-bg2)] border border-[var(--color-border-light)] rounded-md p-2.5 px-3 mb-3">
          <div className="text-center"><span className="font-jetbrains text-[12px] font-bold text-[var(--color-gold-l)] block mb-px">{fDZA(engineResult.besoin)}</span><span className="text-[8px] text-[var(--color-txt3)] uppercase tracking-[0.7px]">Capital Financé</span></div>
          <div className="text-center"><span className="font-jetbrains text-[12px] font-bold text-[var(--color-orange)] block mb-px">{fDZA(engineResult.apport)}</span><span className="text-[8px] text-[var(--color-txt3)] uppercase tracking-[0.7px]">Apport Déduit</span></div>
          <div className="text-center"><span className="font-jetbrains text-[12px] font-bold text-[var(--color-cyan)] block mb-px">{fDZA(engineResult.depot)}</span><span className="text-[8px] text-[var(--color-txt3)] uppercase tracking-[0.7px]">HJ Collatéral</span></div>
          <div className="text-center"><span className="font-jetbrains text-[12px] font-bold text-[var(--color-gold-l)] block mb-px">{fDZA(engineResult.vrNette)}</span><span className="text-[8px] text-[var(--color-txt3)] uppercase tracking-[0.7px]">VR Nette HT</span></div>
          <div className="text-center"><span className="font-jetbrains text-[12px] font-bold text-[var(--color-gold)] block mb-px">{fDZA(engineResult.vrNetteTTC)}</span><span className="text-[8px] text-[var(--color-txt3)] uppercase tracking-[0.7px]">VR Cession TTC</span></div>
          <div className="text-center"><span className="font-jetbrains text-[12px] font-bold text-[var(--color-gold-l)] block mb-px">{(engineResult.rateLocAnn * 100).toFixed(2)}%</span><span className="text-[8px] text-[var(--color-txt3)] uppercase tracking-[0.7px]">Taux locatif (WACC {(engineResult.waccAnn * 100).toFixed(2)}% + marge)</span></div>
        </div>

        <Block id="fi" name="Ijarah — Capital Financier" icon="🏦" color="#5fa0e0" bg="rgba(45,111,189,.07)" border="rgba(45,111,189,.12)" monthly={engineResult.blocFi} total={engineResult.blocFi * d} open={openBlocks.fi} onToggle={() => toggleBlock('fi')}>
          <Row label="Récupération Capital (Amortissement moy.)" val={engineResult.amortM_avg} />
          <Row label="Revenu de Location (Marge Ijarah moy.)" val={engineResult.revM_avg} />
          <Row label={`Provision Risque LGD (${params.p_pass_lgd ? 'refacturée client' : 'charge interne P&L'})`} val={engineResult.riskM} color={params.p_pass_lgd ? "#c084e8" : "var(--color-txt3)"} labelColor={params.p_pass_lgd ? "var(--color-purple)" : "var(--color-txt3)"} />
          <Row label={`Frais de Gestion Bancaire (${params.p_pass_admin ? 'refacturés client' : 'charge interne P&L'})`} val={engineResult.admin} color={params.p_pass_admin ? "var(--color-txt)" : "var(--color-txt3)"} />
        </Block>

        <Block id="se" name="Services & Entretien SMR" icon="🔧" color="var(--color-orange)" bg="rgba(212,136,42,.07)" border="rgba(212,136,42,.12)" monthly={engineResult.blocSe} total={engineResult.blocSe * d} open={openBlocks.se} onToggle={() => toggleBlock('se')}>
          <Row label="Entretien Mécanique Constructeur (10 000 km)" val={engineResult.provSMR} />
          {engineResult.provAleasM > 0 && <Row label={`Provision Aléas & Imprévus (${params.smr_aleas || 10}%)`} val={engineResult.provAleasM} color="#c084e8" />}
          <Row label="Provision Pneumatiques" val={engineResult.provPneu} />
          <Row label={`Marge Entretien mécanique (${params.p_smr_margin}%)`} val={engineResult.smrMkupM} />
          <Row label="Mobilité & Télématique GPS" val={engineResult.provMob} color="var(--color-cyan)" labelColor="var(--color-cyan)" />
          <Row label="Assistance Routière 24/7" val={engineResult.provAssist} color="var(--color-cyan)" labelColor="var(--color-cyan)" />
          <Row label="Gestion de Flotte & Cartes" val={engineResult.provGestion} color="var(--color-cyan)" labelColor="var(--color-cyan)" />
          <Row label="Véhicule de Remplacement" val={engineResult.vehMens} />
        </Block>

        <Block id="ta" name="Takaful & Taxes Roulage" icon="🛡️" color="var(--color-green)" bg="rgba(39,174,122,.07)" border="rgba(39,174,122,.12)" monthly={engineResult.blocTa} total={engineResult.blocTa * d} open={openBlocks.ta} onToggle={() => toggleBlock('ta')}>
          <div className="flex justify-between items-center px-3 py-1.5 border-b border-[var(--color-border-light)] bg-[#27ae7a0a]">
            <span className="text-[10.5px] text-[var(--color-txt2)]">Source prime Takaful MD</span>
            <span className="font-jetbrains text-[9px] text-[var(--color-txt3)]">
              {params.veh_idx >= 0 ? `📋 Catalogue — ${CATALOG[params.veh_idx].model} · ${fDZA(CATALOG[params.veh_idx].prime_ttc)}/an TTC` : `✏️ Manuel — ${fmt(params.p_tak_md, 2)}% sur valeur acquisition`}
            </span>
          </div>
          <Row label="Prime Mensuelle Takaful MD (HT)" val={engineResult.takMDmensHT} />
          <Row label="Prime Mensuelle Takaful RC+Assist. (HT)" val={engineResult.takRCmensHT} />
          <Row label="Provision Vignette (exonérée TVA)" val={engineResult.vignM} />
        </Block>

        <Block id="la" name="Lease Adjustment" icon="📐" color="#c084e8" bg="rgba(142,68,173,.07)" border="rgba(142,68,173,.12)" monthly={Math.abs(engineResult.leaseAdj)} total={Math.abs(engineResult.leaseAdj * d)} open={openBlocks.la} onToggle={() => toggleBlock('la')} prefix={engineResult.leaseAdj < 0 ? '−' : engineResult.leaseAdj > 0 ? '+' : ''}>
          <Row label="Ajustement mensuel (HT)" val={engineResult.leaseAdj} />
          <div className="flex justify-between items-center px-3 py-1.5 border-b border-[var(--color-border-light)] last:border-none">
            <span className="text-[10.5px] text-[var(--color-txt2)]">Motif</span>
            <span className="font-jetbrains text-[11px] font-semibold text-[var(--color-txt3)]">{adjTypes[params.p_adj_type] || '—'}</span>
          </div>
        </Block>

        <div className="border border-[var(--color-border-light)] rounded-md overflow-hidden mb-2 mt-2">
          <div className="flex items-center justify-between p-2 px-3 cursor-pointer select-none bg-[rgba(201,168,76,.05)] border-b border-[var(--color-border-light)]" onClick={() => toggleBlock('vr')}>
            <span className="text-[10px] font-bold text-[var(--color-gold-l)] uppercase tracking-[0.8px]">🏷️ Valeur Résiduelle — Détail TVA & Cession</span>
            <span className={cn("text-[9px] text-[var(--color-txt3)] transition-transform duration-250", openBlocks.vr && "rotate-180")}>▼</span>
          </div>
          {openBlocks.vr && (
            <div className="block">
              <Row label="VR Brute HT (% achat)" val={engineResult.vrBrute} />
              <Row label="TVA sur Cession (19%)" val={engineResult.vrBrute * TVA} color="var(--color-txt3)" />
              <Row label="VR Brute TTC" val={engineResult.vrBruteTTC} color="var(--color-gold-l)" />
              <Row label="Frais Reconditionnement (HT)" val={engineResult.vrFrais} color="var(--color-red)" />
              <Row label="VR Nette HT (base calcul PMT)" val={engineResult.vrNette} color="var(--color-green)" />
              <Row label="VR Nette TTC (prix option achat)" val={engineResult.vrNetteTTC} color="var(--color-gold-l)" />
              <Row label="Hamish Jiddiyyah restitué" val={engineResult.depot} color="var(--color-cyan)" />
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-[#1a2f50] to-[#0f2035] border border-[var(--color-border-main)] rounded-md p-3.5 mt-2">
          <div className="flex justify-between items-center py-1">
            <span className="text-[10.5px] text-[var(--color-txt2)]">Loyer Mensuel HT</span>
            <span className="font-jetbrains text-[11.5px] font-semibold text-[var(--color-txt)]">{fDZA(engineResult.loyerHT)}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-[10.5px] text-[var(--color-txt2)]">TVA Finance & Services (19%)</span>
            <span className="font-jetbrains text-[11.5px] font-semibold text-[var(--color-txt)]">{fDZA(engineResult.tvaFi)}</span>
          </div>
          <div className="h-[1px] bg-[var(--color-border-main)] my-2"></div>
          <div className="flex justify-between items-baseline mt-1">
            <div>
              <div className="text-[11px] font-bold text-[var(--color-txt2)] uppercase tracking-[0.9px]">Loyer Mensuel TTC</div>
              <div className="text-[8.5px] text-[var(--color-txt3)] mt-px">Ijarah + Entretien + Takaful + Lease Adj.</div>
            </div>
            <div className="text-right">
              <span className="font-jetbrains text-[22px] font-bold text-[var(--color-gold-l)]">{fmt(engineResult.loyerTTC)}</span>
              <span className="text-[10px] text-[var(--color-txt3)] ml-1">DZA/mois</span>
            </div>
          </div>
          <div className="text-right mt-1 font-jetbrains text-[10px] text-[var(--color-txt3)]">
            PRK : <span>{fmt(engineResult.prk, 2)}</span> DZA/km · Km sup. : <span style={{ color: 'var(--color-purple)' }}>{fmt(engineResult.kmSup, 2)}</span> DZA/km
          </div>
        </div>
        
        <div className="text-[9px] text-[var(--color-txt3)] text-center mt-2.5 leading-[1.5] border-t border-[var(--color-border-light)] pt-2">
          Finance & SMR → <span className="text-[var(--color-txt2)]">TVA 19%</span> · Takaful MD+RC → <span className="text-[var(--color-txt2)]">Non taxé</span> · Vignette → <span className="text-[var(--color-txt2)]">Exonérée</span><br/>
          Lease Adj. → <span className="text-[var(--color-txt2)]">TVA 19%</span> · VR cession → <span className="text-[var(--color-txt2)]">TVA 19%</span>
        </div>
      </div>
    </div>
  );
}

function Block({ id, name, icon, color, bg, border, monthly, total, open, onToggle, children, prefix }: any) {
  return (
    <div className="border border-[var(--color-border-light)] rounded-md overflow-hidden mb-2" style={{ borderColor: border }}>
      <div 
        className="flex items-center justify-between p-2 px-3 cursor-pointer select-none border-b" 
        style={{ backgroundColor: bg, borderBottomColor: border }} 
        onClick={onToggle}
      >
        <div className="flex items-center gap-1.5">
          <span>{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.9px]" style={{ color }}>{name}</span>
          <span className={cn("text-[9px] text-[var(--color-txt3)] ml-1 transition-transform duration-250", open && "rotate-180")}>▼</span>
        </div>
        <div className="text-right">
          <div className="font-jetbrains text-[12px] font-bold" style={{ color }}>{prefix}{fDZA(monthly)}</div>
          <div className="text-[8px] text-[var(--color-txt3)] font-jetbrains tracking-[0.3px]">Total contrat</div>
          <div className="font-jetbrains text-[9px] text-[var(--color-txt2)]">{prefix}{fDZA(total)}</div>
        </div>
      </div>
      <div className={cn("hidden", open && "block")}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, val, color, labelColor }: { label: string, val: number, color?: string, labelColor?: string }) {
  return (
    <div className="flex justify-between items-center px-3 py-1.5 border-b border-[var(--color-border-light)] last:border-none">
      <span className="text-[10.5px] text-[var(--color-txt2)]" style={{ color: labelColor }}>{label}</span>
      <span className="font-jetbrains text-[11px] font-semibold text-[var(--color-txt)]" style={{ color }}>{fDZA(val)}</span>
    </div>
  );
}
