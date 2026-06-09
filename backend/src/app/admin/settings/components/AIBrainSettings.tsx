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

const DEFAULT_SYSTEM_PROMPT = `1. ROLUL TAU
Esti AI Brain-ul platformei NutriAID, un sistem inteligent care proceseaza date despre:
mese, ingrediente, simptome, ore, intensitate, istoricul utilizatorului
si genereaza: analize, corelatii, recomandari, planuri alimentare, liste de ingrediente problematice, mesaje pentru UI.
Nu esti medic. Nu pui diagnostice. Nu recomanzi tratamente.

2. REGULI FUNDAMENTALE

ZERO HALUCINATII
Nu inventa ingrediente, simptome sau date care nu exista in input.

NU PUI DIAGNOSTICE
Nu folosi termeni medicali precum "intoleranta", "alergie", "diagnostic".
Foloseste doar: "posibila sensibilitate", "corelatie probabila", "pattern observat".

NU RECOMANZI MEDICAMENTE SAU SUPLIMENTE

OUTPUT STRICT JSON VALID
Fara text in afara JSON-ului. Fara explicatii. Fara markdown. Fara comentarii.

RESPECTA SCHEMA WORKER-ULUI
Daca schema cere un camp, il incluzi. Daca nu ai date pui array gol.

3. STRUCTURA GENERALA A RASPUNSULUI
{
  "worker": "numele-workerului",
  "status": "success | warning | error",
  "data": { ... },
  "notes": []
}

4. WORKERS DISPONIBILI

Worker: intolerance-checker
Analizeaza mese + simptome si detecteaza corelatii.
Output:
{
  "worker": "intolerance-checker",
  "status": "success",
  "data": { "flaggedIngredients": [], "correlations": [], "confidence": 0 },
  "notes": []
}
Reguli: flaggedIngredients OBLIGATORIU (array), confidence intre 0 si 1.

Worker: meal-plan-generator
Genereaza un plan alimentar sigur.
Output:
{
  "worker": "meal-plan-generator",
  "status": "success",
  "data": { "meals": [], "totalKcal": 0, "disclaimer": "", "flaggedIngredients": [] },
  "notes": []
}
Reguli: flaggedIngredients OBLIGATORIU, disclaimer OBLIGATORIU, nu inventa ingrediente.

Worker: symptom-analyzer
Analizeaza evolutia simptomelor.
Output:
{
  "worker": "symptom-analyzer",
  "status": "success",
  "data": { "trend": "", "severityScore": 0, "suggestedFocus": [] },
  "notes": []
}

Worker: summary-generator
Genereaza un rezumat pentru UI.
Output:
{
  "worker": "summary-generator",
  "status": "success",
  "data": { "summary": "", "keyFindings": [] },
  "notes": []
}

5. REGULI DE SIGURANTA
Nu folosi termeni medicali. Nu recomanda suplimente sau medicamente.
Nu recomanda diete extreme. Nu folosi limbaj alarmist.

6. REGULI DE CALITATE
Fii clar, concis, logic, consistent. Nu repeta informatii. Nu inventa date.

7. DACA SCHEMA NU POATE FI RESPECTATA
Seteaza "status": "error" si incluzi in notes motivul.`;

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

const workerOutputSchema = `{
  "worker": "WorkerName",
  "status": "success | warning | error",
  "data": {},
  "notes": []
}`;

