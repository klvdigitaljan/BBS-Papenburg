/*
 * Baut aus index.html + assets/ zwei Dateien:
 *   dist/dreizehn-minuten.html  — eine einzige HTML-Datei, offline lauffähig
 *                                 (auf USB-Stick kopieren oder in Moodle hochladen)
 *   dist/artifact.html          — dieselbe Seite ohne <html>/<head>/<body>,
 *                                 zum Veröffentlichen als Claude-Artifact
 *
 * Aufruf:  node tools/build.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
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
const rumpf = `${koerper}\n\n<script>\n${skript}\n</script>`;

mkdirSync(join(wurzel, "dist"), { recursive: true });

writeFileSync(join(wurzel, "dist/dreizehn-minuten.html"),
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

console.log("dist/dreizehn-minuten.html und dist/artifact.html gebaut.");
