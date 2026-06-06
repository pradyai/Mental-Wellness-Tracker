export interface CheckIn {
  mood: number;
  triggers: string[];
  reflection: string;
  timestamp: string; // ISO 8601 e.g. "2026-06-06T10:30:00.000Z"
}

export interface SessionState {
  name: string;
  examType: string;
  apiKey: string;
  model: string;
  checkIns: CheckIn[];
}

export interface StoredPrefs {
  name: string;
  examType: string;
}

export type Screen = 'setup' | 'checkin' | 'insights';

export const EXAM_TYPES = ['JEE', 'NEET', 'CAT', 'GATE', 'UPSC', 'CUET', 'Board Exams'] as const;

export const STRESS_TRIGGERS = [
  'Syllabus Overload',
  'Sleep Deprivation',
  'Peer Pressure',
  'Fear of Failure',
  'Time Management',
  'Family Expectations',
  'Health Issues',
  'Social Isolation',
] as const;
