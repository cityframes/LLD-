import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DocOptions, Lang, OfferDocument, documentHTML } from '../lib/offerDoc';
import { renderPDF, saveFile, createGmailDraft, gmailAvailable } from '../lib/deliver';

interface Props {
  build: (opts: DocOptions) => OfferDocument;
  email: (lang: Lang) => { subject: string; body: string };
  onClose: () => void;
}

const btn = "px-3.5 py-2 rounded-md font-bold text-[11px] cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed";
const input = "w-full p-2 bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-[var(--color-txt)] text-[12px] outline-none focus:border-[var(--color-gold)]";

export function OfferDialog({ build, email, onClose }: Props) {
  const [lang, setLang] = useState<Lang>('fr');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState<{ t: string; ok?: boolean } | null>(null);
  const [gmail, setGmail] = useState(false);
  const [to, setTo] = useState('');
  const [mail, setMail] = useState(() => email('fr'));
  const frame = useRef<HTMLIFrameElement>(null);
  const pdfCache = useRef<Record<string, Blob>>({});

  const doc = useMemo(() => build({ lang }), [build, lang]);
  const html = useMemo(() => documentHTML(doc), [doc]);
  const key = lang;

  useEffect(() => { gmailAvailable().then(setGmail); }, []);
  useEffect(() => { setMail(email(lang)); }, [lang, email]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const getPdf = async () => {
    if (pdfCache.current[key]) return pdfCache.current[key];
    setBusy('Mise en page du PDF…');
    const blob = await renderPDF(doc, (d, n) => setBusy(`Mise en page du PDF : page ${d} sur ${n}…`));
    pdfCache.current[key] = blob;
    return blob;
  };

  const downloadPdf = async () => {
    setMsg(null);
    try {
      const blob = await getPdf();
      setBusy('');
      const r = await saveFile(doc.filename + '.pdf', blob);
      setMsg(r.status === 'saved' ? { t: 'PDF enregistré.', ok: true } : r.status === 'declined' ? { t: 'Enregistrement annulé.' } : { t: r.message || 'Enregistrement impossible.' });
    } catch {
      setMsg({ t: 'La création du PDF a échoué. Essayez « Imprimer », puis « Enregistrer au format PDF ».' });
    }
    setBusy('');
  };

  const downloadHtml = async () => {
    setMsg(null);
    const r = await saveFile(doc.filename + '.html', new Blob([html], { type: 'text/html' }));
    setMsg(r.status === 'saved' ? { t: 'Fichier enregistré : ouvrez-le dans le navigateur pour l\'imprimer.', ok: true } : r.status === 'declined' ? { t: 'Enregistrement annulé.' } : { t: r.message || 'Enregistrement impossible.' });
  };

  const print = () => {
    setMsg(null);
    try {
      const w = frame.current?.contentWindow;
      if (!w) throw new Error();
      w.focus(); w.print();
    } catch {
      setMsg({ t: 'L\'impression est bloquée ici : utilisez « Télécharger le PDF ».' });
    }
  };

  const draft = async () => {
    setMsg(null);
    const list = to.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
    if (list.some(a => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a))) { setMsg({ t: 'Adresse e-mail du destinataire invalide.' }); return; }
    try {
      const pdf = await getPdf();
      setBusy('Création du brouillon dans Gmail…');
      const r = await createGmailDraft({ to: list, subject: mail.subject, body: mail.body, pdf, filename: doc.filename + '.pdf' });
      if (r.ok) setMsg({ t: 'Brouillon créé dans votre Gmail avec le PDF joint. Relisez-le puis envoyez-le depuis Gmail.', ok: true });
      else {
        const reason = (r as Extract<typeof r, { ok: false }>).reason;
        setMsg({
        t: reason === 'not_connected' ? 'Gmail n\'est pas connecté à votre compte Claude : ajoutez-le dans Paramètres, puis Connecteurs.'
          : reason === 'reauth' ? 'Reconnectez Gmail dans Paramètres, puis Connecteurs.'
          : reason === 'refused' ? 'L\'accès à Gmail n\'a pas été autorisé pour cette page.'
          : reason === 'too_large' ? 'Le PDF est trop lourd pour être joint ici : téléchargez le PDF et joignez-le à la main.'
          : reason === 'absent' ? 'Gmail n\'est pas disponible ici.'
          : 'Gmail n\'a pas répondu. Vérifiez vos brouillons avant de réessayer.',
        });
      }
    } catch {
      setMsg({ t: 'La création du PDF a échoué.' });
    }
    setBusy('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 md:p-6" onClick={onClose}>
      <div className="bg-[var(--color-card)] border border-[var(--color-border-main)] rounded-xl w-full max-w-[1100px] max-h-full flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()} role="dialog" aria-label="Offre client">
        <div className="flex flex-wrap items-center gap-3 p-3 px-4 border-b border-[var(--color-border-light)]">
          <div className="font-bold text-[13px] text-[var(--color-gold-l)] flex-1 min-w-[160px]">📄 {doc.title}</div>
          <div className="flex rounded-md overflow-hidden border border-[var(--color-border-main)]">
            {(['fr', 'ar'] as Lang[]).map(l => (
              <button key={l} type="button" onClick={() => setLang(l)} className={"px-3 py-1.5 text-[11px] font-bold cursor-pointer " + (lang === l ? "bg-[var(--color-gold)] text-[#0d1e38]" : "bg-transparent text-[var(--color-txt2)]")}>
                {l === 'fr' ? 'Français' : 'العربية'}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} className="text-[var(--color-txt3)] hover:text-[var(--color-txt)] text-[18px] leading-none px-1 cursor-pointer" aria-label="Fermer">×</button>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_300px]">
          <div className="bg-[#5a6270] p-2 md:p-3 min-h-[300px] h-[46vh] lg:h-[72vh]">
            <iframe ref={frame} title="Aperçu de l'offre" srcDoc={html} className="w-full h-full bg-white rounded shadow" />
          </div>
          <div className="p-3.5 space-y-3 overflow-y-auto lg:max-h-[72vh] border-t lg:border-t-0 lg:border-l border-[var(--color-border-light)]">
            <div className="space-y-2">
              <button type="button" disabled={!!busy} onClick={downloadPdf} className={btn + " w-full bg-[var(--color-gold)] text-[#0d1e38]"}>⬇ Télécharger le PDF</button>
              <div className="flex gap-2">
                <button type="button" disabled={!!busy} onClick={print} className={btn + " flex-1 bg-transparent border border-[var(--color-border-main)] text-[var(--color-txt2)]"}>🖨 Imprimer</button>
                <button type="button" disabled={!!busy} onClick={downloadHtml} className={btn + " flex-1 bg-transparent border border-[var(--color-border-main)] text-[var(--color-txt2)]"}>Fichier HTML</button>
              </div>
            </div>

            {gmail && (
              <div className="pt-3 border-t border-[var(--color-border-light)] space-y-2">
                <div className="font-bold text-[11.5px] text-[var(--color-txt)]">✉ Brouillon d'e-mail dans Gmail</div>
                <div className="text-[10px] text-[var(--color-txt3)] leading-snug">Le brouillon est créé dans votre Gmail avec le PDF joint. Rien n'est envoyé : vous relisez et envoyez vous-même.</div>
                <input className={input} placeholder="Destinataire : client@entreprise.dz" value={to} onChange={e => setTo(e.target.value)} />
                <input className={input} value={mail.subject} onChange={e => setMail({ ...mail, subject: e.target.value })} />
                <textarea className={input + " h-[150px] resize-y leading-snug"} dir={lang === 'ar' ? 'rtl' : 'ltr'} value={mail.body} onChange={e => setMail({ ...mail, body: e.target.value })} />
                <button type="button" disabled={!!busy || !to.trim()} onClick={draft} className={btn + " w-full bg-[var(--color-blue)] text-white"}>Créer le brouillon</button>
              </div>
            )}

            {busy && <div className="text-[10.5px] text-[var(--color-txt2)]">⏳ {busy}</div>}
            {msg && <div className={"text-[10.5px] leading-snug " + (msg.ok ? "text-[#39c98a]" : "text-[#e8aa60]")}>{msg.t}</div>}
            <div className="text-[9.5px] text-[var(--color-txt3)] leading-snug pt-2 border-t border-[var(--color-border-light)]">
              Les prestations listées suivent les services chiffrés dans la simulation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
