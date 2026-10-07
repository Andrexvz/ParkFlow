import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  UserRole,
  ParkingSpace,
  VehicleRate,
  Movement,
  ParkingStats,
  VehicleType,
  SpaceStatus,
  PaymentMethod
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_RATES,
  INITIAL_MOVEMENTS,
  generateInitialSpaces
} from '../data/initialData';
import { calculateParkingFee, formatCOP } from '../utils/pricingCalculator';
import { soundEffects } from '../utils/soundEffects';

interface EntryPayload {
  plate: string;
  vehicleType: VehicleType;
  spaceId?: string; // Si se omite, se asigna automáticamente
  helmetsCount?: number;
  entryNotes?: string;
  clientName?: string;
  clientPhone?: string;
}

interface ExitPayload {
  movementId: string;
  paymentMethod: PaymentMethod;
  amountReceived?: number;
  isLostTicket?: boolean;
  discountPercent?: number;
  exitNotes?: string;
}

interface ParkingContextType {
  currentUser: User | null;
  users: User[];
  spaces: ParkingSpace[];
  rates: VehicleRate[];
  movements: Movement[];
  stats: ParkingStats;
  currentEffectiveTime: Date;
  simulatedTimeOffsetMinutes: number;
  lastGeneratedTicket: Movement | null;
  ticketModalType: 'entry' | 'exit' | null;

  // Actions
  login: (user: User) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  registerEntry: (payload: EntryPayload) => { success: boolean; movement?: Movement; error?: string };
  processExit: (payload: ExitPayload) => { success: boolean; movement?: Movement; error?: string };
  cancelActiveMovement: (movementId: string, reason: string) => { success: boolean; error?: string };
  
  // Spaces & Rates
  updateSpaceStatus: (spaceId: string, status: SpaceStatus, notes?: string) => void;
  createSpace: (space: Omit<ParkingSpace, 'id'>) => { success: boolean; error?: string };
  updateSpace: (space: ParkingSpace) => void;
  deleteSpace: (spaceId: string) => { success: boolean; error?: string };
  updateRate: (rate: VehicleRate) => void;

  // Users
  createUser: (user: Omit<User, 'id'>) => { success: boolean; error?: string };
  updateUser: (user: User) => void;
  toggleUserActive: (userId: string) => void;

  // Modals & Tickets
  openTicketModal: (movement: Movement, type: 'entry' | 'exit') => void;
  closeTicketModal: () => void;

  // Time machine simulation
  advanceSimulatedTime: (minutes: number) => void;
  resetSimulatedTime: () => void;

  // System
  resetAllData: () => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'autopark_neiva_users',
  CURRENT_USER: 'autopark_neiva_cur_user',
  SPACES: 'autopark_neiva_spaces',
  RATES: 'autopark_neiva_rates',
  MOVEMENTS: 'autopark_neiva_movements',
  TIME_OFFSET: 'autopark_neiva_time_offset'
};

