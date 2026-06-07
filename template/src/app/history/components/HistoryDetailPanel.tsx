'use client';
import React from 'react';
import type { HistoryRecord } from './historyData';

interface HistoryDetailPanelProps {
  record: HistoryRecord;
  onClose: () => void;
}

const dietLabels: Record<string, string> = {
  'low-carb': '🥩 Low-Carb',
  vegetarian: '🥗 Vegetarian',
  vegan: '🌱 Vegan',
  normal: '🍽️ Normal',
};

export default function HistoryDetailPanel({ record, onClose }: HistoryDetailPanelProps) {
  const date = new Date(record.generatedAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="card p-5 sticky top-6 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin">
      {/* Panel header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
          <p className="text-base font-bold text-foreground">{formattedTime}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Close detail panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Context */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <span className="badge-muted text-xs">{dietLabels[record.diet_preference]}</span>
        <span className="badge-red text-xs">{record.intolerance_count} intolerances</span>
      </div>

      {/* Intolerances */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active at time of generation</p>
        <div className="flex flex-wrap gap-1.5">
          {record.intolerances.map((int) => (
            <span key={`detail-int-${record.id}-${int}`} className="badge-red text-xs">{int}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="text-center p-3 rounded-xl bg-positive-bg/50 border border-positive/10">
          <p className="text-xl font-bold text-positive tabular-nums">{record.recommended_count}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Recommended</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-negative-bg/50 border border-negative/10">
          <p className="text-xl font-bold text-negative tabular-nums">{record.avoid_count}</p>
          <p className="text-xs text-muted-foreground mt-0.5">To Avoid</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-muted border border-border">
          <p className="text-xl font-bold text-foreground tabular-nums">{record.meal_count}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Meals</p>
        </div>
      </div>

      {/* Top recommended */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Recommended Foods</p>
        <div className="space-y-1.5">
          {record.top_recommended.map((food, i) => (
            <div key={`rec-${record.id}-${i}`} className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 rounded-full bg-positive/10 text-positive text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-foreground font-medium">{food}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top avoid */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Foods to Avoid</p>
        <div className="space-y-1.5">
          {record.top_avoid.map((food, i) => (
            <div key={`avoid-${record.id}-${i}`} className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-negative flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-foreground font-medium">{food}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sample meals */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sample Meals</p>
        <div className="space-y-2">
          {record.sample_meals.map((meal, i) => (
            <div key={`meal-${record.id}-${i}`} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
              <span className="text-sm">🍽️</span>
              <span className="text-sm text-foreground font-medium">{meal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}