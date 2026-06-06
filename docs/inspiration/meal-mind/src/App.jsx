import { useState, useEffect, useCallback } from 'react';
import WizardStep1 from './components/WizardStep1_Activity';
import WizardStep2 from './components/WizardStep2_Diet';
import WizardStep3 from './components/WizardStep3_Budget';
import WizardStep4 from './components/WizardStep4_Generate';
import MealCard from './components/MealCard';
import GroceryList from './components/GroceryList';
import NutritionDashboard from './components/NutritionDashboard';
import BudgetPanel from './components/BudgetPanel';
import { generateMealPlan, fetchAvailableModels, DEFAULT_MODEL } from './services/geminiService';

const STEPS = [
  { id: 1, label: 'Activity' },
  { id: 2, label: 'Diet' },
  { id: 3, label: 'Budget' },
  { id: 4, label: 'Generate' },
];

const API_KEY_STORAGE = 'mealmind_gemini_key';

function ApiKeyModal({ onSave }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!key.trim()) {
      setError('Please enter your API key');
      return;
    }
    localStorage.setItem(API_KEY_STORAGE, key.trim());
    onSave(key.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-title">🔑 Gemini API Key</div>
        <p className="modal-desc">
          MealMind uses Google&apos;s Gemini 2.0 Flash to generate your personalized meal plans.
          Your key is stored locally and never shared.
        </p>
        <div className="modal-input-group">
          <label htmlFor="api-key-input">API Key</label>
          <input
            id="api-key-input"
            type="password"
            className="text-input"
            placeholder="Enter your Gemini API key..."
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          {error && <div className="error-text">{error}</div>}
        </div>
        <a
          className="modal-link"
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', marginBottom: 'var(--space-lg)' }}
        >
          Get a free API key from Google AI Studio →
        </a>
        <button id="save-api-key" className="btn btn-primary" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
          Save & Continue
        </button>
      </div>
    </div>
  );
}

function LoadingScreen({ model, models }) {
  const modelLabel = models.find(m => m.id === model)?.label || model;
  return (
    <div className="loading-container">
      <div className="loading-food-icons">
        <span>🥘</span>
        <span>🥗</span>
        <span>🍛</span>
        <span>🥙</span>
        <span>🍲</span>
      </div>
      <div className="loading-text">Crafting your perfect meal plan...</div>
      <div className="loading-subtext">Using {modelLabel} · Analyzing nutrition, budget &amp; substitutions</div>
    </div>
  );
}

