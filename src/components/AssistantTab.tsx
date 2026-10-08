import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStateContext } from '../Store';
import { DEFAULTS } from '../lib/types';
import { useCapability } from '../lib/team';
import {
  explainPrompt, ExplainKind, negotiationPrompt, simulateTool, NegotiationAnswer, sanitizeChanges,
  applyChanges, snapshot, Snapshot, describeChanges, Changes, requestPrompt, ClientRequest, paramsFromRequest, vehLabel, kmAnOf,
} from '../lib/assistant';
import type { Lang } from '../lib/offerDoc';

/* eslint-disable @typescript-eslint/no-explicit-any */
const n0 = (v: number) => Math.round(v).toLocaleString('fr-FR');
const pc = (v: number) => (v * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %';
const card = "bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[10px] overflow-hidden shadow-[0_3px_16px_rgba(0,0,0,0.28)]";
const btn = "px-3 py-1.5 rounded-md font-bold text-[11px] cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed";
const input = "w-full p-2 bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-[var(--color-txt)] text-[12px] outline-none focus:border-[var(--color-gold)]";

type Sample = any;

function errorText(code?: string) {
  switch (code) {
    case 'not_granted': return 'L\'assistant n\'a pas été autorisé pour cette page.';
    case 'sampling_disabled': return 'Claude n\'est pas disponible pour ce compte.';
    case 'rate_limited': return 'Trop de demandes pour l\'instant : réessayez dans un moment.';
    case 'session_expired': return 'Votre session Claude a expiré : reconnectez-vous.';
    case 'refused': return 'Claude n\'a pas pu répondre à cette demande. Reformulez-la.';
    case 'invalid_json': return 'La réponse n\'était pas au bon format. Réessayez.';
    case 'prompt_too_large': return 'Le texte est trop long : collez seulement l\'essentiel.';
    case 'image_rejected': return 'Image refusée : choisissez un fichier JPEG ou PNG plus léger.';
    case 'empty_completion': return 'Claude n\'a rien répondu. Réessayez en simplifiant.';
    default: return 'L\'assistant n\'a pas répondu. Réessayez.';
  }
}

function useSample() {
  const [sample, setSample] = useState<Sample | null | undefined>(undefined);
  const [caps, setCaps] = useState<{ images?: any; tools?: any } | null>(null);
  useEffect(() => {
    let alive = true;
    useCapability('sample').then(async s => {
      if (!alive) return;
      // La capacité est une fonction : la passer telle quelle ferait d'elle un « updater » React
      setSample(() => s);
      if (s?.limits) { try { const l = await s.limits(); if (alive) setCaps(l); } catch { /* sans images */ } }
    });
    return () => { alive = false; };
  }, []);
  return { sample, caps };
}

export function AssistantTab({ onOpen, onFleet }: { onOpen: () => void; onFleet?: () => void }) {
  const { sample, caps } = useSample();
  const [off, setOff] = useState(false);
  const hide = (code?: string) => { if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(code || '')) setOff(true); };

  if (sample === undefined) return <div className={card + " p-6 text-center text-[12px] text-[var(--color-txt3)]"}>Connexion à l'assistant…</div>;
  if (sample === null || off) return (
    <div className={card + " p-6 text-[12px] text-[var(--color-txt2)] leading-relaxed"}>
      <div className="font-bold text-[var(--color-txt)] mb-1">🤖 Assistant indisponible ici</div>
      L'assistant utilise Claude et fonctionne dans l'application publiée sur Claude, une fois que vous l'avez autorisé. Les calculs du simulateur restent disponibles dans les autres onglets.
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-[10.5px] text-[var(--color-txt3)] leading-snug">
        L'assistant utilise Claude sur votre compte. Les chiffres affichés viennent toujours du moteur de calcul du simulateur : Claude choisit des leviers et rédige, l'application recalcule.
      </div>
      <Explain sample={sample} onFatal={hide} />
      <Negotiate sample={sample} tools={!!caps?.tools} onFatal={hide} onOpen={onOpen} />
      <ReadRequest sample={sample} images={caps?.images} onFatal={hide} onOpen={onOpen} onFleet={onFleet} />
    </div>
  );
}

