# NutriAID — Self-Healing Layer Documentation

**FILE PATH:** NutriAID-Acquisition-Portal/Technical-Documentation/Self-Healing-Layer.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Self-Healing-Layer.pdf  
**Classification:** Confidential — Engineering Due Diligence

---

## Overview

The Self-Healing Layer is the system that makes NutriAID autonomous. It ensures that every AI worker output — regardless of model quality, API instability, or edge-case inputs — is validated, corrected if necessary, and behaviorally compliant before it reaches the user.

The Self-Healing Layer consists of three components:

| Component | File | Role |
|---|---|---|
| Worker Supervisor | `ai/supervisor/WorkerSupervisor.ts` | Orchestrates the full validation + correction pipeline |
| Auto-Corrector | `ai/autoCorrector.ts` | AI-powered and rule-based correction engine |
| Schema + Semantic Validators | `ai/validators/` | Structural and content validation |

---

## Worker Supervisor Pipeline

For every worker execution, the Supervisor runs a 6-step pipeline:

```
Step 1: Execute worker (via realWorkerExecutor)
        │
        ▼
Step 2: Schema validation (Pass 1)
        │ validateWorkerSchema(workerId, rawOutput)
        │ → checks required fields, types, nullable rules
        │
        ▼
Step 3: Semantic validation (Pass 1)
        │ validateSemantics(workerId, rawOutput, intolerances, allergies)
        │ → checks content compliance, behavioral safety, disclaimer presence
        │
        ├── BOTH PASS → return rawOutput (no correction needed)
        │
        └── ANY FAIL → Step 4

Step 4: Auto-correction
        │ autoCorrect(correctionInput, modelConfig)
        │ → builds correction prompt with errors + context
        │ → calls primaryModel to regenerate output
        │ → if fail → calls fallbackModel
        │ → if fail → calls ruleBasedCorrect()
        │
        ▼
Step 5: Schema validation (Pass 2)
        │ Re-validates the corrected output
        │
        ▼
Step 6: Semantic validation (Pass 2)
        │ Re-validates the corrected output
        │
        ├── BOTH PASS → correctionIncomplete: false
        └── ANY FAIL → correctionIncomplete: true (logged, flagged)
```

**Output:** `SupervisionReport` — the definitive record of what happened to each worker output.

---

## Supervision Report Structure

```typescript
type SupervisionReport = {
  worker: string;
  finalOutput: JsonObject;         // The output that will be used (corrected or original)
  schemaValid: boolean;            // After final pass
  semanticValid: boolean;          // After final pass
  corrected: boolean;              // Was auto-correction applied?
  correctionIncomplete: boolean;   // Did correction still fail?
  errors: string[];                // All errors found across both passes
  correctionModel: string | null;  // "gpt-4o" | "gpt-4o-mini" | "rule-based" | null
  supervisorMs: number;            // Total supervision duration in ms
}
```

---

## Schema Validation

Schema validation checks the structural integrity of each worker's output using per-worker schema definitions:

```typescript
// medical-safety: only worker with requiresDisclaimer: true
{
  workerName: 'Medical Safety Worker',
  required: ['worker', 'status', 'data', 'notes', 'data.safetyApproved'],
  fields: {
    'data.safetyApproved': { type: 'boolean' },
    'data.disclaimer': { type: 'string', optional: true },
    'data.risks': { type: 'array', optional: true },
  },
  requiresDisclaimer: true,
}

// nutrition-calculator: behavioral food recommender — no kcal, no disclaimer
{
  workerName: 'Recommended Foods Generator Worker',
  required: ['worker', 'status', 'data', 'notes'],
  fields: {
    'data.recommendedFoods': { type: 'array', optional: true },
  },
  requiresDisclaimer: false,
}

// supplement-advisor: lifestyle tips worker — no supplements, no disclaimer
{
  workerName: 'Lifestyle Tips Worker',
  required: ['worker', 'status', 'data', 'notes'],
  fields: {
    'data.lifestyleTips': { type: 'array', optional: true },
    'data.routineSuggestions': { type: 'array', optional: true },
    'data.comfortHabits': { type: 'array', optional: true },
  },
  requiresDisclaimer: false,
}

// allergy-checker: reaction pattern analyzer — behavioral output
{
  workerName: 'Reaction Pattern Analyzer Worker',
  required: ['worker', 'status', 'data', 'notes'],
  fields: {
    'data.reactionPatterns': { type: 'array', optional: true },
    'data.associatedFoods': { type: 'array', optional: true },
    'data.allergenHits': { type: 'array', optional: true },  // legacy, optional
    'data.safe': { type: 'boolean', optional: true },
    'data.rejectedMeals': { type: 'array', optional: true },
  },
  requiresDisclaimer: false,
}
```

**Validation errors generated for:**
- Missing required fields
- Wrong field type (e.g., field expected as array but returned as string)
- Missing disclaimer when `requiresDisclaimer: true`
- `status` field absent or not a string

---

## Semantic Validation

Semantic validation checks the content of the worker output against the user's safety profile and behavioral compliance requirements:

