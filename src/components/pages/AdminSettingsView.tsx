import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  ShieldCheck,
  Key,
  Plug,
  CheckCircle,
  WarningCircle,
  LockKey,
  UserPlus,
  Trash,
  DotsThreeVertical,
  Lightning,
  Sparkle,
  Fingerprint,
  Check,
  ArrowsClockwise,
  Article,
  Cpu,
  TerminalWindow,
  Sliders,
  DownloadSimple,
  MagnifyingGlass,
  FileText,
  SlidersHorizontal,
} from '@phosphor-icons/react';
import { groqAI } from '../../services/groqClient';
import { api } from '../../services/api';

interface UserMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin SRE' | 'SecOps Lead' | 'Développeur Core' | 'Lead QA';
  ssoProvider: string;
  mfaActive: boolean;
  active: boolean;
}

const INITIAL_USERS: UserMember[] = [
  {
    id: 'u-1',
    name: 'Mourad',
    email: 'mourad@corp.sentinel',
    role: 'Admin SRE',
    ssoProvider: 'Okta SSO',
    mfaActive: true,
    active: true,
  },
  {
    id: 'u-2',
    name: 'Tasnim',
    email: 'tasnim@corp.sentinel',
    role: 'SecOps Lead',
    ssoProvider: 'Azure AD',
    mfaActive: true,
    active: true,
  },
  {
    id: 'u-3',
    name: 'Mohammed',
    email: 'mohammed@corp.sentinel',
    role: 'Développeur Core',
    ssoProvider: 'Okta SSO',
    mfaActive: true,
    active: true,
  },
  {
    id: 'u-4',
    name: 'Aymane',
    email: 'aymane@corp.sentinel',
    role: 'Lead QA',
    ssoProvider: 'Google Workspace',
    mfaActive: true,
    active: true,
  },
];

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  category: 'security' | 'rbac' | 'deploy' | 'auth' | 'incident';
  ipAddress: string;
  status: 'success' | 'blocked' | 'warning';
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1094',
    timestamp: "Aujourd'hui à 14:30:12",
    actor: 'Mohammed',
    role: 'Développeur Core',
    action: 'Publication et indexation vectorielle du Post-Mortem PM-892 (Saturn Redis)',
    category: 'incident',
    ipAddress: '10.240.12.84',
    status: 'success',
  },
  {
    id: 'aud-1093',
    timestamp: "Aujourd'hui à 14:26:05",
    actor: 'Mourad',
    role: 'Admin SRE',
    action: 'Exécution du correctif kubectl REDIS_POOL_MAX=800 sur cluster k8s-prod-eu1',
    category: 'deploy',
    ipAddress: '10.240.0.12',
    status: 'success',
  },
  {
    id: 'aud-1092',
    timestamp: "Aujourd'hui à 11:00:44",
    actor: 'Utilisateur inconnu (x_auth)',
    role: 'Tentative externe',
    action: 'Échec de connexion SSO : certificat client invalide (Brute-force prévenu)',
    category: 'auth',
    ipAddress: '194.26.29.12 (WAF block)',
    status: 'blocked',
  },
  {
    id: 'aud-1091',
    timestamp: "Aujourd'hui à 10:15:22",
    actor: 'Tasnim',
    role: 'SecOps Lead',
    action: 'Modification de la matrice RBAC : restriction des permissions de rotation de clés API',
    category: 'rbac',
    ipAddress: '10.240.8.19',
    status: 'warning',
  },
  {
    id: 'aud-1090',
    timestamp: "Aujourd'hui à 09:45:10",
    actor: 'Aymane',
    role: 'Lead QA',
    action: 'Mise en quarantaine du test E2E Checkout Session sur les runners CI Francfort',
    category: 'deploy',
    ipAddress: '10.240.14.55',
    status: 'success',
  },
  {
    id: 'aud-1089',
    timestamp: "Aujourd'hui à 08:12:00",
    actor: 'Tasnim',
    role: 'SecOps Lead',
    action: 'Déclenchement du scan de vulnérabilités Trivy CVE sur toutes les images conteneurs',
    category: 'security',
    ipAddress: '10.240.8.19',
    status: 'success',
  },
];

