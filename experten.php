<?php
/*
 * experten.php — Sammelstelle für die Expertenrunde.
 *
 * Teilt den Gruppen reihum eine der sechs Personen zu, nimmt ihre Punkte
 * entgegen und merkt sich, wer schon vorgetragen hat. Gespeichert wird in
 * experten.json daneben — keine Datenbank, kein Eingriff in tafel.php.
 *
 *   POST ?aktion=zuteilen   {gruppe}              → {id, person}
 *   POST ?aktion=ergebnis   {id, punkte, fehler}
 *   POST ?aktion=vortrag    {id, schluessel}      → Vortragsbonus an/aus
 *   POST ?aktion=neu        {schluessel}          → alles zurücksetzen
 *   GET                                           → Stand für die Tafel
 */

declare(strict_types=1);

const SCHLUESSEL    = 'bbs-tafel';          // denselben wie in tafel.php eintragen
const DATEI         = __DIR__ . '/experten.json';
const PERSONEN       = 6;
const GRUPPENGROESSE = 2;        // immer zwei Mitglieder je Gruppe
const VORTRAGSBONUS = 200;
const MAX_GRUPPEN   = 60;
const MAX_NAME      = 28;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function leer(): array {
    return ['runde' => 1, 'stand' => 0, 'gruppen' => []];
}

