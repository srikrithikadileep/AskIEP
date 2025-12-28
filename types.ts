
export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  grade: string;
  disabilities: string[];
  focusTags: string[];
  lastIepDate: string;
  advocacyLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  primaryGoal?: string;
  stateContext?: string;
  created_at?: string;
}

export interface IepAnalysis {
  id?: string;
  child_id?: string;
  summary: string;
  goals: string[];
  accommodations: string[];
  redFlags: string[];
  legalLens: string;
  created_at?: string;
}

export interface IepDocument {
  id: string;
  child_id: string;
  filename: string;
  content: string;
  analysis_id?: string;
  created_at: string;
}

export interface ComplianceLog {
  id: string;
  child_id: string;
  date: string;
  serviceType: string;
  status: 'Received' | 'Missed' | 'Partial';
  notes: string;
  created_at?: string;
}

export interface GoalProgress {
  id: string;
  child_id: string;
  goal_name: string;
  current_value: string;
  target_value: string;
  status: 'Emerging' | 'Progressing' | 'Mastered' | 'Regression';
  last_updated: string;
}

export interface CommLogEntry {
  id: string;
  child_id: string;
  date: string;
  contact_name: string;
  method: 'Email' | 'Phone' | 'In-person' | 'IEP Meeting';
  summary: string;
  follow_up_needed: boolean;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type ViewType = 
  | 'login'
  | '2fa'
  | 'onboarding'
  | 'dashboard' 
  | 'profile' 
  | 'analyzer' 
  | 'prep' 
  | 'compliance' 
  | 'progress'
  | 'comms'
  | 'legal' 
  | 'resources' 
  | 'settings';
