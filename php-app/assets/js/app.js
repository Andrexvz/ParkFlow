/**
 * ParkFlow - JavaScript de Interacción Dinámica para la Aplicación PHP
 */

// Sonidos Sintetizados con Web Audio API (sin archivos externos)
const soundEffects = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
  },
  playSuccess() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch(e) {}
  },
  playPayment() {
    try {
      this.init();
      if (!this.ctx) return;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + (i * 0.06));
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + (i * 0.06));
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (i * 0.06) + 0.15);
        osc.start(this.ctx.currentTime + (i * 0.06));
        osc.stop(this.ctx.currentTime + (i * 0.06) + 0.15);
      });
    } catch(e) {}
  }
};

// Reloj en tiempo real
function startLiveClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;
  const update = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };
  update();
  setInterval(update, 1000);
}

// Abrir Modal de Entrada
function openEntryModal(spaceId = '', spaceCode = '') {
  const modal = document.getElementById('entryModal');
  if (!modal) return;
  const selectEl = document.getElementById('entrySpaceSelect');
  if (selectEl && spaceId) {
    selectEl.value = spaceId;
  }
  const codeBadge = document.getElementById('entryPreselectedCodeBadge');
  if (codeBadge) {
    if (spaceCode) {
      codeBadge.textContent = 'Celda asignada: ' + spaceCode;
      codeBadge.classList.remove('hidden');
    } else {
      codeBadge.classList.add('hidden');
    }
  }
  modal.classList.remove('hidden');
  const plateInput = document.getElementById('entryPlateInput');
  if (plateInput) plateInput.focus();
}

function closeEntryModal() {
  const modal = document.getElementById('entryModal');
  if (modal) modal.classList.add('hidden');
}

// Abrir Modal de Salida y Cobro
function openExitModal(movement) {
  const modal = document.getElementById('exitModal');
  if (!modal) return;

  document.getElementById('exitMovementId').value = movement.id;
  document.getElementById('exitTicketNumber').textContent = movement.ticket_number;
  document.getElementById('exitPlate').textContent = movement.plate;
  document.getElementById('exitSpaceCode').textContent = movement.space_code;
  document.getElementById('exitVehicleType').textContent = movement.vehicle_type.toUpperCase();
  document.getElementById('exitEntryTime').textContent = new Date(movement.entry_time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  // Calcular minutos aproximados
  const entryMs = new Date(movement.entry_time).getTime();
  const nowMs = Date.now();
  const diffMinutes = Math.max(1, Math.round((nowMs - entryMs) / 60000));
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  document.getElementById('exitStayDuration').textContent = `${hours}h ${mins}m (${diffMinutes} min)`;

  // Guardar datos base para recalcular en vivo
  window.currentExitMovement = movement;
  window.currentExitMinutes = diffMinutes;
  recalculateExitTotal();

  modal.classList.remove('hidden');
}

function closeExitModal() {
  const modal = document.getElementById('exitModal');
  if (modal) modal.classList.add('hidden');
}

// Recalcular cobro de salida
function recalculateExitTotal() {
  const mov = window.currentExitMovement;
  if (!mov || !window.parkingRates) return;

  const rate = window.parkingRates[mov.vehicle_type] || Object.values(window.parkingRates)[0];
  const minutes = window.currentExitMinutes || 1;
  const isLost = document.getElementById('exitLostTicketCheck')?.checked || false;
  const discountPercent = parseInt(document.getElementById('exitDiscountSelect')?.value || '0', 10);

  let baseCharge = 0;
  let graceApplied = false;

  if (minutes <= rate.grace_period_minutes) {
    graceApplied = true;
    baseCharge = 0;
  } else if (minutes >= 720) {
    const days = Math.ceil(minutes / 1440);
    baseCharge = days * rate.rate_per_day;
  } else if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    const fractions = Math.ceil(rem / 15);
    baseCharge = (hours * rate.rate_per_hour) + Math.min(fractions * rate.rate_per_fraction15m, rate.rate_per_hour);
  } else {
    const fractions = Math.ceil(minutes / 15);
    baseCharge = Math.min(fractions * rate.rate_per_fraction15m, rate.rate_per_hour);
  }

  let subtotal = baseCharge;
  if (isLost) {
    subtotal += parseFloat(rate.lost_ticket_fee);
  }

  let discount = 0;
  if (discountPercent > 0) {
    discount = Math.round((subtotal * discountPercent) / 100);
  }

  const total = Math.max(0, subtotal - discount);

  // Renderizar valores en modal
  const fmt = (num) => '$ ' + Math.round(num).toLocaleString('es-CO') + ' COP';
  document.getElementById('exitBaseCharge').textContent = fmt(baseCharge);
  document.getElementById('exitLostTicketCharge').textContent = isLost ? fmt(rate.lost_ticket_fee) : '$ 0 COP';
  document.getElementById('exitDiscountAmount').textContent = discount > 0 ? '-' + fmt(discount) : '$ 0 COP';
  document.getElementById('exitTotalDisplay').textContent = fmt(total);

  // Campos ocultos del formulario
  document.getElementById('formTotalMinutes').value = minutes;
  document.getElementById('formGraceApplied').value = graceApplied ? '1' : '0';
  document.getElementById('formSubtotal').value = subtotal;
  document.getElementById('formDiscount').value = discount;
  document.getElementById('formTotalPaid').value = total;

  // Actualizar cálculo de cambio / vueltas
  updateChangeGiven(total);
}

function updateChangeGiven(total) {
  const method = document.getElementById('exitPaymentMethod')?.value;
  const receivedInput = document.getElementById('exitAmountReceived');
  const changeContainer = document.getElementById('exitChangeContainer');
  const changeDisplay = document.getElementById('exitChangeDisplay');
  const formChange = document.getElementById('formChangeGiven');

  if (method === 'efectivo') {
    changeContainer.classList.remove('hidden');
    const received = parseFloat(receivedInput.value) || 0;
    const change = Math.max(0, received - total);
    changeDisplay.textContent = '$ ' + Math.round(change).toLocaleString('es-CO') + ' COP';
    formChange.value = change;
  } else {
    changeContainer.classList.add('hidden');
    receivedInput.value = total;
    formChange.value = 0;
  }
}

// Imprimir Ticket Térmico
function printThermalTicket() {
  soundEffects.playPayment();
  window.print();
}

// Iniciar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  startLiveClock();

  // Escuchar teclado para cerrar modales con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEntryModal();
      closeExitModal();
      const ticketModal = document.getElementById('ticketModal');
      if (ticketModal) ticketModal.classList.add('hidden');
    }
  });
});
