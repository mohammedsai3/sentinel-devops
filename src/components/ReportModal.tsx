import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  CaretDown,
  ArrowRight,
} from '@phosphor-icons/react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEPARTMENTS = [
  'Support Client & Relation Utilisateur',
  'Équipe Produit & Design',
  'Développeurs & Core Engineering',
  'Sécurité & Infrastructure',
  'Opérations & Ventes',
];

const SEVERITIES = [
  { id: 'P1', label: 'P1 · Bloquant', desc: 'Panne totale', color: 'border-rose-500/40 text-rose-300 bg-rose-500/10' },
  { id: 'P2', label: 'P2 · Dégradé', desc: 'Ralentissement sévère', color: 'border-amber-500/40 text-amber-300 bg-amber-500/10' },
  { id: 'P3', label: 'P3 · Mineur', desc: 'Anomalie locale', color: 'border-zinc-700 text-zinc-300 bg-zinc-800/40' },
];

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('P2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const shouldReduceMotion = useReducedMotion();

  // Escape key listener & background scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketId = 'INC-' + Math.floor(1000 + Math.random() * 9000);
      setSubmittedId(ticketId);
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
    }, 750);
  };

  const handleReset = () => {
    setSubmittedId(null);
    setTitle('');
    setDescription('');
    setSeverity('P2');
    onClose();
  };

  // Easing curve from Emil Kowalski animation framework
  const easeOut = [0.23, 1, 0.32, 1] as const;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.22, ease: easeOut },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.18, ease: easeOut },
    },
  };

  const modalVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, scale: 0.96, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.22,
        ease: easeOut,
      },
    },
    exit: shouldReduceMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          scale: 0.96,
          y: 8,
          transition: {
            duration: 0.18,
            ease: easeOut,
          },
        },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="report-modal-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="report-modal-card"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: 'center' }}
            className="relative w-full max-w-lg rounded-2xl bg-[#0c0c0e] border border-zinc-800 shadow-[0_24px_64px_rgba(0,0,0,0.7)] p-6 sm:p-7 space-y-6 text-zinc-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Clean editorial typography without AI slop alert boxes */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800/80">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-white">
                  Déclarer un incident
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Renseignez les symptômes constatés pour déclencher le diagnostic automatique.
                </p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
                aria-label="Fermer la fenêtre"
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Content Switcher with smooth crossfade */}
            <AnimatePresence mode="wait">
              {submittedId ? (
                /* Confirmation Screen */
                <motion.div
                  key="confirmation-state"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: easeOut }}
                  className="space-y-5 py-3"
                >
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
                    <CheckCircle size={20} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white">
                        Incident enregistré : {submittedId}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        L'IA Groq a débuté la corrélation des traces techniques. L'équipe d'astreinte a été notifiée.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs space-y-2 text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Pôle déclarant</span>
                      <span className="font-medium text-zinc-200">{department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Priorité retenue</span>
                      <span className="font-mono text-zinc-200">{severity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Diagnostic IA</span>
                      <span className="text-emerald-400 font-medium">En cours de traitement (Groq LPU)</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={handleReset}
                      className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Fermer
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                /* Incident Form */
                <motion.form
                  key="form-state"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: easeOut }}
                  onSubmit={handleSubmit}
                  className="space-y-4.5"
                >
                  {/* Department field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                      Pôle ou équipe concernée
                    </label>
                    <div className="relative">
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full appearance-none bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-lg px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-colors pr-9 cursor-pointer"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept} className="bg-zinc-900 text-zinc-200">
                            {dept}
                          </option>
                        ))}
                      </select>
                      <CaretDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Title field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                      Titre du problème
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex. Échec de paiement sur le tunnel de commande"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-colors"
                    />
                  </div>

                  {/* Description field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                      Description des symptômes observés
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Détaillez le comportement anormal, messages d'erreur visibles, volume d'utilisateurs impactés..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  {/* Severity Segmented Control */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-zinc-300">
                      Niveau d'urgence
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {SEVERITIES.map((sev) => {
                        const isSelected = severity === sev.id;
                        return (
                          <motion.button
                            key={sev.id}
                            type="button"
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSeverity(sev.id)}
                            className={`p-2.5 rounded-lg text-left transition-all border cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? `${sev.color} shadow-sm font-medium`
                                : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-300'
                            }`}
                          >
                            <span className="text-xs font-semibold">{sev.label}</span>
                            <span className="text-[10px] text-zinc-500 mt-0.5">{sev.desc}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2.5">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={onClose}
                      className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.97 }}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Transmission...</span>
                      ) : (
                        <>
                          <span>Créer le ticket</span>
                          <ArrowRight size={13} weight="bold" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
