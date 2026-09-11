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

const kopf = `${titel}\n${beschr}\n${fonts}\n<style>\n${css}\n</style>`;
let rumpf = `${koerper}\n\n<script>\n${skript}\n</script>`;

// Schullogo einbetten, damit die Einzeldatei ohne Ordner auskommt.
const logoPfad = join(wurzel, "assets/logo.png");
if (existsSync(logoPfad)) {
  const daten = readFileSync(logoPfad).toString("base64");
  rumpf = rumpf.replaceAll("assets/logo.png", `data:image/png;base64,${daten}`);
  console.log(`Schullogo eingebettet (${Math.round(daten.length / 1024)} kB als Data-URI).`);
} else {
  console.log("Hinweis: assets/logo.png fehlt — das Spiel zeigt nur den Schriftzug.");
}

mkdirSync(join(wurzel, "dist"), { recursive: true });

writeFileSync(join(wurzel, "dist/hitler-attentaeter-spiel.html"),
`<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${kopf}
</head>
<body>
${rumpf}
</body>
</html>
`);

writeFileSync(join(wurzel, "dist/artifact.html"), `${kopf}\n\n${rumpf}\n`);

console.log("dist/hitler-attentaeter-spiel.html und dist/artifact.html gebaut.");
