'use client';

import React, { useRef, useState } from 'react';
import { CodePanel, CollapsibleSection, LogEntry, LogStream, StatusBadge } from './shared';

const EXAMPLE_PROMPTS = [
  'Generate a worker test for meal-plan-generator',
  'Generate an auto-correction test that simulates missing schema fields',
  'Generate a full platform test for a user with gluten intolerance',
  'Generate an orchestrator test for recipe intent',
  'Generate a safety test with allergen peanuts',
];

type GenerateResult = {
  testCode: string;
  fixture: string;
  scenario: Record<string, unknown>;
  correctionPromptPreview: string;
  mocks: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  generatedResult?: GenerateResult;
  timestamp: string;
};

export default function AIChatTab() {
  const [input, setInput] = useState('');
  const [workerId, setWorkerId] = useState('meal-plan-generator');
  const [userMessage, setUserMessage] = useState('Create a meal plan for me');
  const [testType, setTestType] = useState<'auto' | 'worker' | 'orchestrator' | 'auto-correction' | 'platform'>('auto');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to the NutriAID AI Test Chat. Describe the test you want to generate and I will produce the code, fixture, mocks, and scenario automatically.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [runResult, setRunResult] = useState<Record<string, unknown> | null>(null);
  const [runLoading, setRunLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addLog = (level: LogEntry['level'], event: string, message?: string) => {
    setLogs((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString(), level, event, message }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setApiError('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    addLog('info', 'test_generation_requested', input.slice(0, 80));

    try {
      const response = await fetch('/api/admin/tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          workerId,
          userMessage,
          testType: testType === 'auto' ? undefined : testType,
        }),
      });
      const data = (await response.json()) as GenerateResult & { error?: string };
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `Test generated successfully. Type: **${data.scenario['inferredType']}** · Worker: **${data.scenario['workerId']}**`,
        generatedResult: data,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      addLog('info', 'test_generation_complete', `type=${String(data.scenario['inferredType'])}`);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setApiError(msg);
      addLog('error', 'test_generation_error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRunNow = async (result: GenerateResult) => {
    setRunLoading(true);
    setRunResult(null);
    addLog('info', 'run_generated_test_started');

    try {
      const parsed = JSON.parse(result.fixture) as Record<string, unknown>;
      const endpoint =
        (parsed['expected'] as Record<string, unknown>)?.['intent'] === 'meal-plan' ||
        typeof (parsed as Record<string, unknown>)['userMessage'] === 'string'
          ? '/api/admin/tests/orchestrator'
          : '/api/admin/tests/worker';

      const body = endpoint === '/api/admin/tests/orchestrator'
        ? { userMessage: parsed['userMessage'] ?? 'Create a meal plan for me', intolerances: parsed['intolerances'] ?? [], allergies: parsed['allergies'] ?? [] }
        : { workerId, output: { worker: workerId, status: 'success', data: {}, notes: [] } };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as Record<string, unknown>;
      setRunResult(data);
      addLog('info', 'run_generated_test_complete', `endpoint=${endpoint}`);
    } catch (err) {
      addLog('error', 'run_generated_test_error', err instanceof Error ? err.message : 'Failed');
    } finally {
      setRunLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void handleGenerate();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">
      {/* ─── Chat area ─── */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label-text">Worker ID</label>
            <input className="input-field text-xs" value={workerId} onChange={(e) => setWorkerId(e.target.value)} />
          </div>
          <div>
            <label className="label-text">User Message</label>
            <input className="input-field text-xs" value={userMessage} onChange={(e) => setUserMessage(e.target.value)} />
          </div>
          <div>
            <label className="label-text">Test Type</label>
            <select className="input-field" value={testType} onChange={(e) => setTestType(e.target.value as typeof testType)}>
              <option value="auto">Auto-detect</option>
              <option value="worker">Worker Test</option>
              <option value="orchestrator">Orchestrator Test</option>
              <option value="auto-correction">Auto-Correction Test</option>
              <option value="platform">Platform Test</option>
            </select>
          </div>
        </div>

        {/* Message bubbles */}
        <div className="rounded-xl border border-border bg-muted/10 overflow-y-auto flex flex-col gap-3 p-4" style={{ minHeight: '360px', maxHeight: '480px' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.generatedResult && (
                  <div className="mt-3 space-y-2">
                    <CollapsibleSection title="Generated Test Code" defaultOpen>
                      <CodePanel value={msg.generatedResult.testCode} lang="typescript" maxHeight="240px" />
                    </CollapsibleSection>
                    <CollapsibleSection title="Generated Fixture">
                      <CodePanel value={msg.generatedResult.fixture} lang="json" maxHeight="160px" />
                    </CollapsibleSection>
                    <CollapsibleSection title="Generated Mocks">
                      <CodePanel value={msg.generatedResult.mocks} lang="typescript" maxHeight="120px" />
                    </CollapsibleSection>
                    <CollapsibleSection title="Correction Prompt Preview">
                      <CodePanel value={msg.generatedResult.correctionPromptPreview} lang="text" maxHeight="160px" />
                    </CollapsibleSection>
                    <button
                      className="btn-primary w-full mt-2"
                      onClick={() => void handleRunNow(msg.generatedResult!)}
                      disabled={runLoading}
                    >
                      {runLoading ? 'Running...' : 'Run Test Now'}
                    </button>
                  </div>
                )}

                <p className="text-xs opacity-50 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Example prompts */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              className="text-xs bg-muted border border-border rounded-full px-3 py-1 hover:bg-muted/80 transition-colors"
              onClick={() => setInput(p)}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="space-y-2">
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Describe the test you want to generate... (Ctrl+Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-2">
            <button className="btn-primary flex-1" onClick={handleGenerate} disabled={loading || !input.trim()}>
              {loading ? 'Generating...' : 'Generate Test'}
            </button>
            <button className="btn-secondary" onClick={() => { setMessages([messages[0]]); setLogs([]); setRunResult(null); }}>
              Clear
            </button>
          </div>
          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</div>
          )}
        </div>
      </div>

      {/* ─── Right panel: run result + logs ─── */}
      <div className="space-y-4">
        {runResult && (
          <CollapsibleSection title="Run Result" badge={<StatusBadge label="live" variant="success" />} defaultOpen>
            <CodePanel value={JSON.stringify(runResult, null, 2)} lang="json" maxHeight="360px" />
          </CollapsibleSection>
        )}
        <CollapsibleSection title="Logs" defaultOpen>
          <LogStream logs={logs} maxHeight="280px" />
        </CollapsibleSection>
      </div>
    </div>
  );
}
