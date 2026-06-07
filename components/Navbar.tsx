"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Leaf, Menu, X, Moon, Sun, LogOut, User, LayoutDashboard } from "lucide-react";
import clsx from "clsx";
import { logout, isAuthenticated } from "@/lib/api/auth";
import { useLanguage } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
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
      setDarkMode(false);
    } else {
      html.classList.add("dark");
      setDarkMode(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    setAuthed(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: isRo ? "Acasa" : "Home" },
    { href: "/about", label: isRo ? "Despre" : "About" },
    { href: "/backend", label: "Backend App" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
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
            aria-label={isRo ? "Comuta tema" : "Toggle theme"}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <LanguageSwitcher />

          {authed ? (
            <>
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                {isRo ? "Panou" : "Dashboard"}
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {isRo ? "Iesire" : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden md:block px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {isRo ? "Autentificare" : "Sign in"}
              </Link>
              <Link
                href="/auth/register"
                className="hidden md:block px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors"
              >
                {isRo ? "Creeaza cont" : "Create account"}
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isRo ? "Meniu" : "Menu"}
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
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg mb-1"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {isRo ? "Panou" : "Dashboard"}
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  {isRo ? "Iesire" : "Sign out"}
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
                  {isRo ? "Autentificare" : "Sign in"}
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded-lg"
                >
                  {isRo ? "Creeaza cont" : "Create account"}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
