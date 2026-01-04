
import { ChildProfile, IepAnalysis, ComplianceLog, GoalProgress, CommLogEntry, IepDocument, BehaviorLog, LetterDraft } from '../types';
import { analyzeIEPDirect, getMeetingSimulationDirect, generateLetterDirect, refineTextDirect } from './geminiService';

const API_BASE = '/api';
const FAST_TIMEOUT = 5000;
const HEALTH_TIMEOUT = 2000; // Even faster timeout for health checks
const MAX_RETRIES = 2;

async function wait(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function fetchWithRetry(resource: string, options: RequestInit = {}, customTimeout = FAST_TIMEOUT, retries = MAX_RETRIES): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), customTimeout);
  
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    
    // Only retry on 5xx errors or network failures
    if (!response.ok && response.status >= 500 && retries > 0) {
      console.warn(`API Error ${response.status}. Retrying... (${retries} left)`);
      await wait(Math.pow(2, MAX_RETRIES - retries + 1) * 300);
      return fetchWithRetry(resource, options, customTimeout, retries - 1);
    }
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (retries > 0) {
      await wait(Math.pow(2, MAX_RETRIES - retries + 1) * 300);
      return fetchWithRetry(resource, options, customTimeout, retries - 1);
    }
    throw error;
  }
}

export const api = {
  isOffline: false,

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/health`, {}, HEALTH_TIMEOUT, 1);
      this.isOffline = !res.ok;
      return res.ok;
    } catch (e) {
      this.isOffline = true;
      return false;
    }
  },

  async getProfile(): Promise<ChildProfile | null> {
    if (this.isOffline) return JSON.parse(localStorage.getItem('askiep_profile_v2') || 'null');
    try {
      const res = await fetchWithRetry(`${API_BASE}/profile`);
      const profile = await res.json();
      if (profile) localStorage.setItem('askiep_profile_v2', JSON.stringify(profile));
      return profile;
    } catch (e) { 
      return JSON.parse(localStorage.getItem('askiep_profile_v2') || 'null'); 
    }
  },

  async saveProfile(profile: Partial<ChildProfile>): Promise<ChildProfile> {
    try {
      if (this.isOffline) throw new Error("Offline mode");
      const res = await fetchWithRetry(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const saved = await res.json();
      localStorage.setItem('askiep_profile_v2', JSON.stringify(saved));
      return saved;
    } catch (e) {
      const fallback = { ...profile, id: profile.id || 'local-' + Date.now() } as ChildProfile;
      localStorage.setItem('askiep_profile_v2', JSON.stringify(fallback));
      return fallback;
    }
  },

  async getDocuments(childId: string): Promise<IepDocument[]> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/documents/${childId}`);
      return await res.json();
    } catch (e) { return []; }
  },

  async getLatestAnalysis(childId: string): Promise<IepAnalysis | null> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/analysis/latest/${childId}`);
      return await res.json();
    } catch (e) { return null; }
  },

  async getComplianceLogs(childId: string): Promise<ComplianceLog[]> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/compliance/${childId}`);
      return await res.json();
    } catch (e) { return []; }
  },

  async addComplianceLog(log: any): Promise<ComplianceLog> {
    const res = await fetchWithRetry(`${API_BASE}/compliance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
    return await res.json();
  },

  async getGoalProgress(childId: string): Promise<GoalProgress[]> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/progress/${childId}`);
      return await res.json();
    } catch (e) { return []; }
  },

  async addGoalProgress(progress: any): Promise<GoalProgress> {
    const res = await fetchWithRetry(`${API_BASE}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress)
    });
    return await res.json();
  },

  async getCommLogs(childId: string): Promise<CommLogEntry[]> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/comms/${childId}`);
      return await res.json();
    } catch (e) { return []; }
  },

  async addCommLog(log: any): Promise<CommLogEntry> {
    const res = await fetchWithRetry(`${API_BASE}/comms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
    return await res.json();
  },

  async getBehaviorLogs(childId: string): Promise<BehaviorLog[]> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/behavior/${childId}`);
      return await res.json();
    } catch (e) { return []; }
  },

  async addBehaviorLog(log: any): Promise<BehaviorLog> {
    const res = await fetchWithRetry(`${API_BASE}/behavior`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
    return await res.json();
  },

  async getLetters(childId: string): Promise<LetterDraft[]> {
    try {
      const res = await fetchWithRetry(`${API_BASE}/letters/${childId}`);
      return await res.json();
    } catch (e) { return []; }
  },

  async saveLetter(draft: any): Promise<LetterDraft> {
    const res = await fetchWithRetry(`${API_BASE}/letters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft)
    });
    return await res.json();
  },

  async analyzeIEP(text: string, childId: string, filename?: string): Promise<IepAnalysis> {
    const result = await analyzeIEPDirect(text);
    if (!this.isOffline) {
      fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, childId, filename })
      }).catch(err => console.error("Cloud sync of analysis failed", err));
    }
    return result;
  },

  async simulateMeeting(userMessage: string, childContext: string): Promise<string> {
    return await getMeetingSimulationDirect(userMessage, childContext);
  },

  async generateLetter(context: string, letterType: string): Promise<string> {
    return await generateLetterDirect(context, letterType);
  },

  async refineLetter(text: string, instruction: string): Promise<string> {
    return await refineTextDirect(text, instruction);
  }
};
