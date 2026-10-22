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
import { api, HealthResponse } from '../services/api';

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

export type ConnectionStatus = 'connected' | 'offline' | 'checking';

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

  // XAMPP / MySQL Backend status
  connectionStatus: ConnectionStatus;
  healthData: HealthResponse | null;
  isBackendSyncing: boolean;
  checkBackendConnection: () => Promise<boolean>;
  reseedDatabase: () => Promise<boolean>;

  // Actions
  login: (user: User) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  registerEntry: (payload: EntryPayload) => Promise<{ success: boolean; movement?: Movement; error?: string }>;
  processExit: (payload: ExitPayload) => Promise<{ success: boolean; movement?: Movement; error?: string }>;
  cancelActiveMovement: (movementId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  
  // Spaces & Rates
  updateSpaceStatus: (spaceId: string, status: SpaceStatus, notes?: string) => Promise<void>;
  createSpace: (space: Omit<ParkingSpace, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateSpace: (space: ParkingSpace) => Promise<void>;
  deleteSpace: (spaceId: string) => Promise<{ success: boolean; error?: string }>;
  updateRate: (rate: VehicleRate) => Promise<void>;

  // Users
  createUser: (user: Omit<User, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateUser: (user: User) => Promise<void>;
  toggleUserActive: (userId: string) => Promise<void>;

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
  // Backend connection state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isBackendSyncing, setIsBackendSyncing] = useState<boolean>(false);

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

  // Sync to localStorage as persistent local cache
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

  // Función para sincronizar datos desde MySQL / PHP
  const syncWithBackend = useCallback(async () => {
    setIsBackendSyncing(true);
    try {
      const [dbUsers, dbSpaces, dbRates, dbMovements] = await Promise.all([
        api.getUsers(),
        api.getSpaces(),
        api.getRates(),
        api.getMovements()
      ]);

      if (dbUsers && dbUsers.length > 0) setUsers(dbUsers);
      if (dbSpaces && dbSpaces.length > 0) setSpaces(dbSpaces);
      if (dbRates && dbRates.length > 0) setRates(dbRates);
      if (dbMovements) setMovements(dbMovements);

      // Si el usuario actual ya no está en la BD, asignar el primero activo
      if (currentUser && dbUsers && !dbUsers.some(u => u.id === currentUser.id)) {
        setCurrentUser(dbUsers[0] || null);
      }
    } catch (err) {
      console.warn('Error al sincronizar datos con XAMPP MySQL:', err);
    } finally {
      setIsBackendSyncing(false);
    }
  }, [currentUser]);

  // Verificar conexión con el backend de XAMPP
  const checkBackendConnection = useCallback(async (): Promise<boolean> => {
    setConnectionStatus('checking');
    try {
      const health = await api.checkHealth();
      if (health.success && health.database?.connected) {
        setHealthData(health);
        setConnectionStatus('connected');
        await syncWithBackend();
        return true;
      } else {
        setConnectionStatus('offline');
        return false;
      }
    } catch (e) {
      console.info('XAMPP MySQL no responde o está apagado. Operando en modo local.', e);
      setConnectionStatus('offline');
      return false;
    }
  }, [syncWithBackend]);

  // Chequeo de conexión al iniciar
  useEffect(() => {
    checkBackendConnection();
  }, [checkBackendConnection]);

  // Inicializar o re-sembrar la base de datos MySQL con 1 clic
  const reseedDatabase = useCallback(async (): Promise<boolean> => {
    try {
      setIsBackendSyncing(true);
      await api.setupDatabase();
      await checkBackendConnection();
      soundEffects.playSuccess();
      return true;
    } catch (e) {
      console.error('Error al inicializar base de datos MySQL:', e);
      soundEffects.playAlert();
      return false;
    } finally {
      setIsBackendSyncing(false);
    }
  }, [checkBackendConnection]);

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

  // Registro de Entrada (Integrado con MySQL y fallback local)
  const registerEntry = useCallback(async (payload: EntryPayload) => {
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

    // Si estamos conectados con XAMPP MySQL, registrar a través de la API PHP
    if (connectionStatus === 'connected') {
      try {
        const createdMovement = await api.registerEntry({
          plate: cleanPlate,
          vehicleType,
          spaceId: targetSpace.id,
          operatorEntryId: currentUser?.id || 'usr-op-1',
          operatorEntryName: currentUser?.name || 'Operador en Turno',
          helmetsCount: vehicleType === 'motocicleta' ? (helmetsCount || 0) : undefined,
          entryNotes,
          clientName,
          clientPhone,
          entryTime: currentEffectiveTime.toISOString()
        });

        // Actualizar estado local
        setMovements(prev => [createdMovement, ...prev.filter(m => m.id !== createdMovement.id)]);
        setSpaces(prev => prev.map(s => {
          if (s.id === targetSpace!.id) {
            return {
              ...s,
              status: 'ocupado',
              currentVehiclePlate: cleanPlate,
              currentMovementId: createdMovement.id
            };
          }
          return s;
        }));

        soundEffects.playSuccess();
        setLastGeneratedTicket(createdMovement);
        setTicketModalType('entry');

        return {
          success: true,
          movement: createdMovement
        };
      } catch (err: any) {
        console.error('Error al registrar en MySQL:', err);
        // Si falló la API, mostrar el error devuelto por PHP/MySQL
        return {
          success: false,
          error: err.message || 'Error al guardar en la base de datos MySQL.'
        };
      }
    }

    // Modo local / Fallback
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

    setMovements(prev => [newMovement, ...prev]);

    soundEffects.playSuccess();
    setLastGeneratedTicket(newMovement);
    setTicketModalType('entry');

    return {
      success: true,
      movement: newMovement
    };
  }, [movements, spaces, currentEffectiveTime, currentUser, connectionStatus]);

  // Registro de Salida y Cobro (Integrado con MySQL y fallback local)
  const processExit = useCallback(async (payload: ExitPayload) => {
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

    // Si estamos conectados con MySQL en XAMPP
    if (connectionStatus === 'connected') {
      try {
        const updatedMovement = await api.processExit({
          movementId,
          paymentMethod,
          operatorExitId: currentUser?.id || 'usr-op-1',
          operatorExitName: currentUser?.name || 'Operador en Turno',
          exitTime: exitDate.toISOString(),
          totalMinutes: breakdown.totalMinutes,
          billedMinutes: breakdown.graceApplied ? 0 : breakdown.totalMinutes,
          graceApplied: breakdown.graceApplied,
          subtotal: breakdown.baseCharge,
          discount: breakdown.discount,
          lostTicketCharge: isLostTicket,
          totalPaid: breakdown.total,
          amountReceived: paymentMethod === 'efectivo' ? amountReceived : breakdown.total,
          changeGiven,
          exitNotes
        });

        // Actualizar estado local
        setMovements(prev => prev.map(m => m.id === movementId ? updatedMovement : m));
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
      } catch (err: any) {
        console.error('Error al procesar salida en MySQL:', err);
        return {
          success: false,
          error: err.message || 'Error al procesar salida en la base de datos.'
        };
      }
    }

    // Modo local / Fallback
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

    setMovements(prev => prev.map(m => m.id === movementId ? updatedMovement : m));
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
  }, [movements, rates, currentEffectiveTime, currentUser, connectionStatus]);

  // Cancelar un movimiento activo
  const cancelActiveMovement = useCallback(async (movementId: string, reason: string) => {
    const movement = movements.find(m => m.id === movementId && m.status === 'activo');
    if (!movement) {
      return { success: false, error: 'Movimiento no encontrado o no está activo.' };
    }

    if (connectionStatus === 'connected') {
      try {
        await api.cancelMovement(movementId, reason);
      } catch (err: any) {
        console.error('Error al cancelar en MySQL:', err);
        return { success: false, error: err.message };
      }
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
  }, [movements, currentEffectiveTime, connectionStatus]);

  // Spaces management
  const updateSpaceStatus = useCallback(async (spaceId: string, status: SpaceStatus, notes?: string) => {
    if (connectionStatus === 'connected') {
      try {
        await api.updateSpaceStatus(spaceId, status, notes);
      } catch (err) {
        console.warn('Error al actualizar estado de celda en MySQL:', err);
      }
    }

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
  }, [connectionStatus]);

  const createSpace = useCallback(async (spaceData: Omit<ParkingSpace, 'id'>) => {
    if (currentUser?.role !== 'ADMIN') {
      return { success: false, error: 'Acceso Denegado: Solo el Administrador tiene permiso para crear celdas.' };
    }

    if (spaces.some(s => s.code.toUpperCase() === spaceData.code.toUpperCase())) {
      return { success: false, error: `Ya existe una celda con el código ${spaceData.code}.` };
    }

    if (connectionStatus === 'connected') {
      try {
        const created = await api.createSpace(spaceData);
        setSpaces(prev => [...prev, created]);
        soundEffects.playSuccess();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    const newSpace: ParkingSpace = {
      ...spaceData,
      id: `sp-${Date.now()}`
    };
    setSpaces(prev => [...prev, newSpace]);
    soundEffects.playSuccess();
    return { success: true };
  }, [spaces, connectionStatus]);

  const updateSpace = useCallback(async (spaceData: ParkingSpace) => {
    if (connectionStatus === 'connected') {
      try {
        await api.updateSpace(spaceData);
      } catch (err) {
        console.warn('Error al actualizar celda en MySQL:', err);
      }
    }
    setSpaces(prev => prev.map(s => s.id === spaceData.id ? spaceData : s));
    soundEffects.playSuccess();
  }, [connectionStatus]);

  const deleteSpace = useCallback(async (spaceId: string) => {
    if (currentUser?.role !== 'ADMIN') {
      return { success: false, error: 'Acceso Denegado: Solo el Administrador tiene permiso para eliminar celdas.' };
    }

    const space = spaces.find(s => s.id === spaceId);
    if (space?.status === 'ocupado') {
      return { success: false, error: 'No se puede eliminar una celda ocupada. Debe liberar el vehículo primero.' };
    }

    if (connectionStatus === 'connected') {
      try {
        await api.deleteSpace(spaceId);
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    setSpaces(prev => prev.filter(s => s.id !== spaceId));
    soundEffects.playSuccess();
    return { success: true };
  }, [spaces, connectionStatus, currentUser?.role]);

  // Rates management
  const updateRate = useCallback(async (rate: VehicleRate) => {
    if (currentUser?.role !== 'ADMIN') {
      console.warn('Acceso Denegado: Solo el Administrador puede modificar tarifas.');
      return;
    }

    if (connectionStatus === 'connected') {
      try {
        await api.updateRate(rate);
      } catch (err) {
        console.warn('Error al actualizar tarifa en MySQL:', err);
      }
    }
    setRates(prev => prev.map(r => r.id === rate.id ? rate : r));
    soundEffects.playSuccess();
  }, [connectionStatus, currentUser?.role]);

  // Users management
  const createUser = useCallback(async (userData: Omit<User, 'id'>) => {
    if (currentUser?.role !== 'ADMIN') {
      return { success: false, error: 'Acceso Denegado: Solo el Administrador puede registrar nuevos usuarios.' };
    }

    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, error: 'Ya existe un usuario con este correo electrónico.' };
    }

    if (connectionStatus === 'connected') {
      try {
        const created = await api.createUser(userData);
        setUsers(prev => [...prev, created]);
        soundEffects.playSuccess();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
    soundEffects.playSuccess();
    return { success: true };
  }, [users, connectionStatus]);

  const updateUser = useCallback(async (userData: User) => {
    if (connectionStatus === 'connected') {
      try {
        await api.updateUser(userData);
      } catch (err) {
        console.warn('Error al actualizar usuario en MySQL:', err);
      }
    }
    setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
    if (currentUser?.id === userData.id) {
      setCurrentUser(userData);
    }
    soundEffects.playSuccess();
  }, [currentUser, connectionStatus]);

  const toggleUserActive = useCallback(async (userId: string) => {
    if (connectionStatus === 'connected') {
      try {
        await api.toggleUserActive(userId);
      } catch (err) {
        console.warn('Error al alternar estado en MySQL:', err);
      }
    }
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, active: !u.active };
      }
      return u;
    }));
    soundEffects.playSuccess();
  }, [connectionStatus]);

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
        connectionStatus,
        healthData,
        isBackendSyncing,
        checkBackendConnection,
        reseedDatabase,
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
