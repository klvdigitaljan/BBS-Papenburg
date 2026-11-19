/*
 * experte.js — Expertenrunde für die Schülergeräte.
 *
 * Jede Gruppe bekommt vom Server reihum eine der sechs Personen zugeteilt,
 * trifft drei Entscheidungen und bereitet daraus einen 90-Sekunden-Vortrag vor.
 * Die Zuteilung bleibt im Gerät gemerkt; Neuladen ändert nichts.
 */

const ENDPUNKT   = "experten.php";
const SPEICHER   = "attentaeter.expertengruppe";
const PRO_FRAGE  = [100, 60, 30];     // Punkte nach Anzahl der Fehlversuche
const HOECHST    = 300;               // drei Entscheidungen

/* Je Person die drei charakteristischen Entscheidungen (Index in k.szenen) */
const AUSWAHL = [[0, 2, 3], [1, 2, 3], [0, 1, 2], [0, 1, 2], [0, 1, 2], [0, 2, 3]];

const $ = (sel) => document.querySelector(sel);
const sicher = (t) => String(t).replace(/[&<>"']/g, (z) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[z]));

const runde = {
  id: null,        // Kennung der Gruppe auf dem Server
  gruppe: "",
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
      <p class="lage">Gleich bekommt ihr <strong>eine der sechs Personen zugeteilt</strong>. Ihr lest ihre
      Geschichte, trefft drei Entscheidungen, die sie wirklich treffen musste — und stellt sie danach
      der Klasse in <strong>90 Sekunden</strong> vor. Alle anderen lernen diese Person nur von euch.</p>
      <ul class="regeln">
        <li><span class="marker">01</span><span><b>Drei Entscheidungen, je 100 Punkte.</b> Zweiter Versuch 60, dritter 30. Nichts geht verloren, wenn ihr falsch liegt.</span></li>
        <li><span class="marker">02</span><span><b>Richtig ist,</b> was damals wirklich entschieden wurde — nicht, was am klügsten klingt.</span></li>
        <li><span class="marker">03</span><span><b>Vortragsbonus: 200 Punkte.</b> Die beste Gruppe je Person trägt vor.</span></li>
        <li><span class="marker">04</span><span><b>Lest sorgfältig.</b> Was ihr nicht lest, könnt ihr nachher nicht erzählen.</span></li>
      </ul>
      <div class="feld">
        <label for="gruppe">Eure Namen</label>
        <input id="gruppe" type="text" maxlength="28" placeholder="Mia und Jonas" autocomplete="off">
      </div>
      <div class="knopfreihe">
        <button class="knopf" id="los">Person zuteilen lassen</button>
        <span class="meldung" id="meldung"></span>
      </div>
    </article>`);

  const gemerkt = gespeichert();
  if (gemerkt) {
    $("#gruppe").value = gemerkt.gruppe || "";
    $("#meldung").innerHTML = `Ihr wart schon zugeteilt.
      <a href="#" id="weiter-mit">Weiter mit ${sicher(STORY.kapitel[gemerkt.person].person.split(",")[0])}</a>`;
    $("#weiter-mit").addEventListener("click", (e) => {
      e.preventDefault();
      Object.assign(runde, gemerkt, { szene: 0, punkte: 0, fehler: 0 });
      zeigeZuteilung();
    });
  }
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
  try { localStorage.setItem(SPEICHER, JSON.stringify({ id: runde.id, gruppe: runde.gruppe, person: runde.person })); }
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
    Object.assign(runde, { id: inhalt.id, gruppe: name, person: inhalt.person, szene: 0, punkte: 0, fehler: 0 });
    merken();
    zeigeZuteilung();
  } catch (fehler) {
    $("#los").disabled = false;
    $("#meldung").textContent = fehler.message + " Sagt der Lehrkraft Bescheid.";
  }
}

/* --- Zuteilung ------------------------------------------------------- */

function zeigeZuteilung() {
  const k = STORY.kapitel[runde.person];
  setzeSzene(k.szene);
  kopf();
  male(`
    <article class="karte">
      <p class="eyebrow"><span>Eure Person</span><span>Akte ${k.nr}</span><span>${sicher(k.kurzdatum)}</span></p>
      <h2>${sicher(k.person.split(",")[0])}</h2>
      <div class="daten">
        <div><span class="k">Datum</span><span class="w">${sicher(k.datum)}</span></div>
        <div><span class="k">Ort</span><span class="w">${sicher(k.ort)}</span></div>
        <div><span class="k">Rolle</span><span class="w">${sicher(k.person)}</span></div>
      </div>
      <p class="lage">${k.intro}</p>
      <div class="knopfreihe"><button class="knopf" id="weiter">Erste Entscheidung</button></div>
    </article>`);
  $("#weiter").addEventListener("click", zeigeSzene);
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
      <p class="eyebrow"><span>Akte ${k.nr} · ${sicher(k.kurzdatum)}</span><span>Entscheidung ${runde.szene + 1} von 3</span></p>
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

/* --- Vortragskarte --------------------------------------------------- */

function zeigeVortrag() {
  const k = STORY.kapitel[runde.person];
  kopf();
  male(`
    <article class="karte karte--weit">
      <p class="eyebrow"><span>Akte ${k.nr} · Ausgang</span><span>${sicher(k.kurzdatum)}</span></p>
      <h2>${sicher(k.epilog.titel)}</h2>
      <p class="lage">${k.epilog.text}</p>
      <ul class="fakten">${k.epilog.fakten.map((f) => `<li><span>${f}</span></li>`).join("")}</ul>

      <div class="vortrag">
        <span class="marke marke--ok">Euer Vortrag · 90 Sekunden</span>
        <p class="leise">Diese vier Punkte erzählt ihr der Klasse. Alles dafür steht oben und auf den
        Seiten davor — schaut noch einmal nach, bevor ihr euch meldet.</p>
        <ol class="vortrag__punkte">
          <li><b>Wer war das?</b><span>${sicher(k.person)} · ${sicher(k.datum)} · ${sicher(k.ort)}</span></li>
          <li><b>Was war der Plan?</b><span>Mit welchem Mittel, auf welchem Weg kam diese Person an Hitler heran?</span></li>
          <li><b>Woran ist es gescheitert?</b><span>Ein Satz — das ist der wichtigste.</span></li>
          <li><b>Was wurde aus ihr?</b><span>Steht in den drei Zeilen über diesem Kasten.</span></li>
        </ol>
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
      body: JSON.stringify({ id: runde.id, punkte: runde.punkte, fehler: runde.fehler })
    });
    const inhalt = await antwort.json().catch(() => null);
    if (!antwort.ok || !inhalt || !Array.isArray(inhalt.gruppen)) {
      throw new Error((inhalt && inhalt.fehler) || "Die Tafel antwortet nicht.");
    }
    zeigeAbschluss(true);
  } catch (fehler) {
    $("#fertig").disabled = false;
    $("#meldung").textContent = fehler.message + " Meldet euch mündlich.";
  }
}

