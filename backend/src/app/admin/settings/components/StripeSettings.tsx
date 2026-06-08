'use client';
import React, { useEffect, useState } from 'react';

export default function StripeSettings() {
  const [form, setForm] = useState({
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    currency: 'usd',
    trialDays: '14',
    billingMode: 'subscription',
  });
  const [saved, setSaved] = useState(false);
  const [visibleSecret, setVisibleSecret] = useState(false);
  const [visibleWebhook, setVisibleWebhook] = useState(false);

  useEffect(() => {
    fetch('/api/superadmin/settings')
      .then((response) => (response.ok ? response.json() : null))
      .then(
        (
          payload: {
            settings?: {
              stripe?: {
                publishableKeyMasked?: string;
                secretKeyMasked?: string;
                webhookSecretMasked?: string;
                billingMode?: string;
              };
            };
          } | null
        ) => {
          if (!payload?.settings?.stripe) return;
          setForm((prev) => ({
            ...prev,
            publishableKey: payload.settings?.stripe?.publishableKeyMasked || prev.publishableKey,
            secretKey: payload.settings?.stripe?.secretKeyMasked || prev.secretKey,
            webhookSecret: payload.settings?.stripe?.webhookSecretMasked || prev.webhookSecret,
            billingMode:
              (payload.settings?.stripe?.billingMode as typeof prev.billingMode) ||
              prev.billingMode,
          }));
        }
      )
      .catch(() => {
        // keep local defaults
      });
  }, []);

  const handleSave = async () => {
    await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stripe: {
          publishableKeyMasked: form.publishableKey,
          secretKeyMasked: form.secretKey,
          webhookSecretMasked: form.webhookSecret,
          billingMode: form.billingMode,
        },
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="section-header">Stripe Billing</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure Stripe payment and subscription settings
        </p>
      </div>
      <div className="p-3 rounded-lg bg-info-bg border border-info/20 flex items-start gap-2">
        <svg
          className="w-4 h-4 text-info mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-xs text-info">
          Keys are stored as environment variables. Update them in your{' '}
          <code className="font-mono bg-info/10 px-1 rounded">.env</code> file for production.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="label-text">Publishable Key</label>
          <input
            className="input-field font-mono text-xs"
            value={form?.publishableKey}
            onChange={(e) => setForm({ ...form, publishableKey: e?.target?.value })}
            placeholder="pk_live_..."
          />
          <p className="helper-text">Starts with pk_live_ or pk_test_</p>
        </div>

        <div>
          <label className="label-text">Secret Key</label>
          <div className="relative">
            <input
              className="input-field font-mono text-xs pr-10"
              type={visibleSecret ? 'text' : 'password'}
              value={form?.secretKey}
              onChange={(e) => setForm({ ...form, secretKey: e?.target?.value })}
              placeholder="sk_live_..."
            />
            <button
              type="button"
              onClick={() => setVisibleSecret(!visibleSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={visibleSecret ? 'Hide secret key' : 'Show secret key'}
              title={visibleSecret ? 'Hide secret key' : 'Show secret key'}
            >
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
            </button>
          </div>
        </div>

        <div>
          <label className="label-text">Webhook Secret</label>
          <div className="relative">
            <input
              className="input-field font-mono text-xs pr-10"
              type={visibleWebhook ? 'text' : 'password'}
              value={form?.webhookSecret}
              onChange={(e) => setForm({ ...form, webhookSecret: e?.target?.value })}
              placeholder="whsec_..."
            />
            <button
              type="button"
              onClick={() => setVisibleWebhook(!visibleWebhook)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={visibleWebhook ? 'Hide webhook secret' : 'Show webhook secret'}
              title={visibleWebhook ? 'Hide webhook secret' : 'Show webhook secret'}
            >
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
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label-text">Currency</label>
            <select
              className="input-field"
              aria-label="Currency"
              title="Currency"
              value={form?.currency}
              onChange={(e) => setForm({ ...form, currency: e?.target?.value })}
            >
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="ron">RON</option>
              <option value="gbp">GBP</option>
            </select>
          </div>
          <div>
            <label className="label-text">Trial Days</label>
            <input
              className="input-field"
              type="number"
              aria-label="Trial Days"
              title="Trial Days"
              value={form?.trialDays}
              onChange={(e) => setForm({ ...form, trialDays: e?.target?.value })}
              min="0"
              max="90"
            />
          </div>
          <div>
            <label className="label-text">Billing Mode</label>
            <select
              className="input-field"
              aria-label="Billing Mode"
              title="Billing Mode"
              value={form?.billingMode}
              onChange={(e) => setForm({ ...form, billingMode: e?.target?.value })}
            >
              <option value="subscription">Subscription</option>
              <option value="one-time">One-time</option>
              <option value="usage">Usage-based</option>
            </select>
          </div>
        </div>
      </div>
      <div className="pt-2">
        <button onClick={handleSave} className="btn-primary">
          {saved ? '✓ Saved' : 'Save Stripe Settings'}
        </button>
      </div>
    </div>
  );
}
