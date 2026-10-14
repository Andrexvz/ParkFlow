<?php
/**
 * ParkFlow - Endpoint de Verificación de Salud y Diagnóstico
 * GET /api/health.php
 */

require_once __DIR__ . '/../config/db.php';

try {
    $pdo = getDbConnection(true);
    
    // Obtener tablas existentes
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $counts = [];
    if (in_array('users', $tables)) {
        $counts['users'] = (int)$pdo->query("SELECT COUNT(*) FROM `users`")->fetchColumn();
    }
    if (in_array('parking_spaces', $tables)) {
        $counts['spaces'] = (int)$pdo->query("SELECT COUNT(*) FROM `parking_spaces`")->fetchColumn();
    }
    if (in_array('rates', $tables)) {
        $counts['rates'] = (int)$pdo->query("SELECT COUNT(*) FROM `rates`")->fetchColumn();
    }
    if (in_array('movements', $tables)) {
        $counts['movements'] = (int)$pdo->query("SELECT COUNT(*) FROM `movements`")->fetchColumn();
        $counts['activeMovements'] = (int)$pdo->query("SELECT COUNT(*) FROM `movements` WHERE `status` = 'activo'")->fetchColumn();
    }

    jsonResponse([
        'success' => true,
        'status' => 'online',
        'service' => 'ParkFlow PHP Backend (XAMPP)',
        'php_version' => PHP_VERSION,
        'database' => [
            'connected' => true,
            'name' => DB_NAME,
            'host' => DB_HOST,
            'port' => DB_PORT,
            'tables_found' => count($tables),
            'tables' => $tables,
            'counts' => $counts
        ],
        'timestamp' => date('c')
    ]);

} catch (Exception $e) {
    jsonError('Error al conectar con la base de datos MySQL en XAMPP', 500, [
        'message' => $e->getMessage()
    ]);
}
