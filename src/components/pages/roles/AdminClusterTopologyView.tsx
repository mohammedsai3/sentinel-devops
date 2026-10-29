import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Sparkle,
  ArrowsClockwise,
  CheckCircle,
  CurrencyEur,
  ChartLineUp,
  Copy,
  Check,
  HardDrives,
  Database,
  CloudArrowUp,
} from '@phosphor-icons/react';
import { groqAI } from '../../../services/groqClient';
import { useRole } from '../../../context/RoleContext';

const K8S_NODES = [
  { name: 'k8s-worker-pool-a1', role: 'Compute Worker', cpu: '48%', mem: '64%', pods: 18, status: 'Ready' },
  { name: 'k8s-worker-pool-a2', role: 'Compute Worker', cpu: '52%', mem: '71%', pods: 22, status: 'Ready' },
  { name: 'k8s-worker-pool-b1', role: 'Database & Redis', cpu: '78%', mem: '88%', pods: 14, status: 'Heavy Load' },
  { name: 'k8s-worker-pool-b2', role: 'Ingress & Gateway', cpu: '34%', mem: '42%', pods: 8, status: 'Ready' },
  { name: 'k8s-control-plane-01', role: 'Master Controller', cpu: '22%', mem: '38%', pods: 6, status: 'Ready' },
];

export const AdminClusterTopologyView: React.FC<{ onNavigateToBrief?: () => void }> = ({ onNavigateToBrief }) => {
  const { project, triggerToast, addAuditLog } = useRole();
  const [nodesCount, setNodesCount] = useState(14);
  const [monthlySpend, setMonthlySpend] = useState(8400);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [finopsData, setFinopsData] = useState<{
    recommendations: string;
    estimatedMonthlySavings: number;
    modelUsed?: string;
    inferenceTimeMs?: number;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('sentinel_ai_finops_result');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handleRunFinops = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsOptimizing(true);
    try {
      const res = await groqAI.getFinopsRecommendations({
        clusterNodes: nodesCount,
        currentMonthlySpend: monthlySpend,
      });
      setFinopsData(res);
      try {
        sessionStorage.setItem('sentinel_ai_finops_result', JSON.stringify(res));
      } catch {}
      triggerToast(`Recommandations FinOps calculées par Groq (${res.inferenceTimeMs}ms)`, 'success');
      addAuditLog(`Génération de recommandations FinOps pour le cluster hébergeant [${project.name}]`, 'rbac', 'success');
    } catch {
      triggerToast('Échec du calcul FinOps', 'warning');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-rose-950/30 via-[#140e10] to-[#08080a] border border-rose-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                KUBERNETES TOPOLOGY & FINOPS IA
              </span>
              <span className="text-xs font-mono text-zinc-400">AWS / GCP Cost Optimization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Topologie de Cluster & Optimisation FinOps par IA
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
              Visualisez l'état de santé de vos nœuds de production et réduisez vos dépenses Cloud grâce aux recommandations d'autoscaling et de réservation de capacités calculées par Groq.
            </p>
          </div>

          {onNavigateToBrief && (
            <button
              onClick={onNavigateToBrief}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Synthèse Stratégique Comex →</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Project Cluster Host */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0f0f13] border border-rose-500/20 shadow-lg">
        <div className="flex items-center gap-2">
          <HardDrives size={16} className="text-rose-400" />
          <span className="text-xs font-mono font-bold text-white uppercase">Cluster de Déploiement :</span>
          <span className="text-xs font-mono font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
            {project.name}
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            ({project.files.length} composants microservices en conteneurisation)
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Orchestration Kubernetes k8s-prod-eu1
        </span>
      </div>

      {/* Cluster Nodes Visual Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase font-bold text-zinc-300">
            Nœuds Kubernetes Actifs ({K8S_NODES.length} nœuds clés surveillés) :
          </span>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            148 Pods en exécution
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {K8S_NODES.map((node, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#0f0f13] border border-white/5 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrives size={15} className="text-rose-400" />
                  <span className="text-white font-bold">{node.name}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${node.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'}`}>
                  {node.status}
                </span>
              </div>
              <div className="text-[11px] text-zinc-500">{node.role}</div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px]">
                <div>
                  <span className="text-zinc-500 text-[10px] block">CPU</span>
                  <span className="text-zinc-200 font-bold">{node.cpu}</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">RAM</span>
                  <span className="text-zinc-200 font-bold">{node.mem}</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">Pods</span>
                  <span className="text-zinc-200 font-bold">{node.pods}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FinOps Optimizer Controls */}
      <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <CurrencyEur size={18} className="text-emerald-400" />
              Moteur d'Optimisation Budgétaire FinOps (AWS / GCP / Azure)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Calcul prédictif d'économies basé sur les métriques réelles d'utilisation
            </p>
          </div>

          <button
            onClick={handleRunFinops}
            disabled={isOptimizing}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isOptimizing ? (
              <>
                <ArrowsClockwise size={15} className="animate-spin text-zinc-950" />
                <span>Calcul FinOps Groq...</span>
              </>
            ) : (
              <>
                <Sparkle size={15} weight="fill" />
                <span>Calculer le Plan d'Économie IA</span>
              </>
            )}
          </button>
        </div>

        {finopsData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
                <span className="text-zinc-500">Dépense Cloud Actuelle :</span>
                <div className="text-lg font-bold text-white">{monthlySpend} € / mois</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                <span className="text-emerald-400">Économies Estimées (-32%) :</span>
                <div className="text-lg font-bold text-emerald-300">~{finopsData.estimatedMonthlySavings} € / mois</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1">
                <span className="text-zinc-500">Moteur d'Optimisation :</span>
                <div className="text-sm font-bold text-zinc-200">{finopsData.modelUsed} ({finopsData.inferenceTimeMs}ms)</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#070709] border border-emerald-500/30 text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto">
              {finopsData.recommendations}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
