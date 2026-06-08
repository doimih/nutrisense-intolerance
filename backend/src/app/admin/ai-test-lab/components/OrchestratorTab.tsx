'use client';

import React, { useState } from 'react';
import {
  CodePanel,
  CollapsibleSection,
  JsonInput,
  LogEntry,
  LogStream,
  StatusBadge,
  ValidationRow,
} from './shared';

const DEFAULT_SCENARIO = JSON.stringify({
  userMessage: 'Create a weekly meal plan for me',
  userProfile: { age: 35, sex: 'female', weightKg: 65, goal: 'lose weight' },
  intolerances: ['gluten'],
  allergies: [],
  nutritionalGoals: { kcal: 1800, proteinG: 110 },
}, null, 2);

type WorkerSummary = {
  workerId: string;
  schemaValid: boolean;
  semanticValid: boolean;
  corrected: boolean;
  correctionIncomplete: boolean;
  correctionModel: string | null;
  errors: string[];
  finalOutput: Record<string, unknown>;
  totalMs: number;
};

type OrchestratorTestResult = {
  sessionId: string;
  intent: string;
  workerSequence: string[];
  workerSummaries: WorkerSummary[];
  finalResponse: Record<string, unknown>;
  totalMs: number;
  hasErrors: boolean;
};

export default function OrchestratorTab() {
  const [scenarioJson, setScenarioJson] = useState(DEFAULT_SCENARIO);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrchestratorTestResult | null>(null);
  const [apiError, setApiError] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (level: LogEntry['level'], event: string, worker?: string, message?: string) => {
    setLogs((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString(), level, event, worker, message },
    ]);
  };

  const handleRun = async () => {
    setApiError('');
    setResult(null);

    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(scenarioJson) as Record<string, unknown>; } catch {
      setApiError('Scenario JSON is not valid.');
      return;
    }

    setLoading(true);
    addLog('info', 'orchestrator_test_started', undefined, parsed['userMessage'] as string);

    try {
      const response = await fetch('/api/admin/tests/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = (await response.json()) as OrchestratorTestResult & { error?: string };

      if (!response.ok) { setApiError(data.error ?? `HTTP ${response.status}`); return; }

      setResult(data);
      addLog('info', 'orchestrator_routing', undefined, `intent=${data.intent} workers=${data.workerSequence.join(' → ')}`);

      for (const ws of data.workerSummaries) {
        addLog(
          ws.corrected ? 'warning' : 'info',
          ws.corrected ? 'worker_auto_correction' : 'worker_validation',
          ws.workerId,
          ws.corrected ? `${ws.errors.length} error(s) corrected via ${ws.correctionModel ?? 'rule-based'}` : 'passed',
        );
      }

      if (data.hasErrors) addLog('error', 'orchestrator_has_errors', undefined, 'One or more workers had incomplete corrections');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setApiError(msg);
      addLog('error', 'orchestrator_test_error', undefined, msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ─── Input ─── */}
        <div className="space-y-4">
          <JsonInput
            label="Scenario JSON"
            value={scenarioJson}
            onChange={setScenarioJson}
            placeholder='{"userMessage":"...","intolerances":[],"allergies":[]}'
            rows={12}
          />
          <button className="btn-primary w-full" onClick={handleRun} disabled={loading}>
            {loading ? 'Running orchestrator test...' : 'Run Orchestrator Test'}
          </button>
          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiError}</div>
          )}
        </div>

        {/* ─── Output ─── */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge label={`Intent: ${result.intent}`} variant="info" />
                <StatusBadge label={result.hasErrors ? 'Has Errors' : 'Clean'} variant={result.hasErrors ? 'error' : 'success'} />
                <span className="text-xs text-muted-foreground">{result.totalMs} ms</span>
              </div>

              <CollapsibleSection title={`Worker Chain (${result.workerSequence.length})`} defaultOpen>
                <div className="flex flex-wrap gap-1 mb-3">
                  {result.workerSequence.map((id, idx) => (
                    <React.Fragment key={id}>
                      <span className="text-xs bg-muted border border-border rounded px-2 py-0.5 font-mono">{id}</span>
                      {idx < result.workerSequence.length - 1 && <span className="text-muted-foreground text-xs self-center">→</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="space-y-2">
                  {result.workerSummaries.map((ws) => (
                    <CollapsibleSection
                      key={ws.workerId}
                      title={ws.workerId}
                      badge={
                        <div className="flex gap-1">
                          <StatusBadge label={ws.schemaValid && ws.semanticValid ? '✓' : '✗'} variant={ws.schemaValid && ws.semanticValid ? 'success' : 'error'} />
                          {ws.corrected && <StatusBadge label="corrected" variant="corrected" />}
                        </div>
                      }
                    >
                      <div className="space-y-2">
                        <ValidationRow label="Schema" valid={ws.schemaValid} errors={ws.errors} />
                        <ValidationRow label="Semantic" valid={ws.semanticValid} errors={ws.errors} />
                        {ws.corrected && (
                          <div className="text-xs text-purple-700 bg-purple-50 dark:bg-purple-950/20 rounded px-2 py-1">
                            Auto-corrected via <strong>{ws.correctionModel ?? 'rule-based'}</strong> · {ws.totalMs} ms
                          </div>
                        )}
                        <CodePanel value={JSON.stringify(ws.finalOutput, null, 2)} lang="json" maxHeight="200px" label="Final Output" />
                      </div>
                    </CollapsibleSection>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Final Response" defaultOpen>
                <CodePanel value={JSON.stringify(result.finalResponse, null, 2)} lang="json" maxHeight="280px" />
              </CollapsibleSection>
            </>
          ) : (
            <div className="rounded-xl border border-border bg-muted/20 h-60 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Run an orchestrator test to see the full pipeline report.</p>
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
