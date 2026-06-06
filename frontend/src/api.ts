import type { CheckIn } from './types';

const API_BASE = '';

export interface ModelOption {
  id: string;
  label: string;
}

export async function listModels(apiKey: string): Promise<ModelOption[]> {
  const response = await fetch(`${API_BASE}/api/models`, {
    headers: { 'X-API-Key': apiKey },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch models' }));
    throw new Error(err.detail ?? 'Failed to fetch models');
  }
  const data = await response.json();
  return data.models as ModelOption[];
}

export async function getInsight(
  apiKey: string,
  name: string,
  examType: string,
  model: string,
  checkIns: CheckIn[]
): Promise<string> {
  const recent = checkIns.slice(-7);
  const response = await fetch(`${API_BASE}/api/insight`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({
      name,
      exam_type: examType,
      model,
      mood_history: recent,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail ?? 'Request failed');
  }

  const data = await response.json();
  return data.message as string;
}
