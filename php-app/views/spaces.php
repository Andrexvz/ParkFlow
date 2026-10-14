<?php
$db = getDB();

$spaces = $db->query("SELECT * FROM `parking_spaces` ORDER BY `zone` ASC, `code` ASC")->fetchAll();
?>

<div class="space-y-6">
  <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
    <div>
      <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">Gestión de Celdas de Parqueadero</h1>
      <p class="text-xs text-slate-500 mt-0.5">Creación, edición de estados y control de zonas</p>
    </div>

    <!-- Botón para modal de nueva celda -->
    <button onclick="document.getElementById('newSpaceModal').classList.remove('hidden')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs">
      <i data-lucide="plus" class="w-4 h-4"></i>
      <span>Agregar Nueva Celda</span>
    </button>
  </div>

  <!-- Tabla de Celdas -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
          <tr>
            <th class="py-3 px-4">Código</th>
            <th class="py-3 px-4">Zona</th>
            <th class="py-3 px-4">Tipo Permitido</th>
            <th class="py-3 px-4">Estado Actual</th>
            <th class="py-3 px-4">Vehículo Actual</th>
            <th class="py-3 px-4">Notas</th>
            <th class="py-3 px-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          <?php foreach ($spaces as $s): ?>
            <tr class="hover:bg-slate-50">
              <td class="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                <?= htmlspecialchars($s['code']) ?>
              </td>
              <td class="py-3.5 px-4 text-slate-700 font-semibold">
                <?= htmlspecialchars($s['zone']) ?>
              </td>
              <td class="py-3.5 px-4 capitalize text-slate-600">
                <?= htmlspecialchars($s['allowed_type']) ?>
              </td>
              <td class="py-3.5 px-4">
                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase
                  <?= $s['status'] === 'libre' ? 'bg-emerald-100 text-emerald-800' : '' ?>
                  <?= $s['status'] === 'ocupado' ? 'bg-blue-100 text-blue-800' : '' ?>
                  <?= $s['status'] === 'mantenimiento' ? 'bg-amber-100 text-amber-800' : '' ?>
                  <?= $s['status'] === 'reservado' ? 'bg-purple-100 text-purple-800' : '' ?>">
                  <?= $s['status'] ?>
                </span>
              </td>
              <td class="py-3.5 px-4 font-mono font-bold text-slate-800">
                <?= $s['current_vehicle_plate'] ?: '<span class="text-slate-300 font-normal">—</span>' ?>
              </td>
              <td class="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                <?= htmlspecialchars($s['notes'] ?: '—') ?>
              </td>
              <td class="py-3.5 px-4 text-right">
                <?php if ($s['status'] !== 'ocupado'): ?>
                  <div class="inline-flex items-center gap-1">
                    <!-- Cambiar a Libre o Mantenimiento -->
                    <form action="actions/spaces.php" method="POST" class="inline">
                      <input type="hidden" name="action" value="toggle_status">
                      <input type="hidden" name="space_id" value="<?= $s['id'] ?>">
                      <input type="hidden" name="status" value="<?= $s['status'] === 'mantenimiento' ? 'libre' : 'mantenimiento' ?>">
                      <button type="submit" class="px-2 py-1 text-[11px] font-semibold rounded hover:bg-slate-100 text-slate-600">
                        <?= $s['status'] === 'mantenimiento' ? 'Habilitar' : 'Mantenimiento' ?>
                      </button>
                    </form>
                    <!-- Eliminar -->
                    <form action="actions/spaces.php" method="POST" class="inline" onsubmit="return confirm('¿Eliminar la celda <?= $s['code'] ?>?');">
                      <input type="hidden" name="action" value="delete">
                      <input type="hidden" name="space_id" value="<?= $s['id'] ?>">
                      <button type="submit" class="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </form>
                  </div>
                <?php else: ?>
                  <span class="text-[10px] text-slate-400">Ocupada</span>
                <?php endif; ?>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Modal Nueva Celda -->
<div id="newSpaceModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
  <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
      <h3 class="font-bold text-slate-900 text-base">Crear Nueva Celda</h3>
      <button onclick="document.getElementById('newSpaceModal').classList.add('hidden')" class="text-slate-400">✕</button>
    </div>
    <form action="actions/spaces.php" method="POST" class="space-y-3.5">
      <input type="hidden" name="action" value="create">
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Código de Celda *</label>
        <input type="text" name="code" required placeholder="Ej: A-11, B-16, C-11..." class="w-full text-xs font-mono font-bold uppercase px-3 py-2 border rounded-xl">
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Zona *</label>
        <select name="zone" class="w-full text-xs font-semibold px-3 py-2 border rounded-xl bg-white">
          <option value="Zona A">Zona A</option>
          <option value="Zona B">Zona B</option>
          <option value="Zona C">Zona C</option>
          <option value="Zona D">Zona D</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Tipo de Vehículo Permitido *</label>
        <select name="allowed_type" class="w-full text-xs font-semibold px-3 py-2 border rounded-xl bg-white">
          <option value="automovil">Automóvil</option>
          <option value="motocicleta">Motocicleta</option>
          <option value="camioneta">Camioneta / SUV</option>
          <option value="bicicleta">Bicicleta</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1">Notas / Observaciones</label>
        <input type="text" name="notes" placeholder="Ej: Cerca a la entrada principal..." class="w-full text-xs px-3 py-2 border rounded-xl">
      </div>
      <div class="pt-2 flex justify-end gap-2">
        <button type="button" onclick="document.getElementById('newSpaceModal').classList.add('hidden')" class="px-3 py-2 text-xs font-semibold text-slate-600">Cancelar</button>
        <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl">Guardar Celda</button>
      </div>
    </form>
  </div>
</div>