function aendern(callable $fn): array {
    $datei = @fopen(DATEI, 'c+');
    if ($datei === false) {
        http_response_code(500);
        echo json_encode(['fehler' => 'experten.json kann nicht angelegt werden — Schreibrechte prüfen.']);
        exit;
    }
    flock($datei, LOCK_EX);
    $daten = json_decode((string) stream_get_contents($datei), true);
    if (!is_array($daten) || !isset($daten['gruppen']) || !is_array($daten['gruppen'])) {
        $daten = leer();
    }
    $daten = $fn($daten);
    $daten['stand'] = ((int) ($daten['stand'] ?? 0)) + 1;
    ftruncate($datei, 0);
    rewind($datei);
    fwrite($datei, json_encode($daten, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    fflush($datei);
    flock($datei, LOCK_UN);
    fclose($datei);
    return $daten;
}

function lesen(): array {
    if (!is_file(DATEI)) return leer();
    $daten = json_decode((string) @file_get_contents(DATEI), true);
    if (!is_array($daten) || !isset($daten['gruppen'])) return leer();
    return $daten;
}

function antwort(array $daten): void {
    echo json_encode([
        'runde'   => $daten['runde'] ?? 1,
        'stand'   => $daten['stand'] ?? 0,
        'gruppen' => array_values($daten['gruppen'] ?? []),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/* --- Anfragen ---------------------------------------------------------- */

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET' && ($_GET['aktion'] ?? '') === 'gruppe') {
    $id = (string) ($_GET['id'] ?? '');
    foreach (lesen()['gruppen'] as $g) {
        if (($g['id'] ?? '') === $id) {
            echo json_encode([
                'id'         => $g['id'],
                'person'     => (int) $g['person'],
                'mitglieder' => $g['mitglieder'] ?? [],
                'fertig'     => (bool) ($g['fertig'] ?? false),
                'punkte'     => (int) ($g['punkte'] ?? 0),
                'ergebnisse' => $g['ergebnisse'] ?? [],
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['fehler' => 'Diese Gruppe gibt es nicht mehr.']);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
    $daten = lesen();
    $bekannt = isset($_GET['stand']) ? (int) $_GET['stand'] : -1;
    if ($bekannt >= 0 && $bekannt === (int) ($daten['stand'] ?? 0)) {
        echo json_encode(['stand' => $bekannt, 'unveraendert' => true]);
        exit;
    }
    antwort($daten);
}

$gesendet = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($gesendet)) $gesendet = $_POST;
$aktion = (string) ($_GET['aktion'] ?? '');

if ($aktion === 'neu') {
    if (($gesendet['schluessel'] ?? '') !== SCHLUESSEL) {
        http_response_code(403);
        echo json_encode(['fehler' => 'Falscher Schlüssel.']);
        exit;
    }
    antwort(aendern(static function (array $d): array {
        $d['runde'] = ((int) ($d['runde'] ?? 1)) + 1;
        $d['gruppen'] = [];
        return $d;
    }));
}

if ($aktion === 'zuteilen') {
    $name = trim((string) ($gesendet['name'] ?? $gesendet['gruppe'] ?? ''));
    $name = preg_replace('/[\x00-\x1F\x7F]/u', '', $name) ?? '';
    $name = function_exists('mb_substr') ? mb_substr($name, 0, MAX_NAME, 'UTF-8') : substr($name, 0, MAX_NAME);
    if ($name === '') {
        http_response_code(400);
        echo json_encode(['fehler' => 'Ohne Namen geht es nicht.']);
        exit;
    }
    $neueId = bin2hex(random_bytes(6));
    $ergebnis = null;
    aendern(static function (array $d) use ($name, $neueId, &$ergebnis): array {
        // 1. Gibt es eine Gruppe, in der noch ein Platz frei ist? Dann dazu.
        foreach ($d['gruppen'] as &$g) {
            $mitglieder = $g['mitglieder'] ?? [];
            if (count($mitglieder) < GRUPPENGROESSE && !($g['abgegeben'] ?? 0)) {
                $mitglieder[] = $name;
                $g['mitglieder'] = $mitglieder;
                $g['name'] = implode(' + ', $mitglieder);
                $ergebnis = ['id' => $g['id'], 'person' => (int) $g['person'],
                             'mitglieder' => $mitglieder, 'platz' => count($mitglieder)];
                return $d;
            }
        }
        unset($g);

        // 2. Sonst eine neue Gruppe aufmachen — mit der Person, die am
        //    wenigsten vergeben ist.
        if (count($d['gruppen']) >= MAX_GRUPPEN) return $d;
        $zaehler = array_fill(0, PERSONEN, 0);
        foreach ($d['gruppen'] as $g2) {
            $p = (int) ($g2['person'] ?? 0);
            if ($p >= 0 && $p < PERSONEN) $zaehler[$p]++;
        }
        $person = (int) array_search(min($zaehler), $zaehler, true);
        $d['gruppen'][] = [
            'id'         => $neueId,
            'mitglieder' => [$name],
            'name'       => $name,
            'person'     => $person,
            'punkte'     => 0,
            'fehler'     => 0,
            'fertig'     => false,
            'vortrag'    => false,
            'beginn'     => time(),
        ];
        $ergebnis = ['id' => $neueId, 'person' => $person, 'mitglieder' => [$name], 'platz' => 1];
        return $d;
    });
    if ($ergebnis === null) {
        http_response_code(409);
        echo json_encode(['fehler' => 'Es sind schon sehr viele Gruppen eingetragen.']);
        exit;
    }
    echo json_encode($ergebnis);
    exit;
}

/* Fragt ein Gerät, ob die Gruppe inzwischen vollständig ist */
if ($aktion === 'gruppe') {
    $id = (string) ($gesendet['id'] ?? $_GET['id'] ?? '');
    foreach (lesen()['gruppen'] as $g) {
        if (($g['id'] ?? '') === $id) {
            echo json_encode([
                'id'         => $g['id'],
                'person'     => (int) $g['person'],
                'mitglieder' => $g['mitglieder'] ?? [],
                'fertig'     => (bool) ($g['fertig'] ?? false),
                'punkte'     => (int) ($g['punkte'] ?? 0),
                'ergebnisse' => $g['ergebnisse'] ?? [],
            ]);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['fehler' => 'Diese Gruppe gibt es nicht mehr.']);
    exit;
}

if ($aktion === 'ergebnis') {
    $id = (string) ($gesendet['id'] ?? '');
    $platz = max(1, min(GRUPPENGROESSE, (int) ($gesendet['platz'] ?? 1)));
    $punkte = (int) ($gesendet['punkte'] ?? -1);
    $fehler = (int) ($gesendet['fehler'] ?? 0);
    if ($punkte < 0 || $punkte > 300 || $fehler < 0 || $fehler > 99) {
        http_response_code(400);
        echo json_encode(['fehler' => 'Unplausible Werte.']);
        exit;
    }
    $gefunden = false;
    $schon = false;
    $daten = aendern(static function (array $d) use ($id, $platz, $punkte, $fehler, &$gefunden, &$schon): array {
        foreach ($d['gruppen'] as &$g) {
            if (($g['id'] ?? '') !== $id) continue;
            $gefunden = true;
            $anzahl = max(1, count($g['mitglieder'] ?? [1]));
            $ergebnisse = $g['ergebnisse'] ?? [];
            // Jedes Mitglied spielt auf dem eigenen Gerät und schickt selbst ab
            if (isset($ergebnisse[$platz - 1]) && $ergebnisse[$platz - 1] !== null) {
                $schon = true;
            } else {
                $ergebnisse[$platz - 1] = [
                    'punkte' => $punkte,
                    'fehler' => $fehler,
                    'dauer'  => max(0, time() - (int) ($g['beginn'] ?? time())),
                ];
            }
            for ($i = 0; $i < $anzahl; $i++) {
                if (!array_key_exists($i, $ergebnisse)) $ergebnisse[$i] = null;
            }
            ksort($ergebnisse);
            $g['ergebnisse'] = $ergebnisse;

            // Gruppenwert: Schnitt der abgegebenen Durchläufe
            $abgegeben = array_values(array_filter($ergebnisse, static fn($e) => is_array($e)));
            $g['abgegeben'] = count($abgegeben);
            $g['punkte'] = $abgegeben
                ? (int) round(array_sum(array_column($abgegeben, 'punkte')) / count($abgegeben))
                : 0;
            $g['fehler'] = $abgegeben ? (int) array_sum(array_column($abgegeben, 'fehler')) : 0;
            $g['dauer']  = $abgegeben ? (int) max(array_column($abgegeben, 'dauer')) : 0;
            $g['fertig'] = count($abgegeben) >= $anzahl;
        }
        unset($g);
        return $d;
    });
    if (!$gefunden) {
        http_response_code(404);
        echo json_encode(['fehler' => 'Diese Gruppe ist nicht eingetragen.']);
        exit;
    }
    $stand = null;
    foreach ($daten['gruppen'] as $g) {
        if (($g['id'] ?? '') === $id) $stand = $g;
    }
    echo json_encode([
        'stand'      => $daten['stand'] ?? 0,
        'gruppen'    => array_values($daten['gruppen'] ?? []),
        'schon'      => $schon,
        'punkte'     => (int) ($stand['punkte'] ?? 0),
        'ergebnisse' => $stand['ergebnisse'] ?? [],
        'abgegeben'  => (int) ($stand['abgegeben'] ?? 0),
        'fertig'     => (bool) ($stand['fertig'] ?? false),
        'mitglieder' => $stand['mitglieder'] ?? [],
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($aktion === 'vortrag') {
    if (($gesendet['schluessel'] ?? '') !== SCHLUESSEL) {
        http_response_code(403);
        echo json_encode(['fehler' => 'Falscher Schlüssel.']);
        exit;
    }
    $id = (string) ($gesendet['id'] ?? '');
    antwort(aendern(static function (array $d) use ($id): array {
        foreach ($d['gruppen'] as &$g) {
            if (($g['id'] ?? '') === $id) $g['vortrag'] = !($g['vortrag'] ?? false);
        }
        unset($g);
        return $d;
    }));
}

http_response_code(400);
echo json_encode(['fehler' => 'Unbekannte Aktion.']);
