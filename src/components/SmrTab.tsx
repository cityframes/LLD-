import React, { useState } from 'react';
import { useStateContext } from '../Store';
import { fDZA, fmt } from '../lib/utils';
import { cn } from '../lib/utils';
import { 
  SMR_OPERATIONS_CATALOG, 
  DEFAULT_LABOR_RATES, 
  FuelType, 
  isOpCompatible, 
  getEffectiveInterval 
} from '../lib/smrCatalog';

export function SmrTab() {
  const { params, dispatch, engineResult } = useStateContext();
  const [subView, setSubView] = useState<'chronology' | 'annual' | 'catalog'>('chronology');
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);

  const smrPlan = engineResult.smrPlan;

  const handleUpdate = (key: any, value: any) => {
    dispatch({ type: 'SET_PARAM', payload: { key, value } });
  };

  const handleCustomPrice = (opId: string, price: number) => {
    const updated = { ...(params.smr_custom_prices || {}), [opId]: price };
    dispatch({ type: 'SET_PARAM', payload: { key: 'smr_custom_prices', value: updated } });
  };

  const handleCustomHours = (opId: string, hours: number) => {
    const updated = { ...(params.smr_custom_hours || {}), [opId]: hours };
    dispatch({ type: 'SET_PARAM', payload: { key: 'smr_custom_hours', value: updated } });
  };

  const handleResetCatalog = () => {
    dispatch({ type: 'SET_PARAM', payload: { key: 'smr_custom_prices', value: {} } });
    dispatch({ type: 'SET_PARAM', payload: { key: 'smr_custom_hours', value: {} } });
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP SUMMARY CARDS (KPIS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <KpiCard 
          label="Budget SMR Total HT" 
          val={fDZA(smrPlan.budgetTotalHT)} 
          sub={`dont aléas: ${fDZA(smrPlan.provisionAleasAmountHT)}`}
          color="var(--color-orange)"
          main
        />
        <KpiCard 
          label="Mensualité LLD SMR" 
          val={fDZA(smrPlan.monthlySmoothedHT)} 
          sub={`TTC: ${fDZA(smrPlan.monthlySmoothedTTC)} /mois`}
          color="var(--color-gold)"
        />
        <KpiCard 
          label="Coût Moyen / An" 
          val={fDZA(smrPlan.avgAnnualCostHT)} 
          sub={`Sur ${smrPlan.dureeAnnees.toFixed(1)} an(s)`}
          color="#5fa0e0"
        />
        <KpiCard 
          label="Coût d'Entretien / KM" 
          val={`${smrPlan.costPerKmHT.toFixed(2)} DA`} 
          sub={`sur ${fmt(smrPlan.totalKm)} km`}
          color="var(--color-cyan)"
        />
        <KpiCard 
          label="Heures Atelier MO" 
          val={`${smrPlan.totalHours.toFixed(1)} h`} 
          sub={`Taux moy. ~1 420 DA/h`}
          color="#c084e8"
        />
        <KpiCard 
          label="Paliers 10 000 KM" 
          val={`${smrPlan.milestones.length} révisions`} 
          sub={`Tous les 10 000 km`}
          color="var(--color-green)"
        />
      </div>

      {/* 2. CONFIGURATION ATELIER & CONVENTION */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border-main)] rounded-[10px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 mb-3 border-b border-[var(--color-border-light)]">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">🔧</span>
            <div>
              <h2 className="text-[13px] font-bold text-[var(--color-gold-l)] uppercase tracking-[1px]">
                Paramètres du Plan d'Entretien Programmé (Barème TALHA AUTO / Stellantis)
              </h2>
              <p className="text-[9.5px] text-[var(--color-txt3)]">
                Intervalles de révision calibrés tous les 10 000 km selon les préconisations constructeur en Algérie.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--color-txt3)] font-jetbrains">
              Contrat : <strong className="text-[var(--color-txt)]">{params.p_duree} mois</strong> / <strong className="text-[var(--color-txt)]">{fmt(params.p_km)} km</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Motorisation */}
          <div>
            <label className="block text-[9.5px] font-bold uppercase tracking-[0.8px] text-[var(--color-txt3)] mb-1.5">
              Motorisation & Carburation
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[#0b1728] p-1 rounded-[6px] border border-[var(--color-border-light)]">
              <button
                type="button"
                onClick={() => handleUpdate('smr_engine_type', 'diesel')}
                className={cn(
                  "py-1 text-[10px] font-bold rounded-[4px] border-none cursor-pointer transition-all",
                  params.smr_engine_type === 'diesel'
                    ? "bg-[#183457] text-[#7ec8e8] shadow"
                    : "bg-transparent text-[var(--color-txt3)] hover:text-white"
                )}
              >
                🛢️ 1.6 Diesel
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('smr_engine_type', 'essence')}
                className={cn(
                  "py-1 text-[10px] font-bold rounded-[4px] border-none cursor-pointer transition-all",
                  params.smr_engine_type === 'essence'
                    ? "bg-[#183457] text-[var(--color-gold)] shadow"
                    : "bg-transparent text-[var(--color-txt3)] hover:text-white"
                )}
              >
                ⛽ Essence
              </button>
              <button
                type="button"
                onClick={() => handleUpdate('smr_engine_type', 'gpl')}
                className={cn(
                  "py-1 text-[10px] font-bold rounded-[4px] border-none cursor-pointer transition-all",
                  params.smr_engine_type === 'gpl'
                    ? "bg-[#183457] text-[var(--color-cyan)] shadow"
                    : "bg-transparent text-[var(--color-txt3)] hover:text-white"
                )}
              >
                ⚡ GPL Bicarb.
              </button>
            </div>
              {params.smr_engine_type === 'diesel' ? (
                <div className="text-[8.5px] text-[#7ec8e8] mt-1 leading-[1.3]">
                  <strong>🛢️ Entretien Diesel :</strong> Huile Low-SAPS FAP 5L (14 200 DA), filtre gazole HP (7 200 DA / 20k), purge décanteur, diag FAP/EGR, kit distribution renforcé (26 500 DA). Coût supérieur de +30 à +45% vs Essence.
                </div>
              ) : params.smr_engine_type === 'essence' ? (
                <div className="text-[8.5px] text-[var(--color-gold-l)] mt-1 leading-[1.3]">
                  <strong>⛽ Entretien Essence :</strong> Huile standard 5W40 3.2L (6 500 DA), filtre essence (2 200 DA), bougies allumage (3 200 DA), kit distribution (17 500 DA). Entretien plus économique.
                </div>
              ) : (
                <div className="text-[8.5px] text-[var(--color-cyan)] mt-1 leading-[1.3]">
                  <strong>⚡ Entretien GPL :</strong> Base thermique essence + révision étanchéité circuit gaz, filtres phase gazeuse/liquide, injecteurs GPL et réservoir décennal.
                </div>
              )}
          </div>

          {/* Conditions d'utilisation */}
          <div>
            <label className="block text-[9.5px] font-bold uppercase tracking-[0.8px] text-[var(--color-txt3)] mb-1.5">
              Conditions de Roulage
            </label>
            <div className="flex items-center justify-between p-1.5 px-2.5 bg-[#0b1728] rounded-[6px] border border-[var(--color-border-light)]">
              <div>
                <div className="text-[10.5px] font-bold text-[var(--color-txt)]">
                  {params.smr_severe ? 'Sévères (Poussière/Ville)' : 'Normales (Mixte)'}
                </div>
                <div className="text-[8px] text-[var(--color-txt3)]">
                  {params.smr_severe ? 'Filtres air 10k km, courroie resserrée' : 'Intervalles standards constructeur'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleUpdate('smr_severe', !params.smr_severe)}
                className={cn(
                  "relative w-9 h-5 rounded-full transition-colors cursor-pointer border-none",
                  params.smr_severe ? "bg-[var(--color-orange)]" : "bg-gray-600"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                  params.smr_severe && "translate-x-4"
                )} />
              </button>
            </div>
          </div>

          {/* Remise TALHA AUTO & Marge Banque */}
          <div>
            <label className="block text-[9.5px] font-bold uppercase tracking-[0.8px] text-[var(--color-txt3)] mb-1.5">
              Convention Concessionnaire & Marge
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-[#0b1728] p-1.5 rounded-[6px] border border-[var(--color-border-light)]">
                <span className="text-[8.5px] text-[var(--color-txt3)] block">Remise TALHA</span>
                <select
                  value={params.smr_remise ?? 5}
                  onChange={(e) => handleUpdate('smr_remise', Number(e.target.value))}
                  className="w-full bg-transparent border-none text-[11px] font-bold font-jetbrains text-[var(--color-green)] cursor-pointer focus:outline-none"
                >
                  <option value={0} className="bg-[#0b1728] text-white">0% (Aucune)</option>
                  <option value={5} className="bg-[#0b1728] text-white">5% (Convention)</option>
                  <option value={7} className="bg-[#0b1728] text-white">7% (&gt;1M DA/m)</option>
                  <option value={10} className="bg-[#0b1728] text-white">10% (Grand Cpte)</option>
                </select>
              </div>
              <div className="bg-[#0b1728] p-1.5 rounded-[6px] border border-[var(--color-border-light)]">
                <span className="text-[8.5px] text-[var(--color-txt3)] block">Marge SMR</span>
                <input
                  type="number"
                  value={params.p_smr_margin}
                  onChange={(e) => handleUpdate('p_smr_margin', Number(e.target.value))}
                  className="w-full bg-transparent border-none text-[11px] font-bold font-jetbrains text-[var(--color-gold)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Aléas & Grosses opérations */}
          <div>
            <label className="block text-[9.5px] font-bold uppercase tracking-[0.8px] text-[var(--color-txt3)] mb-1.5">
              Aléas / Imprévus & Grosses Opérations
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-[#0b1728] p-1.5 rounded-[6px] border border-[var(--color-border-light)]">
                <span className="text-[8.5px] text-[var(--color-txt3)] block">Provision Aléas</span>
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    value={params.smr_aleas ?? 10}
                    onChange={(e) => handleUpdate('smr_aleas', Number(e.target.value))}
                    className="w-12 bg-transparent border-none text-[11px] font-bold font-jetbrains text-[#c084e8] focus:outline-none"
                  />
                  <span className="text-[9px] text-[var(--color-txt3)]">%</span>
                </div>
              </div>
              <div 
                onClick={() => handleUpdate('smr_include_big', !params.smr_include_big)}
                className="bg-[#0b1728] p-1.5 rounded-[6px] border border-[var(--color-border-light)] cursor-pointer flex flex-col justify-between"
              >
                <span className="text-[8.5px] text-[var(--color-txt3)] block">Grosses Opér.</span>
                <span className={cn("text-[10px] font-bold font-jetbrains", params.smr_include_big ? "text-emerald-400" : "text-gray-400")}>
                  {params.smr_include_big ? '✓ Incluses' : '✗ Exclues'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION DES SOUS-VUES */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-light)] pb-1">
        <div className="flex gap-2">
          <SubTabBtn active={subView === 'chronology'} onClick={() => setSubView('chronology')}>
            🗓️ Calendrier des Paliers (Chaque 10 000 KM)
          </SubTabBtn>
          <SubTabBtn active={subView === 'annual'} onClick={() => setSubView('annual')}>
            📊 Lissage Annuel & Mensuel
          </SubTabBtn>
          <SubTabBtn active={subView === 'catalog'} onClick={() => setSubView('catalog')}>
            ⚙️ Barème Pièces & Main d'Œuvre ({SMR_OPERATIONS_CATALOG.length} opérations)
          </SubTabBtn>
        </div>
        {subView === 'catalog' && (
          <button
            onClick={handleResetCatalog}
            className="text-[9.5px] text-[var(--color-txt3)] hover:text-white bg-[#102238] border border-[var(--color-border-light)] px-2.5 py-1 rounded-[4px] cursor-pointer"
          >
            ↺ Réinitialiser aux barèmes constructeur
          </button>
        )}
      </div>

      {/* 4. VUE 1 : CALENDRIER CHRONOLOGIQUE PAR PALIER DE 10 000 KM */}
      {subView === 'chronology' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {smrPlan.milestones.map((ms, idx) => {
              const isSelected = selectedMilestone === ms.milestoneKm;
              return (
                <div
                  key={ms.milestoneKm}
                  onClick={() => setSelectedMilestone(isSelected ? null : ms.milestoneKm)}
                  className={cn(
                    "bg-[var(--color-card)] border rounded-[10px] p-3 transition-all cursor-pointer relative overflow-hidden",
                    isSelected 
                      ? "border-[var(--color-gold)] shadow-[0_0_15px_rgba(201,168,76,0.2)] bg-[#11243e]" 
                      : "border-[var(--color-border-light)] hover:border-[var(--color-border-main)]"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-jetbrains text-[13px] font-bold text-[var(--color-gold-l)]">
                          {fmt(ms.milestoneKm)} KM
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(95,160,224,0.15)] text-[#7ec8e8] font-jetbrains">
                          ~ Mois {ms.approxMonth} (An {ms.approxYear})
                        </span>
                      </div>
                      <div className="text-[9.5px] text-[var(--color-txt3)] mt-0.5">
                        {ms.items.length} opération{ms.items.length > 1 ? 's' : ''} au programme
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-jetbrains text-[12.5px] font-bold text-white">
                        {fmt(ms.totalInflatedHT)} DA
                      </div>
                      <div className="text-[8.5px] text-[var(--color-txt3)] font-jetbrains">
                        MO: {ms.totalHours.toFixed(1)}h ({fmt(ms.totalLaborHT)} DA)
                      </div>
                    </div>
                  </div>

                  {/* Liste des opérations incluses dans ce palier */}
                  <div className="space-y-1 mt-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                    {ms.items.map((it, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] text-[var(--color-txt2)]">
                        <div className="flex items-center gap-1 truncate pr-2">
                          <span className="text-[8px] text-[var(--color-gold)]">●</span>
                          <span className="truncate">{it.shortName}</span>
                          {it.isBig && <span className="text-[7.5px] px-1 rounded bg-amber-900/60 text-amber-300">Grosse op.</span>}
                          {it.isSevereTrigger && <span className="text-[7.5px] px-1 rounded bg-red-900/60 text-red-300">Sévère</span>}
                          {it.isGpl && <span className="text-[7.5px] px-1 rounded bg-cyan-900/60 text-cyan-300">GPL</span>}
                        </div>
                        <span className="font-jetbrains text-[9.5px] text-[var(--color-txt3)] whitespace-nowrap">
                          {fmt(it.totalCostHT)} DA
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Barre d'inflation */}
                  {params.p_inflation > 0 && ms.approxMonth > 12 && (
                    <div className="mt-2 text-[8.5px] text-[var(--color-txt3)] text-right font-jetbrains">
                      Coût brut: {fmt(ms.subTotalHT)} DA (+{((ms.inflationFactor - 1) * 100).toFixed(1)}% inflation)
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-[#0b1728] border border-[var(--color-border-light)] rounded-[8px] p-3 text-[10px] text-[var(--color-txt3)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--color-gold)]"></span> Révision standard 10 000 km
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Grosse opération (Distribution/GPL)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400"></span> Déclencheur conditions sévères
              </span>
            </div>
            <div className="font-jetbrains text-[var(--color-gold)]">
              Total Interventions Pièces + MO : {fmt(smrPlan.totalPlanInflatedHT)} DA HT
            </div>
          </div>
        </div>
      )}

      {/* 5. VUE 2 : LISSAGE ANNUEL & MENSUALISATION */}
      {subView === 'annual' && (
        <div className="bg-[var(--color-card)] border border-[var(--color-border-main)] rounded-[10px] overflow-hidden shadow">
          <div className="p-3 border-b border-[var(--color-border-light)] bg-gradient-to-r from-[#102238] to-[#0a1728]">
            <h3 className="text-[12px] font-bold text-[var(--color-gold-l)] uppercase tracking-[1px]">
              Répartition Annuelle des Coûts & Lissage Mensuel LLD
            </h3>
            <p className="text-[9.5px] text-[var(--color-txt3)]">
              Ventilation des passages atelier par année de contrat avec application de l'inflation progressive.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#0d1e38] text-[var(--color-txt3)] font-jetbrains text-[9px] uppercase tracking-[0.8px]">
                  <th className="px-3 py-2 text-left">Période</th>
                  <th className="px-3 py-2 text-right">Kilométrage Cumulé</th>
                  <th className="px-3 py-2 text-center">Interventions</th>
                  <th className="px-3 py-2 text-right">Heures MO</th>
                  <th className="px-3 py-2 text-right">Pièces HT</th>
                  <th className="px-3 py-2 text-right">Main d'Œuvre HT</th>
                  <th className="px-3 py-2 text-right text-[#7ec8e8]">Total Annuel Facturé</th>
                  <th className="px-3 py-2 text-right text-[var(--color-gold)]">Mensualité Équivalente</th>
                </tr>
              </thead>
              <tbody>
                {smrPlan.yearlySummaries.map((yr) => (
                  <tr key={yr.year} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-white/2">
                    <td className="px-3 py-2.5 font-bold text-[var(--color-txt)]">
                      Année {yr.year}
                    </td>
                    <td className="px-3 py-2.5 text-right font-jetbrains text-[var(--color-txt2)]">
                      {fmt(yr.kmEnd)} km
                    </td>
                    <td className="px-3 py-2.5 text-center font-jetbrains">
                      <span className="px-2 py-0.5 rounded-full bg-[#183457] text-[#7ec8e8] text-[9.5px]">
                        {yr.milestonesCount} palier{yr.milestonesCount > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-jetbrains text-[var(--color-txt3)]">
                      {yr.hours.toFixed(1)} h
                    </td>
                    <td className="px-3 py-2.5 text-right font-jetbrains text-[var(--color-txt2)]">
                      {fmt(yr.partsHT)} DA
                    </td>
                    <td className="px-3 py-2.5 text-right font-jetbrains text-[var(--color-txt2)]">
                      {fmt(yr.laborHT)} DA
                    </td>
                    <td className="px-3 py-2.5 text-right font-jetbrains font-bold text-[#7ec8e8]">
                      {fmt(yr.inflatedTotalHT)} DA
                    </td>
                    <td className="px-3 py-2.5 text-right font-jetbrains font-bold text-[var(--color-gold-l)]">
                      {fmt(yr.monthlyEquivalentHT)} DA /mois
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#0d1e38] font-bold font-jetbrains text-[10.5px]">
                <tr className="border-t-2 border-[var(--color-border-main)]">
                  <td className="px-3 py-2 text-[var(--color-gold)] uppercase tracking-[1px]">TOTAUX DU PLAN</td>
                  <td className="px-3 py-2 text-right">{fmt(smrPlan.totalKm)} km</td>
                  <td className="px-3 py-2 text-center">{smrPlan.milestones.length} paliers</td>
                  <td className="px-3 py-2 text-right">{smrPlan.totalHours.toFixed(1)} h</td>
                  <td className="px-3 py-2 text-right">{fmt(smrPlan.totalPartsRawHT)} DA</td>
                  <td className="px-3 py-2 text-right">{fmt(smrPlan.totalLaborRawHT)} DA</td>
                  <td className="px-3 py-2 text-right text-[#7ec8e8]">{fmt(smrPlan.totalPlanInflatedHT)} DA</td>
                  <td className="px-3 py-2 text-right text-[var(--color-gold-l)] text-[12px]">
                    {fmt(smrPlan.totalPlanInflatedHT / smrPlan.dureeAnnees / 12)} DA /mois
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Synthèse du budget final LLD */}
          <div className="p-3.5 bg-[#091524] border-t border-[var(--color-border-light)] grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px]">
            <div>
              <span className="text-[var(--color-txt3)] block">Total Plan Brut Concession :</span>
              <span className="font-jetbrains font-bold text-white text-[12px]">{fmt(smrPlan.totalPlanInflatedHT)} DA</span>
            </div>
            <div>
              <span className="text-[var(--color-txt3)] block">Remise TALHA AUTO ({params.smr_remise}%):</span>
              <span className="font-jetbrains font-bold text-emerald-400 text-[12px]">- {fmt(smrPlan.remiseAmountHT)} DA</span>
            </div>
            <div>
              <span className="text-[var(--color-txt3)] block">Marge Banque ({params.p_smr_margin}%):</span>
              <span className="font-jetbrains font-bold text-[var(--color-gold)] text-[12px]">+ {fmt(smrPlan.margeBanqueAmountHT)} DA</span>
            </div>
            <div>
              <span className="text-[var(--color-txt3)] block">Provision Aléas & Imprévus ({params.smr_aleas}%):</span>
              <span className="font-jetbrains font-bold text-[#c084e8] text-[12px]">+ {fmt(smrPlan.provisionAleasAmountHT)} DA</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. VUE 3 : BARÈME PIÈCES & MAIN D'ŒUVRE ÉDITABLE */}
      {subView === 'catalog' && (
        <div className="bg-[var(--color-card)] border border-[var(--color-border-main)] rounded-[10px] overflow-hidden shadow">
          <div className="p-3 border-b border-[var(--color-border-light)] bg-gradient-to-r from-[#102238] to-[#0a1728] flex items-center justify-between">
            <div>
              <h3 className="text-[12px] font-bold text-[var(--color-gold-l)] uppercase tracking-[1px]">
                Barème Des Opérations Constructeur & Taux Horaires Atelier
              </h3>
              <p className="text-[9.5px] text-[var(--color-txt3)]">
                Modifiez directement les prix pièces ou temps d'atelier pour ajuster les devis réels des fournisseurs.
              </p>
            </div>
            <div className="flex gap-2 text-[9px] font-jetbrains text-[var(--color-txt3)]">
              <span>Révision/Frein: <strong>{fmt(DEFAULT_LABOR_RATES.revision)} DA/h</strong></span>
              <span>•</span>
              <span>Diagnostic: <strong>{fmt(DEFAULT_LABOR_RATES.diagnostic)} DA/h</strong></span>
              <span>•</span>
              <span>Haute Technicité: <strong>{fmt(DEFAULT_LABOR_RATES.ht)} DA/h</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead className="sticky top-0 bg-[#0d1e38] z-10">
                <tr className="text-[var(--color-txt3)] font-jetbrains text-[9px] uppercase tracking-[0.8px]">
                  <th className="px-3 py-2 text-left">Opération d'Entretien</th>
                  <th className="px-2 py-2 text-center">Catégorie</th>
                  <th className="px-2 py-2 text-right">Taux MO (DA/h)</th>
                  <th className="px-2 py-2 text-right">Temps (h)</th>
                  <th className="px-2 py-2 text-right">Prix Pièce (DA)</th>
                  <th className="px-2 py-2 text-right">Coût Unitaire HT</th>
                  <th className="px-3 py-2 text-left">Périodicité Km / Ans</th>
                </tr>
              </thead>
              <tbody>
                {SMR_OPERATIONS_CATALOG.map((op) => {
                  const compatible = isOpCompatible(op, params.smr_engine_type || 'diesel');
                  const currentHours = params.smr_custom_hours?.[op.id] ?? op.hours;
                  const currentPrice = params.smr_custom_prices?.[op.id] ?? op.partPrice;
                  const rate = DEFAULT_LABOR_RATES[op.labor];
                  const totalOp = currentPrice + (rate * currentHours);
                  const interval = getEffectiveInterval(op, params.smr_severe);

                  return (
                    <tr 
                      key={op.id} 
                      className={cn(
                        "border-b border-[rgba(255,255,255,0.04)] hover:bg-white/2 transition-colors",
                        !compatible && "opacity-40 bg-black/20"
                      )}
                    >
                      <td className="px-3 py-2 font-medium text-[var(--color-txt)]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{op.name}</span>
                          {op.big && <span className="text-[8px] px-1 rounded bg-amber-900/60 text-amber-300">Grosse op.</span>}
                          {op.fuel === 'gpl' && <span className="text-[8px] px-1 rounded bg-cyan-900/60 text-cyan-300">GPL</span>}
                          {op.fuel === 'diesel' && <span className="text-[8px] px-1 rounded bg-blue-900/60 text-blue-300">Diesel</span>}
                          {op.fuel === 'essence' && <span className="text-[8px] px-1 rounded bg-amber-800/60 text-amber-200">Essence</span>}
                          {op.fuel === 'all' && <span className="text-[8px] px-1 rounded bg-slate-800 text-slate-300">Tous</span>}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#102238] text-[var(--color-txt3)] font-jetbrains uppercase">
                          {op.labor}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-right font-jetbrains text-[var(--color-txt3)]">
                        {fmt(rate)}
                      </td>
                      <td className="px-2 py-2 text-right">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={currentHours}
                          onChange={(e) => handleCustomHours(op.id, Number(e.target.value))}
                          className="w-14 bg-[#091524] border border-[var(--color-border-light)] rounded px-1.5 py-0.5 text-right font-jetbrains text-[11px] text-[var(--color-gold-l)] focus:border-[var(--color-gold)] focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2 text-right">
                        <input
                          type="number"
                          step="100"
                          min="0"
                          value={currentPrice}
                          onChange={(e) => handleCustomPrice(op.id, Number(e.target.value))}
                          className="w-20 bg-[#091524] border border-[var(--color-border-light)] rounded px-1.5 py-0.5 text-right font-jetbrains text-[11px] text-[var(--color-txt)] focus:border-[var(--color-gold)] focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2 text-right font-jetbrains font-bold text-white">
                        {fmt(totalOp)} DA
                      </td>
                      <td className="px-3 py-2 text-left font-jetbrains text-[10px] text-[var(--color-txt3)]">
                        {interval.km < 999999 ? `${fmt(interval.km)} km` : 'Sans lim. km'}
                        {interval.ans ? ` / ${interval.ans} an${interval.ans > 1 ? 's' : ''}` : ''}
                        {interval.isSevere && <span className="text-red-400 ml-1">(sévère)</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, val, sub, color, main }: any) {
  return (
    <div 
      className={cn(
        "bg-[var(--color-card)] border rounded-[10px] p-2.5 relative overflow-hidden flex flex-col justify-between",
        main ? "border-[var(--color-border-main)] bg-gradient-to-br from-[#193254] to-[#0f2038]" : "border-[var(--color-border-light)]"
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-[2.5px]" style={{ background: color }} />
      <div className="text-[8.5px] font-bold uppercase tracking-[1px] text-[var(--color-txt3)] mb-1">
        {label}
      </div>
      <div className={cn("font-jetbrains font-bold text-white whitespace-nowrap", main ? "text-[16px] text-[var(--color-gold-l)]" : "text-[13px]")}>
        {val}
      </div>
      <div className="text-[8.5px] text-[var(--color-txt3)] mt-0.5 font-jetbrains">
        {sub}
      </div>
    </div>
  );
}

function SubTabBtn({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-[10.5px] font-bold font-mulish rounded-[6px] border transition-all cursor-pointer",
        active
          ? "bg-[var(--color-gold-d)] text-[var(--color-gold-l)] border-[var(--color-gold)] shadow"
          : "bg-transparent text-[var(--color-txt3)] border-transparent hover:text-white hover:bg-white/5"
      )}
    >
      {children}
    </button>
  );
}
