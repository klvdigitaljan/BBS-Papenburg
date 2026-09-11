/*
 * Prüft assets/qr.js: Jeder erzeugte Code wird mit einem echten Decoder
 * (OpenCV) wieder eingelesen und mit dem Ausgangstext verglichen.
 *
 * Nur für die Entwicklung gedacht. Voraussetzung einmalig:
 *   pip install opencv-python-headless numpy
 * Aufruf:
 *   node tools/qr-pruefen.mjs
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const QR = createRequire(import.meta.url)("../assets/qr.js");

const proben = [
  "A",
  "https://klvdigitaljan.github.io/BBS-Papenburg/",
  "https://klvdigitaljan.github.io/BBS-Papenburg/tafel.html",
  "Hitler-Attentäter-Spiel — BBS Papenburg",
  "MIA K.|3780|0|1284",
  "x".repeat(14),   // Version 1 randvoll
  "x".repeat(26),   // Version 2
  "x".repeat(42),   // Version 3
  "x".repeat(62),   // Version 4
  "x".repeat(84),   // Version 5
  "x".repeat(106),  // Version 6
  "x".repeat(122),  // Version 7 (mit Versionsinformation)
  "x".repeat(152),  // Version 8
  "x".repeat(180),  // Version 9
  "x".repeat(213)   // Version 10
];

const skript = `
import json, sys, numpy as np, cv2
felder = json.load(open(sys.argv[1]))
ergebnis = []
for feld in felder:
    m = np.array(feld, dtype=np.uint8)
    n = m.shape[0]; rand = 4
    bild = np.ones((n + 2*rand, n + 2*rand), dtype=np.uint8) * 255
    bild[rand:rand+n, rand:rand+n] = (1 - m) * 255
    gross = cv2.resize(bild, None, fx=8, fy=8, interpolation=cv2.INTER_NEAREST)
    text, _, _ = cv2.QRCodeDetector().detectAndDecode(gross)
    ergebnis.append(text)
print(json.dumps(ergebnis))
`;

const felder = proben.map((t) => QR.raster(t));
const tmp = process.env.TMPDIR ? `${process.env.TMPDIR}/qr-pruefung.json` : "/tmp/qr-pruefung.json";
writeFileSync(tmp, JSON.stringify(felder));
const gelesen = JSON.parse(execFileSync("python3", ["-c", skript, tmp], { encoding: "utf8" }));

let fehler = 0;
proben.forEach((text, i) => {
  const ok = gelesen[i] === text;
  if (!ok) fehler++;
  const version = (felder[i].length - 17) / 4;
  console.log(`${ok ? "OK    " : "FEHLER"} Version ${String(version).padStart(2)} · ${text.length} Zeichen · ${text.slice(0, 38)}`);
});
console.log(fehler ? `\n${fehler} von ${proben.length} nicht lesbar.` : `\nAlle ${proben.length} Codes wurden korrekt zurückgelesen.`);
process.exit(fehler ? 1 : 0);
