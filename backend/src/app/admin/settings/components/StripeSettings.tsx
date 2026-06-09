'use client';
import React, { useEffect, useState } from 'react';

type ProductEntry = { productId: string; priceId: string };

type StripeForm = {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  currency: string;
  trialDays: string;
  billingMode: string;
  products: {
    basic: ProductEntry;
    pro: ProductEntry;
    pro_plus: ProductEntry;
  };
};

type SettingsPayload = {
  settings?: {
    stripe?: {
      publishableKeyMasked?: string;
      secretKeyMasked?: string;
      webhookSecretMasked?: string;
      billingMode?: string;
      currency?: string;
      trialDays?: string;
      products?: {
        basic?: Partial<ProductEntry>;
        pro?: Partial<ProductEntry>;
        pro_plus?: Partial<ProductEntry>;
      };
    };
    pricing?: {
      basic?: { amount?: string; currency?: string };
      pro?: { amount?: string; currency?: string };
      pro_plus?: { amount?: string; currency?: string };
    };
  };
};

type ProductValidation = {
  plan: string;
  productId: string;
  priceId: string;
  productOk: boolean;
  priceOk: boolean;
  productName?: string;
  priceName?: string;
  priceAmount?: number;
  priceCurrency?: string;
  error?: string;
};

type ValidationResult = {
  connectionOk: boolean;
  accountId?: string;
  accountEmail?: string;
  livemode?: boolean;
  products: ProductValidation[];
  error?: string;
};

const DEFAULT_FORM: StripeForm = {
  publishableKey: '',
  secretKey: '',
  webhookSecret: '',
  currency: 'eur',
  trialDays: '14',
  billingMode: 'subscription',
  products: {
    basic: { productId: '', priceId: '' },
    pro: { productId: '', priceId: '' },
    pro_plus: { productId: '', priceId: '' },
  },
};

const DEFAULT_PLAN_LABELS: Record<keyof StripeForm['products'], string> = {
  basic: 'Basic (9.99 EUR)',
  pro: 'Pro (14.99 EUR)',
  pro_plus: 'Pro+ (35.99 EUR)',
};

