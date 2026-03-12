import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { WeatherSummary } from '../../types/app';
import type { TempUnit } from '../../config/constants';
import { displayTemp } from '../../utils/temperatureUtils';

interface WeatherChartProps {
  summary: WeatherSummary;
  tempDomain: [number, number];
  tempUnit: TempUnit;
  label: string;
  delay?: number;
}

export function WeatherChart({ summary, tempDomain, tempUnit, label, delay = 0 }: WeatherChartProps) {
  // Join by hour value, not positional index, to avoid silent misalignment
  const precipByHour = new Map(summary.hourlyPrecipProb.map((h) => [h.hour, h.precipProb]));

  const data = summary.hourlyTemps.map((ht) => ({
    hour: formatHour(ht.hour),
    temp: displayTemp(ht.temp, tempUnit),
    precipProb: Math.round(precipByHour.get(ht.hour) ?? 0),
  }));

  const unitLabel = tempUnit === 'C' ? '°C' : '°F';

  return (
    <div
      className="glass-warm rounded-2xl p-4 sm:p-5 shadow-lg shadow-sand-300/20 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-sand-400 mb-3">
        {label} — Hourly
      </p>
      <div className="h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: '#9a8568' }}
              tickLine={false}
              axisLine={{ stroke: '#e8e0d4' }}
            />
            <YAxis
              yAxisId="temp"
              domain={tempDomain}
              tick={{ fontSize: 10, fill: '#9a8568' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}°`}
            />
            <YAxis
              yAxisId="precip"
              orientation="right"
              domain={[0, 100]}
              hide
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                padding: '8px 12px',
              }}
              formatter={(value, name) => {
                if (name === 'temp') return [`${value}${unitLabel}`, 'Temperature'];
                return [`${value}%`, 'Rain chance'];
              }}
              labelStyle={{ color: '#5e4f3c', fontWeight: 600, marginBottom: 4 }}
            />
            <Area
              yAxisId="precip"
              type="monotone"
              dataKey="precipProb"
              fill="#bfe3fe"
              fillOpacity={0.4}
              stroke="#60b8fa"
              strokeWidth={1.5}
              strokeOpacity={0.6}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              stroke="#ef7d33"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#ef7d33', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#ef7d33', strokeWidth: 2, stroke: '#fff' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full bg-ember-400" />
          <span className="text-[10px] font-medium text-sand-500">Temperature</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-sky-200/60 border border-sky-300/40" />
          <span className="text-[10px] font-medium text-sand-500">Rain chance</span>
        </div>
      </div>
    </div>
  );
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return '12a';
  if (hour === 12) return '12p';
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}
