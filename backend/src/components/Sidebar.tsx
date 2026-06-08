'use client';
import React from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  currentPath: string;
  userName: string;
  userEmail: string;
  userRole: 'superadmin' | 'admin' | 'user';
  onSignOut: () => void;
}

function LayoutDashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboardIcon className="w-5 h-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <SettingsIcon className="w-5 h-5" /> },
];

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  currentPath,
  userName,
  userEmail,
  userRole,
  onSignOut,
}: SidebarProps) {
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const isActive = (href: string) => {
    if (href === '/dashboard') return currentPath === '/dashboard' || currentPath === '/';
    return currentPath.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-4 py-5 border-b border-border ${collapsed ? 'justify-center px-0' : ''}`}
      >
        <div className="flex items-center gap-2.5">
          <AppLogo size={32} />
          {!collapsed && (
            <span className="font-bold text-foreground text-lg tracking-tight">NutriAID</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        <div className={`mb-3 ${collapsed ? 'hidden' : ''}`}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Main
          </p>
        </div>
        {navItems.map((item) => (
          <Link
            key={`nav-${item.href}`}
            href={item.href}
            onClick={onMobileClose}
            className={isActive(item.href) ? 'nav-item-active' : 'nav-item'}
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto bg-accent text-accent-foreground text-xs font-semibold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {/* User info */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-xs font-bold">{initials || 'SA'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                    userRole === 'superadmin'
                      ? 'bg-red-100 text-red-700'
                      : userRole === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {userRole}
                </span>
              </div>
            </div>
          </div>
        )}

        <Link
          href="/"
          className="nav-item w-full"
          title={collapsed ? 'Sign Out' : undefined}
          onClick={onSignOut}
        >
          <LogOutIcon className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>

      {/* Collapse toggle — desktop */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex items-center justify-center w-full py-3 border-t border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeftIcon
          className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
        />
        {!collapsed && <span className="ml-2 text-xs font-medium">Collapse</span>}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-card border-r border-border flex-shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col lg:hidden transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <AppLogo size={28} />
            <span className="font-bold text-foreground text-base tracking-tight">NutriAID</span>
          </div>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={`mobile-nav-${item.href}`}
                href={item.href}
                onClick={onMobileClose}
                className={isActive(item.href) ? 'nav-item-active' : 'nav-item'}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="px-3 py-4 border-t border-border">
          <Link
            href="/"
            className="nav-item w-full"
            onClick={() => {
              onSignOut();
              onMobileClose();
            }}
          >
            <LogOutIcon className="w-5 h-5" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
