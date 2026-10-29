import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './database.js';
import {
  analyzeRCA,
  generateHotfix,
  generatePostMortem,
  chatCopilot,
  triageIncident,
  refactorCode,
  debugPipeline,
  generateThreatRule,
  auditCompliance,
  generateE2ETests,
  predictBottleneck,
  getFinopsRecommendations,
  generateExecutiveBrief,
  auditImportedProject,
  callGroq,
  DEFAULT_MODELS
} from './groq.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.originalUrl.includes('/api/health')) {
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ========================================================
// 1. HEALTH & SYSTEM METRICS
// ========================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.8.0',
    service: 'Sentinel DevOps Backend Engine (Persistent)',
    groqConfigured: true,
    availableModels: DEFAULT_MODELS,
    uptimeSeconds: Math.floor(process.uptime()),
    databaseStats: {
      usersCount: db.getUsers().length,
      incidentsCount: db.getIncidents().length,
      auditLogsCount: db.getAuditLogs().length,
      postMortemsCount: db.getPostMortems().length
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/telemetry', (req, res) => {
  res.json(db.getTelemetry());
});

// ========================================================
// 2. AUTHENTICATION & SESSION
// ========================================================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Identifiants invalides ou utilisateur non trouvé.' });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: 'Mot de passe incorrect.' });
  }

  if (!user.active) {
    return res.status(403).json({ error: 'Ce compte a été désactivé par l’administrateur.' });
  }

  db.addAuditLog({
    actor: user.name,
    role: user.roleId.toUpperCase(),
    action: `Connexion réussie au cockpit (${user.roleId})`,
    category: 'auth',
    status: 'success'
  });

  const { password: _, ...userSafe } = user;
  res.json({ success: true, user: userSafe });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, roleId, department } = req.body;
  if (!name || !email || !password || !roleId) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être renseignés.' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'Une adresse email identique existe déjà dans l’annuaire.' });
  }

  const colorMap = {
    dev: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    sec: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    qa: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    admin: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };

  const newUser = db.createUser({
    name,
    email,
    password,
    roleId,
    department: department || 'Ingénierie & Systèmes',
    avatarColor: colorMap[roleId] || colorMap.dev,
  });

  db.addAuditLog({
    actor: name,
    role: roleId.toUpperCase(),
    action: `Nouvelle inscription enregistrée avec rôle ${roleId}`,
    category: 'rbac',
    status: 'success'
  });

  const { password: _, ...userSafe } = newUser;
  res.status(201).json({ success: true, user: userSafe });
});

// ========================================================
// 3. USERS MANAGEMENT (CRUD)
// ========================================================
app.get('/api/users', (req, res) => {
  const users = db.getUsers().map(({ password, ...u }) => u);
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { name, email, roleId, department, password } = req.body;
  if (!name || !email || !roleId) {
    return res.status(400).json({ error: 'Nom, email et rôle requis' });
  }

  const newUser = db.createUser({
    name,
    email,
    roleId,
    password: password || 'sentinel2026',
    department: department || 'DevOps Platform',
    avatarColor: 'bg-zinc-800 text-zinc-200 border-zinc-700'
  });

  db.addAuditLog({
    actor: 'Administrateur',
    role: 'ADMIN',
    action: `Création du collaborateur ${name} (${email})`,
    category: 'rbac',
    status: 'success'
  });

  const { password: _, ...userSafe } = newUser;
  res.status(201).json(userSafe);
});

app.patch('/api/users/:id', (req, res) => {
  const updated = db.updateUser(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  db.addAuditLog({
    actor: 'Administrateur',
    role: 'ADMIN',
    action: `Mise à jour des privilèges / statut pour ${updated.name}`,
    category: 'rbac',
    status: 'success'
  });

  const { password: _, ...userSafe } = updated;
  res.json(userSafe);
});

app.delete('/api/users/:id', (req, res) => {
  const success = db.deleteUser(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }
  res.json({ success: true });
});

// ========================================================
// 4. ROLES & RBAC MATRIX
// ========================================================
app.get('/api/roles', (req, res) => {
  res.json(db.getRoles());
});

app.patch('/api/roles/:id/permissions', (req, res) => {
  const { permissions } = req.body;
  if (!Array.isArray(permissions)) {
    return res.status(400).json({ error: 'Permissions doit être un tableau' });
  }
  const updated = db.updateRolePermissions(req.params.id, permissions);
  if (!updated) {
    return res.status(404).json({ error: 'Rôle non trouvé' });
  }

  db.addAuditLog({
    actor: 'Administrateur SRE',
    role: 'ADMIN',
    action: `Modification de la matrice de permissions pour le rôle [${req.params.id.toUpperCase()}]`,
    category: 'rbac',
    status: 'warning'
  });

  res.json(updated);
});

app.post('/api/roles/:id/toggle', (req, res) => {
  const { permissionKey } = req.body;
  const updated = db.toggleRolePermission(req.params.id, permissionKey);
  if (!updated) {
    return res.status(404).json({ error: 'Rôle non trouvé' });
  }
  res.json(updated);
});

// ========================================================
// 5. INCIDENTS & WAR ROOM TICKETS (CRUD)
// ========================================================
app.get('/api/incidents', (req, res) => {
  const { status, priority, search } = req.query;
  let items = db.getIncidents();

  if (status) {
    items = items.filter(i => i.status === status);
  }
  if (priority) {
    items = items.filter(i => i.priority === priority);
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.service.toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q)
    );
  }

  res.json(items);
});

