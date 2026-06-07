import React from 'react';
import ProfileForm from './ProfileForm';
import IntoleranceSelector from './IntoleranceSelector';
import DangerZone from './DangerZone';

export default function ProfileContent() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Profile & Preferences</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal details, dietary preferences, and food intolerances
        </p>
      </div>

      <ProfileForm />
      <IntoleranceSelector />
      <DangerZone />
    </div>
  );
}