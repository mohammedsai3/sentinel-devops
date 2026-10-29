import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  WarningCircle,
  UploadSimple,
  FileText,
  Sparkle,
  CheckCircle,
  Lightning,
  ShieldCheck,
  Cpu,
  Database,
  GitBranch,
  LockKey,
  X,
  Paperclip,
  ArrowLeft,
  ArrowRight,
  Info,
} from '@phosphor-icons/react';

import { useRole } from '../../context/RoleContext';
import { groqAI } from '../../services/groqClient';

interface CreateIncidentViewProps {
  onIncidentCreated: (newIncidentId: string) => void;
  onCancel: () => void;
}

export const CreateIncidentView: React.FC<CreateIncidentViewProps> = ({
  onIncidentCreated,
  onCancel,
}) => {
  const { createIncident, triggerToast } = useRole();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'infra' | 'secops' | 'api' | 'db' | 'cicd'>('db');
  const [severity, setSeverity] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P1');
  const [cluster, setCluster] = useState('k8s-prod-eu1');
  const [description, setDescription] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreflightActive, setIsPreflightActive] = useState(false);
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageInfo, setTriageInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAutoTriage = async () => {
    if (!title.trim() && !description.trim()) {
      triggerToast('Saisissez d’abord un titre ou une description pour guider l’IA', 'warning');
      return;
    }
    setIsTriaging(true);
    try {
      const res = await groqAI.triageIncident({
        title,
        description,
        category,
        service: cluster,
      });
      setSeverity(res.triage.priority as any);
      setTriageInfo(
        `Triage Groq (${res.modelUsed} · ${res.inferenceTimeMs}ms) : ${res.triage.rationale} (SLA estimé : ${res.triage.slaMinutes} min)`
      );
      triggerToast(`Triage Groq appliqué : Sévérité ${res.triage.priority}`, 'success');
    } catch {
      triggerToast('Échec du triage automatique', 'warning');
    } finally {
      setIsTriaging(false);
    }
  };

  // Preset sample logs for instant testing
  const sampleLogPresets = [
    {
      label: 'Logs Redis Timeout',
      titlePreset: 'Dépassement du pool de connexions Redis Saturn',
      catPreset: 'db' as const,
      sevPreset: 'P1' as const,
      textPreset:
        'Erreur critique de saturation : [ioredis] Unhandled error event: Error: Connection pool exhausted (max 200 handles reached). Callers blocked at CartService.reserveItems line 142. Timeout 5000ms dépassé sur 482 requêtes consécutives.',
      fileName: 'saturn-redis-error.log',
      fileSize: '48.2 KB',
    },
    {
      label: 'Logs Envoy Gateway 504',
      titlePreset: 'Timeouts 504 Gateway sur Traefik Ingress',
      catPreset: 'api' as const,
      sevPreset: 'P2' as const,
      textPreset:
        '[traefik] [error] upstream request timeout: 504 Gateway Timeout on /v1/checkout/session. Backlog TCP socket overflow on port 443.',
      fileName: 'traefik-access.log',
      fileSize: '124.6 KB',
    },
    {
      label: 'Logs Vault SSL Expiry',
      titlePreset: 'Échec de renouvellement certificat Vault OAuth2',
      catPreset: 'secops' as const,
      sevPreset: 'P2' as const,
      textPreset:
        '[vault-acme] [FATAL] Certificate renewal failed: ACME challenge response returned 403 Forbidden. Public webhook endpoint unreachable.',
      fileName: 'vault-audit.log',
      fileSize: '18.9 KB',
    },
  ];

  const applyPreset = (preset: (typeof sampleLogPresets)[0]) => {
    setTitle(preset.titlePreset);
    setCategory(preset.catPreset);
    setSeverity(preset.sevPreset);
    setDescription(preset.textPreset);
    setAttachedFiles([{ name: preset.fileName, size: preset.fileSize }]);
    setIsPreflightActive(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFiles((prev) => [
        ...prev,
        { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` },
      ]);
      setIsPreflightActive(true);
    }
  };

  const removeFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    // Simulate creation and Groq indexing
    setTimeout(() => {
      setIsSubmitting(false);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#06b6d4'],
        });
      } catch (err) {
        // Confetti fallback
      }
      const newId = createIncident({
        title,
        priority: severity,
        cluster,
        description,
        service: category === 'db' ? 'saturn-redis' : category === 'secops' ? 'vault-oauth2' : 'traefik-gw',
        category: category.toUpperCase(),
      });
      onIncidentCreated(newId);
    }, 700);
  };

  return (
    <div className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Back and Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Retour à l'annuaire</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Déclaration d'un Nouvel Incident
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">
            Soumission de panne avec triage assisté par IA Groq LPU et calcul prédictif de conformité SLA.
          </p>
        </div>

        {/* 1-Click Preset Samples */}
        <div className="flex flex-col sm:items-end gap-1.5">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Charger un exemple de panne :
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {sampleLogPresets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 hover:border-emerald-500/40 text-[11px] font-mono text-zinc-300 hover:text-emerald-300 transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form (2 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          
          {/* Incident Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                Titre de l'incident <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoTriage}
                disabled={isTriaging}
                className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isTriaging ? (
                  <>
                    <Lightning size={12} className="animate-spin text-emerald-400" />
                    <span>Triage en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkle size={12} className="text-amber-400" />
                    <span>Triage Assisté par IA Groq</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.length > 5) setIsPreflightActive(true);
              }}
              placeholder="Ex: Dépassement critique du pool Redis ou Timeouts 504 Gateway..."
              className="w-full px-4 py-2.5 rounded-lg bg-[#0f0f13] border border-white/10 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans"
            />
            {triageInfo && (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-start gap-2">
                <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{triageInfo}</span>
              </div>
            )}
            <p className="text-[11px] text-zinc-500 font-mono">
              Soyez précis sur le composant affecté et le symptôme immédiat.
            </p>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Catégorie & Domaine d'impact
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
              {[
                { id: 'db', label: 'Base & Cache', icon: Database },
                { id: 'infra', label: 'Infrastructure Cloud', icon: Cpu },
                { id: 'api', label: 'API & Microservices', icon: Lightning },
                { id: 'secops', label: 'Sécurité & Vault', icon: LockKey },
                { id: 'cicd', label: 'CI/CD & Déploiements', icon: GitBranch },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as any)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-zinc-800 text-emerald-400 border-emerald-500/50 shadow-sm'
                        : 'bg-[#0f0f13] text-zinc-400 border-white/10 hover:border-white/20 hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={16} className={isSelected ? 'text-emerald-400' : 'text-zinc-500'} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity & SLA Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Niveau de sévérité & SLA associé
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              {[
                { id: 'P1', label: 'P1 - Critique', sla: '15 min SLA', color: 'rose', desc: 'Arrêt total service' },
                { id: 'P2', label: 'P2 - Majeure', sla: '1h SLA', color: 'amber', desc: 'Dégradation forte' },
                { id: 'P3', label: 'P3 - Standard', sla: '4h SLA', color: 'zinc', desc: 'Anomalie partielle' },
                { id: 'P4', label: 'P4 - Mineure', sla: '24h SLA', color: 'zinc', desc: 'Cosmétique / faible' },
              ].map((sev) => {
                const isSelected = severity === sev.id;
                return (
                  <button
                    key={sev.id}
                    type="button"
                    onClick={() => setSeverity(sev.id as any)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? sev.id === 'P1'
                          ? 'bg-rose-950/30 text-rose-300 border-rose-500/60 shadow-sm'
                          : sev.id === 'P2'
                          ? 'bg-amber-950/30 text-amber-300 border-amber-500/60 shadow-sm'
                          : 'bg-zinc-800 text-zinc-100 border-white/30'
                        : 'bg-[#0f0f13] text-zinc-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold">{sev.label}</div>
                    <div className="text-[11px] text-zinc-400">{sev.sla}</div>
                    <div className="text-[10px] text-zinc-500">{sev.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cluster & Environment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                Cluster Kubernetes cible
              </label>
              <select
                value={cluster}
                onChange={(e) => setCluster(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#0f0f13] border border-white/10 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="k8s-prod-eu1">k8s-prod-eu1 (Francfort Principal)</option>
                <option value="k8s-prod-eu2">k8s-prod-eu2 (Paris Réplica)</option>
                <option value="security-core">security-core (Vault & IAM)</option>
                <option value="k8s-data-eu1">k8s-data-eu1 (Kafka & DB)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                Équipe notifiée automatiquement
              </label>
              <div className="px-3 py-2.5 rounded-lg bg-zinc-900 border border-white/5 text-xs font-mono text-zinc-400 flex items-center justify-between">
                <span>
                  {category === 'db'
                    ? 'Core Backend / SRE'
                    : category === 'secops'
                    ? 'SecOps & SSI'
                    : category === 'infra'
                    ? 'Cloud Ops Fleet'
                    : 'API Platform'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>

          {/* Detailed Symptom & Log text */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Description détaillée des symptômes ou stack trace
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (e.target.value.length > 10) setIsPreflightActive(true);
              }}
              placeholder="Détaillez le comportement observé, la stack trace ou les logs d'erreurs pertinents..."
              className="w-full p-3.5 rounded-lg bg-[#0f0f13] border border-white/10 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-y"
            />
          </div>

          {/* Log File Attachment Dropzone */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Fichiers de logs & traces système (.log, .json, .txt)
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".log,.txt,.json,.gz"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-xl border border-dashed border-white/20 hover:border-emerald-500/60 bg-[#0f0f13]/60 hover:bg-[#0f0f13] transition-all cursor-pointer text-center space-y-2 group"
            >
              <UploadSimple
                size={28}
                className="mx-auto text-zinc-500 group-hover:text-emerald-400 transition-colors"
              />
              <div className="text-xs text-zinc-300 font-sans">
                <span className="text-emerald-400 font-medium">Cliquez pour téléverser</span> ou glissez vos fichiers ici
              </div>
              <div className="text-[11px] font-mono text-zinc-500">
                Supporte les exports Sentry, Prometheus, Datadog ou dumps Kubernetes (max 50 Mo)
              </div>
            </div>

            {/* Attached Files List */}
            {attachedFiles.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {attachedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 border border-white/5 text-xs font-mono text-zinc-300"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-emerald-400" />
                      <span>{f.name}</span>
                      <span className="text-zinc-500 text-[11px]">({f.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Annuler
            </button>

            <motion.button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-bold font-sans hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Lightning size={15} className="animate-spin" />
                  <span>Indexation Groq en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={15} weight="bold" />
                  <span>Valider et ouvrir la War Room</span>
                </>
              )}
            </motion.button>
          </div>

        </form>

        {/* Right Column: Instant Live Groq RCA Pre-Flight Check */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-[#0f0f13] border border-teal-500/30 space-y-4 shadow-xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Sparkle size={16} weight="fill" className="text-teal-400" />
                <span className="font-mono text-xs font-bold text-teal-300">
                  PRE-FLIGHT GROQ LPU
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-500/30">
                42ms latency
              </span>
            </div>

            {isPreflightActive ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3.5 text-xs font-sans"
              >
                <div className="p-2.5 rounded-lg bg-teal-950/20 border border-teal-500/20 space-y-1">
                  <div className="font-mono text-[11px] text-teal-400 font-semibold">
                    ANALYSE PRÉDICTIVE GROQ :
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-[12px]">
                    Symptômes cohérents avec une saturation de socket handles dans le driver de cache.
                  </p>
                </div>

                <div className="space-y-2 text-xs font-mono text-zinc-400">
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <span>Sévérité estimée :</span>
                    <span className="font-bold text-rose-400">P1 - Critique</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <span>Service incriminé :</span>
                    <span className="text-zinc-200">saturn-redis</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <span>Escalade suggérée :</span>
                    <span className="text-emerald-400">@sre-core-oncall</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Impact utilisateurs :</span>
                    <span className="text-amber-400">~12% des paniers bloqués</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 space-y-1 font-mono text-[11px] text-zinc-400">
                  <div className="text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Info size={13} className="text-emerald-400" />
                    <span>Action automatique prévue :</span>
                  </div>
                  <p className="text-zinc-400">
                    Génération immédiate d'un canal de discussion War Room, diagnostic RCA et proposition de patch de commande kubectl.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="py-8 text-center space-y-2 text-xs text-zinc-400 font-mono">
                <Sparkle size={24} className="mx-auto text-zinc-600" />
                <p>En attente de saisie...</p>
                <p className="text-[11px] text-zinc-500">
                  Tapez un titre ou injectez un log d'exemple pour activer l'analyse instantanée.
                </p>
              </div>
            )}

          </div>

          {/* SLA Reminder Badge */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/[0.06] font-mono text-xs space-y-2">
            <div className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Engagement SLA P1 Contractuel</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Tout incident déclaré P1 déclenche un appel PagerDuty automatisé et une fenêtre d'intervention maximale de 15 minutes.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
