export default function BudgetPanel({ budget, userBudget }) {
  if (!budget) return null;

  const { breakfast = 0, lunch = 0, dinner = 0, snacks = 0, total = 0, feasibility, savingsTips } = budget;
  const maxMealCost = Math.max(breakfast, lunch, dinner, snacks, 1);

  const feasibilityConfig = {
    within: { label: '✅ Within Budget', className: 'within' },
    'slightly-over': { label: '⚠️ Slightly Over', className: 'slightly-over' },
    over: { label: '❌ Over Budget', className: 'over' },
  };

  const fConfig = feasibilityConfig[feasibility] || feasibilityConfig.within;

  const meals = [
    { label: 'Breakfast', cost: breakfast, type: 'breakfast' },
    { label: 'Lunch', cost: lunch, type: 'lunch' },
    { label: 'Dinner', cost: dinner, type: 'dinner' },
    { label: 'Snacks', cost: snacks, type: 'snacks' },
  ];

  return (
    <div className="budget-section">
      <h2 className="section-title">💰 Budget Analysis</h2>

      <div className="budget-overview">
        <div className="budget-total">
          <div className="budget-total-amount" style={{
            color: feasibility === 'within' ? 'var(--accent-emerald)' :
                   feasibility === 'slightly-over' ? 'var(--accent-amber)' : 'var(--accent-rose)'
          }}>
            ₹{total}
          </div>
          <div className="budget-total-label">Estimated Daily Cost</div>
        </div>

        <div>
          <div className="budget-total" style={{ marginBottom: '8px' }}>
            <div className="budget-total-amount" style={{ fontSize: '1.5rem' }}>₹{userBudget || '—'}</div>
            <div className="budget-total-label">Your Budget</div>
          </div>
        </div>

        <div className={`budget-feasibility ${fConfig.className}`}>
          {fConfig.label}
        </div>
      </div>

      <div className="budget-bars">
        {meals.map((m) => (
          <div key={m.type} className="budget-bar-item">
            <span className="budget-bar-label">{m.label}</span>
            <div className="budget-bar-track">
              <div
                className={`budget-bar-fill ${m.type}`}
                style={{ width: `${(m.cost / maxMealCost) * 100}%` }}
              />
            </div>
            <span className="budget-bar-amount">₹{m.cost}</span>
          </div>
        ))}
      </div>

      {savingsTips && savingsTips.length > 0 && (
        <div className="savings-tips">
          <div className="savings-tips-title">💡 Savings Tips</div>
          {savingsTips.map((tip, i) => (
            <div key={i} className="savings-tip">
              <span>•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
