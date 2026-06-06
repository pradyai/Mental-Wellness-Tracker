import { useState } from 'react';

export default function GroceryList({ groceryList }) {
  const [checkedItems, setCheckedItems] = useState({});

  if (!groceryList) return null;

  const toggleCheck = (category, index) => {
    const key = `${category}-${index}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleKeyDown = (e, category, index) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleCheck(category, index);
    }
  };

  const categories = Object.entries(groceryList).filter(
    ([, items]) => Array.isArray(items) && items.length > 0
  );

  if (categories.length === 0) return null;

  return (
    <div className="grocery-section">
      <h2 className="section-title">🛒 Grocery List</h2>

      {categories.map(([category, items]) => (
        <div key={category} className="grocery-category">
          <div className="category-name">{category}</div>
          {items.map((item, i) => {
            const key = `${category}-${i}`;
            const isChecked = !!checkedItems[key];
            return (
              <div
                key={key}
                className="grocery-item"
                onClick={() => toggleCheck(category, i)}
                onKeyDown={(e) => handleKeyDown(e, category, i)}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
              >
                <div className={`grocery-checkbox ${isChecked ? 'checked' : ''}`}>
                  {isChecked && '✓'}
                </div>
                <span className={`grocery-item-name ${isChecked ? 'checked-text' : ''}`}>
                  {item.name}
                </span>
                <span className="grocery-item-qty">{item.quantity}</span>
                <span className="grocery-item-price">₹{item.estimatedPrice}</span>
                {item.substitution && (
                  <span className="grocery-sub-badge">↔ {item.substitution}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
