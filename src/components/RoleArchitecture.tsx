import React, { useState } from 'react';
import {
  GitBranch,
  Fingerprint,
  Target,
  Lifebuoy,
  SquaresFour,
  Article,
  ChartLineUp,
  Cpu,
  LockKey,
  FolderOpen,
  Eye,
  GitMerge,
  FilePlus,
  ShieldCheck,
} from '@phosphor-icons/react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ScrollReveal, StaggerGrid, StaggerItem } from './ScrollReveal';

interface Pillar {
  id: string;
  category: string;
  title: string;
  description: string;
  pages: {
    name: string;
    description: string;
    targetRole: string;
    icon: any;
    badge: string;
  }[];
}

const PILLARS: Pillar[] = [
  {
    id: 'entry',
    category: '1. PAGES COMMUNES',
    title: 'Entrée & Accueil Entreprise',
    description:
      'L\'accès universel sécurisé pour l\'ensemble des collaborateurs, garantissant une orientation fluide dès la survenue d\'une panne.',
    pages: [
      {
        name: 'Landing Page (Page de Garde)',
        description: 'Vitrine interne et point de signalement rapide accessible sans friction à tous les départements.',
        targetRole: 'Tous les collaborateurs & Métier',
        icon: Eye,
        badge: 'Accès Public Interne',
      },
      {
        name: 'Connexion / Authentification SSO',
        description: 'Point d\'entrée sécurisé avec aiguillage automatique selon les rôles (Développeur, Sécurité, Testeur).',
        targetRole: 'Auth OIDC / Okta / Azure AD',
        icon: LockKey,
        badge: 'RBAC Multi-Rôles',
      },
    ],
  },
  {
    id: 'core',
    category: '2. CŒUR OPÉRATIONNEL',
    title: 'Gestion & Résolution d\'Incidents',
    description:
      'L\'espace de travail haute cadence où les équipes techniques pilotent la crise, investiguent et déploient les correctifs.',
    pages: [
      {
        name: 'Tableau de Bord (Dashboard)',
        description: 'Vue d\'ensemble temps réel des métriques clés : MTTR, tickets ouverts, urgences et alertes de SLA.',
        targetRole: 'Managers & Leads Tech',
        icon: ChartLineUp,
        badge: 'Métriques & SLA',
      },
      {
        name: 'Liste des Incidents (Annuaire)',
        description: 'Annuaire central avec recherche plein texte et filtres par statut, priorité ou escouade assignée.',
        targetRole: 'Toutes équipes techniques',
        icon: FolderOpen,
        badge: 'Filtres & Recherche',
      },
      {
        name: 'Création d\'un Incident',
        description: 'Formulaire ergonomique avec catégorisation guidée et upload sécurisé de logs et captures d\'écran.',
        targetRole: 'Support, QA, Devs',
        icon: FilePlus,
        badge: 'Ingestion Rapide',
      },
      {
        name: 'Détail de l\'Incident (Vue Ticket)',
        description: 'Fil de discussion, analyse RCA automatique par l\'IA Groq, chatbot Copilote et historique des états.',
        targetRole: 'Ingénieurs d\'astreinte',
        icon: Cpu,
        badge: 'Groq LPU + Copilote',
      },
    ],
  },
  {
    id: 'transversal',
    category: '3. TRANSVERSE & IA',
    title: 'DevSecOps, Supervision & Wiki',
    description:
      'La couche transversale garantissant la conformité de sécurité, la supervision continue et la capitalisation des connaissances.',
    pages: [
      {
        name: 'Base de Connaissances (Wiki)',
        description: 'Bibliothèque des rapports d\'incidents (Post-Mortem) rédigés automatiquement par l\'IA à la clôture.',
        targetRole: 'Équipes Produit & Tech',
        icon: Article,
        badge: 'Post-Mortem Auto',
      },
      {
        name: 'Supervision CI/CD & Sécurité',
        description: 'Suivi des webhooks de déploiement en échec, alertes de scans de failles (Trivy) et tests automatisés.',
        targetRole: 'DevSecOps & SRE',
        icon: GitMerge,
        badge: 'Pipelines & CVE',
      },
      {
        name: 'Administration & Paramètres',
        description: 'Gestion des habilitations, matrice de droits RBAC et configuration des intégrations tierces.',
        targetRole: 'Administrateurs',
        icon: SquaresFour,
        badge: 'Gouvernance RBAC',
      },
    ],
  },
];

import { useRole } from '../context/RoleContext';
import { AppView } from './Footer';

const ROLES = [
  {
    id: 'dev' as const,
    title: 'Développeur (Mohammed)',
    view: 'role-dev' as AppView,
    icon: GitBranch,
    badge: 'Espace Dev Dédié',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    focus: 'Isolation de la régression, analyse des stack traces, hotfix Groq RCA et tests unitaires.',
  },
  {
    id: 'sec' as const,
    title: 'Ingénieur Sécurité (Tasnim)',
    view: 'role-sec' as AppView,
    icon: Fingerprint,
    badge: 'Espace SecOps Dédié',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    focus: 'Surveillance des failles CVE Trivy/Snyk, rotation Vault, règles WAF et posture défensive.',
  },
  {
    id: 'qa' as const,
    title: 'Testeur QA (Aymane)',
    view: 'role-qa' as AppView,
    icon: Target,
    badge: 'Espace QA Dédié',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    focus: 'Suites E2E Playwright/Cypress, campagnes de charge K6, non-régression et tests de chaos.',
  },
  {
    id: 'admin' as const,
    title: 'Admin SRE (Mourad)',
    view: 'role-admin' as AppView,
    icon: ShieldCheck,
    badge: 'Espace SRE & RBAC',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    focus: 'Gouvernance globale RBAC, gestion des utilisateurs, santé K8s et journal d’audit immuable.',
  },
];

