/**
 * Documents remis au client : offre Ijara (un véhicule) et devis flotte,
 * en français ou en arabe, avec en annexe les conditions générales de
 * l'Ijara opérationnelle.
 *
 * Un document est une suite de blocs HTML insécables : le même modèle sert à
 * l'aperçu, à l'impression et au PDF (mis en page A4 bloc par bloc).
 */
import { SimulatorParams, CATALOG } from "./types";
import { computeEngine } from "./engine";
import { CG_IJARA, CG_TITRE } from "./cgIjara";

export type Lang = 'fr' | 'ar';
export interface DocOptions { lang: Lang; annexeCG: boolean }
export interface DocBlock { html: string; breakBefore?: boolean }
export interface OfferDocument {
  title: string;
  filename: string;
  lang: Lang;
  ref: string;
  blocks: DocBlock[];
}

type Engine = ReturnType<typeof computeEngine>;

export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const n0 = (v: number) => Math.round(v).toLocaleString('fr-FR').replace(/ | /g, ' ');
const n2 = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/ | /g, ' ');

const T = {
  fr: {
    bank: 'Al Salam Bank', bankSub: 'Banque participative · Location Ijara longue durée',
    offre: 'Offre de location Ijara', flotte: 'Devis flotte · Location Ijara',
    sousTitre: 'Location longue durée de véhicules · Ijara opérationnelle',
    ref: 'Référence', date: 'Date', validite: 'Offre valable 15 jours',
    bailleur: 'Le bailleur (Al Mu\'ajjir)', preneur: 'Le preneur (Al Musta\'jir)',
    denom: 'Dénomination', activite: 'Activité', banquePart: 'Banque participative agréée',
    nom: 'Raison sociale', adresse: 'Adresse', rc: 'RC / NIF', represente: 'Représenté par',
    loyerTTC: 'Loyer mensuel tout compris (TTC)', loyerTTCsub: 'Ijara, entretien, Takaful, taxes',
    ht: 'Loyer mensuel HT', tva: 'TVA mensuelle (19 %)', ttc: 'Loyer mensuel TTC', parMois: 'DA / mois',
    vehicule: 'Véhicule loué', modele: 'Modèle', version: 'Version', cv: 'Puissance fiscale', prix: 'Prix d\'acquisition HT',
    conditions: 'Conditions du contrat', duree: 'Durée', mois: 'mois', kmTotal: 'Kilométrage total', kmAn: 'Kilométrage annuel',
    apport: 'Apport initial', tolerance: 'Tolérance kilométrique', depot: 'Hamish Jiddiyyah (dépôt de garantie)', depotRest: 'restitué en fin de contrat',
    services: 'Prestations incluses dans le loyer',
    kmSup: 'Kilomètre supplémentaire', kmSupTxt: (f: string, p: string) => `Au-delà du kilométrage contractuel (tolérance ${f} km), chaque kilomètre est facturé ${p} DA HT (article 7.3 des conditions générales).`,
    option: 'Option d\'achat en fin de contrat', vrBrute: 'Valeur résiduelle HT', vrFrais: 'Frais de remise en état HT', vrNette: 'Prix de cession HT', vrTTC: 'Prix de cession TTC',
    optionTxt: 'La TVA de 19 % s\'applique au moment de la levée d\'option. Le preneur reste libre de racheter le véhicule ou de le restituer.',
    recap: 'Récapitulatif financier', element: 'Élément', taxes: 'TVA', loyerMensuel: 'Loyer mensuel', totalLoyers: (d: number) => `Total des loyers (${d} mois)`,
    optionLigne: 'Option d\'achat', coutTotal: 'Coût total de l\'opération', recapNote: 'Coût total = loyers TTC, plus le prix de cession si l\'option est levée ; le Hamish Jiddiyyah est restitué. Montants en dinars algériens.',
    clauses: 'Conditions de l\'offre',
    clausesTxt: (annexe: boolean) => `La présente offre constitue l'« offre de location » (conditions particulières) au sens des conditions générales de l'Ijara opérationnelle${annexe ? ', jointes en annexe' : ''}, qui en font partie intégrante. Elle ne devient un contrat qu'après acceptation du dossier du preneur par Al Salam Bank. Le véhicule reste la propriété exclusive de la banque pendant toute la durée de la location ; le preneur en a l'usage sans droit de propriété. Toute modification des conditions tarifaires requiert l'accord écrit des deux parties. Offre valable 15 jours à compter de sa date d'émission.`,
    signClient: 'Pour le preneur', signBanque: 'Pour Al Salam Bank, le bailleur',
    signClientTxt: 'Lu et approuvé : je reconnais avoir pris connaissance de la présente offre et des conditions générales, et j\'en accepte les termes.',
    signBanqueTxt: 'Sous réserve de l\'acceptation du dossier et de la réalisation des conditions suspensives.',
    signLigne: 'Nom, qualité et signature', signDate: 'Date', cachet: 'Cachet',
    footer: (ref: string) => `Al Salam Bank · Banque participative · Offre ${ref} · Montants en dinars algériens (DA) · Document non contractuel avant signature des deux parties`,
    annexe: 'Annexe : conditions générales de l\'Ijara opérationnelle', annexeNote: 'Texte de référence en langue arabe.',
    lignes: 'Détail de la flotte', qte: 'Qté', unitHT: 'Loyer HT unitaire', unitTTC: 'Loyer TTC unitaire', totalMois: 'Total TTC / mois', vrUnit: 'Prix de cession HT unitaire',
    totalFlotte: 'Total flotte', nbVeh: 'Véhicules', totalHT: 'Loyers HT / mois', totalTVA: 'TVA / mois', totalTTC: 'Loyers TTC / mois', totalContrat: 'Total des loyers TTC sur les contrats', totalDepot: 'Hamish Jiddiyyah total', financement: 'Valeur d\'acquisition HT totale',
    flotteTxt: 'Chaque véhicule fait l\'objet d\'un contrat de location distinct, régi par les conditions générales (article 1).',
    manuel: 'Saisie manuelle',
  },
  ar: {
    bank: 'بنك السلام الجزائر', bankSub: 'بنك تشاركي · الإجارة التشغيلية طويلة الأجل',
    offre: 'عرض إيجار', flotte: 'عرض إيجار أسطول مركبات',
    sousTitre: 'إيجار المركبات طويل الأجل · الإجارة التشغيلية',
    ref: 'المرجع', date: 'التاريخ', validite: 'العرض صالح لمدة 15 يوماً',
    bailleur: 'المؤجِّر', preneur: 'المستأجر',
    denom: 'التسمية', activite: 'النشاط', banquePart: 'بنك تشاركي معتمد',
    nom: 'الاسم / التسمية الاجتماعية', adresse: 'العنوان', rc: 'السجل التجاري / NIF', represente: 'ممثَّل من طرف',
    loyerTTC: 'بدل الإيجار الشهري الشامل (متضمن الرسوم)', loyerTTCsub: 'الإجارة، الصيانة، التكافل، الرسوم',
    ht: 'بدل الإيجار الشهري دون رسوم', tva: 'الرسم على القيمة المضافة (19 %)', ttc: 'بدل الإيجار الشهري متضمن الرسوم', parMois: 'دج / شهرياً',
    vehicule: 'المركبة المؤجَّرة', modele: 'الطراز', version: 'النسخة', cv: 'القوة الجبائية', prix: 'سعر الاقتناء دون رسوم',
    conditions: 'شروط العقد', duree: 'المدة', mois: 'شهراً', kmTotal: 'المسافة الإجمالية', kmAn: 'المسافة السنوية',
    apport: 'الدفعة الأولى', tolerance: 'هامش المسافة المسموح به', depot: 'هامش الجدية (مبلغ الضمان)', depotRest: 'يُرَدّ عند نهاية العقد',
    services: 'الخدمات المشمولة في بدل الإيجار',
    kmSup: 'الكيلومتر الإضافي', kmSupTxt: (f: string, p: string) => `بعد تجاوز المسافة المتعاقد عليها (مع هامش ${f} كم)، يُفوتَر كل كيلومتر إضافي بمبلغ ${p} دج دون رسوم (المادة 7.3 من الشروط العامة).`,
    option: 'خيار الشراء عند نهاية العقد', vrBrute: 'القيمة المتبقية دون رسوم', vrFrais: 'تكاليف إعادة التهيئة دون رسوم', vrNette: 'سعر التنازل دون رسوم', vrTTC: 'سعر التنازل متضمن الرسوم',
    optionTxt: 'يُطبَّق الرسم على القيمة المضافة (19 %) عند ممارسة خيار الشراء. ويبقى للمستأجر حرية شراء المركبة أو إعادتها.',
    recap: 'الملخص المالي', element: 'البيان', taxes: 'الرسم', loyerMensuel: 'بدل الإيجار الشهري', totalLoyers: (d: number) => `مجموع بدلات الإيجار (${d} شهراً)`,
    optionLigne: 'خيار الشراء', coutTotal: 'التكلفة الإجمالية للعملية', recapNote: 'التكلفة الإجمالية = بدلات الإيجار متضمنة الرسوم، مضافاً إليها سعر التنازل عند ممارسة الخيار؛ ويُرَدّ هامش الجدية. المبالغ بالدينار الجزائري.',
    clauses: 'شروط العرض',
    clausesTxt: (annexe: boolean) => `يُعتبر هذا العرض «عرض الإيجار» (الشروط الخاصة) بمفهوم الشروط العامة للإجارة التشغيلية${annexe ? ' المرفقة به' : ''}، والتي تُشكّل جزءاً لا يتجزأ منه. ولا يصبح عقداً نافذاً إلا بعد قبول ملف المستأجر من طرف بنك السلام الجزائر. وتبقى المركبة ملكية خالصة للمؤجِّر طوال مدة الإيجار، وللمستأجر حق استعمالها دون أي حق ملكية. ولا يُعدَّل أي شرط من الشروط المالية إلا باتفاق كتابي بين الطرفين. العرض صالح لمدة 15 يوماً من تاريخ إصداره.`,
    signClient: 'عن المستأجر', signBanque: 'عن المؤجِّر، بنك السلام الجزائر',
    signClientTxt: 'قرأت ووافقت: أُقرّ بأنني اطّلعت على هذا العرض وعلى الشروط العامة، وأقبل بنودها.',
    signBanqueTxt: 'مع مراعاة قبول الملف وتحقق الشروط الواقفة.',
    signLigne: 'الاسم والصفة والتوقيع', signDate: 'التاريخ', cachet: 'الختم',
    footer: (ref: string) => `بنك السلام الجزائر · بنك تشاركي · العرض ${ref} · المبالغ بالدينار الجزائري (دج) · وثيقة غير ملزمة قبل توقيع الطرفين`,
    annexe: 'ملحق: الشروط العامة للإجارة التشغيلية', annexeNote: '',
    lignes: 'تفاصيل الأسطول', qte: 'العدد', unitHT: 'البدل الشهري للوحدة دون رسوم', unitTTC: 'البدل الشهري للوحدة متضمن الرسوم', totalMois: 'المجموع الشهري متضمن الرسوم', vrUnit: 'سعر التنازل للوحدة دون رسوم',
    totalFlotte: 'مجموع الأسطول', nbVeh: 'عدد المركبات', totalHT: 'البدلات الشهرية دون رسوم', totalTVA: 'الرسم الشهري', totalTTC: 'البدلات الشهرية متضمنة الرسوم', totalContrat: 'مجموع البدلات متضمنة الرسوم طوال العقود', totalDepot: 'مجموع هامش الجدية', financement: 'مجموع قيمة الاقتناء دون رسوم',
    flotteTxt: 'تكون كل مركبة موضوع عقد إيجار مستقل، يخضع للشروط العامة (المادة 1).',
    manuel: 'إدخال يدوي',
  },
};

