'use client';
import React, { useState } from 'react';

export default function TwoFASettings() {
  const [globalEnabled, setGlobalEnabled] = useState(false);
  const [enforceAdmin, setEnforceAdmin] = useState(true);
  const [enforceAll, setEnforceAll] = useState(false);
  const [methods, setMethods] = useState({ totp: true, sms: false, email: true });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="section-header">Two-Factor Authentication</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure 2FA policies for application users</p>
      </div>

      {/* Master toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
        <div>
          <p className="text-sm font-semibold text-foreground">Enable 2FA System-wide</p>
          <p className="text-xs text-muted-foreground mt-0.5">Allow users to set up two-factor authentication</p>
        </div>
        <button
          onClick={() => setGlobalEnabled(!globalEnabled)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${globalEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${globalEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Enforcement */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Enforcement Policy</p>
        <label className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/20 transition-colors">
          <div>
            <p className="text-sm font-medium text-foreground">Require 2FA for Admins</p>
            <p className="text-xs text-muted-foreground">All admin accounts must use 2FA</p>
          </div>
          <input type="checkbox" className="w-4 h-4 accent-primary" checked={enforceAdmin} onChange={e => setEnforceAdmin(e.target.checked)} />
        </label>
        <label className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/20 transition-colors">
          <div>
            <p className="text-sm font-medium text-foreground">Require 2FA for All Users</p>
            <p className="text-xs text-muted-foreground">Every account must set up 2FA on next login</p>
          </div>
          <input type="checkbox" className="w-4 h-4 accent-primary" checked={enforceAll} onChange={e => setEnforceAll(e.target.checked)} />
        </label>
      </div>

      {/* Methods */}
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
              className={`p-3 rounded-lg border cursor-pointer transition-all ${methods[key as keyof typeof methods] ? 'border-primary bg-secondary' : 'border-border hover:bg-muted/20'}`}
            >
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary mt-0.5"
                  checked={methods[key as keyof typeof methods]}
                  onChange={e => setMethods({ ...methods, [key]: e.target.checked })}
                />
              </div>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button onClick={handleSave} className="btn-primary">{saved ? '✓ Saved' : 'Save 2FA Settings'}</button>
      </div>
    </div>
  );
}
