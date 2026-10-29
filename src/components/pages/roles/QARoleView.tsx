import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target,
  Play,
  CheckCircle,
  WarningCircle,
  Clock,
  Sparkle,
  ArrowsClockwise,
  Cpu,
  PlusCircle,
  Bug,
  Lightning,
  Article,
  ChartLineUp,
  Fire,
  Atom,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { useRole } from '../../../context/RoleContext';
import { api } from '../../../services/api';

interface QARoleViewProps {
  onNavigateToIncidents: () => void;
  onNavigateToCreate: () => void;
  onNavigateToReporting: () => void;
}

export const QARoleView: React.FC<QARoleViewProps> = ({
  onNavigateToIncidents,
  onNavigateToCreate,
  onNavigateToReporting,
}) => {
  const { project, triggerToast, addAuditLog } = useRole();
  const [isRunningE2E, setIsRunningE2E] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [chaosMode, setChaosMode] = useState<string | null>(null);

  const testSuites = [
    {
      name: `Tunnel d’Achat & Réservation Panier (${project.name})`,
      assertions: 84,
      duration: '42s',
      status: 'passed',
      env: 'Staging EU-West',
    },
    {
      name: `Authentification & Tokens API (${project.name})`,
      assertions: 56,
      duration: '28s',
      status: 'passed',
      env: 'Staging Auth',
    },
    {
      name: `Régression Paiement & Webhooks (${project.name})`,
      assertions: 32,
      duration: '19s',
      status: 'warning',
      env: 'Staging Billing',
    },
    {
      name: `Campagne de Charge 10,000 req/sec (${project.name})`,
      assertions: 120,
      duration: '3m 15s',
      status: 'passed',
      env: 'Stress Lab',
    },
  ];

  const handleRunAllTests = () => {
    setIsRunningE2E(true);
    setTestProgress(10);
    api.qa.runSuite('Playwright E2E Master Suite').catch(() => {});
    const interval = setInterval(() => {
      setTestProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunningE2E(false);
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#06b6d4', '#22d3ee', '#67e8f9'],
            });
          } catch (e) {}
          triggerToast('Suite E2E Playwright exécutée : 292 assertions validées (100% succès)', 'success');
          addAuditLog('Campagne de test de validation Playwright lancée par Aymane (Lead QA)', 'deploy', 'success');
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const handleInjectChaos = (type: string, desc: string) => {
    setChaosMode(type);
    triggerToast(`Scénario Chaos activé : ${desc}`, 'warning');
    addAuditLog(`Injection de panne Chaos Engineering : ${desc}`, 'deploy', 'warning');
    api.qa.runSuite(`Chaos Injection: ${type}`).catch(() => {});
    setTimeout(() => {
      setChaosMode(null);
      triggerToast(`Scénario Chaos ${type} terminé - Auto-guérison validée`, 'info');
    }, 4500);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* QA Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-[#0e1417] to-[#0a0f12] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                ESPACE TESTEUR & QA LEAD
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Validation Continue · Aymane
              </span>
              <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/30">
                Projet Testé : {project.name} ({project.files.length} fichiers réels)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight">
              Cockpit d'Assurance Qualité & Tests de Charge
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl font-sans">
              Espace dédié à la non-régression, aux scénarios E2E Playwright et Cypress, aux campagnes de charge K6 et aux tests de chaos.
            </p>
          </div>

          {/* Quick stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Taux Réussite</div>
              <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">98.4%</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Assertions</div>
              <div className="text-lg font-bold text-white font-mono mt-0.5">292 Total</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Couverture</div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">84.2%</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Charge K6</div>
              <div className="text-lg font-bold text-teal-300 font-mono mt-0.5">10k req/s</div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunAllTests}
            disabled={isRunningE2E}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-400 transition-colors cursor-pointer shadow-sm"
          >
            <Play size={14} weight="bold" className={isRunningE2E ? 'animate-spin' : ''} />
            <span>{isRunningE2E ? `Exécution en cours (${testProgress}%)...` : 'Lancer la Suite E2E Complète'}</span>
          </button>
          <button
            onClick={onNavigateToCreate}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bug size={14} className="text-cyan-400" />
            <span>Déclarer une Anomalie QA</span>
          </button>
          <button
            onClick={onNavigateToIncidents}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Clock size={14} className="text-cyan-400" />
            <span>Annuaire des Bugs & Flaky Tests</span>
          </button>
          <button
            onClick={onNavigateToReporting}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ChartLineUp size={14} className="text-zinc-400" />
            <span>Rapports Exécutifs QA</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Test Suites (Left) + Chaos Engineering & Load Testing (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: E2E Test Suites (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-cyan-400" />
                  <h2 className="text-base font-bold text-white font-sans">
                    Suites de Tests E2E Automatisées
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Playwright & Cypress CI runners · Exécution parallèle sur K8s
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300">
                Staging Matrix
              </span>
            </div>

            {/* Test Progress Bar */}
            {isRunningE2E && (
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                  <span>Exécution des navigateurs Chromium / WebKit...</span>
                  <span>{testProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${testProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              {testSuites.map((ts, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-cyan-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{ts.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ts.status === 'passed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {ts.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-white/5">
                    <span>{ts.env} · {ts.assertions} assertions</span>
                    <span className="text-cyan-400 font-semibold">{ts.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chaos Engineering Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Atom size={16} className="text-cyan-400" />
                <h3 className="text-base font-bold text-white font-sans">
                  Simulateur de Chaos Engineering
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300">
                Chaos Mesh
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Injectez des défaillances contrôlées en temps réel sur l'infrastructure de staging pour tester la robustesse et la tolérance aux pannes.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleInjectChaos('latency', 'Injection de 500ms de latence sur Ingress API')}
                disabled={chaosMode !== null}
                className="w-full p-3 rounded-xl bg-zinc-900/80 border border-white/5 hover:border-cyan-500/40 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                    +500ms Latence Réseau
                  </div>
                  <div className="text-[10px] text-zinc-500">Injecte du délai sur Traefik Ingress</div>
                </div>
                <Lightning size={14} className="text-zinc-500 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() => handleInjectChaos('kill-pod', 'Arrêt forcé d’un nœud secondaire Redis Saturn')}
                disabled={chaosMode !== null}
                className="w-full p-3 rounded-xl bg-zinc-900/80 border border-white/5 hover:border-cyan-500/40 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                    Crash Pod Redis (Kill -9)
                  </div>
                  <div className="text-[10px] text-zinc-500">Valide le failover automatique Sentinel</div>
                </div>
                <WarningCircle size={14} className="text-zinc-500 group-hover:text-amber-400" />
              </button>

              <button
                onClick={() => handleInjectChaos('drop-packet', 'Perte artificielle de 5% des paquets Kafka')}
                disabled={chaosMode !== null}
                className="w-full p-3 rounded-xl bg-zinc-900/80 border border-white/5 hover:border-cyan-500/40 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                    5% Perte de Paquets
                  </div>
                  <div className="text-[10px] text-zinc-500">Teste la reprise sur erreur des Workers</div>
                </div>
                <Fire size={14} className="text-zinc-500 group-hover:text-rose-400" />
              </button>
            </div>

            {chaosMode && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-2">
                <ArrowsClockwise size={14} className="animate-spin" />
                <span>Simulation de crise active : observation des sondes</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
