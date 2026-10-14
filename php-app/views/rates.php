<?php
$db = getDB();

$rates = $db->query("SELECT * FROM `rates` ORDER BY FIELD(`vehicle_type`, 'automovil', 'motocicleta', 'camioneta', 'bicicleta')")->fetchAll();
?>

<div class="space-y-6">
  <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
    <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">Tarifas y Precios de Parqueadero</h1>
    <p class="text-xs text-slate-500 mt-0.5">Configuración de cobros por minuto, fracción, hora, día y cortesía gratis</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <?php foreach ($rates as $r): ?>
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <i data-lucide="tag" class="w-4 h-4"></i>
            </div>
            <div>
              <h2 class="font-extrabold text-slate-900 text-base"><?= htmlspecialchars($r['label']) ?></h2>
              <span class="text-[10px] uppercase font-bold text-slate-400 font-mono"><?= $r['vehicle_type'] ?></span>
            </div>
          </div>
          <span class="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
            <?= formatCOP($r['rate_per_hour']) ?> / hora
          </span>
        </div>

        <form action="actions/rates.php" method="POST" class="space-y-3 text-xs">
          <input type="hidden" name="rate_id" value="<?= $r['id'] ?>">

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-600 mb-1">Por Minuto (COP)</label>
              <input type="number" step="1" name="rate_per_minute" value="<?= (int)$r['rate_per_minute'] ?>" class="w-full font-mono font-bold px-3 py-1.5 border rounded-lg">
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Fracción 15m (COP)</label>
              <input type="number" step="1" name="rate_per_fraction15m" value="<?= (int)$r['rate_per_fraction15m'] ?>" class="w-full font-mono font-bold px-3 py-1.5 border rounded-lg">
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Por Hora (COP)</label>
              <input type="number" step="1" name="rate_per_hour" value="<?= (int)$r['rate_per_hour'] ?>" class="w-full font-mono font-bold px-3 py-1.5 border rounded-lg">
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Por Día (COP)</label>
              <input type="number" step="1" name="rate_per_day" value="<?= (int)$r['rate_per_day'] ?>" class="w-full font-mono font-bold px-3 py-1.5 border rounded-lg">
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Cortesía (Minutos)</label>
              <input type="number" step="1" name="grace_period_minutes" value="<?= (int)$r['grace_period_minutes'] ?>" class="w-full font-mono font-bold px-3 py-1.5 border rounded-lg">
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Ticket Perdido (COP)</label>
              <input type="number" step="1" name="lost_ticket_fee" value="<?= (int)$r['lost_ticket_fee'] ?>" class="w-full font-mono font-bold px-3 py-1.5 border rounded-lg">
            </div>
          </div>

          <div class="pt-2 text-right">
            <button type="submit" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors">
              Guardar Tarifa
            </button>
          </div>
        </form>
      </div>
    <?php endforeach; ?>
  </div>
</div>
