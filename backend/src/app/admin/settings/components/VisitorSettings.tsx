'use client';
import React, { useCallback, useEffect, useState } from 'react';

type VisitorSession = {
  id: string;
  system: 'backend' | 'frontend';
  ip: string;
  sessionStartsAt: string;
  sessionExpiresAt: string;
  blockUntil: string;
  resetBy: string | null;
  resetAt: string | null;
  status: 'active' | 'blocked' | 'expired';
  blockRemainingMinutes: number;
};

const VISITOR_EMAIL = 'visitor@nutriaid.eu';
const VISITOR_PASSWORD = 'NutriDemo@2025!';

function StatusBadge({ status, blockRemainingMinutes }: { status: VisitorSession['status']; blockRemainingMinutes: number }) {
  if (status === 'active') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Activa</span>;
  }
  if (status === 'blocked') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">Blocat ({blockRemainingMinutes} min)</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">Expirat/Blocat</span>;
}

export default function VisitorSettings() {
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const loadSessions = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/api/superadmin/visitor/sessions')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { sessions?: VisitorSession[] }) => {
        setSessions(data.sessions ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError('Nu s-au putut incarca sesiunile.');
        setLoading(false);
      });
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const handleReset = async (session: VisitorSession) => {
    setResetting(session.id);
    setResetResult(null);
    const res = await fetch('/api/superadmin/visitor/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id }),
    }).catch(() => null);
    setResetting(null);
    if (!res) {
      setResetResult({ ok: false, message: 'Cererea a esuat.' });
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    setResetResult({ ok: res.ok && data.ok !== false, message: data.message || 'Eroare.' });
    if (res.ok && data.ok !== false) setTimeout(loadSessions, 200);
    setTimeout(() => setResetResult(null), 5000);
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text).catch(() => null);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const backendSessions = sessions.filter((s) => s.system === 'backend');
  const frontendSessions = sessions.filter((s) => s.system === 'frontend');

  return (
    <div className="space-y-5">
      {/* Credentials card */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="section-header">Credentiale Vizitator</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Contul de demo pentru acces temporar pe platforma</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-foreground flex-1">{VISITOR_EMAIL}</code>
              <button
                onClick={() => void handleCopy(VISITOR_EMAIL, 'email')}
                className="text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground hover:opacity-80 transition-opacity flex-shrink-0"
              >
                {copied === 'email' ? '✓' : 'Copiaza'}
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Parola</p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-foreground flex-1">{VISITOR_PASSWORD}</code>
              <button
                onClick={() => void handleCopy(VISITOR_PASSWORD, 'pass')}
                className="text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground hover:opacity-80 transition-opacity flex-shrink-0"
              >
                {copied === 'pass' ? '✓' : 'Copiaza'}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
          <p className="font-medium">Restrictii acces vizitator</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            <div className="space-y-1">
              <p className="font-medium text-slate-600 text-xs uppercase tracking-wide">Backend (Admin Console)</p>
              <p>• Acces vizualizare — <strong>10 minute</strong></p>
              <p>• O singura intrare per IP</p>
              <p>• Blocat <strong>24 ore</strong> dupa expirare</p>
              <p>• Deblocare manuala de catre superadmin</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-600 text-xs uppercase tracking-wide">Frontend (Platforma)</p>
              <p>• Plan <strong>Pro Plus (Enterprise)</strong></p>
              <p>• Sesiune <strong>15 minute</strong></p>
              <p>• O singura intrare per IP</p>
              <p>• Blocat <strong>24 ore</strong> dupa expirare</p>
            </div>
          </div>
        </div>
      </div>

      {resetResult && (
        <div className={`rounded-lg p-3 flex items-center gap-2 text-sm font-medium ${resetResult.ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {resetResult.ok ? '✓' : '✗'} {resetResult.message}
        </div>
      )}

      {/* Backend sessions */}
      <SessionTable
        title="Sesiuni Backend (Admin Console)"
        system="backend"
        sessions={backendSessions}
        loading={loading}
        error={error}
        resetting={resetting}
        onReset={handleReset}
        onReload={loadSessions}
      />

      {/* Frontend sessions */}
      <SessionTable
        title="Sesiuni Frontend (Platforma)"
        system="frontend"
        sessions={frontendSessions}
        loading={loading}
        error={error}
        resetting={resetting}
        onReset={handleReset}
        onReload={loadSessions}
      />
    </div>
  );
}

function SessionTable({
  title,
  sessions,
  loading,
  error,
  resetting,
  onReset,
  onReload,
}: {
  title: string;
  system: 'backend' | 'frontend';
  sessions: VisitorSession[];
  loading: boolean;
  error: string | null;
  resetting: string | null;
  onReset: (s: VisitorSession) => void;
  onReload: () => void;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          onClick={onReload}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ↻ Reincarca
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-6">Se incarca…</p>
      ) : error ? (
        <p className="text-sm text-negative text-center py-6">{error}</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nu exista sesiuni inregistrate inca.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-4 font-medium text-muted-foreground">IP</th>
                <th className="pb-2 pr-4 font-medium text-muted-foreground">Inceput</th>
                <th className="pb-2 pr-4 font-medium text-muted-foreground">Expira sesiune</th>
                <th className="pb-2 pr-4 font-medium text-muted-foreground">Blocat pana la</th>
                <th className="pb-2 pr-4 font-medium text-muted-foreground">Status</th>
                <th className="pb-2 font-medium text-muted-foreground">Actiuni</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-4 font-mono text-xs text-foreground">{s.ip}</td>
                  <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                    {fmt(s.sessionStartsAt)}
                  </td>
                  <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                    {fmt(s.sessionExpiresAt)}
                  </td>
                  <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                    {fmt(s.blockUntil)}
                  </td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={s.status} blockRemainingMinutes={s.blockRemainingMinutes} />
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => onReset(s)}
                      disabled={resetting === s.id}
                      className="text-xs px-2 py-1 rounded border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {resetting === s.id ? 'Se reseteaza…' : 'Reseteaza acces'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleString('ro-RO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
