/*
 * experten-tafel.js — Tafelansicht der Expertenrunde.
 *
 * Zeigt den QR-Code zum Beitreten und die sechs Personen mit ihren Gruppen.
 * Fragt alle vier Sekunden bei experten.php nach. Der Vortragsbonus wird
 * hier vergeben; dafür ist der Schlüssel aus experten.php nötig.
 */

const ENDPUNKT = "experten.php";
const ABSTAND  = 4000;
const VORTRAGSBONUS = 200;
const ADRESS_SPEICHER   = "attentaeter.expertenadresse";
const SCHLUESSEL_MERKER = "dreizehn-minuten.schluessel";

const $ = (s) => document.querySelector(s);
const sicher = (t) => String(t).replace(/[&<>"']/g, (z) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[z]));

let gruppen = [];
let stand = -1;
let live = false;

/* --- Adresse und QR-Code --------------------------------------------- */

function spieladresse() {
  const ausAdresszeile = new URLSearchParams(location.search).get("spiel");
  if (ausAdresszeile) {
    try { localStorage.setItem(ADRESS_SPEICHER, ausAdresszeile); } catch (e) { /* egal */ }
    return ausAdresszeile;
  }
  let gespeichert = null;
  try { gespeichert = localStorage.getItem(ADRESS_SPEICHER); } catch (e) { /* egal */ }
  if (gespeichert) return gespeichert;
  if (location.protocol === "http:" || location.protocol === "https:") {
    return new URL("experte.html", location.href).href;
  }
  return null;
}

function qrZeichnen() {
  const adresse = spieladresse();
  if (!adresse) {
    $("#qrfeld").innerHTML = `<div class="qrfehlt"><strong>Adresse fehlt</strong>
      <span>Diese Seite liegt auf dem Rechner, nicht im Netz. Unten auf „Adresse ändern“ klicken.</span></div>`;
    $("#qradresse").textContent = "";
    return;
  }
  $("#qrfeld").innerHTML = QR.svg(adresse, { rand: 2, dunkel: "#0e1013", hell: "#ffffff" });
  $("#qradresse").textContent = adresse;
}

/* --- Stand vom Server ------------------------------------------------ */

async function vomServer() {
  try {
    const antwort = await fetch(`${ENDPUNKT}?stand=${stand}`, { cache: "no-store" });
    if (!antwort.ok) throw new Error("HTTP " + antwort.status);
    const daten = await antwort.json();
    if (!daten || (!Array.isArray(daten.gruppen) && !daten.unveraendert)) {
      throw new Error("Keine gültige Antwort — läuft auf dem Server PHP?");
    }
    if (!live) { live = true; quelleZeigen(); }
    if (daten.unveraendert) return;
    stand = daten.stand;
    gruppen = daten.gruppen;
    zeichnen();
  } catch (fehler) {
    if (live !== false) { live = false; quelleZeigen(); }
  }
}

function quelleZeigen() {
  const feld = $("#quelle");
  feld.hidden = false;
  feld.textContent = live ? "Live — Zuteilung läuft" : "Keine Verbindung zur Zuteilung";
  feld.className = "tafel__quelle " + (live ? "ist-live" : "");
}

/* --- Anzeige --------------------------------------------------------- */

function zeichnen() {
  const fertige = gruppen.filter((g) => g.fertig).length;
  const koepfe = gruppen.reduce((summe, g) =>
    summe + (Array.isArray(g.mitglieder) && g.mitglieder.length ? g.mitglieder.length : 1), 0);
  $("#zaehler").textContent =
    `${koepfe} ${koepfe === 1 ? "Person" : "Personen"} · ${gruppen.length} ${gruppen.length === 1 ? "Gruppe" : "Gruppen"} · ${fertige} fertig`;

  $("#stationen").innerHTML = STORY.kapitel.map((k, i) => {
    const meine = gruppen
      .filter((g) => Number(g.person) === i)
      .sort((a, b) => (b.fertig - a.fertig) || (b.punkte - a.punkte) || ((a.dauer || 0) - (b.dauer || 0)));
    const beste = meine.find((g) => g.fertig) || null;
    const vorgetragen = meine.some((g) => g.vortrag);

    return `
      <li class="station ${meine.length ? "hat-gruppe" : ""} ${beste ? "fertig" : ""} ${vorgetragen ? "dran" : ""}">
        <div class="station__kopf">
          <span class="station__nr">Akte ${k.nr}</span>
          <span class="station__name">${sicher(k.person.split(",")[0])}</span>
          <span class="station__datum">${sicher(k.kurzdatum)}</span>
        </div>
        ${meine.length ? `
          <ul class="station__gruppen">
            ${meine.map((g) => {
              const mitglieder = Array.isArray(g.mitglieder) && g.mitglieder.length ? g.mitglieder : [g.name];
              const allein = mitglieder.length < 2;
              const namen = sicher(mitglieder.join(" + ")) + (allein ? ` <span class="offen">+ frei</span>` : "");
              const lage = g.vortrag ? "vorgetragen"
                : g.fertig ? (beste && g.id === beste.id ? "trägt vor" : "fertig")
                : allein ? "sucht Partner" : "liest";
              return `
              <li class="${beste && g.id === beste.id ? "beste" : ""}">
                <span>${namen}</span>
                <span class="lage">${lage}</span>
                <span class="pkt">${g.fertig ? g.punkte + (g.vortrag ? VORTRAGSBONUS : 0) : "—"}</span>
              </li>`;
            }).join("")}
          </ul>` : `<p class="station__leer">noch keine Gruppe</p>`}
        <button class="station__knopf ${vorgetragen ? "erledigt" : ""}" data-id="${beste ? beste.id : ""}"
          ${beste ? "" : "disabled"}>${vorgetragen ? "Bonus vergeben" : `Vorgetragen +${VORTRAGSBONUS}`}</button>
      </li>`;
  }).join("");

  document.querySelectorAll(".station__knopf").forEach((knopf) => {
    knopf.addEventListener("click", () => vortragVergeben(knopf.dataset.id));
  });
}

/* --- Vortragsbonus --------------------------------------------------- */

function schluesselHolen() {
  let schluessel = null;
  try { schluessel = localStorage.getItem(SCHLUESSEL_MERKER); } catch (e) { /* egal */ }
  if (!schluessel) {
    schluessel = window.prompt("Schlüssel (steht oben in experten.php):", "");
    if (!schluessel) return null;
    try { localStorage.setItem(SCHLUESSEL_MERKER, schluessel); } catch (e) { /* egal */ }
  }
  return schluessel;
}

async function senden(aktion, rumpf) {
  const schluessel = schluesselHolen();
  if (!schluessel) return;
  try {
    const antwort = await fetch(`${ENDPUNKT}?aktion=${aktion}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rumpf, schluessel })
    });
    if (!antwort.ok) {
      try { localStorage.removeItem(SCHLUESSEL_MERKER); } catch (e) { /* egal */ }
      const inhalt = await antwort.json().catch(() => ({}));
      $("#hinweis").textContent = inhalt.fehler || "Das hat nicht geklappt.";
      return;
    }
    stand = -1;
    await vomServer();
  } catch (fehler) {
    $("#hinweis").textContent = "Die Zuteilung war nicht erreichbar.";
  }
}

const vortragVergeben = (id) => { if (id) senden("vortrag", { id }); };

/* --- Start ----------------------------------------------------------- */

function start() {
  qrZeichnen();
  zeichnen();
  vomServer().then(() => setInterval(vomServer, ABSTAND));

  $("#adresse-aendern").addEventListener("click", () => {
    const neu = window.prompt("Adresse der Expertenrunde (für den QR-Code):", spieladresse() || "");
    if (neu === null) return;
    try {
      if (neu.trim()) localStorage.setItem(ADRESS_SPEICHER, neu.trim());
      else localStorage.removeItem(ADRESS_SPEICHER);
    } catch (e) { /* egal */ }
    qrZeichnen();
  });

  $("#vollbild").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  });

  $("#leeren").addEventListener("click", () => {
    if (!gruppen.length) return;
    if (window.confirm(`Alle ${gruppen.length} Gruppen und Zuteilungen löschen?`)) senden("neu", {});
  });

  document.querySelectorAll("img.schullogo").forEach((bild) => {
    const marke = bild.closest(".schulmarke");
    bild.addEventListener("error", () => bild.remove());
    bild.addEventListener("load", () => marke && marke.classList.add("hat-logo"));
    if (bild.complete) { if (bild.naturalWidth === 0) bild.remove(); else marke && marke.classList.add("hat-logo"); }
  });
}

document.addEventListener("DOMContentLoaded", start);
