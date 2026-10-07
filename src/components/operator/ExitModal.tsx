import React, { useState, useEffect, useMemo } from 'react';
import { useParking } from '../../context/ParkingContext';
import { Movement, PaymentMethod } from '../../types';
import { calculateParkingFee, formatCOP, formatDuration } from '../../utils/pricingCalculator';
import { Search, CreditCard, Banknote, Smartphone, Check, AlertCircle, X, ShieldAlert } from 'lucide-react';

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedSpaceId?: string;
  preselectedMovementId?: string;
}

export const ExitModal: React.FC<ExitModalProps> = ({
  isOpen,
  onClose,
  preselectedSpaceId,
  preselectedMovementId
}) => {
  const { movements, spaces, rates, currentEffectiveTime, processExit } = useParking();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovementId, setSelectedMovementId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [amountReceived, setAmountReceived] = useState<number | ''>('');
  const [isLostTicket, setIsLostTicket] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [exitNotes, setExitNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lista de vehículos actualmente adentro
  const activeMovements = useMemo(() => {
    return movements.filter(m => m.status === 'activo');
  }, [movements]);

  // Si viene preseleccionado por celda o movementId
  useEffect(() => {
    if (preselectedMovementId) {
      setSelectedMovementId(preselectedMovementId);
      const m = movements.find(x => x.id === preselectedMovementId);
      if (m) setSearchQuery(m.plate);
    } else if (preselectedSpaceId) {
      const space = spaces.find(s => s.id === preselectedSpaceId);
      if (space && space.currentMovementId) {
        setSelectedMovementId(space.currentMovementId);
        if (space.currentVehiclePlate) setSearchQuery(space.currentVehiclePlate);
      }
    } else if (activeMovements.length > 0 && !selectedMovementId) {
      setSelectedMovementId(activeMovements[0].id);
      setSearchQuery(activeMovements[0].plate);
    }
  }, [preselectedMovementId, preselectedSpaceId, spaces, activeMovements]);

  // Movimiento activo seleccionado
  const selectedMovement = useMemo(() => {
    return activeMovements.find(m => m.id === selectedMovementId);
  }, [activeMovements, selectedMovementId]);

  // Tarifa y desglose de cobro en tiempo real
  const feeBreakdown = useMemo(() => {
    if (!selectedMovement) return null;
    const rate = rates.find(r => r.vehicleType === selectedMovement.vehicleType) || rates[0];
    const entryDate = new Date(selectedMovement.entryTime);
    return calculateParkingFee(entryDate, currentEffectiveTime, rate, {
      isLostTicket,
      discountPercent
    });
  }, [selectedMovement, currentEffectiveTime, rates, isLostTicket, discountPercent]);

  // Si cambia el total, sugerir billete redondeado en efectivo si no está seteado
  useEffect(() => {
    if (feeBreakdown) {
      const tot = feeBreakdown.total;
      if (paymentMethod === 'efectivo') {
        if (tot === 0) {
          setAmountReceived(0);
        } else if (amountReceived === '' || typeof amountReceived === 'number') {
          // Si el monto ingresado es menor al total, sugerimos el valor exacto
          if (typeof amountReceived === 'number' && amountReceived < tot) {
            // sugerir múltiplos de 5.000 o 10.000
            const rounded = Math.ceil(tot / 5000) * 5000;
            setAmountReceived(rounded);
          }
        }
      }
    }
  }, [feeBreakdown?.total, paymentMethod]);

  if (!isOpen) return null;

  // Filtrar sugerencias de placa
  const filteredSuggestions = searchQuery.trim()
    ? activeMovements.filter(
        m =>
          m.plate.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          m.spaceCode.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          m.ticketNumber.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : activeMovements;

  const handleSelectMovement = (m: Movement) => {
    setSelectedMovementId(m.id);
    setSearchQuery(m.plate);
    setErrorMessage(null);
  };

  const handleConfirmExit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedMovement) {
      setErrorMessage('Por favor selecciona un vehículo activo para liquidar.');
      return;
    }

    if (!feeBreakdown) return;

    if (paymentMethod === 'efectivo') {
      const rec = typeof amountReceived === 'number' ? amountReceived : 0;
      if (rec < feeBreakdown.total) {
        setErrorMessage(`El monto recibido (${formatCOP(rec)}) es menor al total de la liquidación (${formatCOP(feeBreakdown.total)}).`);
        return;
      }
    }

    const res = processExit({
      movementId: selectedMovement.id,
      paymentMethod,
      amountReceived: paymentMethod === 'efectivo' ? Number(amountReceived) : feeBreakdown.total,
      isLostTicket,
      discountPercent,
      exitNotes: exitNotes.trim() || undefined
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Error al procesar la salida');
    }
  };

  const changeDue = feeBreakdown && typeof amountReceived === 'number' && amountReceived >= feeBreakdown.total
    ? amountReceived - feeBreakdown.total
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Registro de Salida y Cobro
            </h2>
            <p className="text-xs text-slate-500">
              Cálculo automático de permanencia, cobro y liberación de celda
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Buscador de Placas Activas */}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Buscar Vehículo por Placa o Celda
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              placeholder="Escribe la placa (Ej: KEO, NXL) o celda..."
              className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
              autoFocus
            />
          </div>

          {/* Sugerencias en vivo */}
          {activeMovements.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
              {filteredSuggestions.map(m => {
                const isSelected = m.id === selectedMovementId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMovement(m)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-mono flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white font-bold shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span>{m.plate}</span>
                    <span className="text-[10px] text-slate-400">({m.spaceCode})</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded-lg">
              No hay vehículos activos en el parqueadero actualmente.
            </p>
          )}
        </div>

        {selectedMovement && feeBreakdown && (
          <form onSubmit={handleConfirmExit} className="mt-5 space-y-4">
            {/* Resumen del Vehículo y Tiempo */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    Placa y Celda
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-lg font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                      {selectedMovement.plate}
                    </span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Celda {selectedMovement.spaceCode}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    Ticket #
                  </span>
                  <p className="font-mono text-xs text-slate-700 font-bold">
                    {selectedMovement.ticketNumber}
                  </p>
                </div>
              </div>

              {/* Tiempos */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 block">Hora Entrada:</span>
                  <span className="font-mono text-slate-800 font-medium">
                    {new Date(selectedMovement.entryTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Hora Salida:</span>
                  <span className="font-mono text-slate-800 font-medium">
                    {currentEffectiveTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Tiempo Total:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatDuration(feeBreakdown.totalMinutes)}
                  </span>
                </div>
              </div>

              {/* Cascos u observaciones si existen */}
              {selectedMovement.helmetsCount ? (
                <p className="text-xs text-slate-600">
                  🏍️ Cascos custodiados a devolver: <span className="font-bold">{selectedMovement.helmetsCount}</span>
                </p>
              ) : null}

              {selectedMovement.entryNotes && (
                <p className="text-xs text-slate-500 italic">
                  Nota entrada: {selectedMovement.entryNotes}
                </p>
              )}
            </div>

            {/* Opciones Especiales (Ticket Perdido / Descuento) */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLostTicket}
                  onChange={(e) => setIsLostTicket(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span className="text-slate-700 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Ticket Extraviado (+ Multa)
                </span>
              </label>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Descuento Convenio:</span>
                <select
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                >
                  <option value={0}>0%</option>
                  <option value={10}>10%</option>
                  <option value={20}>20%</option>
                  <option value={50}>50%</option>
                  <option value={100}>100% (Cortesía)</option>
                </select>
              </div>
            </div>

            {/* Desglose Matemático de la Tarifa */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-600">
                <span>Cálculo Tarifario:</span>
                <span className="font-mono text-slate-700">{feeBreakdown.explanation}</span>
              </div>
              {feeBreakdown.discount > 0 && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Descuento Aplicado:</span>
                  <span className="font-mono font-medium">-{formatCOP(feeBreakdown.discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-blue-200 text-sm font-bold text-slate-900">
                <span>Total a Cobrar:</span>
                <span className="font-mono text-lg text-blue-700">
                  {formatCOP(feeBreakdown.total)}
                </span>
              </div>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Método de Pago
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium transition-all ${
                    paymentMethod === 'efectivo'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Efectivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('nequi')}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium transition-all ${
                    paymentMethod === 'nequi'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Nequi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('daviplata')}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium transition-all ${
                    paymentMethod === 'daviplata'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Daviplata</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('tarjeta')}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium transition-all ${
                    paymentMethod === 'tarjeta'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Tarjeta</span>
                </button>
              </div>
            </div>

            {/* Cálculo de Dinero Recibido y Vueltas (si es Efectivo) */}
            {paymentMethod === 'efectivo' && feeBreakdown.total > 0 && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Efectivo Recibido ($ COP)
                  </label>
                  <input
                    type="number"
                    step={100}
                    min={feeBreakdown.total}
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Monto entregado"
                    className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Cambio / Vueltas
                  </label>
                  <div className="px-3 py-1.5 text-sm font-mono font-extrabold bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
                    {formatCOP(changeDue)}
                  </div>
                </div>
              </div>
            )}

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
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-colors"
              >
                Confirmar Cobro y Liberar Celda
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
