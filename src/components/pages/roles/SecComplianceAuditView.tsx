import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Sparkle,
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
  FileText,
  Copy,
  Check,
  LockKey,
  Database,
  Users,
  Eye,
} from '@phosphor-icons/react';
import { groqAI } from '../../../services/groqClient';
import { useRole } from '../../../context/RoleContext';

const COMPLIANCE_FRAMEWORKS = [
  { id: 'SOC2', name: 'SOC 2 Type II', focus: 'Sécurité, Disponibilité & Confidentialité Cloud' },
  { id: 'ISO27001', name: 'ISO / IEC 27001:2022', focus: 'Système de Management de la Sécurité de l’Information' },
  { id: 'GDPR', name: 'RGPD / Privacy', focus: 'Protection des Données Personnelles & Droit à l’Oubli' },
];

const COMPLIANCE_DOMAINS = [
  'Gestion des Secrets & Chiffrement Vault (TLS 1.3)',
  'Contrôle d’Accès & RBAC Zéro-Trust',
  'Piste d’Audit & Journalisation Immuable des Actions',
  'Résilience & Plan de Continuité d’Activité (PCA/PRA)',
];

export const SecComplianceAuditView: React.FC<{ onNavigateToThreats?: () => void }> = ({ onNavigateToThreats }) => {
  const { project, triggerToast, addAuditLog } = useRole();
  const [selectedStandard, setSelectedStandard] = useState(COMPLIANCE_FRAMEWORKS[0].id);
  const [selectedDomain, setSelectedDomain] = useState(COMPLIANCE_DOMAINS[0]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [auditReport, setAuditReport] = useState<{
    auditReport: string;
    standard: string;
    domain: string;
    modelUsed?: string;
    inferenceTimeMs?: number;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('sentinel_ai_compliance_result');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handleRunAudit = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsAuditing(true);
    try {
      const res = await groqAI.auditCompliance({
        standard: `${selectedStandard} (${project.name})`,
        domain: `${selectedDomain} sur les microservices du projet [${project.name}]`,
      });
      setAuditReport(res);
      try {
        sessionStorage.setItem('sentinel_ai_compliance_result', JSON.stringify(res));
      } catch {}
      triggerToast(`Audit ${selectedStandard} complété en ${res.inferenceTimeMs}ms`, 'success');
      addAuditLog(`Audit de conformité ${selectedStandard} sur [${selectedDomain}] pour [${project.name}]`, 'security', 'success');
    } catch {
      triggerToast('Échec de la génération de l’audit', 'warning');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopyReport = () => {
    if (!auditReport) return;
    navigator.clipboard.writeText(auditReport.auditReport);
    setCopied(true);
    triggerToast('Rapport d’audit copié !', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-950/30 via-[#100e14] to-[#08080a] border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                AUDIT DE CONFORMITÉ & GOUVERNANCE
              </span>
              <span className="text-xs font-mono text-zinc-400">SOC2 · ISO 27001 · RGPD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Évaluation Automatisée de Conformité Cyber
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
              Vérifiez en temps réel l'alignement des configurations techniques et politiques RBAC avec les standards internationaux grâce à l'analyse experte Groq LPU.
            </p>
          </div>

          {onNavigateToThreats && (
            <button
              onClick={onNavigateToThreats}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>← Threat Intelligence WAF</span>
            </button>
          )}
        </div>
      </div>

      {/* Scope banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0f0f13] border border-purple-500/20 shadow-lg">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-purple-400" />
          <span className="text-xs font-mono font-bold text-white uppercase">Périmètre d'Audit Actif :</span>
          <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
            {project.name}
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            ({project.files.length} fichiers dans le scope d'évaluation)
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Zéro Trust Architecture
        </span>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Standard Picker */}
        <div className="p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] space-y-3">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase">1. Référentiel Normatif :</label>
          <div className="space-y-2">
            {COMPLIANCE_FRAMEWORKS.map((fw) => (
              <div
                key={fw.id}
                onClick={() => setSelectedStandard(fw.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedStandard === fw.id
                    ? 'bg-purple-950/30 border-purple-500/50 text-white'
                    : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/15'
                }`}
              >
                <div>
                  <div className="text-xs font-bold font-mono">{fw.name}</div>
                  <div className="text-[11px] text-zinc-500">{fw.focus}</div>
                </div>
                {selectedStandard === fw.id && <CheckCircle size={16} className="text-purple-400" weight="fill" />}
              </div>
            ))}
          </div>
        </div>

        {/* Domain Picker & Action */}
        <div className="p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-zinc-300 uppercase">2. Domaine d'Évaluation Technique :</label>
            <div className="space-y-2">
              {COMPLIANCE_DOMAINS.map((dom, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedDomain(dom)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-xs font-mono ${
                    selectedDomain === dom
                      ? 'bg-purple-950/30 border-purple-500/50 text-purple-200'
                      : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/15'
                  }`}
                >
                  {dom}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="w-full py-3 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-zinc-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isAuditing ? (
              <>
                <ArrowsClockwise size={16} className="animate-spin text-zinc-950" />
                <span>Audit Groq LPU en cours (~40ms)...</span>
              </>
            ) : (
              <>
                <Sparkle size={16} weight="fill" />
                <span>Lancer l'Évaluation de Conformité IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audit Report Result */}
      {auditReport && (
        <div className="p-6 rounded-2xl bg-[#0f0f13] border border-purple-500/30 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-purple-400" />
              <h2 className="text-sm font-bold text-white font-mono">
                Rapport d'Audit {auditReport.standard} · {auditReport.domain}
              </h2>
            </div>
            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copié !' : 'Exporter pour DPO / RSSI'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#070709] border border-white/5 text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
            {auditReport.auditReport}
          </div>
        </div>
      )}
    </div>
  );
};