const DA = { fr: 'DA', ar: 'دج' };

/** Prestations réellement comprises dans le loyer, d'après les paramètres. */
function servicesList(p: SimulatorParams, lang: Lang): string[] {
  const fr = lang === 'fr';
  const s: string[] = [fr ? 'Plan d\'entretien constructeur (révisions tous les 10 000 km, réseau TALHA AUTO)' : 'برنامج الصيانة الدورية للمصنِّع (كل 10 000 كم، شبكة TALHA AUTO)'];
  if (p.c_pneu > 0) s.push(fr ? 'Remplacement des pneumatiques selon l\'usure' : 'استبدال الإطارات حسب الاهتراء');
  s.push(fr ? 'Takaful dommages et responsabilité civile' : 'التكافل ضد الأضرار والمسؤولية المدنية');
  if (p.p_vignette > 0) s.push(fr ? 'Vignette automobile' : 'قسيمة السيارات');
  if (p.c_ct > 0) s.push(fr ? 'Contrôle technique périodique' : 'الفحص التقني الدوري');
  if (p.c_assistance > 0) s.push(fr ? 'Assistance et remorquage 24 h/24' : 'المساعدة وسحب المركبة على مدار الساعة');
  if (p.c_veh_d > 0 && p.c_veh_j > 0) s.push(fr ? `Véhicule de remplacement (jusqu'à ${p.c_veh_j} jours par an)` : `سيارة بديلة (حتى ${p.c_veh_j} يوماً في السنة)`);
  if (p.c_mob > 0) s.push(fr ? 'Mobilité et télématique' : 'خدمات التنقل والتتبع');
  if (p.c_gestion > 0) s.push(fr ? 'Gestion de flotte' : 'تسيير الأسطول');
  return s;
}

