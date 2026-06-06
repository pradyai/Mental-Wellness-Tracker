const activities = [
  { id: 'sedentary', icon: '🪑', label: 'Sedentary', desc: 'Desk job, minimal movement' },
  { id: 'light', icon: '🚶', label: 'Light', desc: 'Walking, light chores' },
  { id: 'moderate', icon: '🏃', label: 'Moderate', desc: 'Regular exercise, active job' },
  { id: 'active', icon: '💪', label: 'Active', desc: 'Daily intense workouts' },
  { id: 'very-active', icon: '🔥', label: 'Very Active', desc: 'Athlete-level training' },
];

export default function WizardStep1({ data, onChange }) {
  const handleKeyDown = (e, id) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange({ ...data, activityLevel: id });
    }
  };

  return (
    <div className="wizard-content">
      <h2 className="step-title">🏃 About Your Day</h2>
      <p className="step-subtitle">Tell us about your activity level and what your day looks like</p>

      <div className="activity-grid" role="radiogroup" aria-label="Activity Level">
        {activities.map((a) => (
          <div
            key={a.id}
            id={`activity-${a.id}`}
            className={`activity-card ${data.activityLevel === a.id ? 'selected' : ''}`}
            onClick={() => onChange({ ...data, activityLevel: a.id })}
            onKeyDown={(e) => handleKeyDown(e, a.id)}
            role="radio"
            aria-checked={data.activityLevel === a.id}
            tabIndex={0}
          >
            <span className="card-icon">{a.icon}</span>
            <div className="card-label">{a.label}</div>
            <div className="card-desc">{a.desc}</div>
          </div>
        ))}
      </div>

      <div className="day-input-group">
        <label htmlFor="day-description">Describe your day (optional)</label>
        <textarea
          id="day-description"
          className="day-textarea"
          placeholder="e.g., Early morning yoga, office work 9-6, gym at 7pm, need energy for a late meeting..."
          value={data.dayDescription || ''}
          onChange={(e) => onChange({ ...data, dayDescription: e.target.value })}
        />
      </div>
    </div>
  );
}
