<?php
require_once __DIR__ . '/../config/db.php';
$db = getDB();
$currentUser = getCurrentUser();

// Estadísticas rápidas para el header
$totalSpaces    = (int)$db->query("SELECT COUNT(*) FROM `parking_spaces`")->fetchColumn();
$occupiedSpaces = (int)$db->query("SELECT COUNT(*) FROM `parking_spaces` WHERE `status` = 'ocupado'")->fetchColumn();
$occupancyRate  = $totalSpaces > 0 ? (int)round(($occupiedSpaces / $totalSpaces) * 100) : 0;

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
  <meta name="description" content="ParkFlow — Sistema inteligente de gestión de parqueaderos con interfaz Dark UI premium">
  <title>ParkFlow — Sistema Inteligente de Parqueaderos</title>

  <!-- Google Fonts: Inter + JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">

  <!-- CSS Locales: Tailwind base + App Premium -->
  <link rel="stylesheet" href="assets/css/tailwind.local.css">
  <link rel="stylesheet" href="assets/css/app.css">

  <!-- Lucide Icons Locales -->
  <script src="assets/js/lucide.local.js"></script>

  <style>
    /* Ajustes inline para que tailwind.local.css sea compatible con las nuevas clases */
    body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg-base, #080c18); }
    .font-mono, code { font-family: 'JetBrains Mono', 'Cascadia Code', monospace !important; }
  </style>
