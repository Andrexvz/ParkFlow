import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { LogOut, Plus, ShieldCheck, UserCheck, RefreshCw, Volume2, VolumeX, Menu, X, Database } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { XamppStatusModal } from './XamppStatusModal';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenEntryModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenEntryModal }) => {
  const { currentUser, logout, users, switchUser, stats, connectionStatus } = useParking();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showXamppModal, setShowXamppModal] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEffects.getIsMuted());

  const handleToggleSound = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  const navItems = currentUser?.role === 'ADMIN'
    ? [
        { id: 'admin-dashboard', label: 'Dashboard' },
        { id: 'operator-grid', label: 'Mapa en Vivo' },
        { id: 'admin-spaces', label: 'Celdas' },
        { id: 'admin-rates', label: 'Tarifas' },
        { id: 'admin-users', label: 'Usuarios' },
        { id: 'admin-history', label: 'Historial' }
      ]
    : [
        { id: 'operator-grid', label: 'Mapa de Celdas' },
        { id: 'operator-active', label: 'Vehículos Activos' },
        { id: 'admin-history', label: 'Historial del Turno' }
      ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand title & quick indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(currentUser?.role === 'ADMIN' ? 'admin-dashboard' : 'operator-grid')}
              className="text-xl font-extrabold tracking-tight text-slate-900 hover:text-blue-600 transition-colors focus:outline-none"
            >
              ParkFlow
            </button>

            {/* Quick live indicator */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 pl-3 border-l border-slate-200">
              <span className="font-medium text-slate-800">{stats.occupiedSpaces}/{stats.totalSpaces} celdas</span>
              <span className="text-slate-300">·</span>
              <span className={`font-semibold ${stats.occupancyRate > 85 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {stats.occupancyRate}% ocupado
              </span>
            </div>

            {/* XAMPP MySQL Status Badge */}
            <button
              onClick={() => setShowXamppModal(true)}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-xs'
                  : connectionStatus === 'checking'
                  ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
              title="Clic para ver detalles de la conexión con XAMPP y MySQL"
            >
              <Database className={`w-3.5 h-3.5 ${connectionStatus === 'connected' ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span>
                {connectionStatus === 'connected' && 'MySQL Conectado'}
                {connectionStatus === 'checking' && 'Verificando XAMPP...'}
                {connectionStatus === 'offline' && 'Modo Local (XAMPP Off)'}
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio toggle button */}
            <button
              onClick={handleToggleSound}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title={isMuted ? 'Activar efectos de sonido' : 'Silenciar sonido'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Primary CTA button */}
            <button
              onClick={onOpenEntryModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Registrar Entrada</span>
            </button>

            {/* User profile and switcher dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-md bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser?.name.charAt(0)}
                </div>
                <div className="hidden xl:block pr-1 leading-tight">
                  <p className="text-xs font-semibold text-slate-900 truncate max-w-[110px]">{currentUser?.name}</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{currentUser?.role}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">Conectado como</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500">{currentUser?.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">
                      {currentUser?.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      <span>{currentUser?.role === 'ADMIN' ? 'Administrador' : 'Operador'}</span>
                    </div>
                  </div>

                  <div className="px-2 py-1.5">
                    <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Cambiar de Usuario (Simulación)
                    </p>
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          u.id === currentUser?.id ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{u.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal capitalize">
                          {u.role.toLowerCase()}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1 px-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowXamppModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Database className="w-3.5 h-3.5 text-blue-600" />
                      <span>Configuración XAMPP MySQL</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowXamppModal(true);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Estado XAMPP MySQL ({connectionStatus === 'connected' ? 'En Línea' : 'Offline'})</span>
            </button>
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Modal de Estado de XAMPP */}
      <XamppStatusModal
        isOpen={showXamppModal}
        onClose={() => setShowXamppModal(false)}
      />
    </>
  );
};
