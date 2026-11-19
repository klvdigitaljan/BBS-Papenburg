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
| **Für die Klasse: eigener Webspace** | `dist/webspace.zip` entpacken und hochladen — siehe unten. |
| **Für die Klasse: GitHub Pages** | In den Repository-Einstellungen unter *Pages* als Quelle *Deploy from a branch* wählen, Branch `claude/focused-mendel-b0ci2e`, Ordner `/ (root)`. Das Spiel läuft dann unter `https://klvdigitaljan.github.io/BBS-Papenburg/`, die Tafelansicht unter `…/tafel.html`. |
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

Jedes Gerät führt seine eigene Rangliste (`localStorage`). Für den Klassenwettbewerb gibt es
die **Tafelansicht** (siehe unten): Dort laufen die Ergebnisse aller Geräte über einen kurzen
Ergebnis-Code zusammen.

## Expertenrunde (eigenes Format, ~18 Minuten)

Für einen kurzen Einstieg, bei dem trotzdem alle sechs Personen vorkommen:
`experte.html` teilt jeder Gruppe **reihum eine Person zu**, sie trifft drei
Entscheidungen und stellt ihre Person danach der Klasse in 90 Sekunden vor.
`experten-tafel.html` zeigt am Beamer die sechs Stationen mit ihren Gruppen.

* **Paarbildung:** Jede Schülerin, jeder Schüler meldet sich einzeln mit dem
  eigenen Namen an. `experten.php` füllt damit Zweiergruppen auf: Die erste
  Person sieht „wartet auf die zweite Person“, sobald jemand dazukommt,
  erscheint der Name auf beiden Geräten (Abfrage alle drei Sekunden).
  Die Gruppe bekommt die Person, die am wenigsten vergeben ist.
  Die Zuteilung bleibt im Gerät gemerkt.
* **Abgabe:** Beide dürfen abschicken, es zählt die erste Abgabe; das zweite
  Gerät bekommt den Stand der Gruppe angezeigt.
* **Punkte:** drei Entscheidungen zu je 100 (zweiter Versuch 60, dritter 30),
  kein Rauswurf, dazu 200 Punkte Vortragsbonus — Höchstzahl 500 für alle gleich.
* **Vortragsrecht:** die punktbeste fertige Gruppe je Person; die Tafel markiert sie.
  Nach dem Vortrag vergibt die Lehrkraft den Bonus per Klick (Schlüssel nötig).
* **Zeit:** 2 Min Beitritt, 6 Min lesen und entscheiden, 9–10 Min Vorträge.

In `experten.php` denselben Schlüssel eintragen wie in `tafel.php`.
Gespeichert wird in `experten.json`; `tafel.php` bleibt davon unberührt.

## Kurzfassung für eine Einzelstunde

Über die Adresszeile lässt sich die Auswahl der Akten steuern — ohne etwas am Spiel
zu ändern:

| Adresse | Inhalt | Dauer zu zweit |
|---|---|---|
| `…/` | alle sechs Akten, 24 Entscheidungen | ~35 Min |
| `…/?kurz=1` | Elser, Smolensk, Stauffenberg — 14 Entscheidungen | ~22 Min |
| `…/?akten=1,6` | nur Elser und Stauffenberg — 10 Entscheidungen | ~17 Min |

`?akten=` nimmt die Nummern der Akten in der gewünschten Reihenfolge. Unsinnige Angaben
führen zur Vollfassung. Punktevergabe, Zeitleiste und Höchstpunktzahl richten sich
automatisch nach der Auswahl (Kurzfassung: 2280 statt 3780 Punkte).

Damit der QR-Code an der Tafel auf die gewünschte Fassung zeigt, die Tafelansicht so
aufrufen — oder unten auf „Adresse ändern“ klicken:

