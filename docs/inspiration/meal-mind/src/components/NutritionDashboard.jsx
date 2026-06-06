const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 34; // r=34

function NutritionRing({ value, max, label, unit, color, recommended }) {
  const percentage = Math.min((value / max) * 100, 100);
  const dashOffset = CIRCLE_CIRCUMFERENCE - (percentage / 100) * CIRCLE_CIRCUMFERENCE;

  return (
    <div className="nutrition-ring-card">
      <div className="ring-container">
        <svg viewBox="0 0 80 80">
          <circle className="ring-bg" cx="40" cy="40" r="34" />
          <circle
            className="ring-progress"
            cx="40"
            cy="40"
            r="34"
            stroke={color}
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="ring-value" style={{ color }}>
          {value}{unit}
        </div>
      </div>
      <div className="ring-label">{label}</div>
      {recommended && (
        <div className="ring-recommended">/ {recommended}{unit} RDA</div>
      )}
    </div>
  );
}

const microIcons = {
  iron: '🔴',
  calcium: '🦴',
  vitaminC: '🍊',
  vitaminB12: '💊',
  vitaminD: '☀️',
  zinc: '⚡',
};

const microLabels = {
  iron: 'Iron',
  calcium: 'Calcium',
  vitaminC: 'Vitamin C',
  vitaminB12: 'Vitamin B12',
  vitaminD: 'Vitamin D',
  zinc: 'Zinc',
};

export default function NutritionDashboard({ nutrition }) {
  if (!nutrition) return null;

  const { dailyCalories, dailyMacros, micros } = nutrition;

  return (
    <div className="nutrition-section">
      <h2 className="section-title">📊 Nutrition Dashboard</h2>

      <div className="nutrition-grid">
        <NutritionRing
          value={dailyCalories || 0}
          max={2500}
          label="Calories"
          unit=" kcal"
          color="#f59e0b"
          recommended={2500}
        />
        {dailyMacros && (
          <>
            <NutritionRing
              value={dailyMacros.protein || 0}
              max={100}
              label="Protein"
              unit="g"
              color="#06b6d4"
              recommended={100}
            />
            <NutritionRing
              value={dailyMacros.carbs || 0}
              max={325}
              label="Carbs"
              unit="g"
              color="#f59e0b"
              recommended={325}
            />
            <NutritionRing
              value={dailyMacros.fat || 0}
              max={80}
              label="Fat"
              unit="g"
              color="#f43f5e"
              recommended={80}
            />
            <NutritionRing
              value={dailyMacros.fiber || 0}
              max={38}
              label="Fiber"
              unit="g"
              color="#10b981"
              recommended={38}
            />
          </>
        )}
      </div>

      {micros && Object.keys(micros).length > 0 && (
        <>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', fontWeight: 500 }}>
            Micronutrients
          </h3>
          <div className="micro-badges">
            {Object.entries(micros).map(([key, data]) => (
              <div key={key} className="micro-badge">
                <span className="micro-badge-icon">{microIcons[key] || '💎'}</span>
                <span className="micro-badge-value">{data.value}{data.unit}</span>
                <span className="micro-badge-name">{microLabels[key] || key}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  / {data.rda}{data.unit}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
