'use client';
import React, { useCallback, useEffect, useState } from 'react';

type ArchiveLinkEntry = {
  id: string;
  sentToEmail: string;
  generatedBy: string;
  expiresAt: string;
  downloadedAt: string | null;
  createdAt: string;
  expired: boolean;
};

export default function ArchiveSettings() {
  const [email, setEmail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; downloadUrl?: string; expiresAt?: string } | null>(null);
  const [links, setLinks] = useState<ArchiveLinkEntry[]>([]);
  const [linksError, setLinksError] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadLinks = useCallback(() => {
    setLinksError(false);
    fetch('/api/superadmin/archive/links')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { links?: ArchiveLinkEntry[] }) => setLinks(data.links ?? []))
      .catch(() => setLinksError(true));
  }, []);

  useEffect(() => { loadLinks(); }, [loadLinks]);

  const handleGenerate = async () => {
    if (!email.trim()) return;
    setGenerating(true);
    setResult(null);
    const res = await fetch('/api/superadmin/archive/generate-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    }).catch(() => null);
    setGenerating(false);
    if (!res) {
      setResult({ ok: false, message: 'Request failed. Check your connection.' });
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; downloadUrl?: string; expiresAt?: string };
    setResult({ ok: res.ok && data.ok !== false, message: data.message || (res.ok ? 'Link generated.' : 'Error.'), downloadUrl: data.downloadUrl, expiresAt: data.expiresAt });
    if (res.ok && data.ok !== false) {
      setEmail('');
      setTimeout(loadLinks, 300);
    }
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url).catch(() => null);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Generator */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h2 className="section-header">Archive Link Generator</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Generates a secure link to download the platform archive. The link is valid for <strong>12 hours</strong>.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 space-y-1">
          <p className="font-medium">What&apos;s in the archive? (541 MB)</p>
          <p>• Full source code — Next.js frontend + backend</p>
          <p>• Complete folder structure, configs, and scripts</p>
          <p>• Dockerfiles, docker-compose, documentation (DOCKER.md)</p>
          <p>• node_modules and builds included — ready to run</p>
          <p>• Acquisition data (acquisition folder)</p>
          <p className="pt-1 text-blue-600 text-xs">Not included: secret keys (.env), runtime database</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label-text" htmlFor="archive-email">Recipient email</label>
            <input
              id="archive-email"
              className="input-field"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleGenerate(); }}
              disabled={generating}
            />
            <p className="helper-text">The archive link will be sent to this email address.</p>
          </div>

          <button
            onClick={() => void handleGenerate()}
            disabled={generating || !email.trim()}
            className="btn-primary"
          >
            {generating ? 'Generating…' : 'Generate and send link'}
          </button>
        </div>

        {result && (
          <div className={`rounded-lg p-3 space-y-2 text-sm font-medium ${result.ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            <div className="flex items-center gap-2">
              <span>{result.ok ? '✓' : '✗'}</span>
              <span>{result.message}</span>
            </div>
            {result.ok && result.downloadUrl && (
              <div className="flex items-center gap-2 pt-1">
                <code className="text-xs bg-white border border-green-200 rounded px-2 py-1 flex-1 truncate">
                  {result.downloadUrl}
                </code>
                <button
                  onClick={() => void handleCopy(result.downloadUrl!)}
                  className="text-xs px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors flex-shrink-0"
                >
                  {copied === result.downloadUrl ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            )}
            {result.ok && result.expiresAt && (
              <p className="text-xs text-green-700 font-normal">
                Expires at: {new Date(result.expiresAt).toLocaleString('en-GB')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* History */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Generated Links History</h3>
          <button
            onClick={loadLinks}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Reload"
          >
            ↻ Reload
          </button>
        </div>

        {linksError ? (
          <p className="text-sm text-negative text-center py-6">
            Could not load the links. Click ↻ Reload.
          </p>
        ) : links.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No links generated yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Sent to</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Generated by</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Expires at</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Status</th>
                  <th className="pb-2 font-medium text-muted-foreground">Downloaded at</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-4 text-foreground">{link.sentToEmail}</td>
                    <td className="py-2 pr-4 text-muted-foreground text-xs">{link.generatedBy}</td>
                    <td className="py-2 pr-4 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(link.expiresAt).toLocaleString('en-GB', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 pr-4">
                      {link.expired ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-muted-foreground text-xs">
                      {link.downloadedAt
                        ? new Date(link.downloadedAt).toLocaleString('en-GB', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
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
