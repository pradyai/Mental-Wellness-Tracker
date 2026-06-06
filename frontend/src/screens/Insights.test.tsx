import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Insights } from './Insights';
import type { CheckIn } from '../types';

// The chart relies on recharts' ResponsiveContainer, which needs real layout
// measurements unavailable in jsdom. Stub it so screen logic is tested in isolation.
vi.mock('../components/MoodChart', () => ({
  MoodChart: () => <div data-testid="mood-chart" />,
}));

const iso = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86_400_000).toISOString();

function make(mood: number, triggers: string[], daysAgo: number): CheckIn {
  return { mood, triggers, reflection: '', timestamp: iso(daysAgo) };
}

function renderInsights(overrides: Partial<React.ComponentProps<typeof Insights>> = {}) {
  const props = {
    name: 'Arjun',
    examType: 'JEE',
    checkIns: [] as CheckIn[],
    message: '',
    isLoading: false,
    error: null as string | null,
    showAiPanel: false,
    onNewCheckIn: vi.fn(),
    ...overrides,
  };
  render(<Insights {...props} />);
  return props;
}

describe('Insights summary stats', () => {
  it('computes the consecutive-day streak, average mood and count', () => {
    renderInsights({
      checkIns: [make(4, [], 2), make(6, [], 1), make(8, [], 0)],
    });

    const stats = screen.getByLabelText('Summary statistics');
    expect(stats).toHaveTextContent('3'); // 3-day streak
    expect(stats).toHaveTextContent('6.0'); // avg of 4,6,8
    expect(screen.getByText(/3 check-ins/i)).toBeInTheDocument();
  });

  it('breaks the streak when the latest entry is older than yesterday', () => {
    renderInsights({ checkIns: [make(5, [], 10)] });
    expect(screen.getByLabelText('Summary statistics')).toHaveTextContent('0');
  });
});

describe('Insights chart vs single-mood display', () => {
  it('renders the chart only when there is more than one check-in', () => {
    renderInsights({ checkIns: [make(5, [], 1), make(7, [], 0)] });
    expect(screen.getByTestId('mood-chart')).toBeInTheDocument();
  });

  it('shows a single big mood number for exactly one check-in', () => {
    renderInsights({ checkIns: [make(7, [], 0)] });
    expect(screen.queryByTestId('mood-chart')).not.toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});

describe('Insights top triggers', () => {
  it('lists triggers ranked by frequency with counts', () => {
    renderInsights({
      checkIns: [
        make(5, ['Sleep Deprivation', 'Peer Pressure'], 2),
        make(6, ['Sleep Deprivation'], 1),
        make(4, ['Sleep Deprivation', 'Peer Pressure'], 0),
      ],
    });

    const list = screen.getByLabelText('Stress trigger frequency');
    const items = list.querySelectorAll('.trigger-freq-item');
    expect(items[0]).toHaveTextContent('Sleep Deprivation');
    expect(items[0]).toHaveTextContent('3');
    expect(items[1]).toHaveTextContent('Peer Pressure');
    expect(items[1]).toHaveTextContent('2');
  });
});

describe('Insights AI panel', () => {
  it('is hidden unless showAiPanel is set', () => {
    renderInsights({ checkIns: [make(5, [], 0)], showAiPanel: false, message: 'hi' });
    expect(screen.queryByText('hi')).not.toBeInTheDocument();
  });

  it('shows a loading status while generating', () => {
    renderInsights({ checkIns: [make(5, [], 0)], showAiPanel: true, isLoading: true });
    expect(screen.getByRole('status', { name: /generating your message/i })).toBeInTheDocument();
  });

  it('surfaces an error with an alert role', () => {
    renderInsights({ checkIns: [make(5, [], 0)], showAiPanel: true, error: 'Invalid API key.' });
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid API key.');
  });

  it('renders the wellness message when present and not loading', () => {
    renderInsights({
      checkIns: [make(5, [], 0)],
      showAiPanel: true,
      message: 'You are doing great, Arjun.',
    });
    expect(screen.getByText('You are doing great, Arjun.')).toBeInTheDocument();
  });
});
