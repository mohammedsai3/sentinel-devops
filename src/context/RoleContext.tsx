import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  RoleId,
  AppView,
  PermissionKey,
  PermissionDefinition,
  RoleDefinition,
  UserMember,
  IncidentItem,
  AuditLog,
  ProjectFile,
  SharedProject,
} from '../types/role';
import { database } from '../db/database';
import { api } from '../services/api';

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Opérations
  {
    key: 'view_dashboard',
    label: 'Tableau de bord général',
    category: 'Opérations',
    description: 'Accès aux métriques temps réel MTTR, alertes SLA et santé des services.',
  },
  {
    key: 'view_incidents',
    label: 'Consultation des incidents',
    category: 'Opérations',
    description: 'Lecture de l’annuaire global des pannes et historiques.',
  },
  {
    key: 'create_incidents',
    label: 'Déclaration d’incidents',
    category: 'Opérations',
    description: 'Création et qualification de nouvelles pannes avec pièces jointes.',
  },
  {
    key: 'manage_tickets',
    label: 'Pilotage War Room & Tickets',
    category: 'Opérations',
    description: 'Changement de statut, mitigation, commentaires et clôture.',
  },
  {
    key: 'view_code_hotfix',
    label: 'Hotfixes & Groq RCA Code',
    category: 'Opérations',
    description: 'Accès aux diffs Git, génération de correctifs et traces applicatives.',
  },

  // Sécurité & Vault
  {
    key: 'view_security_cve',
    label: 'Supervision CVE & Scans Trivy',
    category: 'Sécurité & Vault',
    description: 'Surveillance des failles critiques et vulnérabilités de conteneurs.',
  },
  {
    key: 'manage_vault_secrets',
    label: 'Gestion des secrets Vault & SSL',
    category: 'Sécurité & Vault',
    description: 'Rotation des certificats TLS, révocation de jetons et clés OAuth2.',
  },

  // Tests & QA
  {
    key: 'run_e2e_tests',
    label: 'Exécution suites Playwright/Cypress',
    category: 'Tests & QA',
    description: 'Déclenchement des tests E2E et validation des pipelines.',
  },
  {
    key: 'declare_qa_bug',
    label: 'Déclaration d’anomalies QA',
    category: 'Tests & QA',
    description: 'Signalement de régressions lors des phases de staging.',
  },
  {
    key: 'chaos_injection',
    label: 'Simulateur d’injection de Chaos',
    category: 'Tests & QA',
    description: 'Simulation de coupures réseau, pannes de pods et latences.',
  },

  // Gouvernance & RBAC
  {
    key: 'manage_roles_rbac',
    label: 'Gestion de la matrice RBAC',
    category: 'Gouvernance & RBAC',
    description: 'Attribution et modification des permissions par rôle en temps réel.',
  },
  {
    key: 'manage_users',
    label: 'Administration des utilisateurs',
    category: 'Gouvernance & RBAC',
    description: 'Gestion des membres, rattachement de rôles et désactivation.',
  },
  {
    key: 'view_audit_trail',
    label: 'Journal d’audit immuable',
    category: 'Gouvernance & RBAC',
    description: 'Consultation intégrale de l’audit trail et traçabilité des actions.',
  },
  {
    key: 'view_executive_reports',
    label: 'Rapports Comex & Conformité',
    category: 'Gouvernance & RBAC',
    description: 'Accès aux analyses rétrospectives et rapports exécutifs.',
  },
  {
    key: 'access_cluster_topology',
    label: 'Topologie Cluster 3D',
    category: 'Gouvernance & RBAC',
    description: 'Visualisation WebGL avancée des nœuds K8s et flux réseau.',
  },
];

