/**
 * Sortie des documents : PDF A4, téléchargement et brouillon Gmail.
 *
 * Dans l'application publiée sur Claude, les fichiers passent par la
 * capacité `downloads` (le navigateur bloque les téléchargements directs
 * dans la page) et l'e-mail par le connecteur Gmail de la personne (`mcp`).
 * Ailleurs (AI Studio, poste local), on retombe sur un lien de téléchargement.
 */
import { OfferDocument, DOC_CSS, ARABIC_FONT_URL, footerText } from './offerDoc';
import { useCapability } from './team';

export type SaveOutcome = 'saved' | 'declined' | 'error';

export async function saveFile(filename: string, data: Blob): Promise<{ status: SaveOutcome; message?: string }> {
  const dl = await useCapability('downloads');
  if (dl) {
    try {
      await dl.save({ filename, data });
      return { status: 'saved' };
    } catch (e: any) {
      if (e?.code === 'declined') return { status: 'declined' };
      if (e?.code === 'rate_limited') return { status: 'error', message: 'Une demande d\'enregistrement est déjà ouverte.' };
      return { status: 'error', message: 'Téléchargement indisponible ici.' };
    }
  }
  try {
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return { status: 'saved' };
  } catch {
    return { status: 'error', message: 'Téléchargement impossible dans ce navigateur.' };
  }
}

function ensureFont() {
  if (document.querySelector('link[data-od-font]')) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = ARABIC_FONT_URL; l.setAttribute('data-od-font', '1');
  document.head.appendChild(l);
}

const PAGE_W = 794, PAGE_H = 1123, PAD_X = 42, PAD_TOP = 40, PAD_BOTTOM = 56;

/**
 * Met le document en pages A4 (blocs insécables) puis photographie chaque page dans un PDF.
 */
export async function renderPDF(doc: OfferDocument, onProgress?: (done: number, total: number) => void): Promise<Blob> {
  ensureFont();
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const dir = doc.lang === 'ar' ? 'rtl' : 'ltr';

  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-20000px;top:0;z-index:-1;pointer-events:none';
  const style = document.createElement('style');
  style.textContent = DOC_CSS + `.odp{width:${PAGE_W}px;height:${PAGE_H}px;background:#fff;position:relative;overflow:hidden;padding:${PAD_TOP}px ${PAD_X}px ${PAD_BOTTOM}px}
.odp .flow>*+*{margin-top:0}.odp .ft{position:absolute;left:${PAD_X}px;right:${PAD_X}px;bottom:20px;font-size:6.5pt;color:#777;display:flex;justify-content:space-between;gap:12px}.odp .band{position:absolute;left:0;right:0;bottom:0;height:10px;background:#071530}`;
  host.appendChild(style);
  document.body.appendChild(host);

  try {
    await document.fonts.ready;
    // Laisse la police arabe arriver si elle se charge encore
    if (doc.lang === 'ar') {
      try { await Promise.race([document.fonts.load("10pt 'Noto Sans Arabic'"), new Promise(r => setTimeout(r, 2500))]); } catch { /* police système */ }
    }

    const maxFlow = PAGE_H - PAD_TOP - PAD_BOTTOM;
    const pages: HTMLElement[] = [];
    let flow: HTMLElement | null = null;
    const newPage = () => {
      const p = document.createElement('div');
      p.className = 'odp od'; p.dir = dir;
      const f = document.createElement('div'); f.className = 'flow';
      p.appendChild(f); host.appendChild(p); pages.push(p);
      flow = f;
    };
    newPage();
    for (const b of doc.blocks) {
      if (b.breakBefore && flow!.childElementCount) newPage();
      const el = document.createElement('div');
      el.innerHTML = b.html;
      flow!.appendChild(el);
      if (flow!.scrollHeight > maxFlow && flow!.childElementCount > 1) {
        flow!.removeChild(el);
        newPage();
        flow!.appendChild(el);
      }
    }
    pages.forEach((p, i) => {
      const ft = document.createElement('div');
      ft.className = 'ft';
      ft.innerHTML = `<span dir="${dir}">${footerText(doc)}</span><span style="white-space:nowrap;direction:ltr">${i + 1} / ${pages.length}</span>`;
      p.appendChild(ft);
      const band = document.createElement('div');
      band.className = 'band';
      p.appendChild(band);
    });

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], { scale: 1.35, backgroundColor: '#ffffff', logging: false, useCORS: true, width: PAGE_W, height: PAGE_H, windowWidth: PAGE_W });
      if (i > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.8), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      onProgress?.(i + 1, pages.length);
    }
    pdf.setProperties({ title: doc.title, author: 'Al Salam Bank', subject: doc.title });
    return pdf.output('blob');
  } finally {
    host.remove();
  }
}

/* ---------------------------------------------------------------- Gmail */

export const GMAIL_SERVER = 'Gmail';
export const GMAIL_TOOL = 'create_draft';

export type GmailOutcome =
  | { ok: true; viewUrl?: string }
  | { ok: false; reason: 'absent' | 'not_connected' | 'reauth' | 'refused' | 'too_large' | 'error'; message?: string };

const toBase64 = (blob: Blob) => new Promise<string>((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => res(String(fr.result).split(',')[1] || '');
  fr.onerror = () => rej(fr.error);
  fr.readAsDataURL(blob);
});

export async function gmailAvailable(): Promise<boolean> {
  return !!(await useCapability('mcp'));
}

/** Crée un brouillon dans le Gmail de la personne, PDF joint. Rien n'est envoyé. */
export async function createGmailDraft(input: { to: string[]; subject: string; body: string; pdf: Blob; filename: string }): Promise<GmailOutcome> {
  const mcp = await useCapability('mcp');
  if (!mcp) return { ok: false, reason: 'absent' };
  let fileArgs = false;
  try { fileArgs = !!(await mcp.listTools()).fileArgs; } catch { /* envoi en ligne */ }
  const content = fileArgs
    ? { $file: { data: input.pdf, name: input.filename, type: 'application/pdf' } }
    : await toBase64(input.pdf);
  if (!fileArgs && (content as string).length > 950_000) return { ok: false, reason: 'too_large' };
  try {
    const res = await mcp.callTool(GMAIL_SERVER, GMAIL_TOOL, {
      to: input.to, subject: input.subject, body: input.body,
      attachments: [{ filename: input.filename, mimeType: 'application/pdf', content }],
    });
    const p = res?.payload as { viewUrl?: string } | undefined;
    return { ok: true, viewUrl: p && typeof p === 'object' ? p.viewUrl : undefined };
  } catch (e: any) {
    switch (e?.code) {
      case 'server_not_connected': case 'server_not_found': case 'selection_required':
        return { ok: false, reason: 'not_connected' };
      case 'needs_reauth': return { ok: false, reason: 'reauth' };
      case 'not_in_manifest': case 'blocked_by_policy': case 'approval_required': case 'consent_required':
        return { ok: false, reason: 'refused' };
      case 'not_granted': case 'capability_disabled': case 'capability_removed':
        return { ok: false, reason: 'absent' };
      default:
        return { ok: false, reason: 'error', message: e?.message };
    }
  }
}
