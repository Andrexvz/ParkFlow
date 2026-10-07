import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { Clock, FastForward, RotateCcw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export const TimeSimulatorBanner: React.FC = () => {
  const { simulatedTimeOffsetMinutes, advanceSimulatedTime, resetSimulatedTime, currentEffectiveTime } = useParking();
  const [isOpen, setIsOpen] = useState(false);

  const formattedTime = currentEffectiveTime.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = currentEffectiveTime.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs select-none">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Neiva, Huila</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-white">{formattedTime}</span>
            <span className="text-slate-400 capitalize">({formattedDate})</span>
          </div>

          {simulatedTimeOffsetMinutes > 0 && (
            <div className="flex items-center gap-1 text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded text-[11px] font-mono tabular-nums">
              <FastForward className="w-3 h-3" />
              <span>+{Math.floor(simulatedTimeOffsetMinutes / 60)}h {simulatedTimeOffsetMinutes % 60}m simulados</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Simulador de paso del tiempo para pruebas de tarifas"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Simulador de Tiempo</span>
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-2 text-slate-300">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">
                Avanza el reloj para probar el cobro de diferentes permanencias (gracia, fracciones, horas o días):
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => advanceSimulatedTime(15)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors font-mono"
              >
                +15 min
              </button>
              <button
                onClick={() => advanceSimulatedTime(30)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors font-mono"
              >
                +30 min
              </button>
              <button
                onClick={() => advanceSimulatedTime(60)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors font-mono"
              >
                +1 hora
              </button>
              <button
                onClick={() => advanceSimulatedTime(180)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors font-mono"
              >
                +3 horas
              </button>
              <button
                onClick={() => advanceSimulatedTime(720)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors font-mono"
              >
                +12 horas
              </button>

              {simulatedTimeOffsetMinutes > 0 && (
                <button
                  onClick={resetSimulatedTime}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-900/50 hover:bg-rose-800/80 text-rose-200 transition-colors ml-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restablecer Hora Real</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
