<?php
$db = getDB();
$rates = $db->query("SELECT * FROM `rates` ORDER BY FIELD(`vehicle_type`, 'automovil', 'motocicleta', 'camioneta', 'bicicleta')")->fetchAll();

$vehicleMeta = [
  'automovil'   => ['🚗', '#60a5fa',  'rgba(59,130,246,.12)',  'rgba(59,130,246,.2)',  'Automóvil'],
  'motocicleta' => ['🏍', '#fbbf24',  'rgba(245,158,11,.12)',  'rgba(245,158,11,.2)',  'Motocicleta'],
  'camioneta'   => ['🚙', '#a78bfa',  'rgba(139,92,246,.12)', 'rgba(139,92,246,.2)', 'Camioneta / SUV'],
  'bicicleta'   => ['🚲', '#34d399',  'rgba(16,185,129,.12)', 'rgba(16,185,129,.2)', 'Bicicleta'],
];
?>

<div style="display:flex; flex-direction:column; gap:1.5rem;">

  <!-- ── Header ── -->
  <div>
    <h1 style="margin:0; font-size:1.375rem; font-weight:900; color:#f1f5f9; letter-spacing:-.02em;">Tarifas del Parqueadero</h1>
    <p style="margin:.25rem 0 0; font-size:.8rem; color:#475569;">Configuración de cobros por fracción, hora, día y cortesías. Los cambios se aplican inmediatamente.</p>
  </div>

  <!-- ── Grid de Tarifas ── -->
  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:1.25rem;">
    <?php foreach ($rates as $r):
      $meta = $vehicleMeta[$r['vehicle_type']] ?? ['💰', '#94a3b8', 'rgba(100,116,139,.1)', 'rgba(100,116,139,.2)', ucfirst($r['vehicle_type'])];
    ?>
      <div style="background:var(--bg-card,#111b30); border:1px solid <?= $meta[3] ?>; border-radius:18px; overflow:hidden;
                  box-shadow:0 4px 20px rgba(0,0,0,.3), 0 0 40px <?= str_replace('.2', '.06', $meta[3]) ?>;">

        <!-- Card Header -->
        <div style="padding:1.125rem 1.25rem; border-bottom:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-between; background:<?= $meta[2] ?>;">
          <div style="display:flex; align-items:center; gap:.75rem;">
            <span style="font-size:1.75rem; line-height:1;"><?= $meta[0] ?></span>
            <div>
              <h2 style="margin:0; font-size:.9375rem; font-weight:900; color:#f1f5f9;"><?= $meta[4] ?></h2>
              <span style="font-size:.65rem; font-weight:700; color:<?= $meta[1] ?>; text-transform:uppercase; letter-spacing:.06em; font-family:'JetBrains Mono',monospace;"><?= $r['vehicle_type'] ?></span>
            </div>
          </div>
          <!-- Precio por hora destacado -->
          <div style="text-align:right;">
            <span style="font-size:.6rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.06em; display:block; margin-bottom:.15rem;">por hora</span>
            <span style="font-family:'JetBrains Mono',monospace; font-size:1.1rem; font-weight:900; color:<?= $meta[1] ?>;"><?= formatCOP($r['rate_per_hour']) ?></span>
          </div>
        </div>

        <!-- Formulario de Tarifas -->
        <form action="actions/rates.php" method="POST" style="padding:1.25rem; display:flex; flex-direction:column; gap:.875rem;">
          <input type="hidden" name="rate_id" value="<?= $r['id'] ?>">

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:.75rem;">

            <!-- Fracción 15 min -->
            <div>
              <label style="display:block; font-size:.65rem; font-weight:800; letter-spacing:.07em; text-transform:uppercase; color:#475569; margin-bottom:.375rem;">
                Fracción 15 min
                <span style="display:inline-block; font-size:.6rem; font-weight:600; color:#2d3d54; text-transform:none; letter-spacing:0;">(COP)</span>
              </label>
              <div style="position:relative;">
                <span style="position:absolute; left:.75rem; top:50%; transform:translateY(-50%); font-size:.75rem; font-weight:700; color:#475569; pointer-events:none; font-family:'JetBrains Mono',monospace;">$</span>
                <input type="number" step="1" min="0" name="rate_per_fraction15m" value="<?= (int)$r['rate_per_fraction15m'] ?>"
                       style="width:100%; background:rgba(4,7,17,.8); border:1px solid rgba(255,255,255,.08); color:#f1f5f9;
                              border-radius:10px; padding:.55rem .75rem .55rem 1.75rem; font-size:.875rem; font-family:'JetBrains Mono',monospace;
                              font-weight:700; outline:none; transition:border-color .15s;"
                       onfocus="this.style.borderColor='<?= $meta[1] ?>'; this.style.boxShadow='0 0 0 2px <?= str_replace('.2', '.1', $meta[3]) ?>'"
                       onblur="this.style.borderColor='rgba(255,255,255,.08)'; this.style.boxShadow='none'">
              </div>
            </div>

            <!-- Por Hora -->
            <div>
              <label style="display:block; font-size:.65rem; font-weight:800; letter-spacing:.07em; text-transform:uppercase; color:#475569; margin-bottom:.375rem;">
                Por Hora <span style="font-size:.6rem; font-weight:600; color:#2d3d54; text-transform:none; letter-spacing:0;">(COP)</span>
              </label>
              <div style="position:relative;">
                <span style="position:absolute; left:.75rem; top:50%; transform:translateY(-50%); font-size:.75rem; font-weight:700; color:#475569; pointer-events:none; font-family:'JetBrains Mono',monospace;">$</span>
                <input type="number" step="1" min="0" name="rate_per_hour" value="<?= (int)$r['rate_per_hour'] ?>"
                       style="width:100%; background:rgba(4,7,17,.8); border:1px solid rgba(255,255,255,.08); color:<?= $meta[1] ?>;
                              border-radius:10px; padding:.55rem .75rem .55rem 1.75rem; font-size:.875rem; font-family:'JetBrains Mono',monospace;
                              font-weight:800; outline:none; transition:border-color .15s;"
                       onfocus="this.style.borderColor='<?= $meta[1] ?>'; this.style.boxShadow='0 0 0 2px <?= str_replace('.2', '.1', $meta[3]) ?>'"
                       onblur="this.style.borderColor='rgba(255,255,255,.08)'; this.style.boxShadow='none'">
              </div>
            </div>

            <!-- Por Día -->
            <div>
              <label style="display:block; font-size:.65rem; font-weight:800; letter-spacing:.07em; text-transform:uppercase; color:#475569; margin-bottom:.375rem;">
                Por Día <span style="font-size:.6rem; font-weight:600; color:#2d3d54; text-transform:none; letter-spacing:0;">(COP)</span>
              </label>
              <div style="position:relative;">
                <span style="position:absolute; left:.75rem; top:50%; transform:translateY(-50%); font-size:.75rem; font-weight:700; color:#475569; pointer-events:none; font-family:'JetBrains Mono',monospace;">$</span>
                <input type="number" step="1" min="0" name="rate_per_day" value="<?= (int)$r['rate_per_day'] ?>"
                       style="width:100%; background:rgba(4,7,17,.8); border:1px solid rgba(255,255,255,.08); color:#f1f5f9;
                              border-radius:10px; padding:.55rem .75rem .55rem 1.75rem; font-size:.875rem; font-family:'JetBrains Mono',monospace;
                              font-weight:700; outline:none; transition:border-color .15s;"
                       onfocus="this.style.borderColor='<?= $meta[1] ?>'; this.style.boxShadow='0 0 0 2px <?= str_replace('.2', '.1', $meta[3]) ?>'"
                       onblur="this.style.borderColor='rgba(255,255,255,.08)'; this.style.boxShadow='none'">
              </div>
            </div>

            <!-- Cortesía -->
            <div>
              <label style="display:block; font-size:.65rem; font-weight:800; letter-spacing:.07em; text-transform:uppercase; color:#475569; margin-bottom:.375rem;">
                Cortesía Gratis <span style="font-size:.6rem; font-weight:600; color:#2d3d54; text-transform:none; letter-spacing:0;">(min)</span>
              </label>
              <input type="number" step="1" min="0" name="grace_period_minutes" value="<?= (int)$r['grace_period_minutes'] ?>"
                     style="width:100%; background:rgba(4,7,17,.8); border:1px solid rgba(255,255,255,.08); color:#34d399;
                            border-radius:10px; padding:.55rem .75rem; font-size:.875rem; font-family:'JetBrains Mono',monospace;
                            font-weight:700; outline:none; transition:border-color .15s;"
                     onfocus="this.style.borderColor='#34d399'; this.style.boxShadow='0 0 0 2px rgba(16,185,129,.1)'"
                     onblur="this.style.borderColor='rgba(255,255,255,.08)'; this.style.boxShadow='none'">
            </div>

            <!-- Multa Ticket Perdido -->
            <div style="grid-column:span 2;">
              <label style="display:block; font-size:.65rem; font-weight:800; letter-spacing:.07em; text-transform:uppercase; color:#475569; margin-bottom:.375rem;">
                Multa Ticket Perdido <span style="font-size:.6rem; font-weight:600; color:#2d3d54; text-transform:none; letter-spacing:0;">(COP)</span>
              </label>
              <div style="position:relative;">
                <span style="position:absolute; left:.75rem; top:50%; transform:translateY(-50%); font-size:.75rem; font-weight:700; color:#475569; pointer-events:none; font-family:'JetBrains Mono',monospace;">$</span>
                <input type="number" step="1" min="0" name="lost_ticket_fee" value="<?= (int)$r['lost_ticket_fee'] ?>"
                       style="width:100%; background:rgba(4,7,17,.8); border:1px solid rgba(255,255,255,.08); color:#fb7185;
                              border-radius:10px; padding:.55rem .75rem .55rem 1.75rem; font-size:.875rem; font-family:'JetBrains Mono',monospace;
                              font-weight:700; outline:none; transition:border-color .15s;"
                       onfocus="this.style.borderColor='#fb7185'; this.style.boxShadow='0 0 0 2px rgba(244,63,94,.1)'"
                       onblur="this.style.borderColor='rgba(255,255,255,.08)'; this.style.boxShadow='none'">
              </div>
            </div>

          </div>

          <!-- Botón Guardar -->
          <div style="padding-top:.5rem; border-top:1px solid rgba(255,255,255,.05);">
            <button type="submit"
                    style="width:100%; padding:.7rem; font-size:.8125rem; font-weight:800; color:white;
                           background:linear-gradient(135deg,#2563eb,#1d4ed8); border:1px solid rgba(59,130,246,.4);
                           border-radius:10px; cursor:pointer; transition:all .2s; box-shadow:0 4px 14px rgba(37,99,235,.3);"
                    onmouseover="this.style.background='linear-gradient(135deg,#3b82f6,#2563eb)'; this.style.boxShadow='0 4px 20px rgba(37,99,235,.45)'"
                    onmouseout="this.style.background='linear-gradient(135deg,#2563eb,#1d4ed8)'; this.style.boxShadow='0 4px 14px rgba(37,99,235,.3)'">
              Guardar Tarifa de <?= $meta[4] ?>
            </button>
          </div>
        </form>
      </div>
    <?php endforeach; ?>
  </div>

  <!-- ── Nota informativa ── -->
  <div style="padding:1rem 1.25rem; background:rgba(59,130,246,.06); border:1px solid rgba(59,130,246,.15); border-radius:12px; display:flex; align-items:flex-start; gap:.75rem;">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#60a5fa; flex-shrink:0; margin-top:.1rem;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <div>
      <p style="margin:0 0 .25rem; font-size:.8rem; font-weight:700; color:#93c5fd;">Lógica de cobro</p>
      <p style="margin:0; font-size:.75rem; color:#475569; line-height:1.5;">
        El sistema aplica <strong style="color:#94a3b8;">cortesía gratis</strong> si la estancia no supera los minutos configurados.
        Luego cobra por <strong style="color:#94a3b8;">fracciones de 15 min</strong> hasta completar una hora, y por <strong style="color:#94a3b8;">hora completa</strong> a partir de ahí.
        Estancias mayores a 12 horas se cobran por día. Los descuentos y multas se aplican al total final.
      </p>
    </div>
  </div>

</div>
