<?php
$db = getDB();
$activeMovements = $db->query("SELECT * FROM `movements` WHERE `status` = 'activo' ORDER BY `entry_time` DESC")->fetchAll();
$totalActive = count($activeMovements);
?>

<div style="display:flex; flex-direction:column; gap:1.5rem;">

  <!-- ── Header ── -->
  <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
    <div>
      <h1 style="margin:0; font-size:1.375rem; font-weight:900; color:#f1f5f9; letter-spacing:-.02em;">Vehículos Activos</h1>
      <p style="margin:.25rem 0 0; font-size:.8rem; color:#475569;">
        <?= $totalActive ?> vehículo<?= $totalActive !== 1 ? 's' : '' ?> actualmente estacionado<?= $totalActive !== 1 ? 's' : '' ?> en el parqueadero
      </p>
    </div>

    <!-- Buscador -->
    <div style="position:relative; width:280px; max-width:100%;">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
           style="position:absolute; left:.75rem; top:50%; transform:translateY(-50%); color:#475569; pointer-events:none;">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" id="activeSearchInput" placeholder="Buscar placa o ticket..."
             onkeyup="filterActiveTable()"
             style="width:100%; background:rgba(4,7,17,.8); border:1px solid rgba(255,255,255,.08); color:#f1f5f9;
                    border-radius:10px; padding:.55rem .875rem .55rem 2.25rem; font-size:.8125rem;
                    outline:none; transition:border-color .15s;"
             onfocus="this.style.borderColor='rgba(59,130,246,.5)'; this.style.boxShadow='0 0 0 3px rgba(59,130,246,.15)'"
             onblur="this.style.borderColor='rgba(255,255,255,.08)'; this.style.boxShadow='none'"
             placeholder="Buscar por placa o ticket...">
    </div>
  </div>

  <!-- ── Tabla de Vehículos Activos ── -->
  <div style="background:var(--bg-card,#111b30); border:1px solid rgba(255,255,255,.07); border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.3);">
    <?php if (empty($activeMovements)): ?>
      <div style="text-align:center; padding:5rem 1rem; color:#2d3d54;">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
             style="margin:0 auto 1.25rem; display:block; opacity:.25;">
          <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
        <p style="font-size:1rem; font-weight:700; color:#475569; margin:0 0 .375rem;">Parqueadero vacío</p>
        <p style="font-size:.8rem; color:#2d3d54;">Los vehículos registrados aparecerán aquí en tiempo real</p>
        <button onclick="openEntryModal()"
                style="margin-top:1.25rem; display:inline-flex; align-items:center; gap:.4rem; padding:.6rem 1.25rem;
                       background:rgba(59,130,246,.12); border:1px solid rgba(59,130,246,.25); border-radius:10px;
                       color:#60a5fa; font-size:.8125rem; font-weight:700; cursor:pointer; transition:all .15s;"
                onmouseover="this.style.background='rgba(59,130,246,.2)'"
                onmouseout="this.style.background='rgba(59,130,246,.12)'">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Registrar Primera Entrada
        </button>
      </div>
    <?php else: ?>
      <div style="overflow-x:auto;">
        <table class="pf-table" id="activeTable" style="min-width:700px;">
          <thead>
            <tr>
              <th style="padding-left:1.25rem;">Ticket</th>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Celda</th>
              <th>Hora Ingreso</th>
              <th>Tiempo Activo</th>
              <th>Operador</th>
              <th style="text-align:right; padding-right:1.25rem;">Acción</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($activeMovements as $m):
              $entryTs = strtotime($m['entry_time']);
              $minutesAgo = max(1, round((time() - $entryTs) / 60));
              $hours = floor($minutesAgo / 60);
              $mins  = $minutesAgo % 60;
              $isLong = $minutesAgo >= 120; // más de 2 horas
              $typeColors = ['automovil'=>'badge-blue','motocicleta'=>'badge-amber','camioneta'=>'badge-purple','bicicleta'=>'badge-green'];
              $typeBadge = $typeColors[$m['vehicle_type']] ?? 'badge-gray';
            ?>
              <tr class="active-row" style="cursor:default;">
                <td style="padding-left:1.25rem;">
                  <span style="font-family:'JetBrains Mono',monospace; font-size:.7rem; font-weight:700; color:#475569;"><?= htmlspecialchars($m['ticket_number']) ?></span>
                </td>
                <td>
                  <span style="display:inline-block; background:#070d18; border:1px solid rgba(245,158,11,.55); color:#fbbf24;
                               font-family:'JetBrains Mono',monospace; font-weight:900; font-size:.825rem;
                               letter-spacing:.1em; padding:.2rem .625rem; border-radius:6px;
                               text-shadow:0 0 8px rgba(251,191,36,.4);">
                    <?= htmlspecialchars($m['plate']) ?>
                  </span>
                </td>
                <td><span class="badge <?= $typeBadge ?>"><?= $m['vehicle_type'] ?></span></td>
                <td>
                  <span style="font-family:'JetBrains Mono',monospace; font-size:.8rem; font-weight:800; color:#60a5fa;"><?= htmlspecialchars($m['space_code']) ?></span>
                </td>
                <td>
                  <span style="font-size:.8rem; font-weight:600; color:#94a3b8; font-family:'JetBrains Mono',monospace;">
                    <?= date('H:i', $entryTs) ?>
                  </span>
                  <span style="font-size:.65rem; color:#475569; margin-left:.25rem;"><?= date('d/m', $entryTs) ?></span>
                </td>
                <td>
                  <div style="display:flex; align-items:center; gap:.375rem;">
                    <span style="font-family:'JetBrains Mono',monospace; font-size:.8125rem; font-weight:800;
                                 color:<?= $isLong ? '#fb7185' : '#34d399' ?>;">
                      <?= $hours > 0 ? "{$hours}h " : '' ?><?= $mins ?>m
                    </span>
                    <?php if ($isLong): ?>
                      <span style="font-size:.6rem; font-weight:700; color:#fb7185; background:rgba(244,63,94,.1); border:1px solid rgba(244,63,94,.2); padding:.1rem .4rem; border-radius:4px;">larga</span>
                    <?php endif; ?>
                  </div>
                </td>
                <td>
                  <span style="font-size:.75rem; color:#64748b; font-weight:600;"><?= htmlspecialchars($m['operator_entry_name']) ?></span>
                </td>
                <td style="text-align:right; padding-right:1.25rem;">
                  <button onclick='openExitModal(<?= json_encode($m, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP) ?>)'
                          class="btn-success" style="font-size:.75rem; padding:.4rem .875rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Cobrar y Salir
                  </button>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
      <!-- Footer de tabla -->
      <div style="padding:.75rem 1.25rem; border-top:1px solid rgba(255,255,255,.04); display:flex; align-items:center; justify-content:space-between;">
        <span style="font-size:.72rem; color:#2d3d54; font-weight:600;"><?= $totalActive ?> registros activos</span>
        <span style="font-size:.72rem; color:#2d3d54;">Actualizado al cargar la página · <a href="index.php?view=active" style="color:#475569; font-weight:700;">↻ Refrescar</a></span>
      </div>
    <?php endif; ?>
  </div>

</div>

<script>
function filterActiveTable() {
  const q = document.getElementById('activeSearchInput').value.toUpperCase();
  document.querySelectorAll('#activeTable .active-row').forEach(row => {
    row.style.display = row.textContent.toUpperCase().includes(q) ? '' : 'none';
  });
}
</script>
