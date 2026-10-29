import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderOpen,
  GitBranch,
  UploadSimple,
  Sparkle,
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
  FileCode,
  ShieldCheck,
  Target,
  Gear,
  Lightning,
  Copy,
  Check,
  ArrowRight,
  Code,
  Article,
  HardDrives,
  PlusCircle,
  Trash,
  MagnifyingGlass,
  Star,
  WarningOctagon,
  FileText,
  Play,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { groqAI } from '../../services/groqClient';
import { useRole } from '../../context/RoleContext';
import { AppView } from '../../types/role';

interface AuditFindingDev {
  id: string;
  title: string;
  file: string;
  severity: 'CRITIQUE' | 'HAUTE' | 'MOYENNE';
  analysis: string;
  impact: string;
  recommendation: string;
  beforeCode?: string;
  afterCode?: string;
}

interface AuditFindingSec {
  id: string;
  title: string;
  file: string;
  severity: 'CRITIQUE' | 'HAUTE' | 'MOYENNE';
  cve?: string;
  analysis: string;
  recommendation: string;
  wafRule?: string;
}

interface AuditFindingQA {
  id: string;
  title: string;
  targetUrl?: string;
  severity: 'CRITIQUE' | 'HAUTE' | 'MOYENNE';
  analysis: string;
  playwrightSnippet?: string;
}

interface AuditFindingAdmin {
  id: string;
  title: string;
  file?: string;
  severity: 'CRITIQUE' | 'HAUTE' | 'MOYENNE';
  analysis: string;
  recommendation: string;
  finopsSavings?: string;
}

interface StructuredAuditResult {
  healthScore: number;
  summary: string;
  metrics: {
    securityScore: number;
    techDebtScore: number;
    testCoverage: number;
    cloudReadiness: number;
  };
  dev: {
    headline: string;
    findings: AuditFindingDev[];
  };
  sec: {
    headline: string;
    findings: AuditFindingSec[];
  };
  qa: {
    headline: string;
    findings: AuditFindingQA[];
  };
  admin: {
    headline: string;
    findings: AuditFindingAdmin[];
  };
  modelUsed?: string;
  inferenceTimeMs?: number;
}

