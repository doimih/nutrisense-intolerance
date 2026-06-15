# NutriAID — AI Brain Documentation

**FILE PATH:** NutriAID-Acquisition-Portal/Technical-Documentation/AI-Brain-Documentation.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=AI-Brain-Documentation.pdf  
**Classification:** Confidential — Engineering Due Diligence

---

## Overview

The AI Brain is the orchestration engine at the core of NutriAID. It transforms a user's natural language request into a validated, personalised, behaviorally safe AI response — by routing it through a sequence of specialised workers, each with a defined role, typed output schema, and automatic supervision.

All AI responses follow a **non-medical, behavioral wellness approach**: no diagnoses, no calorie counts, no supplement prescriptions. Workers focus on comfort patterns, food preferences, and cultural food context.

**Primary model:** GPT-4o  
**Fallback model:** gpt-4o-mini (configurable)  
**Model protocol:** OpenAI Chat Completions API (supports any compatible endpoint)  
**Runtime configuration:** All parameters editable from admin console without restart

---

## Intent Detection

The orchestrator begins by analysing the user's message using a keyword-matching engine. Keywords are matched in **both Romanian and English**:

```typescript
const INTENT_KEYWORDS = {
  'meal-plan': [
    'meal plan', 'weekly plan', 'daily plan', 'eating plan',
    'plan de mese', 'plan saptamanal', 'plan zilnic', 'plan alimentar',
  ],
  'recipe': [
    'recipe', 'how to cook', 'how to prepare', 'ingredients for',
    'reteta', 'cum gatesc', 'cum prepar', 'ingrediente pentru',
  ],
  'shopping-list': [
    'shopping list', 'grocery list', 'what to buy',
    'lista cumparaturi', 'lista de cumparaturi', 'ce sa cumpar',
  ],
  'supplement-advice': [
    'supplement', 'vitamin', 'mineral', 'probiotic', 'lifestyle',
    'supliment', 'vitamina', 'mineral', 'probiotic', 'stil de viata', 'obiceiuri',
  ],
  'nutritional-analysis': [
    'calories', 'macros', 'nutrition', 'nutritional value',
    'food recommendation', 'what should i eat', 'recommended foods',
    'calorii', 'macro', 'nutritie', 'valori nutritionale',
    'recomandare alimente', 'ce sa mananc', 'alimente recomandate',
  ],
  'progress-tracking': [
    'progress', 'weight trend', 'weekly report', 'symptom history',
    'progres', 'tendinta greutate', 'raport saptamanal', 'istoric simptome',
  ],
  'general-nutrition': [
    'intolerance', 'allergy', 'what can i eat', 'food reaction',
    'intoleranta', 'alergie', 'ce pot manca', 'reactie alimentara',
  ],
}
```

**No match → intent: `unknown`** (routed to profile-analyzer + medical-safety)

Intent detection is **deterministic and bilingual** — keywords are matched against the lowercased message in both RO and EN. Language is detected from the `Accept-Language` header and user profile preferences.

---

## Worker Routing Table

Each intent maps to an ordered worker sequence. The orchestrator executes workers **in strict order** — each worker receives the output of all previous workers as accumulated context.

| Intent | Worker Sequence |
|---|---|
| `meal-plan` | profile-analyzer → intolerance-checker → allergy-checker → meal-plan-generator → nutrition-calculator → **medical-safety** |
| `recipe` | profile-analyzer → intolerance-checker → allergy-checker → recipe-builder → nutrition-calculator |
| `shopping-list` | profile-analyzer → intolerance-checker → meal-plan-generator → shopping-list |
| `supplement-advice` | profile-analyzer → intolerance-checker → allergy-checker → supplement-advisor → **medical-safety** |
| `nutritional-analysis` | profile-analyzer → intolerance-checker → nutrition-calculator → **medical-safety** |
| `progress-tracking` | profile-analyzer → progress-tracking |
| `general-nutrition` | profile-analyzer → intolerance-checker → allergy-checker → **medical-safety** |
| `unknown` | profile-analyzer → **medical-safety** |

**Rule:** Medical Safety is always last for any intent involving meal planning, lifestyle tips, or nutritional analysis.

---

## GEO-Localization Engine

The AI Brain includes a **GEO-localization engine** that adapts food recommendations to the user's geographic and cultural context — automatically, without user configuration.

### Detection

GEO context is extracted from the HTTP `Accept-Language` header on every request:

```typescript
function detectGeoContext(lang: string, acceptLanguage: string): GeoContext | null {
  if (acceptLanguage.includes('ro') || lang === 'ro') {
    return { country: 'Romania', region: 'Eastern Europe', culturalCuisine: 'Romanian' };
  }
  if (acceptLanguage.includes('fr-FR')) {
    return { country: 'France', region: 'Western Europe', culturalCuisine: 'French' };
  }
  if (acceptLanguage.includes('es-MX')) {
    return { country: 'Mexico', region: 'Latin America', culturalCuisine: 'Mexican' };
  }
  // ... additional mappings
}
```

### Injection

The detected GEO context is injected into every worker's user message:

