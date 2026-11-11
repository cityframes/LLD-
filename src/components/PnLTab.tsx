import React from 'react';
import { useStateContext } from '../Store';
import { fDZA, fmt } from '../lib/utils';
import { resiliationTable } from '../lib/engine';
import { cn } from '../lib/utils';

export function PnLTab() {
  const { engineResult: r, pnlResult: pl } = useStateContext();

  const hurdle = r.hurdle;
  const triGood = pl.irrAnn >= hurdle;
  const triOk = pl.irrAnn >= hurdle * 0.9;
  const roeGood = pl.roeEff >= r.atroe;
  const roeOk = pl.roeEff >= r.atroe * 0.9;
  const vanGood = pl.vanEquity >= 0;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4.5">
        <KpiTop label="TRI Equity (IRR)" val={`${fmt(pl.irrAnn * 100, 2)} %`} sub={`après IBS · vs seuil ${fmt(hurdle * 100, 1)}%`} color="var(--color-cyan)" />
        <KpiTop label="ROE Effectif" val={`${fmt(pl.roeEff * 100, 2)} %`} sub={`après IBS · vs cible ${fmt(r.atroe * 100, 1)}%`} main />
        <KpiTop label="VAN Equity (NPV)" val={fDZA(pl.vanEquity)} sub={`Au taux cible ${fmt(r.atroe * 100, 1)}%`} color={vanGood ? "var(--color-green)" : "var(--color-red)"} />
        <KpiTop label="PNB Brut Contrat" val={fDZA(pl.pnbBrut)} sub="Ijarah + SMR + ajustements" color="var(--color-green)" />
        <KpiTop label="Marge Fi. Nette" val={fDZA(pl.mfn)} sub="PNB - charges directes" color="var(--color-orange)" />
        <KpiTop label="Spread Net" val={`${fmt(pl.spread * 100, 2)} %`} sub="Taux locatif - Coût dette" color="var(--color-blue)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 mb-4.5">
        <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-cyan)]">
            <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-cyan-d)]">📊</div>
            <div>
              <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Compte de Résultat Contrat (Durée Totale)</div>
              <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.7px] mt-0.5">Produits · Charges · Marge Financière Nette</div>
            </div>
          </div>
          <div className="p-0">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="bg-black/20 text-[var(--color-txt3)] text-[9px] uppercase tracking-[1px] font-bold"><td colSpan={2} className="px-3.5 py-1.5">PRODUITS (Revenus Bancaires)</td></tr>
                <Tr label="Revenu Ijarah (marge de location)" val={pl.sumRevIj} valColor="var(--color-green)" />
                <Tr label="Marge sur SMR Mécanique (markup)" val={pl.smrMkupTot} valColor="var(--color-green)" />
                <Tr label="Ajustement de loyer (remise / majoration)" val={pl.laTotal} valColor={pl.laTotal < 0 ? "var(--color-red)" : "var(--color-green)"} />
                <Tr label="LGD & frais de gestion refacturés au client" val={pl.passTotal} valColor="var(--color-green)" />
                {pl.fraisDossier > 0 && <Tr label="Frais de dossier (à la signature)" val={pl.fraisDossier} valColor="var(--color-green)" />}
                <tr className="bg-[rgba(201,168,76,.04)] border-t-2 border-[var(--color-border-main)] font-bold"><td className="px-3.5 py-1.5 text-[12px] text-[var(--color-txt)]">= PNB Brut</td><td className="px-3.5 py-1.5 text-[13px] text-right text-[var(--color-gold-l)] font-jetbrains">{fDZA(pl.pnbBrut)}</td></tr>
                
                <tr className="bg-black/20 text-[var(--color-txt3)] text-[9px] uppercase tracking-[1px] font-bold"><td colSpan={2} className="px-3.5 py-1.5 border-t border-[var(--color-border-light)]">CHARGES DIRECTES</td></tr>
                <Tr label="Coût de Refinancement (dette)" val={pl.sumDebtCost} valColor="var(--color-red)" />
                <Tr label="Provisions LGD (risque client)" val={pl.sumLGD} valColor="var(--color-red)" />
                <Tr label="Provision Risque VR (réalisation cession)" val={pl.vrCharge} valColor="var(--color-red)" />
                <Tr label="Frais de Gestion Bancaire" val={pl.sumAdmin} valColor="var(--color-red)" />
                <tr className="bg-[rgba(201,168,76,.04)] border-t-2 border-[var(--color-border-main)] font-bold"><td className="px-3.5 py-1.5 text-[12px] text-[var(--color-txt)]">= Total Charges Directes</td><td className="px-3.5 py-1.5 text-[13px] text-right text-[var(--color-gold-l)] font-jetbrains">{fDZA(pl.chargesTotal)}</td></tr>
                
                <tr className={cn("bg-[#27ae7a0d] border-t-2 border-[#27ae7a33]", pl.mfn < 0 && "border-t-[#c0392b4d] bg-[#c0392b0d]")}><td className="px-3.5 py-1.5 font-bold text-[12px] text-[var(--color-green)]" style={pl.mfn < 0 ? { color: 'var(--color-red)' } : {}}>✦ MARGE FINANCIÈRE NETTE</td><td className="px-3.5 py-1.5 font-jetbrains font-bold text-[14px] text-right text-[var(--color-green)]" style={pl.mfn < 0 ? { color: 'var(--color-red)' } : {}}>{fDZA(pl.mfn)}</td></tr>
                <Tr label={`IBS (${fmt(r.ibs * 100, 0)}%)`} val={-pl.ibsAmount} valColor="var(--color-red)" />
                <tr className="bg-[rgba(201,168,76,.04)] border-t-2 border-[var(--color-border-main)] font-bold"><td className="px-3.5 py-1.5 text-[12px] text-[var(--color-txt)]">= Résultat net après IBS</td><td className="px-3.5 py-1.5 text-[13px] text-right font-jetbrains" style={{ color: pl.resultatNet < 0 ? 'var(--color-red)' : 'var(--color-green)' }}>{fDZA(pl.resultatNet)}</td></tr>
                
                <tr className="bg-black/20 text-[var(--color-txt3)] text-[9px] uppercase tracking-[1px] font-bold"><td colSpan={2} className="px-3.5 py-1.5 border-t border-[var(--color-border-light)]">MÉMO — FLUX HORS P&L</td></tr>
                <Tr label="Apport initial reçu" val={r.apport} valColor="var(--color-txt2)" />
                <Tr label="Hamish Jiddiyyah reçu (à restituer)" val={r.depot} valColor="var(--color-txt2)" />
                <Tr label="Hamish Jiddiyyah restitué fin contrat" val={r.depot} valColor="var(--color-red)" />
                <Tr label="VR Nette encaissée (cession véhicule)" val={r.vrNette} valColor="var(--color-txt2)" />
                <Tr label="VR TTC cession (avec TVA)" val={r.vrBruteTTC} valColor="var(--color-txt2)" />
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)]">
            <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-blue)]">
              <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-blue-d)]">🏗️</div>
              <div>
                <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Structure du Capital Financé</div>
                <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.7px] mt-0.5">Equity · Dette · Hamish Jiddiyyah</div>
              </div>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-2">
                <CapBlock label="Dette Participative" val={r.besoin * (1 - r.eqPct)} sub1={`${fmt((1 - r.eqPct) * 100, 1)}% du besoin`} sub2={`coût : ${fmt(r.costDebt * 100, 2)}%/an`} color="var(--color-blue)" />
                <CapBlock label="Fonds Propres (Equity)" val={r.besoin * r.eqPct} sub1={`${fmt(r.eqPct * 100, 1)}% du besoin`} sub2={`cible ROE : ${fmt(r.atroe * 100, 1)}%`} color="var(--color-gold)" valColor="var(--color-gold-l)" />
              </div>
              <div className="flex h-2 rounded-full overflow-hidden mt-2.5">
                <div className="bg-[var(--color-blue)] transition-[width] duration-400" style={{ width: `${(1 - r.eqPct) * 100}%` }}></div>
                <div className="bg-[var(--color-gold)] transition-[width] duration-400" style={{ width: `${r.eqPct * 100}%` }}></div>
              </div>
              <div className="flex justify-between text-[9px] text-[var(--color-txt3)] mt-1 font-jetbrains">
                <span>Dette {fmt((1 - r.eqPct) * 100, 1)}%</span>
                <span>Equity {fmt(r.eqPct * 100, 1)}%</span>
              </div>
              
              <div className="border border-[var(--color-border-light)] rounded-md p-2.5 mt-2.5 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[var(--color-cyan)]">
                <div className="text-[9px] uppercase tracking-[1px] text-[var(--color-txt3)] mb-2">🔒 Hamish Jiddiyyah (Collatéral isolé)</div>
                <div className="flex justify-between items-center">
                  <div className="font-jetbrains text-[14px] font-bold text-[var(--color-cyan)]">{fDZA(r.depot)}</div>
                  <div className="text-[9px] text-[var(--color-cyan)] font-jetbrains text-right">Ne réduit pas le<br/>capital financé ✓</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)]">
            <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-cyan)]">
              <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-cyan-d)]">📈</div>
              <div>
                <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Indicateurs de Rentabilité</div>
                <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.7px] mt-0.5">TRI Equity vs seuil · ROE après IBS · Spread · Marge nette</div>
              </div>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 gap-2">
                <RatioCard label="TRI Equity (IRR Annualisé)" val={`${fmt(pl.irrAnn * 100, 2)} %`} sub={`Après IBS · seuil : ${fmt(hurdle * 100, 2)}%`} valColor="var(--color-cyan)">
                  <TrafficLight label={triGood ? '✓ TRI > seuil' : triOk ? '⚠ TRI proche du seuil' : '✗ TRI < seuil'} status={triGood ? 'good' : triOk ? 'warn' : 'bad'} />
                </RatioCard>
                <RatioCard label="ROE Effectif Annualisé" val={`${fmt(pl.roeEff * 100, 2)} %`} sub={`Cible : ${fmt(r.atroe * 100, 1)}%/an`} valColor="var(--color-gold-l)">
                  <TrafficLight label={roeGood ? '✓ Objectif atteint' : roeOk ? '⚠ Proche objectif' : '✗ Sous objectif'} status={roeGood ? 'good' : roeOk ? 'warn' : 'bad'} />
                </RatioCard>
                <RatioCard label="Spread Taux locatif / Coût Dette" val={`${fmt(pl.spread * 100, 2)} %`} sub="Taux locatif - r_dette" valColor="var(--color-green)" />
                <RatioCard label="VAN Equity (NPV Hurdle)" val={fDZA(pl.vanEquity)} sub={`Au taux cible ${fmt(r.atroe * 100, 1)}%`} valColor={vanGood ? "var(--color-green)" : "var(--color-red)"}>
                  <TrafficLight label={vanGood ? '✓ VAN > 0 (Valeur créée)' : '✗ VAN < 0 (Déficit)'} status={vanGood ? 'good' : 'bad'} />
                </RatioCard>
                <RatioCard label="Taux MFN / Encours" val={`${fmt(pl.mfnRate * 100, 2)} %`} sub="% annuel sur capital moyen" valColor="var(--color-orange)" />
              </div>
              <div className="mt-3 bg-[var(--color-bg2)] rounded-md p-2.5 px-3 text-[10px] text-[var(--color-txt3)] leading-[1.5]">
                <div className="font-bold text-[var(--color-txt2)] mb-1">ℹ️ Méthode d'analyse financière & rentabilité</div>
                • <strong>TRI Equity (IRR) :</strong> Calculé sur les flux nets après IBS pour les fonds propres (marge Ijarah, markup SMR, ajustements commerciaux et montants refacturés, déduction faite des coûts de ressources, LGD, frais de gestion et risque VR), comparé au benchmark externe.<br/>
                • <strong>ROE :</strong> Résultat net annuel après IBS rapporté aux fonds propres moyens immobilisés sur la durée du contrat.<br/>
                • <strong>VAN Equity (NPV) :</strong> Actualisation des flux au taux hurdle cible des fonds propres ({fmt(r.atroe * 100, 1)}%). Une VAN positive certifie la surperformance économique.<br/>
                • <strong>Tableau d'amortissement :</strong> Amortissement financier du capital strictement réconcilié avec la Valeur Résiduelle nette d'échéance et loyers contractuels lissés.
              </div>
            </div>
          </div>
        </div>
      </div>
      <ResiliationPanel />
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

