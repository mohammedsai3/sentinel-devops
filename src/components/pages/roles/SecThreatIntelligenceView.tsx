import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldWarning,
  Sparkle,
  ArrowsClockwise,
  CheckCircle,
  Copy,
  Check,
  ShieldCheck,
  WarningCircle,
  Lightning,
  LockKey,
  TerminalWindow,
  FileCode,
} from '@phosphor-icons/react';
import { groqAI } from '../../../services/groqClient';
import { useRole } from '../../../context/RoleContext';

const THREAT_SAMPLES = [
  {
    type: 'SQL Injection via JSON Payload',
    target: 'API Checkout /v1/order',
    payload: `{"orderId": "10492' OR 1=1; DROP TABLE sessions; --", "tenant": "corp"}`,
    desc: 'Tentative d\'évasion SQL dans le corps JSON non aseptisé.',
  },
  {
    type: 'HTTP/2 Rapid Reset DDoS (CVE-2023-44487)',
    target: 'Traefik Ingress Gateway',
    payload: `HEADERS frame with stream reset RST_STREAM sent concurrently x 50,000 requests/sec.`,
    desc: 'Exploitation du protocole HTTP/2 provoquant un déni de service.',
  },
  {
    type: 'JWT Signature Stripping (Alg: None Exploit)',
    target: 'OAuth2 Vault Microservice',
    payload: `eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsImlzcyI6ImNvcnAifQ.`,
    desc: 'Tentative d\'escalade de privilèges en supprimant la signature cryptographique.',
  },
];

