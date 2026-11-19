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
const PERSONEN      = 6;
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
    $name = trim((string) ($gesendet['gruppe'] ?? ''));
    $name = preg_replace('/[\x00-\x1F\x7F]/u', '', $name) ?? '';
    $name = function_exists('mb_substr') ? mb_substr($name, 0, MAX_NAME, 'UTF-8') : substr($name, 0, MAX_NAME);
    if ($name === '') {
        http_response_code(400);
        echo json_encode(['fehler' => 'Ohne Namen geht es nicht.']);
        exit;
    }
    $id = bin2hex(random_bytes(6));
    $person = null;
    aendern(static function (array $d) use ($name, $id, &$person): array {
        if (count($d['gruppen']) >= MAX_GRUPPEN) return $d;
        // Reihum: die Person mit den wenigsten Gruppen bekommt die nächste
        $zaehler = array_fill(0, PERSONEN, 0);
        foreach ($d['gruppen'] as $g) {
            $p = (int) ($g['person'] ?? 0);
            if ($p >= 0 && $p < PERSONEN) $zaehler[$p]++;
        }
        $person = (int) array_search(min($zaehler), $zaehler, true);
        $d['gruppen'][] = [
            'id'       => $id,
            'name'     => $name,
            'person'   => $person,
            'punkte'   => 0,
            'fehler'   => 0,
            'fertig'   => false,
            'vortrag'  => false,
            'beginn'   => time(),
        ];
        return $d;
    });
    if ($person === null) {
        http_response_code(409);
        echo json_encode(['fehler' => 'Es sind schon sehr viele Gruppen eingetragen.']);
        exit;
    }
    echo json_encode(['id' => $id, 'person' => $person]);
    exit;
}

if ($aktion === 'ergebnis') {
    $id = (string) ($gesendet['id'] ?? '');
    $punkte = (int) ($gesendet['punkte'] ?? -1);
    $fehler = (int) ($gesendet['fehler'] ?? 0);
    if ($punkte < 0 || $punkte > 300 || $fehler < 0 || $fehler > 99) {
        http_response_code(400);
        echo json_encode(['fehler' => 'Unplausible Werte.']);
        exit;
    }
    $gefunden = false;
    $daten = aendern(static function (array $d) use ($id, $punkte, $fehler, &$gefunden): array {
        foreach ($d['gruppen'] as &$g) {
            if (($g['id'] ?? '') === $id) {
                $g['punkte'] = $punkte;
                $g['fehler'] = $fehler;
                $g['fertig'] = true;
                $g['dauer']  = max(0, time() - (int) ($g['beginn'] ?? time()));
                $gefunden = true;
            }
        }
        unset($g);
        return $d;
    });
    if (!$gefunden) {
        http_response_code(404);
        echo json_encode(['fehler' => 'Diese Gruppe ist nicht eingetragen.']);
        exit;
    }
    antwort($daten);
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
