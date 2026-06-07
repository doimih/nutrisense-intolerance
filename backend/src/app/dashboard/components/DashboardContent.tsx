'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import KpiBentoGrid from './KpiBentoGrid';
import SymptomTrendChart from './SymptomTrendChart';
import RecentJournalFeed from './RecentJournalFeed';
import IntoleranceBadgeStrip from './IntoleranceBadgeStrip';
import DashboardQuickActions from './DashboardQuickActions';

const ADMIN_SESSION_KEY = 'ns_admin_session';

export default function DashboardContent() {
  const [displayName, setDisplayName] = useState('Admin');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return;

    try {
      const session = JSON.parse(raw) as { name?: string };
      if (session?.name?.trim()) {
        setDisplayName(session.name.trim());
      }
    } catch {
      // Keep fallback display name.
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Good afternoon, {displayName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s your health overview — last synced 2 minutes ago
          </p>
        </div>
        <DashboardQuickActions />
      </div>

      {/* KPI bento grid */}
      <KpiBentoGrid />

      {/* Middle row: chart + intolerances */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SymptomTrendChart />
        </div>
        <div>
          <IntoleranceBadgeStrip />
        </div>
      </div>

      {/* Recent journal */}
      <RecentJournalFeed />
    </div>
  );
}