function zeigeAbschluss(gesendet) {
  const k = STORY.kapitel[runde.person];
  kopf();
  male(`
    <article class="karte karte--weit">
      <p class="eyebrow"><span>${sicher(runde.gruppe)}</span><span>Akte ${k.nr}</span></p>
      <div class="ergebnis">
        <span class="ergebnis__zahl">${runde.punkte}</span>
        <div class="ergebnis__neben">
          <span class="leise">von ${HOECHST} Punkten · ${runde.fehler} ${runde.fehler === 1 ? "Fehlversuch" : "Fehlversuche"}</span>
          <span class="leise">${gesendet ? "Ihr steht an der Tafel. Der Vortragsbonus bringt bis zu 200 Punkte dazu." : "Nicht gesendet — meldet euch mündlich."}</span>
        </div>
      </div>
      <div class="vortrag vortrag--gross">
        <span class="marke marke--ok">Jetzt: euren Vortrag vorbereiten</span>
        <h3>${sicher(k.person.split(",")[0])} — ${sicher(k.kurzdatum)}</h3>
        <ol class="vortrag__punkte">
          <li><b>Wer?</b><span>${sicher(k.person)}, ${sicher(k.ort)}</span></li>
          <li><b>Plan?</b><span>Womit und wie nah kam die Person heran?</span></li>
          <li><b>Gescheitert woran?</b><span>${sicher(k.epilog.titel)} — erzählt es in einem Satz.</span></li>
          <li><b>Und danach?</b><span>${k.epilog.fakten[k.epilog.fakten.length - 1].replace(/<[^>]*>/g, "")}</span></li>
        </ol>
        <p class="leise">Lasst diese Seite offen, bis ihr dran seid.</p>
      </div>
      <div class="knopfreihe">
        <button class="knopf knopf--leise" id="nochmal">Noch einmal nachlesen</button>
      </div>
    </article>`);
  $("#nochmal").addEventListener("click", zeigeZuteilung);
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

document.addEventListener("DOMContentLoaded", zeigeStart);
