/*
 * scenes.js — Hintergrundbilder des Spiels.
 * Alle Szenen sind handgezeichnete SVG-Kulissen: keine Fotos, keine externen Dateien,
 * keine NS-Symbole. Das Spiel läuft dadurch vollständig offline.
 */

/* Hilfsfunktionen ---------------------------------------------------- */

// Deterministischer Zufall, damit eine Szene bei jedem Aufruf gleich aussieht.
function rnd(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function partikel(anzahl, seed, klasse, rMin, rMax) {
  const r = rnd(seed);
  let out = "";
  for (let i = 0; i < anzahl; i++) {
    const x = (r() * 1700 - 50).toFixed(1);
    const y = (r() * 900).toFixed(1);
    const rad = (rMin + r() * (rMax - rMin)).toFixed(2);
    const dur = (6 + r() * 14).toFixed(1);
    const delay = (-r() * 20).toFixed(1);
    out += `<circle class="${klasse}" cx="${x}" cy="${y}" r="${rad}"
      style="animation-duration:${dur}s;animation-delay:${delay}s"/>`;
  }
  return out;
}

function baumreihe(y, hoehe, farbe, seed, anzahl) {
  const r = rnd(seed);
  let out = "";
  for (let i = 0; i < anzahl; i++) {
    const x = (i / anzahl) * 1700 - 50 + r() * 40;
    const h = hoehe * (0.6 + r() * 0.7);
    const b = h * (0.22 + r() * 0.12);
    out += `<path d="M${x} ${y} L${x + b} ${y - h * 0.55} L${x + b * 0.45} ${y - h * 0.5}
      L${x + b * 1.05} ${y - h} L${x - b * 1.05} ${y - h} L${x - b * 0.45} ${y - h * 0.5}
      L${x - b} ${y - h * 0.55} Z" fill="${farbe}"/>`;
  }
  return out;
}

/* Szenen -------------------------------------------------------------- */

const SCENES = {

  /* Titelbild: eine Zünderuhr im Dunkeln --------------------------------- */
  titel: () => `
  <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <radialGradient id="t-glow" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#2a2a24"/>
        <stop offset="55%" stop-color="#15161a"/>
        <stop offset="100%" stop-color="#0b0c0e"/>
      </radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#t-glow)"/>
    <g transform="translate(800 430)" opacity="0.5">
      <circle r="300" fill="none" stroke="#3a342a" stroke-width="2"/>
      <circle r="268" fill="none" stroke="#2a2620" stroke-width="18"/>
      ${Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const lang = i % 5 === 0;
        const r1 = lang ? 232 : 248;
        return `<line x1="${(Math.sin(a) * r1).toFixed(1)}" y1="${(-Math.cos(a) * r1).toFixed(1)}"
          x2="${(Math.sin(a) * 262).toFixed(1)}" y2="${(-Math.cos(a) * 262).toFixed(1)}"
          stroke="${lang ? "#C8A15A" : "#5a5346"}" stroke-width="${lang ? 4 : 2}"/>`;
      }).join("")}
      <line x1="0" y1="30" x2="0" y2="-170" stroke="#C8A15A" stroke-width="7" stroke-linecap="round"/>
      <line class="zeiger" x1="0" y1="20" x2="0" y2="-230" stroke="#A8352F" stroke-width="4" stroke-linecap="round"/>
      <circle r="12" fill="#C8A15A"/>
    </g>
    ${partikel(40, 7, "staub", 0.6, 2.2)}
    <rect width="1600" height="900" fill="url(#t-glow)" opacity="0.25"/>
  </svg>`,

  /* I — Bürgerbräukeller München ---------------------------------------- */
  buergerbraukeller: () => `
  <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="bk-wand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2b1d12"/>
        <stop offset="100%" stop-color="#120c08"/>
      </linearGradient>
      <radialGradient id="bk-lampe" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffd89b" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#ffd89b" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="bk-saeule" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#0f0a06"/>
        <stop offset="35%" stop-color="#4a3320"/>
        <stop offset="40%" stop-color="#463122"/>
        <stop offset="100%" stop-color="#120c08"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#bk-wand)"/>
    <!-- Gewölbebögen -->
    <g fill="#0d0906">
      <path d="M120 900 V420 a180 180 0 0 1 360 0 V900 Z"/>
      <path d="M620 900 V380 a180 180 0 0 1 360 0 V900 Z"/>
      <path d="M1120 900 V420 a180 180 0 0 1 360 0 V900 Z"/>
    </g>
    <g fill="#1d1409">
      <path d="M150 900 V430 a150 150 0 0 1 300 0 V900 Z"/>
      <path d="M650 900 V390 a150 150 0 0 1 300 0 V900 Z"/>
      <path d="M1150 900 V430 a150 150 0 0 1 300 0 V900 Z"/>
    </g>
    <!-- Hängelampen -->
    <g>
      <line x1="300" y1="0" x2="300" y2="250" stroke="#2a1c10" stroke-width="3"/>
      <line x1="1300" y1="0" x2="1300" y2="250" stroke="#2a1c10" stroke-width="3"/>
      <circle cx="300" cy="270" r="220" fill="url(#bk-lampe)" class="flackern"/>
      <circle cx="1300" cy="270" r="200" fill="url(#bk-lampe)" class="flackern" style="animation-delay:-1.7s"/>
      <ellipse cx="300" cy="260" rx="52" ry="26" fill="#3a2a18"/>
      <ellipse cx="1300" cy="260" rx="52" ry="26" fill="#3a2a18"/>
    </g>
    <!-- Rednerpult -->
    <g fill="#0a0705">
      <rect x="740" y="600" width="120" height="160"/>
      <rect x="720" y="588" width="160" height="20"/>
    </g>
    <!-- Die Säule -->
    <rect x="770" y="120" width="72" height="620" fill="#221708"/>
    <rect x="778" y="120" width="22" height="620" fill="#3b2a17"/>
    <rect x="762" y="100" width="88" height="26" fill="#2a1d0f"/>
    <rect x="758" y="730" width="96" height="30" fill="#2a1d0f"/>
    <!-- Holzklappe in der Säule -->
    <rect class="klappe" x="784" y="330" width="46" height="90" fill="#191006" stroke="#C8A15A" stroke-width="1.5" opacity="0.55"/>
    <!-- Tische -->
    <g fill="#0a0705" opacity="0.9">
      <rect x="60" y="770" width="360" height="18" rx="4"/>
      <rect x="480" y="800" width="420" height="18" rx="4"/>
      <rect x="1000" y="762" width="380" height="18" rx="4"/>
      <rect x="1180" y="820" width="400" height="18" rx="4"/>
    </g>
    ${partikel(55, 11, "staub", 0.7, 2.4)}
    <rect width="1600" height="900" fill="#000" opacity="0.12"/>
  </svg>`,

  /* II — Smolensk, Flug nach Ostpreußen ---------------------------------- */
  smolensk: () => `
  <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="sm-himmel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#101a24"/>
        <stop offset="45%" stop-color="#31404c"/>
        <stop offset="78%" stop-color="#6a7078"/>
        <stop offset="100%" stop-color="#8c8b84"/>
      </linearGradient>
      <radialGradient id="sm-sonne" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#e8dcc4" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#e8dcc4" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#sm-himmel)"/>
    <circle cx="1180" cy="600" r="230" fill="url(#sm-sonne)"/>
    <circle cx="1180" cy="600" r="46" fill="#e6dcc6" opacity="0.75"/>
    <!-- Wolkenbänder -->
    <g fill="#2a3742" opacity="0.55">
      <rect x="-50" y="300" width="1700" height="26" rx="13"/>
      <rect x="-50" y="368" width="1700" height="16" rx="8"/>
      <rect x="200" y="430" width="1200" height="12" rx="6"/>
    </g>
    <!-- Horizont / Schneefeld -->
    <path d="M0 660 Q400 630 800 655 T1600 645 V900 H0 Z" fill="#9a9a91"/>
    <path d="M0 700 Q500 675 1000 700 T1600 690 V900 H0 Z" fill="#b9b8ad"/>
    ${baumreihe(668, 90, "#1c242a", 3, 34)}
    <!-- Fw 200 Condor -->
    <g class="flugzeug" transform="translate(1010 250)">
      <g transform="scale(1.25)">
        <path d="M0 0 L210 0 L246 9 L250 16 L214 22 L20 22 L-6 12 Z" fill="#1b2228"/>
        <path d="M92 4 L120 -74 L136 -74 L126 4 Z" fill="#141a1f"/>
        <path d="M92 18 L118 86 L134 86 L126 18 Z" fill="#232c33"/>
        <path d="M196 2 L226 -36 L238 -36 L226 2 Z" fill="#141a1f"/>
        <circle cx="118" cy="-40" r="9" fill="#0e1216"/>
        <circle cx="126" cy="52" r="9" fill="#0e1216"/>
        <rect x="20" y="4" width="60" height="7" rx="3" fill="#39434a"/>
      </g>
    </g>
    ${partikel(90, 23, "schnee", 1, 3)}
    <rect width="1600" height="900" fill="#0d1116" opacity="0.22"/>
  </svg>`,

  /* III — Winterlager bei Nacht ------------------------------------------ */
  winter: () => `
  <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="wi-himmel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#070c14"/>
        <stop offset="60%" stop-color="#131d2b"/>
        <stop offset="100%" stop-color="#27303a"/>
      </linearGradient>
      <linearGradient id="wi-strahl" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#dfe8f5" stop-opacity="0.34"/>
        <stop offset="100%" stop-color="#dfe8f5" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#wi-himmel)"/>
    <!-- Suchscheinwerfer -->
    <g class="suchlicht" style="transform-origin:1420px 820px">
      <path d="M1420 820 L1120 -120 L1330 -140 Z" fill="url(#wi-strahl)"/>
    </g>
    ${baumreihe(600, 150, "#0b1118", 5, 26)}
    <!-- Baracken -->
    <g>
      <path d="M180 600 L420 520 L660 600 V760 H180 Z" fill="#111821"/>
      <rect x="200" y="600" width="440" height="150" fill="#0d141c"/>
      <rect x="250" y="640" width="46" height="52" fill="#C8A15A" opacity="0.45"/>
      <rect x="340" y="640" width="46" height="52" fill="#C8A15A" opacity="0.2"/>
      <rect x="520" y="640" width="46" height="52" fill="#C8A15A" opacity="0.38"/>
      <path d="M860 640 L1080 570 L1300 640 V780 H860 Z" fill="#0f161e"/>
      <rect x="880" y="640" width="400" height="140" fill="#0b1119"/>
      <rect x="1080" y="676" width="44" height="50" fill="#C8A15A" opacity="0.3"/>
    </g>
    <!-- Schneefeld -->
    <path d="M0 740 Q400 715 800 740 T1600 730 V900 H0 Z" fill="#2c3742"/>
    <path d="M0 790 Q500 768 1000 792 T1600 780 V900 H0 Z" fill="#3d4956"/>
    <!-- Zaunpfähle -->
    <g stroke="#0a0f15" stroke-width="6">
      ${Array.from({ length: 12 }, (_, i) => `<line x1="${60 + i * 140}" y1="800" x2="${60 + i * 140}" y2="700"/>`).join("")}
      <line x1="40" y1="726" x2="1580" y2="716" stroke-width="2"/>
      <line x1="40" y1="756" x2="1580" y2="748" stroke-width="2"/>
    </g>
    ${partikel(120, 31, "schnee", 1.2, 3.4)}
    <rect width="1600" height="900" fill="#050a12" opacity="0.3"/>
  </svg>`,

  /* IV — Gut Schmenzin in Pommern, Dämmerung ---------------------------- */
  schmenzin: () => `
  <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="sz-himmel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#121822"/>
        <stop offset="55%" stop-color="#2e3542"/>
        <stop offset="85%" stop-color="#6d6558"/>
        <stop offset="100%" stop-color="#8a7a62"/>
      </linearGradient>
      <radialGradient id="sz-fenster" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffcf80" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#ffcf80" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#sz-himmel)"/>
    <!-- kahle Bäume -->
    <g stroke="#0d1219" fill="none" stroke-linecap="round">
      <g stroke-width="10">
        <path d="M230 760 V520"/><path d="M230 600 L150 520"/><path d="M230 620 L318 528"/>
        <path d="M230 540 L176 470"/><path d="M230 552 L292 476"/>
      </g>
      <g stroke-width="8">
        <path d="M1420 780 V540"/><path d="M1420 620 L1340 545"/><path d="M1420 640 L1500 556"/>
        <path d="M1420 562 L1372 500"/><path d="M1420 574 L1476 506"/>
      </g>
    </g>
    <!-- Gutshaus -->
    <g>
      <path d="M560 560 L860 460 L1160 560 Z" fill="#171c25"/>
      <rect x="600" y="556" width="520" height="220" fill="#1b212b"/>
      <rect x="826" y="640" width="68" height="136" fill="#0d1219"/>
      <circle cx="860" cy="596" r="110" fill="url(#sz-fenster)"/>
      <g fill="#0e131b">
        ${[640, 712, 968, 1040].map((x) => `<rect x="${x}" y="612" width="48" height="80" rx="3"/>`).join("")}
      </g>
      <rect class="fensterlicht" x="840" y="612" width="48" height="80" rx="3" fill="#C8A15A" opacity="0.8"/>
      <rect x="600" y="548" width="520" height="14" fill="#10151d"/>
    </g>
    <!-- Feldweg -->
    <path d="M0 900 L640 776 H1000 L1600 900 Z" fill="#4b4335"/>
    <path d="M0 900 Q700 800 1600 900 Z" fill="#3a3428"/>
    ${partikel(30, 47, "staub", 0.8, 2)}
    <rect width="1600" height="900" fill="#0a0d14" opacity="0.28"/>
  </svg>`,

  /* V — Schloss Klessheim bei Salzburg, Juli ---------------------------- */
  klessheim: () => `
  <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="kl-himmel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6d7f8e"/>
        <stop offset="50%" stop-color="#a9aea6"/>
        <stop offset="100%" stop-color="#d6cdb8"/>
      </linearGradient>
      <linearGradient id="kl-fassade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#cdbfa4"/>
        <stop offset="100%" stop-color="#8d8271"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#kl-himmel)"/>
    <!-- Alpenkette -->
    <path d="M-50 520 L180 330 L320 430 L520 250 L700 460 L900 340 L1100 470 L1300 300 L1650 520 V900 H-50 Z" fill="#6f7c85" opacity="0.55"/>
    <path d="M-50 600 L220 430 L420 540 L640 400 L880 560 L1120 450 L1380 570 L1650 470 V900 H-50 Z" fill="#57636c" opacity="0.6"/>
    <!-- Schlossfassade -->
    <g>
      <rect x="240" y="470" width="1120" height="300" fill="url(#kl-fassade)"/>
      <path d="M700 470 L800 392 L900 470 Z" fill="#b5a68b"/>
      <rect x="700" y="462" width="200" height="16" fill="#9d9079"/>
      <rect x="240" y="458" width="1120" height="18" fill="#b7a88d"/>
      <rect x="240" y="758" width="1120" height="16" fill="#7b7161"/>
      <!-- Fenster -->
      <g fill="#2b2a26">
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `
          <rect x="${292 + i * 108}" y="512" width="56" height="92" rx="26"/>
          <rect x="${292 + i * 108}" y="636" width="56" height="86" rx="6"/>`).join("")}
      </g>
      <!-- Säulen am Portal -->
      <g fill="#ddd0b6">
        <rect x="742" y="596" width="22" height="176"/>
        <rect x="836" y="596" width="22" height="176"/>
        <rect x="730" y="586" width="46" height="14"/>
        <rect x="824" y="586" width="46" height="14"/>
      </g>
      <rect x="774" y="616" width="52" height="156" rx="26" fill="#1f1e1b"/>
    </g>
    <!-- Vorplatz -->
    <rect y="770" width="1600" height="130" fill="#a09a86"/>
    <g stroke="#8c8672" stroke-width="2">
      ${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 200}" y1="770" x2="${i * 200 - 120}" y2="900"/>`).join("")}
    </g>
    <!-- Sommerdunst -->
    <rect class="dunst" width="1600" height="900" fill="#e8e0cc" opacity="0.14"/>
    ${partikel(26, 59, "staub", 0.8, 2.2)}
  </svg>`,

  /* VI — Wolfsschanze, Rastenburg --------------------------------------- */
  wolfsschanze: () => `
  <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="wo-himmel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a2118"/>
        <stop offset="60%" stop-color="#38402c"/>
        <stop offset="100%" stop-color="#5d6244"/>
      </linearGradient>
      <linearGradient id="wo-licht" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f3e2a8" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#f3e2a8" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#wo-himmel)"/>
    <!-- Kiefernwald in drei Tiefen -->
    ${baumreihe(560, 260, "#202a1e", 13, 16)}
    ${baumreihe(640, 330, "#161f16", 17, 13)}
    <!-- Lichtschneise -->
    <path d="M600 200 L1100 200 L1400 900 L300 900 Z" fill="url(#wo-licht)"/>
    <!-- Lagebaracke -->
    <g>
      <path d="M520 640 L800 548 L1080 640 Z" fill="#3b3526"/>
      <rect x="548" y="636" width="504" height="180" fill="#2d281c"/>
      <g fill="#0f120c">
        ${[0, 1, 2, 3, 4].map((i) => `<rect x="${584 + i * 92}" y="672" width="56" height="66"/>`).join("")}
      </g>
      <rect x="800" y="700" width="58" height="116" fill="#1a1710"/>
      <!-- Holzbretter -->
      <g stroke="#241f16" stroke-width="2">
        ${Array.from({ length: 7 }, (_, i) => `<line x1="548" y1="${648 + i * 24}" x2="1052" y2="${648 + i * 24}"/>`).join("")}
      </g>
    </g>
    <!-- Bunkerblock rechts -->
    <g fill="#2a2c24">
      <rect x="1180" y="600" width="380" height="230"/>
      <rect x="1160" y="586" width="420" height="26"/>
      <rect x="1280" y="690" width="70" height="140" fill="#15170f"/>
    </g>
    <!-- Waldboden -->
    <path d="M0 800 Q400 780 800 802 T1600 792 V900 H0 Z" fill="#3a3a28"/>
    <path d="M0 850 Q500 830 1000 854 T1600 844 V900 H0 Z" fill="#2c2d1f"/>
    ${partikel(40, 71, "staub", 0.7, 2.4)}
    <rect width="1600" height="900" fill="#0b0f0a" opacity="0.24"/>
  </svg>`,

  /* Abspann — Hof des Bendlerblocks bei Nacht --------------------------- */
  bendlerblock: () => `
  <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="be-nacht" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#05070b"/>
        <stop offset="100%" stop-color="#141821"/>
      </linearGradient>
      <radialGradient id="be-lampe" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#e8dcbb" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#e8dcbb" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#be-nacht)"/>
    <!-- Hofwände -->
    <rect x="0" y="180" width="1600" height="600" fill="#0e1119"/>
    <g fill="#141822">
      ${Array.from({ length: 8 }, (_, i) => `
        <rect x="${70 + i * 190}" y="250" width="70" height="120" rx="4"/>
        <rect x="${70 + i * 190}" y="420" width="70" height="120" rx="4"/>
        <rect x="${70 + i * 190}" y="590" width="70" height="120" rx="4"/>`).join("")}
    </g>
    <!-- Scheinwerferkegel zweier Lastwagen -->
    <g opacity="0.85">
      <circle cx="520" cy="700" r="260" fill="url(#be-lampe)" class="flackern"/>
      <circle cx="1080" cy="720" r="240" fill="url(#be-lampe)" class="flackern" style="animation-delay:-2.3s"/>
    </g>
    <rect y="780" width="1600" height="120" fill="#0a0d14"/>
    <rect y="780" width="1600" height="6" fill="#1b2028"/>
    ${partikel(34, 83, "staub", 0.7, 2.2)}
  </svg>`
};

if (typeof module !== "undefined") { module.exports = SCENES; }
