import React, { useState } from 'react';
import {
  Lightning,
  Sparkle,
  TerminalWindow,
  CheckCircle,
  Warning,
  Bug,
  ShieldWarning,
  ArrowsClockwise,
  ArrowRight,
  User,
  GitBranch,
} from '@phosphor-icons/react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ScrollReveal } from './ScrollReveal';
import { groqAI, RCAResult } from '../services/groqClient';

interface Scenario {
  id: string;
  role: string;
  department: string;
  badgeColor: string;
  title: string;
  symptom: string;
  logs: string[];
  rcaAnalysis: {
    rootCause: string;
    culpritFile: string;
    fixAction: string;
    durationMs: number;
    assignedTeam: string;
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: 'support',
    role: 'Support Client & Métier',
    department: 'Customer Success',
    badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    title: 'Paiements bloqués sur le tunnel de commande',
    symptom: 'Plusieurs utilisateurs signalent une page blanche lors de la validation 3D-Secure.',
    logs: [
      '[10:24:02.120] POST /v1/checkout/finalize -> 504 Gateway Timeout (60000ms)',
      '[10:24:02.155] worker.pool.exhausted: Stripe webhook worker pool queue size > 5000',
      '[10:24:02.210] redis.connection.TimeoutError: Connection pool saturated on redis-cluster-01',
    ],
    rcaAnalysis: {
      rootCause: 'Deadlock sur la file d\'attente Redis suite à un dépassement de connexions simultanées.',
      culpritFile: 'services/billing/worker_pool.go:142',
      fixAction: 'Augmentation du pool de workers à 120 + redémarrage à chaud du pod billing-consumer.',
      durationMs: 38,
      assignedTeam: 'Équipe SRE & Core Backend',
    },
  },
  {
    id: 'dev',
    role: 'Développeur Backend',
    department: 'Core Engineering',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    title: 'Crash récurrent du microservice Auth après déploiement',
    symptom: 'Erreur 500 intermittente sur les endpoints /auth/token suite au commit #88f9c1.',
    logs: [
      '[10:26:15.890] ERROR [auth-service] TypeError: Cannot read property "tenant_id" of undefined',
      '[10:26:15.912] Stack trace: at verifyJWT (/app/dist/middleware/jwt.js:89:12)',
      '[10:26:15.934] Canary cluster health down to 82% (unhealthy pods: 3/5)',
    ],
    rcaAnalysis: {
      rootCause: 'Régression dans le middleware JWT : absence de fallback quand tenant_id est omis dans le payload hérité.',
      culpritFile: 'src/middleware/jwt.ts:89',
      fixAction: 'Rollback automatique du Canary vers v2.14.0 en 18 secondes via ArgoCD webhook.',
      durationMs: 44,
      assignedTeam: 'Escouade Identité & Sécurité',
    },
  },
  {
    id: 'security',
    role: 'Ingénieur Sécurité & DevSecOps',
    department: 'Cybersecurity',
    badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    title: 'Détection CVE Critique dans le pipeline CI/CD',
    symptom: 'Le scan Trivy pré-déploiement a bloqué la mise en production sur staging-main.',
    logs: [
      '[10:28:40.004] [trivy-scanner] CRITICAL: CVE-2024-3094 detected in liblzma dependency',
      '[10:28:40.045] [policy-enforcer] CI Gatekeeper: Release build #2904 blocked by DevSecOps Rule #12',
      '[10:28:40.090] Alert generated to #secops-critical & ticket auto-drafted in Sentinel',
    ],
    rcaAnalysis: {
      rootCause: 'Injection indirecte de paquet vulnérable via une mise à jour d\'image de base Docker.',
      culpritFile: 'deploy/docker/Dockerfile.worker:L14',
      fixAction: 'Pinning de la version alpine:3.19.1 et régénération du SBOM attesté.',
      durationMs: 29,
      assignedTeam: 'Équipe DevSecOps & Infrastructure',
    },
  },
];

