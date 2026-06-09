'use client';
import React, { useEffect, useRef, useState } from 'react';

type EmailDiagnostics = {
  smtpHost: string | null;
  smtpPort: string;
  smtpUser: string | null;
  fromEmail: string | null;
  encryption: string;
  smtpConfigured: boolean;
  smtpPasswordSaved: boolean;
  smtpReachable: boolean | null;
  internalTokenExists: boolean;
  recentEmailLogs: Array<{ id: string; level: string; message: string; createdAt: string; metadata?: unknown }>;
};

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
    email?: Partial<EmailForm & { hasPass?: boolean }>;
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
  const [hasStoredPass, setHasStoredPass] = useState(false);
  const [passChanged, setPassChanged] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [sendTestResult, setSendTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<EmailDiagnostics | null>(null);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);
  const passInputRef = useRef<HTMLInputElement>(null);

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
        setHasStoredPass(!!(email.smtpPass));
      })
      .catch(() => setError('Could not load email settings.'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const emailPayload: Partial<EmailForm> = {
      smtpHost: form.smtpHost,
      smtpPort: form.smtpPort,
      smtpUser: form.smtpUser,
      fromEmail: form.fromEmail,
      fromName: form.fromName,
      encryption: form.encryption,
    };

    // Only include password if it was changed and is not empty
    if (passChanged && form.smtpPass) {
      emailPayload.smtpPass = form.smtpPass;
    }

    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailPayload }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string; settings?: { email?: Partial<EmailForm> } };
    setSaving(false);
    if (!res.ok) {
      setError(payload.error || 'Could not save email settings.');
      return;
    }

    if (passChanged && form.smtpPass) {
      setHasStoredPass(true);
      setPassChanged(false);
      setForm((prev) => ({ ...prev, smtpPass: '' }));
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const loadDiagnostics = async () => {
    setLoadingDiagnostics(true);
    const res = await fetch('/api/superadmin/settings/email-diagnostics').catch(() => null);
    setLoadingDiagnostics(false);
    if (res?.ok) {
      const data = (await res.json().catch(() => null)) as EmailDiagnostics | null;
      if (data) setDiagnostics(data);
    }
  };

  const handleSendTestEmail = async () => {
    setSendingTest(true);
    setSendTestResult(null);
    const res = await fetch('/api/superadmin/settings/send-test-email', {
      method: 'POST',
    }).catch(() => null);
    setSendingTest(false);
    if (!res) {
      setSendTestResult({ ok: false, message: 'Request failed.' });
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    setSendTestResult({
      ok: res.ok && data.ok !== false,
      message: data.message || (res.ok ? 'Email trimis.' : 'Trimitere esuata.'),
    });
    setTimeout(() => setSendTestResult(null), 8000);
  };

  const handleTestEmail = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await fetch('/api/superadmin/settings/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        smtpHost: form.smtpHost,
        smtpPort: form.smtpPort,
        smtpUser: form.smtpUser,
        fromEmail: form.fromEmail,
        encryption: form.encryption,
      }),
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
            ref={passInputRef}
            className="input-field"
            type="password"
            value={form.smtpPass}
            placeholder={hasStoredPass && !passChanged ? '••••••••  (saved)' : 'Enter password'}
            autoComplete="new-password"
            onChange={(e) => {
              setPassChanged(true);
              setForm({ ...form, smtpPass: e.target.value });
            }}
          />
          <p className="helper-text">
            {hasStoredPass && !passChanged
              ? 'Password is saved. Type a new one to change it.'
              : 'Stored securely in DB.'}
          </p>
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
          role="alert"
          className={`rounded-lg px-4 py-3 flex items-start justify-between gap-3 text-sm font-medium ${
            testResult.ok
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-base leading-none">{testResult.ok ? '✓' : '✗'}</span>
            <span>{testResult.message}</span>
          </span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setTestResult(null)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-base leading-none"
          >
            ×
          </button>
        </div>
      )}

      {sendTestResult && (
        <div
          role="alert"
          className={`rounded-lg px-4 py-3 flex items-start justify-between gap-3 text-sm font-medium ${
            sendTestResult.ok
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-base leading-none">{sendTestResult.ok ? '✓' : '✗'}</span>
            <span>{sendTestResult.message}</span>
          </span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setSendTestResult(null)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-base leading-none"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => void handleSave()} disabled={saving} className="btn-primary">
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button onClick={() => void handleTestEmail()} disabled={testing} className="btn-secondary">
          {testing ? 'Testing…' : 'Test Connection'}
        </button>
        <button onClick={() => void handleSendTestEmail()} disabled={sendingTest} className="btn-secondary">
          {sendingTest ? 'Se trimite…' : 'Trimite test'}
        </button>
        <button onClick={() => void loadDiagnostics()} disabled={loadingDiagnostics} className="btn-secondary">
          {loadingDiagnostics ? 'Se verifica…' : 'Diagnostics'}
        </button>
      </div>

      {diagnostics && (
        <div className="border border-border rounded-xl overflow-hidden mt-2">
          <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Email Diagnostics</h3>
            <button type="button" onClick={() => setDiagnostics(null)} className="text-xs text-muted-foreground hover:text-foreground">✕ Inchide</button>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <DiagRow label="SMTP configurat" ok={diagnostics.smtpConfigured} text={diagnostics.smtpConfigured ? 'Da' : 'Lipseste host sau parola'} />
              <DiagRow label="Parola SMTP salvata" ok={diagnostics.smtpPasswordSaved} text={diagnostics.smtpPasswordSaved ? 'Da' : 'Nu — salveaza parola!'} />
              <DiagRow label="SMTP accesibil (TCP)" ok={diagnostics.smtpReachable === true} text={diagnostics.smtpReachable === null ? 'Nestiut (fara host)' : diagnostics.smtpReachable ? 'Accesibil' : 'Inaccesibil'} />
              <DiagRow label="Token intern exista" ok={diagnostics.internalTokenExists} text={diagnostics.internalTokenExists ? 'Da' : 'Nu — problema critica!'} />
            </div>
            {diagnostics.recentEmailLogs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Loguri recente email (din frontend):</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {diagnostics.recentEmailLogs.map((log) => (
                    <div key={log.id} className={`text-xs px-3 py-1.5 rounded-lg font-mono ${
                      log.level === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                      log.level === 'warn' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      <span className="opacity-60">{new Date(log.createdAt).toLocaleTimeString('ro-RO')}</span>{' '}
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {diagnostics.recentEmailLogs.length === 0 && (
              <p className="text-xs text-muted-foreground">Nu exista loguri email recente. Inregistreaza-te cu un cont nou pentru a genera un log.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DiagRow({ label, ok, text }: { label: string; ok: boolean; text: string }) {
  return (
    <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${ok ? 'bg-positive-bg border border-positive/20' : 'bg-negative-bg border border-negative/20'}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${ok ? 'text-positive' : 'text-negative'}`}>{ok ? '✓' : '✗'} {text}</span>
    </div>
  );
}
