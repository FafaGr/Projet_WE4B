<?php
// api/checkout.php — À placer dans htdocs/WE4B/api/
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

define('DB_HOST', 'localhost');
define('DB_NAME', 'gamestore_db'); // ← ton nom de BDD
define('DB_USER', 'root');
define('DB_PASS', '');

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Connexion BDD échouée']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

// Angular envoie user_id directement (pas de session PHP côté SPA)
$userId = (int)($body['user_id'] ?? 0);
if ($userId <= 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Vous devez être connecté pour commander.']);
    exit;
}

$cart = $body['cart'] ?? null;
if (empty($cart) || !is_array($cart)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Panier vide ou invalide.']);
    exit;
}

foreach ($cart as $item) {
    if (empty($item['id']) || empty($item['quantity']) || (int)$item['quantity'] < 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Données du panier invalides.']);
        exit;
    }
}

try {
    $pdo->beginTransaction();

    foreach ($cart as $item) {
        $id  = (int)$item['id'];
        $qty = (int)$item['quantity'];

        $stmt = $pdo->prepare("SELECT stock FROM jeux WHERE id_jeu = ? FOR UPDATE");
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if (!$row) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => "Jeu introuvable (id=$id)."]);
            exit;
        }

        if ($row['stock'] < $qty) {
            $pdo->rollBack();
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'error'   => "Stock insuffisant pour « {$item['title']} » "
                           . "(demandé : $qty, disponible : {$row['stock']})."
            ]);
            exit;
        }

        $pdo->prepare(
            "INSERT INTO commandes (qty, date_com, id_user, id_jeu) VALUES (?, NOW(), ?, ?)"
        )->execute([$qty, $userId, $id]);

        $pdo->prepare(
            "UPDATE jeux SET stock = stock - ? WHERE id_jeu = ?"
        )->execute([$qty, $id]);
    }

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur base de données : ' . $e->getMessage()]);
}