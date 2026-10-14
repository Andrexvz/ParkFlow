<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/pricing.php';

$db = getDB();
$currentUser = getCurrentUser();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php');
    exit(0);
}

$movementId = $_POST['movement_id'] ?? null;
$paymentMethod = $_POST['payment_method'] ?? 'efectivo';
$amountReceived = isset($_POST['amount_received']) ? (float)$_POST['amount_received'] : null;
$discountPercent = isset($_POST['discount_percent']) ? (int)$_POST['discount_percent'] : 0;
$isLostTicket = !empty($_POST['lost_ticket']);

if (!$movementId) {
    flashRedirect('../index.php', 'ID de movimiento no proporcionado.', 'error');
}

$db->beginTransaction();

try {
    $stmt = $db->prepare("SELECT * FROM `movements` WHERE `id` = ? FOR UPDATE");
    $stmt->execute([$movementId]);
    $mov = $stmt->fetch();

    if (!$mov || $mov['status'] !== 'activo') {
        $db->rollBack();
        flashRedirect('../index.php', 'El movimiento no existe o ya fue liquidado.', 'error');
    }

    // Obtener tarifa del tipo de vehículo
    $stmtRate = $db->prepare("SELECT * FROM `rates` WHERE `vehicle_type` = ?");
    $stmtRate->execute([$mov['vehicle_type']]);
    $rate = $stmtRate->fetch();

    $exitTime = date('Y-m-d H:i:s');
    $breakdown = calculateParkingFee($mov['entry_time'], $exitTime, $rate, $isLostTicket, $discountPercent);

    // Calcular cambio
    $totalPaid = $breakdown['total'];
    $changeGiven = 0;
    if ($paymentMethod === 'efectivo') {
        if ($amountReceived !== null && $amountReceived < $totalPaid) {
            $db->rollBack();
            flashRedirect('../index.php', 'El monto recibido en efectivo es inferior al total a pagar.', 'error');
        }
        $changeGiven = max(0, ($amountReceived ?: $totalPaid) - $totalPaid);
    } else {
        $amountReceived = $totalPaid;
    }

    // Actualizar movimiento
    $stmtUpdate = $db->prepare("
        UPDATE `movements` SET
            `exit_time` = ?,
            `operator_exit_id` = ?,
            `operator_exit_name` = ?,
            `total_minutes` = ?,
            `billed_minutes` = ?,
            `grace_applied` = ?,
            `subtotal` = ?,
            `discount` = ?,
            `lost_ticket_charge` = ?,
            `total_paid` = ?,
            `payment_method` = ?,
            `amount_received` = ?,
            `change_given` = ?,
            `status` = 'completado'
        WHERE `id` = ?
    ");

    $stmtUpdate->execute([
        $exitTime,
        $currentUser['id'],
        $currentUser['name'],
        $breakdown['totalMinutes'],
        $breakdown['graceApplied'] ? 0 : $breakdown['totalMinutes'],
        $breakdown['graceApplied'] ? 1 : 0,
        $breakdown['baseCharge'],
        $breakdown['discount'],
        $isLostTicket ? 1 : 0,
        $totalPaid,
        $paymentMethod,
        $amountReceived,
        $changeGiven,
        $movementId
    ]);

    // Liberar Celda
    $stmtFree = $db->prepare("
        UPDATE `parking_spaces` 
        SET `status` = 'libre', `current_vehicle_plate` = NULL, `current_movement_id` = NULL 
        WHERE `id` = ?
    ");
    $stmtFree->execute([$mov['space_id']]);

    $db->commit();

    // Guardar para ticket de salida imprimible
    $_SESSION['last_ticket'] = [
        'ticket_number' => $mov['ticket_number'],
        'plate' => $mov['plate'],
        'vehicle_type' => $mov['vehicle_type'],
        'space_code' => $mov['space_code'],
        'entry_time' => $mov['entry_time'],
        'exit_time' => $exitTime,
        'total_minutes' => $breakdown['totalMinutes'],
        'total_paid' => $totalPaid,
        'payment_method' => $paymentMethod,
        'operator_entry_name' => $currentUser['name']
    ];

    flashRedirect('../index.php?view=active', "¡Cobro procesado con éxito! Total liquidado: " . formatCOP($totalPaid), 'success');

} catch (Exception $e) {
    $db->rollBack();
    flashRedirect('../index.php', 'Error al liquidar salida: ' . $e->getMessage(), 'error');
}