app.get('/api/incidents/:id', (req, res) => {
  const incident = db.getIncidentById(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident non trouvé' });
  }
  res.json(incident);
});

app.post('/api/incidents', async (req, res) => {
  try {
    const incidentData = req.body;
    const newIncident = db.createIncident(incidentData);

    db.addAuditLog({
      actor: incidentData.assignee || 'Collaborateur',
      role: 'DEVOPS',
      action: `Déclaration de l'incident ${newIncident.id} (${newIncident.title})`,
      category: 'incident',
      status: 'warning'
    });

    res.status(201).json(newIncident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/incidents/:id', (req, res) => {
  const updated = db.updateIncident(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Incident non trouvé' });
  }

  db.addAuditLog({
    actor: 'Ingénieur d’astreinte',
    role: 'SRE',
    action: `Incident ${updated.id} passé à l’état [${updated.status.toUpperCase()}]`,
    category: 'incident',
    status: updated.status === 'resolved' ? 'success' : 'warning'
  });

  res.json(updated);
});

// War Room Messages
app.get('/api/incidents/:id/messages', (req, res) => {
  const messages = db.getTicketMessages(req.params.id);
  res.json(messages);
});

app.post('/api/incidents/:id/messages', async (req, res) => {
  const ticketId = req.params.id;
  const { author, role, avatarColor, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Le contenu du message est requis' });
  }

  const userMsg = db.addTicketMessage(ticketId, {
    author: author || 'Ingénieur d’astreinte',
    role: role || 'DevOps',
    avatarColor: avatarColor || 'bg-blue-500/20 text-blue-300',
    content,
    isAi: false
  });

  // Check if user is asking the Copilot
  const lower = content.toLowerCase();
  const needsCopilot = lower.includes('copilot') || lower.includes('@copilot') || lower.includes('pourquoi') || lower.includes('aide') || lower.includes('?') || lower.includes('kubectl');

  let copilotMsg = null;
  if (needsCopilot) {
    try {
      const incident = db.getIncidentById(ticketId);
      const messagesHistory = db.getTicketMessages(ticketId).slice(-6);

      const aiResponse = await chatCopilot({
        messages: messagesHistory.map(m => ({
          role: m.isAi ? 'assistant' : 'user',
          content: `${m.author} (${m.role}): ${m.content}`
        })),
        context: incident
      });

      copilotMsg = db.addTicketMessage(ticketId, {
        author: `Copilote Groq (${aiResponse.modelUsed})`,
        role: 'IA Assistante SRE',
        avatarColor: 'bg-teal-500/20 text-teal-300',
        content: aiResponse.reply,
        isAi: true
      });
    } catch (err) {
      console.error('[Copilot auto-reply failed]:', err);
    }
  }

  res.status(201).json({ userMessage: userMsg, copilotMessage: copilotMsg });
});

// ========================================================
// 6. POST-MORTEMS & WIKI
// ========================================================
app.get('/api/postmortems', (req, res) => {
  res.json(db.getPostMortems());
});

app.post('/api/postmortems', (req, res) => {
  const newPm = db.createPostMortem(req.body);

  db.addAuditLog({
    actor: 'Moteur IA & SRE',
    role: 'SRE',
    action: `Publication du Post-Mortem ${newPm.id} (${newPm.title})`,
    category: 'incident',
    status: 'success'
  });

  res.status(201).json(newPm);
});

app.patch('/api/postmortems/:id/actions/:actionId', (req, res) => {
  const result = db.togglePostMortemAction(req.params.id, req.params.actionId);
  if (!result) {
    return res.status(404).json({ error: 'Action item ou Post-Mortem non trouvé' });
  }
  res.json(result);
});

// ========================================================
// 7. AUDIT TRAIL LOGS
// ========================================================
app.get('/api/audit-logs', (req, res) => {
  res.json(db.getAuditLogs());
});

app.post('/api/audit-logs', (req, res) => {
  const log = db.addAuditLog(req.body);
  res.status(201).json(log);
});

// ========================================================
// 8. SECURITY & VAULT
// ========================================================
app.get('/api/security/stats', (req, res) => {
  res.json(db.getSecurityData());
});

app.post('/api/security/vault/rotate', (req, res) => {
  const vault = db.rotateVault();
  db.addAuditLog({
    actor: 'Tasnim (SecOps)',
    role: 'SECOPS',
    action: 'Rotation immédiate des secrets OAuth2 et certificats TLS Vault',
    category: 'security',
    status: 'success'
  });
  res.json({ success: true, vault });
});

app.post('/api/security/waf/block', (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'Adresse IP requise' });

  const list = db.blockWafIp(ip);
  db.addAuditLog({
    actor: 'Pare-feu WAF',
    role: 'SECOPS',
    action: `Blocage manuel de l’IP source suspecte [${ip}]`,
    category: 'security',
    status: 'warning'
  });
  res.json({ success: true, blockedIps: list });
});