### Intolerance / Reaction Pattern Check
```
For each flaggedIngredient in user's intolerance profile:
  If ingredient appears in output text → ERROR
  "Intolerance conflict: '{ingredient}' found in output"

For each declared allergy:
  "Allergen violation: '{allergen}' found in output"
```

### Medical Safety Language Check
```
Forbidden patterns (applied to all output text):
  - "diagnos*" (diagnose, diagnosis, diagnosed)
  - "prescri*" (prescribe, prescription)
  - "cure", "cures", "cured"
  - "treatment", "treat", "treating"
  - "medication", "medicate"
```

If any forbidden term is found → SAFETY ERROR: "Safety violation: medical-risk language found in output"

### Disclaimer Check

Only **`medical-safety`** requires a disclaimer (`DISCLAIMER_WORKERS = ['medical-safety']`).

```
If worker is in DISCLAIMER_WORKERS AND no disclaimer text found in output:
  → SAFETY ERROR: "Safety warning: safety-critical worker output is missing a medical disclaimer"
```

**Important:** `nutrition-calculator` and `supplement-advisor` are **not** in `DISCLAIMER_WORKERS`. They are behavioral workers with no medical content — adding false disclaimer requirements would trigger unnecessary correction on every run. This was a bug in the previous version that has been corrected.

### Nutritional Range Check

Only workers in `NUTRITION_WORKERS` are validated for kcal/macro bounds. This list contains:
- `meal-plan-generator`
- `recipe-builder`

**`nutrition-calculator` is excluded** — it is now a food recommender that returns a `recommendedFoods[]` string array, not numeric nutritional values. Applying kcal bounds to this worker would cause false validation failures on every run.

### Contradiction Detection
```
Error status with populated data → CONTRADICTION
Success status with empty data → CONTRADICTION
Notes mention "error" while status is "success" → CONTRADICTION
safetyApproved: false while status is "success" → CONTRADICTION
```

---

## Auto-Corrector

When validation fails, the Auto-Corrector builds a structured correction prompt and calls the AI model to regenerate the worker output:

### Correction Prompt Structure

```
SYSTEM MESSAGE:
  You are the {workerName} worker — a non-medical behavioral wellness assistant.
  Your previous output contained validation errors.
  Your task: return a corrected JSON object that fixes all errors.
  Return ONLY valid JSON. No explanations. No markdown fences.

USER MESSAGE:
  WORKER: {workerName}
  ERRORS FOUND:
    1. {error1}
    2. {error2}
  
  STRICT RULES:
  1. Follow the output schema exactly: { "worker": string, "status": string, "data": object, "notes": string[] }
  2. Never include foods the user has reported as causing discomfort (intolerances/reactions).
  3. Never use medical-risk language: no diagnoses, no prescriptions, no cures, no treatments.
  4. Never include calorie counts, macro values, or nutritional claims — comfort patterns only.
  5. Use only soft, behavioral language: "may cause discomfort", "user reported reactions", "associated with discomfort".
  6. Do NOT repeat any of the errors in the corrected output.

  User context: {intolerances, allergies, profile}
  Original input: {input JSON}
  Original output (with errors): {output JSON}
```

### Correction Chain

```
1. AI Key available?
   ├── YES → Try primaryModel (30s timeout)
   │    ├── Success → return corrected JSON
   │    └── Fail → log fallback event, try fallbackModel (30s timeout)
   │         ├── Success → return corrected JSON
   │         └── Fail → use rule-based correction
   └── NO → use rule-based correction immediately
```

### Rule-Based Correction

The rule-based corrector applies deterministic fixes without any API call:

| Error Type | Rule Applied |
|---|---|
| Missing required field | Add default value (empty string, `[]`, `false`) |
| Wrong field type | Coerce to correct type (toString, Array.from, etc.) |
| Flagged ingredient in output | Remove the ingredient from all lists |
| Missing disclaimer (medical-safety only) | Append standard awareness note text |
| Absolute language | Replace with hedged equivalent ("may help", "some users report") |
| Medical-risk term in output | Replace with behavioral equivalent ("reported pattern", "awareness note") |

**Cost: $0** — runs entirely on the server with no external API calls.

---

## Correction Logging

Every correction event is logged with full detail:

```typescript
logWorkerCorrection(workerName, errors, rawOutput, correctedOutput, {
  sessionId,
  userId,
  model: correctionResult.model,    // which model was used
  correctionMs: correctionResult.correctionMs,
})
```

Operators can inspect all correction events in the AI Test Lab → Orchestrator tab, or in the Admin Logs page.

---

## Failure Modes and Guarantees

| Scenario | What Happens |
|---|---|
| AI output is valid on first pass | Returned immediately, no correction |
| AI output fails, primary model corrects it | Corrected output returned, event logged |
| Primary model fails, fallback corrects it | Corrected output returned, fallback event logged |
| Both models fail | Rule-based correction applied, always returns valid output |
| Rule-based correction cannot fix all errors | `correctionIncomplete: true`, output still returned (best effort) |
| Complete API outage | Rule-based mode, platform continues to function at $0 AI cost |

**Guarantee:** The platform never returns a null, undefined, or structurally invalid response to the user, regardless of AI API status.

---

*NutriAID Acquisition Portal — Confidential — June 2026*
