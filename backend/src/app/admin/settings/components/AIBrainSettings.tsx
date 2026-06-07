'use client';
import React, { useState } from 'react';

export default function AIBrainSettings() {
  const [config, setConfig] = useState({
    defaultModel: 'gpt-4o',
    temperature: '0.7',
    maxTokens: '2048',
    systemPrompt:
      "You are NutriSense AI, a specialized nutrition assistant. Provide evidence-based dietary recommendations tailored to the user's intolerances and dietary preferences. Always include a medical disclaimer.",
    orchestratorUrl: 'https://api.nutrisense.app/ai/orchestrate',
    fallbackModel: 'gemini-1.5-pro',
    enableStreaming: true,
    enableCache: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="section-header">AI Brain Configuration</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure AI model behavior and orchestration settings
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">Default Model</label>
          <select
            className="input-field"
            value={config?.defaultModel}
            onChange={(e) => setConfig({ ...config, defaultModel: e?.target?.value })}
          >
            <option value="gpt-4o">GPT-4o (OpenAI)</option>
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
            value={config?.fallbackModel}
            onChange={(e) => setConfig({ ...config, fallbackModel: e?.target?.value })}
          >
            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Google)</option>
            <option value="gpt-4o">GPT-4o (OpenAI)</option>
            <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
          </select>
        </div>
        <div>
          <label className="label-text">
            Temperature{' '}
            <span className="text-muted-foreground font-normal">({config?.temperature})</span>
          </label>
          <input
            className="w-full accent-primary"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config?.temperature}
            onChange={(e) => setConfig({ ...config, temperature: e?.target?.value })}
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
            value={config?.maxTokens}
            onChange={(e) => setConfig({ ...config, maxTokens: e?.target?.value })}
            min="256"
            max="8192"
            step="256"
          />
        </div>
        <div className="col-span-2">
          <label className="label-text">Orchestrator URL</label>
          <input
            className="input-field font-mono text-xs"
            value={config?.orchestratorUrl}
            onChange={(e) => setConfig({ ...config, orchestratorUrl: e?.target?.value })}
            placeholder="https://..."
          />
          <p className="helper-text">External AI orchestrator endpoint (AI_ORCHESTRATOR_URL)</p>
        </div>
        <div className="col-span-2">
          <label className="label-text">System Prompt</label>
          <textarea
            className="input-field resize-none"
            rows={5}
            value={config?.systemPrompt}
            onChange={(e) => setConfig({ ...config, systemPrompt: e?.target?.value })}
          />
          <p className="helper-text">Base instructions sent to the AI model for every request</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-primary"
            checked={config?.enableStreaming}
            onChange={(e) => setConfig({ ...config, enableStreaming: e?.target?.checked })}
          />
          <span className="text-sm font-medium text-foreground">Enable Streaming</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-primary"
            checked={config?.enableCache}
            onChange={(e) => setConfig({ ...config, enableCache: e?.target?.checked })}
          />
          <span className="text-sm font-medium text-foreground">Enable Response Cache</span>
        </label>
      </div>
      <div className="pt-2">
        <button onClick={handleSave} className="btn-primary">
          {saved ? '✓ Saved' : 'Save AI Configuration'}
        </button>
      </div>
    </div>
  );
}
