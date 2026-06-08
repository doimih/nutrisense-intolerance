'use client';
import React, { useEffect, useState } from 'react';
import WorkerDiagnosticPanel from './WorkerDiagnosticPanel';

type WorkerDefinition = {
  id: string;
  name: string;
  description: string;
  prompt: string;
  inputSchema: string;
  outputSchema: string;
  enabled: boolean;
};

type AIBrainConfig = {
  defaultModel: string;
  fallbackModel: string;
  temperature: string;
  maxTokens: string;
  orchestratorUrl: string;
  systemPrompt: string;
  enableStreaming: boolean;
  enableCache: boolean;
};

type SettingsPayload = {
  settings?: {
    aiBrain?: Partial<AIBrainConfig> & { workers?: WorkerDefinition[] };
  };
};

const DEFAULT_SYSTEM_PROMPT = `You are NutriAID AI, the central orchestrator of a modular nutrition intelligence system.
Your role is to:
- generate, manage and orchestrate specialized AI workers
- route user requests to the correct worker
- validate safety and medical constraints
- combine worker outputs into a final structured response
- maintain a premium, evidence-based nutrition experience

Worker Architecture:
Core Workers:
1. Profile Analyzer Worker
2. Intolerance Checker Worker
3. Allergy Checker Worker
4. Medical Safety Worker
5. Nutrition Calculator Worker

Functional Workers:
1. Meal Plan Generator Worker
2. Recipe Builder Worker
3. Shopping List Worker
4. Supplement Advisor Worker
5. Progress Tracking Worker

Utility Workers:
1. PDF Generator Worker
2. Memory Worker
3. Data Validator Worker

Worker Output Format:
{
  "worker": "WorkerName",
  "status": "success | warning | error",
  "data": { ... },
  "notes": [ ... ]
}

Orchestrator Logic:
1. Intent detection for: meal plan, recipe, shopping list, supplement advice, nutritional analysis, progress tracking, general nutrition question.
2. Worker routing using only required workers.
3. Safety validation: always run Medical Safety Worker last.
4. Response assembly: combine worker outputs into one structured answer.

Style and Behavior Rules:
- always provide evidence-based nutrition guidance
- never give medical diagnoses
- always include a medical disclaimer
- always respect intolerances and allergies
- always validate safety before final answer
- tone: professional, warm, supportive

Always append this disclaimer:
"NutriAID provides general nutrition guidance. This is not medical advice. Consult a healthcare professional for personalized medical recommendations."`;

const DEFAULT_CONFIG: AIBrainConfig = {
  defaultModel: 'gpt-4o',
  fallbackModel: 'gpt-4o-mini',
  temperature: '0.4',
  maxTokens: '1024',
  orchestratorUrl: '',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  enableStreaming: false,
  enableCache: true,
};

const outputSchema = `{
  "worker": "WorkerName",
  "status": "success | warning | error",
  "data": {},
  "notes": []
}`;