function vehicleOf(p: SimulatorParams, lang: Lang) {
  const v = p.veh_idx >= 0 ? CATALOG[p.veh_idx] : undefined;
  return v ? { model: v.model, version: v.version, cv: v.cv } : { model: T[lang].manuel, version: '—', cv: '—' };
}

/* --------------------------------------------------------------- styles */

export const DOC_CSS = `
.od{font-family:'Mulish','Segoe UI',Arial,sans-serif;font-size:9.5pt;line-height:1.45;color:#1a1a1a}
.od[dir=rtl],.od [dir=rtl]{font-family:'Noto Naskh Arabic','Segoe UI','Tahoma',Arial,sans-serif;line-height:1.6}
.od *{box-sizing:border-box}
.od .hd{border-bottom:3px solid #c9a84c;padding-bottom:10px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.od .logo{display:flex;align-items:center;gap:10px}
.od .mark{width:44px;height:44px;border-radius:8px;background:linear-gradient(135deg,#c9a84c,#9a6c1a);display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-size:22pt;font-weight:700;color:#fff}
.od .bank{font-family:Georgia,serif;font-size:17pt;font-weight:700;color:#0d1e38}
.od[dir=rtl] .bank{font-family:'Noto Naskh Arabic',serif}
.od .banksub{font-size:7.5pt;color:#666;margin-top:2px}
.od .refb{text-align:end}
.od .lbl{font-size:7pt;color:#888;text-transform:uppercase;letter-spacing:.5px}
.od[dir=rtl] .lbl{text-transform:none;letter-spacing:0;font-size:7.5pt}
.od .refv{font-family:'JetBrains Mono','Courier New',monospace;font-size:12pt;font-weight:700;color:#0d1e38;direction:ltr;unicode-bidi:embed}
.od .banner{background:linear-gradient(135deg,#0d1e38,#1a3a60);color:#fff;border-radius:6px;padding:10px 14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:12px}
.od .tmain{font-size:14pt;font-weight:700}
.od .tsub{font-size:8pt;color:#e0c47a;margin-top:2px}
.od .valid{color:#ffb0a0;font-weight:700;font-size:8pt;margin-top:3px}
.od .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.od .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
.od .grid4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px}
.od .party{border:1.5px solid #0d1e38;border-radius:5px;overflow:hidden}
.od .phead{background:#0d1e38;color:#e0c47a;font-size:8pt;font-weight:700;padding:4px 10px}
.od .pbody{padding:7px 10px}
.od .prow{display:flex;gap:6px;margin-bottom:3px;font-size:8.5pt;align-items:baseline}
.od .prow .lbl{min-width:82px}
.od .fill{flex:1;border-bottom:1px dotted #aaa;min-height:13px}
.od .strong{font-weight:700}
.od .hl{background:#fdf9ee;border:2px solid #c9a84c;border-radius:6px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;margin:10px 0 8px}
.od .hlv{font-family:'JetBrains Mono','Courier New',monospace;font-size:18pt;font-weight:700;color:#9a6c1a;direction:ltr;unicode-bidi:embed}
.od .box{background:#f7f8fa;border:1px solid #e0e0e0;border-radius:4px;padding:6px 10px}
.od .val{font-size:9.5pt;font-weight:700;color:#1a1a1a}
.od .ltr{direction:ltr;unicode-bidi:embed;display:inline-block}
.od .num{font-family:'JetBrains Mono','Courier New',monospace;direction:ltr;unicode-bidi:embed}
.od .c-green{color:#1a7a50}.od .c-blue{color:#1a4a8a}.od .c-gold{color:#9a6c1a}.od .c-orange{color:#a05a10}
.od .stitle{font-size:8.5pt;font-weight:700;color:#fff;background:#2d6fbd;padding:4px 10px;border-radius:4px;margin:10px 0 6px}
.od[dir=ltr] .stitle{text-transform:uppercase;letter-spacing:.6px;font-size:8pt}
.od .s-gold{background:#9a6c1a}.od .s-green{background:#27ae7a}.od .s-dark{background:#0d1e38}.od .s-violet{background:#7d3c98}
.od .svc{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.od .svc div{font-size:8pt;padding:3px 7px;background:#f8f9fa;border:1px solid #e8e8e8;border-radius:3px}
.od .svc div::before{content:'✓ ';color:#27ae7a;font-weight:700}
.od .note{font-size:7.5pt;color:#555;margin-top:5px;background:#fffdf5;padding:5px 8px;border-radius:3px;border-inline-start:3px solid #c9a84c}
.od table{width:100%;border-collapse:collapse;font-size:8.3pt}
.od th{background:#eef1f6;color:#0d1e38;font-weight:700;padding:5px 6px;text-align:start;font-size:7.6pt}
.od td{padding:5px 6px;border-bottom:1px solid #eee}
.od td.r,.od th.r{text-align:end}
.od td.r{white-space:nowrap}
.od tr.tot td{background:#0d1e38;color:#f0dc9c;font-weight:800;border:none}
.od .clauses{background:#fff9f0;border:1px solid #f0d080;border-radius:5px;padding:8px 10px;font-size:7.8pt;color:#444;line-height:1.55}
.od .signs{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
.od .sign{border:1.5px solid #ccc;border-radius:5px;padding:10px;min-height:118px;background:#fafafa}
.od .signt{font-size:8.5pt;font-weight:700;color:#0d1e38;margin-bottom:3px}
.od .signs .sub{font-size:7.3pt;color:#777;line-height:1.4}
.od .sline{border-bottom:1px solid #aaa;margin-top:34px;margin-bottom:4px}
.od .ann-h{font-size:13pt;font-weight:700;color:#0d1e38;border-bottom:3px solid #c9a84c;padding-bottom:6px;margin-bottom:4px}
.od .ann-n{font-size:8pt;color:#777;margin-bottom:8px}
.od .cg{direction:rtl;text-align:justify;font-family:'Noto Naskh Arabic','Segoe UI','Tahoma',Arial,sans-serif;font-size:8.6pt;line-height:1.62;color:#222}
.od .cg-h{font-size:10pt;font-weight:700;color:#fff;background:#0d1e38;padding:3px 10px;border-radius:3px;margin-top:9px;margin-bottom:3px}
.od .cg-s{font-weight:700;color:#9a6c1a;margin-top:5px}
.od .cg-li{padding-inline-start:14px;position:relative}
.od .cg-li::before{content:'•';position:absolute;inset-inline-start:3px;color:#9a6c1a}
.od .cg-p{margin:2px 0}
`;

