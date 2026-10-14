import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { Database, Server, CheckCircle2, AlertTriangle, RefreshCw, X, Shield, Cpu, HardDrive } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

interface XamppStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XamppStatusModal: React.FC<XamppStatusModalProps> = ({ isOpen, onClose }) => {
  const {
    connectionStatus,
    healthData,
    isBackendSyncing,
    checkBackendConnection,
    reseedDatabase
  } = useParking();

  const [isReseeding, setIsReseeding] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheck = async () => {
    setFeedbackMsg(null);
    const ok = await checkBackendConnection();
    if (ok) {
      setFeedbackMsg('¡Conexión exitosa con Apache PHP y MySQL!');
    } else {
      setFeedbackMsg('No se pudo conectar con XAMPP. Verifique que Apache y MySQL estén iniciados.');
    }
  };

  const handleReseed = async () => {
    if (!window.confirm('¿Desea restaurar la base de datos MySQL con los datos iniciales de fábrica?')) {
      return;
    }
    setIsReseeding(true);
    setFeedbackMsg(null);
    const ok = await reseedDatabase();
    setIsReseeding(false);
    if (ok) {
      setFeedbackMsg('¡Base de datos parkflow_db reinicializada y poblada con éxito!');
    } else {
      setFeedbackMsg('Error al reinicializar la base de datos en XAMPP.');
    }
  };

  const isConnected = connectionStatus === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Estado del Servidor XAMPP</h3>
              <p className="text-xs text-slate-500">Backend PHP & Base de Datos MySQL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            isConnected
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-sm">
              <p className="font-bold">
                {isConnected ? 'Conectado a MySQL en XAMPP' : 'XAMPP Desconectado o Modo Local'}
              </p>
              <p className="text-xs mt-0.5 opacity-90">
                {isConnected
                  ? 'ParkFlow está leyendo y guardando todos los datos directamente en la base de datos MySQL `parkflow_db`.'
                  : 'No se detecta conexión con el servidor Apache/MySQL. Los datos se almacenan temporalmente en la memoria local.'}
              </p>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Server className="w-3.5 h-3.5 text-blue-600" />
                <span>Servidor Apache</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {isConnected ? 'Online (Puerto 80)' : 'Verificar en XAMPP'}
              </p>
              <p className="text-[11px] text-slate-500 truncate" title={API_BASE_URL}>
                {API_BASE_URL}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                <span>Base de Datos</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {isConnected ? 'MySQL / MariaDB' : 'Offline'}
              </p>
              <p className="text-[11px] text-slate-500">
                {isConnected ? `BD: ${healthData?.database?.name || 'parkflow_db'} (3306)` : 'Puerto 3306'}
              </p>
            </div>
          </div>

          {/* Details / Tables count if connected */}
          {isConnected && healthData?.database?.counts && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <p className="font-semibold text-slate-700 mb-2">Registros actuales en MySQL:</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="block font-bold text-slate-900 text-sm">{healthData.database.counts.spaces || 0}</span>
                  <span className="text-[10px] text-slate-500">Celdas</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="block font-bold text-blue-600 text-sm">{healthData.database.counts.activeMovements || 0}</span>
                  <span className="text-[10px] text-slate-500">Activos</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="block font-bold text-slate-900 text-sm">{healthData.database.counts.users || 0}</span>
                  <span className="text-[10px] text-slate-500">Usuarios</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="block font-bold text-slate-900 text-sm">{healthData.database.counts.rates || 0}</span>
                  <span className="text-[10px] text-slate-500">Tarifas</span>
                </div>
              </div>
            </div>
          )}

          {/* Feedback message */}
          {feedbackMsg && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-medium text-center">
              {feedbackMsg}
            </div>
          )}

          {/* Instructions if offline */}
          {!isConnected && (
            <div className="bg-slate-100/70 p-3.5 rounded-xl text-xs text-slate-700 space-y-1.5">
              <p className="font-semibold text-slate-900">¿Cómo conectar XAMPP?</p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                <li>Abra el panel <strong>XAMPP Control Panel</strong>.</li>
                <li>Haga clic en <strong>Start</strong> en <strong>Apache</strong> y <strong>MySQL</strong>.</li>
                <li>Presione el botón "Verificar Conexión" a continuación.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={handleReseed}
            disabled={isReseeding || isBackendSyncing || !isConnected}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            title="Restaura la estructura y los registros de prueba en MySQL"
          >
            {isReseeding ? 'Inicializando...' : 'Reinicializar BD MySQL'}
          </button>

          <button
            onClick={handleCheck}
            disabled={isBackendSyncing}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBackendSyncing ? 'animate-spin' : ''}`} />
            <span>Verificar Conexión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
