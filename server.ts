
import express from 'express';
import cors from 'cors';
import pool, { initDb } from './db';
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPTS } from './constants';

const app = express();
app.use(cors() as any);
app.use(express.json({ limit: '50mb' }) as any);

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleError = (res: any, error: any, message: string) => {
  console.error(`${message}:`, error);
  res.status(500).json({ 
    error: message, 
    details: error instanceof Error ? error.message : 'Unknown server error' 
  });
};

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/profile', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, age, grade, disabilities, focus_tags as "focusTags", 
        advocacy_level as "advocacyLevel", primary_goal as "primaryGoal", 
        state_context as "stateContext", last_iep_date as "lastIepDate", created_at 
      FROM child_profiles 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    res.json(result.rows[0] || null);
  } catch (err) {
    handleError(res, err, 'Profile database error');
  }
});

app.post('/api/profile', async (req, res) => {
  const { id, name, age, grade, disabilities, focusTags, lastIepDate, advocacyLevel, primaryGoal, stateContext } = req.body;
  if (!name) return res.status(400).json({ error: 'Student name is required' });

  const safeDisabilities = Array.isArray(disabilities) ? disabilities : [];
  const safeFocusTags = Array.isArray(focusTags) ? focusTags : [];
  const safeDate = lastIepDate ? new Date(lastIepDate) : new Date();

  try {
    let result;
    if (id) {
      result = await pool.query(
        `UPDATE child_profiles 
         SET name = $1, age = $2, grade = $3, disabilities = $4, focus_tags = $5, last_iep_date = $6, 
             advocacy_level = $7, primary_goal = $8, state_context = $9 
         WHERE id = $10
         RETURNING id, name, age, grade, disabilities, focus_tags as "focusTags", last_iep_date as "lastIepDate", 
         advocacy_level as "advocacyLevel", primary_goal as "primaryGoal", state_context as "stateContext", created_at`,
        [name, age, grade, safeDisabilities, safeFocusTags, safeDate, advocacyLevel, primaryGoal, stateContext, id]
      );
    } else {
      result = await pool.query(
        `INSERT INTO child_profiles (name, age, grade, disabilities, focus_tags, last_iep_date, advocacy_level, primary_goal, state_context) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING id, name, age, grade, disabilities, focus_tags as "focusTags", last_iep_date as "lastIepDate", 
         advocacy_level as "advocacyLevel", primary_goal as "primaryGoal", state_context as "stateContext", created_at`,
        [name, age, grade, safeDisabilities, safeFocusTags, safeDate, advocacyLevel, primaryGoal, stateContext]
      );
    }
    res.status(id ? 200 : 201).json(result.rows[0]);
  } catch (err) {
    handleError(res, err, 'Vault storage failed');
  }
});

app.get('/api/documents/:childId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, child_id, filename, created_at, analysis_id FROM iep_documents WHERE child_id = $1 ORDER BY created_at DESC',
      [req.params.childId]
    );
    res.json(result.rows);
  } catch (err) {
    handleError(res, err, 'Documents fetch failed');
  }
});

app.post('/api/analyze', async (req, res) => {
  const { text, childId, filename } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is empty' });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Please analyze this IEP text: ${text}`,
      config: {
        systemInstruction: SYSTEM_PROMPTS.ANALYZER,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            goals: { type: Type.ARRAY, items: { type: Type.STRING } },
            accommodations: { type: Type.ARRAY, items: { type: Type.STRING } },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            legalLens: { type: Type.STRING }
          },
          required: ["summary", "goals", "accommodations", "redFlags", "legalLens"]
        }
      }
    });
    
    const analysis = JSON.parse(response.text || '{}');
    const analysisResult = await pool.query(
      'INSERT INTO iep_analyses (child_id, summary, goals, accommodations, red_flags, legal_lens) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [childId, analysis.summary, JSON.stringify(analysis.goals), JSON.stringify(analysis.accommodations), JSON.stringify(analysis.redFlags), analysis.legalLens]
    );

    const analysisId = analysisResult.rows[0].id;

    await pool.query(
      'INSERT INTO iep_documents (child_id, filename, content, analysis_id) VALUES ($1, $2, $3, $4)',
      [childId, filename || 'Manual Paste', text, analysisId]
    );

    res.json(analysis);
  } catch (err) {
    handleError(res, err, 'AI analysis failed');
  }
});

app.get('/api/compliance/:childId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM compliance_logs WHERE child_id = $1 ORDER BY date DESC', [req.params.childId]);
    res.json(result.rows.map(row => ({ ...row, serviceType: row.service_type })));
  } catch (err) {
    handleError(res, err, 'Compliance fetch failed');
  }
});

app.post('/api/compliance', async (req, res) => {
  const { childId, date, serviceType, status, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO compliance_logs (child_id, date, service_type, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [childId, date, serviceType, status, notes]
    );
    res.status(201).json({ ...result.rows[0], serviceType: result.rows[0].service_type });
  } catch (err) {
    handleError(res, err, 'Compliance save failed');
  }
});

app.get('/api/progress/:childId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM goal_progress WHERE child_id = $1 ORDER BY last_updated DESC', [req.params.childId]);
    res.json(result.rows);
  } catch (err) {
    handleError(res, err, 'Progress fetch failed');
  }
});

app.post('/api/progress', async (req, res) => {
  const { childId, goalName, currentValue, targetValue, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO goal_progress (child_id, goal_name, current_value, target_value, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [childId, goalName, currentValue, targetValue, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleError(res, err, 'Progress save failed');
  }
});

app.get('/api/comms/:childId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM communication_logs WHERE child_id = $1 ORDER BY date DESC', [req.params.childId]);
    res.json(result.rows);
  } catch (err) {
    handleError(res, err, 'History fetch failed');
  }
});

app.post('/api/comms', async (req, res) => {
  const { childId, date, contactName, method, summary, follow_up_needed: followUpNeeded } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO communication_logs (child_id, date, contact_name, method, summary, follow_up_needed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [childId, date, contactName, method, summary, followUpNeeded]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleError(res, err, 'Comms save failed');
  }
});

app.post('/api/simulate', async (req, res) => {
  const { userMessage, childContext } = req.body;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Context: ${childContext}\nParent says: ${userMessage}`,
      config: { systemInstruction: SYSTEM_PROMPTS.MEETING_PREP }
    });
    res.json({ text: response.text });
  } catch (err) {
    handleError(res, err, 'AI Busy');
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  initDb().catch(e => console.error("Async DB init failed:", e));
});
