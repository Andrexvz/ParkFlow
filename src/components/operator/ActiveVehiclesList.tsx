import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import { Movement, VehicleType } from '../../types';
import { Search, Clock, CreditCard, Printer, Trash2, Car, Bike, Truck, ArrowUpRight } from 'lucide-react';
import { formatCOP, formatDuration } from '../../utils/pricingCalculator';

interface ActiveVehiclesListProps {
  onProcessExit: (movementId: string) => void;
}

export const ActiveVehiclesList: React.FC<ActiveVehiclesListProps> = ({ onProcessExit }) => {
  const { movements, rates, currentEffectiveTime, openTicketModal, cancelActiveMovement } = useParking();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const activeMovements = movements.filter(m => m.status === 'activo');

  const filtered = activeMovements.filter(m => {
    if (typeFilter !== 'all' && m.vehicleType !== typeFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchPlate = m.plate.toLowerCase().includes(q);
      const matchSpace = m.spaceCode.toLowerCase().includes(q);
      const matchTicket = m.ticketNumber.toLowerCase().includes(q);
      if (!matchPlate && !matchSpace && !matchTicket) return false;
    }
    return true;
  });

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case 'motocicleta':
        return <Bike className="w-3.5 h-3.5 text-blue-600" />;
      case 'camioneta':
        return <Truck className="w-3.5 h-3.5 text-amber-600" />;
      case 'bicicleta':
        return <Bike className="w-3.5 h-3.5 text-emerald-600" />;
      case 'automovil':
      default:
        return <Car className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const getEstCost = (m: Movement) => {
    const entryDate = new Date(m.entryTime);
    const diffMs = Math.max(0, currentEffectiveTime.getTime() - entryDate.getTime());
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const rate = rates.find(r => r.vehicleType === m.vehicleType) || rates[0];

    if (totalMinutes <= rate.gracePeriodMinutes) {
      return { totalMinutes, cost: 0, isGrace: true };
    }
    const hours = Math.floor(totalMinutes / 60);
    const cost = (hours + 1) * rate.ratePerHour;
    return { totalMinutes, cost, isGrace: false };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header & Filters */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Vehículos Estacionados Actualmente ({activeMovements.length})
            </h3>
            <p className="text-xs text-slate-500">
              Listado en vivo de vehículos activos en parqueadero con cronómetro de tiempo
            </p>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar por placa, celda..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase"
            />
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({activeMovements.length})
          </button>
          <button
            onClick={() => setTypeFilter('automovil')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              typeFilter === 'automovil' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Autos ({activeMovements.filter(m => m.vehicleType === 'automovil').length})
          </button>
          <button
            onClick={() => setTypeFilter('motocicleta')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              typeFilter === 'motocicleta' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Motos ({activeMovements.filter(m => m.vehicleType === 'motocicleta').length})
          </button>
          <button
            onClick={() => setTypeFilter('camioneta')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              typeFilter === 'camioneta' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SUV/Van ({activeMovements.filter(m => m.vehicleType === 'camioneta').length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-4">Ticket</th>
              <th className="py-2.5 px-4">Placa</th>
              <th className="py-2.5 px-4">Celda</th>
              <th className="py-2.5 px-4">Tipo</th>
              <th className="py-2.5 px-4">Hora Entrada</th>
              <th className="py-2.5 px-4">Tiempo Transcurrido</th>
              <th className="py-2.5 px-4 text-right">Costo Est.</th>
              <th className="py-2.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(m => {
              const info = getEstCost(m);
              const entryDate = new Date(m.entryTime);

              return (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {m.ticketNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-slate-900 text-white tracking-wider">
                      {m.plate}
                    </span>
                    {m.helmetsCount ? (
                      <span className="ml-2 text-[10px] text-blue-600 font-medium">
                        ({m.helmetsCount} cascos)
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {m.spaceCode}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 capitalize text-slate-700">
                      {getVehicleIcon(m.vehicleType)}
                      <span>{m.vehicleType}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {entryDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDuration(info.totalMinutes)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                    {info.isGrace ? (
                      <span className="text-emerald-600">Cortesía (0$)</span>
                    ) : (
                      <span className="text-slate-900">{formatCOP(info.cost)}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openTicketModal(m, 'entry')}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Reimprimir Ticket de Entrada"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onProcessExit(m.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs"
                      >
                        <span>Cobrar</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-10 text-center text-slate-400">
            <p className="text-xs">No se encontraron vehículos activos con los filtros indicados.</p>
          </div>
        )}
      </div>
    </div>
  );
};
