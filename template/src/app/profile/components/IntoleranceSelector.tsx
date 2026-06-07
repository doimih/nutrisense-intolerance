'use client';
import React, { useState } from 'react';


const ALL_INTOLERANCES = [
  { id: 'int-gluten', name: 'Gluten', category: 'Grains' },
  { id: 'int-lactose', name: 'Lactose', category: 'Dairy' },
  { id: 'int-casein', name: 'Casein', category: 'Dairy' },
  { id: 'int-eggs', name: 'Eggs', category: 'Animal Products' },
  { id: 'int-soy', name: 'Soy', category: 'Legumes' },
  { id: 'int-peanuts', name: 'Peanuts', category: 'Legumes' },
  { id: 'int-tree-nuts', name: 'Tree Nuts', category: 'Nuts' },
  { id: 'int-shellfish', name: 'Shellfish', category: 'Seafood' },
  { id: 'int-fish', name: 'Fish', category: 'Seafood' },
  { id: 'int-fructose', name: 'Fructose', category: 'Sugars' },
  { id: 'int-sorbitol', name: 'Sorbitol', category: 'Sugars' },
  { id: 'int-histamine', name: 'Histamine', category: 'Amines' },
  { id: 'int-tyramine', name: 'Tyramine', category: 'Amines' },
  { id: 'int-fodmap', name: 'FODMAPs', category: 'Fermentables' },
  { id: 'int-wheat', name: 'Wheat', category: 'Grains' },
  { id: 'int-corn', name: 'Corn', category: 'Grains' },
  { id: 'int-nightshades', name: 'Nightshades', category: 'Vegetables' },
  { id: 'int-caffeine', name: 'Caffeine', category: 'Stimulants' },
  { id: 'int-alcohol', name: 'Alcohol', category: 'Beverages' },
  { id: 'int-sulfites', name: 'Sulfites', category: 'Preservatives' },
  { id: 'int-msg', name: 'MSG', category: 'Additives' },
  { id: 'int-sesame', name: 'Sesame', category: 'Seeds' },
  { id: 'int-mustard', name: 'Mustard', category: 'Condiments' },
  { id: 'int-lupin', name: 'Lupin', category: 'Legumes' },
];

const INITIAL_SELECTED = new Set([
  'int-gluten', 'int-lactose', 'int-eggs', 'int-soy',
  'int-tree-nuts', 'int-fructose', 'int-histamine',
]);

const categories = [...new Set(ALL_INTOLERANCES.map((i) => i.category))];

export default function IntoleranceSelector() {
  const [selected, setSelected] = useState<Set<string>>(INITIAL_SELECTED);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
    handleAutoSave(next);
  };

  const handleAutoSave = async (nextSelected: Set<string>) => {
    setSaveStatus('saving');
    // BACKEND INTEGRATION: POST /intolerances/user — send { intolerance_ids: [...] }
    await new Promise((r) => setTimeout(r, 600));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const filtered = activeCategory === 'All'
    ? ALL_INTOLERANCES
    : ALL_INTOLERANCES.filter((i) => i.category === activeCategory);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="section-header">Food Intolerances</h2>
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-positive flex items-center gap-1 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          )}
          <span className="badge-blue text-xs font-semibold">
            {selected.size} selected
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Select all foods your body reacts to. Changes are saved automatically and used to personalise your AI guidance.
      </p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['All', ...categories].map((cat) => (
          <button
            key={`cat-${cat}`}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-border hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Intolerance chips */}
      <div className="flex flex-wrap gap-2">
        {filtered.map((item) => {
          const isSelected = selected.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-150 active:scale-95 ${
                isSelected
                  ? 'border-negative bg-negative-bg text-negative' :'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {isSelected && (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {item.name}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {ALL_INTOLERANCES.length - selected.size} intolerances not flagged
        </p>
        <button
          onClick={() => { setSelected(new Set()); handleAutoSave(new Set()); }}
          className="text-xs text-muted-foreground hover:text-negative transition-colors font-medium"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}