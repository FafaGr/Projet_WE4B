<?php
// ============================================================
// api/games-trending.php  —  À placer dans htdocs/WE4B/api/
// ============================================================

header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require 'vendor/autoload.php';

define('DB_HOST',    'localhost');
define('DB_NAME',    'gamestore_db'); 
define('DB_USER',    'root');
define('DB_PASS',    '');
define('DB_CHARSET', 'utf8');

try {
    // 1. Connexion à MongoDB et Agrégation des tendances
    $mongoClient = new MongoDB\Client("mongodb://localhost:27017");
    $collection = $mongoClient->gamestore_nosql->logs_actions;

    // Pipeline d'agrégation NoSQL pour récupérer le Top 3 des clics 'view_page'
    $pipeline = [
        ['$match' => ['type_action' => 'view_page']], 
        ['$group' => ['_id' => '$id_jeu', 'count' => ['$sum' => 1]]], 
        ['$sort'  => ['count' => -1]], 
        ['$limit' => 3] // ← STRICTEMENT LIMITÉ AUX 3 JEUX LES PLUS VISITÉS
    ];

    $trendingResults = $collection->aggregate($pipeline);
    
    $trendingIds = [];
    foreach ($trendingResults as $result) {
        if ($result['_id'] !== null) {
            $trendingIds[] = (int)$result['_id'];
        }
    }

    // Si aucun log n'existe, on renvoie un tableau vide
    if (empty($trendingIds)) {
        echo json_encode([]);
        exit;
    }

    // 2. Connexion à MySQL pour récupérer les fiches de ces 3 jeux précis
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $inClause = implode(',', array_fill(0, count($trendingIds), '?'));
    $sql = "SELECT j.*, GROUP_CONCAT(c.libelle SEPARATOR ', ') AS categories_noms
            FROM jeux j
            LEFT JOIN categories_jeux cj ON j.id_jeu = cj.id_jeu
            LEFT JOIN categories c       ON cj.id_categorie = c.id_cat
            WHERE j.id_jeu IN ($inClause)
            GROUP BY j.id_jeu";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($trendingIds);
    $games = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Tri pour respecter l'ordre exact de popularité calculé par MongoDB
    usort($games, function($a, $b) use ($trendingIds) {
        return array_search($a['id_jeu'], $trendingIds) - array_search($b['id_jeu'], $trendingIds);
    });

    echo json_encode($games, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur : ' . $e->getMessage()]);
}