export const ROLE_ALLOWED_VIEWS: Record<RoleId, AppView[]> = {
  dev: [
    'role-dev',
    'dev-refactor',
    'dev-pipeline',
    'import-project',
    'dashboard',
    'incidents',
    'ticket-detail',
    'create-incident',
    'wiki',
    'profile',
  ],
  sec: [
    'role-sec',
    'sec-threats',
    'sec-compliance',
    'import-project',
    'supervision',
    'incidents',
    'ticket-detail',
    'wiki',
    'admin',
    'profile',
  ],
  qa: [
    'role-qa',
    'qa-generator',
    'qa-bench',
    'import-project',
    'supervision',
    'incidents',
    'ticket-detail',
    'create-incident',
    'reporting',
    'wiki',
    'profile',
  ],
  admin: [
    'role-admin',
    'admin-topology',
    'admin-brief',
    'role-management',
    'import-project',
    'dev-refactor',
    'dev-pipeline',
    'sec-threats',
    'sec-compliance',
    'qa-generator',
    'qa-bench',
    'dashboard',
    'incidents',
    'ticket-detail',
    'create-incident',
    'wiki',
    'supervision',
    'admin',
    'reporting',
    'profile',
  ],
};

const INITIAL_ROLES: Record<RoleId, RoleDefinition> = {
  dev: {
    id: 'dev',
    name: 'Développeur Core',
    title: 'Lead Développeur',
    defaultUserName: 'Mohammed',
    defaultEmail: 'mohammed@corp.sentinel',
    tag: 'DEV CORE',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderColor: 'border-emerald-500/50',
    accentColor: '#10b981',
    description: 'Spécialiste de la résolution de code, stack traces, hotfixes Groq RCA et pipelines CI/CD.',
    mission: 'Localiser l’origine logicielle des anomalies, formuler un correctif et déployer le hotfix.',
    permissions: [
      'view_dashboard',
      'view_incidents',
      'create_incidents',
      'manage_tickets',
      'view_code_hotfix',
      'run_e2e_tests',
    ],
    dedicatedRoute: 'role-dev',
  },
  sec: {
    id: 'sec',
    name: 'Sécurité & SecOps',
    title: 'Lead Sécurité',
    defaultUserName: 'Tasnim',
    defaultEmail: 'tasnim@corp.sentinel',
    tag: 'SECOPS',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-500/50',
    accentColor: '#f59e0b',
    description: 'Responsable de la posture de défense, surveillance CVE Trivy/Snyk, secrets Vault et WAF.',
    mission: 'Identifier les failles exploitables, sécuriser les tokens et mitiger les attaques en cours.',
    permissions: [
      'view_dashboard',
      'view_incidents',
      'create_incidents',
      'view_security_cve',
      'manage_vault_secrets',
      'view_audit_trail',
    ],
    dedicatedRoute: 'role-sec',
  },
  qa: {
    id: 'qa',
    name: 'Testeur & QA Lead',
    title: 'Lead Testeur QA',
    defaultUserName: 'Aymane',
    defaultEmail: 'aymane@corp.sentinel',
    tag: 'QA LEAD',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    borderColor: 'border-cyan-500/50',
    accentColor: '#06b6d4',
    description: 'Garant de la non-régression, suites E2E Playwright, tests de charge K6 et chaos engineering.',
    mission: 'Valider la stabilité applicative avant et après mise en production, éprouver la résilience.',
    permissions: [
      'view_dashboard',
      'view_incidents',
      'create_incidents',
      'declare_qa_bug',
      'run_e2e_tests',
      'chaos_injection',
      'view_executive_reports',
    ],
    dedicatedRoute: 'role-qa',
  },
  admin: {
    id: 'admin',
    name: 'Admin SRE & Infra',
    title: 'Admin SRE & Infra',
    defaultUserName: 'Mourad',
    defaultEmail: 'mourad@corp.sentinel',
    tag: 'SRE ADMIN',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    borderColor: 'border-rose-500/50',
    accentColor: '#f43f5e',
    description: 'Gouvernance globale, cluster K8s, matrice RBAC, gestion des utilisateurs et audit trail.',
    mission: 'Superviser l’ensemble des infrastructures, orchestrer les habilitations et assurer la haute disponibilité.',
    permissions: [
      'view_dashboard',
      'view_incidents',
      'create_incidents',
      'manage_tickets',
      'view_code_hotfix',
      'view_security_cve',
      'manage_vault_secrets',
      'run_e2e_tests',
      'declare_qa_bug',
      'chaos_injection',
      'manage_roles_rbac',
      'manage_users',
      'view_audit_trail',
      'view_executive_reports',
      'access_cluster_topology',
    ],
    dedicatedRoute: 'role-admin',
  },
};

