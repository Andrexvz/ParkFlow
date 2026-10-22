/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ParkingProvider, useParking } from './context/ParkingContext';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { TimeSimulatorBanner } from './components/TimeSimulatorBanner';
import { ParkingGrid } from './components/operator/ParkingGrid';
import { ActiveVehiclesList } from './components/operator/ActiveVehiclesList';
import { EntryModal } from './components/operator/EntryModal';
import { ExitModal } from './components/operator/ExitModal';
import { TicketModal } from './components/operator/TicketModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SpacesManagement } from './components/admin/SpacesManagement';
import { RatesManagement } from './components/admin/RatesManagement';
import { UsersManagement } from './components/admin/UsersManagement';
import { HistoryAudit } from './components/admin/HistoryAudit';

function MainApp() {
  const { currentUser } = useParking();

  // Vista activa por defecto según rol
  const [currentView, setCurrentView] = useState<string>(() => {
    return currentUser?.role === 'ADMIN' ? 'admin-dashboard' : 'operator-grid';
  });

  // Modales
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryPreselectedSpaceId, setEntryPreselectedSpaceId] = useState<string | undefined>(undefined);

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitPreselectedSpaceId, setExitPreselectedSpaceId] = useState<string | undefined>(undefined);
  const [exitPreselectedMovementId, setExitPreselectedMovementId] = useState<string | undefined>(undefined);

  // Listas de vistas permitidas por rol
  const OPERATOR_ALLOWED_VIEWS = ['operator-grid', 'operator-active'];

  // Validación estricta y segura de navegación
  const handleNavigate = (targetView: string) => {
    if (currentUser?.role === 'OPERADOR' && !OPERATOR_ALLOWED_VIEWS.includes(targetView)) {
      // Bloqueo de seguridad: operador no puede saltar a vistas admin
      return;
    }
    setCurrentView(targetView);
  };

  // Sincronizar vista si cambia el rol de usuario o si intenta acceder a una ruta no autorizada
  useEffect(() => {
    if (currentUser?.role === 'OPERADOR' && !OPERATOR_ALLOWED_VIEWS.includes(currentView)) {
      setCurrentView('operator-grid');
    }
  }, [currentUser?.role, currentView]);

  // Si no está autenticado, mostrar Login
  if (!currentUser) {
    return (
      <LoginView
        onSuccess={(role) => {
          setCurrentView(role === 'ADMIN' ? 'admin-dashboard' : 'operator-grid');
        }}
      />
    );
  }

  // Handlers para abrir modales desde celdas o tablas
  const handleOpenEntryFromSpace = (spaceId: string) => {
    setEntryPreselectedSpaceId(spaceId);
    setIsEntryModalOpen(true);
  };

  const handleOpenExitFromSpace = (spaceId: string) => {
    setExitPreselectedSpaceId(spaceId);
    setExitPreselectedMovementId(undefined);
    setIsExitModalOpen(true);
  };

  const handleOpenExitFromMovement = (movementId: string) => {
    setExitPreselectedMovementId(movementId);
    setExitPreselectedSpaceId(undefined);
    setIsExitModalOpen(true);
  };

  const handleOpenQuickEntry = () => {
    setEntryPreselectedSpaceId(undefined);
    setIsEntryModalOpen(true);
  };

  // Verificación de acceso para la vista activa
  const isOperatorTryingAdminView = currentUser.role === 'OPERADOR' && !OPERATOR_ALLOWED_VIEWS.includes(currentView);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Banner de tiempo y control de pruebas de tarifas */}
      <TimeSimulatorBanner />

      {/* Barra de navegación superior con control de permisos */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenEntryModal={handleOpenQuickEntry}
      />

      {/* Contenido Principal con Guardia de Seguridad */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {isOperatorTryingAdminView ? (
          <div
            className="flex flex-col items-center justify-center text-center p-10 rounded-2xl animate-fade-in"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              boxShadow: 'var(--shadow-lg)',
              marginTop: 32,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                border: '1px solid rgba(244, 63, 94, 0.25)',
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>🔒</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--rose-400)', marginBottom: 8 }}>
              Acceso Restringido por Rol de Seguridad
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 520, fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 20 }}>
              Tu cuenta actual tiene el rol de <strong style={{ color: 'var(--emerald-400)' }}>OPERADOR</strong>.
              Este módulo está reservado exclusivamente para personal con rol de <strong style={{ color: 'var(--blue-400)' }}>ADMINISTRADOR</strong>.
            </p>
            <button
              onClick={() => setCurrentView('operator-grid')}
              className="btn btn-primary"
              style={{ padding: '10px 22px', fontSize: '0.88rem', cursor: 'pointer' }}
            >
              Volver al Mapa de Celdas
            </button>
          </div>
        ) : (
          <>
            {currentView === 'operator-grid' && (
              <ParkingGrid
                onSelectSpaceForEntry={handleOpenEntryFromSpace}
                onSelectSpaceForExit={handleOpenExitFromSpace}
              />
            )}

            {currentView === 'operator-active' && (
              <ActiveVehiclesList
                onProcessExit={handleOpenExitFromMovement}
              />
            )}

            {currentView === 'admin-dashboard' && (
              <AdminDashboard
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'admin-spaces' && (
              <SpacesManagement />
            )}

            {currentView === 'admin-rates' && (
              <RatesManagement />
            )}

            {currentView === 'admin-users' && (
              <UsersManagement />
            )}

            {currentView === 'admin-history' && (
              <HistoryAudit />
            )}
          </>
        )}
      </main>

      {/* Modales de Operación */}
      <EntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEntryPreselectedSpaceId(undefined);
        }}
        preselectedSpaceId={entryPreselectedSpaceId}
      />

      <ExitModal
        isOpen={isExitModalOpen}
        onClose={() => {
          setIsExitModalOpen(false);
          setExitPreselectedSpaceId(undefined);
          setExitPreselectedMovementId(undefined);
        }}
        preselectedSpaceId={exitPreselectedSpaceId}
        preselectedMovementId={exitPreselectedMovementId}
      />

      {/* Modal global de ticket térmico */}
      <TicketModal />

      {/* Footer corporativo sutil */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} className="py-4 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} ParkFlow S.A.S. · NIT: 900.845.123-1 · Calle 10 # 5-42 Centro, Neiva (Huila)
          </p>
          <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
            <span>Resolución Tarifaria Municipal</span>
            <span>·</span>
            <span>Soporte: (608) 871-4500</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ParkingProvider>
      <MainApp />
    </ParkingProvider>
  );
}