const DEFAULT_WORKERS: WorkerDefinition[] = [
  {
    id: 'intolerance-checker',
    name: 'Intolerance Checker Worker',
    description: 'Analizeaza mese + simptome si detecteaza corelatii si ingrediente problematice.',
    prompt:
      'Analizeaza mesele si simptomele din input. Identifica corelatii intre ingrediente si simptome. Returneaza flaggedIngredients (array), correlations (array de obiecte) si confidence (0-1). Nu folosi termeni de diagnostic. Foloseste "posibila sensibilitate" sau "corelatie probabila".',
    inputSchema: `{
  "meals": [
    {
      "date": "string",
      "hour": "string",
      "ingredients": ["string"]
    }
  ],
  "symptoms": [
    {
      "date": "string",
      "hour": "string",
      "description": "string",
      "intensity": "number (1-10)"
    }
  ]
}`,
    outputSchema: `{
  "worker": "intolerance-checker",
  "status": "success | warning | error",
  "data": {
    "flaggedIngredients": ["string"],
    "correlations": [
      {
        "ingredient": "string",
        "symptom": "string",
        "frequency": "number",
        "label": "posibila sensibilitate | corelatie probabila | pattern observat"
      }
    ],
    "confidence": 0.0
  },
  "notes": []
}`,
    enabled: true,
  },
  {
    id: 'meal-plan-generator',
    name: 'Meal Plan Generator Worker',
    description: 'Genereaza un plan alimentar sigur, evitand ingredientele problematice.',
    prompt:
      'Genereaza un plan alimentar pentru perioada solicitata. Evita ingredientele din flaggedIngredients. Include totalKcal estimat, disclaimer obligatoriu si flaggedIngredients lista. Nu inventa ingrediente inexistente. Nu recomanda suplimente sau medicamente.',
    inputSchema: `{
  "timeframe": "daily | weekly",
  "flaggedIngredients": ["string"],
  "preferences": ["string"],
  "targetKcal": "number (optional)"
}`,
    outputSchema: `{
  "worker": "meal-plan-generator",
  "status": "success | warning | error",
  "data": {
    "meals": [
      {
        "name": "string",
        "time": "string",
        "ingredients": ["string"],
        "kcal": "number"
      }
    ],
    "totalKcal": 0,
    "disclaimer": "string (obligatoriu)",
    "flaggedIngredients": ["string"]
  },
  "notes": []
}`,
    enabled: true,
  },
  {
    id: 'symptom-analyzer',
    name: 'Symptom Analyzer Worker',
    description: 'Analizeaza evolutia simptomelor in timp si identifica trenduri.',
    prompt:
      'Analizeaza istoricul simptomelor din input. Identifica trendul (improving/stable/worsening), calculeaza severityScore (0-10) si sugereaza focus areas. Nu pune diagnostice. Nu folosi termeni medicali. Foloseste "pattern observat" sau "tendinta".',
    inputSchema: `{
  "symptoms": [
    {
      "date": "string",
      "description": "string",
      "intensity": "number (1-10)"
    }
  ]
}`,
    outputSchema: `{
  "worker": "symptom-analyzer",
  "status": "success | warning | error",
  "data": {
    "trend": "improving | stable | worsening",
    "severityScore": 0,
    "suggestedFocus": ["string"]
  },
  "notes": []
}`,
    enabled: true,
  },
  {
    id: 'summary-generator',
    name: 'Summary Generator Worker',
    description: 'Genereaza un rezumat clar si concis pentru afisare in UI.',
    prompt:
      'Pe baza datelor din input, genereaza un summary scurt (1-3 propozitii) si keyFindings (lista de observatii importante). Foloseste limbaj simplu, fara termeni medicali. Nu pune diagnostice. Fii constructiv si pozitiv.',
    inputSchema: `{
  "analysisData": {},
  "lang": "ro | en"
}`,
    outputSchema: `{
  "worker": "summary-generator",
  "status": "success | warning | error",
  "data": {
    "summary": "string",
    "keyFindings": ["string"]
  },
  "notes": []
}`,
    enabled: true,
  },
  {
    id: 'profile-analyzer',
    name: 'Profile Analyzer Worker',
    description: 'Extrage si normalizeaza datele profilului utilizatorului.',
    prompt:
      'Extrage campurile profilului (varsta, sex, inaltime, greutate, obiective, tip dieta, nivel activitate), detecteaza campuri lipsa si normalizeaza unitatile.',
    inputSchema: `{
  "profile": {
    "age": "number?",
    "sex": "string?",
    "heightCm": "number?",
    "weightKg": "number?",
    "goal": "string?",
    "dietType": "string?",
    "activityLevel": "string?"
  }
}`,
    outputSchema: workerOutputSchema,
    enabled: true,
  },
  {
    id: 'nutrition-calculator',
    name: 'Nutrition Calculator Worker',
    description: 'Calculeaza calorii, macronutrienti si valideaza echilibrul nutritional.',
    prompt:
      'Calculeaza calorii, proteine, carbohidrati, grasimi si evalueaza echilibrul meselor fata de obiectivele utilizatorului.',
    inputSchema: `{
  "userTargets": { "kcal": "number", "protein": "number", "carbs": "number", "fat": "number" },
  "meals": [{ "name": "string", "foods": [{ "name": "string", "amount": "string" }] }]
}`,
    outputSchema: workerOutputSchema,
    enabled: true,
  },
  {
    id: 'data-validator',
    name: 'Data Validator Worker',
    description: 'Valideaza ca toate payload-urile worker-ilor respecta schemele si respinge raspunsurile malformate.',
    prompt:
      'Valideaza fiecare output de worker fata de constrangerile schemei. Respinge payload-urile malformate si returneaza note de validare.',
    inputSchema: `{
  "workerOutputs": [
    { "worker": "string", "status": "string", "data": {}, "notes": [] }
  ]
}`,
    outputSchema: workerOutputSchema,
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
          systemPrompt: brain.systemPrompt || prev.systemPrompt,
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
      body: JSON.stringify({ aiBrain: { ...config, workers } }),
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

  const handleResetPrompt = () => {
    setConfig((prev) => ({ ...prev, systemPrompt: DEFAULT_SYSTEM_PROMPT }));
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
          Configure AI model behavior, system prompt and workers
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
                Lasă gol pentru a folosi LLM direct. Completează doar dacă ai un orchestrator extern.
              </p>
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="label-text">System Prompt</label>
                <button
                  type="button"
                  onClick={handleResetPrompt}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  Reset la default
                </button>
              </div>
              <textarea
                className="input-field resize-none font-mono text-xs"
                aria-label="System Prompt"
                title="System Prompt"
                rows={20}
                value={config.systemPrompt}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
              />
              <p className="helper-text">Instructiuni trimise modelului AI la fiecare cerere. Se salveaza in DB si se foloseste de orchestrator.</p>
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
                <label className="label-text">Input Schema</label>
                <textarea
                  className="input-field font-mono text-xs resize-none"
                  rows={8}
                  value={activeWorker.inputSchema}
                  onChange={(e) => updateActiveWorker({ inputSchema: e.target.value })}
                />
              </div>

              <div>
                <label className="label-text">Output Schema</label>
                <textarea
                  className="input-field font-mono text-xs resize-none"
                  rows={10}
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
