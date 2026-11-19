/*
 * experte.js — Expertenrunde für die Schülergeräte.
 *
 * Jede Gruppe bekommt vom Server reihum eine der sechs Personen zugeteilt,
 * trifft drei Entscheidungen und bereitet daraus einen 90-Sekunden-Vortrag vor.
 * Die Zuteilung bleibt im Gerät gemerkt; Neuladen ändert nichts.
 */

const ENDPUNKT   = "experten.php";
const SPEICHER   = "attentaeter.expertengruppe";
const PRO_FRAGE  = [100, 60, 0];      // Punkte nach Fehlversuchen: 0, 1, ab 2 keine
const HOECHST    = 300;               // drei Entscheidungen

/* Je Person die drei charakteristischen Entscheidungen (Index in k.szenen) */
const AUSWAHL = [[0, 2, 3], [1, 2, 3], [0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 2, 3]];

const $ = (sel) => document.querySelector(sel);
const sicher = (t) => String(t).replace(/[&<>"']/g, (z) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[z]));

const runde = {
  id: null,        // Kennung der Gruppe auf dem Server
  gruppe: "",      // eigener Name
  mitglieder: [],  // beide Namen der Gruppe
  platz: 1,        // 1 oder 2 — wer in der Gruppe abschickt
  partnerUhr: null,
  person: null,    // Index der Akte
  szene: 0,
  punkte: 0,
  fehler: 0,
  fehlversuche: 0
};

/* --- Anzeige --------------------------------------------------------- */

function setzeSzene(name) {
  const box = $("#szene");
  box.innerHTML = (SCENES[name] || SCENES.titel)();
  box.classList.remove("wechsel");
  void box.offsetWidth;
  box.classList.add("wechsel");
}

function male(html) {
  $("#inhalt").innerHTML = html;
  document.querySelectorAll("img.schullogo").forEach((bild) => {
    const marke = bild.closest(".schulmarke");
    bild.addEventListener("error", () => bild.remove());
    bild.addEventListener("load", () => marke && marke.classList.add("hat-logo"));
    if (bild.complete) { if (bild.naturalWidth === 0) bild.remove(); else marke && marke.classList.add("hat-logo"); }
  });
  window.scrollTo(0, 0);
}

function kopf() {
  const hud = $("#hud");
  if (runde.person === null) { hud.hidden = true; return; }
  const k = STORY.kapitel[runde.person];
  hud.hidden = false;
  hud.innerHTML = `
    <span class="hud__akte">${sicher(k.akte)}</span>
    <span class="zeitleiste" role="img" aria-label="Entscheidung ${Math.min(runde.szene + 1, 3)} von 3">
      ${[0, 1, 2].map((i) => `<span class="zeitleiste__punkt ${i < runde.szene ? "erledigt" : ""} ${i === runde.szene ? "aktiv" : ""}"></span>`).join("")}
    </span>
    <span class="hud__rest"><span class="punkte">Punkte <b>${runde.punkte}</b></span></span>`;
}

/* --- Start ----------------------------------------------------------- */

function zeigeStart() {
  setzeSzene("titel");
  runde.person = null;
  kopf();
  male(`
    <article class="karte karte--weit titelblock">
      <p class="eyebrow"><span>Expertenrunde</span><span>1939 – 1944</span><span>6 Personen</span></p>
      <h1>Wer waren<br>sie?</h1>
      <p class="untertitel">Sechs Menschen, sechs Attentate — ihr übernehmt eines davon</p>
      <p class="lage">Trag deinen Namen ein. Du bekommst <strong>eine Partnerin oder einen Partner
      zugeteilt</strong> — und mit ihr oder ihm zusammen <strong>eine der sechs Personen</strong>.
      Ihr bleibt dabei <strong>jeder am eigenen iPad</strong>: Beide lesen, beide entscheiden, und am Ende
      zählt der Schnitt. Danach stellt ihr eure Person der Klasse in <strong>90 Sekunden</strong> vor —
      alle anderen lernen sie nur von euch.</p>
      <ul class="regeln">
        <li><span class="marker">01</span><span><b>Drei Entscheidungen, je 100 Punkte.</b> Beim zweiten Versuch 60 — wer zweimal danebenliegt, bekommt für diese Entscheidung nichts.</span></li>
        <li><span class="marker">02</span><span><b>Richtig ist,</b> was damals wirklich entschieden wurde — nicht, was am klügsten klingt.</span></li>
        <li><span class="marker">03</span><span><b>Ihr seid immer zu zweit</b> — jeder an seinem eigenen iPad. Es zählt der <b>Schnitt eurer beiden Durchläufe</b>, also helft euch gegenseitig.</span></li>
        <li><span class="marker">04</span><span><b>Vortragsbonus: 200 Punkte.</b> Die beste Gruppe je Person trägt vor.</span></li>
        <li><span class="marker">05</span><span><b>Lest sorgfältig.</b> Was ihr nicht lest, könnt ihr nachher nicht erzählen.</span></li>
      </ul>
      <div class="feld">
        <label for="gruppe">Dein Name</label>
        <input id="gruppe" type="text" maxlength="28" placeholder="Mia K." autocomplete="off">
      </div>
      <div class="knopfreihe">
        <button class="knopf" id="los">Gruppe zuteilen lassen</button>
        <span class="meldung" id="meldung"></span>
      </div>
    </article>`);

  $("#los").addEventListener("click", zuteilen);
  $("#gruppe").addEventListener("keydown", (e) => { if (e.key === "Enter") zuteilen(); });
}

function gespeichert() {
  try {
    const roh = localStorage.getItem(SPEICHER);
    if (!roh) return null;
    const d = JSON.parse(roh);
    return (d && d.id && typeof d.person === "number" && STORY.kapitel[d.person]) ? d : null;
  } catch (e) { return null; }
}

function merken() {
  try { localStorage.setItem(SPEICHER, JSON.stringify({ id: runde.id, gruppe: runde.gruppe, mitglieder: runde.mitglieder, platz: runde.platz, person: runde.person })); }
  catch (e) { /* Privatmodus */ }
}

async function zuteilen() {
  const name = ($("#gruppe").value || "").trim();
  if (!name) { $("#meldung").textContent = "Tragt erst eure Namen ein."; return; }
  $("#los").disabled = true;
  $("#meldung").textContent = "Wird zugeteilt …";
  try {
    const antwort = await fetch(`${ENDPUNKT}?aktion=zuteilen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gruppe: name })
    });
    const inhalt = await antwort.json().catch(() => null);
    if (!antwort.ok || !inhalt || typeof inhalt.person !== "number") {
      throw new Error((inhalt && inhalt.fehler) || "Die Zuteilung antwortet nicht.");
    }
    Object.assign(runde, { id: inhalt.id, gruppe: name, mitglieder: inhalt.mitglieder || [name],
      platz: inhalt.platz || 1, person: inhalt.person, szene: 0, punkte: 0, fehler: 0 });
    merken();
    zeigeZuteilung();
  } catch (fehler) {
    $("#los").disabled = false;
    $("#meldung").textContent = fehler.message + " Sagt der Lehrkraft Bescheid.";
  }
}

/* --- Zuteilung ------------------------------------------------------- */

function gruppenname() {
  return runde.mitglieder.length ? runde.mitglieder.join(" + ") : runde.gruppe;
}

function partnerFeld() {
  const [eins, zwei] = runde.mitglieder;
  return `
    <div class="gruppe" id="gruppenfeld">
      <span class="gruppe__kopf">Eure Gruppe</span>
      <div class="gruppe__namen">
        <span class="gruppe__name">${sicher(eins || runde.gruppe)}</span>
        <span class="gruppe__plus">+</span>
        ${zwei
          ? `<span class="gruppe__name">${sicher(zwei)}</span>`
          : `<span class="gruppe__name gruppe__name--wartet">wartet auf die zweite Person …</span>`}
      </div>
      <p class="leise">${zwei
        ? "Jeder bleibt an seinem eigenen iPad. Besprecht euch — aber tippt beide selbst: Es zählt der Schnitt eurer beiden Durchläufe."
        : "Du kannst schon anfangen zu lesen. Sobald jemand dazukommt, erscheint der Name hier."}</p>
    </div>`;
}

function zeigeZuteilung() {
  const k = STORY.kapitel[runde.person];
  setzeSzene(k.szene);
  kopf();
  male(`
    <article class="karte">
      <p class="eyebrow"><span>Eure Person</span><span>Akte ${k.nr}</span><span>${sicher(k.kurzdatum)}</span></p>
      ${partnerFeld()}
      <h2>${sicher(k.person.split(",")[0])}</h2>
      <div class="daten">
        <div><span class="k">Datum</span><span class="w">${sicher(k.datum)}</span></div>
        <div><span class="k">Ort</span><span class="w">${sicher(k.ort)}</span></div>
        <div><span class="k">Rolle</span><span class="w">${sicher(k.person)}</span></div>
      </div>
      <p class="lage">${k.intro}</p>
      <div class="knopfreihe">
        <button class="knopf" id="weiter">Erste Entscheidung</button>
        <button class="knopf knopf--leise" id="abmelden" type="button">Nicht eure Gruppe?</button>
      </div>
    </article>`);
  $("#weiter").addEventListener("click", () => { partnerSucheBeenden(); zeigeSzene(); });
  $("#abmelden").addEventListener("click", () => {
    if (!window.confirm("Dieses Gerät aus der Gruppe nehmen und neu anmelden?")) return;
    partnerSucheBeenden();
    vergessen();
    runde.id = null; runde.person = null; runde.mitglieder = [];
    zeigeStart();
  });
  if (runde.mitglieder.length < 2) partnerSuchen();
}

/* Wartet darauf, dass die zweite Person dazukommt, und trägt sie nach */
function partnerSuchen() {
  partnerSucheBeenden();
  runde.partnerUhr = setInterval(async () => {
    try {
      const antwort = await fetch(`${ENDPUNKT}?aktion=gruppe&id=${encodeURIComponent(runde.id)}`, { cache: "no-store" });
      if (!antwort.ok) return;
      const inhalt = await antwort.json();
      if (!inhalt || !Array.isArray(inhalt.mitglieder)) return;
      if (inhalt.mitglieder.length > runde.mitglieder.length) {
        runde.mitglieder = inhalt.mitglieder;
        merken();
        const feld = $("#gruppenfeld");
        if (feld) {
          feld.outerHTML = partnerFeld();
          $("#gruppenfeld").classList.add("gruppe--neu");
        }
        if (runde.mitglieder.length >= 2) partnerSucheBeenden();
      }
    } catch (e) { /* beim nächsten Versuch wieder */ }
  }, 3000);
}

function partnerSucheBeenden() {
  if (runde.partnerUhr) { clearInterval(runde.partnerUhr); runde.partnerUhr = null; }
}

/* --- Entscheidungen -------------------------------------------------- */

function aktuelleSzene() {
  const k = STORY.kapitel[runde.person];
  return k.szenen[AUSWAHL[runde.person][runde.szene]];
}

function zeigeSzene() {
  const k = STORY.kapitel[runde.person];
  const s = aktuelleSzene();
  runde.fehlversuche = 0;
  kopf();

  const folge = s.optionen.map((_, i) => i);
  for (let i = folge.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [folge[i], folge[j]] = [folge[j], folge[i]];
  }

  male(`
    <article class="karte">
      <p class="eyebrow"><span>Akte ${k.nr} · ${sicher(k.kurzdatum)}</span>
        <span>Entscheidung ${runde.szene + 1} von 3</span><span>${sicher(gruppenname())}</span></p>
      <p class="lage">${s.lage}</p>
      <p class="frage">${s.frage}</p>
      <ul class="optionen" id="optionen">
        ${folge.map((nr, platz) => `
          <li><button class="option" data-i="${nr}" data-pos="${platz}">
            <span class="option__nr">${platz + 1}</span>
            <span>${s.optionen[nr].t}</span>
          </button></li>`).join("")}
      </ul>
      <div id="rueckmeldung"></div>
    </article>`);

  $("#optionen").addEventListener("click", (e) => {
    const knopf = e.target.closest(".option");
    if (knopf && !knopf.disabled) waehle(Number(knopf.dataset.i));
  });
}

function waehle(i) {
  const s = aktuelleSzene();
  const o = s.optionen[i];
  const knopf = document.querySelector(`.option[data-i="${i}"]`);

  if (!o.ok) {
    knopf.classList.add("falsch");
    knopf.disabled = true;
    runde.fehlversuche++;
    runde.fehler++;
    $("#rueckmeldung").innerHTML = `
      <div class="rueckmeldung">
        <span class="marke marke--nein">So war es nicht</span>
        <p>${o.fb}</p>
        <p class="leise">Entscheidet noch einmal — ihr verliert nur Punkte, nicht die Akte.</p>
      </div>`;
    kopf();
    return;
  }

  document.querySelectorAll(".option").forEach((b) => { b.disabled = true; });
  knopf.classList.add("richtig");
  const gewinn = PRO_FRAGE[Math.min(runde.fehlversuche, PRO_FRAGE.length - 1)];
  runde.punkte += gewinn;
  kopf();

  const letzte = runde.szene === 2;
  $("#rueckmeldung").innerHTML = `
    <div class="rueckmeldung">
      <span class="marke marke--ok">So war es · +${gewinn} Punkte</span>
      <p>${o.fb}</p>
      ${s.quelle ? `<p class="quelle">Quellennotiz: ${s.quelle}</p>` : ""}
      <div class="knopfreihe">
        <button class="knopf" id="weiter">${letzte ? "Vortrag vorbereiten" : "Weiter"}</button>
      </div>
    </div>`;
  $("#weiter").addEventListener("click", () => {
    if (letzte) { zeigeVortrag(); } else { runde.szene++; zeigeSzene(); }
  });
}

/* --- Vortragskarte: die fertigen Ergebnisse, aufgeteilt auf beide ------ */

function vortragsPunkte(k) {
  // Sollte eine ältere story.js ohne Steckbriefe ankommen, greifen die
  // Angaben aus dem Epilog — die Karte geht auf jeden Fall auf.
  const b = k.steckbrief || {};
  const letzterFakt = (k.epilog.fakten[k.epilog.fakten.length - 1] || "").replace(/<[^>]*>/g, "");
  return [
    { titel: "Wer war das?", text: `${sicher(k.person.split(",")[0])}${b.alter ? " — " + sicher(b.alter) : ", " + sicher(k.person.split(",").slice(1).join(",").trim())}.
      Der Anschlag: ${sicher(k.datum)}, ${sicher(k.ort)}.` },
    { titel: "Der Plan", text: b.plan || sicher(k.akte.split("/")[1] || "") },
    { titel: "Woran es scheiterte", text: b.scheitern || sicher(k.epilog.titel) },
    { titel: "Was danach geschah", text: b.danach || letzterFakt }
  ];
}

/* Erste Person sagt Punkt 1 und 2, zweite Person Punkt 3 und 4.
   Wer allein in der Gruppe ist, sagt alles. */
function meineSaetze() {
  if (runde.mitglieder.length < 2) return [0, 1, 2, 3];
  return runde.platz === 2 ? [2, 3] : [0, 1];
}

function vortragsListe(k) {
  const punkte = vortragsPunkte(k);
  const meine = meineSaetze();
  const partner = runde.mitglieder.length > 1
    ? sicher(runde.mitglieder[runde.platz === 2 ? 0 : 1] || "deine Partnerin")
    : null;
  return `
    <ol class="vortrag__punkte">
      ${punkte.map((p, i) => {
        const meins = meine.includes(i);
        return `
        <li class="punkt ${meins ? "punkt--meins" : "punkt--partner"}">
          <span class="punkt__nr">${i + 1}</span>
          <div class="punkt__text">
            <b>${p.titel}</b>
            <span>${p.text}</span>
            ${meins ? `<em class="punkt__wer">sagst du</em>`
                    : `<em class="punkt__wer">sagt ${partner}</em>`}
          </div>
        </li>`;
      }).join("")}
    </ol>`;
}

function zeigeVortrag() {
  const k = STORY.kapitel[runde.person];
  kopf();
  male(`
    <article class="karte karte--weit">
      <p class="eyebrow"><span>Akte ${k.nr} · Ausgang</span><span>${sicher(k.kurzdatum)}</span><span>${sicher(gruppenname())}</span></p>
      <h2>${sicher(k.epilog.titel)}</h2>
      <p class="lage">${k.epilog.text}</p>
      <ul class="fakten">${k.epilog.fakten.map((f) => `<li><span>${f}</span></li>`).join("")}</ul>

      <div class="vortrag">
        <span class="marke marke--ok">Euer Vortrag · 90 Sekunden</span>
        <p class="leise">Das sind eure vier Sätze. ${runde.mitglieder.length > 1
          ? "Zwei sagst du, zwei sagt deine Partnerin oder dein Partner."
          : "Du sagst alle vier."} Lest sie einmal laut, bevor ihr euch meldet.</p>
        ${vortragsListe(k)}
      </div>

      <div class="knopfreihe">
        <button class="knopf" id="fertig">Wir sind bereit — an die Tafel melden</button>
        <span class="meldung" id="meldung"></span>
      </div>
    </article>`);
  $("#fertig").addEventListener("click", melden);
}

async function melden() {
  $("#fertig").disabled = true;
  $("#meldung").textContent = "Wird gesendet …";
  try {
    const antwort = await fetch(`${ENDPUNKT}?aktion=ergebnis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: runde.id, platz: runde.platz, punkte: runde.punkte, fehler: runde.fehler })
    });
    const inhalt = await antwort.json().catch(() => null);
    if (!antwort.ok || !inhalt || !Array.isArray(inhalt.gruppen)) {
      throw new Error((inhalt && inhalt.fehler) || "Die Tafel antwortet nicht.");
    }
    if (Array.isArray(inhalt.mitglieder) && inhalt.mitglieder.length) runde.mitglieder = inhalt.mitglieder;
    zeigeAbschluss(true, !!inhalt.schon, inhalt);
    if (!inhalt.fertig) gruppeBeobachten();   // auf den Durchlauf der anderen warten
  } catch (fehler) {
    $("#fertig").disabled = false;
    $("#meldung").textContent = fehler.message + " Meldet euch mündlich.";
  }
}

