import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import { Movement, VehicleType } from '../../types';
import { formatCOP, formatDuration } from '../../utils/pricingCalculator';
import { Search, Download, Printer, Filter, Calendar, FileSpreadsheet, ArrowUpDown } from 'lucide-react';

export const HistoryAudit: React.FC = () => {
  const { movements, openTicketModal } = useParking();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  const filteredMovements = movements.filter(m => {
    if (filterType !== 'all' && m.vehicleType !== filterType) return false;
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    if (filterPayment !== 'all' && m.paymentMethod !== filterPayment) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const matchPlate = m.plate.toLowerCase().includes(q);
      const matchTicket = m.ticketNumber.toLowerCase().includes(q);
      const matchSpace = m.spaceCode.toLowerCase().includes(q);
      const matchOp = m.operatorEntryName.toLowerCase().includes(q) || (m.operatorExitName?.toLowerCase().includes(q) ?? false);
      if (!matchPlate && !matchTicket && !matchSpace && !matchOp) return false;
    }
    return true;
  });

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = [
      'Ticket',
      'Placa',
      'Tipo de Vehiculo',
      'Celda',
      'Hora Entrada',
      'Hora Salida',
      'Minutos Totales',
      'Total Pagado (COP)',
      'Metodo de Pago',
      'Operador Entrada',
      'Operador Salida',
      'Estado'
    ];

    const rows = filteredMovements.map(m => [
      m.ticketNumber,
      m.plate,
      m.vehicleType,
      m.spaceCode,
      m.entryTime,
      m.exitTime || 'En Parqueadero',
      m.totalMinutes !== undefined ? m.totalMinutes : '',
      m.totalPaid !== undefined ? m.totalPaid : '',
      m.paymentMethod || '',
      `"${m.operatorEntryName}"`,
      `"${m.operatorExitName || ''}"`,
      m.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `parkflow_auditoria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCollectedFiltered = filteredMovements
    .filter(m => m.status === 'completado')
    .reduce((a, c) => a + (c.totalPaid || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Historial de Movimientos y Auditoría ({filteredMovements.length})
          </h2>
          <p className="text-xs text-slate-500">
            Registro detallado e inmutable de ingresos, salidas, tarifas liquidadas y operadores
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar a CSV / Excel</span>
        </button>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Registros Coincidentes
          </span>
          <span className="text-xl font-extrabold text-slate-900 font-mono">
            {filteredMovements.length}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Recaudado en Selección
          </span>
          <span className="text-xl font-extrabold text-emerald-600 font-mono">
            {formatCOP(totalCollectedFiltered)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Vehículos Actualmente Adentro
          </span>
          <span className="text-xl font-extrabold text-blue-600 font-mono">
            {filteredMovements.filter(m => m.status === 'activo').length}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por placa, ticket, celda u operador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="all">Todos los Estados</option>
              <option value="completado">Completados (Pagados)</option>
              <option value="activo">Activos (En Parqueadero)</option>
              <option value="cancelado">Cancelados</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="all">Todas las Categorías</option>
              <option value="automovil">Automóviles</option>
              <option value="motocicleta">Motocicletas</option>
              <option value="camioneta">Camionetas / SUV</option>
              <option value="bicicleta">Bicicletas</option>
            </select>

            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="all">Todos los Medios de Pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="nequi">Nequi</option>
              <option value="daviplata">Daviplata</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-4">Ticket</th>
                <th className="py-2.5 px-4">Placa</th>
                <th className="py-2.5 px-4">Tipo</th>
                <th className="py-2.5 px-4">Celda</th>
                <th className="py-2.5 px-4">Ingreso</th>
                <th className="py-2.5 px-4">Salida</th>
                <th className="py-2.5 px-4">Permanencia</th>
                <th className="py-2.5 px-4 text-right">Total Cobrado</th>
                <th className="py-2.5 px-4">Pago</th>
                <th className="py-2.5 px-4">Operador</th>
                <th className="py-2.5 px-4 text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.map(m => {
                const entry = new Date(m.entryTime);
                const exit = m.exitTime ? new Date(m.exitTime) : null;

                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {m.ticketNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-slate-900 text-white tracking-wider">
                        {m.plate}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-600">
                      {m.vehicleType}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {m.spaceCode}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {entry.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {exit ? exit.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : (
                        <span className="text-blue-600 font-medium">En curso</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {m.totalMinutes !== undefined ? formatDuration(m.totalMinutes) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      {m.totalPaid !== undefined ? (
                        <span className="text-slate-900">{formatCOP(m.totalPaid)}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      {m.paymentMethod ? (
                        <span className="font-medium text-slate-700">{m.paymentMethod}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[120px]" title={m.operatorExitName || m.operatorEntryName}>
                      {m.operatorExitName || m.operatorEntryName}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openTicketModal(m, m.status === 'completado' ? 'exit' : 'entry')}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ver / Reimprimir Comprobante"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredMovements.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <p className="text-xs">No se encontraron movimientos con los filtros especificados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