export default function StripeSettings() {
  const [form, setForm] = useState<StripeForm>(DEFAULT_FORM);
  const [hasSavedSecret, setHasSavedSecret] = useState(false);
  const [hasSavedWebhook, setHasSavedWebhook] = useState(false);
  const [secretChanged, setSecretChanged] = useState(false);
  const [webhookChanged, setWebhookChanged] = useState(false);
  const [visibleSecret, setVisibleSecret] = useState(false);
  const [visibleWebhook, setVisibleWebhook] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [planLabels, setPlanLabels] = useState<Record<keyof StripeForm['products'], string>>(DEFAULT_PLAN_LABELS);

  useEffect(() => {
    fetch('/api/superadmin/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: SettingsPayload | null) => {
        const p = payload?.settings?.pricing;
        if (p) {
          setPlanLabels({
            basic: `Basic (${p.basic?.amount ?? '9.99'} ${(p.basic?.currency ?? 'eur').toUpperCase()})`,
            pro: `Pro (${p.pro?.amount ?? '14.99'} ${(p.pro?.currency ?? 'eur').toUpperCase()})`,
            pro_plus: `Pro+ (${p.pro_plus?.amount ?? '35.99'} ${(p.pro_plus?.currency ?? 'eur').toUpperCase()})`,
          });
        }
        const s = payload?.settings?.stripe;
        if (!s) return;
        setForm((prev) => ({
          ...prev,
          publishableKey: s.publishableKeyMasked ?? prev.publishableKey,
          currency: s.currency ?? prev.currency,
          trialDays: s.trialDays ?? prev.trialDays,
          billingMode: s.billingMode ?? prev.billingMode,
          products: {
            basic: {
              productId: s.products?.basic?.productId ?? '',
              priceId: s.products?.basic?.priceId ?? '',
            },
            pro: {
              productId: s.products?.pro?.productId ?? '',
              priceId: s.products?.pro?.priceId ?? '',
            },
            pro_plus: {
              productId: s.products?.pro_plus?.productId ?? '',
              priceId: s.products?.pro_plus?.priceId ?? '',
            },
          },
        }));
        setHasSavedSecret(!!(s.secretKeyMasked && s.secretKeyMasked !== 'sk_live_************' && s.secretKeyMasked !== ''));
        setHasSavedWebhook(!!(s.webhookSecretMasked && s.webhookSecretMasked !== 'whsec_************' && s.webhookSecretMasked !== ''));
      })
      .catch(() => setError('Could not load Stripe settings.'));
  }, []);

  const updateProduct = (plan: keyof StripeForm['products'], field: keyof ProductEntry, value: string) => {
    setForm((prev) => ({
      ...prev,
      products: {
        ...prev.products,
        [plan]: { ...prev.products[plan], [field]: value },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setValidation(null);

    const payload: Record<string, unknown> = {
      publishableKeyMasked: form.publishableKey,
      billingMode: form.billingMode,
      currency: form.currency,
      trialDays: form.trialDays,
      products: form.products,
    };
    if (secretChanged && form.secretKey) payload.secretKeyMasked = form.secretKey;
    if (webhookChanged && form.webhookSecret) payload.webhookSecretMasked = form.webhookSecret;

    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stripe: payload }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);

    if (!res.ok) {
      setError(body.error || 'Could not save Stripe settings.');
      return;
    }

    if (secretChanged && form.secretKey) {
      setHasSavedSecret(true);
      setSecretChanged(false);
      setForm((prev) => ({ ...prev, secretKey: '' }));
    }
    if (webhookChanged && form.webhookSecret) {
      setHasSavedWebhook(true);
      setWebhookChanged(false);
      setForm((prev) => ({ ...prev, webhookSecret: '' }));
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);

    // Auto-validate after save
    void handleValidate();
  };

  const handleValidate = async () => {
    setValidating(true);
    setValidation(null);
    try {
      const res = await fetch('/api/superadmin/stripe/validate', { method: 'POST' });
      const result = (await res.json()) as ValidationResult;
      setValidation(result);
      if (result.connectionOk && result.products.length > 0) {
        setPlanLabels((prev) => {
          const next = { ...prev };
          for (const vp of result.products) {
            if (vp.priceOk && vp.priceAmount != null && vp.priceCurrency) {
              const amount = (vp.priceAmount / 100).toFixed(2);
              const currency = vp.priceCurrency.toUpperCase();
              if (vp.plan === 'Basic') next.basic = `Basic (${amount} ${currency})`;
              else if (vp.plan === 'Pro') next.pro = `Pro (${amount} ${currency})`;
              else if (vp.plan === 'Pro+') next.pro_plus = `Pro+ (${amount} ${currency})`;
            }
          }
          return next;
        });
      }
    } catch {
      setValidation({ connectionOk: false, products: [], error: 'Could not reach validation endpoint.' });
    } finally {
      setValidating(false);
    }
  };

  const eyeIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="section-header">Stripe Billing</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure Stripe payment and subscription settings
        </p>
      </div>

      {error && (
        <p className="text-sm rounded-lg border border-negative/30 bg-negative-bg text-negative px-3 py-2">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {/* Publishable Key */}
        <div>
          <label className="label-text">Publishable Key</label>
          <input
            className="input-field font-mono text-xs"
            value={form.publishableKey}
            onChange={(e) => setForm({ ...form, publishableKey: e.target.value })}
            placeholder="pk_live_..."
            autoComplete="off"
          />
          <p className="helper-text">Starts with pk_live_ or pk_test_</p>
        </div>

        {/* Secret Key */}
        <div>
          <label className="label-text">Secret Key</label>
          <div className="relative">
            <input
              className="input-field font-mono text-xs pr-10"
              type={visibleSecret ? 'text' : 'password'}
              value={form.secretKey}
              placeholder={hasSavedSecret && !secretChanged ? '•••••••••••  (saved)' : 'sk_live_...'}
              onChange={(e) => { setSecretChanged(true); setForm({ ...form, secretKey: e.target.value }); }}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setVisibleSecret((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={visibleSecret ? 'Hide' : 'Show'}>
              {eyeIcon}
            </button>
          </div>
          <p className="helper-text">
            {hasSavedSecret && !secretChanged ? 'Secret Key is saved. Type a new one to change it.' : 'Stored securely in DB.'}
          </p>
        </div>

        {/* Webhook Secret */}
        <div>
          <label className="label-text">Webhook Secret</label>
          <div className="relative">
            <input
              className="input-field font-mono text-xs pr-10"
              type={visibleWebhook ? 'text' : 'password'}
              value={form.webhookSecret}
              placeholder={hasSavedWebhook && !webhookChanged ? '•••••••••••  (saved)' : 'whsec_...'}
              onChange={(e) => { setWebhookChanged(true); setForm({ ...form, webhookSecret: e.target.value }); }}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setVisibleWebhook((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={visibleWebhook ? 'Hide' : 'Show'}>
              {eyeIcon}
            </button>
          </div>
          <p className="helper-text">
            {hasSavedWebhook && !webhookChanged ? 'Webhook Secret is saved. Type a new one to change it.' : 'Stored securely in DB.'}
          </p>
        </div>

        {/* Currency / Trial / Mode */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label-text">Currency</label>
            <select className="input-field" aria-label="Currency" title="Currency"
              value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="ron">RON</option>
              <option value="gbp">GBP</option>
            </select>
          </div>
          <div>
            <label className="label-text">Trial Days</label>
            <input className="input-field" type="number" aria-label="Trial Days" title="Trial Days"
              value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: e.target.value })}
              min="0" max="90" />
          </div>
          <div>
            <label className="label-text">Billing Mode</label>
            <select className="input-field" aria-label="Billing Mode" title="Billing Mode"
              value={form.billingMode} onChange={(e) => setForm({ ...form, billingMode: e.target.value })}>
              <option value="subscription">Subscription</option>
              <option value="one-time">One-time</option>
              <option value="usage">Usage-based</option>
            </select>
          </div>
        </div>

        {/* Products Section */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-muted/30 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Stripe Products &amp; Prices</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter the Product ID and Price ID from your Stripe Dashboard for each plan.
            </p>
          </div>
          <div className="divide-y divide-border">
            {(Object.keys(planLabels) as Array<keyof StripeForm['products']>).map((plan) => {
              const vp = validation?.products.find((p) => p.plan === planLabels[plan].split(' ')[0]);
              return (
                <div key={plan} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{planLabels[plan]}</span>
                    {vp && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        vp.productOk && vp.priceOk
                          ? 'bg-positive-bg text-positive border border-positive/30'
                          : vp.error === 'Not configured'
                            ? 'bg-muted text-muted-foreground border border-border'
                            : 'bg-negative-bg text-negative border border-negative/30'
                      }`}>
                        {vp.productOk && vp.priceOk ? '✓ Valid' : vp.error === 'Not configured' ? 'Not set' : '✗ Error'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label-text text-xs">Product ID</label>
                      <input
                        className="input-field font-mono text-xs"
                        value={form.products[plan].productId}
                        onChange={(e) => updateProduct(plan, 'productId', e.target.value)}
                        placeholder="prod_..."
                      />
                    </div>
                    <div>
                      <label className="label-text text-xs">Price ID</label>
                      <input
                        className="input-field font-mono text-xs"
                        value={form.products[plan].priceId}
                        onChange={(e) => updateProduct(plan, 'priceId', e.target.value)}
                        placeholder="price_..."
                      />
                    </div>
                  </div>
                  {/* Validation details */}
                  {vp && (vp.productName || vp.priceAmount != null || vp.error) && (
                    <div className={`text-xs rounded-lg px-3 py-2 space-y-0.5 ${
                      vp.error && vp.error !== 'Not configured'
                        ? 'bg-negative-bg text-negative border border-negative/20'
                        : 'bg-positive-bg text-positive border border-positive/20'
                    }`}>
                      {vp.productOk && vp.productName && (
                        <p>Product: <span className="font-medium">{vp.productName}</span></p>
                      )}
                      {vp.priceOk && vp.priceAmount != null && (
                        <p>Price: <span className="font-medium">
                          {(vp.priceAmount / 100).toFixed(2)} {vp.priceCurrency?.toUpperCase()}
                          {vp.priceName ? ` · ${vp.priceName}` : ''}
                        </span></p>
                      )}
                      {vp.error && vp.error !== 'Not configured' && (
                        <p className="font-medium">{vp.error}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Validation result — connection */}
      {validation && (
        <div className={`rounded-xl border px-4 py-3 text-sm space-y-1 ${
          validation.connectionOk
            ? 'bg-positive-bg border-positive/30 text-positive'
            : 'bg-negative-bg border-negative/30 text-negative'
        }`}>
          {validation.connectionOk ? (
            <>
              <p className="font-semibold">✓ Stripe connection successful</p>
              {validation.accountEmail && <p className="text-xs opacity-80">Account: {validation.accountEmail} · {validation.livemode ? 'Live mode' : 'Test mode'}</p>}
            </>
          ) : (
            <>
              <p className="font-semibold">✗ Stripe connection failed</p>
              {validation.error && <p className="text-xs opacity-80">{validation.error}</p>}
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => void handleSave()} disabled={saving || validating} className="btn-primary">
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save & Validate'}
        </button>
        <button
          onClick={() => void handleValidate()}
          disabled={validating || saving}
          className="btn-secondary"
        >
          {validating ? 'Validating…' : 'Test Stripe Connection'}
        </button>
      </div>
    </div>
  );
}