function Tr({ label, val, valColor }: { label: string, val: number, valColor: string }) {
  return (
    <tr>
      <td className="px-3.5 py-1.5 border-b border-[var(--color-border-light)] text-[11px] text-[var(--color-txt2)]">{label}</td>
      <td className="px-3.5 py-1.5 border-b border-[var(--color-border-light)] text-[11.5px] text-right font-jetbrains font-semibold" style={{ color: valColor }}>{fDZA(val)}</td>
    </tr>
  );
}

function CapBlock({ label, val, sub1, sub2, color, valColor }: any) {
  return (
    <div className="border border-[var(--color-border-light)] rounded-md p-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: color }}></div>
      <div className="text-[9px] uppercase tracking-[1px] text-[var(--color-txt3)] mb-2">{label}</div>
      <div className="font-jetbrains text-[14px] font-bold text-[var(--color-txt)]" style={{ color: valColor }}>{fDZA(val)}</div>
      <div className="text-[9px] text-[var(--color-txt3)] mt-1 font-jetbrains">{sub1}</div>
      <div className="text-[9px] text-[var(--color-txt3)] font-jetbrains">{sub2}</div>
    </div>
  );
}

function RatioCard({ label, val, sub, valColor, children }: any) {
  return (
    <div className="bg-[var(--color-bg2)] border border-[var(--color-border-light)] rounded-lg p-3 text-center flex flex-col items-center">
      <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.9px]">{label}</div>
      <div className="font-jetbrains text-[18px] font-bold my-1" style={{ color: valColor }}>{val}</div>
      <div className="text-[9px] text-[var(--color-txt3)] font-jetbrains">{sub}</div>
      {children}
    </div>
  );
}

