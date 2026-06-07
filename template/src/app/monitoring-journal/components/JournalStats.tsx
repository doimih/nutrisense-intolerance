import React from 'react';
import type { JournalEntry } from './journalData';

interface JournalStatsProps {
  entries: JournalEntry[];
}

export default function JournalStats({ entries }: JournalStatsProps) {
  const avgIntensity = entries.length > 0
    ? (entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length).toFixed(1)
    : '—';

  const goodDays = entries.filter((e) => e.general_state === 'good').length;
  const badDays = entries.filter((e) => e.general_state === 'bad').length;
  const neutralDays = entries.filter((e) => e.general_state === 'neutral').length;

  const highIntensityDays = entries.filter((e) => e.intensity >= 7).length;

  const mostCommonSymptom = (() => {
    const freq: Record<string, number> = {};
    entries.forEach((e) => {
      e.symptoms.forEach((s) => {
        if (s !== 'None') freq[s] = (freq[s] || 0) + 1;
      });
    });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? `${sorted[0][0]} (×${sorted[0][1]})` : 'None recorded';
  })();

  const stats = [
    {
      id: 'stat-entries',
      label: 'Total Entries',
      value: String(entries.length),
      icon: '📓',
      variant: 'default',
    },
    {
      id: 'stat-avg',
      label: 'Avg Intensity',
      value: avgIntensity,
      subValue: 'out of 10',
      icon: '📊',
      variant: Number(avgIntensity) >= 6 ? 'warning' : 'positive',
    },
    {
      id: 'stat-good',
      label: 'Good Days',
      value: String(goodDays),
      subValue: `${Math.round((goodDays / (entries.length || 1)) * 100)}% of entries`,
      icon: '✅',
      variant: 'positive',
    },
    {
      id: 'stat-high',
      label: 'High Intensity Days',
      value: String(highIntensityDays),
      subValue: 'intensity ≥ 7',
      icon: '⚠️',
      variant: highIntensityDays > 2 ? 'negative' : 'default',
    },
    {
      id: 'stat-symptom',
      label: 'Top Symptom',
      value: mostCommonSymptom.split(' ')[0],
      subValue: mostCommonSymptom.includes('×') ? mostCommonSymptom.split(' ').slice(1).join(' ') : '',
      icon: '🔍',
      variant: 'default',
    },
  ];

  const variantBg: Record<string, string> = {
    default: 'card',
    positive: 'card border-positive/20 bg-positive-bg/20',
    negative: 'card border-negative/20 bg-negative-bg/20',
    warning: 'card border-warning/20 bg-warning-bg/30',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div key={stat.id} className={`${variantBg[stat.variant]} p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{stat.icon}</span>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight">
              {stat.label}
            </p>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
          {stat.subValue && (
            <p className="text-xs text-muted-foreground mt-0.5">{stat.subValue}</p>
          )}
        </div>
      ))}
    </div>
  );
}