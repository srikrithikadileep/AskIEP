
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { getDb, initDb } from '../database/db';
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPTS } from '../constants';
import { randomUUID } from 'crypto';

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.use(helmet({ contentSecurityPolicy: false }) as any);
app.use(cors() as any);
app.use(express.json({ limit: '50mb' }) as any);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { error: 'Rate limit exceeded' }
});
app.use('/api/', limiter as any);

// Shared logic for profiles
const parseProfile = (row: any) => row ? ({
  ...row,
  disabilities: row.disabilities || [],
  focusTags: row.focus_tags || []
}) : null;

app.get('/api/health', async (req, res) => {
  try {
    await getDb().query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date() });
  } catch (e) {
    res.status(503).json({ status: 'error' });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const { rows } = await getDb().query('SELECT * FROM child_profiles ORDER BY created_at DESC LIMIT 1');
    res.json(parseProfile(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Profile fetch failed' });
  }
});

app.post('/api/profile', async (req, res) => {
  const { id, name, age, grade, disabilities, lastIepDate } = req.body;
  try {
    const db = getDb();
    const profileId = id || randomUUID();
    const { rows } = await db.query(
      `INSERT INTO child_profiles (id, name, age, grade, disabilities, last_iep_date) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (id) DO UPDATE SET name=$2, age=$3, grade=$4, disabilities=$5, last_iep_date=$6
       RETURNING *`,
      [profileId, name, age, grade, JSON.stringify(disabilities), lastIepDate]
    );
    res.json(parseProfile(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Save failed' });
  }
});

// ... Additional API endpoints for letters and analysis follow similar pattern ...

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`[AskIEP] Backend active on ${PORT}`);
  await initDb().catch(console.error);
});
