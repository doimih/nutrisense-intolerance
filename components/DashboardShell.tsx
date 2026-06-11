"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Sparkles,
  History,
  BookOpen,
  LogOut,
  Menu,
  X,
  Leaf,
  ChevronRight,
  ShieldCheck,
  Shield,
} from "lucide-react";
import clsx from "clsx";
import { getSessionUser, logout } from "@/lib/api/auth";
import { useLanguage } from "@/components/LanguageProvider";
import { getUiCopy } from "@/lib/i18n/ui";
import TrialExpiredModal from "@/components/TrialExpiredModal";
import SessionExpiryModal from "@/components/SessionExpiryModal";

const FALLBACK_ADMIN_CONSOLE_URL = "https://backend.nutriaid.eu";

function NavItem({
  href,
  icon: Icon,
  label,
  exact,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
        active
          ? "bg-green-600 text-white shadow-sm"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
      )}
    >
      <Icon
        className={clsx(
          "w-4 h-4 flex-shrink-0",
          active ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
        )}
      />
      {label}
      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/70" />}
    </Link>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const copy = getUiCopy(lang);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; plan?: string | null; trialEndsAt?: string | null } | null>(null);
  const [adminConsoleUrl, setAdminConsoleUrl] = useState(FALLBACK_ADMIN_CONSOLE_URL);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getSessionUser()
      .then((user) => {
        if (active && user) {
          setIsSuperadmin(user.role === "superadmin");
          setCurrentUser({ id: user.id, name: user.name, email: user.email, plan: user.plan, trialEndsAt: user.trialEndsAt });
          if (user.sessionExpiresAt) setSessionExpiresAt(user.sessionExpiresAt);
          const trialExpired = user.trialEndsAt && new Date(user.trialEndsAt).getTime() <= Date.now();
          const noPlan = !user.plan;
          const notAdmin = user.role !== "superadmin";
          if (trialExpired && noPlan && notAdmin) setShowTrialModal(true);
        }
      })
      .catch(() => {
        if (active) setIsSuperadmin(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/runtime-settings", { method: "GET" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { settings?: { adminConsoleUrl?: string } } | null) => {
        if (!active) return;
        const nextUrl = payload?.settings?.adminConsoleUrl;
        if (nextUrl) setAdminConsoleUrl(nextUrl);
      })
      .catch(() => {
        if (active) setAdminConsoleUrl(FALLBACK_ADMIN_CONSOLE_URL);
      });

    return () => {
      active = false;
    };
  }, []);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: copy.nav.dashboard, exact: true },
    { href: "/dashboard/profile", icon: User, label: isRo ? "Profil" : "Profile" },
    { href: "/dashboard/guidance", icon: Sparkles, label: isRo ? "Recomandari" : "Guidance" },
    { href: "/dashboard/history", icon: History, label: isRo ? "Istoric" : "History" },
    { href: "/dashboard/monitoring", icon: BookOpen, label: isRo ? "Jurnal" : "Journal" },
    { href: "/dashboard/gdpr", icon: Shield, label: isRo ? "GDPR" : "GDPR" },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={clsx("flex flex-col h-full", mobile ? "px-4 py-6" : "px-4 py-6")}>
      <Link href="/" className="flex items-center gap-2.5 mb-8 px-1">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-900 dark:text-white">NutriAID</span>
      </Link>

      <nav className="flex-1 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {copy.dashboardShell.menu}
        </p>
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} onClick={() => setSidebarOpen(false)} />
        ))}

        {isSuperadmin && (
          <a
            href={adminConsoleUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            {isRo ? "Consola Superadmin" : "Superadmin Console"}
          </a>
        )}
      </nav>

      <div className="border-t border-gray-100 dark:border-slate-700 pt-4 mt-4 space-y-2">
        {currentUser && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
              <span className="text-green-700 dark:text-green-300 text-xs font-bold">
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              {(() => {
                if (isSuperadmin) {
                  return (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mb-0.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Admin
                    </span>
                  );
                }
                if (currentUser.plan === "pro_plus") {
                  return (
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mb-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      Pro+
                    </span>
                  );
                }
                if (currentUser.plan === "pro") {
                  return (
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mb-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      Pro
                    </span>
                  );
                }
                if (currentUser.plan === "basic") {
                  return (
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mb-0.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                      Basic
                    </span>
                  );
                }
                // No plan — show trial status
                const trialActive = currentUser.trialEndsAt && new Date(currentUser.trialEndsAt).getTime() > Date.now();
                if (trialActive) {
                  const daysLeft = Math.ceil((new Date(currentUser.trialEndsAt!).getTime() - Date.now()) / 86_400_000);
                  return (
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mb-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      {isRo ? `Trial · ${daysLeft}z` : `Trial · ${daysLeft}d`}
                    </span>
                  );
                }
                return (
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mb-0.5 bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                    {isRo ? "Fără plan" : "Free"}
                  </span>
                );
              })()}
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
                {currentUser.name}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {copy.dashboardShell.signOut}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <Sidebar />
            </div>
          </aside>

          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label={copy.dashboardShell.menu}
              className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 shadow-xl">
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label={copy.dashboardShell.menu}
                  className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
                <Sidebar mobile />
              </div>
            </div>
          )}

          <main className="flex-1 min-w-0">{children}</main>

          {showTrialModal && currentUser && (
            <TrialExpiredModal
              userId={currentUser.id}
              lang={lang as "ro" | "en"}
            />
          )}
          {sessionExpiresAt && !showTrialModal && (
            <SessionExpiryModal
              sessionExpiresAt={sessionExpiresAt}
              lang={lang as "ro" | "en"}
              onRefreshed={setSessionExpiresAt}
            />
          )}
        </div>
      </div>
    </div>
  );
}
