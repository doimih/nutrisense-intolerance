import React from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

const recentEntries = [
  {
    id: 'entry-001',
    date: '2026-06-07',
    foods: ['Avocado toast', 'Black coffee', 'Banana'],
    symptoms: ['Mild bloating'],
    intensity: 2,
    generalState: 'good',
    notes: 'Felt well rested, no significant reactions.',
  },
  {
    id: 'entry-002',
    date: '2026-06-06',
    foods: ['Chicken salad', 'Sparkling water', 'Apple'],
    symptoms: ['None'],
    intensity: 1,
    generalState: 'good',
    notes: '',
  },
  {
    id: 'entry-003',
    date: '2026-06-05',
    foods: ['Lentil soup', 'Gluten-free bread', 'Orange juice'],
    symptoms: ['Headache', 'Fatigue'],
    intensity: 5,
    generalState: 'neutral',
    notes: 'Headache started around 3pm, possible dehydration.',
  },
  {
    id: 'entry-004',
    date: '2026-06-04',
    foods: ['Brown rice', 'Broccoli', 'Grilled salmon'],
    symptoms: ['None'],
    intensity: 1,
    generalState: 'good',
    notes: 'Best day this week.',
  },
  {
    id: 'entry-005',
    date: '2026-06-03',
    foods: ['Oat porridge (dairy-free)', 'Almond milk', 'Berries'],
    symptoms: ['Mild bloating', 'Gas'],
    intensity: 4,
    generalState: 'neutral',
    notes: 'Switched to almond milk — still some bloating.',
  },
];

function IntensityDot({ value }: { value: number }) {
  const color = value >= 7 ? 'bg-negative' : value >= 5 ? 'bg-warning' : value >= 3 ? 'bg-accent' : 'bg-positive';
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${color} text-white text-xs font-bold tabular-nums`}>
      {value}
    </span>
  );
}

function StateLabel({ state }: { state: string }) {
  if (state === 'good') return <Badge variant="green">Good</Badge>;
  if (state === 'bad') return <Badge variant="red">Poor</Badge>;
  return <Badge variant="muted">Neutral</Badge>;
}

export default function RecentJournalFeed() {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="section-header">Recent Journal Entries</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Last 5 entries logged</p>
        </div>
        <Link href="/monitoring-journal" className="btn-secondary text-xs px-3 py-1.5">
          View all entries
        </Link>
      </div>

      <div className="divide-y divide-border">
        {recentEntries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
          >
            <div className="flex-shrink-0 text-center pt-0.5">
              <p className="text-xs font-semibold text-muted-foreground">
                {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {entry.foods.slice(0, 3).map((food, fi) => (
                  <span key={`food-${entry.id}-${fi}`} className="text-sm font-medium text-foreground">
                    {fi > 0 ? '· ' : ''}{food}
                  </span>
                ))}
                {entry.foods.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{entry.foods.length - 3} more</span>
                )}
              </div>
              {entry.symptoms[0] !== 'None' && (
                <p className="text-xs text-muted-foreground">
                  Symptoms: {entry.symptoms.join(', ')}
                </p>
              )}
              {entry.notes && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.notes}</p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <StateLabel state={entry.generalState} />
              <IntensityDot value={entry.intensity} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}