import React, { useState } from 'react';
import {
  CheckCircle,
  ArrowRight,
  Terminal,
} from '@phosphor-icons/react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ScrollReveal, StaggerGrid, StaggerItem } from './ScrollReveal';

interface Step {
  id: number;
  label: string;
  labelTitle: string;
  title: string;
  description: string;
  tag: string;
  metric: string;
  detail: {
    title: string;
    items: string[];
    terminalPreview?: string;
  };
}

const STEPS: Step[] = [
  {
    id: 1,
    label: '01',
    labelTitle: 'Signalement',
    title: 'Déclaration décloisonnée & Ingestion automatique',
    description:
      'Les équipes métier (Support, Vente, Produit) disposent d\'un formulaire guidé sans jargon technique, pendant que les webhooks CI/CD interceptent les pannes d\'infrastructure.',
    tag: 'Entrée Universelle',
    metric: '< 1 min pour déclarer',
    detail: {
      title: 'Canaux d\'ingestion pris en charge :',
      items: [
        'Formulaire guidé pour équipes non-techniques avec upload de captures',
        'Webhooks GitHub Actions, GitLab CI & ArgoCD pour les échecs de déploiement',
        'Alerting direct via Slack bot & connecteurs Datadog / Prometheus',
      ],
      terminalPreview: 'POST /api/v1/incidents/ingest -> 201 Created [Origin: Support-Portal]',
    },
  },
  {
    id: 2,
    label: '02',
    labelTitle: 'Analyse Groq',
    title: 'Root Cause Analysis (RCA) par IA ultra-rapide',
    description:
      'Le moteur d\'inférence Groq LPU corrèle des dizaines de milliers de lignes de logs en moins de 50ms, éliminant les heures passées à fouiller les traces Kubernetes.',
    tag: 'Inférence LPU 42ms',
    metric: 'RCA en 42ms',
    detail: {
      title: 'Capacités du moteur d\'analyse :',
      items: [
        'Détection automatique de la régression de code et de la PR incriminée',
        'Synthèse en langage clair de l\'impact utilisateur et des services touchés',
        'Calcul immédiat du délai de dépassement de SLA pour priorisation',
      ],
      terminalPreview: 'groq.rca.infer(logs, commit_history) -> confidence: 0.994 [Time: 42ms]',
    },
  },
  {
    id: 3,
    label: '03',
    labelTitle: 'Résolution',
    title: 'Espace de crise collaboratif & Copilote',
    description:
      'Une vue ticket unifiée où Développeurs, Équipes Sécurité et Testeurs collaborent avec un Copilote conversationnel qui propose les commandes de patch et rollbacks.',
    tag: 'Collaboration Temps Réel',
    metric: '-68% de MTTR',
    detail: {
      title: 'Fonctionnalités de l\'espace ticket :',
      items: [
        'Chatbot Copilote pour générer des scripts de contournement et vérifier les dépendances',
        'Timeline interactive des changements d\'état (Ouvert → En cours → Résolu)',
        'Permissions strictes RBAC selon le rôle de l\'intervenant',
      ],
      terminalPreview: 'copilot.suggestFix() -> "Execute canary rollback: kubectl rollout undo..."',
    },
  },
  {
    id: 4,
    label: '04',
    labelTitle: 'Post-Mortem',
    title: 'Capitalisation continue & Wiki Post-Mortem',
    description:
      'Dès la fermeture de l\'incident, Sentinel rédige automatiquement le rapport post-mortem complet (timeline, impact, remédiations) et le publie dans la base de connaissances.',
    tag: 'Base de Connaissances',
    metric: '0 paperasse manuelle',
    detail: {
      title: 'Génération de la mémoire technique :',
      items: [
        'Chronologie certifiée des événements et actions entreprises',
        'Check-list d\'actions préventives assignées automatiquement dans Jira/GitLab',
        'Moteur de recherche sémantique pour retrouver les incidents similaires passés',
      ],
      terminalPreview: 'wiki.postmortem.publish(incident_id=892) -> Saved to Knowledge Base',
    },
  },
];

export const LifecyclePipeline: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const currentStep = STEPS.find((s) => s.id === activeStep) || STEPS[0];

  const shouldReduceMotion = useReducedMotion();
  const easeOut = [0.23, 1, 0.32, 1] as const;

  return (
    <section id="lifecycle" className="py-24 bg-[#070709] relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal>
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              De la panne au post-mortem : Un cycle fluide
            </h2>
            <p className="mt-3 text-base text-zinc-400 leading-relaxed max-w-[65ch]">
              Comment Sentinel transforme chaque incident en un flux d'ingénierie continu, transparent et sans cloisonnement entre équipes techniques et métier.
            </p>
          </div>
        </ScrollReveal>

        {/* Step Navigation Tabs */}
        <StaggerGrid className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {STEPS.map((step) => {
            const isActive = step.id === activeStep;
            return (
              <StaggerItem key={step.id}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all border cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-zinc-900 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                      : 'bg-zinc-950/60 border-white/[0.06] hover:bg-zinc-900/60 hover:border-white/10'
                  }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="pipeline-active-indicator"
                      className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-mono text-xs font-bold ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                      {step.metric}
                    </span>
                  </div>
                  <div className={`text-xs font-mono tracking-wider uppercase font-semibold ${isActive ? 'text-zinc-200' : 'text-zinc-400'}`}>
                    {step.labelTitle}
                  </div>
                </motion.button>
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        {/* Detailed Active Step Stage */}
        <ScrollReveal delay={0.15}>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: easeOut }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Content */}
                <div className="lg:col-span-7 space-y-6">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                    {currentStep.title}
                  </h3>

                  <p className="text-base text-zinc-300 leading-relaxed max-w-[60ch]">
                    {currentStep.description}
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                      {currentStep.detail.title}
                    </div>
                    <ul className="space-y-2.5">
                      {currentStep.detail.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-300">
                          <CheckCircle size={18} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Visual Console */}
                <div className="lg:col-span-5">
                  <div className="rounded-xl bg-[#050507] border border-white/10 p-5 font-mono text-xs space-y-4 shadow-inner">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-zinc-500">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <Terminal size={14} />
                        <span>sentinel.engine.stream</span>
                      </span>
                      <span className="text-[11px] font-sans text-emerald-400 font-medium">Actif</span>
                    </div>

                    <div className="space-y-2 text-zinc-400 text-xs leading-relaxed">
                      <div className="text-zinc-600">// Processus d'étape activé</div>
                      <div className="text-emerald-400 font-medium">
                        {currentStep.detail.terminalPreview}
                      </div>
                      <div className="text-zinc-500 text-[11px] pt-2">
                        {currentStep.id === 1 && 'Audit des permissions: RBAC anonymisé pour la déclaration publique.'}
                        {currentStep.id === 2 && 'Modèle Groq: Llama-3.3-70B optimisé pour l\'ingénierie de fiabilité (SRE).'}
                        {currentStep.id === 3 && 'Sécurité: Chiffrement de bout en bout des logs et traces de débogage.'}
                        {currentStep.id === 4 && 'Intégration Wiki: Export Markdown certifié vers le référentiel interne.'}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Latence : &lt; 50ms</span>
                      <button
                        onClick={() => setActiveStep((prev) => (prev % 4) + 1)}
                        className="text-zinc-300 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Étape suivante</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
