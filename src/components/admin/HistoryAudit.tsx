import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import { formatCOP, formatDuration } from '../../utils/pricingCalculator';
import { Search, Download, Printer } from 'lucide-react';

export const HistoryAudit: React.FC = () => {
  const { movements, openTicketModal } = useParking();

  const [searchTerm, setSearchTerm]     = useState('');
  const [filterType, setFilterType]     = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  const filteredMovements = movements.filter(m => {
    if (filterType !== 'all' && m.vehicleType !== filterType) return false;
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    if (filterPayment !== 'all' && m.paymentMethod !== filterPayment) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      if (
        !m.plate.toLowerCase().includes(q) &&
        !m.ticketNumber.toLowerCase().includes(q) &&
        !m.spaceCode.toLowerCase().includes(q) &&
        !m.operatorEntryName.toLowerCase().includes(q) &&
        !(m.operatorExitName?.toLowerCase().includes(q) ?? false)
      ) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Ticket','Placa','Tipo','Celda','Hora Entrada','Hora Salida','Minutos','Total COP','Pago','Operador','Estado'];
    const rows = filteredMovements.map(m => [
      m.ticketNumber, m.plate, m.vehicleType, m.spaceCode,
      m.entryTime, m.exitTime || 'En Parqueadero',
      m.totalMinutes ?? '', m.totalPaid ?? '',
      m.paymentMethod || '', `"${m.operatorExitName || m.operatorEntryName}"`, m.status
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `parkflow_auditoria_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const totalCollected = filteredMovements.filter(m => m.status === 'completado').reduce((a, c) => a + (c.totalPaid || 0), 0);

  const selectStyle: React.CSSProperties = {
    padding: '6px 10px',
    fontSize: '0.78rem',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    outline: 'none',
  };

  const statusBadge = (status: string) => {
    if (status === 'completado') return <span className="badge badge-emerald">Completado</span>;
    if (status === 'activo')     return <span className="badge badge-blue">Activo</span>;
    return <span className="badge badge-rose">Cancelado</span>;
  };

  const paymentBadge = (method?: string) => {
    if (!method) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    const colors: Record<string, string> = { efectivo: 'badge-emerald', nequi: 'badge-violet', daviplata: 'badge-amber', tarjeta: 'badge-blue', convenio: 'badge-muted' };
    return <span className={`badge ${colors[method] || 'badge-muted'}`} style={{ textTransform: 'capitalize' }}>{method}</span>;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Historial y Auditoría
            <span style={{ marginLeft: 8, fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-muted)' }}>
              ({filteredMovements.length} registros)
            </span>
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
            Registro detallado e inmutable de ingresos, salidas y tarifas liquidadas
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-primary"
          style={{ fontSize: '0.78rem', padding: '8px 14px' }}
        >
          <Download size={14} /> Exportar CSV / Excel
        </button>
      </div>

      {/* Summary boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Registros coincidentes', value: String(filteredMovements.length), color: 'var(--text-primary)' },
          { label: 'Total recaudado en selección', value: formatCOP(totalCollected), color: 'var(--emerald-400)' },
          { label: 'Vehículos actualmente adentro', value: String(filteredMovements.filter(m => m.status === 'activo').length), color: 'var(--blue-400)' },
        ].map(box => (
          <div key={box.label} className="glass-card" style={{ padding: '14px 18px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>
              {box.label}
            </span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: box.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {box.value}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Placa, ticket, celda u operador..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="dark-input"
              style={{ paddingLeft: 32, paddingTop: 7, paddingBottom: 7, fontSize: '0.78rem', textTransform: 'uppercase' }}
            />
          </div>
          <select value={filterStatus}  onChange={e => setFilterStatus(e.target.value)}  style={selectStyle}>
            <option value="all">Todos los Estados</option>
            <option value="completado">Completados</option>
            <option value="activo">Activos</option>
            <option value="cancelado">Cancelados</option>
          </select>
          <select value={filterType}    onChange={e => setFilterType(e.target.value)}    style={selectStyle}>
            <option value="all">Todas las Categorías</option>
            <option value="automovil">Automóviles</option>
            <option value="motocicleta">Motocicletas</option>
            <option value="camioneta">Camionetas / SUV</option>
            <option value="bicicleta">Bicicletas</option>
          </select>
          <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} style={selectStyle}>
            <option value="all">Todos los Medios</option>
            <option value="efectivo">Efectivo</option>
            <option value="nequi">Nequi</option>
            <option value="daviplata">Daviplata</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="dark-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Celda</th>
                <th>Ingreso</th>
                <th>Salida</th>
                <th>Permanencia</th>
                <th style={{ textAlign: 'right' }}>Total Cobrado</th>
                <th>Pago</th>
                <th>Estado</th>
                <th>Operador</th>
                <th style={{ textAlign: 'center' }}>Comp.</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map(m => {
                const entry = new Date(m.entryTime);
                const exit  = m.exitTime ? new Date(m.exitTime) : null;
                return (
                  <tr key={m.id}>
                    <td>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {m.ticketNumber}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.8rem',
                        padding: '2px 7px', borderRadius: 5, background: 'var(--bg-base)',
                        border: '1px solid var(--border-default)', color: 'var(--text-primary)', letterSpacing: '0.05em',
                      }}>
                        {m.plate}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {m.vehicleType}
                    </td>
                    <td>
                      <span className="badge badge-muted" style={{ fontFamily: 'monospace' }}>{m.spaceCode}</span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {entry.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {exit
                        ? <span style={{ color: 'var(--text-secondary)' }}>{exit.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                        : <span style={{ color: 'var(--blue-400)', fontWeight: 600 }}>En curso</span>
                      }
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      {m.totalMinutes !== undefined ? formatDuration(m.totalMinutes) : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.82rem' }}>
                      {m.totalPaid !== undefined
                        ? <span style={{ color: 'var(--emerald-400)' }}>{formatCOP(m.totalPaid)}</span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>
                      }
                    </td>
                    <td>{paymentBadge(m.paymentMethod)}</td>
                    <td>{statusBadge(m.status)}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={m.operatorExitName || m.operatorEntryName}>
                      {m.operatorExitName || m.operatorEntryName}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => openTicketModal(m, m.status === 'completado' ? 'exit' : 'entry')}
                        title="Ver / Reimprimir Comprobante"
                        style={{ padding: 7, background: 'transparent', border: 'none', borderRadius: 7, cursor: 'pointer', color: 'var(--text-muted)', display: 'inline-flex', transition: 'all 120ms' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                      >
                        <Printer size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredMovements.length === 0 && (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No se encontraron movimientos con los filtros especificados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
