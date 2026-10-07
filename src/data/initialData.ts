import { ParkingSpace, VehicleRate, User, Movement } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Carlos Mendoza',
    email: 'admin@parkflow.co',
    role: 'ADMIN',
    shift: 'Mañana (06:00 - 14:00)',
    active: true
  },
  {
    id: 'usr-op-1',
    name: 'Andrés Charry',
    email: 'operador1@parkflow.co',
    role: 'OPERADOR',
    shift: 'Mañana (06:00 - 14:00)',
    active: true
  },
  {
    id: 'usr-op-2',
    name: 'Valentina Perdomo',
    email: 'operador2@parkflow.co',
    role: 'OPERADOR',
    shift: 'Tarde (14:00 - 22:00)',
    active: true
  }
];

export const INITIAL_RATES: VehicleRate[] = [
  {
    id: 'rate-auto',
    vehicleType: 'automovil',
    label: 'Automóvil Particular',
    ratePerMinute: 70,
    ratePerFraction15m: 1200,
    ratePerHour: 4200,
    ratePerDay: 28000,
    ratePerMonth: 180000,
    gracePeriodMinutes: 10,
    lostTicketFee: 20000
  },
  {
    id: 'rate-moto',
    vehicleType: 'motocicleta',
    label: 'Motocicleta',
    ratePerMinute: 35,
    ratePerFraction15m: 600,
    ratePerHour: 2200,
    ratePerDay: 14000,
    ratePerMonth: 90000,
    gracePeriodMinutes: 10,
    lostTicketFee: 15000
  },
  {
    id: 'rate-camioneta',
    vehicleType: 'camioneta',
    label: 'Camioneta / SUV / Van',
    ratePerMinute: 80,
    ratePerFraction15m: 1400,
    ratePerHour: 5000,
    ratePerDay: 35000,
    ratePerMonth: 220000,
    gracePeriodMinutes: 10,
    lostTicketFee: 20000
  },
  {
    id: 'rate-bici',
    vehicleType: 'bicicleta',
    label: 'Bicicleta / Patineta',
    ratePerMinute: 15,
    ratePerFraction15m: 300,
    ratePerHour: 1000,
    ratePerDay: 6000,
    ratePerMonth: 40000,
    gracePeriodMinutes: 15,
    lostTicketFee: 10000
  }
];

// Helper para generar tiempos relativos pasados
const nowMs = Date.now();
const minutesAgo = (mins: number) => new Date(nowMs - mins * 60 * 1000).toISOString();

