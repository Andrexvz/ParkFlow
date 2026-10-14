<?php
$db = getDB();

// Filtros
$filterType = $_GET['type'] ?? 'all';
$filterZone = $_GET['zone'] ?? 'all';

// Consulta de celdas con movimientos activos
$query = "
    SELECT s.*, m.id as mov_id, m.ticket_number, m.plate, m.entry_time, m.vehicle_type as mov_type
    FROM `parking_spaces` s
    LEFT JOIN `movements` m ON s.current_movement_id = m.id AND m.status = 'activo'
    WHERE 1=1
";
$params = [];
if ($filterType !== 'all') { $query .= " AND s.allowed_type = ?"; $params[] = $filterType; }
if ($filterZone !== 'all') { $query .= " AND s.zone = ?";         $params[] = $filterZone; }
$query .= " ORDER BY s.zone ASC, s.code ASC";
$stmt = $db->prepare($query);
$stmt->execute($params);
$spaces = $stmt->fetchAll();

// Totales
$totalAll   = count($spaces);
$totalFree  = 0; $totalOccupied = 0; $totalMaint = 0;
foreach ($spaces as $s) {
  if ($s['status'] === 'libre')      $totalFree++;
  elseif ($s['status'] === 'ocupado') $totalOccupied++;
  else $totalMaint++;
}

// Agrupar por zona
$zones = [];
foreach ($spaces as $s) { $zones[$s['zone']][] = $s; }

// Obtener zonas disponibles para filtro
$allZones = $db->query("SELECT DISTINCT `zone` FROM `parking_spaces` ORDER BY `zone` ASC")->fetchAll(PDO::FETCH_COLUMN);
?>

