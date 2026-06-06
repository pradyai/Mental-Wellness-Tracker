import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MoodSlider } from './MoodSlider';

describe('MoodSlider', () => {
  it('renders the current value and an accessible label', () => {
    render(<MoodSlider value={7} onChange={() => {}} />);

    expect(screen.getByText('7/10')).toBeInTheDocument();
    const slider = screen.getByRole('slider', { name: /mood rating: 7 out of 10/i });
    expect(slider).toHaveValue('7');
    expect(slider).toHaveAttribute('aria-valuenow', '7');
  });

  it('reports the new numeric value when the slider moves', () => {
    const onChange = vi.fn();
    render(<MoodSlider value={5} onChange={onChange} />);

    fireEvent.change(screen.getByRole('slider'), { target: { value: '9' } });

    expect(onChange).toHaveBeenCalledWith(9);
  });

  it('exposes min and max bounds for assistive tech', () => {
    render(<MoodSlider value={5} onChange={() => {}} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '1');
    expect(slider).toHaveAttribute('aria-valuemax', '10');
  });
});
