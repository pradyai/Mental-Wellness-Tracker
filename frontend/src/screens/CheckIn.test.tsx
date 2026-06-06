import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckIn } from './CheckIn';

function renderCheckIn(overrides: { hasHistory?: boolean } = {}) {
  const onSubmit = vi.fn();
  const onViewHistory = vi.fn();
  render(
    <CheckIn
      name="Arjun"
      checkInNumber={3}
      hasHistory={false}
      onSubmit={onSubmit}
      onViewHistory={onViewHistory}
      {...overrides}
    />
  );
  return { onSubmit, onViewHistory };
}

describe('CheckIn', () => {
  it('greets the user and shows the check-in number', () => {
    renderCheckIn();
    expect(screen.getByRole('heading', { name: /hi, arjun/i })).toBeInTheDocument();
    expect(screen.getByText('Check-in #3')).toBeInTheDocument();
  });

  it('submits with requestInsight=true from "Get Insights"', () => {
    const { onSubmit } = renderCheckIn();
    fireEvent.click(screen.getByRole('button', { name: /get insights/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const [data, requestInsight] = onSubmit.mock.calls[0];
    expect(requestInsight).toBe(true);
    expect(data).toMatchObject({ mood: 5, triggers: [], reflection: '' });
    expect(typeof data.timestamp).toBe('string');
  });

  it('submits with requestInsight=false from "Just Log It"', () => {
    const { onSubmit } = renderCheckIn();
    fireEvent.click(screen.getByRole('button', { name: /just log it/i }));

    expect(onSubmit.mock.calls[0][1]).toBe(false);
  });

  it('captures the entered mood, triggers and trimmed reflection', () => {
    const { onSubmit } = renderCheckIn();

    fireEvent.change(screen.getByRole('slider'), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Time Management' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  feeling rushed  ' } });
    fireEvent.click(screen.getByRole('button', { name: /get insights/i }));

    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      mood: 8,
      triggers: ['Time Management'],
      reflection: 'feeling rushed',
    });
  });

  it('hides the history link when there is no history', () => {
    renderCheckIn({ hasHistory: false });
    expect(screen.queryByRole('button', { name: /view mood history/i })).not.toBeInTheDocument();
  });

  it('shows and wires the history link when history exists', () => {
    const { onViewHistory } = renderCheckIn({ hasHistory: true });
    fireEvent.click(screen.getByRole('button', { name: /view mood history/i }));
    expect(onViewHistory).toHaveBeenCalledTimes(1);
  });
});
