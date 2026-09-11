/*
 * tafel.js — Tafelansicht: QR-Code zum Einstieg und Bestenliste der Klasse.
 *
 * Die Ergebnisse werden über den Ergebnis-Code eingetragen, den das Spiel am
 * Ende anzeigt. Der Code enthält Punkte, Fehler und Spielzeit sowie eine
 * Prüfziffer, damit Tippfehler auffallen. Alles bleibt in diesem Browser.
 */

const TAFEL_SPEICHER = "dreizehn-minuten.tafel";
const ADRESS_SPEICHER = "dreizehn-minuten.spieladresse";
const NOTADRESSE = "https://klvdigitaljan.github.io/BBS-Papenburg/";

const $ = (s) => document.querySelector(s);
let eintraege = [];
let zuletzt = null;

/* --- Ergebnis-Code --------------------------------------------------- */

// Rückgabe: { punkte, fehler, sekunden } oder { problem: "..." }.
// "fehler" sind die Fehlentscheidungen im Spiel, nicht ein Problem beim Lesen.
function codeLesen(eingabe) {
  const rein = String(eingabe).toUpperCase().replace(/[^0-9A-Z]/g, "");
  if (rein.length !== 9) return { problem: "Der Code hat neun Zeichen." };
  const kern = rein.slice(0, 8);
  let summe = 0;
  for (const z of kern) {
    const w = parseInt(z, 36);
    if (Number.isNaN(w)) return { problem: "Ungültiges Zeichen im Code." };
    summe += w;
  }
  if ((summe % 36).toString(36).toUpperCase() !== rein[8]) {
    return { problem: "Prüfzeichen passt nicht — bitte noch einmal ablesen." };
  }
  return {
    punkte: parseInt(kern.slice(0, 3), 36),
    fehler: parseInt(kern.slice(3, 5), 36),
    sekunden: parseInt(kern.slice(5, 8), 36)
  };
}

