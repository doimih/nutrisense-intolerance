import type { Metadata } from "next";
import Link from "next/link";
import { Brain, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "De ce AI?",
  description:
    "Afla de ce AI-ul NutriAID poate observa tipare in intolerante alimentare mai rapid si mai clar.",
  alternates: {
    canonical: "/why-ai",
  },
};

export default function WhyAiPage() {
  return (
    <main className="pt-24 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-5">
            <Brain className="w-4 h-4" />
            De ce AI?
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            AI-ul vede tipare pe care analiza manuala le rateaza
          </h1>

          <p className="mt-4 text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Intolerantele alimentare pot avea reactii intarziate si combinatii greu de urmarit.
            NutriAID foloseste AI pentru a corela jurnalul alimentar cu simptomele si pentru a
            genera recomandari mai clare, personalizate.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-300 mb-2" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Corelatii rapide</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Observa legaturi intre alimente si simptome in timp.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <Brain className="w-5 h-5 text-cyan-600 dark:text-cyan-300 mb-2" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Model personalizat</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Recomandarile se adapteaza la datele tale reale.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-300 mb-2" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Utilizare responsabila</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Nu inlocuieste medicul; te ajuta sa iei decizii mai informate.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-3 transition-colors"
            >
              Incepe gratuit
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/guidance"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Vezi recomandari AI
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
