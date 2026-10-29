import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChartLineUp,
  Sparkle,
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
  Lightning,
  Cpu,
  Target,
  ArrowRight,
  Sliders,
} from '@phosphor-icons/react';
import { groqAI } from '../../../services/groqClient';
import { useRole } from '../../../context/RoleContext';

export const QAPerformanceBenchView: React.FC<{ onNavigateToGenerator?: () => void }> = ({ onNavigateToGenerator }) => {
  const { project, triggerToast, addAuditLog } = useRole();
  const [currentRps, setCurrentRps] = useState(1200);
  const [targetRps, setTargetRps] = useState(6500);
  const [service, setService] = useState(`${project.name} - Microservices & APIs`);
  const [isPredicting, setIsPredicting] = useState(false);

  const [prediction, setPrediction] = useState<{
    prediction: string;
    modelUsed?: string;
    inferenceTimeMs?: number;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('sentinel_ai_qa_bench_result');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handlePredictBottleneck = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsPredicting(true);
    try {
      const res = await groqAI.predictBottleneck({
        currentRps,
        targetRps,
        service,
      });
      setPrediction(res);
      try {
        sessionStorage.setItem('sentinel_ai_qa_bench_result', JSON.stringify(res));
      } catch {}
      triggerToast(`Analyse prédictive Groq complétée (${res.inferenceTimeMs}ms)`, 'success');
      addAuditLog(`Analyse prédictive de goulot d’étranglement K6 pour ${targetRps} RPS`, 'deploy', 'success');
    } catch {
      triggerToast('Échec de la prédiction de charge', 'warning');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-950/30 via-[#0e1218] to-[#08080a] border border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                BENCHMARKING & STRESS LAB
              </span>
              <span className="text-xs font-mono text-zinc-400">K6 Load Test & Bottleneck Predictor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Analyse Prédictive de Goulots d’Étranglement
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
              Prévoyez les ruptures de charge avant les pics de trafic (Black Friday, soldes) : l'IA Groq corrèle les métriques de concurrence pour déterminer quel composant craquera en premier.
            </p>
          </div>

          {onNavigateToGenerator && (
            <button
              onClick={onNavigateToGenerator}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>← Générateur E2E Playwright</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Project Bench Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0f0f13] border border-blue-500/20 shadow-lg">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-blue-400" />
          <span className="text-xs font-mono font-bold text-white uppercase">Cible Stress Lab Active :</span>
          <span className="text-xs font-mono font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
            {project.name}
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            ({project.files.length} fichiers sous test de charge)
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          K6 Load Engine
        </span>
      </div>

      {/* Simulator Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] space-y-3">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase">RPS Actuel en Production :</label>
          <div className="text-2xl font-bold text-white font-mono">{currentRps} req/s</div>
          <input
            type="range"
            min="500"
            max="3000"
            step="100"
            value={currentRps}
            onChange={(e) => setCurrentRps(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div className="p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] space-y-3">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase">Cible de Montée en Charge :</label>
          <div className="text-2xl font-bold text-blue-400 font-mono">{targetRps} req/s</div>
          <input
            type="range"
            min="3000"
            max="15000"
            step="500"
            value={targetRps}
            onChange={(e) => setTargetRps(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div className="p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] flex flex-col justify-between space-y-3">
          <div>
            <label className="text-xs font-mono font-bold text-zinc-300 uppercase">Services Cibles :</label>
            <input
              type="text"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <button
            onClick={handlePredictBottleneck}
            disabled={isPredicting}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-zinc-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isPredicting ? (
              <>
                <ArrowsClockwise size={15} className="animate-spin text-zinc-950" />
                <span>Simulation de charge Groq...</span>
              </>
            ) : (
              <>
                <Sparkle size={15} weight="fill" />
                <span>Prédire le Goulot d'Étranglement</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prediction Output */}
      {prediction && (
        <div className="p-6 rounded-2xl bg-[#0f0f13] border border-blue-500/30 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <ChartLineUp size={18} className="text-blue-400" />
              <h2 className="text-sm font-bold text-white font-mono">
                Diagnostic Prédictif de Rupture ({currentRps} → {targetRps} RPS)
              </h2>
            </div>
            {prediction.inferenceTimeMs && (
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                Inférence Groq : {prediction.inferenceTimeMs}ms
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#070709] border border-white/5 text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
            {prediction.prediction}
          </div>
        </div>
      )}
    </div>
  );
};