/* ------------------------------------------------------------- fragments */

function header(lang: Lang, ref: string, date: string, titre: string): DocBlock[] {
  const t = T[lang];
  return [{
    html: `<div class="hd"><div class="logo"><div class="mark">ﺍ</div><div><div class="bank">${t.bank}</div><div class="banksub">${t.bankSub}</div></div></div>
<div class="refb"><div class="lbl">${t.ref}</div><div class="refv">${esc(ref)}</div></div></div>
<div class="banner"><div><div class="tmain">${titre}</div><div class="tsub">${t.sousTitre}</div></div>
<div style="text-align:end"><div style="font-size:8.5pt">${t.date} : <span class="num">${esc(date)}</span></div><div class="valid">${t.validite}</div></div></div>`,
  }];
}

function parties(lang: Lang, client: string): DocBlock {
  const t = T[lang];
  const row = (l: string, v?: string) => `<div class="prow"><span class="lbl">${l}</span>${v ? `<span class="strong">${v}</span>` : '<span class="fill"></span>'}</div>`;
  return {
    html: `<div class="grid2">
<div class="party"><div class="phead">${t.bailleur}</div><div class="pbody">${row(t.denom, t.bank)}${row(t.activite, t.banquePart)}${row(t.represente)}</div></div>
<div class="party"><div class="phead">${t.preneur}</div><div class="pbody">${row(t.nom, esc(client))}${row(t.adresse)}${row(t.rc)}${row(t.represente)}</div></div></div>`,
  };
}

