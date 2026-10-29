import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  WarningCircle,
  CheckCircle,
  Timer,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  ArrowsClockwise,
  Broadcast,
  Fire,
  ChartLineUp,
  Sliders,
  CaretRight,
  Lightning,
  Sparkle,
} from '@phosphor-icons/react';
import { ClusterTopologyWebGL } from './ClusterTopologyWebGL';
import { ScrollReveal, StaggerGrid, StaggerItem } from '../ScrollReveal';
import { useRole } from '../../context/RoleContext';

interface DashboardViewProps {
  onNavigateToTicket: (ticketId?: string) => void;
  onNavigateToIncidents: () => void;
  onNavigateToCreate: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToTicket,
  onNavigateToIncidents,
  onNavigateToCreate,
}) => {
  const { incidents } = useRole();
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7j' | '30j'>('24h');
  const [slaCountdown, setSlaCountdown] = useState<number>(862); // 14m 22s in seconds

  // Live ticking countdown for the SLA risk
  useEffect(() => {
    const interval = setInterval(() => {
      setSlaCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const urgentIncidents = incidents.slice(0, 4).map((inc) => ({
    id: inc.id,
    title: inc.title,
    priority: inc.priority,
    slaRemaining: inc.priority === 'P1' ? formatCountdown(slaCountdown) : '2h 15m',
    slaPercent: inc.priority === 'P1' ? Math.max(10, Math.floor((slaCountdown / 900) * 100)) : 85,
    status: inc.status === 'investigating' ? 'Investigation active' : inc.status === 'open' ? 'Nouveau ticket' : 'Mitigé',
    team: inc.team,
    service: inc.service,
    rcaReady: inc.rcaReady,
    reportedAgo: inc.reportedAt,
  }));

  const serviceMetrics = [
    { name: 'API Gateway (Traefik)', p99: '18ms', qps: '12.2k', uptime: '99.99%', status: 'nominal' },
    { name: 'Auth Vault OAuth2', p99: '12ms', qps: '4.5k', uptime: '99.98%', status: 'nominal' },
    { name: 'Redis Saturn Cluster', p99: '412ms', qps: '28.9k', uptime: '99.71%', status: 'critical' },
    { name: 'PostgreSQL Primary EU', p99: '4ms', qps: '6.2k', uptime: '100%', status: 'nominal' },
    { name: 'Kafka Broker Fleet', p99: '6ms', qps: '42.0k', uptime: '99.99%', status: 'nominal' },
    { name: 'Async Workers Fleet', p99: '14ms', qps: '1.9k', uptime: '99.95%', status: 'nominal' },
  ];

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Page Title & Operational Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs text-zinc-400 tracking-wider uppercase font-semibold">
              Supervision de Production · Sentinel Core
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Tableau de Bord Exécutif & SRE
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Vue synthétique temps réel des incidents de production, métriques de vélocité MTTR et alertes de rupture des engagements SLA contractuels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time range selector */}
          <div className="flex items-center p-1 rounded-lg bg-zinc-900 border border-white/10 font-mono text-xs">
            {(['1h', '24h', '7j', '30j'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Quick Create Incident Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onNavigateToCreate}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-semibold hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-2 shadow-sm font-sans"
          >
            <Lightning size={14} weight="bold" />
            <span>Déclarer une panne</span>
          </motion.button>
        </div>
      </div>

      {/* Critical SLA Warning Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-zinc-900/80 to-zinc-900/60 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-black/40"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
            <WarningCircle size={20} weight="fill" className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-rose-300">
              <span>ALERTE RUPTURE SLA IMMINENTE</span>
              <span className="text-zinc-500">·</span>
              <span className="text-zinc-300">Incident #892 (Saturn Redis)</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Il reste moins de <strong className="text-rose-300 font-mono">{formatCountdown(slaCountdown)}</strong> avant dépassement du SLA contractuel (99.9% disponiblité P1).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="hidden lg:flex flex-col items-end font-mono text-[11px] text-zinc-400">
            <span>Seuil contractuel : 45m</span>
            <span className="text-rose-400 font-bold">{Math.floor((slaCountdown / 900) * 100)}% restant</span>
          </div>
          <button
            onClick={() => onNavigateToTicket('#892')}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500 text-zinc-950 text-xs font-semibold hover:bg-rose-400 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Ouvrir la War Room #892</span>
            <ArrowUpRight size={13} weight="bold" />
          </button>
        </div>
      </motion.div>

      {/* 4 Core Executive Metric Cards */}
      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: MTTR */}
        <StaggerItem>
          <div className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-3">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-emerald-400" />
                MTTR MOYEN
              </span>
              <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px]">
                -24% ce mois
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-white">
                38m 12s
              </span>
              <span className="text-xs text-zinc-500 font-mono">vs 50m cible</span>
            </div>
            <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full w-[76%]" />
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Accélération de 14 min par incident grâce au Root Cause Analysis Groq LPU instantané.
            </p>
          </div>
        </StaggerItem>

        {/* Metric 2: Open Tickets */}
        <StaggerItem>
          <div className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-3">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Broadcast size={15} className="text-blue-400" />
                TICKETS OUVERTS
              </span>
              <span className="text-zinc-400 font-mono text-[11px]">
                Sur 3 clusters
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-white">
                14
              </span>
              <span className="text-xs text-zinc-400 font-mono">actifs en cours</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">2 P1</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">4 P2</span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">8 P3/P4</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              6 tickets en phase de validation post-déploiement de patch.
            </p>
          </div>
        </StaggerItem>

        {/* Metric 3: Critical Emergencies */}
        <StaggerItem>
          <div className="p-5 rounded-xl bg-[#0f0f13] border border-rose-500/20 hover:border-rose-500/40 transition-all space-y-3 bg-gradient-to-b from-rose-950/10 to-transparent">
            <div className="flex items-center justify-between text-rose-300 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Fire size={15} className="text-rose-400 animate-pulse" />
                URGENCES CRITIQUES
              </span>
              <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded text-[11px] border border-rose-500/20">
                P1 ACTIF
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-rose-200">
                02
              </span>
              <span className="text-xs text-zinc-400 font-mono">tickets P1 bloquants</span>
            </div>
            <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full w-[90%] animate-pulse" />
            </div>
            <p className="text-[11px] text-rose-300/80 leading-snug">
              Équipes Core Backend et Infra mobilisées en war-room synchronisée.
            </p>
          </div>
        </StaggerItem>

        {/* Metric 4: Global SLA Compliance */}
        <StaggerItem>
          <div className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-3">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-emerald-400" />
                RESPECT DES SLA
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">
                Objectif 99.0%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-emerald-400">
                99.2%
              </span>
              <span className="text-xs text-zinc-400 font-mono">conforme</span>
            </div>
            <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full w-[99.2%]" />
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              214 sur 216 incidents résolus avant la limite contractuelle sur 30 jours.
            </p>
          </div>
        </StaggerItem>

      </StaggerGrid>

      {/* WebGL 3D Cluster Topology Radar & Microservices Health Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 font-sans">
              Topologie Mesh WebGL & Santé des Microservices
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Visualisation 3D en temps réel des dépendances réseau et flux RPC inter-clusters
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Synchronisation télémétrique continue</span>
          </div>
        </div>

        {/* 3D WebGL Canvas Component */}
        <ClusterTopologyWebGL
          onSelectNode={(node) => {
            if (node.id === 'redis-saturn') {
              onNavigateToTicket('#892');
            }
          }}
        />
      </div>

      {/* Priority Incident Stream & Microservice Health Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Urgency Queue (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-100 font-sans flex items-center gap-2">
              <WarningCircle size={18} className="text-amber-400" />
              <span>File d'Urgences & Risques de Dépassement SLA</span>
            </h2>
            <button
              onClick={onNavigateToIncidents}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Voir les 14 tickets</span>
              <CaretRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {urgentIncidents.map((inc) => (
              <motion.div
                key={inc.id}
                whileHover={{ y: -2 }}
                onClick={() => onNavigateToTicket(inc.id)}
                className={`p-4 rounded-xl bg-[#0f0f13] border transition-all cursor-pointer ${
                  inc.priority === 'P1'
                    ? 'border-rose-500/30 hover:border-rose-500/60 bg-gradient-to-r from-rose-950/20 to-transparent'
                    : 'border-white/[0.08] hover:border-white/[0.16]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-zinc-200">
                      {inc.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                        inc.priority === 'P1'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {inc.priority} - {inc.priority === 'P1' ? 'Critique' : 'Élevée'}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-white/5">
                      {inc.service}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <Timer size={14} className={inc.priority === 'P1' ? 'text-rose-400' : 'text-amber-400'} />
                    <span className="text-zinc-400">SLA restant :</span>
                    <span className={`font-bold ${inc.priority === 'P1' ? 'text-rose-300' : 'text-amber-300'}`}>
                      {inc.slaRemaining}
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-200 hover:text-white transition-colors">
                      {inc.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                      <span>Équipe: {inc.team}</span>
                      <span>·</span>
                      <span>{inc.reportedAgo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {inc.rcaReady && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-teal-950/40 border border-teal-500/30 text-teal-300 text-[11px] font-mono">
                        <Sparkle size={12} weight="fill" className="text-teal-400" />
                        <span>RCA Groq 42ms</span>
                      </span>
                    )}
                    <span className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Microservices Status Matrix (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-100 font-sans flex items-center gap-2">
              <Cpu size={18} className="text-emerald-400" />
              <span>Santé des Microservices</span>
            </h2>
            <span className="text-xs font-mono text-zinc-400">K8s EU-Central</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0f0f13] border border-white/[0.08] space-y-3.5">
            {serviceMetrics.map((svc) => (
              <div
                key={svc.name}
                className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-b-0 text-xs font-mono"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        svc.status === 'nominal'
                          ? 'bg-emerald-400'
                          : 'bg-rose-400 animate-pulse'
                      }`}
                    />
                    <span className="text-zinc-200 font-medium font-sans text-xs">
                      {svc.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 pl-3.5">
                    Débit : {svc.qps} qps
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-bold ${
                      svc.status === 'nominal' ? 'text-zinc-300' : 'text-rose-400'
                    }`}
                  >
                    p99: {svc.p99}
                  </span>
                  <div className="text-[10px] text-zinc-400">
                    Disp. {svc.uptime}
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2 text-center">
              <button
                onClick={onNavigateToIncidents}
                className="text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Exporter télémétrie Prometheus JSON →
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
