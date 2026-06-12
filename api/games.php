<?php
// ============================================================
// api/games.php  —  À placer dans htdocs/ton-projet/api/
// ============================================================

// --- CORS : autorise Angular (port 4200) à appeler cette API ---
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Pré-vol OPTIONS (navigateur envoie ça avant chaque requête cross-origin)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --- Connexion BDD (identique à ton config/database.php) ---
define('DB_HOST',    'localhost');
define('DB_NAME',    'gamestore_db');   // ← ton nom de base dans phpMyAdmin
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

// --- Lecture des filtres GET (même logique que ton GameModel::getAll) ---
$platform = $_GET['platform'] ?? null;
$catId    = isset($_GET['category']) ? (int)$_GET['category'] : 0;
$search   = isset($_GET['search'])   ? trim($_GET['search'])   : '';
$sort     = $_GET['sort'] ?? 'news';

// --- Construction de la requête (copie exacte de GameModel.php) ---
$sql = "SELECT j.*, GROUP_CONCAT(c.libelle SEPARATOR ', ') AS categories_noms
        FROM jeux j
        LEFT JOIN categories_jeux cj ON j.id_jeu = cj.id_jeu
        LEFT JOIN categories c       ON cj.id_categorie = c.id_cat
        LEFT JOIN dispos_platforme pj ON j.id_jeu = pj.id_jeux
        LEFT JOIN plateforme p        ON pj.id_plateforme = p.id_plateforme";

$conditions = [];
$params     = [];

if ($platform === 'PC') {
    $conditions[] = "p.nom_plateforme = 'PC'";
} elseif ($platform === 'Console') {
    $conditions[] = "p.nom_plateforme != 'PC'";
}

if ($catId > 0) {
    $conditions[] = "j.id_jeu IN (SELECT id_jeu FROM categories_jeux WHERE id_categorie = :cat_id)";
    $params[':cat_id'] = $catId;
}

if ($search !== '') {
    $conditions[] = "j.titre LIKE :search";
    $params[':search'] = '%' . $search . '%';
}

if (!empty($conditions)) {
    $sql .= " WHERE " . implode(" AND ", $conditions);
}

$sql .= " GROUP BY j.id_jeu";

switch ($sort) {
    case 'price-asc':  $sql .= " ORDER BY j.prix ASC";  break;
    case 'price-desc': $sql .= " ORDER BY j.prix DESC"; break;
    default:           $sql .= " ORDER BY j.id_jeu DESC"; break;
}

// --- Exécution et réponse JSON ---
try {
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    $games = $stmt->fetchAll();

    echo json_encode($games, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
