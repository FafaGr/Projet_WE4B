<?php
// Headers CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "localhost";
$db_name = "gamestore_db";
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

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['titre'])) {
    try {
        $pdo->beginTransaction(); // Début de la transaction pour sécuriser toutes les écritures

        // 1. Insertion du jeu dans la table 'jeux' (conforme au schéma SQL sans la colonne plateforme obsolète)
        $query = "INSERT INTO jeux (titre, description, prix, stock, note, image_url, ancien_prix, nouveau) 
                  VALUES (:titre, :description, :prix, :stock, :note, :image_url, :ancien_prix, :nouveau)";
        
        $stmt = $pdo->prepare($query);

        $stmt->bindValue(':titre', htmlspecialchars(strip_tags($data['titre'])));
        $stmt->bindValue(':description', !empty($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : null);
        $stmt->bindValue(':prix', isset($data['prix']) ? floatval($data['prix']) : 0.00);
        $stmt->bindValue(':stock', isset($data['stock']) ? intval($data['stock']) : 0);
        $stmt->bindValue(':note', 0); // Note par défaut
        $stmt->bindValue(':image_url', !empty($data['image_url']) ? htmlspecialchars(strip_tags($data['image_url'])) : null);
        $stmt->bindValue(':ancien_prix', !empty($data['ancien_prix']) ? floatval($data['ancien_prix']) : null);
        $stmt->bindValue(':nouveau', isset($data['nouveau']) ? intval($data['nouveau']) : 0);

        $stmt->execute();
        $last_id = $pdo->lastInsertId();

        // 2. Insertion des catégories sélectionnées (Plusieurs choix) dans la table pivot 'categories_jeux'
        if (!empty($data['id_categories']) && is_array($data['id_categories'])) {
            $query_cat = "INSERT INTO categories_jeux (id_jeu, id_categorie) VALUES (:id_jeu, :id_categorie)";
            $stmt_cat = $pdo->prepare($query_cat);
            foreach ($data['id_categories'] as $id_cat) {
                $stmt_cat->execute([
                    ':id_jeu' => $last_id,
                    ':id_categorie' => (int)$id_cat
                ]);
            }
        }

        // 3. Insertion des plateformes sélectionnées (Plusieurs choix) dans la table pivot 'dispos_platforme'
        if (!empty($data['id_plateformes']) && is_array($data['id_plateformes'])) {
            $query_plat = "INSERT INTO dispos_platforme (id_jeux, id_plateforme) VALUES (:id_jeu, :id_plateforme)";
            $stmt_plat = $pdo->prepare($query_plat);
            foreach ($data['id_plateformes'] as $id_plat) {
                $stmt_plat->execute([
                    ':id_jeu' => $last_id,
                    ':id_plateforme' => (int)$id_plat
                ]);
            }
        }

        $pdo->commit(); // On applique la transaction globale

        // 4. Récupération complète du jeu pour rafraîchir l'interface Angular
        $query_select = "SELECT j.*, GROUP_CONCAT(DISTINCT c.libelle SEPARATOR ', ') AS categories_noms
                         FROM jeux j 
                         LEFT JOIN categories_jeux cj ON j.id_jeu = cj.id_jeu
                         LEFT JOIN categories c ON cj.id_categorie = c.id_cat
                         WHERE j.id_jeu = :id
                         GROUP BY j.id_jeu";
                         
        $stmt_select = $pdo->prepare($query_select);
        $stmt_select->execute([':id' => $last_id]);
        $new_game = $stmt_select->fetch(PDO::FETCH_ASSOC);

        // Casts de types pour la conformité JSON d'Angular
        $new_game['prix'] = floatval($new_game['prix']);
        $new_game['ancien_prix'] = $new_game['ancien_prix'] !== null ? floatval($new_game['ancien_prix']) : null;
        $new_game['stock'] = intval($new_game['stock']);

        http_response_code(201);
        echo json_encode([
            "success" => true,
            "jeu" => $new_game
        ]);

    } catch (PDOException $e) {
        $pdo->rollBack(); // Annulation complète en cas de crash
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Erreur SQL : " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Données incomplètes. Le titre est requis."]);
}
?>