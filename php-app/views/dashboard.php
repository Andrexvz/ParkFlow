<?php
$db = getDB();

// 1. Estadísticas Generales
$totalSpaces    = (int)$db->query("SELECT COUNT(*) FROM `parking_spaces`")->fetchColumn();
$occupiedSpaces = (int)$db->query("SELECT COUNT(*) FROM `parking_spaces` WHERE `status` = 'ocupado'")->fetchColumn();
$freeSpaces     = (int)$db->query("SELECT COUNT(*) FROM `parking_spaces` WHERE `status` = 'libre'")->fetchColumn();
$maintSpaces    = (int)$db->query("SELECT COUNT(*) FROM `parking_spaces` WHERE `status` IN ('mantenimiento','reservado')")->fetchColumn();
$occupancyRate  = $totalSpaces > 0 ? (int)round(($occupiedSpaces / $totalSpaces) * 100) : 0;

// 2. Métricas del día
$todayMetrics = $db->query("
    SELECT
        COALESCE(SUM(`total_paid`), 0)  AS revenue,
        COUNT(*)                         AS completed_count,
        COALESCE(AVG(`total_minutes`), 0) AS avg_stay
    FROM `movements`
    WHERE `status` = 'completado' AND DATE(`exit_time`) = CURRENT_DATE()
")->fetch();

$todayRevenue        = (float)$todayMetrics['revenue'];
$todayCompletedCount = (int)$todayMetrics['completed_count'];
$averageStay         = (int)round((float)$todayMetrics['avg_stay']);
$todayEntriesCount   = (int)$db->query("SELECT COUNT(*) FROM `movements` WHERE DATE(`entry_time`) = CURRENT_DATE()")->fetchColumn();

// 3. Distribución por método de pago
$paymentsBreakdown = $db->query("
    SELECT `payment_method`, COALESCE(SUM(`total_paid`), 0) as total, COUNT(*) as qty
    FROM `movements`
    WHERE `status` = 'completado' AND DATE(`exit_time`) = CURRENT_DATE()
    GROUP BY `payment_method`
    ORDER BY total DESC
")->fetchAll();

$maxPaymentTotal = 0;
foreach ($paymentsBreakdown as $p) { if ((float)$p['total'] > $maxPaymentTotal) $maxPaymentTotal = (float)$p['total']; }

// 4. Últimos movimientos completados
$recentCompleted = $db->query("
    SELECT * FROM `movements`
    WHERE `status` = 'completado'
    ORDER BY `exit_time` DESC
    LIMIT 8
")->fetchAll();

// 5. Vehículos activos ahora
$activeVehicles = $db->query("SELECT COUNT(*) FROM `movements` WHERE `status` = 'activo'")->fetchColumn();
?>

<div style="display:flex; flex-direction:column; gap:1.5rem;">

  <!-- ── Bienvenida / Page Title ── -->
  <div style="display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:.75rem;">
    <div>
      <h1 style="font-size:1.5rem; font-weight:900; color:#f1f5f9; letter-spacing:-.02em; margin:0;">
        Panel de Control
      </h1>
      <p style="margin:.25rem 0 0; font-size:.8125rem; color:#475569;">
        <?= date('l, d \d\e F \d\e Y') ?> · Parqueadero ParkFlow, Neiva
      </p>
    </div>
    <a href="index.php?view=history" style="display:inline-flex; align-items:center; gap:.375rem; font-size:.75rem; font-weight:700; color:#60a5fa; text-decoration:none; padding:.375rem .75rem; border:1px solid rgba(59,130,246,.25); border-radius:8px; background:rgba(59,130,246,.08); transition:all .15s;"
       onmouseover="this.style.background='rgba(59,130,246,.15)'" onmouseout="this.style.background='rgba(59,130,246,.08)'">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      Ver Historial Completo
    </a>
  </div>

  <!-- ══ FILA 1: Métricas KPI ══ -->
  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">

    <!-- Recaudo de Hoy -->
    <div class="metric-card accent-green" style="cursor:default;">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <span class="metric-label">Recaudo de Hoy</span>
        <div class="metric-icon" style="background:rgba(16,185,129,.12); border:1px solid rgba(16,185,129,.25); color:#34d399;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
      </div>
      <p class="metric-value text-neon-green glow-green" style="font-size:1.5rem;"><?= formatCOP($todayRevenue) ?></p>
      <p class="metric-sub"><?= $todayCompletedCount ?> liquidaciones · <span style="color:#34d399;"><?= $todayEntriesCount ?> entradas hoy</span></p>
    </div>

    <!-- Ocupación Actual -->
    <div class="metric-card accent-blue" style="cursor:default;">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <span class="metric-label">Ocupación Actual</span>
        <div class="metric-icon" style="background:rgba(59,130,246,.12); border:1px solid rgba(59,130,246,.25); color:#60a5fa;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
        </div>
      </div>
      <p class="metric-value text-neon-blue" style="font-size:1.5rem;"><?= $occupancyRate ?>%</p>
      <div class="progress-bar-track" style="margin-top:.625rem; margin-bottom:.375rem;">
        <div class="progress-bar-fill" style="width:<?= min(100,$occupancyRate) ?>%; background:<?= $occupancyRate > 85 ? 'linear-gradient(90deg,#f43f5e,#fb7185)' : ($occupancyRate > 60 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#059669,#10b981)') ?>;"></div>
      </div>
      <p class="metric-sub"><?= $occupiedSpaces ?> ocupadas · <?= $freeSpaces ?> libres · <?= $maintSpaces ?> mant.</p>
    </div>

    <!-- Vehículos en el Parqueadero -->
    <div class="metric-card accent-amber" style="cursor:default;">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <span class="metric-label">Activos Ahora</span>
        <div class="metric-icon" style="background:rgba(245,158,11,.12); border:1px solid rgba(245,158,11,.25); color:#fbbf24;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>
      </div>
      <p class="metric-value text-neon-amber"><?= $activeVehicles ?></p>
      <p class="metric-sub">Vehículos dentro del parqueadero</p>
    </div>

    <!-- Estancia Promedio -->
    <div class="metric-card accent-purple" style="cursor:default;">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <span class="metric-label">Estancia Promedio</span>
        <div class="metric-icon" style="background:rgba(139,92,246,.12); border:1px solid rgba(139,92,246,.25); color:#a78bfa;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
      </div>
      <p class="metric-value text-neon-purple"><?= floor($averageStay / 60) ?>h <?= $averageStay % 60 ?>m</p>
      <p class="metric-sub"><?= $averageStay ?> minutos por estancia</p>
    </div>

  </div>

  <!-- ══ FILA 2: Métodos de Pago + Actividad Reciente ══ -->
  <div style="display:grid; grid-template-columns:1fr 2fr; gap:1.25rem; align-items:start;">

    <!-- Columna: Métodos de Pago -->
    <div class="pf-card" style="padding:1.25rem;">
      <div class="section-header">
        <h2 class="section-title">Recaudo por Método</h2>
        <div class="section-divider"></div>
      </div>

      <?php if (empty($paymentsBreakdown)): ?>
        <div style="text-align:center; padding:2rem 1rem; color:#2d3d54;">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto .75rem; display:block; opacity:.5;"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <p style="font-size:.8rem; font-weight:600;">Sin cobros registrados hoy</p>
        </div>
      <?php else: ?>
        <?php
          $methodIcons = [
            'efectivo'  => ['💵', '#34d399', 'rgba(16,185,129,.12)', 'rgba(16,185,129,.25)'],
            'nequi'     => ['💜', '#a78bfa', 'rgba(139,92,246,.12)', 'rgba(139,92,246,.25)'],
            'daviplata' => ['🟠', '#fbbf24', 'rgba(245,158,11,.12)', 'rgba(245,158,11,.25)'],
            'tarjeta'   => ['💳', '#60a5fa', 'rgba(59,130,246,.12)',  'rgba(59,130,246,.25)'],
            'convenio'  => ['🏢', '#94a3b8', 'rgba(100,116,139,.1)',  'rgba(100,116,139,.2)'],
          ];
          $totalAllMethods = array_sum(array_column($paymentsBreakdown, 'total'));
        ?>
        <div style="display:flex; flex-direction:column; gap:.75rem;">
          <?php foreach ($paymentsBreakdown as $pay):
            $meta = $methodIcons[$pay['payment_method']] ?? ['💰', '#94a3b8', 'rgba(100,116,139,.1)', 'rgba(100,116,139,.2)'];
            $pct = $totalAllMethods > 0 ? round(($pay['total'] / $totalAllMethods) * 100) : 0;
          ?>
            <div style="padding:.875rem; background:var(--bg-elevated,#162038); border:1px solid rgba(255,255,255,.06); border-radius:12px;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:.625rem;">
                <div style="display:flex; align-items:center; gap:.5rem;">
                  <span style="font-size:1rem;"><?= $meta[0] ?></span>
                  <div>
                    <span style="font-size:.7rem; font-weight:800; color:#f1f5f9; text-transform:uppercase; letter-spacing:.04em;"><?= $pay['payment_method'] ?></span>
                    <span style="display:block; font-size:.65rem; color:#475569;"><?= $pay['qty'] ?> transacciones</span>
                  </div>
                </div>
                <div style="text-align:right;">
                  <span style="font-family:'JetBrains Mono',monospace; font-size:.8125rem; font-weight:800; color:<?= $meta[1] ?>;"><?= formatCOP($pay['total']) ?></span>
                  <span style="display:block; font-size:.65rem; color:#2d3d54; font-weight:700;"><?= $pct ?>% del total</span>
                </div>
              </div>
              <!-- Barra de progreso -->
              <div class="progress-bar-track">
                <div class="payment-bar" style="width:<?= $pct ?>%; background:linear-gradient(90deg,<?= $meta[1] ?>,<?= $meta[1] ?>88);"></div>
              </div>
            </div>
          <?php endforeach; ?>

          <!-- Total del día -->
          <div style="padding:.75rem 1rem; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:12px; display:flex; align-items:center; justify-content:space-between;">
            <span style="font-size:.7rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.06em;">Total del día</span>
            <span style="font-family:'JetBrains Mono',monospace; font-size:.9375rem; font-weight:900; color:#34d399;"><?= formatCOP($todayRevenue) ?></span>
          </div>
        </div>
      <?php endif; ?>
    </div>

    <!-- Columna: Últimas Salidas -->
    <div class="pf-card" style="padding:1.25rem; overflow:hidden;">
      <div class="section-header">
        <h2 class="section-title">Últimas Salidas y Facturaciones</h2>
        <div class="section-divider"></div>
      </div>

      <?php if (empty($recentCompleted)): ?>
        <div style="text-align:center; padding:3rem 1rem; color:#2d3d54;">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 1rem; display:block; opacity:.3;"><rect x="1" y="3" width="15" height="13"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <p style="font-size:.875rem; font-weight:600; color:#475569;">Sin salidas registradas hoy todavía</p>
          <p style="font-size:.75rem; color:#2d3d54; margin-top:.25rem;">Los movimientos aparecerán aquí al procesar cobros</p>
        </div>
      <?php else: ?>
        <div style="overflow-x:auto; margin:-1.25rem; margin-top:0;">
          <table class="pf-table" style="min-width:500px;">
            <thead>
              <tr>
                <th style="padding-left:1.25rem;">Ticket</th>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Hora Salida</th>
                <th>Tiempo</th>
                <th>Método</th>
                <th style="text-align:right; padding-right:1.25rem;">Total Cobrado</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($recentCompleted as $rc):
                $mins = (int)$rc['total_minutes'];
                $hrs  = floor($mins / 60);
                $minR = $mins % 60;

                $methodBadge = [
                  'efectivo'  => 'badge-green',
                  'nequi'     => 'badge-purple',
                  'daviplata' => 'badge-amber',
                  'tarjeta'   => 'badge-blue',
                  'convenio'  => 'badge-gray',
                ][$rc['payment_method']] ?? 'badge-gray';
              ?>
                <tr>
                  <td style="padding-left:1.25rem;">
                    <span style="font-family:'JetBrains Mono',monospace; font-size:.75rem; font-weight:700; color:#475569;"><?= htmlspecialchars($rc['ticket_number']) ?></span>
                  </td>
                  <td>
                    <span style="font-family:'JetBrains Mono',monospace; font-size:.8125rem; font-weight:900; color:#fbbf24; letter-spacing:.06em;"><?= htmlspecialchars($rc['plate']) ?></span>
                  </td>
                  <td>
                    <span style="font-size:.7rem; font-weight:700; color:#64748b; text-transform:capitalize;"><?= $rc['vehicle_type'] ?></span>
                  </td>
                  <td>
                    <span style="font-size:.8rem; font-weight:600; color:#94a3b8;"><?= date('H:i', strtotime($rc['exit_time'])) ?></span>
                  </td>
                  <td>
                    <span style="font-size:.8rem; font-weight:700; color:#60a5fa; font-family:'JetBrains Mono',monospace;">
                      <?= $hrs > 0 ? "{$hrs}h " : '' ?><?= $minR ?>m
                    </span>
                  </td>
                  <td>
                    <span class="badge <?= $methodBadge ?>"><?= $rc['payment_method'] ?></span>
                  </td>
                  <td style="text-align:right; padding-right:1.25rem;">
                    <span style="font-family:'JetBrains Mono',monospace; font-size:.875rem; font-weight:900; color:#34d399;"><?= formatCOP($rc['total_paid']) ?></span>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
        <div style="padding:.875rem 1.25rem; border-top:1px solid rgba(255,255,255,.04); text-align:center;">
          <a href="index.php?view=history" style="font-size:.75rem; font-weight:700; color:#60a5fa; text-decoration:none;">
            Ver historial completo →
          </a>
        </div>
      <?php endif; ?>
    </div>

  </div>

  <!-- ══ FILA 3: Estado de Zonas ══ -->
  <?php
  $zonesStats = $db->query("
    SELECT zone,
      COUNT(*) as total,
      SUM(status = 'libre') as free,
      SUM(status = 'ocupado') as occupied
    FROM parking_spaces
    GROUP BY zone
    ORDER BY zone ASC
  ")->fetchAll();
  ?>
  <?php if (!empty($zonesStats)): ?>
    <div class="pf-card" style="padding:1.25rem;">
      <div class="section-header">
        <h2 class="section-title">Estado por Zonas</h2>
        <div class="section-divider"></div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:.875rem;">
        <?php foreach ($zonesStats as $z):
          $zOcc = $z['total'] > 0 ? round(($z['occupied'] / $z['total']) * 100) : 0;
          $zColor = $zOcc > 85 ? '#fb7185' : ($zOcc > 60 ? '#fbbf24' : '#34d399');
        ?>
          <div style="padding:1rem; background:var(--bg-elevated,#162038); border:1px solid rgba(255,255,255,.06); border-radius:12px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:.625rem;">
              <span style="font-size:.875rem; font-weight:800; color:#f1f5f9;"><?= htmlspecialchars($z['zone']) ?></span>
              <span style="font-size:.75rem; font-weight:800; color:<?= $zColor ?>; font-family:'JetBrains Mono',monospace;"><?= $zOcc ?>%</span>
            </div>
            <div class="progress-bar-track" style="margin-bottom:.5rem;">
              <div class="progress-bar-fill" style="width:<?= $zOcc ?>%; background:<?= $zColor ?>;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:.65rem; font-weight:700; color:#475569;">
              <span><span style="color:#34d399;"><?= $z['free'] ?></span> libres</span>
              <span><span style="color:#60a5fa;"><?= $z['occupied'] ?></span> ocupadas</span>
              <span><?= $z['total'] ?> total</span>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  <?php endif; ?>

</div>
