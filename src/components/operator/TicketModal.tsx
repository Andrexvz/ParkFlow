import React from 'react';
import { useParking } from '../../context/ParkingContext';
import { Printer, Check, X, QrCode } from 'lucide-react';
import { formatCOP, formatDuration } from '../../utils/pricingCalculator';

export const TicketModal: React.FC = () => {
  const { lastGeneratedTicket, ticketModalType, closeTicketModal } = useParking();

  if (!lastGeneratedTicket || !ticketModalType) return null;

  const m = lastGeneratedTicket;
  const isExit = ticketModalType === 'exit';

  const entryDate = new Date(m.entryTime);
  const exitDate = m.exitTime ? new Date(m.exitTime) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 relative">
        {/* Close button */}
        <button
          onClick={closeTicketModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Action Header */}
        <div className="text-center pb-3 border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <Check className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {isExit ? 'Recibo de Pago y Salida' : 'Ticket de Ingreso Generado'}
          </h3>
          <p className="text-xs text-slate-500">
            {isExit ? 'Pago procesado y celda liberada' : 'Entrega este ticket al conductor'}
          </p>
        </div>

        {/* Simulated 80mm Thermal Receipt Paper */}
        <div id="printable-ticket" className="my-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 font-mono text-[11px] text-slate-800 leading-tight space-y-2">
          {/* Header del Comercio */}
          <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2">
            <p className="font-extrabold text-xs tracking-wider">PARKFLOW S.A.S.</p>
            <p className="text-[10px] text-slate-500">NIT: 900.845.123-1 · Régimen Común</p>
            <p className="text-[10px] text-slate-500">Calle 10 # 5-42 Centro, Neiva - Huila</p>
            <p className="text-[10px] text-slate-500">Tel: (608) 871-4500 · Cel: 315 892 4110</p>
          </div>

          {/* Ticket metadata */}
          <div className="py-1 border-b border-dashed border-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>TICKET #:</span>
              <span className="font-bold">{m.ticketNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>FECHA INGRESO:</span>
              <span>{entryDate.toLocaleDateString('es-CO')} {entryDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {isExit && exitDate && (
              <div className="flex justify-between">
                <span>FECHA SALIDA:</span>
                <span>{exitDate.toLocaleDateString('es-CO')} {exitDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>OPERADOR:</span>
              <span>{isExit && m.operatorExitName ? m.operatorExitName : m.operatorEntryName}</span>
            </div>
          </div>

          {/* Vehículo y Ubicación */}
          <div className="py-1 border-b border-dashed border-slate-300 space-y-1">
            <div className="flex justify-between items-center">
              <span>PLACA:</span>
              <span className="font-extrabold text-sm tracking-wider px-1 bg-white border border-slate-300 rounded">
                {m.plate}
              </span>
            </div>
            <div className="flex justify-between">
              <span>TIPO:</span>
              <span className="uppercase font-semibold">{m.vehicleType}</span>
            </div>
            <div className="flex justify-between">
              <span>CELDA ASIGNADA:</span>
              <span className="font-bold">{m.spaceCode}</span>
            </div>
            {m.helmetsCount ? (
              <div className="flex justify-between text-blue-800">
                <span>CASCOS EN CUSTODIA:</span>
                <span className="font-bold">{m.helmetsCount}</span>
              </div>
            ) : null}
            {m.entryNotes && (
              <div className="text-[10px] text-slate-500 italic">
                Obs: {m.entryNotes}
              </div>
            )}
          </div>

          {/* Liquidación de Salida si corresponde */}
          {isExit && (
            <div className="py-1 border-b border-dashed border-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>PERMANENCIA:</span>
                <span className="font-bold">{formatDuration(m.totalMinutes || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>{formatCOP(m.subtotal || 0)}</span>
              </div>
              {m.discount ? (
                <div className="flex justify-between text-emerald-700">
                  <span>DESCUENTO:</span>
                  <span>-{formatCOP(m.discount)}</span>
                </div>
              ) : null}
              {m.lostTicketCharge ? (
                <div className="flex justify-between text-rose-700">
                  <span>MULTA TICKET PERDIDO:</span>
                  <span>Aplica</span>
                </div>
              ) : null}
              <div className="flex justify-between text-xs font-extrabold pt-1 border-t border-slate-300">
                <span>TOTAL PAGADO:</span>
                <span>{formatCOP(m.totalPaid || 0)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>MEDIO DE PAGO:</span>
                <span className="uppercase font-semibold">{m.paymentMethod}</span>
              </div>
              {m.paymentMethod === 'efectivo' && m.changeGiven !== undefined && (
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>CAMBIO ENTREGADO:</span>
                  <span>{formatCOP(m.changeGiven)}</span>
                </div>
              )}
            </div>
          )}

          {/* Barcode / QR Simulation */}
          <div className="pt-2 flex flex-col items-center justify-center text-center space-y-1">
            {/* Simulated barcode SVG */}
            <div className="w-44 h-8 bg-white border border-slate-200 flex items-center justify-center px-2">
              <div className="flex items-center gap-[2px] h-6 w-full justify-center">
                <span className="w-[2px] h-full bg-black" />
                <span className="w-[1px] h-full bg-black" />
                <span className="w-[3px] h-full bg-black" />
                <span className="w-[1px] h-full bg-black" />
                <span className="w-[2px] h-full bg-black" />
                <span className="w-[4px] h-full bg-black" />
                <span className="w-[1px] h-full bg-black" />
                <span className="w-[2px] h-full bg-black" />
                <span className="w-[3px] h-full bg-black" />
                <span className="w-[2px] h-full bg-black" />
                <span className="w-[1px] h-full bg-black" />
                <span className="w-[3px] h-full bg-black" />
              </div>
            </div>
            <p className="text-[9px] text-slate-400">*{m.ticketNumber}*</p>
          </div>

          {/* Footer Legal */}
          <div className="pt-2 text-center text-[9px] text-slate-400 space-y-0.5 border-t border-dashed border-slate-300">
            <p>Conserve este ticket para retirar su vehículo.</p>
            <p>10 minutos de cortesía tras pago para salir.</p>
            <p>¡Gracias por su visita a Neiva!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Ticket</span>
          </button>
          <button
            onClick={closeTicketModal}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
