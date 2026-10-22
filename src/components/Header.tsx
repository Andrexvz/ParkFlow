import React, { useState } from 'react';
import { useParking } from '../context/ParkingContext';
import { LogOut, Plus, ShieldCheck, UserCheck, Volume2, VolumeX, Menu, X, Database, Car } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { XamppStatusModal } from './XamppStatusModal';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenEntryModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenEntryModal }) => {
  const { currentUser, logout, stats, connectionStatus } = useParking();
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
        { id: 'operator-active', label: 'Vehículos Activos' }
      ];

  return (
    <>
      <header style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Zone 1: Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(currentUser?.role === 'ADMIN' ? 'admin-dashboard' : 'operator-grid')}
              className="flex items-center gap-2 focus:outline-none"
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                width: 32, height: 32,
                background: 'var(--gradient-brand)',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-blue)',
              }}>
                <Car size={18} color="#fff" />
              </div>
              <span style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                background: 'var(--gradient-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}>
                ParkFlow
              </span>
            </button>

            {/* Live stats pill */}
            <div className="hidden lg:flex items-center gap-2 pl-3" style={{ borderLeft: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {stats.occupiedSpaces}/{stats.totalSpaces}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>celdas</span>
              <span style={{ color: 'var(--border-default)' }}>·</span>
              <span style={{
                fontSize: '0.78rem', fontWeight: 700,
                color: stats.occupancyRate > 85 ? 'var(--rose-400)' : 'var(--emerald-400)'
              }}>
                {stats.occupancyRate}% ocupado
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  style={{
                    padding: '6px 13px',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 600 : 500,
                    borderRadius: 8,
                    background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: isActive ? 'var(--blue-400)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sound toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-lg transition-all"
              style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Primary CTA */}
            <button
              onClick={onOpenEntryModal}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Registrar Entrada</span>
              <span className="sm:hidden">Entrada</span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl transition-all"
                style={{
                  padding: '5px 10px 5px 6px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div style={{
                  width: 28, height: 28,
                  borderRadius: 8,
                  background: 'var(--gradient-brand)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800, color: '#fff',
                }}>
                  {currentUser?.name.charAt(0)}
                </div>
                <div className="hidden xl:block leading-tight text-left">
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser?.name}
                  </p>
                  <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {currentUser?.role}
                  </p>
                </div>
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 animate-slide-top"
                  style={{
                    width: 260,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 16,
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 50,
                    overflow: 'hidden',
                  }}
                >
                  {/* User info */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Conectado como
                    </p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {currentUser?.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 1 }}>
                      {currentUser?.email}
                    </p>
                    <span className="badge badge-blue" style={{ marginTop: 6, display: 'inline-flex' }}>
                      {currentUser?.role === 'ADMIN'
                        ? <><ShieldCheck size={11} /> Administrador</>
                        : <><UserCheck size={11} /> Operador</>}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '8px' }}>
                    <button
                      onClick={() => { setShowUserMenu(false); setShowXamppModal(true); }}
                      className="w-full flex items-center gap-2 rounded-lg transition-all"
                      style={{ padding: '9px 12px', fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Database size={15} color="var(--blue-400)" />
                      <span>Configuración XAMPP MySQL</span>
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); logout(); }}
                      className="w-full flex items-center gap-2 rounded-lg transition-all"
                      style={{ padding: '9px 12px', fontSize: '0.82rem', color: 'var(--rose-400)', background: 'transparent', border: 'none', cursor: 'pointer', marginTop: 4, textAlign: 'left' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.1)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut size={15} />
                      <span style={{ fontWeight: 600 }}>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div
            className="md:hidden animate-fade-in"
            style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: '8px 12px 12px' }}
          >
            <button
              onClick={() => { setMobileMenuOpen(false); setShowXamppModal(true); }}
              className="w-full flex items-center gap-2 rounded-lg mb-2"
              style={{
                padding: '9px 12px',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: connectionStatus === 'connected' ? 'rgba(16,185,129,0.1)' : 'rgba(74,83,112,0.1)',
                color: connectionStatus === 'connected' ? 'var(--emerald-400)' : 'var(--text-muted)',
                border: `1px solid ${connectionStatus === 'connected' ? 'rgba(16,185,129,0.25)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
              }}
            >
              <Database size={15} />
              <span>Estado XAMPP MySQL ({connectionStatus === 'connected' ? 'En Línea' : 'Offline'})</span>
            </button>
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                  className="w-full text-left rounded-lg mb-1"
                  style={{
                    padding: '9px 12px',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 400,
                    background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: isActive ? 'var(--blue-400)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'block',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      <XamppStatusModal
        isOpen={showXamppModal}
        onClose={() => setShowXamppModal(false)}
      />
    </>
  );
};