function TrafficLight({ label, status }: { label: string, status: 'good' | 'warn' | 'bad' }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 text-[9px] mt-1 px-2 py-0.5 rounded-full font-bold tracking-[0.5px]",
      status === 'good' && "bg-[#27ae7a1a] text-[var(--color-green)] border border-[#27ae7a33]",
      status === 'warn' && "bg-[#d4882a1a] text-[var(--color-orange)] border border-[#d4882a33]",
      status === 'bad' && "bg-[#c0392b24] text-[#e57373] border border-[#c0392b33]"
    )}>
      {label}
    </div>
  );
}

function ResiliationPanel() {
  const { engineResult: r } = useStateContext();
  const rows = resiliationTable(r);
  if (!rows.length) return null;
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)] mt-4.5">
      <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-red)]">
        <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-red-d)]">🚪</div>
        <div>
          <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Résiliation anticipée — barème des conditions générales</div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.7px] mt-0.5">Avant le 13e mois : 6 loyers TTC · ensuite LT × 0,32 × mois restants / (durée − 4)</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px] min-w-[560px]">
          <thead>
            <tr className="bg-black/20 text-[var(--color-txt3)] text-[9px] uppercase tracking-[1px]">
              <th className="px-3 py-1.5 text-left">Sortie au mois</th>
              <th className="px-3 py-1.5 text-right">Indemnité client</th>
              <th className="px-3 py-1.5 text-right">Capital restant</th>
              <th className="px-3 py-1.5 text-right">Revente estimée</th>
              <th className="px-3 py-1.5 text-right">Position banque</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(x => (
              <tr key={x.m} className="border-t border-[var(--color-border-light)]">
                <td className="px-3 py-1.5 text-[var(--color-txt2)]">{x.m} <span className="text-[var(--color-txt3)]">({x.da} restants)</span></td>
                <td className="px-3 py-1.5 text-right font-jetbrains">{fDZA(x.indemnite)}</td>
                <td className="px-3 py-1.5 text-right font-jetbrains">{fDZA(x.capitalRestant)}</td>
                <td className="px-3 py-1.5 text-right font-jetbrains">{fDZA(x.valeurRevente)}</td>
                <td className="px-3 py-1.5 text-right font-jetbrains font-bold" style={{ color: x.position < 0 ? 'var(--color-red)' : 'var(--color-green)' }}>{fDZA(x.position)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[9.5px] text-[var(--color-txt3)] px-3.5 py-2 border-t border-[var(--color-border-light)]">
        Position banque = indemnité + revente estimée − capital restant. La revente est estimée en ligne droite entre le prix d'achat et la VR : la décote réelle est plus forte les premières années, la position est donc optimiste au début.
      </div>
    </div>
  );
}
