import React from 'react';
import Link from 'next/link';

interface KpiCardData {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon: React.ReactNode;
  variant: 'default' | 'positive' | 'negative' | 'warning';
  href?: string;
  colSpan?: string;
}

function TrendArrow({ direction }: { direction: 'up' | 'down' | 'neutral' }) {
  if (direction === 'up')
    return (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    );
  if (direction === 'down')
    return (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    );
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
    </svg>
  );
}

const kpiData: KpiCardData[] = [
  {
    id: 'kpi-intolerances',
    label: 'Active Intolerances',
    value: '7',
    subValue: 'of 24 tested',
    trend: 'neutral',
    trendLabel: 'No change this month',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    variant: 'warning',
    href: '/profile',
    colSpan: 'col-span-1',
  },
  {
    id: 'kpi-intensity',
    label: 'Avg Symptom Intensity',
    value: '3.8',
    subValue: 'out of 10 · last 14 days',
    trend: 'down',
    trendLabel: '↓ 0.6 vs previous period',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    variant: 'positive',
    href: '/monitoring-journal',
    colSpan: 'col-span-1 xl:col-span-2',
  },
  {
    id: 'kpi-streak',
    label: 'Journal Streak',
    value: '12 days',
    subValue: 'Personal best: 18 days',
    trend: 'up',
    trendLabel: 'Keep it up!',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
        />
      </svg>
    ),
    variant: 'positive',
    href: '/monitoring-journal',
    colSpan: 'col-span-1',
  },
  {
    id: 'kpi-guidance',
    label: 'Last AI Guidance',
    value: '3 days ago',
    subValue: 'Low-carb · 7 intolerances',
    trend: 'neutral',
    trendLabel: 'Regenerate for fresher advice',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
    variant: 'warning',
    href: '/guidance',
    colSpan: 'col-span-1',
  },
];

const variantStyles: Record<KpiCardData['variant'], { card: string; icon: string; trend: string }> =
  {
    default: {
      card: 'card',
      icon: 'bg-muted text-muted-foreground',
      trend: 'text-muted-foreground',
    },
    positive: {
      card: 'card border-positive/20 bg-positive-bg/30',
      icon: 'bg-positive/10 text-positive',
      trend: 'text-positive',
    },
    negative: {
      card: 'card border-negative/20 bg-negative-bg/30',
      icon: 'bg-negative/10 text-negative',
      trend: 'text-negative',
    },
    warning: {
      card: 'card border-warning/20 bg-warning-bg/40',
      icon: 'bg-warning/10 text-warning',
      trend: 'text-warning',
    },
  };

export default function KpiBentoGrid() {
  return (
    // Grid plan: 4 cards → grid-cols-4 → row 1: kpi-intolerances (1 col) + kpi-intensity (2 col) + kpi-streak (1 col)
    // row 2: kpi-guidance fills naturally
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpiData.map((kpi) => {
        const styles = variantStyles[kpi.variant];
        const content = (
          <div
            className={`${styles.card} p-5 h-full transition-all duration-150 hover:shadow-elevated ${kpi.href ? 'cursor-pointer' : ''} ${kpi.colSpan || ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight">
                {kpi.label}
              </p>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.icon}`}
              >
                {kpi.icon}
              </div>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-foreground tabular-nums leading-none">
                {kpi.value}
              </p>
              {kpi.subValue && <p className="text-xs text-muted-foreground mt-1">{kpi.subValue}</p>}
            </div>
            {kpi.trendLabel && kpi.trend && (
              <div className={`flex items-center gap-1 text-xs font-medium ${styles.trend}`}>
                <TrendArrow direction={kpi.trend} />
                <span>{kpi.trendLabel}</span>
              </div>
            )}
          </div>
        );

        if (kpi.href) {
          return (
            <Link key={kpi.id} href={kpi.href} className={`block ${kpi.colSpan || ''}`}>
              {content}
            </Link>
          );
        }
        return (
          <div key={kpi.id} className={kpi.colSpan || ''}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
