interface MoodSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const MOOD_EMOJI: Record<number, string> = {
  1: '😔', 2: '😟', 3: '😕', 4: '😐', 5: '😶',
  6: '🙂', 7: '😊', 8: '😄', 9: '😁', 10: '🤩',
};

function moodColor(mood: number): string {
  if (mood <= 3) return '#e53e3e';
  if (mood <= 6) return '#d69e2e';
  return '#38a169';
}

export function MoodSlider({ value, onChange }: MoodSliderProps) {
  return (
    <div className="mood-slider">
      <div className="mood-display">
        <span className="mood-emoji" aria-hidden="true">{MOOD_EMOJI[value]}</span>
        <span className="mood-number" style={{ color: moodColor(value) }}>{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`Mood rating: ${value} out of 10`}
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={value}
        style={{ '--thumb-color': moodColor(value) } as React.CSSProperties}
      />
      <div className="mood-labels" aria-hidden="true">
        <span>Very Low</span>
        <span>Neutral</span>
        <span>Great</span>
      </div>
    </div>
  );
}
