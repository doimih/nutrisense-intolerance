# NutriAID — Prompt Rewriter Documentation

**FILE PATH:** NutriAID-Acquisition-Portal/Technical-Documentation/Prompt-Rewriter.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Prompt-Rewriter.pdf  
**Classification:** Confidential — Engineering Due Diligence

---

## Overview

The Prompt Rewriter is NutriAID's runtime prompt configuration system. It allows administrators to customise, override, and fine-tune the AI behaviour of every worker without modifying source code or restarting the application.

All prompt configuration is stored in `data/superadmin-db.json` under `settings.aiBrain` and is read at request time — meaning changes take effect immediately on the next guidance request.

---

## Prompt Hierarchy

System message construction for each worker follows a strict priority hierarchy:

```
Priority 1: Global Administrator Instructions
  └── settings.aiBrain.systemPrompt (if set and length > 20)
      Prepended to every worker's system message.
      Example: "Always respond in formal English. Never mention competitor brands."

Priority 2: Per-Worker Custom Prompt
  └── settings.aiBrain.workers[workerId].prompt (if set and length > 20)
      Replaces the built-in role description for that specific worker.
      Example: Custom meal-plan-generator prompt tuned for Mediterranean diet.

Priority 3: Built-In Role Description (fallback)
  └── WORKER_ROLES[workerId][lang]
      Hard-coded default role for each worker in both RO and EN.
      Used when no custom prompt is configured.

Priority 4: Strict Behavioral Rules (always appended)
  └── "No diagnosis, no prescriptions, no calorie counts, no absolute language..."
      Applied to every worker regardless of prompt configuration.

Priority 5: Required JSON Format (always appended)
  └── Output schema definition for the specific worker.
      Forces the model to return valid, typed JSON.
```

---

## System Message Construction

```typescript
function buildWorkerSystemMessage(
  workerId: string,
  lang: 'ro' | 'en',
  adminGlobalPrompt?: string,
  workerCustomPrompt?: string,
): string {
  const parts: string[] = [];

  // 1. Global admin instructions (highest priority)
  if (adminGlobalPrompt && adminGlobalPrompt.length > 20) {
    parts.push(`GLOBAL ADMIN INSTRUCTIONS:\n${adminGlobalPrompt}`);
  }

  // 2. Per-worker custom or built-in role
  if (workerCustomPrompt && workerCustomPrompt.length > 20) {
    parts.push(`WORKER INSTRUCTIONS:\n${workerCustomPrompt}`);
  } else {
    parts.push(getWorkerRolePrompt(workerId, lang)); // built-in
  }

  // 3. Strict behavioral rules (always enforced)
  parts.push(
    'STRICT RULES:\n' +
    '- No medical diagnoses, no prescriptions, no cures, no treatments\n' +
    '- No calorie counts, no macro values, no nutritional claims\n' +
    '- Use only soft, behavioral language: "may cause discomfort", "some users report"\n' +
    '- Never use absolute statements: "you must", "you should always", "guaranteed"\n' +
    '- Focus on comfort patterns and food preferences only'
  );

  // 4. Required JSON output format (always enforced)
  parts.push(`REQUIRED JSON FORMAT:\n${buildWorkerOutputSchema(workerId)}`);

  return parts.join('\n\n');
}
```

---

## User Message Construction

The user message passed to each worker includes full context — including GEO localization and diversity blacklist:

```
WORKER: meal-plan-generator
LANG: ro
USER_REQUEST: Vreau idei de mese fără gluten și fără lactoză
INTOLERANCES: gluten, lactose
ALLERGIES: arahide
PROFILE: {"age": 34, "sex": "female", "activityLevel": "moderate", "dietType": "omnivore"}
GEO_CONTEXT: Country=Romania, Region=Eastern Europe, Cultural cuisine=Romanian
Prioritize locally available, seasonally appropriate foods from this cultural context.
REGULA_DIVERSITATE: Nu repeta NICIUNUL din urmatoarele alimente/idei deja mentionate:
orez brun, piept de pui, fulgi de ovaz, somon
Genereaza EXCLUSIV optiuni noi si diferite.
ACCUMULATED_CONTEXT:
{
  "profile-analyzer_output": { "worker": "profile-analyzer", "data": { "age": 34, ... } },
  "intolerance-checker_output": { "worker": "intolerance-checker", "data": { "possibleTriggers": ["grâu", "lactoză"], "flaggedIngredients": ["wheat", "milk"] } },
  "allergy-checker_output": { "worker": "allergy-checker", "data": { "reactionPatterns": [], "safe": true } }
}
Generate the complete output for the "meal-plan-generator" worker.
```

### GEO_CONTEXT Injection

The GEO context is derived from the HTTP `Accept-Language` header on every request. It is injected into every worker's user message automatically — no user profile configuration required.

