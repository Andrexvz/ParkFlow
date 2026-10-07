import React, { useState } from 'react';
import { useParking } from '../../context/ParkingContext';
import { User, UserRole } from '../../types';
import { Plus, UserCheck, Shield, Clock, AlertCircle, X, CheckCircle2 } from 'lucide-react';

export const UsersManagement: React.FC = () => {
  const { users, createUser, updateUser, toggleUserActive, currentUser } = useParking();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('OPERADOR');
  const [shift, setShift] = useState<'Mañana (06:00 - 14:00)' | 'Tarde (14:00 - 22:00)' | 'Noche (22:00 - 06:00)'>('Mañana (06:00 - 14:00)');
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim()) {
      setFormError('Nombre y correo son requeridos.');
      return;
    }

    const res = createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      shift,
      active: true
    });

    if (res.success) {
      setName('');
      setEmail('');
      setIsModalOpen(false);
    } else {
      setFormError(res.error || 'Error al crear usuario.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Usuarios y Empleados ({users.length})
          </h2>
          <p className="text-xs text-slate-500">
            Control de acceso basado en roles (RBAC), turnos operativos y estado de activación
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Empleado</span>
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => {
          const isCurrent = currentUser?.id === u.id;

          return (
            <div
              key={u.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all relative flex flex-col justify-between ${
                u.active ? 'border-slate-200' : 'border-slate-200 bg-slate-50/70 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      u.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.2 rounded">
                            (Tú)
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Rol:</span>
                    <span className={`inline-flex items-center gap-1 font-semibold ${
                      u.role === 'ADMIN' ? 'text-blue-700' : 'text-emerald-700'
                    }`}>
                      {u.role === 'ADMIN' ? <Shield className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      <span>{u.role === 'ADMIN' ? 'Administrador' : 'Operador'}</span>
                    </span>
                  </div>

                  {u.shift && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Turno:</span>
                      <span className="text-slate-700 font-medium">{u.shift}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Estado de Cuenta:</span>
                    <span className={`font-semibold ${u.active ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {u.active ? 'Activo' : 'Desactivado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => toggleUserActive(u.id)}
                  disabled={isCurrent}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    u.active
                      ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                      : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                  } disabled:opacity-40 disabled:pointer-events-none`}
                >
                  {u.active ? 'Desactivar' : 'Activar Acceso'}
                </button>

                <button
                  onClick={() => {
                    const newRole: UserRole = u.role === 'ADMIN' ? 'OPERADOR' : 'ADMIN';
                    updateUser({ ...u, role: newRole });
                  }}
                  disabled={isCurrent}
                  className="text-slate-600 hover:text-slate-900 text-xs font-medium disabled:opacity-40"
                >
                  Cambiar a {u.role === 'ADMIN' ? 'Operador' : 'Admin'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Crear Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Registrar Nuevo Empleado
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Daniel Gómez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Correo Electrónico (Login)
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@parkflow.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Rol del Sistema
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                >
                  <option value="OPERADOR">Operador de Turno (Registro y Cobro)</option>
                  <option value="ADMIN">Administrador (Acceso Completo)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Turno Asignado
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Mañana (06:00 - 14:00)">Mañana (06:00 - 14:00)</option>
                  <option value="Tarde (14:00 - 22:00)">Tarde (14:00 - 22:00)</option>
                  <option value="Noche (22:00 - 06:00)">Noche (22:00 - 06:00)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                >
                  Crear Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