function clausesAndSignatures(lang: Lang, annexe: boolean): DocBlock[] {
  const t = T[lang];
  const sign = (title: string, sub: string) => `<div class="sign"><div class="signt">${title}</div><div class="sub">${sub}</div><div class="sline"></div><div class="lbl">${t.signLigne}</div><div class="lbl" style="margin-top:6px">${t.signDate} : ____ / ____ / ________</div><div class="lbl" style="margin-top:4px">${t.cachet} :</div></div>`;
  return [
    { html: `<div class="stitle s-dark">${t.clauses}</div><div class="clauses">${t.clausesTxt(annexe)}</div>` },
    { html: `<div class="signs">${sign(t.signClient, t.signClientTxt)}${sign(t.signBanque, t.signBanqueTxt)}</div>` },
  ];
}

function annexBlocks(lang: Lang): DocBlock[] {
  const t = T[lang];
  const out: DocBlock[] = [{
    breakBefore: true,
    html: `<div class="ann-h">${t.annexe}</div>${t.annexeNote ? `<div class="ann-n">${t.annexeNote}</div>` : ''}<div class="cg"><div style="text-align:center;font-size:12pt;font-weight:700;margin:4px 0 6px">${CG_TITRE}</div></div>`,
  }];
  for (const [k, txt] of CG_IJARA) {
    const cls = k === 'h' ? 'cg-h' : k === 's' ? 'cg-s' : k === 'li' ? 'cg-li' : 'cg-p';
    out.push({ html: `<div class="cg"><div class="${cls}">${esc(txt)}</div></div>` });
  }
  return out;
}

