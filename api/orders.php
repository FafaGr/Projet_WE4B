<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

define('DB_HOST', 'localhost');
define('DB_NAME', 'gamestore_db'); 
define('DB_USER', 'root');
define('DB_PASS', '');

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Connexion BDD échouée : ' . $e->getMessage()]);
    exit;
}

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if ($userId > 0) {
    // Mode Historique Utilisateur classique
    $stmt = $pdo->prepare(
        "SELECT c.id_com, c.qty, c.date_com,
                j.titre AS jeu_titre, j.prix AS jeu_prix, j.image_url,
                (c.qty * j.prix) AS total_ligne
         FROM commandes c
         JOIN jeux j ON j.id_jeu = c.id_jeu
         WHERE c.id_user = ?
         ORDER BY c.date_com DESC"
    );
    $stmt->execute([$userId]);
} else {
    
    $stmt = $pdo->query(
        "SELECT c.id_com, c.qty, c.date_com,
                j.titre AS jeu_titre, j.prix AS jeu_prix, j.image_url,
                (c.qty * j.prix) AS total_ligne,
                u.nom AS user_nom, u.email AS user_email
         FROM commandes c
         JOIN jeux j ON j.id_jeu = c.id_jeu
         JOIN utilisateurs u ON u.id_user = c.id_user
         ORDER BY c.date_com DESC"
    );
}

echo json_encode($stmt->fetchAll());