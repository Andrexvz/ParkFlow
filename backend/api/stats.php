<?php
/**
 * ParkFlow - API de Estadísticas y Métricas del Parqueadero
 * GET /api/stats.php
 */

require_once __DIR__ . '/../config/db.php';

$pdo = getDbConnection(true);

try {
    // 1. Estadísticas de Celdas
    $totalSpaces = (int)$pdo->query("SELECT COUNT(*) FROM `parking_spaces`")->fetchColumn();
    $occupiedSpaces = (int)$pdo->query("SELECT COUNT(*) FROM `parking_spaces` WHERE `status` = 'ocupado'")->fetchColumn();
    $freeSpaces = (int)$pdo->query("SELECT COUNT(*) FROM `parking_spaces` WHERE `status` = 'libre'")->fetchColumn();
    $maintenanceSpaces = (int)$pdo->query("SELECT COUNT(*) FROM `parking_spaces` WHERE `status` IN ('mantenimiento', 'reservado')")->fetchColumn();
    $occupancyRate = $totalSpaces > 0 ? (int)round(($occupiedSpaces / $totalSpaces) * 100) : 0;

    // 2. Movimientos y Recaudo del Día (Hoy)
    $stmtTodayRev = $pdo->query("
        SELECT 
            COALESCE(SUM(`total_paid`), 0) AS `revenue`,
            COUNT(*) AS `completed_count`,
            COALESCE(AVG(`total_minutes`), 0) AS `avg_minutes`
        FROM `movements`
        WHERE `status` = 'completado' 
          AND DATE(`exit_time`) = CURRENT_DATE()
    ");
    $todayMetrics = $stmtTodayRev->fetch();

    $todayRevenue = (float)$todayMetrics['revenue'];
    $averageStayMinutes = (int)round((float)$todayMetrics['avg_minutes']);

    // Total de vehículos que ingresaron hoy
    $todayVehiclesCount = (int)$pdo->query("
        SELECT COUNT(*) 
        FROM `movements` 
        WHERE DATE(`entry_time`) = CURRENT_DATE()
    ")->fetchColumn();

    // 3. Ocupación por tipo de vehículo
    $stmtByType = $pdo->query("
        SELECT `allowed_type`, COUNT(*) as total,
               SUM(CASE WHEN `status` = 'ocupado' THEN 1 ELSE 0 END) as occupied
        FROM `parking_spaces`
        GROUP BY `allowed_type`
    ");
    $occupancyByType = $stmtByType->fetchAll();

    jsonResponse([
        'success' => true,
        'data' => [
            'totalSpaces' => $totalSpaces,
            'occupiedSpaces' => $occupiedSpaces,
            'freeSpaces' => $freeSpaces,
            'maintenanceSpaces' => $maintenanceSpaces,
            'occupancyRate' => $occupancyRate,
            'todayRevenue' => $todayRevenue,
            'todayVehiclesCount' => $todayVehiclesCount,
            'averageStayMinutes' => $averageStayMinutes,
            'breakdownByType' => $occupancyByType
        ]
    ]);

} catch (Exception $e) {
    jsonError('Error al calcular estadísticas: ' . $e->getMessage(), 500);
}
