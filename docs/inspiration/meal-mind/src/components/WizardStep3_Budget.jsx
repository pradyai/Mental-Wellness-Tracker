const presets = [
  { label: '🎓 Student', value: 200 },
  { label: '💼 Working Pro', value: 500 },
  { label: '👨‍👩‍👧‍👦 Family of 4', value: 1200 },
];

export default function WizardStep3({ data, onChange }) {
  const budget = data.budget || 500;
  const people = data.people || 1;

  return (
    <div className="wizard-content">
      <h2 className="step-title">💰 Budget</h2>
      <p className="step-subtitle">Set your daily food budget and number of people</p>

      <div className="budget-slider-container">
        <div className="budget-display">
          <div className="budget-amount">₹{budget}</div>
          <div className="budget-label">Daily Food Budget</div>
        </div>

        <input
          id="budget-slider"
          type="range"
          className="budget-slider"
          min="100"
          max="2000"
          step="50"
          value={budget}
          onChange={(e) => onChange({ ...data, budget: parseInt(e.target.value) })}
        />

        <div className="budget-presets">
          {presets.map((p) => (
            <button
              key={p.value}
              className={`preset-btn ${budget === p.value ? 'active' : ''}`}
              onClick={() => onChange({ ...data, budget: p.value })}
              type="button"
            >
              {p.label} (₹{p.value})
            </button>
          ))}
        </div>
      </div>

      <div className="day-input-group">
        <label>Number of People</label>
        <div className="people-selector">
          <button
            id="people-minus"
            className="people-btn"
            onClick={() => onChange({ ...data, people: Math.max(1, people - 1) })}
            type="button"
            aria-label="Decrease number of people"
          >
            −
          </button>
          <div className="people-count">{people} 🧑</div>
          <button
            id="people-plus"
            className="people-btn"
            onClick={() => onChange({ ...data, people: Math.min(10, people + 1) })}
            type="button"
            aria-label="Increase number of people"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
