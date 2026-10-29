import React, { useState, useEffect, useRef } from 'react';
import {
  WarningCircle,
  SignIn,
  Lightning,
  Sparkle,
  ChartLineUp,
  ListBullets,
  PlusCircle,
  BookOpen,
  Broadcast,
  Gear,
  Article,
  SignOut,
  CaretDown,
  UserCircle,
  GitBranch,
  Fingerprint,
  Target,
  ShieldCheck,
  Cpu,
  LockKey,
  Code,
  TerminalWindow,
  ShieldWarning,
  PresentationChart,
  HardDrives,
  FolderOpen,
} from '@phosphor-icons/react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { SentinelLogo } from './SentinelLogo';
import { AppView } from './Footer';
import { useRole } from '../context/RoleContext';

export type UserRole = 'dev' | 'sec' | 'qa' | 'admin' | null;

interface HeaderProps {
  onOpenReportModal: () => void;
  systemStatus: 'nominal' | 'investigating' | 'critical';
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

interface RoleConfig {
  id: 'dev' | 'sec' | 'qa' | 'admin';
  name: string;
  shortRole: string;
  tag: string;
  badgeColor: string;
  icon: React.ElementType;
  initial: string;
  navItems: { view: AppView; label: string; icon: React.ElementType }[];
}

const ROLES_CONFIG: Record<'dev' | 'sec' | 'qa' | 'admin', RoleConfig> = {
  dev: {
    id: 'dev',
    name: 'Mohammed',
    shortRole: 'Lead Développeur',
    tag: 'DEV CORE',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: GitBranch,
    initial: 'M',
    navItems: [
      { view: 'role-dev', label: 'Cockpit Dev', icon: GitBranch },
      { view: 'import-project', label: 'Importer un Projet (IA)', icon: FolderOpen },
      { view: 'dev-refactor', label: 'AI Refactoring', icon: Code },
      { view: 'dev-pipeline', label: 'Inspecteur CI/CD', icon: TerminalWindow },
      { view: 'dashboard', label: 'Tableau de bord', icon: ChartLineUp },
      { view: 'incidents', label: 'Incidents & Bugs', icon: ListBullets },
      { view: 'ticket-detail', label: 'War Room (#892)', icon: Lightning },
      { view: 'wiki', label: 'Wiki Post-Mortem', icon: BookOpen },
    ],
  },
  sec: {
    id: 'sec',
    name: 'Tasnim',
    shortRole: 'Lead Sécurité',
    tag: 'SECOPS',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: Fingerprint,
    initial: 'T',
    navItems: [
      { view: 'role-sec', label: 'Cockpit Sécurité', icon: Fingerprint },
      { view: 'import-project', label: 'Importer un Projet (IA)', icon: FolderOpen },
      { view: 'sec-threats', label: 'Threat Intel & WAF', icon: ShieldWarning },
      { view: 'sec-compliance', label: 'Audit SOC2 / ISO', icon: ShieldCheck },
      { view: 'supervision', label: 'Supervision & CVEs', icon: Broadcast },
      { view: 'incidents', label: 'Incidents Sécurité', icon: ListBullets },
      { view: 'admin', label: "Piste d'Audit", icon: Article },
      { view: 'wiki', label: 'Wiki & Remédiation', icon: BookOpen },
    ],
  },
  qa: {
    id: 'qa',
    name: 'Aymane',
    shortRole: 'Lead Testeur QA',
    tag: 'QA LEAD',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: Target,
    initial: 'A',
    navItems: [
      { view: 'role-qa', label: 'Cockpit QA Tests', icon: Target },
      { view: 'import-project', label: 'Importer un Projet (IA)', icon: FolderOpen },
      { view: 'qa-generator', label: 'Générateur Tests E2E', icon: Target },
      { view: 'qa-bench', label: 'Benchmarking & K6', icon: ChartLineUp },
      { view: 'supervision', label: 'Tests & Chaos', icon: Cpu },
      { view: 'incidents', label: 'Annuaire des Bugs', icon: ListBullets },
      { view: 'reporting', label: 'Rapports Comex', icon: ChartLineUp },
    ],
  },
  admin: {
    id: 'admin',
    name: 'Mourad',
    shortRole: 'Admin SRE & Infra',
    tag: 'SRE ADMIN',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: ShieldCheck,
    initial: 'M',
    navItems: [
      { view: 'role-admin', label: 'Cockpit Admin SRE', icon: ShieldCheck },
      { view: 'import-project', label: 'Importer un Projet (IA)', icon: FolderOpen },
      { view: 'admin-topology', label: 'Topologie K8s & FinOps', icon: HardDrives },
      { view: 'admin-brief', label: 'Synthèse Comex IA', icon: PresentationChart },
      { view: 'role-management', label: 'Gestion des Rôles (RBAC)', icon: Gear },
      { view: 'dashboard', label: 'Tableau SRE (3D)', icon: ChartLineUp },
      { view: 'reporting', label: 'Rapports Exécutifs', icon: ChartLineUp },
      { view: 'wiki', label: 'Wiki Post-Mortem', icon: BookOpen },
    ],
  },
};

export const Header: React.FC<HeaderProps> = ({
  onOpenReportModal,
  systemStatus,
  currentView,
  onNavigate,
  currentRole,
  onSelectRole,
}) => {
  const { currentUser, logout, project } = useRole();
  const [scrolled, setScrolled] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeRoleConfig = currentRole ? ROLES_CONFIG[currentRole] : null;

  // Pages Communes nav items (shown when currentRole is null / Public)
  const commonNavItems: { label: string; action: () => void }[] = [
    {
      label: 'Accueil (Garde)',
      action: () => {
        onNavigate('landing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      label: 'Gestion des Rôles (RBAC)',
      action: () => {
        onNavigate('role-management');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      label: 'Déclarer une panne',
      action: () => {
        if (currentView !== 'landing') onNavigate('landing');
        setTimeout(() => {
          document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      },
    },
    {
      label: 'Cycle de résolution',
      action: () => {
        if (currentView !== 'landing') onNavigate('landing');
        setTimeout(() => {
          document.getElementById('lifecycle')?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      },
    },
    {
      label: 'Architecture & Rôles',
      action: () => {
        if (currentView !== 'landing') onNavigate('landing');
        setTimeout(() => {
          document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      },
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[#08080a]/92 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/40'
          : 'bg-[#08080a]/75 backdrop-blur-sm border-b border-white/[0.05]'
      }`}
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 origin-left z-50"
        style={{ scaleX }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Role Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (currentRole) {
                // Return to user's main dashboard
                onNavigate(activeRoleConfig?.navItems[0].view || 'dashboard');
              } else {
                onNavigate('landing');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 text-zinc-100 hover:text-white transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:border-emerald-500/40 transition-colors shadow-inner">
              <SentinelLogo
                size={18}
                className="text-emerald-400 group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="font-mono font-bold tracking-tight text-base text-zinc-100">
              SENTINEL
            </span>
          </button>

          {/* Role Status Tag */}
          {activeRoleConfig ? (
            <span className={`hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${activeRoleConfig.badgeColor}`}>
              {activeRoleConfig.tag}
            </span>
          ) : (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-white/5 uppercase tracking-wider">
              PORTAIL PUBLIC
            </span>
          )}
        </div>

        {/* ============================================================ */}
        {/* NAVIGATION A: COMMON HEADER (When currentRole === null)     */}
        {/* ============================================================ */}
        {!currentRole && (
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-lg bg-zinc-900/60 border border-white/5 text-xs font-mono">
            {commonNavItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-all cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* ============================================================ */}
        {/* NAVIGATION B: BESPOKE ROLE HEADER (When logged in as a Role) */}
        {/* ============================================================ */}
        {activeRoleConfig && (
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-lg bg-zinc-900/60 border border-white/5 text-xs font-mono">
            {activeRoleConfig.navItems.map((item) => {
              const isActive = currentView === item.view;
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    onNavigate(item.view);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`relative px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'text-emerald-300 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="header-role-active-pill"
                      className="absolute inset-0 rounded-md bg-zinc-800 border border-white/10 -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon size={13} className={isActive ? 'text-emerald-400' : 'text-zinc-500'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* ============================================================ */}
        {/* ACTIONS & USER PROFILE SWITCHER                              */}
        {/* ============================================================ */}
        <div className="flex items-center gap-2.5">
          {/* Active Shared Project Quick Pill */}
          {project?.name && (
            <button
              onClick={() => {
                onNavigate('import-project');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg bg-zinc-900 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/30 hover:border-emerald-500/60 transition-all cursor-pointer shadow-sm"
              title="Projet partagé actif - Cliquer pour gérer ou réauditer"
            >
              <FolderOpen size={14} className="text-emerald-400" />
              <span className="font-semibold max-w-[110px] truncate">{project.name}</span>
              <span className="text-[10px] text-zinc-400 font-mono">({project.files?.length || 0})</span>
            </button>
          )}

          {/* Quick Outage declaration button (Universal) */}
          <button
            onClick={onOpenReportModal}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-medium rounded-md bg-zinc-900 border border-rose-500/30 text-rose-300 hover:bg-rose-950/30 hover:border-rose-500/60 transition-all cursor-pointer shadow-sm"
          >
            <WarningCircle size={15} weight="bold" className="text-rose-400" />
            <span>Signaler incident</span>
          </button>

          {/* IF IN COMMON/PUBLIC MODE: LOGIN / REGISTER BUTTON */}
          {!currentRole && (
            <button
              onClick={() => {
                onNavigate('login');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors shadow-sm cursor-pointer"
            >
              <SignIn size={14} weight="bold" />
              <span>Connexion / Inscription</span>
            </button>
          )}

          {/* ROLE SWITCHER DROPDOWN & ACTIVE USER PILL */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 transition-all cursor-pointer text-xs font-mono text-zinc-300"
            >
              {activeRoleConfig ? (
                <>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${activeRoleConfig.badgeColor}`}>
                    {currentUser ? currentUser.name.charAt(0).toUpperCase() : activeRoleConfig.initial}
                  </div>
                  <span className="font-semibold text-zinc-100 hidden sm:inline">
                    {currentUser ? currentUser.name : activeRoleConfig.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 hidden md:inline">
                    ({activeRoleConfig.id.toUpperCase()})
                  </span>
                </>
              ) : (
                <>
                  <UserCircle size={16} className="text-zinc-400" />
                  <span className="text-zinc-300 hidden sm:inline">Choisir rôle</span>
                </>
              )}
              <CaretDown size={11} className={`text-zinc-400 transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {roleMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0f0f13] border border-white/10 shadow-2xl p-2 z-50 text-xs font-mono space-y-1"
                >
                  <div className="px-2.5 py-1 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold border-b border-white/5 pb-1.5">
                    Changer de Header par Rôle :
                  </div>

                  {/* 4 Roles */}
                  {(['dev', 'sec', 'qa', 'admin'] as const).map((rKey) => {
                    const cfg = ROLES_CONFIG[rKey];
                    const isCurrent = currentRole === rKey;
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={rKey}
                        onClick={() => {
                          onSelectRole(rKey);
                          setRoleMenuOpen(false);
                          onNavigate(cfg.navItems[0].view);
                        }}
                        className={`w-full p-2 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-zinc-800 text-emerald-300 font-bold border border-emerald-500/30'
                            : 'hover:bg-zinc-900 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={14} className={isCurrent ? 'text-emerald-400' : 'text-zinc-400'} />
                          <div>
                            <div className="font-sans font-semibold text-zinc-100">{cfg.name}</div>
                            <div className="text-[10px] text-zinc-500">{cfg.shortRole}</div>
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    );
                  })}

                  <div className="border-t border-white/5 pt-1 mt-1 space-y-1">
                    {/* Role management RBAC */}
                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onNavigate('role-management');
                      }}
                      className="w-full p-2 rounded-lg text-left text-emerald-300 hover:bg-zinc-900 flex items-center gap-2 cursor-pointer font-bold"
                    >
                      <LockKey size={14} className="text-emerald-400" />
                      <span>Gestion des Rôles (Matrice RBAC)</span>
                    </button>

                    {/* User profile link */}
                    <button
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onNavigate('profile');
                      }}
                      className="w-full p-2 rounded-lg text-left text-zinc-300 hover:bg-zinc-900 flex items-center gap-2 cursor-pointer"
                    >
                      <UserCircle size={14} className="text-teal-400" />
                      <span>Préférences & Profil individuel</span>
                    </button>

                    {/* Return to Public / Logout */}
                    <button
                      onClick={() => {
                        logout();
                        onSelectRole(null);
                        setRoleMenuOpen(false);
                        onNavigate('landing');
                      }}
                      className="w-full p-2 rounded-lg text-left text-rose-300 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer font-bold"
                    >
                      <SignOut size={14} />
                      <span>Se Déconnecter (Quitter session)</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </header>
  );
};
