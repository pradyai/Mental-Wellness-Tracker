import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TriggerSelector } from './TriggerSelector';
import { STRESS_TRIGGERS } from '../types';

describe('TriggerSelector', () => {
  it('renders a checkbox for every known trigger', () => {
    render(<TriggerSelector selected={[]} onChange={() => {}} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(STRESS_TRIGGERS.length);
  });

  it('marks already-selected triggers as checked', () => {
    render(<TriggerSelector selected={['Peer Pressure']} onChange={() => {}} />);
    expect(screen.getByRole('checkbox', { name: 'Peer Pressure' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Sleep Deprivation' })).not.toBeChecked();
  });

  it('adds a trigger when an unchecked option is clicked', () => {
    const onChange = vi.fn();
    render(<TriggerSelector selected={['Peer Pressure']} onChange={onChange} />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Sleep Deprivation' }));

    expect(onChange).toHaveBeenCalledWith(['Peer Pressure', 'Sleep Deprivation']);
  });

  it('removes a trigger when a checked option is clicked', () => {
    const onChange = vi.fn();
    render(<TriggerSelector selected={['Peer Pressure', 'Sleep Deprivation']} onChange={onChange} />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Peer Pressure' }));

    expect(onChange).toHaveBeenCalledWith(['Sleep Deprivation']);
  });
});
