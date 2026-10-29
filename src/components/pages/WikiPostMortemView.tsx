import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  MagnifyingGlass,
  Sparkle,
  DownloadSimple,
  ShareNetwork,
  CheckCircle,
  Clock,
  WarningCircle,
  Tag,
  ArrowsClockwise,
  ArrowUpRight,
  GitCommit,
  ShieldCheck,
  Cpu,
  FileText,
  ListChecks,
} from '@phosphor-icons/react';
import { ScrollReveal } from '../ScrollReveal';
import { groqAI } from '../../services/groqClient';
import { api } from '../../services/api';

export interface PostMortem {
  id: string;
  ticketRef: string;
  title: string;
  service: string;
  date: string;
  durationMinutes: number;
  category: string;
  authorAi: string;
  summary: string;
  timeline: { time: string; event: string; type: 'alert' | 'rca' | 'action' | 'resolve' }[];
  fiveWhys: string[];
  actionItems: { id: string; text: string; done: boolean; owner: string }[];
}

const POST_MORTEMS_DATA: PostMortem[] = [
  {
    id: 'PM-892',
    ticketRef: '#892',
    title: 'Saturation du pool de connexions Redis (Cluster Saturn EU-West)',
    service: 'saturn-redis',
    date: '06 Octobre 2026',
    durationMinutes: 16,
    category: 'Fuite Mémoire & Handles',
    authorAi: 'Groq Llama-3.3-70B LPU (Généré en 3.1s)',
    summary:
      'Une fuite de socket handles dans le driver de réservation de panier a provoqué la saturation des 200 connexions maximales du cluster Redis, entraînant des timeouts 5000ms sur 482 requêtes amont.',
    timeline: [
      { time: '14:10:02', event: 'Sonde Prometheus déclenche une alerte P1 sur dépassement du pool (>95%)', type: 'alert' },
      { time: '14:10:44', event: 'Analyse Groq RCA identifie le commit fc78b19 et la ligne connectionPool.ts:142', type: 'rca' },
      { time: '14:15:30', event: 'War Room mobilisée : décision d’augmenter REDIS_POOL_MAX à 800 via kubectl', type: 'action' },
      { time: '14:26:12', event: 'Rollout K8s terminé, rétablissement de la latence nominale (14ms) sans perte de données', type: 'resolve' },
    ],
    fiveWhys: [
      'Pourquoi le service panier renvoyait des erreurs 504 ? Parce que les requêtes vers Redis dépassaient le timeout de 5000ms.',
      'Pourquoi Redis ne répondait plus ? Parce que toutes les 200 connexions du pool étaient occupées et bloquées.',
      'Pourquoi les connexions étaient-elles bloquées ? Parce que CartService.reserveItems n’appelait pas client.release() en cas d’exception.',
      'Pourquoi ce bloc finally manquait-il ? Parce que le refactoring du commit fc78b19 a omis le wrapping de sécurité.',
      'Pourquoi les tests CI n’ont pas intercepté l’anomalie ? Parce que les tests unitaires mockaient le client Redis sans tester le cycle de vie des sockets.',
    ],
    actionItems: [
      { id: 'a1', text: 'Ajouter une règle ESLint stricte exigeant un try/finally sur toute acquisition de client Redis', done: true, owner: '@devops-core' },
      { id: 'a2', text: 'Abaisser le seuil d’alerte de saturation du pool Prometheus de 90% à 75%', done: true, owner: '@sre-observability' },
      { id: 'a3', text: 'Intégrer un test d’endurance de 10 000 requêtes en CI pour détecter les fuites de handles', done: false, owner: '@qa-automation' },
    ],
  },
  {
    id: 'PM-889',
    ticketRef: '#889',
    title: 'Échec de rotation automatique des certificats Vault OAuth2',
    service: 'vault-oauth2',
    date: '04 Octobre 2026',
    durationMinutes: 22,
    category: 'Sécurité & Certificats',
    authorAi: 'Groq Llama-3.3-70B LPU (Généré en 2.8s)',
    summary:
      'Blocage du webhook ACME de Let’s Encrypt suite à un durcissement des règles de pare-feu WAF, empêchant le renouvellement du certificat wildcard avant expiration.',
    timeline: [
      { time: '12:00:15', event: 'Cert-manager signale un code HTTP 403 Forbidden sur le challenge ACME', type: 'alert' },
      { time: '12:00:48', event: 'Groq RCA identifie une règle Cloudflare WAF mise à jour à minuit', type: 'rca' },
      { time: '12:12:00', event: 'Whitelist temporaire de l’IP source ACME déployée', type: 'action' },
      { time: '12:22:10', event: 'Certificat renouvelé et déployé sur les 4 clusters', type: 'resolve' },
    ],
    fiveWhys: [
      'Pourquoi les requêtes OAuth2 ont échoué ? Le certificat TLS était expiré.',
      'Pourquoi le certificat n’a pas été renouvelé ? Le challenge HTTP-01 a reçu une réponse 403.',
      'Pourquoi l’accès était-il interdit ? La nouvelle règle WAF bloquait les agents non identifiés.',
    ],
    actionItems: [
      { id: 'b1', text: 'Migrer le challenge ACME vers DNS-01 via API Cloudflare tokenisé', done: true, owner: '@secops-team' },
      { id: 'b2', text: 'Ajouter une sonde d’expiration à J-30 dans Grafana', done: true, owner: '@sre-observability' },
    ],
  },
  {
    id: 'PM-880',
    ticketRef: '#880',
    title: 'Erreur 500 sur le checkout web lors du décodage Apple Pay',
    service: 'checkout-api',
    date: '02 Octobre 2026',
    durationMinutes: 18,
    category: 'Régression Code API',
    authorAi: 'Groq Llama-3.3-70B LPU (Généré en 3.4s)',
    summary:
      'Désérialisation JSON stricte levant une exception non gérée sur les champs optionnels des tokens cryptographiques PKPaymentToken sur iOS 18.1.',
    timeline: [
      { time: '18:30:10', event: 'Hausse du taux d’erreur 500 sur /v1/checkout/applepay (>8%)', type: 'alert' },
      { time: '18:31:02', event: 'Groq RCA localise l’incompatibilité de schéma Zod', type: 'rca' },
      { time: '18:42:00', event: 'Hotfix déployé avec schéma assoupli pour les tokens récents', type: 'resolve' },
    ],
    fiveWhys: [
      'Pourquoi le paiement échouait ? Le parseur de schéma levait une validation error.',
      'Pourquoi le payload était inattendu ? iOS 18.1 a ajouté un attribut metadata non répertorié.',
    ],
    actionItems: [
      { id: 'c1', text: 'Passer les validateurs Zod de passerelle de paiement en mode passthrough pour les métadonnées', done: true, owner: '@api-core' },
    ],
  },
];

