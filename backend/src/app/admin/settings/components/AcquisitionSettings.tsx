'use client';
import React, { useCallback, useEffect, useState } from 'react';

type DownloadRecord = {
  id: string;
  timestamp: string;
  ip: string;
  country: string | null;
  userAgent: string;
  file: string;
  subfolder: string;
};

type StatsMap = Record<string, number>;

const ALL_DOCS = [
  'Executive-Summary.pdf',
  'Product-Overview.pdf',
  'Unique-Selling-Points.pdf',
  'Demo-Walkthrough.pdf',
  'Architecture-Report.pdf',
  'AI-Brain-Documentation.pdf',
  'Self-Healing-Layer.pdf',
  'Diagnostic-Engine.pdf',
  'Prompt-Rewriter.pdf',
  'Worker-Orchestration.pdf',
  'API-Documentation.pdf',
  'Database-Schema-Report.pdf',
  'Installation-Guide.pdf',
  'Deployment-Guide.pdf',
  'Scaling-Guide.pdf',
  'Market-Analysis.pdf',
  'Target-Audience-Report.pdf',
  'Competitive-Analysis.pdf',
  'Monetization-Models.pdf',
  'Cost-Structure.pdf',
  'Valuation-Report.pdf',
  'Growth-Strategy.pdf',
  'Media-Kit-Report.pdf',
  'Demo-Video-Script.pdf',
  'Short-Video-Script.pdf',
  'Branding-Guidelines.pdf',
  'NDA.pdf',
  'IP-Transfer-Agreement.pdf',
  'License-Agreement.pdf',
  'Terms-of-Sale.pdf',
  'Liability-Disclaimer.pdf',
];

function formatTs(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'UTC',
    }) + ' UTC';
  } catch {
    return iso;
  }
}

function AsciiBar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.round((value / max) * 20) : 0;
  return (
    <span className="font-mono text-xs text-emerald-600">
      {'█'.repeat(width)}{'░'.repeat(20 - width)} {value}
    </span>
  );
}

export default function AcquisitionSettings() {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [stats, setStats] = useState<StatsMap>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDoc, setFilterDoc] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [tab, setTab] = useState<'log' | 'stats'>('stats');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/superadmin/acquisition/downloads', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { downloads: DownloadRecord[]; stats: StatsMap; total: number };
      setDownloads(data.downloads ?? []);
      setStats(data.stats ?? {});
      setTotal(data.total ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = downloads.filter((d) => {
    if (filterDoc && d.file !== filterDoc) return false;
    if (filterDate && !d.timestamp.startsWith(filterDate)) return false;
    return true;
  });

  function exportCsv() {
    const header = 'timestamp,ip,country,file,subfolder,userAgent\n';
    const rows = filtered.map((d) =>
      [d.timestamp, d.ip, d.country ?? '', d.file, d.subfolder, `"${d.userAgent.replace(/"/g, "'")}"`].join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acquisition-downloads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const maxCount = Math.max(0, ...Object.values(stats));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Acquisition Downloads</h2>
          <p className="text-sm text-slate-500 mt-1">
            Tracks every PDF download from the Acquisition Portal — IP, country, user-agent, timestamp.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Downloads', value: total },
          { label: 'Unique Documents', value: Object.keys(stats).length },
          { label: 'Most Downloaded', value: Object.entries(stats).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace('.pdf', '') ?? '—' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {(['stats', 'log'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
              tab === t
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'stats' ? 'Document Stats' : 'Download Log'}
          </button>
        ))}
      </div>

      {/* Stats tab */}
      {tab === 'stats' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Downloads</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-64">Chart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ALL_DOCS.map((doc) => (
                <tr key={doc} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{doc.replace('.pdf', '').replace(/-/g, ' ')}</td>
                  <td className="px-4 py-2.5 text-slate-700 font-semibold">{stats[doc] ?? 0}</td>
                  <td className="px-4 py-2.5"><AsciiBar value={stats[doc] ?? 0} max={maxCount} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Log tab */}
      {tab === 'log' && (
        <div className="space-y-4">
          {/* Filters + export */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterDoc}
              onChange={(e) => setFilterDoc(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value="">All documents</option>
              {ALL_DOCS.map((d) => (
                <option key={d} value={d}>{d.replace('.pdf', '').replace(/-/g, ' ')}</option>
              ))}
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            />
            {(filterDoc || filterDate) && (
              <button
                onClick={() => { setFilterDoc(''); setFilterDate(''); }}
                className="text-sm text-slate-500 hover:text-red-600 transition"
              >
                Clear filters
              </button>
            )}
            <span className="text-sm text-slate-500 ml-auto">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
            <button
              onClick={exportCsv}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Export CSV
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Timestamp (UTC)</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">IP</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">Country</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">Section</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">User-Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      {loading ? 'Loading…' : 'No download records yet.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">{formatTs(d.timestamp)}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-700">{d.ip}</td>
                      <td className="px-4 py-2.5 text-slate-700">{d.country ?? '—'}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">{d.file.replace('.pdf', '')}</td>
                      <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{d.subfolder.replace(/-/g, ' ')}</td>
                      <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate" title={d.userAgent}>{d.userAgent}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
