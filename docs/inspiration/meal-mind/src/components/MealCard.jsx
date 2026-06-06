import { useState } from 'react';

const mealTypeConfig = {
  breakfast: { icon: '🌅', label: 'Breakfast' },
  lunch: { icon: '☀️', label: 'Lunch' },
  dinner: { icon: '🌙', label: 'Dinner' },
  snacks: { icon: '🍿', label: 'Snacks' },
};

export default function MealCard({ mealType, meal, substitutions }) {
  const [expanded, setExpanded] = useState(false);
  const config = mealTypeConfig[mealType] || { icon: '🍽️', label: mealType };

  if (!meal) return null;

  const mealSubs = (substitutions || []).filter((s) =>
    (meal.ingredients || []).some(
      (ing) => ing.toLowerCase().includes(s.original.toLowerCase())
    )
  );

  return (
    <div className="meal-card">
      <div className="meal-card-header">
        <span className={`meal-type-badge ${mealType}`}>
          {config.icon} {config.label}
        </span>
        <span className="meal-calories">{meal.calories || 0} kcal</span>
      </div>

      <h3 className="meal-name">{meal.name}</h3>
      <div className="meal-prep-time">⏱️ {meal.prepTime || 'N/A'}</div>

      <div className="meal-ingredients">
        {(meal.ingredients || []).map((ing, i) => (
          <span key={i} className="ingredient-tag">{ing}</span>
        ))}
      </div>

      {meal.macros && (
        <div className="macros-bar">
          <div className="macro-item protein">
            <div className="macro-value">{meal.macros.protein}g</div>
            <div className="macro-label">Protein</div>
          </div>
          <div className="macro-item carbs">
            <div className="macro-value">{meal.macros.carbs}g</div>
            <div className="macro-label">Carbs</div>
          </div>
          <div className="macro-item fat">
            <div className="macro-value">{meal.macros.fat}g</div>
            <div className="macro-label">Fat</div>
          </div>
          {meal.macros.fiber && (
            <div className="macro-item fiber">
              <div className="macro-value">{meal.macros.fiber}g</div>
              <div className="macro-label">Fiber</div>
            </div>
          )}
        </div>
      )}

      <button
        className="expandable-toggle"
        onClick={() => setExpanded(!expanded)}
        type="button"
        aria-expanded={expanded}
        aria-controls={`recipe-content-${mealType}`}
      >
        {expanded ? '▾ Hide Details' : '▸ Recipe & Substitutions'}
      </button>

      <div id={`recipe-content-${mealType}`} className={`expandable-content ${expanded ? 'open' : ''}`}>
        {meal.recipe && (
          <div className="recipe-text">{meal.recipe}</div>
        )}
        {mealSubs.length > 0 && (
          <div className="substitutions-list">
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-emerald)', marginBottom: '4px' }}>
              💡 Substitutions
            </div>
            {mealSubs.map((s, i) => (
              <div key={i} className="sub-item">
                <span>{s.original}</span>
                <span className="sub-arrow">→</span>
                <span>{s.substitute}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({s.reason})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
