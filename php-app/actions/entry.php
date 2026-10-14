<?php
require_once __DIR__ . '/../config/db.php';
$db = getDB();
$currentUser = getCurrentUser();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php');
    exit(0);
}

$plate = trim(strtoupper($_POST['plate'] ?? ''));
$vehicleType = $_POST['vehicle_type'] ?? 'automovil';
$spaceId = !empty($_POST['space_id']) ? $_POST['space_id'] : null;
$helmetsCount = isset($_POST['helmets_count']) ? (int)$_POST['helmets_count'] : 0;
$entryNotes = trim($_POST['entry_notes'] ?? '');

if (empty($plate)) {
    flashRedirect('../index.php', 'La placa del vehículo es obligatoria.', 'error');
}

$db->beginTransaction();

try {
    // 1. Verificar si ya está adentro
    $check = $db->prepare("SELECT ticket_number, space_code FROM `movements` WHERE `plate` = ? AND `status` = 'activo' FOR UPDATE");
    $check->execute([$plate]);
    $already = $check->fetch();

    if ($already) {
        $db->rollBack();
        flashRedirect('../index.php', "El vehículo $plate ya está adentro en la celda {$already['space_code']} (Ticket: {$already['ticket_number']}).", 'error');
    }

    // 2. Determinar Celda
    if ($spaceId) {
        $stmtSpace = $db->prepare("SELECT * FROM `parking_spaces` WHERE `id` = ? FOR UPDATE");
        $stmtSpace->execute([$spaceId]);
        $targetSpace = $stmtSpace->fetch();

        if (!$targetSpace || $targetSpace['status'] !== 'libre') {
            $db->rollBack();
            flashRedirect('../index.php', 'La celda seleccionada no está disponible.', 'error');
        }
    } else {
        // Asignación automática: buscar celda libre compatible
        $stmtSpace = $db->prepare("
            SELECT * FROM `parking_spaces` 
            WHERE `status` = 'libre' 
              AND (`allowed_type` = ? OR (? = 'automovil' AND `allowed_type` = 'camioneta'))
            ORDER BY `code` ASC 
            LIMIT 1 
            FOR UPDATE
        ");
        $stmtSpace->execute([$vehicleType, $vehicleType]);
        $targetSpace = $stmtSpace->fetch();

        if (!$targetSpace) {
            $db->rollBack();
            flashRedirect('../index.php', "No hay celdas libres disponibles para el tipo '$vehicleType'.", 'error');
        }
    }

    // 3. Crear Ticket
    $totalCount = (int)$db->query("SELECT COUNT(*) FROM `movements`")->fetchColumn();
    $ticketNumber = 'TK-' . (10030 + $totalCount);
    $movementId = 'mov-' . time() . '-' . rand(100, 999);
    $entryTime = date('Y-m-d H:i:s');

    $stmtInsert = $db->prepare("
        INSERT INTO `movements` (
            `id`, `ticket_number`, `plate`, `vehicle_type`, `space_id`, `space_code`,
            `entry_time`, `operator_entry_id`, `operator_entry_name`, `helmets_count`,
            `entry_notes`, `status`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')
    ");

    $stmtInsert->execute([
        $movementId,
        $ticketNumber,
        $plate,
        $vehicleType,
        $targetSpace['id'],
        $targetSpace['code'],
        $entryTime,
        $currentUser['id'],
        $currentUser['name'],
        $vehicleType === 'motocicleta' ? $helmetsCount : 0,
        $entryNotes ?: null
    ]);

    // 4. Ocupar la Celda
    $stmtUpdateSpace = $db->prepare("
        UPDATE `parking_spaces` 
        SET `status` = 'ocupado', `current_vehicle_plate` = ?, `current_movement_id` = ? 
        WHERE `id` = ?
    ");
    $stmtUpdateSpace->execute([$plate, $movementId, $targetSpace['id']]);

    $db->commit();

    // Guardar para modal de ticket térmico
    $_SESSION['last_ticket'] = [
        'ticket_number' => $ticketNumber,
        'plate' => $plate,
        'vehicle_type' => $vehicleType,
        'space_code' => $targetSpace['code'],
        'entry_time' => $entryTime,
        'operator_entry_name' => $currentUser['name']
    ];

    flashRedirect('../index.php?view=map', "¡Entrada registrada con éxito! Celda asignada: {$targetSpace['code']}. Ticket: $ticketNumber", 'success');

} catch (Exception $e) {
    $db->rollBack();
    flashRedirect('../index.php', 'Error al registrar entrada: ' . $e->getMessage(), 'error');
}
