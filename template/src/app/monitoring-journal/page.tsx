import React from 'react';
import AppLayout from '@/components/AppLayout';
import MonitoringContent from './components/MonitoringContent';

export default function MonitoringJournalPage() {
  return (
    <AppLayout currentPath="/monitoring-journal">
      <MonitoringContent />
    </AppLayout>
  );
}