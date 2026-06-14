<?php
// ============================================================
// api/game-detail.php  —  À placer dans htdocs/WE4B/api/
// ============================================================

header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

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

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

try {
    $sqlJeu = "SELECT j.*, GROUP_CONCAT(c.libelle SEPARATOR ', ') AS categories_noms
               FROM jeux j
               LEFT JOIN categories_jeux cj ON j.id_jeu = cj.id_jeu
               LEFT JOIN categories c       ON cj.id_categorie = c.id_cat
               WHERE j.id_jeu = ?
               GROUP BY j.id_jeu";
    
    $stmtJeu = $pdo->prepare($sqlJeu);
    $stmtJeu->execute([$id]);
    $jeu = $stmtJeu->fetch();

    if (!$jeu) {
        http_response_code(404);
        echo json_encode(['error' => 'Jeu introuvable']);
        exit;
    }

    $sqlPlats = "SELECT p.nom_plateforme
                 FROM plateforme p
                 INNER JOIN dispos_platforme dp ON p.id_plateforme = dp.id_plateforme
                 WHERE dp.id_jeux = ?";
    
    $stmtPlats = $pdo->prepare($sqlPlats);
    $stmtPlats->execute([$id]);
    $plateformes = $stmtPlats->fetchAll();

    $sqlAvis = "SELECT a.*, u.nom
                FROM avis a
                JOIN utilisateurs u ON a.id_utilisateur = u.id_user
                WHERE a.id_jeu = ?
                ORDER BY a.id_avis DESC";
    
    $stmtAvis = $pdo->prepare($sqlAvis);
    $stmtAvis->execute([$id]);
    $avis = $stmtAvis->fetchAll();

    $noteMoyenne = null;
        if (count($avis) > 0) {
            $somme = array_sum(array_column($avis, 'note'));
            $noteMoyenne = round($somme / count($avis), 1);
        }

    echo json_encode([
        'jeu' => $jeu,
        'plateformes' => $plateformes,
        'avis' => $avis,
        'noteMoyenne' => $noteMoyenne
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}