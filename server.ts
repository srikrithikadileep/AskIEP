
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { getDb, initDb } from './db';
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPTS } from './constants';
import { randomUUID } from 'crypto';

// Safety check for server environment
if (typeof process === 'undefined') {
  console.warn("Server script executing in non-Node environment. Aborting initialization.");
} else {
    const app = express();

    // 1. Production Security Middleware
    app.use(helmet({
      contentSecurityPolicy: false, 
    }) as any);

    // 2. Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again later.' }
    });
    app.use('/api/', limiter as any);

    // 3. Robust CORS
    const corsOptions = {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL || ''] 
        : '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };
    app.use(cors(corsOptions) as any);

    app.use(express.json({ limit: '50mb' }) as any);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const handleError = (res: any, error: any, message: string) => {
      console.error(`[${new Date().toISOString()}] ${message}:`, error);
      const statusCode = error?.status || 500;
      res.status(statusCode).json({ 
        error: message, 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    };

    const parseProfile = (row: any) => {
      if (!row) return null;
      return {
        ...row,
        disabilities: row.disabilities || [], 
        focusTags: row.focus_tags || [],
        lastIepDate: row.last_iep_date,
        advocacyLevel: row.advocacy_level,
        primaryGoal: row.primary_goal,
        stateContext: row.state_context
      };
    };

    app.get('/api/health', async (req, res) => {
      try {
        const db = getDb();
        await db.query('SELECT 1');
        res.json({ status: 'ok', engine: 'postgres', timestamp: new Date().toISOString() });
      } catch (e) {
        res.status(503).json({ status: 'error', reason: 'Database connection failed' });
      }
    });

    app.get('/api/profile', async (req, res) => {
      try {
        const db = getDb();
        const { rows } = await db.query('SELECT * FROM child_profiles ORDER BY created_at DESC LIMIT 1');
        res.json(parseProfile(rows[0]));
      } catch (err) {
        handleError(res, err, 'Profile fetch failed');
      }
    });

    app.post('/api/profile', async (req, res) => {
      const { id, name, age, grade, disabilities, focusTags, lastIepDate, advocacyLevel, primaryGoal, stateContext } = req.body;
      if (!name) return res.status(400).json({ error: 'Student name is required' });

      const safeDisabilities = JSON.stringify(Array.isArray(disabilities) ? disabilities : []);
      const safeFocusTags = JSON.stringify(Array.isArray(focusTags) ? focusTags : []);
      const safeDate = lastIepDate ? new Date(lastIepDate).toISOString() : new Date().toISOString();

      try {
        const db = getDb();
        let result;
        if (id) {
          const { rows } = await db.query(
            `UPDATE child_profiles SET name = $1, age = $2, grade = $3, disabilities = $4, focus_tags = $5, last_iep_date = $6, advocacy_level = $7, primary_goal = $8, state_context = $9 WHERE id = $10 RETURNING *`,
            [name, age, grade, safeDisabilities, safeFocusTags, safeDate, advocacyLevel, primaryGoal, stateContext, id]
          );
          result = rows[0];
        } else {
          const newId = randomUUID();
          const { rows } = await db.query(
            `INSERT INTO child_profiles (id, name, age, grade, disabilities, focus_tags, last_iep_date, advocacy_level, primary_goal, state_context) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [newId, name, age, grade, safeDisabilities, safeFocusTags, safeDate, advocacyLevel, primaryGoal, stateContext]
          );
          result = rows[0];
        }
        res.status(id ? 200 : 201).json(parseProfile(result));
      } catch (err) {
        handleError(res, err, 'Vault storage failed');
      }
    });

    app.get('/api/documents/:childId', async (req, res) => {
      try {
        const db = getDb();
        const { rows } = await db.query('SELECT id, child_id, filename, created_at, analysis_id FROM iep_documents WHERE child_id = $1 ORDER BY created_at DESC', [req.params.childId]);
        res.json(rows);
      } catch (err) { handleError(res, err, 'Documents fetch failed'); }
    });

    app.get('/api/analysis/latest/:childId', async (req, res) => {
      try {
        const db = getDb();
        const { rows } = await db.query(
          'SELECT * FROM iep_analyses WHERE child_id = $1 ORDER BY created_at DESC LIMIT 1',
          [req.params.childId]
        );
        if (rows.length === 0) return res.json(null);
        const row = rows[0];
        res.json({
          ...row,
          goals: row.goals,
          accommodations: row.accommodations,
          redFlags: row.red_flags
        });
      } catch (err) {
        handleError(res, err, 'Analysis fetch failed');
      }
    });

    app.post('/api/analyze', async (req, res) => {
      const { text, childId, filename } = req.body;
      if (!text) return res.status(400).json({ error: 'Text content is required for analysis' });
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
        const db = getDb();
        const analysisId = randomUUID();
        const docId = randomUUID();

        await db.query(
          'INSERT INTO iep_analyses (id, child_id, summary, goals, accommodations, red_flags, legal_lens) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [analysisId, childId, analysis.summary, JSON.stringify(analysis.goals), JSON.stringify(analysis.accommodations), JSON.stringify(analysis.redFlags), analysis.legalLens]
        );

        await db.query(
          'INSERT INTO iep_documents (id, child_id, filename, content, analysis_id) VALUES ($1, $2, $3, $4, $5)',
          [docId, childId, filename || 'Manual Paste', text, analysisId]
        );

        res.json(analysis);
      } catch (err) {
        handleError(res, err, 'AI analysis pipeline failed');
      }
    });

    app.get('/api/compliance/:childId', async (req, res) => {
      try {
        const db = getDb();
        const { rows } = await db.query('SELECT * FROM compliance_logs WHERE child_id = $1 ORDER BY date DESC', [req.params.childId]);
        res.json(rows);
      } catch (err) { handleError(res, err, 'Compliance fetch failed'); }
    });

    app.post('/api/compliance', async (req, res) => {
      const { childId, date, serviceType, status, notes } = req.body;
      try {
        const db = getDb();
        const id = randomUUID();
        const { rows } = await db.query('INSERT INTO compliance_logs (id, child_id, date, service_type, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id, childId, date, serviceType, status, notes]);
        res.json(rows[0]);
      } catch (err) { handleError(res, err, 'Compliance save failed'); }
    });

    app.get('/api/progress/:childId', async (req, res) => {
      try {
        const db = getDb();
        const { rows } = await db.query('SELECT * FROM goal_progress WHERE child_id = $1 ORDER BY last_updated DESC', [req.params.childId]);
        res.json(rows);
      } catch (err) { handleError(res, err, 'Progress fetch failed'); }
    });

    app.post('/api/progress', async (req, res) => {
      const { childId, goalName, currentValue, targetValue, status } = req.body;
      try {
        const db = getDb();
        const id = randomUUID();
        const { rows } = await db.query('INSERT INTO goal_progress (id, child_id, goal_name, current_value, target_value, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id, childId, goalName, currentValue, targetValue, status]);
        res.json(rows[0]);
      } catch (err) { handleError(res, err, 'Progress save failed'); }
    });

    app.get('/api/comms/:childId', async (req, res) => {
      try {
        const db = getDb();
        const { rows } = await db.query('SELECT * FROM communication_logs WHERE child_id = $1 ORDER BY date DESC', [req.params.childId]);
        res.json(rows);
      } catch (err) { handleError(res, err, 'Comms fetch failed'); }
    });

    app.post('/api/comms', async (req, res) => {
      const { childId, date, contactName, method, summary, followUpNeeded } = req.body;
      try {
        const db = getDb();
        const id = randomUUID();
        const { rows } = await db.query('INSERT INTO communication_logs (id, child_id, date, contact_name, method, summary, follow_up_needed) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [id, childId, date, contactName, method, summary, followUpNeeded]);
        res.json(rows[0]);
      } catch (err) { handleError(res, err, 'Comms save failed'); }
    });

    app.get('/api/behavior/:childId', async (req, res) => {
      try {
        const db = getDb();
        const { rows } = await db.query('SELECT * FROM behavior_logs WHERE child_id = $1 ORDER BY date DESC', [req.params.childId]);
        res.json(rows);
      } catch (err) { handleError(res, err, 'Behavior fetch failed'); }
    });

    app.post('/api/behavior', async (req, res) => {
      const { childId, date, time, antecedent, behavior, consequence, intensity, duration_minutes, notes } = req.body;
      try {
        const db = getDb();
        const id = randomUUID();
        const { rows } = await db.query('INSERT INTO behavior_logs (id, child_id, date, time, antecedent, behavior, consequence, intensity, duration_minutes, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *', [id, childId, date, time, antecedent, behavior, consequence, intensity, duration_minutes, notes]);
        res.json(rows[0]);
      } catch (err) { handleError(res, err, 'Behavior save failed'); }
    });

    app.get('/api/letters/:childId', async (req, res) => {
      try {
        const db = getDb();
        const { rows } = await db.query('SELECT * FROM letter_drafts WHERE child_id = $1 ORDER BY last_edited DESC', [req.params.childId]);
        res.json(rows);
      } catch (err) { handleError(res, err, 'Letters fetch failed'); }
    });

    app.post('/api/letters', async (req, res) => {
      const { childId, title, content, type } = req.body;
      try {
        const db = getDb();
        const id = randomUUID();
        const { rows } = await db.query('INSERT INTO letter_drafts (id, child_id, title, content, type) VALUES ($1, $2, $3, $4, $5) RETURNING *', [id, childId, title, content, type]);
        res.json(rows[0]);
      } catch (err) { handleError(res, err, 'Letter save failed'); }
    });

    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      console.log(`[AskIEP] Production server active on port ${PORT}`);
      initDb().catch(e => console.error("Database initialization failed", e));
    });

    (process as any).on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        const db = getDb();
        db.end(() => {
          console.log('Database pool closed');
          (process as any).exit(0);
        });
      });
    });
}
