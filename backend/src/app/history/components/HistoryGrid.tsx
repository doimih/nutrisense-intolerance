'use client';
import React from 'react';
import { HISTORY_RECORDS, type HistoryRecord } from './historyData';
import EmptyState from '@/components/ui/EmptyState';

interface HistoryGridProps {
  dateFilter: 'all' | '7d' | '30d' | '90d';
  selectedId: string | null;
  onSelect: (record: HistoryRecord) => void;
}

function filterByDate(records: HistoryRecord[], filter: string): HistoryRecord[] {
  if (filter === 'all') return records;
  const now = new Date('2026-06-07T16:03:22');
  const days = filter === '7d' ? 7 : filter === '30d' ? 30 : 90;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return records.filter((r) => new Date(r.generatedAt) >= cutoff);
}

const dietLabels: Record<string, string> = {
  'low-carb': '🥩 Low-Carb',
  vegetarian: '🥗 Vegetarian',
  vegan: '🌱 Vegan',
  normal: '🍽️ Normal',
};

export default function HistoryGrid({ dateFilter, selectedId, onSelect }: HistoryGridProps) {
  const filtered = filterByDate(HISTORY_RECORDS, dateFilter);

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        title="No guidance records found"
        description="No AI guidance has been generated in this time period. Generate new guidance from the Guidance page."
        action={
          <a href="/guidance" className="btn-primary">
            Generate Guidance
          </a>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
      {filtered.map((record) => {
        const date = new Date(record.generatedAt);
        const formattedDate = date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        const formattedTime = date.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const isSelected = selectedId === record.id;

        return (
          <button
            key={record.id}
            onClick={() => onSelect(record)}
            className={`card p-5 text-left transition-all duration-150 hover:shadow-elevated hover:-translate-y-0.5 active:scale-[0.99] ${
              isSelected ? 'border-primary ring-2 ring-primary/20' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-foreground">{formattedDate}</p>
                <p className="text-xs text-muted-foreground">{formattedTime}</p>
              </div>
              <span className="badge-muted text-xs">
                {dietLabels[record.diet_preference] || record.diet_preference}
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 rounded-lg bg-positive-bg/50">
                <p className="text-lg font-bold text-positive tabular-nums">
                  {record.recommended_count}
                </p>
                <p className="text-xs text-muted-foreground">Recommended</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-negative-bg/50">
                <p className="text-lg font-bold text-negative tabular-nums">{record.avoid_count}</p>
                <p className="text-xs text-muted-foreground">Avoid</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-lg font-bold text-foreground tabular-nums">
                  {record.meal_count}
                </p>
                <p className="text-xs text-muted-foreground">Meals</p>
              </div>
            </div>

            {/* Intolerance count */}
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-red text-xs">{record.intolerance_count} intolerances</span>
            </div>

            {/* Top recommended preview */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Top picks
              </p>
              <p className="text-xs text-foreground truncate">
                {record.top_recommended.slice(0, 3).join(' · ')}
              </p>
            </div>

            {/* View indicator */}
            <div className="flex items-center justify-end mt-3 text-xs text-primary font-semibold">
              View details
              <svg
                className="w-3.5 h-3.5 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}