const zeit = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const sicher = (t) => String(t).replace(/[&<>"']/g, (z) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[z]));

/* --- Speicher -------------------------------------------------------- */

function laden() {
  try { eintraege = JSON.parse(localStorage.getItem(TAFEL_SPEICHER) || "[]"); }
  catch (e) { eintraege = []; }
}
function sichern() {
  try { localStorage.setItem(TAFEL_SPEICHER, JSON.stringify(eintraege)); }
  catch (e) { /* Privatmodus: Liste lebt nur bis zum Neuladen */ }
}

/* --- Anzeige --------------------------------------------------------- */

function zeichnen() {
  eintraege.sort((a, b) => b.punkte - a.punkte || a.sekunden - b.sekunden || a.fehler - b.fehler);
  const platz = ["gold", "silber", "bronze"];
  // So viele Zeilen zeigen, wie auf die Fläche passen — der Rest wird gezählt.
  // Höhe des gesamten Anzeigebereichs messen, nicht die der Liste selbst:
  // die wächst erst mit den Zeilen und würde sich selbst begrenzen.
  const hoehe = $(".tafel__raum").clientHeight - 70;
  const zeilenhoehe = Math.max(34, Math.round(window.innerHeight * 0.045));
  const passen = Math.max(5, Math.floor(hoehe / zeilenhoehe));
  const sichtbar = eintraege.slice(0, passen);

  $("#rang").innerHTML = sichtbar.map((e, i) => `
    <li class="${platz[i] || ""} ${e.id === zuletzt ? "neu" : ""}">
      <span class="platz">${i + 1}.</span>
      <span class="wer">${sicher(e.name)}</span>
      <span class="neben">${e.fehler} Fehler · ${zeit(e.sekunden)}</span>
      <span class="pkt">${e.punkte}</span>
    </li>`).join("");

  const rest = eintraege.length - sichtbar.length;
  $("#zaehler").textContent = eintraege.length === 1 ? "1 Ergebnis" : `${eintraege.length} Ergebnisse`;
  $("#leerhinweis").hidden = eintraege.length > 0;
  if (rest > 0) $("#leerhinweis").hidden = false;
  $("#leerhinweis").textContent = eintraege.length === 0
    ? "Noch keine Ergebnisse. Trage unten das erste ein."
    : `… und ${rest} weitere`;
}

function qrZeichnen() {
  const adresse = spieladresse();
  $("#qrfeld").innerHTML = QR.svg(adresse, { rand: 2, dunkel: "#0e1013", hell: "#ffffff" });
  $("#qradresse").textContent = adresse;
}

function spieladresse() {
  let gespeichert = null;
  try { gespeichert = localStorage.getItem(ADRESS_SPEICHER); } catch (e) { /* egal */ }
  if (gespeichert) return gespeichert;
  if (location.protocol === "http:" || location.protocol === "https:") {
    return new URL(".", location.href).href;
  }
  return NOTADRESSE;
}

/* --- Bedienung ------------------------------------------------------- */

function melden(text, gut) {
  const m = $("#meldung");
  m.textContent = text;
  m.className = "meldung " + (gut ? "gut" : "schlecht");
  clearTimeout(melden.uhr);
  melden.uhr = setTimeout(() => { m.textContent = ""; m.className = "meldung"; }, 6000);
}

function eintragen(e) {
  e.preventDefault();
  const nameFeld = $("#ename");
  const codeFeld = $("#ecode");
  let name = nameFeld.value.trim();
  let code = codeFeld.value.trim();

  // "Mia K. 2F8071K2C" in einem Feld ist auch erlaubt
  if (!code && /\s/.test(name)) {
    const teile = name.split(/\s+/);
    const letztes = teile[teile.length - 1];
    if (letztes.replace(/[^0-9A-Za-z]/g, "").length === 9) {
      code = letztes;
      name = teile.slice(0, -1).join(" ");
    }
  }
  if (!name) { melden("Bitte einen Namen eintragen.", false); nameFeld.focus(); return; }

  const gelesen = codeLesen(code);
  if (gelesen.problem) { melden(gelesen.problem, false); codeFeld.focus(); codeFeld.select(); return; }

  const eintrag = {
    id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    name,
    punkte: gelesen.punkte,
    fehler: gelesen.fehler,
    sekunden: gelesen.sekunden
  };
  eintraege.push(eintrag);
  zuletzt = eintrag.id;
  sichern();
  zeichnen();
  melden(`${name} eingetragen: ${eintrag.punkte} Punkte.`, true);
  nameFeld.value = "";
  codeFeld.value = "";
  nameFeld.focus();
}

function start() {
  laden();
  qrZeichnen();
  zeichnen();
  $("#eingabe").addEventListener("submit", eintragen);
  $("#ename").focus();

  $("#leeren").addEventListener("click", () => {
    if (!eintraege.length) return;
    if (window.confirm(`Alle ${eintraege.length} Ergebnisse löschen?`)) {
      eintraege = [];
      zuletzt = null;
      sichern();
      zeichnen();
      melden("Liste geleert.", true);
    }
  });

  $("#adresse-aendern").addEventListener("click", () => {
    const neu = window.prompt("Adresse des Spiels (wird im QR-Code angezeigt):", spieladresse());
    if (neu === null) return;
    try {
      if (neu.trim()) localStorage.setItem(ADRESS_SPEICHER, neu.trim());
      else localStorage.removeItem(ADRESS_SPEICHER);
    } catch (e) { /* Privatmodus */ }
    qrZeichnen();
  });

  $("#vollbild").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  });

  // Fehlt das Schullogo, bleibt nur der Schriftzug stehen
  document.querySelectorAll("img.schullogo").forEach((bild) => {
    bild.addEventListener("error", () => bild.remove());
    if (bild.complete && bild.naturalWidth === 0) bild.remove();
  });

  let uhr;
  window.addEventListener("resize", () => { clearTimeout(uhr); uhr = setTimeout(zeichnen, 200); });
}

document.addEventListener("DOMContentLoaded", start);
