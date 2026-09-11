# Hitler-Attentäter-Spiel

Ein interaktives Story-Spiel für den Geschichtsunterricht über die sechs bekanntesten
Attentate und Attentatsplanungen gegen Hitler zwischen 1939 und 1944.

Die Schülerinnen und Schüler übernehmen nacheinander die Rolle der Attentäter und treffen
deren Entscheidungen: über Sprengstoff, Tarnung, Zugang, Termin — und über den eigenen Tod.
**Richtig ist immer die historisch belegte Entscheidung.** Wer sie trifft, kommt durch die Akte
und erlebt, wie Hitler jedes Mal überlebte: durch Nebel, Kälte, einen Luftangriff, einen
verschobenen Termin, einen Menschen, der im entscheidenden Moment nicht konnte, und einen
massiven Tischsockel.

Wie knapp es war, zeigt gleich die erste Akte: Dreizehn Minuten früher hätte Georg Elsers
Bombe getroffen.

## Spielen

Drei Wege, alle ohne Internetverbindung lauffähig:

| Weg | Vorgehen |
|---|---|
| Aus dem Repository | `index.html` im Browser öffnen |
| Einzeldatei (USB-Stick, Moodle, IServ) | `dist/hitler-attentaeter-spiel.html` verteilen — alles ist in dieser einen Datei enthalten |
| Lokaler Server | `npx http-server .` und die angezeigte Adresse öffnen |

Ohne Internet werden die Google-Schriften durch systemeigene Schriften ersetzt; das Spiel
funktioniert vollständig.

**Steuerung:** Maus oder Tastatur — `1` bis `3` wählt eine Option, `Enter` blättert weiter.

## Regeln und Wertung

* 6 Akten mit insgesamt 24 Entscheidungen.
* Jede richtige Entscheidung bringt **120 Punkte**, abzüglich **40 Punkte je Fehlversuch**
  in derselben Szene (mindestens 20).
* Pro Akte gibt es **drei Spuren**. Jede falsche Entscheidung kostet eine Spur.
  Sind alle drei weg, wird die Akte neu aufgerollt und ihre Punkte verfallen —
  Durchprobieren ist also möglich, aber teuer.
* **+100 Punkte** für eine fehlerfreie Akte, **+300 Punkte** für ein fehlerfreies Spiel.
* Höchstpunktzahl: **3780**.
* Nach jeder Entscheidung erscheint die historische Auflösung; die Spielzeit dient nur
  als Kriterium bei Punktgleichheit.

Die Rangliste wird lokal im Browser gespeichert (`localStorage`), also pro Rechner bzw.
pro Benutzerprofil. Für einen Klassenwettbewerb genügt das: Am Ende zeigt jedes Gerät seine
Bestenliste, die Ergebnisse lassen sich über „Ergebnis drucken“ sichern.

## Einsatz im Unterricht

* **Zeitbedarf:** etwa 25–40 Minuten für einen Durchgang, je nach Lesetempo.
* **Vorwissen:** keines nötig. Wer nichts weiß, lernt über die Rückmeldungen — der zweite
  Durchgang ist dann deutlich besser. Genau darauf ist die Wertung ausgelegt.
* **Sozialform:** gut zu zweit an einem Rechner, weil die Entscheidungen Diskussion auslösen.
* **Anschlussfragen:** Warum scheiterten alle sechs Versuche? Was unterscheidet Georg Elser
  von den Offizieren des 20. Juli? Ab wann handelten die militärischen Verschwörer — und
  was sagt dieser Zeitpunkt über ihre Beweggründe? Darf man einen Eid brechen?
* **Hinweis zum Thema:** Das Spiel zeigt keine Gewaltdarstellungen und keine
  nationalsozialistischen Symbole. Alle Kulissen sind gezeichnete SVG-Grafiken, keine Fotos.
  Die Opfer der Anschläge und die Hinrichtungen der Beteiligten werden benannt, nicht ausgespart.

## Inhalt der sechs Akten

| Akte | Datum | Person | Ort und Mittel |
|---|---|---|---|
| I | 8.11.1939 | Georg Elser | Bürgerbräukeller München, Zeitbombe in der Säule |
| II | 13.3.1943 | Tresckow / Schlabrendorff | Flug Smolensk → Ostpreußen, Bombe als Cointreau-Paket |
| III | Winter 1943 | Axel von dem Bussche | Uniformvorführung, Handgranate, Selbstopfer |
| IV | Anfang 1944 | Ewald-Heinrich von Kleist | Uniformvorführung |
| V | 7.7.1944 | Helmuth Stieff | Schloss Klessheim bei Salzburg, Uniformvorführung |
| VI | 20.7.1944 | Claus Schenk Graf von Stauffenberg | Wolfsschanze, Aktentaschenbombe |

## Aufbau des Projekts

```
index.html              Spielgerüst
assets/logo.png         Schullogo (siehe unten — noch einzufügen)
assets/story.js         sämtliche Texte, Entscheidungen und Auflösungen
assets/scenes.js        die sieben gezeichneten Hintergrundkulissen (SVG)
assets/game.js          Spiellogik, Wertung, Rangliste
assets/styles.css       Gestaltung
tools/build.mjs         baut die Einzeldateien in dist/
dist/                   fertige Ausgabedateien (eingecheckt, damit sie ohne Node nutzbar sind)
```

Inhalte ändern, ergänzen oder kürzen: alles steht in `assets/story.js`. Eine neue Akte ist
ein weiterer Eintrag in `STORY.kapitel` mit beliebig vielen Szenen; die Zeitleiste, die
Wertung und die Höchstpunktzahl passen sich automatisch an. Eine neue Kulisse kommt als
Funktion nach `SCENES` in `assets/scenes.js` und wird über das Feld `szene` zugeordnet.

Nach Änderungen an `assets/` oder `index.html`:

```bash
node tools/build.mjs
```

Das erzeugt `dist/hitler-attentaeter-spiel.html` (Einzeldatei zum Verteilen) und `dist/artifact.html`.

## Schullogo einfügen

Das Spiel hat feste Plätze für das Logo der BBS Papenburg: über dem Titel auf dem Startbild,
über der Auswertung am Ende und klein in der Fußzeile jeder Seite. Ebenso auf dem Ausdruck des
Ergebnisses.

So kommt das Bild hinein:

1. Die Logodatei als **`assets/logo.png`** ablegen (über die GitHub-Oberfläche:
   *Add file → Upload files*, Zielordner `assets`, Dateiname `logo.png`).
   PNG mit transparentem Hintergrund sieht auf dem dunklen Untergrund am besten aus.
2. `node tools/build.mjs` ausführen. Das Logo wird dabei direkt in die Einzeldatei
   eingebettet, damit sie weiterhin ohne Ordner funktioniert.

Solange die Datei fehlt, steht an diesen Stellen nur der Schriftzug
„BBS Papenburg — Technik und Wirtschaft“. Es erscheint kein kaputtes Bildsymbol.

## Sachliche Grundlage

Die Darstellung folgt dem Forschungsstand, wie ihn unter anderem die Gedenkstätte Deutscher
Widerstand (Berlin), die KZ-Gedenkstätte Dachau (zu Georg Elser) und die Bundeszentrale für
politische Bildung vermitteln. Wo die Quellenlage umstritten ist — etwa bei den Beweggründen
Helmuth Stieffs am 7. Juli 1944 — sagt das Spiel das ausdrücklich.