// ========================================================
// 9. QA & CHAOS TESTS
// ========================================================
app.get('/api/qa/stats', (req, res) => {
  res.json(db.getQATests());
});

app.post('/api/qa/run', (req, res) => {
  const { suite } = req.body;
  const tests = db.triggerQARun(suite);

  db.addAuditLog({
    actor: 'Aymane (QA Lead)',
    role: 'QA',
    action: `Exécution de la suite de tests [${suite || 'Playwright E2E'}]`,
    category: 'deploy',
    status: 'success'
  });

  res.json({ success: true, tests });
});

// ========================================================
// 10. GROQ AI ENGINE ENDPOINTS
// ========================================================
app.post('/api/groq/rca', async (req, res) => {
  try {
    const { title, service, priority, description, logs, cluster } = req.body;
    if (!title) return res.status(400).json({ error: 'Le champ title est requis' });
    const result = await analyzeRCA({ title, service, priority, description, logs, cluster });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec RCA' });
  }
});

app.post('/api/groq/hotfix', async (req, res) => {
  try {
    const { issue, filePath, originalCode, language } = req.body;
    if (!issue) return res.status(400).json({ error: 'Le champ issue est requis' });
    const result = await generateHotfix({ issue, filePath, originalCode, language });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec Hotfix' });
  }
});

app.post('/api/groq/postmortem', async (req, res) => {
  try {
    const { id, title, service, durationMinutes, summary, actionsTaken } = req.body;
    const result = await generatePostMortem({ id, title, service, durationMinutes, summary, actionsTaken });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec Post-Mortem' });
  }
});

app.post('/api/groq/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    const result = await chatCopilot({ messages, context });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec Copilot' });
  }
});

app.post('/api/groq/triage', async (req, res) => {
  try {
    const { title, description, category, service } = req.body;
    const result = await triageIncident({ title, description, category, service });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec Triage' });
  }
});

app.post('/api/groq/test', async (req, res) => {
  try {
    const { model, prompt, temperature, maxTokens } = req.body;
    const result = await callGroq({
      model: model || 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: prompt || 'Test prompt Groq' }],
      temperature: parseFloat(temperature || 0.2),
      max_tokens: parseInt(maxTokens || 600)
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec Test Groq' });
  }
});

// Role-Specific AI Endpoints

// 1. Dev AI Refactoring
app.post('/api/groq/refactor', async (req, res) => {
  try {
    const { code, language, goal } = req.body;
    if (!code) return res.status(400).json({ error: 'Code requis' });
    const result = await refactorCode({ code, language, goal });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec Refactoring' });
  }
});

// 2. Dev CI/CD Pipeline Debugger
app.post('/api/groq/pipeline-fix', async (req, res) => {
  try {
    const { failedStage, rawLogs, pipelineType } = req.body;
    const result = await debugPipeline({ failedStage, rawLogs, pipelineType });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec Pipeline Debug' });
  }
});

// 3. Sec Threat Rule Generator
app.post('/api/groq/threat-rule', async (req, res) => {
  try {
    const { threatType, payloadSample, targetSystem } = req.body;
    const result = await generateThreatRule({ threatType, payloadSample, targetSystem });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec Règle WAF' });
  }
});

// 4. Sec Compliance Audit
app.post('/api/groq/compliance-audit', async (req, res) => {
  try {
    const { standard, domain } = req.body;
    const result = await auditCompliance({ standard, domain });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec Audit Conformité' });
  }
});

