import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { WeatherSummary } from '../../types/app';
import type { TempUnit, WindUnit } from '../../config/constants';
import { displayTemp, displayWindSpeed, windSpeedLabel } from '../../utils/temperatureUtils';

export type ChartMetric = 'temp' | 'rain' | 'wind';

interface WeatherChartProps {
  summary: WeatherSummary;
  metric: ChartMetric;
  label: string;
  /** Synchronized domain for temp charts — ensures honest visual comparison */
  tempDomain?: [number, number];
  /** Synchronized domain for wind charts */
  windDomain?: [number, number];
  tempUnit?: TempUnit;
  windUnit?: WindUnit;
  delay?: number;
}

export function WeatherChart({
  summary,
  metric,
  label,
  tempDomain,
  windDomain,
  tempUnit = 'F',
  windUnit = 'mph',
  delay = 0,
}: WeatherChartProps) {
  const chartData = buildChartData(summary, metric, tempUnit, windUnit);
  const { dataKey, color, yDomain, yTicks, tickFormatter, tooltipFormatter, legend } = getMetricConfig(
    metric,
    tempUnit,
    windUnit,
    tempDomain,
    windDomain,
  );

  return (
    <div
      className="glass-warm rounded-2xl p-4 sm:p-5 shadow-lg shadow-sand-300/20 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-sand-400 mb-3">{label}</p>
      <div className="h-40 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: '#9a8568' }}
              tickLine={false}
              axisLine={{ stroke: '#e8e0d4' }}
            />
            <YAxis
              domain={yDomain}
              ticks={yTicks}
              tick={{ fontSize: 10, fill: '#9a8568' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={tickFormatter}
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
              formatter={tooltipFormatter}
              labelStyle={{ color: '#5e4f3c', fontWeight: 600, marginBottom: 4 }}
            />
            {metric === 'rain' ? (
              <Bar
                dataKey={dataKey}
                fill={color}
                fillOpacity={0.7}
                radius={[3, 3, 0, 0]}
                maxBarSize={20}
              />
            ) : (
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: '#fff' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        {metric === 'rain' ? (
          <div className="w-3 h-2 rounded-sm" style={{ background: color, opacity: 0.7 }} />
        ) : (
          <div className="w-3 h-0.5 rounded-full" style={{ background: color }} />
        )}
        <span className="text-[10px] font-medium text-sand-500">{legend}</span>
      </div>
    </div>
  );
}

function buildChartData(
  summary: WeatherSummary,
  metric: ChartMetric,
  tempUnit: TempUnit,
  windUnit: WindUnit,
) {
  if (metric === 'temp') {
    return summary.hourlyTemps.map((ht) => ({
      hour: formatHour(ht.hour),
      value: displayTemp(ht.temp, tempUnit),
    }));
  }
  if (metric === 'rain') {
    return summary.hourlyPrecipProb.map((h) => ({
      hour: formatHour(h.hour),
      value: Math.round(h.precipProb),
    }));
  }
  // wind
  return summary.hourlyWindSpeed.map((h) => ({
    hour: formatHour(h.hour),
    value: displayWindSpeed(h.windSpeed, windUnit),
  }));
}

interface MetricConfig {
  dataKey: string;
  color: string;
  yDomain: [number | string, number | string];
  yTicks?: number[];
  tickFormatter: (v: number) => string;
  tooltipFormatter: (value: unknown) => [string, string];
  legend: string;
}

/** Generate N evenly-spaced ticks between min and max (inclusive). */
function evenTicks(min: number, max: number, count = 6): number[] {
  if (min === max) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.round((min + i * step) * 10) / 10);
}

function getMetricConfig(
  metric: ChartMetric,
  tempUnit: TempUnit,
  windUnit: WindUnit,
  tempDomain?: [number, number],
  windDomain?: [number, number],
): MetricConfig {
  if (metric === 'temp') {
    const unitLabel = tempUnit === 'C' ? '°C' : '°F';
    return {
      dataKey: 'value',
      color: '#ef7d33',
      yDomain: tempDomain ?? ['auto', 'auto'],
      yTicks: tempDomain ? evenTicks(tempDomain[0], tempDomain[1]) : undefined,
      tickFormatter: (v) => `${v}°`,
      tooltipFormatter: (v) => [`${v}${unitLabel}`, 'Temperature'],
      legend: 'Temperature',
    };
  }
  if (metric === 'rain') {
    return {
      dataKey: 'value',
      color: '#60b8fa',
      yDomain: [0, 100],
      tickFormatter: (v) => `${v}%`,
      tooltipFormatter: (v) => [`${v}%`, 'Rain chance'],
      legend: 'Rain probability',
    };
  }
  // wind
  const unitLabel = windSpeedLabel(windUnit);
  return {
    dataKey: 'value',
    color: '#7c9cbf',
    yDomain: windDomain ?? [0, 'auto'],
    yTicks: windDomain ? evenTicks(windDomain[0], windDomain[1]) : undefined,
    tickFormatter: (v) => `${v}`,
    tooltipFormatter: (v) => [`${v} ${unitLabel}`, 'Wind speed'],
    legend: `Wind speed (${unitLabel})`,
  };
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return '12a';
  if (hour === 12) return '12p';
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}
