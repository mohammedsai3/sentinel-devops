import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code,
  Sparkle,
  Lightning,
  ArrowsClockwise,
  CheckCircle,
  Copy,
  Check,
  Cpu,
  ArrowRight,
  ShieldCheck,
  TerminalWindow,
  Play,
  FileCode,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { groqAI } from '../../../services/groqClient';
import { useRole } from '../../../context/RoleContext';

const PRESET_SNIPPETS = [
  {
    title: 'CartService - Fuite de socket Redis',
    language: 'typescript',
    goal: 'performance',
    code: `export class CartService {
  private pool: any;
  async reserveItems(userId: string, items: any[]) {
    const client = await this.pool.acquire();
    // Mauvaise pratique : aucun try/finally
    const lock = await client.set("lock:" + userId, "1", "EX", 10);
    if (!lock) throw new Error("Timeout");
    const result = await this.processReservation(client, items);
    await this.pool.release(client); // Non exécuté en cas d'erreur
    return result;
  }
}`,
  },
  {
    title: 'AuthMiddleware - Vérification JWT asynchrone',
    language: 'typescript',
    goal: 'security',
    code: `export function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send("Unauthorized");
  // Synchronous decode without tenant check
  const decoded = jwt.decode(token);
  if (!decoded) return res.status(403).send("Invalid token");
  req.user = decoded;
  next();
}`,
  },
  {
    title: 'PaymentWorker - Traitement de webhooks en boucle O(n²)',
    language: 'typescript',
    goal: 'clean',
    code: `export async function processBatch(webhooks: any[], subscriptions: any[]) {
  const results = [];
  for (let i = 0; i < webhooks.length; i++) {
    for (let j = 0; j < subscriptions.length; j++) {
      if (webhooks[i].subId === subscriptions[j].id) {
        results.push(await chargeUser(webhooks[i], subscriptions[j]));
      }
    }
  }
  return results;
}`,
  },
];

