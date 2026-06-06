import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { listModels, getInsight } from './api';
import type { CheckIn } from './types';

vi.mock('./api', () => ({
  listModels: vi.fn(),
  getInsight: vi.fn(),
}));
// recharts needs real layout; stub the chart so persistence flow is isolated.
vi.mock('./components/MoodChart', () => ({ MoodChart: () => <div data-testid="mood-chart" /> }));

const mockListModels = vi.mocked(listModels);
const mockGetInsight = vi.mocked(getInsight);

beforeEach(() => {
  localStorage.clear();
  mockListModels.mockReset().mockResolvedValue([{ id: 'gemini-pro', label: 'Gemini Pro' }]);
  mockGetInsight.mockReset().mockResolvedValue('You are doing great, Arjun.');
});

/** Complete the Setup screen and land on the first check-in. */
async function startSession(name = 'Arjun') {
  fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(/gemini api key/i), { target: { value: 'a-key' } });
  fireEvent.blur(screen.getByLabelText(/gemini api key/i));
  await screen.findByRole('option', { name: 'Gemini Pro' });
  fireEvent.click(screen.getByRole('button', { name: /start tracking/i }));
  await screen.findByRole('heading', { name: new RegExp(`hi, ${name}`, 'i') });
}

describe('App orchestration', () => {
  it('starts on the Setup screen', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'MindSpace' })).toBeInTheDocument();
  });

  it('persists a logged check-in to localStorage under a per-user key', async () => {
    render(<App />);
    await startSession('Arjun');

    fireEvent.click(screen.getByRole('button', { name: /just log it/i }));

    const stored = JSON.parse(localStorage.getItem('mindspace_arjun') ?? '[]') as CheckIn[];
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ mood: 5, triggers: [], reflection: '' });
    // Stays on check-in, now numbered #2 with a history link available.
    expect(screen.getByText('Check-in #2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view mood history/i })).toBeInTheDocument();
  });

  it('derives the storage key case-insensitively from the name', async () => {
    render(<App />);
    await startSession('ARJUN');
    fireEvent.click(screen.getByRole('button', { name: /just log it/i }));
    expect(localStorage.getItem('mindspace_arjun')).not.toBeNull();
  });

  it('loads existing history for a returning user', async () => {
    const existing: CheckIn[] = [
      { mood: 6, triggers: [], reflection: '', timestamp: '2026-06-05T10:00:00.000Z' },
      { mood: 7, triggers: [], reflection: '', timestamp: '2026-06-06T10:00:00.000Z' },
    ];
    localStorage.setItem('mindspace_arjun', JSON.stringify(existing));

    render(<App />);
    await startSession('Arjun');

    // Two prior entries → this is check-in #3 and history is available.
    expect(screen.getByText('Check-in #3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view mood history/i })).toBeInTheDocument();
  });

  it('requests and renders an AI insight on "Get Insights"', async () => {
    render(<App />);
    await startSession('Arjun');

    fireEvent.click(screen.getByRole('button', { name: /get insights/i }));

    expect(await screen.findByText('You are doing great, Arjun.')).toBeInTheDocument();
    expect(mockGetInsight).toHaveBeenCalledWith(
      'a-key', 'Arjun', 'JEE', 'gemini-pro',
      expect.arrayContaining([expect.objectContaining({ mood: 5 })])
    );
  });

  it('shows an error alert when the insight request fails', async () => {
    mockGetInsight.mockRejectedValue(new Error('AI service error'));
    render(<App />);
    await startSession('Arjun');

    fireEvent.click(screen.getByRole('button', { name: /get insights/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('AI service error')
    );
  });

  it('tolerates corrupt localStorage without crashing', async () => {
    localStorage.setItem('mindspace_arjun', 'not-json');
    render(<App />);
    await startSession('Arjun');
    // Falls back to an empty history → first check-in.
    expect(screen.getByText('Check-in #1')).toBeInTheDocument();
  });
});
