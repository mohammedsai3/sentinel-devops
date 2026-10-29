import React from 'react';
import {
  ArrowRight,
} from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { WebGLScene } from './WebGLScene';
import { ScrollReveal } from './ScrollReveal';

interface HeroProps {
  statusMode: 'nominal' | 'investigating' | 'critical';
  setStatusMode: (mode: 'nominal' | 'investigating' | 'critical') => void;
  onOpenReportModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  statusMode,
  setStatusMode,
  onOpenReportModal,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="hero" className="relative min-h-[100dvh] pt-24 pb-16 flex flex-col justify-between overflow-hidden">
      {/* Background blueprint subtle texture */}
      <div className="absolute inset-0 grid-blueprint opacity-40 pointer-events-none" />

      {/* Main hero grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Value Proposition & Intent */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-7 flex flex-col justify-center space-y-6"
          >
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              La tour de contrôle <br className="hidden sm:inline" />
              <span className="text-emerald-400">DevSecOps unifiée</span> <br />
              pour toute l'entreprise.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-[62ch]">
              Du signalement d'une panne par les équipes métier jusqu'à la Root Cause Analysis automatisée par <strong className="text-white font-medium">l'IA Groq en 42ms</strong> et la sécurisation des pipelines CI/CD.
            </p>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#simulator"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
              >
                <span>Tester une déclaration de panne</span>
                <ArrowRight size={16} weight="bold" />
              </a>

              <button
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-200 text-sm font-medium transition-all cursor-pointer"
              >
                <span>Signaler une panne</span>
              </button>
            </div>

            {/* Technical trust badges */}
            <div className="pt-4 border-t border-white/[0.08] grid grid-cols-3 gap-4 font-mono text-xs text-zinc-400">
              <div className="flex flex-col">
                <span className="text-white font-semibold text-base tabular-nums">~42ms</span>
                <span className="text-zinc-500 text-[11px] mt-0.5">Inférence RCA Groq LPU</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-base tabular-nums">-68%</span>
                <span className="text-zinc-500 text-[11px] mt-0.5">MTTR constaté</span>
              </div>
              <div className="flex flex-col">
                <span className="text-emerald-400 font-semibold text-base tabular-nums">0 Bruit</span>
                <span className="text-zinc-500 text-[11px] mt-0.5">Déduplication d'alertes</span>
              </div>
            </div>

          </motion.div>

          {/* Right Column: WebGL Interactive 3D Canvas & Simulation HUD */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-2xl bg-zinc-950/90 border border-white/10 overflow-hidden shadow-2xl shadow-black/80 backdrop-blur-sm">
              
              {/* Clean Header bar of 3D Canvas */}
              <div className="px-4 py-3 border-b border-white/[0.08] bg-zinc-900/60 flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-400">topologie.3d.webgl</span>
                <span className="text-[11px] font-mono text-zinc-400">
                  Interactions 3D · 60 FPS
                </span>
              </div>

              {/* The WebGL Canvas */}
              <div className="h-[360px] sm:h-[400px] w-full relative overflow-hidden bg-[#08080a]">
                <WebGLScene
                  statusMode={statusMode}
                  onNodeClick={(info) => console.log(info)}
                />
              </div>

              {/* Interactive State Controller (Direct User Interaction with WebGL) */}
              <div className="relative z-20 p-3.5 bg-[#09090b] border-t border-white/[0.08] flex flex-col gap-2 pointer-events-auto">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>État du cluster :</span>
                  <span className="text-zinc-500">
                    {statusMode === 'nominal' && 'Topologie saine (99.98%)'}
                    {statusMode === 'investigating' && 'Corrélation Groq active'}
                    {statusMode === 'critical' && 'Incident critique P1'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusMode('nominal')}
                    className={`relative z-30 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all border cursor-pointer ${
                      statusMode === 'nominal'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm font-semibold'
                        : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    Nominal
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusMode('investigating')}
                    className={`relative z-30 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all border cursor-pointer ${
                      statusMode === 'investigating'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm font-semibold'
                        : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    Analyse Groq
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusMode('critical')}
                    className={`relative z-30 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all border cursor-pointer ${
                      statusMode === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-sm font-semibold'
                        : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    Alerte P1
                  </button>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
