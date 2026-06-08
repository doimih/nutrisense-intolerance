'use client';
/**
 * Shared UI primitives for the AI Test Lab page.
 * CodePanel  — syntax-highlighted JSON viewer with copy button
 * LogStream  — real-time colour-coded log list with auto-scroll
 * StatusBadge — pill badge for info/warning/error/success
 * CollapsibleSection — expand/collapse wrapper
 */

import React, { useEffect, useRef, useState } from 'react';

// ─── StatusBadge ──────────────────────────────────────────────────────────────

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'corrected' | 'neutral';

const BADGE_STYLES: Record<StatusVariant, string> = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  corrected: 'bg-purple-100 text-purple-700 border-purple-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function StatusBadge({ label, variant }: { label: string; variant: StatusVariant }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${BADGE_STYLES[variant]}`}>
      {label}
    </span>
  );
}

// ─── CodePanel ────────────────────────────────────────────────────────────────

type CodePanelProps = {
  value: string;
  label?: string;
  maxHeight?: string;
  lang?: 'json' | 'typescript' | 'text';
  editable?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

function syntaxHighlight(json: string): string {
  // Basic JSON syntax colouring via HTML spans
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-amber-600'; // number
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'text-blue-400' : 'text-emerald-400'; // key or string
        } else if (/true|false/.test(match)) {
          cls = 'text-purple-400';
        } else if (/null/.test(match)) {
          cls = 'text-slate-400';
        }
        return `<span class="${cls}">${match}</span>`;
      },
    );
}

export function CodePanel({ value, label, maxHeight = '320px', lang = 'json', editable = false, onChange, placeholder, rows = 8 }: CodePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isValid = lang === 'json' && value.trim() !== '';
  let parseError = '';
  if (isValid) {
    try { JSON.parse(value); } catch (e) { parseError = (e as Error).message; }
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {(label || !editable) && (
        <div className="flex items-center justify-between bg-muted/60 px-3 py-1.5 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground">{label ?? lang.toUpperCase()}</span>
          <div className="flex items-center gap-2">
            {parseError && <span className="text-xs text-red-500 truncate max-w-xs">⚠ {parseError}</span>}
            <button onClick={handleCopy} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
      {editable ? (
        <textarea
          className="w-full font-mono text-xs bg-slate-950 text-slate-100 p-3 resize-y outline-none min-h-[120px] scrollbar-thin"
          style={{ maxHeight }}
          rows={rows}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
        />
      ) : (
        <pre
          className="overflow-auto p-3 bg-slate-950 text-slate-100 text-xs font-mono scrollbar-thin leading-relaxed"
          style={{ maxHeight }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: lang === 'json' ? syntaxHighlight(value) : value }}
        />
      )}
    </div>
  );
}

// ─── LogStream ────────────────────────────────────────────────────────────────

export type LogEntry = {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  event: string;
  worker?: string | null;
  message?: string;
};

const LOG_LINE_STYLES: Record<'info' | 'warning' | 'error', string> = {
  info: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
};

type LogStreamProps = {
  logs: LogEntry[];
  autoRefresh?: boolean;
  maxHeight?: string;
};

export function LogStream({ logs, autoRefresh = true, maxHeight = '220px' }: LogStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoRefresh && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoRefresh]);

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-slate-950 px-4 py-6 text-center text-xs text-slate-500">
        No logs yet. Run a test to see real-time log entries.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-slate-950 overflow-auto text-xs font-mono p-3 space-y-0.5 scrollbar-thin" style={{ maxHeight }}>
      {logs.map((log) => (
        <div key={log.id} className="flex items-start gap-2">
          <span className="text-slate-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
          <span className={`shrink-0 font-semibold ${LOG_LINE_STYLES[log.level]}`}>[{log.level.toUpperCase()}]</span>
          {log.worker && <span className="text-blue-400 shrink-0">[{log.worker}]</span>}
          <span className="text-slate-300">{log.event}{log.message ? `: ${log.message}` : ''}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

// ─── CollapsibleSection ───────────────────────────────────────────────────────

type CollapsibleSectionProps = {
  title: string;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function CollapsibleSection({ title, badge, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/50 hover:bg-muted transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge}
        </div>
        <span className="text-xs text-muted-foreground">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

// ─── ValidationRow ────────────────────────────────────────────────────────────

export function ValidationRow({ label, valid, errors }: { label: string; valid: boolean; errors?: string[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <StatusBadge label={label} variant={valid ? 'success' : 'error'} />
        <span className="text-xs text-muted-foreground">{valid ? '✓ Passed' : `✗ ${(errors ?? []).length} error(s)`}</span>
      </div>
      {!valid && errors && errors.length > 0 && (
        <ul className="space-y-1 mt-1">
          {errors.map((e, i) => (
            <li key={`verr-${i}`} className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-800 rounded px-2 py-1">
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── JsonInput ────────────────────────────────────────────────────────────────

type JsonInputProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  rows?: number;
};

export function JsonInput({ value, onChange, label, placeholder, rows = 6 }: JsonInputProps) {
  let parseError = '';
  if (value.trim()) {
    try { JSON.parse(value); } catch (e) { parseError = (e as Error).message; }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="label-text">{label}</label>
        {parseError && <span className="text-xs text-red-500">⚠ Invalid JSON: {parseError}</span>}
      </div>
      <textarea
        className={`input-field font-mono text-xs resize-y ${parseError ? 'border-red-400' : ''}`}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  );
}
