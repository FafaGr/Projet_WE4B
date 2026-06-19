<?php
// ============================================================
// api/export-connections.php  —  À placer dans htdocs/WE4B/api/
// ============================================================

// Autoriser Power BI ou Excel à requêter ce script à distance
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json; charset=utf-8');

require 'vendor/autoload.php';

try {
    // 1. Connexion à MongoDB
    $mongoClient = new MongoDB\Client("mongodb://localhost:27017");
    $collection = $mongoClient->gamestore_nosql->logs_actions;

    // 2. Récupérer uniquement les connexions utilisateurs
    $filter = ['type_action' => 'user_login'];
    $options = ['sort' => ['date_action' => -1]]; // Du plus récent au plus ancien

    $cursor = $collection->find($filter, options: $options);

    $exportData = [];

    foreach ($cursor as $document) {
        // Conversion de la date UTC native MongoDB en objet DateTime PHP
        $utcdatetime = $document['date_action'];
        $dateTime = $utcdatetime->toDateTime();
        
        // Ajustement du fuseau horaire si nécessaire (ex: Europe/Paris)
        $dateTime->setTimezone(new DateTimeZone('Europe/Paris'));

        $exportData[] = [
            'id_log'     => (string)$document['_id'],
            'id_user'    => $document['id_user'],
            'nom'        => isset($document['details']['nom_utilisateur']) ? $document['details']['nom_utilisateur'] : 'Anonyme',
            'date_full'  => $dateTime->format('Y-m-d H:i:s'), // Format complet
            'date_jour'  => $dateTime->format('Y-m-d'),       // Pour ton analyse journalière dans Power BI
            'heure'      => $dateTime->format('H:i')          // Pour analyser les heures de pointe
        ];
    }

    // Renvoie le tableau JSON propre
    echo json_encode($exportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}