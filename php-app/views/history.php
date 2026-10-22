<?php
$db = getDB();

$filterStatus = $_GET['status'] ?? 'all';
$searchPlate  = trim($_GET['plate'] ?? '');

$query  = "SELECT * FROM `movements` WHERE 1=1";
$params = [];

if ($filterStatus !== 'all') { $query .= " AND `status` = ?"; $params[] = $filterStatus; }
if ($searchPlate !== '')     { $query .= " AND `plate` LIKE ?"; $params[] = '%' . strtoupper($searchPlate) . '%'; }

$query .= " ORDER BY `entry_time` DESC LIMIT 200";
$stmt = $db->prepare($query);
$stmt->execute($params);
$history = $stmt->fetchAll();

$totalCollected  = 0;
$countCompleted  = 0;
foreach ($history as $h) {
  if ($h['status'] === 'completado') {
    $totalCollected += (float)($h['total_paid'] ?? 0);
    $countCompleted++;
  }
}
?>

<div style="display:flex; flex-direction:column; gap:1.5rem;">

  <!-- ── Header ── -->
  <div style="display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
    <div>
      <h1 style="margin:0; font-size:1.375rem; font-weight:900; color:#f1f5f9; letter-spacing:-.02em;">Historial y Auditoría</h1>
      <p style="margin:.25rem 0 0; font-size:.8rem; color:#475569;">Registro completo de movimientos, tickets y facturación</p>
    </div>

    <!-- Búsqueda por placa -->
    <form method="GET" action="index.php" style="display:flex; align-items:center; gap:.5rem;">
      <input type="hidden" name="view" value="history">
      <input type="hidden" name="status" value="<?= htmlspecialchars($filterStatus) ?>">
      <div style="position:relative;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
             style="position:absolute; left:.75rem; top:50%; transform:translateY(-50%); color:#475569; pointer-events:none;">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" name="plate" value="<?= htmlspecialchars($searchPlate) ?>"
               placeholder="Buscar por placa..."
               style="background:rgba(4,7,17,.8); border:1px solid rgba(255,255,255,.08); color:#f1f5f9;
                      border-radius:10px; padding:.55rem .875rem .55rem 2.25rem; font-size:.8125rem;
                      outline:none; width:200px; font-family:'JetBrains Mono',monospace; font-weight:700;
                      letter-spacing:.06em; text-transform:uppercase;"
               oninput="this.value=this.value.toUpperCase()">
      </div>
      <button type="submit" style="padding:.55rem 1rem; background:rgba(59,130,246,.12); border:1px solid rgba(59,130,246,.25);
              color:#60a5fa; border-radius:10px; font-size:.8rem; font-weight:700; cursor:pointer; transition:all .15s;"
              onmouseover="this.style.background='rgba(59,130,246,.2)'" onmouseout="this.style.background='rgba(59,130,246,.12)'">
        Buscar
      </button>
    </form>
  </div>

  <!-- ── Filtros de Estado + Resumen ── -->
  <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.875rem;
              padding:1rem 1.25rem; background:var(--bg-card,#111b30); border:1px solid rgba(255,255,255,.07); border-radius:14px;">

    <!-- Filtros -->
    <div style="display:flex; align-items:center; gap:.375rem;">
      <span style="font-size:.65rem; font-weight:700; color:#2d3d54; text-transform:uppercase; letter-spacing:.07em; margin-right:.25rem;">Estado:</span>
      <?php
        $filters = [
          'all'        => ['Todos',       '#f1f5f9', 'rgba(255,255,255,.06)', 'rgba(255,255,255,.12)'],
          'completado' => ['Completados', '#34d399',  'rgba(16,185,129,.12)',  'rgba(16,185,129,.3)'],
          'activo'     => ['Activos',     '#60a5fa',  'rgba(59,130,246,.12)',  'rgba(59,130,246,.3)'],
          'cancelado'  => ['Cancelados',  '#fb7185',  'rgba(244,63,94,.12)',   'rgba(244,63,94,.3)'],
        ];
        foreach ($filters as $fKey => $fMeta):
          $isActive = $filterStatus === $fKey;
      ?>
        <a href="index.php?view=history&status=<?= $fKey ?><?= $searchPlate ? '&plate='.urlencode($searchPlate) : '' ?>"
           style="padding:.3rem .75rem; font-size:.7rem; font-weight:700; border-radius:8px; text-decoration:none;
                  color:<?= $isActive ? $fMeta[1] : '#64748b' ?>;
                  background:<?= $isActive ? $fMeta[2] : 'transparent' ?>;
                  border:1px solid <?= $isActive ? $fMeta[3] : 'rgba(255,255,255,.06)' ?>;">
          <?= $fMeta[0] ?>
        </a>
      <?php endforeach; ?>
    </div>

    <!-- Resumen de recaudo -->
    <div style="display:flex; align-items:center; gap:1rem;">
      <div style="text-align:right;">
        <span style="font-size:.65rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.06em; display:block;">Total Facturado (<?= $countCompleted ?> cobros)</span>
        <span style="font-family:'JetBrains Mono',monospace; font-size:1.125rem; font-weight:900; color:#34d399; text-shadow:0 0 12px rgba(52,211,153,.25);"><?= formatCOP($totalCollected) ?></span>
      </div>
      <div style="width:1px; height:36px; background:rgba(255,255,255,.06);"></div>
      <div style="text-align:right;">
        <span style="font-size:.65rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.06em; display:block;">Registros</span>
        <span style="font-family:'JetBrains Mono',monospace; font-size:1.125rem; font-weight:900; color:#60a5fa;"><?= count($history) ?></span>
      </div>
    </div>
  </div>

  <!-- ── Tabla Histórica ── -->
  <div style="background:var(--bg-card,#111b30); border:1px solid rgba(255,255,255,.07); border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.25);">
    <?php if (empty($history)): ?>
      <div style="text-align:center; padding:4rem 1rem; color:#2d3d54;">
        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
             style="margin:0 auto 1rem; display:block; opacity:.25;">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        <p style="font-size:.9rem; font-weight:700; color:#475569; margin:0 0 .25rem;">Sin registros para este filtro</p>
        <p style="font-size:.75rem; color:#2d3d54;">Intenta cambiar el estado o la búsqueda</p>
      </div>
    <?php else: ?>
      <div style="overflow-x:auto;">
        <table class="pf-table" style="min-width:780px;">
          <thead>
            <tr>
              <th style="padding-left:1.25rem;">Ticket</th>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Celda</th>
              <th>Ingreso</th>
              <th>Salida</th>
              <th>Tiempo</th>
              <th>Estado</th>
              <th>Medio</th>
              <th style="text-align:right; padding-right:1.25rem;">Total</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($history as $h):
              $mins = (int)($h['total_minutes'] ?? 0);
              $hh   = floor($mins / 60);
              $mm   = $mins % 60;

              $statusBadge = [
                'completado' => 'badge-green',
                'activo'     => 'badge-blue',
                'cancelado'  => 'badge-rose',
              ][$h['status']] ?? 'badge-gray';

              $methodIcons = [
                'efectivo'  => '💵',
                'nequi'     => '💜',
                'daviplata' => '🟠',
                'tarjeta'   => '💳',
                'convenio'  => '🏢',
              ];
              $mIcon = $methodIcons[$h['payment_method']] ?? '—';

              $typeColors = ['automovil'=>'badge-blue','motocicleta'=>'badge-amber','camioneta'=>'badge-purple','bicicleta'=>'badge-green'];
              $typeBadge  = $typeColors[$h['vehicle_type']] ?? 'badge-gray';
            ?>
              <tr>
                <td style="padding-left:1.25rem;">
                  <span style="font-family:'JetBrains Mono',monospace; font-size:.7rem; font-weight:700; color:#475569;"><?= htmlspecialchars($h['ticket_number']) ?></span>
                </td>
                <td>
                  <span style="font-family:'JetBrains Mono',monospace; font-size:.825rem; font-weight:900; color:#fbbf24; letter-spacing:.08em;"><?= htmlspecialchars($h['plate']) ?></span>
                </td>
                <td><span class="badge <?= $typeBadge ?>"><?= $h['vehicle_type'] ?></span></td>
                <td>
                  <span style="font-family:'JetBrains Mono',monospace; font-size:.8rem; font-weight:800; color:#60a5fa;"><?= htmlspecialchars($h['space_code']) ?></span>
                </td>
                <td>
                  <span style="font-size:.75rem; font-weight:600; color:#64748b; font-family:'JetBrains Mono',monospace;"><?= date('d/m H:i', strtotime($h['entry_time'])) ?></span>
                </td>
                <td>
                  <span style="font-size:.75rem; font-weight:600; color:<?= $h['exit_time'] ? '#94a3b8' : '#2d3d54' ?>; font-family:'JetBrains Mono',monospace;">
                    <?= $h['exit_time'] ? date('d/m H:i', strtotime($h['exit_time'])) : '—' ?>
                  </span>
                </td>
                <td>
                  <?php if ($mins > 0): ?>
                    <span style="font-family:'JetBrains Mono',monospace; font-size:.75rem; font-weight:700; color:#60a5fa;">
                      <?= $hh > 0 ? "{$hh}h " : '' ?><?= $mm ?>m
                    </span>
                  <?php else: ?>
                    <span style="color:#2d3d54;">—</span>
                  <?php endif; ?>
                </td>
                <td><span class="badge <?= $statusBadge ?>"><?= $h['status'] ?></span></td>
                <td>
                  <span style="font-size:.75rem; color:#64748b;">
                    <?= $mIcon ?> <span style="font-weight:600; text-transform:uppercase; font-size:.65rem;"><?= $h['payment_method'] ?: '—' ?></span>
                  </span>
                </td>
                <td style="text-align:right; padding-right:1.25rem;">
                  <?php if ($h['total_paid'] !== null && $h['status'] === 'completado'): ?>
                    <span style="font-family:'JetBrains Mono',monospace; font-size:.825rem; font-weight:900; color:#34d399;"><?= formatCOP($h['total_paid']) ?></span>
                  <?php else: ?>
                    <span style="color:#2d3d54; font-size:.75rem;">—</span>
                  <?php endif; ?>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
      <div style="padding:.75rem 1.25rem; border-top:1px solid rgba(255,255,255,.04); display:flex; align-items:center; justify-content:space-between;">
        <span style="font-size:.72rem; color:#2d3d54; font-weight:600;">Mostrando <?= count($history) ?> de los últimos 200 registros</span>
        <span style="font-size:.72rem; color:#2d3d54;">Ordenado por fecha de ingreso desc.</span>
      </div>
    <?php endif; ?>
  </div>

</div>
