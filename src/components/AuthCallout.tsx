import React, { useState } from 'react';
import {
  LockKey,
  GitBranch,
  Fingerprint,
  Target,
  ArrowRight,
  CheckCircle,
} from '@phosphor-icons/react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ScrollReveal } from './ScrollReveal';

export const AuthCallout: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'dev' | 'sec' | 'qa'>('dev');
  const [isSimulatedLogin, setIsSimulatedLogin] = useState<boolean>(false);

  const roles = [
    {
      id: 'dev' as const,
      name: 'Développeur',
      badge: 'Accès Code, RCA Groq & Stacks',
      description: 'Accès direct aux traces de crash, propositions de hotfix Copilote et webhooks de déploiement.',
      icon: GitBranch,
      landingRedirect: '/dashboard/incidents?filter=assigned:me',
    },
    {
      id: 'sec' as const,
      name: 'Sécurité & SecOps',
      badge: 'Scans CVE & Politiques Bloquantes',
      description: 'Supervision des failles Trivy, audit des jetons de service et validation des exemptions de build.',
      icon: Fingerprint,
      landingRedirect: '/supervision/security?view=cve_matrix',
    },
    {
      id: 'qa' as const,
      name: 'Testeur & QA Lead',
      badge: 'Rapports E2E & Non-Régression',
      description: 'Corrélation des tests de bout en bout défaillants avec les commits récents et tickets ouverts.',
      icon: Target,
      landingRedirect: '/supervision/tests?status=failing',
    },
  ];

  const shouldReduceMotion = useReducedMotion();
  const easeOut = [0.23, 1, 0.32, 1] as const;

  const current = roles.find((r) => r.id === selectedRole) || roles[0];

  const handleSimulateLogin = () => {
    setIsSimulatedLogin(true);
    setTimeout(() => {
      setIsSimulatedLogin(false);
    }, 2500);
  };

  return (
    <section id="auth-preview" className="py-24 bg-[#08080a] relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <ScrollReveal>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/60 to-zinc-950 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Context */}
              <div className="lg:col-span-7 space-y-5">

                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                  Accès sécurisé adapté à votre habilitation
                </h2>

                <p className="text-zinc-300 text-base leading-relaxed max-w-[58ch]">
                  Les habilitations Sentinel appliquent le principe du moindre privilège : chaque rôle accède instantanément à l'espace de travail correspondant à ses responsabilités opérationnelles.
                </p>

                {/* Role Toggle Selector */}
                <div className="pt-2 flex flex-wrap gap-2.5">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = r.id === selectedRole;
                    return (
                      <motion.button
                        key={r.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedRole(r.id)}
                        className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? 'text-white border-white/20 shadow'
                            : 'bg-zinc-900/70 text-zinc-400 border-transparent hover:bg-zinc-800/70'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="auth-role-pill"
                            className="absolute inset-0 bg-zinc-800 rounded-lg -z-10 shadow border border-white/10"
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          />
                        )}
                        <Icon size={16} weight="duotone" className={isSelected ? 'text-emerald-400' : ''} />
                        <span>{r.name}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Current Role Privileges Box */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: easeOut }}
                    className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 space-y-1.5 text-xs font-mono"
                  >
                    <div className="text-emerald-400 font-semibold">{current.badge}</div>
                    <div className="text-zinc-400">{current.description}</div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Column: Interactive Login Card Mockup */}
              <div className="lg:col-span-5">
                <div className="rounded-xl bg-[#060608] border border-white/10 p-6 space-y-5 shadow-2xl">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <LockKey size={18} className="text-emerald-400" />
                      <span className="text-xs font-semibold text-zinc-200">
                        Authentification SSO
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">Portail v2.8</span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.id}
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, ease: easeOut }}
                      className="space-y-3.5"
                    >
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                          Identifiant d'entreprise
                        </label>
                        <div className="w-full bg-zinc-900/80 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-200">
                          user@{selectedRole === 'dev' ? 'engineering' : selectedRole === 'sec' ? 'cybersec' : 'qa'}.internal
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                          Méthode d'authentification
                        </label>
                        <div className="w-full bg-zinc-900/80 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-zinc-300 flex items-center justify-between">
                          <span>Okta Verify / Azure AD (MFA)</span>
                          <CheckCircle size={15} weight="fill" className="text-emerald-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                          Redirection après connexion
                        </label>
                        <div className="w-full bg-zinc-900/40 border border-white/5 rounded-lg px-3.5 py-2 text-xs font-mono text-emerald-400 truncate">
                          {current.landingRedirect}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <button
                    onClick={handleSimulateLogin}
                    disabled={isSimulatedLogin}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-all shadow-md cursor-pointer disabled:opacity-75"
                  >
                    {isSimulatedLogin ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-zinc-950 animate-ping mr-1" />
                        <span>Validation du jeton SAML / OIDC...</span>
                      </>
                    ) : (
                      <>
                        <span>Se connecter avec {current.name}</span>
                        <ArrowRight size={14} weight="bold" />
                      </>
                    )}
                  </button>

                  <div className="text-center text-[11px] text-zinc-500">
                    Accès restreint au réseau d'entreprise et VPN WireGuard autorisé.
                  </div>

                </div>
              </div>

            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
