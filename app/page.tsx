import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Leaf,
  BookOpen,
  Shield,
  Users,
  ChevronRight,
  CheckCircle2,
  UserPlus,
  Settings,
  Sparkles,
  BookMarked,
  Star,
  Lock,
  Trash2,
} from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "NutriSense Intolerances",
  description:
    "Track food reactions, keep a journal and receive general guidance for food intolerances.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const lang = getServerLanguage();
  const isRo = lang === "ro";

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 pt-16">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-100 dark:bg-green-900/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-100 dark:bg-teal-900/20 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full text-sm font-medium mb-8 border border-green-200 dark:border-green-800">
            <Leaf className="w-3.5 h-3.5" />
            <span>{isRo ? "Gratuit · Fara reclame · Sigur" : "Free · No ads · Secure"}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
            NutriSense{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
              Intolerances
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {isRo
              ? "Un loc sigur pentru a intelege mai bine intolerantele alimentare si reactiile tale."
              : "A safe place to better understand food intolerances and your body reactions."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-200 dark:hover:shadow-green-900/50 transition-all duration-200 text-base"
            >
              {isRo ? "Incepe acum" : "Get started"}
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl shadow-sm border border-gray-200 dark:border-slate-600 transition-all duration-200 text-base"
            >
              {isRo ? "Autentificare" : "Login"}
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>{isRo ? "Fara abonament" : "No subscription"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>{isRo ? "Fara reclame" : "No ads"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>{isRo ? "Date sterse oricand" : "Data removable anytime"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>GDPR compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
              {isRo ? "Cum functioneaza" : "How it works"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">
              {isRo ? "Simplu, in 3 pasi" : "Simple in 3 steps"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-xl mx-auto">
              {isRo
                ? "Porneste in cateva minute si incepe sa intelegi mai bine ce functioneaza pentru corpul tau."
                : "Start in minutes and understand better what works for your body."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: UserPlus,
                title: isRo ? "Creezi cont" : "Create account",
                description:
                  isRo
                    ? "Inregistrare rapida cu nume, email si parola. Nicio carte de credit, niciun abonament."
                    : "Quick signup with name, email and password. No credit card, no subscription.",
                color: "green",
              },
              {
                step: "02",
                icon: Settings,
                title: isRo ? "Iti setezi profilul" : "Set up your profile",
                description:
                  isRo
                    ? "Adaugi intolerantele tale si preferintele alimentare. Poti modifica oricand."
                    : "Add your intolerances and dietary preferences. You can update them anytime.",
                color: "teal",
              },
              {
                step: "03",
                icon: Sparkles,
                title: isRo ? "Primesti recomandari" : "Get guidance",
                description:
                  isRo
                    ? "Generezi recomandari generale adaptate profilului tau si monitorizezi reactiile in jurnal."
                    : "Generate profile-based general guidance and track reactions in your journal.",
                color: "blue",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative flex flex-col items-start p-8 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <span className="text-6xl font-black text-gray-100 dark:text-slate-700 absolute top-6 right-6">
                  {item.step}
                </span>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                    item.color === "green"
                      ? "bg-green-100 dark:bg-green-900/40"
                      : item.color === "teal"
                      ? "bg-teal-100 dark:bg-teal-900/40"
                      : "bg-blue-100 dark:bg-blue-900/40"
                  }`}
                >
                  <item.icon
                    className={`w-6 h-6 ${
                      item.color === "green"
                        ? "text-green-600 dark:text-green-400"
                        : item.color === "teal"
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-gradient-to-b from-green-50/50 to-white dark:from-slate-800/50 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
              {isRo ? "Functionalitati" : "Features"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">
              {isRo ? "Tot ce ai nevoie, la un loc" : "Everything you need in one place"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookMarked,
                title: isRo ? "Jurnal de monitorizare" : "Monitoring journal",
                description:
                  isRo
                    ? "Noteaza ce ai mancat, ce simptome ai avut si cum te-ai simtit."
                    : "Track food, symptoms and how you felt to detect patterns over time.",
                color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
              },
              {
                icon: Sparkles,
                title: isRo ? "Recomandari generale" : "General guidance",
                description:
                  isRo
                    ? "Primesti liste cu alimente recomandate si de evitat, plus exemple de mese."
                    : "Get recommended and avoid lists plus meal examples based on intolerances.",
                color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
              },
              {
                icon: Star,
                title: isRo ? "Fara reclame, fara plati" : "No ads, no paywalls",
                description:
                  isRo
                    ? "Aplicatia este complet gratuita. Nu exista reclame sau abonamente ascunse."
                    : "The app is fully free with no ads and no hidden subscriptions.",
                color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
              },
              {
                icon: Users,
                title: isRo ? "Creata pentru familie" : "Built for families",
                description:
                  isRo
                    ? "Fiecare membru al familiei poate avea propriul cont si profil."
                    : "Each family member can have their own account and profile.",
                color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAFETY & TRUST */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
              {isRo ? "Siguranta & Incredere" : "Safety & Trust"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2">
              {isRo ? "Transparenta completa" : "Complete transparency"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                icon: Shield,
                title: isRo ? "Nu oferim sfaturi medicale" : "We do not provide medical advice",
                description:
                  isRo
                    ? "Informatiile disponibile sunt generale si nu inlocuiesc consultul unui medic."
                    : "Available information is general and does not replace consultation with a doctor.",
                color: "text-orange-500",
                bg: "bg-orange-50 dark:bg-orange-950/20",
              },
              {
                icon: Trash2,
                title: isRo ? "Datele tale pot fi sterse oricand" : "Your data can be deleted anytime",
                description:
                  isRo
                    ? "Ai control deplin asupra datelor tale. Le poti sterge complet oricand."
                    : "You have full control over your data and can remove it permanently anytime.",
                color: "text-red-500",
                bg: "bg-red-50 dark:bg-red-950/20",
              },
              {
                icon: Lock,
                title: isRo ? "Date criptate si securizate" : "Encrypted and secure data",
                description:
                  isRo
                    ? "Datele tale sunt stocate securizat, criptate si nu sunt partajate cu terti."
                    : "Your data is securely stored, encrypted and never shared with third parties.",
                color: "text-green-600",
                bg: "bg-green-50 dark:bg-green-950/20",
              },
              {
                icon: BookOpen,
                title: isRo ? "Politici transparente" : "Transparent policies",
                description:
                  isRo
                    ? "Termeni clari si politica de confidentialitate completa."
                    : "Clear terms and complete privacy policy without obscure legal wording.",
                color: "text-blue-500",
                bg: "bg-blue-50 dark:bg-blue-950/20",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 p-5 rounded-xl border border-gray-100 dark:border-slate-700 ${item.bg}`}
              >
                <div className={`flex-shrink-0 ${item.color}`}>
                  <item.icon className="w-6 h-6 mt-0.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-teal-700 dark:from-green-800 dark:to-teal-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Leaf className="w-10 h-10 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {isRo ? "Incepe astazi, gratuit" : "Start today, for free"}
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            {isRo
              ? "Inregistrarea dureaza mai putin de un minut. Nicio carte de credit necesara."
              : "Signup takes less than a minute. No credit card required."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-green-700 font-semibold rounded-xl shadow-lg transition-all duration-200 text-base"
            >
              <UserPlus className="w-5 h-5" />
              {isRo ? "Creeaza cont gratuit" : "Create free account"}
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-200 text-base"
            >
              {isRo ? "Afla mai mult" : "Learn more"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
