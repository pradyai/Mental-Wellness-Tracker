import { MoodChart } from '../components/MoodChart';
import type { CheckIn } from '../types';

interface InsightsProps {
  name: string;
  examType: string;
  checkIns: CheckIn[];
  message: string;
  isLoading: boolean;
  error: string | null;
  showAiPanel: boolean;
  onNewCheckIn: () => void;
}

function calcStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;
  const days = [...new Set(checkIns.map((c) => c.timestamp.slice(0, 10)))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    prev.setDate(prev.getDate() - 1);
    if (days[i] === prev.toISOString().slice(0, 10)) streak++;
    else break;
  }
  return streak;
}

function topTriggers(checkIns: CheckIn[]): [string, number][] {
  const freq: Record<string, number> = {};
  for (const c of checkIns) {
    for (const t of c.triggers) freq[t] = (freq[t] ?? 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
}

export function Insights({
  name,
  examType,
  checkIns,
  message,
  isLoading,
  error,
  showAiPanel,
  onNewCheckIn,
}: InsightsProps) {
  const latest = checkIns[checkIns.length - 1];
  const streak = calcStreak(checkIns);
  const avgMood = checkIns.length > 0
    ? (checkIns.reduce((s, c) => s + c.mood, 0) / checkIns.length).toFixed(1)
    : '—';
  const triggers = topTriggers(checkIns);
  const maxTriggerCount = triggers[0]?.[1] ?? 1;

  return (
    <main className="screen screen--insights">
      <header className="screen-header">
        <div>
          <h2>Session Insights</h2>
          <p className="text-muted">{name} · {examType} · {checkIns.length} check-in{checkIns.length !== 1 ? 's' : ''}</p>
        </div>
      </header>

      <section className="card" aria-label="Summary statistics">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{streak}</div>
            <div className="stat-label">Day streak 🔥</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{avgMood}</div>
            <div className="stat-label">Avg mood</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{checkIns.length}</div>
            <div className="stat-label">Check-ins</div>
          </div>
        </div>
      </section>

      {checkIns.length > 1 && (
        <section className="card" aria-labelledby="chart-heading">
          <h3 id="chart-heading">Mood Over Time</h3>
          <MoodChart checkIns={checkIns} />
        </section>
      )}

      {checkIns.length === 1 && latest && (
        <section className="card mood-single">
          <p className="text-muted">Latest mood</p>
          <p className="mood-big">{latest.mood}<span>/10</span></p>
        </section>
      )}

      {triggers.length > 0 && (
        <section className="card" aria-labelledby="triggers-heading">
          <h3 id="triggers-heading">Top Stress Triggers</h3>
          <ul className="trigger-freq-list" aria-label="Stress trigger frequency">
            {triggers.map(([name, count]) => (
              <li key={name} className="trigger-freq-item">
                <span className="trigger-freq-name">{name}</span>
                <div className="trigger-freq-bar-wrap" aria-hidden="true">
                  <div
                    className="trigger-freq-bar"
                    style={{ '--bar-pct': `${(count / maxTriggerCount) * 100}%` } as React.CSSProperties}
                  />
                </div>
                <span className="trigger-freq-count" aria-label={`${count} times`}>{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showAiPanel && (
        <section className="card insight-card" aria-labelledby="insight-heading" aria-live="polite">
          <h3 id="insight-heading">Your Wellness Message</h3>
          {isLoading && (
            <div className="loading" role="status" aria-label="Generating your message">
              <span className="spinner" aria-hidden="true" />
              <p>Generating your personalised message...</p>
            </div>
          )}
          {error && (
            <p className="error-text" role="alert">{error}</p>
          )}
          {message && !isLoading && (
            <p className="insight-message">{message}</p>
          )}
        </section>
      )}

      <button type="button" className="btn btn--primary" onClick={onNewCheckIn}>
        New Check-in
      </button>
    </main>
  );
}
