import React, { useState, useEffect } from 'react';
import {
  GitMerge,
  ShieldWarning,
  CheckCircle,
  WarningCircle,
  Play,
  Pause,
  ArrowClockwise,
  MagnifyingGlass,
  Terminal,
  Cpu,
} from '@phosphor-icons/react';
import { ScrollReveal } from './ScrollReveal';

interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: 'webhook' | 'security' | 'test' | 'groq';
  source: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details: string;
}

const INITIAL_EVENTS: TelemetryEvent[] = [
  {
    id: 'ev-1',
    timestamp: '10:31:42.102',
    type: 'groq',
    source: 'groq.rca.inference',
    status: 'success',
    message: 'Corrélation automatique des logs achevée en 39ms pour incident #892',
    details: 'Cluster: eu-west-1 · Tokens analysés: 14,250 · Dérive identifiée: Redis Pool Conn timeout',
  },
  {
    id: 'ev-2',
    timestamp: '10:31:38.840',
    type: 'security',
    source: 'trivy.sast.scan',
    status: 'warning',
    message: 'CVE-2024-21626 (medium) détectée dans image docker base runner',
    details: 'Rune container breakout patch disponible · Build non bloquée mais taggée pour revue',
  },
  {
    id: 'ev-3',
    timestamp: '10:31:30.412',
    type: 'webhook',
    source: 'github.actions.deploy',
    status: 'error',
    message: 'Webhook déploiement staging échoué : 504 Gateway Timeout sur /api/deploy',
    details: 'ArgoCD Sync failed · Health status: Degraded · Incident #893 auto-ouvert',
  },
  {
    id: 'ev-4',
    timestamp: '10:31:22.094',
    type: 'test',
    source: 'cypress.e2e.checkout',
    status: 'success',
    message: 'Suite de tests non-régression validée (42/42 tests passés)',
    details: 'Durée: 2m14s · Couverture: 84.2% · Pas de régression détectée sur le parcours panier',
  },
  {
    id: 'ev-5',
    timestamp: '10:31:10.518',
    type: 'security',
    source: 'semgrep.rules.auth',
    status: 'success',
    message: 'Audit statique SAST : 0 faille de niveau critique sur master',
    details: 'Règles OWASP Top 10 vérifiées · Dépendances signées par Cosign',
  },
];

