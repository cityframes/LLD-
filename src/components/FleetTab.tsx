import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useStateContext } from '../Store';
import { CATALOG, DEFAULTS, SimulatorParams } from '../lib/types';
import { computeEngine, computePnL } from '../lib/engine';
import { validationAlerts } from '../lib/team';
import { fleetDocument, fleetTotals, FleetLine, DocOptions, Lang } from '../lib/offerDoc';
import { OfferDialog } from './OfferDialog';

const KEY = 'ijarah_fleet_v1';
const n0 = (v: number) => Math.round(v).toLocaleString('fr-FR');
const card = "bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)]";
const btn = "px-3 py-1.5 rounded-md font-bold text-[11px] cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed";
const input = "p-2 bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-[var(--color-txt)] text-[12px] outline-none focus:border-[var(--color-gold)]";

interface FleetState { client: string; ref: string; date: string; lines: FleetLine[] }

function load(): FleetState | null {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return null;
    const d = JSON.parse(s) as FleetState;
    return { ...d, lines: (d.lines || []).map(l => ({ ...l, params: { ...DEFAULTS, ...l.params } })) };
  } catch { return null; }
}

const vehLabel = (p: SimulatorParams) => p.veh_idx >= 0 && CATALOG[p.veh_idx] ? `${CATALOG[p.veh_idx].model} ${CATALOG[p.veh_idx].version}` : 'Saisie manuelle';

