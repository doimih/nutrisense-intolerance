'use client';
import React, { useEffect, useState } from 'react';

type PWAConfig = {
  enabled: boolean;
  appName: string;
  appShortName: string;
  themeColor: string;
  backgroundColor: string;
  vapidPublicKey: string;
};

type NotificationConfig = {
  dailyReminder: boolean;
  weeklyReport: boolean;
  guidanceReady: boolean;
  systemAlerts: boolean;
  reminderTime: string;
};

type SettingsPayload = {
  settings?: {
    pwa?: Partial<PWAConfig> & { notifications?: Partial<NotificationConfig> };
  };
};

const DEFAULT_CONFIG: PWAConfig = {
  enabled: false,
  appName: 'NutriAID',
  appShortName: 'NutriAID',
  themeColor: '#16a34a',
  backgroundColor: '#f8faf8',
  vapidPublicKey: '',
};

const DEFAULT_NOTIFICATIONS: NotificationConfig = {
  dailyReminder: false,
  weeklyReport: false,
  guidanceReady: false,
  systemAlerts: false,
  reminderTime: '08:00',
};

export default function PWASettings() {
  const [config, setConfig] = useState<PWAConfig>(DEFAULT_CONFIG);
  const [vapidPrivateKey, setVapidPrivateKey] = useState('');
  const [notifications, setNotifications] = useState<NotificationConfig>(DEFAULT_NOTIFICATIONS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/superadmin/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: SettingsPayload | null) => {
        const pwa = payload?.settings?.pwa;
        if (!pwa) return;
        setConfig((prev) => ({
          enabled: pwa.enabled ?? prev.enabled,
          appName: pwa.appName ?? prev.appName,
          appShortName: pwa.appShortName ?? prev.appShortName,
          themeColor: pwa.themeColor ?? prev.themeColor,
          backgroundColor: pwa.backgroundColor ?? prev.backgroundColor,
          vapidPublicKey: pwa.vapidPublicKey ?? prev.vapidPublicKey,
        }));
        if (pwa.notifications) {
          setNotifications((prev) => ({
            dailyReminder: pwa.notifications?.dailyReminder ?? prev.dailyReminder,
            weeklyReport: pwa.notifications?.weeklyReport ?? prev.weeklyReport,
            guidanceReady: pwa.notifications?.guidanceReady ?? prev.guidanceReady,
            systemAlerts: pwa.notifications?.systemAlerts ?? prev.systemAlerts,
            reminderTime: pwa.notifications?.reminderTime ?? prev.reminderTime,
          }));
        }
      })
      .catch(() => setError('Could not load PWA settings.'));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch('/api/superadmin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pwa: {
          enabled: config.enabled,
          appName: config.appName,
          appShortName: config.appShortName,
          themeColor: config.themeColor,
          backgroundColor: config.backgroundColor,
          vapidPublicKey: config.vapidPublicKey,
          notifications,
        },
      }),
    });
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(payload.error || 'Could not save PWA settings.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="card p-6 space-y-5">
        <div>
          <h2 className="section-header">PWA & Push Notifications</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure Progressive Web App and push notification settings
          </p>
        </div>

        {error && (
          <p className="text-sm rounded-lg border border-negative/30 bg-negative-bg text-negative px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
          <div>
            <p className="text-sm font-semibold text-foreground">Enable PWA</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Allow users to install the app on their devices
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              config.enabled ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
            aria-label={config.enabled ? 'Disable PWA' : 'Enable PWA'}
            title={config.enabled ? 'Disable PWA' : 'Enable PWA'}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                config.enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">App Name</label>
            <input
              className="input-field"
              aria-label="App Name"
              title="App Name"
              value={config.appName}
              onChange={(e) => setConfig({ ...config, appName: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text">Short Name</label>
            <input
              className="input-field"
              aria-label="Short Name"
              title="Short Name"
              value={config.appShortName}
              onChange={(e) => setConfig({ ...config, appShortName: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text">Theme Color</label>
            <div className="flex gap-2">
              <input
                className="input-field flex-1 font-mono text-xs"
                aria-label="Theme Color Hex"
                title="Theme Color Hex"
                value={config.themeColor}
                onChange={(e) => setConfig({ ...config, themeColor: e.target.value })}
              />
              <input
                type="color"
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                aria-label="Theme Color Picker"
                title="Theme Color Picker"
                value={config.themeColor}
                onChange={(e) => setConfig({ ...config, themeColor: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label-text">Background Color</label>
            <div className="flex gap-2">
              <input
                className="input-field flex-1 font-mono text-xs"
                aria-label="Background Color Hex"
                title="Background Color Hex"
                value={config.backgroundColor}
                onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
              />
              <input
                type="color"
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                aria-label="Background Color Picker"
                title="Background Color Picker"
                value={config.backgroundColor}
                onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
              />
            </div>
          </div>
          <div className="col-span-2">
            <label className="label-text">VAPID Public Key</label>
            <input
              className="input-field font-mono text-xs"
              value={config.vapidPublicKey}
              onChange={(e) => setConfig({ ...config, vapidPublicKey: e.target.value })}
              placeholder="BEl62iUYgUivxIkv..."
            />
            <p className="helper-text">Required for Web Push notifications</p>
          </div>
          <div className="col-span-2">
            <label className="label-text">VAPID Private Key</label>
            <input
              className="input-field font-mono text-xs"
              type="password"
              value={vapidPrivateKey}
              onChange={(e) => setVapidPrivateKey(e.target.value)}
              placeholder="••••••••••••••••"
              autoComplete="new-password"
            />
            <p className="helper-text">Not stored in DB — set via VAPID_PRIVATE_KEY env var.</p>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Notification Types</h3>
        <div className="space-y-3">
          {[
            {
              key: 'dailyReminder' as const,
              label: 'Daily Journal Reminder',
              desc: 'Remind users to log their daily food & symptoms',
            },
            {
              key: 'weeklyReport' as const,
              label: 'Weekly Health Report',
              desc: 'Send a weekly summary of health trends',
            },
            {
              key: 'guidanceReady' as const,
              label: 'AI Guidance Ready',
              desc: 'Notify when new AI recommendations are available',
            },
            {
              key: 'systemAlerts' as const,
              label: 'System Alerts',
              desc: 'Critical system and maintenance notifications',
            },
          ].map(({ key, label, desc }) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/20 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary"
                checked={notifications[key]}
                onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
              />
            </label>
          ))}
        </div>

        <div className="pt-1">
          <label className="label-text">Daily Reminder Time</label>
          <input
            className="input-field w-40"
            type="time"
            aria-label="Daily Reminder Time"
            title="Daily Reminder Time"
            value={notifications.reminderTime}
            onChange={(e) => setNotifications({ ...notifications, reminderTime: e.target.value })}
          />
        </div>
      </div>

      <div className="pt-1">
        <button onClick={() => void handleSave()} disabled={saving} className="btn-primary">
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save PWA Settings'}
        </button>
      </div>
    </div>
  );
}
