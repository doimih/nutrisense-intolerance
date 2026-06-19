'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useSearchParams } from 'next/navigation';

type AILogLevel = 'info' | 'warning' | 'error';
type AILogSource = 'frontend' | 'orchestrator' | 'worker' | 'ai' | 'system';

type AILogRecord = {
  id: string;
  timestamp: string;
  sessionId: string;
  userId: string | null;
  source: AILogSource;
  level: AILogLevel;
  intent: string | null;
  worker: string | null;
  model: string | null;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  shortMessage?: string;
};

type Filters = {
  level: string;
  worker: string;
  intent: string;
  model: string;
  from: string;
  to: string;
  q: string;
};

type LogsResponse = {
  logs: AILogRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

const INITIAL_FILTERS: Filters = {
  level: '',
  worker: '',
  intent: '',
  model: '',
  from: '',
  to: '',
  q: '',
};

function levelBadge(level: AILogLevel) {
  if (level === 'error') return 'bg-red-100 text-red-700 border-red-200';
  if (level === 'warning') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-emerald-100 text-emerald-700 border-emerald-200';
}

function toIsoOrEmpty(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

const VALID_LEVELS: AILogLevel[] = ['info', 'warning', 'error'];

function AdminAILogsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedLevel = searchParams.get('level');
  const [filters, setFilters] = useState<Filters>(() => ({
    ...INITIAL_FILTERS,
    level: VALID_LEVELS.includes(requestedLevel as AILogLevel) ? (requestedLevel as string) : '',
  }));
  const [logs, setLogs] = useState<AILogRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<AILogRecord | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (filters.level) params.set('level', filters.level);
    if (filters.worker) params.set('worker', filters.worker);
    if (filters.intent) params.set('intent', filters.intent);
    if (filters.model) params.set('model', filters.model);
    if (filters.q) params.set('q', filters.q);
    if (filters.from) params.set('from', toIsoOrEmpty(filters.from));
    if (filters.to) params.set('to', toIsoOrEmpty(filters.to));
    return params.toString();
  }, [filters, page, pageSize]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/logs?${queryString}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to load logs');
      }
      const payload = (await response.json()) as LogsResponse;
      setLogs(payload.logs || []);
      setTotalPages(payload.pagination?.totalPages || 1);
      setTotalRows(payload.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const workers = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.worker).filter(Boolean) as string[])).sort();
  }, [logs]);

  const intents = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.intent).filter(Boolean) as string[])).sort();
  }, [logs]);

  const models = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.model).filter(Boolean) as string[])).sort();
  }, [logs]);

  const exportCsv = () => {
    const headers = [
      'timestamp',
      'level',
      'source',
      'worker',
      'intent',
      'model',
      'sessionId',
      'userId',
      'message',
    ];

    const lines = logs.map((log) => {
      const message =
        (typeof log.metadata?.message === 'string' && log.metadata.message) ||
        (log.shortMessage || '') ||
        (typeof log.error?.message === 'string' ? log.error.message : '');

      return [
        log.timestamp,
        log.level,
        log.source,
        log.worker || '',
        log.intent || '',
        log.model || '',
        log.sessionId,
        log.userId || '',
        String(message).replace(/"/g, '""'),
      ]
        .map((value) => `"${value}"`)
        .join(',');
    });

    const blob = new Blob([[headers.join(','), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });

    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = `ai-logs-${new Date().toISOString().slice(0, 19)}.csv`;
    anchor.click();
    URL.revokeObjectURL(href);
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title">AI Logs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Unified logs for frontend, orchestrator, workers, AI model, and system errors
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh (10s)
            </label>
            <button className="btn-secondary" onClick={fetchLogs}>
              Refresh
            </button>
            <button className="btn-primary" onClick={exportCsv}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              className="input-field"
              placeholder="Search"
              value={filters.q}
              onChange={(e) => {
                setPage(1);
                setFilters((current) => ({ ...current, q: e.target.value }));
              }}
            />

            <select
              className="input-field"
              value={filters.level}
              onChange={(e) => {
                setPage(1);
                setFilters((current) => ({ ...current, level: e.target.value }));
              }}
            >
              <option value="">All levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>

            <select
              className="input-field"
              value={filters.worker}
              onChange={(e) => {
                setPage(1);
                setFilters((current) => ({ ...current, worker: e.target.value }));
              }}
            >
              <option value="">All workers</option>
              {workers.map((worker) => (
                <option key={worker} value={worker}>
                  {worker}
                </option>
              ))}
            </select>

            <select
              className="input-field"
              value={filters.intent}
              onChange={(e) => {
                setPage(1);
                setFilters((current) => ({ ...current, intent: e.target.value }));
              }}
            >
              <option value="">All intents</option>
              {intents.map((intent) => (
                <option key={intent} value={intent}>
                  {intent}
                </option>
              ))}
            </select>

            <select
              className="input-field"
              value={filters.model}
              onChange={(e) => {
                setPage(1);
                setFilters((current) => ({ ...current, model: e.target.value }));
              }}
            >
              <option value="">All models</option>
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>

            <input
              className="input-field"
              type="datetime-local"
              value={filters.from}
              onChange={(e) => {
                setPage(1);
                setFilters((current) => ({ ...current, from: e.target.value }));
              }}
            />

            <input
              className="input-field"
              type="datetime-local"
              value={filters.to}
              onChange={(e) => {
                setPage(1);
                setFilters((current) => ({ ...current, to: e.target.value }));
              }}
            />

            <button
              className="btn-secondary"
              onClick={() => {
                setPage(1);
                setFilters(INITIAL_FILTERS);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
                  <th className="px-4 py-3 text-left font-semibold">Level</th>
                  <th className="px-4 py-3 text-left font-semibold">Source</th>
                  <th className="px-4 py-3 text-left font-semibold">Worker</th>
                  <th className="px-4 py-3 text-left font-semibold">Intent</th>
                  <th className="px-4 py-3 text-left font-semibold">Model</th>
                  <th className="px-4 py-3 text-left font-semibold">Short message</th>
                  <th className="px-4 py-3 text-left font-semibold">View details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      Loading logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${levelBadge(log.level)}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize">{log.source}</td>
                      <td className="px-4 py-3">{log.worker || '—'}</td>
                      <td className="px-4 py-3">{log.intent || '—'}</td>
                      <td className="px-4 py-3">{log.model || '—'}</td>
                      <td className="px-4 py-3 max-w-[340px] truncate">
                        {(typeof log.metadata?.message === 'string' && log.metadata.message) || log.shortMessage || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button className="btn-secondary" onClick={() => setSelectedLog(log)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
            <p className="text-muted-foreground">
              Total: {totalRows} | Page {page} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <select
                className="input-field h-9"
                value={pageSize}
                onChange={(e) => {
                  setPage(1);
                  setPageSize(Number(e.target.value));
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Prev
              </button>
              <button
                className="btn-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
      </div>

      {selectedLog ? (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Log Details</h2>
              <button className="btn-secondary" onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>
            <div className="p-5 overflow-auto max-h-[70vh]">
              <pre className="text-xs bg-muted/60 p-4 rounded-lg border border-border overflow-auto">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}

export default function AdminAILogsPage() {
  return (
    <Suspense fallback={null}>
      <AdminAILogsContent />
    </Suspense>
  );
}
