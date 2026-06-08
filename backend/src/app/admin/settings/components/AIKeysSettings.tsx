'use client';
import React, { useEffect, useState } from 'react';

interface AIKey {
  id: string;
  provider: string;
  label: string;
  value: string;
  envVar: string;
}

const PROVIDER_OPTIONS = [
  { id: 'openai', provider: 'OpenAI', label: 'OpenAI API Key', envVar: 'OPENAI_API_KEY' },
  { id: 'gemini', provider: 'Google Gemini', label: 'Gemini API Key', envVar: 'GEMINI_API_KEY' },
  { id: 'anthropic', provider: 'Anthropic Claude', label: 'Anthropic API Key', envVar: 'ANTHROPIC_API_KEY' },
  { id: 'perplexity', provider: 'Perplexity', label: 'Perplexity API Key', envVar: 'PERPLEXITY_API_KEY' },
] as const;

type SettingsPayload = {
  settings?: {
    ai?: { provider?: string; apiKeyMasked?: string; model?: string };
    aiBrain?: { defaultModel?: string };
  };
};

export default function AIKeysSettings() {
  const [keys, setKeys] = useState<AIKey[]>(
    PROVIDER_OPTIONS.map((p) => ({ ...p, value: '' })),
  );
  const [primaryModel, setPrimaryModel] = useState('gpt-4o');
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/superadmin/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: SettingsPayload | null) => {
        const ai = payload?.settings?.ai;
        const brain = payload?.settings?.aiBrain;
        if (ai?.apiKeyMasked) {
          setKeys((prev) =>
            prev.map((k, idx) =>
              idx === 0
                ? { ...k, provider: ai.provider || k.provider, value: ai.apiKeyMasked || '' }
                : k,
            ),
          );
        }
        setPrimaryModel(brain?.defaultModel ?? ai?.model ?? 'gpt-4o');
      })
      .catch(() => setError('Could not load AI key settings.'));
  }, []);

  const updateKey = (id: string, value: string) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, value } : k)));
  };

  const toggleVisible = (id: string) => {
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const primary = keys[0];
    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ai: {
          provider: primary?.provider || 'OpenAI',
          apiKeyMasked: primary?.value || '',
          model: primaryModel,
        },
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(payload.error || 'Could not save AI keys.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="section-header">AI API Keys</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure API keys for AI provider integrations
        </p>
      </div>

      {error && (
        <p className="text-sm rounded-lg border border-negative/30 bg-negative-bg text-negative px-3 py-2">
          {error}
        </p>
      )}

      <div className="p-3 rounded-lg bg-info-bg border border-info/20 text-xs text-info">
        Doar cheia OpenAI (primul provider) este salvată în DB și folosită de orchestrator.
        Ceilalți provideri sunt disponibili prin env vars pe server.
      </div>

      <div className="space-y-4">
        {keys.map((k) => (
          <div key={k.id} className="p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">{k.provider}</span>
              <span className="badge badge-muted font-mono text-xs">{k.envVar}</span>
            </div>
            <div className="relative">
              <input
                className="input-field pr-10"
                type={visible[k.id] ? 'text' : 'password'}
                value={k.value}
                onChange={(e) => updateKey(k.id, e.target.value)}
                placeholder={k.id === 'openai' ? 'sk-...' : `Set via ${k.envVar} env var`}
                disabled={k.id !== 'openai'}
                readOnly={k.id !== 'openai'}
              />
              <button
                onClick={() => toggleVisible(k.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={visible[k.id] ? 'Hide key' : 'Show key'}
                title={visible[k.id] ? 'Hide key' : 'Show key'}
              >
                {visible[k.id] ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="label-text">Primary Model (AI_PRIMARY_MODEL)</label>
        <select
          className="input-field"
          aria-label="Primary model"
          title="Primary model"
          value={primaryModel}
          onChange={(e) => setPrimaryModel(e.target.value)}
        >
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
        </select>
        <p className="helper-text">Synced with AI Brain tab. Actual env var takes precedence on server.</p>
      </div>

      <div className="pt-2">
        <button onClick={() => void handleSave()} disabled={saving} className="btn-primary">
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save API Keys'}
        </button>
      </div>
    </div>
  );
}
