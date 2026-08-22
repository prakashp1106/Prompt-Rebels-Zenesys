/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from './hooks/useStore';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './pages/Dashboard';
import { Documents } from './pages/Documents';
import { Investigation } from './pages/Investigation';
import { RecurringIssues } from './pages/RecurringIssues';
import { Login } from './pages/Login';
import { ErpExportModal } from './components/investigation/ErpExportModal';

export default function App() {
  const [state] = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'documents' | 'investigation' | 'recurring'>(
    'investigation' // Default to Hero Screen for the judge presentation
  );
  const [erpModalOpen, setErpModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-400 selection:text-slate-950">
      {/* 3-Zone Contract Header */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenErpModal={() => setErpModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-16">
        {currentTab === 'dashboard' && (
          <Dashboard
            onNavigateToInvestigation={() => setCurrentTab('investigation')}
            onNavigateToDocuments={() => setCurrentTab('documents')}
            onNavigateToRecurring={() => setCurrentTab('recurring')}
          />
        )}

        {currentTab === 'documents' && (
          <Documents onNavigateToInvestigation={() => setCurrentTab('investigation')} />
        )}

        {currentTab === 'investigation' && <Investigation />}

        {currentTab === 'recurring' && (
          <RecurringIssues onNavigateToInvestigation={() => setCurrentTab('investigation')} />
        )}
      </main>

      {/* Global ERP Export Modal */}
      {state.transactions[0] && (
        <ErpExportModal
          isOpen={erpModalOpen}
          onClose={() => setErpModalOpen(false)}
          transaction={state.transactions[0]}
        />
      )}
    </div>
  );
}