/* ------------------------------------------------------------ documents */

export function offerDocument(r: Engine, params: SimulatorParams, opts: DocOptions): OfferDocument {
  const { lang } = opts;
  const t = T[lang];
  const da = DA[lang];
  const ref = params.clientRef || 'LLD';
  const date = params.clientDate || new Date().toLocaleDateString('fr-FR');
  const veh = vehicleOf(params, lang);
  const kmAn = Math.round(r.kmTotal / r.duree * 12);
  const opt = params.optRevente;
  const box = (l: string, v: string, c = '') => `<div class="box"><div class="lbl">${l}</div><div class="val ${c}">${v}</div></div>`;
  const money = (v: number, c = '') => `<span class="num ${c}">${n0(v)}</span> ${da}`;

  const blocks: DocBlock[] = [
    ...header(lang, ref, date, t.offre),
    parties(lang, params.clientName || ''),
    {
      html: `<div class="hl"><div><div style="font-size:10.5pt;font-weight:700;color:#0d1e38">${t.loyerTTC}</div><div style="font-size:7.5pt;color:#888">${t.loyerTTCsub}</div></div>
<div style="text-align:end"><div class="hlv">${n0(r.loyerTTC)}</div><div style="font-size:8pt;color:#888">${t.parMois}</div></div></div>
<div class="grid3">${box(t.ht, money(r.loyerHT), 'c-green')}${box(t.tva, money(r.tvaFi), 'c-orange')}${box(t.ttc, money(r.loyerTTC), 'c-blue')}</div>`,
    },
    { html: `<div class="stitle">${t.vehicule}</div><div class="grid4">${box(t.modele, `<span class="ltr">${esc(veh.model)}</span>`)}${box(t.version, `<span class="ltr">${esc(veh.version)}</span>`)}${box(t.cv, `<span class="ltr">${esc(veh.cv)}</span>`)}${box(t.prix, money(r.achat), 'c-gold')}</div>` },
    {
      html: `<div class="stitle">${t.conditions}</div><div class="grid3">${box(t.duree, `<span class="num">${r.duree}</span> ${t.mois}`, 'c-blue')}${box(t.kmTotal, `<span class="num">${n0(r.kmTotal)}</span> ${lang === 'fr' ? 'km' : 'كم'}`)}${box(t.kmAn, `<span class="num">${n0(kmAn)}</span> ${lang === 'fr' ? 'km/an' : 'كم/سنة'}`)}
${box(t.apport, money(r.apport))}${box(t.depot, money(r.depot) + ` <span style="font-weight:400;font-size:7.5pt;color:#777">(${t.depotRest})</span>`, 'c-green')}${box(t.tolerance, `<span class="num">${n0(params.p_km_franchise)}</span> ${lang === 'fr' ? 'km' : 'كم'}`)}</div>`,
    },
    { html: `<div class="stitle s-green">${t.services}</div><div class="svc">${servicesList(params, lang).map(s => `<div>${s}</div>`).join('')}</div>` },
    { html: `<div class="stitle s-violet">${t.kmSup}</div><div class="grid3">${box(t.kmSup, `<span class="num">${n2(r.kmSup)}</span> ${da}`, 'c-gold')}</div><div class="note">${t.kmSupTxt(n0(params.p_km_franchise), n2(r.kmSup))}</div>` },
  ];
  if (opt) blocks.push({
    html: `<div class="stitle s-gold">${t.option}</div><div class="grid4">${box(t.vrBrute, money(r.vrBrute))}${box(t.vrFrais, money(r.vrFrais))}${box(t.vrNette, money(r.vrNette), 'c-green')}${box(t.vrTTC, money(r.vrNetteTTC), 'c-blue')}</div><div class="note">${t.optionTxt}</div>`,
  });
  const row = (l: string, ht: number | string, tx: number | string, ttc: number | string, cls = '') =>
    `<tr class="${cls}"><td>${l}</td><td class="r num">${typeof ht === 'number' ? n0(ht) : ht}</td><td class="r num">${typeof tx === 'number' ? n0(tx) : tx}</td><td class="r num">${typeof ttc === 'number' ? n0(ttc) : ttc}</td></tr>`;
  blocks.push({
    html: `<div class="stitle s-dark">${t.recap}</div><table><tr><th>${t.element}</th><th class="r">HT</th><th class="r">${t.taxes}</th><th class="r">TTC</th></tr>
${row(t.loyerMensuel, r.loyerHT, r.tvaFi, r.loyerTTC)}
${row(t.totalLoyers(r.duree), r.loyerHT * r.duree, r.tvaFi * r.duree, r.loyerTTC * r.duree)}
${opt ? row(t.optionLigne, r.vrNette, r.vrNette * 0.19, r.vrNetteTTC) : ''}
${row(t.coutTotal, r.loyerHT * r.duree + (opt ? r.vrNette : 0), r.tvaFi * r.duree + (opt ? r.vrNette * 0.19 : 0), r.loyerTTC * r.duree + (opt ? r.vrNetteTTC : 0), 'tot')}
</table><div class="note">${t.recapNote}</div>`,
  });
  blocks.push(...clausesAndSignatures(lang, opts.annexeCG));
  if (opts.annexeCG) blocks.push(...annexBlocks(lang));

  return {
    title: `${t.offre} ${ref}`,
    filename: `Offre_Ijara_${safe(ref)}_${lang.toUpperCase()}`,
    lang, ref, blocks,
  };
}

