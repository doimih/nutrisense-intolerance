'use client';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import { SYMPTOM_OPTIONS, type JournalEntry, type GeneralState } from './journalData';

interface AddEntryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: JournalEntry) => void;
}

interface FormData {
  date: string;
  foods_raw: string;
  intensity: number;
  general_state: GeneralState;
  notes: string;
}

export default function AddEntryModal({ open, onClose, onAdd }: AddEntryModalProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      foods_raw: '',
      intensity: 3,
      general_state: 'good',
      notes: '',
    },
  });

  const intensityValue = watch('intensity');

  const toggleSymptom = (symptom: string) => {
    if (symptom === 'None') {
      setSelectedSymptoms(['None']);
      return;
    }
    const filtered = selectedSymptoms.filter((s) => s !== 'None');
    if (filtered.includes(symptom)) {
      setSelectedSymptoms(filtered.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...filtered, symptom]);
    }
  };

  const intensityColor = (v: number) =>
    v >= 7 ? 'text-negative' : v >= 5 ? 'text-warning' : v >= 3 ? 'text-accent' : 'text-positive';

  const onSubmit = async (data: FormData) => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom (or "None")');
      return;
    }
    setLoading(true);
    // BACKEND INTEGRATION: POST /monitoring/add — send entry data, receive saved entry with ID
    await new Promise((r) => setTimeout(r, 800));

    const foods = data.foods_raw
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      date: data.date,
      foods_consumed: foods.length > 0 ? foods : ['Not specified'],
      symptoms: selectedSymptoms,
      intensity: Number(data.intensity),
      general_state: data.general_state,
      notes: data.notes,
    };

    setLoading(false);
    onAdd(newEntry);
    reset();
    setSelectedSymptoms([]);
    toast.success('Journal entry saved');
  };

  const handleClose = () => {
    reset();
    setSelectedSymptoms([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Journal Entry"
      size="lg"
      footer={
        <>
          <button type="button" onClick={handleClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" form="add-entry-form" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving…
              </>
            ) : (
              'Save Entry'
            )}
          </button>
        </>
      }
    >
      <form id="add-entry-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Date */}
        <div>
          <label htmlFor="entry-date" className="label-text">
            Date
          </label>
          <input
            id="entry-date"
            type="date"
            className={`input-field ${errors.date ? 'border-negative' : ''}`}
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && <p className="error-text">{errors.date.message}</p>}
        </div>

        {/* Foods consumed */}
        <div>
          <label htmlFor="entry-foods" className="label-text">
            Foods Consumed
          </label>
          <p className="helper-text mb-1.5">List all foods eaten today, separated by commas</p>
          <textarea
            id="entry-foods"
            rows={3}
            className={`input-field resize-none ${errors.foods_raw ? 'border-negative' : ''}`}
            placeholder="e.g. Avocado toast, Black coffee, Grilled chicken, Brown rice"
            {...register('foods_raw', { required: 'Please list at least one food' })}
          />
          {errors.foods_raw && <p className="error-text">{errors.foods_raw.message}</p>}
        </div>

        {/* Symptoms */}
        <div>
          <label className="label-text">Symptoms Experienced</label>
          <p className="helper-text mb-2">Select all symptoms noticed today</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom);
              return (
                <button
                  key={`symptom-opt-${symptom}`}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all duration-150 active:scale-95 ${
                    isSelected
                      ? symptom === 'None'
                        ? 'border-positive bg-positive-bg text-positive'
                        : 'border-warning bg-warning-bg text-warning'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  }`}
                >
                  {symptom}
                </button>
              );
            })}
          </div>
          {selectedSymptoms.length === 0 && (
            <p className="error-text mt-1">Please select at least one option</p>
          )}
        </div>

        {/* Intensity slider */}
        <div>
          <label htmlFor="entry-intensity" className="label-text">
            Symptom Intensity —{' '}
            <span className={`font-bold tabular-nums ${intensityColor(Number(intensityValue))}`}>
              {intensityValue}/10
            </span>
          </label>
          <p className="helper-text mb-2">
            Rate the overall severity of your symptoms (1 = none, 10 = severe)
          </p>
          <Controller
            name="intensity"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <input
                  id="entry-intensity"
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 — No symptoms</span>
                  <span>5 — Moderate</span>
                  <span>10 — Severe</span>
                </div>
              </div>
            )}
          />
        </div>

        {/* General state */}
        <div>
          <label className="label-text">General State Today</label>
          <p className="helper-text mb-2">How did you feel overall throughout the day?</p>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                {
                  value: 'good',
                  label: 'Good',
                  emoji: '😊',
                  color: 'border-positive bg-positive-bg text-positive',
                },
                {
                  value: 'neutral',
                  label: 'Neutral',
                  emoji: '😐',
                  color: 'border-warning bg-warning-bg text-warning',
                },
                {
                  value: 'bad',
                  label: 'Poor',
                  emoji: '😔',
                  color: 'border-negative bg-negative-bg text-negative',
                },
              ] as const
            ).map((opt) => (
              <label
                key={`state-${opt.value}`}
                className="relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all duration-150 hover:border-primary/30 has-[:checked]:border-2 has-[:checked]:bg-opacity-100"
                style={{}}
              >
                <input
                  type="radio"
                  value={opt.value}
                  className="sr-only"
                  {...register('general_state', { required: true })}
                />
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-sm font-semibold text-foreground">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="entry-notes" className="label-text">
            Notes
          </label>
          <p className="helper-text mb-1.5">
            Optional — any observations, context, or patterns you noticed
          </p>
          <textarea
            id="entry-notes"
            rows={3}
            className="input-field resize-none"
            placeholder="e.g. Reaction started 30 minutes after lunch, possible cross-contamination at restaurant..."
            {...register('notes')}
          />
        </div>
      </form>
    </Modal>
  );
}