export const INITIAL_MOVEMENTS: Movement[] = [
  // Movimientos Activos (Actuales)
  {
    id: 'mov-act-1',
    ticketNumber: 'TK-10024',
    plate: 'KEO-492',
    vehicleType: 'automovil',
    spaceId: 'sp-a-03',
    spaceCode: 'A-03',
    entryTime: minutesAgo(105), // 1h 45m
    operatorEntryId: 'usr-op-1',
    operatorEntryName: 'Andrés Charry',
    entryNotes: 'Vehículo en buen estado',
    status: 'activo'
  },
  {
    id: 'mov-act-2',
    ticketNumber: 'TK-10025',
    plate: 'NXL-10F',
    vehicleType: 'motocicleta',
    spaceId: 'sp-b-02',
    spaceCode: 'B-02',
    entryTime: minutesAgo(48), // 48m
    operatorEntryId: 'usr-op-1',
    operatorEntryName: 'Andrés Charry',
    helmetsCount: 2,
    entryNotes: '2 cascos negros bajo custodia en locker #4',
    status: 'activo'
  },
  {
    id: 'mov-act-3',
    ticketNumber: 'TK-10026',
    plate: 'WMS-831',
    vehicleType: 'camioneta',
    spaceId: 'sp-a-07',
    spaceCode: 'A-07',
    entryTime: minutesAgo(210), // 3h 30m
    operatorEntryId: 'usr-op-1',
    operatorEntryName: 'Andrés Charry',
    entryNotes: 'Portaequipaje en techo',
    status: 'activo'
  },
  {
    id: 'mov-act-4',
    ticketNumber: 'TK-10027',
    plate: 'VRT-45C',
    vehicleType: 'motocicleta',
    spaceId: 'sp-b-08',
    spaceCode: 'B-08',
    entryTime: minutesAgo(22), // 22m
    operatorEntryId: 'usr-op-1',
    operatorEntryName: 'Andrés Charry',
    helmetsCount: 1,
    status: 'activo'
  },
  {
    id: 'mov-act-5',
    ticketNumber: 'TK-10028',
    plate: 'HUK-719',
    vehicleType: 'automovil',
    spaceId: 'sp-c-01',
    spaceCode: 'C-01',
    entryTime: minutesAgo(340), // 5h 40m
    operatorEntryId: 'usr-op-1',
    operatorEntryName: 'Andrés Charry',
    status: 'activo'
  },
  {
    id: 'mov-act-6',
    ticketNumber: 'TK-10029',
    plate: 'B-04',
    vehicleType: 'bicicleta',
    spaceId: 'sp-d-02',
    spaceCode: 'D-02',
    entryTime: minutesAgo(75), // 1h 15m
    operatorEntryId: 'usr-op-1',
    operatorEntryName: 'Andrés Charry',
    entryNotes: 'Bicicleta GW color verde con candado propio',
    status: 'activo'
  },

  // Movimientos Completados Hoy (Para métricas e historial de Neiva)
  {
    id: 'mov-comp-1',
    ticketNumber: 'TK-10018',
    plate: 'FTZ-882',
    vehicleType: 'automovil',
    spaceId: 'sp-a-01',
    spaceCode: 'A-01',
    entryTime: minutesAgo(380),
    exitTime: minutesAgo(260),
    operatorEntryId: 'usr-op-1',
    operatorEntryName: 'Andrés Charry',
    operatorExitId: 'usr-op-1',
    operatorExitName: 'Andrés Charry',
    totalMinutes: 120,
    billedMinutes: 120,
    subtotal: 8400,
    totalPaid: 8400,
    paymentMethod: 'efectivo',
    amountReceived: 10000,
    changeGiven: 1600,
    status: 'completado'
  },
  {
    id: 'mov-comp-2',
    ticketNumber: 'TK-10019',
    plate: 'EHL-32D',
    vehicleType: 'motocicleta',
    spaceId: 'sp-b-01',
    spaceCode: 'B-01',
    entryTime: minutesAgo(340),
    exitTime: minutesAgo(240),
    operatorEntryId: 'usr-op-1',
    operatorEntryName: 'Andrés Charry',
    operatorExitId: 'usr-op-1',
    operatorExitName: 'Andrés Charry',
    totalMinutes: 100,
    billedMinutes: 100,
    subtotal: 4400,
    totalPaid: 4400,
    paymentMethod: 'nequi',
    status: 'completado'
  },
  {
    id: 'mov-comp-3',
    ticketNumber: 'TK-10020',
    plate: 'GKA-519',
    vehicleType: 'camioneta',
    spaceId: 'sp-a-05',
    spaceCode: 'A-05',
    entryTime: minutesAgo(310),
    exitTime: minutesAgo(180),
    operatorEntryId: 'usr-op-1',
    operatorEntryName: 'Andrés Charry',
    operatorExitId: 'usr-op-1',
    operatorExitName: 'Andrés Charry',
    totalMinutes: 130,
    billedMinutes: 130,
    subtotal: 11400,
    totalPaid: 11400,
    paymentMethod: 'tarjeta',
    status: 'completado'
  },
  {
    id: 'mov-comp-4',
    ticketNumber: 'TK-10021',
    plate: 'QWE-991',
    vehicleType: 'automovil',
    spaceId: 'sp-c-04',
    spaceCode: 'C-04',
    entryTime: minutesAgo(200),
    exitTime: minutesAgo(192),
    operatorEntryId: 'usr-op-1',
    operatorEntryName: 'Andrés Charry',
    operatorExitId: 'usr-op-1',
    operatorExitName: 'Andrés Charry',
    totalMinutes: 8,
    billedMinutes: 0,
    graceApplied: true,
    subtotal: 0,
    totalPaid: 0,
    paymentMethod: 'efectivo',
    status: 'completado'
  },
  {
    id: 'mov-comp-5',
    ticketNumber: 'TK-10022',
    plate: 'TBM-64E',
    vehicleType: 'motocicleta',
    spaceId: 'sp-b-05',
    spaceCode: 'B-05',
    entryTime: minutesAgo(180),
    exitTime: minutesAgo(90),
    operatorEntryId: 'usr-op-1',
    operatorEntryName: 'Andrés Charry',
    operatorExitId: 'usr-op-1',
    operatorExitName: 'Andrés Charry',
    totalMinutes: 90,
    billedMinutes: 90,
    subtotal: 3400,
    totalPaid: 3400,
    paymentMethod: 'daviplata',
    status: 'completado'
  },
  {
    id: 'mov-comp-6',
    ticketNumber: 'TK-10023',
    plate: 'UZY-201',
    vehicleType: 'automovil',
    spaceId: 'sp-a-09',
    spaceCode: 'A-09',
    entryTime: minutesAgo(150),
    exitTime: minutesAgo(65),
    operatorEntryId: 'usr-op-1',
    operatorEntryName: 'Andrés Charry',
    operatorExitId: 'usr-op-1',
    operatorExitName: 'Andrés Charry',
    totalMinutes: 85,
    billedMinutes: 85,
    subtotal: 6600,
    totalPaid: 6600,
    paymentMethod: 'efectivo',
    amountReceived: 10000,
    changeGiven: 3400,
    status: 'completado'
  }
];

