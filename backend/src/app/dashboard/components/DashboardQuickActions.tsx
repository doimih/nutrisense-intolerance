'use client';
import React from 'react';
import Link from 'next/link';

export default function DashboardQuickActions() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/monitoring-journal" className="btn-secondary text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Log Entry
      </Link>
      <Link href="/guidance" className="btn-primary text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
        Get Guidance
      </Link>
    </div>
  );
}
