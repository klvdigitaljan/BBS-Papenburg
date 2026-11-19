/*
 * Baut die Expertenrunde zu drei Dateien zusammen, die alle ins
 * Hauptverzeichnis gehören — kein Hantieren mit dem assets-Ordner:
 *
 *   dist/import/experte.html         (mit experte.css und experte.js darin)
 *   dist/import/experten-tafel.html  (mit experte.css und experten-tafel.js darin)
 *   dist/import/experten.php
 *
 * Die bereits hochgeladenen gemeinsamen Dateien (story.js, scenes.js,
 * styles.css, qr.js, logo.png) werden weiter aus assets/ geladen.
 *
 * Aufruf:  node tools/build-experten.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(wurzel, p), "utf8");

/* Nur die neuen Dateien hineinziehen — die übrigen bleiben Verweise. */
const EIGENE = ["assets/experte.css", "assets/experte.js", "assets/experten-tafel.js"];

function zusammenziehen(datei) {
  let html = lies(datei);

  for (const pfad of EIGENE) {
    const inhalt = lies(pfad);
    const stil = new RegExp(`\\s*<link rel="stylesheet" href="${pfad}(\\?[^"]*)?">`, "g");
    const skript = new RegExp(`\\s*<script src="${pfad}(\\?[^"]*)?"></script>`, "g");
    if (pfad.endsWith(".css")) {
      html = html.replace(stil, `\n<style>\n${inhalt}\n</style>`);
    } else {
      html = html.replace(skript, `\n<script>\n${inhalt}\n</script>`);
    }
  }

  const uebrig = [...html.matchAll(/(?:href|src)="(assets\/[^"?]+)/g)].map((t) => t[1]);
  console.log(`${datei}: ${EIGENE.filter((p) => !uebrig.includes(p)).length} Dateien eingezogen, ` +
    `weiter verwendet: ${[...new Set(uebrig)].join(", ")}`);
  return html;
}

const ziel = join(wurzel, "dist/import");
mkdirSync(ziel, { recursive: true });
writeFileSync(join(ziel, "experte.html"), zusammenziehen("experte.html"));
writeFileSync(join(ziel, "experten-tafel.html"), zusammenziehen("experten-tafel.html"));
copyFileSync(join(wurzel, "experten.php"), join(ziel, "experten.php"));

console.log("\nFertig in dist/import — diese drei Dateien gehören nach public_html.");
