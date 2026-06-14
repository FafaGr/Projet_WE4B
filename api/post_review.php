<?php
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=gamestore_db;charset=utf8",
        "root",
        ""
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Connexion échouée']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id_utilisateur'], $data['id_jeu'], $data['com'], $data['note'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Données manquantes']);
    exit;
}

$note = (int) $data['note'];
if ($note < 1 || $note > 5) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Note invalide']);
    exit;
}

$check = $pdo->prepare('SELECT id_avis FROM avis WHERE id_utilisateur = ? AND id_jeu = ?');
$check->execute([(int) $data['id_utilisateur'], (int) $data['id_jeu']]);

if ($check->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'error' => 'Vous avez déjà posté un avis pour ce jeu.']);
    exit;
}

$stmt = $pdo->prepare(
    'INSERT INTO avis (id_utilisateur, id_jeu, com, note) VALUES (?, ?, ?, ?)'
);
$stmt->execute([
    (int) $data['id_utilisateur'],
    (int) $data['id_jeu'],
    trim($data['com']),
    $note
]);

$stmtMoy = $pdo->prepare(
    'UPDATE jeux SET note = (
        SELECT AVG(note) FROM avis WHERE id_jeu = ?
    ) WHERE id_jeu = ?'
);
$stmtMoy->execute([(int) $data['id_jeu'], (int) $data['id_jeu']]);

echo json_encode(['success' => true]);
