import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  WarningCircle,
  Timer,
  CheckCircle,
  Sparkle,
  TerminalWindow,
  Copy,
  Check,
  PaperPlaneRight,
  User,
  ShieldCheck,
  Lightning,
  Clock,
  GitCommit,
  ArrowsClockwise,
  Play,
  FileCode,
  ShareNetwork,
} from '@phosphor-icons/react';
import { groqAI } from '../../services/groqClient';
import { api } from '../../services/api';

interface TicketDetailViewProps {
  ticketId?: string;
  onBackToList: () => void;
  onNavigateToDashboard: () => void;
}

interface MessageItem {
  id: string;
  author: string;
  role: string;
  avatarColor: string;
  timestamp: string;
  content: string;
  isAi?: boolean;
}

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({
  ticketId = '#892',
  onBackToList,
  onNavigateToDashboard,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(3); // 1 = Signalé, 2 = Diagnostiqué, 3 = Mitigation, 4 = Résolu
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '$ kubectl get pods -n prod -l app=saturn-redis',
    'saturn-redis-master-0   1/1     Running   0          42d',
    'saturn-redis-node-1     1/1     Running   2 (14m)    12d',
    'saturn-redis-node-2     1/1     Running   1 (14m)    12d',
    '$ kubectl exec -it saturn-redis-master-0 -n prod -- redis-cli info clients',
    'connected_clients: 200 (MAX POOL LIMIT HIT)',
    'blocked_clients: 482 (QUEUED REQUESTS STALLED)',
  ]);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'm1',
      author: 'Sentinel Sentry Webhook',
      role: 'Alerte Automatique',
      avatarColor: 'bg-rose-500/20 text-rose-300',
      timestamp: '14:10:02',
      content:
        'Alerte P1 déclenchée : Erreur Redis Connection Pool Exhausted sur cart-service. 482 requêtes en timeout 5000ms.',
    },
    {
      id: 'm2',
      author: 'Groq Llama-3.3-70B RCA',
      role: 'IA Root Cause Engine',
      avatarColor: 'bg-teal-500/20 text-teal-300',
      timestamp: '14:10:44',
      isAi: true,
      content:
        'Diagnostic automatique terminé en 42ms : Fuite de handles TCP non fermés dans CartService.reserveItems() introduite par le commit fc78b19. Recommandation : Rollback vers cart-service:v2.4.0 ou augmentation immédiate de max_connections à 800.',
    },
    {
      id: 'm3',
      author: 'Alexandre D.',
      role: 'SRE Lead On-Call',
      avatarColor: 'bg-emerald-500/20 text-emerald-300',
      timestamp: '14:14:20',
      content:
        'Bien reçu. Je valide le diagnostic Groq. Le code de PR #419 oubliait le block finally { connection.release() }. Je prépare le patch kubectl pour débloquer les utilisateurs.',
    },
    {
      id: 'm4',
      author: 'Yann T.',
      role: 'SecOps Lead',
      avatarColor: 'bg-amber-500/20 text-amber-300',
      timestamp: '14:16:05',
      content:
        'Vérification sécurité effectuée : pas d’exploitation malveillante ni de déni de service externe. Il s’agit bien d’un bug applicatif interne.',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [slaSeconds, setSlaSeconds] = useState(850); // ~14 min countdown

  // Fetch live ticket messages from backend database
  useEffect(() => {
    api.incidents.getMessages(ticketId).then((dbMsgs) => {
      if (Array.isArray(dbMsgs) && dbMsgs.length > 0) {
        setMessages(dbMsgs);
      }
    }).catch(() => {});
  }, [ticketId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlaSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleApplyFix = () => {
    setIsApplyingFix(true);
    setTerminalOutput((prev) => [
      ...prev,
      '$ kubectl set env deployment/cart-service REDIS_POOL_MAX=800 -n prod',
      'deployment.apps/cart-service env updated',
      '$ kubectl rollout restart deployment/cart-service -n prod',
      'deployment.apps/cart-service restarted',
      'Waiting for rollout to finish: 1 of 8 updated pods ready...',
      'Rollout finished: 8 of 8 updated pods ready in 14.2s',
      'connected_clients: 248 / 800 (LATENCY RESTORED TO 14ms)',
    ]);

    setTimeout(() => {
      setIsApplyingFix(false);
      setCurrentStep(4); // Advance to resolved
      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          author: 'Copilote Sentinel',
          role: 'IA Assistante',
          avatarColor: 'bg-teal-500/20 text-teal-300',
          timestamp: new Date().toLocaleTimeString('fr-FR'),
          isAi: true,
          content:
            'Le patch a été déployé avec succès. Les 8 pods du cart-service sont sains. Le pool Redis est stabilisé à 248 connexions. Latence rétablie à 14ms. Incident résolu avec 12 min d’avance sur le SLA.',
        },
      ]);
    }, 1400);
  };

  const [isCopilotTyping, setIsCopilotTyping] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const newMsg: MessageItem = {
      id: `user-${Date.now()}`,
      author: 'Vous (Ingénieur de garde)',
      role: 'DevOps / SRE',
      avatarColor: 'bg-blue-500/20 text-blue-300',
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      content: userText,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setIsCopilotTyping(true);

    try {
      const history = messages.slice(-5).map((m) => ({
        role: m.isAi ? 'assistant' : 'user',
        content: `${m.author} (${m.role}): ${m.content}`,
      }));
      history.push({ role: 'user', content: userText });

      // Save to backend and trigger Copilot
      const apiRes = await api.incidents.sendMessage(ticketId, {
        author: 'Vous (Ingénieur de garde)',
        role: 'DevOps / SRE',
        avatarColor: 'bg-blue-500/20 text-blue-300',
        content: userText,
      });

      if (apiRes.copilotMessage) {
        setMessages((prev) => [...prev, apiRes.copilotMessage]);
      } else {
        const copilotRes = await groqAI.chatCopilot(history, {
          ticketId,
          service: 'saturn-redis',
          cluster: 'k8s-prod-eu1',
          status: currentStep === 4 ? 'resolved' : 'investigating',
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            author: `Copilote Groq (${copilotRes.modelUsed})`,
            role: 'IA Assistante SRE',
            avatarColor: 'bg-teal-500/20 text-teal-300',
            timestamp: new Date().toLocaleTimeString('fr-FR'),
            isAi: true,
            content: copilotRes.reply,
          },
        ]);
      }
    } catch (err) {
      console.error('Copilot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          author: 'Copilote Groq',
          role: 'IA Assistante SRE',
          avatarColor: 'bg-teal-500/20 text-teal-300',
          timestamp: new Date().toLocaleTimeString('fr-FR'),
          isAi: true,
          content: 'Le correctif kubectl a permis de libérer le pool. Aucun nouvel incident détecté sur les pods Redis.',
        },
      ]);
    } finally {
      setIsCopilotTyping(false);
    }
  };

  const lifecycleStages = [
    { num: 1, label: '1. Déclaré', time: '14:10 UTC' },
    { num: 2, label: '2. Diagnostic Groq', time: '14:10:42 UTC' },
    { num: 3, label: '3. Mitigation active', time: '14:14 UTC' },
    { num: 4, label: '4. Résolu & Post-Mortem', time: currentStep === 4 ? '14:26 UTC' : 'En attente' },
  ];

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Back and Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <button
            onClick={onBackToList}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Retour à l'annuaire des incidents</span>
          </button>
          
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-lg font-bold text-white">
              {ticketId}
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
              P1 - CRITIQUE
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-zinc-800 text-zinc-300 border border-white/5">
              saturn-redis · k8s-prod-eu1
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-teal-300 bg-teal-950/40 border border-teal-500/30 px-2 py-0.5 rounded">
              <Sparkle size={12} weight="fill" className="text-teal-400" />
              <span>RCA Groq 42ms</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans mt-1">
            Dépassement du pool de connexions Redis (Cluster Saturn EU-West)
          </h1>
        </div>

        {/* SLA Timer Gauge */}
        <div className="flex items-center gap-4 bg-[#0f0f13] border border-white/10 p-3.5 rounded-xl shrink-0">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Timer size={22} weight="fill" className="animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-zinc-400">Compte à rebours SLA (99.9%)</div>
            <div className="text-lg font-mono font-bold text-rose-300">
              {formatCountdown(slaSeconds)} restants
            </div>
          </div>
        </div>
      </div>

      {/* Incident Lifecycle Stepper */}
      <div className="p-4 rounded-xl bg-[#0f0f13] border border-white/[0.08]">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-3">
          <span>PROGRESSION DU CYCLE DE VIE</span>
          <span>Cliquez sur une étape pour changer l'état</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {lifecycleStages.map((st) => {
            const isPassed = currentStep >= st.num;
            const isCurrent = currentStep === st.num;
            return (
              <button
                key={st.num}
                onClick={() => setCurrentStep(st.num)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-300 shadow-sm'
                    : isPassed
                    ? 'bg-zinc-900 border-emerald-500/20 text-zinc-300'
                    : 'bg-zinc-900/40 border-white/5 text-zinc-500'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs font-bold">
                  <span>{st.label}</span>
                  {isPassed && <CheckCircle size={14} className="text-emerald-400" />}
                </div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1">
                  {st.time}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 Main Columns: Groq RCA + Interactive Terminal vs Collaborative Discussion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols): Groq RCA & Copilot Command Console */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Automated Groq RCA Analysis Card */}
          <div className="p-5 rounded-xl bg-[#0f0f13] border border-teal-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                  <Sparkle size={14} weight="fill" />
                </div>
                <span className="font-mono text-xs font-bold text-teal-300">
                  ROOT CAUSE ANALYSIS (RCA) · GROQ LPU
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                <span>Inférence : <strong className="text-teal-300">42ms</strong></span>
                <span>·</span>
                <span>Confiance : <strong className="text-emerald-400">98.4%</strong></span>
              </div>
            </div>

            <div className="space-y-2 font-sans text-xs">
              <div className="text-zinc-200 font-semibold text-sm">
                Diagnostic de la cause racine :
              </div>
              <p className="text-zinc-300 leading-relaxed">
                Fuite de connexions non libérées dans la boucle de réservation d'articles de commande. Les sockets du pool ioredis atteignent la limite maximale de 200 handles, provoquant la mise en file d'attente puis l'expiration des requêtes HTTP amont.
              </p>
            </div>

            {/* Culprit commit info */}
            <div className="p-3 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <GitCommit size={16} className="text-rose-400" />
                <span className="text-zinc-400">Commit incriminé :</span>
                <span className="text-zinc-200 font-bold">fc78b19</span>
                <span className="text-zinc-500 hidden sm:inline">(PR #419 - Cart checkout rewrite)</span>
              </div>
              <span className="text-[11px] text-zinc-500">Déployé à 14:08 UTC</span>
            </div>

            {/* Highlighted Stack Trace snippet */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                <span>Stack trace d'exception interceptée :</span>
                <span className="text-zinc-500">connectionPool.ts:142</span>
              </div>
              <div className="p-3 rounded-lg bg-[#050507] border border-white/10 font-mono text-[11px] overflow-x-auto text-zinc-300 space-y-1">
                <div className="text-zinc-500">// src/services/cart/connectionPool.ts:140-145</div>
                <div>140: const client = await this.redisPool.acquire();</div>
                <div>141: const result = await client.multi().exec();</div>
                <div className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded font-bold">
                  142: // BUG: Missing client.release() in error catch branch!
                </div>
                <div>143: return result;</div>
              </div>
            </div>
          </div>

          {/* Copilot Actionable Remediation Console */}
          <div className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <TerminalWindow size={18} className="text-emerald-400" />
                <span className="font-mono text-xs font-bold text-zinc-200">
                  CONSOLE DE MITIGATION & COMMANDE KUBECTL
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Cluster : k8s-prod-eu1
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Le Copilote IA a formulé la commande de mitigation temporaire pour augmenter le pool de connexions à 800 et redémarrer la flotte sans coupure.
            </p>

            {/* Terminal Window */}
            <div className="rounded-lg bg-[#050507] border border-white/10 p-4 font-mono text-xs space-y-2 overflow-x-auto">
              <div className="flex items-center justify-between text-zinc-500 pb-2 border-b border-white/5 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  <span className="ml-2 text-zinc-400">bash — terminal SRE</span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'kubectl set env deployment/cart-service REDIS_POOL_MAX=800 -n prod && kubectl rollout restart deployment/cart-service -n prod',
                      'cmd1'
                    )
                  }
                  className="hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedCmd === 'cmd1' ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-emerald-400">Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copier la commande</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1 text-zinc-300 text-[11px] leading-relaxed max-h-52 overflow-y-auto">
                {terminalOutput.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.startsWith('$')
                        ? 'text-emerald-400 font-bold'
                        : line.includes('LIMIT HIT') || line.includes('STALLED')
                        ? 'text-rose-400 font-medium'
                        : line.includes('RESTORED') || line.includes('finished')
                        ? 'text-emerald-300 font-semibold'
                        : 'text-zinc-400'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-[11px] font-mono text-zinc-500">
                Validation RBAC SRE accordée
              </span>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleApplyFix}
                disabled={isApplyingFix || currentStep === 4}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-bold hover:bg-emerald-400 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2 shadow-sm font-sans"
              >
                {isApplyingFix ? (
                  <>
                    <ArrowsClockwise size={14} className="animate-spin" />
                    <span>Déploiement du patch en cours...</span>
                  </>
                ) : currentStep === 4 ? (
                  <>
                    <CheckCircle size={14} weight="bold" />
                    <span>Correctif appliqué · Incident résolu</span>
                  </>
                ) : (
                  <>
                    <Play size={14} weight="fill" />
                    <span>Appliquer le correctif dans le cluster</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): War Room Live Collaborative Stream */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] flex flex-col h-[650px] shadow-xl">
            
            {/* War room stream header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs font-bold text-zinc-200">
                  WAR ROOM · FIL DE DISCUSSION
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                4 intervenants connectés
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-lg border text-xs font-sans space-y-1.5 ${
                    m.isAi
                      ? 'bg-teal-950/20 border-teal-500/20'
                      : 'bg-zinc-900/60 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${m.avatarColor}`}>
                        {m.role}
                      </span>
                      <span className="text-zinc-300 font-semibold">{m.author}</span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">{m.timestamp}</span>
                  </div>

                  <p className="text-zinc-300 text-xs leading-relaxed">
                    {m.content}
                  </p>
                </div>
              ))}
              {isCopilotTyping && (
                <div className="p-2.5 rounded-lg bg-teal-950/20 border border-teal-500/30 text-xs text-teal-300 flex items-center gap-2 font-mono">
                  <ArrowsClockwise size={14} className="animate-spin text-teal-400" />
                  <span>Copilote Groq réfléchit en direct (~42ms)...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/[0.06] space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Tapez un message ou '@copilot' pour interroger l'IA..."
                  className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/60 transition-all font-sans"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <PaperPlaneRight size={15} weight="bold" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
                <span>Astuce : mentionnez <strong className="text-teal-400">@copilot</strong> pour solliciter l'IA</span>
                <span>Chiffré TLS</span>
              </div>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
