/*
 * Baut aus index.html + assets/ zwei Dateien:
 *   dist/hitler-attentaeter-spiel.html — eine einzige HTML-Datei, offline lauffähig
 *                                       (auf USB-Stick kopieren oder in Moodle hochladen)
 *   dist/artifact.html                — dieselbe Seite ohne <html>/<head>/<body>,
 *                                       zum Veröffentlichen als Claude-Artifact
 *
 * Liegt assets/logo.png vor, wird das Schullogo als Data-URI eingebettet.
 *
 * Aufruf:  node tools/build.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(wurzel, p), "utf8");

const html   = lies("index.html");
const css    = lies("assets/styles.css");
const skript = ["assets/story.js", "assets/scenes.js", "assets/game.js"].map(lies).join("\n\n");

const titel  = html.match(/<title>[\s\S]*?<\/title>/)[0];
const beschr = html.match(/<meta name="description"[\s\S]*?>/)[0];
const fonts  = html.match(/<link rel="preconnect"[\s\S]*?&display=swap">/)[0];
const koerper = html
  .match(/<body>([\s\S]*)<\/body>/)[1]
  .replace(/\s*<script src="assets\/[^"]+"><\/script>/g, "")
  .trim();

const apple = html.match(/<meta name="apple-mobile-web-app-capable"[\s\S]*?<link rel="icon"[^>]*>/)[0];
const kopf = `${titel}\n${beschr}\n${apple}\n${fonts}\n<style>\n${css}\n</style>`;
let rumpf = `${koerper}\n\n<script>\n${skript}\n</script>`;

// Bilder einbetten, damit die Einzeldatei ohne Ordner auskommt.
function einbetten(text, pfad) {
  const voll = join(wurzel, pfad);
  if (!existsSync(voll)) {
    console.log(`Hinweis: ${pfad} fehlt.`);
    return text;
  }
  const daten = readFileSync(voll).toString("base64");
  console.log(`${pfad} eingebettet (${Math.round(daten.length / 1024)} kB als Data-URI).`);
  return text.replaceAll(pfad, `data:image/png;base64,${daten}`);
}

rumpf = einbetten(rumpf, "assets/logo.png");

mkdirSync(join(wurzel, "dist"), { recursive: true });

const kopfMitSymbol = einbetten(kopf, "assets/icon-180.png");

writeFileSync(join(wurzel, "dist/hitler-attentaeter-spiel.html"),
`<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${kopfMitSymbol}
</head>
<body>
${rumpf}
</body>
</html>
`);

writeFileSync(join(wurzel, "dist/artifact.html"), `${kopfMitSymbol}\n\n${rumpf}\n`);

console.log("dist/hitler-attentaeter-spiel.html und dist/artifact.html gebaut.");
