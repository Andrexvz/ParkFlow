<?php
/**
 * ParkFlow - Aplicación Web en PHP Nativo
 * Conexión MySQL en Servidor XAMPP
 */

require_once __DIR__ . '/config/db.php';

$currentUser = getCurrentUser();
$role = $currentUser['role'] ?? 'OPERADOR';

// Determinar vista activa
$view = $_GET['view'] ?? ($role === 'ADMIN' ? 'dashboard' : 'map');

// Vistas permitidas
$allowedViews = [
    'map' => 'views/map.php',
    'active' => 'views/active_vehicles.php',
    'dashboard' => 'views/dashboard.php',
    'spaces' => 'views/spaces.php',
    'rates' => 'views/rates.php',
    'users' => 'views/users.php',
    'history' => 'views/history.php',
];

// Si un operador intenta entrar a vistas administrativas, redirigir a mapa
if ($role === 'OPERADOR' && in_array($view, ['dashboard', 'spaces', 'rates', 'users'])) {
    $view = 'map';
}

$viewFile = $allowedViews[$view] ?? 'views/map.php';

// Renderizar Vista Completa
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/' . $viewFile;
require_once __DIR__ . '/includes/footer.php';