const INITIAL_INCIDENTS: IncidentItem[] = [
  {
    id: '#892',
    title: 'Dépassement du pool de connexions Redis (Cluster Saturn EU-West)',
    service: 'saturn-redis',
    cluster: 'k8s-prod-eu1',
    priority: 'P1',
    status: 'investigating',
    team: 'Core Backend',
    assignee: 'Mohammed (Lead Dev)',
    slaMinutesRemaining: 14,
    reportedAt: '14:10 UTC',
    rcaReady: true,
    rcaSummary: 'Fuite de sockets non libérés dans CartService.reserveItems suite au commit 419b.',
    description: 'Saturation critique de 200 handles de connexion. Blocage des paniers d’achat utilisateurs.',
    category: 'Base de données',
  },
  {
    id: '#891',
    title: 'Latence anormale sur Ingress Gateway API (timeouts 504 aléatoires)',
    service: 'traefik-gw',
    cluster: 'k8s-prod-eu1',
    priority: 'P1',
    status: 'investigating',
    team: 'Infrastructure',
    assignee: 'Mourad (Admin SRE)',
    slaMinutesRemaining: 38,
    reportedAt: '13:50 UTC',
    rcaReady: true,
    rcaSummary: 'Saturation des buffers eBPF suite à un pic de requêtes non throttlées.',
    description: 'Timeouts de requêtes amont sur le checkout /v1/session.',
    category: 'Réseau & API',
  },
  {
    id: '#889',
    title: 'Échec de rotation automatique des certificats Vault OAuth2',
    service: 'vault-oauth2',
    cluster: 'security-core',
    priority: 'P2',
    status: 'open',
    team: 'SecOps',
    assignee: 'Tasnim (Lead Sécurité)',
    slaMinutesRemaining: 135,
    reportedAt: '12:00 UTC',
    rcaReady: true,
    rcaSummary: 'Expiration du token ACME Let’s Encrypt et blocage du webhook de renewal.',
    description: 'Alerte de renouvellement TLS : le certificat expire dans moins de 24 heures.',
    category: 'Sécurité & Vault',
  },
  {
    id: '#884',
    title: 'Régression de tests E2E sur le flux de paiement Stripe 3DS',
    service: 'billing-engine',
    cluster: 'k8s-stage-eu1',
    priority: 'P3',
    status: 'mitigated',
    team: 'Qualité logicielle',
    assignee: 'Aymane (Lead QA)',
    slaMinutesRemaining: 240,
    reportedAt: '09:30 UTC',
    rcaReady: true,
    rcaSummary: 'Mise à jour SDK Stripe non synchronisée avec les stubs Playwright.',
    description: 'Échec de 3 assertions sur le scénario de challenge 3DS biométrique.',
    category: 'Tests & QA',
  },
  {
    id: '#880',
    title: 'Saturation de mémoire sur les Workers d’envoi d’e-mails Kafka',
    service: 'notification-worker',
    cluster: 'k8s-prod-eu2',
    priority: 'P3',
    status: 'resolved',
    team: 'Core Backend',
    assignee: 'Mohammed (Lead Dev)',
    slaMinutesRemaining: 0,
    reportedAt: 'Hier 18:22 UTC',
    rcaReady: true,
    rcaSummary: 'Buffer backpressure saturé lors de la campagne de relance.',
    description: 'Résolu après mise à l’échelle automatique de 4 à 12 répliques.',
    category: 'Asynchrone & Files',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1095',
    timestamp: 'Il y a 3 min',
    actor: 'Mourad',
    role: 'Admin SRE',
    action: 'Initialisation de la session de contrôle RBAC & vérification des certificats',
    category: 'rbac',
    ipAddress: '10.240.10.1',
    status: 'success',
  },
  {
    id: 'aud-1094',
    timestamp: 'Il y a 18 min',
    actor: 'Mohammed',
    role: 'Développeur Core',
    action: 'Génération du patch Groq RCA pour l’incident #892 (Saturn Redis)',
    category: 'incident',
    ipAddress: '10.240.12.84',
    status: 'success',
  },
  {
    id: 'aud-1093',
    timestamp: 'Il y a 45 min',
    actor: 'Tasnim',
    role: 'SecOps Lead',
    action: 'Scan de vulnérabilités Trivy déclenché sur l’image docker:26.1.4-dind',
    category: 'security',
    ipAddress: '10.240.8.12',
    status: 'warning',
  },
  {
    id: 'aud-1092',
    timestamp: 'Il y a 1h 10m',
    actor: 'Aymane',
    role: 'Lead QA',
    action: 'Exécution complète de la suite Playwright E2E sur l’environnement de Staging',
    category: 'deploy',
    ipAddress: '10.240.14.99',
    status: 'success',
  },
];

