<?php
// ============================================================
// api/update-game.php  —  À placer dans htdocs/WE4B/api/
// Permet à l'admin de modifier les infos d'un jeu existant
// (titre, description, prix, ancien prix, stock, image)
// ============================================================

header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Pré-vol OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// On n'accepte que PUT (ou POST en secours si besoin)
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// --- Connexion BDD (identique aux autres endpoints) ---
define('DB_HOST',    'localhost');
define('DB_NAME',    'gamestore_db');
define('DB_USER',    'root');
define('DB_PASS',    '');
define('DB_CHARSET', 'utf8');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE,            PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Connexion échouée : ' . $e->getMessage()]);
    exit;
}

// --- Lecture du corps JSON envoyé par Angular ---
$data = json_decode(file_get_contents('php://input'), true);

if (!is_array($data) || !isset($data['id_jeu'])) {
    http_response_code(400);
    echo json_encode(['error' => 'id_jeu manquant ou JSON invalide']);
    exit;
}

$id = (int) $data['id_jeu'];

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'id_jeu invalide']);
    exit;
}

// --- Liste blanche des colonnes que l'admin peut modifier ---
// ⚠️ Adapte ces noms de colonnes si ta table "jeux" utilise d'autres noms.
$champsAutorises = ['titre', 'description', 'prix', 'ancien_prix', 'stock', 'image'];

$sets   = [];
$params = [':id' => $id];

foreach ($champsAutorises as $champ) {
    if (array_key_exists($champ, $data)) {
        $valeur = $data[$champ];

        // Normalisation simple des types numériques / vides
        if (in_array($champ, ['prix', 'ancien_prix'], true)) {
            $valeur = ($valeur === '' || $valeur === null) ? null : (float) $valeur;
        }
        if ($champ === 'stock') {
            $valeur = (int) $valeur;
        }

        $sets[]            = "$champ = :$champ";
        $params[":$champ"] = $valeur;
    }
}

if (empty($sets)) {
    http_response_code(400);
    echo json_encode(['error' => 'Aucun champ valide à mettre à jour']);
    exit;
}

try {
    // Vérifie que le jeu existe
    $check = $pdo->prepare("SELECT id_jeu FROM jeux WHERE id_jeu = :id");
    $check->execute([':id' => $id]);
    if (!$check->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Jeu introuvable']);
        exit;
    }

    $sql  = "UPDATE jeux SET " . implode(', ', $sets) . " WHERE id_jeu = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Renvoie le jeu mis à jour (utile pour rafraîchir le front sans tout recharger)
    $stmtJeu = $pdo->prepare("SELECT j.*, GROUP_CONCAT(c.libelle SEPARATOR ', ') AS categories_noms
                               FROM jeux j
                               LEFT JOIN categories_jeux cj ON j.id_jeu = cj.id_jeu
                               LEFT JOIN categories c       ON cj.id_categorie = c.id_cat
                               WHERE j.id_jeu = :id
                               GROUP BY j.id_jeu");
    $stmtJeu->execute([':id' => $id]);
    $jeu = $stmtJeu->fetch();

    echo json_encode([
        'success' => true,
        'jeu'     => $jeu,
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
