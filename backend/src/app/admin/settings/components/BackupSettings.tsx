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
};

type SettingsPayload = {
  settings?: {
    backup?: BackupConfig & { hetzner?: HetznerConfig };
  };
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
};

export default function BackupSettings() {
  const [config, setConfig] = useState<BackupConfig>(DEFAULT_CONFIG);
  const [hetzner, setHetzner] = useState<HetznerConfig>(DEFAULT_HETZNER);
  const [hetznerSecretKey, setHetznerSecretKey] = useState('');
  const [hetznerShowSecretKey, setHetznerShowSecretKey] = useState(false);
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

  useEffect(() => {
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
          });
        }
      })
      .catch(() => setError('Could not load backup settings.'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        backup: {
          ...config,
          hetzner,
        },
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(payload.error || 'Could not save backup settings.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleHetznerSave = async () => {
    setHetznerSaving(true);
    setError(null);
    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        backup: {
          ...config,
          hetzner,
        },
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setHetznerSaving(false);
    if (!res.ok) {
      setError(payload.error || 'Could not save storage settings.');
      return;
    }
    setHetznerSaved(true);
    setHetznerEditing(false);
    setTimeout(() => setHetznerSaved(false), 2500);
  };

  const handleBackupNow = async () => {
    setRunning(true);
    setRunResult(null);
    const res = await fetch('/api/superadmin/backup/run', {
      method: 'POST',
    }).catch(() => null);
    setRunning(false);
    if (!res) {
      setRunResult({ ok: false, message: 'Request failed.' });
    } else {
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      setRunResult({ ok: res.ok, message: data.message || (res.ok ? 'Backup requested.' : 'Backup failed.') });
    }
    setTimeout(() => setRunResult(null), 6000);
  };

  const handleHetznerTest = async () => {
    setHetznerTesting(true);
    setHetznerTestResult(null);

    if (!hetzner.endpoint || !hetzner.bucket || !hetzner.accessKey) {
      setHetznerTesting(false);
      setHetznerTestResult({ ok: false, message: 'Completeaza endpoint, bucket si access key inainte de a testa.' });
      setTimeout(() => setHetznerTestResult(null), 5000);
      return;
    }

    const res = await fetch('/api/superadmin/backup/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...hetzner }),
    }).catch(() => null);

    setHetznerTesting(false);
    if (!res) {
      setHetznerTestResult({ ok: false, message: 'Request failed — verifica endpoint-ul.' });
    } else {
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      setHetznerTestResult({ ok: res.ok && data.ok !== false, message: data.message || (res.ok ? 'Conexiune reusita.' : 'Conexiune esuata.') });
    }
    setTimeout(() => setHetznerTestResult(null), 5000);
  };

  return (
    <div className="space-y-5">
      <div className="card p-6 space-y-5">
        <div>
          <h2 className="section-header">Backup Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure automated database and file backups
          </p>
        </div>

        {error && (
          <p className="text-sm rounded-lg border border-negative/30 bg-negative-bg text-negative px-3 py-2">
            {error}
          </p>
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
              <option value="s3">Amazon S3</option>
              <option value="gcs">Google Cloud Storage</option>
            </select>
          </div>
        </div>

        {runResult && (
          <div
            className={`rounded-lg p-3 flex items-center gap-2 text-sm font-medium ${
              runResult.ok
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
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

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Setari Storage</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configureaza conexiunea Hetzner Object Storage pentru backup-uri remote
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p>Pentru Hetzner Object Storage completeaza:</p>
          <p>Endpoint: ex. https://fsn1.your-objectstorage.com</p>
          <p>Bucket: numele bucket-ului creat</p>
          <p>Access Key si Secret Key: din Hetzner Console (nu email/parola de cont).</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="label-text">Provider</label>
            <input
              className="input-field bg-muted/40"
              type="text"
              title="Provider"
              aria-label="Provider"
              value="Hetzner Storage"
              disabled
              readOnly
            />
          </div>

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
              disabled={!hetznerEditing}
              readOnly={!hetznerEditing}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="label-text">Bucket</label>
            <input
              className="input-field"
              type="text"
              placeholder="numele-bucket-ului"
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
              placeholder="Access Key din Hetzner Console"
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
                type={hetznerShowSecretKey ? 'text' : 'password'}
                placeholder="Secret Key din Hetzner Console"
                value={hetznerSecretKey}
                onChange={(e) => setHetznerSecretKey(e.target.value)}
                disabled={!hetznerEditing}
                readOnly={!hetznerEditing}
              />
              <button
                type="button"
                onClick={() => setHetznerShowSecretKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={!hetznerEditing}
                title="Arata sau ascunde Secret Key"
                aria-label="Arata sau ascunde Secret Key"
              >
                {hetznerShowSecretKey ? (
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
            <p className="helper-text">Secret Key nu este stocat în DB — seteaza HETZNER_SECRET_KEY în env.</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {hetznerEditing
            ? 'Campurile pot fi editate. Completeaza endpoint, bucket, access key, secret key si regiunea.'
            : 'Campurile sunt blocate. Apasa „Editeaza setari storage" pentru a modifica valorile.'}
        </p>

        {hetznerTestResult && (
          <div
            className={`rounded-lg p-3 flex items-center gap-2 text-sm font-medium ${
              hetznerTestResult.ok
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {hetznerTestResult.ok ? '✓' : '✗'} {hetznerTestResult.message}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setHetznerEditing((current) => !current);
              setHetznerTestResult(null);
            }}
            className="btn-secondary"
          >
            {hetznerEditing ? 'Anuleaza editarea' : 'Editeaza setari storage'}
          </button>
          <button
            onClick={() => void handleHetznerSave()}
            className="btn-primary"
            disabled={!hetznerEditing || hetznerSaving}
          >
            {hetznerSaved ? '✓ Setari salvate' : hetznerSaving ? 'Salvand…' : 'Salveaza setari storage'}
          </button>
          <button
            onClick={() => void handleHetznerTest()}
            className="btn-secondary"
            disabled={!hetznerEditing || hetznerTesting}
          >
            {hetznerTesting ? 'Testeaza conexiunea…' : 'Testeaza conexiunea'}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Backup History</h3>
        <p className="text-sm text-muted-foreground text-center py-6">
          No backup history available. Backup infrastructure not yet configured.
        </p>
      </div>
    </div>
  );
}
