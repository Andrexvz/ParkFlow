  </main><!-- /main -->

  <!-- ══════════════════════════════════════════════════
       FOOTER DARK UI PREMIUM
  ══════════════════════════════════════════════════ -->
  <footer style="background:rgba(8,12,24,.95); border-top:1px solid rgba(255,255,255,.05); padding:1rem 1.25rem; margin-top:auto;">
    <div style="max-width:90rem; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.75rem;">
      <div style="display:flex; align-items:center; gap:.625rem;">
        <span style="width:7px; height:7px; border-radius:9999px; background:#34d399; box-shadow:0 0 8px #34d399; display:inline-block; animation:pulseGlow 2s infinite;"></span>
        <span style="font-size:.72rem; font-weight:600; color:#64748b;">
          Conectado a MySQL · XAMPP · Puerto 3306
        </span>
        <span style="color:#1e293b;">·</span>
        <code style="font-size:.7rem; font-family:'JetBrains Mono',monospace; font-weight:700; color:#60a5fa; background:rgba(59,130,246,.08); border:1px solid rgba(59,130,246,.15); padding:.1rem .4rem; border-radius:5px;">parkflow_db</code>
      </div>
      <span style="font-size:.7rem; color:#2d3d54; font-weight:600;">ParkFlow &copy; <?= date('Y') ?> · Dark UI · Neiva, Huila</span>
    </div>
  </footer>

  <!-- ══════════════════════════════════════════════════
       MODAL: REGISTRAR ENTRADA DE VEHÍCULO
  ══════════════════════════════════════════════════ -->
  <?php
  $freeSpaces = $db->query("SELECT * FROM `parking_spaces` WHERE `status` = 'libre' ORDER BY `zone` ASC, `code` ASC")->fetchAll();
  ?>
  <div id="entryModal"
       style="display:none; position:fixed; inset:0; z-index:200; align-items:center; justify-content:center; padding:1rem;
              background:rgba(4,7,17,.88); backdrop-filter:blur(20px);"
       onclick="if(event.target===this)closeEntryModal()">
    <div style="background:#0d1525; border:1px solid rgba(255,255,255,.1); border-radius:20px; max-width:520px; width:100%;
                overflow:hidden; box-shadow:0 30px 70px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.06);
                animation:scaleIn .2s cubic-bezier(0.16,1,0.3,1);">

      <!-- Header Modal -->
      <div style="padding:1.25rem 1.5rem; border-bottom:1px solid rgba(255,255,255,.05); display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,.02);">
        <div style="display:flex; align-items:center; gap:.75rem;">
          <div style="width:40px; height:40px; border-radius:10px; background:rgba(37,99,235,.15); border:1px solid rgba(59,130,246,.3); display:flex; align-items:center; justify-content:center; color:#60a5fa;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div>
            <h3 style="margin:0; font-size:.9375rem; font-weight:800; color:#f1f5f9;">Registrar Entrada</h3>
            <p style="margin:.1rem 0 0; font-size:.72rem; color:#475569;">Generar nuevo ticket de ingreso al parqueadero</p>
          </div>
        </div>
        <button onclick="closeEntryModal()"
                style="width:32px; height:32px; border-radius:8px; border:1px solid rgba(255,255,255,.08); background:transparent;
                       color:#475569; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; transition:all .12s;"
                onmouseover="this.style.background='rgba(255,255,255,.06)'; this.style.color='#f1f5f9';"
                onmouseout="this.style.background='transparent'; this.style.color='#475569';">✕</button>
      </div>

      <!-- Body Modal -->
      <form action="actions/entry.php" method="POST" style="padding:1.5rem; display:flex; flex-direction:column; gap:1.1rem;">

        <!-- Badge Celda preseleccionada -->
        <div id="entryPreselectedCodeBadge" style="display:none; font-size:.75rem; font-weight:700; padding:.625rem 1rem;
             background:rgba(37,99,235,.1); border:1px solid rgba(59,130,246,.25); border-radius:10px; color:#60a5fa;">
        </div>

        <!-- Placa del Vehículo -->
        <div>
          <label style="display:block; font-size:.68rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#64748b; margin-bottom:.5rem;">Placa del Vehículo *</label>
          <input type="text" name="plate" id="entryPlateInput" required
                 placeholder="Ej: KEO492" autocomplete="off"
                 style="width:100%; background:rgba(4,7,17,.9); border:2px solid rgba(255,255,255,.08); color:#fbbf24;
                        border-radius:12px; padding:.875rem 1rem; font-size:1.75rem; font-family:'JetBrains Mono',monospace;
                        font-weight:900; letter-spacing:.18em; text-align:center; text-transform:uppercase; outline:none;
                        transition:border-color .15s, box-shadow .15s;
                        text-shadow:0 0 12px rgba(251,191,36,.25);"
                 onfocus="this.style.borderColor='rgba(245,158,11,.6)'; this.style.boxShadow='0 0 0 3px rgba(245,158,11,.12), 0 0 20px rgba(245,158,11,.08)';"
                 onblur="this.style.borderColor='rgba(255,255,255,.08)'; this.style.boxShadow='none';"
                 oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9\-]/g,'')">
        </div>

        <!-- Tipo de Vehículo -->
        <div>
          <label style="display:block; font-size:.68rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#64748b; margin-bottom:.5rem;">Tipo de Vehículo *</label>
          <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:.5rem;">
            <?php
              $vtypes = [
                ['automovil',   '🚗', 'Automóvil',  false],
                ['motocicleta', '🏍', 'Moto',        true],
                ['camioneta',   '🚙', 'Camioneta',   false],
                ['bicicleta',   '🚲', 'Bicicleta',   false],
              ];
              foreach ($vtypes as $idx => [$vval, $vIcon, $vLabel, $hasMoto]):
            ?>
              <label style="cursor:pointer; display:block;">
                <input type="radio" name="vehicle_type" value="<?= $vval ?>"
                       <?= $idx === 0 ? 'checked' : '' ?>
                       onchange="toggleHelmets(<?= $hasMoto ? 'true' : 'false' ?>)"
                       style="position:absolute; width:1px; height:1px; opacity:0;"
                       class="vtype-radio">
                <div style="padding:.75rem .5rem; text-align:center; border-radius:10px; border:1px solid rgba(255,255,255,.08);
                            background:rgba(4,7,17,.7); color:#64748b; font-size:.72rem; font-weight:700; transition:all .15s;
                            display:flex; flex-direction:column; align-items:center; gap:.25rem; user-select:none;"
                     class="vtype-btn-<?= $vval ?>">
                  <span style="font-size:1.25rem;"><?= $vIcon ?></span>
                  <?= $vLabel ?>
                </div>
              </label>
            <?php endforeach; ?>
          </div>
        </div>

        <!-- Celda -->
        <div>
          <label style="display:block; font-size:.68rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#64748b; margin-bottom:.5rem;">Celda de Parqueadero</label>
          <select name="space_id" id="entrySpaceSelect"
                  style="width:100%; background:rgba(4,7,17,.8); border:1px solid rgba(255,255,255,.08); color:#f1f5f9;
                         border-radius:10px; padding:.6rem .875rem; font-size:.8125rem; outline:none; transition:border-color .15s; cursor:pointer;"
                  onfocus="this.style.borderColor='rgba(59,130,246,.5)'"
                  onblur="this.style.borderColor='rgba(255,255,255,.08)'">
            <option value="">⚡ Asignación Automática (Recomendado)</option>
            <?php foreach ($freeSpaces as $sp): ?>
              <option value="<?= $sp['id'] ?>">Celda <?= $sp['code'] ?> (<?= $sp['zone'] ?> · <?= ucfirst($sp['allowed_type']) ?>)</option>
            <?php endforeach; ?>
          </select>
        </div>

        <!-- Cascos (Motos) -->
        <div id="helmetsContainer" style="display:none;">
          <label style="display:block; font-size:.68rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#64748b; margin-bottom:.5rem;">Cascos en Custodia</label>
          <select name="helmets_count"
                  style="width:100%; background:rgba(4,7,17,.8); border:1px solid rgba(255,255,255,.08); color:#f1f5f9;
                         border-radius:10px; padding:.6rem .875rem; font-size:.8125rem; outline:none; cursor:pointer;">
            <option value="0">0 Cascos</option>
            <option value="1">1 Casco</option>
            <option value="2">2 Cascos</option>
          </select>
        </div>

        <!-- Notas -->
        <div>
          <label style="display:block; font-size:.68rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#64748b; margin-bottom:.5rem;">Notas de Entrada (Opcional)</label>
          <input type="text" name="entry_notes" placeholder="Ej: Rayón preexistente en puerta trasera..."
                 style="width:100%; background:rgba(4,7,17,.8); border:1px solid rgba(255,255,255,.08); color:#f1f5f9;
                        border-radius:10px; padding:.6rem .875rem; font-size:.8125rem; outline:none; transition:border-color .15s;"
                 onfocus="this.style.borderColor='rgba(59,130,246,.5)'"
                 onblur="this.style.borderColor='rgba(255,255,255,.08)'">
        </div>

        <!-- Botones -->
        <div style="display:flex; align-items:center; justify-content:flex-end; gap:.625rem; padding-top:.75rem; border-top:1px solid rgba(255,255,255,.05);">
          <button type="button" onclick="closeEntryModal()"
                  style="padding:.55rem 1rem; font-size:.8rem; font-weight:700; color:#64748b; background:transparent;
                         border:1px solid rgba(255,255,255,.07); border-radius:10px; cursor:pointer; transition:all .12s;"
                  onmouseover="this.style.background='rgba(255,255,255,.05)'; this.style.color='#94a3b8'"
                  onmouseout="this.style.background='transparent'; this.style.color='#64748b'">
            Cancelar
          </button>
          <button type="submit"
                  style="padding:.6rem 1.25rem; font-size:.8rem; font-weight:800; color:white;
                         background:linear-gradient(135deg,#2563eb,#1d4ed8); border:1px solid rgba(59,130,246,.5);
                         border-radius:10px; cursor:pointer; transition:all .2s; box-shadow:0 4px 14px rgba(37,99,235,.35);"
                  onmouseover="this.style.background='linear-gradient(135deg,#3b82f6,#2563eb)'; this.style.boxShadow='0 4px 20px rgba(37,99,235,.5)'"
                  onmouseout="this.style.background='linear-gradient(135deg,#2563eb,#1d4ed8)'; this.style.boxShadow='0 4px 14px rgba(37,99,235,.35)'">
            Generar Ticket e Ingresar →
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       MODAL: LIQUIDACIÓN Y SALIDA
  ══════════════════════════════════════════════════ -->
  <div id="exitModal"
       style="display:none; position:fixed; inset:0; z-index:200; align-items:center; justify-content:center; padding:1rem;
              background:rgba(4,7,17,.88); backdrop-filter:blur(20px);"
       onclick="if(event.target===this)closeExitModal()">
    <div style="background:#0d1525; border:1px solid rgba(255,255,255,.1); border-radius:20px; max-width:540px; width:100%;
                overflow:hidden; box-shadow:0 30px 70px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.06);
                animation:scaleIn .2s cubic-bezier(0.16,1,0.3,1);">

      <!-- Header -->
      <div style="padding:1.25rem 1.5rem; border-bottom:1px solid rgba(255,255,255,.05); display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,.02);">
        <div style="display:flex; align-items:center; gap:.75rem;">
          <div style="width:40px; height:40px; border-radius:10px; background:rgba(5,150,105,.15); border:1px solid rgba(16,185,129,.3); display:flex; align-items:center; justify-content:center; color:#34d399;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
          </div>
          <div>
            <h3 style="margin:0; font-size:.9375rem; font-weight:800; color:#f1f5f9;">Liquidación y Salida</h3>
            <p style="margin:.1rem 0 0; font-size:.72rem; color:#475569;">Cobro de estancia y liberación de celda</p>
          </div>
        </div>
        <button onclick="closeExitModal()"
                style="width:32px; height:32px; border-radius:8px; border:1px solid rgba(255,255,255,.08); background:transparent;
                       color:#475569; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; transition:all .12s;"
                onmouseover="this.style.background='rgba(255,255,255,.06)'; this.style.color='#f1f5f9'"
                onmouseout="this.style.background='transparent'; this.style.color='#475569'">✕</button>
      </div>

      <!-- Body -->
      <form action="actions/exit.php" method="POST" style="padding:1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <input type="hidden" name="movement_id"  id="exitMovementId">
        <input type="hidden" name="total_minutes" id="formTotalMinutes" value="0">
        <input type="hidden" name="grace_applied" id="formGraceApplied" value="0">
        <input type="hidden" name="subtotal"      id="formSubtotal"     value="0">
        <input type="hidden" name="discount"      id="formDiscount"     value="0">
        <input type="hidden" name="total_paid"    id="formTotalPaid"    value="0">
        <input type="hidden" name="change_given"  id="formChangeGiven"  value="0">

        <!-- Ficha del Vehículo -->
        <div style="background:rgba(4,7,17,.6); border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:1rem; display:grid; grid-template-columns:1fr 1fr 1fr; gap:.875rem;">
          <div>
            <span style="font-size:.6rem; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:#2d3d54; display:block; margin-bottom:.2rem;">Ticket</span>
            <span id="exitTicketNumber" style="font-family:'JetBrains Mono',monospace; font-size:.8rem; font-weight:700; color:#64748b;">--</span>
          </div>
          <div>
            <span style="font-size:.6rem; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:#2d3d54; display:block; margin-bottom:.2rem;">Placa</span>
            <span id="exitPlate" style="font-family:'JetBrains Mono',monospace; font-size:1.1rem; font-weight:900; color:#fbbf24; letter-spacing:.08em; text-shadow:0 0 8px rgba(251,191,36,.3);">--</span>
          </div>
          <div>
            <span style="font-size:.6rem; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:#2d3d54; display:block; margin-bottom:.2rem;">Celda</span>
            <span id="exitSpaceCode" style="font-family:'JetBrains Mono',monospace; font-size:.9rem; font-weight:800; color:#60a5fa;">--</span>
          </div>
          <div>
            <span style="font-size:.6rem; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:#2d3d54; display:block; margin-bottom:.2rem;">Tipo</span>
            <span id="exitVehicleType" style="font-size:.8rem; font-weight:700; color:#94a3b8; text-transform:capitalize;">--</span>
          </div>
          <div>
            <span style="font-size:.6rem; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:#2d3d54; display:block; margin-bottom:.2rem;">Hora Ingreso</span>
            <span id="exitEntryTime" style="font-family:'JetBrains Mono',monospace; font-size:.8rem; font-weight:700; color:#94a3b8;">--</span>
          </div>
          <div>
            <span style="font-size:.6rem; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:#2d3d54; display:block; margin-bottom:.2rem;">Estancia</span>
            <span id="exitStayDuration" style="font-family:'JetBrains Mono',monospace; font-size:.8rem; font-weight:800; color:#34d399;">--</span>
          </div>
        </div>

        <!-- Descuento + Ticket Perdido -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:.75rem;">
          <div>
            <label style="display:block; font-size:.68rem; font-weight:800; text-transform:uppercase; letter-spacing:.07em; color:#64748b; margin-bottom:.4rem;">Descuento Convenio</label>
            <select id="exitDiscountSelect" name="discount_percent" onchange="recalculateExitTotal()"
                    style="width:100%; background:rgba(4,7,17,.8); border:1px solid rgba(255,255,255,.08); color:#f1f5f9;
                           border-radius:10px; padding:.6rem .75rem; font-size:.8rem; outline:none; cursor:pointer;"
                    onfocus="this.style.borderColor='rgba(59,130,246,.5)'"
                    onblur="this.style.borderColor='rgba(255,255,255,.08)'">
              <option value="0">Sin Descuento (0%)</option>
              <option value="10">Convenio Aliado (10%)</option>
              <option value="20">Hotel / Clínica (20%)</option>
              <option value="50">Cortesía Especial (50%)</option>
              <option value="100">Exento Total (100%)</option>
            </select>
          </div>
          <div style="display:flex; align-items:center; padding-top:1.25rem;">
            <label style="display:flex; align-items:center; gap:.5rem; cursor:pointer;">
              <input type="checkbox" id="exitLostTicketCheck" name="lost_ticket" value="1" onchange="recalculateExitTotal()"
                     style="width:16px; height:16px; accent-color:#f59e0b; cursor:pointer;">
              <div>
                <span style="font-size:.8rem; font-weight:700; color:#f1f5f9;">Ticket Perdido</span>
                <span style="display:block; font-size:.65rem; color:#475569;">Aplica multa adicional</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Desglose de Valores -->
        <div style="background:rgba(4,7,17,.7); border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:1rem; display:flex; flex-direction:column; gap:.625rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:.78rem;">
            <span style="color:#475569;">Cobro por Tiempo:</span>
            <span id="exitBaseCharge" style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#cbd5e1;">$ 0 COP</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:.78rem;">
            <span style="color:#475569;">Multa Ticket Perdido:</span>
            <span id="exitLostTicketCharge" style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#fbbf24;">$ 0 COP</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:.78rem;">
            <span style="color:#475569;">Descuento Aplicado:</span>
            <span id="exitDiscountAmount" style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#34d399;">$ 0 COP</span>
          </div>
          <div style="border-top:1px solid rgba(255,255,255,.06); padding-top:.625rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:.72rem; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:.07em;">TOTAL A COBRAR</span>
            <span id="exitTotalDisplay" style="font-family:'JetBrains Mono',monospace; font-size:1.625rem; font-weight:900; color:#34d399; text-shadow:0 0 16px rgba(52,211,153,.3);">$ 0 COP</span>
          </div>
        </div>

        <!-- Método de Pago + Monto Recibido -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:.75rem;">
          <div>
            <label style="display:block; font-size:.68rem; font-weight:800; text-transform:uppercase; letter-spacing:.07em; color:#64748b; margin-bottom:.4rem;">Método de Pago *</label>
            <select name="payment_method" id="exitPaymentMethod" onchange="recalculateExitTotal()"
                    style="width:100%; background:rgba(4,7,17,.8); border:1px solid rgba(255,255,255,.08); color:#f1f5f9;
                           border-radius:10px; padding:.6rem .75rem; font-size:.8rem; outline:none; cursor:pointer;"
                    onfocus="this.style.borderColor='rgba(59,130,246,.5)'"
                    onblur="this.style.borderColor='rgba(255,255,255,.08)'">
              <option value="efectivo">💵 Efectivo</option>
              <option value="nequi">💜 Nequi</option>
              <option value="daviplata">🟠 Daviplata</option>
              <option value="tarjeta">💳 Tarjeta D/C</option>
              <option value="convenio">🏢 Convenio</option>
            </select>
          </div>
          <div id="exitAmountReceivedContainer">
            <label style="display:block; font-size:.68rem; font-weight:800; text-transform:uppercase; letter-spacing:.07em; color:#64748b; margin-bottom:.4rem;">Monto Recibido</label>
            <input type="number" name="amount_received" id="exitAmountReceived" placeholder="0" oninput="recalculateExitTotal()"
                   style="width:100%; background:rgba(4,7,17,.8); border:1px solid rgba(255,255,255,.08); color:#34d399;
                          border-radius:10px; padding:.6rem .75rem; font-size:.875rem; font-family:'JetBrains Mono',monospace;
                          font-weight:800; outline:none; transition:border-color .15s;"
                   onfocus="this.style.borderColor='rgba(16,185,129,.5)'"
                   onblur="this.style.borderColor='rgba(255,255,255,.08)'">
          </div>
        </div>

        <!-- Vueltas / Cambio -->
        <div id="exitChangeContainer" style="padding:.875rem 1rem; background:rgba(37,99,235,.08); border:1px solid rgba(59,130,246,.2); border-radius:10px; display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:.78rem; font-weight:700; color:#93c5fd;">Cambio / Vueltas al Cliente:</span>
          <span id="exitChangeDisplay" style="font-family:'JetBrains Mono',monospace; font-size:1rem; font-weight:900; color:#60a5fa;">$ 0 COP</span>
        </div>

        <!-- Botones -->
        <div style="display:flex; align-items:center; justify-content:flex-end; gap:.625rem; padding-top:.75rem; border-top:1px solid rgba(255,255,255,.05);">
          <button type="button" onclick="closeExitModal()"
                  style="padding:.55rem 1rem; font-size:.8rem; font-weight:700; color:#64748b; background:transparent;
                         border:1px solid rgba(255,255,255,.07); border-radius:10px; cursor:pointer; transition:all .12s;"
                  onmouseover="this.style.background='rgba(255,255,255,.05)'; this.style.color='#94a3b8'"
                  onmouseout="this.style.background='transparent'; this.style.color='#64748b'">
            Cancelar
          </button>
          <button type="submit"
                  style="padding:.6rem 1.25rem; font-size:.8rem; font-weight:800; color:white;
                         background:linear-gradient(135deg,#059669,#047857); border:1px solid rgba(16,185,129,.4);
                         border-radius:10px; cursor:pointer; transition:all .2s; box-shadow:0 4px 14px rgba(5,150,105,.35);"
                  onmouseover="this.style.background='linear-gradient(135deg,#10b981,#059669)'; this.style.boxShadow='0 4px 20px rgba(16,185,129,.45)'"
                  onmouseout="this.style.background='linear-gradient(135deg,#059669,#047857)'; this.style.boxShadow='0 4px 14px rgba(5,150,105,.35)'">
            Procesar Cobro y Liberar Celda →
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════
       MODAL: TICKET TÉRMICO
  ══════════════════════════════════════════════════ -->
  <?php if (isset($_SESSION['last_ticket'])):
    $t = $_SESSION['last_ticket'];
    unset($_SESSION['last_ticket']);
  ?>
  <div id="ticketModal"
       style="position:fixed; inset:0; z-index:200; display:flex; align-items:center; justify-content:center; padding:1rem;
              background:rgba(4,7,17,.88); backdrop-filter:blur(20px);">
    <div style="background:#0d1525; border:1px solid rgba(255,255,255,.1); border-radius:20px; max-width:380px; width:100%;
                overflow:hidden; box-shadow:0 30px 70px rgba(0,0,0,.8); animation:scaleIn .2s cubic-bezier(0.16,1,0.3,1); padding:1.5rem;">

      <!-- Ticket Imprimible -->
      <div id="printableTicket"
           style="background:#fff; color:#1e293b; font-family:'Courier New',monospace; border-radius:8px; padding:1.25rem;
                  border:2px dashed #94a3b8; text-align:center; position:relative; margin-bottom:1rem;">
        <!-- Cabecera -->
        <h2 style="font-size:1rem; font-weight:900; letter-spacing:.1em; color:#0f172a; margin:0 0 .25rem;">PARKFLOW NEIVA</h2>
        <p style="font-size:.65rem; color:#64748b; margin:0;">NIT 900.542.118-2 · Cra 5 # 12-45 Centro</p>

        <div style="border-top:1px dashed #94a3b8; border-bottom:1px dashed #94a3b8; margin:.75rem 0; padding:.625rem 0;">
          <p style="font-size:.7rem; font-weight:700; letter-spacing:.12em; color:#475569; margin:0 0 .25rem;"><?= $t['ticket_number'] ?></p>
          <p style="font-size:1.75rem; font-weight:900; letter-spacing:.1em; color:#0f172a; margin:0 0 .25rem;"><?= $t['plate'] ?></p>
          <span style="font-size:.65rem; font-weight:700; background:#e2e8f0; padding:.2rem .5rem; border-radius:4px; text-transform:uppercase;">
            CELDA <?= $t['space_code'] ?> · <?= strtoupper($t['vehicle_type']) ?>
          </span>
        </div>

        <div style="font-size:.7rem; text-align:left; display:flex; flex-direction:column; gap:.25rem; font-family:'Courier New',monospace; color:#334155;">
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#64748b;">Ingreso:</span>
            <span style="font-weight:700;"><?= date('d/m/Y H:i', strtotime($t['entry_time'])) ?></span>
          </div>
          <?php if (!empty($t['exit_time'])): ?>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:#64748b;">Salida:</span>
              <span style="font-weight:700;"><?= date('d/m/Y H:i', strtotime($t['exit_time'])) ?></span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:#64748b;">Estancia:</span>
              <span style="font-weight:700;"><?= $t['total_minutes'] ?> min</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-top:1px dashed #94a3b8; padding-top:.375rem; margin-top:.25rem;">
              <span style="font-weight:900; font-size:.8rem;">TOTAL PAGADO:</span>
              <span style="font-weight:900; font-size:.8rem;"><?= formatCOP($t['total_paid']) ?></span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:#64748b;">Método:</span>
              <span style="font-weight:700; text-transform:uppercase;"><?= $t['payment_method'] ?></span>
            </div>
          <?php endif; ?>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#64748b;">Operador:</span>
            <span style="font-weight:700;"><?= htmlspecialchars($t['operator_entry_name']) ?></span>
          </div>
        </div>
        <p style="font-size:.6rem; color:#94a3b8; margin:.75rem 0 0; line-height:1.4;">Conserve este ticket · No nos responsabilizamos por objetos de valor no declarados.</p>
      </div>

      <!-- Botones -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:.625rem;">
        <button onclick="document.getElementById('ticketModal').style.display='none'"
                style="padding:.625rem; font-size:.8rem; font-weight:700; color:#64748b; background:rgba(255,255,255,.04);
                       border:1px solid rgba(255,255,255,.07); border-radius:10px; cursor:pointer; transition:all .12s;"
                onmouseover="this.style.color='#94a3b8'; this.style.background='rgba(255,255,255,.08)'"
                onmouseout="this.style.color='#64748b'; this.style.background='rgba(255,255,255,.04)'">
          Cerrar
        </button>
        <button onclick="printThermalTicket()"
                style="padding:.625rem; font-size:.8rem; font-weight:800; color:white; display:flex; align-items:center; justify-content:center; gap:.375rem;
                       background:linear-gradient(135deg,#2563eb,#1d4ed8); border:1px solid rgba(59,130,246,.5);
                       border-radius:10px; cursor:pointer; transition:all .2s; box-shadow:0 4px 14px rgba(37,99,235,.35);"
                onmouseover="this.style.boxShadow='0 4px 20px rgba(37,99,235,.5)'"
                onmouseout="this.style.boxShadow='0 4px 14px rgba(37,99,235,.35)'">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Imprimir Ticket
        </button>
      </div>
    </div>
  </div>
  <?php endif; ?>

  <!-- ── Tarifas en memoria JS ── -->
  <?php
  $ratesQuery = $db->query("SELECT * FROM `rates`")->fetchAll();
  $ratesMap = [];
  foreach ($ratesQuery as $rq) { $ratesMap[$rq['vehicle_type']] = $rq; }
  ?>
  <script>
    window.parkingRates = <?= json_encode($ratesMap, JSON_UNESCAPED_UNICODE) ?>;

    function toggleHelmets(show) {
      const el = document.getElementById('helmetsContainer');
      if (el) el.style.display = show ? 'block' : 'none';
    }

    function toggleUserMenu() {
      const dd = document.getElementById('userMenuDropdown');
      if (!dd) return;
      const isOpen = dd.style.display !== 'none';
      dd.style.display = isOpen ? 'none' : 'block';
    }

    // Actualizar estilos de los botones de tipo de vehículo
    document.addEventListener('DOMContentLoaded', () => {
      const radios = document.querySelectorAll('.vtype-radio');
      radios.forEach(radio => {
        const updateStyles = () => {
          radios.forEach(r => {
            const btn = r.closest('label').querySelector('div');
            if (btn) {
              if (r.checked) {
                btn.style.background = 'rgba(37,99,235,.2)';
                btn.style.borderColor = 'rgba(59,130,246,.5)';
                btn.style.color = '#60a5fa';
                btn.style.boxShadow = '0 0 16px rgba(37,99,235,.2)';
              } else {
                btn.style.background = 'rgba(4,7,17,.7)';
                btn.style.borderColor = 'rgba(255,255,255,.08)';
                btn.style.color = '#64748b';
                btn.style.boxShadow = 'none';
              }
            }
          });
        };
        radio.addEventListener('change', updateStyles);
      });
      // Aplicar estilo inicial al radio checked
      const firstChecked = document.querySelector('.vtype-radio:checked');
      if (firstChecked) {
        const btn = firstChecked.closest('label').querySelector('div');
        if (btn) {
          btn.style.background = 'rgba(37,99,235,.2)';
          btn.style.borderColor = 'rgba(59,130,246,.5)';
          btn.style.color = '#60a5fa';
          btn.style.boxShadow = '0 0 16px rgba(37,99,235,.2)';
        }
      }

      // Mostrar reloj widget en desktop
      const cw = document.getElementById('clockWidget');
      if (cw && window.innerWidth >= 1024) cw.style.display = 'flex';
    });

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (e) => {
      const wrapper = document.getElementById('userMenuWrapper');
      const dd = document.getElementById('userMenuDropdown');
      if (wrapper && dd && !wrapper.contains(e.target)) {
        dd.style.display = 'none';
      }
    });

    // Funciones de modal Entry
    function openEntryModal(spaceId = '', spaceCode = '') {
      const modal = document.getElementById('entryModal');
      if (!modal) return;
      const sel = document.getElementById('entrySpaceSelect');
      if (sel && spaceId) sel.value = spaceId;
      const badge = document.getElementById('entryPreselectedCodeBadge');
      if (badge) {
        if (spaceCode) {
          badge.textContent = '📌 Celda asignada: ' + spaceCode;
          badge.style.display = 'block';
        } else {
          badge.style.display = 'none';
        }
      }
      modal.style.display = 'flex';
      const plate = document.getElementById('entryPlateInput');
      if (plate) setTimeout(() => plate.focus(), 100);
    }

    function closeEntryModal() {
      const modal = document.getElementById('entryModal');
      if (modal) modal.style.display = 'none';
    }

    // Funciones de modal Exit
    function openExitModal(movement) {
      const modal = document.getElementById('exitModal');
      if (!modal) return;
      document.getElementById('exitMovementId').value = movement.id || movement.mov_id;
      document.getElementById('exitTicketNumber').textContent = movement.ticket_number;
      document.getElementById('exitPlate').textContent = movement.plate;
      document.getElementById('exitSpaceCode').textContent = movement.space_code;
      document.getElementById('exitVehicleType').textContent = (movement.vehicle_type || movement.mov_type || '').toUpperCase();
      document.getElementById('exitEntryTime').textContent = new Date(movement.entry_time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      const entryMs = new Date(movement.entry_time).getTime();
      const diffMin = Math.max(1, Math.round((Date.now() - entryMs) / 60000));
      const hh = Math.floor(diffMin / 60), mm = diffMin % 60;
      document.getElementById('exitStayDuration').textContent = `${hh}h ${mm}m (${diffMin} min)`;
      window.currentExitMovement = movement;
      window.currentExitMinutes  = diffMin;
      recalculateExitTotal();
      modal.style.display = 'flex';
    }

    function closeExitModal() {
      const modal = document.getElementById('exitModal');
      if (modal) modal.style.display = 'none';
    }
  </script>

  <script src="assets/js/app.js"></script>
  <script>
    if (window.lucide) lucide.createIcons();

    // Reloj en vivo
    function startLiveClock() {
      const el = document.getElementById('liveClock');
      if (!el) return;
      const upd = () => {
        el.textContent = new Date().toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true });
      };
      upd();
      setInterval(upd, 1000);
    }
    document.addEventListener('DOMContentLoaded', startLiveClock);

    // ESC cierra modales
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeEntryModal();
        closeExitModal();
        const tm = document.getElementById('ticketModal');
        if (tm) tm.style.display = 'none';
      }
    });
  </script>
</body>
</html>
