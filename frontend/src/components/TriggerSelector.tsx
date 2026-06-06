import { STRESS_TRIGGERS } from '../types';

interface TriggerSelectorProps {
  selected: string[];
  onChange: (triggers: string[]) => void;
}

export function TriggerSelector({ selected, onChange }: TriggerSelectorProps) {
  function toggle(trigger: string) {
    onChange(
      selected.includes(trigger)
        ? selected.filter((t) => t !== trigger)
        : [...selected, trigger]
    );
  }

  return (
    <fieldset className="trigger-selector">
      <legend className="sr-only">Select stress triggers</legend>
      <div className="trigger-grid">
        {STRESS_TRIGGERS.map((trigger) => {
          const checked = selected.includes(trigger);
          return (
            <label key={trigger} className={`trigger-chip ${checked ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(trigger)}
                className="sr-only"
              />
              {trigger}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