function QuotaErrorPanel({ error, errorType, retryAfter, selectedModel, models, onModelChange, onRetry }) {
  const [countdown, setCountdown] = useState(retryAfter);

  useEffect(() => {
    if (!retryAfter) return;
    setCountdown(retryAfter);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [retryAfter]);

  return (
    <div style={{
      background: 'rgba(244, 63, 94, 0.06)',
      border: '1px solid rgba(244, 63, 94, 0.25)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-xl)',
      marginTop: 'var(--space-lg)',
    }}>
      <div style={{ color: 'var(--accent-rose)', fontWeight: 600, marginBottom: 'var(--space-sm)', fontSize: '0.95rem' }}>
        {errorType === 'quota_exhausted' ? '📵 Quota Exhausted' : '⏳ Rate Limited'}
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 'var(--space-lg)', lineHeight: 1.6 }}>
        {error}
      </div>

      {errorType === 'quota_exhausted' && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)', fontWeight: 500 }}>
            TRY A DIFFERENT MODEL
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            {models.map(m => (
              <button
                key={m.id}
                id={`model-${m.id}`}
                onClick={() => onModelChange(m.id)}
                className={`chip ${selectedModel === m.id ? 'selected' : ''}`}
                type="button"
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {errorType === 'rate_limit' && countdown > 0 && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-lg)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-heading)' }}>
            {countdown}s
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Retry available in...</div>
        </div>
      )}

      <button
        id="retry-btn"
        className="btn btn-primary"
        onClick={onRetry}
        disabled={errorType === 'rate_limit' && countdown > 0}
        style={{ width: '100%', justifyContent: 'center' }}
        type="button"
      >
        {errorType === 'rate_limit' && countdown > 0
          ? `⏳ Wait ${countdown}s...`
          : '🔄 Try Again'}
      </button>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(1);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null); // { message, errorType, retryAfter }
  const [result, setResult] = useState(null);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [models, setModels] = useState([
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' }
  ]);

  const [formData, setFormData] = useState({
    activityLevel: '',
    dayDescription: '',
    dietaryPreferences: [],
    cuisine: 'Indian (Mixed)',
    allergies: '',
    budget: 500,
    people: 1,
  });

  const loadModels = useCallback(async (key) => {
    if (!key) return;
    const result = await fetchAvailableModels(key);
    if (result.success && result.models.length > 0) {
      setModels(result.models);
      setSelectedModel(prev => {
        if (result.models.some(m => m.id === prev)) {
          return prev;
        }
        const defaultAvailable = result.models.find(m => m.id === DEFAULT_MODEL);
        return defaultAvailable ? DEFAULT_MODEL : result.models[0].id;
      });
    }
  }, []);

  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE);
    if (savedKey) {
      setApiKey(savedKey);
      loadModels(savedKey);
    } else {
      setShowApiModal(true);
    }
  }, [loadModels]);

  const handleApiKeySave = (key) => {
    setApiKey(key);
    setShowApiModal(false);
    loadModels(key);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.activityLevel;
      case 2: return true; // diet is optional
      case 3: return true;
      default: return true;
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
      setShowApiModal(true);
      return;
    }

    setIsLoading(true);
    setErrorInfo(null);
    setStep(5); // loading state

    const response = await generateMealPlan(apiKey, formData, selectedModel);

    if (response.success) {
      setResult(response.data);
      setStep(6); // results
    } else {
      setErrorInfo({
        message: response.error,
        errorType: response.errorType || 'generic',
        retryAfter: response.retryAfter || null,
      });
      setStep(4); // back to generate step
    }

    setIsLoading(false);
  }, [apiKey, formData, selectedModel]);

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setErrorInfo(null);
    setFormData({
      activityLevel: '',
      dayDescription: '',
      dietaryPreferences: [],
      cuisine: 'Indian (Mixed)',
      allergies: '',
      budget: 500,
      people: 1,
    });
  };

  const handleChangeKey = () => {
    setShowApiModal(true);
  };

  return (
    <div className="app-container">
      {showApiModal && <ApiKeyModal onSave={handleApiKeySave} />}

      {/* Header */}
      <header className="app-header">
        <h1 className="app-logo">
          <span className="logo-icon">🍽️</span>
          MealMind
        </h1>
        <p className="app-tagline">AI-Powered Personal Cooking Planner</p>
      </header>

      {/* Progress Bar (only during wizard) */}
      {step <= 4 && (
        <div className="progress-bar-container">
          {STEPS.map((s, i) => (
            <div key={s.id} className="progress-step">
              <div className="progress-step-wrapper">
                <div className={`progress-dot ${step === s.id ? 'active' : step > s.id ? 'completed' : ''}`}>
                  {step > s.id ? '✓' : s.id}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`progress-line ${step > s.id ? 'active' : ''}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Wizard Steps */}
      {step === 1 && (
        <WizardStep1 data={formData} onChange={setFormData} />
      )}
      {step === 2 && (
        <WizardStep2 data={formData} onChange={setFormData} />
      )}
      {step === 3 && (
        <WizardStep3 data={formData} onChange={setFormData} />
      )}
      {step === 4 && (
        <WizardStep4
          data={formData}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />
      )}

      {/* Loading */}
      {step === 5 && <LoadingScreen model={selectedModel} models={models} />}

      {/* Error */}
      {errorInfo && step === 4 && (
        <QuotaErrorPanel
          error={errorInfo.message}
          errorType={errorInfo.errorType}
          retryAfter={errorInfo.retryAfter}
          selectedModel={selectedModel}
          models={models}
          onModelChange={(m) => { setSelectedModel(m); setErrorInfo(null); }}
          onRetry={handleGenerate}
        />
      )}

      {/* Results */}
      {step === 6 && result && (
        <div className="results-container">
          <div className="results-header">
            <h1 className="results-title">Your Meal Plan is Ready! 🎉</h1>
            <p className="results-subtitle">Personalized just for you</p>
          </div>

          {/* Meal Cards */}
          <div className="meals-grid">
            {['breakfast', 'lunch', 'dinner', 'snacks'].map((type) =>
              result.meals?.[type] ? (
                <MealCard
                  key={type}
                  mealType={type}
                  meal={result.meals[type]}
                  substitutions={result.substitutions}
                />
              ) : null
            )}
          </div>

          {/* Nutrition */}
          <NutritionDashboard nutrition={result.nutrition} />

          {/* Budget */}
          <BudgetPanel budget={result.budget} userBudget={formData.budget} />

          {/* Grocery */}
          <GroceryList groceryList={result.groceryList} />

          {/* Global Substitutions */}
          {result.substitutions && result.substitutions.length > 0 && (
            <div className="grocery-section">
              <h2 className="section-title">🔄 All Substitutions</h2>
              <div className="glass-card">
                {result.substitutions.map((s, i) => (
                  <div key={i} className="sub-item" style={{ padding: '6px 0' }}>
                    <span style={{ fontWeight: 500 }}>{s.original}</span>
                    <span className="sub-arrow">→</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>{s.substitute}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      {s.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset */}
          <div className="reset-section">
            <button className="btn btn-primary" onClick={handleReset} id="new-plan-btn">
              🔄 Plan Another Day
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      {step >= 1 && step <= 4 && (
        <div className="wizard-nav">
          {step > 1 ? (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)} id="back-btn">
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 && (
            <button
              className="btn btn-primary"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              id="next-btn"
            >
              Next →
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      {apiKey && !showApiModal && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-xl) 0',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginTop: 'var(--space-2xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-lg)',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Model:</span>
            <select
              id="model-select-footer"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--bg-glass-border)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                padding: '4px 12px',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {models.map(m => (
                <option key={m.id} value={m.id} style={{ background: 'var(--bg-secondary)' }}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleChangeKey}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            🔑 Change API Key
          </button>
        </div>
      )}
    </div>
  );
}
