import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TerminalWindow,
  Sparkle,
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
  XCircle,
  Play,
  Copy,
  Check,
  GitBranch,
  Cpu,
  ArrowRight,
  Code,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { groqAI } from '../../../services/groqClient';
import { useRole } from '../../../context/RoleContext';

const SAMPLE_PIPELINE_FAILS = [
  {
    id: 'build-1048',
    stage: 'TypeScript Compilation & Vite Build',
    type: 'github-actions',
    branch: 'feat/checkout-v2',
    author: 'Mohammed (Lead Dev)',
    failedAt: 'Il y a 12 min',
    rawLogs: `> sentinel-devops@1.0.0 build
> tsc -b && vite build

src/services/PaymentGateway.ts(48,15): error TS2339: Property 'idempotencyKey' does not exist on type 'StripeChargeOptions'.
src/services/PaymentGateway.ts(92,28): error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.
  Type 'null' is not assignable to type 'string'.

Error: Process completed with exit code 1.`,
  },
  {
    id: 'build-1045',
    stage: 'Docker Multi-Stage Build & Trivy Scan',
    type: 'docker',
    branch: 'fix/redis-socket-leak',
    author: 'Sarah Benali (Dev)',
    failedAt: 'Il y a 45 min',
    rawLogs: `Step 9/18 : RUN npm run build
 ---> Running in b47c29e1a89f
Killed
The command '/bin/sh -c npm run build' returned a non-zero code: 137 (OOM - Out of Memory in Docker container limit: 1024MB)`,
  },
];

