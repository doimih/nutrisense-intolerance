"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Clock, LogIn, RefreshCw, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";

const WARN_SECONDS_BEFORE = 5 * 60; // show warning at 5 min remaining
const CHECK_INTERVAL_MS = 15_000;   // re-check every 15s

type Phase = "idle" | "warning" | "expired";

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Props = {
  sessionExpiresAt: number; // Unix timestamp (seconds)
  lang: "ro" | "en";
  onRefreshed: (newExpiresAt: number) => void;
};

export default function SessionExpiryModal({ sessionExpiresAt, lang, onRefreshed }: Props) {
  const isRo = lang === "ro";
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [extending, setExtending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const computePhase = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = sessionExpiresAt - now;

    setSecondsLeft(Math.max(0, remaining));

    if (remaining <= 0) {
      setPhase("expired");
    } else if (remaining <= WARN_SECONDS_BEFORE) {
      setPhase("warning");
    } else {
      setPhase("idle");
      setDismissed(false);
    }
  }, [sessionExpiresAt]);

  // Initial check + interval
  useEffect(() => {
    computePhase();
    const id = setInterval(computePhase, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [computePhase]);

  // Fine-grained countdown ticker (every second) only while warning/expired
  useEffect(() => {
    if (phase !== "warning") return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) setPhase("expired");
        return Math.max(0, next);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const handleExtend = async () => {
    setExtending(true);
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { sessionExpiresAt?: number };
        if (data.sessionExpiresAt) {
          onRefreshed(data.sessionExpiresAt);
          setPhase("idle");
          setDismissed(false);
        }
      } else {
        // Session already expired server-side
        setPhase("expired");
      }
    } catch {
      // ignore
    } finally {
      setExtending(false);
    }
  };

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    router.push("/");
  };

  const handleLoginRedirect = () => {
    router.push("/auth/login");
  };

  if (phase === "idle" || dismissed) return null;

  if (phase === "expired") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {isRo ? "Sesiunea a expirat" : "Session expired"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {isRo
                ? "Sesiunea ta a expirat. Te rugăm să te autentifici din nou pentru a continua."
                : "Your session has expired. Please log in again to continue."}
            </p>
            <button
              onClick={handleLoginRedirect}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {isRo ? "Autentifică-te din nou" : "Log in again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Warning phase
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-700 overflow-hidden">
        <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-4 border-b border-amber-100 dark:border-amber-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {isRo ? "Sesiunea expiră curând" : "Session expiring soon"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRo ? "Vei fi deconectat automat" : "You will be logged out automatically"}
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-5">
            <span className="text-4xl font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {formatCountdown(secondsLeft)}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isRo ? "timp rămas" : "remaining"}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleExtend}
              disabled={extending}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${extending ? "animate-spin" : ""}`} />
              {extending
                ? (isRo ? "Se extinde..." : "Extending...")
                : (isRo ? "Extinde sesiunea" : "Extend session")}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setDismissed(true)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
              >
                {isRo ? "Ignoră" : "Dismiss"}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 flex-1 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                {isRo ? "Deconectare" : "Log out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
