'use client';
import React, { useState } from 'react';

interface AIKey {
  id: string;
  provider: string;
  label: string;
  value: string;
  envVar: string;
}

const initialKeys: AIKey[] = [
  {
    id: 'openai',
    provider: 'OpenAI',
    label: 'OpenAI API Key',
    value: '',
    envVar: 'OPENAI_API_KEY',
  },
  {
    id: 'gemini',
    provider: 'Google Gemini',
    label: 'Gemini API Key',
    value: '',
    envVar: 'GEMINI_API_KEY',
  },
  {
    id: 'anthropic',
    provider: 'Anthropic Claude',
    label: 'Anthropic API Key',
    value: '',
    envVar: 'ANTHROPIC_API_KEY',
  },
  {
    id: 'perplexity',
    provider: 'Perplexity',
    label: 'Perplexity API Key',
    value: '',
    envVar: 'PERPLEXITY_API_KEY',
  },
];

export default function AIKeysSettings() {
  const [keys, setKeys] = useState<AIKey[]>(initialKeys);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const updateKey = (id: string, value: string) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, value } : k)));
  };

  const toggleVisible = (id: string) => {
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
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
                placeholder={`Enter ${k.label}`}
              />
              <button
                onClick={() => toggleVisible(k.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {visible[k.id] ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button onClick={handleSave} className="btn-primary">
          {saved ? '✓ Saved' : 'Save API Keys'}
        </button>
      </div>
    </div>
  );
}
