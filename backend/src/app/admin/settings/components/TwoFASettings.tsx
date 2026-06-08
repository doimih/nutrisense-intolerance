'use client';
import React, { useEffect, useState } from 'react';

export default function TwoFASettings() {
  const [globalEnabled, setGlobalEnabled] = useState(false);
  const [enforceAdmin, setEnforceAdmin] = useState(true);
  const [enforceAll, setEnforceAll] = useState(false);
  const [methods, setMethods] = useState({ totp: true, sms: false, email: true });
  const [secret, setSecret] = useState<string | null>(null);
  const [otpAuthUrl, setOtpAuthUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/superadmin/settings')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { settings?: { twoFactor?: Record<string, unknown> } } | null) => {
        const twoFactor = payload?.settings?.twoFactor;
        if (!twoFactor) return;

        setGlobalEnabled(Boolean(twoFactor.globalEnabled));
        setEnforceAdmin(Boolean(twoFactor.enforceAdmin ?? true));
        setEnforceAll(Boolean(twoFactor.enforceAll));

        const methodsValue = twoFactor.methods as
          | { totp?: boolean; sms?: boolean; email?: boolean }
          | undefined;
        if (methodsValue) {
          setMethods({
            totp: methodsValue.totp ?? true,
            sms: methodsValue.sms ?? false,
            email: methodsValue.email ?? false,
          });
        }
      })
      .catch(() => {
        setError('Could not load 2FA settings.');
      });

    fetch('/api/superadmin/auth/2fa/secret')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { secret?: string | null; otpAuthUrl?: string | null } | null) => {
        if (!payload) return;
        setSecret(payload.secret || null);
        setOtpAuthUrl(payload.otpAuthUrl || null);
      })
      .catch(() => {
        // keep empty when unavailable
      });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const response = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        twoFactor: {
          globalEnabled,
          enforceAdmin,
          enforceAll,
          methods,
        },
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setLoading(false);
      setError(payload.error || 'Could not save 2FA settings.');
      return;
    }

    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleGenerateSecret = async () => {
    setError(null);
    const response = await fetch('/api/superadmin/auth/2fa/secret', { method: 'POST' });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      secret?: string;
      otpAuthUrl?: string;
    };
    if (!response.ok) {
      setError(payload.error || 'Could not generate 2FA secret.');
      return;
    }

    setSecret(payload.secret || null);
    setOtpAuthUrl(payload.otpAuthUrl || null);
  };

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="section-header">Two-Factor Authentication</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure 2FA policies for application users
        </p>
      </div>

      {error && (
        <p className="text-sm rounded-lg border border-negative/30 bg-negative-bg text-negative px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
        <div>
          <p className="text-sm font-semibold text-foreground">Enable 2FA System-wide</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Allow users to set up two-factor authentication
          </p>
        </div>
        <button
          type="button"
          onClick={() => setGlobalEnabled(!globalEnabled)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
            globalEnabled ? 'bg-primary' : 'bg-muted-foreground/30'
          }`}
          aria-label={globalEnabled ? 'Disable two-factor authentication system-wide' : 'Enable two-factor authentication system-wide'}
          title={globalEnabled ? 'Disable two-factor authentication system-wide' : 'Enable two-factor authentication system-wide'}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
              globalEnabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Enforcement Policy</p>
        <label className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/20 transition-colors">
          <div>
            <p className="text-sm font-medium text-foreground">Require 2FA for Admins</p>
            <p className="text-xs text-muted-foreground">All admin accounts must use 2FA</p>
          </div>
          <input
            type="checkbox"
            className="w-4 h-4 accent-primary"
            checked={enforceAdmin}
            onChange={(e) => setEnforceAdmin(e.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/20 transition-colors">
          <div>
            <p className="text-sm font-medium text-foreground">Require 2FA for All Users</p>
            <p className="text-xs text-muted-foreground">
              Every account must set up 2FA on next login
            </p>
          </div>
          <input
            type="checkbox"
            className="w-4 h-4 accent-primary"
            checked={enforceAll}
            onChange={(e) => setEnforceAll(e.target.checked)}
          />
        </label>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Allowed 2FA Methods</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'totp', label: 'Authenticator App', desc: 'TOTP (Google Auth, Authy)' },
            { key: 'sms', label: 'SMS Code', desc: 'One-time code via SMS' },
            { key: 'email', label: 'Email Code', desc: 'One-time code via email' },
          ].map(({ key, label, desc }) => (
            <label
              key={key}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                methods[key as keyof typeof methods]
                  ? 'border-primary bg-secondary'
                  : 'border-border hover:bg-muted/20'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary mt-0.5"
                  checked={methods[key as keyof typeof methods]}
                  onChange={(e) => setMethods({ ...methods, [key]: e.target.checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </label>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Authenticator App Secret</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generate and add this secret in Google Authenticator/Authy.
            </p>
          </div>
          <button onClick={handleGenerateSecret} className="btn-secondary">
            {secret ? 'Regenerate' : 'Generate'} secret
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Secret</p>
            <code className="block text-xs rounded bg-card border border-border px-2 py-2 break-all">
              {secret || 'No secret generated yet'}
            </code>
          </div>
          {otpAuthUrl && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">otpauth URL</p>
              <code className="block text-xs rounded bg-card border border-border px-2 py-2 break-all">
                {otpAuthUrl}
              </code>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <button onClick={handleSave} className="btn-primary" disabled={loading}>
          {saved ? '✓ Saved' : 'Save 2FA Settings'}
        </button>
      </div>
    </div>
  );
}