export const TelemetryConsole: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'webhook' | 'security' | 'test'>('all');
  const [events, setEvents] = useState<TelemetryEvent[]>(INITIAL_EVENTS);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<TelemetryEvent | null>(null);

  // Filtered list
  const filteredEvents = events.filter((e) => filter === 'all' || e.type === filter);

  // Periodic new simulated log event if live
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const randomSources = [
        { type: 'webhook', src: 'argocd.sync.webhook', msg: 'Sync completed for namespace production-billing', status: 'success' },
        { type: 'test', src: 'playwright.smoke.api', msg: 'Healthcheck API returned 200 OK (latency 14ms)', status: 'success' },
        { type: 'security', src: 'trivy.image.scan', msg: 'Image digest sha256:4f8e verified without vulnerabilities', status: 'success' },
      ] as const;
      const pick = randomSources[Math.floor(Math.random() * randomSources.length)];
      const d = new Date();
      const timeStr = d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');

      const newEv: TelemetryEvent = {
        id: 'ev-' + Date.now(),
        timestamp: timeStr,
        type: pick.type,
        source: pick.src,
        status: pick.status,
        message: pick.msg,
        details: 'Événement télémétrique intercepté en continu via la sonde Sentinel eBPF.',
      };

      setEvents((prev) => [newEv, ...prev.slice(0, 9)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <section id="supervision" className="py-24 bg-[#070709] relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal>
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Supervision CI/CD & Sécurité en continu
            </h2>
            <p className="mt-3 text-base text-zinc-400 leading-relaxed max-w-[65ch]">
              Visualisez en direct les alertes automatisées : webhooks de déploiement, scans de vulnérabilités Trivy et suites de tests end-to-end.
            </p>
          </div>
        </ScrollReveal>

        {/* Live Terminal / Telemetry Box */}
        <ScrollReveal delay={0.15}>
          <div className="rounded-2xl border border-white/10 bg-[#060608] shadow-2xl overflow-hidden font-mono text-xs">
          
          {/* Top Controls Toolbar */}
          <div className="p-3.5 sm:p-4 bg-zinc-900/60 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            
            {/* Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-zinc-500 text-xs mr-2 font-sans font-medium">Filtres :</span>
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  filter === 'all'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                Tous les flux ({events.length})
              </button>
              <button
                onClick={() => setFilter('webhook')}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  filter === 'webhook'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                Webhooks CI/CD
              </button>
              <button
                onClick={() => setFilter('security')}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  filter === 'security'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                Scans Sécurité
              </button>
              <button
                onClick={() => setFilter('test')}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  filter === 'test'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                Tests E2E
              </button>
            </div>

            {/* Live streaming status & Toggle button */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-sans">
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                <span>{isLive ? 'Flux direct' : 'En pause'}</span>
              </div>
              <button
                onClick={() => setIsLive(!isLive)}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5 transition-colors cursor-pointer"
                title={isLive ? 'Mettre en pause' : 'Reprendre le flux'}
              >
                {isLive ? <Pause size={14} /> : <Play size={14} />}
              </button>
            </div>

          </div>

          {/* Event Stream Listing */}
          <div className="divide-y divide-white/[0.04] max-h-[380px] overflow-y-auto">
            {filteredEvents.map((ev) => {
              const isSelected = selectedEvent?.id === ev.id;
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvent(isSelected ? null : ev)}
                  className={`p-3.5 sm:px-5 hover:bg-zinc-900/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isSelected ? 'bg-zinc-900/70 border-l-2 border-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status badge */}
                    {ev.status === 'success' && (
                      <span className="text-emerald-400 shrink-0">
                        <CheckCircle size={15} weight="bold" />
                      </span>
                    )}
                    {ev.status === 'warning' && (
                      <span className="text-amber-400 shrink-0">
                        <WarningCircle size={15} weight="bold" />
                      </span>
                    )}
                    {ev.status === 'error' && (
                      <span className="text-rose-400 shrink-0">
                        <ShieldWarning size={15} weight="bold" />
                      </span>
                    )}

                    <span className="text-zinc-500 text-[11px] tabular-nums">{ev.timestamp}</span>

                    <span className="text-zinc-400 text-xs font-semibold px-1.5 py-0.5 rounded bg-zinc-800/80">
                      {ev.source}
                    </span>

                    <span className="text-zinc-200 text-xs truncate max-w-md">
                      {ev.message}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 sm:justify-end text-[11px] text-zinc-500">
                    <span className="capitalize">{ev.type}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-emerald-400 hover:underline">
                      {isSelected ? 'Masquer' : 'Inspecter'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inspected Event Details Box */}
          {selectedEvent && (
            <div className="p-4 bg-zinc-950 border-t border-white/[0.08] space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Détail du paquet télémétrie · {selectedEvent.id}</span>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  Fermer [ESC]
                </button>
              </div>
              <div className="p-3 rounded bg-[#030305] border border-white/5 text-zinc-300 text-xs">
                {selectedEvent.details}
              </div>
            </div>
          )}

          {/* Bottom Telemetry Metrics Strip */}
          <div className="p-3 bg-zinc-900/40 border-t border-white/[0.08] flex flex-wrap items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-4">
              <span>Sonde eBPF : Active</span>
              <span>Buffer logs : 0 drop</span>
              <span>Inférence Groq : ~42ms</span>
            </div>
            <div className="text-zinc-500">
              Cliquez sur un log pour inspecter la charge utile
            </div>
          </div>

        </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