export interface FleetLine { id: string; qty: number; params: SimulatorParams }

export function fleetTotals(lines: FleetLine[]) {
  const rows = lines.map(l => ({ l, r: computeEngine(l.params) }));
  const sum = (f: (x: typeof rows[number]) => number) => rows.reduce((a, x) => a + f(x) * x.l.qty, 0);
  return {
    rows,
    nb: rows.reduce((a, x) => a + x.l.qty, 0),
    ht: sum(x => x.r.loyerHT),
    tva: sum(x => x.r.tvaFi),
    ttc: sum(x => x.r.loyerTTC),
    contrat: sum(x => x.r.loyerTTC * x.r.duree),
    depot: sum(x => x.r.depot),
    achat: sum(x => x.r.achat),
  };
}

export function fleetDocument(lines: FleetLine[], client: string, ref: string, date: string, opts: DocOptions): OfferDocument {
  const { lang } = opts;
  const t = T[lang];
  const da = DA[lang];
  const tot = fleetTotals(lines);
  const anyOpt = lines.some(l => l.params.optRevente);
  const km = lang === 'fr' ? 'km' : 'كم';

  const head = `<tr><th>#</th><th>${t.vehicule}</th><th class="r">${t.duree}</th><th class="r">${t.kmTotal}</th><th class="r">${t.qte}</th><th class="r">${t.unitHT}</th><th class="r">${t.unitTTC}</th>${anyOpt ? `<th class="r">${t.vrUnit}</th>` : ''}<th class="r">${t.totalMois}</th></tr>`;
  const body = tot.rows.map(({ l, r }, i) => {
    const v = vehicleOf(l.params, lang);
    return `<tr><td class="num">${i + 1}</td><td><span class="ltr">${esc(v.model)} <span style="color:#888">${esc(v.version)}</span></span></td><td class="r"><span class="num">${r.duree}</span> ${t.mois}</td><td class="r"><span class="num">${n0(r.kmTotal)}</span> ${km}</td><td class="r num">${l.qty}</td><td class="r num">${n0(r.loyerHT)}</td><td class="r num">${n0(r.loyerTTC)}</td>${anyOpt ? `<td class="r num">${l.params.optRevente ? n0(r.vrNette) : '—'}</td>` : ''}<td class="r num">${n0(r.loyerTTC * l.qty)}</td></tr>`;
  }).join('');
  const totRow = `<tr class="tot"><td></td><td>${t.totalFlotte}</td><td></td><td></td><td class="r num">${tot.nb}</td><td></td><td></td>${anyOpt ? '<td></td>' : ''}<td class="r num">${n0(tot.ttc)}</td></tr>`;
  const box = (l: string, v: number, c = '') => `<div class="box"><div class="lbl">${l}</div><div class="val ${c}"><span class="num">${n0(v)}</span> ${da}</div></div>`;

  // Prestations : celles du premier véhicule (paramètres de services communs à la flotte en pratique)
  const blocks: DocBlock[] = [
    ...header(lang, ref, date, t.flotte),
    parties(lang, client),
    {
      html: `<div class="hl"><div><div style="font-size:10.5pt;font-weight:700;color:#0d1e38">${t.totalTTC}</div><div style="font-size:7.5pt;color:#888">${t.nbVeh} : <span class="num">${tot.nb}</span></div></div>
<div style="text-align:end"><div class="hlv">${n0(tot.ttc)}</div><div style="font-size:8pt;color:#888">${t.parMois}</div></div></div>
<div class="grid3">${box(t.totalHT, tot.ht, 'c-green')}${box(t.totalTVA, tot.tva, 'c-orange')}${box(t.totalTTC, tot.ttc, 'c-blue')}</div>`,
    },
    { html: `<div class="stitle">${t.lignes}</div><table>${head}${body}${totRow}</table><div class="note">${t.flotteTxt}</div>` },
    { html: `<div class="grid3" style="margin-top:8px">${box(t.totalContrat, tot.contrat)}${box(t.totalDepot, tot.depot, 'c-green')}${box(t.financement, tot.achat, 'c-gold')}</div>` },
  ];
  if (lines.length) blocks.push({ html: `<div class="stitle s-green">${t.services}</div><div class="svc">${servicesList(lines[0].params, lang).map(s => `<div>${s}</div>`).join('')}</div>` });
  blocks.push(...clausesAndSignatures(lang, opts.annexeCG));
  if (opts.annexeCG) blocks.push(...annexBlocks(lang));

  return {
    title: `${t.flotte} ${ref}`,
    filename: `Devis_flotte_${safe(ref)}_${lang.toUpperCase()}`,
    lang, ref, blocks,
  };
}

