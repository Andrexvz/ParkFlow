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

  // Sincronizar vista si cambia el rol de usuario
  useEffect(() => {
    if (currentUser?.role === 'OPERADOR' && currentView.startsWith('admin-')) {
      setCurrentView('operator-grid');
    }
  }, [currentUser, currentView]);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Banner de tiempo y control de pruebas de tarifas */}
      <TimeSimulatorBanner />

      {/* Barra de navegación superior (Top Bar Contract) */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenEntryModal={handleOpenQuickEntry}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
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
            onNavigate={setCurrentView}
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
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} ParkFlow S.A.S. · NIT: 900.845.123-1 · Calle 10 # 5-42 Centro, Neiva (Huila)
          </p>
          <div className="flex items-center gap-3 text-slate-400">
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
