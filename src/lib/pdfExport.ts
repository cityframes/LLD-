import { SimulatorParams, CATALOG } from "./types";
import { computeEngine } from "./engine";
import { fmt } from "./utils";

export function buildOfferHTML(r: ReturnType<typeof computeEngine>, params: SimulatorParams) {
  const clientName = params.clientName || 'Client';
  const clientRef = params.clientRef || 'LLD-2026-XXXX';
  const clientDate = params.clientDate || new Date().toLocaleDateString('fr-FR');
  const vehModel = params.veh_idx >= 0 ? CATALOG[params.veh_idx].model : 'Saisie manuelle';
  const vehVersion = params.veh_idx >= 0 ? CATALOG[params.veh_idx].version : '—';
  const vehCV = params.veh_idx >= 0 ? CATALOG[params.veh_idx].cv : '—';
  const hasLA = Math.abs(r.leaseAdj) > 0.01;
  const kmAnn = Math.round(r.kmTotal / r.duree * 12);
  const fran = params.p_km_franchise;
  const showRevente = params.optRevente;
  const fmt0 = (v: number) => new Intl.NumberFormat('fr-DZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
  const fmt2 = (v: number) => new Intl.NumberFormat('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Bon de Commande Ijarah LLD - ${clientRef}</title>
<style>
@page{size:A4;margin:14mm 12mm}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5pt;line-height:1.45;color:#1a1a1a;background:#fff}
.page{width:182mm;margin:0 auto}
/* HEADER */
.header{border-bottom:3px solid #c9a84c;padding-bottom:10px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:flex-start}
.bank-logo-box{display:flex;align-items:center;gap:10px}
.bank-logo{width:44px;height:44px;border-radius:8px;background:linear-gradient(135deg,#c9a84c,#9a6c1a);display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-size:22pt;font-weight:700;color:#fff;flex-shrink:0}
.bank-name{font-family:Georgia,serif;font-size:18pt;font-weight:700;color:#0d1e38}
.bank-sub{font-size:7pt;color:#666;text-transform:uppercase;letter-spacing:1.2px;margin-top:2px}
.ref-box{text-align:right}
.ref-label{font-size:7.5pt;color:#888;text-transform:uppercase;letter-spacing:.5px}
.ref-val{font-family:'Courier New',monospace;font-size:12pt;font-weight:700;color:#0d1e38;display:block}
.doc-type{font-size:7pt;color:#c9a84c;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-top:2px}
/* TITLE BANNER */
.title-banner{background:linear-gradient(135deg,#0d1e38,#1a3a60);color:#fff;border-radius:6px;padding:10px 14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
.title-main{font-size:14pt;font-weight:700;letter-spacing:.5px}
.title-sub{font-size:7.5pt;color:#c9a84c;margin-top:2px;letter-spacing:.8px;text-transform:uppercase}
.badge{display:inline-block;background:rgba(201,168,76,.25);color:#c9a84c;padding:2px 8px;border-radius:10px;font-size:7pt;font-weight:700;text-transform:uppercase;border:1px solid rgba(201,168,76,.5)}
.date-zone{text-align:right;font-size:8.5pt;color:#ddd}
.validite{color:#ff9999;font-weight:700;margin-top:3px;font-size:8pt}
/* PARTIES */
.parties{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.partie-box{border:1.5px solid #0d1e38;border-radius:5px;overflow:hidden}
.partie-head{background:#0d1e38;color:#c9a84c;font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.8px;padding:4px 10px}
.partie-body{padding:8px 10px}
.partie-row{display:flex;gap:6px;margin-bottom:3px;font-size:8.5pt}
.partie-lbl{color:#888;min-width:70px;font-size:7.5pt;text-transform:uppercase;padding-top:1px}
.partie-val{font-weight:600;color:#1a1a1a;flex:1}
.partie-val.fill{border-bottom:1px solid #ccc;min-width:100px;padding-bottom:1px;display:inline-block;color:#555;font-style:italic}
/* SECTION */
.section{margin-bottom:10px}
.section-title{font-size:8pt;font-weight:700;color:#fff;background:#2d6fbd;text-transform:uppercase;letter-spacing:.8px;padding:4px 10px;border-radius:4px;margin-bottom:6px}
.section-title.gold{background:#9a6c1a}
.section-title.green{background:#27ae7a}
.section-title.dark{background:#0d1e38}
/* INFO GRID */
.info-box{background:#f7f8fa;border:1px solid #e0e0e0;border-radius:4px;padding:6px 10px;margin-bottom:5px}
.info-label{font-size:6.5pt;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:1px}
.info-val{font-size:9.5pt;font-weight:700;color:#1a1a1a}
.info-val.green{color:#27ae7a}.info-val.blue{color:#2d6fbd}.info-val.gold{color:#9a6c1a}
.grid-4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:5px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:5px}
/* LOYER HIGHLIGHT */
.loyer-highlight{background:linear-gradient(135deg,#faf8f3,#fdf9ee);border:2px solid #c9a84c;border-radius:6px;padding:10px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center}
.loyer-hl-label{font-size:10pt;font-weight:700;color:#0d1e38}
.loyer-hl-sub{font-size:7.5pt;color:#888;margin-top:1px}
.loyer-hl-val{font-family:'Courier New',monospace;font-size:18pt;font-weight:700;color:#9a6c1a}
.loyer-hl-unit{font-size:8pt;color:#888;text-align:right;margin-top:1px}
/* VR BOX */
.vr-box{background:#f8f9fa;border:1.5px solid #c9a84c;border-radius:5px;padding:8px 10px;margin-top:5px}
.vr-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.vr-label{font-size:6.5pt;color:#888;text-transform:uppercase}
.vr-val{font-size:9.5pt;font-weight:700;color:#1a1a1a}
.vr-val.red{color:#c0392b}.vr-val.green{color:#27ae7a}
.notice{font-size:7.5pt;color:#555;margin-top:5px;line-height:1.4;background:#fffdf5;padding:5px 8px;border-radius:3px;border-left:3px solid #c9a84c}
/* SERVICES */
.services-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px}
.svc-item{display:flex;align-items:center;gap:5px;font-size:8pt;color:#333;padding:3px 6px;background:#f8f9fa;border:1px solid #e8e8e8;border-radius:3px}
.svc-check{color:#27ae7a;font-weight:700}
/* RECAP FINANCIER */
.recap-row{display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:1px solid #eee;font-size:8.5pt}
.recap-lbl{color:#444}.recap-val{font-family:'Courier New',monospace;font-weight:700;color:#0d1e38}
/* CONDITIONS */
.conditions-box{background:#fff9f0;border:1px solid #f0d080;border-radius:5px;padding:8px 10px;font-size:7.5pt;color:#555;line-height:1.5}
.conditions-box strong{color:#9a6c1a}
/* SIGNATURES */
.signatures{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px;page-break-inside:avoid}
.sign-box{border:1.5px solid #ccc;border-radius:5px;padding:10px;min-height:90px;background:#fafafa}
.sign-title{font-size:8pt;font-weight:700;color:#0d1e38;text-transform:uppercase;margin-bottom:2px;letter-spacing:.5px}
.sign-subtitle{font-size:7pt;color:#888;margin-bottom:6px;line-height:1.3}
.sign-line{border-bottom:1px solid #aaa;margin-top:40px;margin-bottom:4px}
.sign-label{font-size:6.5pt;color:#888}
/* FOOTER */
.footer{margin-top:10px;padding-top:7px;border-top:1px solid #e0e0e0;font-size:6pt;color:#aaa;text-align:center;line-height:1.5}
@media print{
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{width:100%}
}
</style></head><body>
<div class="page">
<!-- HEADER -->
<div class="header">
  <div class="bank-logo-box">
    <div class="bank-logo">ﺍ</div>
    <div>
      <div class="bank-name">Al Salam Bank</div>
      <div class="bank-sub">Banque Participative · Location Ijarah Longue Durée</div>
    </div>
  </div>
  <div class="ref-box">
    <div class="ref-label">Référence offre</div>
    <div class="ref-val">${clientRef}</div>
    <div class="doc-type">☽ Bon de Commande Officiel</div>
  </div>
</div>

<!-- TITLE BANNER -->
<div class="title-banner">
  <div>
    <div class="title-main">BON DE COMMANDE — IJARAH LLD</div>
    <div class="title-sub">Location Longue Durée · Conforme Shariah · Financement Participatif</div>
  </div>
  <div style="text-align:right">
    <span class="badge">☽ Ijarah Conforme</span>
    <div class="date-zone" style="margin-top:6px"><strong>Date :</strong> ${clientDate}</div>
    <div class="validite">⚠ Valable 15 jours</div>
  </div>
</div>

<!-- PARTIES -->
<div class="parties">
  <div class="partie-box">
    <div class="partie-head">Le Bailleur (Muajjir)</div>
    <div class="partie-body">
      <div class="partie-row"><span class="partie-lbl">Dénomination</span><span class="partie-val">Al Salam Bank — SPA</span></div>
      <div class="partie-row"><span class="partie-lbl">Activité</span><span class="partie-val">Banque Participative Agréée</span></div>
      <div class="partie-row"><span class="partie-lbl">Référence</span><span class="partie-val">${clientRef}</span></div>
    </div>
  </div>
  <div class="partie-box">
    <div class="partie-head">Le Preneur (Mustajir)</div>
    <div class="partie-body">
      <div class="partie-row"><span class="partie-lbl">Nom / Raison</span><span class="partie-val">${clientName}</span></div>
      <div class="partie-row"><span class="partie-lbl">Forme jur.</span><span class="partie-val fill">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
      <div class="partie-row"><span class="partie-lbl">Adresse</span><span class="partie-val fill">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
      <div class="partie-row"><span class="partie-lbl">RC / NIF</span><span class="partie-val fill">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
    </div>
  </div>
</div>

<!-- LOYER HIGHLIGHT -->
<div class="loyer-highlight">
  <div>
    <div class="loyer-hl-label">💳 LOYER MENSUEL TOUT INCLUS (TTC)</div>
    <div class="loyer-hl-sub">Ijarah · Entretien · Takaful · Taxes${hasLA ? ' · Ajustement' : ''}</div>
  </div>
  <div>
    <div class="loyer-hl-val">${fmt0(r.loyerTTC)}</div>
    <div class="loyer-hl-unit">DZA / mois TTC</div>
  </div>
</div>
<!-- DECOMPOSITION HT / TVA / TTC -->
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">
  <div class="info-box" style="background:#f8fff8;border:1.5px solid #27ae7a;border-radius:5px;padding:8px 10px;text-align:center">
    <div class="info-label" style="color:#27ae7a;font-weight:700;font-size:7.5pt">LOYER MENSUEL HT</div>
    <div class="info-val" style="color:#1a7a50;font-size:12pt;font-weight:800">${fmt0(r.loyerHT)}</div>
    <div style="font-size:6.5pt;color:#888;margin-top:2px">DZA / mois · Hors Taxes</div>
  </div>
  <div class="info-box" style="background:#fff8f0;border:1.5px solid #d4882a;border-radius:5px;padding:8px 10px;text-align:center">
    <div class="info-label" style="color:#d4882a;font-weight:700;font-size:7.5pt">TVA MENSUELLE</div>
    <div class="info-val" style="color:#a05a10;font-size:12pt;font-weight:800">${fmt0(r.tvaFi)}</div>
    <div style="font-size:6.5pt;color:#888;margin-top:2px">TVA 19% Finance &amp; Services</div>
  </div>
  <div class="info-box" style="background:#f0f6ff;border:1.5px solid #2d6fbd;border-radius:5px;padding:8px 10px;text-align:center">
    <div class="info-label" style="color:#2d6fbd;font-weight:700;font-size:7.5pt">LOYER MENSUEL TTC</div>
    <div class="info-val" style="color:#1a4a8a;font-size:12pt;font-weight:800">${fmt0(r.loyerTTC)}</div>
    <div style="font-size:6.5pt;color:#888;margin-top:2px">DZA / mois · Toutes Taxes Comprises</div>
  </div>
</div>

<!-- VEHICULE -->
<div class="section">
  <div class="section-title">🚗 Bien Loué — Véhicule</div>
  <div class="grid-4">
    <div class="info-box"><div class="info-label">Modèle</div><div class="info-val">${vehModel}</div></div>
    <div class="info-box"><div class="info-label">Version</div><div class="info-val">${vehVersion}</div></div>
    <div class="info-box"><div class="info-label">Puissance fiscale</div><div class="info-val">${vehCV}</div></div>
    <div class="info-box"><div class="info-label">Prix acq. HT</div><div class="info-val gold">${fmt0(r.achat)} DZA</div></div>
  </div>
</div>

<!-- PARAMETRES CONTRAT -->
<div class="section">
  <div class="section-title">📋 Conditions du Contrat</div>
  <div class="grid-3">
    <div class="info-box"><div class="info-label">Durée du contrat</div><div class="info-val blue">${r.duree} mois</div></div>
    <div class="info-box"><div class="info-label">Kilométrage total</div><div class="info-val">${fmt0(r.kmTotal)} km</div></div>
    <div class="info-box"><div class="info-label">Km annuel moyen</div><div class="info-val">${fmt0(kmAnn)} km/an</div></div>
    <div class="info-box"><div class="info-label">Apport initial</div><div class="info-val green">${fmt0(r.apport)} DZA</div></div>
    <div class="info-box"><div class="info-label">Hamish Jiddiyyah (dépôt)</div><div class="info-val">${fmt0(r.depot)} DZA</div></div>
    <div class="info-box"><div class="info-label">Restitution HJ fin contrat</div><div class="info-val green">${fmt0(r.depot)} DZA</div></div>
  </div>
</div>

<!-- SERVICES INCLUS -->
<div class="section">
  <div class="section-title green">✅ Prestations Incluses dans le Loyer</div>
  <div class="services-grid">
    <div class="svc-item"><span class="svc-check">✓</span> Plan d'entretien constructeur programmé (Paliers de 10 000 km TALHA AUTO)</div>
    <div class="svc-item"><span class="svc-check">✓</span> Pièces d'usure, filtration & consommables d'origine</div>
    <div class="svc-item"><span class="svc-check">✓</span> Pneumatiques neufs (remplacement selon fréquence contractuelle)</div>
    <div class="svc-item"><span class="svc-check">✓</span> Takaful Tous Risques + RC & Assistance</div>
    <div class="svc-item"><span class="svc-check">✓</span> Contrôle technique & vignette automobile</div>
    <div class="svc-item"><span class="svc-check">✓</span> Assistance routière 24/7 & Gestion de flotte</div>
    <div class="svc-item"><span class="svc-check">✓</span> Mobilité & Télématique GPS</div>
    <div class="svc-item"><span class="svc-check">✓</span> Véhicule de remplacement équivalent</div>
  </div>
</div>

<!-- KM SUP + VR -->
<div style="display:grid;grid-template-columns:${showRevente ? '1fr 1fr' : '1fr'};gap:8px;margin-bottom:10px">
  <div>
    <div class="section-title" style="background:#8e44ad">📏 Kilométrage Supplémentaire</div>
    <div class="grid-3" style="margin-bottom:5px">
      <div class="info-box"><div class="info-label">Prix/km sup.</div><div class="info-val gold">${fmt2(r.kmSup)} DZA</div></div>
    </div>
    <div class="notice" style="font-size:7pt">Franchise : <strong>${fmt0(fran)} km</strong>. Au-delà, chaque km est facturé au tarif ci-dessus.</div>
  </div>
  ${showRevente ? `<div>
    <div class="section-title gold">🏷️ Option d'Achat (Valeur Résiduelle)</div>
    <div class="vr-box" style="margin-top:0">
      <div class="vr-grid" style="grid-template-columns:repeat(3,1fr);gap:6px">
        <div>
          <div class="vr-label">VR Brute <span style="background:#eee;color:#555;border-radius:3px;padding:1px 4px;font-size:6.5pt;font-weight:700">HT</span></div>
          <div class="vr-val" style="font-size:9pt">${fmt0(r.vrBrute)} DZA</div>
          <div style="font-size:6pt;color:#aaa;margin-top:1px">Base contractuelle HT</div>
        </div>
        <div>
          <div class="vr-label">Frais recond.</div>
          <div class="vr-val red" style="font-size:9pt">− ${fmt0(r.vrFrais)} DZA</div>
          <div style="font-size:6pt;color:#aaa;margin-top:1px">Remise en état HT</div>
        </div>
        <div>
          <div class="vr-label">VR Nette <span style="background:#eee;color:#555;border-radius:3px;padding:1px 4px;font-size:6.5pt;font-weight:700">HT</span></div>
          <div class="vr-val" style="color:#1a6a4a;font-size:9pt">${fmt0(r.vrNette)} DZA</div>
          <div style="font-size:6pt;color:#aaa;margin-top:1px">Prix cession HT (base TVA)</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;padding-top:6px;border-top:1px solid #e0e0e0">
        <div style="background:#f0fff8;border:1px solid #b0e0c8;border-radius:4px;padding:5px 8px;text-align:center">
          <div style="font-size:6.5pt;color:#27ae7a;font-weight:700;text-transform:uppercase">TVA Cession (19% sur VR Nette HT)</div>
          <div style="font-size:10pt;font-weight:800;color:#1a7a50">${fmt0(r.vrNette * 0.19)} DZA</div>
        </div>
        <div style="background:#f0f6ff;border:1px solid #b0c8e8;border-radius:4px;padding:5px 8px;text-align:center">
          <div style="font-size:6.5pt;color:#2d6fbd;font-weight:700;text-transform:uppercase">Prix Cession Final TTC</div>
          <div style="font-size:10pt;font-weight:800;color:#1a4a8a">${fmt0(r.vrNetteTTC)} DZA</div>
        </div>
      </div>
      <div class="notice" style="font-size:6.5pt;margin-top:5px">
        Prix de cession exprimé <strong>HT</strong> — la TVA (19%) est appliquée au moment de la levée d'option conformément à la réglementation fiscale algérienne.
        HJ restitué intégralement. Client libre de racheter ou de restituer.
      </div>
    </div>
  </div>` : ''}
</div>

<!-- RECAP FINANCIER -->
<div class="section">
  <div class="section-title dark">📊 Récapitulatif Financier Global</div>
  <!-- En-tête colonnes -->
  <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:4px;margin-bottom:4px;padding:0 4px">
    <div style="font-size:6.5pt;color:#888;font-weight:700;text-transform:uppercase">Élément</div>
    <div style="font-size:6.5pt;color:#27ae7a;font-weight:700;text-align:right;text-transform:uppercase">HT</div>
    <div style="font-size:6.5pt;color:#d4882a;font-weight:700;text-align:right;text-transform:uppercase">Taxes</div>
    <div style="font-size:6.5pt;color:#2d6fbd;font-weight:700;text-align:right;text-transform:uppercase">TTC</div>
  </div>
  <!-- Loyer mensuel -->
  <div class="recap-row" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:4px;padding:5px 6px;align-items:center">
    <span class="recap-lbl" style="font-size:8pt">💳 Loyer mensuel</span>
    <span style="font-family:'Courier New',monospace;font-size:8pt;font-weight:700;color:#27ae7a;text-align:right">${fmt0(r.loyerHT)}</span>
    <span style="font-family:'Courier New',monospace;font-size:8pt;font-weight:700;color:#d4882a;text-align:right">${fmt0(r.tvaFi)}</span>
    <span style="font-family:'Courier New',monospace;font-size:8.5pt;font-weight:800;color:#1a4a8a;text-align:right">${fmt0(r.loyerTTC)}</span>
  </div>
  <!-- Total loyers sur durée -->
  <div class="recap-row" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:4px;padding:5px 6px;align-items:center;background:#f5f5f5">
    <span class="recap-lbl" style="font-size:8pt">📅 Total loyers (${r.duree} mois)</span>
    <span style="font-family:'Courier New',monospace;font-size:8pt;font-weight:700;color:#27ae7a;text-align:right">${fmt0(r.loyerHT * r.duree)}</span>
    <span style="font-family:'Courier New',monospace;font-size:8pt;font-weight:700;color:#d4882a;text-align:right">${fmt0(r.tvaFi * r.duree)}</span>
    <span style="font-family:'Courier New',monospace;font-size:8.5pt;font-weight:800;color:#1a4a8a;text-align:right">${fmt0(r.loyerTTC * r.duree)}</span>
  </div>
  ${showRevente ? `
  <!-- Option d'achat VR -->
  <div class="recap-row" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:4px;padding:5px 6px;align-items:center;background:#f0fff8">
    <span class="recap-lbl" style="font-size:8pt;color:#27ae7a">🏷️ Option d'achat (VR Nette)</span>
    <span style="font-family:'Courier New',monospace;font-size:8pt;font-weight:700;color:#27ae7a;text-align:right">${fmt0(r.vrNette)}</span>
    <span style="font-family:'Courier New',monospace;font-size:8pt;font-weight:700;color:#d4882a;text-align:right">${fmt0(r.vrNette * 0.19)}</span>
    <span style="font-family:'Courier New',monospace;font-size:8.5pt;font-weight:800;color:#1a7a50;text-align:right">${fmt0(r.vrNetteTTC)}</span>
  </div>` : ''}
  <!-- Hamish Jiddiyyah -->
  <div class="recap-row" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:4px;padding:5px 6px;align-items:center;background:#f0fff8">
    <span class="recap-lbl" style="font-size:8pt;color:#27ae7a">🔁 Hamish Jiddiyyah restitué</span>
    <span style="font-family:'Courier New',monospace;font-size:8pt;font-weight:700;color:#27ae7a;text-align:right">—</span>
    <span style="font-family:'Courier New',monospace;font-size:8pt;font-weight:700;color:#888;text-align:right">exonéré</span>
    <span style="font-family:'Courier New',monospace;font-size:8.5pt;font-weight:800;color:#27ae7a;text-align:right">+ ${fmt0(r.depot)}</span>
  </div>
  <!-- Coût total opération -->
  <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:4px;padding:7px 6px;background:linear-gradient(90deg,#0d1e38,#1a3050);border-radius:4px;margin-top:4px;align-items:center">
    <span style="font-size:8.5pt;font-weight:800;color:#e8cc88;text-transform:uppercase;letter-spacing:.5px">💰 Coût total opération${showRevente ? ' (avec option achat)' : ''}</span>
    <span style="font-family:'Courier New',monospace;font-size:8pt;font-weight:700;color:#88d4a8;text-align:right">${fmt0(r.loyerHT * r.duree + (showRevente ? r.vrNette : 0))}</span>
    <span style="font-family:'Courier New',monospace;font-size:8pt;font-weight:700;color:#e8a850;text-align:right">${fmt0(r.tvaFi * r.duree + (showRevente ? r.vrNette * 0.19 : 0))}</span>
    <span style="font-family:'Courier New',monospace;font-size:9pt;font-weight:900;color:#e8cc88;text-align:right">${fmt0(r.loyerTTC * r.duree + (showRevente ? r.vrNetteTTC : 0))}</span>
  </div>
  <div style="font-size:6pt;color:#aaa;margin-top:4px;padding:0 4px">
    * Coût total = somme des loyers TTC${showRevente ? ' + prix de cession TTC' : ''} — hors Hamish Jiddiyyah (dépôt restitué) · Montants en Dinars Algériens (DZA)
  </div>
</div>

<!-- CONDITIONS -->
<div class="section">
  <div class="conditions-box">
    <strong>Conditions générales :</strong> La présente offre est soumise à l'acceptation définitive du dossier de financement par le Comité de Crédit d'Al Salam Bank. Le contrat Ijarah sera établi conformément aux normes de la finance participative et aux prescriptions de la Charia. Le bien demeure la propriété d'Al Salam Bank pour toute la durée du contrat. Le preneur s'engage à respecter les conditions d'utilisation du véhicule et à en assurer la conservation. Toute modification des conditions tarifaires sera soumise à l'accord préalable écrit des deux parties. <strong>Offre valable 15 jours à compter de la date d'émission.</strong>
  </div>
</div>

<!-- SIGNATURES -->
<div class="signatures">
  <div class="sign-box">
    <div class="sign-title">Pour le Client — Le Preneur (Mustajir)</div>
    <div class="sign-subtitle">Je soussigné(e), reconnais avoir pris connaissance de l'ensemble des termes et conditions de la présente offre et marque mon accord.</div>
    <div class="sign-line"></div>
    <div class="sign-label">Nom, qualité & signature</div>
    <div class="sign-label" style="margin-top:6px">Date : _____ / _____ / _________</div>
    <div class="sign-label" style="margin-top:4px">Cachet de l'entreprise :</div>
  </div>
  <div class="sign-box">
    <div class="sign-title">Pour Al Salam Bank — Le Bailleur (Muajjir)</div>
    <div class="sign-subtitle">Sous réserve d'approbation du dossier par le Comité de Crédit et de la réalisation des conditions suspensives.</div>
    <div class="sign-line"></div>
    <div class="sign-label">Nom, qualité & signature</div>
    <div class="sign-label" style="margin-top:6px">Date : _____ / _____ / _________</div>
    <div class="sign-label" style="margin-top:4px">Cachet Al Salam Bank :</div>
  </div>
</div>

<div class="footer">
  Al Salam Bank S.P.A — Banque Participative · Document confidentiel · Numéro de réf. : ${clientRef}<br>
  Montants exprimés en Dinars Algériens (DZA) · TVA 19% Finance & Services · Vignette exonérée<br>
  WACC formule additive standard (CFA/IFRS) · Ce document ne constitue pas un accord définitif avant signature des deux parties
</div>
</div>
</body></html>`;
}