const safe = (s: string) => s.replace(/[^\w.-]+/g, '_').slice(0, 60) || 'offre';

export const ARABIC_FONT_URL = 'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap';

/** Document HTML complet (aperçu, impression, fichier .html). */
export function documentHTML(doc: OfferDocument): string {
  const dir = doc.lang === 'ar' ? 'rtl' : 'ltr';
  const body = doc.blocks.map(b => `<div class="blk${b.breakBefore ? ' brk' : ''}">${b.html}</div>`).join('\n');
  return `<!DOCTYPE html><html lang="${doc.lang}" dir="${dir}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(doc.title)}</title>
<link rel="stylesheet" href="${ARABIC_FONT_URL}">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;700&family=JetBrains+Mono:wght@700&display=swap">
<style>@page{size:A4;margin:14mm 12mm}body{margin:0;background:#fff}.wrap{max-width:186mm;margin:0 auto;padding:10px}
.blk{break-inside:avoid;page-break-inside:avoid}.brk{break-before:page;page-break-before:always}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.wrap{padding:0}}
${DOC_CSS}</style></head><body><div class="wrap od" dir="${dir}">${body}
<div style="margin-top:12px;padding-top:6px;border-top:1px solid #e0e0e0;font-size:6.5pt;color:#999;text-align:center">${T[doc.lang].footer(esc(doc.ref))}</div>
</div></body></html>`;
}

export function footerText(doc: OfferDocument) { return T[doc.lang].footer(esc(doc.ref)); }
