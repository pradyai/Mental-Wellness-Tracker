import { useState } from 'react';
import { MoodSlider } from '../components/MoodSlider';
import { TriggerSelector } from '../components/TriggerSelector';
import type { CheckIn as CheckInData } from '../types';

interface CheckInProps {
  name: string;
  checkInNumber: number;
  hasHistory: boolean;
  onSubmit: (data: CheckInData, requestInsight: boolean) => void;
  onViewHistory: () => void;
}

export function CheckIn({ name, checkInNumber, hasHistory, onSubmit, onViewHistory }: CheckInProps) {
  const [mood, setMood] = useState(5);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [reflection, setReflection] = useState('');

  function buildCheckIn(): CheckInData {
    return { mood, triggers, reflection: reflection.trim(), timestamp: new Date().toISOString() };
  }

  return (
    <main className="screen screen--checkin">
      <header className="screen-header">
        <div>
          <h2>Hi, {name} 👋</h2>
          <p className="text-muted">Check-in #{checkInNumber}</p>
        </div>
      </header>

      <section className="card" aria-labelledby="mood-heading">
        <h3 id="mood-heading">How are you feeling right now?</h3>
        <MoodSlider value={mood} onChange={setMood} />
      </section>

      <section className="card" aria-labelledby="triggers-heading">
        <h3 id="triggers-heading">What's weighing on you? <span className="text-muted">(optional)</span></h3>
        <TriggerSelector selected={triggers} onChange={setTriggers} />
      </section>

      <section className="card" aria-labelledby="reflection-heading">
        <h3 id="reflection-heading">Anything else on your mind? <span className="text-muted">(optional)</span></h3>
        <textarea
          id="reflection"
          aria-labelledby="reflection-heading"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Write freely — this stays private to your session..."
          rows={3}
        />
      </section>

      <div className="action-row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => onSubmit(buildCheckIn(), true)}
        >
          Get Insights
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => onSubmit(buildCheckIn(), false)}
        >
          Just Log It
        </button>
      </div>

      {hasHistory && (
        <button
          className="view-history-link"
          onClick={onViewHistory}
          type="button"
        >
          View mood history
        </button>
      )}
    </main>
  );
}
