import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GitBranch,
  ShieldCheck,
  Warning,
  Bug,
  CheckCircle,
  Clock,
  ArrowsClockwise,
  Play,
  FileCode,
  LockKey,
  Cpu,
  Pulse,
  Broadcast,
  ArrowUpRight,
  Sparkle,
} from '@phosphor-icons/react';
import { PipelineStreamWebGL } from './PipelineStreamWebGL';
import { ScrollReveal, StaggerGrid, StaggerItem } from '../ScrollReveal';

export const SupervisionDevSecOpsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'webhooks' | 'cve' | 'tests'>('webhooks');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const [failedWebhooks, setFailedWebhooks] = useState([
    {
      id: 'wh-902',
      service: 'cart-service-prod',
      target: 'ArgoCD Sync Hook',
      cluster: 'k8s-prod-eu1',
      statusCode: '504 Gateway Timeout',
      timestamp: 'Il y a 18 min',
      errorMsg: 'Webhook timeout after 30000ms: ArgoCD application synchronization stalled on image pull.',
      retried: false,
    },
    {
      id: 'wh-899',
      service: 'auth-vault-staging',
      target: 'GitHub Deployment Dispatcher',
      cluster: 'security-core',
      statusCode: '401 Unauthorized',
      timestamp: 'Il y a 42 min',
      errorMsg: 'HMAC signature verification failed on x-hub-signature-256 header. Secret key rotated.',
      retried: false,
    },
    {
      id: 'wh-894',
      service: 'notification-worker',
      target: 'GitLab CI Webhook Runner',
      cluster: 'k8s-prod-eu2',
      statusCode: '500 Internal Error',
      timestamp: 'Il y a 1h 10m',
      errorMsg: 'Kafka cluster connection refused during post-deployment smoke test event emission.',
      retried: false,
    },
  ]);

  const vulnerabilities = [
    {
      cveId: 'CVE-2024-41110',
      severity: 'CRITIQUE',
      score: '9.8',
      component: 'docker.io/library/docker:26.1.4-dind',
      service: 'CI Runner Fleet',
      description: 'Contournement du plugin d’autorisation Docker Engine via requêtes Content-Length=0 malveillantes.',
      fixAvailable: 'Mise à jour vers v26.1.5 disponible',
      suggestedPR: 'bump(docker): update base runner image from 26.1.4 to 26.1.5',
    },
    {
      cveId: 'CVE-2024-38816',
      severity: 'ÉLEVÉE',
      score: '7.5',
      component: 'org.springframework:spring-webmvc:6.1.10',
      service: 'payment-gateway',
      description: 'Vulnérabilité Path Traversal sur le traitement des ressources statiques configurées sans base-path.',
      fixAvailable: 'Mise à niveau Spring Boot v3.3.4 recommandée',
      suggestedPR: 'security(deps): patch spring-webmvc to 6.1.11',
    },
    {
      cveId: 'CVE-2024-21538',
      severity: 'MOYENNE',
      score: '5.3',
      component: 'npm:cross-spawn:7.0.3',
      service: 'build-scripts',
      description: 'ReDoS possible lors du parsing de commandes Windows contenant des caractères d’échappement.',
      fixAvailable: 'Mise à jour v7.0.6 testée et validée',
      suggestedPR: 'fix(deps): bump cross-spawn from 7.0.3 to 7.0.6',
    },
  ];

  const automatedTests = [
    {
      name: 'Playwright E2E · Tunnel d’Achat & Réservation Panier',
      duration: '42s',
      status: 'passed',
      totalAssertions: 84,
      failedCount: 0,
    },
    {
      name: 'K6 Load Test · Saturation 20k RPS sur Traefik Ingress',
      duration: '2m 10s',
      status: 'passed',
      totalAssertions: 120,
      failedCount: 0,
    },
    {
      name: 'Chaos Mesh · Injection de perte de paquets Redis (30% drop)',
      duration: '1m 30s',
      status: 'warning',
      totalAssertions: 15,
      failedCount: 1,
      note: 'Délai de bascule Sentinel évalué à 18s (cible < 15s)',
    },
    {
      name: 'Semgrep SAST · Contrôle des fuites de tokens & secrets dans PR',
      duration: '14s',
      status: 'passed',
      totalAssertions: 320,
      failedCount: 0,
    },
  ];

  const handleRetryWebhook = (id: string) => {
    setRetryingId(id);
    setTimeout(() => {
      setRetryingId(null);
      setFailedWebhooks((prev) =>
        prev.map((wh) =>
          wh.id === id
            ? { ...wh, retried: true, statusCode: '200 OK (Relancé avec succès)' }
            : wh
        )
      );
    }, 1200);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-mono text-xs text-zinc-400 tracking-wider uppercase font-semibold">
              Supervision Automatisée · Observabilité DevSecOps
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Supervision CI/CD & Sécurité
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Surveillance en temps réel des webhooks de déploiement, des alertes de vulnérabilité de conteneurs et des résultats de tests automatisés.
          </p>
        </div>

        {/* Global Pipeline Health Status */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-center">
            <div className="text-emerald-400 font-bold text-base">98.6%</div>
            <div className="text-[10px] text-zinc-500">Taux de succès CI</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-center">
            <div className="text-rose-400 font-bold text-base">3</div>
            <div className="text-[10px] text-zinc-500">Webhooks échoués</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-center">
            <div className="text-amber-400 font-bold text-base">1</div>
            <div className="text-[10px] text-zinc-500">CVE critique</div>
          </div>
        </div>
      </div>

      {/* 3D WebGL Pipeline Flow */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="font-semibold text-zinc-300">Flux d'Exécution DevSecOps 3D Interactif</span>
          <span>Trois dimensions · Visualisation des goulets d'étranglement</span>
        </div>
        <PipelineStreamWebGL />
      </div>

      {/* Navigation Tabs for the 3 Streams */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0f0f13] border border-white/[0.08] text-xs font-mono">
        {[
          { id: 'webhooks', label: '1. Webhooks & Déploiements Échoués', count: failedWebhooks.filter(w => !w.retried).length },
          { id: 'cve', label: '2. Scans de Vulnérabilité & CVEs', count: vulnerabilities.length },
          { id: 'tests', label: '3. Tests Automatisés & Chaos Engineering', count: automatedTests.length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-4 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-zinc-800 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${isActive ? 'bg-cyan-950/60 text-cyan-300' : 'bg-zinc-900 text-zinc-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Failed Webhooks */}
      {activeTab === 'webhooks' && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-zinc-400 px-1">
            Webhooks rejetés par les orchestrateurs ou clusters de destination
          </div>

          <div className="space-y-3">
            {failedWebhooks.map((wh) => (
              <div
                key={wh.id}
                className={`p-5 rounded-xl bg-[#0f0f13] border transition-all ${
                  wh.retried
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-rose-500/30 bg-gradient-to-r from-rose-950/15 via-[#0f0f13] to-[#0f0f13]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-white">{wh.id}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        wh.retried
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {wh.statusCode}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/5">
                      {wh.service}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                    <span>{wh.cluster}</span>
                    <span>·</span>
                    <span>{wh.timestamp}</span>
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-zinc-400">
                      Cible : <strong className="text-zinc-200">{wh.target}</strong>
                    </div>
                    <p className="text-xs text-zinc-300 font-mono bg-zinc-950/60 p-2.5 rounded border border-white/5">
                      {wh.errorMsg}
                    </p>
                  </div>

                  {!wh.retried && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      disabled={retryingId === wh.id}
                      onClick={() => handleRetryWebhook(wh.id)}
                      className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-zinc-200 text-xs font-mono font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {retryingId === wh.id ? (
                        <>
                          <ArrowsClockwise size={13} className="animate-spin" />
                          <span>Rejeu en cours...</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} weight="fill" />
                          <span>Rejouer le webhook</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Security Scans & CVEs */}
      {activeTab === 'cve' && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-zinc-400 px-1">
            Résultats d'analyse Trivy, Snyk et Semgrep sur les images conteneurs
          </div>

          <div className="space-y-3">
            {vulnerabilities.map((vuln) => (
              <div
                key={vuln.cveId}
                className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-white">{vuln.cveId}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        vuln.severity === 'CRITIQUE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : vuln.severity === 'ÉLEVÉE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {vuln.severity} (CVSS {vuln.score})
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400">
                      Composant : <code className="text-zinc-200">{vuln.component}</code>
                    </span>
                  </div>

                  <span className="text-xs font-mono text-zinc-500">Service : {vuln.service}</span>
                </div>

                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {vuln.description}
                </p>

                <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle size={15} />
                    <span>Correctif recommandé : {vuln.fixAvailable}</span>
                  </div>

                  <button
                    onClick={() => {
                      alert(`PR générée automatiquement : ${vuln.suggestedPR}`);
                    }}
                    className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-zinc-200 transition-colors cursor-pointer text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkle size={13} weight="fill" className="text-emerald-400" />
                    <span>Créer PR de fix automatique</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Automated Tests & Chaos */}
      {activeTab === 'tests' && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-zinc-400 px-1">
            Résultats des suites de tests de charge, d'intégration E2E et de résilience Chaos Mesh
          </div>

          <div className="space-y-3">
            {automatedTests.map((test, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] hover:border-white/[0.14] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        test.status === 'passed' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                    <h4 className="text-sm font-semibold text-zinc-200 font-sans">
                      {test.name}
                    </h4>
                  </div>
                  {test.note && (
                    <p className="text-xs text-amber-300 font-mono pl-4">
                      Observation : {test.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6 font-mono text-xs shrink-0">
                  <div className="text-right">
                    <div className="text-zinc-200 font-bold">{test.totalAssertions} assertions</div>
                    <div className="text-[11px] text-zinc-500">
                      {test.failedCount === 0 ? '0 échec' : `${test.failedCount} alerte`}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-zinc-200 font-bold">{test.duration}</div>
                    <div className="text-[11px] text-zinc-500">Durée d'exécution</div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                      test.status === 'passed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {test.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
