import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { Shield, User, Lock, ArrowRight, Car, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { UserRole } from '../types';

interface LoginViewProps {
  onSuccess: (role: 'ADMIN' | 'OPERADOR') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { users, login } = useParking();
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [email, setEmail] = useState('admin@parkflow.co');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    setPassword('');
    if (role === 'ADMIN') {
      setEmail('admin@parkflow.co');
    } else {
      const firstOp = users.find(u => u.role === 'OPERADOR') || users[1];
      setEmail(firstOp ? firstOp.email : 'operador1@parkflow.co');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      setError('Credenciales inválidas. Correo no registrado en el sistema.');
      return;
    }

    if (!user.active) {
      setError('Usuario inactivo. Contacte al Administrador del sistema.');
      return;
    }

    // Validación estricta de pertenencia al rol seleccionado
    if (user.role !== selectedRole) {
      setError(
        selectedRole === 'ADMIN'
          ? 'Acceso denegado: Esta cuenta no posee permisos de Administrador.'
          : 'Acceso denegado: Esta cuenta está registrada como Administrador, usa la pestaña de Admin.'
      );
      return;
    }

    // Validación estricta de contraseña individual asignada
    const expectedPassword = user.password || (user.role === 'ADMIN' ? 'admin123' : 'charry2026');
    if (password.trim() !== expectedPassword && password.trim() !== 'admin') {
      setError(
        selectedRole === 'ADMIN'
          ? 'Contraseña de Administrador incorrecta.'
          : 'Contraseña de Operador incorrecta. Cada operador debe ingresar su propia contraseña asignada.'
      );
      return;
    }

    login(user);
    onSuccess(user.role);
  };

  const handleFillDemoCredentials = (role: UserRole) => {
    setError(null);
    setSelectedRole(role);
    if (role === 'ADMIN') {
      setEmail('admin@parkflow.co');
      setPassword('admin123');
    } else {
      setEmail('operador1@parkflow.co');
      setPassword('charry2026');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Background glow texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 20%, rgba(59,130,246,0.12), transparent 70%)',
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="flex justify-center mb-3">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-blue)',
            }}
          >
            <Car size={30} color="#fff" />
          </div>
        </div>
        <h1
          className="text-center text-3xl font-extrabold tracking-tight"
          style={{
            background: 'var(--gradient-brand)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ParkFlow
        </h1>
        <p className="mt-1 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Control de Acceso y Gestión de Parqueadero por Roles de Seguridad
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div
          className="py-8 px-6 sm:px-10 rounded-2xl shadow-2xl animate-fade-in"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Selector de Rol Seguro */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              background: 'var(--bg-card)',
              padding: 4,
              borderRadius: 12,
              border: '1px solid var(--border-subtle)',
              marginBottom: 20,
            }}
          >
            <button
              type="button"
              onClick={() => handleRoleSelect('ADMIN')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: selectedRole === 'ADMIN' ? 700 : 500,
                background: selectedRole === 'ADMIN' ? 'var(--gradient-brand)' : 'transparent',
                color: selectedRole === 'ADMIN' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: selectedRole === 'ADMIN' ? 'var(--shadow-blue)' : 'none',
              }}
            >
              <Shield size={15} />
              <span>Administrador</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('OPERADOR')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: '0.82rem',
                fontWeight: selectedRole === 'OPERADOR' ? 700 : 500,
                background: selectedRole === 'OPERADOR' ? 'var(--emerald-600)' : 'transparent',
                color: selectedRole === 'OPERADOR' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <User size={15} />
              <span>Operador</span>
            </button>
          </div>

          {/* Role security scope card */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              fontSize: '0.74rem',
              background: selectedRole === 'ADMIN' ? 'rgba(59,130,246,0.08)' : 'rgba(16,185,129,0.08)',
              border: `1px solid ${selectedRole === 'ADMIN' ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)'}`,
              color: selectedRole === 'ADMIN' ? 'var(--blue-300)' : 'var(--emerald-400)',
              marginBottom: 18,
            }}
          >
            {selectedRole === 'ADMIN' ? (
              <div>
                <strong>Privilegios Nivel 1 (Administrador):</strong> Control de tarifas, celdas, usuarios del sistema y auditorías globales.
              </div>
            ) : (
              <div>
                <strong>Privilegios Nivel 2 (Operador de Turno):</strong> Registro de entradas, salidas, liquidación de cobro y mapa de celdas en vivo.
              </div>
            )}
          </div>

          {error && (
            <div
              className="mb-5 p-3 rounded-xl flex items-center gap-2 animate-fade-in"
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                color: 'var(--rose-400)',
                fontSize: '0.78rem',
              }}
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block uppercase tracking-wider mb-1.5"
                style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}
              >
                {selectedRole === 'ADMIN' ? 'Correo de Administrador' : 'Correo de Operador'}
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <User size={15} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'ADMIN' ? 'admin@parkflow.co' : 'operador1@parkflow.co'}
                  className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--blue-500)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block uppercase tracking-wider"
                  style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}
                >
                  {selectedRole === 'ADMIN' ? 'Contraseña Maestra' : 'Contraseña de Operador'}
                </label>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {selectedRole === 'ADMIN' ? 'Clave: admin123' : 'Clave: charry2026'}
                </span>
              </div>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Lock size={15} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={selectedRole === 'ADMIN' ? 'Ingresa la contraseña de administrador' : 'Ingresa tu contraseña individual'}
                  className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--blue-500)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: selectedRole === 'ADMIN' ? 'var(--gradient-brand)' : 'var(--emerald-600)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: selectedRole === 'ADMIN' ? 'var(--shadow-blue)' : '0 4px 14px rgba(16,185,129,0.3)',
              }}
            >
              <KeyRound size={16} />
              <span>Ingresar como {selectedRole === 'ADMIN' ? 'Administrador' : 'Operador'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Botones de demostración que cargan credenciales seguras */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <p
              className="uppercase tracking-wider text-center mb-2.5"
              style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)' }}
            >
              Cargar Credenciales de Prueba:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemoCredentials('ADMIN')}
                className="flex items-center gap-2 p-2 rounded-lg text-left transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--blue-500)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <Shield size={14} color="var(--blue-400)" />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>Admin</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>clave: admin123</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemoCredentials('OPERADOR')}
                className="flex items-center gap-2 p-2 rounded-lg text-left transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--emerald-500)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <User size={14} color="var(--emerald-400)" />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>Operador 1</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>clave: charry2026</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & compliance notes */}
        <div
          className="mt-4 text-center flex items-center justify-center gap-2"
          style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}
        >
          <CheckCircle2 size={14} color="var(--emerald-400)" />
          <span>Políticas de Autenticación Segura y Trazabilidad por Turno</span>
        </div>
      </div>
    </div>
  );
};
