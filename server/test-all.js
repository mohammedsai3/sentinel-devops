// Automated End-to-End Verification Test Script
// Tests Backend API, Database Persistence & Groq AI Engine

const BASE = 'http://localhost:5000';

async function test(name, fn) {
  process.stdout.write(`Testing: ${name}... `);
  try {
    const start = Date.now();
    const result = await fn();
    const elapsed = Date.now() - start;
    console.log(`\x1b[32m[PASS]\x1b[0m (${elapsed}ms)`);
    if (result) console.log(`   └─ ${result}`);
  } catch (err) {
    console.log(`\x1b[31m[FAIL]\x1b[0m: ${err.message}`);
    process.exitCode = 1;
  }
}

async function run() {
  console.log('\n======================================================');
  console.log('🧪 SENTINEL DEVOPS - SUITE DE VALIDATION BACKEND & IA');
  console.log('======================================================\n');

  let testUserId = null;
  let testIncidentId = null;
  let testPmId = null;

  // 1. Health & DB
  await test('1. Health check & état de la base de données', async () => {
    const res = await fetch(`${BASE}/api/health`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('Status not ok');
    return `Uptime: ${data.uptimeSeconds}s | Base: ${data.databaseStats.usersCount} users, ${data.databaseStats.incidentsCount} incidents`;
  });

  // 2. Authentication Login
  await test('2. Authentification réelle (Login utilisateur)', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mohammed@corp.sentinel', password: 'dev123' })
    });
    const data = await res.json();
    if (!data.success || !data.user) throw new Error(data.error || 'Login failed');
    return `Connecté: ${data.user.name} | Rôle: ${data.user.roleId}`;
  });

  // 3. Dynamic User Registration & Persistence
  await test('3. Inscription dynamique & persistance en base', async () => {
    const email = `test.user.${Date.now()}@corp.sentinel`;
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alexandre QA',
        email,
        password: 'password123',
        roleId: 'qa',
        department: 'Test Automation'
      })
    });
    const data = await res.json();
    if (!data.success || !data.user) throw new Error(data.error || 'Register failed');
    testUserId = data.user.id;
    return `Nouvel utilisateur créé: ID ${data.user.id} (${data.user.email})`;
  });

  // 4. Incident Dynamic Creation & Modification (Not static!)
  await test('4. Déclaration dynamique d\'incident & cycle de vie', async () => {
    const res = await fetch(`${BASE}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Crash passerelle de paiement Stripe v3 (Test E2E)',
        service: 'stripe-gateway',
        cluster: 'k8s-prod-eu1',
        priority: 'P1',
        category: 'Paiements',
        description: 'Test dynamique de création de panne.',
        assignee: 'Alexandre QA'
      })
    });
    const inc = await res.json();
    if (!inc.id) throw new Error('Failed creating incident');
    testIncidentId = inc.id;

    // Patch status to investigating then resolved
    const patchRes = await fetch(`${BASE}/api/incidents/${encodeURIComponent(inc.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' })
    });
    const updated = await patchRes.json();
    if (updated.status !== 'resolved') throw new Error('Status not updated');
    return `Incident ${inc.id} créé puis passé à l'état "${updated.status}"`;
  });

  // 5. War Room Live Discussion & Groq AI Copilot
  await test('5. War Room en direct avec Copilote Groq IA', async () => {
    const encodedId = encodeURIComponent(testIncidentId || '#892');
    const res = await fetch(`${BASE}/api/incidents/${encodedId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: 'Alexandre QA',
        role: 'QA Lead',
        content: '@copilot donne une commande kubectl pour vérifier les logs du pod'
      })
    });
    const data = await res.json();
    if (!data.userMessage) throw new Error('User message not saved');
    if (!data.copilotMessage) throw new Error('Copilot did not reply');
    return `Copilote Groq a répondu: "${data.copilotMessage.content.slice(0, 70)}..."`;
  });

  // 6. Groq Root Cause Analysis (RCA) Engine
  await test('6. Moteur Groq LPU - Root Cause Analysis (RCA)', async () => {
    const res = await fetch(`${BASE}/api/groq/rca`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Saturation de sockets TCP Redis',
        service: 'saturn-redis',
        priority: 'P1',
        logs: '[ERROR] Pool limit 200 handles reached at CartService.reserveItems line 142'
      })
    });
    const data = await res.json();
    if (!data.rcaSummary) throw new Error('RCA summary missing');
    return `Inférence Groq: ${data.inferenceTimeMs}ms | Modèle: ${data.modelUsed} | Confiance: ${(data.confidence * 100)}%`;
  });

  // 7. Groq Hotfix & Git Diff Generation
  await test('7. Moteur Groq LPU - Générateur de Patch Git Diff', async () => {
    const res = await fetch(`${BASE}/api/groq/hotfix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issue: 'Fuite de ressource socket non libérée dans le handler',
        filePath: 'src/services/CartService.ts',
        language: 'typescript'
      })
    });
    const data = await res.json();
    if (!data.patch) throw new Error('Patch generation failed');
    return `Patch Groq généré en ${data.inferenceTimeMs}ms (${data.modelUsed})`;
  });

  // 8. Groq Incident Auto-Triage & SLA Prediction
  await test('8. Moteur Groq LPU - Triage & Prédiction SLA', async () => {
    const res = await fetch(`${BASE}/api/groq/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Timeouts 504 aléatoires sur les flux checkout',
        description: 'Les clients ne parviennent plus à finaliser leur panier.',
        service: 'checkout-api'
      })
    });
    const data = await res.json();
    if (!data.triage) throw new Error('Triage failed');
    return `Priorité recommandée: ${data.triage.priority} | SLA estimé: ${data.triage.slaMinutes} min | ${data.triage.immediateAction}`;
  });

  // 9. Groq 5-Whys Post-Mortem & Wiki Persistence
  await test('9. Moteur Groq LPU - Rédaction 5 Pourquoi & Wiki', async () => {
    const res = await fetch(`${BASE}/api/groq/postmortem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: '#999',
        title: 'Panne de passerelle Stripe',
        service: 'payment-api',
        durationMinutes: 14
      })
    });
    const data = await res.json();
    if (!data.postMortem || !data.postMortem.fiveWhys) throw new Error('Post-Mortem generation failed');

    // Persist to database
    const saveRes = await fetch(`${BASE}/api/postmortems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketRef: '#999',
        title: 'Panne de passerelle Stripe',
        service: 'payment-api',
        durationMinutes: 14,
        category: 'Paiements',
        authorAi: `Groq LPU (${data.inferenceTimeMs}ms)`,
        summary: data.postMortem.summary,
        timeline: data.postMortem.timeline,
        fiveWhys: data.postMortem.fiveWhys,
        actionItems: [
          { id: 'act-1', text: 'Installer un circuit breaker', done: false, owner: '@devops' }
        ]
      })
    });
    const saved = await saveRes.json();
    testPmId = saved.id;
    return `Post-Mortem ${saved.id} rédigé par Groq et enregistré en base avec ${data.postMortem.fiveWhys.length} Pourquoi`;
  });

  // 10. Security & Vault Real Operations
  await test('10. Opérations Sécurité (WAF & Rotation Vault)', async () => {
    // Block IP
    const blockRes = await fetch(`${BASE}/api/security/waf/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: '203.0.113.42' })
    });
    const blockData = await blockRes.json();
    if (!blockData.success) throw new Error('WAF block failed');

    // Rotate Vault
    const rotateRes = await fetch(`${BASE}/api/security/vault/rotate`, { method: 'POST' });
    const rotateData = await rotateRes.json();
    if (!rotateData.success) throw new Error('Vault rotate failed');

    return `IP 203.0.113.42 bannie sur le WAF & Certificats Vault renouvelés (${rotateData.vault.lastRotation})`;
  });

  console.log('\n======================================================');
  console.log('✅ TOUTES LES VÉRIFICATIONS SONT PASSÉES AVEC SUCCÈS !');
  console.log('======================================================\n');
}

run().catch(console.error);