export const DevAiRefactorView: React.FC<{ onNavigateToPipeline?: () => void }> = ({ onNavigateToPipeline }) => {
  const { project, updateProjectFileContent, triggerToast, addAuditLog } = useRole();
  
  // Available project files or fallback presets
  const projectFiles = project?.files || [];
  const [selectedFileName, setSelectedFileName] = useState<string>(
    projectFiles.length > 0 ? projectFiles[0].name : PRESET_SNIPPETS[0].title
  );
  const [code, setCode] = useState<string>(
    projectFiles.length > 0 ? projectFiles[0].content : PRESET_SNIPPETS[0].code
  );
  const [language, setLanguage] = useState<string>(() => {
    const name = projectFiles.length > 0 ? projectFiles[0].name : '';
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'typescript';
    if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript';
    if (name.endsWith('.json')) return 'json';
    if (name.toLowerCase().includes('docker')) return 'dockerfile';
    return 'typescript';
  });
  const [goal, setGoal] = useState<'performance' | 'security' | 'clean'>('performance');
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [activeTab, setActiveTab] = useState<'refactored' | 'tests' | 'analysis'>('refactored');
  const [copied, setCopied] = useState(false);
  const [isSavedInProject, setIsSavedInProject] = useState(false);

  const [result, setResult] = useState<{
    debtAnalysis: string;
    complexityBefore: string;
    complexityAfter: string;
    refactoredCode: string;
    unitTests: string;
    keyImprovements: string[];
    modelUsed?: string;
    inferenceTimeMs?: number;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('sentinel_ai_refactor_result');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handleSelectFile = (file: { name: string; content: string }) => {
    setSelectedFileName(file.name);
    setCode(file.content);
    setIsSavedInProject(false);
    let detectedLang = 'typescript';
    if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) detectedLang = 'javascript';
    if (file.name.endsWith('.json')) detectedLang = 'json';
    if (file.name.toLowerCase().includes('docker')) detectedLang = 'dockerfile';
    if (file.name.endsWith('.py')) detectedLang = 'python';
    setLanguage(detectedLang);
    setResult(null);
  };

  const handleRunRefactor = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsRefactoring(true);
    setIsSavedInProject(false);
    try {
      const res = await groqAI.refactorCode({ code, language, goal });
      setResult(res);
      try {
        sessionStorage.setItem('sentinel_ai_refactor_result', JSON.stringify(res));
      } catch {}
      triggerToast(`Refactoring IA complété en ${res.inferenceTimeMs}ms (${res.modelUsed})`, 'success');
      addAuditLog(`Optimisation de code par IA Groq sur [${selectedFileName}]`, 'deploy', 'success');
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 }, colors: ['#10b981', '#34d399'] });
      } catch {}
    } catch {
      triggerToast('Échec du refactoring', 'warning');
    } finally {
      setIsRefactoring(false);
    }
  };

  const handleSaveToProject = () => {
    if (!result?.refactoredCode) return;
    updateProjectFileContent(selectedFileName, result.refactoredCode);
    setCode(result.refactoredCode);
    setIsSavedInProject(true);
    triggerToast(`Fichier [${selectedFileName}] mis à jour dans le projet partagé !`, 'success');
    addAuditLog(`Mise à jour du fichier [${selectedFileName}] avec le code refactorisé`, 'deploy', 'success');
    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 }, colors: ['#10b981', '#06b6d4'] });
    } catch {}
  };

  const handleCopyCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(activeTab === 'tests' ? result.unitTests : result.refactoredCode);
    setCopied(true);
    triggerToast('Code copié dans le presse-papier !', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#0a0f12] to-[#08080a] border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                LAB DÉVELOPPEUR IA
              </span>
              <span className="text-xs font-mono text-zinc-400">Groq LPU Acceleration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              AI Code Refactoring & Linter Proactif
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
              Optimisez la complexité algorithmique de vos composants, éradiquez les fuites de mémoire et générez les suites de tests unitaires Jest instantanément grâce à Groq.
            </p>
          </div>

          {onNavigateToPipeline && (
            <button
              onClick={onNavigateToPipeline}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <TerminalWindow size={15} />
              <span>Inspecteur CI/CD Pipeline →</span>
            </button>
          )}
        </div>
      </div>

      {/* Project Files Selector */}
      <div className="p-4 rounded-xl bg-[#0e1117] border border-emerald-500/20 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode size={18} className="text-emerald-400" />
            <span className="text-xs font-mono font-bold text-white uppercase">Fichiers du Projet Actif :</span>
            <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
              {project?.name || 'Projet Local'}
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              ({projectFiles.length} fichier(s) réels en mémoire)
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Cliquez sur un fichier pour l'analyser et le refactorer
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {projectFiles.map((file, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectFile(file)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedFileName === file.name
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-zinc-900/70 text-zinc-400 border-white/5 hover:border-white/20 hover:text-zinc-200'
              }`}
            >
              <Code size={13} className={selectedFileName === file.name ? 'text-emerald-400' : 'text-zinc-500'} />
              <span>{file.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Code Input (5 cols) & AI Output (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Code */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Code size={16} className="text-emerald-400" />
                <span className="text-xs font-bold text-white font-mono">Code Source d'Origine</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-zinc-300 focus:outline-none"
                >
                  <option value="performance">Objectif : Performance & Concurrence</option>
                  <option value="security">Objectif : Sécurité & Validation</option>
                  <option value="clean">Objectif : Clean Code & Typage Strict</option>
                </select>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={16}
              className="w-full p-3.5 rounded-xl bg-[#070709] border border-white/10 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 leading-relaxed resize-none"
            />
          </div>

          <button
            onClick={handleRunRefactor}
            disabled={isRefactoring || !code.trim()}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isRefactoring ? (
              <>
                <ArrowsClockwise size={16} className="animate-spin text-zinc-950" />
                <span>Refactoring Groq LPU en cours (~40ms)...</span>
              </>
            ) : (
              <>
                <Sparkle size={16} weight="fill" />
                <span>Lancer le Refactoring & Générer Tests Jest</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Output */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Lightning size={16} weight="fill" className="text-emerald-400" />
                <span className="text-xs font-bold text-white font-mono">
                  Résultat IA {result?.modelUsed && `(${result.modelUsed})`}
                </span>
                {result?.inferenceTimeMs && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {result.inferenceTimeMs}ms
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-white/5 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('refactored')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activeTab === 'refactored' ? 'bg-zinc-800 text-emerald-300 font-bold' : 'text-zinc-400'
                  }`}
                >
                  Code Refactorisé
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activeTab === 'tests' ? 'bg-zinc-800 text-emerald-300 font-bold' : 'text-zinc-400'
                  }`}
                >
                  Tests Jest / Vitest
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activeTab === 'analysis' ? 'bg-zinc-800 text-emerald-300 font-bold' : 'text-zinc-400'
                  }`}
                >
                  Audit de Dette
                </button>
              </div>
            </div>

            {/* Display View */}
            {!result ? (
              <div className="h-80 flex flex-col items-center justify-center text-center p-6 space-y-3 text-zinc-500 font-mono text-xs">
                <Cpu size={32} className="text-zinc-600 animate-pulse" />
                <p>Cliquez sur "Lancer le Refactoring" pour analyser le code avec l'IA Groq.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Complexity Pill */}
                <div className="flex items-center gap-3 text-xs font-mono p-3 rounded-xl bg-zinc-900/60 border border-white/5">
                  <span className="text-zinc-400">Complexité Algorithmique :</span>
                  <span className="text-rose-400 font-bold line-through">{result.complexityBefore}</span>
                  <ArrowRight size={13} className="text-emerald-400" />
                  <span className="text-emerald-300 font-bold">{result.complexityAfter}</span>
                </div>

                {activeTab === 'refactored' && (
                  <pre className="p-4 rounded-xl bg-[#070709] border border-emerald-500/30 text-xs font-mono text-emerald-200/90 leading-relaxed overflow-x-auto max-h-[350px]">
                    {result.refactoredCode}
                  </pre>
                )}

                {activeTab === 'tests' && (
                  <pre className="p-4 rounded-xl bg-[#070709] border border-cyan-500/30 text-xs font-mono text-cyan-200/90 leading-relaxed overflow-x-auto max-h-[350px]">
                    {result.unitTests}
                  </pre>
                )}

                {activeTab === 'analysis' && (
                  <div className="p-4 rounded-xl bg-[#070709] border border-white/10 space-y-3 text-xs font-sans">
                    <p className="text-zinc-300 leading-relaxed">{result.debtAnalysis}</p>
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase">Gains Clés :</span>
                      {result.keyImprovements?.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-zinc-300 text-xs font-mono">
                          <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {result && (
            <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToProject}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                    isSavedInProject
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                  }`}
                >
                  <CheckCircle size={15} weight="bold" />
                  <span>{isSavedInProject ? 'Enregistré dans le projet !' : `Enregistrer dans ${selectedFileName}`}</span>
                </button>
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-mono text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">Synchronisé avec le projet partagé</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
