'use client';
import React, { useState } from 'react';
import HistoryFilters from './HistoryFilters';
import HistoryGrid from './HistoryGrid';
import HistoryDetailPanel from './HistoryDetailPanel';
import type { HistoryRecord } from './historyData';

export default function HistoryContent() {
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Guidance History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All past AI recommendations — tap any card to view full details
          </p>
        </div>
      </div>

      <HistoryFilters dateFilter={dateFilter} onDateFilterChange={setDateFilter} />

      <div className="flex gap-6">
        <div className={`transition-all duration-300 ${selectedRecord ? 'flex-1 min-w-0' : 'w-full'}`}>
          <HistoryGrid
            dateFilter={dateFilter}
            selectedId={selectedRecord?.id ?? null}
            onSelect={setSelectedRecord}
          />
        </div>

        {selectedRecord && (
          <div className="w-full max-w-md flex-shrink-0 animate-slide-in-right">
            <HistoryDetailPanel
              record={selectedRecord}
              onClose={() => setSelectedRecord(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}