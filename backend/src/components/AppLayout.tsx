'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { AdminSession, clearAdminSession, loadAdminSession } from '@/lib/adminAuth';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

export default function AppLayout({ children, currentPath }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentSession = loadAdminSession();

    if (!currentSession) {
      setSession(null);
      setIsSessionChecked(true);
      router.replace('/');
      return;
    }

    if (currentSession.mustChangePassword) {
      setSession(currentSession);
      setIsSessionChecked(true);
      router.replace('/change-password');
      return;
    }

    setSession(currentSession);
    setIsSessionChecked(true);
  }, [router]);

  const handleSignOut = () => {
    clearAdminSession();
    setSession(null);
    router.push('/');
  };

  if (!isSessionChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading your admin workspace…</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        currentPath={currentPath}
        userName={session.name}
        userEmail={session.email}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-5 h-5 text-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="font-bold text-foreground text-base tracking-tight">NutriSense</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
