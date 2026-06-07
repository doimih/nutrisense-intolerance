'use client';
import React, { useState } from 'react';
import type { JournalEntry, GeneralState } from './journalData';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

interface JournalTableProps {
  entries: JournalEntry[];
  deletingId: string | null;
  onView: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

function IntensityBadge({ value }: { value: number }) {
  const variant = value >= 7 ? 'red' : value >= 5 ? 'amber' : value >= 3 ? 'orange' : 'green';
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold tabular-nums badge-${variant} ${
        value >= 7
          ? 'bg-negative text-white'
          : value >= 5
            ? 'bg-warning text-white'
            : value >= 3
              ? 'bg-accent/20 text-accent'
              : 'bg-positive/10 text-positive'
      }`}
    >
      {value}
    </span>
  );
}

function StateIndicator({ state }: { state: GeneralState }) {
  if (state === 'good') return <Badge variant="green">Good</Badge>;
  if (state === 'bad') return <Badge variant="red">Poor</Badge>;
  return <Badge variant="muted">Neutral</Badge>;
}

type SortKey = 'date' | 'intensity' | 'general_state';
type SortDir = 'asc' | 'desc';

export default function JournalTable({ entries, deletingId, onView, onDelete }: JournalTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...entries].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'date') cmp = a.date.localeCompare(b.date);
    else if (sortKey === 'intensity') cmp = a.intensity - b.intensity;
    else if (sortKey === 'general_state') cmp = a.general_state.localeCompare(b.general_state);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        }
        title="No journal entries yet"
        description="Start logging your meals and symptoms to track patterns and improve your AI guidance quality."
        action={<button className="btn-primary">Add First Entry</button>}
      />
    );
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return (
        <svg
          className="w-3.5 h-3.5 opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    return sortDir === 'desc' ? (
      <svg
        className="w-3.5 h-3.5 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    ) : (
      <svg
        className="w-3.5 h-3.5 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    );
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="section-header">All Entries</h2>
        <span className="text-xs text-muted-foreground">{entries.length} records</span>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  Date <SortIcon col="date" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Foods Consumed
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Symptoms
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('intensity')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  Intensity <SortIcon col="intensity" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('general_state')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  State <SortIcon col="general_state" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Notes
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((entry) => {
              const isDeleting = deletingId === entry.id;
              const isConfirming = confirmDeleteId === entry.id;
              return (
                <tr
                  key={entry.id}
                  className={`group hover:bg-muted/40 transition-all duration-300 ${
                    isDeleting ? 'opacity-0 max-h-0' : 'opacity-100'
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', {
                        weekday: 'short',
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-sm text-foreground truncate">
                      {entry.foods_consumed.slice(0, 2).join(', ')}
                      {entry.foods_consumed.length > 2 && (
                        <span className="text-muted-foreground">
                          {' '}
                          +{entry.foods_consumed.length - 2}
                        </span>
                      )}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {entry.symptoms[0] === 'None' ? (
                        <span className="badge-green text-xs">None</span>
                      ) : (
                        <>
                          {entry.symptoms.slice(0, 2).map((s) => (
                            <span key={`sym-${entry.id}-${s}`} className="badge-amber text-xs">
                              {s}
                            </span>
                          ))}
                          {entry.symptoms.length > 2 && (
                            <span className="badge-muted text-xs">
                              +{entry.symptoms.length - 2}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <IntensityBadge value={entry.intensity} />
                  </td>
                  <td className="px-4 py-3">
                    <StateIndicator state={entry.general_state} />
                  </td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.notes || <span className="italic">No notes</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      {/* View */}
                      <button
                        onClick={() => onView(entry)}
                        className="p-1.5 rounded-lg hover:bg-info-bg hover:text-info text-muted-foreground transition-colors"
                        title="View full entry"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      {/* Delete */}
                      {isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDelete(entry.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 text-xs font-semibold bg-negative text-white rounded-lg hover:opacity-90 transition-opacity"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-xs font-semibold bg-muted text-muted-foreground rounded-lg hover:bg-border transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(entry.id)}
                          className="p-1.5 rounded-lg hover:bg-negative-bg hover:text-negative text-muted-foreground transition-colors"
                          title="Delete this entry — this cannot be undone"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
