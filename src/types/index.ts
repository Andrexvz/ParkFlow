export type UserRole = 'ADMIN' | 'OPERADOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  shift?: 'Mañana (06:00 - 14:00)' | 'Tarde (14:00 - 22:00)' | 'Noche (22:00 - 06:00)';
  active: boolean;
  avatarUrl?: string;
}

export type VehicleType = 'automovil' | 'motocicleta' | 'camioneta' | 'bicicleta';

export type SpaceStatus = 'libre' | 'ocupado' | 'mantenimiento' | 'reservado';

export interface ParkingSpace {
  id: string;
  code: string; // ej: A-01, B-12
  zone: 'Zona A' | 'Zona B' | 'Zona C' | 'Zona D';
  allowedType: VehicleType;
  status: SpaceStatus;
  currentVehiclePlate?: string;
  currentMovementId?: string;
  notes?: string;
}

export interface VehicleRate {
  id: string;
  vehicleType: VehicleType;
  label: string;
  ratePerMinute: number; // COP
  ratePerFraction15m: number; // COP
  ratePerHour: number; // COP
  ratePerDay: number; // COP (12-24 hrs)
  ratePerMonth: number; // COP
  gracePeriodMinutes: number; // Tiempo de cortesía gratis
  lostTicketFee: number; // Multa por ticket perdido
}

export type PaymentMethod = 'efectivo' | 'nequi' | 'daviplata' | 'tarjeta' | 'convenio';

export interface Movement {
  id: string;
  ticketNumber: string;
  plate: string;
  vehicleType: VehicleType;
  spaceId: string;
  spaceCode: string;
  entryTime: string; // ISO String
  exitTime?: string; // ISO String
  operatorEntryId: string;
  operatorEntryName: string;
  operatorExitId?: string;
  operatorExitName?: string;
  helmetsCount?: number; // Para motos
  entryNotes?: string;
  exitNotes?: string;
  clientName?: string;
  clientPhone?: string;
  
  // Detalle de liquidación
  totalMinutes?: number;
  billedMinutes?: number;
  graceApplied?: boolean;
  subtotal?: number;
  discount?: number;
  lostTicketCharge?: boolean;
  totalPaid?: number;
  paymentMethod?: PaymentMethod;
  amountReceived?: number;
  changeGiven?: number;
  status: 'activo' | 'completado' | 'cancelado';
}

export interface ParkingStats {
  totalSpaces: number;
  occupiedSpaces: number;
  freeSpaces: number;
  maintenanceSpaces: number;
  occupancyRate: number;
  todayRevenue: number;
  todayVehiclesCount: number;
  averageStayMinutes: number;
}
