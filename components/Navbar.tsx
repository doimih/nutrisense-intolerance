"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, Menu, X, Moon, Sun, LogOut, User, LayoutDashboard, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { getSessionUser, logout } from "@/lib/api/auth";
import { useLanguage } from "@/components/LanguageProvider";
import { getUiCopy } from "@/lib/i18n/ui";

const THEME_STORAGE_KEY = "ns_theme";
const ADMIN_CONSOLE_URL = process.env.NEXT_PUBLIC_ADMIN_CONSOLE_URL || "http://localhost:4028";

export default function Navbar() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const copy = getUiCopy(lang);
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let active = true;
    getSessionUser()
      .then((user) => {
        if (active) {
          setAuthed(!!user);
          const email = user?.email?.toLowerCase() ?? "";
          setIsSuperadmin(user?.role === "superadmin" || email === "design@doimih.net");
        }
      })
      .catch(() => {
        if (active) {
          setAuthed(false);
          setIsSuperadmin(false);
        }
      });

    const html = document.documentElement;
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const isDark = storedTheme === "dark";

    html.classList.toggle("dark", isDark);
    setDarkMode(isDark);

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDark = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      window.localStorage.setItem(THEME_STORAGE_KEY, "light");
      setDarkMode(false);
    } else {
      html.classList.add("dark");
      window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
      setDarkMode(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    setAuthed(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: copy.nav.home },
    { href: "/about", label: copy.nav.about },
    { href: "/why-ai", label: copy.nav.backend },
    { href: "/trust", label: copy.nav.trust },
    { href: "/pricing", label: copy.nav.pricing },
    { href: "/faq", label: copy.nav.faq },
    { href: "/contact", label: copy.nav.contact },
  ];

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-sm border-b border-gray-100 dark:border-slate-800"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-green-200 dark:group-hover:shadow-green-900 transition-shadow">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-lg">
            NutriSense
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                pathname === link.href
                  ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={copy.nav.theme}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {authed ? (
            <>
              {isSuperadmin && (
                <a
                  href={ADMIN_CONSOLE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-950/40 rounded-lg"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Superadmin
                </a>
              )}
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                {copy.nav.dashboard}
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {copy.nav.signOut}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden md:block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {copy.nav.signIn}
              </Link>
              <Link
                href="/auth/register"
                className="hidden md:block px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors"
              >
                {copy.nav.signUp}
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={copy.nav.menu}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 px-4 pb-4 pt-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg mb-1 transition-colors",
                pathname === link.href
                  ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
                  : "text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 dark:border-slate-800 mt-2 pt-2">
            {authed ? (
              <>
                {isSuperadmin && (
                  <a
                    href={ADMIN_CONSOLE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950/30 rounded-lg mb-1"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Superadmin Console
                  </a>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg mb-1"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {copy.nav.dashboard}
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  {copy.nav.signOut}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg mb-1"
                >
                  <User className="w-4 h-4" />
                  {copy.nav.signIn}
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded-lg"
                >
                  {copy.nav.signUp}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
