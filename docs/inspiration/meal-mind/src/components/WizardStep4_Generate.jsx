const activityLabels = {
  sedentary: '🪑 Sedentary',
  light: '🚶 Light',
  moderate: '🏃 Moderate',
  active: '💪 Active',
  'very-active': '🔥 Very Active',
};

export default function WizardStep4({ data, onGenerate, isLoading }) {
  return (
    <div className="wizard-content">
      <h2 className="step-title">✨ Review & Generate</h2>
      <p className="step-subtitle">Verify your preferences and generate your personalized meal plan</p>

      <div className="review-grid">
        <div className="review-item">
          <div className="review-label">Activity Level</div>
          <div className="review-value">{activityLabels[data.activityLevel] || '—'}</div>
        </div>
        <div className="review-item">
          <div className="review-label">Diet</div>
          <div className="review-value">
            {data.dietaryPreferences?.length
              ? data.dietaryPreferences.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
              : 'No preference'}
          </div>
        </div>
        <div className="review-item">
          <div className="review-label">Cuisine</div>
          <div className="review-value">{data.cuisine || 'Indian (Mixed)'}</div>
        </div>
        <div className="review-item">
          <div className="review-label">Budget</div>
          <div className="review-value">₹{data.budget || 500} / day</div>
        </div>
        <div className="review-item">
          <div className="review-label">People</div>
          <div className="review-value">{data.people || 1} person(s)</div>
        </div>
        {data.allergies && (
          <div className="review-item">
            <div className="review-label">Allergies</div>
            <div className="review-value">{data.allergies}</div>
          </div>
        )}
      </div>

      {data.dayDescription && (
        <div className="review-item" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="review-label">Day Description</div>
          <div className="review-value" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {data.dayDescription}
          </div>
        </div>
      )}

      <button
        id="generate-btn"
        className="btn btn-generate"
        onClick={onGenerate}
        disabled={isLoading}
        type="button"
      >
        {isLoading ? (
          <>⏳ Generating...</>
        ) : (
          <>🍳 Generate My Meal Plan</>
        )}
      </button>
    </div>
  );
}
