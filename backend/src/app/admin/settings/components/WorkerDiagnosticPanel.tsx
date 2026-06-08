'use client';

import React, { useState } from 'react';

type DiagnosticReport = {
  worker: string;
  schema_valid: boolean;
  logical_valid: boolean;
  safety_valid: boolean;
  errors: string[];
  corrected_output: Record<string, unknown>;
  corrected: boolean;
  diagnosticMs: number;
};

type WorkerOption = {
  id: string;
  name: string;
  inputSchema: string;
  outputSchema: string;
};

interface WorkerDiagnosticPanelProps {
  workers: WorkerOption[];
}

function badge(valid: boolean) {
  return valid
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-red-100 text-red-700 border-red-200';
}

function StatusBadge({ label, valid }: { label: string; valid: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${badge(valid)}`}
    >
      {valid ? '✓' : '✗'} {label}
    </span>
  );
}

export default function WorkerDiagnosticPanel({ workers }: WorkerDiagnosticPanelProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState(workers[0]?.id ?? '');
  const [workerOutputText, setWorkerOutputText] = useState('{\n  "worker": "",\n  "status": "success",\n  "data": {},\n  "notes": []\n}');
  const [intolerancesText, setIntolerancesText] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [goalsText, setGoalsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [apiError, setApiError] = useState('');

  const selectedWorker = workers.find((w) => w.id === selectedWorkerId);

  const handleRun = async () => {
    setApiError('');
    setReport(null);

    let parsedOutput: Record<string, unknown>;
    try {
      parsedOutput = JSON.parse(workerOutputText) as Record<string, unknown>;
    } catch {
      setApiError('Worker output is not valid JSON.');
      return;
    }

    let parsedExpectedSchema: Record<string, unknown> = {};
    if (selectedWorker?.inputSchema) {
      try {
        parsedExpectedSchema = JSON.parse(selectedWorker.inputSchema) as Record<string, unknown>;
      } catch {
        /* use empty schema */
      }
    }

    const intolerances = intolerancesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const allergies = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    let nutritionalGoals: Record<string, number> | undefined;
    if (goalsText.trim()) {
      try {
        nutritionalGoals = JSON.parse(goalsText) as Record<string, number>;
      } catch {
        /* ignore */
      }
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/workers/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker: selectedWorker?.name ?? selectedWorkerId,
          input: {},
          output: parsedOutput,
          expectedSchema: parsedExpectedSchema,
          intolerances,
          allergies,
          nutritionalGoals,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error ?? `HTTP ${response.status}`);
      }

      const data = (await response.json()) as DiagnosticReport;
      setReport(data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Diagnostic failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1">Worker Auto-Diagnostic & Auto-Correction</h3>
        <p className="text-sm text-muted-foreground">
          Validate a worker output against schema, logical rules, and safety constraints.
          Auto-correction is applied automatically when any layer fails.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left — inputs */}
        <div className="space-y-4">
          <div>
            <label className="label-text">Worker</label>
            <select
              className="input-field"
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">Worker Output (JSON)</label>
            <textarea
              className="input-field font-mono text-xs resize-none"
              rows={9}
              value={workerOutputText}
              onChange={(e) => setWorkerOutputText(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Intolerances (comma separated)</label>
              <input
                className="input-field"
                placeholder="gluten, lactose, fructose"
                value={intolerancesText}
                onChange={(e) => setIntolerancesText(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text">Allergies (comma separated)</label>
              <input
                className="input-field"
                placeholder="peanuts, shellfish"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Nutritional Goals (JSON, optional)</label>
            <input
              className="input-field font-mono text-xs"
              placeholder='{"kcal": 2000, "proteinG": 120}'
              value={goalsText}
              onChange={(e) => setGoalsText(e.target.value)}
            />
          </div>

          <button
            className="btn-primary w-full"
            onClick={handleRun}
            disabled={loading}
          >
            {loading ? 'Running diagnostic...' : 'Run Diagnostic & Auto-Correct'}
          </button>

          {apiError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          ) : null}
        </div>

        {/* Right — report */}
        <div className="space-y-4">
          {report ? (
            <>
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">
                    Diagnostic result — {report.worker}
                  </p>
                  <span className="text-xs text-muted-foreground">{report.diagnosticMs} ms</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge label="Schema" valid={report.schema_valid} />
                  <StatusBadge label="Logic" valid={report.logical_valid} />
                  <StatusBadge label="Safety" valid={report.safety_valid} />
                  {report.corrected ? (
                    <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      ⚠ Auto-corrected
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      ✓ No correction needed
                    </span>
                  )}
                </div>

                {report.errors.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Errors ({report.errors.length})</p>
                    <ul className="space-y-1">
                      {report.errors.map((error, index) => (
                        <li
                          key={`error-${index}`}
                          className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded px-2 py-1"
                        >
                          <span className="mt-0.5 shrink-0">✗</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700">No errors detected.</p>
                )}
              </div>

              <div>
                <p className="label-text mb-1">Corrected Output (JSON)</p>
                <pre className="rounded-lg border border-border bg-muted/50 p-3 text-xs font-mono overflow-auto max-h-72">
                  {JSON.stringify(report.corrected_output, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-border bg-muted/30 p-6 flex items-center justify-center h-full min-h-[300px]">
              <p className="text-sm text-muted-foreground text-center">
                Run a diagnostic to see the validation report and auto-corrected output here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
