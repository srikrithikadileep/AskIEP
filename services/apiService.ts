
import { ChildProfile, IepAnalysis, ComplianceLog, GoalProgress, CommLogEntry, IepDocument } from '../types';
import { analyzeIEPDirect, getMeetingSimulationDirect, compareIEPsDirect, generateConcernLetterDirect, reviseConcernLetterDirect } from './geminiService';

const API_BASE = '/api';
const FAST_TIMEOUT = 3000;

const LS_KEYS = {
  PROFILE: 'askiep_profile_v2',
  COMPLIANCE: 'askiep_compliance_v2',
  PROGRESS: 'askiep_progress_v2',
  COMMS: 'askiep_comms_v2',
  ANALYSES: 'askiep_analyses_v2',
  DOCUMENTS: 'askiep_documents_v2'
};

const localDB = {
  get: (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },
  set: (key: string, value: any) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },
  add: (key: string, item: any) => {
    const current = localDB.get(key) || [];
    const newItem = { 
      ...item, 
      id: item.id || Math.random().toString(36).substr(2, 9), 
      created_at: item.created_at || new Date().toISOString() 
    };
    localDB.set(key, [newItem, ...current]);
    return newItem;
  }
};

async function fetchWithTimeout(resource: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FAST_TIMEOUT);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const api = {
  isOffline: false,

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/health`);
      this.isOffline = !res.ok;
      return res.ok;
    } catch (e) {
      this.isOffline = true;
      return false;
    }
  },

  async getProfile(): Promise<ChildProfile | null> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/profile`);
      if (!res.ok) throw new Error();
      const profile = await res.json();
      if (profile) localDB.set(LS_KEYS.PROFILE, profile);
      return profile;
    } catch (e) {
      return localDB.get(LS_KEYS.PROFILE);
    }
  },

  async saveProfile(profile: Partial<ChildProfile>): Promise<ChildProfile> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();
      localDB.set(LS_KEYS.PROFILE, saved);
      return saved;
    } catch (e) {
      const local = { ...profile, id: profile.id || 'local-id' } as ChildProfile;
      localDB.set(LS_KEYS.PROFILE, local);
      return local;
    }
  },

  async getDocuments(childId: string): Promise<IepDocument[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/documents/${childId}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return localDB.get(LS_KEYS.DOCUMENTS) || [];
    }
  },

  async getComplianceLogs(childId: string): Promise<ComplianceLog[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/compliance/${childId}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return localDB.get(LS_KEYS.COMPLIANCE) || [];
    }
  },

  async addComplianceLog(log: any): Promise<ComplianceLog> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/compliance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return localDB.add(LS_KEYS.COMPLIANCE, log);
    }
  },

  async getGoalProgress(childId: string): Promise<GoalProgress[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/progress/${childId}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return localDB.get(LS_KEYS.PROGRESS) || [];
    }
  },

  async addGoalProgress(progress: any): Promise<GoalProgress> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return localDB.add(LS_KEYS.PROGRESS, progress);
    }
  },

  async getCommLogs(childId: string): Promise<CommLogEntry[]> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/comms/${childId}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return localDB.get(LS_KEYS.COMMS) || [];
    }
  },

  async addCommLog(log: any): Promise<CommLogEntry> {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/comms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      return localDB.add(LS_KEYS.COMMS, log);
    }
  },

  async analyzeIEP(text: string, childId: string, filename?: string): Promise<IepAnalysis> {
    try {
      const result = await analyzeIEPDirect(text);
      localDB.add(LS_KEYS.ANALYSES, { ...result, child_id: childId });
      
      if (filename) {
        localDB.add(LS_KEYS.DOCUMENTS, { 
          child_id: childId, 
          filename, 
          content: text,
          created_at: new Date().toISOString() 
        });
      }

      fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, childId, filename })
      }).catch(() => {});

      return result;
    } catch (e) {
      console.error("Analysis Pipeline Failed:", e);
      throw e;
    }
  },

  async compareIEPs(oldText: string, newText: string) {
    return await compareIEPsDirect(oldText, newText);
  },

  async generateActionLetter(analysis: any, childName: string) {
    return await generateConcernLetterDirect(analysis, childName);
  },

  async reviseActionLetter(currentLetter: string, instruction: string) {
    return await reviseConcernLetterDirect(currentLetter, instruction);
  },

  async simulateMeeting(userMessage: string, childContext: string): Promise<string> {
    try {
      return await getMeetingSimulationDirect(userMessage, childContext);
    } catch (e) {
      console.error("Meeting Simulation Failed:", e);
      return "I encountered a technical issue. Please try your message again.";
    }
  }
};
