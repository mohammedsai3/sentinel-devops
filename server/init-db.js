import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initPgSchema } from './pgDatabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

const { Client } = pg;

async function setupPostgreSQL() {
  console.log('====================================================');
  console.log('🐘 Initialisation et Migration PostgreSQL Sentinel');
  console.log('====================================================');

  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT || '5432', 10);
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || 'postgres';
  const targetDb = process.env.PGDATABASE || 'sentinel_db';

  console.log(`Tentative de connexion à postgres://${user}:****@${host}:${port}/postgres...`);

  // Step 1: Connect to default 'postgres' database to ensure 'sentinel_db' exists
  const rootClient = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
  });

  try {
    await rootClient.connect();
    console.log('✓ Connecté au serveur PostgreSQL');

    const checkDb = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1;`,
      [targetDb]
    );

    if (checkDb.rowCount === 0) {
      console.log(`Création de la base de données '${targetDb}'...`);
      await rootClient.query(`CREATE DATABASE "${targetDb}";`);
      console.log(`✓ Base de données '${targetDb}' créée avec succès.`);
    } else {
      console.log(`✓ Base de données '${targetDb}' existe déjà.`);
    }
  } catch (err) {
    console.warn(`[Info]: Connexion root postgres: ${err.message}`);
  } finally {
    try {
      await rootClient.end();
    } catch {}
  }

  // Step 2: Initialize tables schema
  console.log(`Initialisation des schémas dans '${targetDb}'...`);
  const schemaSuccess = await initPgSchema();

  if (schemaSuccess) {
    // Step 3: Seed data from db.json if available
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        const { getPgPool } = await import('./pgDatabase.js');
        const p = getPgPool();
        const client = await p.connect();

        // Seed users
        if (Array.isArray(data.users)) {
          for (const u of data.users) {
            await client.query(`
              INSERT INTO sentinel_users (id, name, email, password, role_id, department, sso_provider, mfa_active, active, avatar_color)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              ON CONFLICT (id) DO NOTHING;
            `, [u.id, u.name, u.email, u.password, u.roleId, u.department, u.ssoProvider, u.mfaActive, u.active, u.avatarColor]);
          }
          console.log(`✓ ${data.users.length} utilisateurs synchronisés.`);
        }

        // Seed roles
        if (data.roles) {
          for (const [key, r] of Object.entries(data.roles)) {
            await client.query(`
              INSERT INTO sentinel_roles (id, name, tag, color, description, permissions, dedicated_route)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT (id) DO NOTHING;
            `, [r.id || key, r.name, r.tag, r.color, r.description, JSON.stringify(r.permissions), r.dedicatedRoute]);
          }
          console.log(`✓ Rôles RBAC synchronisés.`);
        }

        // Seed incidents
        if (Array.isArray(data.incidents)) {
          for (const inc of data.incidents) {
            await client.query(`
              INSERT INTO sentinel_incidents (id, title, service, cluster, priority, status, team, assignee, sla_minutes_remaining, reported_at, rca_ready, rca_summary, description, category)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
              ON CONFLICT (id) DO NOTHING;
            `, [inc.id, inc.title, inc.service, inc.cluster, inc.priority, inc.status, inc.team, inc.assignee, inc.slaMinutesRemaining, inc.reportedAt, inc.rcaReady, inc.rcaSummary, inc.description, inc.category]);
          }
          console.log(`✓ ${data.incidents.length} incidents synchronisés.`);
        }

        client.release();
        console.log('🎉 Migration et synchronisation PostgreSQL terminées avec succès !');
      }
    } catch (seedErr) {
      console.warn('Erreur seed données:', seedErr.message);
    }
  } else {
    console.log('⚠️ Impossible d’initialiser le schéma. Vérifiez vos identifiants dans .env (PGPASSWORD).');
  }
}

setupPostgreSQL();
