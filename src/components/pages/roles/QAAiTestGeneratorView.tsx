import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target,
  Sparkle,
  ArrowsClockwise,
  CheckCircle,
  Copy,
  Check,
  Code,
  TerminalWindow,
  Play,
  FileCode,
  ChartLineUp,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { groqAI } from '../../../services/groqClient';
import { useRole } from '../../../context/RoleContext';

const PRESET_USER_STORIES = [
  {
    title: 'Tunnel de commande avec code promo et carte 3D-Secure',
    story: `En tant que client connecté, je souhaite saisir le code promo "BLACKFRIDAY26", vérifier la réduction de 20% sur le sous-total, puis valider avec une carte Visa 3D-Secure pour recevoir un numéro de commande et un statut HTTP 201.`,
    framework: 'playwright',
  },
  {
    title: 'Flux de réinitialisation de mot de passe avec lien magique',
    story: `En tant qu'utilisateur ayant oublié son mot de passe, je saisis mon email, intercepte l'appel webhook de reset, clique sur le token d'un usage unique et vérifie que l'ancien mot de passe est immédiatement invalidé.`,
    framework: 'playwright',
  },
  {
    title: 'Dépassement de quota d’appels API et vérification HTTP 429',
    story: `En tant que client API externe, j'envoie 100 requêtes consécutives en moins de 1 seconde vers /v1/checkout/session et valide que la 101ème renvoie le code HTTP 429 Too Many Requests avec l'en-tête Retry-After: 60.`,
    framework: 'cypress',
  },
];

