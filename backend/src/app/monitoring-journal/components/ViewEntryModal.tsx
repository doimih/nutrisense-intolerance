'use client';
import React from 'react';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import type { JournalEntry, GeneralState } from './journalData';

interface ViewEntryModalProps {
  entry: JournalEntry;
  onClose: () => void;
}

function StateLabel({ state }: { state: GeneralState }) {
  if (state === 'good') return <Badge variant="green">Good</Badge>;
  if (state === 'bad') return <Badge variant="red">Poor</Badge>;
  return <Badge variant="muted">Neutral</Badge>;
}

export default function ViewEntryModal({ entry, onClose }: ViewEntryModalProps) {
  const intensityColor =
    entry.intensity >= 7
      ? 'text-negative bg-negative-bg border-negative/20'
      : entry.intensity >= 5
        ? 'text-warning bg-warning-bg border-warning/20'
        : entry.intensity >= 3
          ? 'text-accent bg-orange-50 border-orange-200'
          : 'text-positive bg-positive-bg border-positive/20';

  const formattedDate = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal
      open
      onClose={onClose}
      title="Journal Entry"
      size="md"
      footer={
        <button onClick={onClose} className="btn-primary">
          Close
        </button>
      }
    >
      <div className="space-y-5">
        {/* Date + state row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-foreground">{formattedDate}</p>
          </div>
          <StateLabel state={entry.general_state} />
        </div>

        {/* Intensity */}
        <div className={`flex items-center gap-4 p-4 rounded-xl border ${intensityColor}`}>
          <div className="text-center">
            <p className="text-4xl font-bold tabular-nums">{entry.intensity}</p>
            <p className="text-xs font-medium opacity-70">/ 10</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Symptom Intensity</p>
            <p className="text-xs opacity-70 mt-0.5">
              {entry.intensity >= 7
                ? 'High — significant discomfort recorded'
                : entry.intensity >= 5
                  ? 'Moderate — noticeable symptoms present'
                  : entry.intensity >= 3
                    ? 'Mild — minor symptoms only'
                    : 'Minimal — little to no discomfort'}
            </p>
          </div>
        </div>

        {/* Foods consumed */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Foods Consumed
          </p>
          <div className="flex flex-wrap gap-2">
            {entry.foods_consumed.map((food, i) => (
              <span key={`view-food-${entry.id}-${i}`} className="badge-blue text-xs py-1 px-2.5">
                {food}
              </span>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Symptoms
          </p>
          <div className="flex flex-wrap gap-2">
            {entry.symptoms[0] === 'None' ? (
              <span className="badge-green text-xs py-1 px-2.5">No symptoms</span>
            ) : (
              entry.symptoms.map((s, i) => (
                <span key={`view-sym-${entry.id}-${i}`} className="badge-amber text-xs py-1 px-2.5">
                  {s}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Notes */}
        {entry.notes && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Notes
            </p>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-foreground leading-relaxed">{entry.notes}</p>
            </div>
          </div>
        )}

        {!entry.notes && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground italic">
              No notes recorded for this entry.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
