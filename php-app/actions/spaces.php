<?php
require_once __DIR__ . '/../config/db.php';
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php');
    exit(0);
}

$action = $_POST['action'] ?? '';

if ($action === 'create') {
    $code = trim(strtoupper($_POST['code'] ?? ''));
    $zone = trim($_POST['zone'] ?? 'Zona A');
    $allowedType = $_POST['allowed_type'] ?? 'automovil';
    $notes = trim($_POST['notes'] ?? '');

    if (empty($code)) {
        flashRedirect('../index.php?view=spaces', 'El código de celda es obligatorio.', 'error');
    }

    // Verificar unicidad de código
    $check = $db->prepare("SELECT id FROM `parking_spaces` WHERE `code` = ?");
    $check->execute([$code]);
    if ($check->fetch()) {
        flashRedirect('../index.php?view=spaces', "Ya existe una celda con el código $code.", 'error');
    }

    $id = 'sp-' . strtolower(str_replace(' ', '-', $code)) . '-' . time();
    $stmt = $db->prepare("INSERT INTO `parking_spaces` (`id`, `code`, `zone`, `allowed_type`, `status`, `notes`) VALUES (?, ?, ?, ?, 'libre', ?)");
    $stmt->execute([$id, $code, $zone, $allowedType, $notes ?: null]);

    flashRedirect('../index.php?view=spaces', "Celda $code agregada con éxito.", 'success');

} elseif ($action === 'toggle_status') {
    $spaceId = $_POST['space_id'] ?? '';
    $status = $_POST['status'] ?? 'libre';

    $stmt = $db->prepare("UPDATE `parking_spaces` SET `status` = ? WHERE `id` = ? AND `status` != 'ocupado'");
    $stmt->execute([$status, $spaceId]);

    flashRedirect('../index.php?view=spaces', "Estado de la celda actualizado a: $status.", 'success');

} elseif ($action === 'delete') {
    $spaceId = $_POST['space_id'] ?? '';

    $stmt = $db->prepare("DELETE FROM `parking_spaces` WHERE `id` = ? AND `status` != 'ocupado'");
    $stmt->execute([$spaceId]);

    flashRedirect('../index.php?view=spaces', "Celda eliminada correctamente.", 'success');
}

flashRedirect('../index.php?view=spaces', 'Acción no válida.', 'error');