const INITIAL_PROJECT: SharedProject = {
  name: 'express-commerce',
  type: 'Node.js, Express, Redis & PostgreSQL Microservices',
  repoUrl: 'https://github.com/expressjs/express',
  files: [
    {
      name: 'src/services/CartService.ts',
      content: `export class CartService {
  private redisPool: any;
  async reserveItems(userId: string, items: any[]) {
    const client = await this.redisPool.acquire();
    // Mauvaise pratique : aucun try/finally pour libérer le client en cas d'erreur
    const lock = await client.set("lock:" + userId, "1", "EX", 10);
    if (!lock) throw new Error("Timeout acquisition lock Redis");
    const result = await this.processReservation(client, items);
    await this.redisPool.release(client); // Risque de fuite de sockets
    return result;
  }
}`
    },
    {
      name: 'Dockerfile',
      content: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]`
    },
    {
      name: 'package.json',
      content: `{
  "name": "express-commerce-api",
  "version": "2.4.0",
  "dependencies": {
    "express": "^4.18.2",
    "redis": "^4.6.7",
    "stripe": "^12.0.0",
    "jsonwebtoken": "^9.0.0",
    "zod": "^3.22.4"
  }
}`
    },
    {
      name: 'src/routes/checkout.ts',
      content: `import express from 'express';
export const checkoutRouter = express.Router();

// Endpoint sensible de paiement sans rate-limiting
checkoutRouter.post('/v1/charge', async (req, res) => {
  const { amount, token } = req.body;
  const charge = await chargeCard(amount, token);
  res.json({ success: true, charge });
});`
    }
  ],
  updatedAt: new Date().toISOString()
};

interface ToastState {
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface RoleContextValue {
  currentRole: RoleId | null;
  currentUser: UserMember | null;
  roles: Record<RoleId, RoleDefinition>;
  users: UserMember[];
  incidents: IncidentItem[];
  auditLogs: AuditLog[];
  allPermissions: PermissionDefinition[];
  toast: ToastState | null;
  project: SharedProject;
  updateProject: (data: Partial<SharedProject>) => void;
  setProjectFiles: (files: ProjectFile[]) => void;
  updateProjectFileContent: (fileName: string, content: string) => void;
  activeProjectFile: ProjectFile | null;
  setActiveProjectFile: (file: ProjectFile | null) => void;
  login: (email: string, password: string) => { success: boolean; user?: UserMember; error?: string };
  register: (data: {
    name: string;
    email: string;
    password: string;
    roleId: RoleId;
    department?: string;
  }) => { success: boolean; user?: UserMember; error?: string };
  logout: () => void;
  selectRole: (role: RoleId | null) => void;
  hasPermission: (perm: PermissionKey) => boolean;
  isViewAllowed: (view: AppView) => boolean;
  getAllowedViews: () => AppView[];
  toggleRolePermission: (roleId: RoleId, perm: PermissionKey) => void;
  assignUserRole: (userId: string, newRoleId: RoleId) => void;
  addUser: (user: Omit<UserMember, 'id'>) => void;
  toggleUserStatus: (userId: string) => void;
  deleteUser: (userId: string) => void;
  createIncident: (incident: Partial<IncidentItem>) => string;
  updateIncidentStatus: (id: string, status: IncidentItem['status']) => void;
  addAuditLog: (action: string, category: AuditLog['category'], status?: AuditLog['status']) => void;
  triggerToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  dismissToast: () => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users from persistent database
  const [users, setUsers] = useState<UserMember[]>(() => {
    return database.getUsers();
  });

  // Current session user from database
  const [currentUser, setCurrentUser] = useState<UserMember | null>(() => {
    return database.getSession();
  });

  // Current active role session (null = Public)
  const [currentRole, setCurrentRole] = useState<RoleId | null>(() => {
    const session = database.getSession();
    if (session && session.roleId) return session.roleId;
    try {
      const saved = localStorage.getItem('sentinel_active_role');
      if (saved && ['dev', 'sec', 'qa', 'admin'].includes(saved)) {
        return saved as RoleId;
      }
    } catch (e) {}
    return null;
  });

  // Roles configuration & custom permissions
  const [roles, setRoles] = useState<Record<RoleId, RoleDefinition>>(() => {
    try {
      const saved = localStorage.getItem('sentinel_roles_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_ROLES;
  });

  // Incidents state
  const [incidents, setIncidents] = useState<IncidentItem[]>(() => {
    try {
      const saved = localStorage.getItem('sentinel_incidents_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_INCIDENTS;
  });

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('sentinel_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_AUDIT_LOGS;
  });

  // Toast feedback
  const [toast, setToast] = useState<ToastState | null>(null);

  // Shared Project state (imported codebase, github repo, uploaded files)
  const [project, setProject] = useState<SharedProject>(() => {
    try {
      const saved = localStorage.getItem('sentinel_shared_project');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_PROJECT;
  });

  const [activeProjectFile, setActiveProjectFile] = useState<ProjectFile | null>(() => {
    return project.files && project.files.length > 0 ? project.files[0] : null;
  });

  const updateProject = (data: Partial<SharedProject>) => {
    setProject((prev) => {
      const next: SharedProject = {
        ...prev,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem('sentinel_shared_project', JSON.stringify(next));
      } catch (e) {}
      if (data.files && data.files.length > 0) {
        setActiveProjectFile(data.files[0]);
      }
      return next;
    });
  };

  const setProjectFiles = (files: ProjectFile[]) => {
    updateProject({ files });
  };

  const updateProjectFileContent = (fileName: string, content: string) => {
    setProject((prev) => {
      const nextFiles = prev.files.map((f) => (f.name === fileName ? { ...f, content } : f));
      const next: SharedProject = { ...prev, files: nextFiles, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem('sentinel_shared_project', JSON.stringify(next));
      } catch (e) {}
      setActiveProjectFile((curr) => (curr?.name === fileName ? { ...curr, content } : curr));
      return next;
    });
  };

  // Sync with live backend database on load
  useEffect(() => {
    api.users.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) setUsers(data);
    }).catch(() => {});

    api.incidents.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) setIncidents(data);
    }).catch(() => {});

    api.roles.getAll().then((data) => {
      if (data && Object.keys(data).length > 0) setRoles(data);
    }).catch(() => {});

    api.audit.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) setAuditLogs(data);
    }).catch(() => {});
  }, []);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem('sentinel_roles_config', JSON.stringify(roles));
    } catch (e) {}
  }, [roles]);

  useEffect(() => {
    try {
      if (currentRole) {
        localStorage.setItem('sentinel_active_role', currentRole);
      } else {
        localStorage.removeItem('sentinel_active_role');
      }
    } catch (e) {}
  }, [currentRole]);

  useEffect(() => {
    try {
      localStorage.setItem('sentinel_incidents_list', JSON.stringify(incidents));
    } catch (e) {}
  }, [incidents]);

  useEffect(() => {
    try {
      localStorage.setItem('sentinel_audit_logs', JSON.stringify(auditLogs));
    } catch (e) {}
  }, [auditLogs]);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const dismissToast = () => setToast(null);

  const addAuditLog = (action: string, category: AuditLog['category'], status: AuditLog['status'] = 'success') => {
    const actorName = currentUser?.name || (currentRole ? roles[currentRole].defaultUserName : 'Visiteur');
    const roleName = currentRole ? roles[currentRole].name : 'Public';
    const newEntry: AuditLog = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      timestamp: 'À l’instant',
      actor: actorName,
      role: roleName,
      action,
      category,
      ipAddress: '10.240.10.42',
      status,
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 40)]);
    api.audit.create(newEntry).catch(() => {});
  };

  // Login handler with database validation
  const login = (email: string, password: string) => {
    const res = database.authenticate(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setCurrentRole(res.user.roleId);
      triggerToast(`Connexion réussie ! Bienvenue ${res.user.name} (${roles[res.user.roleId].name})`, 'success');
      addAuditLog(`Authentification réussie pour ${res.user.email} (Rôle ${res.user.roleId})`, 'auth', 'success');
    } else if (res.error) {
      triggerToast(res.error, 'warning');
    }
    return res;
  };

  // Register handler with database insertion
  const register = (data: {
    name: string;
    email: string;
    password: string;
    roleId: RoleId;
    department?: string;
  }) => {
    const res = database.register(data);
    if (res.success && res.user) {
      setUsers(database.getUsers());
      setCurrentUser(res.user);
      setCurrentRole(res.user.roleId);
      triggerToast(`Compte créé avec succès ! Bienvenue ${res.user.name} (${roles[res.user.roleId].name})`, 'success');
      addAuditLog(`Inscription d’un nouvel utilisateur : ${res.user.name} [${res.user.roleId}]`, 'auth', 'success');
    } else if (res.error) {
      triggerToast(res.error, 'warning');
    }
    return res;
  };

  // Logout handler
  const logout = () => {
    database.clearSession();
    const prevName = currentUser?.name || 'Utilisateur';
    setCurrentUser(null);
    setCurrentRole(null);
    triggerToast(`${prevName} a été déconnecté avec succès`, 'info');
    addAuditLog(`Déconnexion de ${prevName}`, 'auth', 'success');
  };

  const selectRole = (role: RoleId | null) => {
    setCurrentRole(role);
    if (role) {
      const r = roles[role];
      // Sync mock user matching this role if no currentUser
      const found = users.find((u) => u.roleId === role) || null;
      setCurrentUser(found);
      if (found) database.saveSession(found);
      triggerToast(`Bascule sur le profil de ${r.defaultUserName} (${r.name})`, 'info');
      addAuditLog(`Bascule sur le profil ${r.name}`, 'auth', 'success');
    } else {
      logout();
    }
  };

  // Strict check if view is allowed for the active role
  const isViewAllowed = (view: AppView): boolean => {
    if (!currentRole) {
      // Unauthenticated visitor: only landing and login are directly accessible
      return view === 'landing' || view === 'login';
    }
    const allowed = ROLE_ALLOWED_VIEWS[currentRole] || [];
    return allowed.includes(view);
  };

  const getAllowedViews = (): AppView[] => {
    if (!currentRole) return ['landing', 'login'];
    return ROLE_ALLOWED_VIEWS[currentRole] || [];
  };

  // Permission check for current active role
  const hasPermission = (perm: PermissionKey): boolean => {
    if (!currentRole) return false;
    return roles[currentRole]?.permissions.includes(perm) ?? false;
  };

  // Dynamic permission toggle in RBAC management
  const toggleRolePermission = (roleId: RoleId, perm: PermissionKey) => {
    setRoles((prev) => {
      const currentPerms = prev[roleId].permissions;
      const has = currentPerms.includes(perm);
      const updated = has ? currentPerms.filter((p) => p !== perm) : [...currentPerms, perm];
      return {
        ...prev,
        [roleId]: {
          ...prev[roleId],
          permissions: updated,
        },
      };
    });

    const roleName = roles[roleId].name;
    const permLabel = ALL_PERMISSIONS.find((p) => p.key === perm)?.label || perm;
    triggerToast(`Permission [${permLabel}] mise à jour pour ${roleName}`, 'success');
    addAuditLog(`Modification RBAC : [${permLabel}] sur le rôle ${roleName}`, 'rbac', 'success');
    api.roles.togglePermission(roleId, perm).catch(() => {});
  };

  const assignUserRole = (userId: string, newRoleId: RoleId) => {
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, roleId: newRoleId } : u));
    setUsers(updatedUsers);
    database.saveUsers(updatedUsers);

    if (currentUser?.id === userId) {
      const updatedCurr = { ...currentUser, roleId: newRoleId };
      setCurrentUser(updatedCurr);
      setCurrentRole(newRoleId);
      database.saveSession(updatedCurr);
    }

    const user = updatedUsers.find((u) => u.id === userId);
    triggerToast(`Rôle de ${user?.name || userId} changé en ${roles[newRoleId].name}`, 'success');
    addAuditLog(`Assignation de rôle : ${user?.name} réassigné à ${roles[newRoleId].name}`, 'rbac', 'success');
    api.users.update(userId, { roleId: newRoleId }).catch(() => {});
  };

  const addUser = (userData: Omit<UserMember, 'id'>) => {
    const newUser: UserMember = {
      ...userData,
      id: `u-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    setUsers(updated);
    database.saveUsers(updated);
    triggerToast(`Nouveau collaborateur ${newUser.name} enregistré`, 'success');
    addAuditLog(`Création d’utilisateur : ${newUser.name} (${roles[newUser.roleId].name})`, 'rbac', 'success');
    api.users.create(newUser).catch(() => {});
  };

  const toggleUserStatus = (userId: string) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, active: !u.active } : u));
    setUsers(updated);
    database.saveUsers(updated);
    const user = updated.find((u) => u.id === userId);
    triggerToast(`Statut de ${user?.name} mis à jour (${user?.active ? 'Actif' : 'Suspendu'})`, 'info');
    addAuditLog(`Compte de ${user?.name} ${user?.active ? 'activé' : 'suspendu'}`, 'rbac', 'warning');
    if (user) {
      api.users.update(userId, { active: user.active }).catch(() => {});
    }
  };

  const deleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    database.saveUsers(updated);
    if (currentUser?.id === userId) {
      logout();
    }
    triggerToast(`Utilisateur ${user?.name || userId} supprimé de la base`, 'warning');
    addAuditLog(`Suppression de compte : ${user?.name}`, 'rbac', 'warning');
    api.users.delete(userId).catch(() => {});
  };

  const createIncident = (data: Partial<IncidentItem>): string => {
    const newId = `#${Math.floor(100 + Math.random() * 899)}`;
    const newIncident: IncidentItem = {
      id: newId,
      title: data.title || 'Incident système non qualifié',
      service: data.service || 'service-core',
      cluster: data.cluster || 'k8s-prod-eu1',
      priority: data.priority || 'P2',
      status: 'open',
      team: data.team || (currentRole ? roles[currentRole].name : 'DevSecOps'),
      assignee: currentUser?.name || (currentRole ? `${roles[currentRole].defaultUserName} (${roles[currentRole].tag})` : 'Astreinte'),
      slaMinutesRemaining: data.priority === 'P1' ? 15 : 60,
      reportedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      rcaReady: true,
      rcaSummary: data.rcaSummary || `Diagnostic automatique Groq LPU pour ${data.title}`,
      description: data.description || 'Incident créé via la plateforme de signalement.',
      category: data.category || 'Opérations',
    };

    setIncidents((prev) => [newIncident, ...prev]);
    triggerToast(`Incident ${newId} créé et indexé par Groq LPU`, 'success');
    addAuditLog(`Création de l’incident ${newId} : "${newIncident.title}"`, 'incident', 'warning');
    api.incidents.create(newIncident).catch(() => {});
    return newId;
  };

  const updateIncidentStatus = (id: string, status: IncidentItem['status']) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status } : inc))
    );
    triggerToast(`Incident ${id} passé au statut ${status.toUpperCase()}`, 'info');
    addAuditLog(`Changement de statut pour l’incident ${id} -> ${status}`, 'incident', 'success');
    api.incidents.update(id, { status }).catch(() => {});
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        currentUser,
        roles,
        users,
        incidents,
        auditLogs,
        allPermissions: ALL_PERMISSIONS,
        toast,
        project,
        updateProject,
        setProjectFiles,
        updateProjectFileContent,
        activeProjectFile,
        setActiveProjectFile,
        login,
        register,
        logout,
        selectRole,
        hasPermission,
        isViewAllowed,
        getAllowedViews,
        toggleRolePermission,
        assignUserRole,
        addUser,
        toggleUserStatus,
        deleteUser,
        createIncident,
        updateIncidentStatus,
        addAuditLog,
        triggerToast,
        dismissToast,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextValue => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
