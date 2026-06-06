import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { listModels, getInsight } from './api';
import type { CheckIn } from './types';

function mockFetch(response: { ok: boolean; body: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    json: async () => response.body,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function makeCheckIn(mood: number): CheckIn {
  return { mood, triggers: [], reflection: '', timestamp: '2026-06-06T10:00:00.000Z' };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('listModels', () => {
  it('sends the API key header and returns the models array', async () => {
    const fetchMock = mockFetch({ ok: true, body: { models: [{ id: 'gemini-pro', label: 'Gemini Pro' }] } });

    const models = await listModels('my-key');

    expect(models).toEqual([{ id: 'gemini-pro', label: 'Gemini Pro' }]);
    expect(fetchMock).toHaveBeenCalledWith('/api/models', {
      headers: { 'X-API-Key': 'my-key' },
    });
  });

  it('throws the server-provided detail on failure', async () => {
    mockFetch({ ok: false, body: { detail: 'Invalid API key.' } });
    await expect(listModels('bad')).rejects.toThrow('Invalid API key.');
  });

  it('falls back to a generic message when the error body is unparseable', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => { throw new Error('not json'); },
    });
    vi.stubGlobal('fetch', fetchMock);
    await expect(listModels('bad')).rejects.toThrow('Failed to fetch models');
  });
});

describe('getInsight', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('returns the generated message on success', async () => {
    mockFetch({ ok: true, body: { message: 'Keep going!' } });
    const message = await getInsight('key', 'Arjun', 'JEE', 'gemini-pro', [makeCheckIn(7)]);
    expect(message).toBe('Keep going!');
  });

  it('sends only the most recent 7 check-ins', async () => {
    const fetchMock = mockFetch({ ok: true, body: { message: 'ok' } });
    const tenCheckIns = Array.from({ length: 10 }, (_, i) => makeCheckIn(i + 1));

    await getInsight('key', 'Arjun', 'JEE', 'gemini-pro', tenCheckIns);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.mood_history).toHaveLength(7);
    expect(body.mood_history[0].mood).toBe(4); // entries 4..10 = the last 7
    expect(body.exam_type).toBe('JEE');
  });

  it('throws the server-provided detail on failure', async () => {
    mockFetch({ ok: false, body: { detail: 'AI service error' } });
    await expect(
      getInsight('key', 'Arjun', 'JEE', 'gemini-pro', [makeCheckIn(5)])
    ).rejects.toThrow('AI service error');
  });
});
