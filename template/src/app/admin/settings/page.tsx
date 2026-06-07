'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import EmailSettings from './components/EmailSettings';
import AIKeysSettings from './components/AIKeysSettings';
import BackupSettings from './components/BackupSettings';
import StripeSettings from './components/StripeSettings';
import AIBrainSettings from './components/AIBrainSettings';
import UsersSettings from './components/UsersSettings';
import TwoFASettings from './components/TwoFASettings';
import PWASettings from './components/PWASettings';

type SettingsSection =
  | 'email' |'ai-keys' |'backup' |'stripe' |'ai-brain' |'users' |'2fa' |'pwa';

interface SectionItem {
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.ReactNode;
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

const sections: SectionItem[] = [
  { id: 'email', label: 'Email', description: 'SMTP & email provider', icon: <MailIcon className="w-5 h-5" /> },
  { id: 'ai-keys', label: 'AI Keys', description: 'API keys for AI providers', icon: <KeyIcon className="w-5 h-5" /> },
  { id: 'backup', label: 'Backup', description: 'Database & file backups', icon: <DatabaseIcon className="w-5 h-5" /> },
  { id: 'stripe', label: 'Stripe', description: 'Billing & payments', icon: <CreditCardIcon className="w-5 h-5" /> },
  { id: 'ai-brain', label: 'AI Brain', description: 'AI model configuration', icon: <BrainIcon className="w-5 h-5" /> },
  { id: 'users', label: 'Users', description: 'User management', icon: <UsersIcon className="w-5 h-5" /> },
  { id: '2fa', label: '2FA', description: 'Two-factor authentication', icon: <ShieldIcon className="w-5 h-5" /> },
  { id: 'pwa', label: 'PWA Notifications', description: 'Push notification settings', icon: <BellIcon className="w-5 h-5" /> },
];

const sectionComponents: Record<SettingsSection, React.ReactNode> = {
  email: <EmailSettings />,
  'ai-keys': <AIKeysSettings />,
  backup: <BackupSettings />,
  stripe: <StripeSettings />,
  'ai-brain': <AIBrainSettings />,
  users: <UsersSettings />,
  '2fa': <TwoFASettings />,
  pwa: <PWASettings />,
};

export default function AdminSettingsPage() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<SettingsSection>('email');

  return (
    <AppLayout currentPath={pathname}>
      <div className="mb-6">
        <h1 className="page-title">Admin Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage application configuration and integrations</p>
      </div>

      <div className="flex gap-6 min-h-[600px]">
        {/* Left nav */}
        <aside className="w-56 flex-shrink-0">
          <nav className="card p-2 space-y-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                  activeSection === s.id
                    ? 'bg-secondary text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="flex-shrink-0">{s.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{s.label}</p>
                  <p className="text-xs truncate opacity-70">{s.description}</p>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {sectionComponents[activeSection]}
        </div>
      </div>
    </AppLayout>
  );
}
