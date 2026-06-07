'use client';
import React, { useState } from 'react';

export default function PWASettings() {
  const [config, setConfig] = useState({
    enabled: true,
    vapidPublicKey: '',
    vapidPrivateKey: '',
    appName: 'NutriSense',
    appShortName: 'NutriSense',
    themeColor: '#16a34a',
    backgroundColor: '#f8faf8',
  });
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    guidanceReady: true,
    systemAlerts: true,
    reminderTime: '08:00',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
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

        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
          <div>
            <p className="text-sm font-semibold text-foreground">Enable PWA</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Allow users to install the app on their devices
            </p>
          </div>
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              config.enabled ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
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
              value={config.appName}
              onChange={(e) => setConfig({ ...config, appName: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text">Short Name</label>
            <input
              className="input-field"
              value={config.appShortName}
              onChange={(e) => setConfig({ ...config, appShortName: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text">Theme Color</label>
            <div className="flex gap-2">
              <input
                className="input-field flex-1 font-mono text-xs"
                value={config.themeColor}
                onChange={(e) => setConfig({ ...config, themeColor: e.target.value })}
              />
              <input
                type="color"
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
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
                value={config.backgroundColor}
                onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
              />
              <input
                type="color"
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
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
              value={config.vapidPrivateKey}
              onChange={(e) => setConfig({ ...config, vapidPrivateKey: e.target.value })}
              placeholder="••••••••••••••••"
            />
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Notification Types</h3>
        <div className="space-y-3">
          {[
            {
              key: 'dailyReminder',
              label: 'Daily Journal Reminder',
              desc: 'Remind users to log their daily food & symptoms',
            },
            {
              key: 'weeklyReport',
              label: 'Weekly Health Report',
              desc: 'Send a weekly summary of health trends',
            },
            {
              key: 'guidanceReady',
              label: 'AI Guidance Ready',
              desc: 'Notify when new AI recommendations are available',
            },
            {
              key: 'systemAlerts',
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
                checked={notifications[key as keyof typeof notifications] as boolean}
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
            value={notifications.reminderTime}
            onChange={(e) => setNotifications({ ...notifications, reminderTime: e.target.value })}
          />
        </div>
      </div>

      <div className="pt-1">
        <button onClick={handleSave} className="btn-primary">
          {saved ? '✓ Saved' : 'Save PWA Settings'}
        </button>
      </div>
    </div>
  );
}
