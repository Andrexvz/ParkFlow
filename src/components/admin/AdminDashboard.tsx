import React from 'react';
import { useParking } from '../../context/ParkingContext';
import { DollarSign, Car, Clock, ShieldCheck, TrendingUp, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatCOP, formatDuration } from '../../utils/pricingCalculator';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { stats, movements, spaces, rates } = useParking();

  // Desglose de ingresos por tipo de vehículo
  const completedToday = movements.filter(m => m.status === 'completado');

  const revenueByType = {
    automovil: completedToday.filter(m => m.vehicleType === 'automovil').reduce((a, c) => a + (c.totalPaid || 0), 0),
    motocicleta: completedToday.filter(m => m.vehicleType === 'motocicleta').reduce((a, c) => a + (c.totalPaid || 0), 0),
    camioneta: completedToday.filter(m => m.vehicleType === 'camioneta').reduce((a, c) => a + (c.totalPaid || 0), 0),
    bicicleta: completedToday.filter(m => m.vehicleType === 'bicicleta').reduce((a, c) => a + (c.totalPaid || 0), 0),
  };

  // Cálculo de distribución porcentual
  const totalRev = stats.todayRevenue || 1;
  const autoPercent = Math.round((revenueByType.automovil / totalRev) * 100);
  const motoPercent = Math.round((revenueByType.motocicleta / totalRev) * 100);
  const camionetaPercent = Math.round((revenueByType.camioneta / totalRev) * 100);
  const biciPercent = Math.round((revenueByType.bicicleta / totalRev) * 100);

  // Datos simulados horarios para gráfica SVG de actividad (06:00 a 20:00)
  const hourlyData = [
    { hour: '06h', count: 3, rev: 8400 },
    { hour: '08h', count: 9, rev: 28000 },
    { hour: '10h', count: 14, rev: 45000 },
    { hour: '12h', count: 12, rev: 38000 },
    { hour: '14h', count: 16, rev: 52000 },
    { hour: '16h', count: 11, rev: 34000 },
    { hour: '18h', count: 15, rev: 48000 },
    { hour: '20h', count: 6, rev: 18000 },
  ];

  const maxHourlyCount = Math.max(...hourlyData.map(d => d.count), 20);

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Panel de Control Administrativo
          </h2>
          <p className="text-xs text-slate-500">
            Resumen en tiempo real del parqueadero, ingresos liquidados y control de capacidad
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin-history')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            Exportar Reporte
          </button>
          <button
            onClick={() => onNavigate('operator-grid')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs"
          >
            <span>Ver Mapa en Vivo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ingresos Hoy */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ingresos de Hoy
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {formatCOP(stats.todayRevenue)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Recaudado en caja hoy</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Ocupación Actual */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ocupación en Vivo
            </span>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              stats.occupancyRate > 80 ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
            }`}>
              <Car className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {stats.occupancyRate}%
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>{stats.occupiedSpaces} ocupadas</span>
              <span>{stats.freeSpaces} libres</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Vehículos Atendidos */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Vehículos Atendidos
            </span>
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {stats.todayVehiclesCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {completedToday.length} salidas liquidadas
            </div>
          </div>
        </div>

        {/* KPI 4: Tiempo Promedio */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Permanencia Promedio
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
              {formatDuration(stats.averageStayMinutes || 65)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Calculado sobre salidas de hoy
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Activity Bar Chart (SVG) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Afluencia y Ocupación por Horas (Neiva)
              </h3>
              <p className="text-xs text-slate-500">
                Volumen estimado de vehículos ingresados a lo largo de la jornada
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">Pico: 14h - 16h</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-4">
            <div className="h-44 flex items-end justify-between gap-2 px-2 border-b border-slate-200">
              {hourlyData.map(d => {
                const heightPercent = Math.round((d.count / maxHourlyCount) * 100);
                return (
                  <div key={d.hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-1.5 rounded font-mono pointer-events-none whitespace-nowrap z-10 shadow-sm">
                      {d.count} autos · {formatCOP(d.rev)}
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[28px] bg-blue-600 hover:bg-blue-500 rounded-t-md transition-all cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500 font-mono mt-1">{d.hour}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Revenue Distribution by Vehicle Type */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Ingresos por Categoría
            </h3>
            <p className="text-xs text-slate-500">
              Distribución de la recaudación según tipo de vehículo
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Automóviles</span>
                <span className="font-mono text-slate-900 font-bold">{formatCOP(revenueByType.automovil)} ({autoPercent}%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${autoPercent}%` }} className="h-full bg-blue-600 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Motocicletas</span>
                <span className="font-mono text-slate-900 font-bold">{formatCOP(revenueByType.motocicleta)} ({motoPercent}%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${motoPercent}%` }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Camionetas / SUV</span>
                <span className="font-mono text-slate-900 font-bold">{formatCOP(revenueByType.camioneta)} ({camionetaPercent}%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${camionetaPercent}%` }} className="h-full bg-amber-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Bicicletas</span>
                <span className="font-mono text-slate-900 font-bold">{formatCOP(revenueByType.bicicleta)} ({biciPercent}%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${biciPercent}%` }} className="h-full bg-indigo-500 rounded-full" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('admin-rates')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Ajustar Tarifas por Categoría</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Administration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('admin-rates')}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/20 text-left transition-all group"
        >
          <span className="text-xs font-mono font-semibold text-blue-600 uppercase">Tarifas</span>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">
            Configurar Tarifas y Fracciones
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Gestiona cobro por minuto, hora, fracciones de 15 min, día pleno y tiempo de cortesía.
          </p>
        </button>

        <button
          onClick={() => onNavigate('admin-spaces')}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/20 text-left transition-all group"
        >
          <span className="text-xs font-mono font-semibold text-emerald-600 uppercase">Celdas</span>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mt-0.5">
            Gestión de Espacios ({spaces.length} Celdas)
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Crear, editar o poner en mantenimiento celdas de las Zonas A, B, C y D.
          </p>
        </button>

        <button
          onClick={() => onNavigate('admin-users')}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/20 text-left transition-all group"
        >
          <span className="text-xs font-mono font-semibold text-amber-600 uppercase">Personal</span>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors mt-0.5">
            Operadores y Turnos
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Administra empleados, asigna roles de Admin u Operador y controla estados de acceso.
          </p>
        </button>
      </div>
    </div>
  );
};
