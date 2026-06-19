'use client';
import React, { useEffect, useState } from 'react';

type BrevoForm = {
  apiKey: string;
  listIdUsers: string;
  listIdPublic: string;
  eventsKey: string;
};

type SettingsPayload = {
  settings?: {
    brevo?: Partial<BrevoForm>;
  };
};

const DEFAULT_FORM: BrevoForm = {
  apiKey: '',
  listIdUsers: '',
  listIdPublic: '',
  eventsKey: '',
};

export default function BrevoSettings() {
  const [form, setForm] = useState<BrevoForm>(DEFAULT_FORM);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; ipRestricted?: boolean; serverIp?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/superadmin/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((payload: SettingsPayload | null) => {
        const b = payload?.settings?.brevo;
        if (!b) return;
        setForm({
          apiKey: b.apiKey ?? '',
          listIdUsers: b.listIdUsers ?? '',
          listIdPublic: b.listIdPublic ?? '',
          eventsKey: b.eventsKey ?? '',
        });
      })
      .catch(() => setError('Could not load Brevo settings.'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    setTestResult(null);

    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brevo: form }),
    });

    setSaving(false);
    if (!res.ok) { setError('Save failed.'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const res = await fetch('/api/superadmin/settings/brevo-test', { method: 'POST' });
      const data = (await res.json()) as { ok: boolean; email?: string; company?: string; error?: string; ipRestricted?: boolean; serverIp?: string };
      if (data.ok) {
        setTestResult({ ok: true, message: `Connected — ${data.company ?? ''} (${data.email ?? ''})` });
      } else if (data.ipRestricted) {
        setTestResult({
          ok: false,
          ipRestricted: true,
          serverIp: data.serverIp,
          message: data.error ?? 'IP not whitelisted.',
        });
      } else {
        setTestResult({ ok: false, message: data.error ?? 'Connection failed.' });
      }
    } catch {
      setTestResult({ ok: false, message: 'Network error.' });
    }

    setTesting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Brevo (Sendinblue) — Newsletter</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your Brevo API key and list IDs for newsletter management. The API key is stored securely
          and never exposed to the public.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {testResult && !testResult.ipRestricted && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          testResult.ok
            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300'
            : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300'
        }`}>
          {testResult.ok ? '✓ ' : '✗ '}{testResult.message}
        </div>
      )}

      {testResult?.ipRestricted && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 px-4 py-4 space-y-2">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            ✓ API key valid — server IP not whitelisted in Brevo
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Cheia API este corectă, dar Brevo blochează cererile de la IP-ul serverului{' '}
            <code className="font-mono font-bold bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
              {testResult.serverIp}
            </code>
            .
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Adaugă acest IP în lista de IP-uri autorizate Brevo, apoi încearcă din nou:
          </p>
          <a
            href="https://app.brevo.com/security/authorised_ips"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 dark:text-amber-200 underline hover:no-underline"
          >
            → app.brevo.com/security/authorised_ips
          </a>
        </div>
      )}

      <div className="card p-5 space-y-5">
        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Brevo API Key <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Found in{' '}
            <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Brevo → Account → API Keys
            </a>. Never leave this blank in production.
          </p>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={form.apiKey}
              onChange={(e) => setForm((p) => ({ ...p, apiKey: e.target.value }))}
              placeholder="xkeysib-..."
              className="input flex-1 font-mono text-sm"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <hr className="border-border" />

        {/* List IDs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              List ID — Registered Users
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Brevo list ID for &quot;NutriAID Users&quot; (e.g. <code className="text-xs bg-muted px-1 py-0.5 rounded">3</code>).
            </p>
            <input
              type="text"
              value={form.listIdUsers}
              onChange={(e) => setForm((p) => ({ ...p, listIdUsers: e.target.value }))}
              placeholder="3"
              className="input w-full font-mono text-sm"
              spellCheck={false}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              List ID — Public Newsletter
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Brevo list ID for &quot;NutriAID Newsletter Public&quot; (footer form).
            </p>
            <input
              type="text"
              value={form.listIdPublic}
              onChange={(e) => setForm((p) => ({ ...p, listIdPublic: e.target.value }))}
              placeholder="4"
              className="input w-full font-mono text-sm"
              spellCheck={false}
            />
          </div>
        </div>

        <hr className="border-border" />

        {/* Events / Automation Key */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Brevo Events (Automation) Key
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Separate key for the{' '}
            <a href="https://in-automate.brevo.com/api/v2/events" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Brevo Automation Events API
            </a>
            . Found in Brevo → Automations → Settings → Tracking. Required for event tracking (logins, AI usage, subscriptions…).
          </p>
          <input
            type="password"
            value={form.eventsKey}
            onChange={(e) => setForm((p) => ({ ...p, eventsKey: e.target.value }))}
            placeholder="xkeysib-... (automation key)"
            className="input w-full font-mono text-sm"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <hr className="border-border" />

        {/* Info box */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 px-4 py-3 space-y-1.5">
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">Required Brevo contact attributes</p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Create these attributes in Brevo → Contacts → Contact attributes before using the newsletter system:
          </p>
          <ul className="text-xs text-blue-700 dark:text-blue-300 list-disc list-inside space-y-0.5">
            <li><code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">FIRSTNAME</code> — Text</li>
            <li><code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">LANGUAGE</code> — Text</li>
            <li><code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">SOURCE</code> — Text</li>
            <li><code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">CONSENT_TS</code> — Date</li>
            <li><code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">CONSENT_SOURCE</code> — Text</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => void handleSave()} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => void handleTest()}
          disabled={testing || !form.apiKey}
          className="btn-secondary"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>
    </div>
  );
}