// 5. QA E2E Test Suite Generator
app.post('/api/groq/generate-e2e', async (req, res) => {
  try {
    const { userStory, framework, targetUrl } = req.body;
    if (!userStory) return res.status(400).json({ error: 'User Story requise' });
    const result = await generateE2ETests({ userStory, framework, targetUrl });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec Génération Tests E2E' });
  }
});

// 6. QA Predictive Bottleneck
app.post('/api/groq/predict-bottleneck', async (req, res) => {
  try {
    const { currentRps, targetRps, service } = req.body;
    const result = await predictBottleneck({ currentRps, targetRps, service });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec Prédiction Charge' });
  }
});

// 7. Admin FinOps Recommendations
app.post('/api/groq/finops-recom', async (req, res) => {
  try {
    const { clusterNodes, currentMonthlySpend } = req.body;
    const result = await getFinopsRecommendations({ clusterNodes, currentMonthlySpend });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec FinOps' });
  }
});

// 8. Admin Executive AI Brief
app.post('/api/groq/executive-brief', async (req, res) => {
  try {
    const { period, teamPerformance } = req.body;
    const result = await generateExecutiveBrief({ period, teamPerformance });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Échec Brief Comex' });
  }
});

// 9. Full Project 360° Audit & Role Dispatcher
app.post('/api/groq/audit-project', async (req, res) => {
  try {
    const { projectName, projectType, files, repoUrl } = req.body;
    const result = await auditImportedProject({ projectName, projectType, files, repoUrl });

    db.addAuditLog({
      actor: 'Auditeur IA Sentinel',
      role: 'DEVOPS',
      action: `Audit 360° complet du projet importé [${projectName || 'Projet Externe'}]`,
      category: 'incident',
      status: 'success'
    });

    res.json(result);
  } catch (err) {
    console.error('[Project Audit Failed]:', err);
    res.status(500).json({ error: err.message || 'Échec de l’audit de projet' });
  }
});

// 10. Real GitHub Repository Inspector & Fetcher
app.post('/api/github/inspect', async (req, res) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: 'URL GitHub requise' });

    const cleaned = repoUrl.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    const parts = cleaned.split('/');
    if (parts.length < 2) {
      return res.status(400).json({ error: 'Format invalide. Exemple: https://github.com/owner/repository' });
    }
    const [owner, repo] = parts;

    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { 'User-Agent': 'Sentinel-DevOps-Platform' }
    });
    if (!repoRes.ok) {
      return res.status(404).json({ error: `Dépôt GitHub '${owner}/${repo}' introuvable ou restreint.` });
    }
    const repoData = await repoRes.json();

    const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
      headers: { 'User-Agent': 'Sentinel-DevOps-Platform' }
    });
    const contents = contentsRes.ok ? await contentsRes.json() : [];

    const targetFileNames = ['package.json', 'Dockerfile', 'docker-compose.yml', 'requirements.txt', 'pom.xml', 'README.md', 'index.js', 'main.py', 'app.ts', 'server.js', 'App.tsx'];
    const filesToAudit = [];

    if (Array.isArray(contents)) {
      for (const item of contents) {
        if (item.type === 'file' && (targetFileNames.includes(item.name) || item.name.endsWith('.json') || item.name.endsWith('.yml') || item.name.endsWith('.js') || item.name.endsWith('.py') || item.name.endsWith('.ts'))) {
          if (filesToAudit.length < 6 && item.download_url) {
            try {
              const fileContentRes = await fetch(item.download_url);
              if (fileContentRes.ok) {
                const text = await fileContentRes.text();
                filesToAudit.push({
                  name: item.name,
                  path: item.path,
                  size: item.size,
                  content: text.slice(0, 3500)
                });
              }
            } catch (err) {}
          }
        }
      }
    }

    db.addAuditLog({
      actor: 'Importateur GitHub',
      role: 'DEVOPS',
      action: `Exploration du dépôt GitHub [${repoData.full_name}] (${filesToAudit.length} fichiers analysés)`,
      category: 'incident',
      status: 'success'
    });

    res.json({
      success: true,
      repo: {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description || 'Projet GitHub public',
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language || 'Multi-language',
        defaultBranch: repoData.default_branch,
        url: repoData.html_url
      },
      fileTree: Array.isArray(contents) ? contents.map(c => ({ name: c.name, type: c.type, size: c.size, path: c.path })) : [],
      files: filesToAudit
    });
  } catch (err) {
    console.error('[GitHub fetch error]:', err.message);
    res.status(500).json({ error: 'Impossible de contacter GitHub API: ' + err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Sentinel DevOps Complete Backend API Server running on port ${PORT}`);
  console.log(`💾 Persistent DB: ${db.getUsers().length} users, ${db.getIncidents().length} incidents`);
  console.log(`⚡ Groq LPU Models: ${DEFAULT_MODELS.join(', ')}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
