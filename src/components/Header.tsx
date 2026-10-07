import React from 'react';
import { useStateContext } from '../Store';
import { DEFAULTS } from '../lib/types';
import { buildOfferHTML } from '../lib/pdfExport';
import * as XLSX from 'xlsx';

export function Header() {
  const { dispatch, isCorporate, setIsCorporate, engineResult, pnlResult, params } = useStateContext();

  const handleReset = () => {
    if (confirm('Remettre tous les paramètres aux valeurs par défaut ?')) {
      dispatch({ type: 'RESET' });
    }
  };

  const handleExportPDF = () => {
    const html = buildOfferHTML(engineResult, params);
    const printWin = window.open('', '_blank', 'width=900,height=750');
    if (!printWin) { alert('Veuillez autoriser les fenêtres popup pour générer le PDF.'); return; }
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
    printWin.onload = function() {
      setTimeout(function() {
        printWin.focus();
        printWin.print();
      }, 400);
    };
    setTimeout(function() {
      try { printWin.focus(); printWin.print(); } catch (e) { }
    }, 1200);
  };

  const handleExportExcel = () => {
    const inputs = [
      ['Paramètre', 'Valeur'],
      ['Profil pricing', params.v11_profile],
      ['Scénario', params.v11_scenario],
      ['Prix acquisition HT', engineResult.achat],
      ['Durée (mois)', engineResult.duree],
      ['Km total', engineResult.kmTotal],
      ['Apport', engineResult.apport],
      ['Hamish Jiddiyyah', engineResult.depot],
      ['VR nette HT', engineResult.vrNette],
      ['WACC annuel', engineResult.waccAnn],
      ['Taux locatif annuel', engineResult.rateLocAnn],
      ['Loyer HT/mois', engineResult.loyerHT],
      ['TVA/mois', engineResult.tvaFi],
      ['Loyer TTC/mois', engineResult.loyerTTC],
      ['PRK HT', engineResult.prk],
      ['Km supplémentaire', engineResult.kmSup],
      ['TRI Equity', pnlResult.irrAnn],
      ['ROE effectif', pnlResult.roeEff],
      ['Marge financière nette', pnlResult.mfn],
      ['Résultat net après IBS', pnlResult.resultatNet]
    ];
    
    const amort = [['Mois', 'Capital début', 'Revenu Ijarah', 'Amortissement', 'LGD', 'Capital fin', 'SMR', 'Pneus', 'Mobilité', 'Remplacement', 'Markup SMR', 'Takaful', 'Vignette', 'Adj.', 'HT', 'TVA', 'TTC'],
      ...engineResult.rows.map(x => [x.m, x.capDeb, x.revM, x.amortM, x.lgdM, x.capFin, x.smrM, x.pneuM, x.mobM, x.vehM, x.mkupM, x.takHT, x.vigM, x.adj, x.htM, x.tvaM, x.ttcM])
    ];

    const pnl = [['P&L', 'Montant'],
      ['Revenu Ijarah', pnlResult.sumRevIj],
      ['Markup SMR', pnlResult.smrMkupTot],
      ['Ajustement de loyer', pnlResult.laTotal],
      ['LGD & frais refacturés', pnlResult.passTotal],
      ['PNB brut', pnlResult.pnbBrut],
      ['Coût dette', pnlResult.sumDebtCost],
      ['LGD', pnlResult.sumLGD],
      ['Risque VR', pnlResult.vrCharge],
      ['Frais admin', pnlResult.sumAdmin],
      ['Charges directes', pnlResult.chargesTotal],
      ['MFN', pnlResult.mfn],
      ['IBS', pnlResult.ibsAmount],
      ['Résultat net', pnlResult.resultatNet]
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(inputs), 'Synthèse');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(pnl), 'P&L');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(amort), 'Amortissement');
    XLSX.writeFile(wb, 'LLD_Ijarah_v11_' + (params.clientRef || 'simulation') + '.xlsx');
  };

  return (
    <div className="flex justify-between items-center flex-wrap gap-2.5 p-4 md:px-6 mb-3.5 rounded-xl bg-gradient-to-br from-[#0d1e38] to-[#091525] border border-[var(--color-border-main)] shadow-lg">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-cormorant text-xl font-bold text-[#080f1a] bg-gradient-to-br from-[var(--color-gold)] to-[#9a6c1a]">
          ﺍ
        </div>
        <div>
          <div className="font-cormorant text-[21px] font-bold text-[var(--color-gold-l)] leading-tight">
            Simulateur Ijarah — Location Longue Durée
          </div>
          <div className="text-[10px] text-[var(--color-txt3)] tracking-[1.2px] uppercase mt-0.5">
            Al Salam Bank · Moteur Participatif v11 · Pricing · FTP · P&L · IRR · Contrôles
          </div>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        <span className="font-jetbrains text-[9px] font-bold tracking-[0.8px] uppercase px-2.5 py-1 rounded-full bg-[var(--color-green-d)] text-[var(--color-green)] border border-[#27ae7a38]">
          ☽ Ijarah Conforme
        </span>
        <span className="font-jetbrains text-[9px] font-bold tracking-[0.8px] uppercase px-2.5 py-1 rounded-full bg-[var(--color-gold-d)] text-[var(--color-gold)] border border-[var(--color-border-main)]">
          PMT Exact · LGD Décroissant
        </span>
        <span className="font-jetbrains text-[9px] font-bold tracking-[0.8px] uppercase px-2.5 py-1 rounded-full bg-[var(--color-blue-d)] text-[#5fa0e0] border border-[#2d6fbd38]">
          HJ Isolé · VR TTC
        </span>
        <span className="font-jetbrains text-[9px] font-bold tracking-[0.8px] uppercase px-2.5 py-1 rounded-full bg-[var(--color-cyan-d)] text-[var(--color-cyan)] border border-[#17a8c840]">
          📊 Pricing Pro · Risque · v11
        </span>
        
        <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-[var(--color-txt2)] ml-2.5">
          <input 
            type="checkbox" 
            checked={isCorporate}
            onChange={(e) => setIsCorporate(e.target.checked)}
            className="rounded border-[var(--color-border-main)] bg-[var(--color-bg2)]" 
          />
          <span>Corporate</span>
        </label>
        
        <button onClick={handleReset} className="border border-[#c0392b4d] bg-[#c0392b26] text-[#e57373] px-4 py-2 rounded-md font-bold text-[11px] cursor-pointer flex items-center gap-1.5 transition-opacity hover:opacity-85">
          ↺ Reset
        </button>
        <button onClick={handleExportExcel} className="border-none bg-[var(--color-blue)] text-white px-4 py-2 rounded-md font-bold text-[11px] cursor-pointer flex items-center gap-1.5 transition-opacity hover:opacity-85">
          📊 Excel
        </button>
        <button onClick={handleExportPDF} className="border-none bg-[var(--color-gold)] text-[#0d1e38] px-4 py-2 rounded-md font-bold text-[11px] cursor-pointer flex items-center gap-1.5 transition-opacity hover:opacity-85">
          📄 Exporter PDF
        </button>
      </div>
    </div>
  );
}