function gruppenstand(inhalt) {
  if (!inhalt || !Array.isArray(inhalt.ergebnisse)) return "";
  const offen = runde.mitglieder.length - (inhalt.abgegeben || 0);
  const einzeln = inhalt.ergebnisse
    .map((e, i) => e ? `${sicher(runde.mitglieder[i] || "?")} ${e.punkte}` : `${sicher(runde.mitglieder[i] || "?")} …`)
    .join(" · ");
  return `<span class="leise">Gruppe: ${einzeln}${inhalt.fertig
    ? ` → <strong>${inhalt.punkte} Punkte</strong> für die Tafel`
    : ` · wartet noch auf ${offen === 1 ? "einen Durchlauf" : offen + " Durchläufe"}`}</span>`;
}

function zeigeAbschluss(gesendet, schon, inhalt) {
  const k = STORY.kapitel[runde.person];
  kopf();
  male(`
    <article class="karte karte--weit">
      <p class="eyebrow"><span>${sicher(gruppenname())}</span><span>Akte ${k.nr} · ${sicher(k.kurzdatum)}</span></p>

      <div class="vortrag vortrag--gross">
        <span class="marke marke--ok">Jetzt dran: euer Vortrag</span>
        <h3>${sicher(k.person.split(",")[0])}</h3>
        ${vortragsListe(k)}
      </div>

      <div class="ergebnis ergebnis--klein">
        <span class="ergebnis__zahl">${runde.punkte}</span>
        <div class="ergebnis__neben">
          <span class="leise">dein Durchlauf · von ${HOECHST} Punkten · ${runde.fehler} ${runde.fehler === 1 ? "Fehlversuch" : "Fehlversuche"}</span>
          ${gruppenstand(inhalt)}
          <span class="leise">${!gesendet ? "Nicht gesendet — meldet euch mündlich."
            : schon ? "Dein Durchlauf war schon eingetragen."
            : "Ihr steht an der Tafel. Lasst diese Seite offen, bis ihr dran seid."}</span>
        </div>
      </div>
    </article>`);
}

