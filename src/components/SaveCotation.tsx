import React, { useMemo, useState } from 'react';
import { useStateContext } from '../Store';
import { useTeam } from '../Team';
import { createCotation, updateCotation, validationAlerts, STATUTS } from '../lib/team';

export function SaveCotation() {
  const { params, dispatch, engineResult, pnlResult } = useStateContext();
  const { status, db, uid, canWrite, cotations, currentRef, setCurrentRef } = useTeam();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const alerts = useMemo(() => validationAlerts(params, engineResult, pnlResult), [params, engineResult, pnlResult]);
  const current = cotations.find(c => c.ref === currentRef);
  const readOnly = canWrite === false;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setMsg('');
    try { await fn(); }
    catch (e: any) {
      setMsg(e?.code === 'quota_exceeded' ? 'Base pleine : supprimez d\'anciennes cotations.'
        : e?.code === 'invalid_argument' ? 'Votre accès ne permet pas d\'enregistrer.'
        : e?.message || 'Enregistrement impossible, réessayez.');
    }
    setBusy(false);
  };

  const saveNew = () => run(async () => {
    const ref = await createCotation(db, uid, params);
    dispatch({ type: 'SET_PARAM', payload: { key: 'clientRef', value: ref } });
    setCurrentRef(ref);
    setMsg(`Cotation ${ref} enregistrée.`);
  });

  const saveUpdate = () => run(async () => {
    if (!current) return;
    await updateCotation(db, uid, current, params);
    setMsg(`Cotation ${current.ref} mise à jour${current.statut === 'a_valider' || current.statut === 'soumise' ? ' : elle repasse en brouillon, un nouveau visa sera nécessaire' : ''}.`);
  });

  const card = "bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)] mb-3.5";
  const btn = "px-3 py-1.5 rounded-md font-bold text-[11px] cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className={card}>
      <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)] relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[var(--color-green)]">
        <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-green-d)]">💾</div>
        <div className="flex-1">
          <div className="font-bold text-[11.5px] text-[var(--color-txt)]">Cotation client</div>
          <div className="text-[9px] text-[var(--color-txt3)] uppercase tracking-[0.7px] mt-0.5">Enregistrement partagé · numérotation · validation</div>
        </div>
        {current && (
          <span className="font-jetbrains text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: STATUTS[current.statut].color, borderColor: STATUTS[current.statut].color }}>
            {current.ref} · {STATUTS[current.statut].label}
          </span>
        )}
      </div>
      <div className="p-3 px-3.5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <label className="block">
            <span className="text-[11.5px] font-medium text-[var(--color-txt)]">Client (raison sociale)</span>
            <input
              type="text"
              value={params.clientName}
              onChange={e => dispatch({ type: 'SET_PARAM', payload: { key: 'clientName', value: e.target.value } })}
              className="w-full mt-1 p-2 bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-[var(--color-txt)] text-[12px] outline-none focus:border-[var(--color-gold)]"
            />
          </label>
          {status === 'ready' && (
            <div className="flex gap-2 flex-wrap">
              {current && (
                <button type="button" disabled={busy || readOnly} onClick={saveUpdate} className={btn + " bg-[var(--color-gold)] text-[#0d1e38]"}>
                  Mettre à jour {current.ref}
                </button>
              )}
              <button type="button" disabled={busy || readOnly || !params.clientName.trim()} onClick={saveNew} className={btn + " bg-[var(--color-green)] text-white"}>
                {current ? 'Enregistrer comme nouvelle cotation' : 'Enregistrer la cotation'}
              </button>
              {current && (
                <button type="button" disabled={busy} onClick={() => { setCurrentRef(null); setMsg(''); }} className={btn + " bg-transparent border border-[var(--color-border-main)] text-[var(--color-txt2)]"}>
                  Détacher
                </button>
              )}
            </div>
          )}
        </div>

        <div className={"mt-2.5 rounded-md p-2 text-[10.5px] leading-[1.45] border " + (alerts.length ? "bg-[#d4882a14] border-[#d4882a40] text-[#e8aa60]" : "bg-[#27ae7a14] border-[#27ae7a33] text-[#39c98a]")}>
          {alerts.length
            ? <>⚠ Hors délégation, visa du chef de département requis avant envoi au client : {alerts.join(' · ')}</>
            : <>✓ Dans la délégation commerciale : la cotation peut être soumise au client sans visa.</>}
        </div>

        {status === 'off' && (
          <div className="mt-2 text-[10.5px] text-[var(--color-txt3)]">L'enregistrement partagé des cotations fonctionne dans l'application publiée sur Claude.</div>
        )}
        {status === 'loading' && <div className="mt-2 text-[10.5px] text-[var(--color-txt3)]">Connexion à la base partagée…</div>}
        {readOnly && <div className="mt-2 text-[10.5px] text-[var(--color-txt3)]">Votre accès est en lecture seule : demandez un accès Contributeur pour enregistrer des cotations.</div>}
        {msg && <div className="mt-2 text-[10.5px] text-[var(--color-gold-l)]">{msg}</div>}
      </div>
    </div>
  );
}
