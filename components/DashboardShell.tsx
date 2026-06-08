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
} from "lucide-react";
import clsx from "clsx";
import { getSessionUser, logout } from "@/lib/api/auth";
import { useLanguage } from "@/components/LanguageProvider";
import { getUiCopy } from "@/lib/i18n/ui";

const ADMIN_CONSOLE_URL = process.env.NEXT_PUBLIC_ADMIN_CONSOLE_URL || "http://localhost:4028";

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

  useEffect(() => {
    let active = true;
    getSessionUser()
      .then((user) => {
        if (active) {
          const email = user?.email?.toLowerCase() ?? "";
          setIsSuperadmin(user?.role === "superadmin" || email === "design@doimih.net");
        }
      })
      .catch(() => {
        if (active) setIsSuperadmin(false);
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
            href={ADMIN_CONSOLE_URL}
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

      <div className="border-t border-gray-100 dark:border-slate-700 pt-4 mt-4">
        {isSuperadmin && (
          <div className="mb-3 px-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              SUPERADMIN
            </span>
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
        </div>
      </div>
    </div>
  );
}
