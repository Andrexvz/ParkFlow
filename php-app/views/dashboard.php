<?php
$db = getDB();

// 1. Estadísticas Generales
$totalSpaces = (int)$db->query("SELECT COUNT(*) FROM `parking_spaces`")->fetchColumn();
$occupiedSpaces = (int)$db->query("SELECT COUNT(*) FROM `parking_spaces` WHERE `status` = 'ocupado'")->fetchColumn();
$occupancyRate = $totalSpaces > 0 ? (int)round(($occupiedSpaces / $totalSpaces) * 100) : 0;

// 2. Ingresos de Hoy
$todayMetrics = $db->query("
    SELECT 
        COALESCE(SUM(`total_paid`), 0) AS `revenue`,
        COUNT(*) AS `completed_count`,
        COALESCE(AVG(`total_minutes`), 0) AS `avg_stay`
    FROM `movements`
    WHERE `status` = 'completado' AND DATE(`exit_time`) = CURRENT_DATE()
")->fetch();

$todayRevenue = (float)$todayMetrics['revenue'];
$todayCompletedCount = (int)$todayMetrics['completed_count'];
$averageStay = (int)round((float)$todayMetrics['avg_stay']);

$todayEntriesCount = (int)$db->query("
    SELECT COUNT(*) FROM `movements` WHERE DATE(`entry_time`) = CURRENT_DATE()
")->fetchColumn();

// 3. Distribución por método de pago
$paymentsBreakdown = $db->query("
    SELECT `payment_method`, COALESCE(SUM(`total_paid`), 0) as total, COUNT(*) as qty
    FROM `movements`
    WHERE `status` = 'completado' AND DATE(`exit_time`) = CURRENT_DATE()
    GROUP BY `payment_method`
")->fetchAll();

// 4. Últimos movimientos completados
$recentCompleted = $db->query("
    SELECT * FROM `movements` 
    WHERE `status` = 'completado' 
    ORDER BY `exit_time` DESC 
    LIMIT 6
")->fetchAll();
?>

<div class="space-y-6">
  <!-- Fila de Tarjetas Métricas Prémium -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Recaudo de Hoy -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Recaudo de Hoy</span>
        <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
          <i data-lucide="dollar-sign" class="w-4 h-4"></i>
        </div>
      </div>
      <p class="text-2xl font-black text-slate-900 mt-2 font-mono">
        <?= formatCOP($todayRevenue) ?>
      </p>
      <p class="text-xs text-slate-500 mt-1">
        <?= $todayCompletedCount ?> liquidaciones completadas
      </p>
    </div>

    <!-- Celdas Ocupadas -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Ocupación Actual</span>
        <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
          <i data-lucide="pie-chart" class="w-4 h-4"></i>
        </div>
      </div>
      <p class="text-2xl font-black text-slate-900 mt-2">
        <?= $occupancyRate ?>% <span class="text-xs text-slate-400 font-normal font-sans">(<?= $occupiedSpaces ?>/<?= $totalSpaces ?>)</span>
      </p>
      <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
        <div class="bg-blue-600 h-full rounded-full transition-all" style="width: <?= min(100, $occupancyRate) ?>%"></div>
      </div>
    </div>

    <!-- Vehículos Ingresados Hoy -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Entradas Hoy</span>
        <div class="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
          <i data-lucide="log-in" class="w-4 h-4"></i>
        </div>
      </div>
      <p class="text-2xl font-black text-slate-900 mt-2 font-mono">
        <?= $todayEntriesCount ?>
      </p>
      <p class="text-xs text-slate-500 mt-1">
        Flujo de vehículos del turno
      </p>
    </div>

    <!-- Estancia Promedio -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Estancia Promedio</span>
        <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
          <i data-lucide="clock" class="w-4 h-4"></i>
        </div>
      </div>
      <p class="text-2xl font-black text-slate-900 mt-2">
        <?= floor($averageStay / 60) ?>h <?= $averageStay % 60 ?>m
      </p>
      <p class="text-xs text-slate-500 mt-1">
        <?= $averageStay ?> minutos por estancia
      </p>
    </div>
  </div>

  <!-- Desglose de Recaudo por Métodos de Pago y Actividad Reciente -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Columna Izquierda: Métodos de Pago -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <h2 class="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Recaudo por Medio de Pago</h2>
      <div class="space-y-3">
        <?php if (empty($paymentsBreakdown)): ?>
          <p class="text-xs text-slate-400 py-4 text-center">No se han registrado cobros hoy aún.</p>
        <?php else: ?>
          <?php foreach ($paymentsBreakdown as $pay): ?>
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span class="font-bold text-slate-800 uppercase tracking-wider"><?= $pay['payment_method'] ?></span>
              <div class="text-right">
                <span class="font-mono font-bold text-slate-900 block"><?= formatCOP($pay['total']) ?></span>
                <span class="text-[10px] text-slate-400"><?= $pay['qty'] ?> transacciones</span>
              </div>
            </div>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>
    </div>

    <!-- Columna Derecha: Últimos Cobros Realizados -->
    <div class="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 class="text-base font-extrabold text-slate-900">Últimas Salidas y Facturaciones</h2>
        <a href="index.php?view=history" class="text-xs font-bold text-blue-600 hover:text-blue-700">Ver Historial Completo →</a>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="text-slate-400 uppercase tracking-wider font-bold text-[10px] bg-slate-50">
            <tr>
              <th class="py-2.5 px-3">Ticket</th>
              <th class="py-2.5 px-3">Placa</th>
              <th class="py-2.5 px-3">Hora Salida</th>
              <th class="py-2.5 px-3">Tiempo</th>
              <th class="py-2.5 px-3 text-right">Total Cobrado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <?php if (empty($recentCompleted)): ?>
              <tr>
                <td colspan="5" class="py-6 text-center text-slate-400">Sin salidas registradas hoy</td>
              </tr>
            <?php else: ?>
              <?php foreach ($recentCompleted as $rc): ?>
                <tr class="hover:bg-slate-50">
                  <td class="py-3 px-3 font-mono font-bold text-slate-700"><?= $rc['ticket_number'] ?></td>
                  <td class="py-3 px-3 font-mono font-black text-slate-900"><?= $rc['plate'] ?></td>
                  <td class="py-3 px-3 text-slate-500"><?= date('H:i', strtotime($rc['exit_time'])) ?></td>
                  <td class="py-3 px-3 text-slate-600"><?= $rc['total_minutes'] ?> min</td>
                  <td class="py-3 px-3 text-right font-mono font-bold text-emerald-600"><?= formatCOP($rc['total_paid']) ?></td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