export function FleetTab({ onOpen }: { onOpen: () => void }) {
  const { params, dispatch } = useStateContext();
  const [st, setSt] = useState<FleetState>(() => load() || { client: params.clientName, ref: params.clientRef, date: new Date().toLocaleDateString('fr-FR'), lines: [] });
  const [dialog, setDialog] = useState(false);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* stockage indisponible */ } }, [st]);

  const add = () => setSt(s => ({
    ...s,
    client: s.lines.length ? s.client : params.clientName,
    ref: s.lines.length ? s.ref : params.clientRef,
    lines: [...s.lines, { id: Math.random().toString(36).slice(2, 9), qty: 1, params: JSON.parse(JSON.stringify(params)) }],
  }));
  const setQty = (id: string, qty: number) => setSt(s => ({ ...s, lines: s.lines.map(l => l.id === id ? { ...l, qty: Math.max(1, Math.round(qty) || 1) } : l) }));
  const remove = (id: string) => setSt(s => ({ ...s, lines: s.lines.filter(l => l.id !== id) }));
  const replace = (id: string) => setSt(s => ({ ...s, lines: s.lines.map(l => l.id === id ? { ...l, params: JSON.parse(JSON.stringify(params)) } : l) }));
  const open = (l: FleetLine) => { dispatch({ type: 'LOAD', payload: { ...DEFAULTS, ...l.params } }); onOpen(); };

  const tot = useMemo(() => fleetTotals(st.lines), [st.lines]);
  const detail = useMemo(() => tot.rows.map(({ l, r }) => {
    const pl = computePnL(r);
    return { l, r, pl, alerts: validationAlerts(l.params, r, pl) };
  }), [tot]);
  const besoin = detail.reduce((a, d) => a + d.r.besoin * d.l.qty, 0);
  const roe = besoin ? detail.reduce((a, d) => a + d.pl.roeEff * d.r.besoin * d.l.qty, 0) / besoin : 0;
  const net = detail.reduce((a, d) => a + d.pl.resultatNet * d.l.qty, 0);
  const horsDeleg = detail.filter(d => d.alerts.length);

  const build = useCallback((o: DocOptions) => fleetDocument(st.lines, st.client, st.ref, st.date, o), [st]);
  const email = useCallback((lang: Lang) => lang === 'fr' ? {
    subject: `Devis flotte Ijara ${st.ref} · Al Salam Bank`,
    body: `Madame, Monsieur,\n\nVeuillez trouver ci-joint notre devis de location Ijara ${st.ref} pour une flotte de ${tot.nb} véhicules : loyer mensuel total de ${n0(tot.ttc)} DA TTC, entretien, Takaful et taxes compris.\n\nL'offre est valable 15 jours. Nous restons à votre disposition pour tout complément d'information.\n\nCordialement,\nDépartement Location longue durée\nAl Salam Bank`,
  } : {
    subject: `عرض إيجار أسطول ${st.ref} · بنك السلام الجزائر`,
    body: `السيدات والسادة،\n\nيسعدنا أن نرسل إليكم مرفقاً عرض الإيجار ${st.ref} لأسطول من ${tot.nb} مركبات: مجموع بدل الإيجار الشهري ${n0(tot.ttc)} دج متضمن الرسوم، يشمل الصيانة والتكافل والرسوم.\n\nالعرض صالح لمدة 15 يوماً، ونبقى في خدمتكم لأي استفسار.\n\nمع خالص التحيات،\nمديرية الإيجار طويل الأجل\nبنك السلام الجزائر`,
  }, [st.ref, tot]);

  return (
    <div className="space-y-4">
      <div className={card + " p-3.5"}>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex-1 min-w-[200px]"><span className="text-[11px] text-[var(--color-txt2)]">Client (raison sociale)</span>
            <input className={input + " w-full mt-1"} value={st.client} onChange={e => setSt({ ...st, client: e.target.value })} /></label>
          <label className="w-[180px]"><span className="text-[11px] text-[var(--color-txt2)]">Référence du devis</span>
            <input className={input + " w-full mt-1 font-jetbrains"} value={st.ref} onChange={e => setSt({ ...st, ref: e.target.value })} /></label>
          <label className="w-[130px]"><span className="text-[11px] text-[var(--color-txt2)]">Date</span>
            <input className={input + " w-full mt-1"} value={st.date} onChange={e => setSt({ ...st, date: e.target.value })} /></label>
          <button type="button" onClick={add} className={btn + " bg-[var(--color-green)] text-white"}>＋ Ajouter la simulation en cours</button>
          <button type="button" disabled={!st.lines.length} onClick={() => setDialog(true)} className={btn + " bg-[var(--color-gold)] text-[#0d1e38]"}>📄 Générer le devis</button>
        </div>
        <div className="text-[10px] text-[var(--color-txt3)] mt-2 leading-snug">
          Réglez un véhicule dans l'onglet Simulateur (modèle, durée, kilométrage, services), puis ajoutez-le ici avec sa quantité. Chaque ligne garde ses propres paramètres.
        </div>
      </div>

      {st.lines.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <Kpi l="Véhicules" v={n0(tot.nb)} />
          <Kpi l="Loyers HT / mois" v={n0(tot.ht) + ' DA'} />
          <Kpi l="Loyers TTC / mois" v={n0(tot.ttc) + ' DA'} main />
          <Kpi l="Montant financé" v={n0(besoin) + ' DA'} />
          <Kpi l="ROE moyen (interne)" v={(roe * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %'} />
          <Kpi l="Résultat net (interne)" v={n0(net) + ' DA'} />
        </div>
      )}

      {horsDeleg.length > 0 && (
        <div className="rounded-md p-2.5 text-[10.5px] leading-[1.45] border bg-[#d4882a14] border-[#d4882a40] text-[#e8aa60]">
          ⚠ {horsDeleg.length} ligne(s) hors délégation, visa du chef de département requis avant envoi : {horsDeleg.map(d => `${vehLabel(d.l.params)} (${d.alerts.join(', ')})`).join(' · ')}
        </div>
      )}

      <div className={card}>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-[9.5px] uppercase tracking-[0.6px] text-[var(--color-txt3)] border-b border-[var(--color-border-light)]">
                <th className="p-2 text-left">Véhicule</th><th className="p-2 text-right">Durée</th><th className="p-2 text-right">Km total</th><th className="p-2 text-right">VR</th>
                <th className="p-2 text-right">Quantité</th><th className="p-2 text-right">Loyer HT</th><th className="p-2 text-right">Loyer TTC</th><th className="p-2 text-right">Total TTC / mois</th><th className="p-2 text-right">ROE</th><th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {detail.length === 0 && <tr><td colSpan={10} className="p-6 text-center text-[var(--color-txt3)]">Aucun véhicule dans le devis pour l'instant.</td></tr>}
              {detail.map(({ l, r, pl, alerts }) => (
                <tr key={l.id} className="border-b border-[var(--color-border-light)] text-[var(--color-txt)]">
                  <td className="p-2">{vehLabel(l.params)}{alerts.length > 0 && <span className="ml-1.5 text-[#e0a04a]" title={alerts.join(' · ')}>⚠</span>}</td>
                  <td className="p-2 text-right font-jetbrains">{r.duree} m</td>
                  <td className="p-2 text-right font-jetbrains">{n0(r.kmTotal)}</td>
                  <td className="p-2 text-right font-jetbrains">{l.params.p_vr_pct} %</td>
                  <td className="p-2 text-right"><input type="number" min={1} value={l.qty} onChange={e => setQty(l.id, parseFloat(e.target.value))} className={input + " w-[64px] p-1 text-right font-jetbrains"} /></td>
                  <td className="p-2 text-right font-jetbrains">{n0(r.loyerHT)}</td>
                  <td className="p-2 text-right font-jetbrains">{n0(r.loyerTTC)}</td>
                  <td className="p-2 text-right font-jetbrains text-[var(--color-gold-l)] font-bold">{n0(r.loyerTTC * l.qty)}</td>
                  <td className="p-2 text-right font-jetbrains">{(pl.roeEff * 100).toFixed(1)} %</td>
                  <td className="p-2 text-right whitespace-nowrap">
                    <button type="button" onClick={() => open(l)} className="text-[10px] text-[#5fa0e0] hover:underline cursor-pointer mr-2">Ouvrir</button>
                    <button type="button" onClick={() => replace(l.id)} className="text-[10px] text-[var(--color-gold)] hover:underline cursor-pointer mr-2" title="Remplacer par la simulation en cours">Remplacer</button>
                    <button type="button" onClick={() => remove(l.id)} className="text-[10px] text-[#ef7070] hover:underline cursor-pointer">Retirer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {dialog && <OfferDialog build={build} email={email} onClose={() => setDialog(false)} />}
    </div>
  );
}

function Kpi({ l, v, main }: { l: string; v: string; main?: boolean }) {
  return (
    <div className="bg-[var(--color-card)] border rounded-[10px] p-3" style={{ borderColor: main ? 'var(--color-border-main)' : 'rgba(180,150,80,.07)', background: main ? 'linear-gradient(135deg,#1a2f50,#0f2035)' : undefined }}>
      <div className="text-[9px] font-bold uppercase tracking-[1.2px] text-[var(--color-txt3)] mb-1">{l}</div>
      <div className="font-jetbrains text-[14px] font-bold" style={{ color: main ? 'var(--color-gold-l)' : 'var(--color-txt)' }}>{v}</div>
    </div>
  );
}