<div style="display:flex; flex-direction:column; gap:1.25rem;">

  <!-- ── Barra de Controles y Filtros ── -->
  <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:.875rem;
              padding:1rem 1.25rem; background:var(--bg-card,#111b30); border:1px solid rgba(255,255,255,.07);
              border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,.3);">

    <!-- Contadores Rápidos -->
    <div style="display:flex; align-items:center; gap:.875rem;">
      <div style="display:flex; align-items:center; gap:.4rem;">
        <span style="width:8px; height:8px; border-radius:9999px; background:#34d399; box-shadow:0 0 6px #34d399; display:inline-block;"></span>
        <span style="font-size:.75rem; font-weight:700; color:#f1f5f9;"><?= $totalFree ?> <span style="color:#34d399;">Libres</span></span>
      </div>
      <div style="width:1px; height:20px; background:rgba(255,255,255,.07);"></div>
      <div style="display:flex; align-items:center; gap:.4rem;">
        <span style="width:8px; height:8px; border-radius:9999px; background:#60a5fa; box-shadow:0 0 6px #60a5fa; display:inline-block; animation:pulseGlow 2s infinite;"></span>
        <span style="font-size:.75rem; font-weight:700; color:#f1f5f9;"><?= $totalOccupied ?> <span style="color:#60a5fa;">Ocupadas</span></span>
      </div>
      <?php if ($totalMaint > 0): ?>
        <div style="width:1px; height:20px; background:rgba(255,255,255,.07);"></div>
        <div style="display:flex; align-items:center; gap:.4rem;">
          <span style="width:8px; height:8px; border-radius:9999px; background:#fbbf24; display:inline-block;"></span>
          <span style="font-size:.75rem; font-weight:700; color:#fbbf24;"><?= $totalMaint ?> Mant.</span>
        </div>
      <?php endif; ?>
    </div>

    <!-- Filtros de Tipo -->
    <div style="display:flex; align-items:center; gap:.375rem; flex-wrap:wrap;">
      <span style="font-size:.65rem; font-weight:700; color:#2d3d54; text-transform:uppercase; letter-spacing:.07em; margin-right:.25rem;">Tipo:</span>
      <?php
        $types = [
          'all'        => ['Todos',        '#f1f5f9', 'rgba(255,255,255,.06)', 'rgba(255,255,255,.12)'],
          'automovil'  => ['Automóvil',    '#60a5fa',  'rgba(59,130,246,.12)',  'rgba(59,130,246,.3)'],
          'motocicleta'=> ['Moto',         '#fbbf24',  'rgba(245,158,11,.12)',  'rgba(245,158,11,.3)'],
          'camioneta'  => ['Camioneta',    '#a78bfa',  'rgba(139,92,246,.12)', 'rgba(139,92,246,.3)'],
          'bicicleta'  => ['Bicicleta',    '#34d399',  'rgba(16,185,129,.12)', 'rgba(16,185,129,.3)'],
        ];
        foreach ($types as $tKey => $tMeta):
          $isActive = $filterType === $tKey;
      ?>
        <a href="index.php?view=map&type=<?= $tKey ?>&zone=<?= $filterZone ?>"
           style="padding:.3rem .75rem; font-size:.7rem; font-weight:700; border-radius:8px; text-decoration:none;
                  color:<?= $isActive ? $tMeta[1] : '#64748b' ?>;
                  background:<?= $isActive ? $tMeta[2] : 'rgba(255,255,255,.03)' ?>;
                  border:1px solid <?= $isActive ? $tMeta[3] : 'rgba(255,255,255,.06)' ?>;
                  transition:all .15s;"
           onmouseover="this.style.background='<?= $tMeta[2] ?>'; this.style.color='<?= $tMeta[1] ?>'; this.style.borderColor='<?= $tMeta[3] ?>';"
           onmouseout="this.style.background='<?= $isActive ? $tMeta[2] : 'rgba(255,255,255,.03)' ?>'; this.style.color='<?= $isActive ? $tMeta[1] : '#64748b' ?>'; this.style.borderColor='<?= $isActive ? $tMeta[3] : 'rgba(255,255,255,.06)' ?>';">
          <?= $tMeta[0] ?>
        </a>
      <?php endforeach; ?>
    </div>

    <!-- Filtro de Zona -->
    <?php if (count($allZones) > 1): ?>
      <div style="display:flex; align-items:center; gap:.375rem;">
        <span style="font-size:.65rem; font-weight:700; color:#2d3d54; text-transform:uppercase; letter-spacing:.07em;">Zona:</span>
        <a href="index.php?view=map&type=<?= $filterType ?>&zone=all"
           style="padding:.3rem .75rem; font-size:.7rem; font-weight:700; border-radius:8px; text-decoration:none;
                  color:<?= $filterZone === 'all' ? '#f1f5f9' : '#64748b' ?>;
                  background:<?= $filterZone === 'all' ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.03)' ?>;
                  border:1px solid <?= $filterZone === 'all' ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.06)' ?>;">
          Todas
        </a>
        <?php foreach ($allZones as $z): ?>
          <a href="index.php?view=map&type=<?= $filterType ?>&zone=<?= urlencode($z) ?>"
             style="padding:.3rem .75rem; font-size:.7rem; font-weight:700; border-radius:8px; text-decoration:none;
                    color:<?= $filterZone === $z ? '#f1f5f9' : '#64748b' ?>;
                    background:<?= $filterZone === $z ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.03)' ?>;
                    border:1px solid <?= $filterZone === $z ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.06)' ?>;">
            <?= htmlspecialchars($z) ?>
          </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>

  </div>

  <!-- ── Cuadrícula de Zonas ── -->
  <?php if (empty($zones)): ?>
    <div style="text-align:center; padding:4rem 1rem; background:var(--bg-card,#111b30); border:1px solid rgba(255,255,255,.06); border-radius:16px; color:#2d3d54;">
      <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 1rem; display:block; opacity:.3;"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>
      <p style="font-size:1rem; font-weight:700; color:#475569;">No hay celdas con este filtro</p>
    </div>
  <?php else: ?>
    <?php foreach ($zones as $zoneName => $zoneSpaces): ?>
      <?php
        $zFree = 0; $zOcc = 0; $zTot = count($zoneSpaces);
        foreach ($zoneSpaces as $sp) {
          if ($sp['status'] === 'libre')       $zFree++;
          elseif ($sp['status'] === 'ocupado') $zOcc++;
        }
        $zOccPct = $zTot > 0 ? round(($zOcc / $zTot) * 100) : 0;
        $zColor  = $zOccPct > 85 ? '#fb7185' : ($zOccPct > 60 ? '#fbbf24' : '#34d399');
      ?>
      <div style="background:var(--bg-card,#111b30); border:1px solid rgba(255,255,255,.07); border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.25);">

        <!-- Header de Zona -->
        <div style="padding:.875rem 1.25rem; border-bottom:1px solid rgba(255,255,255,.05); display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,.02);">
          <div style="display:flex; align-items:center; gap:.75rem;">
            <h2 style="margin:0; font-size:1rem; font-weight:900; color:#f1f5f9; letter-spacing:-.01em;"><?= htmlspecialchars($zoneName) ?></h2>
            <span style="font-size:.65rem; font-weight:700; padding:.2rem .625rem; border-radius:6px; background:rgba(59,130,246,.1); color:#60a5fa; border:1px solid rgba(59,130,246,.2);"><?= $zTot ?> celdas</span>
          </div>
          <div style="display:flex; align-items:center; gap:.75rem;">
            <div class="progress-bar-track" style="width:80px;">
              <div class="progress-bar-fill" style="width:<?= $zOccPct ?>%; background:<?= $zColor ?>;"></div>
            </div>
            <span style="font-size:.7rem; font-weight:800; color:<?= $zColor ?>; font-family:'JetBrains Mono',monospace;"><?= $zOccPct ?>%</span>
            <span style="font-size:.7rem; color:#2d3d54;">
              <span style="color:#34d399; font-weight:700;"><?= $zFree ?>↑</span>
              <span style="color:#475569; margin:0 .2rem;">·</span>
              <span style="color:#60a5fa; font-weight:700;"><?= $zOcc ?>↓</span>
            </span>
          </div>
        </div>

        <!-- Cuadrícula de Celdas -->
        <div style="padding:1rem; display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:.625rem;">
          <?php foreach ($zoneSpaces as $sp):
            $isOccupied = $sp['status'] === 'ocupado';
            $isFree     = $sp['status'] === 'libre';
            $isMaint    = !$isOccupied && !$isFree;

            $minutesAgo = 0; $hoursAgo = 0;
            if ($isOccupied && !empty($sp['entry_time'])) {
              $minutesAgo = max(1, round((time() - strtotime($sp['entry_time'])) / 60));
              $hoursAgo   = floor($minutesAgo / 60);
            }

            // Clases y estilos
            if ($isFree) {
              $cellStyle = 'background:linear-gradient(135deg,rgba(6,78,59,.2) 0%,rgba(4,55,43,.12) 100%); border-color:rgba(16,185,129,.3);';
              $hoverOnmouseOver = "this.style.borderColor='#10b981'; this.style.boxShadow='0 0 24px rgba(16,185,129,.2),0 8px 20px rgba(0,0,0,.4)'; this.style.transform='translateY(-3px)';";
            } elseif ($isOccupied) {
              $cellStyle = 'background:linear-gradient(135deg,rgba(29,78,216,.18) 0%,rgba(8,12,24,.9) 100%); border-color:rgba(59,130,246,.3);';
              $hoverOnmouseOver = "this.style.borderColor='#3b82f6'; this.style.boxShadow='0 0 24px rgba(59,130,246,.2),0 8px 20px rgba(0,0,0,.4)'; this.style.transform='translateY(-3px)';";
            } else {
              $cellStyle = 'background:linear-gradient(135deg,rgba(120,53,15,.18) 0%,rgba(92,40,10,.1) 100%); border-color:rgba(245,158,11,.25); cursor:default; opacity:.75;';
              $hoverOnmouseOver = '';
            }
          ?>
            <div style="border-radius:12px; padding:.75rem; border:1px solid; position:relative; overflow:hidden; transition:all .22s cubic-bezier(0.16,1,0.3,1);
                        <?= $cellStyle ?>"
                 <?php if ($isFree): ?>
                   onclick="openEntryModal('<?= $sp['id'] ?>', '<?= $sp['code'] ?>')"
                   style="border-radius:12px; padding:.75rem; border:1px solid; position:relative; overflow:hidden; transition:all .22s cubic-bezier(0.16,1,0.3,1); cursor:pointer; <?= $cellStyle ?>"
                   onmouseover="<?= $hoverOnmouseOver ?>"
                   onmouseout="this.style.borderColor='rgba(16,185,129,.3)'; this.style.boxShadow='none'; this.style.transform='none';"
                 <?php elseif ($isOccupied): ?>
                   onclick='openExitModal(<?= json_encode($sp, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP) ?>)'
                   style="border-radius:12px; padding:.75rem; border:1px solid; position:relative; overflow:hidden; transition:all .22s cubic-bezier(0.16,1,0.3,1); cursor:pointer; <?= $cellStyle ?>"
                   onmouseover="<?= $hoverOnmouseOver ?>"
                   onmouseout="this.style.borderColor='rgba(59,130,246,.3)'; this.style.boxShadow='none'; this.style.transform='none';"
                 <?php else: ?>
                   style="border-radius:12px; padding:.75rem; border:1px solid; position:relative; overflow:hidden; <?= $cellStyle ?>"
                 <?php endif; ?>>

              <!-- Brillo interior -->
              <div style="position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);"></div>

              <!-- Código + Tipo -->
              <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:.5rem;">
                <span style="font-family:'JetBrains Mono',monospace; font-size:.9375rem; font-weight:900;
                             color:<?= $isOccupied ? '#f1f5f9' : ($isFree ? '#34d399' : '#fbbf24') ?>;">
                  <?= htmlspecialchars($sp['code']) ?>
                </span>
                <span style="font-size:.6rem; font-weight:700; text-transform:uppercase; padding:.15rem .375rem; border-radius:4px;
                             background:<?= $isOccupied ? 'rgba(59,130,246,.15)' : ($isFree ? 'rgba(16,185,129,.15)' : 'rgba(245,158,11,.15)') ?>;
                             color:<?= $isOccupied ? '#60a5fa' : ($isFree ? '#34d399' : '#fbbf24') ?>;
                             border:1px solid <?= $isOccupied ? 'rgba(59,130,246,.25)' : ($isFree ? 'rgba(16,185,129,.25)' : 'rgba(245,158,11,.25)') ?>;">
                  <?= $sp['allowed_type'][0] ?>
                </span>
              </div>

              <?php if ($isOccupied): ?>
                <!-- Placa + Tiempo -->
                <div style="margin-top:.375rem;">
                  <span class="plate-badge" style="font-size:.7rem; padding:.15rem .4rem; width:100%;"><?= htmlspecialchars($sp['plate']) ?></span>
                  <div style="margin-top:.375rem; display:flex; align-items:center; justify-content:center; gap:.25rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:#475569;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span style="font-size:.68rem; color:#475569; font-family:'JetBrains Mono',monospace; font-weight:700;">
                      <?= $hoursAgo > 0 ? "{$hoursAgo}h " : '' ?><?= $minutesAgo % 60 ?>m
                    </span>
                  </div>
                </div>
              <?php elseif ($isFree): ?>
                <!-- Estado Libre -->
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:.375rem;">
                  <div style="display:flex; align-items:center; gap:.3rem;">
                    <span style="width:5px; height:5px; border-radius:9999px; background:#34d399; box-shadow:0 0 5px #34d399; display:inline-block; animation:pulseGlow 2s infinite;"></span>
                    <span style="font-size:.65rem; font-weight:700; color:#34d399;">Libre</span>
                  </div>
                  <span style="font-size:.6rem; color:#2d3d54; font-weight:700;">Ingresar →</span>
                </div>
              <?php else: ?>
                <!-- Estado Mantenimiento -->
                <div style="margin-top:.375rem;">
                  <span style="font-size:.65rem; font-weight:700; color:#fbbf24; text-transform:uppercase;">⚠ <?= htmlspecialchars($sp['status']) ?></span>
                </div>
              <?php endif; ?>

            </div>
          <?php endforeach; ?>
        </div>
      </div>
    <?php endforeach; ?>
  <?php endif; ?>

</div>
