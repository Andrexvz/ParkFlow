<?php
/**
 * ParkFlow - API de Usuarios (Operadores y Administradores)
 * GET, POST, PUT /api/users.php
 */

require_once __DIR__ . '/../config/db.php';

$pdo = getDbConnection(true);
$method = $_SERVER['REQUEST_METHOD'];

function formatUserRow($row) {
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'email' => $row['email'],
        'role' => $row['role'],
        'shift' => $row['shift'],
        'active' => (bool)$row['active'],
        'avatarUrl' => $row['avatar_url']
    ];
}

switch ($method) {
    case 'GET':
        // Listar todos los usuarios
        $stmt = $pdo->query("SELECT * FROM `users` ORDER BY `role` ASC, `name` ASC");
        $users = array_map('formatUserRow', $stmt->fetchAll());
        jsonResponse([
            'success' => true,
            'data' => $users
        ]);
        break;

    case 'POST':
        // Crear usuario
        $body = getRequestBody();
        $name = trim($body['name'] ?? '');
        $email = trim(strtolower($body['email'] ?? ''));
        $role = $body['role'] ?? 'OPERADOR';
        $shift = $body['shift'] ?? null;
        $active = isset($body['active']) ? ($body['active'] ? 1 : 0) : 1;
        $id = $body['id'] ?? ('usr-' . time());

        if (empty($name) || empty($email)) {
            jsonError('El nombre y el correo electrónico son obligatorios.');
        }

        // Verificar unicidad de correo
        $check = $pdo->prepare("SELECT id FROM `users` WHERE `email` = ?");
        $check->execute([$email]);
        if ($check->fetch()) {
            jsonError('Ya existe un usuario con este correo electrónico.');
        }

        $rawPassword = trim($body['password'] ?? '');
        if (empty($rawPassword)) {
            $rawPassword = ($role === 'ADMIN') ? 'Admin@ParkFlow2026' : ('Op#' . rand(1000, 9999));
        }
        $passwordHash = password_hash($rawPassword, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `shift`, `active`) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $name, $email, $passwordHash, $role, $shift, $active]);

        $created = $pdo->prepare("SELECT * FROM `users` WHERE `id` = ?");
        $created->execute([$id]);
        $userRow = $created->fetch();

        jsonResponse([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'data' => formatUserRow($userRow)
        ], 201);
        break;

    case 'PUT':
        // Actualizar usuario o alternar estado
        $body = getRequestBody();
        $id = $body['id'] ?? null;

        if (!$id) {
            jsonError('El ID del usuario es requerido.');
        }

        // Si es sólo toggle de active
        if (isset($body['toggleActive']) && $body['toggleActive']) {
            $stmt = $pdo->prepare("UPDATE `users` SET `active` = NOT `active` WHERE `id` = ?");
            $stmt->execute([$id]);
        } else {
            // Actualización completa
            $name = trim($body['name'] ?? '');
            $email = trim(strtolower($body['email'] ?? ''));
            $role = $body['role'] ?? 'OPERADOR';
            $shift = $body['shift'] ?? null;
            $active = isset($body['active']) ? ($body['active'] ? 1 : 0) : 1;

            if (empty($name) || empty($email)) {
                jsonError('El nombre y el correo son obligatorios.');
            }

            // Validar email único con otros usuarios
            $check = $pdo->prepare("SELECT id FROM `users` WHERE `email` = ? AND `id` != ?");
            $check->execute([$email, $id]);
            if ($check->fetch()) {
                jsonError('El correo electrónico ya está en uso por otro usuario.');
            }

            if (!empty($body['password'])) {
                $passwordHash = password_hash(trim($body['password']), PASSWORD_BCRYPT);
                $stmt = $pdo->prepare("UPDATE `users` SET `name` = ?, `email` = ?, `role` = ?, `shift` = ?, `active` = ?, `password` = ? WHERE `id` = ?");
                $stmt->execute([$name, $email, $role, $shift, $active, $passwordHash, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE `users` SET `name` = ?, `email` = ?, `role` = ?, `shift` = ?, `active` = ? WHERE `id` = ?");
                $stmt->execute([$name, $email, $role, $shift, $active, $id]);
            }
        }

        $updated = $pdo->prepare("SELECT * FROM `users` WHERE `id` = ?");
        $updated->execute([$id]);
        $userRow = $updated->fetch();

        if (!$userRow) {
            jsonError('Usuario no encontrado', 404);
        }

        jsonResponse([
            'success' => true,
            'message' => 'Usuario actualizado correctamente',
            'data' => formatUserRow($userRow)
        ]);
        break;

    default:
        jsonError("Método $method no permitido.", 405);
}
