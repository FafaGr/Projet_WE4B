<?php
// ============================================================
// api/track-action.php  —  À placer dans htdocs/WE4B/api/
// ============================================================

header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Inclure l'autoloader de Composer (indispensable pour utiliser MongoDB\Client)
require 'vendor/autoload.php'; 

try {
    // Connexion au serveur MongoDB local
    $mongoClient = new MongoDB\Client("mongodb://localhost:27017");
    $collection = $mongoClient->gamestore_nosql->logs_actions;

    // Récupération du flux JSON envoyé par Angular
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Vérification minimale : il nous faut au moins un type d'action
    if (isset($data['type_action'])) {
        
        // Construction du document NoSQL standardisé
        $document = [
            'type_action' => $data['type_action'],                    // ex: 'view_page', 'add_to_cart', 'click_banner'
            'id_jeu'      => isset($data['id_jeu']) ? (int)$data['id_jeu'] : null,   // Optionnel
            'id_user'     => isset($data['id_user']) ? (int)$data['id_user'] : null, // Optionnel (si connecté)
            'details'     => isset($data['details']) ? $data['details'] : null,       // Infos sup (ex: { provenance: 'search' })
            'date_action' => new MongoDB\BSON\UTCDateTime(new DateTime()) // Date et heure de l'enregistrement
        ];

        // Insertion dans MongoDB
        $collection->insertOne($document);

        echo json_encode(['success' => true, 'message' => 'Interaction sauvegardée !']);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Champs "type_action" manquant.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur MongoDB : ' . $e->getMessage()]);
}