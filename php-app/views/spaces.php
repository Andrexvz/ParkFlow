<?php
$db = getDB();
$spaces = $db->query("SELECT * FROM `parking_spaces` ORDER BY `zone` ASC, `code` ASC")->fetchAll();

// Contadores resumen
$total    = count($spaces);
$libre    = 0; $ocupado = 0; $maint = 0;
foreach ($spaces as $s) {
  if ($s['status'] === 'libre')      $libre++;
  elseif ($s['status'] === 'ocupado') $ocupado++;
  else $maint++;
}
?>

<div style="display:flex; flex-direction:column; gap:1.5rem;">

  <!-- ── Header de la Vista ── -->
  <div style="display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
    <div>
      <h1 style="margin:0; font-size:1.375rem; font-weight:900; color:#f1f5f9; letter-spacing:-.02em;">Gestión de Celdas</h1>
      <p style="margin:.25rem 0 0; font-size:.8rem; color:#475569;">Creación, estados y configuración de zonas del parqueadero</p>
    </div>
    <button onclick="document.getElementById('newSpaceModal').style.display='flex'"
            class="btn-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Agregar Nueva Celda
    </button>
  </div>

  <!-- ── Resumen Rápido ── -->
  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:.75rem;">
    <div style="padding:.875rem 1rem; background:var(--bg-card,#111b30); border:1px solid rgba(255,255,255,.07); border-radius:12px; display:flex; align-items:center; gap:.75rem;">
      <div style="width:36px; height:36px; border-radius:9px; background:rgba(59,130,246,.1); border:1px solid rgba(59,130,246,.2); display:flex; align-items:center; justify-content:center; color:#60a5fa; flex-shrink:0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
      </div>
      <div>
        <p style="margin:0; font-size:1.25rem; font-weight:900; color:#f1f5f9; font-family:'JetBrains Mono',monospace;"><?= $total ?></p>
        <p style="margin:0; font-size:.65rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.06em;">Total Celdas</p>
      </div>
    </div>
    <div style="padding:.875rem 1rem; background:var(--bg-card,#111b30); border:1px solid rgba(16,185,129,.15); border-radius:12px; display:flex; align-items:center; gap:.75rem;">
      <div style="width:36px; height:36px; border-radius:9px; background:rgba(16,185,129,.12); border:1px solid rgba(16,185,129,.25); display:flex; align-items:center; justify-content:center; color:#34d399; flex-shrink:0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div>
        <p style="margin:0; font-size:1.25rem; font-weight:900; color:#34d399; font-family:'JetBrains Mono',monospace;"><?= $libre ?></p>
        <p style="margin:0; font-size:.65rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.06em;">Disponibles</p>
      </div>
    </div>
    <div style="padding:.875rem 1rem; background:var(--bg-card,#111b30); border:1px solid rgba(59,130,246,.15); border-radius:12px; display:flex; align-items:center; gap:.75rem;">
      <div style="width:36px; height:36px; border-radius:9px; background:rgba(59,130,246,.12); border:1px solid rgba(59,130,246,.25); display:flex; align-items:center; justify-content:center; color:#60a5fa; flex-shrink:0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      </div>
      <div>
        <p style="margin:0; font-size:1.25rem; font-weight:900; color:#60a5fa; font-family:'JetBrains Mono',monospace;"><?= $ocupado ?></p>
        <p style="margin:0; font-size:.65rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.06em;">Ocupadas</p>
      </div>
    </div>
    <div style="padding:.875rem 1rem; background:var(--bg-card,#111b30); border:1px solid rgba(245,158,11,.15); border-radius:12px; display:flex; align-items:center; gap:.75rem;">
      <div style="width:36px; height:36px; border-radius:9px; background:rgba(245,158,11,.12); border:1px solid rgba(245,158,11,.25); display:flex; align-items:center; justify-content:center; color:#fbbf24; flex-shrink:0;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      </div>
      <div>
        <p style="margin:0; font-size:1.25rem; font-weight:900; color:#fbbf24; font-family:'JetBrains Mono',monospace;"><?= $maint ?></p>
        <p style="margin:0; font-size:.65rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.06em;">Mantenimiento</p>
      </div>
    </div>
  </div>

  <!-- ── Tabla de Celdas ── -->
  <div style="background:var(--bg-card,#111b30); border:1px solid rgba(255,255,255,.07); border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.25);">
    <div style="overflow-x:auto;">
      <table class="pf-table" style="min-width:640px;">
        <thead>
          <tr>
            <th style="padding-left:1.25rem;">Código</th>
            <th>Zona</th>
            <th>Tipo Permitido</th>
            <th>Estado</th>
            <th>Vehículo Actual</th>
            <th>Notas</th>
            <th style="text-align:right; padding-right:1.25rem;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($spaces as $s): ?>
            <tr>
              <td style="padding-left:1.25rem;">
                <span style="font-family:'JetBrains Mono',monospace; font-size:.875rem; font-weight:900; color:#f1f5f9;"><?= htmlspecialchars($s['code']) ?></span>
              </td>
              <td>
                <span style="font-size:.8rem; font-weight:700; color:#94a3b8;"><?= htmlspecialchars($s['zone']) ?></span>
              </td>
              <td>
                <?php
                  $typeColors = ['automovil'=>'badge-blue','motocicleta'=>'badge-amber','camioneta'=>'badge-purple','bicicleta'=>'badge-green'];
                  $typeBadge = $typeColors[$s['allowed_type']] ?? 'badge-gray';
                ?>
                <span class="badge <?= $typeBadge ?>"><?= htmlspecialchars($s['allowed_type']) ?></span>
              </td>
              <td>
                <?php
                  $statusBadge = [
                    'libre'        => 'badge-green',
                    'ocupado'      => 'badge-blue',
                    'mantenimiento'=> 'badge-amber',
                    'reservado'    => 'badge-purple',
                  ][$s['status']] ?? 'badge-gray';
                ?>
                <span class="badge <?= $statusBadge ?>"><?= htmlspecialchars($s['status']) ?></span>
              </td>
              <td>
                <?php if ($s['current_vehicle_plate']): ?>
                  <span style="font-family:'JetBrains Mono',monospace; font-size:.8rem; font-weight:800; color:#fbbf24; letter-spacing:.06em;"><?= htmlspecialchars($s['current_vehicle_plate']) ?></span>
                <?php else: ?>
                  <span style="color:#2d3d54; font-weight:600;">—</span>
                <?php endif; ?>
              </td>
              <td>
                <span style="font-size:.75rem; color:#475569; max-width:160px; display:inline-block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="<?= htmlspecialchars($s['notes'] ?? '') ?>">
                  <?= htmlspecialchars($s['notes'] ?: '—') ?>
                </span>
              </td>
              <td style="text-align:right; padding-right:1.25rem;">
                <?php if ($s['status'] !== 'ocupado'): ?>
                  <div style="display:inline-flex; align-items:center; gap:.375rem;">
                    <!-- Toggle Mantenimiento / Libre -->
                    <form action="actions/spaces.php" method="POST" style="display:inline;">
                      <input type="hidden" name="action" value="toggle_status">
                      <input type="hidden" name="space_id" value="<?= $s['id'] ?>">
                      <input type="hidden" name="status" value="<?= $s['status'] === 'mantenimiento' ? 'libre' : 'mantenimiento' ?>">
                      <button type="submit" class="btn-ghost" style="font-size:.7rem; padding:.3rem .625rem;">
                        <?= $s['status'] === 'mantenimiento' ? '✓ Habilitar' : '⚙ Mantenimiento' ?>
                      </button>
                    </form>
                    <!-- Eliminar -->
                    <form action="actions/spaces.php" method="POST" style="display:inline;" onsubmit="return confirm('¿Eliminar la celda <?= htmlspecialchars($s['code']) ?>? Esta acción no se puede deshacer.');">
                      <input type="hidden" name="action" value="delete">
                      <input type="hidden" name="space_id" value="<?= $s['id'] ?>">
                      <button type="submit" class="btn-danger" style="font-size:.7rem; padding:.3rem .5rem; width:32px; justify-content:center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </form>
                  </div>
                <?php else: ?>
                  <span style="font-size:.7rem; font-weight:600; color:#2d3d54; padding:.3rem .625rem; background:rgba(59,130,246,.08); border-radius:6px; border:1px solid rgba(59,130,246,.15); color:#60a5fa;">En uso</span>
                <?php endif; ?>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>

