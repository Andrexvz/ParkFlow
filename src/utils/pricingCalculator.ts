import { VehicleRate } from '../types';

export interface PricingBreakdown {
  totalMinutes: number;
  hours: number;
  remainingMinutes: number;
  graceApplied: boolean;
  baseCharge: number;
  penaltyCharge: number;
  discount: number;
  total: number;
  explanation: string;
}

/**
 * Formatear valores en pesos colombianos (COP)
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calcular el cobro según tiempo de permanencia y tarifa de Neiva
 */
export function calculateParkingFee(
  entryDate: Date,
  exitDate: Date,
  rate: VehicleRate,
  options?: {
    isLostTicket?: boolean;
    discountPercent?: number;
  }
): PricingBreakdown {
  const diffMs = Math.max(0, exitDate.getTime() - entryDate.getTime());
  const totalMinutes = Math.ceil(diffMs / (1000 * 60));

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // Si está dentro del periodo de gracia de cortesía
  if (totalMinutes <= rate.gracePeriodMinutes && !options?.isLostTicket) {
    return {
      totalMinutes,
      hours,
      remainingMinutes,
      graceApplied: true,
      baseCharge: 0,
      penaltyCharge: 0,
      discount: 0,
      total: 0,
      explanation: `Periodo de cortesía (${totalMinutes}m ≤ ${rate.gracePeriodMinutes}m). Sin costo.`
    };
  }

  let baseCharge = 0;
  let explanation = '';

  // Si supera 12 horas o tarifa día pleno (mayor a 10 horas)
  if (totalMinutes >= 600) {
    const days = Math.max(1, Math.ceil(totalMinutes / (24 * 60)));
    baseCharge = days * rate.ratePerDay;
    explanation = `${days} día(s) x ${formatCOP(rate.ratePerDay)}`;
  } else {
    // Cobro por hora y fracciones de 15 minutos
    // Si la permanencia es menor a 1 hora pero mayor a la gracia: cobramos 1 hora mínima o por fracciones
    if (totalMinutes <= 60) {
      baseCharge = rate.ratePerHour;
      explanation = `1 hora inicial (${totalMinutes} min) x ${formatCOP(rate.ratePerHour)}`;
    } else {
      // Horas completas
      const fullHoursCharge = hours * rate.ratePerHour;
      // Fracciones adicionales de 15 minutos
      const fractions = Math.ceil(remainingMinutes / 15);
      const fractionsCharge = fractions * rate.ratePerFraction15m;

      // Si la fracción adicional iguala o supera la tarifa por hora, se cobra la hora
      const extraMinutesCost = Math.min(fractionsCharge, rate.ratePerHour);

      baseCharge = fullHoursCharge + extraMinutesCost;
      explanation = `${hours}h x ${formatCOP(rate.ratePerHour)} + ${fractions} fracción(es) x ${formatCOP(rate.ratePerFraction15m)}`;
    }
  }

  // Recargo por pérdida de ticket
  let penaltyCharge = 0;
  if (options?.isLostTicket) {
    penaltyCharge = rate.lostTicketFee;
    explanation += ` + Penalidad ticket extraviado (${formatCOP(penaltyCharge)})`;
  }

  // Descuento
  let discount = 0;
  if (options?.discountPercent && options.discountPercent > 0) {
    discount = Math.round((baseCharge + penaltyCharge) * (options.discountPercent / 100));
  }

  const total = Math.max(0, baseCharge + penaltyCharge - discount);

  return {
    totalMinutes,
    hours,
    remainingMinutes,
    graceApplied: false,
    baseCharge,
    penaltyCharge,
    discount,
    total,
    explanation
  };
}

/**
 * Formatear minutos en texto legible: "2h 15m" o "45m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