/* Nach dem Abschicken: zeigen, sobald auch die andere Person fertig ist */
function gruppeBeobachten() {
  partnerSucheBeenden();
  runde.partnerUhr = setInterval(async () => {
    try {
      const antwort = await fetch(`${ENDPUNKT}?aktion=gruppe&id=${encodeURIComponent(runde.id)}`, { cache: "no-store" });
      if (!antwort.ok) return;
      const inhalt = await antwort.json();
      if (!inhalt || !Array.isArray(inhalt.ergebnisse)) return;
      if (Array.isArray(inhalt.mitglieder)) runde.mitglieder = inhalt.mitglieder;
      inhalt.abgegeben = inhalt.ergebnisse.filter(Boolean).length;
      const felder = document.querySelectorAll(".ergebnis__neben .leise");
      if (felder[1]) felder[1].outerHTML = gruppenstand(inhalt);
      if (inhalt.fertig) partnerSucheBeenden();
    } catch (e) { /* beim nächsten Versuch wieder */ }
  }, 4000);
}

/* --- Tastatur und Start ---------------------------------------------- */

document.addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.key >= "1" && e.key <= "4") {
    const knopf = document.querySelector(`.option[data-pos="${Number(e.key) - 1}"]`);
    if (knopf && !knopf.disabled) { e.preventDefault(); waehle(Number(knopf.dataset.i)); }
  }
  if (e.key === "Enter") {
    const weiter = $("#weiter");
    if (weiter) { e.preventDefault(); weiter.click(); }
  }
});

