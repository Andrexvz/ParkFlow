<?php
/**
 * ParkFlow - Instalador y Sembrador Automático de Base de Datos
 * GET/POST /api/setup.php
 */

require_once __DIR__ . '/../config/db.php';

try {
    // 1. Conectar a MySQL sin forzar la existencia previa de la base de datos
    $pdo = getDbConnection(false);

    // 2. Localizar el archivo SQL
    $sqlFile = __DIR__ . '/../../database/parkflow.sql';
    if (!file_exists($sqlFile)) {
        // Alternativa si se ejecuta desde htdocs directamente
        $sqlFile = __DIR__ . '/../database/parkflow.sql';
    }

    if (!file_exists($sqlFile)) {
        jsonError("No se encontró el archivo de esquema SQL en: $sqlFile", 404);
    }

    $sqlContent = file_get_contents($sqlFile);

    // 3. Ejecutar los comandos SQL
    // Separar por comandos delimitados por punto y coma respetando bloques
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `" . DB_NAME . "`;");

    // Ejecutar todo el script SQL
    $pdo->exec($sqlContent);

    // 4. Verificar tablas creadas y contar registros
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $summary = [];
    foreach ($tables as $t) {
        $count = $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
        $summary[$t] = (int)$count;
    }

    jsonResponse([
        'success' => true,
        'message' => '¡Base de datos parkflow_db y tablas MySQL inicializadas exitosamente en XAMPP!',
        'database' => DB_NAME,
        'tables_created' => $tables,
        'records' => $summary,
        'timestamp' => date('c')
    ]);

} catch (PDOException $e) {
    jsonError('Error al ejecutar la inicialización de la base de datos en XAMPP', 500, [
        'message' => $e->getMessage(),
        'hint' => 'Verifique que el servicio MySQL esté corriendo en XAMPP Control Panel.'
    ]);
}