interface RoleArchitectureProps {
  onNavigate?: (view: AppView) => void;
}

export const RoleArchitecture: React.FC<RoleArchitectureProps> = ({ onNavigate }) => {
  const { selectRole } = useRole();
  const [selectedPillarId, setSelectedPillarId] = useState<string>('core');
  const activePillar = PILLARS.find((p) => p.id === selectedPillarId) || PILLARS[1];

  const shouldReduceMotion = useReducedMotion();
  const easeOut = [0.23, 1, 0.32, 1] as const;

  const handleRoleClick = (roleId: 'dev' | 'sec' | 'qa' | 'admin', targetView: AppView) => {
    selectRole(roleId);
    if (onNavigate) {
      onNavigate(targetView);
    } else {
      window.location.hash = targetView;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="architecture" className="py-24 bg-[#08080a] relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                  Chaque Rôle Possède Son Propre Cockpit
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Architecture & Espaces Dédiés par Rôle
              </h2>
              <p className="mt-3 text-base text-zinc-400 leading-relaxed max-w-[65ch]">
                Cliquez directement sur un profil ci-dessous pour basculer sur sa page opérationnelle dédiée ou explorez la matrice RBAC.
              </p>
            </div>

            <button
              onClick={() => {
                if (onNavigate) onNavigate('role-management');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/30 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0"
            >
              <LockKey size={15} className="text-emerald-400" />
              <span>Gérer les Rôles (Matrice RBAC)</span>
            </button>
          </div>
        </ScrollReveal>

        {/* 1. Interactive Role Bar (How different personas experience Sentinel) */}
        <ScrollReveal delay={0.1}>
          <div className="mb-14 p-6 rounded-2xl bg-zinc-950 border border-white/10 shadow-xl">
            <div className="text-xs font-medium text-zinc-400 mb-4 flex items-center justify-between">
              <span>Points d'entrée dédiés — Cliquez pour accéder au cockpit du rôle :</span>
              <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline">● Pages actives & isolées</span>
            </div>
            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <StaggerItem key={role.id}>
                    <div
                      onClick={() => handleRoleClick(role.id, role.view)}
                      className="p-4 rounded-xl bg-zinc-900/50 border border-white/5 space-y-3 hover:border-emerald-500/40 hover:bg-zinc-900/90 transition-all h-full group cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors shadow-inner">
                            <Icon size={17} weight="regular" />
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${role.badgeColor}`}>
                            {role.badge}
                          </span>
                        </div>
                        <div className="font-semibold text-sm text-zinc-100 group-hover:text-white transition-colors">
                          {role.title}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {role.focus}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                        <span>Ouvrir l'Espace</span>
                        <span>→</span>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          </div>
        </ScrollReveal>

        {/* 2. Interactive 3 Pillars Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {PILLARS.map((pillar) => {
            const isSelected = pillar.id === selectedPillarId;
            return (
              <motion.button
                key={pillar.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedPillarId(pillar.id)}
                className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer border ${
                  isSelected
                    ? 'text-white border-white/20 shadow-md'
                    : 'bg-zinc-900/70 text-zinc-400 border-white/5 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="active-pillar-pill"
                    className="absolute inset-0 bg-zinc-800 rounded-xl -z-10 shadow-md border border-white/10"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400">
                    {pillar.category.split('.')[0]}
                  </span>
                  <span>{pillar.title}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Active Pillar Card Breakdown with Fluid Transitions */}
        <ScrollReveal delay={0.15}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePillar.id}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: easeOut }}
              className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl"
            >
              <div className="mb-6 pb-6 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {activePillar.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-[55ch]">
                  {activePillar.description}
                </p>
              </div>

              {/* Grid of Pages in this Pillar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePillar.pages.map((page, idx) => {
                  const Icon = page.icon;
                  return (
                    <motion.div
                      key={page.name}
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.22,
                        delay: idx * 0.04,
                        ease: easeOut,
                      }}
                      className="p-5 rounded-xl bg-zinc-900/50 border border-white/[0.06] hover:border-emerald-500/30 transition-all group flex flex-col justify-between space-y-4 h-full"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                              <Icon size={18} weight="duotone" />
                            </div>
                            <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-emerald-300 transition-colors">
                              {page.name}
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5">
                            {page.badge}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {page.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>Public cible : <strong className="text-zinc-300 font-normal">{page.targetRole}</strong></span>
                        <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Prêt en prod →
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

            </motion.div>
          </AnimatePresence>
        </ScrollReveal>

      </div>
    </section>
  );
};
