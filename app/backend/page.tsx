import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ExternalLink, ArrowRight } from "lucide-react";

const ADMIN_CONSOLE_URL =
  process.env.NEXT_PUBLIC_ADMIN_CONSOLE_URL || "http://localhost:4028";

export const metadata: Metadata = {
  title: "Admin Console Access",
  description: "Open the NutriSense admin console.",
  alternates: {
    canonical: "/backend",
  },
};

export default async function BackendGatewayPage() {
  return (
    <main className="pt-24 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-5">
            <ShieldCheck className="w-4 h-4" />
            Superadmin Area
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Open Admin Console
          </h1>

          <p className="mt-4 text-slate-600 dark:text-slate-300">
            The superadmin workspace runs as a separate application. Use the button below to open
            it directly.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={ADMIN_CONSOLE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-3 transition-colors"
            >
              Open Superadmin Console
              <ExternalLink className="w-4 h-4" />
            </a>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Back to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
            If the console does not open, verify that the backend admin app is running on
            {" "}
            <span className="font-semibold">{ADMIN_CONSOLE_URL}</span>.
          </p>
        </div>
      </section>
    </main>
  );
}
