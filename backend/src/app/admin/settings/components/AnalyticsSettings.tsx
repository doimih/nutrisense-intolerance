'use client';
import React, { useEffect, useState } from 'react';

type AnalyticsForm = {
  enabled: boolean;
  measurementId: string;
};

type SettingsPayload = {
  settings?: {
    analytics?: Partial<AnalyticsForm>;
  };
};

const DEFAULT_FORM: AnalyticsForm = {
  enabled: false,
  measurementId: '',
};

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-foreground">Where do I find my Measurement ID?</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <ol className="space-y-3">
            {[
              <>Go to{' '}<a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">analytics.google.com</a></>,
              <>Create (or open) a <strong>GA4 property</strong> for your site</>,
              <>Go to <strong>Admin → Data Streams</strong> and select your web stream</>,
              <>Copy the <strong>Measurement ID</strong> (format <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">G-XXXXXXXXXX</code>)</>,
              <>Paste it below, enable tracking, and save</>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 px-4 py-3">
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              <strong>Note:</strong> the tracking script only loads for visitors who accept the &quot;Analytics&quot;
              cookie category in the cookie consent banner — no extra setup needed, it&apos;s already wired in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsSettings() {
  const [form, setForm] = useState<AnalyticsForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetch('/api/superadmin/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((payload: SettingsPayload | null) => {
        const a = payload?.settings?.analytics;
        if (!a) return;
        setForm((prev) => ({
          enabled: a.enabled ?? prev.enabled,
          measurementId: a.measurementId ?? prev.measurementId,
        }));
      })
      .catch(() => setError('Could not load Analytics settings.'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analytics: form }),
    });

    setSaving(false);
    if (!res.ok) { setError('Save failed.'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const isValidId = !form.measurementId || /^G-[A-Z0-9]+$/i.test(form.measurementId.trim());

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Google Analytics</h2>
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            title="Where do I find my Measurement ID?"
            className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors flex items-center justify-center text-xs font-bold"
            aria-label="Google Analytics setup help"
          >
            ?
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Connect a GA4 property to track visits and behavior on the public site. Requires a Measurement ID from{' '}
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Google Analytics
          </a>.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="card p-5 space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Enable Google Analytics</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              When enabled, the gtag.js tracking script loads on the public site for users who accept analytics cookies.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, enabled: !p.enabled }))}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              form.enabled ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
            role="switch"
            aria-checked={form.enabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                form.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <hr className="border-border" />

        {/* Measurement ID */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Measurement ID <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            GA4 stream ID — starts with <code className="text-xs bg-muted px-1 py-0.5 rounded">G-</code>.
          </p>
          <input
            type="text"
            value={form.measurementId}
            onChange={(e) => setForm((p) => ({ ...p, measurementId: e.target.value }))}
            placeholder="G-XXXXXXXXXX"
            className="input w-full font-mono text-sm"
            spellCheck={false}
            autoComplete="off"
          />
          {!isValidId && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
              Measurement ID should look like G-XXXXXXXXXX.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => void handleSave()} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
