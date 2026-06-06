import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Setup } from './Setup';
import { listModels } from '../api';

vi.mock('../api', () => ({ listModels: vi.fn() }));
const mockListModels = vi.mocked(listModels);

beforeEach(() => {
  localStorage.clear();
  mockListModels.mockReset();
});

describe('Setup', () => {
  it('keeps submit disabled until name, key and model are all present', () => {
    render(<Setup onStart={vi.fn()} />);
    expect(screen.getByRole('button', { name: /start tracking/i })).toBeDisabled();
  });

  it('loads models when the API key field loses focus', async () => {
    mockListModels.mockResolvedValue([{ id: 'gemini-pro', label: 'Gemini Pro' }]);
    render(<Setup onStart={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/gemini api key/i), { target: { value: 'a-key' } });
    fireEvent.blur(screen.getByLabelText(/gemini api key/i));

    expect(await screen.findByRole('option', { name: 'Gemini Pro' })).toBeInTheDocument();
    expect(mockListModels).toHaveBeenCalledWith('a-key');
  });

  it('submits the trimmed inputs and chosen model', async () => {
    mockListModels.mockResolvedValue([{ id: 'gemini-pro', label: 'Gemini Pro' }]);
    const onStart = vi.fn();
    render(<Setup onStart={onStart} />);

    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: '  Arjun  ' } });
    fireEvent.change(screen.getByLabelText(/exam you/i), { target: { value: 'NEET' } });
    fireEvent.change(screen.getByLabelText(/gemini api key/i), { target: { value: '  a-key  ' } });
    fireEvent.blur(screen.getByLabelText(/gemini api key/i));

    await screen.findByRole('option', { name: 'Gemini Pro' });
    fireEvent.click(screen.getByRole('button', { name: /start tracking/i }));

    expect(onStart).toHaveBeenCalledWith('Arjun', 'NEET', 'a-key', 'gemini-pro');
  });

  it('shows an alert when model loading fails', async () => {
    mockListModels.mockRejectedValue(new Error('Invalid API key.'));
    render(<Setup onStart={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/gemini api key/i), { target: { value: 'bad' } });
    fireEvent.blur(screen.getByLabelText(/gemini api key/i));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid API key.')
    );
  });

  it('prefills the saved name and shows the returning-user label', () => {
    localStorage.setItem('mindspace_prefs', JSON.stringify({ name: 'Meera', examType: 'GATE' }));
    render(<Setup onStart={vi.fn()} />);

    expect(screen.getByLabelText(/your name/i)).toHaveValue('Meera');
    expect(screen.getByRole('button', { name: /continue tracking/i })).toBeInTheDocument();
  });
});
