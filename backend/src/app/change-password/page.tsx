'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import {
  AdminSession,
  clearAdminSession,
  loadAdminSession,
  persistAdminSession,
  updateAdminPassword,
} from '@/lib/adminAuth';

interface PasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordFormData>();

  useEffect(() => {
    const currentSession = loadAdminSession();

    if (!currentSession) {
      router.replace('/');
      return;
    }

    if (!currentSession.mustChangePassword) {
      router.replace('/dashboard');
      return;
    }

    setSession(currentSession);
    setCheckingSession(false);
  }, [router]);

  const onSubmit = async (data: PasswordFormData) => {
    if (!session) return;

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    const updatedUser = updateAdminPassword(session.userId, data.newPassword);
    if (!updatedUser) {
      clearAdminSession();
      setSaving(false);
      toast.error('Unable to update password. Please sign in again.');
      router.replace('/');
      return;
    }

    persistAdminSession(updatedUser);
    setSaving(false);
    toast.success('Password changed successfully.');
    router.replace('/dashboard');
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <AppLogo size={30} />
          <span className="font-bold text-foreground text-lg tracking-tight">NutriSense</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Change temporary password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            For security reasons, you must set a new password before accessing the dashboard.
          </p>
        </div>

        <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 mb-6">
          Logged in as <strong>{session?.email}</strong>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="new-password" className="label-text">
              New password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                className={`input-field pr-10 ${errors.newPassword ? 'border-negative focus:ring-negative' : ''}`}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                    message: 'Include uppercase, lowercase, number, and symbol',
                  },
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                {showNewPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.newPassword && <p className="error-text">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="confirm-password" className="label-text">
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`input-field pr-10 ${errors.confirmPassword ? 'border-negative focus:ring-negative' : ''}`}
                placeholder="Repeat your new password"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Please confirm the new password',
                  validate: (value) => value === watch('newPassword') || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={saving}>
            {saving ? 'Updating password…' : 'Save new password'}
          </button>
        </form>
      </div>
    </div>
  );
}
