import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'motion/react';
import { Header, UserRole } from './components/Header';
import { Hero } from './components/Hero';
import { IncidentSimulator } from './components/IncidentSimulator';
import { LifecyclePipeline } from './components/LifecyclePipeline';
import { RoleArchitecture } from './components/RoleArchitecture';
import { TelemetryConsole } from './components/TelemetryConsole';
import { AuthCallout } from './components/AuthCallout';
import { Footer, AppView } from './components/Footer';
import { ReportModal } from './components/ReportModal';
import { RoleAccessGate } from './components/RoleAccessGate';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RoleProvider, useRole } from './context/RoleContext';

// 4 Core Application Pages
import { DashboardView } from './components/pages/DashboardView';
import { IncidentListView } from './components/pages/IncidentListView';
import { CreateIncidentView } from './components/pages/CreateIncidentView';
import { TicketDetailView } from './components/pages/TicketDetailView';

// 3 Transverse DevSecOps & AI Pages
import { WikiPostMortemView } from './components/pages/WikiPostMortemView';
import { SupervisionDevSecOpsView } from './components/pages/SupervisionDevSecOpsView';
import { AdminSettingsView } from './components/pages/AdminSettingsView';

// Dedicated Role Pages
import { DevRoleView } from './components/pages/roles/DevRoleView';
import { SecRoleView } from './components/pages/roles/SecRoleView';
import { QARoleView } from './components/pages/roles/QARoleView';
import { AdminRoleView } from './components/pages/roles/AdminRoleView';
import { RoleManagementView } from './components/pages/RoleManagementView';

// Authentication & SSO Entry Page
import { LoginAuthView } from './components/pages/LoginAuthView';

// Personal Profile & Executive Reporting Pages
import { UserProfileView } from './components/pages/UserProfileView';
import { ExecutiveReportingView } from './components/pages/ExecutiveReportingView';

// 8 Dedicated Specialist Role Pages
import { DevAiRefactorView } from './components/pages/roles/DevAiRefactorView';
import { DevPipelineDebuggerView } from './components/pages/roles/DevPipelineDebuggerView';
import { SecThreatIntelligenceView } from './components/pages/roles/SecThreatIntelligenceView';
import { SecComplianceAuditView } from './components/pages/roles/SecComplianceAuditView';
import { QAAiTestGeneratorView } from './components/pages/roles/QAAiTestGeneratorView';
import { QAPerformanceBenchView } from './components/pages/roles/QAPerformanceBenchView';
import { AdminClusterTopologyView } from './components/pages/roles/AdminClusterTopologyView';
import { AdminExecutiveAiBriefView } from './components/pages/roles/AdminExecutiveAiBriefView';
import { ImportProjectView } from './components/pages/ImportProjectView';

import { CheckCircle, Info, Warning, X } from '@phosphor-icons/react';

