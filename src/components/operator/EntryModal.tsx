import React, { useState, useEffect } from 'react';
import { useParking } from '../../context/ParkingContext';
import { VehicleType, ParkingSpace } from '../../types';
import { validateAndFormatPlate } from '../../utils/plateValidator';
import { Car, Bike, Truck, AlertCircle, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { formatCOP } from '../../utils/pricingCalculator';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedSpaceId?: string;
}

export const EntryModal: React.FC<EntryModalProps> = ({ isOpen, onClose, preselectedSpaceId }) => {
  const { spaces, rates, registerEntry, movements } = useParking();

  const [plateInput, setPlateInput] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('automovil');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [useAutoSpace, setUseAutoSpace] = useState<boolean>(true);
  const [helmetsCount, setHelmetsCount] = useState<number>(1);
  const [entryNotes, setEntryNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const [validationMsg, setValidationMsg] = useState<{ isValid: boolean; message?: string }>({ isValid: false });
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Cuando cambie preselectedSpaceId
  useEffect(() => {
    if (preselectedSpaceId) {
      const space = spaces.find(s => s.id === preselectedSpaceId);
      if (space && space.status === 'libre') {
        setSelectedSpaceId(space.id);
        setVehicleType(space.allowedType);
        setUseAutoSpace(false);
      }
    } else {
      setUseAutoSpace(true);
      setSelectedSpaceId('');
    }
  }, [preselectedSpaceId, spaces]);

  // Validar placa en tiempo real
  useEffect(() => {
    if (!plateInput.trim()) {
      setValidationMsg({ isValid: false });
      return;
    }
    const result = validateAndFormatPlate(plateInput, vehicleType);
    if (result.isValid) {
      // Verificar si ya está adentro
      const formatted = result.formattedPlate;
      const alreadyInside = movements.some(m => m.plate === formatted && m.status === 'activo');
      if (alreadyInside) {
        setValidationMsg({
          isValid: false,
          message: `¡ALERTA! El vehículo ${formatted} ya está dentro del parqueadero.`
        });
      } else {
        setValidationMsg({
          isValid: true,
          message: `Placa válida: ${formatted}`
        });
      }
    } else {
      setValidationMsg({
        isValid: false,
        message: result.errorMessage
      });
    }
  }, [plateInput, vehicleType, movements]);

  if (!isOpen) return null;

  // Celdas disponibles para el tipo seleccionado
  const freeSpacesForType = spaces.filter(
    s => s.status === 'libre' && (s.allowedType === vehicleType || (vehicleType === 'automovil' && s.allowedType === 'camioneta'))
  );

  const isFull = freeSpacesForType.length === 0;

  // Tarifa aplicable
  const currentRate = rates.find(r => r.vehicleType === vehicleType) || rates[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    const validation = validateAndFormatPlate(plateInput, vehicleType);
    if (!validation.isValid) {
      setSubmissionError(validation.errorMessage || 'Placa inválida');
      return;
    }

    if (isFull && useAutoSpace) {
      setSubmissionError(`No hay celdas libres disponibles para ${vehicleType}. Parqueadero lleno.`);
      return;
    }

    const res = registerEntry({
      plate: validation.formattedPlate,
      vehicleType,
      spaceId: useAutoSpace ? undefined : selectedSpaceId,
      helmetsCount: vehicleType === 'motocicleta' ? helmetsCount : undefined,
      entryNotes: entryNotes.trim() || undefined,
      clientName: clientName.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined
    });

    if (res.success) {
      // Limpiar y cerrar
      setPlateInput('');
      setEntryNotes('');
      setClientName('');
      setClientPhone('');
      onClose();
    } else {
      setSubmissionError(res.error || 'Error al registrar entrada');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Registrar Entrada de Vehículo
            </h2>
            <p className="text-xs text-slate-500">
              Ingresa los datos para asignar celda y emitir ticket de ingreso
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submissionError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submissionError}</span>
          </div>
        )}

        {isFull && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Atención: 0 celdas disponibles para esta categoría en este momento.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Tipo de Vehículo Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tipo de Vehículo
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setVehicleType('automovil')}
                className={`py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  vehicleType === 'automovil'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Auto</span>
              </button>

              <button
                type="button"
                onClick={() => setVehicleType('motocicleta')}
                className={`py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  vehicleType === 'motocicleta'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Moto</span>
              </button>

              <button
                type="button"
                onClick={() => setVehicleType('camioneta')}
                className={`py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  vehicleType === 'camioneta'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>SUV / Van</span>
              </button>

              <button
                type="button"
                onClick={() => setVehicleType('bicicleta')}
                className={`py-2 px-1 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  vehicleType === 'bicicleta'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Bici</span>
              </button>
            </div>
          </div>

          {/* Placa Input con validación */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Placa del Vehículo
              </label>
              <span className="text-[11px] text-slate-400">
                {vehicleType === 'automovil' || vehicleType === 'camioneta'
                  ? 'Ej: KEO-492'
                  : vehicleType === 'motocicleta'
                  ? 'Ej: NXL-10F ó ABC-12'
                  : 'Ej: B-01'}
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                maxLength={8}
                value={plateInput}
                onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                placeholder={vehicleType === 'motocicleta' ? 'ABC12D' : 'ABC123'}
                className="w-full px-3.5 py-2.5 text-lg font-mono font-bold tracking-widest text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white uppercase transition-all"
                autoFocus
              />
              {validationMsg.isValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>

            {validationMsg.message && (
              <p className={`mt-1.5 text-xs flex items-center gap-1 ${
                validationMsg.isValid ? 'text-emerald-600 font-medium' : 'text-rose-600'
              }`}>
                {!validationMsg.isValid && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                <span>{validationMsg.message}</span>
              </p>
            )}
          </div>

          {/* Asignación de Celda */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Asignación de Celda
              </label>
              <span className="text-[11px] text-emerald-600 font-medium">
                {freeSpacesForType.length} disponibles
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="spaceMode"
                  checked={useAutoSpace}
                  onChange={() => setUseAutoSpace(true)}
                  className="text-blue-600"
                />
                <span className="text-slate-700">Asignar automáticamente</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="spaceMode"
                  checked={!useAutoSpace}
                  onChange={() => setUseAutoSpace(false)}
                  className="text-blue-600"
                />
                <span className="text-slate-700">Seleccionar manualmente</span>
              </label>
            </div>

            {!useAutoSpace && (
              <select
                value={selectedSpaceId}
                onChange={(e) => setSelectedSpaceId(e.target.value)}
                required={!useAutoSpace}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">-- Elige una celda libre --</option>
                {freeSpacesForType.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} ({s.zone} - {s.allowedType})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Campo de Cascos para motos */}
          {vehicleType === 'motocicleta' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Número de Cascos a Custodia
              </label>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setHelmetsCount(num)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      helmetsCount === num
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {num === 0 ? 'Sin Casco' : `${num} ${num === 1 ? 'Casco' : 'Cascos'}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones Físicas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Observaciones del Estado Físico (Opcional)
            </label>
            <input
              type="text"
              value={entryNotes}
              onChange={(e) => setEntryNotes(e.target.value)}
              placeholder="Ej: Rayón puerta delantera, espejo izquierdo flojo..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-slate-400"
            />
          </div>

          {/* Tarifa Informativa Preview */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center justify-between font-medium">
              <span>Tarifa Base Aplicable:</span>
              <span className="font-mono text-slate-900 font-bold">
                {formatCOP(currentRate.ratePerHour)} / hora
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Cortesía gratuita:</span>
              <span>{currentRate.gracePeriodMinutes} minutos</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Fracción adicional (15 min):</span>
              <span className="font-mono">{formatCOP(currentRate.ratePerFraction15m)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isFull && useAutoSpace}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              Confirmar e Imprimir Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