export const ParkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current logged user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : INITIAL_USERS[1]; // Por defecto el Operador Andrés Charry
  });

  // Parking Spaces state
  const [spaces, setSpaces] = useState<ParkingSpace[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SPACES);
    return saved ? JSON.parse(saved) : generateInitialSpaces();
  });

  // Rates state
  const [rates, setRates] = useState<VehicleRate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RATES);
    return saved ? JSON.parse(saved) : INITIAL_RATES;
  });

  // Movements state
  const [movements, setMovements] = useState<Movement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });

  // Time simulation offset (in minutes)
  const [simulatedTimeOffsetMinutes, setSimulatedTimeOffsetMinutes] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TIME_OFFSET);
    return saved ? Number(saved) : 0;
  });

  // Ticket modal state
  const [lastGeneratedTicket, setLastGeneratedTicket] = useState<Movement | null>(null);
  const [ticketModalType, setTicketModalType] = useState<'entry' | 'exit' | null>(null);

  // Clock tick to refresh currentEffectiveTime every 10 seconds
  const [clockTick, setClockTick] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const currentEffectiveTime = useMemo(() => {
    return new Date(clockTick + simulatedTimeOffsetMinutes * 60 * 1000);
  }, [clockTick, simulatedTimeOffsetMinutes]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SPACES, JSON.stringify(spaces));
  }, [spaces]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
  }, [rates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIME_OFFSET, String(simulatedTimeOffsetMinutes));
  }, [simulatedTimeOffsetMinutes]);

  // Computación de Estadísticas del Parqueadero en Tiempo Real
  const stats: ParkingStats = useMemo(() => {
    const totalSpaces = spaces.length;
    const occupiedSpaces = spaces.filter(s => s.status === 'ocupado').length;
    const freeSpaces = spaces.filter(s => s.status === 'libre').length;
    const maintenanceSpaces = spaces.filter(s => s.status === 'mantenimiento' || s.status === 'reservado').length;
    const occupancyRate = totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0;

    // Movimientos del día
    const today = currentEffectiveTime.toISOString().slice(0, 10);
    const todayCompleted = movements.filter(m => m.status === 'completado' && m.exitTime?.slice(0, 10) === today);
    const todayRevenue = todayCompleted.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);
    const todayVehiclesCount = movements.filter(m => m.entryTime.slice(0, 10) === today).length;

    const totalMinutesSample = todayCompleted.reduce((acc, curr) => acc + (curr.totalMinutes || 0), 0);
    const averageStayMinutes = todayCompleted.length > 0 ? Math.round(totalMinutesSample / todayCompleted.length) : 0;

    return {
      totalSpaces,
      occupiedSpaces,
      freeSpaces,
      maintenanceSpaces,
      occupancyRate,
      todayRevenue,
      todayVehiclesCount,
      averageStayMinutes
    };
  }, [spaces, movements, currentEffectiveTime]);

  // Auth actions
  const login = useCallback((user: User) => {
    setCurrentUser(user);
    soundEffects.playSuccess();
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const switchUser = useCallback((userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      soundEffects.playSuccess();
    }
  }, [users]);

  // Registro de Entrada
  const registerEntry = useCallback((payload: EntryPayload) => {
    const { plate, vehicleType, helmetsCount, entryNotes, clientName, clientPhone } = payload;
    const cleanPlate = plate.trim().toUpperCase();

    // 1. Validar si ya está adentro con un movimiento activo
    const alreadyParked = movements.find(m => m.plate === cleanPlate && m.status === 'activo');
    if (alreadyParked) {
      soundEffects.playAlert();
      return {
        success: false,
        error: `El vehículo con placa ${cleanPlate} ya se encuentra registrado en la celda ${alreadyParked.spaceCode}.`
      };
    }

    // 2. Determinar o validar celda
    let targetSpace: ParkingSpace | undefined;
    if (payload.spaceId) {
      targetSpace = spaces.find(s => s.id === payload.spaceId);
      if (!targetSpace) {
        return { success: false, error: 'La celda seleccionada no existe.' };
      }
      if (targetSpace.status !== 'libre') {
        soundEffects.playAlert();
        return { success: false, error: `La celda ${targetSpace.code} se encuentra ${targetSpace.status}. Seleccione una celda libre.` };
      }
    } else {
      // Asignación automática: buscar primera celda libre compatible con el tipo
      targetSpace = spaces.find(s => s.status === 'libre' && (s.allowedType === vehicleType || (vehicleType === 'automovil' && s.allowedType === 'camioneta')));
      if (!targetSpace) {
        soundEffects.playAlert();
        return {
          success: false,
          error: `No hay celdas libres disponibles para el tipo ${vehicleType}. ¡Parqueadero lleno!`
        };
      }
    }

    // 3. Crear movimiento
    const movementId = `mov-${Date.now()}`;
    const ticketSeq = 10030 + movements.length;
    const ticketNumber = `TK-${ticketSeq}`;
    const entryIso = currentEffectiveTime.toISOString();

    const newMovement: Movement = {
      id: movementId,
      ticketNumber,
      plate: cleanPlate,
      vehicleType,
      spaceId: targetSpace.id,
      spaceCode: targetSpace.code,
      entryTime: entryIso,
      operatorEntryId: currentUser?.id || 'usr-op-1',
      operatorEntryName: currentUser?.name || 'Operador en Turno',
      helmetsCount: vehicleType === 'motocicleta' ? (helmetsCount || 0) : undefined,
      entryNotes,
      clientName,
      clientPhone,
      status: 'activo'
    };

    // 4. Actualizar estado de la celda
    setSpaces(prev => prev.map(s => {
      if (s.id === targetSpace!.id) {
        return {
          ...s,
          status: 'ocupado',
          currentVehiclePlate: cleanPlate,
          currentMovementId: movementId
        };
      }
      return s;
    }));

    // 5. Guardar movimiento
    setMovements(prev => [newMovement, ...prev]);

    // 6. Efecto auditivo y mostrar modal de ticket
    soundEffects.playSuccess();
    setLastGeneratedTicket(newMovement);
    setTicketModalType('entry');

    return {
      success: true,
      movement: newMovement
    };
  }, [movements, spaces, currentEffectiveTime, currentUser]);

  // Registro de Salida y Cobro
  const processExit = useCallback((payload: ExitPayload) => {
    const { movementId, paymentMethod, amountReceived, isLostTicket, discountPercent, exitNotes } = payload;
    const movement = movements.find(m => m.id === movementId);

    if (!movement) {
      return { success: false, error: 'Movimiento no encontrado.' };
    }

    if (movement.status !== 'activo') {
      soundEffects.playAlert();
      return { success: false, error: 'Este vehículo ya ha registrado su salida previamente.' };
    }

    // Buscar tarifa
    const rate = rates.find(r => r.vehicleType === movement.vehicleType) || rates[0];
    const entryDate = new Date(movement.entryTime);
    const exitDate = currentEffectiveTime;

    const breakdown = calculateParkingFee(entryDate, exitDate, rate, {
      isLostTicket,
      discountPercent
    });

    // Validar monto si es efectivo
    let changeGiven = 0;
    if (paymentMethod === 'efectivo' && amountReceived !== undefined) {
      if (amountReceived < breakdown.total) {
        soundEffects.playAlert();
        return {
          success: false,
          error: `Monto recibido insuficiente. El total a pagar es ${formatCOP(breakdown.total)}.`
        };
      }
      changeGiven = amountReceived - breakdown.total;
    }

    // Finalizar movimiento
    const updatedMovement: Movement = {
      ...movement,
      exitTime: exitDate.toISOString(),
      operatorExitId: currentUser?.id || 'usr-op-1',
      operatorExitName: currentUser?.name || 'Operador en Turno',
      totalMinutes: breakdown.totalMinutes,
      billedMinutes: breakdown.graceApplied ? 0 : breakdown.totalMinutes,
      graceApplied: breakdown.graceApplied,
      subtotal: breakdown.baseCharge,
      discount: breakdown.discount,
      lostTicketCharge: isLostTicket,
      totalPaid: breakdown.total,
      paymentMethod,
      amountReceived: paymentMethod === 'efectivo' ? amountReceived : breakdown.total,
      changeGiven,
      exitNotes,
      status: 'completado'
    };

    // Actualizar movimiento en lista
    setMovements(prev => prev.map(m => m.id === movementId ? updatedMovement : m));

    // Liberar celda
    setSpaces(prev => prev.map(s => {
      if (s.id === movement.spaceId) {
        return {
          ...s,
          status: 'libre',
          currentVehiclePlate: undefined,
          currentMovementId: undefined
        };
      }
      return s;
    }));

    soundEffects.playPayment();
    setLastGeneratedTicket(updatedMovement);
    setTicketModalType('exit');

    return {
      success: true,
      movement: updatedMovement
    };
  }, [movements, rates, currentEffectiveTime, currentUser]);

  // Cancelar un movimiento activo (por ejemplo, error de tipografía inmediato del operador)
  const cancelActiveMovement = useCallback((movementId: string, reason: string) => {
    const movement = movements.find(m => m.id === movementId && m.status === 'activo');
    if (!movement) {
      return { success: false, error: 'Movimiento no encontrado o no está activo.' };
    }

    setMovements(prev => prev.map(m => {
      if (m.id === movementId) {
        return {
          ...m,
          status: 'cancelado',
          exitNotes: `Cancelado: ${reason}`,
          exitTime: currentEffectiveTime.toISOString()
        };
      }
      return m;
    }));

    setSpaces(prev => prev.map(s => {
      if (s.id === movement.spaceId) {
        return {
          ...s,
          status: 'libre',
          currentVehiclePlate: undefined,
          currentMovementId: undefined
        };
      }
      return s;
    }));

    return { success: true };
  }, [movements, currentEffectiveTime]);

  // Spaces management
  const updateSpaceStatus = useCallback((spaceId: string, status: SpaceStatus, notes?: string) => {
    setSpaces(prev => prev.map(s => {
      if (s.id === spaceId) {
        return {
          ...s,
          status,
          notes: notes !== undefined ? notes : s.notes,
          currentVehiclePlate: status === 'libre' ? undefined : s.currentVehiclePlate,
          currentMovementId: status === 'libre' ? undefined : s.currentMovementId
        };
      }
      return s;
    }));
    soundEffects.playSuccess();
  }, []);

  const createSpace = useCallback((spaceData: Omit<ParkingSpace, 'id'>) => {
    // Validar código único
    if (spaces.some(s => s.code.toUpperCase() === spaceData.code.toUpperCase())) {
      return { success: false, error: `Ya existe una celda con el código ${spaceData.code}.` };
    }
    const newSpace: ParkingSpace = {
      ...spaceData,
      id: `sp-${Date.now()}`
    };
    setSpaces(prev => [...prev, newSpace]);
    soundEffects.playSuccess();
    return { success: true };
  }, [spaces]);

  const updateSpace = useCallback((spaceData: ParkingSpace) => {
    setSpaces(prev => prev.map(s => s.id === spaceData.id ? spaceData : s));
    soundEffects.playSuccess();
  }, []);

  const deleteSpace = useCallback((spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    if (space?.status === 'ocupado') {
      return { success: false, error: 'No se puede eliminar una celda ocupada. Debe liberar el vehículo primero.' };
    }
    setSpaces(prev => prev.filter(s => s.id !== spaceId));
    soundEffects.playSuccess();
    return { success: true };
  }, [spaces]);

  // Rates management
  const updateRate = useCallback((rate: VehicleRate) => {
    setRates(prev => prev.map(r => r.id === rate.id ? rate : r));
    soundEffects.playSuccess();
  }, []);

  // Users management
  const createUser = useCallback((userData: Omit<User, 'id'>) => {
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, error: 'Ya existe un usuario con este correo electrónico.' };
    }
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
    soundEffects.playSuccess();
    return { success: true };
  }, [users]);

  const updateUser = useCallback((userData: User) => {
    setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
    if (currentUser?.id === userData.id) {
      setCurrentUser(userData);
    }
    soundEffects.playSuccess();
  }, [currentUser]);

  const toggleUserActive = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, active: !u.active };
      }
      return u;
    }));
    soundEffects.playSuccess();
  }, []);

  // Modal actions
  const openTicketModal = useCallback((movement: Movement, type: 'entry' | 'exit') => {
    setLastGeneratedTicket(movement);
    setTicketModalType(type);
  }, []);

  const closeTicketModal = useCallback(() => {
    setLastGeneratedTicket(null);
    setTicketModalType(null);
  }, []);

  // Time simulation
  const advanceSimulatedTime = useCallback((minutes: number) => {
    setSimulatedTimeOffsetMinutes(prev => prev + minutes);
  }, []);

  const resetSimulatedTime = useCallback(() => {
    setSimulatedTimeOffsetMinutes(0);
  }, []);

  // Reset factory data
  const resetAllData = useCallback(() => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[1]);
    setSpaces(generateInitialSpaces());
    setRates(INITIAL_RATES);
    setMovements(INITIAL_MOVEMENTS);
    setSimulatedTimeOffsetMinutes(0);
    setLastGeneratedTicket(null);
    setTicketModalType(null);
    soundEffects.playSuccess();
  }, []);

  return (
    <ParkingContext.Provider
      value={{
        currentUser,
        users,
        spaces,
        rates,
        movements,
        stats,
        currentEffectiveTime,
        simulatedTimeOffsetMinutes,
        lastGeneratedTicket,
        ticketModalType,
        login,
        logout,
        switchUser,
        registerEntry,
        processExit,
        cancelActiveMovement,
        updateSpaceStatus,
        createSpace,
        updateSpace,
        deleteSpace,
        updateRate,
        createUser,
        updateUser,
        toggleUserActive,
        openTicketModal,
        closeTicketModal,
        advanceSimulatedTime,
        resetSimulatedTime,
        resetAllData
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};
