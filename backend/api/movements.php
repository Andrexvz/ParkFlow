<?php
/**
 * ParkFlow - API de Movimientos, Registro de Entradas, Salidas y Cobros
 * GET, POST, PUT /api/movements.php
 */

require_once __DIR__ . '/../config/db.php';

$pdo = getDbConnection(true);
$method = $_SERVER['REQUEST_METHOD'];

function formatMovementRow($m) {
    return [
        'id' => $m['id'],
        'ticketNumber' => $m['ticket_number'],
        'plate' => $m['plate'],
        'vehicleType' => $m['vehicle_type'],
        'spaceId' => $m['space_id'],
        'spaceCode' => $m['space_code'],
        'entryTime' => (new DateTime($m['entry_time']))->format('c'),
        'exitTime' => $m['exit_time'] ? (new DateTime($m['exit_time']))->format('c') : null,
        'operatorEntryId' => $m['operator_entry_id'],
        'operatorEntryName' => $m['operator_entry_name'],
        'operatorExitId' => $m['operator_exit_id'] ?: null,
        'operatorExitName' => $m['operator_exit_name'] ?: null,
        'helmetsCount' => $m['helmets_count'] !== null ? (int)$m['helmets_count'] : null,
        'entryNotes' => $m['entry_notes'] ?: null,
        'exitNotes' => $m['exit_notes'] ?: null,
        'clientName' => $m['client_name'] ?: null,
        'clientPhone' => $m['client_phone'] ?: null,
        'totalMinutes' => $m['total_minutes'] !== null ? (int)$m['total_minutes'] : null,
        'billedMinutes' => $m['billed_minutes'] !== null ? (int)$m['billed_minutes'] : null,
        'graceApplied' => (bool)$m['grace_applied'],
        'subtotal' => $m['subtotal'] !== null ? (float)$m['subtotal'] : null,
        'discount' => $m['discount'] !== null ? (float)$m['discount'] : null,
        'lostTicketCharge' => (bool)$m['lost_ticket_charge'],
        'totalPaid' => $m['total_paid'] !== null ? (float)$m['total_paid'] : null,
        'paymentMethod' => $m['payment_method'] ?: null,
        'amountReceived' => $m['amount_received'] !== null ? (float)$m['amount_received'] : null,
        'changeGiven' => $m['change_given'] !== null ? (float)$m['change_given'] : null,
        'status' => $m['status']
    ];
}

