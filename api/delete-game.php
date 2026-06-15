<?php
// Headers CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Intercepter le Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "localhost";
$db_name = "gamestore_db"; // Base mise à jour
$username = "root";
$password = "";

try {
    $pdo = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Erreur BDD : " . $exception->getMessage()]);
    exit();
}

// Récupérer l'ID passé par Angular dans les paramètres d'URL (?id=XX)
$id_jeu = isset($_GET['id']) ? intval($_GET['id']) : null;

if ($id_jeu !== null && $id_jeu > 0) {
    try {
        // Suppression du jeu de la table principale
        $query = "DELETE FROM jeux WHERE id_jeu = :id";
        $stmt = $pdo->prepare($query);
        $stmt->bindValue(':id', $id_jeu, PDO::PARAM_INT);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Le jeu a bien été supprimé."
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "La suppression a échoué."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        // Renvoie un message explicite si le jeu est verrouillé par des commandes / catégories (Clé étrangère restriction)
        echo json_encode([
            "success" => false, 
            "message" => "Erreur SQL : " . $e->getMessage() . " (Vérifiez si le jeu n'est pas lié à des commandes ou catégories actives)."
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID de jeu manquant ou invalide."]);
}
?>