```
GEO_CONTEXT: Country=Romania, Region=Eastern Europe, Cultural cuisine=Romanian
Prioritize locally available, seasonally appropriate foods from this cultural context.
```

### Effect

Workers automatically return culturally adapted content:
- Romanian users receive recommendations including *mămăligă*, *zacuscă*, *borș*
- French users receive recommendations including *ratatouille*, *quiche*, regional cheeses
- Mexican users receive recommendations including *tortillas de maíz*, *frijoles*, *nopal*

No user profile configuration required — detection is fully automatic and stateless.

---

## Diversity Engine

The AI Brain includes a **cross-worker diversity engine** that prevents repetitive food recommendations across a single orchestration session.

### Mechanism

1. After each worker executes, the orchestrator calls `extractMentionedItems(output)` — which reads all food names from `meals`, `foods`, `recommendedFoods`, `reactionPatterns`, `items`, and `name` fields.
2. These items are added to a `_diversityBlacklist` array, accumulated across the worker chain.
3. Before each subsequent worker executes, the blacklist is injected into the worker's user message:

```
REGULA_DIVERSITATE: Nu repeta NICIUNUL din urmatoarele alimente/idei deja mentionate:
oat porridge, chicken breast, brown rice, salmon, sweet potato, ...
Genereaza EXCLUSIV optiuni noi si diferite.
```

4. The correction engine also enforces this — if a corrected output repeats blacklisted items, the correction fails semantic validation.

### Result

Users receive genuinely varied recommendations across every worker in a single request — not the same 5 foods repeated across 6 workers.

---

## Context Accumulation

The orchestrator passes a growing context object to each worker. After each worker executes, its validated output is added to the shared context under the key `<workerId>_output`:

```javascript
// After profile-analyzer:
context = {
  sessionId, intent, profile, intolerances, allergies,
  country: "Romania", region: "Eastern Europe", culturalCuisine: "Romanian",
  "profile-analyzer_output": { worker: "profile-analyzer", status: "success", data: { age: 32, dietType: "gluten-free", ... } }
}

// After intolerance-checker:
context = {
  ...previous,
  _diversityBlacklist: ["rice", "oat porridge"],  // items mentioned so far
  "intolerance-checker_output": { worker: "intolerance-checker", data: { possibleTriggers: ["grâu", "lactoză"], flaggedIngredients: ["wheat", "barley"] } }
}

// meal-plan-generator sees ALL prior outputs and generates only novel food ideas
```

This design ensures that **later workers cannot contradict earlier workers** — they always have full context.

---

## Model Configuration

The `ModelConfig` object controls all AI behaviour:

```typescript
type ModelConfig = {
  primaryModel: string;       // e.g. "gpt-4o"
  fallbackModel: string;      // e.g. "gpt-4o-mini"
  apiKey: string | null;      // OpenAI or compatible API key
  temperature: number;        // 0.0–1.0, default 0.4
  maxTokens: number;          // 512–4096, default 1024
  orchestratorUrl?: string;   // Custom endpoint URL (overrides auto-detection)
}
```

**URL auto-detection logic:**
- Model starts with `gemini` → `https://generativelanguage.googleapis.com/v1beta/openai`
- Model starts with `claude` → `https://api.anthropic.com/v1`
- `orchestratorUrl` set → use that URL (supports local/private endpoints)
- Default → `https://api.openai.com/v1`

**Configuration source priority:**
1. `aiBrain` settings in `data/superadmin-db.json` (admin console)
2. Environment variables (`AI_PRIMARY_MODEL`, `AI_API_KEY`, etc.)
3. Built-in defaults (`gpt-4o`, temperature 0.4, 1024 tokens)

---

## Real Worker Executor

When an API key is configured, the `createRealWorkerExecutor` factory produces a `WorkerExecutor` that:

1. Reads per-worker prompt from DB at call time (hot-reload — no restart)
2. Reads global system prompt from DB at call time
3. Builds a system message combining:
   - Global administrator instructions (if set)
   - Per-worker custom prompt (if set) OR built-in behavioral role description
   - Strict behavioral rules (no diagnosis, no prescription, no calorie counts, no absolute language)
   - Required JSON output format with field schema
4. Builds a user message including:
   - Worker ID and language
   - User's request text
   - Declared intolerances and allergies
   - Profile data (no nutritional goals — behavioral approach only)
   - Accumulated context from previous workers
   - **GEO context** (country, region, cultural cuisine)
   - **Diversity blacklist** (items already mentioned by prior workers)
5. Calls primary model, falls back to fallback model if primary fails
6. Parses and normalises the JSON response

**Stub mode:** When no API key is configured, the executor returns a passthrough stub — this allows the platform to run and be tested with zero AI cost.

---

## Prompt System

### Built-In Worker Role Prompts (RO / EN)

All built-in worker prompts are stored in both Romanian and English. The language is selected based on the request language. Every worker follows the **behavioral, non-medical compliance approach** — no diagnoses, no calorie values, no supplement prescriptions.

