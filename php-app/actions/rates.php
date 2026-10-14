<?php
require_once __DIR__ . '/../config/db.php';
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php');
    exit(0);
}

$rateId = $_POST['rate_id'] ?? '';
$ratePerMinute = (float)($_POST['rate_per_minute'] ?? 0);
$ratePerFraction15m = (float)($_POST['rate_per_fraction15m'] ?? 0);
$ratePerHour = (float)($_POST['rate_per_hour'] ?? 0);
$ratePerDay = (float)($_POST['rate_per_day'] ?? 0);
$gracePeriodMinutes = (int)($_POST['grace_period_minutes'] ?? 10);
$lostTicketFee = (float)($_POST['lost_ticket_fee'] ?? 0);

if (!$rateId) {
    flashRedirect('../index.php?view=rates', 'ID de tarifa no válido.', 'error');
}

$stmt = $db->prepare("
    UPDATE `rates` SET
        `rate_per_minute` = ?,
        `rate_per_fraction15m` = ?,
        `rate_per_hour` = ?,
        `rate_per_day` = ?,
        `grace_period_minutes` = ?,
        `lost_ticket_fee` = ?
    WHERE `id` = ?
");

$stmt->execute([
    $ratePerMinute,
    $ratePerFraction15m,
    $ratePerHour,
    $ratePerDay,
    $gracePeriodMinutes,
    $lostTicketFee,
    $rateId
]);

flashRedirect('../index.php?view=rates', 'Tarifa actualizada correctamente en MySQL.', 'success');