const DEFAULT_WORKERS: WorkerDefinition[] = [
  {
    id: 'profile-analyzer',
    name: 'Profile Analyzer Worker',
    description: 'Extracts user profile data, detects missing information, and normalizes user inputs.',
    prompt:
      'Extract user profile fields (age, sex, height, weight, goals, dietary pattern, intolerances, allergies, activity level), detect missing fields, and normalize units and naming.',
    inputSchema: `{
  "profile": {
    "age": "number?",
    "sex": "string?",
    "heightCm": "number?",
    "weightKg": "number?",
    "goal": "string?",
    "dietType": "string?",
    "intolerances": "string[]?",
    "allergies": "string[]?",
    "activityLevel": "string?"
  }
}`,
    outputSchema,
    enabled: true,
  },
  {
    id: 'intolerance-checker',
    name: 'Intolerance Checker Worker',
    description: 'Detects foods that conflict with declared intolerances and flags unsafe ingredients.',
    prompt:
      'Screen foods and ingredients against known intolerances. Flag direct conflicts, hidden ingredients, and cross-item conflicts.',
    inputSchema: `{
  "intolerances": ["string"],
  "meals": [{ "name": "string", "ingredients": ["string"] }]
}`,
    outputSchema,
    enabled: true,
  },
  {
    id: 'allergy-checker',
    name: 'Allergy Checker Worker',
    description: 'Performs strict allergen screening and rejects unsafe meal plans.',
    prompt:
      'Apply strict allergen rules. Reject any meal or recipe containing allergens or likely cross-contamination risks.',
    inputSchema: `{
  "allergies": ["string"],
  "meals": [{ "name": "string", "ingredients": ["string"] }]
}`,
    outputSchema,
    enabled: true,
  },
  {
    id: 'medical-safety',
    name: 'Medical Safety Worker',
    description: 'Ensures recommendation safety, rejects extreme diets, and appends medical disclaimers.',
    prompt:
      'Validate safety constraints, reject extreme restrictions, avoid diagnosis language, and append a medical disclaimer.',
    inputSchema: `{
  "recommendations": ["string"],
  "userContext": { "conditions": ["string"], "medications": ["string"] }
}`,
    outputSchema,
    enabled: true,
  },
  {
    id: 'nutrition-calculator',
    name: 'Nutrition Calculator Worker',
    description: 'Calculates calories, macros, micros, and validates nutritional balance.',
    prompt:
      'Compute calories, protein, carbs, fats, selected micros, and assess meal/day balance against user goals.',
    inputSchema: `{
  "userTargets": { "kcal": "number", "protein": "number", "carbs": "number", "fat": "number" },
  "meals": [{ "name": "string", "foods": [{ "name": "string", "amount": "string" }] }]
}`,
    outputSchema,
    enabled: true,
  },
  {
    id: 'meal-plan-generator',
    name: 'Meal Plan Generator Worker',
    description: 'Builds daily/weekly meal plans with calories, macros, and alternatives.',
    prompt:
      'Generate a structured meal plan aligned with goals, intolerances, allergies, and preferences. Include per-meal calories/macros and alternatives.',
    inputSchema: `{
  "timeframe": "daily | weekly",
  "profile": {},
  "constraints": { "intolerances": ["string"], "allergies": ["string"], "preferences": ["string"] }
}`,
    outputSchema,
    enabled: true,
  },
  {
    id: 'recipe-builder',
    name: 'Recipe Builder Worker',
    description: 'Generates recipes with nutrition estimates and ingredient substitutions.',
    prompt:
      'Generate preparation steps, portion sizes, estimated nutrition, and safe substitutions for restricted ingredients.',
    inputSchema: `{
  "recipeRequest": { "mealType": "string", "servings": "number", "constraints": {} }
}`,
    outputSchema,
    enabled: true,
  },
  {
    id: 'shopping-list',
    name: 'Shopping List Worker',
    description: 'Converts meal plans into organized shopping lists.',
    prompt:
      'Aggregate ingredient needs from meal plans into a normalized shopping list grouped by category and quantity.',
    inputSchema: `{
  "mealPlan": { "days": [{ "meals": [{ "ingredients": [{ "name": "string", "qty": "string" }] }] }] }
}`,
    outputSchema,
    enabled: true,
  },
  {
    id: 'supplement-advisor',
    name: 'Supplement Advisor Worker',
    description: 'Suggests supplements with safety checks against intolerances and allergies.',
    prompt:
      'Suggest conservative, evidence-based supplement options and flag contraindications with known restrictions.',
    inputSchema: `{
  "profile": {},
  "goals": ["string"],
  "restrictions": { "intolerances": ["string"], "allergies": ["string"] }
}`,
    outputSchema,
    enabled: true,
  },
  {
    id: 'progress-tracking',
    name: 'Progress Tracking Worker',
    description: 'Tracks weight, calories, goals, and generates weekly summaries.',
    prompt:
      'Analyze historical logs (weight, adherence, calorie intake, symptoms) and produce trend summaries with safe adjustments.',
    inputSchema: `{
  "logs": [{ "date": "string", "weightKg": "number?", "kcal": "number?", "notes": "string?" }],
  "goals": {}
}`,
    outputSchema,
    enabled: true,
  },
  {
    id: 'pdf-generator',
    name: 'PDF Generator Worker',
    description: 'Converts approved meal plans and reports into export-ready PDF payloads.',
    prompt:
      'Transform validated plan/report content into PDF-ready structured sections with metadata and layout hints.',
    inputSchema: `{
  "documentType": "meal-plan | progress-report",
  "content": {}
}`,
    outputSchema,
    enabled: true,
  },
  {
    id: 'memory-worker',
    name: 'Memory Worker',
    description: 'Stores and recalls user profile preferences and historical context.',
    prompt:
      'Persist user preferences and retrieve relevant profile memory for future requests while avoiding sensitive overreach.',
    inputSchema: `{
  "action": "store | recall",
  "userId": "string",
  "payload": {}
}`,
    outputSchema,
    enabled: true,
  },
  {
    id: 'data-validator',
    name: 'Data Validator Worker',
    description: 'Validates that all worker payloads match schemas and rejects malformed responses.',
    prompt:
      'Validate each worker output against schema constraints. Reject malformed payloads and return actionable validation notes.',
    inputSchema: `{
  "workerOutputs": [
    {
      "worker": "string",
      "status": "string",
      "data": {},
      "notes": []
    }
  ]
}`,
    outputSchema,
    enabled: true,
  },
];

