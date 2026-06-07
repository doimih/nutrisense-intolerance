'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ProfileFormData {
  name: string;
  email: string;
  diet_preference: 'normal' | 'vegetarian' | 'vegan' | 'low-carb';
}

const DIET_OPTIONS = [
  { value: 'normal', label: 'No restrictions', emoji: '🍽️' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'low-carb', label: 'Low-Carb', emoji: '🥩' },
] as const;

export default function ProfileForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty: formDirty },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: 'Sofia Chen',
      email: 'sofia@example.com',
      diet_preference: 'low-carb',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    // BACKEND INTEGRATION: PUT /profile — send { name, diet_preference }, receive updated profile
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    reset(data);
    toast.success('Profile updated successfully');
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="section-header">Personal Information</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your name and dietary preference drive all AI recommendations
          </p>
        </div>
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground text-xl font-bold">SC</span>
        </div>
      </div>

      {/* Unsaved changes banner */}
      {formDirty && (
        <div className="flex items-center gap-2 bg-warning-bg border border-warning/30 rounded-lg px-4 py-2.5 mb-5 text-sm text-warning font-medium">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          You have unsaved changes — save before leaving this page
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label htmlFor="profile-name" className="label-text">
              Full name
            </label>
            <p className="helper-text mb-1.5">Used in your personalised guidance reports</p>
            <input
              id="profile-name"
              type="text"
              className={`input-field ${errors.name ? 'border-negative focus:ring-negative' : ''}`}
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
            />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="profile-email" className="label-text">
              Email address
            </label>
            <p className="helper-text mb-1.5">Cannot be changed — contact support to update</p>
            <input
              id="profile-email"
              type="email"
              className="input-field bg-muted cursor-not-allowed"
              readOnly
              {...register('email')}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="label-text">Diet preference</label>
          <p className="helper-text mb-3">
            Your dietary pattern affects which foods appear in AI recommendations
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DIET_OPTIONS.map((opt) => (
              <label
                key={`diet-opt-${opt.value}`}
                className="relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-secondary"
              >
                <input
                  type="radio"
                  value={opt.value}
                  className="sr-only"
                  {...register('diet_preference', { required: true })}
                />
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-sm font-semibold text-foreground">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <button type="submit" disabled={loading} className="btn-primary">
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
              'Save Changes'
            )}
          </button>
          <button type="button" className="btn-ghost" onClick={() => reset()}>
            Discard
          </button>
        </div>
      </form>
    </div>
  );
}