</head>
<body style="background:#080c18; color:#f1f5f9; min-height:100vh; display:flex; flex-direction:column;">

  <!-- ── Barra Flash Message ── -->
  <?php if ($flash): ?>
    <div id="flashAlert" class="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white text-center shadow-lg animate-slide-top"
         style="background: <?= $flash['type'] === 'error' ? 'linear-gradient(90deg,#be123c,#e11d48)' : 'linear-gradient(90deg,#047857,#059669)' ?>;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <?= $flash['type'] === 'error' ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' ?>
      </svg>
      <span><?= htmlspecialchars($flash['text']) ?></span>
      <button onclick="document.getElementById('flashAlert').remove()" style="opacity:0.7; margin-left:.5rem; font-size:1rem; background:none; border:none; color:white; cursor:pointer;">✕</button>
    </div>
  <?php endif; ?>

  <!-- ══════════════════════════════════════════════
       HEADER PRINCIPAL DARK UI PREMIUM
  ══════════════════════════════════════════════ -->
  <header class="pf-header" style="position:sticky; top:0; z-index:50;">
    <div style="max-width:90rem; margin:0 auto; padding:0 1.25rem; height:64px; display:flex; align-items:center; justify-content:space-between; gap:1rem;">

      <!-- ── Zona 1: Logo + Métricas ── -->
      <div style="display:flex; align-items:center; gap:1rem; flex-shrink:0;">
        <a href="index.php?view=<?= $currentUser['role'] === 'ADMIN' ? 'dashboard' : 'map' ?>"
           style="display:flex; align-items:center; gap:.625rem; text-decoration:none;">
          <div class="pf-logo">P</div>
          <span style="font-size:1.2rem; font-weight:900; letter-spacing:-.03em; color:#f1f5f9; white-space:nowrap;">
            Park<span style="color:#60a5fa;">Flow</span>
          </span>
        </a>

        <!-- Separador + Ocupación -->
        <div style="display:flex; align-items:center; gap:.625rem; padding-left:.875rem; border-left:1px solid rgba(255,255,255,.07);">
          <?php
            $dotClass = $occupancyRate > 85 ? 'red' : ($occupancyRate > 60 ? 'amber' : 'green');
          ?>
          <span class="occupancy-dot <?= $dotClass ?> live-pulse"></span>
          <div style="line-height:1.2; display:flex; flex-direction:column;">
            <span style="font-size:.7rem; font-weight:800; color:#f1f5f9;">
              <?= $occupiedSpaces ?>/<?= $totalSpaces ?>
              <span style="font-weight:600; color:<?= $occupancyRate > 85 ? '#fb7185' : ($occupancyRate > 60 ? '#fbbf24' : '#34d399') ?>;">
                (<?= $occupancyRate ?>%)
              </span>
            </span>
            <span style="font-size:.6rem; color:#475569; text-transform:uppercase; letter-spacing:.06em; font-weight:700;">celdas ocupadas</span>
          </div>
        </div>

        <!-- Reloj en Vivo -->
        <div class="clock-widget" style="display:none;" id="clockWidget">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span id="liveClock">--:--:--</span>
        </div>
      </div>

      <!-- ── Zona 2: Navegación ── -->
      <nav style="display:flex; align-items:center; gap:.25rem; flex:1; justify-content:center; overflow:hidden;">
        <?php if ($currentUser['role'] === 'ADMIN'): ?>
          <a href="index.php?view=dashboard" class="nav-link <?= $currentView === 'dashboard' ? 'active' : '' ?>">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
            Dashboard
          </a>
          <a href="index.php?view=map" class="nav-link <?= $currentView === 'map' ? 'active' : '' ?>">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
            Mapa en Vivo
          </a>
          <a href="index.php?view=active" class="nav-link <?= $currentView === 'active' ? 'active' : '' ?>">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            Vehículos
          </a>
          <a href="index.php?view=spaces" class="nav-link <?= $currentView === 'spaces' ? 'active' : '' ?>">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
            Celdas
          </a>
          <a href="index.php?view=rates" class="nav-link <?= $currentView === 'rates' ? 'active' : '' ?>">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Tarifas
          </a>
          <a href="index.php?view=users" class="nav-link <?= $currentView === 'users' ? 'active' : '' ?>">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Usuarios
          </a>
          <a href="index.php?view=history" class="nav-link <?= $currentView === 'history' ? 'active' : '' ?>">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Historial
          </a>
        <?php else: ?>
          <a href="index.php?view=map" class="nav-link <?= $currentView === 'map' ? 'active' : '' ?>">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>
            Mapa de Celdas
          </a>
          <a href="index.php?view=active" class="nav-link <?= $currentView === 'active' ? 'active' : '' ?>">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            Vehículos Activos
          </a>
          <a href="index.php?view=history" class="nav-link <?= $currentView === 'history' ? 'active' : '' ?>">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Historial del Turno
          </a>
        <?php endif; ?>
      </nav>

      <!-- ── Zona 3: Acciones + Usuario ── -->
      <div style="display:flex; align-items:center; gap:.625rem; flex-shrink:0;">

        <!-- Botón Registrar Entrada -->
        <button id="btnOpenEntry" onclick="openEntryModal()" class="btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Registrar Entrada</span>
        </button>

        <!-- Menú de Usuario -->
        <div style="position:relative;" id="userMenuWrapper">
          <button onclick="toggleUserMenu()" id="userMenuBtn"
            style="display:flex; align-items:center; gap:.5rem; padding:.375rem .625rem .375rem .375rem;
                   background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:12px;
                   cursor:pointer; transition:all .15s; color:#f1f5f9;">
            <!-- Avatar -->
            <div style="width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,#2563eb,#7c3aed);
                        display:flex; align-items:center; justify-content:center; font-weight:800; font-size:.8rem; color:white;
                        box-shadow:0 0 12px rgba(37,99,235,.3); flex-shrink:0;">
              <?= strtoupper(substr($currentUser['name'], 0, 1)) ?>
            </div>
            <div style="text-align:left; line-height:1.2;">
              <p style="font-size:.75rem; font-weight:700; color:#f1f5f9; white-space:nowrap; max-width:100px; overflow:hidden; text-overflow:ellipsis;"><?= htmlspecialchars($currentUser['name']) ?></p>
              <p style="font-size:.6rem; font-weight:700; color:<?= $currentUser['role'] === 'ADMIN' ? '#a78bfa' : '#60a5fa' ?>; text-transform:uppercase; letter-spacing:.06em;"><?= $currentUser['role'] ?></p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:#475569; flex-shrink:0;"><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          <!-- Dropdown User Menu -->
          <div id="userMenuDropdown"
            style="display:none; position:absolute; right:0; top:calc(100% + .5rem); width:240px;
                   background:var(--bg-card,#111b30); border:1px solid rgba(255,255,255,.1); border-radius:16px;
                   box-shadow:0 20px 50px rgba(0,0,0,.7); overflow:hidden; z-index:200; animation: scaleIn .18s var(--ease-out,ease);">
            <!-- Info del usuario -->
            <div style="padding:.875rem 1rem; border-bottom:1px solid rgba(255,255,255,.05);">
              <p style="font-size:.65rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.08em; margin-bottom:.25rem;">Operador Activo</p>
              <p style="font-size:.875rem; font-weight:800; color:#f1f5f9;"><?= htmlspecialchars($currentUser['name']) ?></p>
              <span style="display:inline-block; margin-top:.25rem; font-size:.6rem; font-weight:700; padding:.15rem .5rem; border-radius:9999px;
                           background:<?= $currentUser['role'] === 'ADMIN' ? 'rgba(139,92,246,.15)' : 'rgba(59,130,246,.15)' ?>;
                           color:<?= $currentUser['role'] === 'ADMIN' ? '#a78bfa' : '#60a5fa' ?>;
                           border:1px solid <?= $currentUser['role'] === 'ADMIN' ? 'rgba(139,92,246,.3)' : 'rgba(59,130,246,.3)' ?>;
                           text-transform:uppercase; letter-spacing:.06em;">
                <?= $currentUser['role'] === 'ADMIN' ? 'Administrador' : 'Operador de Turno' ?>
              </span>
            </div>
            <!-- Acciones de Cuenta -->
            <div style="padding:.5rem;">
              <form action="actions/logout.php" method="POST">
                <button type="submit" style="width:100%; display:flex; align-items:center; gap:.5rem; padding:.625rem .75rem; border-radius:10px; border:none; background:rgba(244,63,94,.1); cursor:pointer; transition:all .15s; color:#fb7185; font-size:.8rem; font-weight:700;"
                        onmouseover="this.style.background='rgba(244,63,94,.2)'" onmouseout="this.style.background='rgba(244,63,94,.1)'">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  <span>Cerrar Sesión</span>
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  </header>

  <!-- ── Contenido Principal ── -->
  <main style="flex:1; max-width:90rem; width:100%; margin:0 auto; padding:1.5rem 1.25rem; position:relative; z-index:1;">
