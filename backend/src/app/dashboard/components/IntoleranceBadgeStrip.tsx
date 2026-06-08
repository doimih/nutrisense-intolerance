import React from 'react';
import Link from 'next/link';

const userIntolerances = [
  { id: 'int-gluten', name: 'Gluten', severity: 'high' },
  { id: 'int-lactose', name: 'Lactose', severity: 'high' },
  { id: 'int-eggs', name: 'Eggs', severity: 'medium' },
  { id: 'int-soy', name: 'Soy', severity: 'medium' },
  { id: 'int-nuts', name: 'Tree Nuts', severity: 'low' },
  { id: 'int-fructose', name: 'Fructose', severity: 'medium' },
  { id: 'int-histamine', name: 'Histamine', severity: 'low' },
];

const severityStyles: Record<string, string> = {
  high: 'badge-red',
  medium: 'badge-amber',
  low: 'badge-muted',
};

export default function IntoleranceBadgeStrip() {
  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-header">Your Intolerances</h2>
        <Link href="/admin/settings" className="text-xs font-semibold text-primary hover:underline">
          Manage
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 flex-1">
        {userIntolerances.map((item) => (
          <span
            key={item.id}
            className={`badge ${severityStyles[item.severity]} text-sm py-1.5 px-3`}
          >
            {item.name}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Coverage</span>
          <span className="font-semibold text-foreground">7 / 24 tested</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all duration-500"
            style={{ width: `${(7 / 24) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Consider testing 17 more intolerances for complete coverage
        </p>
      </div>
    </div>
  );
}
