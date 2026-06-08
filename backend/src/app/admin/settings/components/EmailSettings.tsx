'use client';
import React, { useEffect, useState } from 'react';

type EmailForm = {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
  encryption: 'tls' | 'ssl' | 'none';
};

type SettingsPayload = {
  settings?: {
    email?: Partial<EmailForm>;
  };
};

const DEFAULT_FORM: EmailForm = {
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPass: '',
  fromEmail: '',
  fromName: 'NutriAID',
  encryption: 'tls',
};

export default function EmailSettings() {
  const [form, setForm] = useState<EmailForm>(DEFAULT_FORM);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/superadmin/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: SettingsPayload | null) => {
        const email = payload?.settings?.email;
        if (!email) return;
        setForm((prev) => ({
          ...prev,
          smtpHost: email.smtpHost ?? prev.smtpHost,
          smtpPort: email.smtpPort ?? prev.smtpPort,
          smtpUser: email.smtpUser ?? prev.smtpUser,
          fromEmail: email.fromEmail ?? prev.fromEmail,
          fromName: email.fromName ?? prev.fromName,
          encryption: email.encryption ?? prev.encryption,
        }));
      })
      .catch(() => setError('Could not load email settings.'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: {
          smtpHost: form.smtpHost,
          smtpPort: form.smtpPort,
          smtpUser: form.smtpUser,
          fromEmail: form.fromEmail,
          fromName: form.fromName,
          encryption: form.encryption,
        },
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(payload.error || 'Could not save email settings.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTestEmail = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await fetch('/api/superadmin/settings/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smtpHost: form.smtpHost, smtpPort: form.smtpPort }),
    }).catch(() => null);

    setTesting(false);
    if (!res) {
      setTestResult({ ok: false, message: 'Request failed — check SMTP host and port.' });
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    setTestResult({
      ok: res.ok && data.ok !== false,
      message: data.message || (res.ok ? 'Connection successful.' : 'Connection failed.'),
    });
    setTimeout(() => setTestResult(null), 5000);
  };

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="section-header">Email Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure SMTP server for transactional emails
        </p>
      </div>

      {error && (
        <p className="text-sm rounded-lg border border-negative/30 bg-negative-bg text-negative px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">SMTP Host</label>
          <input
            className="input-field"
            value={form.smtpHost}
            onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
            placeholder="smtp.sendgrid.net"
          />
        </div>
        <div>
          <label className="label-text">SMTP Port</label>
          <input
            className="input-field"
            value={form.smtpPort}
            onChange={(e) => setForm({ ...form, smtpPort: e.target.value })}
            placeholder="587"
          />
        </div>
        <div>
          <label className="label-text">SMTP Username</label>
          <input
            className="input-field"
            value={form.smtpUser}
            onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
            placeholder="apikey"
          />
        </div>
        <div>
          <label className="label-text">SMTP Password</label>
          <input
            className="input-field"
            type="password"
            value={form.smtpPass}
            onChange={(e) => setForm({ ...form, smtpPass: e.target.value })}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <p className="helper-text">Not stored in DB — set via SMTP_PASSWORD env var.</p>
        </div>
        <div>
          <label className="label-text">From Email</label>
          <input
            className="input-field"
            value={form.fromEmail}
            onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
            placeholder="noreply@nutriaid.app"
          />
        </div>
        <div>
          <label className="label-text">From Name</label>
          <input
            className="input-field"
            value={form.fromName}
            onChange={(e) => setForm({ ...form, fromName: e.target.value })}
            placeholder="NutriAID"
          />
        </div>
        <div>
          <label className="label-text">Encryption</label>
          <select
            className="input-field"
            aria-label="Encryption"
            title="Encryption"
            value={form.encryption}
            onChange={(e) => setForm({ ...form, encryption: e.target.value as EmailForm['encryption'] })}
          >
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {testResult && (
        <div
          className={`rounded-lg p-3 flex items-center gap-2 text-sm font-medium ${
            testResult.ok
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {testResult.ok ? '✓' : '✗'} {testResult.message}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => void handleSave()} disabled={saving} className="btn-primary">
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button onClick={() => void handleTestEmail()} disabled={testing} className="btn-secondary">
          {testing ? 'Testing…' : 'Send Test Email'}
        </button>
      </div>
    </div>
  );
}
