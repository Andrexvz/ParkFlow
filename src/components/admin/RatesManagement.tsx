import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import { VehicleRate } from '../../types';
import { formatCOP } from '../../utils/pricingCalculator';
import { Save, Check, RefreshCw, Car, Bike, Truck } from 'lucide-react';

export const RatesManagement: React.FC = () => {
  const { rates, updateRate } = useParking();
  const [editingRates, setEditingRates] = useState<VehicleRate[]>(rates);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFieldChange = (rateId: string, field: keyof VehicleRate, value: number) => {
    setEditingRates(prev =>
      prev.map(r => (r.id === rateId ? { ...r, [field]: value } : r))
    );
    setSavedSuccess(false);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    editingRates.forEach(rate => {
      updateRate(rate);
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'motocicleta':
        return <Bike className="w-4 h-4 text-emerald-600" />;
      case 'camioneta':
        return <Truck className="w-4 h-4 text-amber-600" />;
      case 'bicicleta':
        return <Bike className="w-4 h-4 text-blue-600" />;
      default:
        return <Car className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Tarifas y Fracciones (Neiva)
          </h2>
          <p className="text-xs text-slate-500">
            Parámetros oficiales de cobro por categoría vehicular, fracciones de tiempo y minutos de cortesía
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <Check className="w-4 h-4" />
            <span>Tarifas actualizadas correctamente</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {editingRates.map(rate => (
            <div
              key={rate.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-100">
                    {getVehicleIcon(rate.vehicleType)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{rate.label}</h3>
                    <p className="text-[11px] text-slate-500 capitalize">Categoría: {rate.vehicleType}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                  {formatCOP(rate.ratePerHour)}/h
                </span>
              </div>

              {/* Rate Inputs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Tarifa por Hora ($ COP)
                  </label>
                  <input
                    type="number"
                    step={100}
                    value={rate.ratePerHour}
                    onChange={(e) => handleFieldChange(rate.id, 'ratePerHour', Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Fracción 15 Min ($ COP)
                  </label>
                  <input
                    type="number"
                    step={50}
                    value={rate.ratePerFraction15m}
                    onChange={(e) => handleFieldChange(rate.id, 'ratePerFraction15m', Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Día Completo (12-24h)
                  </label>
                  <input
                    type="number"
                    step={500}
                    value={rate.ratePerDay}
                    onChange={(e) => handleFieldChange(rate.id, 'ratePerDay', Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Mensualidad ($ COP)
                  </label>
                  <input
                    type="number"
                    step={1000}
                    value={rate.ratePerMonth}
                    onChange={(e) => handleFieldChange(rate.id, 'ratePerMonth', Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Minutos de Cortesía
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={rate.gracePeriodMinutes}
                    onChange={(e) => handleFieldChange(rate.id, 'gracePeriodMinutes', Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Multa Ticket Perdido
                  </label>
                  <input
                    type="number"
                    step={1000}
                    value={rate.lostTicketFee}
                    onChange={(e) => handleFieldChange(rate.id, 'lostTicketFee', Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración de Tarifas</span>
          </button>
        </div>
      </form>
    </div>
  );
};
