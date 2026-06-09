'use client';
import React, { useEffect, useState } from 'react';

type PlanKey = 'basic' | 'pro' | 'pro_plus';

type PlanPricing = {
  name: string;
  description: string;
  amount: string;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
};

type PricingForm = Record<PlanKey, PlanPricing>;

type SyncResult = {
  plan: string;
  key: PlanKey;
  status: 'synced' | 'skipped' | 'error';
  newPriceId?: string;
  amount?: number;
  currency?: string;
  reason?: string;
};

type SettingsPayload = {
  settings?: {
    pricing?: Partial<PricingForm>;
  };
};

const DEFAULT_PRICING: PricingForm = {
  basic: {
    name: 'Basic',
    description: 'Ideal pentru cei care vor sa inceapa.',
    amount: '9.99',
    currency: 'eur',
    interval: 'month',
    features: ['introducerea meselor', 'introducerea simptomelor', 'corelatii de baza', 'alimente suspecte', 'alimente sigure', 'evolutia simptomelor'],
  },
  pro: {
    name: 'Pro',
    description: 'Cel mai popular. Perfect pentru claritate rapida.',
    amount: '14.99',
    currency: 'eur',
    interval: 'month',
    features: ['tot din Basic', 'analiza AI avansata', 'detectarea combinatiilor problematice', 'recomandari personalizate', 'planuri alimentare adaptate', 'rapoarte zilnice', 'evolutie detaliata'],
  },
  pro_plus: {
    name: 'Pro+',
    description: 'Pentru cei care vor maximul de precizie.',
    amount: '35.99',
    currency: 'eur',
    interval: 'month',
    features: ['tot din Pro', 'analiza AI extinsa', 'predictii avansate', 'detectarea reactiilor intarziate complexe', 'ghidare premium', 'suport prioritar', 'actualizari personalizate in timp real'],
  },
};

type PlanStyle = {
  headerBg: string;
  headerBorder: string;
  badge: string;
  checkColor: string;
  inputAccent: string;
  priceColor: string;
  addBtn: string;
};

const PLAN_STYLE: Record<PlanKey, PlanStyle> = {
  basic: {
    headerBg: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80',
    headerBorder: 'border-slate-200 dark:border-slate-700',
    badge: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    checkColor: 'text-slate-500',
    inputAccent: 'focus:border-slate-400',
    priceColor: 'text-slate-900 dark:text-slate-100',
    addBtn: 'border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800 dark:border-slate-600 dark:text-slate-300',
  },
  pro: {
    headerBg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30',
    headerBorder: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    checkColor: 'text-blue-500',
    inputAccent: 'focus:border-blue-400',
    priceColor: 'text-blue-700 dark:text-blue-300',
    addBtn: 'border-blue-200 text-blue-600 hover:border-blue-400 hover:text-blue-800 dark:border-blue-800 dark:text-blue-400',
  },
  pro_plus: {
    headerBg: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/30',
    headerBorder: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    checkColor: 'text-purple-500',
    inputAccent: 'focus:border-purple-400',
    priceColor: 'text-purple-700 dark:text-purple-300',
    addBtn: 'border-purple-200 text-purple-600 hover:border-purple-400 hover:text-purple-800 dark:border-purple-800 dark:text-purple-400',
  },
};

