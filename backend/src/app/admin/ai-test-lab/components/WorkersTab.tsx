'use client';

import React, { useId, useState } from 'react';
import {
  CodePanel,
  CollapsibleSection,
  JsonInput,
  LogEntry,
  LogStream,
  StatusBadge,
  ValidationRow,
} from './shared';

const WORKER_IDS = [
  'profile-analyzer',
  'intolerance-checker',
  'allergy-checker',
  'meal-plan-generator',
  'recipe-builder',
  'recipe-batch-generator',
  'recipe-instruction',
  'shopping-list',
  'supplement-advisor',
  'progress-tracking',
  'data-validator',
  'memory-worker',
  'pdf-generator',
];

const DEFAULT_OUTPUT = JSON.stringify({
  worker: 'meal-plan-generator',
  status: 'success',
  data: {
    meals: [
      { name: 'Breakfast: oats', ingredients: ['oats', 'banana'] },
      { name: 'Lunch: chicken salad', ingredients: ['chicken', 'lettuce', 'olive oil'] },
    ],
    totalKcal: 1800,
    disclaimer: 'NutriAID provides general nutrition guidance. This is not medical advice.',
  },
  notes: [],
}, null, 2);

type WorkerTestResult = {
  workerId: string;
  schemaName: string;
  schema_valid: boolean;
  logical_valid: boolean;
  safety_valid: boolean;
  errors: string[];
  corrected_output: Record<string, unknown>;
  corrected: boolean;
  diagnosticMs: number;
};

export default function WorkersTab() {
  const inputId = useId();
  const [workerId, setWorkerId] = useState('meal-plan-generator');
  const [outputJson, setOutputJson] = useState(DEFAULT_OUTPUT);
  const [intolerances, setIntolerances] = useState('');
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WorkerTestResult | null>(null);
  const [apiError, setApiError] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (level: LogEntry['level'], event: string, worker?: string, message?: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        level,
        event,
        worker,
        message,
      },
    ]);
  };

  const handleRun = async () => {
    setApiError('');
    setResult(null);

    let parsedOutput: unknown;
    try { parsedOutput = JSON.parse(outputJson); } catch {
      setApiError('Output is not valid JSON.');
      return;
    }

    setLoading(true);
    addLog('info', 'worker_test_started', workerId);
    try {
      const response = await fetch('/api/admin/tests/worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId,
          output: parsedOutput,
          input: {},
          intolerances: intolerances.split(',').map((s) => s.trim()).filter(Boolean),
          allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });

      const data = (await response.json()) as WorkerTestResult & { error?: string };
      if (!response.ok) { setApiError(data.error ?? `HTTP ${response.status}`); return; }

      setResult(data);
      addLog(
        data.schema_valid && data.logical_valid && data.safety_valid ? 'info' : 'warning',
        'worker_validation',
        workerId,
        `schema=${data.schema_valid} logical=${data.logical_valid} safety=${data.safety_valid}`,
      );
      if (data.corrected) {
        addLog('warning', 'worker_auto_correction', workerId, `${data.errors.length} error(s) corrected`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setApiError(msg);
      addLog('error', 'worker_test_error', workerId, msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ─── Input Panel ─── */}
        <div className="space-y-4">
          <div>
            <label htmlFor={`${inputId}-worker`} className="label-text">Select Worker</label>
            <select id={`${inputId}-worker`} className="input-field" value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
              {WORKER_IDS.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>

          <JsonInput
            label="Worker Output (JSON)"
            value={outputJson}
            onChange={setOutputJson}
            placeholder='{"worker":"...","status":"success","data":{},"notes":[]}'
            rows={10}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text">Intolerances (comma separated)</label>
              <input className="input-field" value={intolerances} onChange={(e) => setIntolerances(e.target.value)} placeholder="gluten, lactose" />
            </div>
            <div>
              <label className="label-text">Allergies (comma separated)</label>
              <input className="input-field" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="peanuts, shellfish" />
            </div>
          </div>

          <button className="btn-primary w-full" onClick={handleRun} disabled={loading}>
            {loading ? 'Running test...' : 'Run Test'}
          </button>

          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiError}</div>
          )}
        </div>

        {/* ─── Output Panel ─── */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{result.schemaName}</span>
                <StatusBadge label={result.corrected ? 'Auto-Corrected' : 'No correction'} variant={result.corrected ? 'corrected' : 'success'} />
                <span className="text-xs text-muted-foreground">{result.diagnosticMs} ms</span>
              </div>

              <div className="space-y-2">
                <ValidationRow label="Schema" valid={result.schema_valid} errors={result.schema_valid ? [] : result.errors.filter(e => e.toLowerCase().includes('schema') || e.toLowerCase().includes('field') || e.toLowerCase().includes('missing'))} />
                <ValidationRow label="Logic" valid={result.logical_valid} errors={result.logical_valid ? [] : result.errors.filter(e => e.toLowerCase().includes('logical'))} />
                <ValidationRow label="Safety" valid={result.safety_valid} errors={result.safety_valid ? [] : result.errors.filter(e => e.toLowerCase().includes('safety') || e.toLowerCase().includes('allergen'))} />
              </div>

              {result.errors.length > 0 && (
                <CollapsibleSection title={`All Errors (${result.errors.length})`} badge={<StatusBadge label={String(result.errors.length)} variant="error" />} defaultOpen>
                  <ul className="space-y-1">
                    {result.errors.map((e, i) => (
                      <li key={`err-${i}`} className="text-xs text-red-700 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-800 rounded px-2 py-1">{e}</li>
                    ))}
                  </ul>
                </CollapsibleSection>
              )}

              {result.corrected && (
                <CollapsibleSection title="Corrected Output" badge={<StatusBadge label="rule-based" variant="corrected" />} defaultOpen>
                  <CodePanel value={JSON.stringify(result.corrected_output, null, 2)} lang="json" maxHeight="280px" />
                </CollapsibleSection>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-border bg-muted/20 h-60 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Run a worker test to see the validation report here.</p>
            </div>
          )}
        </div>
      </div>

      <CollapsibleSection title="Logs" defaultOpen={false}>
        <LogStream logs={logs} />
      </CollapsibleSection>
    </div>
  );
}
