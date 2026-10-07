import React from 'react';
import { useStateContext } from '../Store';
import { InputRow } from './ui/InputRow';
import { fDZA, cn } from '../lib/utils';

export function Params() {
  const { params, dispatch, engineResult } = useStateContext();

  const handleNumChange = (key: string, value: string) => {
    dispatch({ type: 'SET_PARAM', payload: { key, value: parseFloat(value) || 0 } });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      {/* 1. IJARAH */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-blue)]">
          <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-blue-d)]">🏦</div>
          <div>
            <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Paramètres Ijarah & Véhicule</div>
            <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.7px] mt-0.5">Capital · Durée · Apport · Hamish Jiddiyyah</div>
          </div>
        </div>
        <div className="p-3">
          <InputRow label="Prix d'Acquisition HT" sub="Auto-rempli par le catalogue ou saisie libre" val={params.p_achat} suffix="DZA" onChange={v => handleNumChange('p_achat', v)} />
          <InputRow label="Frais Immatriculation & Livraison" val={params.p_liv} suffix="DZA" onChange={v => handleNumChange('p_liv', v)} />
          <InputRow label="Durée du Contrat Ijarah" val={params.p_duree} suffix="mois" min="12" max="84" onChange={v => handleNumChange('p_duree', v)} />
          <InputRow label="Kilométrage Contractuel Total" val={params.p_km} suffix="km" onChange={v => handleNumChange('p_km', v)} />
          
          <div className="h-[1px] bg-[var(--color-border-light)] my-2"></div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[1px] mb-1.5 mt-0.5">💰 Structure de l'Apport & Garantie</div>
          
          <InputRow label="Apport Initial / Premier Loyer Majoré" sub="⬇ Réduit le capital financé" colorSub="var(--color-orange)" val={params.p_apport} suffix="DZA" onChange={v => handleNumChange('p_apport', v)} />
          <InputRow label="Hamish Jiddiyyah (Dépôt de Garantie)" sub="🔒 Collatéral — NE réduit PAS le capital" colorSub="var(--color-cyan)" val={params.p_depot} suffix="DZA" onChange={v => handleNumChange('p_depot', v)} />
          
          <div className="flex items-start gap-2 bg-[#d4882a14] border border-[#d4882a40] text-[#e8aa60] rounded-md p-2 mt-1.5 text-[10.5px] leading-[1.4]">
            <span className="text-[13px] shrink-0 mt-[1px]">⚠️</span>
            <div><strong>Distinction contractuelle :</strong> L'apport réduit le capital refinancé. Le Hamish Jiddiyyah est un collatéral restitué en fin de contrat.</div>
          </div>
          
          <div className="h-[1px] bg-[var(--color-border-light)] my-2"></div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[1px] mb-1.5 mt-0.5">🚗 Valeur Résiduelle</div>
          
          <InputRow label="Valeur Résiduelle Brute" sub="% de la valeur d'acquisition HT (0–70%)" val={params.p_vr_pct} suffix="%" min="0" max="70" step="1" onChange={v => handleNumChange('p_vr_pct', v)} />
          <InputRow label="Frais Reconditionnement & Cession" sub="Déduit de la VR brute → VR nette HT (base PMT)" val={params.p_vr_frais} suffix="DZA" onChange={v => handleNumChange('p_vr_frais', v)} />
          
          {engineResult.vrNegative && (
            <div className="flex items-start gap-2 bg-[#c0392b1a] border border-[#c0392b4d] text-[#e57373] rounded-md p-2 mt-1.5 text-[10.5px] leading-[1.4]">
              <span className="text-[13px] shrink-0 mt-[1px]">🚨</span>
              <div><strong>VR Nette négative !</strong> Les frais de reconditionnement dépassent la VR brute. La VR nette est forcée à 0 — vérifiez vos paramètres.</div>
            </div>
          )}
        </div>
      </div>

      {/* 2. CAPITAL & LEASE ADJ */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-gold)]">
          <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-gold-d)]">💰</div>
          <div>
            <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Capital & Rendement · Lease Adjustment</div>
            <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.7px] mt-0.5">WACC standard · LGD décroissant · Ajustement commercial</div>
          </div>
        </div>
        <div className="p-3">
          <InputRow label="Coût de Refinancement Participatif" sub="Sukuk / Wakala / dépôts d'investissement" val={params.p_cost_debt} suffix="%/an" step="0.1" onChange={v => handleNumChange('p_cost_debt', v)} />
          <InputRow label="Ratio Fonds Propres (Equity)" val={params.p_equity_pct} suffix="%" onChange={v => handleNumChange('p_equity_pct', v)} />
          <InputRow label="Cible Rentabilité Fonds Propres (ROE)" val={params.p_atroe} suffix="%/an" onChange={v => handleNumChange('p_atroe', v)} />
          <InputRow label="Taux IBS" sub="Impôt sur le résultat du contrat (ROE et TRI après impôt)" val={params.p_ibs} suffix="%" step="1" onChange={v => handleNumChange('p_ibs', v)} />
          <InputRow label="Benchmark Marché Externe (Hurdle Indépendant)" sub="✓ v8 : taux de référence externe, indépendant du WACC interne — évite la circularité ROE→WACC→TRI" colorSub="var(--color-cyan)" val={params.p_hurdle_externe} suffix="%/an" step="0.1" onChange={v => handleNumChange('p_hurdle_externe', v)} />
          <InputRow label="Provision Risque Client (LGD)" sub="✓ v7 : balance décroissante exacte" colorSub="var(--color-cyan)" val={params.p_risk} suffix="%/an" step="0.1" onChange={v => handleNumChange('p_risk', v)} />
          <InputRow label="Provision Risque Valeur Résiduelle" sub="✓ v9 : risque de réalisation VR distinct du risque crédit — % appliqué à la VR nette" colorSub="var(--color-orange)" val={params.p_risk_vr} suffix="% VR" step="0.5" onChange={v => handleNumChange('p_risk_vr', v)} />
          <InputRow label="Frais de Gestion Bancaire" val={params.p_admin} suffix="DZA/mois" onChange={v => handleNumChange('p_admin', v)} />
          
          <div className="flex items-start gap-2 bg-[#2d6fbd14] border border-[#2d6fbd33] text-[#7ab5e8] rounded-md p-2 mt-1.5 text-[10.5px] leading-[1.4]">
            <span className="text-[13px] shrink-0 mt-[1px]">ℹ️</span>
            <div>WACC = r_dette × (1−Equity%) + ROE × Equity% — formule additive standard (CFA/IFRS). WACC actuel : <strong>{(engineResult.waccAnn * 100).toFixed(2)}%/an</strong></div>
          </div>
          
          <div className="h-[1px] bg-[var(--color-border-light)] my-2"></div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[1px] mb-1.5 mt-0.5">📐 Lease Adjustment (Ajustement Commercial)</div>
          
          <InputRow label="Ajustement de Loyer Mensuel" sub="+ surcharge · − remise · indexation · ajust. marché" val={params.p_lease_adj} suffix="DZA/mois" onChange={v => handleNumChange('p_lease_adj', v)} />
          
          <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-border-light)] gap-2">
            <div className="text-[11.5px] font-medium text-[var(--color-txt)]">Motif</div>
            <select 
              value={params.p_adj_type}
              onChange={e => dispatch({ type: 'SET_PARAM', payload: { key: 'p_adj_type', value: e.target.value } })}
              className="bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-[var(--color-txt2)] text-[10px] py-1.5 px-2 outline-none"
            >
              <option value="commercial">Remise commerciale</option>
              <option value="index">Indexation marché</option>
              <option value="volume">Remise volume flotte</option>
              <option value="surcharge">Surcharge risque</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. SERVICES */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-orange)]">
          <div className="flex items-center gap-2.5">
            <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-orange-d)]">🔧</div>
            <div>
              <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Services & Entretien SMR (10 000 km)</div>
              <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.7px] mt-0.5">Barème Stellantis · TALHA AUTO · Pneus · Flotte</div>
            </div>
          </div>
          <span className="text-[9px] font-jetbrains px-2 py-0.5 rounded bg-[var(--color-orange-d)] text-[var(--color-orange)] font-bold">
            {fDZA(engineResult.provSMR + (engineResult.provAleasM || 0))} /m
          </span>
        </div>
        <div className="p-3">
          {/* Moteur & Conditions */}
          <div className="mb-2 bg-[#0b1728] p-2 rounded-[6px] border border-[var(--color-border-light)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold text-[var(--color-txt3)] uppercase tracking-[0.8px]">Motorisation</span>
              <div className="flex gap-1">
                {[
                  { id: 'diesel', label: '🛢️ Diesel' },
                  { id: 'essence', label: '⛽ Essence' },
                  { id: 'gpl', label: '⚡ GPL' },
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => dispatch({ type: 'SET_PARAM', payload: { key: 'smr_engine_type', value: f.id } })}
                    className={cn(
                      "px-2 py-0.5 text-[9px] font-bold font-jetbrains rounded border-none cursor-pointer transition-all",
                      params.smr_engine_type === f.id
                        ? "bg-[#183457] text-[var(--color-gold-l)] shadow border border-[var(--color-gold-d)]"
                        : "bg-transparent text-[var(--color-txt3)] hover:text-white"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[rgba(255,255,255,0.06)]">
              <span className="text-[9px] text-[var(--color-txt3)]">Conditions Roulage Sévères</span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_PARAM', payload: { key: 'smr_severe', value: !params.smr_severe } })}
                className={cn(
                  "px-2 py-0.5 text-[8.5px] font-bold rounded border cursor-pointer font-jetbrains",
                  params.smr_severe 
                    ? "bg-red-950/80 text-red-300 border-red-800" 
                    : "bg-black/30 text-[var(--color-txt3)] border-transparent"
                )}
              >
                {params.smr_severe ? 'Sévères (10k filtres)' : 'Normales'}
              </button>
            </div>
          </div>

          <InputRow label="Marge sur Entretien Mécanique" sub="Markup banque sur pièces & MO" colorSub="var(--color-green)" val={params.p_smr_margin} suffix="%" onChange={v => handleNumChange('p_smr_margin', v)} />
          <InputRow label="Inflation Prévisionnelle Pièces & MO" val={params.p_inflation} suffix="%/an" step="0.1" onChange={v => handleNumChange('p_inflation', v)} />
          <InputRow label="Provision Aléas & Imprévus" sub="Sécurité pannes et appoints" val={params.smr_aleas ?? 10} suffix="%" onChange={v => handleNumChange('smr_aleas', v)} />
          
          <div className="h-[1px] bg-[var(--color-border-light)] my-2"></div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[1px] mb-1.5 mt-0.5">Pneumatiques (4 pneus neufs par train)</div>
          
          <InputRow label="Prix Unitaire Pneu" val={params.c_pneu} suffix="DZA" onChange={v => handleNumChange('c_pneu', v)} />
          <InputRow label="Durée de vie 1 Train" val={params.km_pneu} suffix="km" onChange={v => handleNumChange('km_pneu', v)} />
          
          <div className="h-[1px] bg-[var(--color-border-light)] my-2"></div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[1px] mb-1.5 mt-0.5">Mobilité, Télématique & Flotte</div>
          
          <InputRow label="Mobilité & GPS / Télématique" colorSub="var(--color-cyan)" val={params.c_mob} suffix="DZA/mois" onChange={v => handleNumChange('c_mob', v)} />
          <InputRow label="Assistance Routière 24/7" colorSub="var(--color-cyan)" val={params.c_assistance} suffix="DZA/mois" onChange={v => handleNumChange('c_assistance', v)} />
          <InputRow label="Gestion Flotte & Cartes" colorSub="var(--color-cyan)" val={params.c_gestion} suffix="DZA/mois" onChange={v => handleNumChange('c_gestion', v)} />
          
          <div className="h-[1px] bg-[var(--color-border-light)] my-2"></div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[1px] mb-1.5 mt-0.5">🚗 Véhicule de Remplacement</div>
          
          <InputRow label="Jours de remplacement / an" sub="Norme marché : 10–15 j/an" val={params.c_veh_j} suffix="j/an" onChange={v => handleNumChange('c_veh_j', v)} />
          <InputRow label="Coût journalier remplacement" val={params.c_veh_d} suffix="DZA/j" onChange={v => handleNumChange('c_veh_d', v)} />
        </div>
      </div>

      {/* 4. TAKAFUL */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-green)]">
          <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-green-d)]">🛡️</div>
          <div>
            <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Takaful & Moteur Fiscal</div>
            <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.7px] mt-0.5">Assurance participative · Catalogue intégré</div>
          </div>
        </div>
        <div className="p-3">
          {params.tak_catalog_mode ? (
            <>
              <div className="flex items-center gap-2 p-2 px-2.5 rounded-md mb-2 text-[10px] font-bold tracking-[0.5px] bg-[#27ae7a14] border border-[#27ae7a33] text-[var(--color-green)]">
                🛡️ MODE CATALOGUE — Prime issue du tarif officiel Al Salam
              </div>
              <div className="flex justify-between items-center bg-[#27ae7a0f] border border-[#27ae7a26] rounded-md p-2 px-3 mb-1.5">
                <div>
                  <div className="text-[11px] text-[var(--color-txt2)]">Prime Takaful Tous Risques / an (TTC catalogue)</div>
                  <div className="text-[11px] text-[var(--color-txt2)] mt-0.5">Prime Takaful Tous Risques / an (HT · base calcul)</div>
                  <div className="text-[11px] text-[var(--color-txt2)] mt-0.5">Prime mensuelle HT</div>
                </div>
                <div className="text-right">
                  <div className="font-jetbrains text-[12px] font-bold text-[var(--color-green)]">{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(engineResult.takMDmensHT * 12)}</div>
                  <div className="font-jetbrains text-[10px] font-bold text-[var(--color-txt3)]">{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(engineResult.takMDmensHT * 12)}</div>
                  <div className="font-jetbrains text-[10px] font-bold text-[var(--color-txt3)]">{new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(engineResult.takMDmensHT)} / mois</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 p-2 px-2.5 rounded-md mb-2 text-[10px] font-bold tracking-[0.5px] bg-[#2d6fbd14] border border-[#2d6fbd33] text-[#5fa0e0]">
                ✏️ MODE MANUEL — Saisie libre du taux ou du montant
              </div>
              <InputRow label="Takaful Tous Risques (MD)" sub="Taux annuel sur valeur d'acquisition" val={params.p_tak_md} suffix="%/an" step="0.01" onChange={v => handleNumChange('p_tak_md', v)} />
            </>
          )}
          
          <InputRow label="Takaful RC & Assistance (Forfait)" val={params.p_tak_rc} suffix="DZA/an" onChange={v => handleNumChange('p_tak_rc', v)} />
          <InputRow label="Taxe de Roulage (Vignette)" val={params.p_vignette} suffix="DZA/an" onChange={v => handleNumChange('p_vignette', v)} />
          
          <div className="h-[1px] bg-[var(--color-border-light)] my-2"></div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[1px] mb-1.5 mt-0.5">Taux de Taxes Appliqués</div>
          
          <div className="flex justify-between items-center bg-[var(--color-bg2)] rounded-[5px] p-1.5 px-2.5 mb-1">
            <span className="text-[11px] text-[var(--color-txt2)]">TVA Finance & Services</span>
            <span className="font-jetbrains text-[12px] font-bold text-[#5fa0e0]">19,00 %</span>
          </div>
          <div className="flex justify-between items-center bg-[var(--color-bg2)] rounded-[5px] p-1.5 px-2.5">
            <span className="text-[11px] text-[var(--color-txt2)]">Vignette</span>
            <span className="font-jetbrains text-[12px] font-bold text-[var(--color-txt3)]">Exonérée</span>
          </div>
        </div>
      </div>
    </div>
  );
}
