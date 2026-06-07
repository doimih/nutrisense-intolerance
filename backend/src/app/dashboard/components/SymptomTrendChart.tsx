'use client';
import React from 'react';
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

// Mock 14-day symptom intensity data — realistic variance, not smooth uptrend
const trendData = [
  { date: 'May 25', intensity: 5.2, foods: 'Wheat bread, milk' },
  { date: 'May 26', intensity: 6.1, foods: 'Pasta, cheese' },
  { date: 'May 27', intensity: 4.8, foods: 'Rice, chicken' },
  { date: 'May 28', intensity: 3.2, foods: 'Salad, grilled fish' },
  { date: 'May 29', intensity: 2.9, foods: 'Quinoa, vegetables' },
  { date: 'May 30', intensity: 4.5, foods: 'Pizza (gluten-free)' },
  { date: 'May 31', intensity: 7.3, foods: 'Restaurant meal' },
  { date: 'Jun 1', intensity: 6.8, foods: 'Dairy smoothie' },
  { date: 'Jun 2', intensity: 4.1, foods: 'Oats, almond milk' },
  { date: 'Jun 3', intensity: 3.5, foods: 'Eggs, toast' },
  { date: 'Jun 4', intensity: 2.8, foods: 'Brown rice, broccoli' },
  { date: 'Jun 5', intensity: 3.9, foods: 'Lentil soup' },
  { date: 'Jun 6', intensity: 3.2, foods: 'Chicken salad' },
  { date: 'Jun 7', intensity: 3.8, foods: 'Avocado, eggs' },
];

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;
  const color = value >= 7 ? 'text-negative' : value >= 5 ? 'text-warning' : 'text-positive';
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-elevated">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${color}`}>{value.toFixed(1)}</p>
      <p className="text-xs text-muted-foreground">intensity score</p>
    </div>
  );
}

function getDotColor(value: number) {
  if (value >= 7) return 'var(--negative)';
  if (value >= 5) return 'var(--warning)';
  return 'var(--positive)';
}

export default function SymptomTrendChart() {
  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="section-header">Symptom Intensity Trend</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Last 14 days · daily average</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-positive inline-block" />
            Low (1–4)
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-warning inline-block" />
            Moderate (5–6)
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full bg-negative inline-block" />
            High (7–10)
          </span>
        </div>
      </div>

      <div className="mt-4" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={7}
              stroke="var(--negative)"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
            <ReferenceLine
              y={4}
              stroke="var(--positive)"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
            <Line
              type="monotone"
              dataKey="intensity"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={(props) => {
                const { cx, cy, payload } = props as {
                  cx: number;
                  cy: number;
                  payload: { intensity: number };
                };
                return (
                  <circle
                    key={`dot-${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={getDotColor(payload.intensity)}
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