| Worker | Built-In Role (EN) | Built-In Role (RO) |
|---|---|---|
| profile-analyzer | Extract key behavioral profile info: diet type, reported intolerances, food preferences, activity style. Identify missing data. | Extrage informații comportamentale cheie: tip dietă, intoleranțe raportate, preferințe alimentare, nivel de activitate. Identifică date lipsă. |
| intolerance-checker | Identify foods that the user has reported causing discomfort. List possible trigger foods and safe alternatives using soft, non-diagnostic language. | Identifică alimentele care cauzează disconfort raportat. Listează posibili trigger-i și alternative sigure, fără limbaj diagnostic. |
| allergy-checker | Analyze reported food reaction patterns. Identify foods associated with discomfort reports. Use only soft behavioral language — no diagnoses. | Analizează tipare de reacție alimentară raportate. Identifică alimente asociate cu disconfort. Folosește exclusiv limbaj comportamental. |
| meal-plan-generator | Generate culturally adapted, varied meal IDEAS (not recipes). No ingredient lists. Focus on meal concepts, local foods, and diversity. | Generează IDEI de mese adaptate cultural (nu rețete). Fără liste de ingrediente. Concentrează-te pe concepte de mese, alimente locale și diversitate. |
| recipe-builder | Create a detailed, safe recipe for the user with clear steps, ingredients compatible with their profile, and substitution notes. | Creează o rețetă detaliată și sigură cu pași clari, ingrediente compatibile cu profilul și note de substituire. |
| nutrition-calculator | Generate a GEO-adapted list of recommended foods for the user's comfort profile. No calorie counts, no macro values, no nutritional claims. Minimum 15 unique food items. | Generează o listă GEO-adaptată de alimente recomandate pentru profilul de confort al utilizatorului. Fără calorii, fără macronutrienți. Minim 15 alimente unice. |
| medical-safety | Review generated content ensuring no diagnosis, treatment, medication, or absolute language. Generate a brief, bland awareness note. Always set safetyApproved: true. | Verifică conținutul generat: fără diagnostice, tratamente, medicamente sau limbaj absolut. Generează o notă de awareness blandă. Setează întotdeauna safetyApproved: true. |
| supplement-advisor | Suggest general lifestyle and daily routine tips for comfort and wellbeing. No supplements, no vitamins, no dosage recommendations. Focus on behavioral habits. | Sugerează sfaturi generale de stil de viață și rutine zilnice pentru confort. Fără suplimente, vitamine sau dozaje. Concentrează-te pe obiceiuri comportamentale. |
| progress-tracking | Analyse the monitoring journal and summarise trends: frequent foods, recurring comfort/discomfort patterns, improvement tendencies. | Analizează jurnalul de monitorizare și rezumă tendințe: alimente frecvente, tipare de confort/disconfort, tendințe de ameliorare. |
| shopping-list | Generate a categorised shopping list based on the meal ideas produced by the meal-plan-generator. | Generează o listă de cumpărături categorizată pe baza ideilor de mese produse de meal-plan-generator. |

### Prompt Override System

Admin can override any worker prompt at runtime:
1. Set **Global System Prompt** → prepended to every worker's system message
2. Set **Per-Worker Custom Prompt** → replaces the built-in role for that worker

Changes take effect on the next guidance request — no restart required.

---

## Minimum Volume Rules

Each worker is instructed to generate a minimum number of unique items, scaled by detail level:

| Detail Level | Foods / Tips lists | Meal ideas | Worker examples |
|---|---|---|---|
| Basic | min 8 items | min 3 | Single-intent quick response |
| Detailed | min 15 items | min 8 | Standard guidance session |
| Comprehensive | min 20 items | min 12 | Full worker chain execution |

This prevents the AI from generating thin, repetitive outputs. The constraint is enforced in the worker system message and re-enforced by the correction engine if violated.

---

## Admin Console: AI Brain Settings

| Setting | Type | Default | Effect |
|---|---|---|---|
| Primary model | text | gpt-4o | Model used for all workers |
| Fallback model | text | gpt-4o-mini | Model used when primary fails |
| Temperature | float 0–1 | 0.4 | Controls response randomness |
| Max tokens | int 512–4096 | 1024 | Maximum response length |
| Orchestrator URL | text | (auto) | Custom endpoint override |
| System prompt | textarea | (built-in) | Global instruction override |
| Workers | list | enabled | Per-worker enable/disable + prompt |

---

## Logging

Every orchestrator execution is logged to `AI_Logs` in the backend DB:

```typescript
type AILogRecord = {
  id: string;
  timestamp: string;
  sessionId: string;
  userId: string | null;
  source: 'frontend' | 'orchestrator' | 'worker' | 'ai' | 'system';
  level: 'info' | 'warning' | 'error';
  intent: string | null;
  worker: string | null;
  model: string | null;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
}
```

Log types captured:
- `worker_validation` — pass/fail per validation pass
- `worker_correction` — correction input/output/model/duration
- `worker_failure` — final failure after correction
- `model_fallback` — when primary model triggers fallback
- `orchestrator_event` — full execution summary

Retention: 10,000 records (oldest pruned automatically).

---

*NutriAID Acquisition Portal — Confidential — June 2026*