export const SecThreatIntelligenceView: React.FC<{ onNavigateToCompliance?: () => void }> = ({ onNavigateToCompliance }) => {
  const { project, triggerToast, addAuditLog } = useRole();

  const dynamicThreats = [
    {
      type: `SQL Injection dans l'API de ${project.name}`,
      target: `${project.name} (Endpoint /v1/charge)`,
      payload: `{"amount": 990, "token": "tok_123' OR 1=1; DROP TABLE payments; --"}`,
      desc: `Tentative d'évasion SQL dans le corps JSON non aseptisé ciblant ${project.name}.`,
    },
    {
      type: `HTTP/2 Rapid Reset DDoS (CVE-2023-44487)`,
      target: `${project.name} Ingress Gateway`,
      payload: `HEADERS frame with stream reset RST_STREAM sent concurrently x 50,000 requests/sec.`,
      desc: `Exploitation du protocole HTTP/2 provoquant un déni de service sur le cluster hébergeant ${project.name}.`,
    },
    {
      type: `JWT Signature Stripping (Alg: None Exploit)`,
      target: `${project.name} Auth Middleware`,
      payload: `eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsImlzcyI6ImNvcnAifQ.`,
      desc: `Tentative d'escalade de privilèges en supprimant la signature cryptographique du token d'accès.`,
    },
  ];

  const [selectedThreat, setSelectedThreat] = useState(dynamicThreats[0]);
  const [payload, setPayload] = useState(dynamicThreats[0].payload);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'waf' | 'suricata' | 'recom'>('waf');
  const [copied, setCopied] = useState(false);

  const [ruleResult, setRuleResult] = useState<{
    severityScore: string;
    threatVector: string;
    wafRule: string;
    suricataRule: string;
    recommendation: string;
    modelUsed?: string;
    inferenceTimeMs?: number;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('sentinel_ai_threat_result');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handleGenerateRule = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await groqAI.generateThreatRule({
        threatType: selectedThreat.type,
        payloadSample: payload,
        targetSystem: selectedThreat.target,
      });
      setRuleResult(res);
      try {
        sessionStorage.setItem('sentinel_ai_threat_result', JSON.stringify(res));
      } catch {}
      triggerToast(`Règle WAF & IDS générée en ${res.inferenceTimeMs}ms par Groq LPU`, 'success');
      addAuditLog(`Synthèse de règle WAF pour la menace [${selectedThreat.type}]`, 'security', 'warning');
    } catch {
      triggerToast('Échec de la génération de règle WAF', 'warning');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyRule = () => {
    if (!ruleResult) return;
    const text = activeTab === 'waf' ? ruleResult.wafRule : activeTab === 'suricata' ? ruleResult.suricataRule : ruleResult.recommendation;
    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerToast('Règle copiée dans le presse-papier !', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-950/40 via-[#120f0a] to-[#08080a] border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                THREAT INTELLIGENCE & WAF LAB
              </span>
              <span className="text-xs font-mono text-zinc-400">SOC & IDS Automation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Détection de Menaces & Générateur de Règles WAF / Suricata
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
              Analysez les payloads d'attaque suspects et générez instantanément avec Groq les règles de pare-feu Cloudflare, ModSecurity et signatures Suricata prêtes pour le déploiement.
            </p>
          </div>

          {onNavigateToCompliance && (
            <button
              onClick={onNavigateToCompliance}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck size={15} />
              <span>Audit de Conformité SOC2 →</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Project Security Target */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0f0f13] border border-amber-500/20 shadow-lg">
        <div className="flex items-center gap-2">
          <LockKey size={16} className="text-amber-400" />
          <span className="text-xs font-mono font-bold text-white uppercase">Cible WAF & IDS Active :</span>
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            {project.name}
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            ({project.files.length} fichiers sous surveillance réseau)
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Inspection L7 & Règles IDS
        </span>
      </div>

      {/* Preset Threats */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-mono text-zinc-400 shrink-0">Vecteurs d'attaque :</span>
        {dynamicThreats.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedThreat(sample);
              setPayload(sample.payload);
              setRuleResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
              selectedThreat.type === sample.type
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-zinc-900/60 text-zinc-400 border-white/5 hover:border-white/20'
            }`}
          >
            {sample.type}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Attack Payload */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShieldWarning size={16} className="text-amber-400" />
                <span className="text-xs font-bold text-white font-mono">Payload Malveillant Détecté</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded">
                Cible : {selectedThreat.target}
              </span>
            </div>

            <p className="text-xs text-zinc-400">{selectedThreat.desc}</p>

            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={12}
              className="w-full p-3.5 rounded-xl bg-[#070709] border border-amber-500/30 font-mono text-xs text-amber-200/90 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 leading-relaxed resize-none"
            />
          </div>

          <button
            onClick={handleGenerateRule}
            disabled={isGenerating || !payload.trim()}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <ArrowsClockwise size={16} className="animate-spin text-zinc-950" />
                <span>Génération des règles Groq en cours...</span>
              </>
            ) : (
              <>
                <Sparkle size={16} weight="fill" />
                <span>Générer Règle WAF & Signature Suricata</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Rules Generated */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0f0f13] border border-white/[0.08] shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} weight="fill" className="text-emerald-400" />
                <span className="text-xs font-bold text-white font-mono">
                  Règles de Protection Générées
                </span>
                {ruleResult?.inferenceTimeMs && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {ruleResult.inferenceTimeMs}ms
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-lg border border-white/5 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('waf')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activeTab === 'waf' ? 'bg-zinc-800 text-amber-300 font-bold' : 'text-zinc-400'
                  }`}
                >
                  Règle WAF
                </button>
                <button
                  onClick={() => setActiveTab('suricata')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activeTab === 'suricata' ? 'bg-zinc-800 text-amber-300 font-bold' : 'text-zinc-400'
                  }`}
                >
                  Suricata IDS
                </button>
                <button
                  onClick={() => setActiveTab('recom')}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activeTab === 'recom' ? 'bg-zinc-800 text-amber-300 font-bold' : 'text-zinc-400'
                  }`}
                >
                  Atténuation
                </button>
              </div>
            </div>

            {!ruleResult ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-500 font-mono text-xs">
                <LockKey size={32} className="text-zinc-600 animate-pulse" />
                <p>Cliquez sur "Générer Règle WAF" pour produire les signatures défensives.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 font-mono text-xs">
                  <span className="text-zinc-300">Niveau de Sévérité Estimé :</span>
                  <span className="text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
                    {ruleResult.severityScore}
                  </span>
                </div>

                {activeTab === 'waf' && (
                  <pre className="p-4 rounded-xl bg-[#070709] border border-amber-500/30 text-xs font-mono text-amber-200/90 whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto">
                    {ruleResult.wafRule}
                  </pre>
                )}

                {activeTab === 'suricata' && (
                  <pre className="p-4 rounded-xl bg-[#070709] border border-cyan-500/30 text-xs font-mono text-cyan-200/90 whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto">
                    {ruleResult.suricataRule}
                  </pre>
                )}

                {activeTab === 'recom' && (
                  <div className="p-4 rounded-xl bg-[#070709] border border-emerald-500/30 text-xs font-sans text-zinc-200 leading-relaxed space-y-2">
                    <p className="font-semibold text-emerald-400">Plan de Remédiation SOC :</p>
                    <p>{ruleResult.recommendation}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {ruleResult && (
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <button
                onClick={handleCopyRule}
                className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-mono text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copié !' : 'Copier la règle'}</span>
              </button>
              <span className="text-[11px] font-mono text-zinc-500">Injectable sur Traefik / Cloudflare</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
