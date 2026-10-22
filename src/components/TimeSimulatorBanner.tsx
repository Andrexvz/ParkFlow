import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { Clock, FastForward, RotateCcw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export const TimeSimulatorBanner: React.FC = () => {
  const { simulatedTimeOffsetMinutes, advanceSimulatedTime, resetSimulatedTime, currentEffectiveTime } = useParking();
  const [isOpen, setIsOpen] = useState(false);

  const formattedTime = currentEffectiveTime.toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const formattedDate = currentEffectiveTime.toLocaleDateString('es-CO', {
    weekday: 'short', day: 'numeric', month: 'short'
  });

  const timeBtn = (label: string, minutes: number) => (
    <button
      key={label}
      onClick={() => advanceSimulatedTime(minutes)}
      style={{
        padding: '4px 10px',
        fontSize: '0.72rem',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 500,
        color: 'var(--text-secondary)',
        background: 'var(--bg-hover)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 120ms ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--amber-400)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(245,158,11,0.4)';
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.08)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)';
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', userSelect: 'none' }}>
      <div className="max-w-7xl mx-auto px-4" style={{ height: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Left: time info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--emerald-400)', fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--emerald-400)', display: 'inline-block', boxShadow: '0 0 6px var(--emerald-400)', animation: 'blink 2s ease-in-out infinite' }} />
            Neiva, Huila
          </div>
          <span style={{ color: 'var(--border-default)' }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace" }}>
            <Clock size={13} color="var(--text-muted)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formattedTime}</span>
            <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>({formattedDate})</span>
          </div>
          {simulatedTimeOffsetMinutes > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              color: 'var(--amber-400)',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 6,
              padding: '2px 8px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem',
            }}>
              <FastForward size={11} />
              +{Math.floor(simulatedTimeOffsetMinutes / 60)}h {simulatedTimeOffsetMinutes % 60}m simulados
            </div>
          )}
        </div>

        {/* Right: simulator toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 10px',
            fontSize: '0.72rem', fontWeight: 500,
            color: 'var(--text-muted)',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'all 120ms ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)';
          }}
        >
          <Sparkles size={11} color="var(--amber-400)" />
          Simulador de Tiempo
          {isOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      {/* Expanded controls */}
      {isOpen && (
        <div
          className="animate-fade-in"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-base)',
            padding: '8px 16px',
          }}
        >
          <div className="max-w-7xl mx-auto" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Avanza el reloj para probar tarifas (gracia, fracciones, horas o días):
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {timeBtn('+15 min', 15)}
              {timeBtn('+30 min', 30)}
              {timeBtn('+1 hora', 60)}
              {timeBtn('+3 horas', 180)}
              {timeBtn('+12 horas', 720)}
              {simulatedTimeOffsetMinutes > 0 && (
                <button
                  onClick={resetSimulatedTime}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px',
                    fontSize: '0.72rem', fontWeight: 600,
                    color: 'var(--rose-400)',
                    background: 'rgba(244,63,94,0.1)',
                    border: '1px solid rgba(244,63,94,0.25)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    marginLeft: 4,
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,63,94,0.18)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,63,94,0.1)')}
                >
                  <RotateCcw size={11} />
                  Restablecer Hora Real
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
