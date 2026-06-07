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

  const [hetznerHost, setHetznerHost] = useState('');
  const [hetznerUsername, setHetznerUsername] = useState('');
  const [hetznerPassword, setHetznerPassword] = useState('');
  const [hetznerPort, setHetznerPort] = useState('23');
  const [hetznerPath, setHetznerPath] = useState('/backups/nutrisense');
  const [hetznerProtocol, setHetznerProtocol] = useState('sftp');
  const [hetznerShowPassword, setHetznerShowPassword] = useState(false);
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
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            >
              <option value="s3">Amazon S3</option>
              <option value="gcs">Google Cloud Storage</option>
              <option value="local">Local Storage</option>
              <option value="supabase">Supabase Storage</option>
              <option value="hetzner">Hetzner Storage Box</option>
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
            <h3 className="text-sm font-semibold text-foreground">Hetzner Storage Box</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure your Hetzner Storage Box credentials for remote backups
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="label-text">Storage Box Host</label>
            <input
              className="input-field"
              type="text"
              placeholder="uXXXXXX.your-storagebox.de"
              value={hetznerHost}
              onChange={(e) => setHetznerHost(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Found in your Hetzner Robot panel under Storage Boxes
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="label-text">Protocol</label>
            <select
              className="input-field"
              value={hetznerProtocol}
              onChange={(e) => setHetznerProtocol(e.target.value)}
            >
              <option value="sftp">SFTP (recommended)</option>
              <option value="ftp">FTP</option>
              <option value="ftps">FTPS</option>
              <option value="samba">Samba / SMB</option>
              <option value="rsync">rsync over SSH</option>
            </select>
          </div>

          <div>
            <label className="label-text">Username</label>
            <input
              className="input-field"
              type="text"
              placeholder="uXXXXXX"
              value={hetznerUsername}
              onChange={(e) => setHetznerUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="label-text">Port</label>
            <input
              className="input-field"
              type="number"
              value={hetznerPort}
              onChange={(e) => setHetznerPort(e.target.value)}
              placeholder="23"
            />
            <p className="text-xs text-muted-foreground mt-1">Default: SFTP=23, FTP=21, SMB=445</p>
          </div>

          <div className="col-span-2">
            <label className="label-text">Password</label>
            <div className="relative">
              <input
                className="input-field pr-10"
                type={hetznerShowPassword ? 'text' : 'password'}
                placeholder="Storage Box password"
                value={hetznerPassword}
                onChange={(e) => setHetznerPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setHetznerShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {hetznerShowPassword ? (
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

          <div className="col-span-2">
            <label className="label-text">Remote Backup Path</label>
            <input
              className="input-field"
              type="text"
              placeholder="/backups/nutrisense"
              value={hetznerPath}
              onChange={(e) => setHetznerPath(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Directory on the Storage Box where backups will be stored
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex gap-3">
          <svg
            className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs text-blue-700">
            For improved security, consider creating a <strong>sub-account</strong> in Hetzner Robot
            with restricted access, or configure <strong>SSH key authentication</strong> instead of
            a password.
          </p>
        </div>

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
                Connection successful — Storage Box is reachable.
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
                Connection failed — check your credentials and host.
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button onClick={handleHetznerSave} className="btn-primary">
            {hetznerSaved ? '✓ Saved' : 'Save Hetzner Config'}
          </button>
          <button onClick={handleHetznerTest} className="btn-secondary" disabled={hetznerTesting}>
            {hetznerTesting ? 'Testing connection…' : 'Test Connection'}
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
