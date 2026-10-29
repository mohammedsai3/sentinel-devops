import React from 'react';
import {
  Lightning,
  GitBranch,
  LockKey,
  FileText,
  ChartLineUp,
  ArrowUpRight,
  ShieldCheck,
  Broadcast,
  Article,
  Sparkle,
  UserCircle,
} from '@phosphor-icons/react';
import { SentinelLogo } from './SentinelLogo';
import { AppView } from '../types/role';

export type { AppView };

interface FooterProps {
  onNavigate?: (view: AppView) => void;
  onOpenReportModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenReportModal }) => {
  const handleNav = (e: React.MouseEvent, view: AppView) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(view);
    } else {
      window.location.hash = view;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050507] border-t border-white/[0.08] text-zinc-400 font-mono text-xs py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Info Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-10 border-b border-white/[0.06] mb-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-400 shadow-inner">
              <SentinelLogo size={18} />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white font-sans block">
                Sentinel DevSecOps · Index Intégral de l'Application
              </span>
              <span className="text-[11px] text-zinc-500">
                Toutes les 11 pages et espaces transverses sont répertoriés ci-dessous
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-white/5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cluster de production : Nominal (99.98%)</span>
            </span>
            <span className="hidden sm:inline-flex px-2 py-1 rounded bg-zinc-900 text-zinc-400 border border-white/5">
              Groq LPU 42ms
            </span>
          </div>
        </div>

        {/* 4 Comprehensive Columns - All Pages Included */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
          
          {/* Column 1: Pages Communes (Entrée publique) */}
          <div className="space-y-3.5">
            <div className="text-zinc-200 font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>1. Pages Communes</span>
              <span className="text-[10px] text-zinc-500 font-normal">● Entrée</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              Espaces ouverts aux collaborateurs et à l'ensemble des départements métiers.
            </p>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <a
                  href="#landing"
                  onClick={(e) => handleNav(e, 'landing')}
                  className="hover:text-emerald-400 transition-colors flex items-center justify-between group"
                >
                  <span>Page de Garde (Accueil)</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                </a>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenReportModal) onOpenReportModal();
                  }}
                  className="hover:text-emerald-400 transition-colors flex items-center justify-between w-full text-left group cursor-pointer"
                >
                  <span>Signalement Rapide Métier</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 font-mono">Modale</span>
                </button>
              </li>
              <li>
                <a
                  href="#login"
                  onClick={(e) => handleNav(e, 'login')}
                  className="hover:text-emerald-400 transition-colors flex items-center justify-between group"
                >
                  <span>Connexion SSO Multi-Rôles</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Cœur Opérationnel (Gestion des Pannes) */}
          <div className="space-y-3.5">
            <div className="text-zinc-200 font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>2. Cœur d'Application</span>
              <span className="text-[10px] text-emerald-400 font-normal">● Actif</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              Gestion de crise, détection des anomalies et flux de travail des tickets.
            </p>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <a
                  href="#dashboard"
                  onClick={(e) => handleNav(e, 'dashboard')}
                  className="hover:text-emerald-400 transition-colors flex items-center justify-between group"
                >
                  <span>Tableau de Bord (Dashboard 3D)</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                </a>
              </li>
              <li>
                <a
                  href="#incidents"
                  onClick={(e) => handleNav(e, 'incidents')}
                  className="hover:text-emerald-400 transition-colors flex items-center justify-between group"
                >
                  <span>Annuaire Central des Incidents</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                </a>
              </li>
              <li>
                <a
                  href="#create-incident"
                  onClick={(e) => handleNav(e, 'create-incident')}
                  className="hover:text-emerald-400 transition-colors flex items-center justify-between group"
                >
                  <span>Création d'un Incident (Pre-flight)</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                </a>
              </li>
              <li>
                <a
                  href="#ticket-detail"
                  onClick={(e) => handleNav(e, 'ticket-detail')}
                  className="hover:text-emerald-400 transition-colors flex items-center justify-between group"
                >
                  <span>Détail Ticket & War Room (#892)</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Transverses (DevSecOps, Sécurité & IA) */}
          <div className="space-y-3.5">
            <div className="text-zinc-200 font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>3. Transverse & IA</span>
              <span className="text-[10px] text-teal-400 font-normal">● DevSecOps</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              Supervision continue des pipelines, capitalisation Wiki et gouvernance.
            </p>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <a
                  href="#wiki"
                  onClick={(e) => handleNav(e, 'wiki')}
                  className="hover:text-teal-300 transition-colors flex items-center justify-between group"
                >
                  <span>Base de Connaissances (Wiki)</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                </a>
              </li>
              <li>
                <a
                  href="#supervision"
                  onClick={(e) => handleNav(e, 'supervision')}
                  className="hover:text-cyan-300 transition-colors flex items-center justify-between group"
                >
                  <span>Supervision CI/CD & Sécurité (3D)</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                </a>
              </li>
              <li>
                <a
                  href="#admin"
                  onClick={(e) => handleNav(e, 'admin')}
                  className="hover:text-amber-300 transition-colors flex items-center justify-between group"
                >
                  <span>Administration & Matrice RBAC</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
                </a>
              </li>
              <li>
                <a
                  href="#admin"
                  onClick={(e) => handleNav(e, 'admin')}
                  className="hover:text-teal-300 transition-colors flex items-center justify-between group"
                >
                  <span>Piste d'Audit Inaltérable (Trail)</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                </a>
              </li>
              <li>
                <a
                  href="#admin"
                  onClick={(e) => handleNav(e, 'admin')}
                  className="hover:text-emerald-300 transition-colors flex items-center justify-between group"
                >
                  <span>Paramétrage IA (Prompts Groq)</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Gouvernance & Espace Personnel */}
          <div className="space-y-3.5">
            <div className="text-zinc-200 font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <span>4. Pilotage & Équipe</span>
              <span className="text-[10px] text-amber-400 font-normal">● Individuel</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
              Reporting de performance pour la Direction et préférences des collaborateurs.
            </p>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <a
                  href="#role-management"
                  onClick={(e) => handleNav(e, 'role-management')}
                  className="hover:text-emerald-400 font-bold text-white transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Gestion des Rôles (RBAC)</span>
                  </span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                </a>
              </li>
              <li>
                <a
                  href="#reporting"
                  onClick={(e) => handleNav(e, 'reporting')}
                  className="hover:text-emerald-300 transition-colors flex items-center justify-between group"
                >
                  <span>Rapports Exécutifs Comex</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                </a>
              </li>
              <li>
                <a
                  href="#profile"
                  onClick={(e) => handleNav(e, 'profile')}
                  className="hover:text-teal-300 transition-colors flex items-center justify-between group"
                >
                  <span>Profil & Préférences</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
                </a>
              </li>
            </ul>

            <div className="pt-3 border-t border-white/[0.06] space-y-2">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">
                Espaces dédiés par Rôle :
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-zinc-400">
                <button
                  onClick={(e) => handleNav(e, 'role-dev')}
                  className="px-2 py-0.5 rounded bg-zinc-900 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/30 transition-colors cursor-pointer"
                >
                  Espace Dev
                </button>
                <button
                  onClick={(e) => handleNav(e, 'role-sec')}
                  className="px-2 py-0.5 rounded bg-zinc-900 border border-amber-500/30 text-amber-300 hover:bg-amber-950/30 transition-colors cursor-pointer"
                >
                  Espace SecOps
                </button>
                <button
                  onClick={(e) => handleNav(e, 'role-qa')}
                  className="px-2 py-0.5 rounded bg-zinc-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/30 transition-colors cursor-pointer"
                >
                  Espace QA
                </button>
                <button
                  onClick={(e) => handleNav(e, 'role-admin')}
                  className="px-2 py-0.5 rounded bg-zinc-900 border border-rose-500/30 text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  Espace SRE Admin
                </button>
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/[0.06] space-y-1.5">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">
                Modules IA Spécialisés (Rôles Dédiés) :
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                <button onClick={(e) => handleNav(e, 'dev-refactor')} className="px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 cursor-pointer">⚡ AI Refactor</button>
                <button onClick={(e) => handleNav(e, 'dev-pipeline')} className="px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 cursor-pointer">🛠 CI Debugger</button>
                <button onClick={(e) => handleNav(e, 'sec-threats')} className="px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:bg-amber-900/50 cursor-pointer">🛡 Threat Intel</button>
                <button onClick={(e) => handleNav(e, 'sec-compliance')} className="px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:bg-amber-900/50 cursor-pointer">📋 Compliance</button>
                <button onClick={(e) => handleNav(e, 'qa-generator')} className="px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 cursor-pointer">🧪 E2E Generator</button>
                <button onClick={(e) => handleNav(e, 'qa-bench')} className="px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 cursor-pointer">📈 K6 Benchmark</button>
                <button onClick={(e) => handleNav(e, 'admin-topology')} className="px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 cursor-pointer">🌐 K8s FinOps</button>
                <button onClick={(e) => handleNav(e, 'admin-brief')} className="px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 cursor-pointer">📊 Comex Brief</button>
                <button onClick={(e) => handleNav(e, 'import-project')} className="px-1.5 py-0.5 rounded bg-teal-950/40 border border-teal-500/30 text-teal-300 hover:bg-teal-900/50 cursor-pointer font-bold">📁 Import Projet</button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 font-sans">
          <div>
            Plateforme Sentinel v2.8 · Inférence Groq Llama-3.3-70B LPU · Architecture DevSecOps
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>SOC2 Type II</span>
            <span>·</span>
            <span>ISO 27001</span>
            <span>·</span>
            <span>Audit RBAC actif</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
