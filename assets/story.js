/*
 * story.js — Inhalte des Spiels "Dreizehn Minuten"
 * Sechs Attentate auf Adolf Hitler, 1939-1944.
 *
 * Regel des Spiels: Die historisch belegte Entscheidung ist die richtige.
 * Wer die Geschichte kennt, kommt durch die Akte.
 */

const STORY = {
  kapitel: [

/* ===================================================================== *
 * I — Georg Elser, 8. November 1939
 * ===================================================================== */
{
  id: "elser",
  nr: "I",
  datum: "8. November 1939",
  kurzdatum: "8.11.1939",
  ort: "Bürgerbräukeller, München",
  person: "Georg Elser, Schreiner",
  szene: "buergerbraukeller",
  akte: "AKTE I / ELSER",
  intro: `Du bist Georg Elser, 36 Jahre alt, Schreiner aus Königsbronn in Württemberg.
  Du bist in keiner Widerstandsgruppe, du hast keine Mitwisser, keine Geldgeber, keinen Auftrag.
  Im Herbst 1938 hast du beschlossen, dass der Krieg nur zu verhindern ist, wenn die Führungsspitze
  verschwindet. Seitdem arbeitest du daran — allein.
  <br><br>Jedes Jahr am 8. November spricht Hitler im Münchner Bürgerbräukeller vor den
  „alten Kämpfern“. Du hast dir die Uhrzeiten der letzten Jahre gemerkt. Du hast einen Plan:
  eine Bombe in der Säule direkt hinter dem Rednerpult.`,
  szenen: [
    {
      lage: `München, August 1939. Du hast den Saal vermessen und die Säule hinter dem Rednerpult
      ausgewählt. Um sie auszuhöhlen, brauchst du über dreißig Nächte in einem verschlossenen Wirtshaus.`,
      frage: "Wie kommst du Nacht für Nacht in den Bürgerbräukeller?",
      optionen: [
        { t: "Abends als normaler Gast essen gehen und dich vor der Sperrstunde in einer Abstellkammer einschließen lassen",
          ok: true,
          fb: `So hat Elser es gemacht. Er aß als Gast zu Abend, verschwand gegen 22 Uhr auf die Empore,
          wartete, bis abgeschlossen war, und arbeitete dann bis zum Morgengrauen. Das Klopfen deckte er
          mit dem Lärm der vorbeifahrenden Straßenbahn ab. Morgens verließ er das Haus, sobald
          aufgeschlossen wurde.` },
        { t: "Nachts ein Kellerfenster aufbrechen",
          ok: false,
          fb: `Einbruchsspuren bedeuten Polizei, und Polizei im Saal bedeutet, dass die Säule untersucht wird.
          Elser hat nie eine Spur hinterlassen — er nahm den Holzstaub jede Nacht in einem Koffer mit hinaus.` },
        { t: "Einen Kellner bestechen, der dich hereinlässt",
          ok: false,
          fb: `Jeder Mitwisser ist ein Risiko. Elsers größte Stärke war, dass er vollkommen allein handelte:
          Die Gestapo konnte später monatelang nicht glauben, dass kein Hintermann existierte.` }
      ],
      quelle: "Elser mietete sich zusätzlich für Wochen in München ein und gab als Beruf „Erfinder“ an."
    },
    {
      lage: `Für die Ladung brauchst du Sprengstoff, Zündkapseln und Zeit. Ein Schreiner kann so etwas
      nicht kaufen — jeder Verkauf würde registriert.`,
      frage: "Woher beschaffst du Sprengstoff und Zünder?",
      optionen: [
        { t: "Du lässt dich im Steinbruch und in einer Rüstungsfabrik anstellen und entwendest über Monate kleine Mengen",
          ok: true,
          fb: `Richtig. Elser arbeitete in der Armaturenfabrik Waldenmaier in Heidenheim — dort gab es
          Pressspäne und Zünderteile — und danach im Steinbruch Königsbronn, wo er über Wochen
          Sprengpatronen und Zündkapseln beiseiteschaffte. Kleine Mengen, nie auffällig.` },
        { t: "Du kaufst auf dem Schwarzmarkt in München",
          ok: false,
          fb: `Der Schwarzmarkt ist voller Spitzel, und Sprengstoff in dieser Menge ist meldepflichtig.
          Elser hat nie jemanden gefragt — genau deshalb kam ihm niemand auf die Spur.` },
        { t: "Du brichst in ein Wehrmachtsdepot ein",
          ok: false,
          fb: `Ein Depotdiebstahl löst sofort eine reichsweite Fahndung aus. Elsers Methode war das Gegenteil:
          unsichtbar bleiben, Monate Zeit nehmen, nichts erzwingen.` }
      ],
      quelle: "Elser baute den Sprengsatz in seiner Werkstatt und testete die Zündung auf einer Wiese bei Königsbronn."
    },
    {
      lage: `Der Zünder ist fertig: zwei Uhrwerke, die bis zu 144 Stunden vorlaufen können.
      Du musst die Uhr jetzt stellen — Tage im Voraus, ohne zu wissen, wie der Abend genau verläuft.`,
      frage: "Auf welche Uhrzeit stellst du den Zünder für den 8. November?",
      optionen: [
        { t: "21:20 Uhr — mitten in die Rede hinein",
          ok: true,
          fb: `Genau so. In den Vorjahren hatte Hitler gegen 20:30 Uhr begonnen und rund zwei Stunden
          gesprochen. 21:20 Uhr lag mitten in der Rede. Die Rechnung war völlig richtig — und trotzdem
          falsch, wie sich zeigen wird.` },
        { t: "20:30 Uhr — direkt zum Redebeginn",
          ok: false,
          fb: `Zu früh. Der Beginn verschiebt sich jedes Jahr um Minuten, und beim Einlass ist der
          Bereich vor dem Podium noch voller Ordner. Elser rechnete mit der Mitte der Rede.` },
        { t: "Mitternacht — wenn alle beim Bier sitzen",
          ok: false,
          fb: `Um Mitternacht ist der Saal leer und der Redner längst weg. Die Bombe hätte nur
          Mauerwerk zerstört.` }
      ],
      quelle: "Die Ladung saß in der Säule direkt hinter dem Rednerpult, hinter einer selbstgebauten Holzklappe."
    },
    {
      lage: `Die Bombe liegt seit dem 2. November in der Säule. In der Nacht zum 7. November bist du
      noch einmal zurückgekehrt und hast das Uhrwerk abgehorcht: Es läuft.
      Jetzt, am 8. November, bleiben dir Stunden.`,
      frage: "Was tust du am Abend des 8. November?",
      optionen: [
        { t: "Nach Konstanz fahren und im Dunkeln über die grüne Grenze in die Schweiz",
          ok: true,
          fb: `Das war Elsers Plan. Gegen 20:45 Uhr wurde er unmittelbar an der Grenze bei Konstanz von
          Zollbeamten aufgegriffen — 35 Minuten, bevor seine Bombe zündete. In seinen Taschen fanden sie
          Zünderteile, Skizzen und eine Ansichtskarte des Bürgerbräukellers.` },
        { t: "Mit dem Zug nach Berlin und dort untertauchen",
          ok: false,
          fb: `In der größten Stadt des Reiches ohne Papiere, ohne Geld, ohne Netzwerk unterzutauchen,
          wäre aussichtslos gewesen. Elser wollte in die Schweiz.` },
        { t: "In München bleiben und dich unter die Menge mischen",
          ok: false,
          fb: `Nach der Explosion wurde der gesamte Saal abgeriegelt und jeder Anwesende überprüft.
          Bleiben hieße verhaftet werden.` }
      ],
      quelle: "Elser gestand nach tagelangen Verhören und Folter; die Gestapo suchte trotzdem weiter nach Hintermännern."
    }
  ],
  epilog: {
    titel: "21:07 Uhr",
    text: `Wegen dichten Nebels konnte Hitler nicht fliegen. Er musste den Nachtzug nach Berlin nehmen
    und kürzte seine Rede. Um 21:07 Uhr verließ er den Saal.
    <strong>Um 21:20 Uhr riss die Explosion die Säule, die Empore und einen Teil der Decke herunter.</strong>
    Acht Menschen starben, 63 wurden verletzt. Hitler war zu diesem Zeitpunkt bereits auf dem Weg zum Bahnhof.`,
    fakten: [
      "Dreizehn Minuten trennten Georg Elser vom Erfolg.",
      "Elser wurde in den Konzentrationslagern Sachsenhausen und Dachau als „Sonderhäftling“ festgehalten.",
      "Am 9. April 1945, kurz vor Kriegsende, wurde er in Dachau auf Befehl ermordet."
    ]
  }
},

/* ===================================================================== *
 * II — Tresckow / Schlabrendorff, 13. März 1943
 * ===================================================================== */
{
  id: "smolensk",
  nr: "II",
  datum: "13. März 1943",
  kurzdatum: "13.3.1943",
  ort: "Smolensk → Ostpreußen",
  person: "Henning von Tresckow, Generalstabsoffizier",
  szene: "smolensk",
  akte: "AKTE II / FLASH",
  intro: `Du bist Oberst i. G. Henning von Tresckow, Erster Generalstabsoffizier der Heeresgruppe Mitte
  in Smolensk. Du weißt, was hinter der Front geschieht: Die Einsatzgruppen ermorden die jüdische
  Bevölkerung ganzer Landstriche, sowjetische Kriegsgefangene sterben zu Hunderttausenden.
  <br><br>Um dich hat sich ein Kreis von Offizieren gebildet. Jetzt kommt die Gelegenheit:
  Hitler besucht am 13. März das Hauptquartier der Heeresgruppe Mitte. Danach fliegt er zurück
  nach Ostpreußen. Dein Adjutant ist Leutnant Fabian von Schlabrendorff.`,
  szenen: [
    {
      lage: `Hitler reist mit Begleitkommando, Leibwächtern und eigenem Koch. Ein Erschießen im Kasino
      wurde im Kreis erwogen und verworfen. Bleibt der Sprengstoff — und der muss lautlos sein.`,
      frage: "Welchen Sprengsatz wählst du?",
      optionen: [
        { t: "Britischen Plastiksprengstoff mit chemischem Zeitzünder aus Beutebeständen der Abwehr",
          ok: true,
          fb: `Richtig. Deutsche Brennzünder zischen hörbar — im Flugzeug undenkbar. Der britische
          Säurezünder arbeitet vollkommen geräuschlos: Eine zerdrückte Ampulle lässt Säure einen Draht
          durchfressen, dann schlägt der Schlagbolzen zu. Das Material kam über Admiral Canaris' Abwehr.` },
        { t: "Eine deutsche Sprengladung mit Brennzünder",
          ok: false,
          fb: `Ein deutscher Brennzünder zischt und raucht. In der Kabine einer Focke-Wulf Condor
          fällt das sofort auf.` },
        { t: "Eine Pistole beim Essen im Offizierskasino",
          ok: false,
          fb: `Das Begleitkommando war ständig zugegen. Angebote einzelner Offiziere, Hitler bei Tisch
          zu erschießen, wurden von Tresckow verworfen — die Erfolgsaussicht war zu gering.` }
      ],
      quelle: "Der Sprengstoff stammte aus abgeworfenen britischen Beständen für Sabotagegruppen („Clam“-Haftladungen)."
    },
    {
      lage: `Die Ladung muss unbemerkt in Hitlers Maschine gelangen. Sie muss aussehen wie etwas,
      das ein Offizier einem anderen ganz selbstverständlich mitgibt.`,
      frage: "Wie tarnst du die Bombe?",
      optionen: [
        { t: "Als Päckchen mit zwei Flaschen Cointreau — eine verlorene Wette, adressiert an Oberst Stieff im Führerhauptquartier",
          ok: true,
          fb: `Genau so. Zwei zusammengeschnürte Päckchen in Flaschenform, Empfänger: Oberst Helmuth
          Stieff im Oberkommando des Heeres. Eine Schnapswette unter Offizieren — nichts wäre
          unauffälliger gewesen.` },
        { t: "In einer Aktentasche mit Lagekarten",
          ok: false,
          fb: `Aktentaschen mit Karten trägt jeder Offizier selbst; sie werden nicht als Fracht
          mitgegeben und landen nicht zuverlässig in Hitlers Maschine.` },
        { t: "In einer Munitionskiste im Frachtraum",
          ok: false,
          fb: `Munition wird verzeichnet, gewogen und kontrolliert. Die Tarnung muss privat wirken,
          nicht dienstlich.` }
      ],
      quelle: "Stieff war eingeweiht; die Sendung an ihn war reine Tarnadresse."
    },
    {
      lage: `Das Päckchen ist scharf, sobald die Ampulle zerdrückt wird. Du hast rund zwei Stunden.
      Jetzt brauchst du jemanden, der es an Bord trägt — arglos.`,
      frage: "Wem gibst du das Päckchen mit?",
      optionen: [
        { t: "Oberstleutnant Heinz Brandt aus Hitlers Begleitung — du bittest ihn kurz vor dem Start um einen Gefallen",
          ok: true,
          fb: `So geschah es. Schlabrendorff überreichte Brandt auf dem Rollfeld das Päckchen, nachdem
          Tresckow ihn gebeten hatte, es einem Kameraden mitzunehmen. Brandt ahnte nichts — er wird uns
          im Juli 1944 ein zweites Mal begegnen.` },
        { t: "Du fliegst selbst mit",
          ok: false,
          fb: `Tresckow wurde für die Stunde Null in Berlin gebraucht. Und ein Stabsoffizier der
          Heeresgruppe hatte keinen Grund, mitzufliegen — jede Abweichung fällt auf.` },
        { t: "Du schickst eine Ordonnanz zum Flugzeug",
          ok: false,
          fb: `Ein einfacher Soldat kommt nicht an Bord der Führermaschine. Es musste jemand aus
          Hitlers eigener Begleitung sein.` }
      ],
      quelle: "Schlabrendorff zerdrückte die Zündampulle unmittelbar vor der Übergabe."
    },
    {
      lage: `Ihr wartet in Smolensk auf die Meldung. Nach gut zwei Stunden kommt die Nachricht:
      Die Maschine ist wohlbehalten in Rastenburg gelandet. Nichts ist geschehen.
      Und im Führerhauptquartier liegt jetzt ein Paket mit einer Kilo-Ladung Sprengstoff.`,
      frage: "Was tust du?",
      optionen: [
        { t: "Schlabrendorff fliegt sofort hinterher, tauscht das Päckchen gegen echten Cognac und entschärft es",
          ok: true,
          fb: `Richtig — und beispiellos kaltblütig. Tresckow rief Brandt an, sagte, das Päckchen sei
          verwechselt worden, und Schlabrendorff flog am nächsten Tag nach Rastenburg, nahm das Paket
          entgegen und zerlegte es allein im Abteil des Nachtzugs nach Berlin. Der Zünder hatte
          funktioniert, die Sprengkapsel aber nicht gezündet — vermutlich wegen der Kälte im
          ungeheizten Frachtraum.` },
        { t: "Abwarten — vielleicht zündet die Bombe verspätet",
          ok: false,
          fb: `Abwarten hieße, dass irgendwann irgendwer das Paket öffnet. Das Ende wäre die Enttarnung
          des gesamten Kreises der Heeresgruppe Mitte gewesen.` },
        { t: "Brandt anonym warnen",
          ok: false,
          fb: `Eine anonyme Warnung im Führerhauptquartier löst sofort eine Untersuchung aus.
          Die Spur hätte direkt nach Smolensk geführt.` }
      ],
      quelle: "Schlabrendorff überlebte den Krieg und wurde später Richter am Bundesverfassungsgericht."
    }
  ],
  epilog: {
    titel: "Ein Draht, den die Kälte aufhielt",
    text: `Der chemische Zünder hatte gearbeitet, der Schlagbolzen war ausgelöst — nur die Sprengkapsel
    versagte. Vermutlich war der Frachtraum der Maschine zu kalt.
    <strong>Acht Tage später, am 21. März 1943, folgte der nächste Versuch:</strong> Rudolf-Christoph
    Freiherr von Gersdorff wollte sich im Berliner Zeughaus mit Hitler zusammen in die Luft sprengen.
    Hitler ging nach nur wenigen Minuten. Gersdorff konnte die Zünder gerade noch auf der Toilette entschärfen.`,
    fakten: [
      "Tresckows Satz an Stauffenberg: „Das Attentat muss erfolgen, coûte que coûte.“",
      "Nach dem Scheitern des 20. Juli 1944 nahm sich Tresckow an der Front das Leben, um unter Folter niemanden zu verraten.",
      "Heinz Brandt, der das Päckchen ahnungslos trug, starb 1944 an den Folgen von Stauffenbergs Bombe."
    ]
  }
},

/* ===================================================================== *
 * III — Axel von dem Bussche, Winter 1943
 * ===================================================================== */
{
  id: "bussche",
  nr: "III",
  datum: "Winter 1943",
  kurzdatum: "Winter 1943",
  ort: "Führerhauptquartier",
  person: "Axel Freiherr von dem Bussche, Oberleutnant",
  szene: "winter",
  akte: "AKTE III / MANTEL",
  intro: `Du bist Axel von dem Bussche, 24 Jahre alt, Oberleutnant, hoch dekoriert.
  Im Oktober 1942 bist du in Dubno in der Ukraine zufällig Zeuge einer Massenerschießung geworden:
  Tausende jüdische Männer, Frauen und Kinder, an einer Grube.
  <br><br>Seitdem gibt es für dich nur drei Möglichkeiten: fallen, desertieren — oder handeln.
  Jetzt fragt man dich, ob du bereit wärst, dem „Führer“ eine neue Winterausrüstung für die
  Front vorzuführen. Aus nächster Nähe.`,
  szenen: [
    {
      lage: `Hitler ist praktisch unerreichbar: Leibwache, Kontrollen, Vorkoster, wechselnde Termine.
      Eine Uniformvorführung aber verlangt genau das Gegenteil — einen Frontoffizier, der ihm
      unmittelbar gegenübertritt.`,
      frage: "Wie näherst du dich Hitler?",
      optionen: [
        { t: "Als Frontoffizier, der die neue Winteruniform samt Sturmgepäck persönlich vorführt",
          ok: true,
          fb: `Richtig. Die Vorführung neuer Ausrüstung war der einzige Anlass, bei dem ein einfacher
          Oberleutnant minutenlang direkt vor Hitler stehen durfte — mit Mantel, Gepäck und
          Ausrüstungstaschen am Körper.` },
        { t: "Als Kurier mit einer Meldung ins Lagezimmer",
          ok: false,
          fb: `Kuriere übergeben an Adjutanten und werden gar nicht erst vorgelassen.` },
        { t: "Als Fahrer der Wagenkolonne",
          ok: false,
          fb: `Fahrer werden sicherheitsüberprüft und kommen nie in die Nähe des Fahrgastes.` }
      ],
      quelle: "Die Vorführung war für den 21. November 1943 vorgesehen."
    },
    {
      lage: `Du wirst durchsucht werden. Du wirst keine Waffe ziehen können, ohne sofort niedergerungen
      zu werden. Was du am Körper trägst, muss Teil der Ausrüstung sein.`,
      frage: "Welche Methode wählst du?",
      optionen: [
        { t: "Eine Handgranate in der Manteltasche zünden, Hitler umklammern und mit ihm sterben",
          ok: true,
          fb: `Das war Bussches Entschluss: das Selbstopfer. Die deutsche Eihandgranate hatte 4,5
          Sekunden Verzögerung — zu lang, um den Raum zu verlassen, aber lang genug, um Hitler
          festzuhalten. Bussche sagte später, er habe keinen anderen Weg gesehen, „als selbst
          dabei zu bleiben".` },
        { t: "Eine Pistole ziehen, sobald du vor ihm stehst",
          ok: false,
          fb: `Vor der Vorführung wird kontrolliert, und im Raum stehen Leibwächter. Eine Pistole
          bedeutet: niedergeschlagen, bevor der erste Schuss fällt.` },
        { t: "Gift in Hitlers Getränk",
          ok: false,
          fb: `Hitlers Essen und Getränke wurden vorgekostet. Ein Frontoffizier kommt ohnehin
          nie an sein Geschirr.` }
      ],
      quelle: "Bussche besorgte sich die Granate über Vertraute; Stauffenberg hatte ihn für die Aufgabe gewonnen."
    },
    {
      lage: `Du hast einen Eid auf Hitler geschworen. Du bist gläubiger Christ. Du weißt, dass bei
      der Explosion auch andere sterben werden — und dass man dich als Mörder und Verräter
      in die Geschichtsbücher schreiben wird.`,
      frage: "Wie entscheidest du dich?",
      optionen: [
        { t: "Ein Eid auf einen Verbrecher bindet nicht — wer Massenmord befiehlt, hat den Anspruch auf Treue verwirkt",
          ok: true,
          fb: `Das war die Überzeugung, die Bussche und die Verschwörer trugen. Für viele Offiziere
          war der Eid die größte innere Hürde des gesamten Widerstands — Bussche entschied, dass
          die Verbrechen den Eid aufgehoben hatten.` },
        { t: "Der Eid gilt bedingungslos, du trittst zurück",
          ok: false,
          fb: `Das war die Haltung, mit der die meisten es nicht taten. Bussche entschied anders —
          genau das macht ihn zum Teil dieser Akte.` },
        { t: "Du wartest ab, bis die Alliierten die Sache erledigen",
          ok: false,
          fb: `Jeder Monat Krieg kostete Hunderttausende Menschenleben. Für die Verschwörer war
          gerade das Warten die Schuld.` }
      ],
      quelle: "Bussche war Zeuge der Massenerschießung in Dubno am 5. Oktober 1942 geworden."
    },
    {
      lage: `Du bist in Berlin, bereit, mit der Granate in der Tasche. Dann ein Luftangriff:
      Der Zug mit den Musterstücken der neuen Uniform wird zerstört. Es gibt nichts vorzuführen.
      Kurz darauf wird dein Regiment wieder an die Front beordert.`,
      frage: "Was tust du?",
      optionen: [
        { t: "Bereitbleiben und auf einen Ersatztermin warten — und bis dahin an die Front zurückkehren",
          ok: true,
          fb: `So geschah es. Der Termin platzte, die Vorführung wurde immer wieder verschoben.
          Bussche ging zurück an die Ostfront und wurde im Januar 1944 schwer verwundet — er verlor
          ein Bein. Damit kam er für ein Attentat nicht mehr in Frage.` },
        { t: "Ohne Vorführung ins Hauptquartier gehen und es erzwingen",
          ok: false,
          fb: `Ohne dienstlichen Anlass kommt niemand in den Sperrkreis. Der Versuch hätte den
          gesamten Kreis um Stauffenberg aufliegen lassen.` },
        { t: "Aufgeben und schweigen",
          ok: false,
          fb: `Bussche gab nicht auf — er hielt sich monatelang bereit. Erst seine Verwundung
          beendete seine Rolle.` }
      ],
      quelle: "Die Granate versteckte Bussche später; er wurde nie enttarnt und überlebte den Krieg."
    }
  ],
  epilog: {
    titel: "Ein Luftangriff, der niemanden rettete",
    text: `Der Zufall traf diesmal nicht die Bombe, sondern die Uniformen. Ein alliierter Luftangriff
    auf Berlin zerstörte die Musterstücke, die Bussche vorführen sollte. Der Termin verfiel,
    das Attentat fand nie statt.
    <strong>Bussche blieb bereit — aber die Front kam ihm zuvor.</strong>`,
    fakten: [
      "Bussche verlor im Januar 1944 durch eine Verwundung ein Bein und schied als Attentäter aus.",
      "Er wurde nie entdeckt, überlebte den Krieg und arbeitete später im diplomatischen Dienst.",
      "Seine Rolle sollte ein anderer übernehmen — ein 21-jähriger Leutnant."
    ]
  }
},

/* ===================================================================== *
 * IV — Ewald-Heinrich von Kleist, Anfang 1944
 * ===================================================================== */
{
  id: "kleist",
  nr: "IV",
  datum: "Anfang 1944",
  kurzdatum: "Anf. 1944",
  ort: "Berlin / Gut Schmenzin, Pommern",
  person: "Ewald-Heinrich von Kleist, Leutnant",
  szene: "schmenzin",
  akte: "AKTE IV / SOHN",
  intro: `Du bist Ewald-Heinrich von Kleist, 21 Jahre alt, Leutnant. Dein Vater, Ewald von Kleist-Schmenzin,
  ist seit 1938 ein erklärter Gegner Hitlers und reiste damals sogar heimlich nach London, um vor dem
  Krieg zu warnen.
  <br><br>Anfang 1944 bittet dich Oberst Claus Schenk Graf von Stauffenberg in sein Büro.
  Er fragt dich, ob du bereit bist, die Rolle zu übernehmen, die Bussche nicht mehr übernehmen kann:
  die Uniformvorführung — mit einer Sprengladung am Körper.`,
  szenen: [
    {
      lage: `Stauffenberg wartet auf deine Antwort. Es geht nicht um ein Risiko, es geht um den
      sicheren Tod. Du bist 21.`,
      frage: "Was tust du, bevor du zusagst?",
      optionen: [
        { t: "Du bittest um Bedenkzeit und fährst nach Schmenzin, um deinen Vater zu fragen",
          ok: true,
          fb: `So war es. Kleist fuhr nach Pommern zu seinem Vater. Der antwortete ihm:
          „Ja, das musst du tun. Wer in einem solchen Augenblick versagt, wird nie wieder froh im Leben.“
          Ein Vater, der seinem Sohn rät, sein Leben zu geben.` },
        { t: "Du sagst sofort zu, ohne mit jemandem zu sprechen",
          ok: false,
          fb: `Kleist hat vorher mit seinem Vater gesprochen — diese Szene gehört zu den
          eindrücklichsten Überlieferungen des 20. Juli.` },
        { t: "Du lehnst ab und nennst Stauffenberg einen anderen Namen",
          ok: false,
          fb: `Kleist lehnte nicht ab. Er sagte zu und hielt sich monatelang bereit.` }
      ],
      quelle: "Ewald von Kleist-Schmenzin wurde nach dem 20. Juli 1944 verhaftet und 1945 hingerichtet."
    },
    {
      lage: `Du hast zugesagt. Der Termin für die Vorführung steht: 11. Februar 1944.
      Dann wird er abgesagt. Dann wieder angesetzt. Dann wieder abgesagt.
      Hitlers Terminkalender ist unberechenbar, und jede Absage ist eine Woche Warten auf den eigenen Tod.`,
      frage: "Wie verhältst du dich?",
      optionen: [
        { t: "Du bleibst bereit und meldest dich für jeden neuen Termin",
          ok: true,
          fb: `Richtig. Kleist hielt sich über Monate bereit. Die Vorführung kam nie zustande —
          Hitler sagte immer wieder ab, verlegte Termine, misstraute Routinen. Diese Unberechenbarkeit
          schützte ihn besser als jede Leibwache.` },
        { t: "Du drängst auf einen festen Termin",
          ok: false,
          fb: `Wer im Hauptquartier auf Termine drängt, macht sich verdächtig. Die Verschwörer
          konnten nur warten.` },
        { t: "Du ziehst deine Zusage zurück",
          ok: false,
          fb: `Kleist blieb bei seiner Zusage — bis zum 20. Juli und darüber hinaus.` }
      ],
      quelle: "Auch diese Vorführung fand nie statt; Hitler sagte sie wiederholt ab."
    },
    {
      lage: `20. Juli 1944. Du bist im Bendlerblock in Berlin, im Zentrum des Umsturzversuchs.
      Am Abend wird klar: Hitler lebt. Die Verschwörung bricht zusammen, Offiziere werden im Hof
      erschossen, die Gestapo rückt an.`,
      frage: "Was tust du in dieser Nacht?",
      optionen: [
        { t: "Du bleibst auf deinem Posten und fährst Befehle aus, solange es geht",
          ok: true,
          fb: `Kleist blieb. Er wurde verhaftet und verhört — aber man konnte ihm nichts nachweisen.
          Er überlebte als einer der wenigen Beteiligten und wurde später Gründer der
          Münchner Sicherheitskonferenz.` },
        { t: "Du fliehst sofort nach Hause",
          ok: false,
          fb: `Fluchtversuche in dieser Nacht führten fast alle zur sofortigen Verhaftung —
          und galten der Gestapo als Geständnis.` },
        { t: "Du zeigst deine Kameraden an, um dich zu retten",
          ok: false,
          fb: `Niemand aus dem engsten Kreis tat das. Tresckow nahm sich das Leben,
          um unter Folter niemanden zu verraten.` }
      ],
      quelle: "Rund 200 Beteiligte des Widerstands wurden nach dem 20. Juli hingerichtet."
    }
  ],
  epilog: {
    titel: "Der Termin, der nie kam",
    text: `Kleists Attentat scheiterte nicht an einem Zünder und nicht an Minuten, sondern an Hitlers
    Unberechenbarkeit: Die Vorführung wurde immer wieder verschoben und fand nie statt.
    <strong>Damit war klar: Auf einen Termin zu warten, hieß, nie zum Schuss zu kommen.</strong>`,
    fakten: [
      "Kleists Vater wurde am 9. April 1945 in Plötzensee hingerichtet.",
      "Ewald-Heinrich von Kleist überlebte Haft und Krieg und starb 2013.",
      "Die Verschwörer brauchten jemanden, der ohnehin regelmäßig zu Hitler musste — einen Stabsoffizier."
    ]
  }
},

/* ===================================================================== *
 * V — Helmuth Stieff, 7. Juli 1944
 * ===================================================================== */
{
  id: "stieff",
  nr: "V",
  datum: "7. Juli 1944",
  kurzdatum: "7.7.1944",
  ort: "Schloss Klessheim bei Salzburg",
  person: "Helmuth Stieff, Generalmajor",
  szene: "klessheim",
  akte: "AKTE V / KLESSHEIM",
  intro: `Du bist Generalmajor Helmuth Stieff, Chef der Organisationsabteilung im Generalstab des Heeres.
  Du bist seit Jahren eingeweiht — an dich war 1943 das Cointreau-Paket adressiert, und in deinem
  Bereich lagert seither der britische Sprengstoff der Verschwörer.
  <br><br>Am 7. Juli 1944 wird auf Schloss Klessheim bei Salzburg neue Ausrüstung vorgeführt.
  Hitler wird anwesend sein. Auch Stauffenberg ist da. Du hast den Sprengstoff dabei.`,
  szenen: [
    {
      lage: `Die Vorführung ist die letzte greifbare Gelegenheit seit Monaten. Du bist einer der
      wenigen Eingeweihten, die dienstlich in Hitlers Nähe kommen.`,
      frage: "Wie gehst du in die Vorführung?",
      optionen: [
        { t: "Mit der Sprengladung im Gepäck, zur Zündung bereit",
          ok: true,
          fb: `So war es geplant. Stieff hatte den Sprengstoff aus den Beständen der Verschwörer
          dabei; er galt im Kreis als der Mann, der an diesem Tag zünden sollte.` },
        { t: "Ohne Sprengstoff — nur zur Beobachtung",
          ok: false,
          fb: `Der Kreis um Stauffenberg hatte auf diesen Termin gesetzt. Stieff kam mit dem
          Sprengstoff nach Klessheim.` },
        { t: "Du meldest dich krank",
          ok: false,
          fb: `Stieff war an diesem Tag anwesend. Was fehlte, war nicht die Gelegenheit.` }
      ],
      quelle: "Stieff verwahrte seit 1943 den britischen Sprengstoff der Verschwörer."
    },
    {
      lage: `Hitler steht vor dir. Die Ausrüstungsstücke werden gezeigt, es wird gefragt und geantwortet.
      Der Sprengstoff ist griffbereit. Es sind nur Sekunden nötig.`,
      frage: "Was geschieht in diesem Moment?",
      optionen: [
        { t: "Du bringst es nicht über dich — du zündest nicht",
          ok: true,
          fb: `Das ist die historische Wahrheit. Stieff zündete nicht. Über die Gründe wird bis heute
          gestritten: Zweifel, Skrupel, die Sorge, dass Himmler und Göring nicht anwesend waren und
          das Regime weiterbestehen würde — oder schlicht die Last, aus nächster Nähe zu töten.
          Für Stauffenberg war dieser Tag der Wendepunkt.` },
        { t: "Du zündest sofort",
          ok: false,
          fb: `Es wäre die Chance gewesen — aber sie wurde nicht genutzt. Gerade dieses Nicht-Handeln
          gehört zur Geschichte des Widerstands: Attentäter sind keine Maschinen.` },
        { t: "Du übergibst den Sprengstoff an Stauffenberg im Saal",
          ok: false,
          fb: `Eine Übergabe vor Zeugen im Sperrkreis wäre Selbstmord ohne Wirkung gewesen.` }
      ],
      quelle: "Stauffenberg war am 7. Juli 1944 in Klessheim anwesend und erlebte das Scheitern mit."
    },
    {
      lage: `Der Tag ist vorbei, Hitler lebt, und im Kreis ist klar: Auf einen anderen zu warten,
      führt zu nichts. Stauffenberg ist inzwischen Chef des Stabes beim Befehlshaber des Ersatzheeres —
      er wird selbst zu Lagebesprechungen befohlen.`,
      frage: "Wer führt das Attentat künftig aus?",
      optionen: [
        { t: "Stauffenberg selbst — obwohl er gleichzeitig in Berlin den Umsturz leiten muss",
          ok: true,
          fb: `Richtig, und es ist der tragische Kern des 20. Juli: Der einzige Mann, der an Hitler
          herankam, war zugleich der einzige, der in Berlin die Befehle geben konnte. Stauffenberg
          musste beides tun — schwer kriegsversehrt, mit drei Fingern an einer Hand.` },
        { t: "Ein neuer Freiwilliger wird gesucht",
          ok: false,
          fb: `Dafür war keine Zeit mehr. Verhaftungen standen bevor, die Front brach zusammen,
          und Zugang zu Hitler hatte fast niemand mehr.` },
        { t: "Das Vorhaben wird abgebrochen",
          ok: false,
          fb: `Tresckows Botschaft an Stauffenberg lautete: Das Attentat muss erfolgen — „coûte que coûte“ —
          auch wenn es misslingt. Die Welt müsse sehen, dass es Widerstand gab.` }
      ],
      quelle: "Am 11. und 15. Juli 1944 brach Stauffenberg zwei Anläufe kurzfristig ab."
    }
  ],
  epilog: {
    titel: "Sekunden, die niemand nutzte",
    text: `Klessheim scheiterte nicht an Technik und nicht am Zufall, sondern am Menschen.
    <strong>Danach entschied Stauffenberg, es selbst zu tun.</strong>
    Zwei weitere Anläufe brach er am 11. und 15. Juli ab, weil Himmler nicht anwesend war
    beziehungsweise die Besprechung zu früh endete. Der dritte Anlauf war der 20. Juli.`,
    fakten: [
      "Stieff wurde nach dem 20. Juli verhaftet und vor dem Volksgerichtshof unter Roland Freisler gedemütigt.",
      "Er wurde am 8. August 1944 in Berlin-Plötzensee hingerichtet.",
      "Die Prozesse wurden gefilmt — die Aufnahmen sollten abschrecken."
    ]
  }
},

/* ===================================================================== *
 * VI — Stauffenberg, 20. Juli 1944
 * ===================================================================== */
{
  id: "stauffenberg",
  nr: "VI",
  datum: "20. Juli 1944",
  kurzdatum: "20.7.1944",
  ort: "Wolfsschanze, Rastenburg",
  person: "Claus Schenk Graf von Stauffenberg, Oberst i. G.",
  szene: "wolfsschanze",
  akte: "AKTE VI / WALKÜRE",
  intro: `Du bist Oberst i. G. Claus Schenk Graf von Stauffenberg, Chef des Stabes beim Befehlshaber
  des Ersatzheeres. In Nordafrika hast du 1943 die rechte Hand, zwei Finger der linken Hand und das
  linke Auge verloren.
  <br><br>Du wirst zur Lagebesprechung in die Wolfsschanze bei Rastenburg befohlen.
  In deiner Aktentasche liegen zwei Sprengstoffblöcke. In Berlin warten Offiziere auf den Befehl
  „Walküre“ — den Einsatzplan des Ersatzheeres, den ihr umgeschrieben habt, damit er den Umsturz trägt.`,
  szenen: [
    {
      lage: `Das Attentat muss in Ostpreußen geschehen. Der Umsturz muss in Berlin geführt werden.
      Beides am selben Tag, 600 Kilometer auseinander.`,
      frage: "Wie löst du dieses Problem?",
      optionen: [
        { t: "Du machst beides selbst — zünden in Rastenburg, dann sofort nach Berlin fliegen",
          ok: true,
          fb: `So geschah es — und es war der Kardinalfehler der Verschwörung. Stauffenberg fehlte
          in den entscheidenden Stunden in Berlin, während er im Flugzeug saß. Aber er war der Einzige,
          der Zugang zu Hitler hatte.` },
        { t: "Du überträgst das Attentat einem anderen und bleibst in Berlin",
          ok: false,
          fb: `Genau das war am 7. Juli in Klessheim gescheitert. Es gab niemanden mehr.` },
        { t: "Du verlegst den Umsturz nach Ostpreußen",
          ok: false,
          fb: `Die Befehlsgewalt über das Ersatzheer, die Nachrichtenzentralen und die Ministerien
          saßen in Berlin. Ohne Berlin kein Umsturz.` }
      ],
      quelle: "Der Plan „Walküre“ war offiziell für innere Unruhen gedacht und wurde von den Verschwörern umgeschrieben."
    },
    {
      lage: `12:30 Uhr. Die Lagebesprechung findet nicht im Betonbunker statt, sondern in der
      hölzernen Lagebaracke — es ist heiß, der Bunker wird umgebaut.`,
      frage: "Führst du das Attentat trotzdem durch?",
      optionen: [
        { t: "Ja — ein weiterer Abbruch ist nicht mehr zu verantworten",
          ok: true,
          fb: `Richtig. Zwei Anläufe hatte Stauffenberg bereits abgebrochen. In der Holzbaracke
          konnte die Druckwelle durch Fenster und dünne Wände entweichen — im Bunker wären
          vermutlich alle gestorben. Aber ein dritter Abbruch hätte die Verschwörung wohl endgültig
          zerbrochen; Verhaftungen standen unmittelbar bevor.` },
        { t: "Nein — abbrechen und auf eine Besprechung im Bunker warten",
          ok: false,
          fb: `Die Gestapo war den Verschwörern bereits auf der Spur; für den 21. Juli war
          Stauffenbergs Verhaftungsrisiko real. Es gab kein „nächstes Mal“ mehr.` }
      ],
      quelle: "Der Bunker der Wolfsschanze wurde im Sommer 1944 verstärkt; die Lage fand deshalb in der Baracke statt."
    },
    {
      lage: `Du ziehst dich mit deinem Adjutanten Werner von Haeften in einen Nebenraum zurück,
      um die Zünder zu aktivieren. Mit drei Fingern drückst du die Zündampulle mit einer Spezialzange auf.
      Dann klopft es: Ein Feldwebel drängt zur Eile, die Besprechung hat begonnen.
      Erst ein Block ist scharf.`,
      frage: "Wie entscheidest du?",
      optionen: [
        { t: "Du gehst mit dem einen scharfen Block hinein — keine Zeit mehr",
          ok: true,
          fb: `So war es. Der zweite, nicht scharf gemachte Block blieb zurück; Haeften nahm ihn mit
          und warf ihn später aus dem Auto. Er hätte die Sprengwirkung verdoppelt und — selbst ohne
          eigenen Zünder — durch die Explosion mitgezündet. Diese unterbrochene Minute im
          Nebenzimmer entschied den 20. Juli.` },
        { t: "Du nimmst dir die Zeit für beide Blöcke",
          ok: false,
          fb: `Die Zeit gab es nicht: Der Zünder des ersten Blocks lief bereits, und der Feldwebel
          stand in der Tür. Jede weitere Minute hätte Verdacht erregt.` },
        { t: "Du brichst ab und lässt beide Blöcke entschärft",
          ok: false,
          fb: `Ein dritter Abbruch war nicht mehr möglich. Stauffenberg ging hinein.` }
      ],
      quelle: "Der Zeitzünder war auf etwa zehn Minuten eingestellt."
    },
    {
      lage: `Du betrittst die Lagebaracke. Um den schweren Kartentisch stehen rund 24 Offiziere.
      Hitler beugt sich über die Karten. Du meldest dich, stellst deine Aktentasche ab
      und brauchst einen Vorwand, um den Raum zu verlassen.`,
      frage: "Wo stellst du die Tasche ab und wie kommst du hinaus?",
      optionen: [
        { t: "So nah wie möglich an Hitler unter den Kartentisch — dann lässt du dich zu einem Telefonat herausrufen",
          ok: true,
          fb: `Genau so. Stauffenberg schob die Tasche unter den Tisch, wenige Schritte von Hitler
          entfernt, und ließ sich unter dem Vorwand eines Ferngesprächs mit Berlin hinausrufen.
          Was er nicht wissen konnte: Oberst Heinz Brandt — derselbe Offizier, der 1943 das
          Cointreau-Paket getragen hatte — stieß beim Vorbeugen an die Tasche und schob sie auf die
          andere Seite des massiven Tischsockels. Der Sockel schirmte Hitler ab. Brandt starb.` },
        { t: "Neben die Tür, damit du schnell hinauskommst",
          ok: false,
          fb: `Bei einer Kilo-Ladung entscheiden Meter. An der Tür hätte niemand am Tisch
          tödliche Verletzungen davongetragen.` },
        { t: "Du behältst die Tasche in der Hand bis zum Schluss",
          ok: false,
          fb: `Dann stirbst du mit — und in Berlin gibt niemand die Walküre-Befehle.
          Stauffenbergs Plan verlangte, dass er überlebt.` }
      ],
      quelle: "Die Explosion erfolgte um 12:42 Uhr. Vier Menschen starben, Hitler wurde leicht verletzt."
    },
    {
      lage: `12:42 Uhr. Die Baracke zerreißt, Rauch, Trümmer, Schreie. Du bist überzeugt:
      Niemand kann das überlebt haben. Zwischen dir und dem Flugplatz liegen drei Kontrollpunkte
      im abgeriegelten Sperrkreis.`,
      frage: "Was tust du?",
      optionen: [
        { t: "Du bluffst dich durch die Sperren und fliegst sofort nach Berlin",
          ok: true,
          fb: `Richtig. Stauffenberg redete sich an den Wachen vorbei, erreichte die bereitgestellte
          Maschine und flog nach Berlin — drei Stunden ohne Funkkontakt. In genau diesen drei Stunden
          entschied sich alles, und niemand in Berlin wagte, ohne ihn zu handeln.` },
        { t: "Du bleibst und prüfst, ob Hitler wirklich tot ist",
          ok: false,
          fb: `Bleiben hieße verhaftet werden, sobald die Untersuchung beginnt — und Berlin
          bliebe ohne Führung.` },
        { t: "Du meldest den Tod per Funk und wartest auf Bestätigung",
          ok: false,
          fb: `Der Sperrkreis wurde nach der Explosion sofort für den Nachrichtenverkehr gesperrt.` }
      ],
      quelle: "Haeften warf den zweiten Sprengstoffblock auf der Fahrt zum Flugplatz aus dem Wagen."
    },
    {
      lage: `16:30 Uhr, Bendlerstraße Berlin. Du landest und erfährst: Walküre wurde nicht ausgelöst.
      General Olbricht hat auf Bestätigung gewartet. Aus der Wolfsschanze meldet Keitel:
      Der Führer lebt.`,
      frage: "Was tust du jetzt?",
      optionen: [
        { t: "Du löst Walküre trotzdem aus und behauptest überall, Hitler sei tot",
          ok: true,
          fb: `So geschah es — aber drei Stunden zu spät. Die Fernschreiben gingen erst am
          späten Nachmittag hinaus. In Berlin verweigerte Major Remer den Gehorsam, nachdem Goebbels
          ihn mit Hitler persönlich telefonieren ließ. Nur in Paris wurde der Umsturz kurzzeitig
          vollständig durchgeführt.` },
        { t: "Du brichst ab, um Leben zu retten",
          ok: false,
          fb: `Für einen Abbruch war es zu spät — die Fernschreiben und Verhaftungen liefen bereits.
          Und Tresckows Botschaft lautete: Das Zeichen muss gesetzt werden, auch wenn es misslingt.` },
        { t: "Du fliehst ins Ausland",
          ok: false,
          fb: `Keiner der Verschwörer floh. Stauffenberg blieb bis zur letzten Stunde im Bendlerblock.` }
      ],
      quelle: "General Fromm ließ Stauffenberg, Olbricht, Haeften und Mertz von Quirnheim noch in derselben Nacht erschießen."
    }
  ],
  epilog: {
    titel: "00:15 Uhr, Hof des Bendlerblocks",
    text: `Die Explosion tötete vier Menschen. Hitler kam mit zerfetzter Hose, Verbrennungen und
    geplatzten Trommelfellen davon — abgeschirmt vom massiven Sockel des Kartentischs, hinter den
    Oberst Brandt die Aktentasche geschoben hatte.
    <strong>In der Nacht zum 21. Juli 1944 wurden Stauffenberg, Olbricht, Mertz von Quirnheim und
    Haeften im Hof des Bendlerblocks im Scheinwerferlicht von Lastwagen erschossen.</strong>
    Stauffenbergs letzte Worte: „Es lebe das heilige Deutschland.“`,
    fakten: [
      "Rund 200 Beteiligte wurden in den folgenden Monaten hingerichtet, viele nach Schauprozessen vor dem Volksgerichtshof.",
      "Angehörige wurden in „Sippenhaft“ genommen, auch Kinder.",
      "Der Krieg dauerte noch fast zehn Monate — mehr Menschen starben nach dem 20. Juli 1944 als davor."
    ]
  }
}

  ],

  /* Abschlusstext nach allen sechs Akten */
  fazit: {
    titel: "Warum hat er jedes Mal überlebt?",
    text: `Sechs Mal, sechs Pläne, sechs Mal Scheitern: dichter Nebel und dreizehn Minuten,
    ein Zünder in einem eiskalten Frachtraum, ein Luftangriff auf einen Eisenbahnwaggon, ein
    Termin, der immer wieder verschoben wurde, ein Mann, der im entscheidenden Moment nicht konnte,
    und ein Tischsockel aus massivem Eichenholz.
    <br><br>Nichts davon war Vorsehung. Es war Zufall, schlechtes Timing, Pech — und ein
    Sicherheitsapparat, gegen den Einzelne kaum eine Chance hatten.
    Entscheidend ist nicht, dass die Attentate scheiterten, sondern dass es sie gab:
    Menschen, die wussten, was sie riskierten, und die trotzdem handelten.`,
    zitat: "„Das Attentat muss erfolgen, coûte que coûte. Sollte es misslingen, so muss trotzdem in Berlin gehandelt werden. Denn es kommt nicht mehr auf den praktischen Zweck an, sondern darauf, dass die deutsche Widerstandsbewegung vor der Welt und vor der Geschichte den entscheidenden Wurf gewagt hat.“",
    zitatQuelle: "Henning von Tresckow, Sommer 1944"
  }
};

if (typeof module !== "undefined") { module.exports = STORY; }
