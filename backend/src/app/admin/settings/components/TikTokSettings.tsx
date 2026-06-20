'use client';
import React, { useEffect, useState } from 'react';

type TikTokForm = {
  enabled: boolean;
  pixelId: string;
  accessToken: string;
  testEventCode: string;
};

type SettingsPayload = {
  settings?: {
    tiktok?: Partial<TikTokForm & { hasAccessToken?: boolean }>;
  };
};

const DEFAULT_FORM: TikTokForm = {
  enabled: false,
  pixelId: '',
  accessToken: '',
  testEventCode: '',
};

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#010101' }}>
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/>
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-foreground">Cum configurezi TikTok Pixel?</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Close">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <ol className="space-y-3">
            {[
              <><a href="https://ads.tiktok.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">TikTok Ads Manager</a> → <strong>Assets → Events</strong></>,
              <>Click <strong>Web Events</strong> → <strong>Set Up Web Events</strong></>,
              <>Alege <strong>TikTok Pixel</strong> → copiază <strong>Pixel ID</strong></>,
              <>Pentru Events API: <strong>Generate Access Token</strong> în aceeași pagină</>,
              <>Pastează ambele chei mai jos și salvează</>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm text-foreground leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 px-4 py-3">
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              <strong>Pixel ID</strong> (ex: <code className="font-mono">CXXXXXXXXXXXXXXX</code>) = tracking în browser.<br/>
              <strong>Access Token</strong> = Events API server-side — mai precis pe iOS/Safari.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TikTokSettings() {
  const [form, setForm] = useState<TikTokForm>(DEFAULT_FORM);
  const [hasStoredToken, setHasStoredToken] = useState(false);
  const [tokenChanged, setTokenChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetch('/api/superadmin/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((payload: SettingsPayload | null) => {
        const tt = payload?.settings?.tiktok;
        if (!tt) return;
        setForm((prev) => ({
          ...prev,
          enabled: tt.enabled ?? prev.enabled,
          pixelId: tt.pixelId ?? prev.pixelId,
          testEventCode: tt.testEventCode ?? prev.testEventCode,
        }));
        setHasStoredToken(!!(tt.hasAccessToken ?? tt.accessToken));
      })
      .catch(() => setError('Could not load TikTok settings.'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    const payload: Partial<TikTokForm> = {
      enabled: form.enabled,
      pixelId: form.pixelId.trim(),
      testEventCode: form.testEventCode.trim(),
    };
    if (tokenChanged && form.accessToken.trim()) {
      payload.accessToken = form.accessToken.trim();
    }

    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tiktok: payload }),
    });

    setSaving(false);
    if (!res.ok) { setError('Save failed.'); return; }
    setSaved(true);
    if (tokenChanged && form.accessToken.trim()) {
      setHasStoredToken(true);
      setTokenChanged(false);
      setForm((p) => ({ ...p, accessToken: '' }));
    }
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#010101' }}>
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground">TikTok Ads</h2>
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center text-xs font-bold"
            aria-label="TikTok setup help"
          >
            ?
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Conectează TikTok Pixel pentru tracking ads și conversii. Trimite evenimente browser (Pixel) și server-side (Events API).
        </p>
      </div>

      {/* Info box */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">Ce se trackuiește automat?</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li><strong>PageView</strong> — fiecare vizită pe site</li>
          <li><strong>ViewContent</strong> — vizualizare pagini importante (pricing, guidance)</li>
          <li><strong>CompleteRegistration</strong> — înregistrare cont nou</li>
          <li><strong>Subscribe</strong> — abonare plan plătit via Stripe</li>
        </ul>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="card p-5 space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Activează TikTok Pixel</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Încarcă scriptul TikTok Pixel pe site și trimite evenimente de conversie.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, enabled: !p.enabled }))}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              form.enabled ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
            role="switch"
            aria-checked={form.enabled}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${form.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <hr className="border-border" />

        {/* Pixel ID */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Pixel ID <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            ID-ul pixelului din TikTok Ads Manager → Events. Format: <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">CXXXXXXXXXXXXXXX</code>
            {' '}— dacă lipești codul complet al pixelului, ID-ul se extrage automat.
          </p>
          <input
            type="text"
            value={form.pixelId}
            onChange={(e) => {
              const raw = e.target.value;
              // Auto-extract pixel ID if full script code is pasted
              const match = raw.match(/ttq\.load\(\s*['"]([A-Z0-9]+)['"]/);
              const value = match ? match[1] : raw.trim();
              setForm((p) => ({ ...p, pixelId: value }));
            }}
            placeholder="ex: D8R7US3C77U677EP2640"
            className="input w-full font-mono text-sm"
            spellCheck={false}
            autoComplete="off"
          />
          {form.pixelId && !/^[A-Z0-9]{10,}$/.test(form.pixelId) && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              ⚠ Pixel ID-ul pare incorect — ar trebui să fie doar litere mari și cifre (ex: D8R7US3C77U677EP2640).
            </p>
          )}
        </div>

        {/* Access Token */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Access Token <span className="text-muted-foreground text-xs font-normal">(Events API — server-side)</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Token generat în TikTok Events Manager. Folosit pentru tracking server-side, mai precis pe iOS/Safari.
          </p>
          {hasStoredToken && !tokenChanged ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 input flex items-center gap-2 text-sm text-muted-foreground font-mono">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Access token salvat (ascuns)</span>
              </div>
              <button
                type="button"
                onClick={() => { setTokenChanged(true); setForm((p) => ({ ...p, accessToken: '' })); }}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Schimbă
              </button>
            </div>
          ) : (
            <input
              type="password"
              value={form.accessToken}
              onChange={(e) => { setForm((p) => ({ ...p, accessToken: e.target.value })); setTokenChanged(true); }}
              placeholder="Paste access token..."
              className="input w-full font-mono text-sm"
              spellCheck={false}
              autoComplete="new-password"
            />
          )}
        </div>

        {/* Test Event Code */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Test Event Code <span className="text-muted-foreground text-xs font-normal">(opțional)</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Folosit în modul de testare din TikTok Events Manager. Lasă gol în producție.
          </p>
          <input
            type="text"
            value={form.testEventCode}
            onChange={(e) => setForm((p) => ({ ...p, testEventCode: e.target.value }))}
            placeholder="TEST12345"
            className="input w-full font-mono text-sm"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => void handleSave()} disabled={saving} className="btn-primary">
          {saving ? 'Se salvează...' : saved ? '✓ Salvat' : 'Salvează'}
        </button>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