export function generateInitialSpaces(): ParkingSpace[] {
  const spaces: ParkingSpace[] = [];

  // Zona A: 12 Celdas (Automóvil y Camioneta)
  for (let i = 1; i <= 12; i++) {
    const code = `A-${i.toString().padStart(2, '0')}`;
    const id = `sp-a-${i.toString().padStart(2, '0')}`;
    let status: ParkingSpace['status'] = 'libre';
    let currentVehiclePlate: string | undefined;
    let currentMovementId: string | undefined;

    if (code === 'A-03') {
      status = 'ocupado';
      currentVehiclePlate = 'KEO-492';
      currentMovementId = 'mov-act-1';
    } else if (code === 'A-07') {
      status = 'ocupado';
      currentVehiclePlate = 'WMS-831';
      currentMovementId = 'mov-act-3';
    } else if (code === 'A-12') {
      status = 'mantenimiento';
    }

    spaces.push({
      id,
      code,
      zone: 'Zona A',
      allowedType: i % 4 === 0 ? 'camioneta' : 'automovil',
      status,
      currentVehiclePlate,
      currentMovementId,
      notes: code === 'A-12' ? 'Pintura de demarcación fresca' : undefined
    });
  }

  // Zona B: 16 Celdas (Motocicletas)
  for (let i = 1; i <= 16; i++) {
    const code = `B-${i.toString().padStart(2, '0')}`;
    const id = `sp-b-${i.toString().padStart(2, '0')}`;
    let status: ParkingSpace['status'] = 'libre';
    let currentVehiclePlate: string | undefined;
    let currentMovementId: string | undefined;

    if (code === 'B-02') {
      status = 'ocupado';
      currentVehiclePlate = 'NXL-10F';
      currentMovementId = 'mov-act-2';
    } else if (code === 'B-08') {
      status = 'ocupado';
      currentVehiclePlate = 'VRT-45C';
      currentMovementId = 'mov-act-4';
    } else if (code === 'B-15') {
      status = 'reservado';
    }

    spaces.push({
      id,
      code,
      zone: 'Zona B',
      allowedType: 'motocicleta',
      status,
      currentVehiclePlate,
      currentMovementId,
      notes: code === 'B-15' ? 'Reservado para mensajería droguería aliada' : undefined
    });
  }

  // Zona C: 10 Celdas (Nivel 2 Automóvil)
  for (let i = 1; i <= 10; i++) {
    const code = `C-${i.toString().padStart(2, '0')}`;
    const id = `sp-c-${i.toString().padStart(2, '0')}`;
    let status: ParkingSpace['status'] = 'libre';
    let currentVehiclePlate: string | undefined;
    let currentMovementId: string | undefined;

    if (code === 'C-01') {
      status = 'ocupado';
      currentVehiclePlate = 'HUK-719';
      currentMovementId = 'mov-act-5';
    }

    spaces.push({
      id,
      code,
      zone: 'Zona C',
      allowedType: 'automovil',
      status,
      currentVehiclePlate,
      currentMovementId
    });
  }

  // Zona D: 6 Celdas (Bicicletas)
  for (let i = 1; i <= 6; i++) {
    const code = `D-${i.toString().padStart(2, '0')}`;
    const id = `sp-d-${i.toString().padStart(2, '0')}`;
    let status: ParkingSpace['status'] = 'libre';
    let currentVehiclePlate: string | undefined;
    let currentMovementId: string | undefined;

    if (code === 'D-02') {
      status = 'ocupado';
      currentVehiclePlate = 'B-04';
      currentMovementId = 'mov-act-6';
    }

    spaces.push({
      id,
      code,
      zone: 'Zona D',
      allowedType: 'bicicleta',
      status,
      currentVehiclePlate,
      currentMovementId
    });
  }

  return spaces;
}
