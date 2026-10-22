import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import { Movement, VehicleType } from '../../types';
import { Search, Clock, Printer, Car, Bike, Truck, ArrowUpRight } from 'lucide-react';
import { formatCOP, formatDuration } from '../../utils/pricingCalculator';

interface ActiveVehiclesListProps {
  onProcessExit: (movementId: string) => void;
}

export const ActiveVehiclesList: React.FC<ActiveVehiclesListProps> = ({ onProcessExit }) => {
  const { movements, rates, currentEffectiveTime, openTicketModal } = useParking();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const activeMovements = movements.filter(m => m.status === 'activo');

  const filtered = activeMovements.filter(m => {
    if (typeFilter !== 'all' && m.vehicleType !== typeFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!m.plate.toLowerCase().includes(q) && !m.spaceCode.toLowerCase().includes(q) && !m.ticketNumber.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const getVehicleIcon = (type: VehicleType) => {
    const color = type === 'motocicleta' ? 'var(--blue-400)' : type === 'camioneta' ? 'var(--amber-400)' : type === 'bicicleta' ? 'var(--emerald-400)' : 'var(--violet-400)';
    const Icon = type === 'camioneta' ? Truck : type === 'automovil' ? Car : Bike;
    return <Icon size={14} color={color} />;
  };

  const getEstCost = (m: Movement) => {
    const totalMinutes = Math.floor(Math.max(0, currentEffectiveTime.getTime() - new Date(m.entryTime).getTime()) / 60000);
    const rate = rates.find(r => r.vehicleType === m.vehicleType) || rates[0];
    if (totalMinutes <= rate.gracePeriodMinutes) return { totalMinutes, cost: 0, isGrace: true };
    const cost = (Math.floor(totalMinutes / 60) + 1) * rate.ratePerHour;
    return { totalMinutes, cost, isGrace: false };
  };

  const tabStyle = (active: boolean) => ({
    padding: '5px 12px',
    fontSize: '0.75rem',
    fontWeight: active ? 600 : 400,
    borderRadius: 7,
    background: active ? 'var(--bg-elevated)' : 'transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    border: active ? '1px solid var(--border-default)' : '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 120ms ease',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div className="glass-card animate-fade-in" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Vehículos Estacionados Actualmente
              <span style={{ marginLeft: 8, fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                ({activeMovements.length} activos)
              </span>
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
              Listado en vivo con cronómetro de tiempo y cobro estimado
            </p>
          </div>
          <div style={{ position: 'relative', minWidth: 220 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Placa, celda o ticket..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="dark-input"
              style={{ paddingLeft: 32, paddingTop: 7, paddingBottom: 7, fontSize: '0.78rem', textTransform: 'uppercase' }}
            />
          </div>
        </div>

        {/* Type filter tabs */}
        <div style={{ display: 'flex', gap: 3, padding: 3, background: 'var(--bg-input)', borderRadius: 10, border: '1px solid var(--border-subtle)', width: 'fit-content' }}>
          <button style={tabStyle(typeFilter === 'all')} onClick={() => setTypeFilter('all')}>
            Todos ({activeMovements.length})
          </button>
          {['automovil', 'motocicleta', 'camioneta'].map(t => (
            <button key={t} style={tabStyle(typeFilter === t)} onClick={() => setTypeFilter(t)}>
              {t === 'automovil' ? 'Autos' : t === 'motocicleta' ? 'Motos' : 'SUV/Van'} ({activeMovements.filter(m => m.vehicleType === t).length})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="dark-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Placa</th>
              <th>Celda</th>
              <th>Tipo</th>
              <th>Hora Entrada</th>
              <th>Tiempo</th>
              <th style={{ textAlign: 'right' }}>Costo Est.</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const info = getEstCost(m);
              const entryDate = new Date(m.entryTime);
              return (
                <tr key={m.id}>
                  <td>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {m.ticketNumber}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        padding: '2px 8px',
                        borderRadius: 5,
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        letterSpacing: '0.05em',
                      }}>
                        {m.plate}
                      </span>
                      {m.helmetsCount ? (
                        <span style={{ fontSize: '0.68rem', color: 'var(--blue-400)', fontWeight: 500 }}>
                          ({m.helmetsCount} cascos)
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-blue" style={{ fontFamily: 'monospace' }}>
                      {m.spaceCode}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, textTransform: 'capitalize', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {getVehicleIcon(m.vehicleType)}
                      {m.vehicleType}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {entryDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'monospace', fontWeight: 700, color: 'var(--cyan-400)' }}>
                      <Clock size={13} color="var(--text-muted)" />
                      {formatDuration(info.totalMinutes)}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {info.isGrace ? (
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--emerald-400)', fontSize: '0.78rem' }}>
                        Cortesía
                      </span>
                    ) : (
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                        {formatCOP(info.cost)}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      <button
                        onClick={() => openTicketModal(m, 'entry')}
                        title="Reimprimir Ticket de Entrada"
                        style={{
                          padding: 7, background: 'transparent',
                          border: 'none', borderRadius: 8,
                          color: 'var(--text-muted)', cursor: 'pointer',
                          display: 'flex', transition: 'all 120ms',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        onClick={() => onProcessExit(m.id)}
                        className="btn-primary"
                        style={{ padding: '5px 12px', fontSize: '0.75rem', gap: 4 }}
                      >
                        Cobrar <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No se encontraron vehículos activos con los filtros indicados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
