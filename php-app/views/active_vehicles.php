<?php
$db = getDB();

$stmt = $db->query("
    SELECT * FROM `movements` 
    WHERE `status` = 'activo' 
    ORDER BY `entry_time` DESC
");
$activeMovements = $stmt->fetchAll();
?>

<div class="space-y-6">
  <!-- Encabezado de la Vista -->
  <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
    <div>
      <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">Vehículos Activos en Parqueadero</h1>
      <p class="text-xs text-slate-500 mt-0.5">Gestión de cobro y supervisión de estancias en curso</p>
    </div>

    <!-- Buscador en tiempo real -->
    <div class="w-full sm:w-72 relative">
      <input type="text" id="activeSearchInput" placeholder="Buscar por placa o ticket..."
        class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        onkeyup="filterActiveTable()">
      <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
    </div>
  </div>

  <!-- Tabla de Vehículos Activos -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs" id="activeTable">
        <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
          <tr>
            <th class="py-3 px-4">Ticket</th>
            <th class="py-3 px-4">Placa</th>
            <th class="py-3 px-4">Tipo</th>
            <th class="py-3 px-4">Celda</th>
            <th class="py-3 px-4">Hora Ingreso</th>
            <th class="py-3 px-4">Tiempo Estancia</th>
            <th class="py-3 px-4">Operador</th>
            <th class="py-3 px-4 text-right">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          <?php if (empty($activeMovements)): ?>
            <tr>
              <td colspan="8" class="text-center py-8 text-slate-400">
                No hay vehículos estacionados actualmente.
              </td>
            </tr>
          <?php else: ?>
            <?php foreach ($activeMovements as $m): 
              $entryTs = strtotime($m['entry_time']);
              $minutesAgo = max(1, round((time() - $entryTs) / 60));
              $hours = floor($minutesAgo / 60);
              $mins = $minutesAgo % 60;
            ?>
              <tr class="hover:bg-slate-50/80 transition-colors active-row">
                <td class="py-3.5 px-4 font-mono font-bold text-slate-700">
                  <?= htmlspecialchars($m['ticket_number']) ?>
                </td>
                <td class="py-3.5 px-4">
                  <span class="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <?= htmlspecialchars($m['plate']) ?>
                  </span>
                </td>
                <td class="py-3.5 px-4 capitalize text-slate-600">
                  <?= htmlspecialchars($m['vehicle_type']) ?>
                </td>
                <td class="py-3.5 px-4 font-bold text-blue-600">
                  <?= htmlspecialchars($m['space_code']) ?>
                </td>
                <td class="py-3.5 px-4 text-slate-600">
                  <?= date('H:i', $entryTs) ?> <span class="text-[10px] text-slate-400">(<?= date('d/m', $entryTs) ?>)</span>
                </td>
                <td class="py-3.5 px-4 font-bold text-emerald-600">
                  <?= $hours ?>h <?= $mins ?>m <span class="text-[10px] text-slate-400 font-normal">(<?= $minutesAgo ?>m)</span>
                </td>
                <td class="py-3.5 px-4 text-slate-500">
                  <?= htmlspecialchars($m['operator_entry_name']) ?>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button onclick='openExitModal(<?= json_encode($m, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP) ?>)'
                    class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg text-xs shadow-2xs transition-colors">
                    Cobrar y Salir
                  </button>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script>
function filterActiveTable() {
  const query = document.getElementById('activeSearchInput').value.toUpperCase();
  const rows = document.querySelectorAll('#activeTable .active-row');
  rows.forEach(row => {
    const text = row.textContent.toUpperCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}
</script>
