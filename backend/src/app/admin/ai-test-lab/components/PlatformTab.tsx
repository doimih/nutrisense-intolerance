'use client';

import React, { useState } from 'react';
import {
  CodePanel,
  CollapsibleSection,
  JsonInput,
  LogEntry,
  LogStream,
  StatusBadge,
} from './shared';

const DEFAULT_SCENARIO = JSON.stringify({
  userMessage: 'Create a weekly meal plan for me',
  userProfile: { age: 40, sex: 'male', weightKg: 85, goal: 'lose weight', activityLevel: 'moderate' },
  intolerances: ['lactose'],
  allergies: ['peanuts'],
  nutritionalGoals: { kcal: 2000, proteinG: 130, carbsG: 200, fatG: 65 },
}, null, 2);

type PlatformStage = {
  stage: string;
  intent?: string;
  workerSequence?: string[];
  payload?: Record<string, unknown>;
  response?: Record<string, unknown>;
  workers?: Array<{
    workerId: string;
    schemaValid: boolean;
    semanticValid: boolean;
    corrected: boolean;
    correctionModel: string | null;
    errors: string[];
    finalOutput: Record<string, unknown>;
    totalMs: number;
  }>;
};

type PlatformTestResult = {
  sessionId: string;
  stages: PlatformStage[];
  totalMs: number;
  hasErrors: boolean;
};

export default function PlatformTab() {
  const [scenarioJson, setScenarioJson] = useState(DEFAULT_SCENARIO);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlatformTestResult | null>(null);
  const [apiError, setApiError] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (level: LogEntry['level'], event: string, worker?: string, message?: string) => {
    setLogs((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString(), level, event, worker, message }]);
  };

  const handleRun = async () => {
    setApiError('');
    setResult(null);

    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(scenarioJson) as Record<string, unknown>; } catch {
      setApiError('Scenario JSON is not valid.'); return;
    }

    setLoading(true);
    addLog('info', 'platform_test_started', undefined, parsed['userMessage'] as string);

    try {
      const response = await fetch('/api/admin/tests/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = (await response.json()) as PlatformTestResult & { error?: string };
      if (!response.ok) { setApiError(data.error ?? `HTTP ${response.status}`); return; }

      setResult(data);
      for (const stage of data.stages) {
        if (stage.stage === 'orchestrator_routing') {
          addLog('info', 'orchestrator_routing', undefined, `intent=${stage.intent ?? 'unknown'}`);
        }
        if (stage.stage === 'worker_chain' && stage.workers) {
          for (const w of stage.workers) {
            addLog(
              w.corrected ? 'warning' : 'info',
              w.corrected ? 'worker_auto_correction' : 'worker_validation',
              w.workerId,
              w.corrected ? `corrected via ${w.correctionModel ?? 'rule-based'}` : 'valid',
            );
          }
        }
      }
      if (data.hasErrors) addLog('error', 'platform_has_errors', undefined, 'Incomplete corrections detected');
      else addLog('info', 'platform_test_complete', undefined, `${data.totalMs} ms`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setApiError(msg);
      addLog('error', 'platform_test_error', undefined, msg);
    } finally {
      setLoading(false);
    }
  };

  const stageVariant = (stage: string): 'info' | 'success' | 'neutral' => {
    if (stage === 'frontend') return 'info';
    if (stage === 'final_output') return 'success';
    return 'neutral';
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <JsonInput label="Full Scenario JSON" value={scenarioJson} onChange={setScenarioJson} rows={14} />
          <button className="btn-primary w-full" onClick={handleRun} disabled={loading}>
            {loading ? 'Running platform test...' : 'Run Full Test'}
          </button>
          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiError}</div>
          )}
        </div>

        <div className="space-y-4">
          {result ? (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge label={result.hasErrors ? 'Has Errors' : 'All Passed'} variant={result.hasErrors ? 'error' : 'success'} />
                <span className="text-xs text-muted-foreground">Session: {result.sessionId.slice(0, 12)}… · {result.totalMs} ms</span>
              </div>

              {result.stages.map((stage, idx) => (
                <CollapsibleSection
                  key={`${stage.stage}-${idx}`}
                  title={stage.stage.replace(/_/g, ' ').toUpperCase()}
                  badge={<StatusBadge label={stage.stage} variant={stageVariant(stage.stage)} />}
                  defaultOpen={stage.stage !== 'worker_chain'}
                >
                  {stage.stage === 'orchestrator_routing' && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Intent: <span className="text-primary">{stage.intent}</span></div>
                      <div className="flex flex-wrap gap-1">
                        {(stage.workerSequence ?? []).map((id, i) => (
                          <React.Fragment key={id}>
                            <span className="text-xs bg-muted border border-border rounded px-2 py-0.5 font-mono">{id}</span>
                            {i < (stage.workerSequence ?? []).length - 1 && <span className="text-muted-foreground self-center text-xs">→</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                  {stage.stage === 'worker_chain' && stage.workers && (
                    <div className="space-y-2">
                      {stage.workers.map((w) => (
                        <div key={w.workerId} className="rounded-lg border border-border p-3 text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold">{w.workerId}</span>
                            <StatusBadge label={w.schemaValid && w.semanticValid ? 'valid' : 'invalid'} variant={w.schemaValid && w.semanticValid ? 'success' : 'error'} />
                            {w.corrected && <StatusBadge label={`corrected:${w.correctionModel ?? 'rule-based'}`} variant="corrected" />}
                            <span className="text-muted-foreground">{w.totalMs} ms</span>
                          </div>
                          {w.errors.length > 0 && (
                            <ul className="pl-2 space-y-0.5">
                              {w.errors.map((e, i) => (
                                <li key={i} className="text-red-600">• {e}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {(stage.stage === 'frontend' || stage.stage === 'final_output') && (
                    <CodePanel
                      value={JSON.stringify(stage.payload ?? stage.response ?? stage, null, 2)}
                      lang="json"
                      maxHeight="240px"
                    />
                  )}
                </CollapsibleSection>
              ))}
            </>
          ) : (
            <div className="rounded-xl border border-border bg-muted/20 h-60 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Run a full platform test to see stage-by-stage results.</p>
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
