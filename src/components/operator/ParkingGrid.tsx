import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import { ParkingSpace, VehicleType, SpaceStatus } from '../../types';
import { Car, Bike, Truck, Clock, AlertTriangle, Check, Search, Filter, Wrench, ShieldAlert } from 'lucide-react';
import { formatCOP, formatDuration } from '../../utils/pricingCalculator';

interface ParkingGridProps {
  onSelectSpaceForEntry: (spaceId: string) => void;
  onSelectSpaceForExit: (spaceId: string) => void;
}

export const ParkingGrid: React.FC<ParkingGridProps> = ({
  onSelectSpaceForEntry,
  onSelectSpaceForExit
}) => {
  const { spaces, movements, rates, currentEffectiveTime, updateSpaceStatus, currentUser } = useParking();

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchPlate, setSearchPlate] = useState<string>('');
  const [selectedSpaceDetails, setSelectedSpaceDetails] = useState<ParkingSpace | null>(null);

  // Zonas disponibles
  const zones = ['all', 'Zona A', 'Zona B', 'Zona C', 'Zona D'];

  // Filtrado de celdas
  const filteredSpaces = spaces.filter(space => {
    if (selectedZone !== 'all' && space.zone !== selectedZone) return false;
    if (selectedType !== 'all' && space.allowedType !== selectedType) return false;
    if (searchPlate.trim()) {
      const q = searchPlate.trim().toUpperCase();
      const matchPlate = space.currentVehiclePlate?.toUpperCase().includes(q);
      const matchCode = space.code.toUpperCase().includes(q);
      if (!matchPlate && !matchCode) return false;
    }
    return true;
  });

  // Helper de ícono por tipo
  const getVehicleIcon = (type: VehicleType, className = 'w-4 h-4') => {
    switch (type) {
      case 'motocicleta':
        return <Bike className={className} />;
      case 'camioneta':
        return <Truck className={className} />;
      case 'bicicleta':
        return <Bike className={className} />;
      case 'automovil':
      default:
        return <Car className={className} />;
    }
  };

  // Helper de tiempo transcurrido para vehículo estacionado
  const getStayInfo = (movementId?: string) => {
    if (!movementId) return null;
    const movement = movements.find(m => m.id === movementId);
    if (!movement) return null;

    const entryDate = new Date(movement.entryTime);
    const diffMs = Math.max(0, currentEffectiveTime.getTime() - entryDate.getTime());
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    // Tarifa estimada aproximada
    const rate = rates.find(r => r.vehicleType === movement.vehicleType) || rates[0];
    const hours = Math.floor(totalMinutes / 60);
    const estCost = totalMinutes <= rate.gracePeriodMinutes
      ? 0
      : (hours + 1) * rate.ratePerHour;

    return {
      movement,
      entryDate,
      totalMinutes,
      durationText: formatDuration(totalMinutes),
      estCost
    };
  };

  const handleCellClick = (space: ParkingSpace) => {
    if (space.status === 'libre') {
      onSelectSpaceForEntry(space.id);
    } else if (space.status === 'ocupado') {
      setSelectedSpaceDetails(space);
    } else {
      // Mantenimiento o reservado: abre modal para ver o cambiar estado si es admin
      setSelectedSpaceDetails(space);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Mapa de Celdas en Tiempo Real
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic en cualquier celda libre para registrar ingreso, o en una ocupada para ver detalles y liquidar cobro.
            </p>
          </div>

          {/* Quick search input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por placa o celda (Ej: KEO, A-03)..."
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all uppercase"
            />
          </div>
        </div>

        {/* Filters and Status Counts */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Zona:
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {zones.map(z => (
                <button
                  key={z}
                  onClick={() => setSelectedZone(z)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedZone === z
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {z === 'all' ? 'Todas las Zonas' : z}
                </button>
              ))}
            </div>

            <div className="hidden sm:block h-4 w-px bg-slate-200 mx-1" />

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedType('automovil')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  selectedType === 'automovil' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Car className="w-3.5 h-3.5" /> Autos
              </button>
              <button
                onClick={() => setSelectedType('motocicleta')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  selectedType === 'motocicleta' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bike className="w-3.5 h-3.5" /> Motos
              </button>
              <button
                onClick={() => setSelectedType('camioneta')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  selectedType === 'camioneta' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5" /> SUV/Van
              </button>
            </div>
          </div>

          {/* Legend and live numbers */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600" />
              <span className="text-slate-600">Libre ({spaces.filter(s => s.status === 'libre').length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500 border border-rose-600" />
              <span className="text-slate-600">Ocupado ({spaces.filter(s => s.status === 'ocupado').length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-400 border border-amber-500" />
              <span className="text-slate-600">Mantenimiento ({spaces.filter(s => s.status === 'mantenimiento' || s.status === 'reservado').length})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Parking Spaces */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {filteredSpaces.map(space => {
          const stayInfo = getStayInfo(space.currentMovementId);
          const isOccupied = space.status === 'ocupado';
          const isFree = space.status === 'libre';
          const isMaintenance = space.status === 'mantenimiento' || space.status === 'reservado';

          return (
            <button
              key={space.id}
              onClick={() => handleCellClick(space)}
              className={`relative text-left p-3 rounded-xl border transition-all group flex flex-col justify-between min-h-[110px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isFree
                  ? 'bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-200 hover:border-emerald-400 text-emerald-950 shadow-xs'
                  : isOccupied
                  ? 'bg-rose-50/70 hover:bg-rose-100/80 border-rose-200 hover:border-rose-400 text-rose-950 shadow-xs'
                  : 'bg-amber-50/60 hover:bg-amber-100/70 border-amber-200 hover:border-amber-400 text-amber-950'
              }`}
            >
              {/* Card Header: Space Code & Vehicle Type */}
              <div className="flex items-center justify-between w-full">
                <span className="font-mono font-bold text-sm tracking-tight">
                  {space.code}
                </span>
                <span className={`p-1 rounded ${
                  isFree ? 'text-emerald-700 bg-emerald-100' : isOccupied ? 'text-rose-700 bg-rose-100' : 'text-amber-700 bg-amber-100'
                }`}>
                  {getVehicleIcon(space.allowedType, 'w-3.5 h-3.5')}
                </span>
              </div>

              {/* Card Body: Dynamic Status Content */}
              <div className="my-1 w-full">
                {isFree && (
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                      DISPONIBLE
                    </p>
                    <p className="text-[10px] text-emerald-600/80 capitalize">
                      {space.allowedType}
                    </p>
                  </div>
                )}

                {isOccupied && (
                  <div className="space-y-1">
                    <div className="bg-slate-900 text-white font-mono font-bold px-1.5 py-0.5 rounded text-xs text-center tracking-wider shadow-xs border border-slate-700">
                      {space.currentVehiclePlate}
                    </div>
                    {stayInfo && (
                      <div className="flex items-center justify-between text-[10px] text-rose-800 font-mono tabular-nums">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {stayInfo.durationText}
                        </span>
                        <span className="font-semibold text-rose-900">
                          {formatCOP(stayInfo.estCost)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {isMaintenance && (
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      {space.status === 'reservado' ? 'RESERVADO' : 'MANTENIMIENTO'}
                    </p>
                    {space.notes && (
                      <p className="text-[10px] text-amber-800 truncate" title={space.notes}>
                        {space.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Action Prompt */}
              <div className="w-full pt-1 border-t border-black/5 text-[10px] flex items-center justify-between text-slate-500">
                <span className="text-[9px] uppercase font-mono">{space.zone}</span>
                <span className="opacity-0 group-hover:opacity-100 font-medium transition-opacity text-slate-800">
                  {isFree ? 'Asignar →' : isOccupied ? 'Cobrar →' : 'Ver'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredSpaces.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">No se encontraron celdas con los filtros actuales</p>
          <p className="text-xs text-slate-400 mt-1">Prueba seleccionando otra zona o limpiando la búsqueda.</p>
        </div>
      )}

      {/* Selected Space Inspection Modal */}
      {selectedSpaceDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-semibold text-blue-600 uppercase">
                  {selectedSpaceDetails.zone}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Celda {selectedSpaceDetails.code}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                    selectedSpaceDetails.status === 'libre'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedSpaceDetails.status === 'ocupado'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedSpaceDetails.status}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedSpaceDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {selectedSpaceDetails.status === 'ocupado' && (() => {
              const info = getStayInfo(selectedSpaceDetails.currentMovementId);
              return info ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Placa Registrada:</span>
                      <span className="font-mono font-extrabold text-base text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {selectedSpaceDetails.currentVehiclePlate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Tipo de Vehículo:</span>
                      <span className="font-medium capitalize">{info.movement.vehicleType}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Hora de Entrada:</span>
                      <span className="font-mono">{info.entryDate.toLocaleTimeString('es-CO')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Tiempo Transcurrido:</span>
                      <span className="font-mono font-bold text-slate-900">{info.durationText}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
                      <span>Cobro Estimado Actual:</span>
                      <span className="font-mono font-extrabold text-base text-blue-600">
                        {formatCOP(info.estCost)}
                      </span>
                    </div>
                  </div>

                  {info.movement.helmetsCount ? (
                    <p className="text-xs text-slate-600">
                      🏍️ Cascos registrados: <span className="font-semibold">{info.movement.helmetsCount}</span>
                    </p>
                  ) : null}

                  {info.movement.entryNotes && (
                    <p className="text-xs text-slate-500 italic bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Observación: {info.movement.entryNotes}
                    </p>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => {
                        const mId = selectedSpaceDetails.currentMovementId;
                        setSelectedSpaceDetails(null);
                        if (mId) onSelectSpaceForExit(selectedSpaceDetails.id);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors text-center shadow-sm"
                    >
                      Cobrar y Registrar Salida
                    </button>
                  </div>
                </div>
              ) : null;
            })()}

            {selectedSpaceDetails.status === 'libre' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Esta celda está disponible para vehículos tipo <span className="font-semibold capitalize">{selectedSpaceDetails.allowedType}</span>.
                </p>
                <button
                  onClick={() => {
                    const id = selectedSpaceDetails.id;
                    setSelectedSpaceDetails(null);
                    onSelectSpaceForEntry(id);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors text-center"
                >
                  Registrar Entrada en Celda {selectedSpaceDetails.code}
                </button>
              </div>
            )}

            {(selectedSpaceDetails.status === 'mantenimiento' || selectedSpaceDetails.status === 'reservado') && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Estado actual: <span className="font-semibold uppercase">{selectedSpaceDetails.status}</span>.
                  {selectedSpaceDetails.notes && ` Detalle: ${selectedSpaceDetails.notes}`}
                </p>

                {currentUser?.role === 'ADMIN' && (
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => {
                        updateSpaceStatus(selectedSpaceDetails.id, 'libre', '');
                        setSelectedSpaceDetails(null);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                    >
                      Habilitar como Libre
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
