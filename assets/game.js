/*
 * game.js — Spiellogik für das "Hitler-Attentäter-Spiel"
 *
 * Ablauf: Startbild → je Kapitel (Aktendeckel → Entscheidungsszenen → Epilog) → Abspann.
 * Die historisch belegte Entscheidung ist immer die richtige. Falsche Entscheidungen
 * kosten Punkte und eine der drei Spuren; sind alle drei weg, beginnt das Kapitel neu.
 */

const PUNKTE_PRO_SZENE = 120;
const ABZUG_PRO_FEHLER = 40;
const MINDESTPUNKTE     = 20;
const BONUS_KAPITEL     = 100;   // Kapitel ohne Fehler
const BONUS_AKTE        = 300;   // gesamtes Spiel ohne Fehler
const SPUREN            = 3;
const SPEICHER          = "dreizehn-minuten.rangliste";

/* Pfad zum Schullogo. tools/build.mjs ersetzt diese Zeichenkette beim Bauen der
   Einzeldatei durch das eingebettete Bild, damit die Datei ohne Ordner auskommt.
   Fehlt die Datei, bleibt nur der Schriftzug stehen — kein kaputtes Bildsymbol. */
const LOGO_QUELLE = "assets/logo.png";

function schulmarke(klasse) {
  return `<span class="schulmarke ${klasse || ""}">
    <img class="schullogo" src="${LOGO_QUELLE}" alt="">
    <span class="schulname">BBS Papenburg<b>Technik und Wirtschaft</b></span>
  </span>`;
}

const spiel = {
  name: "",
  kapitel: 0,
  szene: 0,
  punkte: 0,
  kapitelPunkte: 0,
  spuren: SPUREN,
  fehler: 0,
  kapitelFehler: 0,
  fehlversuche: 0,     // in der aktuellen Szene
  start: 0,
  lauft: false
};

/* --- Werkzeug -------------------------------------------------------- */

const $ = (sel) => document.querySelector(sel);