export const ImportProjectView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const { triggerToast, addAuditLog, createIncident, project, updateProject } = useRole();

  // Mode Selection: 'github' | 'upload' | 'manual'
  const [importMode, setImportMode] = useState<'github' | 'upload' | 'manual'>('github');

  // GitHub State
  const [repoUrlInput, setRepoUrlInput] = useState(project.repoUrl || 'https://github.com/expressjs/express');
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubMeta, setGithubMeta] = useState<{
    name: string;
    fullName: string;
    stars: number;
    language: string;
    description: string;
  } | null>(null);

  // Files in memory - initialized from shared project
  const [projectName, setProjectName] = useState(project.name || 'express-commerce');
  const [projectType, setProjectType] = useState(project.type || 'Node.js / Express Web Framework');
  const [files, setFiles] = useState<{ name: string; content: string }[]>(
    project.files && project.files.length > 0 ? project.files : [
      {
        name: 'src/services/CartService.ts',
        content: `export class CartService {
  private redisPool: any;
  async reserveItems(userId: string, items: any[]) {
    const client = await this.redisPool.acquire();
    const lock = await client.set("lock:" + userId, "1", "EX", 10);
    if (!lock) throw new Error("Timeout acquisition lock Redis");
    const result = await this.processReservation(client, items);
    await this.redisPool.release(client);
    return result;
  }
}`
      }
    ]
  );

  // Manual editor state
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [isAddingFile, setIsAddingFile] = useState(false);

  // Audit Execution & Tabs
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dev' | 'sec' | 'qa' | 'admin'>('dev');
  const [appliedFixes, setAppliedFixes] = useState<string[]>([]);

  // Persistent Audit State (Safely validated against legacy cache)
  const [auditResult, setAuditResult] = useState<StructuredAuditResult | null>(() => {
    try {
      const saved = sessionStorage.getItem('sentinel_imported_project_audit');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.dev && Array.isArray(parsed.dev.findings)) {
          return parsed;
        } else {
          sessionStorage.removeItem('sentinel_imported_project_audit');
        }
      }
    } catch {}
    return null;
  });

  const devFindings = auditResult?.dev?.findings || [];
  const secFindings = auditResult?.sec?.findings || [];
  const qaFindings = auditResult?.qa?.findings || [];
  const adminFindings = auditResult?.admin?.findings || [];
  const totalFindings = devFindings.length + secFindings.length + qaFindings.length + adminFindings.length;

  // 1. Fetch Real GitHub Repo
  const handleFetchGithub = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!repoUrlInput.trim()) return;
    setIsFetchingGithub(true);
    try {
      const data = await groqAI.inspectGithubRepo(repoUrlInput.trim());
      if (data.success && data.repo) {
        setGithubMeta(data.repo);
        const nextName = data.repo.name;
        const nextType = `${data.repo.language} Repository (${data.repo.stars} ⭐ sur GitHub)`;
        setProjectName(nextName);
        setProjectType(nextType);
        const nextFiles = data.files && data.files.length > 0 ? data.files.map((f: any) => ({ name: f.name, content: f.content })) : files;
        setFiles(nextFiles);
        updateProject({
          name: nextName,
          type: nextType,
          repoUrl: repoUrlInput.trim(),
          files: nextFiles,
        });
        if (data.files && data.files.length > 0) {
          triggerToast(`Dépôt GitHub [${data.repo.fullName}] importé (${data.files.length} fichiers réels synchronisés)`, 'success');
        } else {
          triggerToast(`Dépôt ${data.repo.fullName} connecté !`, 'info');
        }
      }
    } catch (err: any) {
      triggerToast(err.message || 'Échec de l’importation GitHub', 'warning');
    } finally {
      setIsFetchingGithub(false);
    }
  };

  // 2. Local File Upload
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    const list: { name: string; content: string }[] = [];
    const maxFiles = Math.min(uploaded.length, 12);

    Array.from(uploaded).slice(0, maxFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = (evt.target?.result as string) || '';
        list.push({ name: file.name, content: text });
        if (list.length === maxFiles) {
          const compName = file.name.replace(/\.[^/.]+$/, '');
          const compType = 'Projet Local importé';
          setFiles(list);
          setProjectName(compName);
          setProjectType(compType);
          updateProject({
            name: compName,
            type: compType,
            files: list,
          });
          triggerToast(`${list.length} fichier(s) réels importés et synchronisés dans tous les rôles !`, 'success');
        }
      };
      reader.readAsText(file);
    });
  };

  // 3. Add Custom File
  const handleAddNewFile = () => {
    if (!newFileName.trim()) return;
    const nextFiles = [...files, { name: newFileName.trim(), content: newFileContent }];
    setFiles(nextFiles);
    updateProject({ files: nextFiles });
    setNewFileName('');
    setNewFileContent('');
    setIsAddingFile(false);
    triggerToast(`Fichier [${newFileName}] ajouté et synchronisé dans l'environnement`, 'info');
  };

  const handleRemoveFile = (index: number) => {
    const nextFiles = files.filter((_, i) => i !== index);
    setFiles(nextFiles);
    updateProject({ files: nextFiles });
  };

  // 4. Run Groq 360° AI Audit
  const handleRunAudit = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (files.length === 0) {
      triggerToast('Veuillez importer ou ajouter au moins un fichier', 'warning');
      return;
    }
    setIsAuditing(true);
    try {
      const res = await groqAI.auditProject({
        projectName,
        projectType,
        files,
        repoUrl: repoUrlInput,
      });
      setAuditResult(res);
      try {
        sessionStorage.setItem('sentinel_imported_project_audit', JSON.stringify(res));
      } catch {}
      triggerToast(`Audit 360° généré par Groq LPU en ${res.inferenceTimeMs}ms`, 'success');
      addAuditLog(`Audit 360° en temps réel pour le projet [${projectName}]`, 'deploy', 'success');
      try {
        confetti({ particleCount: 55, spread: 65, origin: { y: 0.8 }, colors: ['#10b981', '#06b6d4', '#f59e0b'] });
      } catch {}
    } catch {
      triggerToast('Échec de l’audit de projet', 'warning');
    } finally {
      setIsAuditing(false);
    }
  };

  // 5. Apply Code Fix Directly
  const handleApplyFix = (finding: AuditFindingDev) => {
    if (!finding.afterCode) return;
    setAppliedFixes((prev) => [...prev, finding.id]);
    // Update matching file in memory and in shared project
    const nextFiles = files.map((f) => {
      if (f.name.includes(finding.file) || finding.file.includes(f.name)) {
        return { ...f, content: finding.afterCode! };
      }
      return f;
    });
    setFiles(nextFiles);
    updateProject({ files: nextFiles });
    triggerToast(`Correctif [${finding.title}] appliqué en mémoire sur le projet partagé !`, 'success');
    addAuditLog(`Application du correctif IA [${finding.title}] sur le projet partagé`, 'deploy', 'success');
  };

  // 6. Convert Finding to Real Incident Ticket
  const handleConvertToTicket = (title: string, desc: string, priority: 'P1' | 'P2' = 'P2') => {
    const newIncId = createIncident({
      title: `[Audit Projet] ${title}`,
      service: projectName.toLowerCase().replace(/\s+/g, '-'),
      cluster: 'external-audit',
      priority,
      category: 'Audit & Vulnérabilité',
      description: desc,
      assignee: 'Mohammed (Lead Dev)',
    });
    triggerToast(`Incident ${newIncId} créé automatiquement dans la War Room !`, 'success');
    setTimeout(() => {
      onNavigate('ticket-detail');
    }, 1200);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-[#0e1217] to-[#08080a] border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                IMPORT DYNAMIQUE & SCAN COMPLET 360°
              </span>
              <span className="text-xs font-mono text-zinc-400">GitHub API Live · Upload Réel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Connectez ou Importez votre Projet en Direct
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
              Importez n'importe quel dépôt GitHub public ou glissez vos propres fichiers de code. L'IA Groq analyse l'architecture réelle, détecte les anomalies et génère des correctifs 1-Click pour chaque rôle.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          {auditResult && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-black/60 border border-white/10 shrink-0">
              <div className="relative w-16 h-16 flex items-center justify-center font-mono font-bold text-xl">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-zinc-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={auditResult.healthScore >= 75 ? 'text-emerald-400' : auditResult.healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'}
                    strokeDasharray={`${auditResult.healthScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-white font-bold">{auditResult.healthScore}</span>
              </div>
              <div className="font-mono text-xs space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Score Global</span>
                <span className="font-bold text-white text-sm">
                  {auditResult.healthScore >= 75 ? 'Robuste' : 'Vulnérable'}
                </span>
                <span className="text-[10px] text-emerald-400 block">{auditResult.inferenceTimeMs}ms (Groq LPU)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Input Source (Left) + 360° Visual Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Dynamic Import Modes (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Mode Switcher */}
          <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setImportMode('github')}
              className={`py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                importMode === 'github' ? 'bg-emerald-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <GitBranch size={14} />
              <span>GitHub API</span>
            </button>
            <button
              type="button"
              onClick={() => setImportMode('upload')}
              className={`py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                importMode === 'upload' ? 'bg-emerald-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UploadSimple size={14} />
              <span>Upload Fichiers</span>
            </button>
            <button
              type="button"
              onClick={() => setImportMode('manual')}
              className={`py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                importMode === 'manual' ? 'bg-emerald-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Code size={14} />
              <span>Code Direct</span>
            </button>
          </div>

          {/* Mode 1: Real GitHub Inspector */}
          {importMode === 'github' && (
            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-white/10 space-y-4">
              <span className="text-xs font-mono text-zinc-300 font-bold block">
                Connecter un Dépôt Public GitHub :
              </span>
              <form onSubmit={handleFetchGithub} className="flex gap-2">
                <input
                  type="text"
                  value={repoUrlInput}
                  onChange={(e) => setRepoUrlInput(e.target.value)}
                  placeholder="https://github.com/owner/repository"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isFetchingGithub}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-emerald-300 font-bold flex items-center gap-1.5 border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isFetchingGithub ? (
                    <ArrowsClockwise size={14} className="animate-spin" />
                  ) : (
                    <MagnifyingGlass size={14} />
                  )}
                  <span>Inspecter</span>
                </button>
              </form>

              {githubMeta && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>{githubMeta.fullName}</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star size={12} weight="fill" />
                      <span>{githubMeta.stars}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans line-clamp-2">{githubMeta.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Real Local File Upload */}
          {importMode === 'upload' && (
            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-white/10 space-y-4">
              <span className="text-xs font-mono text-zinc-300 font-bold block">
                Glisser-déposer vos fichiers de projet réels :
              </span>
              <label className="border-2 border-dashed border-white/15 hover:border-emerald-500/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-zinc-900/40 transition-colors">
                <UploadSimple size={28} className="text-emerald-400" />
                <span className="text-xs text-zinc-200 font-medium">Glissez vos fichiers ou cliquez pour sélectionner</span>
                <span className="text-[10px] text-zinc-500 font-mono">Supporte tous formats : .js, .ts, .py, Dockerfile, .json, .yaml</span>
                <input type="file" multiple onChange={handleLocalFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* Mode 3: Manual Direct Code Input */}
          {importMode === 'manual' && (
            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-white/10 space-y-3">
              <span className="text-xs font-mono text-zinc-300 font-bold block">
                Ajouter un fichier de code sur-mesure :
              </span>
              <input
                type="text"
                placeholder="Nom du fichier (ex: src/auth.ts)"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <textarea
                placeholder="Collez le code source ici..."
                rows={5}
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddNewFile}
                className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-emerald-300 font-bold border border-emerald-500/30 cursor-pointer"
              >
                + Enregistrer ce fichier dans le projet
              </button>
            </div>
          )}

          {/* Active Files List in Memory */}
          <div className="p-5 rounded-2xl bg-[#0f0f13] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-300 font-bold">
                Fichiers Chargés ({files.length}) :
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Prêts pour inférence</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-zinc-900/80 border border-white/5 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2 truncate text-zinc-200">
                    <FileCode size={15} className="text-emerald-400 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-zinc-500">
                      {Math.round(file.content.length / 1024 * 10) / 10} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-zinc-600 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Launch Audit Button */}
            <button
              type="button"
              onClick={handleRunAudit}
              disabled={isAuditing || files.length === 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isAuditing ? (
                <>
                  <ArrowsClockwise size={16} className="animate-spin" />
                  <span>Analyse IA Groq 360° en cours...</span>
                </>
              ) : (
                <>
                  <Sparkle size={16} weight="fill" />
                  <span>Lancer l'Audit DevSecOps Complet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Dynamic Interactive Audit Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-white/10 shadow-xl space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Résultats d'Audit 360° Dynamiques</h3>
                <span className="text-xs font-mono text-zinc-400">
                  {auditResult ? `Projet : ${projectName} (${auditResult.inferenceTimeMs}ms · ${auditResult.modelUsed})` : 'En attente de lancement...'}
                </span>
              </div>

              {auditResult && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-zinc-800 text-emerald-300 border border-emerald-500/30">
                    {totalFindings} Anomalies Détectées
                  </span>
                </div>
              )}
            </div>

            {/* Role Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('dev')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'dev'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <Code size={14} />
                <span>Vue Dev ({devFindings.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sec')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'sec'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck size={14} />
                <span>Vue SecOps ({secFindings.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('qa')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'qa'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                    : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <Target size={14} />
                <span>Vue QA ({qaFindings.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold'
                    : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <HardDrives size={14} />
                <span>Vue Admin ({adminFindings.length})</span>
              </button>
            </div>

            {/* Dynamic Findings Stage */}
            <div className="space-y-4 min-h-[380px] max-h-[500px] overflow-y-auto pr-1">
              {!auditResult ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-24 text-zinc-500 space-y-3 font-mono">
                  <FolderOpen size={48} className="text-zinc-600" />
                  <p className="max-w-md text-xs font-sans">
                    Importez un dépôt GitHub ou glissez vos fichiers, puis lancez l'audit pour inspecter le code et appliquer les correctifs.
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary Banner */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-white/10 text-xs font-mono text-zinc-300">
                    <span className="text-emerald-400 font-bold">SYNTHÈSE : </span>
                    <span>{auditResult.summary}</span>
                  </div>

                  {/* 1. VUE DEV */}
                  {activeTab === 'dev' && (
                    <div className="space-y-4">
                      {devFindings.map((item) => {
                        const isApplied = appliedFixes.includes(item.id);
                        return (
                          <div key={item.id} className="p-4 rounded-xl bg-zinc-900/70 border border-emerald-500/30 space-y-3 font-mono text-xs">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                {item.severity}
                              </span>
                              <span className="text-zinc-400 text-[11px] truncate max-w-xs">{item.file}</span>
                            </div>

                            <div>
                              <h4 className="text-white font-bold text-sm font-sans">{item.title}</h4>
                              <p className="text-zinc-400 text-xs mt-1 font-sans">{item.analysis}</p>
                            </div>

                            {/* Code Diff Before / After */}
                            {item.beforeCode && item.afterCode && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                                <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/20 space-y-1">
                                  <span className="text-[10px] text-rose-300 font-bold uppercase block">Avant (Vulnérable)</span>
                                  <pre className="text-zinc-400 whitespace-pre-wrap overflow-x-auto">{item.beforeCode}</pre>
                                </div>
                                <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                                  <span className="text-[10px] text-emerald-300 font-bold uppercase block">Après (Correctif Groq)</span>
                                  <pre className="text-emerald-300 whitespace-pre-wrap overflow-x-auto">{item.afterCode}</pre>
                                </div>
                              </div>
                            )}

                            {/* Interactive Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                              <button
                                type="button"
                                onClick={() => handleApplyFix(item)}
                                disabled={isApplied}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isApplied
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                                }`}
                              >
                                {isApplied ? <Check size={14} weight="bold" /> : <Lightning size={14} weight="bold" />}
                                <span>{isApplied ? 'Correctif Appliqué au Fichier !' : 'Appliquer ce correctif'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleConvertToTicket(item.title, item.analysis, 'P1')}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1.5 border border-white/10 cursor-pointer"
                              >
                                <span>Créer Ticket War Room</span>
                                <ArrowRight size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. VUE SECOPS */}
                  {activeTab === 'sec' && (
                    <div className="space-y-4">
                      {secFindings.map((item) => (
                        <div key={item.id} className="p-4 rounded-xl bg-zinc-900/70 border border-amber-500/30 space-y-3 font-mono text-xs">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              {item.severity} · {item.cve || 'OWASP Top 10'}
                            </span>
                            <span className="text-zinc-400 text-[11px]">{item.file}</span>
                          </div>

                          <div>
                            <h4 className="text-white font-bold text-sm font-sans">{item.title}</h4>
                            <p className="text-zinc-400 text-xs mt-1 font-sans">{item.analysis}</p>
                          </div>

                          {item.wafRule && (
                            <div className="p-2.5 rounded bg-black/60 border border-amber-500/20 space-y-1">
                              <span className="text-[10px] text-amber-300 font-bold uppercase block">Règle de filtrage WAF générée</span>
                              <pre className="text-zinc-300 text-[11px] whitespace-pre-wrap">{item.wafRule}</pre>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                triggerToast('Règle WAF injectée dans le pare-feu !', 'success');
                                addAuditLog(`Activation de la règle WAF [${item.title}]`, 'security', 'success');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <ShieldCheck size={14} weight="bold" />
                              <span>Activer la Règle WAF</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConvertToTicket(item.title, item.analysis, 'P1')}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1.5 border border-white/10 cursor-pointer"
                            >
                              <span>Créer Incident Sécurité</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. VUE QA */}
                  {activeTab === 'qa' && (
                    <div className="space-y-4">
                      {qaFindings.map((item) => (
                        <div key={item.id} className="p-4 rounded-xl bg-zinc-900/70 border border-cyan-500/30 space-y-3 font-mono text-xs">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              TEST PRIORITAIRE · {item.severity}
                            </span>
                            <span className="text-zinc-400 text-[11px]">{item.targetUrl}</span>
                          </div>

                          <div>
                            <h4 className="text-white font-bold text-sm font-sans">{item.title}</h4>
                            <p className="text-zinc-400 text-xs mt-1 font-sans">{item.analysis}</p>
                          </div>

                          {item.playwrightSnippet && (
                            <div className="p-2.5 rounded bg-black/60 border border-cyan-500/20 space-y-1">
                              <span className="text-[10px] text-cyan-300 font-bold uppercase block">Suite de Test Playwright E2E</span>
                              <pre className="text-cyan-200 text-[11px] whitespace-pre-wrap">{item.playwrightSnippet}</pre>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                triggerToast('Test envoyé au runner Playwright de Staging', 'success');
                                addAuditLog(`Exécution de test E2E pour [${item.title}]`, 'deploy', 'success');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Play size={14} weight="bold" />
                              <span>Exécuter dans le Runner QA</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onNavigate('qa-generator')}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1.5 border border-white/10 cursor-pointer"
                            >
                              <span>Ouvrir Synthétiseur E2E</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 4. VUE ADMIN */}
                  {activeTab === 'admin' && (
                    <div className="space-y-4">
                      {adminFindings.map((item) => (
                        <div key={item.id} className="p-4 rounded-xl bg-zinc-900/70 border border-rose-500/30 space-y-3 font-mono text-xs">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              FINOPS & K8S · {item.severity}
                            </span>
                            {item.finopsSavings && (
                              <span className="text-emerald-400 font-bold text-xs">
                                Économie : {item.finopsSavings}
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="text-white font-bold text-sm font-sans">{item.title}</h4>
                            <p className="text-zinc-400 text-xs mt-1 font-sans">{item.analysis}</p>
                            <p className="text-emerald-300 text-xs mt-1 font-sans font-semibold">{item.recommendation}</p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                triggerToast('Plan FinOps enregistré pour le prochain cycle Comex', 'success');
                                addAuditLog(`Validation FinOps pour [${item.title}]`, 'rbac', 'success');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <HardDrives size={14} weight="bold" />
                              <span>Planifier l'Optimisation K8s</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onNavigate('admin-topology')}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1.5 border border-white/10 cursor-pointer"
                            >
                              <span>Ouvrir Topologie Cluster</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
