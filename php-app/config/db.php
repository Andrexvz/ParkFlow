<?php
/**
 * ParkFlow - Configuración y Conexión a Base de Datos MySQL
 * Servidor XAMPP
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Credenciales estándar de XAMPP
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'parkflow_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// Conexión PDO Singleton
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            die("<div style='font-family:sans-serif;padding:30px;max-width:600px;margin:50px auto;background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;color:#9f1239;'>
                <h2 style='margin-top:0;'>⚠️ Error de Conexión a MySQL en XAMPP</h2>
                <p>No se pudo conectar a la base de datos <strong>parkflow_db</strong>.</p>
                <p><strong>Detalle:</strong> " . htmlspecialchars($e->getMessage()) . "</p>
                <hr style='border:0;border-top:1px solid #fecdd3;margin:15px 0;'>
                <p style='font-size:13px;color:#475569;'>Asegúrate de que el servicio <strong>MySQL</strong> esté iniciado en el <em>XAMPP Control Panel</em>.</p>
            </div>");
        }
    }
    return $pdo;
}

// Formatear montos a pesos colombianos COP
function formatCOP($number) {
    return '$ ' . number_format((float)$number, 0, ',', '.') . ' COP';
}

// Redireccionar con mensaje flash
function flashRedirect($url, $message, $type = 'success') {
    $_SESSION['flash_message'] = $message;
    $_SESSION['flash_type'] = $type;
    header("Location: $url");
    exit(0);
}

// Obtener y limpiar mensaje flash
function getFlash() {
    if (isset($_SESSION['flash_message'])) {
        $msg = [
            'text' => $_SESSION['flash_message'],
            'type' => $_SESSION['flash_type'] ?? 'success'
        ];
        unset($_SESSION['flash_message'], $_SESSION['flash_type']);
        return $msg;
    }
    return null;
}

// Obtener usuario actualmente conectado (sesión)
function getCurrentUser() {
    $db = getDB();
    if (!isset($_SESSION['current_user_id'])) {
        // Por defecto: Andrés Charry (Operador)
        $stmt = $db->query("SELECT * FROM `users` WHERE `role` = 'OPERADOR' LIMIT 1");
        $user = $stmt->fetch();
        if (!$user) {
            $stmt = $db->query("SELECT * FROM `users` LIMIT 1");
            $user = $stmt->fetch();
        }
        if ($user) {
            $_SESSION['current_user_id'] = $user['id'];
        }
    }

    if (isset($_SESSION['current_user_id'])) {
        $stmt = $db->prepare("SELECT * FROM `users` WHERE `id` = ?");
        $stmt->execute([$_SESSION['current_user_id']]);
        return $stmt->fetch();
    }

    return null;
}