switch ($method) {
    case 'GET':
        $status = $_GET['status'] ?? null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 200;

        if ($status) {
            $stmt = $pdo->prepare("SELECT * FROM `movements` WHERE `status` = ? ORDER BY `entry_time` DESC LIMIT ?");
            $stmt->bindValue(1, $status, PDO::PARAM_STR);
            $stmt->bindValue(2, $limit, PDO::PARAM_INT);
            $stmt->execute();
        } else {
            $stmt = $pdo->prepare("SELECT * FROM `movements` ORDER BY `entry_time` DESC LIMIT ?");
            $stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $stmt->execute();
        }

        $movements = array_map('formatMovementRow', $stmt->fetchAll());
        jsonResponse([
            'success' => true,
            'data' => $movements
        ]);
        break;

    case 'POST':
        // Registrar Entrada de Vehículo (Ticket nuevo)
        $body = getRequestBody();
        $plate = trim(strtoupper($body['plate'] ?? ''));
        $vehicleType = $body['vehicleType'] ?? 'automovil';
        $spaceId = $body['spaceId'] ?? null;
        $operatorId = $body['operatorEntryId'] ?? 'usr-op-1';
        $operatorName = $body['operatorEntryName'] ?? 'Operador en Turno';
        $helmetsCount = isset($body['helmetsCount']) ? (int)$body['helmetsCount'] : null;
        $entryNotes = $body['entryNotes'] ?? null;
        $clientName = $body['clientName'] ?? null;
        $clientPhone = $body['clientPhone'] ?? null;
        $entryTime = !empty($body['entryTime']) ? date('Y-m-d H:i:s', strtotime($body['entryTime'])) : date('Y-m-d H:i:s');

        if (empty($plate)) {
            jsonError('La placa del vehículo es obligatoria.');
        }

        // Iniciar Transacción Atómica
        $pdo->beginTransaction();

        try {
            // 1. Validar que no exista un vehículo activo con la misma placa
            $checkPlate = $pdo->prepare("SELECT ticket_number, space_code FROM `movements` WHERE `plate` = ? AND `status` = 'activo' FOR UPDATE");
            $checkPlate->execute([$plate]);
            $existing = $checkPlate->fetch();

            if ($existing) {
                $pdo->rollBack();
                jsonError("El vehículo con placa $plate ya está registrado y activo en la celda {$existing['space_code']} (Ticket: {$existing['ticket_number']}).");
            }

            // 2. Determinar celda objetivo
            if ($spaceId) {
                $stmtSpace = $pdo->prepare("SELECT * FROM `parking_spaces` WHERE `id` = ? FOR UPDATE");
                $stmtSpace->execute([$spaceId]);
                $targetSpace = $stmtSpace->fetch();

                if (!$targetSpace) {
                    $pdo->rollBack();
                    jsonError('La celda seleccionada no existe.', 404);
                }
                if ($targetSpace['status'] !== 'libre') {
                    $pdo->rollBack();
                    jsonError("La celda {$targetSpace['code']} se encuentra en estado '{$targetSpace['status']}'. Seleccione una celda libre.");
                }
            } else {
                // Asignación automática: buscar celda libre compatible
                $stmtSpace = $pdo->prepare("
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
                    $pdo->rollBack();
                    jsonError("No hay celdas libres disponibles para el tipo de vehículo '$vehicleType'.");
                }
            }

            // 3. Generar número de ticket correlativo seguro
            $totalMovementsCount = (int)$pdo->query("SELECT COUNT(*) FROM `movements`")->fetchColumn();
            $ticketNumber = 'TK-' . (10030 + $totalMovementsCount);
            $movementId = 'mov-' . time() . '-' . rand(100, 999);

            // 4. Insertar movimiento
            $insertStmt = $pdo->prepare("
                INSERT INTO `movements` (
                    `id`, `ticket_number`, `plate`, `vehicle_type`, `space_id`, `space_code`,
                    `entry_time`, `operator_entry_id`, `operator_entry_name`, `helmets_count`,
                    `entry_notes`, `client_name`, `client_phone`, `status`
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')
            ");

            $insertStmt->execute([
                $movementId,
                $ticketNumber,
                $plate,
                $vehicleType,
                $targetSpace['id'],
                $targetSpace['code'],
                $entryTime,
                $operatorId,
                $operatorName,
                $vehicleType === 'motocicleta' ? $helmetsCount : 0,
                $entryNotes,
                $clientName,
                $clientPhone
            ]);

            // 5. Ocupar la celda
            $updateSpace = $pdo->prepare("
                UPDATE `parking_spaces` 
                SET `status` = 'ocupado', `current_vehicle_plate` = ?, `current_movement_id` = ? 
                WHERE `id` = ?
            ");
            $updateSpace->execute([$plate, $movementId, $targetSpace['id']]);

            // Confirmar transacción
            $pdo->commit();

            // Retornar el movimiento creado
            $getStmt = $pdo->prepare("SELECT * FROM `movements` WHERE `id` = ?");
            $getStmt->execute([$movementId]);
            $createdRow = $getStmt->fetch();

            jsonResponse([
                'success' => true,
                'message' => "Entrada registrada exitosamente. Ticket: $ticketNumber",
                'data' => formatMovementRow($createdRow)
            ], 201);

        } catch (Exception $e) {
            $pdo->rollBack();
            jsonError('Error al registrar la entrada del vehículo: ' . $e->getMessage(), 500);
        }
        break;

    case 'PUT':
        // Salida o Cancelación
        $body = getRequestBody();
        $action = $body['action'] ?? 'exit';
        $movementId = $body['movementId'] ?? ($body['id'] ?? null);

        if (!$movementId) {
            jsonError('El ID del movimiento es obligatorio.');
        }

        $pdo->beginTransaction();

        try {
            $stmtMov = $pdo->prepare("SELECT * FROM `movements` WHERE `id` = ? FOR UPDATE");
            $stmtMov->execute([$movementId]);
            $mov = $stmtMov->fetch();

            if (!$mov) {
                $pdo->rollBack();
                jsonError('Movimiento no encontrado.', 404);
            }

            if ($mov['status'] !== 'activo') {
                $pdo->rollBack();
                jsonError("El ticket {$mov['ticket_number']} ya fue procesado con estado '{$mov['status']}'.");
            }

            if ($action === 'cancel') {
                // Cancelar movimiento
                $reason = $body['reason'] ?? 'Cancelado por el operador';
                $exitTime = date('Y-m-d H:i:s');

                $updateMov = $pdo->prepare("
                    UPDATE `movements` 
                    SET `status` = 'cancelado', `exit_time` = ?, `exit_notes` = ? 
                    WHERE `id` = ?
                ");
                $updateMov->execute([$exitTime, "Cancelado: $reason", $movementId]);

                // Liberar la celda
                $freeSpace = $pdo->prepare("
                    UPDATE `parking_spaces` 
                    SET `status` = 'libre', `current_vehicle_plate` = NULL, `current_movement_id` = NULL 
                    WHERE `id` = ?
                ");
                $freeSpace->execute([$mov['space_id']]);

                $pdo->commit();

                jsonResponse([
                    'success' => true,
                    'message' => "Ticket {$mov['ticket_number']} cancelado y celda {$mov['space_code']} liberada."
                ]);
            } else {
                // Procesar Salida y Cobro
                $exitTime = !empty($body['exitTime']) ? date('Y-m-d H:i:s', strtotime($body['exitTime'])) : date('Y-m-d H:i:s');
                $paymentMethod = $body['paymentMethod'] ?? 'efectivo';
                $operatorExitId = $body['operatorExitId'] ?? 'usr-op-1';
                $operatorExitName = $body['operatorExitName'] ?? 'Operador en Turno';
                $totalMinutes = isset($body['totalMinutes']) ? (int)$body['totalMinutes'] : 0;
                $billedMinutes = isset($body['billedMinutes']) ? (int)$body['billedMinutes'] : 0;
                $graceApplied = isset($body['graceApplied']) && $body['graceApplied'] ? 1 : 0;
                $subtotal = isset($body['subtotal']) ? (float)$body['subtotal'] : 0.00;
                $discount = isset($body['discount']) ? (float)$body['discount'] : 0.00;
                $lostTicketCharge = isset($body['lostTicketCharge']) && $body['lostTicketCharge'] ? 1 : 0;
                $totalPaid = isset($body['totalPaid']) ? (float)$body['totalPaid'] : 0.00;
                $amountReceived = isset($body['amountReceived']) ? (float)$body['amountReceived'] : $totalPaid;
                $changeGiven = isset($body['changeGiven']) ? (float)$body['changeGiven'] : 0.00;
                $exitNotes = $body['exitNotes'] ?? null;

                $updateMov = $pdo->prepare("
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
                        `exit_notes` = ?,
                        `status` = 'completado'
                    WHERE `id` = ?
                ");

                $updateMov->execute([
                    $exitTime,
                    $operatorExitId,
                    $operatorExitName,
                    $totalMinutes,
                    $billedMinutes,
                    $graceApplied,
                    $subtotal,
                    $discount,
                    $lostTicketCharge,
                    $totalPaid,
                    $paymentMethod,
                    $amountReceived,
                    $changeGiven,
                    $exitNotes,
                    $movementId
                ]);

                // Liberar la celda correspondiente
                $freeSpace = $pdo->prepare("
                    UPDATE `parking_spaces` 
                    SET `status` = 'libre', `current_vehicle_plate` = NULL, `current_movement_id` = NULL 
                    WHERE `id` = ?
                ");
                $freeSpace->execute([$mov['space_id']]);

                $pdo->commit();

                // Obtener registro actualizado
                $stmtUpdated = $pdo->prepare("SELECT * FROM `movements` WHERE `id` = ?");
                $stmtUpdated->execute([$movementId]);
                $rowUpdated = $stmtUpdated->fetch();

                jsonResponse([
                    'success' => true,
                    'message' => "Salida procesada exitosamente. Total cobrado: $$totalPaid COP",
                    'data' => formatMovementRow($rowUpdated)
                ]);
            }
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonError('Error al procesar la salida: ' . $e->getMessage(), 500);
        }
        break;

    default:
        jsonError("Método $method no soportado.", 405);
}
