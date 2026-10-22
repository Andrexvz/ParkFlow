/**
 * ParkFlow - Servicio de Comunicación con la API PHP y Base de Datos MySQL en XAMPP
 */

import { User, ParkingSpace, VehicleRate, Movement, ParkingStats, SpaceStatus, PaymentMethod, VehicleType } from '../types';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost/parkflow-api/api';

export interface HealthResponse {
  success: boolean;
  status: string;
  service: string;
  php_version: string;
  database: {
    connected: boolean;
    name: string;
    host: string;
    port: string;
    tables_found: number;
    tables: string[];
    counts: {
      users?: number;
      spaces?: number;
      rates?: number;
      movements?: number;
      activeMovements?: number;
    };
  };
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  const json = await response.json().catch(() => {
    throw new Error(`Respuesta no válida del servidor PHP en ${url}`);
  });

  if (!response.ok || json.success === false) {
    throw new Error(json.error || `Error HTTP ${response.status} en ${endpoint}`);
  }

  return json;
}

export const api = {
  // Diagnóstico y Estado
  async checkHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/health.php', { method: 'GET' });
  },

  // Inicialización y configuración de base de datos
  async setupDatabase(): Promise<ApiResponse<any>> {
    return request<ApiResponse<any>>('/setup.php', { method: 'POST' });
  },

  // Autenticación con Backend PHP / MySQL
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<ApiResponse<{ token: string; user: User }>>('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return res.data || (res as any);
  },

  // Usuarios
  async getUsers(): Promise<User[]> {
    const res = await request<ApiResponse<User[]>>('/users.php', { method: 'GET' });
    return res.data;
  },

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const res = await request<ApiResponse<User>>('/users.php', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    return res.data;
  },

  async updateUser(user: User): Promise<User> {
    const res = await request<ApiResponse<User>>('/users.php', {
      method: 'PUT',
      body: JSON.stringify(user),
    });
    return res.data;
  },

  async toggleUserActive(userId: string): Promise<User> {
    const res = await request<ApiResponse<User>>('/users.php', {
      method: 'PUT',
      body: JSON.stringify({ id: userId, toggleActive: true }),
    });
    return res.data;
  },

  // Celdas de Parqueadero
  async getSpaces(): Promise<ParkingSpace[]> {
    const res = await request<ApiResponse<ParkingSpace[]>>('/spaces.php', { method: 'GET' });
    return res.data;
  },

  async createSpace(space: Omit<ParkingSpace, 'id'>): Promise<ParkingSpace> {
    const res = await request<ApiResponse<ParkingSpace>>('/spaces.php', {
      method: 'POST',
      body: JSON.stringify(space),
    });
    return res.data;
  },

  async updateSpace(space: ParkingSpace): Promise<ParkingSpace> {
    const res = await request<ApiResponse<ParkingSpace>>('/spaces.php', {
      method: 'PUT',
      body: JSON.stringify(space),
    });
    return res.data;
  },

  async updateSpaceStatus(spaceId: string, status: SpaceStatus, notes?: string): Promise<ParkingSpace> {
    const res = await request<ApiResponse<ParkingSpace>>('/spaces.php', {
      method: 'PUT',
      body: JSON.stringify({ id: spaceId, status, notes }),
    });
    return res.data;
  },

  async deleteSpace(spaceId: string): Promise<void> {
    await request<ApiResponse<void>>(`/spaces.php?id=${encodeURIComponent(spaceId)}`, {
      method: 'DELETE',
    });
  },

  // Tarifas
  async getRates(): Promise<VehicleRate[]> {
    const res = await request<ApiResponse<VehicleRate[]>>('/rates.php', { method: 'GET' });
    return res.data;
  },

  async updateRate(rate: VehicleRate): Promise<VehicleRate> {
    const res = await request<ApiResponse<VehicleRate>>('/rates.php', {
      method: 'PUT',
      body: JSON.stringify(rate),
    });
    return res.data;
  },

  // Movimientos (Entradas, Salidas, Cobros)
  async getMovements(): Promise<Movement[]> {
    const res = await request<ApiResponse<Movement[]>>('/movements.php', { method: 'GET' });
    return res.data;
  },

  async registerEntry(payload: {
    plate: string;
    vehicleType: VehicleType;
    spaceId?: string;
    operatorEntryId?: string;
    operatorEntryName?: string;
    helmetsCount?: number;
    entryNotes?: string;
    clientName?: string;
    clientPhone?: string;
    entryTime?: string;
  }): Promise<Movement> {
    const res = await request<ApiResponse<Movement>>('/movements.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async processExit(payload: {
    movementId: string;
    paymentMethod: PaymentMethod;
    operatorExitId?: string;
    operatorExitName?: string;
    exitTime?: string;
    totalMinutes?: number;
    billedMinutes?: number;
    graceApplied?: boolean;
    subtotal?: number;
    discount?: number;
    lostTicketCharge?: boolean;
    totalPaid?: number;
    amountReceived?: number;
    changeGiven?: number;
    exitNotes?: string;
  }): Promise<Movement> {
    const res = await request<ApiResponse<Movement>>('/movements.php', {
      method: 'PUT',
      body: JSON.stringify({ action: 'exit', ...payload }),
    });
    return res.data;
  },

  async cancelMovement(movementId: string, reason: string): Promise<void> {
    await request<ApiResponse<void>>('/movements.php', {
      method: 'PUT',
      body: JSON.stringify({ action: 'cancel', movementId, reason }),
    });
  },

  // Estadísticas en tiempo real
  async getStats(): Promise<ParkingStats> {
    const res = await request<ApiResponse<ParkingStats>>('/stats.php', { method: 'GET' });
    return res.data;
  }
};
