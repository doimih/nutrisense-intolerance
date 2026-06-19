'use client';
import React, { useEffect, useState } from 'react';

type BackupConfig = {
  schedule: string;
  retention: string;
  destination: string;
};

type HetznerConfig = {
  region: string;
  endpoint: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
};

type SettingsPayload = {
  settings?: {
    backup?: BackupConfig & { hetzner?: HetznerConfig };
  };
};

type BackupHistoryEntry = {
  id: string;
  createdAt: string;
  actorEmail: string | null;
  destination: string;
  triggeredBy: string;
  filesUploaded: number | null;
  prefix: string | null;
  schedule: string | null;
};

const DEFAULT_CONFIG: BackupConfig = {
  schedule: 'daily',
  retention: '30',
  destination: 'local',
};

const DEFAULT_HETZNER: HetznerConfig = {
  region: 'eu-central',
  endpoint: '',
  bucket: '',
  accessKey: '',
  secretKey: '',
};

export default function BackupSettings() {
  const [config, setConfig] = useState<BackupConfig>(DEFAULT_CONFIG);
  const [hetzner, setHetzner] = useState<HetznerConfig>(DEFAULT_HETZNER);
  const [hasStoredSecret, setHasStoredSecret] = useState(false);
  const [secretChanged, setSecretChanged] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [hetznerEditing, setHetznerEditing] = useState(false);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hetznerSaved, setHetznerSaved] = useState(false);
  const [hetznerSaving, setHetznerSaving] = useState(false);

  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [hetznerTesting, setHetznerTesting] = useState(false);
  const [hetznerTestResult, setHetznerTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [backupHistory, setBackupHistory] = useState<BackupHistoryEntry[]>([]);
  const [historyError, setHistoryError] = useState(false);

  const loadHistory = () => {
    setHistoryError(false);
    fetch('/api/superadmin/backup/history')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('not ok'))))
      .then((data: { history?: BackupHistoryEntry[] }) => {
        setBackupHistory(data.history ?? []);
      })
      .catch(() => setHistoryError(true));
  };

  useEffect(() => {
    loadHistory();
    fetch('/api/superadmin/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: SettingsPayload | null) => {
        const b = payload?.settings?.backup;
        if (!b) return;
        setConfig({
          schedule: b.schedule ?? DEFAULT_CONFIG.schedule,
          retention: b.retention ?? DEFAULT_CONFIG.retention,
          destination: b.destination ?? DEFAULT_CONFIG.destination,
        });
        if (b.hetzner) {
          setHetzner({
            region: b.hetzner.region ?? DEFAULT_HETZNER.region,
            endpoint: b.hetzner.endpoint ?? DEFAULT_HETZNER.endpoint,
            bucket: b.hetzner.bucket ?? DEFAULT_HETZNER.bucket,
            accessKey: b.hetzner.accessKey ?? DEFAULT_HETZNER.accessKey,
            secretKey: '',
          });
          setHasStoredSecret(!!(b.hetzner.secretKey));
        }
      })
      .catch(() => setError('Could not load backup settings.'));
  }, []);

  const buildHetznerPayload = () => {
    const payload: HetznerConfig = {
      region: hetzner.region,
      endpoint: hetzner.endpoint,
      bucket: hetzner.bucket,
      accessKey: hetzner.accessKey,
      secretKey: hetzner.secretKey,
    };
    if (!secretChanged || !hetzner.secretKey) {
      delete (payload as Partial<HetznerConfig>).secretKey;
    }
    return payload;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backup: { ...config } }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!res.ok) { setError(payload.error || 'Could not save backup settings.'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleHetznerSave = async () => {
    setHetznerSaving(true);
    setError(null);
    const hetznerPayload = buildHetznerPayload();
    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        backup: { ...config, hetzner: hetznerPayload },
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setHetznerSaving(false);
    if (!res.ok) { setError(payload.error || 'Could not save storage settings.'); return; }
    if (secretChanged && hetzner.secretKey) {
      setHasStoredSecret(true);
      setSecretChanged(false);
      setHetzner((prev) => ({ ...prev, secretKey: '' }));
    }
    setHetznerSaved(true);
    setHetznerEditing(false);
    setTimeout(() => setHetznerSaved(false), 2500);
  };

  const handleBackupNow = async () => {
    setRunning(true);
    setRunResult(null);
    const res = await fetch('/api/superadmin/backup/run', { method: 'POST' }).catch(() => null);
    setRunning(false);
    if (!res) {
      setRunResult({ ok: false, message: 'Request failed.' });
    } else {
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      setRunResult({ ok: res.ok && data.ok !== false, message: data.message || (res.ok ? 'Backup started.' : 'Backup failed.') });
      if (res.ok && data.ok !== false) setTimeout(() => loadHistory(), 300);
    }
    setTimeout(() => setRunResult(null), 8000);
  };

  const handleHetznerTest = async () => {
    setHetznerTesting(true);
    setHetznerTestResult(null);
    if (!hetzner.endpoint || !hetzner.bucket || !hetzner.accessKey) {
      setHetznerTesting(false);
      setHetznerTestResult({ ok: false, message: 'Fill in the endpoint, bucket, and access key before testing.' });
      setTimeout(() => setHetznerTestResult(null), 5000);
      return;
    }
    const res = await fetch('/api/superadmin/backup/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: hetzner.endpoint,
        bucket: hetzner.bucket,
        accessKey: hetzner.accessKey,
        region: hetzner.region,
        secretKey: secretChanged && hetzner.secretKey ? hetzner.secretKey : undefined,
      }),
    }).catch(() => null);
    setHetznerTesting(false);
    if (!res) {
      setHetznerTestResult({ ok: false, message: 'Request failed — check the endpoint.' });
    } else {
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      setHetznerTestResult({ ok: res.ok && data.ok !== false, message: data.message || (res.ok ? 'Connection successful.' : 'Connection failed.') });
    }
    setTimeout(() => setHetznerTestResult(null), 6000);
  };

  return (
    <div className="space-y-5">
      {/* General backup settings */}
      <div className="card p-6 space-y-5">
        <div>
          <h2 className="section-header">Backup Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure automated database and file backups</p>
        </div>

        {error && (
          <p className="text-sm rounded-lg border border-negative/30 bg-negative-bg text-negative px-3 py-2">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Backup Schedule</label>
            <select
              className="input-field"
              title="Backup schedule"
              aria-label="Backup schedule"
              value={config.schedule}
              onChange={(e) => setConfig({ ...config, schedule: e.target.value })}
            >
              <option value="hourly">Every Hour</option>
              <option value="daily">Daily (3:00 AM)</option>
              <option value="weekly">Weekly</option>
              <option value="manual">Manual Only</option>
            </select>
          </div>
          <div>
            <label className="label-text">Retention Period (days)</label>
            <input
              className="input-field"
              type="number"
              title="Retention period"
              aria-label="Retention period"
              value={config.retention}
              onChange={(e) => setConfig({ ...config, retention: e.target.value })}
              min="1"
              max="365"
            />
          </div>
          <div>
            <label className="label-text">Storage Destination</label>
            <select
              className="input-field"
              title="Storage destination"
              aria-label="Storage destination"
              value={config.destination}
              onChange={(e) => setConfig({ ...config, destination: e.target.value })}
            >
              <option value="local">Local Storage</option>
              <option value="hetzner">Hetzner Object Storage</option>
            </select>
          </div>
        </div>

        {runResult && (
          <div className={`rounded-lg p-3 flex items-center gap-2 text-sm font-medium ${runResult.ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {runResult.ok ? '✓' : '✗'} {runResult.message}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => void handleSave()} disabled={saving} className="btn-primary">
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Settings'}
          </button>
          <button onClick={() => void handleBackupNow()} className="btn-secondary" disabled={running}>
            {running ? 'Running backup…' : 'Backup Now'}
          </button>
        </div>
      </div>

      {/* Hetzner storage settings */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Hetzner Storage Settings</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Configure the Hetzner Object Storage connection for remote backups</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1">
          <p className="font-medium">How to get the credentials:</p>
          <p>1. Go to Hetzner Console → Object Storage → create a bucket</p>
          <p>2. Under <strong>Access Keys</strong>, generate an Access Key / Secret Key pair</p>
          <p>3. You&apos;ll find the endpoint in the bucket details (e.g. <code>https://fsn1.your-objectstorage.com</code>)</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="label-text">Region</label>
            <input
              className="input-field"
              type="text"
              placeholder="eu-central"
              value={hetzner.region}
              onChange={(e) => setHetzner({ ...hetzner, region: e.target.value })}
              disabled={!hetznerEditing}
              readOnly={!hetznerEditing}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="label-text">Endpoint</label>
            <input
              className="input-field"
              type="text"
              placeholder="https://fsn1.your-objectstorage.com"
              value={hetzner.endpoint}
              onChange={(e) => setHetzner({ ...hetzner, endpoint: e.target.value })}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                  setHetzner((prev) => ({ ...prev, endpoint: `https://${val}` }));
                }
              }}
              disabled={!hetznerEditing}
              readOnly={!hetznerEditing}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="label-text">Bucket</label>
            <input
              className="input-field"
              type="text"
              placeholder="bucket-name"
              value={hetzner.bucket}
              onChange={(e) => setHetzner({ ...hetzner, bucket: e.target.value })}
              disabled={!hetznerEditing}
              readOnly={!hetznerEditing}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="label-text">Access Key</label>
            <input
              className="input-field"
              type="text"
              placeholder="Access Key from Hetzner Console"
              value={hetzner.accessKey}
              onChange={(e) => setHetzner({ ...hetzner, accessKey: e.target.value })}
              disabled={!hetznerEditing}
              readOnly={!hetznerEditing}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="label-text">Secret Key</label>
            <div className="relative">
              <input
                className="input-field pr-10"
                type={showSecret ? 'text' : 'password'}
                placeholder={hasStoredSecret && !secretChanged ? '•••••••• (saved)' : 'Secret Key from Hetzner Console'}
                value={hetzner.secretKey}
                onChange={(e) => {
                  setSecretChanged(true);
                  setHetzner({ ...hetzner, secretKey: e.target.value });
                }}
                disabled={!hetznerEditing}
                readOnly={!hetznerEditing}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={!hetznerEditing}
                title={showSecret ? 'Hide' : 'Show'}
                aria-label={showSecret ? 'Hide secret key' : 'Show secret key'}
              >
                {showSecret ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="helper-text">
              {hasStoredSecret && !secretChanged
                ? 'Secret Key is saved. Type a new one to change it.'
                : 'Stored securely in the DB.'}
            </p>
          </div>
        </div>

        {hetznerTestResult && (
          <div className={`rounded-lg p-3 flex items-center gap-2 text-sm font-medium ${hetznerTestResult.ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {hetznerTestResult.ok ? '✓' : '✗'} {hetznerTestResult.message}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => { setHetznerEditing((v) => !v); setHetznerTestResult(null); }}
            className="btn-secondary"
          >
            {hetznerEditing ? 'Cancel' : 'Edit storage settings'}
          </button>
          <button
            onClick={() => void handleHetznerSave()}
            className="btn-primary"
            disabled={!hetznerEditing || hetznerSaving}
          >
            {hetznerSaved ? '✓ Saved' : hetznerSaving ? 'Saving…' : 'Save storage'}
          </button>
          <button
            onClick={() => void handleHetznerTest()}
            className="btn-secondary"
            disabled={hetznerTesting}
          >
            {hetznerTesting ? 'Testing…' : 'Test connection'}
          </button>
        </div>
      </div>

      {/* Backup history */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Backup History</h3>
          <button
            onClick={loadHistory}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Reload history"
          >
            ↻ Reload
          </button>
        </div>

        {historyError ? (
          <p className="text-sm text-negative text-center py-6">
            Could not load history. Click ↻ Reload.
          </p>
        ) : backupHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No backups recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Date</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Destination</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Files</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Prefix</th>
                  <th className="pb-2 font-medium text-muted-foreground">Triggered by</th>
                </tr>
              </thead>
              <tbody>
                {backupHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-4 text-foreground whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString('en-GB', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        entry.destination === 'hetzner'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {entry.destination === 'hetzner' ? '☁ Hetzner' : '💾 Local'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-foreground">
                      {entry.filesUploaded != null ? `${entry.filesUploaded} files` : '—'}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground font-mono text-xs truncate max-w-[180px]" title={entry.prefix ?? ''}>
                      {entry.prefix ?? '—'}
                    </td>
                    <td className="py-2 text-muted-foreground text-xs">
                      {entry.triggeredBy === 'manual' ? 'manual' : entry.triggeredBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
