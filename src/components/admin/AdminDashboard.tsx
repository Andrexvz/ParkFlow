import React from 'react';
import { useParking } from '../../context/ParkingContext';
import { DollarSign, Car, Clock, TrendingUp, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatCOP, formatDuration } from '../../utils/pricingCalculator';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { stats, movements, spaces } = useParking();

  const completedToday = movements.filter(m => m.status === 'completado');

  const revenueByType = {
    automovil:   completedToday.filter(m => m.vehicleType === 'automovil').reduce((a, c) => a + (c.totalPaid || 0), 0),
    motocicleta: completedToday.filter(m => m.vehicleType === 'motocicleta').reduce((a, c) => a + (c.totalPaid || 0), 0),
    camioneta:   completedToday.filter(m => m.vehicleType === 'camioneta').reduce((a, c) => a + (c.totalPaid || 0), 0),
    bicicleta:   completedToday.filter(m => m.vehicleType === 'bicicleta').reduce((a, c) => a + (c.totalPaid || 0), 0),
  };

  const totalRev = stats.todayRevenue || 1;
  const autoPercent     = Math.round((revenueByType.automovil   / totalRev) * 100);
  const motoPercent     = Math.round((revenueByType.motocicleta / totalRev) * 100);
  const camionetaPercent= Math.round((revenueByType.camioneta   / totalRev) * 100);
  const biciPercent     = Math.round((revenueByType.bicicleta   / totalRev) * 100);

  const hourlyData = [
    { hour: '06h', count: 3,  rev: 8400  },
    { hour: '08h', count: 9,  rev: 28000 },
    { hour: '10h', count: 14, rev: 45000 },
    { hour: '12h', count: 12, rev: 38000 },
    { hour: '14h', count: 16, rev: 52000 },
    { hour: '16h', count: 11, rev: 34000 },
    { hour: '18h', count: 15, rev: 48000 },
    { hour: '20h', count: 6,  rev: 18000 },
  ];
  const maxHourlyCount = Math.max(...hourlyData.map(d => d.count), 20);

  const kpiCard = (
    label: string,
    value: string,
    sub: string,
    icon: React.ReactNode,
    accentColor: string,
    glowColor: string
  ) => (
    <div className="stat-card animate-fade-in" style={{ borderTop: `2px solid ${accentColor}` }}>
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
        <div style={{
          width: 34, height: 34,
          borderRadius: 10,
          background: `${glowColor}20`,
          border: `1px solid ${glowColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accentColor,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        <TrendingUp size={12} color={accentColor} />
        {sub}
      </div>
    </div>
  );

  const progressBar = (label: string, amount: number, pct: number, color: string) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 5 }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
          {formatCOP(amount)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: 99,
            transition: 'width 600ms ease',
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Panel de Control
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>
            Resumen en tiempo real · ingresos · ocupación · capacidad
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onNavigate('admin-history')}
            className="btn-ghost"
            style={{ fontSize: '0.78rem', padding: '7px 14px' }}
          >
            Exportar Reporte
          </button>
          <button
            onClick={() => onNavigate('operator-grid')}
            className="btn-primary"
            style={{ fontSize: '0.78rem', padding: '7px 14px' }}
          >
            <span>Ver Mapa en Vivo</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCard(
          'Ingresos de Hoy',
          formatCOP(stats.todayRevenue),
          'Recaudado en caja hoy',
          <DollarSign size={16} />,
          'var(--emerald-400)', '#10b981'
        )}
        {kpiCard(
          'Ocupación en Vivo',
          `${stats.occupancyRate}%`,
          `${stats.occupiedSpaces} ocupadas · ${stats.freeSpaces} libres`,
          <Car size={16} />,
          stats.occupancyRate > 80 ? 'var(--rose-400)' : 'var(--blue-400)',
          stats.occupancyRate > 80 ? '#f43f5e' : '#3b82f6'
        )}
        {kpiCard(
          'Vehículos Atendidos',
          String(stats.todayVehiclesCount),
          `${completedToday.length} salidas liquidadas`,
          <CheckCircle2 size={16} />,
          'var(--violet-400)', '#8b5cf6'
        )}
        {kpiCard(
          'Permanencia Promedio',
          formatDuration(stats.averageStayMinutes || 65),
          'Calculado sobre salidas de hoy',
          <Clock size={16} />,
          'var(--amber-400)', '#f59e0b'
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div
          className="lg:col-span-2 glass-card"
          style={{ padding: '20px 24px' }}
        >
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Afluencia por Horas
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
                Volumen estimado de vehículos ingresados a lo largo de la jornada
              </p>
            </div>
            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--amber-400)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '3px 8px' }}>
              Pico: 14h–16h
            </span>
          </div>

          <div style={{ height: 176, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
            {hourlyData.map(d => {
              const heightPct = Math.round((d.count / maxHourlyCount) * 100);
              return (
                <div key={d.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }} className="group">
                  {/* Tooltip */}
                  <div style={{
                    position: 'absolute', bottom: '105%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 8, padding: '5px 9px',
                    fontSize: '0.7rem', fontFamily: 'monospace',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', zIndex: 10,
                    boxShadow: 'var(--shadow-lg)',
                    opacity: 0,
                    transition: 'opacity 150ms',
                    pointerEvents: 'none',
                  }}
                    className="group-hover:opacity-100"
                  >
                    {d.count} vehículos · {formatCOP(d.rev)}
                  </div>
                  {/* Bar */}
                  <div
                    style={{
                      height: `${heightPct}%`,
                      width: '100%',
                      maxWidth: 28,
                      background: 'linear-gradient(180deg, var(--blue-400) 0%, var(--blue-600) 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 200ms ease',
                      cursor: 'pointer',
                      boxShadow: '0 0 8px rgba(59,130,246,0.3)',
                    }}
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 6 }}>
                    {d.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="glass-card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Ingresos por Categoría
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Distribución de la recaudación
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {progressBar('Automóviles',     revenueByType.automovil,   autoPercent,     'var(--blue-500)')}
            {progressBar('Motocicletas',    revenueByType.motocicleta, motoPercent,     'var(--emerald-500)')}
            {progressBar('Camionetas / SUV',revenueByType.camioneta,   camionetaPercent,'var(--amber-500)')}
            {progressBar('Bicicletas',      revenueByType.bicicleta,   biciPercent,     'var(--violet-500)')}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => onNavigate('admin-rates')}
              style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--blue-400)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--cyan-400)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--blue-400)')}
            >
              <span>Ajustar Tarifas por Categoría</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Admin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            view: 'admin-rates',
            tag: 'Tarifas',
            tagColor: 'var(--blue-400)',
            tagBg: 'rgba(59,130,246,0.1)',
            title: 'Configurar Tarifas y Fracciones',
            desc: 'Gestiona cobro por minuto, hora, fracciones de 15 min, día pleno y tiempo de cortesía.',
            hoverBorder: 'rgba(59,130,246,0.5)',
          },
          {
            view: 'admin-spaces',
            tag: 'Celdas',
            tagColor: 'var(--emerald-400)',
            tagBg: 'rgba(16,185,129,0.1)',
            title: `Gestión de Espacios (${spaces.length} Celdas)`,
            desc: 'Crear, editar o poner en mantenimiento celdas de las Zonas A, B, C y D.',
            hoverBorder: 'rgba(16,185,129,0.5)',
          },
          {
            view: 'admin-users',
            tag: 'Personal',
            tagColor: 'var(--amber-400)',
            tagBg: 'rgba(245,158,11,0.1)',
            title: 'Operadores y Turnos',
            desc: 'Administra empleados, asigna roles de Admin u Operador y controla estados de acceso.',
            hoverBorder: 'rgba(245,158,11,0.5)',
          },
        ].map(card => (
          <button
            key={card.view}
            onClick={() => onNavigate(card.view)}
            className="glass-card text-left animate-fade-in"
            style={{ padding: '18px 20px', cursor: 'pointer', width: '100%', background: 'none', border: '1px solid var(--border-subtle)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = card.hoverBorder;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            <span style={{
              display: 'inline-block',
              fontSize: '0.65rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: card.tagColor,
              background: card.tagBg,
              borderRadius: 4,
              padding: '2px 7px',
              marginBottom: 8,
            }}>
              {card.tag}
            </span>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              {card.title}
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              {card.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
