/*
 * qr.js — kleiner QR-Code-Erzeuger (Byte-Modus, Fehlerkorrektur M, Versionen 1–10).
 *
 * Eigenbau, damit Spiel und Tafelansicht ohne fremde Bibliothek und ohne
 * Internetzugang auskommen. Die erzeugten Muster sind gegen die Bibliothek
 * "segno" geprüft (siehe tools/qr-pruefen.mjs).
 */

const QR = (() => {

  /* --- Rechnen im Galois-Feld GF(256) -------------------------------- */

  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  (() => {
    let x = 1;
    for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  const mal = (a, b) => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];

  function generator(grad) {
    let g = [1];
    for (let i = 0; i < grad; i++) {
      const n = new Array(g.length + 1).fill(0);
      // g(x) * (x + a^i): der Faktor x verschiebt, a^i multipliziert
      for (let j = 0; j < g.length; j++) { n[j] ^= g[j]; n[j + 1] ^= mal(g[j], EXP[i]); }
      g = n;
    }
    return g;
  }

  function fehlerkorrektur(daten, anzahl) {
    const g = generator(anzahl);
    const rest = daten.concat(new Array(anzahl).fill(0));
    for (let i = 0; i < daten.length; i++) {
      const f = rest[i];
      if (f !== 0) for (let j = 0; j < g.length; j++) rest[i + j] ^= mal(g[j], f);
    }
    return rest.slice(daten.length);
  }

  /* --- Tabellen für Fehlerkorrekturstufe M ---------------------------- */
  // Version: [EC-Wörter je Block, [[Anzahl Blöcke, Datenwörter je Block], ...]]
  const VERSIONEN = {
    1:  [10, [[1, 16]]],
    2:  [16, [[1, 28]]],
    3:  [26, [[1, 44]]],
    4:  [18, [[2, 32]]],
    5:  [24, [[2, 43]]],
    6:  [16, [[4, 27]]],
    7:  [18, [[4, 31]]],
    8:  [22, [[2, 38], [2, 39]]],
    9:  [22, [[3, 36], [2, 37]]],
    10: [26, [[4, 43], [1, 44]]]
  };
  const AUSRICHTUNG = {
    1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
    6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50]
  };
  const RESTBITS = { 1: 0, 2: 7, 3: 7, 4: 7, 5: 7, 6: 7, 7: 0, 8: 0, 9: 0, 10: 0 };

  const datenWoerter = (v) => VERSIONEN[v][1].reduce((s, [n, d]) => s + n * d, 0);

  /* --- Nutzdaten aufbereiten ------------------------------------------ */

  function bytes(text) {
    return Array.from(new TextEncoder().encode(text));
  }

  function version(anzahlBytes) {
    for (let v = 1; v <= 10; v++) {
      const kopf = 4 + (v <= 9 ? 8 : 16);
      if (datenWoerter(v) * 8 >= kopf + anzahlBytes * 8) return v;
    }
    throw new Error("Text zu lang für Version 10");
  }

  function bitfolge(daten, v) {
    const bits = [];
    const schreibe = (wert, laenge) => { for (let i = laenge - 1; i >= 0; i--) bits.push((wert >> i) & 1); };
    schreibe(0b0100, 4);                       // Byte-Modus
    schreibe(daten.length, v <= 9 ? 8 : 16);   // Zeichenzahl
    daten.forEach((b) => schreibe(b, 8));

    const kapazitaet = datenWoerter(v) * 8;
    for (let i = 0; i < 4 && bits.length < kapazitaet; i++) bits.push(0);   // Abschluss
    while (bits.length % 8 !== 0) bits.push(0);

    const woerter = [];
    for (let i = 0; i < bits.length; i += 8) {
      woerter.push(bits.slice(i, i + 8).reduce((w, b) => (w << 1) | b, 0));
    }
    const fuell = [0xec, 0x11];
    let i = 0;
    while (woerter.length < datenWoerter(v)) woerter.push(fuell[i++ % 2]);
    return woerter;
  }

  function verschraenken(woerter, v) {
    const [ecAnzahl, aufteilung] = VERSIONEN[v];
    const datenBloecke = [];
    const ecBloecke = [];
    let pos = 0;
    aufteilung.forEach(([anzahl, laenge]) => {
      for (let i = 0; i < anzahl; i++) {
        const block = woerter.slice(pos, pos + laenge);
        pos += laenge;
        datenBloecke.push(block);
        ecBloecke.push(fehlerkorrektur(block, ecAnzahl));
      }
    });
    const folge = [];
    const maxDaten = Math.max(...datenBloecke.map((b) => b.length));
    for (let i = 0; i < maxDaten; i++) datenBloecke.forEach((b) => { if (i < b.length) folge.push(b[i]); });
    for (let i = 0; i < ecAnzahl; i++) ecBloecke.forEach((b) => folge.push(b[i]));
    return folge;
  }

  /* --- Raster aufbauen ------------------------------------------------- */

  function grundraster(v) {
    const n = 17 + 4 * v;
    const feld = Array.from({ length: n }, () => new Array(n).fill(null));  // null = frei

    const suchmuster = (zx, zy) => {
      for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) {
        const px = zx + x, py = zy + y;
        if (px < 0 || py < 0 || px >= n || py >= n) continue;
        const rand = x === -1 || x === 7 || y === -1 || y === 7;
        const innen = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        const ring = x === 0 || x === 6 || y === 0 || y === 6;
        feld[py][px] = (!rand && (ring || innen)) ? 1 : 0;
      }
    };
    suchmuster(0, 0); suchmuster(n - 7, 0); suchmuster(0, n - 7);

    for (let i = 8; i < n - 8; i++) {                   // Taktlinien
      const wert = (i % 2 === 0) ? 1 : 0;
      feld[6][i] = wert; feld[i][6] = wert;
    }

    const mitten = AUSRICHTUNG[v];                      // Ausrichtungsmuster
    const letzte = mitten[mitten.length - 1];
    mitten.forEach((zy) => mitten.forEach((zx) => {
      // Nur die drei Stellen entfallen, an denen ein Sucher steht.
      // Muster auf den Taktlinien werden gezeichnet und überschreiben diese.
      const beiSucher = (zx === 6 && zy === 6) || (zx === 6 && zy === letzte) || (zx === letzte && zy === 6);
      if (beiSucher) return;
      for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) {
        const kante = Math.max(Math.abs(x), Math.abs(y));
        feld[zy + y][zx + x] = (kante === 1) ? 0 : 1;
      }
    }));

    feld[n - 8][8] = 1;                                 // immer dunkles Modul

    if (v >= 7) {                                       // Platz für die Versionsinformation
      for (let i = 0; i < 18; i++) {
        const a = Math.floor(i / 3), b = i % 3;
        if (feld[b + n - 11][a] === null) feld[b + n - 11][a] = 0;
        if (feld[a][b + n - 11] === null) feld[a][b + n - 11] = 0;
      }
    }

    for (let i = 0; i < 9; i++) {                       // Platz für Formatinfo
      if (feld[8][i] === null) feld[8][i] = 0;
      if (feld[i][8] === null) feld[i][8] = 0;
    }
    for (let i = 0; i < 8; i++) {
      if (feld[8][n - 1 - i] === null) feld[8][n - 1 - i] = 0;
      if (feld[n - 1 - i][8] === null) feld[n - 1 - i][8] = 0;
    }
    return feld;
  }

  function frei(v) {
    // Kopie des Grundrasters: true = hier dürfen Daten stehen
    const feld = grundraster(v);
    return feld.map((zeile) => zeile.map((z) => z === null));
  }

  function datenLegen(feld, platz, folge, v) {
    const n = feld.length;
    const bits = [];
    folge.forEach((w) => { for (let i = 7; i >= 0; i--) bits.push((w >> i) & 1); });
    for (let i = 0; i < RESTBITS[v]; i++) bits.push(0);

    let idx = 0, aufwaerts = true;
    for (let rechts = n - 1; rechts > 0; rechts -= 2) {
      if (rechts === 6) rechts--;                        // Spalte der Taktlinie überspringen
      for (let s = 0; s < n; s++) {
        const y = aufwaerts ? n - 1 - s : s;
        for (const x of [rechts, rechts - 1]) {
          if (!platz[y][x]) continue;
          feld[y][x] = idx < bits.length ? bits[idx] : 0;
          idx++;
        }
      }
      aufwaerts = !aufwaerts;
    }
    return feld;
  }

  const MASKEN = [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x, y) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
  ];

  function formatBits(maske) {
    const daten = (0b00 << 3) | maske;                   // 00 = Stufe M
    let rest = daten << 10;
    for (let i = 4; i >= 0; i--) if (rest & (1 << (i + 10))) rest ^= 0x537 << i;
    return ((daten << 10) | rest) ^ 0b101010000010010;
  }

  function formatLegen(feld, maske) {
    const n = feld.length;
    const bits = formatBits(maske);
    const b = (k) => (bits >> k) & 1;          // k = Bitnummer, 14 ist das höchste

    // Kopie um den Sucher oben links
    for (let i = 0; i <= 5; i++) feld[8][i] = b(14 - i);
    feld[8][7] = b(8);
    feld[8][8] = b(7);
    feld[7][8] = b(6);
    for (let i = 0; i <= 5; i++) feld[i][8] = b(i);

    // zweite Kopie: unten links und oben rechts
    for (let i = 0; i <= 6; i++) feld[n - 1 - i][8] = b(14 - i);
    for (let i = 0; i <= 7; i++) feld[8][n - 1 - i] = b(i);
  }

  function versionLegen(feld, v) {
    if (v < 7) return;
    const n = feld.length;
    let rest = v << 12;
    for (let i = 5; i >= 0; i--) if (rest & (1 << (i + 12))) rest ^= 0x1f25 << i;
    const bits = (v << 12) | rest;
    for (let i = 0; i < 18; i++) {
      const bit = (bits >> i) & 1;
      const a = Math.floor(i / 3), b = i % 3;
      feld[b + n - 11][a] = bit;
      feld[a][b + n - 11] = bit;
    }
  }

  function strafe(feld) {
    const n = feld.length;
    let punkte = 0;

    const lauf = (hole) => {
      for (let a = 0; a < n; a++) {
        let letzte = -1, laenge = 0;
        for (let b = 0; b < n; b++) {
          const z = hole(a, b);
          if (z === letzte) { laenge++; } else { if (laenge >= 5) punkte += 3 + (laenge - 5); letzte = z; laenge = 1; }
        }
        if (laenge >= 5) punkte += 3 + (laenge - 5);
      }
    };
    lauf((y, x) => feld[y][x]);
    lauf((x, y) => feld[y][x]);

    for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) {
      const z = feld[y][x];
      if (z === feld[y][x + 1] && z === feld[y + 1][x] && z === feld[y + 1][x + 1]) punkte += 3;
    }

    const muster1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    const muster2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
    const sucheMuster = (hole) => {
      for (let a = 0; a < n; a++) for (let b = 0; b <= n - 11; b++) {
        let t1 = true, t2 = true;
        for (let i = 0; i < 11; i++) {
          const z = hole(a, b + i);
          if (z !== muster1[i]) t1 = false;
          if (z !== muster2[i]) t2 = false;
        }
        if (t1) punkte += 40;
        if (t2) punkte += 40;
      }
    };
    sucheMuster((y, x) => feld[y][x]);
    sucheMuster((x, y) => feld[y][x]);

    let dunkel = 0;
    feld.forEach((z) => z.forEach((m) => { if (m) dunkel++; }));
    const anteil = (dunkel * 100) / (n * n);
    punkte += 10 * Math.floor(Math.abs(anteil - 50) / 5);
    return punkte;
  }

  /* --- öffentliche Funktionen ------------------------------------------ */

  function raster(text, maskeErzwungen) {
    const daten = bytes(text);
    const v = version(daten.length);
    const platz = frei(v);
    const folge = verschraenken(bitfolge(daten, v), v);

    let bestes = null, besteStrafe = Infinity;
    for (let maske = 0; maske < 8; maske++) {
      const feld = datenLegen(grundraster(v), platz, folge, v);
      for (let y = 0; y < feld.length; y++) for (let x = 0; x < feld.length; x++) {
        if (platz[y][x] && MASKEN[maske](x, y)) feld[y][x] ^= 1;
      }
      formatLegen(feld, maske);
      versionLegen(feld, v);
      if (maskeErzwungen !== undefined) { if (maske === maskeErzwungen) return feld; continue; }
      const s = strafe(feld);
      if (s < besteStrafe) { besteStrafe = s; bestes = feld; }
    }
    return bestes;
  }

  // Liefert fertiges SVG-Markup mit ruhiger Zone.
  function svg(text, { rand = 4, dunkel = "#0e1013", hell = "#ffffff", groesse = 0 } = {}) {
    const feld = raster(text);
    const n = feld.length;
    const gesamt = n + rand * 2;
    let pfad = "";
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (feld[y][x]) pfad += `M${x + rand} ${y + rand}h1v1h-1z`;
    }
    const masse = groesse ? ` width="${groesse}" height="${groesse}"` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gesamt} ${gesamt}"${masse}
      shape-rendering="crispEdges" role="img" aria-label="QR-Code">
      <rect width="${gesamt}" height="${gesamt}" fill="${hell}"/>
      <path d="${pfad}" fill="${dunkel}"/>
    </svg>`;
  }

  return { raster, svg };
})();

if (typeof module !== "undefined") { module.exports = QR; }
