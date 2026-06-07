import React from 'react';
import Link from 'next/link';

export default function GuidanceContextSummary() {
  return (
    <div className="card p-4 bg-secondary border-primary/20">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Generating for:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge-blue text-xs">🥩 Low-Carb diet</span>
          <span className="badge-red text-xs">7 active intolerances</span>
          <span className="badge-muted text-xs">
            Gluten · Lactose · Eggs · Soy · Tree Nuts · Fructose · Histamine
          </span>
        </div>
        <Link
          href="/profile"
          className="ml-auto text-xs font-semibold text-primary hover:underline"
        >
          Edit profile
        </Link>
      </div>
    </div>
  );
}
