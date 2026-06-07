import React from 'react';
import type { GuidanceData } from './GuidanceContent';

const categoryColors: Record<string, string> = {
  Protein: 'badge-blue',
  Vegetables: 'badge-green',
  Fats: 'badge-amber',
  Fruit: 'badge-orange',
  Nuts: 'badge-muted',
};

const severityStyles: Record<string, { badge: string; dot: string }> = {
  high: { badge: 'badge-red', dot: 'bg-negative' },
  medium: { badge: 'badge-amber', dot: 'bg-warning' },
  low: { badge: 'badge-muted', dot: 'bg-muted-foreground' },
};

interface GuidanceResultsProps {
  guidance: GuidanceData;
}

export default function GuidanceResults({ guidance }: GuidanceResultsProps) {
  const genDate = new Date(guidance.generatedAt);
  const formattedDate = `${genDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at ${genDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Generated timestamp */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Generated on {formattedDate}
      </div>

      {/* 3-column results grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended foods */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-positive/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-positive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recommended Foods</h3>
              <p className="text-xs text-muted-foreground">
                {guidance.recommended_foods.length} items
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {guidance.recommended_foods.map((food) => (
              <div
                key={food.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-positive-bg/40 border border-positive/10"
              >
                <span
                  className={`badge ${categoryColors[food.category] || 'badge-muted'} flex-shrink-0 mt-0.5`}
                >
                  {food.category}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{food.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {food.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Foods to avoid */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-negative/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-negative"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Foods to Avoid</h3>
              <p className="text-xs text-muted-foreground">
                {guidance.foods_to_avoid.length} items
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {guidance.foods_to_avoid.map((food) => {
              const styles = severityStyles[food.severity];
              return (
                <div
                  key={food.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-negative-bg/40 border border-negative/10"
                >
                  <span className={`badge ${styles.badge} flex-shrink-0 mt-0.5 capitalize`}>
                    {food.severity}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{food.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {food.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sample meals */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Sample Meals</h3>
              <p className="text-xs text-muted-foreground">
                {guidance.sample_meals.length} recipes
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {guidance.sample_meals.map((meal) => (
              <div
                key={meal.id}
                className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-semibold text-foreground">{meal.name}</p>
                  <span className="badge-muted flex-shrink-0 text-xs">⏱ {meal.prep_time}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {meal.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {meal.tags.map((tag) => (
                    <span key={`tag-${meal.id}-${tag}`} className="badge-green text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-info-bg border border-info/20">
        <svg
          className="w-5 h-5 text-info flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-info mb-1">Medical Disclaimer</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{guidance.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
