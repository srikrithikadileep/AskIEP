
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => console.log('[DB] Connection Pool Established'));
pool.on('error', (err) => console.error('[DB] Idle Client Error', err));

export const getDb = () => pool;

export const initDb = async () => {
  const client = await pool.connect();
  try {
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

      CREATE TABLE IF NOT EXISTS letter_drafts (
        id TEXT PRIMARY KEY,
        child_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
        title TEXT,
        content TEXT,
        type TEXT,
        last_edited TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[DB] Schema Initialized');
  } finally {
    client.release();
  }
};
