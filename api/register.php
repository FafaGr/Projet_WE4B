<?php
// api/register.php — À placer dans htdocs/WE4B/api/
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
    echo json_encode(['error' => 'Connexion BDD échouée']);
    exit;
}

$body      = json_decode(file_get_contents('php://input'), true);
$firstName = trim($body['firstName'] ?? '');
$lastName  = trim($body['lastName']  ?? '');
$email     = trim($body['email']     ?? '');
$password  = $body['password']       ?? '';
$confirm   = $body['confirmPassword'] ?? '';

$errors = [];

if (empty($firstName) || empty($lastName)) {
    $errors[] = "Le prénom et le nom sont obligatoires.";
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "L'adresse email n'est pas valide.";
}
if (strlen($password) < 8 || !preg_match('/[A-Z]/', $password)
    || !preg_match('/[a-z]/', $password) || !preg_match('/[0-9]/', $password)) {
    $errors[] = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.";
}
if ($password !== $confirm) {
    $errors[] = "Les mots de passe ne correspondent pas.";
}

if (empty($errors)) {
    $check = $pdo->prepare("SELECT id_user FROM utilisateurs WHERE email = ?");
    $check->execute([$email]);
    if ($check->fetch()) {
        $errors[] = "Cette adresse email est déjà utilisée.";
    }
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['errors' => $errors]);
    exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$nom  = $firstName . ' ' . $lastName;
$stmt = $pdo->prepare("INSERT INTO utilisateurs (nom, email, password, role) VALUES (:nom, :email, :password, 'client')");
$stmt->execute([':nom' => $nom, ':email' => $email, ':password' => $hash]);

echo json_encode(['success' => true]);
