<?php
/**
 * ParkFlow - Conexión a Base de Datos MySQL y Configuración de API
 * Optimizado para XAMPP (Apache + MySQL/MariaDB)
 */

// Encabezados CORS universales para permitir peticiones desde Vite (localhost:3000 / localhost:5173)
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
} else {
    header("Access-Control-Allow-Origin: *");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    http_response_code(200);
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

// Configuración de credenciales de XAMPP por defecto
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'parkflow_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');

/**
 * Obtener conexión PDO a MySQL
 * @param bool $selectDatabase Si es false, conecta al servidor MySQL sin seleccionar la base de datos (para crearla si no existe)
 * @return PDO
 */
function getDbConnection($selectDatabase = true) {
    try {
        if ($selectDatabase) {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        } else {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
        }

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ];

        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error de conexión a la base de datos MySQL en XAMPP: ' . $e->getMessage(),
            'code' => $e->getCode(),
            'hint' => 'Asegúrese de que el servicio MySQL esté iniciado en el panel de control de XAMPP.'
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit(1);
    }
}

/**
 * Enviar respuesta JSON estandarizada y terminar ejecución
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit(0);
}

/**
 * Enviar respuesta de error estandarizada
 */
function jsonError($message, $statusCode = 400, $details = null) {
    http_response_code($statusCode);
    $response = [
        'success' => false,
        'error' => $message
    ];
    if ($details !== null) {
        $response['details'] = $details;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit(0);
}

/**
 * Obtener el cuerpo de la petición (JSON payload)
 */
function getRequestBody() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}