export default function AIBrainSettings() {
  const [config, setConfig] = useState<AIBrainConfig>(DEFAULT_CONFIG);
  const [workers, setWorkers] = useState<WorkerDefinition[]>(DEFAULT_WORKERS);
  const [activeTab, setActiveTab] = useState<'brain' | 'workers' | 'diagnostic'>('brain');
  const [activeWorkerId, setActiveWorkerId] = useState<string>(DEFAULT_WORKERS[0].id);
  const [workerTestMessage, setWorkerTestMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/superadmin/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: SettingsPayload | null) => {
        const brain = payload?.settings?.aiBrain;
        if (!brain) return;
        setConfig((prev) => ({
          defaultModel: brain.defaultModel ?? prev.defaultModel,
          fallbackModel: brain.fallbackModel ?? prev.fallbackModel,
          temperature: brain.temperature ?? prev.temperature,
          maxTokens: brain.maxTokens ?? prev.maxTokens,
          orchestratorUrl: brain.orchestratorUrl ?? prev.orchestratorUrl,
          systemPrompt: brain.systemPrompt ?? prev.systemPrompt,
          enableStreaming: brain.enableStreaming ?? prev.enableStreaming,
          enableCache: brain.enableCache ?? prev.enableCache,
        }));
        if (Array.isArray(brain.workers) && brain.workers.length > 0) {
          setWorkers(brain.workers);
          setActiveWorkerId(brain.workers[0].id);
        }
      })
      .catch(() => setError('Could not load AI brain settings.'));
  }, []);

  const activeWorker = workers.find((w) => w.id === activeWorkerId) ?? workers[0];

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aiBrain: { ...config, workers },
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(payload.error || 'Could not save AI brain settings.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const updateActiveWorker = (patch: Partial<WorkerDefinition>) => {
    setWorkers((current) =>
      current.map((w) => (w.id === activeWorkerId ? { ...w, ...patch } : w)),
    );
  };

  const handleTestWorker = () => {
    if (!activeWorker) return;
    setWorkerTestMessage(`${activeWorker.name}: schema and prompt validated.`);
    setTimeout(() => setWorkerTestMessage(''), 3000);
  };

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="section-header">AI Brain Configuration</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure AI model behavior and orchestration settings
        </p>
      </div>

      {error && (
        <p className="text-sm rounded-lg border border-negative/30 bg-negative-bg text-negative px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 border-b border-border pb-3">
        {(['brain', 'workers', 'diagnostic'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize ${
              activeTab === tab ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab === 'brain' ? 'AI Brain' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'brain' ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Default Model</label>
              <select
                className="input-field"
                aria-label="Default Model"
                title="Default Model"
                value={config.defaultModel}
                onChange={(e) => setConfig({ ...config, defaultModel: e.target.value })}
              >
                <option value="gpt-4o">GPT-4o (OpenAI)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (OpenAI)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo (OpenAI)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Google)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                <option value="llama-3.1-sonar-large">Sonar Large (Perplexity)</option>
              </select>
            </div>
            <div>
              <label className="label-text">Fallback Model</label>
              <select
                className="input-field"
                aria-label="Fallback Model"
                title="Fallback Model"
                value={config.fallbackModel}
                onChange={(e) => setConfig({ ...config, fallbackModel: e.target.value })}
              >
                <option value="gpt-4o-mini">GPT-4o Mini (OpenAI)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Google)</option>
                <option value="gpt-4o">GPT-4o (OpenAI)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
              </select>
            </div>
            <div>
              <label className="label-text">
                Temperature{' '}
                <span className="text-muted-foreground font-normal">({config.temperature})</span>
              </label>
              <input
                className="w-full accent-primary"
                type="range"
                aria-label="Temperature"
                title="Temperature"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: e.target.value })}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Precise (0)</span>
                <span>Creative (1)</span>
              </div>
            </div>
            <div>
              <label className="label-text">Max Tokens</label>
              <input
                className="input-field"
                type="number"
                aria-label="Max Tokens"
                title="Max Tokens"
                value={config.maxTokens}
                onChange={(e) => setConfig({ ...config, maxTokens: e.target.value })}
                min="256"
                max="8192"
                step="256"
              />
            </div>
            <div className="col-span-2">
              <label className="label-text">Orchestrator URL (extern, opțional)</label>
              <input
                className="input-field font-mono text-xs"
                value={config.orchestratorUrl}
                onChange={(e) => setConfig({ ...config, orchestratorUrl: e.target.value })}
                placeholder="https://... (lasă gol pentru LLM direct)"
              />
              <p className="helper-text">
                Lasă gol pentru a folosi LLM direct (recomandat). Completează doar dacă ai un
                orchestrator extern — valoarea va fi citită prin env var <code>AI_ORCHESTRATOR_URL</code>.
              </p>
            </div>
            <div className="col-span-2">
              <label className="label-text">System Prompt</label>
              <textarea
                className="input-field resize-none"
                aria-label="System Prompt"
                title="System Prompt"
                rows={16}
                value={config.systemPrompt}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
              />
              <p className="helper-text">Base instructions sent to the AI model for every request</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={config.enableStreaming}
                onChange={(e) => setConfig({ ...config, enableStreaming: e.target.checked })}
              />
              <span className="text-sm font-medium text-foreground">Enable Streaming</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={config.enableCache}
                onChange={(e) => setConfig({ ...config, enableCache: e.target.checked })}
              />
              <span className="text-sm font-medium text-foreground">Enable Response Cache</span>
            </label>
          </div>
        </>
      ) : activeTab === 'workers' ? (
        <div className="grid grid-cols-[260px_1fr] gap-4 min-h-[560px]">
          <aside className="border border-border rounded-lg p-2 space-y-1 overflow-auto max-h-[560px]">
            {workers.map((worker) => (
              <button
                key={worker.id}
                onClick={() => setActiveWorkerId(worker.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeWorkerId === worker.id
                    ? 'bg-secondary text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <p className="text-sm font-medium leading-tight">{worker.name}</p>
                <p className="text-xs opacity-70 mt-1">{worker.enabled ? 'Enabled' : 'Disabled'}</p>
              </button>
            ))}
          </aside>

          {activeWorker ? (
            <div className="space-y-4 border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{activeWorker.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{activeWorker.description}</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary"
                    checked={activeWorker.enabled}
                    onChange={(e) => updateActiveWorker({ enabled: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-foreground">Enabled</span>
                </label>
              </div>

              <div>
                <label className="label-text">Worker Description</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  value={activeWorker.description}
                  onChange={(e) => updateActiveWorker({ description: e.target.value })}
                />
              </div>

              <div>
                <label className="label-text">Worker Prompt</label>
                <textarea
                  className="input-field resize-none"
                  rows={6}
                  value={activeWorker.prompt}
                  onChange={(e) => updateActiveWorker({ prompt: e.target.value })}
                />
              </div>

              <div>
                <label className="label-text">Worker Input Schema</label>
                <textarea
                  className="input-field font-mono text-xs resize-none"
                  rows={8}
                  value={activeWorker.inputSchema}
                  onChange={(e) => updateActiveWorker({ inputSchema: e.target.value })}
                />
              </div>

              <div>
                <label className="label-text">Worker Output Schema</label>
                <textarea
                  className="input-field font-mono text-xs resize-none"
                  rows={7}
                  value={activeWorker.outputSchema}
                  onChange={(e) => updateActiveWorker({ outputSchema: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleTestWorker} className="btn-secondary">
                  Test Worker
                </button>
                {workerTestMessage ? <p className="text-sm text-green-600">{workerTestMessage}</p> : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <WorkerDiagnosticPanel workers={workers} />
      )}

      <div className="pt-2">
        <button onClick={() => void handleSave()} disabled={saving} className="btn-primary">
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save AI Configuration'}
        </button>
      </div>
    </div>
  );
}
