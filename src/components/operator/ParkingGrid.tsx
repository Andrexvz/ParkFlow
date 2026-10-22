import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import { ParkingSpace, VehicleType } from '../../types';
import { Car, Bike, Truck, Clock, Search, Filter, Wrench, X } from 'lucide-react';
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

  const zones = ['all', 'Zona A', 'Zona B', 'Zona C', 'Zona D'];

  const filteredSpaces = spaces.filter(space => {
    if (selectedZone !== 'all' && space.zone !== selectedZone) return false;
    if (selectedType !== 'all' && space.allowedType !== selectedType) return false;
    if (searchPlate.trim()) {
      const q = searchPlate.trim().toUpperCase();
      if (!space.currentVehiclePlate?.toUpperCase().includes(q) && !space.code.toUpperCase().includes(q)) return false;
    }
    return true;
  });

  const getVehicleIcon = (type: VehicleType, size = 14) => {
    switch (type) {
      case 'motocicleta': return <Bike size={size} />;
      case 'camioneta':   return <Truck size={size} />;
      case 'bicicleta':   return <Bike size={size} />;
      default:            return <Car size={size} />;
    }
  };

  const getStayInfo = (movementId?: string) => {
    if (!movementId) return null;
    const movement = movements.find(m => m.id === movementId);
    if (!movement) return null;
    const entryDate = new Date(movement.entryTime);
    const totalMinutes = Math.floor(Math.max(0, currentEffectiveTime.getTime() - entryDate.getTime()) / 60000);
    const rate = rates.find(r => r.vehicleType === movement.vehicleType) || rates[0];
    const hours = Math.floor(totalMinutes / 60);
    const estCost = totalMinutes <= rate.gracePeriodMinutes ? 0 : (hours + 1) * rate.ratePerHour;
    return { movement, entryDate, totalMinutes, durationText: formatDuration(totalMinutes), estCost };
  };

  const handleCellClick = (space: ParkingSpace) => {
    if (space.status === 'libre') {
      onSelectSpaceForEntry(space.id);
    } else {
      setSelectedSpaceDetails(space);
    }
  };

  // Pill tab button style
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
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    whiteSpace: 'nowrap' as const,
  });

  const freeCount  = spaces.filter(s => s.status === 'libre').length;
  const occCount   = spaces.filter(s => s.status === 'ocupado').length;
  const maintCount = spaces.filter(s => s.status === 'mantenimiento' || s.status === 'reservado').length;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Mapa de Celdas en Tiempo Real
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
              Clic en celda libre → registrar entrada · Clic en ocupada → ver detalles y cobrar
            </p>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', minWidth: 230 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Placa o celda (ej: KEO, A-03)..."
              value={searchPlate}
              onChange={e => setSearchPlate(e.target.value)}
              className="dark-input"
              style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, fontSize: '0.78rem', textTransform: 'uppercase' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          {/* Zone + Type filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Filter size={12} /> Zona:
            </span>
            <div style={{ display: 'flex', gap: 3, padding: 3, background: 'var(--bg-input)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              {zones.map(z => (
                <button key={z} onClick={() => setSelectedZone(z)} style={tabStyle(selectedZone === z)}>
                  {z === 'all' ? 'Todas' : z}
                </button>
              ))}
            </div>

            <div style={{ width: 1, height: 18, background: 'var(--border-subtle)', margin: '0 4px' }} />

            <div style={{ display: 'flex', gap: 3, padding: 3, background: 'var(--bg-input)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              {[
                { key: 'all', label: 'Todos' },
                { key: 'automovil',   label: 'Autos',   icon: <Car size={12} /> },
                { key: 'motocicleta', label: 'Motos',   icon: <Bike size={12} /> },
                { key: 'camioneta',   label: 'SUV/Van', icon: <Truck size={12} /> },
              ].map(t => (
                <button key={t.key} onClick={() => setSelectedType(t.key)} style={tabStyle(selectedType === t.key)}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.72rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--emerald-400)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--emerald-500)', display: 'inline-block' }} />
              Libre ({freeCount})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--blue-400)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--blue-500)', display: 'inline-block' }} />
              Ocupado ({occCount})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--amber-400)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--amber-500)', display: 'inline-block' }} />
              No disp. ({maintCount})
            </div>
          </div>
        </div>
      </div>

      {/* Space Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {filteredSpaces.map(space => {
          const stayInfo = getStayInfo(space.currentMovementId);
          const isFree  = space.status === 'libre';
          const isOccupied = space.status === 'ocupado';
          const isMaint = !isFree && !isOccupied;

          let cardBg     = isFree ? 'rgba(16,185,129,0.05)'  : isOccupied ? 'rgba(59,130,246,0.06)' : 'rgba(245,158,11,0.05)';
          let cardBorder = isFree ? 'rgba(16,185,129,0.22)'  : isOccupied ? 'rgba(59,130,246,0.22)' : 'rgba(245,158,11,0.22)';
          let iconColor  = isFree ? 'var(--emerald-400)'     : isOccupied ? 'var(--blue-400)'       : 'var(--amber-400)';
          let labelColor = isFree ? 'var(--emerald-400)'     : isOccupied ? 'var(--text-secondary)' : 'var(--amber-400)';

          return (
            <button
              key={space.id}
              onClick={() => handleCellClick(space)}
              style={{
                position: 'relative',
                textAlign: 'left',
                padding: '11px 12px',
                borderRadius: 12,
                border: `1px solid ${cardBorder}`,
                background: cardBg,
                cursor: isMaint ? 'default' : 'pointer',
                minHeight: 108,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 180ms ease',
              }}
              onMouseEnter={e => {
                if (isMaint) return;
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = 'scale(1.04)';
                b.style.boxShadow = isFree
                  ? '0 0 16px rgba(16,185,129,0.25)'
                  : '0 0 16px rgba(59,130,246,0.25)';
                b.style.borderColor = isFree ? 'var(--emerald-400)' : 'var(--blue-400)';
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = 'scale(1)';
                b.style.boxShadow = 'none';
                b.style.borderColor = cardBorder;
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {space.code}
                </span>
                <span style={{ color: iconColor, display: 'flex', padding: '3px', borderRadius: 5, background: `${iconColor}15` }}>
                  {getVehicleIcon(space.allowedType)}
                </span>
              </div>

              {/* Body */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '6px 0' }}>
                {isFree && (
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--emerald-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>DISPONIBLE</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: 2 }}>{space.allowedType}</p>
                  </div>
                )}

                {isOccupied && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 6,
                      padding: '2px 6px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      textAlign: 'center',
                      letterSpacing: '0.05em',
                    }}>
                      {space.currentVehiclePlate}
                    </div>
                    {stayInfo && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={10} />
                          {stayInfo.durationText}
                        </span>
                        <span style={{ color: 'var(--cyan-400)', fontWeight: 700 }}>
                          {formatCOP(stayInfo.estCost)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {isMaint && (
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--amber-400)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Wrench size={10} /> {space.status === 'reservado' ? 'RESERVADO' : 'MANTENIM.'}
                    </p>
                    {space.notes && (
                      <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={space.notes}>
                        {space.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{space.zone}</span>
                {!isMaint && (
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: labelColor, opacity: 0 }}
                    className="group-hover:opacity-100">
                    {isFree ? 'Asignar →' : 'Cobrar →'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filteredSpaces.length === 0 && (
        <div className="glass-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
            No se encontraron celdas con los filtros actuales
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 6 }}>
            Prueba seleccionando otra zona o limpiando la búsqueda.
          </p>
        </div>
      )}

      {/* Space Detail Modal */}
      {selectedSpaceDetails && (
        <div className="modal-overlay" onClick={() => setSelectedSpaceDetails(null)}>
          <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--blue-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {selectedSpaceDetails.zone}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  Celda {selectedSpaceDetails.code}
                  <span className={`badge ${selectedSpaceDetails.status === 'libre' ? 'badge-emerald' : selectedSpaceDetails.status === 'ocupado' ? 'badge-blue' : 'badge-amber'}`}
                    style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {selectedSpaceDetails.status}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedSpaceDetails(null)}
                style={{ padding: 8, background: 'var(--bg-hover)', border: 'none', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)')}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Occupied */}
              {selectedSpaceDetails.status === 'ocupado' && (() => {
                const info = getStayInfo(selectedSpaceDetails.currentMovementId);
                return info ? (
                  <>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '16px' }}>
                      {[
                        { label: 'Placa Registrada', value: (
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', background: 'var(--bg-base)', padding: '2px 10px', borderRadius: 6, border: '1px solid var(--border-default)' }}>
                            {selectedSpaceDetails.currentVehiclePlate}
                          </span>
                        )},
                        { label: 'Tipo de Vehículo', value: <span style={{ fontWeight: 500, textTransform: 'capitalize', color: 'var(--text-primary)' }}>{info.movement.vehicleType}</span> },
                        { label: 'Hora de Entrada', value: <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{info.entryDate.toLocaleTimeString('es-CO')}</span> },
                        { label: 'Tiempo Transcurrido', value: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--cyan-400)' }}>{info.durationText}</span> },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{row.label}</span>
                          {row.value}
                        </div>
                      ))}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, marginTop: 4 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cobro Estimado Actual</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: '1.1rem', color: 'var(--emerald-400)' }}>
                          {formatCOP(info.estCost)}
                        </span>
                      </div>
                    </div>
                    {info.movement.helmetsCount ? (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        🏍️ Cascos registrados: <strong>{info.movement.helmetsCount}</strong>
                      </p>
                    ) : null}
                    {info.movement.entryNotes && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--amber-400)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '8px 12px', fontStyle: 'italic' }}>
                        Obs: {info.movement.entryNotes}
                      </p>
                    )}
                    <button
                      onClick={() => { const id = selectedSpaceDetails.id; setSelectedSpaceDetails(null); onSelectSpaceForExit(id); }}
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
                    >
                      Cobrar y Registrar Salida
                    </button>
                  </>
                ) : null;
              })()}

              {/* Free */}
              {selectedSpaceDetails.status === 'libre' && (
                <>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Esta celda está disponible para vehículos tipo <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{selectedSpaceDetails.allowedType}</strong>.
                  </p>
                  <button
                    onClick={() => { const id = selectedSpaceDetails.id; setSelectedSpaceDetails(null); onSelectSpaceForEntry(id); }}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '11px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    Registrar Entrada en Celda {selectedSpaceDetails.code}
                  </button>
                </>
              )}

              {/* Maintenance / Reserved */}
              {(selectedSpaceDetails.status === 'mantenimiento' || selectedSpaceDetails.status === 'reservado') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Estado: <strong style={{ color: 'var(--amber-400)', textTransform: 'uppercase' }}>{selectedSpaceDetails.status}</strong>.
                    {selectedSpaceDetails.notes && ` ${selectedSpaceDetails.notes}`}
                  </p>
                  {currentUser?.role === 'ADMIN' && (
                    <button
                      onClick={() => { updateSpaceStatus(selectedSpaceDetails.id, 'libre', ''); setSelectedSpaceDetails(null); }}
                      style={{
                        width: '100%', padding: '10px', fontSize: '0.85rem', fontWeight: 600,
                        color: 'var(--emerald-400)', background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, cursor: 'pointer',
                        transition: 'all 150ms',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.2)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.1)')}
                    >
                      Habilitar como Libre
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
