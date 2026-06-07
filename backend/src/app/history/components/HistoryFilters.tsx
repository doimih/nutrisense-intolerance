'use client';
import React from 'react';

type DateFilter = 'all' | '7d' | '30d' | '90d';

interface HistoryFiltersProps {
  dateFilter: DateFilter;
  onDateFilterChange: (f: DateFilter) => void;
}

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export default function HistoryFilters({ dateFilter, onDateFilterChange }: HistoryFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
        Filter:
      </span>
      {DATE_OPTIONS.map((opt) => (
        <button
          key={`filter-${opt.value}`}
          onClick={() => onDateFilterChange(opt.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
            dateFilter === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-border hover:text-foreground'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
