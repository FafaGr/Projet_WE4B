<?php
// Headers CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

// Récupérer le JSON d'Angular
$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['titre'])) {
    try {
        // SQL basé exactement sur tes colonnes : id_jeu, titre, description, prix, stock, note, image_url, ancien_prix, nouveau
        $query = "INSERT INTO jeux (titre, description, prix, stock, note, image_url, ancien_prix, nouveau) 
                  VALUES (:titre, :description, :prix, :stock, :note, :image_url, :ancien_prix, :nouveau)";
        
        $stmt = $pdo->prepare($query);

        $stmt->bindValue(':titre', htmlspecialchars(strip_tags($data['titre'])));
        $stmt->bindValue(':description', !empty($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : null);
        $stmt->bindValue(':prix', isset($data['prix']) ? floatval($data['prix']) : 0.00);
        $stmt->bindValue(':stock', isset($data['stock']) ? intval($data['stock']) : 0);
        $stmt->bindValue(':note', 0); // Forcé à 0 pour respecter le "NOT NULL" sans planter à la création
        $stmt->bindValue(':image_url', !empty($data['image_url']) ? htmlspecialchars(strip_tags($data['image_url'])) : null);
        $stmt->bindValue(':ancien_prix', !empty($data['ancien_prix']) ? floatval($data['ancien_prix']) : null);
        $stmt->bindValue(':nouveau', isset($data['nouveau']) ? intval($data['nouveau']) : 0);

        if ($stmt->execute()) {
            $last_id = $pdo->lastInsertId();

            // Récupérer le jeu créé pour la réponse Angular
            $query_select = "SELECT id_jeu, titre, description, prix, stock, note, image_url, ancien_prix, nouveau FROM jeux WHERE id_jeu = :id";
            $stmt_select = $pdo->prepare($query_select);
            $stmt_select->execute([':id' => $last_id]);
            $new_game = $stmt_select->fetch(PDO::FETCH_ASSOC);

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "jeu" => $new_game
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Impossible d'insérer le jeu."]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Erreur SQL : " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Données incomplètes. Le titre est requis."]);
}
?>