```
tafel.html?spiel=https://eure-adresse/?kurz=1
```

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
tafel.html              Tafelansicht: QR-Code und Bestenliste der Klasse
tafel.php               Sammelstelle: nimmt die Ergebnisse der Geräte entgegen
experte.html            Expertenrunde: Schülerseite mit zugeteilter Person
experten-tafel.html     Expertenrunde: Tafel mit den sechs Stationen
experten.php            Expertenrunde: Zuteilung, Punkte, Vortragsbonus
assets/tafel.js         Logik der Tafelansicht, assets/tafel.css deren Gestaltung
assets/qr.js            QR-Code-Erzeuger (Eigenbau, ohne fremde Bibliothek)
tools/build.mjs         baut die Einzeldateien in dist/
tools/qr-pruefen.mjs    prüft den QR-Erzeuger gegen einen echten Decoder
dist/                   fertige Ausgabedateien (eingecheckt, damit sie ohne Node nutzbar sind)
dist/webspace/          Ordner zum Hochladen auf einen Webserver, auch als webspace.zip
```

Inhalte ändern, ergänzen oder kürzen: alles steht in `assets/story.js`. Eine neue Akte ist
ein weiterer Eintrag in `STORY.kapitel` mit beliebig vielen Szenen; die Zeitleiste, die
Wertung und die Höchstpunktzahl passen sich automatisch an. Eine neue Kulisse kommt als
Funktion nach `SCENES` in `assets/scenes.js` und wird über das Feld `szene` zugeordnet.

Nach Änderungen an `assets/` oder `index.html`:

```bash
node tools/build.mjs
```

Das erzeugt `dist/hitler-attentaeter-spiel.html` und `dist/tafel-bestenliste.html`
(beides Einzeldateien zum Verteilen), `dist/artifact.html` sowie `dist/qr-spiel.svg`.

## Tafelansicht: QR-Code und Bestenliste der Klasse

`tafel.html` ist die Ansicht für Beamer oder Whiteboard. Links steht ein großer
**QR-Code auf die Spieladresse** — die Schülerinnen und Schüler halten die iPad-Kamera
darauf und sind im Spiel. Rechts wächst während der Stunde die **Bestenliste der Klasse**.

### Die Namen erscheinen von selbst (empfohlen)

Liegt `tafel.php` neben dem Spiel und beherrscht der Webspace PHP — bei den üblichen
Hostern der Fall —, trägt sich **jedes Gerät am Ende selbst ein**. Niemand muss etwas
abtippen: Die Schülerin gibt zu Beginn des Spiels ihren Namen ein, und sobald sie fertig
ist, steht sie an der Tafel. Die Tafelansicht fragt alle vier Sekunden nach und zeigt oben
„Live“ an.

Gespeichert wird in `bestenliste.json` neben `tafel.php`; die Datei legt sich selbst an.
Der Ordner muss dafür beschreibbar sein — bei üblichen Hostern ist er das.

Drei Dinge zum Einstellen und Wissen:

* **Schlüssel ändern.** Oben in `tafel.php` steht `const SCHLUESSEL = 'bbs-tafel';`.
  Er wird beim Leeren der Liste abgefragt, damit niemand sie mitten in der Stunde löscht.
* **Namen liegen auf dem Server.** Anders als beim Handbetrieb verlassen die Namen den
  Raum. Für die Schule heißt das: Vornamen oder Kürzel genügen, und „Liste leeren“ nach
  der Stunde löscht sie wieder.
* **Schummeln** ist erschwert, nicht ausgeschlossen: Der Server rechnet den Ergebnis-Code
  nach und weist unpassende Werte ab. Wer sich auskennt, kann trotzdem etwas einschicken.

### Ohne PHP: Eingabe von Hand

Antwortet `tafel.php` nicht, schalten beide Seiten von selbst um — das Spiel zeigt dann
den Ergebnis-Code zum Vorlesen, die Tafel die Eingabefelder. Es geht nichts verloren.

So kommen die Ergebnisse dann zusammen:

1. Am Ende des Spiels zeigt jedes Gerät einen neunstelligen **Ergebnis-Code**,
   zum Beispiel `2X0000ZOM`. Darin stecken Punkte, Fehlentscheidungen und Spielzeit.
2. Name und Code werden unten in der Tafelansicht eingetragen — entweder ruft die
   Schülerin beides durch, oder sie tippt es selbst am Lehrerrechner ein.
   Beides in einem Feld (`Mia K. 2X0000ZOM`) funktioniert auch.
3. Die Liste sortiert sich selbst: Punkte zuerst, bei Gleichstand die schnellere Zeit.

Das letzte Zeichen des Codes ist eine Prüfziffer. Vertippt man sich, wird der Code
abgewiesen; ausgedachte Codes werden fast immer erkannt. Wasserdicht gegen Schummeln
ist das nicht — es fängt Tippfehler ab.

Die Liste liegt im Browser des Lehrerrechners (`localStorage`), nicht auf einem Server.
Es verlässt also nichts den Raum. „Liste leeren“ setzt sie für die nächste Klasse zurück.
Mit „Adresse ändern“ lässt sich einstellen, wohin der QR-Code zeigt.

### Auf eigenem Webspace betreiben (empfohlen, wenn vorhanden)

Das Spiel ist reines HTML: kein PHP, keine Datenbank, keine Serverkonfiguration.
Jeder Webspace genügt, auch eine temporäre Domain.

1. `dist/webspace.zip` entpacken und den **Inhalt** des Ordners hochladen,
   zum Beispiel nach `/spiel/`.
2. Fertig:
   * `https://eure-adresse/spiel/` — das Spiel
   * `https://eure-adresse/spiel/tafel.html` — Tafelansicht mit QR-Code und Bestenliste

