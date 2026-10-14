<?php
/**
 * ParkFlow - API de Tarifas por Tipo de Vehículo
 * GET, PUT /api/rates.php
 */

require_once __DIR__ . '/../config/db.php';

$pdo = getDbConnection(true);
$method = $_SERVER['REQUEST_METHOD'];

function formatRateRow($r) {
    return [
        'id' => $r['id'],
        'vehicleType' => $r['vehicle_type'],
        'label' => $r['label'],
        'ratePerMinute' => (float)$r['rate_per_minute'],
        'ratePerFraction15m' => (float)$r['rate_per_fraction15m'],
        'ratePerHour' => (float)$r['rate_per_hour'],
        'ratePerDay' => (float)$r['rate_per_day'],
        'ratePerMonth' => (float)$r['rate_per_month'],
        'gracePeriodMinutes' => (int)$r['grace_period_minutes'],
        'lostTicketFee' => (float)$r['lost_ticket_fee']
    ];
}

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM `rates` ORDER BY FIELD(`vehicle_type`, 'automovil', 'motocicleta', 'camioneta', 'bicicleta')");
        $rates = array_map('formatRateRow', $stmt->fetchAll());
        jsonResponse([
            'success' => true,
            'data' => $rates
        ]);
        break;

    case 'PUT':
        $body = getRequestBody();
        $id = $body['id'] ?? null;

        if (!$id) {
            jsonError('El ID de la tarifa es obligatorio.');
        }

        $label = trim($body['label'] ?? '');
        $ratePerMinute = (float)($body['ratePerMinute'] ?? 0);
        $ratePerFraction15m = (float)($body['ratePerFraction15m'] ?? 0);
        $ratePerHour = (float)($body['ratePerHour'] ?? 0);
        $ratePerDay = (float)($body['ratePerDay'] ?? 0);
        $ratePerMonth = (float)($body['ratePerMonth'] ?? 0);
        $gracePeriodMinutes = (int)($body['gracePeriodMinutes'] ?? 10);
        $lostTicketFee = (float)($body['lostTicketFee'] ?? 0);

        if (empty($label)) {
            jsonError('El nombre de la tarifa no puede estar vacío.');
        }

        $stmt = $pdo->prepare("
            UPDATE `rates` SET 
                `label` = ?,
                `rate_per_minute` = ?,
                `rate_per_fraction15m` = ?,
                `rate_per_hour` = ?,
                `rate_per_day` = ?,
                `rate_per_month` = ?,
                `grace_period_minutes` = ?,
                `lost_ticket_fee` = ?
            WHERE `id` = ?
        ");

        $stmt->execute([
            $label,
            $ratePerMinute,
            $ratePerFraction15m,
            $ratePerHour,
            $ratePerDay,
            $ratePerMonth,
            $gracePeriodMinutes,
            $lostTicketFee,
            $id
        ]);

        $check = $pdo->prepare("SELECT * FROM `rates` WHERE `id` = ?");
        $check->execute([$id]);
        $row = $check->fetch();

        if (!$row) {
            jsonError('Tarifa no encontrada.', 404);
        }

        jsonResponse([
            'success' => true,
            'message' => "Tarifa '{$label}' actualizada exitosamente.",
            'data' => formatRateRow($row)
        ]);
        break;

    default:
        jsonError("Método $method no permitido.", 405);
}
