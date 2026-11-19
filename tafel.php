<?php
/*
 * tafel.php — Sammelstelle für die Bestenliste der Klasse.
 *
 * Die Geräte der Schülerinnen und Schüler schicken ihr Ergebnis am Ende des
 * Spiels hierher; die Tafelansicht fragt die Liste alle paar Sekunden ab.
 * Gespeichert wird in einer einfachen JSON-Datei daneben — keine Datenbank.
 *
 * Aufrufe:
 *   GET  tafel.php                 → aktuelle Liste
 *   GET  tafel.php?stand=12        → nur antworten, wenn sich etwas geändert hat
 *   POST tafel.php                 → ein Ergebnis eintragen (JSON im Rumpf)
 *   POST tafel.php?aktion=neu      → Liste leeren (braucht den Schlüssel)
 *
 * Vor dem ersten Einsatz den Schlüssel ändern. Er schützt nur das Leeren der
 * Liste, damit niemand sie mitten in der Stunde löscht.
 */

declare(strict_types=1);

const SCHLUESSEL     = 'bbs-tafel';                      // bitte ändern
const DATEI          = __DIR__ . '/bestenliste.json';
const MAX_EINTRAEGE  = 400;
const MAX_NAME       = 22;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/* --- Ergebnis-Code nachrechnen (gleiche Regel wie im Spiel) ------------- */

function basis36(int $wert, int $stellen): string {
    $grenze = (int) pow(36, $stellen) - 1;
    $wert = max(0, min($grenze, $wert));
    return str_pad(strtoupper(base_convert((string) $wert, 10, 36)), $stellen, '0', STR_PAD_LEFT);
}

function ergebnisCode(int $punkte, int $fehler, int $sekunden): string {
    $kern = basis36($punkte, 3) . basis36($fehler, 2) . basis36($sekunden, 3);
    $summe = 0;
    foreach (str_split($kern) as $zeichen) {
        $summe += (int) base_convert($zeichen, 36, 10);
    }
    return $kern . strtoupper(base_convert((string) ($summe % 36), 10, 36));
}

/* --- Datei lesen und schreiben, gegen gleichzeitige Zugriffe gesichert -- */

function leereListe(): array {
    return ['runde' => 1, 'stand' => 0, 'eintraege' => []];
}

function listeLesen(): array {
    if (!is_file(DATEI)) {
        return leereListe();
    }
    $roh = @file_get_contents(DATEI);
    $daten = json_decode((string) $roh, true);
    if (!is_array($daten) || !isset($daten['eintraege']) || !is_array($daten['eintraege'])) {
        return leereListe();
    }
    return $daten;
}

/** Liest, verändert und schreibt die Liste unter exklusiver Sperre. */
function listeAendern(callable $aendern): array {
    $datei = @fopen(DATEI, 'c+');
    if ($datei === false) {
        http_response_code(500);
        echo json_encode(['fehler' => 'Die Datei bestenliste.json kann nicht angelegt werden. '
            . 'Schreibrechte für den Ordner prüfen.']);
        exit;
    }
    flock($datei, LOCK_EX);
    $inhalt = stream_get_contents($datei);
    $daten = json_decode((string) $inhalt, true);
    if (!is_array($daten) || !isset($daten['eintraege']) || !is_array($daten['eintraege'])) {
        $daten = leereListe();
    }
    $daten = $aendern($daten);
    $daten['stand'] = ((int) ($daten['stand'] ?? 0)) + 1;

    ftruncate($datei, 0);
    rewind($datei);
    fwrite($datei, json_encode($daten, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    fflush($datei);
    flock($datei, LOCK_UN);
    fclose($datei);
    return $daten;
}

function sortieren(array $eintraege): array {
    usort($eintraege, static function (array $a, array $b): int {
        return [$b['punkte'], $a['sekunden'], $a['fehler']] <=> [$a['punkte'], $b['sekunden'], $b['fehler']];
    });
    return $eintraege;
}

function antworten(array $daten): void {
    echo json_encode([
        'runde'     => $daten['runde'] ?? 1,
        'stand'     => $daten['stand'] ?? 0,
        'eintraege' => sortieren($daten['eintraege'] ?? []),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/* --- Anfragen beantworten ---------------------------------------------- */

$methode = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($methode === 'GET') {
    $daten = listeLesen();
    $bekannt = isset($_GET['stand']) ? (int) $_GET['stand'] : -1;
    if ($bekannt >= 0 && $bekannt === (int) ($daten['stand'] ?? 0)) {
        echo json_encode(['stand' => $bekannt, 'unveraendert' => true]);
        exit;
    }
    antworten($daten);
}

if ($methode !== 'POST') {
    http_response_code(405);
    echo json_encode(['fehler' => 'Nur GET und POST.']);
    exit;
}

$rumpf = file_get_contents('php://input');
$gesendet = json_decode((string) $rumpf, true);
if (!is_array($gesendet)) {
    $gesendet = $_POST;
}

/* Liste leeren — nur mit Schlüssel */
if (($_GET['aktion'] ?? '') === 'neu') {
    if (($gesendet['schluessel'] ?? '') !== SCHLUESSEL) {
        http_response_code(403);
        echo json_encode(['fehler' => 'Falscher Schlüssel.']);
        exit;
    }
    $daten = listeAendern(static function (array $daten): array {
        $daten['runde'] = ((int) ($daten['runde'] ?? 1)) + 1;
        $daten['eintraege'] = [];
        return $daten;
    });
    antworten($daten);
}

/* Ergebnis eintragen */
$name = trim((string) ($gesendet['name'] ?? ''));
$name = preg_replace('/[\x00-\x1F\x7F]/u', '', $name) ?? '';
if (function_exists('mb_substr')) {
    $name = mb_substr($name, 0, MAX_NAME, 'UTF-8');
} else {
    $name = substr($name, 0, MAX_NAME);
}
$punkte   = (int) ($gesendet['punkte'] ?? -1);
$fehler   = (int) ($gesendet['fehler'] ?? -1);
$sekunden = (int) ($gesendet['sekunden'] ?? -1);
$code     = strtoupper(trim((string) ($gesendet['code'] ?? '')));

if ($name === '') {
    http_response_code(400);
    echo json_encode(['fehler' => 'Ohne Namen geht es nicht.']);
    exit;
}
if ($punkte < 0 || $punkte > 46655 || $fehler < 0 || $fehler > 1295 || $sekunden < 0 || $sekunden > 46655) {
    http_response_code(400);
    echo json_encode(['fehler' => 'Unplausible Werte.']);
    exit;
}
if ($code !== ergebnisCode($punkte, $fehler, $sekunden)) {
    http_response_code(400);
    echo json_encode(['fehler' => 'Der Ergebnis-Code passt nicht zu den Werten.']);
    exit;
}

$daten = listeAendern(static function (array $daten) use ($name, $punkte, $fehler, $sekunden): array {
    $daten['eintraege'][] = [
        'id'        => bin2hex(random_bytes(5)),
        'name'      => $name,
        'punkte'    => $punkte,
        'fehler'    => $fehler,
        'sekunden'  => $sekunden,
        'zeitpunkt' => time(),
    ];
    if (count($daten['eintraege']) > MAX_EINTRAEGE) {
        $daten['eintraege'] = array_slice($daten['eintraege'], -MAX_EINTRAEGE);
    }
    return $daten;
});
antworten($daten);
