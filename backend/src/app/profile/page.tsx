import React from 'react';
import AppLayout from '@/components/AppLayout';
import ProfileContent from './components/ProfileContent';

export default function ProfilePage() {
  return (
    <AppLayout currentPath="/profile">
      <ProfileContent />
    </AppLayout>
  );
}
