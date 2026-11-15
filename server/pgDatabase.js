import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL Connection Pool Configuration
const pgConfig = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'sentinel_db',
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
  max: 10,
};

let pool = null;
let isConnected = false;
let lastError = null;

export function getPgPool() {
  if (!pool) {
    pool = new Pool(pgConfig);
    pool.on('error', (err) => {
      console.warn('[PostgreSQL Pool Warning]:', err.message);
      isConnected = false;
      lastError = err.message;
    });
  }
  return pool;
}

export async function testPgConnection() {
  try {
    const p = getPgPool();
    const client = await p.connect();
    const res = await client.query('SELECT version(), current_database(), current_user;');
    client.release();
    isConnected = true;
    lastError = null;
    return {
      success: true,
      version: res.rows[0].version,
      database: res.rows[0].current_database,
      user: res.rows[0].current_user,
    };
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    return {
      success: false,
      error: err.message,
      code: err.code,
    };
  }
}

export function getPgStatus() {
  return {
    connected: isConnected,
    host: pgConfig.host,
    port: pgConfig.port,
    database: pgConfig.database,
    user: pgConfig.user,
    lastError: lastError,
  };
}

/**
 * Automatically creates all tables in PostgreSQL if they do not exist
 */
export async function initPgSchema() {
  const p = getPgPool();
  let client = null;
  try {
    client = await p.connect();

    // 1. Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sentinel_users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        email VARCHAR(128) UNIQUE NOT NULL,
        password VARCHAR(256) NOT NULL,
        role_id VARCHAR(32) NOT NULL,
        department VARCHAR(128),
        sso_provider VARCHAR(64),
        mfa_active BOOLEAN DEFAULT TRUE,
        active BOOLEAN DEFAULT TRUE,
        avatar_color VARCHAR(128),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sentinel_roles (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        tag VARCHAR(64) NOT NULL,
        color VARCHAR(32),
        description TEXT,
        permissions JSONB DEFAULT '[]'::jsonb,
        dedicated_route VARCHAR(64)
      );
    `);

    // 3. Incidents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sentinel_incidents (
        id VARCHAR(32) PRIMARY KEY,
        title VARCHAR(256) NOT NULL,
        service VARCHAR(128),
        cluster VARCHAR(64),
        priority VARCHAR(8),
        status VARCHAR(32),
        team VARCHAR(128),
        assignee VARCHAR(128),
        sla_minutes_remaining INT DEFAULT 60,
        reported_at VARCHAR(64),
        rca_ready BOOLEAN DEFAULT FALSE,
        rca_summary TEXT,
        description TEXT,
        category VARCHAR(128),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Ticket Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sentinel_ticket_messages (
        id VARCHAR(64) PRIMARY KEY,
        incident_id VARCHAR(32) NOT NULL,
        author VARCHAR(128),
        role VARCHAR(64),
        avatar_color VARCHAR(128),
        content TEXT NOT NULL,
        is_ai BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Audit Trail Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sentinel_audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        actor VARCHAR(128) NOT NULL,
        role VARCHAR(64),
        action TEXT NOT NULL,
        category VARCHAR(32),
        ip_address VARCHAR(64),
        status VARCHAR(32),
        timestamp VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. PostMortems table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sentinel_postmortems (
        id VARCHAR(32) PRIMARY KEY,
        title VARCHAR(256) NOT NULL,
        incident_id VARCHAR(32),
        service VARCHAR(128),
        author VARCHAR(128),
        status VARCHAR(32) DEFAULT 'published',
        date VARCHAR(64),
        duration_minutes INT DEFAULT 45,
        summary TEXT,
        root_cause TEXT,
        timeline JSONB DEFAULT '[]'::jsonb,
        preventative_actions JSONB DEFAULT '[]'::jsonb,
        metrics JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Shared Projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sentinel_projects (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        type VARCHAR(128),
        repo_url TEXT,
        files JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Security Scans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sentinel_security_scans (
        id VARCHAR(64) PRIMARY KEY,
        project_name VARCHAR(128) NOT NULL,
        cve_id VARCHAR(64),
        severity VARCHAR(32),
        score VARCHAR(16),
        component VARCHAR(128),
        service VARCHAR(128),
        description TEXT,
        status VARCHAR(64),
        scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. QA Test Runs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sentinel_qa_runs (
        id VARCHAR(64) PRIMARY KEY,
        project_name VARCHAR(128) NOT NULL,
        suite_name VARCHAR(128),
        passed_count INT DEFAULT 0,
        failed_count INT DEFAULT 0,
        total_assertions INT DEFAULT 0,
        duration_ms INT DEFAULT 0,
        status VARCHAR(32),
        details JSONB DEFAULT '[]'::jsonb,
        logs TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ [PostgreSQL]: Tous les schémas et tables Sentinel initialisés avec succès.');
    isConnected = true;
    return true;
  } catch (err) {
    console.warn('⚠️ [PostgreSQL Init Notice]:', err.message);
    lastError = err.message;
    return false;
  } finally {
    if (client) client.release();
  }
}