function Header({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 px-3.5 border-b border-[var(--color-border-light)]">
      <div className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--color-gold-d)]">{icon}</div>
      <div className="flex-1">
        <div className="font-bold text-[11.5px] text-[var(--color-txt)]">{title}</div>
        <div className="text-[9.5px] text-[var(--color-txt3)] mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- 19. Expliquer */

function Explain({ sample, onFatal }: { sample: Sample; onFatal: (c?: string) => void }) {
  const { params } = useStateContext();
  const [kind, setKind] = useState<ExplainKind>('comite');
  const [lang, setLang] = useState<Lang>('fr');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const ctl = useRef<AbortController | null>(null);

  const run = async () => {
    ctl.current = new AbortController();
    setBusy(true); setMsg(''); setText('');
    try {
      const res = await sample(explainPrompt(params, kind, lang), { signal: ctl.current.signal, onText: ({ text }: { text: string }) => setText(text) });
      if (res.truncated) setMsg('Réponse coupée : elle est incomplète.');
    } catch (e: any) {
      setText(e?.text ?? '');
      if (e?.code !== 'cancelled') { setMsg(errorText(e?.code)); onFatal(e?.code); }
    }
    setBusy(false);
  };
  const copy = async () => { try { await navigator.clipboard.writeText(text); setMsg('Texte copié.'); } catch { setMsg('Copie impossible : sélectionnez le texte.'); } };

  return (
    <div className={card}>
      <Header icon="📝" title="Expliquer cette offre" sub="Note pour le comité ou argumentaire pour le client, à partir de la simulation en cours" />
      <div className="p-3.5 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Seg value={kind} onChange={setKind} items={[['comite', 'Note au comité'], ['client', 'Argumentaire client']]} />
          <Seg value={lang} onChange={setLang} items={[['fr', 'Français'], ['ar', 'العربية']]} />
          <button type="button" disabled={busy} onClick={run} className={btn + " bg-[var(--color-gold)] text-[#0d1e38]"}>Rédiger</button>
          {busy && <button type="button" onClick={() => ctl.current?.abort()} className={btn + " bg-transparent border border-[var(--color-border-main)] text-[var(--color-txt2)]"}>Arrêter</button>}
          {text && !busy && <button type="button" onClick={copy} className={btn + " bg-transparent border border-[var(--color-border-main)] text-[var(--color-txt2)]"}>Copier</button>}
        </div>
        <div className="text-[10px] text-[var(--color-txt3)]">Offre : {params.clientName || 'client'} · {vehLabel(params)} · {params.p_duree} mois</div>
        {(busy || text) && (
          <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="bg-[var(--color-bg2)] border border-[var(--color-border-light)] rounded-md p-3 text-[12px] leading-relaxed text-[var(--color-txt)] whitespace-pre-wrap min-h-[60px]">
            {text || <span className="text-[var(--color-txt3)]">Rédaction en cours…</span>}
          </div>
        )}
        {msg && <div className="text-[10.5px] text-[#e8aa60]">{msg}</div>}
      </div>
    </div>
  );
}

/* --------------------------------------------------------- 20. Négocier */

