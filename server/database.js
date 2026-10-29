import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const INITIAL_DATA = {
  users: [
    {
      id: 'u-dev-1',
      name: 'Mohammed',
      email: 'mohammed@corp.sentinel',
      password: 'dev123',
      roleId: 'dev',
      department: 'Ingénierie & Microservices',
      ssoProvider: 'Okta SSO',
      mfaActive: true,
      active: true,
      avatarColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      createdAt: '2026-01-15T08:00:00Z',
    },
    {
      id: 'u-sec-1',
      name: 'Tasnim',
      email: 'tasnim@corp.sentinel',
      password: 'sec123',
      roleId: 'sec',
      department: 'Gouvernance & SSI',
      ssoProvider: 'Azure AD',
      mfaActive: true,
      active: true,
      avatarColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      createdAt: '2026-01-18T09:30:00Z',
    },
    {
      id: 'u-qa-1',
      name: 'Aymane',
      email: 'aymane@corp.sentinel',
      password: 'qa123',
      roleId: 'qa',
      department: 'Qualité Logicielle & Chaos',
      ssoProvider: 'Google Workspace',
      mfaActive: true,
      active: true,
      avatarColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      createdAt: '2026-02-01T11:15:00Z',
    },
    {
      id: 'u-admin-1',
      name: 'Mourad',
      email: 'mourad@corp.sentinel',
      password: 'admin123',
      roleId: 'admin',
      department: 'Cloud & Infrastructure SRE',
      ssoProvider: 'Okta Hardware Key',
      mfaActive: true,
      active: true,
      avatarColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      createdAt: '2025-11-10T07:45:00Z',
    },
    {
      id: 'u-dev-2',
      name: 'Sarah Benali',
      email: 'sarah.b@corp.sentinel',
      password: 'dev123',
      roleId: 'dev',
      department: 'Cloud Ops & Backend',
      ssoProvider: 'Okta SSO',
      mfaActive: true,
      active: true,
      avatarColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      createdAt: '2026-02-14T14:20:00Z',
    },
  ],
  roles: {
    dev: {
      id: 'dev',
      name: 'Développeur Core',
      tag: 'ROLE_DEV',
      color: 'emerald',
      description: 'Spécialiste de la résolution de code, stack traces, hotfixes Groq RCA et pipelines CI/CD.',
      permissions: [
        'view_dashboard',
        'view_incidents',
        'create_incidents',
        'manage_tickets',
        'view_code_hotfix',
      ],
      dedicatedRoute: 'role-dev',
    },
    sec: {
      id: 'sec',
      name: 'Responsable Sécurité (SecOps)',
      tag: 'ROLE_SECOPS',
      color: 'amber',
      description: 'Supervision des vulnérabilités CVE, rotation des secrets Vault, posture de sécurité et conformité.',
      permissions: [
        'view_incidents',
        'manage_tickets',
        'view_security_cve',
        'manage_vault_secrets',
        'view_audit_trail',
      ],
      dedicatedRoute: 'role-sec',
    },
    qa: {
      id: 'qa',
      name: 'Ingénieur Qualité (QA Lead)',
      tag: 'ROLE_QA',
      color: 'cyan',
      description: 'Validation de non-régression, exécution des suites de tests E2E Playwright et injection de pannes Chaos.',
      permissions: [
        'view_incidents',
        'create_incidents',
        'manage_tickets',
        'run_e2e_tests',
        'declare_qa_bug',
        'chaos_injection',
      ],
      dedicatedRoute: 'role-qa',
    },
    admin: {
      id: 'admin',
      name: 'Administrateur SRE / Directeur',
      tag: 'ROLE_ADMIN',
      color: 'rose',
      description: 'Accès maître : gouvernance globale, affectation des rôles, matrice RBAC et métriques de cluster.',
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
  },
  incidents: [
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
      slaMinutesRemaining: 120,
      reportedAt: '11:15 UTC',
      rcaReady: true,
      rcaSummary: 'Règle WAF trop agressive bloquant le webhook ACME Let’s Encrypt.',
      description: 'Expiration imminente du certificat wildcard *.corp.sentinel dans 6h.',
      category: 'Sécurité & Certificats',
    },
    {
      id: '#884',
      title: 'Pic de mémoire non réclamée sur Worker Node pool-c (OOMKilled)',
      service: 'payment-worker',
      cluster: 'k8s-prod-eu1',
      priority: 'P2',
      status: 'investigating',
      team: 'Escouade Paiement',
      assignee: 'Mohammed (Lead Dev)',
      slaMinutesRemaining: 45,
      reportedAt: '09:30 UTC',
      rcaReady: true,
      rcaSummary: 'Fuite de buffers Node.js lors du traitement des webhooks Stripe concurrents.',
      description: 'Redémarrage intempestif de 4 pods payment-worker en boucle.',
      category: 'Infrastructure',
    },
    {
      id: '#880',
      title: 'Erreur 500 sur le checkout web lors du décodage Apple Pay',
      service: 'checkout-api',
      cluster: 'k8s-prod-eu1',
      priority: 'P3',
      status: 'resolved',
      team: 'Frontend Web',
      assignee: 'Sarah Benali (Dev)',
      slaMinutesRemaining: 0,
      reportedAt: 'Hier 18:20 UTC',
      rcaReady: true,
      rcaSummary: 'Incompatibilité de schéma Zod lors de la validation du token biométrique.',
      description: 'Rejets sporadiques des paiements Safari iOS 18.',
      category: 'Paiements',
    },
  ],
  ticket_messages: {
    '#892': [
      {
        id: 'm-1',
        author: 'Mourad',
        role: 'Admin SRE',
        avatarColor: 'bg-rose-500/20 text-rose-300',
        timestamp: '14:12:10',
        content:
          'Alerte P1 reçue sur PagerDuty : 95% du pool Redis saturé sur Saturn EU-West. Tous les appels vers CartService.reserveItems renvoient des erreurs 504.',
      },
      {
        id: 'm-2',
        author: 'Groq LPU (RCA Automatisé)',
        role: 'Moteur IA Groq',
        avatarColor: 'bg-emerald-500/20 text-emerald-300',
        timestamp: '14:12:44',
        isAi: true,
        content:
          'RCA complété en 42ms : Le commit fc78b19 a introduit une acquisition de client sans bloc finally { client.release() }. 200 handles sont verrouillés indéfiniment.',
      },
      {
        id: 'm-3',
        author: 'Mohammed',
        role: 'Développeur Core',
        avatarColor: 'bg-emerald-500/20 text-emerald-300',
        timestamp: '14:14:30',
        content:
          'Bien reçu. Je valide le diagnostic Groq. Je prépare le patch pour envelopper l’appel dans un try/finally et libérer le handle.',
      },
      {
        id: 'm-4',
        author: 'Tasnim',
        role: 'SecOps Lead',
        avatarColor: 'bg-amber-500/20 text-amber-300',
        timestamp: '14:16:05',
        content:
          'Vérification sécurité effectuée : pas d’exploitation malveillante ni de déni de service externe. Il s’agit bien d’un bug applicatif interne.',
      },
    ],
  },
  post_mortems: [
    {
      id: 'PM-892',
      ticketRef: '#892',
      title: 'Saturation du pool de connexions Redis (Cluster Saturn EU-West)',
      service: 'saturn-redis',
      date: '06 Octobre 2026',
      durationMinutes: 16,
      category: 'Fuite Mémoire & Handles',
      authorAi: 'Groq LPU (Généré en 42ms)',
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
      authorAi: 'Groq LPU (Généré en 38ms)',
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
  ],
  audit_logs: [
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
  ],
  security_vault: {
    status: 'HEALTHY',
    activeCerts: 12,
    expiringWithin30Days: 1,
    lastRotation: '2026-10-26T18:00:00Z',
    wafBlockedIps: ['194.26.29.12', '185.220.101.5', '45.154.255.88'],
    cves: [
      { id: 'CVE-2024-3094', severity: 'CRITICAL', package: 'liblzma (XZ Utils)', status: 'patched', fixedVersion: '5.6.1-r1' },
      { id: 'CVE-2024-21626', severity: 'HIGH', package: 'runc container runtime', status: 'mitigated', fixedVersion: '1.1.12' },
      { id: 'CVE-2023-44487', severity: 'MEDIUM', package: 'HTTP/2 Rapid Reset', status: 'monitored', fixedVersion: 'WAF Rate Limit' },
    ]
  },
  qa_tests: {
    lastRunId: 'qa-run-418',
    passed: 142,
    failed: 0,
    flaky: 1,
    durationSeconds: 46.2,
    coverage: 89.4,
    suites: [
      { name: 'Auth & JWT Flow (Playwright)', status: 'passed', tests: 34, duration: '12s' },
      { name: 'Checkout & 3D Secure (Cypress)', status: 'passed', tests: 48, duration: '19s' },
      { name: 'Redis Connection Pool Stress (K6)', status: 'passed', tests: 20, duration: '8s' },
      { name: 'Chaos Pod Eviction (ChaosMesh)', status: 'passed', tests: 12, duration: '7.2s' },
    ]
  },
  telemetry: {
    mttrMinutes: 18.4,
    slaCompliance: 99.94,
    activePods: 148,
    errorRatePercent: 0.02,
    p95LatencyMs: 16.8,
  }
};

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[DB] Failed reading db.json, falling back to seed:', err.message);
    }
    this.save(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  save(data = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed writing to db.json:', err.message);
    }
  }

  // --- USERS ---
  getUsers() {
    return this.data.users;
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData) {
    const newUser = {
      id: `u-${Date.now()}`,
      active: true,
      mfaActive: true,
      ssoProvider: 'Sentinel IAM',
      createdAt: new Date().toISOString(),
      ...userData,
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  deleteUser(id) {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- ROLES & PERMISSIONS ---
  getRoles() {
    return this.data.roles;
  }

  updateRolePermissions(roleId, permissions) {
    if (!this.data.roles[roleId]) return null;
    this.data.roles[roleId].permissions = permissions;
    this.save();
    return this.data.roles[roleId];
  }

  toggleRolePermission(roleId, permissionKey) {
    const role = this.data.roles[roleId];
    if (!role) return null;
    const exists = role.permissions.includes(permissionKey);
    if (exists) {
      role.permissions = role.permissions.filter(p => p !== permissionKey);
    } else {
      role.permissions.push(permissionKey);
    }
    this.save();
    return role;
  }

  // --- INCIDENTS ---
  getIncidents() {
    return this.data.incidents;
  }

  getIncidentById(id) {
    return this.data.incidents.find(i => i.id === id);
  }

  createIncident(incidentData) {
    const newIncident = {
      id: `#${Math.floor(100 + Math.random() * 900)}`,
      status: 'open',
      rcaReady: false,
      team: incidentData.team || 'Core Backend',
      slaMinutesRemaining: incidentData.slaMinutesRemaining || 60,
      reportedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      ...incidentData,
    };
    this.data.incidents.unshift(newIncident);
    this.save();
    return newIncident;
  }

  updateIncident(id, updates) {
    const idx = this.data.incidents.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.data.incidents[idx] = { ...this.data.incidents[idx], ...updates };
    this.save();
    return this.data.incidents[idx];
  }

  // --- TICKET MESSAGES ---
  getTicketMessages(ticketId) {
    return this.data.ticket_messages[ticketId] || [];
  }

  addTicketMessage(ticketId, message) {
    if (!this.data.ticket_messages[ticketId]) {
      this.data.ticket_messages[ticketId] = [];
    }
    const newMsg = {
      id: `m-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      ...message,
    };
    this.data.ticket_messages[ticketId].push(newMsg);
    this.save();
    return newMsg;
  }

  // --- POST MORTEMS ---
  getPostMortems() {
    return this.data.post_mortems;
  }

  createPostMortem(pmData) {
    const newPm = {
      id: `PM-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      ...pmData,
    };
    this.data.post_mortems.unshift(newPm);
    this.save();
    return newPm;
  }

  togglePostMortemAction(pmId, actionId) {
    const pm = this.data.post_mortems.find(p => p.id === pmId);
    if (!pm || !pm.actionItems) return null;
    const action = pm.actionItems.find(a => a.id === actionId);
    if (action) {
      action.done = !action.done;
      this.save();
      return action;
    }
    return null;
  }

  // --- AUDIT LOGS ---
  getAuditLogs() {
    return this.data.audit_logs;
  }

  addAuditLog(entry) {
    const newLog = {
      id: `aud-${Date.now()}`,
      timestamp: 'À l’instant',
      status: 'success',
      ...entry,
    };
    this.data.audit_logs.unshift(newLog);
    this.save();
    return newLog;
  }

  // --- SECURITY ---
  getSecurityData() {
    return this.data.security_vault;
  }

  rotateVault() {
    this.data.security_vault.lastRotation = new Date().toISOString();
    this.data.security_vault.expiringWithin30Days = 0;
    this.save();
    return this.data.security_vault;
  }

  blockWafIp(ip) {
    if (!this.data.security_vault.wafBlockedIps.includes(ip)) {
      this.data.security_vault.wafBlockedIps.unshift(ip);
      this.save();
    }
    return this.data.security_vault.wafBlockedIps;
  }

  // --- QA ---
  getQATests() {
    return this.data.qa_tests;
  }

  triggerQARun(suiteName) {
    this.data.qa_tests.lastRunId = `qa-run-${Date.now().toString().slice(-4)}`;
    this.data.qa_tests.passed += Math.floor(Math.random() * 5);
    this.save();
    return this.data.qa_tests;
  }

  // --- TELEMETRY ---
  getTelemetry() {
    return this.data.telemetry;
  }
}

export const db = new Database();
