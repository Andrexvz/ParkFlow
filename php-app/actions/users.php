<?php
require_once __DIR__ . '/../config/db.php';
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php');
    exit(0);
}

$action = $_POST['action'] ?? '';

if ($action === 'create') {
    $name = trim($_POST['name'] ?? '');
    $email = trim(strtolower($_POST['email'] ?? ''));
    $role = $_POST['role'] ?? 'OPERADOR';
    $shift = $_POST['shift'] ?? null;

    if (empty($name) || empty($email)) {
        flashRedirect('../index.php?view=users', 'El nombre y correo electrónico son obligatorios.', 'error');
    }

    $check = $db->prepare("SELECT id FROM `users` WHERE `email` = ?");
    $check->execute([$email]);
    if ($check->fetch()) {
        flashRedirect('../index.php?view=users', 'Ya existe un usuario con este correo electrónico.', 'error');
    }

    $id = 'usr-' . time();
    $stmt = $db->prepare("INSERT INTO `users` (`id`, `name`, `email`, `role`, `shift`, `active`) VALUES (?, ?, ?, ?, ?, 1)");
    $stmt->execute([$id, $name, $email, $role, $shift]);

    flashRedirect('../index.php?view=users', 'Usuario creado exitosamente.', 'success');

} elseif ($action === 'toggle_active') {
    $userId = $_POST['user_id'] ?? '';
    $stmt = $db->prepare("UPDATE `users` SET `active` = NOT `active` WHERE `id` = ?");
    $stmt->execute([$userId]);

    flashRedirect('../index.php?view=users', 'Estado del usuario actualizado.', 'success');
}

flashRedirect('../index.php?view=users', 'Acción no válida.', 'error');