function Negotiate({ sample, tools, onFatal, onOpen }: { sample: Sample; tools: boolean; onFatal: (c?: string) => void; onOpen: () => void }) {
  const { params, dispatch } = useStateContext();
  const [demande, setDemande] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [answer, setAnswer] = useState<{ analyse: string; options: { titre: string; argument: string; changes: Changes; s: Snapshot; p: any }[]; base: Snapshot; baseParams: any } | null>(null);
  const ctl = useRef<AbortController | null>(null);

  const run = async () => {
    if (!demande.trim()) return;
    ctl.current = new AbortController();
    setBusy('Analyse de la demande…'); setMsg(''); setAnswer(null);
    const baseParams = params;
    let n = 0;
    try {
      const opts: any = { signal: ctl.current.signal };
      if (tools) opts.tools = [simulateTool(baseParams, (c) => { n++; setBusy(`Essai ${n} : ${describeChanges(baseParams, c)}…`); })];
      const res = await sample.json(negotiationPrompt(baseParams, demande, tools), opts) as NegotiationAnswer;
      const options = (Array.isArray(res?.options) ? res.options : []).slice(0, 4).map(o => {
        const changes = sanitizeChanges(o?.changes);
        const p = applyChanges(baseParams, changes);
        return { titre: String(o?.titre || 'Option'), argument: String(o?.argument || ''), changes, p, s: snapshot(p) };
      });
      if (!options.length) setMsg('Aucune option proposée : précisez la demande du client.');
      setAnswer({ analyse: String(res?.analyse || ''), options, base: snapshot(baseParams), baseParams });
    } catch (e: any) {
      if (e?.code !== 'cancelled') { setMsg(errorText(e?.code)); onFatal(e?.code); }
    }
    setBusy('');
  };

  const apply = (p: any) => { dispatch({ type: 'LOAD', payload: { ...DEFAULTS, ...p } }); onOpen(); };
  const stale = answer && answer.baseParams !== params;

  return (
    <div className={card}>
      <Header icon="🤝" title="Assistant de négociation" sub="Le client demande une baisse ou un loyer plafond : l'assistant teste les leviers et propose des options chiffrées" />
      <div className="p-3.5 space-y-3">
        <textarea className={input + " h-[70px] resize-y"} placeholder="Ex. : le client veut 5 % de moins, ou un loyer de 110 000 DA TTC maximum, sans toucher au kilométrage" value={demande} onChange={e => setDemande(e.target.value)} />
        <div className="flex gap-2 items-center flex-wrap">
          <button type="button" disabled={!!busy || !demande.trim()} onClick={run} className={btn + " bg-[var(--color-gold)] text-[#0d1e38]"}>Proposer des options</button>
          {busy && <button type="button" onClick={() => ctl.current?.abort()} className={btn + " bg-transparent border border-[var(--color-border-main)] text-[var(--color-txt2)]"}>Arrêter</button>}
          {busy && <span className="text-[10.5px] text-[var(--color-txt2)]">⏳ {busy}</span>}
        </div>
        {msg && <div className="text-[10.5px] text-[#e8aa60]">{msg}</div>}
        {answer && (
          <div className="space-y-2.5">
            {stale && <div className="text-[10.5px] text-[#e8aa60]">La simulation a changé depuis cette analyse : les options partent de l'offre d'alors.</div>}
            {answer.analyse && <div className="text-[12px] text-[var(--color-txt)] leading-relaxed">{answer.analyse}</div>}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-[9.5px] uppercase tracking-[0.6px] text-[var(--color-txt3)] border-b border-[var(--color-border-light)]">
                    <th className="p-2 text-left">Option</th><th className="p-2 text-left">Changements</th><th className="p-2 text-right">Loyer TTC</th><th className="p-2 text-right">Écart</th><th className="p-2 text-right">ROE</th><th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--color-border-light)] text-[var(--color-txt2)]">
                    <td className="p-2">Offre actuelle</td><td className="p-2">—</td><td className="p-2 text-right font-jetbrains">{n0(answer.base.loyerTTC)}</td><td className="p-2"></td><td className="p-2 text-right font-jetbrains">{pc(answer.base.roe)}</td><td></td>
                  </tr>
                  {answer.options.map((o, i) => (
                    <tr key={i} className="border-b border-[var(--color-border-light)] text-[var(--color-txt)] align-top">
                      <td className="p-2"><div className="font-bold">{o.titre}</div><div className="text-[10.5px] text-[var(--color-txt2)] mt-0.5 leading-snug">{o.argument}</div></td>
                      <td className="p-2 text-[10.5px] text-[var(--color-txt2)]">{describeChanges(answer.baseParams, o.changes)}</td>
                      <td className="p-2 text-right font-jetbrains text-[var(--color-gold-l)] font-bold">{n0(o.s.loyerTTC)}</td>
                      <td className="p-2 text-right font-jetbrains">{(o.s.loyerTTC - answer.base.loyerTTC >= 0 ? '+' : '') + n0(o.s.loyerTTC - answer.base.loyerTTC)} <span className="text-[var(--color-txt3)]">({((o.s.loyerTTC / answer.base.loyerTTC - 1) * 100).toFixed(1)} %)</span></td>
                      <td className="p-2 text-right font-jetbrains">{pc(o.s.roe)}{o.s.alerts.length > 0 && <span className="ml-1 text-[#e0a04a]" title={o.s.alerts.join(' · ')}>⚠</span>}</td>
                      <td className="p-2 text-right"><button type="button" onClick={() => apply(o.p)} className="text-[10.5px] text-[#5fa0e0] hover:underline cursor-pointer whitespace-nowrap">Appliquer</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[9.5px] text-[var(--color-txt3)]">⚠ = hors délégation, visa du chef de département requis. « Appliquer » charge l'option dans le simulateur ; rien n'est enregistré tant que vous ne sauvegardez pas la cotation.</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------- 21. Lire une demande */

function ReadRequest({ sample, images, onFatal, onOpen, onFleet }: { sample: Sample; images?: { mediaTypes: string[]; maxInputBytes: number }; onFatal: (c?: string) => void; onOpen: () => void; onFleet?: () => void }) {
  const { params, dispatch } = useStateContext();
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [res, setRes] = useState<ClientRequest | null>(null);
  const ctl = useRef<AbortController | null>(null);

  const preview = useMemo(() => res ? paramsFromRequest(params, res) : null, [res, params]);
  const s = useMemo(() => preview ? snapshot(preview) : null, [preview]);

  const run = async () => {
    ctl.current = new AbortController();
    setBusy(true); setMsg(''); setRes(null);
    try {
      const opts: any = { signal: ctl.current.signal };
      if (file) opts.images = file;
      const d = await sample.json(requestPrompt(text, !!file), opts) as ClientRequest;
      if (!d || typeof d !== 'object') throw { code: 'invalid_json' };
      setRes(d);
    } catch (e: any) {
      if (e?.code !== 'cancelled') { setMsg(errorText(e?.code)); onFatal(e?.code); }
    }
    setBusy(false);
  };

  const prefill = () => { if (preview) { dispatch({ type: 'LOAD', payload: { ...DEFAULTS, ...preview } }); onOpen(); } };
  const row = (l: string, v: React.ReactNode) => <div className="flex justify-between gap-3 py-1 border-b border-[var(--color-border-light)] text-[11.5px]"><span className="text-[var(--color-txt3)]">{l}</span><span className="text-[var(--color-txt)] text-right">{v ?? '—'}</span></div>;
  const qty = Number(res?.quantite);

  return (
    <div className={card}>
      <Header icon="📥" title="Lire une demande client" sub="Collez un e-mail ou un courrier, ou joignez une image : l'assistant pré-remplit la simulation" />
      <div className="p-3.5 space-y-3">
        <textarea className={input + " h-[100px] resize-y"} placeholder="Collez ici le texte de la demande du client" value={text} onChange={e => setText(e.target.value)} />
        <div className="flex gap-2 items-center flex-wrap">
          {images && (
            <label className={btn + " bg-transparent border border-[var(--color-border-main)] text-[var(--color-txt2)] inline-block"}>
              {file ? `🖼 ${file.name.slice(0, 28)}` : '🖼 Joindre une image (scan, capture)'}
              <input type="file" accept={images.mediaTypes.join(',')} className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>
          )}
          {file && <button type="button" onClick={() => setFile(null)} className="text-[10.5px] text-[#ef7070] cursor-pointer">Retirer l'image</button>}
          <button type="button" disabled={busy || (!text.trim() && !file)} onClick={run} className={btn + " bg-[var(--color-gold)] text-[#0d1e38]"}>Lire la demande</button>
          {busy && <button type="button" onClick={() => ctl.current?.abort()} className={btn + " bg-transparent border border-[var(--color-border-main)] text-[var(--color-txt2)]"}>Arrêter</button>}
          {busy && <span className="text-[10.5px] text-[var(--color-txt2)]">⏳ Lecture en cours…</span>}
        </div>
        {!images && <div className="text-[9.5px] text-[var(--color-txt3)]">Pour un PDF, copiez-en le texte ici.</div>}
        {msg && <div className="text-[10.5px] text-[#e8aa60]">{msg}</div>}
        {res && preview && s && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {res.resume && <div className="text-[12px] text-[var(--color-txt)] mb-2 leading-relaxed">{res.resume}</div>}
              {row('Client', res.client)}
              {row('Véhicule demandé', res.vehicule_texte)}
              {row('Véhicule retenu', preview.veh_idx >= 0 ? vehLabel(preview) : 'à choisir dans le catalogue')}
              {row('Quantité', res.quantite)}
              {row('Durée', `${preview.p_duree} mois`)}
              {row('Kilométrage', `${n0(kmAnOf(preview))} km/an`)}
              {row('Apport', `${n0(preview.p_apport)} DA`)}
              {res.loyer_max_ttc ? row('Budget du client', `${n0(Number(res.loyer_max_ttc))} DA TTC / mois`) : null}
              {res.options_demandees?.length ? row('Services demandés', res.options_demandees.join(', ')) : null}
            </div>
            <div className="space-y-2">
              <div className="bg-[var(--color-bg2)] border border-[var(--color-border-light)] rounded-md p-3">
                <div className="text-[9.5px] uppercase tracking-[0.8px] text-[var(--color-txt3)]">Premier chiffrage</div>
                <div className="font-jetbrains text-[18px] font-bold text-[var(--color-gold-l)] mt-1">{n0(s.loyerTTC)} DA TTC / mois</div>
                <div className="text-[10.5px] text-[var(--color-txt2)] mt-0.5">{n0(s.loyerHT)} DA HT · ROE {pc(s.roe)}</div>
                {res.loyer_max_ttc ? <div className={"text-[10.5px] mt-1 " + (s.loyerTTC <= Number(res.loyer_max_ttc) ? "text-[#39c98a]" : "text-[#e8aa60]")}>{s.loyerTTC <= Number(res.loyer_max_ttc) ? 'Dans le budget du client.' : `Au-dessus du budget de ${n0(s.loyerTTC - Number(res.loyer_max_ttc))} DA : utilisez l'assistant de négociation.`}</div> : null}
              </div>
              {res.manquants?.length ? <div className="text-[10.5px] text-[#e8aa60] leading-snug">À demander au client : {res.manquants.join(' · ')}</div> : null}
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={prefill} className={btn + " bg-[var(--color-green)] text-white"}>Pré-remplir la simulation</button>
                {qty > 1 && onFleet && <button type="button" onClick={() => { prefill(); onFleet(); }} className={btn + " bg-transparent border border-[var(--color-border-main)] text-[var(--color-txt2)]"}>Pré-remplir puis aller au devis flotte ({qty} véhicules)</button>}
              </div>
              <div className="text-[9.5px] text-[var(--color-txt3)]">Les autres paramètres (marge, services, VR) restent ceux de la simulation en cours. Vérifiez avant d'envoyer une offre.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Seg<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: [T, string][] }) {
  return (
    <div className="flex rounded-md overflow-hidden border border-[var(--color-border-main)]">
      {items.map(([v, l]) => (
        <button key={v} type="button" onClick={() => onChange(v)} className={"px-2.5 py-1.5 text-[11px] font-bold cursor-pointer " + (value === v ? "bg-[var(--color-gold)] text-[#0d1e38]" : "bg-transparent text-[var(--color-txt2)]")}>{l}</button>
      ))}
    </div>
  );
}