function sicher(text) {
  return String(text).replace(/[&<>"']/g, (z) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[z]));
}

/* Kurzcode für die Tafel-Bestenliste: Punkte, Fehler und Zeit in Basis 36,
   dazu ein Prüfzeichen, damit Tippfehler beim Abschreiben auffallen. */
function ergebnisCode(punkte, fehler, sekunden) {
  const b36 = (wert, stellen) => Math.max(0, Math.min(Math.pow(36, stellen) - 1, Math.round(wert)))
    .toString(36).toUpperCase().padStart(stellen, "0");
  const kern = b36(punkte, 3) + b36(fehler, 2) + b36(sekunden, 3);
  let summe = 0;
  for (const z of kern) summe += parseInt(z, 36);
  return kern + (summe % 36).toString(36).toUpperCase();
}

function zeitString(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function setzeSzene(name) {
  const box = $("#szene");
  box.innerHTML = (SCENES[name] || SCENES.titel)();
  box.classList.remove("wechsel");
  void box.offsetWidth;            // Neustart der Einblend-Animation erzwingen
  box.classList.add("wechsel");
}

function male(html) {
  $("#inhalt").innerHTML = html;
  logoPruefen();
  $("#inhalt").scrollIntoView({ block: "nearest" });
}

// Ohne Logodatei bleibt der Schriftzug allein stehen.
function logoPruefen() {
  document.querySelectorAll("img.schullogo").forEach((bild) => {
    if (bild.dataset.geprueft) return;
    bild.dataset.geprueft = "1";
    bild.addEventListener("error", () => bild.remove());
    if (bild.complete && bild.naturalWidth === 0) bild.remove();
  });
}

/* --- Kopfleiste ------------------------------------------------------ */

function zeichneHud(sichtbar) {
  const hud = $("#hud");
  hud.hidden = !sichtbar;
  if (!sichtbar) return;

  const k = STORY.kapitel[spiel.kapitel];
  const punkte = spiel.punkte + spiel.kapitelPunkte;

  hud.innerHTML = `
    <span class="hud__akte">${k ? sicher(k.akte) : "AKTE"}</span>
    <span class="zeitleiste" role="img" aria-label="Fortschritt: Akte ${spiel.kapitel + 1} von ${STORY.kapitel.length}">
      ${STORY.kapitel.map((_, i) => `<span class="zeitleiste__punkt
        ${i < spiel.kapitel ? "erledigt" : ""} ${i === spiel.kapitel ? "aktiv" : ""}"></span>`).join("")}
    </span>
    <span class="hud__rest">
      <span class="leben" role="img" aria-label="Verbleibende Spuren: ${spiel.spuren} von ${SPUREN}">
        ${Array.from({ length: SPUREN }, (_, i) =>
          `<span class="leben__zeichen ${i < spiel.spuren ? "" : "weg"}"></span>`).join("")}
      </span>
      <span class="punkte">Punkte <b>${punkte}</b></span>
    </span>`;
}

/* --- Startbild ------------------------------------------------------- */

function zeigeStart() {
  setzeSzene("titel");
  zeichneHud(false);
  male(`
    <article class="karte karte--weit titelblock">
      ${schulmarke("schulmarke--gross")}
      <p class="eyebrow"><span>Geschichte interaktiv</span><span>1939 – 1944</span><span>6 Akten</span></p>
      <h1>Hitler-<br>Attentäter-<br>Spiel</h1>
      <p class="untertitel">Sechs Attentate auf Hitler — und warum jedes scheiterte</p>
      <p class="lage">Du übernimmst nacheinander die Rolle von sechs Menschen, die versucht haben,
      Hitler zu töten. Vor dir liegen ihre Entscheidungen: über Sprengstoff, Tarnung, Termine,
      über den eigenen Tod. <strong>Historisch richtig entschieden heißt hier: so, wie es damals
      wirklich entschieden wurde.</strong> Wer die Geschichte kennt, kommt durch die Akte —
      und überlebt jedes Attentat genauso, wie Hitler es damals überlebte.</p>
      <ul class="regeln">
        <li><span class="marker">01</span><span><b>Sechs Akten, 24 Entscheidungen.</b> Jede richtige Entscheidung bringt bis zu ${PUNKTE_PRO_SZENE} Punkte.</span></li>
        <li><span class="marker">02</span><span><b>Drei Spuren pro Akte.</b> Jeder Fehlversuch kostet eine Spur und ${ABZUG_PRO_FEHLER} Punkte. Du darfst weiterraten — aber es wird teuer.</span></li>
        <li><span class="marker">03</span><span><b>Sind alle Spuren weg,</b> beginnt die Akte von vorn und die Punkte dieser Akte verfallen.</span></li>
        <li><span class="marker">04</span><span><b>Fehlerfreie Akte:</b> +${BONUS_KAPITEL} Punkte. Fehlerfreies Spiel: +${BONUS_AKTE} Punkte.</span></li>
        <li><span class="marker">05</span><span><b>Nach jeder Entscheidung</b> erfährst du, was wirklich geschah. Lies es — die nächste Akte baut darauf auf.</span></li>
      </ul>
      <div class="feld">
        <label for="name">Name für die Rangliste</label>
        <input id="name" type="text" maxlength="22" placeholder="z. B. Mia K." autocomplete="off">
      </div>
      <div class="knopfreihe">
        <button class="knopf" id="los">Akte I öffnen</button>
        <button class="knopf knopf--leise" id="rangliste-zeigen">Rangliste</button>
      </div>
      <p class="tastenhinweis">Tastatur: 1 – 3 wählt eine Option, Enter blättert weiter.</p>
    </article>`);

  $("#name").value = localStorage.getItem("dreizehn-minuten.name") || "";
  $("#los").addEventListener("click", spielStarten);
  $("#name").addEventListener("keydown", (e) => { if (e.key === "Enter") spielStarten(); });
  $("#rangliste-zeigen").addEventListener("click", () => zeigeRangliste(null));
}

function spielStarten() {
  const name = ($("#name")?.value || "").trim();
  spiel.name = name || "Unbekannt";
  try { localStorage.setItem("dreizehn-minuten.name", spiel.name); } catch (e) { /* Privatmodus */ }
  Object.assign(spiel, {
    kapitel: 0, szene: 0, punkte: 0, kapitelPunkte: 0, spuren: SPUREN,
    fehler: 0, kapitelFehler: 0, fehlversuche: 0, start: Date.now(), lauft: true
  });
  zeigeKapitel();
}

/* --- Aktendeckel ----------------------------------------------------- */

function zeigeKapitel() {
  const k = STORY.kapitel[spiel.kapitel];
  spiel.szene = 0;
  spiel.spuren = SPUREN;
  spiel.kapitelPunkte = 0;
  spiel.kapitelFehler = 0;
  setzeSzene(k.szene);
  zeichneHud(true);
  male(`
    <article class="karte">
      <p class="eyebrow"><span>Akte ${k.nr}</span><span>${sicher(k.datum)}</span><span>${sicher(k.ort)}</span></p>
      <h2>${sicher(k.person.split(",")[0])}</h2>
      <div class="daten">
        <div><span class="k">Datum</span><span class="w">${sicher(k.datum)}</span></div>
        <div><span class="k">Ort</span><span class="w">${sicher(k.ort)}</span></div>
        <div><span class="k">Deine Rolle</span><span class="w">${sicher(k.person)}</span></div>
      </div>
      <p class="lage">${k.intro}</p>
      <div class="knopfreihe"><button class="knopf" id="weiter">Erste Entscheidung</button></div>
    </article>`);
  $("#weiter").addEventListener("click", zeigeSzene);
}

/* --- Entscheidungsszene ---------------------------------------------- */

function mischen(anzahl) {
  const folge = Array.from({ length: anzahl }, (_, i) => i);
  for (let i = folge.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [folge[i], folge[j]] = [folge[j], folge[i]];
  }
  return folge;
}

function zeigeSzene() {
  const k = STORY.kapitel[spiel.kapitel];
  const s = k.szenen[spiel.szene];
  const folge = mischen(s.optionen.length);
  spiel.fehlversuche = 0;
  zeichneHud(true);
  male(`
    <article class="karte">
      <p class="eyebrow">
        <span>Akte ${k.nr} · ${sicher(k.kurzdatum)}</span>
        <span>Entscheidung ${spiel.szene + 1} von ${k.szenen.length}</span>
      </p>
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
  const k = STORY.kapitel[spiel.kapitel];
  const s = k.szenen[spiel.szene];
  const o = s.optionen[i];
  const knopf = document.querySelector(`.option[data-i="${i}"]`);

  if (o.ok) {
    document.querySelectorAll(".option").forEach((b) => { b.disabled = true; });
    knopf.classList.add("richtig");
    knopf.disabled = true;

    const gewinn = Math.max(MINDESTPUNKTE, PUNKTE_PRO_SZENE - spiel.fehlversuche * ABZUG_PRO_FEHLER);
    spiel.kapitelPunkte += gewinn;
    const letzte = spiel.szene === k.szenen.length - 1;

    $("#rueckmeldung").innerHTML = `
      <div class="rueckmeldung">
        <span class="marke marke--ok">So war es · +${gewinn} Punkte</span>
        <p>${o.fb}</p>
        ${s.quelle ? `<p class="quelle">Quellennotiz: ${s.quelle}</p>` : ""}
        <div class="knopfreihe">
          <button class="knopf" id="weiter">${letzte ? "Akte abschließen" : "Weiter"}</button>
        </div>
      </div>`;
    $("#weiter").addEventListener("click", () => {
      if (letzte) { zeigeEpilog(); } else { spiel.szene++; zeigeSzene(); }
    });
    zeichneHud(true);
    return;
  }

  /* Falsche Entscheidung */
  knopf.classList.add("falsch");
  knopf.disabled = true;
  spiel.fehlversuche++;
  spiel.fehler++;
  spiel.kapitelFehler++;
  spiel.spuren--;
  zeichneHud(true);

  $("#rueckmeldung").innerHTML = `
    <div class="rueckmeldung">
      <span class="marke marke--nein">So war es nicht · eine Spur verloren</span>
      <p>${o.fb}</p>
      ${spiel.spuren > 0
        ? `<p class="leise">Du hast noch ${spiel.spuren} ${spiel.spuren === 1 ? "Spur" : "Spuren"}. Entscheide neu.</p>`
        : `<div class="knopfreihe"><button class="knopf" id="neustart-kapitel">Akte ${k.nr} neu aufrollen</button></div>`}
    </div>`;

  if (spiel.spuren <= 0) {
    document.querySelectorAll(".option").forEach((b) => { b.disabled = true; });
    $("#neustart-kapitel").addEventListener("click", zeigeGescheitert);
  }
}

/* --- Kapitel gescheitert --------------------------------------------- */

function zeigeGescheitert() {
  const k = STORY.kapitel[spiel.kapitel];
  const verfallen = spiel.kapitelPunkte;
  male(`
    <article class="karte">
      <p class="eyebrow"><span>Akte ${k.nr}</span><span>Spur abgerissen</span></p>
      <h2>Die Spur reißt ab</h2>
      <p class="lage">Drei Fehlentscheidungen — in der Wirklichkeit hätte das Verhaftung bedeutet,
      für dich und für alle, die von deinem Plan wussten. Die Akte wird neu aufgerollt.</p>
      <p class="leise">${verfallen} Punkte aus dieser Akte verfallen. Deine bisherigen
      ${spiel.punkte} Punkte aus abgeschlossenen Akten bleiben.</p>
      <div class="knopfreihe"><button class="knopf" id="weiter">Akte ${k.nr} von vorn</button></div>
    </article>`);
  $("#weiter").addEventListener("click", zeigeKapitel);
}

/* --- Epilog eines Kapitels ------------------------------------------- */

function zeigeEpilog() {
  const k = STORY.kapitel[spiel.kapitel];
  let bonus = 0;
  if (spiel.kapitelFehler === 0) { bonus = BONUS_KAPITEL; spiel.kapitelPunkte += bonus; }
  spiel.punkte += spiel.kapitelPunkte;
  spiel.kapitelPunkte = 0;
  zeichneHud(true);

  const letzte = spiel.kapitel === STORY.kapitel.length - 1;
  male(`
    <article class="karte">
      <p class="eyebrow"><span>Akte ${k.nr} · Ausgang</span><span>${sicher(k.kurzdatum)}</span></p>
      <h2>${sicher(k.epilog.titel)}</h2>
      <p class="lage">${k.epilog.text}</p>
      <ul class="fakten">${k.epilog.fakten.map((f) => `<li><span>${f}</span></li>`).join("")}</ul>
      ${bonus ? `<p class="quelle">Akte ohne Fehlentscheidung abgeschlossen: +${bonus} Punkte.</p>` : ""}
      <div class="knopfreihe">
        <button class="knopf" id="weiter">${letzte ? "Auswertung" : "Akte " + STORY.kapitel[spiel.kapitel + 1].nr + " öffnen"}</button>
        <span class="leise">Punkte gesamt: ${spiel.punkte}</span>
      </div>
    </article>`);
  $("#weiter").addEventListener("click", () => {
    if (letzte) { zeigeFinale(); } else { spiel.kapitel++; zeigeKapitel(); }
  });
}

/* --- Abspann --------------------------------------------------------- */

function zeigeFinale() {
  const dauer = Date.now() - spiel.start;
  let bonus = 0;
  if (spiel.fehler === 0) { bonus = BONUS_AKTE; spiel.punkte += bonus; }
  spiel.lauft = false;
  setzeSzene("bendlerblock");
  zeichneHud(false);

  const eintrag = {
    name: spiel.name,
    punkte: spiel.punkte,
    fehler: spiel.fehler,
    sekunden: Math.round(dauer / 1000),
    datum: new Date().toISOString().slice(0, 10)
  };
  const platz = speichereErgebnis(eintrag);

  male(`
    <article class="karte karte--weit">
      ${schulmarke("schulmarke--gross")}
      <p class="eyebrow"><span>Auswertung</span><span>Hitler-Attentäter-Spiel</span><span>${sicher(spiel.name)}</span><span>${eintrag.datum}</span></p>
      <h2>${sicher(STORY.fazit.titel)}</h2>
      <div class="ergebnis">
        <span class="ergebnis__zahl">${spiel.punkte}</span>
        <div class="ergebnis__neben">
          <span class="leise">Punkte · Platz ${platz} in der Rangliste dieses Rechners</span>
          <span class="leise">Fehlentscheidungen: ${spiel.fehler} · Spielzeit: ${zeitString(dauer)}
          ${bonus ? " · Fehlerfrei-Bonus: +" + bonus : ""}</span>
        </div>
      </div>
      <p class="lage">${STORY.fazit.text}</p>
      <blockquote class="zitat">${STORY.fazit.zitat}<cite>${sicher(STORY.fazit.zitatQuelle)}</cite></blockquote>
      <div class="codekarte">
        <span class="marke marke--ok">Für die Bestenliste an der Tafel</span>
        <p class="leise">Sag deinen Namen und diesen Code durch — oder tippe ihn selbst am Lehrerrechner ein.</p>
        <div class="codezeile">
          <code id="ergebniscode">${ergebnisCode(spiel.punkte, spiel.fehler, eintrag.sekunden)}</code>
          <button class="knopf knopf--leise" id="code-kopieren" type="button">Kopieren</button>
        </div>
      </div>
      <div id="ranglistenbereich"></div>
      <div class="knopfreihe">
        <button class="knopf" id="nochmal">Noch einmal spielen</button>
        <button class="knopf knopf--leise" id="drucken">Ergebnis drucken</button>
      </div>
    </article>`);

  zeichneRangliste($("#ranglistenbereich"), eintrag);
  $("#code-kopieren").addEventListener("click", async (e) => {
    const code = $("#ergebniscode").textContent;
    try {
      await navigator.clipboard.writeText(code);
      e.target.textContent = "Kopiert";
    } catch (fehler) {
      // Ohne Zwischenablage-Recht: Code markieren, damit er von Hand kopiert werden kann
      const bereich = document.createRange();
      bereich.selectNodeContents($("#ergebniscode"));
      const auswahl = window.getSelection();
      auswahl.removeAllRanges();
      auswahl.addRange(bereich);
      e.target.textContent = "Markiert";
    }
    setTimeout(() => { e.target.textContent = "Kopieren"; }, 2500);
  });
  $("#nochmal").addEventListener("click", zeigeStart);
  $("#drucken").addEventListener("click", () => window.print());
}

/* --- Rangliste ------------------------------------------------------- */

function ladeRangliste() {
  try { return JSON.parse(localStorage.getItem(SPEICHER) || "[]"); }
  catch (e) { return []; }
}

function speichereErgebnis(eintrag) {
  const liste = ladeRangliste();
  eintrag.id = Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  liste.push(eintrag);
  liste.sort((a, b) => b.punkte - a.punkte || a.sekunden - b.sekunden);
  const gekuerzt = liste.slice(0, 50);
  try { localStorage.setItem(SPEICHER, JSON.stringify(gekuerzt)); } catch (e) { /* Privatmodus */ }
  return gekuerzt.findIndex((e2) => e2.id === eintrag.id) + 1 || "—";
}

function zeichneRangliste(ziel, eigener) {
  const liste = ladeRangliste().slice(0, 10);
  if (!liste.length) {
    ziel.innerHTML = `<p class="leise">Noch keine Ergebnisse auf diesem Rechner.</p>`;
    return;
  }
  ziel.innerHTML = `
    <h3>Rangliste</h3>
    <div class="tabellenhuelle">
      <table class="rangliste">
        <thead><tr><th>Pl.</th><th>Name</th><th>Punkte</th><th>Fehler</th><th>Zeit</th><th>Datum</th></tr></thead>
        <tbody>
          ${liste.map((e, i) => `
            <tr class="${eigener && e.id === eigener.id ? "selbst" : ""}">
              <td>${i + 1}</td>
              <td>${sicher(e.name)}</td>
              <td>${e.punkte}</td>
              <td>${e.fehler}</td>
              <td>${zeitString(e.sekunden * 1000)}</td>
              <td>${sicher(e.datum)}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

function zeigeRangliste() {
  setzeSzene("titel");
  zeichneHud(false);
  male(`
    <article class="karte karte--weit">
      <p class="eyebrow"><span>Rangliste</span><span>Dieser Rechner</span></p>
      <h2>Wer kam am weitesten durch die Akten?</h2>
      <div id="ranglistenbereich"></div>
      <div class="knopfreihe">
        <button class="knopf" id="zurueck">Zurück</button>
        <button class="knopf knopf--leise" id="loeschen">Rangliste löschen</button>
      </div>
    </article>`);
  zeichneRangliste($("#ranglistenbereich"), null);
  $("#zurueck").addEventListener("click", zeigeStart);
  $("#loeschen").addEventListener("click", () => {
    if (window.confirm("Alle gespeicherten Ergebnisse auf diesem Rechner löschen?")) {
      try { localStorage.removeItem(SPEICHER); } catch (e) { /* Privatmodus */ }
      zeigeRangliste();
    }
  });
}

/* --- Tastatur -------------------------------------------------------- */

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

/* --- Start ----------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", zeigeStart);
