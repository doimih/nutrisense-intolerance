import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "De ce AI?",
  description:
    "Explicam tehnologia pe intelesul oamenilor bolnavi, fara jargon, fara frica.",
  alternates: {
    canonical: "/why-ai",
  },
};

export default function WhyAiPage() {
  return (
    <main className="pt-24 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <section className="relative overflow-hidden border-y border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-100 via-white to-slate-50 dark:from-emerald-950/30 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 right-0 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="absolute -bottom-16 left-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            DE CE AI?
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-700 dark:text-slate-300 italic max-w-4xl">
            Explicam tehnologia pe intelesul oamenilor bolnavi, fara jargon, fara frica
          </p>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white max-w-5xl">
            De ce AI? Pentru ca intolerantele alimentare sunt prea complexe pentru a fi intelese manual.
          </h1>
          <div className="mt-6 text-slate-700 dark:text-slate-300 text-lg leading-relaxed space-y-1">
            <p>Simptomele tale nu sunt simple.</p>
            <p>Reactiile corpului tau nu sunt lineare.</p>
            <p>Intolerantele nu sunt evidente.</p>
            <p>AI-ul poate vedea tipare pe care niciun om nu le poate observa.</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Adevarul pe care nimeni nu ti-l spune</h2>
          <p className="text-slate-700 dark:text-slate-300">Intolerantele alimentare sunt greu de identificat pentru ca:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
            <li>simptomele apar uneori imediat, alteori dupa 48 de ore</li>
            <li>reactiile pot fi declansate de combinatii de alimente</li>
            <li>corpul reactioneaza diferit in functie de stres, somn, hormoni</li>
            <li>nu exista analize standard care sa le detecteze</li>
            <li>oamenii nu pot tine minte tot ce mananca</li>
            <li>corelatiile sunt imposibil de observat manual</li>
          </ul>
          <p className="font-semibold text-slate-900 dark:text-white">Nu este vina ta ca nu ai gasit raspunsuri. Este vina complexitatii.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">De ce AI-ul poate vedea ceea ce tu nu poti?</h2>
          <div className="space-y-3 text-slate-700 dark:text-slate-300">
            <p><span className="font-semibold text-slate-900 dark:text-white">Analizeaza sute de variabile simultan:</span> Ce ai mancat, cand ai mancat, cum te-ai simtit, cat a durat reactia, cat de intensa a fost.</p>
            <p><span className="font-semibold text-slate-900 dark:text-white">Observa tipare ascunse:</span> Reactii intarziate, combinatii problematice, declansatori subtili.</p>
            <p><span className="font-semibold text-slate-900 dark:text-white">Coreleaza simptomele cu alimentele:</span> Nu ghiceste. Calculeaza.</p>
            <p><span className="font-semibold text-slate-900 dark:text-white">Invata din datele tale:</span> Cu cat il folosesti mai mult, cu atat devine mai precis.</p>
            <p><span className="font-semibold text-slate-900 dark:text-white">Nu uita nimic:</span> Nu pierde informatii. Nu se incurca. Nu se lasa pacalit de reactii intarziate.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ce face AI-ul NutriAID in fiecare zi?</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
            <li>Analizeaza toate mesele introduse</li>
            <li>Coreleaza simptomele cu alimentele</li>
            <li>Identifica declansatori probabili</li>
            <li>Observa reactiile intarziate</li>
            <li>Masoara intensitatea simptomelor</li>
            <li>Calculeaza probabilitati</li>
            <li>Actualizeaza lista alimentelor suspecte</li>
            <li>Actualizeaza lista alimentelor sigure</li>
            <li>Ajusteaza recomandarile zilnice</li>
          </ul>
          <p className="font-semibold text-slate-900 dark:text-white">Totul automat. Totul personalizat. Totul pentru tine.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">De ce nu poate face asta un om?</h2>
          <p className="text-slate-700 dark:text-slate-300">Pentru ca un om:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
            <li>nu poate tine minte tot ce ai mancat</li>
            <li>nu poate analiza reactii intarziate</li>
            <li>nu poate calcula probabilitati</li>
            <li>nu poate observa tipare subtile</li>
            <li>nu poate analiza sute de combinatii</li>
            <li>nu poate procesa date zilnice timp de saptamani</li>
          </ul>
          <p className="font-semibold text-slate-900 dark:text-white">AI-ul nu te inlocuieste. Te ajuta sa intelegi ceea ce corpul tau incearca sa iti spuna.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Este sigur? Este de incredere?</h2>
          <p className="text-slate-700 dark:text-slate-300">Da.</p>
          <p className="text-slate-700 dark:text-slate-300">NutriAID Intolerances:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
            <li>nu pune diagnostice</li>
            <li>nu inlocuieste medicul</li>
            <li>nu ofera tratament</li>
            <li>nu iti spune ce sa mananci "obligatoriu"</li>
            <li>nu iti impune diete extreme</li>
          </ul>
          <p className="font-semibold text-slate-900 dark:text-white">Iti ofera claritate. Iti ofera logica. Iti ofera explicatii. Iti ofera control.</p>
          <p className="text-slate-700 dark:text-slate-300">Totul intr-un mod sigur, empatic, uman.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ce simt oamenii cand inteleg cum functioneaza AI-ul?</h2>
          <p className="text-slate-700 dark:text-slate-300">Majoritatea utilizatorilor spun:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
            <li>"Acum are sens."</li>
            <li>"Nu e magie, e logic."</li>
            <li>"In sfarsit cineva poate vedea ce eu nu pot."</li>
            <li>"Nu ma mai simt pierdut."</li>
            <li>"Nu ma mai simt nebun."</li>
          </ul>
          <p className="font-semibold text-slate-900 dark:text-white">AI-ul nu te judeca. AI-ul te ajuta.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">De ce AI-ul este solutia pe care medicina traditionala nu ti-a oferit-o?</h2>
          <p className="text-slate-700 dark:text-slate-300">Pentru ca medicina:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
            <li>se bazeaza pe analize</li>
            <li>analizele nu detecteaza intolerantele</li>
            <li>medicii nu pot urmari zilnic ce mananci</li>
            <li>nimeni nu poate analiza sute de combinatii</li>
            <li>nimeni nu poate observa reactii intarziate</li>
          </ul>
          <p className="font-semibold text-slate-900 dark:text-white">AI-ul completeaza ceea ce medicina nu poate face. Nu concureaza cu ea. Lucreaza alaturi de tine.</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6 space-y-4 lg:col-span-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">CTA final</h2>
          <p className="text-xl font-semibold text-slate-900 dark:text-white">E timpul sa folosesti tehnologia pentru a intelege ce iti face rau.</p>
          <div className="text-slate-700 dark:text-slate-300 space-y-1">
            <p>Nu trebuie sa suferi in tacere.</p>
            <p>Nu trebuie sa ghicesti.</p>
            <p>Nu trebuie sa traiesti cu frica de mancare.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 transition-colors"
            >
              Incepe analiza intolerantelor tale
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/guidance"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Vezi cum functioneaza NutriAID
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