| Accept-Language | Country | Region | Cultural Cuisine |
|---|---|---|---|
| `ro`, `ro-RO` | Romania | Eastern Europe | Romanian |
| `fr-FR` | France | Western Europe | French |
| `de-DE` | Germany | Western Europe | German |
| `es-MX` | Mexico | Latin America | Mexican |
| `pt-BR` | Brazil | South America | Brazilian |
| `ar` | Middle East | MENA | Middle Eastern |

### DIVERSITY_BLACKLIST Injection

The diversity blacklist is accumulated across the worker chain during a single orchestration session. After each worker executes, all food items it mentioned are extracted and added to the blacklist, which is injected into every subsequent worker's user message.

```typescript
// After each worker completes:
const newItems = extractMentionedItems(workerOutput);
diversityBlacklist.push(...newItems);

// Passed to next worker:
contextWithDiversity._diversityBlacklist = diversityBlacklist;
```

This ensures users receive genuinely varied food recommendations — not the same 5 foods repeated across 6 workers in a single session.

---

## Correction Prompt

When a worker output fails validation, the Auto-Corrector builds a behavioral correction prompt:

```typescript
export const CORRECTION_SYSTEM_MESSAGE =
  'You are a NutriAID worker correction engine. ' +
  'You receive an erroneous worker output and must return a corrected JSON object only. ' +
  'Never include text outside the JSON. Never add markdown code fences.';

export const CORRECTION_TEMPLATE = `
You are the {{workerName}} worker — a non-medical behavioral wellness assistant.

Your previous output contained the following errors:
{{errors}}

You MUST fix ALL errors listed above and regenerate a corrected output.

STRICT RULES:
1. Follow the output schema exactly: { "worker": string, "status": string, "data": object, "notes": string[] }
2. Never include foods that the user has reported as causing discomfort.
3. Never use medical-risk language: no diagnoses, no prescriptions, no cures, no treatments.
4. Never include calorie counts, macro values, or nutritional claims — comfort patterns only.
5. Use only soft, behavioral language: "may cause discomfort", "user reported reactions".
6. Do NOT repeat any of the errors in the corrected output.

User context: {{context}}
Original input: {{input}}
Original (erroneous) output: {{output}}

Return ONLY valid JSON matching the schema. No explanations outside the JSON.
`;
```

The correction prompt user message includes:
- Worker name and built-in behavioral role
- List of validation errors
- Original input JSON
- Original output JSON (with errors)
- User context (intolerances, allergies, profile)
- Expected output schema

---

## Admin Console: Prompt Configuration UI

**Location:** Settings → AI Brain → Workers

For each worker, the admin panel exposes:

| Field | Type | Behaviour |
|---|---|---|
| Worker name | label | Display only |
| Enable/disable | toggle | Removes worker from all routing chains |
| Custom prompt | textarea | Overrides built-in role when > 20 characters |
| Test button | action | Runs the worker in isolation with supervision |

**Global system prompt:**

Located at Settings → AI Brain → System Prompt (textarea at the top of the AI Brain settings panel).

Applied to every worker in every request. Useful for:
- Changing the platform's overall communication style
- Adding brand-specific instructions
- Restricting content (e.g., vegetarian-only platform)
- Adding market-specific regulatory notices

---

## Hot-Reload Behaviour

The prompt configuration is read from the database **at request time** (not at startup):

```typescript
export function createRealWorkerExecutor(config: ModelConfig, lang: 'ro' | 'en'): WorkerExecutor {
  return async (workerId, input, context) => {
    // Read admin prompts from DB at call time — not cached
    let adminGlobalPrompt: string | undefined;
    let workerCustomPrompt: string | undefined;
    try {
      const db = readDb();
      adminGlobalPrompt = db.settings?.aiBrain?.systemPrompt?.trim();
      const workerCfg = db.settings?.aiBrain?.workers?.find(
        (w) => w.id === workerId && w.enabled !== false,
      );
      workerCustomPrompt = workerCfg?.prompt?.trim();
    } catch {
      // DB read failed — use built-in prompts
    }
    // ...
  };
}
```

**Result:** Changing any prompt in the admin console takes effect on the next request. No restart. No deployment. No cache invalidation needed.

---

## Use Cases for Prompt Customisation

| Use Case | Configuration |
|---|---|
| White-label for a ketogenic clinic | Override meal-plan-generator to emphasize keto-friendly food ideas |
| Celiac-specialised platform | Override intolerance-checker with clinical celiac cross-contamination patterns |
| Paediatric nutrition app | Add global instruction: "All recommendations must be appropriate for children aged 6–14" |
| Formal medical institution | Add global instruction: "Use formal clinical language. Always recommend consulting a registered dietitian." |
| Romanian-market deployment | Built-in RO support — no configuration needed, GEO engine activates automatically |
| Market-specific disclaimers | Add global instruction with region-specific regulatory notice |

---

*NutriAID Acquisition Portal — Confidential — June 2026*
