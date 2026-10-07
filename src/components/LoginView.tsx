import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { Shield, User, Lock, ArrowRight, Car, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onSuccess: (role: 'ADMIN' | 'OPERADOR') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { users, login } = useParking();
  const [email, setEmail] = useState('admin@parkflow.co');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      setError('Credenciales inválidas. Correo no encontrado.');
      return;
    }

    if (!user.active) {
      setError('Este usuario se encuentra inactivo. Contacte al administrador.');
      return;
    }

    login(user);
    onSuccess(user.role);
  };

  const handleQuickLogin = (userEmail: string, targetRole?: 'ADMIN' | 'OPERADOR') => {
    const user = users.find(u => u.email === userEmail || (targetRole && u.role === targetRole));
    if (user) {
      setEmail(user.email);
      setPassword('••••••••');
      setError(null);
      login(user);
      onSuccess(user.role);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background visual texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Car className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          ParkFlow
        </h1>
        <p className="mt-1 text-center text-sm text-slate-400">
          Sistema Inteligente de Gestión y Control de Parqueadero
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/80 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@parkflow.co"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
            >
              <span>Iniciar Sesión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Acceso Rápido Demo Presets */}
          <div className="mt-6 pt-6 border-t border-slate-700/80">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              Acceso Rápido para Demostración:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@parkflow.co', 'ADMIN')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-blue-500 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">Administrador</p>
                  <p className="text-[11px] text-slate-400 truncate">Carlos Mendoza</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('operador1@parkflow.co', 'OPERADOR')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-emerald-500 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">Operador de Turno</p>
                  <p className="text-[11px] text-slate-400 truncate">Andrés Charry</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & compliance notes */}
        <div className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Cumplimiento Decreto Tarifario Alcaldía de Neiva</span>
        </div>
      </div>
    </div>
  );
};