</div>

<!-- ── Modal Nueva Celda ── -->
<div id="newSpaceModal"
     style="display:none; position:fixed; inset:0; z-index:100; align-items:center; justify-content:center; padding:1rem; background:rgba(4,7,17,.85); backdrop-filter:blur(16px);"
     onclick="if(event.target===this)this.style.display='none'">
  <div class="pf-modal" style="max-width:440px;">

    <div class="pf-modal-header">
      <div style="display:flex; align-items:center; gap:.75rem;">
        <div style="width:36px; height:36px; border-radius:9px; background:rgba(59,130,246,.12); border:1px solid rgba(59,130,246,.25); display:flex; align-items:center; justify-content:center; color:#60a5fa;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <div>
          <h3 style="margin:0; font-size:.9375rem; font-weight:800; color:#f1f5f9;">Crear Nueva Celda</h3>
          <p style="margin:.125rem 0 0; font-size:.7rem; color:#475569;">Agregar espacio al parqueadero</p>
        </div>
      </div>
      <button onclick="document.getElementById('newSpaceModal').style.display='none'" class="modal-close-btn">✕</button>
    </div>

    <div class="pf-modal-body">
      <form action="actions/spaces.php" method="POST" style="display:flex; flex-direction:column; gap:1rem;">
        <input type="hidden" name="action" value="create">

        <div>
          <label class="pf-label">Código de Celda *</label>
          <input type="text" name="code" required placeholder="Ej: A-11, B-16, C-05..."
                 class="pf-input" style="font-family:'JetBrains Mono',monospace; font-weight:800; text-transform:uppercase; letter-spacing:.08em;">
        </div>

        <div>
          <label class="pf-label">Zona *</label>
          <select name="zone" class="pf-select">
            <option value="Zona A">Zona A</option>
            <option value="Zona B">Zona B</option>
            <option value="Zona C">Zona C</option>
            <option value="Zona D">Zona D</option>
          </select>
        </div>

        <div>
          <label class="pf-label">Tipo de Vehículo Permitido *</label>
          <select name="allowed_type" class="pf-select">
            <option value="automovil">Automóvil</option>
            <option value="motocicleta">Motocicleta</option>
            <option value="camioneta">Camioneta / SUV</option>
            <option value="bicicleta">Bicicleta</option>
          </select>
        </div>

        <div>
          <label class="pf-label">Notas / Observaciones</label>
          <input type="text" name="notes" placeholder="Ej: Cerca a la entrada principal..." class="pf-input">
        </div>

        <div style="display:flex; align-items:center; justify-content:flex-end; gap:.625rem; padding-top:.5rem; border-top:1px solid rgba(255,255,255,.05);">
          <button type="button" onclick="document.getElementById('newSpaceModal').style.display='none'" class="btn-ghost">Cancelar</button>
          <button type="submit" class="btn-primary">Guardar Celda</button>
        </div>
      </form>
    </div>
  </div>
</div>
