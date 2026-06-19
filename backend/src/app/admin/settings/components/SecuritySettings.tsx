'use client';
import React, { useState } from 'react';

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSync = async () => {
    if (!currentPassword) {
      setResult({ ok: false, message: 'Enter your current password.' });
      return;
    }

    setSyncing(true);
    setResult(null);

    try {
      const res = await fetch('/api/superadmin/auth/sync-frontend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword }),
      });

      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? 'Sync failed.' });
      } else {
        setResult({ ok: true, message: 'Password synced successfully to the frontend.' });
        setCurrentPassword('');
      }
    } catch {
      setResult({ ok: false, message: 'Network error. Check whether the frontend is running.' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage password synchronization between backend and frontend.
        </p>
      </div>

      {/* Sync password card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Password sync → Frontend
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            If you changed your password in the backend and can&apos;t log in to the frontend with the same
            password, use this to sync manually.
          </p>
        </div>

        <div className="rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-300">
          <strong>Automatic flow:</strong> on every password change in the backend, syncing
          happens automatically if{' '}
          <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">
            INTERNAL_SYNC_SECRET
          </code>{' '}
          and{' '}
          <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">
            FRONTEND_INTERNAL_URL
          </code>{' '}
          are configured in both{' '}
          <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/50 px-1 rounded">
            .env
          </code>
          {' '}files.
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="sync-password" className="label-text">
              Current password (from backend)
            </label>
            <div className="relative mt-1">
              <input
                id="sync-password"
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleSync()}
                className="input-field pr-10"
                placeholder="Your current backend password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleSync()}
            disabled={syncing || !currentPassword}
            className="btn-primary py-2.5 px-5 text-sm disabled:opacity-50"
          >
            {syncing ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Syncing…
              </span>
            ) : (
              'Sync password with frontend'
            )}
          </button>

          {result && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                result.ok
                  ? 'bg-green-50 dark:bg-green-950/30 border border-green-300/60 text-green-900 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-950/30 border border-red-300/60 text-red-900 dark:text-red-300'
              }`}
            >
              {result.ok ? '✓ ' : '✗ '}
              {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