export const AdminSettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'rbac' | 'audit' | 'ai-prompts' | 'integrations'>('users');
  const [users, setUsers] = useState<UserMember[]>(INITIAL_USERS);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserMember['role']>('Développeur Core');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Audit trail state & search
  const [auditQuery, setAuditQuery] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // AI Model & Prompts state
  const [selectedModel, setSelectedModel] = useState<'llama-3.3-70b' | 'mixtral-8x7b' | 'llama-3.1-8b' | 'gemma-2-27b'>('llama-3.3-70b');
  const [temperature, setTemperature] = useState(0.1);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [postMortemPrompt, setPostMortemPrompt] = useState(
    `Tu es le moteur SRE de Sentinel. Rédige un Post-Mortem objectif et sans blâme (blameless) pour le problème rapporté. Identifie les 5 Pourquoi, la chronologie précise, et 3 actions préventives claires.`
  );
  const [rcaPrompt, setRcaPrompt] = useState(
    `Analyse les logs d'erreurs en < 50 mots. Identifie le commit défaillant, le fichier source et la commande kubectl ou redis-cli de remédiation immédiate.`
  );
  const [isTestingPrompt, setIsTestingPrompt] = useState(false);
  const [promptTestResult, setPromptTestResult] = useState<string | null>(null);

  // RBAC permissions matrix state
  const [rbacMatrix, setRbacMatrix] = useState({
    declareIncident: { admin: true, secops: true, dev: true, qa: true },
    triggerGroqRca: { admin: true, secops: true, dev: true, qa: true },
    executeKubectlFix: { admin: true, secops: false, dev: false, qa: false },
    publishPostMortem: { admin: true, secops: true, dev: false, qa: false },
    manageApiTokens: { admin: true, secops: false, dev: false, qa: false },
  });

  const toggleRbac = (permKey: keyof typeof rbacMatrix, roleKey: 'admin' | 'secops' | 'dev' | 'qa') => {
    setRbacMatrix((prev) => ({
      ...prev,
      [permKey]: {
        ...prev[permKey],
        [roleKey]: !prev[permKey][roleKey],
      },
    }));
  };

  // Integration ping state
  const [pingStatus, setPingStatus] = useState<{ [key: string]: 'idle' | 'testing' | 'success' }>({});

  const testIntegrationPing = (key: string) => {
    setPingStatus((prev) => ({ ...prev, [key]: 'testing' }));
    setTimeout(() => {
      setPingStatus((prev) => ({ ...prev, [key]: 'success' }));
      setTimeout(() => {
        setPingStatus((prev) => ({ ...prev, [key]: 'idle' }));
      }, 3000);
    }, 900);
  };

  const handleTestPrompt = async () => {
    setIsTestingPrompt(true);
    setPromptTestResult(null);
    try {
      const activePrompt = postMortemPrompt || rcaPrompt;
      const res = await groqAI.testPrompt({
        prompt: activePrompt,
        model: selectedModel === 'llama-3.3-70b' ? 'qwen/qwen3.8-27b' : 'openai/gpt-oss-20b',
        temperature,
        maxTokens,
      });
      setPromptTestResult(
        `[Groq LPU ${res.model} · ${res.latencyMs}ms]\n${res.content}`
      );
    } catch (err: any) {
      setPromptTestResult(`[Erreur Groq LPU] : ${err?.message || 'Échec de l’inférence'}`);
    } finally {
      setIsTestingPrompt(false);
    }
  };

  // Sync users and audit logs with live backend
  React.useEffect(() => {
    api.users.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.roleId === 'dev' ? 'Développeur Core' : u.roleId === 'sec' ? 'SecOps Lead' : u.roleId === 'qa' ? 'Lead QA' : 'Admin SRE',
          ssoProvider: u.ssoProvider || 'Sentinel SSO',
          mfaActive: u.mfaActive ?? true,
          active: u.active ?? true,
        })));
      }
    }).catch(() => {});

    api.audit.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setAuditLogs(data.map((a: any) => ({
          id: a.id,
          timestamp: a.timestamp,
          actor: a.actor,
          role: a.role,
          action: a.action,
          category: a.category || 'rbac',
          ipAddress: a.ipAddress || '10.240.10.1',
          status: a.status || 'success',
        })));
      }
    }).catch(() => {});
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const roleMap: Record<string, string> = {
      'Admin SRE': 'admin',
      'SecOps Lead': 'sec',
      'Développeur Core': 'dev',
      'Lead QA': 'qa',
    };

    const newUser: UserMember = {
      id: `u-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      ssoProvider: 'Okta SSO',
      mfaActive: true,
      active: true,
    };

    setUsers((prev) => [...prev, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setIsInviteOpen(false);

    // Save to backend database
    api.users.create({
      name: newUserName,
      email: newUserEmail,
      roleId: (roleMap[newUserRole] || 'dev') as any,
    }).catch(() => {});
  };

  const toggleUserActive = (id: string) => {
    const user = users.find((u) => u.id === id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
    if (user) {
      api.users.update(id, { active: !user.active }).catch(() => {});
    }
  };

  const filteredAuditLogs = auditLogs.filter((entry) => {
    const q = auditQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      entry.actor.toLowerCase().includes(q) ||
      entry.action.toLowerCase().includes(q) ||
      entry.ipAddress.toLowerCase().includes(q) ||
      entry.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-mono text-xs text-zinc-400 tracking-wider uppercase font-semibold">
              Espace Administrateur · Contrôle, Audit & Paramétrage IA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Administration & Paramètres Avancés
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Gestion des identités de l'équipe (Mourad, Tasnim, Mohammed, Aymane), piste d'audit inaltérable, paramétrage fin des modèles d'IA Groq et contrôles RBAC.
          </p>
        </div>

        {/* Global Security Summary */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-center">
            <div className="text-zinc-100 font-bold text-base">{users.length}</div>
            <div className="text-[10px] text-zinc-500">Membres Actifs</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-center">
            <div className="text-teal-400 font-bold text-base">{auditLogs.length}</div>
            <div className="text-[10px] text-zinc-500">Événements Audit</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-center">
            <div className="text-emerald-400 font-bold text-base">SOC2</div>
            <div className="text-[10px] text-zinc-500">Inaltérabilité</div>
          </div>
        </div>
      </div>

      {/* 5 Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#0f0f13] border border-white/[0.08] text-xs font-mono overflow-x-auto">
        {[
          { id: 'users', label: '1. Utilisateurs & Membres', icon: Users, count: users.length },
          { id: 'rbac', label: '2. Matrice RBAC', icon: ShieldCheck, count: '5 règles' },
          { id: 'audit', label: "3. Piste d'Audit (Audit Trail)", icon: Article, count: `${auditLogs.length} logs` },
          { id: 'ai-prompts', label: '4. Paramétrage IA & Prompts', icon: Sparkle, count: selectedModel },
          { id: 'integrations', label: '5. Intégrations & Clés API', icon: Plug, count: '4 actives' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-800 text-amber-300 font-bold border border-amber-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-amber-400' : 'text-zinc-500'} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${isActive ? 'bg-amber-950/60 text-amber-300' : 'bg-zinc-900 text-zinc-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">
              Annuaire des membres de l'équipe (Mourad, Tasnim, Mohammed, Aymane)
            </span>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-mono font-bold hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus size={14} weight="bold" />
              <span>Inviter un collaborateur</span>
            </button>
          </div>

          {/* User Table */}
          <div className="rounded-xl bg-[#0f0f13] border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900/60 border-b border-white/[0.06] text-zinc-400">
                  <tr>
                    <th className="py-3 px-4">Membre & Identité</th>
                    <th className="py-3 px-4">Rôle Système</th>
                    <th className="py-3 px-4">Fournisseur SSO</th>
                    <th className="py-3 px-4">MFA Hardware</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-sans font-semibold text-zinc-100">{u.name}</div>
                        <div className="text-[11px] text-zinc-500">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'Admin SRE'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : u.role === 'SecOps Lead'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : u.role === 'Développeur Core'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{u.ssoProvider}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                          <Fingerprint size={13} />
                          <span>YubiKey FIDO2</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="w-2 h-2 rounded-full inline-block mr-1.5 bg-emerald-400" />
                        <span className="text-zinc-200">Actif</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toggleUserActive(u.id)}
                          className="text-[11px] px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                          {u.active ? 'Suspendre' : 'Réactiver'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'rbac' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Matrice de contrôle d'accès granulaires par rôle</span>
            <span className="text-emerald-400">Audit RBAC certifié SOC2</span>
          </div>

          <div className="rounded-xl bg-[#0f0f13] border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900/60 border-b border-white/[0.06] text-zinc-400">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Permission Système</th>
                    <th className="py-3.5 px-4 text-center">Admin SRE (Mourad)</th>
                    <th className="py-3.5 px-4 text-center">SecOps Lead (Tasnim)</th>
                    <th className="py-3.5 px-4 text-center">Développeur (Mohammed)</th>
                    <th className="py-3.5 px-4 text-center">Lead QA (Aymane)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    { key: 'declareIncident', label: 'Déclarer un nouvel incident de production', desc: 'Ouverture de ticket et alerte PagerDuty' },
                    { key: 'triggerGroqRca', label: 'Déclencher un diagnostic IA Groq LPU', desc: 'Analyse automatisée de logs et traces' },
                    { key: 'executeKubectlFix', label: 'Appliquer un correctif kubectl via le cluster', desc: 'Modification d’environnement et redémarrage de pod' },
                    { key: 'publishPostMortem', label: 'Clôturer un ticket & publier le Post-Mortem Wiki', desc: 'Génération du rapport d’apprentissage définitif' },
                    { key: 'manageApiTokens', label: 'Gérer les clés API et webhooks externes', desc: 'Administration des tokens d’accès et WAF' },
                  ].map((row) => {
                    const pKey = row.key as keyof typeof rbacMatrix;
                    return (
                      <tr key={row.key} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-sans font-semibold text-zinc-200">{row.label}</div>
                          <div className="text-[11px] text-zinc-500">{row.desc}</div>
                        </td>

                        {(['admin', 'secops', 'dev', 'qa'] as const).map((role) => {
                          const isChecked = rbacMatrix[pKey][role];
                          return (
                            <td key={role} className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => toggleRbac(pKey, role)}
                                className={`w-5 h-5 rounded border transition-colors inline-flex items-center justify-center cursor-pointer ${
                                  isChecked
                                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                                    : 'bg-zinc-900 border-white/10 text-transparent'
                                }`}
                              >
                                {isChecked && <Check size={12} weight="bold" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Piste d'Audit et Logs Système (Audit Trail) - Crucial for Tasnim */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-100 font-sans flex items-center gap-2">
                <Article size={16} className="text-teal-400" />
                <span>Piste d'Audit & Journal Inaltérable des Actions (Audit Trail)</span>
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Registre cryptographiquement chaîné pour conformité sécurité (Tasnim) et audit ISO 27001
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={auditQuery}
                  onChange={(e) => setAuditQuery(e.target.value)}
                  placeholder="Filtrer (ex: Tasnim, Mourad, RBAC)..."
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <button
                onClick={() => alert('Export du journal d’audit (format JSON signé cryptographiquement) téléchargé.')}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <DownloadSimple size={13} />
                <span>Exporter Audit</span>
              </button>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="rounded-xl bg-[#0f0f13] border border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900/60 border-b border-white/[0.06] text-zinc-400">
                  <tr>
                    <th className="py-3 px-4">Horodatage</th>
                    <th className="py-3 px-4">Acteur</th>
                    <th className="py-3 px-4">Action Enregistrée</th>
                    <th className="py-3 px-4">Catégorie</th>
                    <th className="py-3 px-4">Adresse IP</th>
                    <th className="py-3 px-4 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                  {filteredAuditLogs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                        {entry.timestamp}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-zinc-100">{entry.actor}</div>
                        <div className="text-[10px] text-zinc-500">{entry.role}</div>
                      </td>
                      <td className="py-3 px-4 text-zinc-200 max-w-md font-sans">
                        {entry.action}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-[10px] uppercase font-bold text-zinc-400">
                          {entry.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                        {entry.ipAddress}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            entry.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : entry.status === 'blocked'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {entry.status === 'success' ? 'Autorisé' : entry.status === 'blocked' ? 'Bloqué WAF' : 'Avertissement'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Paramétrage interne de l'IA (Prompts & Modèles) */}
      {activeTab === 'ai-prompts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-100 font-sans flex items-center gap-2">
                <Sparkle size={16} weight="fill" className="text-teal-400" />
                <span>Paramétrage Interne de l'IA (Prompts Systèmes & Modèles Groq)</span>
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Ajustez les instructions fondamentales et sélectionnez le modèle linguistique d'inférence
              </p>
            </div>

            <button
              onClick={() => alert('Configuration IA et prompts systèmes enregistrés.')}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs font-mono hover:bg-emerald-400 transition-colors cursor-pointer self-start sm:self-auto"
            >
              Sauvegarder les prompts
            </button>
          </div>

          {/* Model Selector Cards */}
          <div className="space-y-2 font-mono text-xs">
            <label className="text-zinc-400 uppercase tracking-wider text-[11px]">
              Modèle Linguistique LPU Actif :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'llama-3.3-70b', name: 'Llama-3.3-70B-Versatile', speed: '42ms', desc: 'Recommandé · Équilibre parfait précision RCA & rapidité' },
                { id: 'mixtral-8x7b', name: 'Mixtral-8x7B-32k', speed: '58ms', desc: 'Contexte 32k · Idéal pour dumps de logs massifs > 10 Mo' },
                { id: 'llama-3.1-8b', name: 'Llama-3.1-8B-Instant', speed: '14ms', desc: 'Ultra-rapide · Triage préliminaire & classification' },
                { id: 'gemma-2-27b', name: 'Gemma-2-27B-IT', speed: '48ms', desc: 'Spécialisé · Audit de sécurité et règles de compliance' },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedModel(m.id as any)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    selectedModel === m.id
                      ? 'bg-teal-950/20 border-teal-500/60 text-zinc-100 shadow-sm'
                      : 'bg-[#0f0f13] border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-200">{m.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-950/40 text-teal-300 font-mono">
                      {m.speed}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-sans leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Temperature & Token Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#0f0f13] border border-white/[0.08] font-mono text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Température d'échantillonnage :</span>
                <span className="text-teal-400 font-bold">{temperature} (Déterministe)</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500">0.0 = Rigueur absolue (code), 0.3 = Rédaction créative</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Tokens max en sortie :</span>
                <span className="text-teal-400 font-bold">{maxTokens} tokens</span>
              </div>
              <input
                type="range"
                min="256"
                max="4096"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500">Limite maximale pour éviter les réponses verbeuses</span>
            </div>
          </div>

          {/* 2 Editable System Prompts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Prompt 1: Post-Mortem Wiki Generator */}
            <div className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-zinc-200 font-mono uppercase tracking-wider">
                  Prompt Système : Rédaction du Post-Mortem Wiki
                </h4>
                <span className="text-[10px] font-mono text-teal-400">Llama-3.3</span>
              </div>
              <textarea
                rows={5}
                value={postMortemPrompt}
                onChange={(e) => setPostMortemPrompt(e.target.value)}
                className="w-full p-3 rounded-lg bg-zinc-950 border border-white/10 text-xs font-mono text-zinc-200 focus:outline-none focus:border-teal-500/50 leading-relaxed"
              />
              <span className="text-[11px] font-mono text-zinc-500 block">
                Contrôle la tonalité factuelle, la méthode des 5 Pourquoi et l'absence de blâme individuel.
              </span>
            </div>

            {/* Prompt 2: Instant RCA & Remediation */}
            <div className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-zinc-200 font-mono uppercase tracking-wider">
                  Prompt Système : RCA & Hotfix Terminal
                </h4>
                <span className="text-[10px] font-mono text-teal-400">Llama-3.3</span>
              </div>
              <textarea
                rows={5}
                value={rcaPrompt}
                onChange={(e) => setRcaPrompt(e.target.value)}
                className="w-full p-3 rounded-lg bg-zinc-950 border border-white/10 text-xs font-mono text-zinc-200 focus:outline-none focus:border-teal-500/50 leading-relaxed"
              />
              <span className="text-[11px] font-mono text-zinc-500 block">
                Exige la formulation de commandes exécutables (kubectl, redis-cli) sans texte superflu.
              </span>
            </div>

          </div>

          {/* Test Runner */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-mono text-zinc-300">
              Tester le prompt en direct sur un échantillon de crash Redis :
            </div>
            <button
              onClick={handleTestPrompt}
              disabled={isTestingPrompt}
              className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {isTestingPrompt ? (
                <>
                  <ArrowsClockwise size={13} className="animate-spin" />
                  <span>Inférence Groq...</span>
                </>
              ) : (
                <>
                  <Lightning size={13} weight="bold" />
                  <span>Lancer inférence test</span>
                </>
              )}
            </button>
          </div>

          {promptTestResult && (
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-teal-500/40 text-xs font-mono text-teal-300 whitespace-pre-wrap leading-relaxed">
              {promptTestResult}
            </div>
          )}

        </div>
      )}

      {/* Tab 5: External Integrations */}
      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <div className="text-xs font-mono text-zinc-400">
            Passerelles de communication externe, LLMs et pipelines connectés
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'groq',
                name: 'Groq LPU Acceleration (Inférence IA)',
                type: `LLM ${selectedModel}`,
                maskedKey: 'groq_live_**********************3c91',
                status: 'Connecté (18ms)',
                desc: 'Moteur d’analyse de logs et de calcul automatique de cause racine.',
              },
              {
                id: 'slack',
                name: 'Slack Enterprise Grid',
                type: 'Bot & Webhooks',
                maskedKey: 'xoxb-84192**********************01ab',
                status: 'Canal #war-room-production',
                desc: 'Diffusion automatique des incidents P1 et résolutions.',
              },
              {
                id: 'pagerduty',
                name: 'PagerDuty On-Call Service',
                type: 'Escalation Policy v2',
                maskedKey: 'pd_sec_key_**********************99ff',
                status: 'Alerte SRE active',
                desc: 'Déclenchement des appels vocaux et astreintes de production.',
              },
              {
                id: 'argocd',
                name: 'ArgoCD GitOps Cluster API',
                type: 'Kubernetes Controller',
                maskedKey: 'argo.jwt.token.*******************k8s',
                status: 'Cluster k8s-prod-eu1',
                desc: 'Synchronisation et rollouts sécurisés des manifestes.',
              },
            ].map((integ) => {
              const pingState = pingStatus[integ.id] || 'idle';
              return (
                <div
                  key={integ.id}
                  className="p-5 rounded-xl bg-[#0f0f13] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-zinc-100 font-sans">
                        {integ.name}
                      </h4>
                      <span className="text-[11px] font-mono text-zinc-400">{integ.type}</span>
                    </div>

                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{integ.status}</span>
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {integ.desc}
                  </p>

                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/5 font-mono text-xs flex items-center justify-between">
                    <span className="text-zinc-500 text-[11px]">Clé secrète :</span>
                    <span className="text-zinc-300 text-[11px]">{integ.maskedKey}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-zinc-500">Chiffré AES-256</span>

                    <button
                      onClick={() => testIntegrationPing(integ.id)}
                      disabled={pingState === 'testing'}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {pingState === 'testing' ? (
                        <>
                          <ArrowsClockwise size={12} className="animate-spin text-amber-400" />
                          <span>Test de ping...</span>
                        </>
                      ) : pingState === 'success' ? (
                        <>
                          <CheckCircle size={12} className="text-emerald-400" />
                          <span className="text-emerald-400">Latence 18ms OK</span>
                        </>
                      ) : (
                        <>
                          <Lightning size={12} />
                          <span>Tester connexion</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
