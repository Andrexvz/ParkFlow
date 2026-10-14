<?php
$db = getDB();

$filterStatus = $_GET['status'] ?? 'all';
$query = "SELECT * FROM `movements` WHERE 1=1";
$params = [];

if ($filterStatus !== 'all') {
    $query .= " AND `status` = ?";
    $params[] = $filterStatus;
}

$query .= " ORDER BY `entry_time` DESC LIMIT 150";
$stmt = $db->prepare($query);
$stmt->execute($params);
$history = $stmt->fetchAll();

$totalCollected = array_reduce($history, function($acc, $curr) {
    return $acc + ($curr['total_paid'] ?? 0);
}, 0);
?>

<div class="space-y-6">
  <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
    <div>
      <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">Historial y Auditoría de Movimientos</h1>
      <p class="text-xs text-slate-500 mt-0.5">Registro inmutable de tickets, facturación y arqueo de caja</p>
    </div>

    <!-- Filtros de estado -->
    <div class="flex items-center gap-2">
      <a href="index.php?view=history&status=all" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all <?= $filterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200' ?>">
        Todos
      </a>
      <a href="index.php?view=history&status=completado" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all <?= $filterStatus === 'completado' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200' ?>">
        Completados
      </a>
      <a href="index.php?view=history&status=activo" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all <?= $filterStatus === 'activo' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200' ?>">
        Activos
      </a>
      <a href="index.php?view=history&status=cancelado" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all <?= $filterStatus === 'cancelado' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200' ?>">
        Cancelados
      </a>
    </div>
  </div>

  <!-- Resumen de recaudos en el filtro -->
  <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
    <div class="text-xs text-emerald-900">
      <span class="font-bold">Total Facturado en este listado:</span>
      <span>(<?= count($history) ?> registros)</span>
    </div>
    <div class="text-lg font-mono font-extrabold text-emerald-700">
      <?= formatCOP($totalCollected) ?>
    </div>
  </div>

  <!-- Tabla Histórica -->
  <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
          <tr>
            <th class="py-3 px-4">Ticket</th>
            <th class="py-3 px-4">Placa</th>
            <th class="py-3 px-4">Celda</th>
            <th class="py-3 px-4">Ingreso</th>
            <th class="py-3 px-4">Salida</th>
            <th class="py-3 px-4">Estancia</th>
            <th class="py-3 px-4">Estado</th>
            <th class="py-3 px-4">Medio Pago</th>
            <th class="py-3 px-4 text-right">Total Pagado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          <?php foreach ($history as $h): ?>
            <tr class="hover:bg-slate-50">
              <td class="py-3 px-4 font-mono font-bold text-slate-800"><?= $h['ticket_number'] ?></td>
              <td class="py-3 px-4 font-mono font-black text-slate-900"><?= $h['plate'] ?></td>
              <td class="py-3 px-4 font-bold text-blue-600"><?= $h['space_code'] ?></td>
              <td class="py-3 px-4 text-slate-500"><?= date('d/m H:i', strtotime($h['entry_time'])) ?></td>
              <td class="py-3 px-4 text-slate-500"><?= $h['exit_time'] ? date('d/m H:i', strtotime($h['exit_time'])) : '—' ?></td>
              <td class="py-3 px-4 text-slate-600"><?= $h['total_minutes'] ? $h['total_minutes'] . ' min' : '—' ?></td>
              <td class="py-3 px-4">
                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase
                  <?= $h['status'] === 'completado' ? 'bg-emerald-100 text-emerald-800' : '' ?>
                  <?= $h['status'] === 'activo' ? 'bg-blue-100 text-blue-800' : '' ?>
                  <?= $h['status'] === 'cancelado' ? 'bg-rose-100 text-rose-800' : '' ?>">
                  <?= $h['status'] ?>
                </span>
              </td>
              <td class="py-3 px-4 uppercase text-slate-600"><?= $h['payment_method'] ?: '—' ?></td>
              <td class="py-3 px-4 text-right font-mono font-bold text-slate-900">
                <?= $h['total_paid'] !== null ? formatCOP($h['total_paid']) : '—' ?>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>
