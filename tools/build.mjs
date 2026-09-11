/*
 * Baut aus den Quelldateien die fertigen Dateien in dist/:
 *
 *   dist/hitler-attentaeter-spiel.html — das Spiel als eine einzige Datei,
 *                                        offline lauffähig (USB-Stick, Moodle, IServ)
 *   dist/tafel-bestenliste.html        — die Tafelansicht als eine einzige Datei
 *   dist/artifact.html                 — das Spiel ohne <html>/<head>/<body>
 *   dist/qr-spiel.svg                  — QR-Code auf die Spieladresse, zum Ausdrucken
 *
 * Liegen assets/logo.png und assets/icon-180.png vor, werden sie eingebettet.
 *
 * Aufruf:  node tools/build.mjs [Spieladresse]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(wurzel, p), "utf8");
const QR = createRequire(import.meta.url)("../assets/qr.js");

const SPIELADRESSE = process.argv[2] || "https://klvdigitaljan.github.io/BBS-Papenburg/";

/* Bilder als Data-URI einbetten, damit die Einzeldateien ohne Ordner auskommen */
function einbetten(text, pfad) {
  const voll = join(wurzel, pfad);
  if (!existsSync(voll)) { console.log(`Hinweis: ${pfad} fehlt.`); return text; }
  const daten = readFileSync(voll).toString("base64");
  console.log(`${pfad} eingebettet (${Math.round(daten.length / 1024)} kB).`);
  return text.replaceAll(pfad, `data:image/png;base64,${daten}`);
}

/* Eine Seite mit allen Stilen und Skripten zu einer Datei zusammenziehen */
function seiteBauen(htmlDatei) {
  const html = lies(htmlDatei);
  const titel = html.match(/<title>[\s\S]*?<\/title>/)[0];
  const beschr = html.match(/<meta name="description"[\s\S]*?>/)[0];
  const fonts = html.match(/<link rel="preconnect"[\s\S]*?&display=swap">/)[0];
  const appleTreffer = html.match(/<meta name="apple-mobile-web-app-capable"[\s\S]*?<link rel="icon"[^>]*>/);
  const apple = appleTreffer ? appleTreffer[0] : "";

  const stile = [...html.matchAll(/<link rel="stylesheet" href="(assets\/[^"]+)">/g)]
    .map((t) => lies(t[1])).join("\n\n");
  const skripte = [...html.matchAll(/<script src="(assets\/[^"]+)"><\/script>/g)]
    .map((t) => lies(t[1])).join("\n\n");

  const koerperTreffer = html.match(/<body([^>]*)>([\s\S]*)<\/body>/);
  const koerperAttribute = koerperTreffer[1];
  const koerper = koerperTreffer[2]
    .replace(/\s*<script src="assets\/[^"]+"><\/script>/g, "")
    .trim();

  let kopf = `${titel}\n${beschr}\n${apple}\n${fonts}\n<style>\n${stile}\n</style>`;
  let rumpf = `${koerper}\n\n<script>\n${skripte}\n</script>`;
  kopf = einbetten(kopf, "assets/icon-180.png");
  rumpf = einbetten(rumpf, "assets/logo.png");

  return { kopf, rumpf, koerperAttribute };
}

function vollstaendig({ kopf, rumpf, koerperAttribute }) {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${kopf}
</head>
<body${koerperAttribute}>
${rumpf}
</body>
</html>
`;
}

mkdirSync(join(wurzel, "dist"), { recursive: true });

const spiel = seiteBauen("index.html");
writeFileSync(join(wurzel, "dist/hitler-attentaeter-spiel.html"), vollstaendig(spiel));
writeFileSync(join(wurzel, "dist/artifact.html"), `${spiel.kopf}\n\n${spiel.rumpf}\n`);

const tafel = seiteBauen("tafel.html");
writeFileSync(join(wurzel, "dist/tafel-bestenliste.html"), vollstaendig(tafel));

writeFileSync(join(wurzel, "dist/qr-spiel.svg"),
  QR.svg(SPIELADRESSE, { rand: 4, dunkel: "#111111", hell: "#ffffff", groesse: 1024 }) + "\n");

console.log(`\nGebaut:
  dist/hitler-attentaeter-spiel.html
  dist/tafel-bestenliste.html
  dist/artifact.html
  dist/qr-spiel.svg  →  ${SPIELADRESSE}`);
