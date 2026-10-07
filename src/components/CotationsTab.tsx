import React, { useState } from 'react';
import { useStateContext } from '../Store';
import { useTeam, personName } from '../Team';
import { Cotation, Statut, STATUTS, setStatut, decide, canSubmit, validationFor, validationAlerts } from '../lib/team';
import { DEFAULTS } from '../lib/types';
import { fmt, fDZA, cn } from '../lib/utils';

const card = "bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)]";
const btn = "px-2.5 py-1 rounded-md font-bold text-[10.5px] cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed";
const dateFr = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');

export function StatutBadge({ s }: { s: Statut }) {
  return <span className="font-jetbrains text-[9.5px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap" style={{ color: STATUTS[s].color, borderColor: STATUTS[s].color + '80' }}>{STATUTS[s].label}</span>;
}

export function TeamUnavailable() {
  const { status, error } = useTeam();
  if (status === 'loading') return <div className={card + " p-6 text-center text-[12px] text-[var(--color-txt3)]"}>Connexion à la base partagée…</div>;
  return (
    <div className={card + " p-6 text-center text-[12px] text-[var(--color-txt2)] leading-[1.6]"}>
      {error || <>Le suivi partagé des cotations fonctionne dans l'application publiée sur Claude, pour les personnes avec qui elle est partagée.<br />Le simulateur, lui, reste utilisable ici.</>}
    </div>
  );
}

export function CotationsTab({ onOpen }: { onOpen: () => void }) {
  const { dispatch } = useStateContext();
  const team = useTeam();
  const { status, cotations, validations, profiles, isChef, canWrite, db, uid, setCurrentRef } = team;
  const [filtre, setFiltre] = useState<'tous' | Statut>('tous');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  if (status !== 'ready') return <TeamUnavailable />;

  const list = cotations.filter(c =>
    (filtre === 'tous' || c.statut === filtre) &&
    (!q || (c.client + ' ' + c.ref + ' ' + c.vehicule).toLowerCase().includes(q.toLowerCase())));
  const aValider = cotations.filter(c => c.statut === 'a_valider' && !validationFor(c, validations[c.ref])).length;

  const load = (c: Cotation) => {
    dispatch({ type: 'LOAD', payload: { ...DEFAULTS, ...c.params } });
    setCurrentRef(c.ref);
    onOpen();
  };

  return (
    <div className={card}>
      <div className="flex flex-wrap items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)]">
        <div className="flex-1 min-w-[200px]">
          <div className="font-bold text-[12px] text-[var(--color-txt)]">Cotations de l'équipe · {cotations.length}</div>
          <div className="text-[9.5px] text-[var(--color-txt3)] mt-0.5">
            {isChef ? `Vous êtes chef de département : ${aValider} cotation(s) attendent votre visa.` : 'Commercial : vous créez et suivez les cotations ; les offres hors délégation passent au visa.'}
          </div>
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher client, n°, véhicule"
          className="p-1.5 px-2 bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-[11px] text-[var(--color-txt)] outline-none w-[220px]" />
        <select value={filtre} onChange={e => setFiltre(e.target.value as any)}
          className="p-1.5 bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-[11px] text-[var(--color-txt)] outline-none">
          <option value="tous">Tous les statuts</option>
          {(Object.keys(STATUTS) as Statut[]).map(s => <option key={s} value={s}>{STATUTS[s].label}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <div className="p-8 text-center text-[12px] text-[var(--color-txt3)]">
          {cotations.length === 0 ? 'Aucune cotation pour le moment. Enregistrez votre première simulation depuis l\'onglet Simulateur.' : 'Aucune cotation ne correspond à ce filtre.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px] min-w-[860px]">
            <thead>
              <tr className="text-[8.5px] uppercase tracking-[0.7px] text-[var(--color-txt3)] bg-black/20">
                <th className="text-left p-2">N°</th><th className="text-left p-2">Date</th><th className="text-left p-2">Client</th>
                <th className="text-left p-2">Véhicule</th><th className="text-right p-2">Durée · km</th><th className="text-right p-2">Loyer TTC</th>
                <th className="text-right p-2">ROE</th><th className="text-left p-2">Statut</th><th className="text-left p-2">Visa</th><th className="text-left p-2">Par</th>
              </tr>
            </thead>
            <tbody>
              {list.map(c => {
                const v = validationFor(c, validations[c.ref]);
                return (
                  <React.Fragment key={c.ref}>
                    <tr onClick={() => setOpen(open === c.ref ? null : c.ref)} className={cn("border-t border-[var(--color-border-light)] cursor-pointer hover:bg-white/5", open === c.ref && "bg-[#c9a84c0f]")}>
                      <td className="p-2 font-jetbrains font-bold text-[var(--color-gold-l)] whitespace-nowrap">{c.ref}</td>
                      <td className="p-2 text-[var(--color-txt2)]">{dateFr(c.createdAt)}</td>
                      <td className="p-2 text-[var(--color-txt)] font-semibold">{c.client}</td>
                      <td className="p-2 text-[var(--color-txt2)]">{c.vehicule}</td>
                      <td className="p-2 text-right font-jetbrains text-[var(--color-txt2)] whitespace-nowrap">{c.duree} m · {fmt(c.km)}</td>
                      <td className="p-2 text-right font-jetbrains text-[var(--color-txt)] whitespace-nowrap">{fDZA(c.loyerTTC)}</td>
                      <td className="p-2 text-right font-jetbrains" style={{ color: c.roe * 100 >= c.params.p_atroe ? 'var(--color-green)' : 'var(--color-red)' }}>{fmt(c.roe * 100, 1)} %</td>
                      <td className="p-2"><StatutBadge s={c.statut} /></td>
                      <td className="p-2 text-[10px] whitespace-nowrap">
                        {validationAlerts(c.params).length === 0 ? <span className="text-[var(--color-txt3)]">Non requis</span>
                          : v ? <span style={{ color: v.decision === 'validee' ? 'var(--color-green)' : 'var(--color-red)' }}>{v.decision === 'validee' ? '✓ Visée' : '✗ Refusée'}</span>
                          : <span className="text-[#e0a04a]">Requis</span>}
                      </td>
                      <td className="p-2 text-[var(--color-txt2)]">{personName(profiles, c.createdBy)}</td>
                    </tr>
                    {open === c.ref && (
                      <tr className="bg-[var(--color-bg2)]">
                        <td colSpan={10} className="p-3">
                          <CotationDetail c={c} onLoad={() => load(c)} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {team.error && <div className="p-2 px-3.5 text-[10.5px] text-[var(--color-red)]">{team.error}</div>}
      {canWrite === false && <div className="p-2 px-3.5 text-[10.5px] text-[var(--color-txt3)]">Accès en lecture seule.</div>}
    </div>
  );
}

function CotationDetail({ c, onLoad }: { c: Cotation; onLoad: () => void }) {
  const { db, uid, isChef, canWrite, validations, profiles } = useTeam();
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');
  const v = validationFor(c, validations[c.ref]);
  const alerts = validationAlerts(c.params);
  const ro = canWrite === false;

  const act = async (fn: () => Promise<void>) => {
    setBusy(true); setMsg('');
    try { await fn(); } catch (e: any) { setMsg(e?.code === 'invalid_argument' ? 'Action non autorisée avec votre accès.' : 'Action impossible, réessayez.'); }
    setBusy(false);
  };
  const go = (s: Statut, note?: string) => act(() => setStatut(db, uid, c, s, note));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 text-[11px]">
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5">
          <Kpi l="Loyer HT" v={fDZA(c.loyerHT)} />
          <Kpi l="Montant financé" v={fDZA(c.besoin)} />
          <Kpi l="Résultat net" v={fDZA(c.resultatNet)} />
          <Kpi l="Résultat net en stress" v={fDZA(c.stressNet)} />
          <Kpi l="Marge" v={`${fmt(c.marge, 2)} %`} />
          <Kpi l="TRI après IBS" v={`${fmt(c.irr * 100, 1)} %`} />
          <Kpi l="VR" v={`${fmt(c.vrPct, 1)} %`} />
          <Kpi l="Mise à jour" v={dateFr(c.updatedAt)} />
        </div>
        <div className={"rounded-md p-2 border mb-2.5 " + (alerts.length ? "bg-[#d4882a14] border-[#d4882a40] text-[#e8aa60]" : "bg-[#27ae7a14] border-[#27ae7a33] text-[#39c98a]")}>
          {alerts.length ? <>⚠ Hors délégation : {alerts.join(' · ')}</> : <>✓ Dans la délégation commerciale</>}
        </div>
        {v && (
          <div className="mb-2.5 text-[var(--color-txt2)]">
            Visa {v.decision === 'validee' ? 'accordé' : 'refusé'} par <b>{personName(profiles, v.by)}</b> le {dateFr(v.at)}{v.comment ? ` : « ${v.comment} »` : ''}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button className={btn + " bg-[var(--color-blue)] text-white"} onClick={onLoad}>Ouvrir dans le simulateur</button>
          {!ro && c.statut === 'brouillon' && alerts.length > 0 && !v && <button disabled={busy} className={btn + " bg-[#e0a04a] text-[#0d1e38]"} onClick={() => go('a_valider', 'Visa demandé')}>Demander le visa</button>}
          {!ro && (c.statut === 'brouillon' || c.statut === 'a_valider') && canSubmit(c, validations[c.ref]) && <button disabled={busy} className={btn + " bg-[var(--color-green)] text-white"} onClick={() => go('soumise')}>Marquer soumise au client</button>}
          {!ro && c.statut === 'soumise' && <>
            <button disabled={busy} className={btn + " bg-[var(--color-green)] text-white"} onClick={() => go('acceptee')}>Acceptée par le client</button>
            <button disabled={busy} className={btn + " bg-[var(--color-red)] text-white"} onClick={() => go('refusee')}>Refusée par le client</button>
          </>}
          {!ro && !['acceptee', 'refusee', 'abandonnee'].includes(c.statut) && <button disabled={busy} className={btn + " bg-transparent border border-[var(--color-border-main)] text-[var(--color-txt2)]"} onClick={() => go('abandonnee')}>Abandonner</button>}
        </div>

        {isChef && c.statut === 'a_valider' && !v && (
          <div className="mt-3 p-2.5 rounded-md border border-[var(--color-border-main)]">
            <div className="font-bold text-[var(--color-gold-l)] mb-1.5">Visa du chef de département</div>
            <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Commentaire (facultatif)"
              className="w-full p-1.5 mb-2 bg-[var(--color-bg)] border border-[var(--color-border-main)] rounded-md text-[11px] text-[var(--color-txt)] outline-none" />
            <div className="flex gap-2">
              <button disabled={busy} className={btn + " bg-[var(--color-green)] text-white"} onClick={() => act(() => decide(db, uid, c, 'validee', comment))}>Accorder le visa</button>
              <button disabled={busy} className={btn + " bg-[var(--color-red)] text-white"} onClick={() => act(() => decide(db, uid, c, 'refusee', comment))}>Refuser</button>
            </div>
          </div>
        )}
        {msg && <div className="mt-2 text-[var(--color-red)]">{msg}</div>}
      </div>
      <div>
        <div className="text-[9px] uppercase tracking-[1px] font-bold text-[var(--color-txt3)] mb-1.5">Historique</div>
        <ul className="space-y-1">
          {[...c.history].reverse().map((h, i) => (
            <li key={i} className="flex gap-2 text-[var(--color-txt2)]">
              <span className="font-jetbrains text-[var(--color-txt3)] whitespace-nowrap">{new Date(h.at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
              <StatutBadge s={h.statut} />
              <span>{h.note ? h.note + ' · ' : ''}{personName(profiles, h.by)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Kpi({ l, v }: { l: string; v: string }) {
  return (
    <div className="p-1.5 px-2 bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-md">
      <span className="block text-[8px] text-[var(--color-txt3)] uppercase tracking-[0.6px]">{l}</span>
      <strong className="block font-jetbrains text-[11.5px] text-[var(--color-txt)]">{v}</strong>
    </div>
  );
}
