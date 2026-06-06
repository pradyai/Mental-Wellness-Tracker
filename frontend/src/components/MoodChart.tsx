import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { CheckIn } from '../types';

interface MoodChartProps {
  checkIns: CheckIn[];
}

function formatLabel(iso: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (iso.slice(0, 10) === today) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function MoodChart({ checkIns }: MoodChartProps) {
  const data = checkIns.map((c) => ({ label: formatLabel(c.timestamp), mood: c.mood }));

  return (
    <div className="chart-wrapper" role="img" aria-label="Mood history chart">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#718096' }} />
          <YAxis domain={[1, 10]} ticks={[1, 3, 5, 7, 10]} tick={{ fontSize: 12, fill: '#718096' }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
            formatter={(value) => [`${value}/10`, 'Mood']}
          />
          <ReferenceLine y={5} stroke="#d69e2e" strokeDasharray="4 2" opacity={0.5} />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#4a90d9"
            strokeWidth={2.5}
            dot={{ fill: '#4a90d9', r: 5, strokeWidth: 0 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
