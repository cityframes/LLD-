import React, { useState } from 'react';
import { useTeam } from '../Team';
import { STATUTS, Statut, Objectifs } from '../lib/team';
import { TeamUnavailable } from './CotationsTab';
import { fmt, fDZA } from '../lib/utils';

const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const card = "bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)]";

export function DashboardTab() {
  const { status, cotations, objectifs, isChef, db } = useTeam();
  const [annee, setAnnee] = useState<number | null>(null);
  if (status !== 'ready') return <TeamUnavailable />;

  const years = Array.from(new Set([objectifs.annee, new Date().getFullYear(), ...cotations.map(c => new Date(c.createdAt).getFullYear())])).sort();
  const an = annee ?? objectifs.annee;
  // L'objectif du budget ne vaut que pour son année
  const cible = an === objectifs.annee ? objectifs.vehicules : 0;
  const ofYear = (iso: string) => new Date(iso).getFullYear() === an;
  const year = cotations.filter(c => ofYear(c.createdAt));
  const acceptees = cotations.filter(c => c.statut === 'acceptee' && ofYear(c.statutAt));
  const refusees = cotations.filter(c => c.statut === 'refusee' && ofYear(c.statutAt));
  const decided = acceptees.length + refusees.length;
  const transfo = decided ? acceptees.length / decided : 0;
  const finance = acceptees.reduce((a, c) => a + c.besoin, 0);
  const loyers = acceptees.reduce((a, c) => a + c.loyerHT, 0);
  const roeMoy = finance ? acceptees.reduce((a, c) => a + c.roe * c.besoin, 0) / finance : 0;
  const pipeline = cotations.filter(c => c.statut === 'soumise');
  const parStatut = (Object.keys(STATUTS) as Statut[]).map(s => ({ s, n: year.filter(c => c.statut === s).length }));

  // Objectif cumulé par mois (phasage du budget) contre véhicules acceptés
  const totalPh = objectifs.phasage.reduce((a, b) => a + b, 0) || 100;
  let cumObj = 0, cumReal = 0;
  const now = new Date();
  const rows = MOIS.map((m, i) => {
    cumObj += cible * objectifs.phasage[i] / totalPh;
    const real = acceptees.filter(c => new Date(c.statutAt).getMonth() === i).length;
    cumReal += real;
    const futur = an > now.getFullYear() || (an === now.getFullYear() && i > now.getMonth());
    return { m, obj: cumObj, real, cumReal, futur };
  });
  const maxV = Math.max(cible, cumReal, 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[11px] text-[var(--color-txt2)]">
        <span>Année</span>
        <select value={an} onChange={e => setAnnee(parseInt(e.target.value))} className="p-1.5 bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-[11px] text-[var(--color-txt)] outline-none">
          {years.map(y => <option key={y} value={y}>{y}{y === objectifs.annee ? ' · année budget' : ''}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <Kpi l={`Cotations ${an}`} v={fmt(year.length)} s="toutes créées dans l'année" />
        <Kpi l="Véhicules acceptés" v={cible ? `${fmt(acceptees.length)} / ${fmt(cible)}` : fmt(acceptees.length)} s={cible ? `objectif ${an}` : 'pas d\'objectif saisi pour cette année'} main />
        <Kpi l="Taux de transformation" v={decided ? `${fmt(transfo * 100, 0)} %` : '—'} s="acceptées / (acceptées + refusées)" />
        <Kpi l="Montant financé" v={fDZA(finance)} s="cotations acceptées" />
        <Kpi l="Loyers HT signés" v={fDZA(loyers)} s="par mois, contrats acceptés" />
        <Kpi l="ROE moyen" v={finance ? `${fmt(roeMoy * 100, 1)} %` : '—'} s={`pondéré · cible ${fmt(objectifs.roeCible, 1)} %`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        <div className={card + " p-3.5"}>
          <div className="font-bold text-[12px] text-[var(--color-txt)] mb-0.5">Véhicules acceptés contre objectif du budget {an}</div>
          <div className="text-[9.5px] text-[var(--color-txt3)] mb-3">Cumul mensuel · objectif réparti selon le phasage des livraisons du budget</div>
          <div className="flex items-end gap-1.5 h-[180px]">
            {rows.map(r => (
              <div key={r.m} className="flex-1 flex flex-col items-center justify-end h-full relative" title={`${r.m} : ${Math.round(r.obj)} prévus, ${r.cumReal} acceptés`}>
                <div className="w-full relative flex items-end justify-center h-full">
                  <div className="absolute bottom-0 w-full rounded-t-sm border border-dashed border-[var(--color-gold)] opacity-60" style={{ height: `${(r.obj / maxV) * 100}%` }} />
                  {!r.futur && <div className="relative w-[60%] rounded-t-sm bg-[var(--color-green)]" style={{ height: `${(r.cumReal / maxV) * 100}%` }} />}
                </div>
                <span className="text-[8.5px] text-[var(--color-txt3)] mt-1">{r.m}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2 text-[9.5px] text-[var(--color-txt3)]">
            <span><span className="inline-block w-2.5 h-2.5 bg-[var(--color-green)] mr-1 align-middle" />Acceptés (cumul)</span>
            <span><span className="inline-block w-2.5 h-2.5 border border-dashed border-[var(--color-gold)] mr-1 align-middle" />Objectif budget (cumul)</span>
          </div>
        </div>

        <div className={card + " p-3.5"}>
          <div className="font-bold text-[12px] text-[var(--color-txt)] mb-2">Cotations {an} par statut</div>
          {parStatut.map(({ s, n }) => (
            <div key={s} className="flex items-center gap-2 py-1">
              <span className="w-[130px] text-[11px] text-[var(--color-txt2)]">{STATUTS[s].label}</span>
              <div className="flex-1 h-2 bg-[var(--color-bg2)] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${year.length ? n / year.length * 100 : 0}%`, background: STATUTS[s].color }} />
              </div>
              <span className="w-8 text-right font-jetbrains text-[11px] text-[var(--color-txt)]">{n}</span>
            </div>
          ))}
          <div className="mt-3 pt-2 border-t border-[var(--color-border-light)] text-[11px] text-[var(--color-txt2)]">
            En attente de réponse client : <b className="text-[var(--color-txt)]">{pipeline.length}</b> offre(s), {fDZA(pipeline.reduce((a, c) => a + c.loyerHT, 0))} HT/mois
          </div>
        </div>
      </div>

      {isChef && <ObjectifsEditor objectifs={objectifs} db={db} />}
    </div>
  );
}

function ObjectifsEditor({ objectifs, db }: { objectifs: Objectifs; db: any }) {
  const [o, setO] = useState(objectifs);
  const [msg, setMsg] = useState('');
  const save = async () => {
    setMsg('');
    try { await db.doc('config/objectifs').set({ ...o }); setMsg('Objectifs enregistrés.'); }
    catch { setMsg('Enregistrement impossible.'); }
  };
  const num = (k: keyof Objectifs) => (e: React.ChangeEvent<HTMLInputElement>) => setO({ ...o, [k]: parseFloat(e.target.value) || 0 });
  const input = "w-[90px] p-1 bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-right font-jetbrains text-[11px] text-[var(--color-gold-l)] outline-none";
  return (
    <div className={card + " p-3.5"}>
      <div className="font-bold text-[12px] text-[var(--color-txt)] mb-2">Objectifs du département (réservé au chef de département)</div>
      <div className="flex flex-wrap gap-4 items-center text-[11px] text-[var(--color-txt2)]">
        <label>Année <input type="number" className={input} value={o.annee} onChange={num('annee')} /></label>
        <label>Véhicules à livrer <input type="number" className={input} value={o.vehicules} onChange={num('vehicules')} /></label>
        <label>ROE cible (%) <input type="number" step="0.5" className={input} value={o.roeCible} onChange={num('roeCible')} /></label>
        <button onClick={save} className="px-3 py-1.5 rounded-md font-bold text-[11px] bg-[var(--color-gold)] text-[#0d1e38] cursor-pointer">Enregistrer</button>
        {msg && <span className="text-[var(--color-gold-l)]">{msg}</span>}
      </div>
    </div>
  );
}

function Kpi({ l, v, s, main }: { l: string; v: string; s: string; main?: boolean }) {
  return (
    <div className="bg-[var(--color-card)] border rounded-[10px] p-3" style={{ borderColor: main ? 'var(--color-border-main)' : 'rgba(180,150,80,.07)', background: main ? 'linear-gradient(135deg,#1a2f50,#0f2035)' : undefined }}>
      <div className="text-[9px] font-bold uppercase tracking-[1.2px] text-[var(--color-txt3)] mb-1">{l}</div>
      <div className="font-jetbrains text-[15px] font-bold" style={{ color: main ? 'var(--color-gold-l)' : 'var(--color-txt)' }}>{v}</div>
      <div className="text-[9px] text-[var(--color-txt3)] mt-0.5">{s}</div>
    </div>
  );
}