/* Beim Laden zuerst nachsehen, ob dieses Gerät schon in einer Gruppe ist.
   Sonst entstünde bei jedem Neuladen eine neue Gruppe — und eine Person
   würde mehrfach vergeben. */
async function start() {
  const gemerkt = gespeichert();
  if (gemerkt && await gruppeFortsetzen(gemerkt)) return;
  zeigeStart();
}

async function gruppeFortsetzen(gemerkt) {
  if (!/^https?:$/.test(location.protocol)) return false;
  let daten;
  try {
    const antwort = await fetch(`${ENDPUNKT}?aktion=gruppe&id=${encodeURIComponent(gemerkt.id)}`, { cache: "no-store" });
    if (antwort.status === 404) { vergessen(); return false; }   // Liste wurde zurückgesetzt
    if (!antwort.ok) return false;
    daten = await antwort.json();
  } catch (e) {
    return false;                                               // kein Netz: normal anfangen
  }
  if (!daten || typeof daten.person !== "number" || !STORY.kapitel[daten.person]) return false;

  Object.assign(runde, {
    id: gemerkt.id,
    gruppe: gemerkt.gruppe,
    platz: gemerkt.platz || 1,
    mitglieder: Array.isArray(daten.mitglieder) && daten.mitglieder.length
      ? daten.mitglieder : (gemerkt.mitglieder || [gemerkt.gruppe]),
    person: daten.person,
    szene: 0, punkte: 0, fehler: 0
  });
  merken();

  // Hat dieses Gerät schon abgegeben? Dann gleich wieder die Ergebnisse zeigen.
  const meins = Array.isArray(daten.ergebnisse) ? daten.ergebnisse[runde.platz - 1] : null;
  if (meins) {
    runde.punkte = meins.punkte;
    runde.fehler = meins.fehler;
    runde.szene = 3;
    setzeSzene(STORY.kapitel[runde.person].szene);
    daten.abgegeben = daten.ergebnisse.filter(Boolean).length;
    zeigeAbschluss(true, true, daten);
    if (!daten.fertig) gruppeBeobachten();
    return true;
  }
  zeigeZuteilung();
  return true;
}

function vergessen() {
  try { localStorage.removeItem(SPEICHER); } catch (e) { /* egal */ }
}

document.addEventListener("DOMContentLoaded", start);