export default function PricingSettings() {
  const [form, setForm] = useState<PricingForm>(DEFAULT_PRICING);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);
  const [newFeature, setNewFeature] = useState<Record<PlanKey, string>>({ basic: '', pro: '', pro_plus: '' });

  useEffect(() => {
    fetch('/api/superadmin/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((payload: SettingsPayload | null) => {
        const p = payload?.settings?.pricing;
        if (!p) return;
        setForm({
          basic: { ...DEFAULT_PRICING.basic, ...p.basic },
          pro: { ...DEFAULT_PRICING.pro, ...p.pro },
          pro_plus: { ...DEFAULT_PRICING.pro_plus, ...p.pro_plus },
        });
      })
      .catch(() => setError('Could not load pricing settings.'));
  }, []);

  const updatePlan = (key: PlanKey, field: keyof PlanPricing, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const addFeature = (key: PlanKey) => {
    const val = newFeature[key].trim();
    if (!val) return;
    updatePlan(key, 'features', [...form[key].features, val]);
    setNewFeature((prev) => ({ ...prev, [key]: '' }));
  };

  const removeFeature = (key: PlanKey, idx: number) => {
    updatePlan(key, 'features', form[key].features.filter((_, i) => i !== idx));
  };

  const moveFeature = (key: PlanKey, idx: number, dir: -1 | 1) => {
    const list = [...form[key].features];
    const next = idx + dir;
    if (next < 0 || next >= list.length) return;
    [list[idx], list[next]] = [list[next], list[idx]];
    updatePlan(key, 'features', list);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSyncResults(null);
    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricing: form }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!res.ok) { setError(body.error || 'Could not save pricing.'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    void handleSync();
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResults(null);
    try {
      const res = await fetch('/api/superadmin/stripe/sync-prices', { method: 'POST' });
      const body = (await res.json()) as { ok: boolean; results?: SyncResult[]; error?: string };
      setSyncResults(body.ok ? (body.results ?? []) : [{ plan: 'All', key: 'basic', status: 'error', reason: body.error ?? 'Sync failed.' }]);
    } catch {
      setSyncResults([{ plan: 'All', key: 'basic', status: 'error', reason: 'Could not reach sync endpoint.' }]);
    } finally {
      setSyncing(false);
    }
  };

  const plans: Array<{ key: PlanKey; label: string }> = [
    { key: 'basic', label: 'Basic' },
    { key: 'pro', label: 'Pro' },
    { key: 'pro_plus', label: 'Pro+' },
  ];

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="section-header">Pricing Plans</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Edit prices and features for each plan. Saving syncs automatically with Stripe.
        </p>
      </div>

      {error && (
        <p className="text-sm rounded-lg border border-negative/30 bg-negative-bg text-negative px-3 py-2">
          {error}
        </p>
      )}

      {/* 3-column card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {plans.map(({ key, label }) => {
          const plan = form[key];
          const style = PLAN_STYLE[key];
          const syncResult = syncResults?.find((r) => r.key === key);

          return (
            <div
              key={key}
              className={`flex flex-col rounded-2xl border ${style.headerBorder} overflow-hidden shadow-sm`}
            >
              {/* Card header */}
              <div className={`${style.headerBg} border-b ${style.headerBorder} px-5 pt-5 pb-4 space-y-3`}>
                {/* Badge + name */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.badge}`}>
                    {label}
                  </span>
                  <input
                    className={`input-field flex-1 py-1 text-sm font-semibold bg-transparent border-transparent ${style.inputAccent}`}
                    value={plan.name}
                    onChange={(e) => updatePlan(key, 'name', e.target.value)}
                    placeholder="Plan name"
                    aria-label={`${label} plan name`}
                  />
                </div>

                {/* Price display */}
                <div className="flex items-baseline gap-1.5">
                  <input
                    className={`input-field w-24 text-right font-mono font-extrabold text-2xl ${style.priceColor} bg-transparent border-transparent ${style.inputAccent} p-0`}
                    value={plan.amount}
                    onChange={(e) => updatePlan(key, 'amount', e.target.value)}
                    placeholder="0.00"
                    aria-label={`${label} price amount`}
                  />
                  <select
                    className="input-field w-16 text-xs py-1 bg-transparent border-transparent"
                    value={plan.currency}
                    onChange={(e) => updatePlan(key, 'currency', e.target.value)}
                    aria-label={`${label} currency`}
                    title={`${label} currency`}
                  >
                    <option value="eur">EUR</option>
                    <option value="usd">USD</option>
                    <option value="ron">RON</option>
                    <option value="gbp">GBP</option>
                  </select>
                  <select
                    className="input-field w-20 text-xs py-1 bg-transparent border-transparent"
                    value={plan.interval}
                    onChange={(e) => updatePlan(key, 'interval', e.target.value as 'month' | 'year')}
                    aria-label={`${label} interval`}
                    title={`${label} interval`}
                  >
                    <option value="month">/ lună</option>
                    <option value="year">/ an</option>
                  </select>
                </div>

                {/* Description */}
                <input
                  className="input-field w-full text-xs bg-transparent border-transparent text-muted-foreground"
                  value={plan.description}
                  onChange={(e) => updatePlan(key, 'description', e.target.value)}
                  placeholder="Descriere scurta..."
                />
              </div>

              {/* Card body — features */}
              <div className="flex-1 px-5 py-4 space-y-3 bg-card">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Functionalitati incluse
                </p>

                <ul className="space-y-1.5 min-h-[80px]">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 group">
                      <svg className={`w-3.5 h-3.5 flex-shrink-0 ${style.checkColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-foreground flex-1 leading-snug">{feat}</span>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => moveFeature(key, idx, -1)}
                          disabled={idx === 0}
                          className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
                          aria-label="Move up"
                          title="Move up"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFeature(key, idx, 1)}
                          disabled={idx === plan.features.length - 1}
                          className="p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-20"
                          aria-label="Move down"
                          title="Move down"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFeature(key, idx)}
                          className="p-0.5 rounded text-negative hover:opacity-70"
                          aria-label="Remove feature"
                          title="Remove"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Add feature */}
                <div className="flex gap-2 pt-1">
                  <input
                    className="input-field flex-1 text-xs py-1.5"
                    value={newFeature[key]}
                    onChange={(e) => setNewFeature((prev) => ({ ...prev, [key]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addFeature(key)}
                    placeholder="Adauga functionalitate..."
                  />
                  <button
                    type="button"
                    onClick={() => addFeature(key)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${style.addBtn}`}
                  >
                    + Adauga
                  </button>
                </div>

                {/* Sync result */}
                {syncResult && (
                  <div className={`text-xs rounded-lg px-3 py-2 flex items-start gap-2 mt-2 ${
                    syncResult.status === 'synced'
                      ? 'bg-positive-bg text-positive border border-positive/20'
                      : syncResult.status === 'skipped'
                        ? 'bg-muted text-muted-foreground border border-border'
                        : 'bg-negative-bg text-negative border border-negative/20'
                  }`}>
                    <span className="font-bold flex-shrink-0">
                      {syncResult.status === 'synced' ? '✓' : syncResult.status === 'skipped' ? '—' : '✗'}
                    </span>
                    <span>
                      {syncResult.status === 'synced' && (
                        <>
                          <span className="font-mono font-medium">{syncResult.newPriceId}</span>
                          {syncResult.amount != null && ` · ${(syncResult.amount / 100).toFixed(2)} ${syncResult.currency?.toUpperCase()}`}
                        </>
                      )}
                      {syncResult.status !== 'synced' && syncResult.reason}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => void handleSave()} disabled={saving || syncing} className="btn-primary">
          {saved ? '✓ Salvat' : saving ? 'Se salveaza…' : 'Salveaza & Sincronizeaza Stripe'}
        </button>
        <button onClick={() => void handleSync()} disabled={syncing || saving} className="btn-secondary">
          {syncing ? 'Se sincronizeaza…' : 'Sincronizeaza cu Stripe'}
        </button>
        {syncing && (
          <span className="text-xs text-muted-foreground animate-pulse ml-1">
            Se verifica preturile in Stripe...
          </span>
        )}
      </div>
    </div>
  );
}
