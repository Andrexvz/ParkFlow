<?php
$db = getDB();

// Filtros opcionales
$filterType = $_GET['type'] ?? 'all';
$filterZone = $_GET['zone'] ?? 'all';

// Consulta de celdas y sus movimientos activos
$query = "
    SELECT s.*, m.id as mov_id, m.ticket_number, m.plate, m.entry_time, m.vehicle_type as mov_type
    FROM `parking_spaces` s
    LEFT JOIN `movements` m ON s.current_movement_id = m.id AND m.status = 'activo'
    WHERE 1=1
";
$params = [];

if ($filterType !== 'all') {
    $query .= " AND s.allowed_type = ?";
    $params[] = $filterType;
}
if ($filterZone !== 'all') {
    $query .= " AND s.zone = ?";
    $params[] = $filterZone;
}

$query .= " ORDER BY s.zone ASC, s.code ASC";
$stmt = $db->prepare($query);
$stmt->execute($params);
$spaces = $stmt->fetchAll();

// Agrupar por zona
$zones = [];
foreach ($spaces as $s) {
    $zones[$s['zone']][] = $s;
}
?>

<div class="space-y-6">
  <!-- Barra de Filtros y Resumen -->
  <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
      <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filtrar:</span>
      <a href="index.php?view=map&type=all&zone=<?= $filterZone ?>" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all <?= $filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200' ?>">
        Todos
      </a>
      <a href="index.php?view=map&type=automovil&zone=<?= $filterZone ?>" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all <?= $filterType === 'automovil' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200' ?>">
        Automóviles
      </a>
      <a href="index.php?view=map&type=motocicleta&zone=<?= $filterZone ?>" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all <?= $filterType === 'motocicleta' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200' ?>">
        Motocicletas
      </a>
      <a href="index.php?view=map&type=camioneta&zone=<?= $filterZone ?>" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all <?= $filterType === 'camioneta' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200' ?>">
        Camionetas
      </a>
      <a href="index.php?view=map&type=bicicleta&zone=<?= $filterZone ?>" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all <?= $filterType === 'bicicleta' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200' ?>">
        Bicicletas
      </a>
    </div>

    <!-- Leyenda de Estados -->
    <div class="flex items-center gap-4 text-xs font-semibold text-slate-600">
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-md bg-emerald-500"></span>
        <span>Libre</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-md bg-blue-600"></span>
        <span>Ocupado</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-md bg-amber-500"></span>
        <span>Mantenimiento</span>
      </div>
    </div>
  </div>

  <!-- Cuadrícula por Zonas -->
  <?php foreach ($zones as $zoneName => $zoneSpaces): ?>
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2">
          <h2 class="font-extrabold text-slate-900 text-base"><?= htmlspecialchars($zoneName) ?></h2>
          <span class="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
            <?= count($zoneSpaces) ?> celdas
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        <?php foreach ($zoneSpaces as $sp): 
          $isOccupied = $sp['status'] === 'ocupado';
          $isFree = $sp['status'] === 'libre';
          $isMaint = $sp['status'] === 'mantenimiento' || $sp['status'] === 'reservado';

          // Minutos transcurridos si está ocupado
          $minutesAgo = 0;
          if ($isOccupied && !empty($sp['entry_time'])) {
              $entryTs = strtotime($sp['entry_time']);
              $minutesAgo = max(1, round((time() - $entryTs) / 60));
          }
        ?>
          <div class="space-card rounded-xl p-3 border cursor-pointer relative overflow-hidden transition-all
            <?= $isOccupied ? 'bg-slate-900 border-slate-800 text-white shadow-sm' : '' ?>
            <?= $isFree ? 'bg-emerald-50/40 border-emerald-300 text-slate-900 hover:border-emerald-500 hover:bg-emerald-50' : '' ?>
            <?= $isMaint ? 'bg-amber-50 border-amber-300 text-amber-900' : '' ?>"
            <?php if ($isFree): ?>
              onclick="openEntryModal('<?= $sp['id'] ?>', '<?= $sp['code'] ?>')"
            <?php elseif ($isOccupied): ?>
              onclick='openExitModal(<?= json_encode($sp, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP) ?>)'
            <?php endif; ?>>
            
            <div class="flex items-start justify-between">
              <span class="font-mono text-base font-extrabold <?= $isOccupied ? 'text-white' : 'text-slate-900' ?>">
                <?= $sp['code'] ?>
              </span>
              <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded
                <?= $isOccupied ? 'bg-blue-500/20 text-blue-300' : '' ?>
                <?= $isFree ? 'bg-emerald-100 text-emerald-800' : '' ?>
                <?= $isMaint ? 'bg-amber-200 text-amber-800' : '' ?>">
                <?= $sp['allowed_type'] ?>
              </span>
            </div>

            <?php if ($isOccupied): ?>
              <div class="mt-2.5">
                <span class="block text-sm font-mono font-black text-amber-400 tracking-wider">
                  <?= htmlspecialchars($sp['plate']) ?>
                </span>
                <span class="text-[10px] text-slate-400 block mt-0.5">
                  ⏱️ <?= floor($minutesAgo / 60) ?>h <?= $minutesAgo % 60 ?>m
                </span>
              </div>
            <?php elseif ($isFree): ?>
              <div class="mt-3 flex items-center justify-between text-xs text-emerald-600 font-bold">
                <span>Libre</span>
                <span class="text-[10px] opacity-70">Clic para ingresar</span>
              </div>
            <?php else: ?>
              <div class="mt-3 text-xs text-amber-700 font-bold">
                <span><?= ucfirst($sp['status']) ?></span>
              </div>
            <?php endif; ?>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  <?php endforeach; ?>
</div>
