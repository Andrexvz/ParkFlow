import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import { ParkingSpace, VehicleType, SpaceStatus } from '../../types';
import { Plus, Trash2, Wrench, CheckCircle, Search, Filter, AlertCircle, X } from 'lucide-react';

export const SpacesManagement: React.FC = () => {
  const { spaces, createSpace, updateSpaceStatus, deleteSpace } = useParking();

  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal para crear nueva celda
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newZone, setNewZone] = useState<'Zona A' | 'Zona B' | 'Zona C' | 'Zona D'>('Zona A');
  const [newType, setNewType] = useState<VehicleType>('automovil');
  const [formError, setFormError] = useState<string | null>(null);

  const filteredSpaces = spaces.filter(s => {
    if (filterZone !== 'all' && s.zone !== filterZone) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (searchTerm.trim() && !s.code.toLowerCase().includes(searchTerm.trim().toLowerCase())) return false;
    return true;
  });

  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newCode.trim()) {
      setFormError('El código de la celda es obligatorio.');
      return;
    }

    const res = createSpace({
      code: newCode.trim().toUpperCase(),
      zone: newZone,
      allowedType: newType,
      status: 'libre'
    });

    if (res.success) {
      setNewCode('');
      setIsModalOpen(false);
    } else {
      setFormError(res.error || 'Error al crear la celda.');
    }
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la celda ${code}?`)) {
      const res = deleteSpace(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Celdas y Espacios ({spaces.length} Totales)
          </h2>
          <p className="text-xs text-slate-500">
            Administra la distribución de celdas por zonas, tipos de vehículos y disponibilidad física
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nueva Celda</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar celda (Ej: A-01)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">Todas las Zonas</option>
            <option value="Zona A">Zona A (Techado)</option>
            <option value="Zona B">Zona B (Motos)</option>
            <option value="Zona C">Zona C (Nivel 2)</option>
            <option value="Zona D">Zona D (Bicicletas)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">Todos los Estados</option>
            <option value="libre">Libre</option>
            <option value="ocupado">Ocupado</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="reservado">Reservado</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Mostrando {filteredSpaces.length} de {spaces.length} celdas
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-4">Código</th>
                <th className="py-2.5 px-4">Zona</th>
                <th className="py-2.5 px-4">Tipo Permitido</th>
                <th className="py-2.5 px-4">Estado Actual</th>
                <th className="py-2.5 px-4">Vehículo Actual</th>
                <th className="py-2.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSpaces.map(s => {
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {s.code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {s.zone}
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-600">
                      {s.allowedType}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase ${
                        s.status === 'libre'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'ocupado'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {s.currentVehiclePlate ? (
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {s.currentVehiclePlate}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {s.status !== 'ocupado' && (
                          <button
                            onClick={() => {
                              const newSt: SpaceStatus = s.status === 'libre' ? 'mantenimiento' : 'libre';
                              updateSpaceStatus(s.id, newSt, newSt === 'mantenimiento' ? 'Mantenimiento preventivo' : '');
                            }}
                            className="px-2 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors text-[11px]"
                            title="Alternar estado de mantenimiento"
                          >
                            {s.status === 'libre' ? 'Mantenimiento' : 'Habilitar'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(s.id, s.code)}
                          disabled={s.status === 'ocupado'}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-30 disabled:pointer-events-none"
                          title="Eliminar celda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Celda */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Crear Nueva Celda de Parqueadero
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSpace} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Código de la Celda (Ej: A-13, B-21)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: A-13"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold uppercase focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Zona
                </label>
                <select
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Zona A">Zona A - Nivel 1 Techado</option>
                  <option value="Zona B">Zona B - Bahía de Motocicletas</option>
                  <option value="Zona C">Zona C - Nivel 2</option>
                  <option value="Zona D">Zona D - Bahía de Bicicletas</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tipo de Vehículo Permitido
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                >
                  <option value="automovil">Automóvil</option>
                  <option value="motocicleta">Motocicleta</option>
                  <option value="camioneta">Camioneta / SUV</option>
                  <option value="bicicleta">Bicicleta</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                >
                  Guardar Celda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
