<?php
/**
 * ParkFlow - API de Celdas de Parqueadero (Parking Spaces)
 * GET, POST, PUT, DELETE /api/spaces.php
 */

require_once __DIR__ . '/../config/db.php';

$pdo = getDbConnection(true);
$method = $_SERVER['REQUEST_METHOD'];

function formatSpaceRow($row) {
    return [
        'id' => $row['id'],
        'code' => $row['code'],
        'zone' => $row['zone'],
        'allowedType' => $row['allowed_type'],
        'status' => $row['status'],
        'currentVehiclePlate' => $row['current_vehicle_plate'] ?: undefined,
        'currentMovementId' => $row['current_movement_id'] ?: undefined,
        'notes' => $row['notes'] ?: undefined
    ];
}

switch ($method) {
    case 'GET':
        // Listar todas las celdas ordenadas por zona y código
        $stmt = $pdo->query("SELECT * FROM `parking_spaces` ORDER BY `zone` ASC, `code` ASC");
        $rows = $stmt->fetchAll();
        $spaces = array_map(function($r) {
            return [
                'id' => $r['id'],
                'code' => $r['code'],
                'zone' => $r['zone'],
                'allowedType' => $r['allowed_type'],
                'status' => $r['status'],
                'currentVehiclePlate' => $r['current_vehicle_plate'] ?: null,
                'currentMovementId' => $r['current_movement_id'] ?: null,
                'notes' => $r['notes'] ?: null
            ];
        }, $rows);

        jsonResponse([
            'success' => true,
            'data' => $spaces
        ]);
        break;

    case 'POST':
        // Crear una nueva celda
        $body = getRequestBody();
        $code = trim(strtoupper($body['code'] ?? ''));
        $zone = trim($body['zone'] ?? 'Zona A');
        $allowedType = $body['allowedType'] ?? 'automovil';
        $status = $body['status'] ?? 'libre';
        $notes = $body['notes'] ?? null;
        $id = $body['id'] ?? ('sp-' . strtolower(str_replace(' ', '-', $code)) . '-' . time());

        if (empty($code)) {
            jsonError('El código de celda es obligatorio (ej: A-11, B-16).');
        }

        // Verificar código único
        $check = $pdo->prepare("SELECT id FROM `parking_spaces` WHERE UPPER(`code`) = ?");
        $check->execute([$code]);
        if ($check->fetch()) {
            jsonError("Ya existe una celda con el código $code.");
        }

        $stmt = $pdo->prepare("INSERT INTO `parking_spaces` (`id`, `code`, `zone`, `allowed_type`, `status`, `notes`) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $code, $zone, $allowedType, $status, $notes]);

        $created = $pdo->prepare("SELECT * FROM `parking_spaces` WHERE `id` = ?");
        $created->execute([$id]);
        $row = $created->fetch();

        jsonResponse([
            'success' => true,
            'message' => "Celda $code creada exitosamente.",
            'data' => [
                'id' => $row['id'],
                'code' => $row['code'],
                'zone' => $row['zone'],
                'allowedType' => $row['allowed_type'],
                'status' => $row['status'],
                'notes' => $row['notes']
            ]
        ], 201);
        break;

    case 'PUT':
        // Actualizar celda o su estado
        $body = getRequestBody();
        $id = $body['id'] ?? null;

        if (!$id) {
            jsonError('El ID de la celda es obligatorio.');
        }

        // Caso 1: Actualización simple de estado / notas
        if (isset($body['status']) && !isset($body['zone'])) {
            $status = $body['status'];
            $notes = isset($body['notes']) ? $body['notes'] : null;

            if ($status === 'libre') {
                $stmt = $pdo->prepare("UPDATE `parking_spaces` SET `status` = ?, `current_vehicle_plate` = NULL, `current_movement_id` = NULL, `notes` = COALESCE(?, `notes`) WHERE `id` = ?");
                $stmt->execute([$status, $notes, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE `parking_spaces` SET `status` = ?, `notes` = COALESCE(?, `notes`) WHERE `id` = ?");
                $stmt->execute([$status, $notes, $id]);
            }
        } else {
            // Caso 2: Edición completa de datos de la celda
            $code = trim(strtoupper($body['code'] ?? ''));
            $zone = trim($body['zone'] ?? 'Zona A');
            $allowedType = $body['allowedType'] ?? 'automovil';
            $status = $body['status'] ?? 'libre';
            $notes = $body['notes'] ?? null;

            if (empty($code)) {
                jsonError('El código de celda es requerido.');
            }

            // Validar código duplicado en otra celda
            $check = $pdo->prepare("SELECT id FROM `parking_spaces` WHERE UPPER(`code`) = ? AND `id` != ?");
            $check->execute([$code, $id]);
            if ($check->fetch()) {
                jsonError("Ya existe otra celda con el código $code.");
            }

            $stmt = $pdo->prepare("UPDATE `parking_spaces` SET `code` = ?, `zone` = ?, `allowed_type` = ?, `status` = ?, `notes` = ? WHERE `id` = ?");
            $stmt->execute([$code, $zone, $allowedType, $status, $notes, $id]);
        }

        $stmt = $pdo->prepare("SELECT * FROM `parking_spaces` WHERE `id` = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if (!$row) {
            jsonError('Celda no encontrada.', 404);
        }

        jsonResponse([
            'success' => true,
            'message' => 'Celda actualizada exitosamente.',
            'data' => [
                'id' => $row['id'],
                'code' => $row['code'],
                'zone' => $row['zone'],
                'allowedType' => $row['allowed_type'],
                'status' => $row['status'],
                'currentVehiclePlate' => $row['current_vehicle_plate'],
                'currentMovementId' => $row['current_movement_id'],
                'notes' => $row['notes']
            ]
        ]);
        break;

    case 'DELETE':
        // Eliminar celda
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $body = getRequestBody();
            $id = $body['id'] ?? null;
        }

        if (!$id) {
            jsonError('El ID de la celda a eliminar es requerido.');
        }

        $check = $pdo->prepare("SELECT status, code FROM `parking_spaces` WHERE `id` = ?");
        $check->execute([$id]);
        $space = $check->fetch();

        if (!$space) {
            jsonError('Celda no encontrada.', 404);
        }

        if ($space['status'] === 'ocupado') {
            jsonError("No se puede eliminar la celda {$space['code']} porque se encuentra ocupada por un vehículo.");
        }

        $stmt = $pdo->prepare("DELETE FROM `parking_spaces` WHERE `id` = ?");
        $stmt->execute([$id]);

        jsonResponse([
            'success' => true,
            'message' => "Celda {$space['code']} eliminada correctamente."
        ]);
        break;

    default:
        jsonError("Método $method no soportado.", 405);
}