export const IncidentSimulator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [stage, setStage] = useState<'idle' | 'analyzing' | 'resolved'>('idle');
  const [liveRca, setLiveRca] = useState<RCAResult | null>(null);

  const shouldReduceMotion = useReducedMotion();
  const easeOut = [0.23, 1, 0.32, 1] as const;

  const handleRunSimulation = async () => {
    setStage('analyzing');
    try {
      const res = await groqAI.analyzeRCA({
        title: selectedScenario.title,
        service: selectedScenario.department,
        priority: 'P1',
        description: selectedScenario.symptom,
        logs: selectedScenario.logs.join('\n'),
      });
      setLiveRca(res);
      setStage('resolved');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
    } catch (err) {
      console.error('Groq simulation error:', err);
      setStage('resolved');
    }
  };

  const handleReset = () => {
    setStage('idle');
    setLiveRca(null);
  };

  return (
    <section id="simulator" className="py-24 bg-[#08080a] relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal>
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Déclaration express & Diagnostic instantané
            </h2>
            <p className="mt-3 text-base text-zinc-400 leading-relaxed max-w-[65ch]">
              Que vous soyez du support client, développeur ou responsable sécurité, Sentinel unifie la saisie des pannes et délègue l'analyse des logs au modèle de raisonnement Groq.
            </p>
          </div>
        </ScrollReveal>

        {/* Interactive Sandbox Container */}
        <ScrollReveal delay={0.1} yOffset={32}>
          <div className="rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl overflow-hidden">
          
          {/* Top Bar: Department & Scenario Switcher */}
          <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-zinc-400 font-medium">
              Cas d'usage :
            </span>

            {/* Department pills */}
            <div className="flex flex-wrap gap-2">
              {SCENARIOS.map((scenario) => {
                const isSelected = selectedScenario.id === scenario.id;
                return (
                  <motion.button
                    key={scenario.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setSelectedScenario(scenario);
                      setStage('idle');
                    }}
                    className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? 'text-white border-white/20 shadow-sm'
                        : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="active-scenario-pill"
                        className="absolute inset-0 bg-zinc-800 rounded-lg -z-10 shadow-sm border border-white/10"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{scenario.role}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Main Simulator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            
            {/* Left Column: Saisie Incident */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedScenario.id}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: easeOut }}
                  className="space-y-4"
                >
                  <div className="text-xs text-zinc-400 font-medium">
                    {selectedScenario.department}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Titre de l'incident</label>
                    <div className="text-base font-semibold text-zinc-100">
                      {selectedScenario.title}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Symptômes observés</label>
                    <p className="text-sm text-zinc-300 bg-zinc-900/70 p-3 rounded-lg border border-white/5 leading-relaxed">
                      {selectedScenario.symptom}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Télémétrie et logs collectés</label>
                    <div className="bg-[#050507] p-3 rounded-lg border border-white/5 font-mono text-xs text-zinc-400 space-y-1 overflow-x-auto">
                      {selectedScenario.logs.map((log, idx) => (
                        <div key={idx} className="whitespace-nowrap text-[11px]">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Action Trigger */}
              <div className="pt-2">
                {stage === 'idle' && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRunSimulation}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all shadow-md cursor-pointer"
                  >
                    <Lightning size={18} weight="fill" />
                    <span>Déclencher l'analyse RCA Groq AI</span>
                  </motion.button>
                )}

                {stage === 'analyzing' && (
                  <div className="w-full py-3 px-4 rounded-lg bg-zinc-900 border border-amber-500/30 text-amber-300 font-mono text-xs flex items-center justify-center gap-2">
                    <ArrowsClockwise size={16} className="animate-spin text-amber-400" />
                    <span>Inférence Groq LPU en cours (~40ms)...</span>
                  </div>
                )}

                {stage === 'resolved' && (
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={handleReset}
                      className="flex-1 py-2.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowsClockwise size={14} />
                      <span>Réinitialiser</span>
                    </motion.button>
                    <a
                      href="#auth-preview"
                      className="flex-1 py-2.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono text-emerald-400 transition-colors flex items-center justify-center gap-1.5 font-medium"
                    >
                      <span>Voir ticket complet →</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Résultat de l'IA Groq & Plan d'atténuation */}
            <div className="lg:col-span-7 p-6 sm:p-8 bg-[#070709] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Lightning size={16} weight="fill" className="text-emerald-400" />
                    <span className="text-xs font-semibold text-zinc-200">
                      Rapport d'analyse Groq RCA {liveRca?.modelUsed && `(${liveRca.modelUsed})`}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    Latence : {liveRca ? `${liveRca.inferenceTimeMs}ms` : `${selectedScenario.rcaAnalysis.durationMs}ms`}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {stage === 'idle' ? (
                    <motion.div
                      key={`idle-${selectedScenario.id}`}
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: easeOut }}
                      className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3 text-zinc-500"
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                        <TerminalWindow size={20} className="text-zinc-500" />
                      </div>
                      <div className="text-xs text-zinc-400">En attente de déclenchement</div>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        Cliquez sur le bouton pour analyser instantanément les métriques, traces et commits du cas {selectedScenario.role}.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`resolved-${selectedScenario.id}`}
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.22, ease: easeOut }}
                      className="mt-5 space-y-5"
                    >
                      {/* Diagnostic Banner */}
                      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                          <CheckCircle size={15} weight="bold" />
                          <span>Cause racine identifiée ({liveRca ? `${(liveRca.confidence * 100).toFixed(1)}%` : '99.4%'} de confiance)</span>
                        </div>
                        <p className="text-sm text-zinc-200 font-medium whitespace-pre-line">
                          {liveRca?.rcaSummary || selectedScenario.rcaAnalysis.rootCause}
                        </p>
                      </div>

                      {/* Code Location & Fix Action */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 space-y-1">
                          <span className="text-zinc-500 text-xs">Fichier source :</span>
                          <div className="text-zinc-200 font-mono truncate">
                            {selectedScenario.rcaAnalysis.culpritFile}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 space-y-1">
                          <span className="text-zinc-500 text-xs">Équipe assignée :</span>
                          <div className="text-emerald-400 font-medium">
                            {selectedScenario.rcaAnalysis.assignedTeam}
                          </div>
                        </div>
                      </div>

                      {/* Copilot Action Plan */}
                      <div className="p-4 rounded-xl bg-zinc-900/70 border border-white/10 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <Sparkle size={14} className="text-amber-400" />
                          <span>Plan de remédiation recommandé</span>
                        </div>
                        <div className="text-xs text-zinc-300 font-mono bg-black/40 p-2.5 rounded border border-white/5">
                          → {selectedScenario.rcaAnalysis.fixAction}
                        </div>
                      </div>

                      {/* Transversal sync note */}
                      <div className="text-xs text-zinc-500 flex items-center gap-2 pt-2">
                        <GitBranch size={14} className="text-zinc-400" />
                        <span>Post-Mortem synchronisé automatiquement avec le Wiki interne à la clôture.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status footer bar */}
              <div className="pt-4 mt-6 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-500">
                <span>Statut : {stage === 'resolved' ? 'Analyse terminée' : 'En veille'}</span>
                <span>Groq Llama-3.3-70B</span>
              </div>
            </div>

          </div>

        </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
