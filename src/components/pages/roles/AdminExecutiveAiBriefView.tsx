import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Article,
  Sparkle,
  ArrowsClockwise,
  CheckCircle,
  Copy,
  Check,
  ChartLineUp,
  DownloadSimple,
  ShieldCheck,
  Lightning,
  Clock,
  PresentationChart,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { groqAI } from '../../../services/groqClient';
import { useRole } from '../../../context/RoleContext';

export const AdminExecutiveAiBriefView: React.FC<{ onNavigateToTopology?: () => void }> = ({ onNavigateToTopology }) => {
  const { project, triggerToast, addAuditLog, incidents, auditLogs } = useRole();
  const [period, setPeriod] = useState<'Hebdomadaire' | 'Mensuelle'>('Hebdomadaire');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [briefReport, setBriefReport] = useState<{
    brief: string;
    modelUsed?: string;
    inferenceTimeMs?: number;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('sentinel_ai_brief_result');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handleGenerateBrief = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await groqAI.generateExecutiveBrief({
        period,
        teamPerformance: `Projet sous gouvernance: ${project.name} (${project.files.length} fichiers synchronisés). Incidents enregistrés: ${incidents.length}, Actions d'audit: ${auditLogs.length}. Disponibilité SLA 99.96%, MTTR 18min.`,
      });
      setBriefReport(res);
      try {
        sessionStorage.setItem('sentinel_ai_brief_result', JSON.stringify(res));
      } catch {}
      triggerToast(`Synthèse Comex générée en ${res.inferenceTimeMs}ms par Groq LPU`, 'success');
      addAuditLog(`Génération de la note de synthèse stratégique Comex (${period}) pour [${project.name}]`, 'rbac', 'success');
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#f43f5e', '#fb7185'] });
      } catch {}
    } catch {
      triggerToast('Échec de la génération de synthèse', 'warning');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyBrief = () => {
    if (!briefReport) return;
    navigator.clipboard.writeText(briefReport.brief);
    setCopied(true);
    triggerToast('Note de synthèse copiée dans le presse-papier !', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-rose-950/40 via-[#140e10] to-[#08080a] border border-rose-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                COMEX & EXECUTIVE BRIEFING
              </span>
              <span className="text-xs font-mono text-zinc-400">Gouvernance & Stratégie IA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Synthèse Stratégique & Mémos Exécutifs Comex
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
              Compilez automatiquement les performances techniques, la conformité réglementaire et le retour sur investissement dans un mémo de direction prêt pour le conseil d'administration.
            </p>
          </div>

          {onNavigateToTopology && (
            <button
              onClick={onNavigateToTopology}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>← Topologie K8s & FinOps</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Project Comex Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0f0f13] border border-rose-500/20 shadow-lg">
        <div className="flex items-center gap-2">
          <PresentationChart size={16} className="text-rose-400" />
          <span className="text-xs font-mono font-bold text-white uppercase">Périmètre Exécutif Actif :</span>
          <span className="text-xs font-mono font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
            {project.name}
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            ({project.files.length} microservices / fichiers sous gouvernance)
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Revue Comex & SLA 99.96%
        </span>
      </div>

      {/* KPI Preview Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[#0f0f13] border border-white/5 space-y-1">
          <span className="text-zinc-500 text-[10px] uppercase">MTTR Moyen</span>
          <div className="text-xl font-bold text-emerald-400">18.4 min</div>
          <span className="text-[10px] text-zinc-400">Temps de réparation</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0f0f13] border border-white/5 space-y-1">
          <span className="text-zinc-500 text-[10px] uppercase">SLA Global</span>
          <div className="text-xl font-bold text-teal-400">99.94 %</div>
          <span className="text-[10px] text-zinc-400">Disponibilité garantie</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0f0f13] border border-white/5 space-y-1">
          <span className="text-zinc-500 text-[10px] uppercase">Incidents Traités</span>
          <div className="text-xl font-bold text-white">{incidents.length}</div>
          <span className="text-[10px] text-zinc-400">100% avec RCA Groq</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0f0f13] border border-white/5 space-y-1">
          <span className="text-zinc-500 text-[10px] uppercase">Piste d'Audit</span>
          <div className="text-xl font-bold text-rose-400">{auditLogs.length} actions</div>
          <span className="text-[10px] text-zinc-400">Conformité ISO 27001</span>
        </div>
      </div>

      {/* Generation Card */}
      <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400">Période du Mémo :</span>
            <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-white/5 text-xs font-mono">
              <button
                onClick={() => setPeriod('Hebdomadaire')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  period === 'Hebdomadaire' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-zinc-400'
                }`}
              >
                Hebdomadaire
              </button>
              <button
                onClick={() => setPeriod('Mensuelle')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  period === 'Mensuelle' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-zinc-400'
                }`}
              >
                Mensuelle
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerateBrief}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <ArrowsClockwise size={15} className="animate-spin text-zinc-950" />
                <span>Rédaction Groq LPU en cours...</span>
              </>
            ) : (
              <>
                <Sparkle size={15} weight="fill" />
                <span>Générer la Note de Synthèse Comex</span>
              </>
            )}
          </button>
        </div>

        {/* Output */}
        {!briefReport ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-500 font-mono text-xs">
            <PresentationChart size={36} className="text-zinc-600 animate-pulse" />
            <p>Cliquez sur "Générer la Note" pour synthétiser les données d'ingénierie par l'IA.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-mono text-emerald-400">
                Inférence Groq : {briefReport.inferenceTimeMs}ms ({briefReport.modelUsed})
              </span>
              <button
                onClick={handleCopyBrief}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-mono text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copié !' : 'Copier le mémo'}</span>
              </button>
            </div>

            <div className="p-5 rounded-xl bg-[#070709] border border-rose-500/30 text-xs font-sans text-zinc-200 leading-relaxed whitespace-pre-wrap max-h-[450px] overflow-y-auto">
              {briefReport.brief}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
