'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import WorkersTab from './components/WorkersTab';
import OrchestratorTab from './components/OrchestratorTab';
import PlatformTab from './components/PlatformTab';
import AIChatTab from './components/AIChatTab';

type Tab = 'workers' | 'orchestrator' | 'platform' | 'ai-chat';

const TABS: Array<{ id: Tab; label: string; description: string }> = [
  { id: 'workers', label: 'Workers', description: 'Test individual worker validation + auto-correction' },
  { id: 'orchestrator', label: 'Orchestrator', description: 'Run full orchestrator pipeline with intent routing' },
  { id: 'platform', label: 'Platform', description: 'End-to-end test from frontend payload to final output' },
  { id: 'ai-chat', label: 'AI Test Chat', description: 'Generate tests automatically via AI prompts' },
];

export default function AITestLabPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<Tab>('workers');

  const current = TABS.find((t) => t.id === activeTab)!;

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">AI Test Lab</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Run worker tests, orchestrator tests, full platform tests and generate tests with AI.
          </p>
        </div>

        {/* Tab bar */}
        <div className="border-b border-border">
          <nav className="flex gap-1 overflow-x-auto scrollbar-thin pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab description */}
        <p className="text-xs text-muted-foreground">{current.description}</p>

        {/* Tab content */}
        {activeTab === 'workers' && <WorkersTab />}
        {activeTab === 'orchestrator' && <OrchestratorTab />}
        {activeTab === 'platform' && <PlatformTab />}
        {activeTab === 'ai-chat' && <AIChatTab />}
      </div>
    </AppLayout>
  );
}
