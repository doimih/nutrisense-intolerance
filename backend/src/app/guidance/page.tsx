import React from 'react';
import AppLayout from '@/components/AppLayout';
import GuidanceContent from './components/GuidanceContent';

export default function GuidancePage() {
  return (
    <AppLayout currentPath="/guidance">
      <GuidanceContent />
    </AppLayout>
  );
}
