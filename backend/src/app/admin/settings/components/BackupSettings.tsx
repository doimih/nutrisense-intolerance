'use client';
import React, { useState } from 'react';

interface BackupEntry {
  id: string;
  date: string;
  size: string;
  type: string;
  status: 'success' | 'failed';
}

const mockBackups: BackupEntry[] = [
  { id: '1', date: '2026-06-07 03:00', size: '142 MB', type: 'Full', status: 'success' },
  { id: '2', date: '2026-06-06 03:00', size: '139 MB', type: 'Full', status: 'success' },
  { id: '3', date: '2026-06-05 03:00', size: '137 MB', type: 'Full', status: 'failed' },
  { id: '4', date: '2026-06-04 03:00', size: '135 MB', type: 'Full', status: 'success' },
];

export default function BackupSettings() {
  const [schedule, setSchedule] = useState('daily');
  const [retention, setRetention] = useState('30');
  const [destination, setDestination] = useState('s3');
  const [saved, setSaved] = useState(false);
  const [running, setRunning] = useState(false);

  const [hetznerRegion, setHetznerRegion] = useState('eu-central');
  const [hetznerEndpoint, setHetznerEndpoint] = useState('');
  const [hetznerBucket, setHetznerBucket] = useState('');
  const [hetznerAccessKey, setHetznerAccessKey] = useState('');
  const [hetznerSecretKey, setHetznerSecretKey] = useState('');
  const [hetznerShowSecretKey, setHetznerShowSecretKey] = useState(false);
  const [hetznerEditing, setHetznerEditing] = useState(false);
  const [hetznerSaved, setHetznerSaved] = useState(false);
  const [hetznerTesting, setHetznerTesting] = useState(false);
  const [hetznerTestResult, setHetznerTestResult] = useState<'success' | 'failed' | null>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleBackupNow = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 3000);
  };

  const handleHetznerSave = () => {
    setHetznerSaved(true);
    setHetznerEditing(false);
    setTimeout(() => setHetznerSaved(false), 2500);
  };

  const handleHetznerTest = () => {
    setHetznerTesting(true);
    setHetznerTestResult(null);
    setTimeout(() => {
      setHetznerTesting(false);
      setHetznerTestResult('success');
      setTimeout(() => setHetznerTestResult(null), 4000);
    }, 2000);
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Backup Schedule</label>
            <select
              className="input-field"
              title="Backup schedule"
              aria-label="Backup schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
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
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
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
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            >
              <option value="s3">Amazon S3</option>
              <option value="gcs">Google Cloud Storage</option>
              <option value="local">Local Storage</option>
              <option value="supabase">Supabase Storage</option>
              <option value="hetzner">Hetzner Object Storage</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} className="btn-primary">
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
          <button onClick={handleBackupNow} className="btn-secondary" disabled={running}>
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
              value={hetznerRegion}
              onChange={(e) => setHetznerRegion(e.target.value)}
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
              value={hetznerEndpoint}
              onChange={(e) => setHetznerEndpoint(e.target.value)}
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
              value={hetznerBucket}
              onChange={(e) => setHetznerBucket(e.target.value)}
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
              value={hetznerAccessKey}
              onChange={(e) => setHetznerAccessKey(e.target.value)}
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {hetznerEditing
            ? 'Campurile pot fi editate. Completeaza endpoint, bucket, access key, secret key si regiunea.'
            : 'Campurile sunt blocate. Apasa „Editeaza setari storage” pentru a modifica valorile.'}
        </p>

        {hetznerTestResult && (
          <div
            className={`rounded-lg p-3 flex items-center gap-2 text-sm font-medium ${
              hetznerTestResult === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {hetznerTestResult === 'success' ? (
              <>
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Conexiune reusita — Hetzner Object Storage este accesibil.
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Conexiune esuata — verifica endpoint-ul, bucket-ul si cheile de acces.
              </>
            )}
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
          <button onClick={handleHetznerSave} className="btn-primary" disabled={!hetznerEditing}>
            {hetznerSaved ? '✓ Setari salvate' : 'Salveaza setari storage'}
          </button>
          <button
            onClick={handleHetznerTest}
            className="btn-secondary"
            disabled={!hetznerEditing || hetznerTesting}
          >
            {hetznerTesting ? 'Testeaza conexiunea…' : 'Testeaza conexiunea'}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Backups</h3>
        <div className="space-y-2">
          {mockBackups.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    b.status === 'success' ? 'bg-positive' : 'bg-negative'
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{b.date}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.type} · {b.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={b.status === 'success' ? 'badge badge-green' : 'badge badge-red'}>
                  {b.status === 'success' ? 'Success' : 'Failed'}
                </span>
                {b.status === 'success' && (
                  <button className="btn-ghost text-xs py-1 px-2">Restore</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
