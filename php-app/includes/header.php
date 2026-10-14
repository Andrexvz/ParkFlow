<?php
require_once __DIR__ . '/../config/db.php';
$db = getDB();
$currentUser = getCurrentUser();

// Estadísticas rápidas para el header
$totalSpaces = (int)$db->query("SELECT COUNT(*) FROM `parking_spaces`")->fetchColumn();
$occupiedSpaces = (int)$db->query("SELECT COUNT(*) FROM `parking_spaces` WHERE `status` = 'ocupado'")->fetchColumn();
$occupancyRate = $totalSpaces > 0 ? (int)round(($occupiedSpaces / $totalSpaces) * 100) : 0;

// Lista de usuarios para cambio rápido
$allUsers = $db->query("SELECT * FROM `users` WHERE `active` = 1 ORDER BY `role` ASC, `name` ASC")->fetchAll();

// Vista activa
$currentView = $_GET['view'] ?? ($currentUser['role'] === 'ADMIN' ? 'dashboard' : 'map');
$flash = getFlash();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ParkFlow - Sistema Inteligente de Parqueaderos</title>
  
  <!-- Estilos CSS Locales y Autónomos (100% Offline, sin dependencias CDN) -->
  <link rel="stylesheet" href="assets/css/tailwind.local.css">
  <link rel="stylesheet" href="assets/css/app.css">
  
  <!-- Iconos Lucide Locales (Offline) -->
  <script src="assets/js/lucide.local.js"></script>
</head>
<body class="bg-slate-50 min-h-screen text-slate-900 flex flex-col font-sans antialiased">

  <!-- Barra de Notificación / Mensaje Flash -->
  <?php if ($flash): ?>
    <div id="flashAlert" class="bg-<?= $flash['type'] === 'error' ? 'rose-600' : 'emerald-600' ?> text-white text-xs sm:text-sm font-medium py-2.5 px-4 text-center transition-all flex items-center justify-center gap-2 shadow-md">
      <span><?= htmlspecialchars($flash['text']) ?></span>
      <button onclick="document.getElementById('flashAlert').remove()" class="opacity-80 hover:opacity-100 ml-2 font-bold">✕</button>
    </div>
  <?php endif; ?>

  <!-- Encabezado Principal -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      
      <!-- Zona 1: Logotipo y Métricas en Vivo -->
      <div class="flex items-center gap-3">
        <a href="index.php?view=<?= $currentUser['role'] === 'ADMIN' ? 'dashboard' : 'map' ?>" class="flex items-center gap-2 group">
          <div class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:bg-blue-700 transition-colors">
            P
          </div>
          <span class="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            ParkFlow
          </span>
        </a>

        <!-- Indicador en Vivo -->
        <div class="hidden lg:flex items-center gap-2 text-xs text-slate-500 pl-3 border-l border-slate-200">
          <span class="font-medium text-slate-800"><?= $occupiedSpaces ?>/<?= $totalSpaces ?> celdas</span>
          <span class="text-slate-300">·</span>
          <span class="font-bold <?= $occupancyRate > 85 ? 'text-rose-600' : 'text-emerald-600' ?>">
            <?= $occupancyRate ?>% ocupado
          </span>
        </div>

        <!-- Reloj en Vivo -->
        <div class="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-mono font-medium rounded-lg">
          <i data-lucide="clock" class="w-3.5 h-3.5 text-slate-500"></i>
          <span id="liveClock">--:--:--</span>
        </div>
      </div>

      <!-- Zona 2: Enlaces de Navegación -->
      <nav class="hidden md:flex items-center gap-1">
        <?php if ($currentUser['role'] === 'ADMIN'): ?>
          <a href="index.php?view=dashboard" class="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors <?= $currentView === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' ?>">
            Dashboard
          </a>
          <a href="index.php?view=map" class="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors <?= $currentView === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' ?>">
            Mapa en Vivo
          </a>
          <a href="index.php?view=spaces" class="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors <?= $currentView === 'spaces' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' ?>">
            Celdas
          </a>
          <a href="index.php?view=rates" class="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors <?= $currentView === 'rates' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' ?>">
            Tarifas
          </a>
          <a href="index.php?view=users" class="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors <?= $currentView === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' ?>">
            Usuarios
          </a>
          <a href="index.php?view=history" class="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors <?= $currentView === 'history' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' ?>">
            Historial
          </a>
        <?php else: ?>
          <a href="index.php?view=map" class="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors <?= $currentView === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' ?>">
            Mapa de Celdas
          </a>
          <a href="index.php?view=active" class="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors <?= $currentView === 'active' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' ?>">
            Vehículos Activos
          </a>
          <a href="index.php?view=history" class="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors <?= $currentView === 'history' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' ?>">
            Historial del Turno
          </a>
        <?php endif; ?>
      </nav>

      <!-- Zona 3: Acciones Principales y Usuario -->
      <div class="flex items-center gap-2.5">
        
        <!-- Botón Registrar Entrada -->
        <button onclick="openEntryModal()" class="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors whitespace-nowrap">
          <i data-lucide="plus" class="w-4 h-4 stroke-[3]"></i>
          <span>Registrar Entrada</span>
        </button>

        <!-- Selector de Usuario / Operador -->
        <div class="relative" id="userMenuDropdown">
          <button onclick="document.getElementById('userMenuContent').classList.toggle('hidden')" class="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
            <div class="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
              <?= strtoupper(substr($currentUser['name'], 0, 1)) ?>
            </div>
            <div class="hidden xl:block pr-1 leading-tight">
              <p class="text-xs font-bold text-slate-900 truncate max-w-[110px]"><?= htmlspecialchars($currentUser['name']) ?></p>
              <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider"><?= $currentUser['role'] ?></p>
            </div>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400"></i>
          </button>

          <!-- Menú desplegable -->
          <div id="userMenuContent" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
            <div class="px-4 py-2 border-b border-slate-100">
              <p class="text-[11px] text-slate-400 font-semibold uppercase">Operador en Turno</p>
              <p class="text-sm font-bold text-slate-900 truncate"><?= htmlspecialchars($currentUser['name']) ?></p>
              <span class="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full <?= $currentUser['role'] === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700' ?>">
                <?= $currentUser['role'] === 'ADMIN' ? 'Administrador' : 'Operador de Turno' ?>
              </span>
            </div>

            <div class="px-2 py-1.5">
              <p class="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cambiar de Operador</p>
              <?php foreach ($allUsers as $u): ?>
                <form action="actions/switch_user.php" method="POST" class="inline block w-full">
                  <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                  <button type="submit" class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors <?= $u['id'] === $currentUser['id'] ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700 hover:bg-slate-50' ?>">
                    <span class="truncate"><?= htmlspecialchars($u['name']) ?></span>
                    <span class="text-[10px] text-slate-400 uppercase"><?= $u['role'] ?></span>
                  </button>
                </form>
              <?php endforeach; ?>
            </div>
          </div>
        </div>

      </div>

    </div>
  </header>

  <!-- Contenido Principal -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
