const dietOptions = [
  { id: 'vegetarian', label: '🥬 Vegetarian' },
  { id: 'vegan', label: '🌱 Vegan' },
  { id: 'non-vegetarian', label: '🍗 Non-Vegetarian' },
  { id: 'eggetarian', label: '🥚 Eggetarian' },
  { id: 'keto', label: '🥑 Keto' },
  { id: 'gluten-free', label: '🌾 Gluten-Free' },
];

const cuisineOptions = [
  'Indian (Mixed)',
  'North Indian',
  'South Indian',
  'Bengali',
  'Gujarati',
  'Punjabi',
  'Indo-Chinese',
  'Global / International',
  'Mediterranean',
];

export default function WizardStep2({ data, onChange }) {
  const toggleDiet = (id) => {
    const current = data.dietaryPreferences || [];
    const updated = current.includes(id)
      ? current.filter((d) => d !== id)
      : [...current, id];
    onChange({ ...data, dietaryPreferences: updated });
  };

  return (
    <div className="wizard-content">
      <h2 className="step-title">🥗 Diet & Cuisine</h2>
      <p className="step-subtitle">Select your dietary preferences and preferred cuisine</p>

      <div className="day-input-group">
        <label>Dietary Preferences</label>
        <div className="chip-group">
          {dietOptions.map((d) => (
            <button
              key={d.id}
              id={`diet-${d.id}`}
              className={`chip ${(data.dietaryPreferences || []).includes(d.id) ? 'selected' : ''}`}
              onClick={() => toggleDiet(d.id)}
              type="button"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="select-group">
        <label htmlFor="cuisine-select">Cuisine Preference</label>
        <select
          id="cuisine-select"
          className="custom-select"
          value={data.cuisine || 'Indian (Mixed)'}
          onChange={(e) => onChange({ ...data, cuisine: e.target.value })}
        >
          {cuisineOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="day-input-group">
        <label htmlFor="allergies-input">Allergies / Exclusions (optional)</label>
        <input
          id="allergies-input"
          type="text"
          className="text-input"
          placeholder="e.g., peanuts, shellfish, mushrooms..."
          value={data.allergies || ''}
          onChange={(e) => onChange({ ...data, allergies: e.target.value })}
        />
      </div>
    </div>
  );
}
