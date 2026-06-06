import { useState, useMemo, type FormEvent } from 'react';
import { EXAM_TYPES } from '../types';
import { listModels, type ModelOption } from '../api';

interface SetupProps {
  onStart: (name: string, examType: string, apiKey: string, model: string) => void;
}

function loadPrefs(): { name: string; examType: string } | null {
  try {
    const raw = localStorage.getItem('mindspace_prefs');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function Setup({ onStart }: SetupProps) {
  const prefs = useMemo(loadPrefs, []);

  const [name, setName] = useState(prefs?.name ?? '');
  const [examType, setExamType] = useState<typeof EXAM_TYPES[number]>(
    (prefs?.examType as typeof EXAM_TYPES[number]) ?? EXAM_TYPES[0]
  );
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<ModelOption[]>([]);
  const [model, setModel] = useState('');
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState('');

  async function fetchModels(key: string) {
    if (!key.trim()) return;
    setModelsLoading(true);
    setModelsError('');
    setModels([]);
    setModel('');
    try {
      const result = await listModels(key.trim());
      setModels(result);
      if (result.length > 0) setModel(result[0].id);
    } catch (err) {
      setModelsError(err instanceof Error ? err.message : 'Could not fetch models');
    } finally {
      setModelsLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim() && apiKey.trim() && model) {
      onStart(name.trim(), examType, apiKey.trim(), model);
    }
  }

  const canSubmit = name.trim() && apiKey.trim() && model && !modelsLoading;

  return (
    <main className="screen screen--setup">
      <div className="setup-hero">
        <h1 className="app-title">MindSpace</h1>
        <p className="app-tagline">Your wellness companion through exam season</p>
      </div>

      <form className="card setup-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Arjun"
            required
            autoComplete="given-name"
            autoFocus={!prefs?.name}
          />
        </div>

        <div className="field">
          <label htmlFor="exam-type">Exam you're preparing for</label>
          <select
            id="exam-type"
            value={examType}
            onChange={(e) => setExamType(e.target.value as typeof EXAM_TYPES[number])}
          >
            {EXAM_TYPES.map((exam) => (
              <option key={exam} value={exam}>{exam}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="api-key">Gemini API key</label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setModels([]); setModel(''); setModelsError(''); }}
            onBlur={(e) => fetchModels(e.target.value)}
            placeholder="AIza..."
            required
            autoComplete="off"
          />
          <p className="field-hint">🔒 Never stored — lives only in this browser session</p>
        </div>

        <div className="field">
          <label htmlFor="model">
            Gemini model
            {modelsLoading && <span className="field-spinner" aria-label="Loading models" />}
          </label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={models.length === 0 || modelsLoading}
            aria-busy={modelsLoading}
          >
            {models.length === 0 && !modelsLoading && (
              <option value="">— enter API key to load —</option>
            )}
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          {modelsError && <p className="field-error" role="alert">{modelsError}</p>}
        </div>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={!canSubmit}
        >
          {prefs?.name ? 'Continue Tracking' : 'Start Tracking'}
        </button>
      </form>
    </main>
  );
}
