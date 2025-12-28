
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000, 
  idleTimeoutMillis: 30000,
  max: 10
});

export const initDb = async () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Operating in degraded mode.");
    return;
  }

  let client;
  try {
    console.log('DB: Connecting...');
    client = await pool.connect();
    
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS child_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        age INTEGER,
        grade TEXT,
        disabilities TEXT[],
        focus_tags TEXT[],
        advocacy_level TEXT,
        primary_goal TEXT,
        state_context TEXT,
        last_iep_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS iep_analyses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id UUID REFERENCES child_profiles(id),
        summary TEXT,
        goals JSONB,
        accommodations JSONB,
        red_flags JSONB,
        legal_lens TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS iep_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id UUID REFERENCES child_profiles(id),
        filename TEXT NOT NULL,
        content TEXT NOT NULL,
        analysis_id UUID REFERENCES iep_analyses(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS compliance_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id UUID REFERENCES child_profiles(id),
        date DATE NOT NULL,
        service_type TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS goal_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id UUID REFERENCES child_profiles(id),
        goal_name TEXT NOT NULL,
        current_value TEXT,
        target_value TEXT,
        status TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS communication_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id UUID REFERENCES child_profiles(id),
        date DATE NOT NULL,
        contact_name TEXT NOT NULL,
        method TEXT NOT NULL,
        summary TEXT,
        follow_up_needed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('DB: Tables ready.');
  } catch (err) {
    console.error('DB Init Error:', err);
  } finally {
    if (client) client.release();
  }
};

export default pool;