export const QAAiTestGeneratorView: React.FC<{ onNavigateToBench?: () => void }> = ({ onNavigateToBench }) => {
  const { project, updateProject, triggerToast, addAuditLog } = useRole();

  const dynamicUserStories = [
    {
      title: `Tunnel de paiement & API Charge (${project.name})`,
      story: `En tant que client du service ${project.name}, je soumets une requête POST vers /v1/charge avec un montant valide et un token Stripe, puis je vérifie la réponse HTTP 200 contenant { success: true } et la mise à jour du statut.`,
      framework: 'playwright' as const,
    },
    {
      title: `Réservation d'inventaire et concurrence Redis (${project.name})`,
      story: `En tant qu'utilisateur simultané, j'appelle le service de réservation pour 5 articles en concurrence, je valide l'acquisition correcte du verrou Redis et le déverrouillage systématique sans fuite de connexion.`,
      framework: 'playwright' as const,
    },
    {
      title: `Validation des limites de requêtes et quota HTTP 429 (${project.name})`,
      story: `En tant que client API externe, j'envoie 100 requêtes consécutives vers l'API ${project.name} et valide que la 101ème renvoie le code HTTP 429 Too Many Requests avec l'en-tête Retry-After.`,
      framework: 'cypress' as const,
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState(dynamicUserStories[0]);
  const [userStory, setUserStory] = useState(dynamicUserStories[0].story);
  const [framework, setFramework] = useState<'playwright' | 'cypress'>('playwright');
  const [targetUrl, setTargetUrl] = useState(`https://${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.staging.sentinel`);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSavedInProject, setIsSavedInProject] = useState(false);

  const [generatedScript, setGeneratedScript] = useState<{
    testScript: string;
    framework: string;
    modelUsed?: string;
    inferenceTimeMs?: number;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('sentinel_ai_qa_generator_result');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handleGenerateTests = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsSynthesizing(true);
    setIsSavedInProject(false);
    try {
      const res = await groqAI.generateE2ETests({
        userStory,
        framework,
        targetUrl,
      });
      setGeneratedScript(res);
      try {
        sessionStorage.setItem('sentinel_ai_qa_generator_result', JSON.stringify(res));
      } catch {}
      triggerToast(`Suite de tests ${framework.toUpperCase()} générée en ${res.inferenceTimeMs}ms`, 'success');
      addAuditLog(`Génération IA d'une suite de tests E2E pour [${project.name}]`, 'deploy', 'success');
      try {
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.8 }, colors: ['#06b6d4', '#22d3ee'] });
      } catch {}
    } catch {
      triggerToast('Échec de la synthèse de tests E2E', 'warning');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSaveTestToProject = () => {
    if (!generatedScript?.testScript) return;
    const testFileName = `tests/e2e-${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.spec.ts`;
    const existingIndex = project.files.findIndex((f) => f.name === testFileName);
    let nextFiles = [...project.files];
    if (existingIndex >= 0) {
      nextFiles[existingIndex] = { name: testFileName, content: generatedScript.testScript };
    } else {
      nextFiles.push({ name: testFileName, content: generatedScript.testScript });
    }
    updateProject({ files: nextFiles });
    setIsSavedInProject(true);
    triggerToast(`Suite de tests enregistrée dans le projet sous [${testFileName}] !`, 'success');
    addAuditLog(`Ajout du fichier de tests [${testFileName}] au projet partagé`, 'deploy', 'success');
    try {
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.8 }, colors: ['#06b6d4', '#10b981'] });
    } catch {}
  };

  const handleCopyScript = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript.testScript);
    setCopied(true);
    triggerToast('Script E2E copié !', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-[#0e1418] to-[#08080a] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                QA SYNTHESIZER LAB
              </span>
              <span className="text-xs font-mono text-zinc-400">Playwright & Cypress Automation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Générateur Intelligent de Scénarios E2E & BDD
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
              Transformez vos User Stories en véritables scripts de tests Playwright/Cypress complets avec assertions, mocks d'API et cas limites générés en quelques millisecondes par Groq.
            </p>
          </div>

          {onNavigateToBench && (
            <button
              onClick={onNavigateToBench}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ChartLineUp size={15} />
              <span>Benchmarking & K6 Stress →</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Project QA Target */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0f0f13] border border-cyan-500/20 shadow-lg">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-cyan-400" />
          <span className="text-xs font-mono font-bold text-white uppercase">Cible QA Active :</span>
          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
            {project.name}
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            ({project.files.length} fichiers dans le projet partagé)
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Playwright & Cypress E2E Runner
        </span>
      </div>

      {/* Preset User Stories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-mono text-zinc-400 shrink-0">Scénarios types :</span>
        {dynamicUserStories.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedPreset(preset);
              setUserStory(preset.story);
              setFramework(preset.framework as any);
              setGeneratedScript(null);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
              selectedPreset.title === preset.title
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-zinc-900/60 text-zinc-400 border-white/5 hover:border-white/20'
            }`}
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: User Story Input */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-cyan-400" />
                <span className="text-xs font-bold text-white font-mono">User Story ou Exigence QA</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-white/5 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setFramework('playwright')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    framework === 'playwright' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-zinc-500'
                  }`}
                >
                  Playwright
                </button>
                <button
                  type="button"
                  onClick={() => setFramework('cypress')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${
                    framework === 'cypress' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-zinc-500'
                  }`}
                >
                  Cypress
                </button>
              </div>
            </div>

            <textarea
              value={userStory}
              onChange={(e) => setUserStory(e.target.value)}
              rows={12}
              placeholder="Décrivez les étapes du test..."
              className="w-full p-3.5 rounded-xl bg-[#070709] border border-white/10 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 leading-relaxed resize-none"
            />
          </div>

          <button
            onClick={handleGenerateTests}
            disabled={isSynthesizing || !userStory.trim()}
            className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isSynthesizing ? (
              <>
                <ArrowsClockwise size={16} className="animate-spin text-zinc-950" />
                <span>Synthèse Playwright Groq LPU en cours...</span>
              </>
            ) : (
              <>
                <Sparkle size={16} weight="fill" />
                <span>Générer Script de Test {framework.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Generated Script */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Code size={16} className="text-cyan-400" />
                <span className="text-xs font-bold text-white font-mono">
                  Script de Test Automatisé {generatedScript?.modelUsed && `(${generatedScript.modelUsed})`}
                </span>
              </div>
              {generatedScript?.inferenceTimeMs && (
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                  {generatedScript.inferenceTimeMs}ms
                </span>
              )}
            </div>

            {!generatedScript ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-500 font-mono text-xs">
                <TerminalWindow size={32} className="text-zinc-600 animate-pulse" />
                <p>Cliquez sur "Générer Script" pour produire le code de test complet.</p>
              </div>
            ) : (
              <pre className="p-4 rounded-xl bg-[#070709] border border-cyan-500/30 text-xs font-mono text-cyan-200/90 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
                {generatedScript.testScript}
              </pre>
            )}
          </div>

          {generatedScript && (
            <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveTestToProject}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                    isSavedInProject
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950'
                  }`}
                >
                  <CheckCircle size={15} weight="bold" />
                  <span>{isSavedInProject ? 'Suite E2E Ajoutée au Projet !' : 'Enregistrer dans tests/ du Projet'}</span>
                </button>
                <button
                  onClick={handleCopyScript}
                  className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-mono text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-cyan-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">Ajoute un fichier .spec.ts au projet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
