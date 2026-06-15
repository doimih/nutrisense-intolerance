'use client';
import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const BULLETS = [
  'Semantic, AI-friendly content structure',
  'Clean and modular documentation',
  'Consistent terminology and ontology',
  'Optimized for LLM ingestion and reasoning',
  'Future-proofed for AI-driven discovery',
];

export default function GeoReadyBadge() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Badge */}
      <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
        <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span className="text-sm font-semibold text-emerald-700">GEO-Ready Platform</span>
        <span className="text-xs text-emerald-600/80 hidden sm:inline">
          — Optimized for AI search engines and LLM indexing
        </span>
        <button
          onClick={() => setOpen(true)}
          className="ml-1 text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-900 transition"
        >
          Learn more
        </button>
      </div>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          {/* Modal panel */}
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-5">
              <Sparkles className="h-6 w-6" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
              GEO-Ready Platform
            </h2>

            {/* Intro */}
            <p className="text-slate-600 leading-relaxed mb-5">
              NutriAID is fully optimized for Generative Engine Optimization (GEO), ensuring
              maximum visibility and comprehension across AI search engines and LLM-based
              indexing systems.
            </p>

            {/* Bullets */}
            <ul className="space-y-2.5 mb-6">
              {BULLETS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-slate-700 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            {/* Closing */}
            <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-5">
              This ensures NutriAID is not only ready for today&apos;s market, but also aligned
              with the future of AI-powered search ecosystems.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
