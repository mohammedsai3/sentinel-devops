import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ChartLineUp,
  DownloadSimple,
  FilePdf,
  FileCsv,
  Calendar,
  Clock,
  WarningCircle,
  ShieldCheck,
  CheckCircle,
  CurrencyEur,
  Sparkle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft,
  TrendDown,
} from '@phosphor-icons/react';
import { ScrollReveal, StaggerGrid, StaggerItem } from '../ScrollReveal';

export const ExecutiveReportingView: React.FC<{ onBackToDashboard: () => void }> = ({
  onBackToDashboard,
}) => {
  const [period, setPeriod] = useState<'2026-ytd' | 'q3-2026' | 'oct-2026' | '2025'>('2026-ytd');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // 12-month MTTR trend data
  const monthlyMttrData = [
    { month: 'Nov 25', mttrMinutes: 64, p1Count: 4, label: '64m' },
    { month: 'Déc 25', mttrMinutes: 61, p1Count: 3, label: '61m' },
    { month: 'Jan 26', mttrMinutes: 58, p1Count: 3, label: '58m' },
    { month: 'Fév 26', mttrMinutes: 55, p1Count: 2, label: '55m' },
    { month: 'Mar 26', mttrMinutes: 51, p1Count: 2, label: '51m' },
    { month: 'Avr 26', mttrMinutes: 48, p1Count: 1, label: '48m' },
    { month: 'Mai 26', mttrMinutes: 45, p1Count: 2, label: '45m' },
    { month: 'Juin 26', mttrMinutes: 44, p1Count: 2, label: '44m' },
    { month: 'Juil 26', mttrMinutes: 41, p1Count: 1, label: '41m' },
    { month: 'Août 26', mttrMinutes: 40, p1Count: 0, label: '40m' },
    { month: 'Sep 26', mttrMinutes: 39, p1Count: 1, label: '39m' },
    { month: 'Oct 26', mttrMinutes: 38, p1Count: 2, label: '38m' },
  ];

  const rootCauseBreakdown = [
    { category: 'Saturation de pools de cache (Redis / DB)', share: 34, count: 18, color: 'bg-emerald-400' },
    { category: 'Expiration de certificats SSL & Webhooks', share: 24, count: 13, color: 'bg-amber-400' },
    { category: 'Timeouts réseau Ingress & Backlog TCP', share: 18, count: 10, color: 'bg-cyan-400' },
    { category: 'Régressions de schéma API & Payload désérialisation', share: 14, count: 7, color: 'bg-purple-400' },
    { category: 'OOMKilled & Débordement mémoire de pods', share: 10, count: 5, color: 'bg-rose-400' },
  ];

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      setIsExportingPdf(false);
      alert('Rapport Exécutif Sentinel (PDF) généré avec succès pour le Comité de Direction.');
    }, 1200);
  };

  const handleExportCsv = () => {
    setIsExportingCsv(true);
    setTimeout(() => {
      setIsExportingCsv(false);
      alert('Export CSV des métriques mensuelles 2026 téléchargé.');
    }, 800);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Return & Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Retour au tableau de bord</span>
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs text-zinc-400 tracking-wider uppercase font-semibold">
              Gouvernance & Reporting Exécutif · Données Historiques
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Rapports Analytiques & Évolution MTTR
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Consolidation mensuelle et annuelle des métriques d'incidents, impact financier de la disponibilité et indicateurs clés pour la direction générale.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center p-1 rounded-lg bg-zinc-900 border border-white/10 font-mono text-xs">
            {[
              { id: '2026-ytd', label: 'Année 2026' },
              { id: 'q3-2026', label: 'Q3 2026' },
              { id: 'oct-2026', label: 'Octobre 2026' },
              { id: '2025', label: '2025 (Archive)' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  period === p.id
                    ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Export PDF Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold font-sans transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <FilePdf size={15} weight="bold" />
            <span>{isExportingPdf ? 'Génération PDF...' : 'Rapport PDF Direction'}</span>
          </motion.button>

          {/* Export CSV Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            className="px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileCsv size={15} />
            <span>CSV</span>
          </motion.button>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Annual MTTR Improvement */}
        <StaggerItem>
          <div className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-emerald-400" />
                MTTR MOYEN ACTUEL
              </span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px] flex items-center gap-1">
                <TrendDown size={12} weight="bold" />
                <span>-38% vs 2025</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-white">
                38m 12s
              </span>
              <span className="text-xs text-zinc-500 font-mono">vs 62m début 2026</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Gain moyen de 24 minutes par incident grâce au pré-diagnostic Groq LPU et au copilote automatisé.
            </p>
          </div>
        </StaggerItem>

        {/* Card 2: Annual P1 Emergencies */}
        <StaggerItem>
          <div className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <WarningCircle size={15} className="text-rose-400" />
                INCIDENTS CRITIQUES (P1)
              </span>
              <span className="text-zinc-400 font-mono text-[11px]">Sur 12 mois</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-zinc-100">
                18
              </span>
              <span className="text-xs text-zinc-500 font-mono">incidents P1 total</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <CheckCircle size={13} weight="fill" />
              <span>100% résolus avant pénalité financière</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Aucune rupture d'astreinte contractuelle de plus de 45 min enregistrée cette année.
            </p>
          </div>
        </StaggerItem>

        {/* Card 3: Uptime SLA Compliance */}
        <StaggerItem>
          <div className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-teal-400" />
                DISPONIBILITÉ GLOBALE
              </span>
              <span className="text-teal-400 font-mono text-[11px]">Cible 99.90%</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-teal-300">
                99.982%
              </span>
              <span className="text-xs text-zinc-500 font-mono">3 neuf 8</span>
            </div>
            <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-400 h-full rounded-full w-[99.98%]" />
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Temps d'arrêt cumulé annuel inférieur à 1 heure et 35 minutes sur l'ensemble des clusters.
            </p>
          </div>
        </StaggerItem>

        {/* Card 4: Financial Value / Avoided Cost */}
        <StaggerItem>
          <div className="p-5 rounded-xl bg-[#0f0f13] border border-emerald-500/20 space-y-3 bg-gradient-to-b from-emerald-950/15 to-transparent">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <CurrencyEur size={15} />
                PERTES ÉVITÉES
              </span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px] border border-emerald-500/30">
                ROI +320%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-emerald-300">
                480 000 €
              </span>
              <span className="text-xs text-zinc-400 font-mono">estimé</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Économies calculées sur le coût horaire d'interruption panier et la préservation du taux de conversion.
            </p>
          </div>
        </StaggerItem>

      </StaggerGrid>

      {/* Main Graph: 12-Month MTTR Evolution & Incidents Volume */}
      <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ChartLineUp size={18} className="text-emerald-400" />
              <h3 className="font-bold text-base text-zinc-100 font-sans">
                Évolution Mensuelle du Temps Moyen de Résolution (MTTR)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Trajectoire continue de baisse du MTTR (en minutes) suite au déploiement du moteur d'IA Groq
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" /> MTTR (min)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Incidents P1
            </span>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="pt-6 pb-2">
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {monthlyMttrData.map((d, idx) => {
              const maxMttr = 70;
              const heightPercent = (d.mttrMinutes / maxMttr) * 100;
              const isRecent = idx >= 9;

              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                  {/* Tooltip on hover */}
                  <div className="text-[10px] font-mono text-zinc-400 group-hover:text-emerald-400 font-bold transition-colors">
                    {d.label}
                  </div>

                  {/* Bar */}
                  <div className="w-full bg-zinc-900 rounded-t-md overflow-hidden flex flex-col justify-end h-40">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.04 }}
                      className={`w-full rounded-t-md transition-all ${
                        isRecent
                          ? 'bg-emerald-500 group-hover:bg-emerald-400'
                          : 'bg-zinc-700 group-hover:bg-zinc-600'
                      }`}
                    />
                  </div>

                  {/* Month Label */}
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insight Callout */}
        <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkle size={15} weight="fill" className="text-emerald-400 shrink-0" />
            <span>
              Observation Comex : Le MTTR est passé de <strong className="text-zinc-200">64 minutes</strong> en novembre 2025 à <strong className="text-emerald-400">38 minutes</strong> en octobre 2026.
            </span>
          </div>
          <span className="text-[11px] text-zinc-500">Objectif 2027 : &lt; 30 min</span>
        </div>
      </div>

      {/* Bottom Grid: Top Root Causes (Pareto) & SLA Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Top Root Causes of Outages */}
        <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="font-bold text-sm text-zinc-100 font-sans">
              Typologie & Causes Racines des Pannes (Analyse Pareto)
            </h3>
            <span className="text-[11px] font-mono text-zinc-500">53 incidents analysés</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {rootCauseBreakdown.map((item) => (
              <div key={item.category} className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-sans">{item.category}</span>
                  <span className="text-zinc-400 font-bold">{item.share}% ({item.count})</span>
                </div>
                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full`}
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Department SLA Compliance */}
        <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="font-bold text-sm text-zinc-100 font-sans">
              Respect des Engagements SLA par Département
            </h3>
            <span className="text-[11px] font-mono text-emerald-400">Objectif &gt; 99.0%</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {[
              { dept: 'Core Backend & API Platform', score: '99.8%', incidents: 24, status: 'Excellence' },
              { dept: 'Sécurité & SecOps (IAM / Vault)', score: '100%', incidents: 8, status: 'Parfait' },
              { dept: 'Infrastructure Cloud & Réseau', score: '99.4%', incidents: 14, status: 'Conforme' },
              { dept: 'Frontend Web & Mobile API', score: '99.1%', incidents: 7, status: 'Conforme' },
            ].map((row) => (
              <div
                key={row.dept}
                className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="font-sans font-semibold text-zinc-200">{row.dept}</div>
                  <div className="text-[11px] text-zinc-500">{row.incidents} incidents traités</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold text-sm">{row.score}</div>
                  <div className="text-[10px] text-zinc-500">{row.status}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={handleExportPdf}
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Télécharger l'annexe détaillée d'audit ISO 27001 (PDF)</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