Der QR-Code in der Tafelansicht zeigt **automatisch auf den Ordner, in dem die Dateien
liegen**. Solange `index.html` und `tafel.html` beieinander liegen, ist nichts einzustellen.

Soll er woandershin zeigen — etwa auf einen kurzen Weiterleitungslink, der sich leichter
abtippen lässt — gibt es zwei Wege:

* unten in der Tafelansicht auf **Adresse ändern** klicken, oder
* die Tafelansicht mit Parameter aufrufen:
  `tafel.html?spiel=https://kurz.example/spiel`

Für Ausdrucke und Folien lässt sich der Code als Datei erzeugen:

```bash
node tools/build.mjs https://eure-adresse/spiel/
# schreibt dist/qr-spiel.svg
```

HTTPS ist nicht zwingend — das Spiel braucht keine Kamera- oder Standortrechte —
aber die meisten Hoster liefern ein kostenloses Zertifikat mit, und in Safari
sieht eine `https`-Adresse für die Klasse vertrauenswürdiger aus.

### Wenn der QR-Code einen 404 von GitHub zeigt

Dann ist GitHub Pages noch nicht eingeschaltet — die Adresse gibt es dann einfach nicht.

1. https://github.com/klvdigitaljan/BBS-Papenburg/settings/pages öffnen
2. *Source*: **Deploy from a branch**
3. *Branch*: **`claude/focused-mendel-b0ci2e`**, Ordner **`/ (root)`** → **Save**
4. Ein bis zwei Minuten warten. Oben auf derselben Seite erscheint dann
   „Your site is live at https://klvdigitaljan.github.io/BBS-Papenburg/“.

Weitere Ursachen für einen 404, falls Pages bereits an ist:

* Als Ordner wurde `/docs` statt `/ (root)` gewählt — `index.html` liegt im Hauptverzeichnis.
* Groß- und Kleinschreibung: Die Adresse lautet `/BBS-Papenburg/`, nicht `/bbs-papenburg/`.
* Der erste Aufbau läuft noch. Unter *Actions* steht dann ein Lauf
  „pages build and deployment“; erst wenn der grün ist, antwortet die Seite.

Die Datei `.nojekyll` im Hauptverzeichnis sorgt dafür, dass GitHub die Dateien
unverändert ausliefert und nicht durch den Jekyll-Generator schickt.

### Den QR-Code weiterverwenden

`dist/qr-spiel.svg` ist derselbe Code als Datei — für Arbeitsblätter, Folien oder einen
Aushang. Zeigt er auf die falsche Adresse, neu bauen mit:

```bash
node tools/build.mjs https://eure-adresse.example/spiel/
```

Der QR-Erzeuger in `assets/qr.js` ist Eigenbau, damit nichts nachgeladen werden muss.
Er ist mit `node tools/qr-pruefen.mjs` geprüft: Jeder erzeugte Code wird von einem
echten Decoder (OpenCV) wieder eingelesen und mit dem Ausgangstext verglichen,
für die Versionen 1 bis 10.

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
