  </main>

  <!-- Pie de Página -->
  <footer class="bg-white border-t border-slate-200 mt-auto py-5 text-center text-xs text-slate-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span class="font-medium text-slate-700">Conectado a MySQL (XAMPP Puerto 3306)</span>
        <span class="text-slate-300">·</span>
        <span>Base de Datos: <code class="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">parkflow_db</code></span>
      </div>
      <div>
        <span>ParkFlow &copy; <?= date('Y') ?> · Neiva, Huila · Sistema de Parqueaderos</span>
      </div>
    </div>
  </footer>

  <!-- ======================================================== -->
  <!-- MODAL: REGISTRAR ENTRADA DE VEHÍCULO                     -->
  <!-- ======================================================== -->
  <?php
  // Cargar celdas libres para el selector de entrada
  $freeSpaces = $db->query("SELECT * FROM `parking_spaces` WHERE `status` = 'libre' ORDER BY `code` ASC")->fetchAll();
  ?>
  <div id="entryModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <i data-lucide="car" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Registrar Entrada</h3>
            <p class="text-xs text-slate-500">Generar nuevo ticket de ingreso</p>
          </div>
        </div>
        <button onclick="closeEntryModal()" class="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-200 rounded-lg">✕</button>
      </div>

      <form action="actions/entry.php" method="POST" class="p-6 space-y-4">
        <!-- Indicador de celda preseleccionada si aplica -->
        <div id="entryPreselectedCodeBadge" class="hidden text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg"></div>

        <!-- Placa -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Placa del Vehículo *</label>
          <input type="text" name="plate" id="entryPlateInput" required placeholder="Ej: KEO492 o NXL10F" autocomplete="off"
            class="w-full text-center text-2xl font-mono font-bold tracking-widest uppercase px-4 py-2.5 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50"
            oninput="this.value = this.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')">
        </div>

        <!-- Tipo de Vehículo -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tipo de Vehículo *</label>
          <div class="grid grid-cols-4 gap-2">
            <label class="cursor-pointer">
              <input type="radio" name="vehicle_type" value="automovil" checked class="peer sr-only" onchange="toggleHelmets(false)">
              <div class="p-2.5 text-center rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 font-semibold text-xs transition-all">
                Automóvil
              </div>
            </label>
            <label class="cursor-pointer">
              <input type="radio" name="vehicle_type" value="motocicleta" class="peer sr-only" onchange="toggleHelmets(true)">
              <div class="p-2.5 text-center rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 font-semibold text-xs transition-all">
                Motocicleta
              </div>
            </label>
            <label class="cursor-pointer">
              <input type="radio" name="vehicle_type" value="camioneta" class="peer sr-only" onchange="toggleHelmets(false)">
              <div class="p-2.5 text-center rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 font-semibold text-xs transition-all">
                Camioneta
              </div>
            </label>
            <label class="cursor-pointer">
              <input type="radio" name="vehicle_type" value="bicicleta" class="peer sr-only" onchange="toggleHelmets(false)">
              <div class="p-2.5 text-center rounded-xl border border-slate-200 bg-slate-50 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 font-semibold text-xs transition-all">
                Bicicleta
              </div>
            </label>
          </div>
        </div>

        <!-- Celda asignada -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Celda de Parqueadero</label>
          <select name="space_id" id="entrySpaceSelect" class="w-full text-sm font-semibold px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-600">
            <option value="">⚡ Asignación Automática (Recomendado)</option>
            <?php foreach ($freeSpaces as $sp): ?>
              <option value="<?= $sp['id'] ?>">Celda <?= $sp['code'] ?> (<?= $sp['zone'] ?> - <?= ucfirst($sp['allowed_type']) ?>)</option>
            <?php endforeach; ?>
          </select>
        </div>

        <!-- Cascos para motos -->
        <div id="helmetsContainer" class="hidden">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Cascos en Custodia (Locker)</label>
          <select name="helmets_count" class="w-full text-sm font-semibold px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-600">
            <option value="0">0 Cascos</option>
            <option value="1">1 Casco</option>
            <option value="2">2 Cascos</option>
          </select>
        </div>

        <!-- Observaciones -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Notas de Entrada (Opcional)</label>
          <input type="text" name="entry_notes" placeholder="Ej: Rayón preexistente puerta derecha, espejo..."
            class="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600">
        </div>

        <!-- Botones -->
        <div class="pt-2 flex items-center justify-end gap-2.5">
          <button type="button" onclick="closeEntryModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            Cancelar
          </button>
          <button type="submit" class="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors">
            Generar Ticket e Ingresar
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- ======================================================== -->
  <!-- MODAL: REGISTRAR SALIDA Y COBRO                          -->
  <!-- ======================================================== -->
  <div id="exitModal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <i data-lucide="receipt" class="w-4 h-4"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-base">Liquidación y Salida</h3>
            <p class="text-xs text-slate-500">Cobro de estancia y liberación de celda</p>
          </div>
        </div>
        <button onclick="closeExitModal()" class="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-200 rounded-lg">✕</button>
      </div>

      <form action="actions/exit.php" method="POST" class="p-6 space-y-4">
        <input type="hidden" name="movement_id" id="exitMovementId">
        <input type="hidden" name="total_minutes" id="formTotalMinutes" value="0">
        <input type="hidden" name="grace_applied" id="formGraceApplied" value="0">
        <input type="hidden" name="subtotal" id="formSubtotal" value="0">
        <input type="hidden" name="discount" id="formDiscount" value="0">
        <input type="hidden" name="total_paid" id="formTotalPaid" value="0">
        <input type="hidden" name="change_given" id="formChangeGiven" value="0">

        <!-- Ficha del Vehículo -->
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span class="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Ticket</span>
            <span id="exitTicketNumber" class="font-mono font-bold text-slate-900 text-sm">--</span>
          </div>
          <div>
            <span class="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Placa</span>
            <span id="exitPlate" class="font-mono font-bold text-blue-600 text-base">--</span>
          </div>
          <div>
            <span class="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Celda</span>
            <span id="exitSpaceCode" class="font-bold text-slate-800">--</span>
          </div>
          <div>
            <span class="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Tipo</span>
            <span id="exitVehicleType" class="font-bold text-slate-800">--</span>
          </div>
          <div>
            <span class="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Hora Ingreso</span>
            <span id="exitEntryTime" class="font-bold text-slate-800">--</span>
          </div>
          <div>
            <span class="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Tiempo Estancia</span>
            <span id="exitStayDuration" class="font-bold text-emerald-600">--</span>
          </div>
        </div>

        <!-- Opciones de Liquidación -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Descuento Convenio</label>
            <select id="exitDiscountSelect" name="discount_percent" onchange="recalculateExitTotal()" class="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-600">
              <option value="0">Sin Descuento (0%)</option>
              <option value="10">Convenio Aliado (10%)</option>
              <option value="20">Convenio Hotel/Clínica (20%)</option>
              <option value="50">Cortesía Especial (50%)</option>
              <option value="100">Exento Total (100%)</option>
            </select>
          </div>
          <div class="flex items-center pt-5">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="exitLostTicketCheck" name="lost_ticket" value="1" onchange="recalculateExitTotal()" class="w-4 h-4 text-blue-600 rounded">
              <span class="text-xs font-bold text-slate-700">Ticket Perdido</span>
            </label>
          </div>
        </div>

        <!-- Desglose de Valores -->
        <div class="p-3.5 bg-slate-100 rounded-xl space-y-1.5 text-xs">
          <div class="flex justify-between text-slate-600">
            <span>Cobro por Tiempo:</span>
            <span id="exitBaseCharge" class="font-mono font-medium">$ 0 COP</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Multa Ticket Perdido:</span>
            <span id="exitLostTicketCharge" class="font-mono font-medium">$ 0 COP</span>
          </div>
          <div class="flex justify-between text-emerald-600">
            <span>Descuento Aplicado:</span>
            <span id="exitDiscountAmount" class="font-mono font-medium">$ 0 COP</span>
          </div>
          <div class="border-t border-slate-300 pt-1.5 flex justify-between items-center text-sm font-bold text-slate-900">
            <span>TOTAL A COBRAR:</span>
            <span id="exitTotalDisplay" class="font-mono text-lg text-emerald-600 font-extrabold">$ 0 COP</span>
          </div>
        </div>

        <!-- Método de Pago -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Método de Pago *</label>
            <select name="payment_method" id="exitPaymentMethod" onchange="recalculateExitTotal()" class="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-600">
              <option value="efectivo">Efectivo</option>
              <option value="nequi">Nequi</option>
              <option value="daviplata">Daviplata</option>
              <option value="tarjeta">Tarjeta Débito/Crédito</option>
              <option value="convenio">Convenio Empresarial</option>
            </select>
          </div>

          <!-- Monto recibido en efectivo -->
          <div id="exitAmountReceivedContainer">
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Monto Recibido</label>
            <input type="number" name="amount_received" id="exitAmountReceived" placeholder="Monto entregado" oninput="recalculateExitTotal()"
              class="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600">
          </div>
        </div>

        <!-- Vueltas / Cambio -->
        <div id="exitChangeContainer" class="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs font-bold text-blue-900">
          <span>Cambio / Vueltas al Cliente:</span>
          <span id="exitChangeDisplay" class="font-mono text-sm font-extrabold text-blue-700">$ 0 COP</span>
        </div>

        <!-- Botones de Acción -->
        <div class="pt-2 flex items-center justify-end gap-2.5">
          <button type="button" onclick="closeExitModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            Cancelar
          </button>
          <button type="submit" class="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors">
            Procesar Pago y Liberar Celda
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- ======================================================== -->
  <!-- MODAL: TICKET TÉRMICO IMPRIMIBLE                         -->
  <!-- ======================================================== -->
  <?php if (isset($_SESSION['last_ticket'])): 
    $t = $_SESSION['last_ticket'];
    unset($_SESSION['last_ticket']);
  ?>
  <div id="ticketModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden p-6 space-y-4">
      
      <!-- Ficha física del ticket -->
      <div id="printableTicket" class="ticket-paper p-5 border border-dashed border-slate-300 rounded-lg text-center space-y-3">
        <div>
          <h2 class="text-lg font-black tracking-wider uppercase">PARKFLOW NEIVA</h2>
          <p class="text-[10px] text-slate-500">NIT 900.542.118-2 · Neiva, Huila</p>
          <p class="text-[10px] text-slate-500">Cra 5 # 12-45 Centro</p>
        </div>

        <div class="border-t border-b border-dashed border-slate-300 py-2">
          <p class="text-xs font-bold font-mono tracking-widest text-slate-700"><?= $t['ticket_number'] ?></p>
          <p class="text-2xl font-black font-mono text-slate-900 tracking-wider my-0.5"><?= $t['plate'] ?></p>
          <span class="inline-block text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 rounded text-slate-800">
            CELDA <?= $t['space_code'] ?> (<?= strtoupper($t['vehicle_type']) ?>)
          </span>
        </div>

        <div class="text-[11px] text-left space-y-1 font-mono">
          <div class="flex justify-between">
            <span class="text-slate-500">Ingreso:</span>
            <span class="font-bold"><?= date('d/m/Y H:i', strtotime($t['entry_time'])) ?></span>
          </div>
          <?php if (!empty($t['exit_time'])): ?>
            <div class="flex justify-between">
              <span class="text-slate-500">Salida:</span>
              <span class="font-bold"><?= date('d/m/Y H:i', strtotime($t['exit_time'])) ?></span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Estancia:</span>
              <span class="font-bold"><?= $t['total_minutes'] ?> minutos</span>
            </div>
            <div class="border-t border-dashed border-slate-300 pt-1 mt-1 flex justify-between font-bold text-sm">
              <span>TOTAL PAGADO:</span>
              <span><?= formatCOP($t['total_paid']) ?></span>
            </div>
            <div class="flex justify-between text-[10px] text-slate-500">
              <span>Método:</span>
              <span class="uppercase"><?= $t['payment_method'] ?></span>
            </div>
          <?php endif; ?>
          <div class="flex justify-between text-slate-500">
            <span>Operador:</span>
            <span><?= htmlspecialchars($t['operator_entry_name']) ?></span>
          </div>
        </div>

        <div class="pt-2 text-[9px] text-slate-400 leading-tight">
          <p>Conserve este ticket para retirar su vehículo.</p>
          <p>No nos hacemos responsables por objetos de valor no declarados.</p>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="flex items-center gap-2 pt-2">
        <button onclick="document.getElementById('ticketModal').classList.add('hidden')" class="w-1/2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
          Cerrar
        </button>
        <button onclick="printThermalTicket()" class="w-1/2 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
          <i data-lucide="printer" class="w-4 h-4"></i>
          <span>Imprimir</span>
        </button>
      </div>

    </div>
  </div>
  <?php endif; ?>

  <!-- Cargar tarifas en memoria JS -->
  <?php
  $ratesQuery = $db->query("SELECT * FROM `rates`")->fetchAll();
  $ratesMap = [];
  foreach ($ratesQuery as $rq) {
      $ratesMap[$rq['vehicle_type']] = $rq;
  }
  ?>
  <script>
    window.parkingRates = <?= json_encode($ratesMap, JSON_UNESCAPED_UNICODE) ?>;
    function toggleHelmets(show) {
      const el = document.getElementById('helmetsContainer');
      if (el) {
        if (show) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    }
  </script>

  <!-- Script principal de interacción -->
  <script src="assets/js/app.js"></script>
  <script>
    lucide.createIcons();
  </script>
</body>
</html>
