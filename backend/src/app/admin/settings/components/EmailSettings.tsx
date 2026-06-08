'use client';
import React, { useState } from 'react';

export default function EmailSettings() {
  const [form, setForm] = useState({
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    smtpUser: 'apikey',
    smtpPass: '',
    fromEmail: 'noreply@nutriaid.app',
    fromName: 'NutriAID',
    encryption: 'tls',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h2 className="section-header">Email Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure SMTP server for transactional emails
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">SMTP Host</label>
          <input
            className="input-field"
            value={form?.smtpHost}
            onChange={(e) => setForm({ ...form, smtpHost: e?.target?.value })}
            placeholder="smtp.example.com"
          />
        </div>
        <div>
          <label className="label-text">SMTP Port</label>
          <input
            className="input-field"
            value={form?.smtpPort}
            onChange={(e) => setForm({ ...form, smtpPort: e?.target?.value })}
            placeholder="587"
          />
        </div>
        <div>
          <label className="label-text">SMTP Username</label>
          <input
            className="input-field"
            value={form?.smtpUser}
            onChange={(e) => setForm({ ...form, smtpUser: e?.target?.value })}
            placeholder="username"
          />
        </div>
        <div>
          <label className="label-text">SMTP Password</label>
          <input
            className="input-field"
            type="password"
            value={form?.smtpPass}
            onChange={(e) => setForm({ ...form, smtpPass: e?.target?.value })}
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="label-text">From Email</label>
          <input
            className="input-field"
            value={form?.fromEmail}
            onChange={(e) => setForm({ ...form, fromEmail: e?.target?.value })}
            placeholder="noreply@example.com"
          />
        </div>
        <div>
          <label className="label-text">From Name</label>
          <input
            className="input-field"
            value={form?.fromName}
            onChange={(e) => setForm({ ...form, fromName: e?.target?.value })}
            placeholder="App Name"
          />
        </div>
        <div>
          <label className="label-text">Encryption</label>
          <select
            className="input-field"
            value={form?.encryption}
            onChange={(e) => setForm({ ...form, encryption: e?.target?.value })}
          >
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSave} className="btn-primary">
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
        <button className="btn-secondary">Send Test Email</button>
      </div>
    </div>
  );
}