export const DevPipelineDebuggerView: React.FC<{ onNavigateToRefactor?: () => void }> = ({ onNavigateToRefactor }) => {
  const { project, triggerToast, addAuditLog } = useRole();

  const dynamicPipelineFails = [
    {
      id: `build-${project.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-1048`,
      stage: `Compilation & Build CI (${project.name})`,
      type: 'github-actions',
      branch: 'main',
      author: 'Mohammed (Lead Dev)',
      failedAt: 'Il y a 8 min',
      rawLogs: `> ${project.name}@1.0.0 build
> tsc -b && vite build

error TS2307: Cannot find module './routes/checkout' or its corresponding type declarations.
error TS2339: Property 'reserveItems' does not exist on type 'CartService'.
Error: Process completed with exit code 1.`,
    },
    {
      id: `docker-${project.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-1045`,
      stage: `Docker Build & Trivy Scan (${project.name})`,
      type: 'docker',
      branch: 'fix/docker-optim',
      author: 'Astreinte DevSecOps',
      failedAt: 'Il y a 32 min',
      rawLogs: `Step 7/14 : COPY package*.json ./
Step 8/14 : RUN npm install
Step 9/14 : RUN npm run build
 ---> Running in a7b49ef10c2
Killed
The command '/bin/sh -c npm run build' returned a non-zero code: 137 (OOM - Out of Memory in Docker container limit: 1024MB)`,
    },
  ];

  const [selectedBuild, setSelectedBuild] = useState(dynamicPipelineFails[0]);
  const [logs, setLogs] = useState(dynamicPipelineFails[0].rawLogs);
  const [isDebugging, setIsDebugging] = useState(false);
  const [copied, setCopied] = useState(false);

  const [aiFix, setAiFix] = useState<{
    analysis: string;
    modelUsed?: string;
    inferenceTimeMs?: number;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('sentinel_ai_pipeline_result');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handleRunPipelineDebug = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsDebugging(true);
    try {
      const res = await groqAI.debugPipeline({
        failedStage: selectedBuild.stage,
        rawLogs: logs,
        pipelineType: selectedBuild.type,
      });
      setAiFix(res);
      try {
        sessionStorage.setItem('sentinel_ai_pipeline_result', JSON.stringify(res));
      } catch {}
      triggerToast(`Diagnostic de build Groq terminé (${res.inferenceTimeMs}ms)`, 'success');
      addAuditLog(`Diagnostic CI/CD Groq pour le build [${selectedBuild.id}]`, 'deploy', 'success');
    } catch {
      triggerToast('Échec de l’analyse du pipeline', 'warning');
    } finally {
      setIsDebugging(false);
    }
  };

  const handleCopyFix = () => {
    if (!aiFix) return;
    navigator.clipboard.writeText(aiFix.analysis);
    setCopied(true);
    triggerToast('Solution copiée !', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-red-950/30 via-[#100e0e] to-[#08080a] border border-red-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/40">
                CI/CD PIPELINE DEBUGGER
              </span>
              <span className="text-xs font-mono text-zinc-400">GitHub Actions & Docker Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Inspecteur de Builds CI/CD en Échec
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
              Analysez automatiquement les logs d'erreurs de vos pipelines de compilation et conteneurs pour obtenir le correctif précis en moins de 50ms avec Groq.
            </p>
          </div>

          {onNavigateToRefactor && (
            <button
              onClick={onNavigateToRefactor}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Code size={15} />
              <span>← AI Code Refactoring</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Project Pipeline Header */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0f0f13] border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-red-400" />
          <span className="text-xs font-mono font-bold text-white uppercase">Pipeline CI/CD Associé :</span>
          <span className="text-xs font-mono font-bold text-red-300 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
            {project.name}
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            ({project.files.length} fichiers sous surveillance)
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Branches: main · staging
        </span>
      </div>

      {/* Build Failure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dynamicPipelineFails.map((build) => {
          const isSelected = selectedBuild.id === build.id;
          return (
            <div
              key={build.id}
              onClick={() => {
                setSelectedBuild(build);
                setLogs(build.rawLogs);
                setAiFix(null);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                isSelected
                  ? 'bg-red-950/20 border-red-500/50 ring-1 ring-red-500/30'
                  : 'bg-zinc-900/60 border-white/5 hover:border-white/15'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-red-400" weight="fill" />
                  <span className="text-xs font-bold text-white font-mono">{build.id}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    {build.branch}
                  </span>
                </div>
                <div className="text-sm font-semibold text-zinc-200 font-sans">{build.stage}</div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Déclenché par {build.author} · {build.failedAt}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analysis Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Raw Terminal Logs */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <TerminalWindow size={16} className="text-red-400" />
                <span className="text-xs font-bold text-white font-mono">Logs de Build (Standard Error)</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Exit Code: 1</span>
            </div>

            <textarea
              value={logs}
              onChange={(e) => setLogs(e.target.value)}
              rows={12}
              className="w-full p-3.5 rounded-xl bg-[#070709] border border-red-500/30 font-mono text-xs text-red-200/90 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 leading-relaxed resize-none"
            />
          </div>

          <button
            onClick={handleRunPipelineDebug}
            disabled={isDebugging || !logs.trim()}
            className="w-full py-3 px-4 rounded-xl bg-red-500 hover:bg-red-400 text-zinc-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isDebugging ? (
              <>
                <ArrowsClockwise size={16} className="animate-spin text-zinc-950" />
                <span>Analyse Groq LPU en cours...</span>
              </>
            ) : (
              <>
                <Sparkle size={16} weight="fill" />
                <span>Diagnostiquer et Générer le Correctif avec Groq IA</span>
              </>
            )}
          </button>
        </div>

        {/* Right: AI Diagnostic */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Sparkle size={16} weight="fill" className="text-emerald-400" />
                <span className="text-xs font-bold text-white font-mono">
                  Solution Groq LPU {aiFix?.modelUsed && `(${aiFix.modelUsed})`}
                </span>
              </div>
              {aiFix?.inferenceTimeMs && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {aiFix.inferenceTimeMs}ms
                </span>
              )}
            </div>

            {!aiFix ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-500 font-mono text-xs">
                <Cpu size={32} className="text-zinc-600 animate-pulse" />
                <p>Cliquez sur "Diagnostiquer" pour recevoir la solution détaillée de l'IA.</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#070709] border border-emerald-500/30 text-xs font-mono text-emerald-200/90 whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto">
                {aiFix.analysis}
              </div>
            )}
          </div>

          {aiFix && (
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <button
                onClick={handleCopyFix}
                className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-mono text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copié !' : 'Copier le patch CI/CD'}</span>
              </button>
              <span className="text-[11px] font-mono text-zinc-500">Prêt pour re-run du workflow</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
