
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Production Pool Event Listeners
pool.on('connect', () => {
  console.log('[DB] New client connected to the pool');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
  // Do not exit process; the pool will attempt to handle reconnections
});

export const getDb = () => pool;

export const initDb = async () => {
  const client = await pool.connect();
  try {
    console.log('[DB] Synchronizing production schema...');

    // Combined schema initialization for performance
    await client.query(`
      CREATE TABLE IF NOT EXISTS child_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER,
        grade TEXT,
        disabilities JSONB DEFAULT '[]', 
        focus_tags JSONB DEFAULT '[]',   
        advocacy_level TEXT,
        primary_goal TEXT,
        state_context TEXT,
        last_iep_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS iep_analyses (
        id TEXT PRIMARY KEY,
        child_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
        summary TEXT,
        goals JSONB DEFAULT '[]',          
        accommodations JSONB DEFAULT '[]', 
        red_flags JSONB DEFAULT '[]',      
        legal_lens TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS iep_documents (
        id TEXT PRIMARY KEY,
        child_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        content TEXT NOT NULL,
        analysis_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS compliance_logs (
        id TEXT PRIMARY KEY,
        child_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        service_type TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS goal_progress (
        id TEXT PRIMARY KEY,
        child_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
        goal_name TEXT NOT NULL,
        current_value TEXT,
        target_value TEXT,
        status TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS communication_logs (
        id TEXT PRIMARY KEY,
        child_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        method TEXT NOT NULL,
        summary TEXT,
        follow_up_needed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS behavior_logs (
        id TEXT PRIMARY KEY,
        child_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        time TEXT,
        antecedent TEXT,
        behavior TEXT,
        consequence TEXT,
        intensity INTEGER,
        duration_minutes INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS letter_drafts (
        id TEXT PRIMARY KEY,
        child_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
        title TEXT,
        content TEXT,
        type TEXT,
        last_edited TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('[DB] Production tables verified and ready.');
  } catch (err) {
    console.error('[DB] Initialization Critical Failure:', err);
    throw err;
  } finally {
    client.release();
  }
};
