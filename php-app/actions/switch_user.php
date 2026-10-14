<?php
require_once __DIR__ . '/../config/db.php';
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['user_id'])) {
    $userId = $_POST['user_id'];
    $stmt = $db->prepare("SELECT * FROM `users` WHERE `id` = ? AND `active` = 1");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if ($user) {
        $_SESSION['current_user_id'] = $user['id'];
        flashRedirect('../index.php?view=' . ($user['role'] === 'ADMIN' ? 'dashboard' : 'map'), "Sesión cambiada a: {$user['name']} ({$user['role']})", 'success');
    }
}

header('Location: ../index.php');
exit(0);
