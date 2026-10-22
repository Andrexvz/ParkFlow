<?php
/**
 * ParkFlow - API de Autenticación Segura y Control de Sesiones (JWT + Bcrypt)
 * POST /api/auth.php?action=login
 * GET  /api/auth.php?action=verify
 * POST /api/auth.php?action=logout
 */

require_once __DIR__ . '/../config/db.php';

// Clave secreta para firma de tokens JWT (configurable por entorno)
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'ParkFlow_Secret_Token_Sign_Key_2026_Neiva#Secure!');

$action = $_GET['action'] ?? 'login';
$method = $_SERVER['REQUEST_METHOD'];

/**
 * Función auxiliar para codificar en Base64Url (estándar RFC 7515 para JWT)
 */
function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Función auxiliar para decodificar Base64Url
 */
function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Generar Token JWT firmado con HMAC-SHA256
 */
function generateJwtToken($user) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $issuedAt = time();
    $expirationTime = $issuedAt + (60 * 60 * 12); // Válido por 12 horas (duración máxima de turno)

    $payload = json_encode([
        'sub' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'shift' => $user['shift'],
        'iat' => $issuedAt,
        'exp' => $expirationTime
    ]);

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Validar y extraer payload de un token JWT
 */
function verifyJwtToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }

    list($header64, $payload64, $signature64) = $parts;

    $signature = base64UrlDecode($signature64);
    $expectedSignature = hash_hmac('sha256', $header64 . "." . $payload64, JWT_SECRET, true);

    if (!hash_equals($expectedSignature, $signature)) {
        return false;
    }

    $payload = json_decode(base64UrlDecode($payload64), true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        return false; // Token expirado o payload inválido
    }

    return $payload;
}

switch ($action) {
    case 'login':
        if ($method !== 'POST') {
            jsonError('Método no permitido. Se requiere POST.', 405);
        }

        $body = getRequestBody();
        $email = trim(strtolower($body['email'] ?? ''));
        $password = trim($body['password'] ?? '');

        if (empty($email) || empty($password)) {
            jsonError('Debes ingresar tu correo y contraseña/PIN personal.', 400);
        }

        $pdo = getDbConnection(true);
        $stmt = $pdo->prepare("SELECT `id`, `name`, `email`, `password`, `role`, `shift`, `active`, `avatar_url` FROM `users` WHERE LOWER(`email`) = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonError('Credenciales inválidas. Usuario no registrado.', 401);
        }

        if (!(bool)$user['active']) {
            jsonError('Usuario inactivo en el sistema. Contacta al Administrador.', 403);
        }

        // Validación estricta con password_verify (Bcrypt) o compatibilidad
        $storedHash = $user['password'] ?? '';
        $isPasswordValid = false;

        if (password_verify($password, $storedHash)) {
            $isPasswordValid = true;
        } elseif ($password === $storedHash) {
            // Migración automática si estaba en texto plano: actualizar a Bcrypt
            $isPasswordValid = true;
            $newHash = password_hash($password, PASSWORD_BCRYPT);
            $upd = $pdo->prepare("UPDATE `users` SET `password` = ? WHERE `id` = ?");
            $upd->execute([$newHash, $user['id']]);
        }

        if (!$isPasswordValid) {
            jsonError('Contraseña o PIN incorrecto para este usuario.', 401);
        }

        // Generar token JWT individual
        $token = generateJwtToken($user);

        // Retornar datos seguros del usuario sin exponer el hash
        unset($user['password']);
        $user['active'] = (bool)$user['active'];
        $user['avatarUrl'] = $user['avatar_url'];
        unset($user['avatar_url']);

        jsonResponse([
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'token' => $token,
            'user' => $user
        ]);
        break;

    case 'verify':
    case 'me':
        // Extraer Bearer Token del encabezado Authorization
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (empty($authHeader) && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }

        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            jsonError('Token de autorización no suministrado.', 401);
        }

        $token = $matches[1];
        $payload = verifyJwtToken($token);

        if (!$payload) {
            jsonError('Sesión vencida o token no válido. Inicie sesión nuevamente.', 401);
        }

        // Consultar estado actual del usuario en base de datos
        $pdo = getDbConnection(true);
        $stmt = $pdo->prepare("SELECT `id`, `name`, `email`, `role`, `shift`, `active`, `avatar_url` FROM `users` WHERE `id` = ?");
        $stmt->execute([$payload['sub']]);
        $user = $stmt->fetch();

        if (!$user || !(bool)$user['active']) {
            jsonError('Usuario inexistente o inactivo.', 403);
        }

        $user['active'] = (bool)$user['active'];
        $user['avatarUrl'] = $user['avatar_url'];
        unset($user['avatar_url']);

        jsonResponse([
            'success' => true,
            'valid' => true,
            'user' => $user
        ]);
        break;

    case 'logout':
        jsonResponse([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente.'
        ]);
        break;

    default:
        jsonError("Acción '$action' no soportada.", 404);
}