interface WikiPostMortemViewProps {
  onNavigateToTicket: (ticketId: string) => void;
}

export const WikiPostMortemView: React.FC<WikiPostMortemViewProps> = ({
  onNavigateToTicket,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPmId, setSelectedPmId] = useState<string>('PM-892');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [items, setItems] = useState(POST_MORTEMS_DATA);
  const [isGeneratingPm, setIsGeneratingPm] = useState(false);

  // Sync post-mortems with backend database
  React.useEffect(() => {
    api.postMortems.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setItems(data);
      }
    }).catch(() => {});
  }, []);

  const handleGenerateNewPm = async () => {
    setIsGeneratingPm(true);
    try {
      const pmCount = items.length + 1;
      const refNum = 900 + pmCount;
      const newPmId = `PM-${refNum}`;

      const res = await groqAI.generatePostMortem({
        id: `#${refNum}`,
        title: 'Saturation de la file d’attente des messages RabbitMQ',
        service: 'rabbitmq-cluster',
        durationMinutes: 18,
        summary: 'Blocage des consommateurs asynchrones suite à un pic de commandes.',
        actionsTaken: 'Scaling horizontal des workers et rééquilibrage des partitions.',
      });

      const newPostMortem: PostMortem = {
        id: newPmId,
        ticketRef: `#${refNum}`,
        title: 'Saturation de la file RabbitMQ (Cluster Production)',
        service: 'rabbitmq-cluster',
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
        durationMinutes: 18,
        category: 'Files de Messages & Event-Driven',
        authorAi: `Groq LPU ${res.modelUsed} (${res.inferenceTimeMs}ms)`,
        summary: res.postMortem.summary,
        timeline: res.postMortem.timeline || [
          { time: '15:00', event: 'Détection queue overflow > 25,000 msg', type: 'alert' },
          { time: '15:05', event: 'Analyse Groq RCA identifiée', type: 'rca' },
          { time: '15:12', event: 'Autoscaling des consommateurs déclenché', type: 'action' },
          { time: '15:18', event: 'File vidée et latence nominale rétablie', type: 'resolve' },
        ],
        fiveWhys: res.postMortem.fiveWhys,
        actionItems: (res.postMortem.actionItems || []).map((ai, idx) => ({
          id: `act-${Date.now()}-${idx}`,
          text: ai.text,
          owner: ai.owner || '@devops-team',
          done: false,
        })),
      };

      setItems((prev) => [newPostMortem, ...prev]);
      setSelectedPmId(newPmId);

      // Save to backend database
      api.postMortems.create(newPostMortem).catch(() => {});
    } catch (err) {
      console.error('Error generating post-mortem:', err);
    } finally {
      setIsGeneratingPm(false);
    }
  };

  const activePm = items.find((pm) => pm.id === selectedPmId) || items[0];

  const filteredPms = items.filter((pm) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const match =
        pm.id.toLowerCase().includes(q) ||
        pm.ticketRef.toLowerCase().includes(q) ||
        pm.title.toLowerCase().includes(q) ||
        pm.service.toLowerCase().includes(q) ||
        pm.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (categoryFilter !== 'all' && pm.category !== categoryFilter) return false;
    return true;
  });

  const toggleActionItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((pm) => {
        if (pm.id === activePm.id) {
          return {
            ...pm,
            actionItems: pm.actionItems.map((ai) =>
              ai.id === itemId ? { ...ai, done: !ai.done } : ai
            ),
          };
        }
        return pm;
      })
    );
    api.postMortems.toggleAction(activePm.id, itemId).catch(() => {});
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="font-mono text-xs text-zinc-400 tracking-wider uppercase font-semibold">
              Base de Connaissances · Mémoire Résiliente
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Rapports Post-Mortem & Wiki IA
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Archives des retours d'expérience générés automatiquement par l'IA Groq dès la clôture des tickets, avec chronologie minute par minute et plans d'action préventifs.
          </p>
        </div>

        {/* Stats Row & AI Action */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <button
            onClick={handleGenerateNewPm}
            disabled={isGeneratingPm}
            className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isGeneratingPm ? (
              <>
                <ArrowsClockwise size={15} className="animate-spin text-zinc-950" />
                <span>Rédaction Groq en cours...</span>
              </>
            ) : (
              <>
                <Sparkle size={15} weight="fill" />
                <span>Rédiger un Post-Mortem avec Groq IA</span>
              </>
            )}
          </button>
          <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-center">
            <div className="text-emerald-400 font-bold text-base">{items.length}</div>
            <div className="text-[10px] text-zinc-500">Rapports IA</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-center">
            <div className="text-teal-400 font-bold text-base">94%</div>
            <div className="text-[10px] text-zinc-500">Non-récurrence</div>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0f0f13] border border-white/[0.08]">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les rapports (ex: Redis, SSL, Apple Pay, #892)..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-teal-500/50 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
          {['all', 'Fuite Mémoire & Handles', 'Sécurité & Certificats', 'Régression Code API'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-zinc-800 text-teal-300 font-semibold border border-teal-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat === 'all' ? 'Toutes catégories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Explorer: Left list + Right full document view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Document List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono text-zinc-400 px-1">
            {filteredPms.length} rapport(s) archivé(s)
          </div>

          <div className="space-y-2.5">
            {filteredPms.map((pm) => {
              const isSelected = pm.id === activePm.id;
              return (
                <div
                  key={pm.id}
                  onClick={() => setSelectedPmId(pm.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-teal-950/20 border-teal-500/50 shadow-md shadow-black/40'
                      : 'bg-[#0f0f13] border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-zinc-200">{pm.id}</span>
                    <span className="text-[11px] text-teal-400 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-500/20">
                      {pm.ticketRef}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-zinc-100 line-clamp-2">
                    {pm.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1 border-t border-white/[0.04]">
                    <span>{pm.service}</span>
                    <span>{pm.durationMinutes}m résolution</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Full Interactive Post-Mortem Report (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-xl bg-[#0f0f13] border border-white/[0.08] space-y-6 shadow-xl">
            
            {/* Report Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-xs text-teal-400">
                  <FileText size={15} />
                  <span>RAPPORT POST-MORTEM OFFICIEL · {activePm.id}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-sans">
                  {activePm.title}
                </h2>
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 flex-wrap">
                  <span>Date : {activePm.date}</span>
                  <span>·</span>
                  <span>Service : {activePm.service}</span>
                  <span>·</span>
                  <span className="text-emerald-400">{activePm.durationMinutes} min d'interruption</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onNavigateToTicket(activePm.ticketRef)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-emerald-500/40 text-xs font-mono text-zinc-200 hover:text-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Voir ticket {activePm.ticketRef}</span>
                  <ArrowUpRight size={12} />
                </button>

                <button
                  onClick={() => {
                    alert(`Export Markdown du rapport ${activePm.id} téléchargé.`);
                  }}
                  className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Exporter Markdown"
                >
                  <DownloadSimple size={15} />
                </button>
              </div>
            </div>

            {/* AI Generator Stamp */}
            <div className="p-3 rounded-lg bg-teal-950/20 border border-teal-500/20 flex items-center justify-between text-xs font-mono text-teal-300">
              <div className="flex items-center gap-2">
                <Sparkle size={15} weight="fill" className="text-teal-400" />
                <span>Généré automatiquement par {activePm.authorAi}</span>
              </div>
              <span className="text-[11px] text-zinc-400">Indexé dans la base vectorielle</span>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                1. Résumé Exécutif & Impact
              </h4>
              <p className="text-sm text-zinc-300 leading-relaxed font-sans bg-zinc-900/40 p-4 rounded-lg border border-white/5">
                {activePm.summary}
              </p>
            </div>

            {/* Chronology minute by minute */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                2. Déroulement Chronologique (Minute par Minute)
              </h4>
              <div className="space-y-2.5 font-mono text-xs pl-2 border-l border-white/10">
                {activePm.timeline.map((evt, idx) => (
                  <div key={idx} className="relative pl-5 space-y-0.5">
                    <span
                      className={`absolute -left-[9px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#0f0f13] ${
                        evt.type === 'alert'
                          ? 'bg-rose-400'
                          : evt.type === 'rca'
                          ? 'bg-teal-400'
                          : evt.type === 'action'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-200">{evt.time}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded uppercase ${
                          evt.type === 'alert'
                            ? 'text-rose-400 bg-rose-950/40'
                            : evt.type === 'rca'
                            ? 'text-teal-300 bg-teal-950/40'
                            : evt.type === 'action'
                            ? 'text-amber-300 bg-amber-950/40'
                            : 'text-emerald-300 bg-emerald-950/40'
                        }`}
                      >
                        {evt.type}
                      </span>
                    </div>
                    <p className="text-zinc-300 font-sans text-xs">{evt.event}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Whys Analysis */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                3. Analyse Causale (Méthode des 5 Pourquoi)
              </h4>
              <div className="space-y-2 text-xs font-sans">
                {activePm.fiveWhys.map((why, i) => (
                  <div key={i} className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 text-zinc-300 leading-relaxed flex items-start gap-2.5">
                    <span className="font-mono text-teal-400 font-bold shrink-0">{i + 1}.</span>
                    <span>{why}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items List */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                  <ListChecks size={15} className="text-emerald-400" />
                  <span>4. Plan d'Action & Mesures Préventives</span>
                </h4>
                <span className="text-[11px] font-mono text-zinc-500">
                  Cochez pour mettre à jour l'avancement
                </span>
              </div>

              <div className="space-y-2">
                {activePm.actionItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleActionItem(item.id)}
                    className="p-3 rounded-lg bg-zinc-900 border border-white/5 hover:border-white/10 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => {}}
                        className="rounded border-white/20 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <span className={`font-sans ${item.done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                        {item.text}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-400 shrink-0">
                      {item.owner}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
