import { useState } from 'react';
import { Setup } from './screens/Setup';
import { CheckIn } from './screens/CheckIn';
import { Insights } from './screens/Insights';
import { getInsight } from './api';
import type { Screen, SessionState, CheckIn as CheckInData } from './types';

const PREFS_KEY = 'mindspace_prefs';

function checkInsKey(name: string): string {
  return `mindspace_${name.toLowerCase().trim()}`;
}

function loadCheckIns(name: string): CheckInData[] {
  try {
    const raw = localStorage.getItem(checkInsKey(name));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCheckIns(name: string, checkIns: CheckInData[]): void {
  localStorage.setItem(checkInsKey(name), JSON.stringify(checkIns));
}

function savePrefs(name: string, examType: string): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify({ name, examType }));
}

export function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [session, setSession] = useState<SessionState | null>(null);
  const [insightMessage, setInsightMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  function handleStart(name: string, examType: string, apiKey: string, model: string) {
    savePrefs(name, examType);
    const stored = loadCheckIns(name);
    setSession({ name, examType, apiKey, model, checkIns: stored });
    setInsightMessage('');
    setError(null);
    setShowAiPanel(false);
    setScreen('checkin');
  }

  async function handleCheckIn(data: CheckInData, requestInsight: boolean) {
    if (!session) return;

    const updatedCheckIns = [...session.checkIns, data];
    const updatedSession = { ...session, checkIns: updatedCheckIns };
    setSession(updatedSession);
    saveCheckIns(session.name, updatedCheckIns);

    if (!requestInsight) {
      setScreen('checkin');
      return;
    }

    setInsightMessage('');
    setError(null);
    setIsLoading(true);
    setShowAiPanel(true);
    setScreen('insights');

    try {
      const message = await getInsight(
        session.apiKey,
        session.name,
        session.examType,
        session.model,
        updatedCheckIns
      );
      setInsightMessage(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleViewHistory() {
    setInsightMessage('');
    setError(null);
    setIsLoading(false);
    setShowAiPanel(false);
    setScreen('insights');
  }

  function handleNewCheckIn() {
    setScreen('checkin');
  }

  return (
    <div className="app">
      {screen === 'setup' && <Setup onStart={handleStart} />}

      {screen === 'checkin' && session && (
        <CheckIn
          name={session.name}
          checkInNumber={session.checkIns.length + 1}
          hasHistory={session.checkIns.length > 0}
          onSubmit={handleCheckIn}
          onViewHistory={handleViewHistory}
        />
      )}

      {screen === 'insights' && session && (
        <Insights
          name={session.name}
          examType={session.examType}
          checkIns={session.checkIns}
          message={insightMessage}
          isLoading={isLoading}
          error={error}
          showAiPanel={showAiPanel}
          onNewCheckIn={handleNewCheckIn}
        />
      )}
    </div>
  );
}

export default App;
