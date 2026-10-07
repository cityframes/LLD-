import React, { useState } from 'react';
import { useStateContext } from '../Store';
import { fDZA, fmt } from '../lib/utils';
import { cn } from '../lib/utils';

export function AmortizationTab() {
  const { engineResult: r } = useStateContext();
  const [filter, setFilter] = useState<'all' | 'smr' | 'q'>('all');

  let data = r.rows;
  if (filter === 'smr') data = r.rows.filter(x => x.smrEv || x.pneuEv);
  if (filter === 'q') data = r.rows.filter(x => x.m % 3 === 0);

  const tot = (k: keyof typeof r.rows[0]) => r.rows.reduce((a, x) => a + Number(x[k]), 0);

  return (
    <div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4.5">
        <KpiTop label="Total Revenu Ijarah" val={fDZA(tot('revM'))} sub="Marge totale contrat" color="var(--color-blue)" />
        <KpiTop label="Total Amortissement" val={fDZA(tot('amortM'))} sub="Capital récupéré" color="var(--color-teal)" />
        <KpiTop label="Total Entretien" val={fDZA(tot('smrM') + tot('pneuM') + tot('mobM') + tot('vehM') + tot('mkupM'))} sub="SMR + pneus + mob. + rempl." color="var(--color-orange)" />
        <KpiTop label="Total Takaful" val={fDZA(tot('takHT') + tot('vigM'))} sub="Assurance (HT) + vignette" color="var(--color-green)" />
        <KpiTop label="Coût Total TTC" val={fDZA(tot('ttcM'))} sub="Flux total contrat" main />
      </div>

      <div className="bg-[var(--color-card)] border border-[var(--color-border-main)] rounded-[10px] overflow-hidden shadow-[0_6px_28px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-3 px-4 border-b border-[var(--color-border-main)] bg-gradient-to-br from-[#13253f] to-[#0d1e35] gap-2">
          <div>
            <div className="font-cormorant text-[16px] font-semibold text-[var(--color-gold-l)]">Tableau d'Amortissement Ijarah — Mois par Mois</div>
            <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[1px] mt-0.5">Encours · Ijarah · LGD · SMR · Mob. · Takaful · Lease Adj. · Loyer TTC</div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>Tous</FilterBtn>
            <FilterBtn active={filter === 'smr'} onClick={() => setFilter('smr')}>🔧 Événements SMR</FilterBtn>
            <FilterBtn active={filter === 'q'} onClick={() => setFilter('q')}>Vue Trimestrielle</FilterBtn>
          </div>
        </div>
        
        <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full border-collapse text-[11px]">
            <thead className="sticky top-0 z-10 bg-[#0d1e38]">
              <tr>
                <th rowSpan={2} className="px-2.5 py-2 border-b-2 border-[var(--color-border-main)] text-center text-[var(--color-txt3)] font-jetbrains text-[8.5px] uppercase tracking-[0.8px]">Mois</th>
                <th colSpan={5} className="px-2.5 py-2 text-right font-jetbrains text-[8.5px] uppercase tracking-[0.8px] text-[#5fa0e0]">🏦 Ijarah — Capital Financier</th>
                <th colSpan={5} className="px-2.5 py-2 text-right font-jetbrains text-[8.5px] uppercase tracking-[0.8px] text-[var(--color-orange)]">🔧 Services & Entretien</th>
                <th colSpan={2} className="px-2.5 py-2 text-right font-jetbrains text-[8.5px] uppercase tracking-[0.8px] text-[var(--color-green)]">🛡️ Takaful</th>
                <th className="px-2.5 py-2 text-right font-jetbrains text-[8.5px] uppercase tracking-[0.8px] text-[#c084e8]">📐 Adj.</th>
                <th colSpan={3} className="px-2.5 py-2 border-b-2 border-[var(--color-border-main)] text-right font-jetbrains text-[8.5px] uppercase tracking-[0.8px] text-[var(--color-gold)]">Loyer Total</th>
              </tr>
              <tr>
                <Th color="#5fa0e0">Cap. Début</Th><Th color="#5fa0e0">Rev. Ijarah</Th><Th color="#5fa0e0">Amort.</Th>
                <Th color="#c084e8">LGD</Th><Th color="#5fa0e0" border>Cap. Fin</Th>
                <Th color="var(--color-orange)">Entretien</Th><Th color="var(--color-orange)">Pneus</Th><Th color="var(--color-orange)">Serv. Mens.</Th><Th color="var(--color-orange)">V.Rempl.</Th><Th color="var(--color-orange)" border>Markup</Th>
                <Th color="var(--color-green)">Takaful HT</Th><Th color="var(--color-green)" border>Vignette</Th>
                <Th color="#c084e8" border>Lease Adj.</Th>
                <Th color="var(--color-gold)">HT</Th><Th color="var(--color-gold)">TVA</Th><Th color="var(--color-gold)" border>TTC</Th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className={cn("hover:bg-[rgba(255,255,255,.018)]", row.smrEv && "bg-[rgba(212,136,42,.06)]")}>
                  <td className="px-2.5 py-1.5 border-b border-[rgba(180,150,80,.04)] text-center font-bold text-[var(--color-txt3)]">{row.smrEv ? '🔧 ' : row.pneuEv ? '🔄 ' : ''}{row.m}</td>
                  <Td val={row.capDeb} bold />
                  <Td val={row.revM} color="#5fa0e0" />
                  <Td val={row.amortM} color="#7ec8e8" />
                  <Td val={row.lgdM} color="#c084e8" size="10px" dec={0} />
                  <Td val={row.capFin} bold />
                  
                  <Td val={row.smrM} color="var(--color-orange)" />
                  <Td val={row.pneuM} color="var(--color-orange)" />
                  <Td val={row.mobM} color="var(--color-cyan)" />
                  <Td val={row.vehM} color="var(--color-orange)" />
                  <Td val={row.mkupM} color="var(--color-orange)" />
                  
                  <Td val={row.takHT} color="var(--color-green)" />
                  <Td val={row.vigM} color="var(--color-green)" />
                  
                  <Td val={row.adj} color={row.adj < 0 ? 'var(--color-green)' : '#c084e8'} />
                  
                  <Td val={row.htM} color="var(--color-txt)" />
                  <Td val={row.tvaM} color="var(--color-txt3)" />
                  <Td val={row.ttcM} color="var(--color-gold-l)" bold />
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 bg-[#0d1e38] font-bold text-[10.5px]">
              <tr>
                <td className="px-2.5 py-2 border-t-2 border-[var(--color-border-main)] text-center text-[var(--color-gold)] text-[10px] tracking-[1px] uppercase">TOTAUX</td>
                <td className="px-2.5 py-2 border-t-2 border-[var(--color-border-main)] text-right font-jetbrains">—</td>
                <Tf val={tot('revM')} color="#5fa0e0" />
                <Tf val={tot('amortM')} color="#5fa0e0" />
                <Tf val={tot('lgdM')} color="#c084e8" />
                <td className="px-2.5 py-2 border-t-2 border-[var(--color-border-main)] text-right font-jetbrains">—</td>
                
                <Tf val={tot('smrM')} color="var(--color-orange)" />
                <Tf val={tot('pneuM')} color="var(--color-orange)" />
                <Tf val={tot('mobM')} color="var(--color-cyan)" />
                <Tf val={tot('vehM')} color="var(--color-orange)" />
                <Tf val={tot('mkupM')} color="var(--color-orange)" />
                
                <Tf val={tot('takHT')} color="var(--color-green)" />
                <Tf val={tot('vigM')} color="var(--color-green)" />
                
                <Tf val={tot('adj')} color="#c084e8" />
                
                <Tf val={tot('htM')} color="#5fa0e0" />
                <Tf val={tot('tvaM')} color="var(--color-green)" />
                <Tf val={tot('ttcM')} color="var(--color-gold-l)" size="12px" />
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="flex flex-wrap gap-3.5 p-2.5 px-4 border-t border-[var(--color-border-light)] text-[9px] text-[var(--color-txt3)]">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-[2px] shrink-0 bg-[rgba(212,136,42,.5)]"></div>Événement entretien mécanique</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-[2px] shrink-0 bg-[rgba(88,150,240,.4)]"></div>Changement de pneus</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-[2px] shrink-0 bg-[rgba(23,168,200,.4)]"></div>Services Fixes (Mobilité, Assistance, Gestion)</span>
          <span className="flex items-center gap-1.5 text-[#c084e8]">● LGD = capital restant dû × taux LGD / 12 (décroissant)</span>
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

function FilterBtn({ active, onClick, children }: any) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "font-jetbrains text-[9px] font-bold tracking-[0.8px] uppercase px-2.5 py-1 rounded-[4px] border border-[var(--color-border-light)] bg-transparent text-[var(--color-txt3)] cursor-pointer transition-all duration-200 hover:text-[var(--color-txt2)] hover:border-[var(--color-border-main)]",
        active && "bg-[var(--color-gold-d)] text-[var(--color-gold)] border-[var(--color-border-main)]"
      )}
    >
      {children}
    </button>
  );
}

function Th({ color, border, children }: any) {
  return <th className={cn("px-2.5 py-2 text-right font-jetbrains text-[8.5px] uppercase tracking-[0.8px] border-b-2 border-[var(--color-border-main)]", border && "border-r border-[rgba(180,150,80,.1)]")} style={{ color }}>{children}</th>;
}

function Td({ val, color, bold, size = '10.5px', dec = 0 }: any) {
  return <td className="px-2.5 py-1.5 border-b border-[rgba(180,150,80,.04)] text-right font-jetbrains" style={{ color: color || 'var(--color-txt2)', fontWeight: bold ? 700 : 400, fontSize: size }}>{fmt(val, dec)}</td>;
}

function Tf({ val, color, size }: any) {
  return <td className="px-2.5 py-2 border-t-2 border-[var(--color-border-main)] text-right font-jetbrains" style={{ color, fontSize: size }}>{fmt(val)}</td>;
}
