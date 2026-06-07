import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, Heart, Shield, Users, Target, Zap } from "lucide-react";
import { getServerLanguage } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "About NutriSense Intolerances",
  description:
    "Learn the story behind NutriSense Intolerances and our mission.",
};

export default function AboutPage() {
  const lang = getServerLanguage();
  const isRo = lang === "ro";
  return (
    <div className="pt-24 pb-16 bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-2xl mb-6">
            <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {isRo ? "Despre NutriSense Intolerances" : "About NutriSense Intolerances"}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {isRo
              ? "O aplicatie creata din necesitate, pentru toti cei care traiesc cu intolerante alimentare si cauta un instrument simplu, clar si sigur."
              : "An app built from real need, for anyone living with food intolerances who wants a simple, clear and safe tool."}
          </p>
        </div>

        {/* Mission */}
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-8 mb-10">
          <div className="flex items-start gap-4">
            <Target className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                {isRo ? "Misiunea noastra" : "Our mission"}
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {isRo
                  ? "NutriSense Intolerances a fost creat cu un scop simplu: sa ofere un spatiu sigur si accesibil unde persoanele cu intolerante alimentare pot organiza informatiile despre reactiile lor, pot primi recomandari generale si pot monitoriza ce functioneaza pentru corpul lor."
                  : "NutriSense Intolerances was created with one simple goal: to offer a safe and accessible space where people with food intolerances can organize reaction data, receive general guidance and track what works for their body."}
              </p>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-3">
                {isRo
                  ? "Nu suntem o platforma medicala si nu pretindem sa fim. Suntem un instrument de organizare personala, adaptat nevoilor celor care traiesc cu restrictii alimentare zilnic."
                  : "We are not a medical platform and we do not claim to be one. We are a personal organization tool tailored to people who live with food restrictions every day."}
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          {isRo ? "Valorile noastre" : "Our values"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {[
            {
              icon: Heart,
              title: isRo ? "Empatie" : "Empathy",
              description:
                isRo
                  ? "Intelegem ca viata cu intolerante alimentare poate fi complicata. Suntem aici sa simplificam, nu sa complicam."
                  : "We understand that life with food intolerances can be complex. We are here to simplify things, not complicate them.",
              color: "text-red-500 bg-red-50 dark:bg-red-950/20",
            },
            {
              icon: Shield,
              title: isRo ? "Transparenta" : "Transparency",
              description:
                isRo
                  ? "Nu ascundem nimic. Politicile noastre sunt clare, datele tale raman ale tale si poti pleca oricand."
                  : "We hide nothing. Our policies are clear, your data remains yours and you can leave anytime.",
              color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
            },
            {
              icon: Zap,
              title: isRo ? "Simplitate" : "Simplicity",
              description:
                isRo
                  ? "Interfata este curata si usor de folosit. Fara clutter, fara functionalitati inutile."
                  : "The interface is clean and easy to use. No clutter and no unnecessary features.",
              color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
            },
            {
              icon: Users,
              title: isRo ? "Comunitate" : "Community",
              description:
                isRo
                  ? "Creata cu gandul la familii intregi: fiecare membru poate gestiona propriul profil si jurnal."
                  : "Built with whole families in mind: each member can manage their own profile and journal.",
              color: "text-green-600 bg-green-50 dark:bg-green-950/20",
            },
          ].map((value, i) => (
            <div
              key={i}
              className={`flex items-start gap-4 p-5 rounded-xl border border-gray-100 dark:border-slate-700 ${value.color.split(" ").slice(1).join(" ")}`}
            >
              <value.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${value.color.split(" ")[0]}`} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                  {value.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Medical disclaimer */}
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6 mb-10">
          <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
            {isRo ? "Precizare importanta" : "Important note"}
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-400 leading-relaxed">
            {isRo
              ? "NutriSense Intolerances nu este o aplicatie medicala si nu ofera consultanta medicala sau nutritionala personalizata. Orice informatie disponibila in aplicatie are caracter general si informativ. Consultati intotdeauna un medic sau nutritionist pentru sfaturi personalizate."
              : "NutriSense Intolerances is not a medical application and does not provide personalized medical or nutritional advice. Any information in the app is general and informational. Always consult a doctor or dietitian for personalized guidance."}
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {isRo
              ? "Gata sa incepi? Crearea unui cont este gratuita si dureaza mai putin de un minut."
              : "Ready to begin? Creating an account is free and takes less than a minute."}
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-sm transition-colors"
          >
            {isRo ? "Creeaza cont gratuit" : "Create free account"}
          </Link>
        </div>
      </div>
    </div>
  );
}
