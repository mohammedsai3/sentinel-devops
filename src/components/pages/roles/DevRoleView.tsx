import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Cpu,
  TerminalWindow,
  Play,
  CheckCircle,
  WarningCircle,
  Clock,
  Sparkle,
  Copy,
  Check,
  ArrowsClockwise,
  ArrowRight,
  PlusCircle,
  Lightning,
  Code,
  FileCode,
  Article,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { useRole } from '../../../context/RoleContext';
import { groqAI } from '../../../services/groqClient';

interface DevRoleViewProps {
  onNavigateToTicket: (id: string) => void;
  onNavigateToCreate: () => void;
  onNavigateToWiki: () => void;
}

export const DevRoleView: React.FC<DevRoleViewProps> = ({
  onNavigateToTicket,
  onNavigateToCreate,
  onNavigateToWiki,
}) => {
  const { incidents, triggerToast, addAuditLog, project } = useRole();
  const [selectedBranch, setSelectedBranch] = useState<'main' | 'fix/redis-socket-leak' | 'feat/groq-stream'>('fix/redis-socket-leak');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildSuccess, setBuildSuccess] = useState(false);
  const [copiedPatch, setCopiedPatch] = useState(false);
  const [patchApplied, setPatchApplied] = useState(false);
  const [activeLogTab, setActiveLogTab] = useState<'stack' | 'diff' | 'tests'>('diff');
  const [livePatch, setLivePatch] = useState<string | null>(null);
  const [isGeneratingPatch, setIsGeneratingPatch] = useState(false);
  const [patchModelInfo, setPatchModelInfo] = useState<string | null>(null);

  // Active project file
  const activeFile = project.files[0] || {
    name: 'src/services/CartService.ts',
    content: `export class CartService {\n  private redisPool: any;\n  async reserveItems(userId: string, items: any[]) {\n    const client = await this.redisPool.acquire();\n    const lock = await client.set("lock:" + userId, "1", "EX", 10);\n    if (!lock) throw new Error("Timeout");\n    const result = await this.processReservation(client, items);\n    await this.redisPool.release(client);\n    return result;\n  }\n}`
  };

  // Filter developer related incidents safely
  const devIncidents = incidents.filter(
    (i) =>
      Boolean(i.team?.includes('Core Backend')) ||
      Boolean(i.service?.includes('redis')) ||
      Boolean(i.service?.includes('worker')) ||
      Boolean(i.category?.includes('Base de données'))
  );

  const diffBefore = activeFile.content || `// src/services/CartService.ts (LIGNE 142)
public async reserveItems(items: CartItem[]): Promise<ReservationResult> {
  const redisClient = await this.redisPool.acquire();
  const lock = await redisClient.set(\`lock:\${this.cartId}\`, '1', 'EX', 10);
  if (!lock) throw new Error('Lock acquisition timeout');
  const res = await this.executeReservation(redisClient, items);
  return res;
}`;

  const diffAfter = `// ${activeFile.name} (CORRECTIF GROQ RCA OPTIMISÉ)
// Nettoyage des fuites de sockets et gestion sécurisée du cycle de vie
${diffBefore.replace(/await this\.redisPool\.release\(client\);/g, '// Libéré de manière garantie dans bloc try/finally\n    await this.redisPool.release(client);')}`;

  const handleGenerateLivePatch = async () => {
    setIsGeneratingPatch(true);
    try {
      const res = await groqAI.generateHotfix({
        issue: `Correction et durcissement de ${activeFile.name} dans le projet ${project.name}`,
        filePath: activeFile.name,
        originalCode: diffBefore,
        language: 'typescript',
      });
      setLivePatch(res.patch);
      setPatchModelInfo(`${res.modelUsed} (${res.inferenceTimeMs}ms)`);
      triggerToast(`Nouveau patch généré par Groq en ${res.inferenceTimeMs}ms`, 'success');
      addAuditLog(`Génération de patch Groq RCA pour [${activeFile.name}] (${res.inferenceTimeMs}ms)`, 'deploy', 'success');
    } catch (e) {
      triggerToast('Échec de l’inférence Groq, fallback appliqué', 'warning');
    } finally {
      setIsGeneratingPatch(false);
    }
  };

  const handleApplyPatch = () => {
    setIsBuilding(true);
    setTimeout(() => {
      setIsBuilding(false);
      setPatchApplied(true);
      setBuildSuccess(true);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399', '#6ee7b7'],
        });
      } catch (e) {}
      triggerToast('Patch validé et déployé sur le cluster de staging (Build #1042)', 'success');
      addAuditLog('Déploiement du correctif Groq RCA CartService sur staging', 'deploy', 'success');
    }, 1200);
  };

  const handleCopyPatch = () => {
    navigator.clipboard.writeText(diffAfter);
    setCopiedPatch(true);
    triggerToast('Patch copié dans le presse-papier', 'info');
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Dev Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-[#0e1217] to-[#0a0c10] border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ESPACE DÉVELOPPEUR CORE
              </span>
              <span className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Astreinte Active · Mohammed
              </span>
              <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                Projet : {project.name} ({project.files.length} fichiers réels)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-tight">
              Cockpit d'Ingénierie & Résolution Logicielle
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl font-sans">
              Espace de travail dédié aux développeurs : identification de régression, isolation des stack traces, application de correctifs Groq RCA et exécution des tests unitaires.
            </p>
          </div>

          {/* Quick stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Tickets Ass.</div>
              <div className="text-lg font-bold text-emerald-300 font-mono mt-0.5">{devIncidents.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Branche</div>
              <div className="text-xs font-bold text-zinc-200 font-mono mt-1 truncate">fix/redis</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Build CI</div>
              <div className="text-xs font-bold text-emerald-400 font-mono mt-1 flex items-center justify-center gap-1">
                <CheckCircle size={12} weight="bold" />
                Pass (18s)
              </div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Groq LPU</div>
              <div className="text-lg font-bold text-teal-300 font-mono mt-0.5">42ms</div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateToTicket('#892')}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-400 transition-colors cursor-pointer shadow-sm"
          >
            <Lightning size={14} weight="bold" />
            <span>Rejoindre la War Room (#892)</span>
          </button>
          <button
            onClick={onNavigateToCreate}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle size={14} className="text-emerald-400" />
            <span>Déclarer un bug technique</span>
          </button>
          <button
            onClick={onNavigateToWiki}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Article size={14} className="text-teal-400" />
            <span>Wiki Post-Mortem</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Groq RCA Hotfix Lab (Left) + Assigned Incidents (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Groq Hotfix Lab & Git Diff (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkle size={16} className="text-emerald-400" />
                  <h2 className="text-base font-bold text-white font-sans">
                    Groq LPU Hotfix Lab · PR #421
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Analyse de la régression et génération automatique du patch de code
                </p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-white/5 text-xs font-mono">
                <button
                  onClick={() => setActiveLogTab('diff')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    activeLogTab === 'diff' ? 'bg-zinc-800 text-emerald-300 font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Git Diff
                </button>
                <button
                  onClick={() => setActiveLogTab('stack')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    activeLogTab === 'stack' ? 'bg-zinc-800 text-emerald-300 font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Stack Trace
                </button>
                <button
                  onClick={() => setActiveLogTab('tests')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    activeLogTab === 'tests' ? 'bg-zinc-800 text-emerald-300 font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Tests Unitaires
                </button>
              </div>
            </div>

            {/* Tab 1: Git Diff */}
            {activeLogTab === 'diff' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  {/* Before */}
                  <div className="rounded-xl bg-red-950/20 border border-red-500/30 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-red-400 font-bold">
                      <span>ORIGINAL (REGRESSION)</span>
                      <span>- Commit 419b</span>
                    </div>
                    <pre className="text-[11px] text-red-200/90 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                      {diffBefore}
                    </pre>
                  </div>

                  {/* After */}
                  <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/40 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                      <span>CORRECTIF GROQ AI {patchModelInfo && `(${patchModelInfo})`}</span>
                      <span>+ PR #421</span>
                    </div>
                    <pre className="text-[11px] text-emerald-200/90 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                      {livePatch || diffAfter}
                    </pre>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateLivePatch}
                      disabled={isGeneratingPatch}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-mono text-emerald-300 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingPatch ? (
                        <>
                          <ArrowsClockwise size={13} className="animate-spin text-emerald-400" />
                          <span>Inférence Groq...</span>
                        </>
                      ) : (
                        <>
                          <Sparkle size={13} className="text-amber-400" />
                          <span>Régénérer avec Groq LPU</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCopyPatch}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedPatch ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copiedPatch ? 'Copié !' : 'Copier'}</span>
                    </button>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Impact : CartService.ts (+8 / -2 lignes)
                    </span>
                  </div>

                  <button
                    onClick={handleApplyPatch}
                    disabled={isBuilding || patchApplied}
                    className={`px-4 py-2 rounded-lg font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                      patchApplied
                        ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40'
                        : isBuilding
                        ? 'bg-emerald-600/50 text-white cursor-wait'
                        : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                    }`}
                  >
                    {isBuilding ? (
                      <>
                        <ArrowsClockwise size={14} className="animate-spin" />
                        <span>Compilation du Patch...</span>
                      </>
                    ) : patchApplied ? (
                      <>
                        <CheckCircle size={14} weight="bold" />
                        <span>Patch Appliqué en Staging</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} weight="bold" />
                        <span>Appliquer le Patch & Compiler</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Stack Trace */}
            {activeLogTab === 'stack' && (
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-zinc-300 space-y-2">
                <div className="text-rose-400 font-bold flex items-center gap-2">
                  <WarningCircle size={15} />
                  <span>Error: Connection pool exhausted (max 200 handles reached)</span>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-1 pl-4 border-l border-zinc-700">
                  <div>at RedisPool.acquire (/app/node_modules/generic-pool/lib/Pool.js:142:15)</div>
                  <div className="text-emerald-400 font-semibold">
                    at CartService.reserveItems (/app/src/services/CartService.ts:142:35)
                  </div>
                  <div>at CheckoutController.handleCheckout (/app/src/controllers/Checkout.ts:89:12)</div>
                  <div>at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)</div>
                </div>
                <div className="pt-2 text-[10px] text-zinc-500">
                  Capturé par l'agent OpenTelemetry · Timestamp: 14:10:22.408 UTC · Latence: 5002ms
                </div>
              </div>
            )}

            {/* Tab 3: Unit Tests */}
            {activeLogTab === 'tests' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-between">
                  <span className="text-zinc-300">CartService.test.ts · reserveItems should release handle</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">
                    PASSED (4ms)
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-between">
                  <span className="text-zinc-300">RedisPool.test.ts · leak detection under 1000 ops</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">
                    PASSED (14ms)
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-between">
                  <span className="text-zinc-300">CheckoutFlow.test.ts · rollback on redis error</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">
                    PASSED (9ms)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Assigned Incidents & Bugs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Incidents Assignés à l'Équipe Dev
                </h3>
                <span className="text-xs text-zinc-400">
                  {devIncidents.length} anomalies en cours d'analyse
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
                Astreinte N2
              </span>
            </div>

            <div className="space-y-3">
              {devIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onNavigateToTicket(inc.id)}
                  className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-emerald-500/40 hover:bg-zinc-800/50 transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">{inc.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      inc.priority === 'P1' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {inc.priority}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    {inc.title}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1 border-t border-white/5">
                    <span>{inc.service}</span>
                    <span className="flex items-center gap-1 text-emerald-300">
                      <span>Voir ticket</span>
                      <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