function AppContent() {
  const { currentRole, selectRole, toast, dismissToast } = useRole();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('#892');
  const [statusMode, setStatusMode] = useState<'nominal' | 'investigating' | 'critical'>('nominal');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Sync hash routing with window location
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'login' || hash === 'auth') setCurrentView('login');
      else if (hash === 'dashboard') setCurrentView('dashboard');
      else if (hash === 'incidents') setCurrentView('incidents');
      else if (hash === 'create-incident') setCurrentView('create-incident');
      else if (hash === 'ticket-detail') setCurrentView('ticket-detail');
      else if (hash === 'wiki') setCurrentView('wiki');
      else if (hash === 'supervision' || hash === 'supervision-page') setCurrentView('supervision');
      else if (hash === 'admin' || hash === 'settings') setCurrentView('admin');
      else if (hash === 'profile' || hash === 'user') setCurrentView('profile');
      else if (hash === 'reporting' || hash === 'analytics') setCurrentView('reporting');
      else if (hash === 'role-dev' || hash === 'dev') setCurrentView('role-dev');
      else if (hash === 'role-sec' || hash === 'sec' || hash === 'secops') setCurrentView('role-sec');
      else if (hash === 'role-qa' || hash === 'qa' || hash === 'testing') setCurrentView('role-qa');
      else if (hash === 'role-admin' || hash === 'sre') setCurrentView('role-admin');
      else if (hash === 'role-management' || hash === 'roles' || hash === 'rbac') setCurrentView('role-management');
      // 8 Dedicated Specialist Role Views
      else if (hash === 'dev-refactor' || hash === 'refactor') setCurrentView('dev-refactor');
      else if (hash === 'dev-pipeline' || hash === 'pipeline-debugger') setCurrentView('dev-pipeline');
      else if (hash === 'sec-threats' || hash === 'threat-intel') setCurrentView('sec-threats');
      else if (hash === 'sec-compliance' || hash === 'compliance') setCurrentView('sec-compliance');
      else if (hash === 'qa-generator' || hash === 'test-generator') setCurrentView('qa-generator');
      else if (hash === 'qa-bench' || hash === 'perf-bench') setCurrentView('qa-bench');
      else if (hash === 'admin-topology' || hash === 'topology') setCurrentView('admin-topology');
      else if (hash === 'admin-brief' || hash === 'executive-brief') setCurrentView('admin-brief');
      else if (hash === 'import-project' || hash === 'import' || hash === 'scan') setCurrentView('import-project');
      else if (hash === 'landing' || hash === '' || hash === 'hero') setCurrentView('landing');
    };

    // Initialize from current hash
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When a user selects a role from header, sync it and route if appropriate
  const handleSelectRole = (role: UserRole) => {
    selectRole(role);
    if (role) {
      navigateTo(`role-${role}` as AppView);
    } else {
      navigateTo('landing');
    }
  };

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#08080a] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Universal Header with View Navigation and Dynamic Role State */}
      <Header
        onOpenReportModal={() => setIsReportModalOpen(true)}
        systemStatus={statusMode}
        currentView={currentView}
        onNavigate={navigateTo}
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
      />

      {/* Main View Transition Stage */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* 1. PORTAIL COMMUN / ACCUEIL GÉNÉRAL                          */}
          {/* ============================================================ */}
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* Hero Section with Interactive WebGL Canvas */}
              <Hero
                statusMode={statusMode}
                setStatusMode={setStatusMode}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />

              {/* Interactive Outage Declaration & Groq AI RCA Simulator */}
              <IncidentSimulator />

              {/* 4-Phase Incident Resolution Lifecycle */}
              <LifecyclePipeline />

              {/* Platform Architecture & Direct Access to Each Role's Page */}
              <RoleArchitecture onNavigate={navigateTo} />

              {/* Live CI/CD, Security Scans & Tests Supervision Console */}
              <TelemetryConsole />

              {/* Role-based SSO Authentication Callout */}
              <AuthCallout />
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* 2. ESPACES DÉDIÉS PAR RÔLE (CHACUN A SA PROPRE PAGE)        */}
          {/* ============================================================ */}
          {currentView === 'role-dev' && (
            <motion.div
              key="role-dev"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['dev', 'admin']}
                targetViewName="Cockpit Développeur Core"
                onNavigate={navigateTo}
              >
                <DevRoleView
                  onNavigateToTicket={(id) => {
                    setSelectedTicketId(id);
                    navigateTo('ticket-detail');
                  }}
                  onNavigateToCreate={() => navigateTo('create-incident')}
                  onNavigateToWiki={() => navigateTo('wiki')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {currentView === 'role-sec' && (
            <motion.div
              key="role-sec"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['sec', 'admin']}
                targetViewName="Cockpit Sécurité & SecOps"
                onNavigate={navigateTo}
              >
                <SecRoleView
                  onNavigateToSupervision={() => navigateTo('supervision')}
                  onNavigateToIncidents={() => navigateTo('incidents')}
                  onNavigateToWiki={() => navigateTo('wiki')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {currentView === 'role-qa' && (
            <motion.div
              key="role-qa"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['qa', 'admin']}
                targetViewName="Cockpit Testeur & QA Lead"
                onNavigate={navigateTo}
              >
                <QARoleView
                  onNavigateToIncidents={() => navigateTo('incidents')}
                  onNavigateToCreate={() => navigateTo('create-incident')}
                  onNavigateToReporting={() => navigateTo('reporting')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {currentView === 'role-admin' && (
            <motion.div
              key="role-admin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['admin']}
                targetViewName="Cockpit Administrateur SRE"
                onNavigate={navigateTo}
              >
                <AdminRoleView
                  onNavigateToDashboard={() => navigateTo('dashboard')}
                  onNavigateToReporting={() => navigateTo('reporting')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {currentView === 'role-management' && (
            <motion.div
              key="role-management"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['admin']}
                targetViewName="Matrice RBAC & Gestion des Rôles"
                onNavigate={navigateTo}
              >
                <RoleManagementView
                  onNavigateToRole={(rId) => {
                    selectRole(rId);
                    navigateTo(`role-${rId}` as AppView);
                  }}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* 3. AUTHENTIFICATION & SSO ENTRY                             */}
          {/* ============================================================ */}
          {currentView === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <LoginAuthView
                onLoginSuccess={(targetView, role) => {
                  selectRole(role);
                  navigateTo(targetView);
                }}
                onBackToHome={() => navigateTo('landing')}
              />
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* 4. CŒUR OPÉRATIONNEL DES INCIDENTS                          */}
          {/* ============================================================ */}
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['dev', 'admin']}
                targetViewName="Tableau de Bord Métriques"
                onNavigate={navigateTo}
              >
                <DashboardView
                  onNavigateToTicket={(id) => {
                    if (id) setSelectedTicketId(id);
                    navigateTo('ticket-detail');
                  }}
                  onNavigateToIncidents={() => navigateTo('incidents')}
                  onNavigateToCreate={() => navigateTo('create-incident')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {currentView === 'incidents' && (
            <motion.div
              key="incidents"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['dev', 'sec', 'qa', 'admin']}
                targetViewName="Annuaire des Incidents"
                onNavigate={navigateTo}
              >
                <IncidentListView
                  onSelectTicket={(id) => {
                    setSelectedTicketId(id);
                    navigateTo('ticket-detail');
                  }}
                  onNavigateToCreate={() => navigateTo('create-incident')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {currentView === 'create-incident' && (
            <motion.div
              key="create-incident"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['dev', 'qa', 'admin']}
                targetViewName="Déclaration d'Incident"
                onNavigate={navigateTo}
              >
                <CreateIncidentView
                  onIncidentCreated={(newId) => {
                    setSelectedTicketId(newId);
                    navigateTo('ticket-detail');
                  }}
                  onCancel={() => navigateTo('incidents')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {currentView === 'ticket-detail' && (
            <motion.div
              key="ticket-detail"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['dev', 'sec', 'qa', 'admin']}
                targetViewName="War Room Ticket"
                onNavigate={navigateTo}
              >
                <TicketDetailView
                  ticketId={selectedTicketId}
                  onBackToList={() => navigateTo('incidents')}
                  onNavigateToDashboard={() => navigateTo('dashboard')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* 5. PAGES TRANSVERSES DEVSECOPS, IA & ADMIN                 */}
          {/* ============================================================ */}
          {currentView === 'wiki' && (
            <motion.div
              key="wiki"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['dev', 'sec', 'admin']}
                targetViewName="Wiki Post-Mortem"
                onNavigate={navigateTo}
              >
                <WikiPostMortemView
                  onNavigateToTicket={(id) => {
                    setSelectedTicketId(id);
                    navigateTo('ticket-detail');
                  }}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {currentView === 'supervision' && (
            <motion.div
              key="supervision"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['sec', 'qa', 'admin']}
                targetViewName="Supervision CI/CD & CVE"
                onNavigate={navigateTo}
              >
                <SupervisionDevSecOpsView />
              </RoleAccessGate>
            </motion.div>
          )}

          {currentView === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['admin', 'sec']}
                targetViewName="Administration Système"
                onNavigate={navigateTo}
              >
                <AdminSettingsView />
              </RoleAccessGate>
            </motion.div>
          )}

          {currentView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['dev', 'sec', 'qa', 'admin']}
                targetViewName="Profil Utilisateur"
                onNavigate={navigateTo}
              >
                <UserProfileView
                  onBackToDashboard={() => navigateTo('dashboard')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {currentView === 'reporting' && (
            <motion.div
              key="reporting"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['qa', 'admin']}
                targetViewName="Rapports Exécutifs Comex"
                onNavigate={navigateTo}
              >
                <ExecutiveReportingView
                  onBackToDashboard={() => navigateTo('dashboard')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* 6. PAGES SPÉCIALISÉES PAR RÔLE (8 NOUVELLES PAGES DÉDIÉES)  */}
          {/* ============================================================ */}

          {/* Développeur 1 : Optimiseur de Code & Tests Unitaires */}
          {currentView === 'dev-refactor' && (
            <motion.div
              key="dev-refactor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['dev', 'admin']}
                targetViewName="AI Code Refactoring & Tests Unitaires"
                onNavigate={navigateTo}
              >
                <DevAiRefactorView
                  onNavigateToPipeline={() => navigateTo('dev-pipeline')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {/* Développeur 2 : Debugger de Pipeline CI/CD */}
          {currentView === 'dev-pipeline' && (
            <motion.div
              key="dev-pipeline"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['dev', 'admin']}
                targetViewName="Debugger de Pipeline CI/CD"
                onNavigate={navigateTo}
              >
                <DevPipelineDebuggerView
                  onNavigateToRefactor={() => navigateTo('dev-refactor')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {/* Sécurité 1 : Threat Intelligence & Règles WAF / Suricata */}
          {currentView === 'sec-threats' && (
            <motion.div
              key="sec-threats"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['sec', 'admin']}
                targetViewName="Threat Intelligence & Générateur WAF"
                onNavigate={navigateTo}
              >
                <SecThreatIntelligenceView
                  onNavigateToCompliance={() => navigateTo('sec-compliance')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {/* Sécurité 2 : Audit de Conformité SOC2 / ISO / RGPD */}
          {currentView === 'sec-compliance' && (
            <motion.div
              key="sec-compliance"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['sec', 'admin']}
                targetViewName="Audit de Conformité SOC2 / ISO / RGPD"
                onNavigate={navigateTo}
              >
                <SecComplianceAuditView
                  onNavigateToThreats={() => navigateTo('sec-threats')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {/* QA 1 : Synthétiseur de Tests E2E Playwright / Cypress */}
          {currentView === 'qa-generator' && (
            <motion.div
              key="qa-generator"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['qa', 'admin']}
                targetViewName="Synthétiseur E2E Playwright & Cypress"
                onNavigate={navigateTo}
              >
                <QAAiTestGeneratorView
                  onNavigateToBench={() => navigateTo('qa-bench')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {/* QA 2 : Benchmark de Performance & Analyseur K6 */}
          {currentView === 'qa-bench' && (
            <motion.div
              key="qa-bench"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['qa', 'admin']}
                targetViewName="Benchmark de Performance & Analyseur K6"
                onNavigate={navigateTo}
              >
                <QAPerformanceBenchView
                  onNavigateToGenerator={() => navigateTo('qa-generator')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {/* Admin 1 : Topologie Multi-Cluster & FinOps IA */}
          {currentView === 'admin-topology' && (
            <motion.div
              key="admin-topology"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['admin']}
                targetViewName="Topologie Multi-Cluster & FinOps IA"
                onNavigate={navigateTo}
              >
                <AdminClusterTopologyView
                  onNavigateToBrief={() => navigateTo('admin-brief')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {/* Admin 2 : Briefing Exécutif Comex IA */}
          {currentView === 'admin-brief' && (
            <motion.div
              key="admin-brief"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['admin']}
                targetViewName="Briefing Exécutif Comex IA"
                onNavigate={navigateTo}
              >
                <AdminExecutiveAiBriefView
                  onNavigateToTopology={() => navigateTo('admin-topology')}
                />
              </RoleAccessGate>
            </motion.div>
          )}

          {/* Import & Scan de Projet Externe (Disponible pour tous les rôles authentifiés) */}
          {currentView === 'import-project' && (
            <motion.div
              key="import-project"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <RoleAccessGate
                allowedRoles={['dev', 'sec', 'qa', 'admin']}
                targetViewName="Import & Scan de Projet Externe IA"
                onNavigate={navigateTo}
              >
                <ImportProjectView onNavigate={navigateTo} />
              </RoleAccessGate>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Reactive Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm p-3.5 rounded-xl bg-[#14141a]/95 border border-white/10 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs font-mono"
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle size={16} className="text-emerald-400 shrink-0" weight="fill" />}
              {toast.type === 'info' && <Info size={16} className="text-cyan-400 shrink-0" weight="fill" />}
              {toast.type === 'warning' && <Warning size={16} className="text-amber-400 shrink-0" weight="fill" />}
              <span className="text-zinc-200">{toast.message}</span>
            </div>
            <button
              onClick={dismissToast}
              className="p-1 rounded text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comprehensive Internal Platform Footer with Direct Links to all Pages */}
      <Footer onNavigate={navigateTo} />

      {/* Modal Dialog for Instant Outage Reporting */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <RoleProvider>
        <AppContent />
      </RoleProvider>
    </ErrorBoundary>
  );
}
