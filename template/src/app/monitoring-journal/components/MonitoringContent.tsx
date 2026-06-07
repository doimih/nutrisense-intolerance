'use client';
import React, { useState } from 'react';
import { INITIAL_ENTRIES, type JournalEntry } from './journalData';
import JournalStats from './JournalStats';
import JournalTable from './JournalTable';
import AddEntryModal from './AddEntryModal';
import ViewEntryModal from './ViewEntryModal';

export default function MonitoringContent() {
  const [entries, setEntries] = useState<JournalEntry[]>(INITIAL_ENTRIES);
  const [addOpen, setAddOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = (entry: JournalEntry) => {
    setEntries([entry, ...entries]);
    setAddOpen(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    // BACKEND INTEGRATION: DELETE /monitoring/:id — remove journal entry by ID
    await new Promise((r) => setTimeout(r, 400));
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Monitoring Journal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track what you eat and how you feel — {entries.length} entries logged
          </p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Entry
        </button>
      </div>

      {/* Stats */}
      <JournalStats entries={entries} />

      {/* Table */}
      <JournalTable
        entries={entries}
        deletingId={deletingId}
        onView={setViewEntry}
        onDelete={handleDelete}
      />

      {/* Modals */}
      <AddEntryModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />

      {viewEntry && (
        <ViewEntryModal
          entry={viewEntry}
          onClose={() => setViewEntry(null)}
        />
      )}
    </div>
  );
}