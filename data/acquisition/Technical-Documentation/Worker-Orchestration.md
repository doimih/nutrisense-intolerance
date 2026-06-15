# NutriAID — Worker Orchestration Documentation

**FILE PATH:** NutriAID-Acquisition-Portal/Technical-Documentation/Worker-Orchestration.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Worker-Orchestration.pdf  
**Classification:** Confidential — Engineering Due Diligence

---

## Overview

NutriAID's AI pipeline is built on a worker orchestration model. Instead of sending a single prompt to a language model and returning the raw output, the system decomposes every user request into a sequence of specialised workers — each with a defined role, a strict typed output schema, and automatic supervision.

There are **10 workers** in the current system. Each worker is a discrete AI call with its own system prompt, output schema, and validation rules.

All workers follow the **behavioral, non-medical compliance approach**:
- No medical diagnoses
- No calorie counts or macro values
- No supplement prescriptions
- No absolute language ("you must", "guaranteed", "never eat")
- Soft, comfort-pattern focused output in both Romanian and English

---

## Worker Registry

| Worker ID | Worker Name | Behavioral Focus | Output Requires Disclaimer |
|---|---|---|---|
| `profile-analyzer` | Profile Analyzer Worker | Diet type, preferences, activity | No |
| `intolerance-checker` | Intolerance Checker Worker | Comfort/discomfort pattern analysis | No |
| `allergy-checker` | Reaction Pattern Analyzer Worker | Reported reaction patterns | No |
| `meal-plan-generator` | Meal Plan Generator Worker | Culturally adapted meal ideas | Yes |
| `recipe-builder` | Recipe Builder Worker | Safe recipe creation | No |
| `nutrition-calculator` | Recommended Foods Generator Worker | GEO-adapted food recommendations | No |
| `medical-safety` | Medical Safety Worker | Awareness notes, compliance review | Yes |
| `supplement-advisor` | Lifestyle Tips Worker | Routine and behavioral habits | No |
| `progress-tracking` | Progress Tracking Worker | Trend and pattern summaries | No |
| `shopping-list` | Shopping List Worker | Categorised shopping list | No |

---

## Worker Specifications

### 1. Profile Analyzer

**Role:** Extracts key behavioral profile information from the user's profile and the current request context. Identifies missing data that may affect recommendation quality. Does not estimate calorie needs or nutritional targets.

**Input:** User profile, reported intolerances, allergies, food preferences, activity style  
**Output schema:**

```json
{
  "worker": "profile-analyzer",
  "status": "success" | "warning" | "error",
  "data": {
    "age": number | null,
    "sex": string | null,
    "heightCm": number | null,
    "weightKg": number | null,
    "goal": string | null,
    "dietType": string | null,
    "intolerances": string[],
    "allergies": string[],
    "activityLevel": string | null,
    "missingFields": string[]
  },
  "notes": string[]
}
```

**Downstream effect:** All subsequent workers receive the `profile-analyzer_output` in their context. This prevents them from hallucinating profile data.

---

### 2. Intolerance Checker

**Role:** Cross-references all foods in the current context against the user's declared intolerances. Identifies possible trigger foods and lists safe alternatives. Uses soft, non-diagnostic language — does not diagnose intolerances.

**Output schema:**

```json
{
  "worker": "intolerance-checker",
  "status": "success",
  "data": {
    "possibleTriggers": ["grâu", "lactoză"],
    "flaggedIngredients": ["wheat", "milk", "barley"],
    "safeIngredients": ["orez", "lapte de migdale"],
    "conflicts": [
      { "ingredient": "wheat", "reason": "User reported discomfort — associated with gluten sensitivity pattern" }
    ]
  },
  "notes": []
}
```

**Key fields:**
- `possibleTriggers` — primary output read by `buildFinalResponse()` for the `avoidFoods` list
- `flaggedIngredients` — legacy field, still populated for backward compatibility
- Language matches request language (RO or EN)

**Semantic validation:** The semantic validator checks that no flagged ingredient appears in subsequent workers' outputs.

---

### 3. Reaction Pattern Analyzer (allergy-checker)

**Role:** Evaluates the full proposed food plan for reported reaction patterns. Identifies foods the user has associated with discomfort. Uses behavioral language only — no allergy diagnoses, no clinical terminology.

**Previous name:** "Allergy Checker Worker" (renamed to reflect behavioral scope)

**Output schema:**

```json
{
  "worker": "allergy-checker",
  "status": "success",
  "data": {
    "reactionPatterns": ["user reported skin reactions after consuming shellfish", "bloating associated with high-lactose foods"],
    "associatedFoods": ["shellfish", "cream cheese", "full-fat milk"],
    "safe": true,
    "rejectedMeals": []
  },
  "notes": []
}
```

**Key fields:**
- `reactionPatterns` — primary output read by `buildFinalResponse()` for the `avoidFoods` list
- `associatedFoods` — secondary fallback for `avoidFoods`
- `allergenHits` — legacy field (optional, for backward compatibility only)

**Safety rule:** If `safe: false`, the meal-plan-generator does not include the rejected meals (enforced via context).

---

### 4. Meal Plan Generator

**Role:** Generates culturally adapted, diverse **meal IDEAS** — not recipes. No ingredient lists. Descriptions are written in the `notes` field. Focuses on meal concepts, local and seasonal foods, and variety across all suggestions.

**GEO adaptation:** Uses the injected GEO_CONTEXT to return locally relevant meal concepts (e.g., Romanian dishes for RO users).  
**Diversity:** Avoids repeating any food from the `_diversityBlacklist` accumulated by prior workers.

**Required output fields:** `data.meals` (array)  
**Disclaimer:** Required.

```json
{
  "worker": "meal-plan-generator",
  "status": "success",
  "data": {
    "meals": [
      {
        "name": "Mămăligă cu brânză de capră și roșii coapte",
        "ingredients": [],
        "notes": "Idee de mic dejun tradițional românesc, usor de preparat, fara gluten"
      },
      {
        "name": "Salată de fasole cu ceapă verde și ulei de măsline",
        "ingredients": [],
        "notes": "Prânz ușor, bogat în proteine vegetale, potrivit pentru o zi activă"
      }
    ],
    "alternatives": ["Înlocuiește brânza de capră cu hummus pentru o variantă vegană"],
    "disclaimer": "Aceste sugestii au caracter informativ și nu reprezintă recomandări medicale."
  },
  "notes": []
}
```

**Note:** `ingredients` is always an empty array (`[]`). Meal descriptions are placed in `notes`. This is intentional — the worker generates meal concepts, not preparation instructions.

---

### 5. Recipe Builder

**Role:** Creates a detailed recipe for a specific dish, with step-by-step instructions, compatible ingredients, and substitution notes.

**Required output fields:** `data.recipeName`, `data.ingredients`, `data.steps`

```json
{
  "worker": "recipe-builder",
  "status": "success",
  "data": {
    "recipeName": "Gluten-Free Banana Oat Pancakes",
    "ingredients": ["2 cups certified GF oats", "2 ripe bananas", "2 eggs", "1 tsp cinnamon"],
    "steps": ["Blend oats into flour", "Mash bananas", "Mix all ingredients", "Cook on medium heat 3 min each side"],
    "servings": 4,
    "substitutions": ["Replace eggs with flax eggs for vegan version"]
  },
  "notes": []
}
```

---

### 6. Recommended Foods Generator (nutrition-calculator)

**Role:** Generates a GEO-adapted list of foods recommended for the user's comfort profile. Focuses on locally available, culturally familiar foods. **Does not calculate calories, macros, or nutritional values.**

**Previous name:** "Nutrition Calculator Worker" (repurposed from calorie estimator to behavioral food recommender)

**No disclaimer required.**

```json
{
  "worker": "nutrition-calculator",
  "status": "success",
  "data": {
    "recommendedFoods": [
      "orez brun", "quinoa", "morcovi", "spanac", "dovlecel",
      "pui la grătar", "ouă", "nuci", "migdale", "mere",
      "brânză de vaci", "iaurt simplu", "fasole neagră", "linte", "avocado"
    ]
  },
  "notes": []
}
```

**Key changes from previous version:**
- `data.recommendedFoods` (string array) replaces `data.kcal`, `data.proteinG`, `data.carbsG`, `data.fatG`
- Minimum 15 unique food items per response
- Language matches request language (RO or EN)
- No disclaimer required (was previously listed as requiring one — corrected)

**Validation rules:**
- No kcal bound checks (no longer applicable)
- No macro cross-validation (no longer applicable)
- Semantic validator does NOT check this worker for nutritional values

---

### 7. Medical Safety Worker

**Role:** Final review of all generated content. Ensures no diagnostic, prescriptive, or absolute language is present. Generates a brief, bland awareness note. **Always sets `safetyApproved: true`** (content is already behavioral and non-medical by design).

**Required output fields:** `data.safetyApproved`  
**Disclaimer:** Required — enforced by both schema and semantic validators.

```json
{
  "worker": "medical-safety",
  "status": "success",
  "data": {
    "safetyApproved": true,
    "disclaimer": "Acest conținut are caracter informativ general și nu reprezintă un sfat medical. Consultați un specialist înainte de a face modificări semnificative în alimentație.",
    "risks": []
  },
  "notes": []
}
```

**Position in chain:** Always last for safety-sensitive intents. The orchestrator routing table enforces this structurally.

---

### 8. Lifestyle Tips Worker (supplement-advisor)

**Role:** Suggests general lifestyle and daily routine tips for comfort and wellbeing. Focuses on behavioral habits — sleep patterns, hydration, meal timing, stress management, gentle movement. **Does not recommend supplements, vitamins, or dosages.**

**Previous name:** "Supplement Advisor Worker" (repurposed from supplement suggester to lifestyle/routine tips)

**No disclaimer required.**

```json
{
  "worker": "supplement-advisor",
  "status": "success",
  "data": {
    "lifestyleTips": [
      "Mănâncă la ore regulate pentru a stabiliza digestia",
      "Bea minim 1.5L apă pe zi, distribuită uniform",
      "Evită mesele copioase seara târziu"
    ],
    "routineSuggestions": [
      "10 minute de mers pe jos după masa principală",
      "Pregătește mesele în avans duminica pentru a evita alegerile impulsive"
    ],
    "comfortHabits": [
      "Mestecă încet și conștient — ajută digestia",
      "Ține un jurnal de simptome pentru a identifica tipare"
    ]
  },
  "notes": []
}
```

**Key changes from previous version:**
- `data.lifestyleTips`, `data.routineSuggestions`, `data.comfortHabits` replace `data.supplements`
- No dosage, no contraindications, no medical warnings
- No disclaimer required (was previously listed as requiring one — corrected)

---

### 9. Progress Tracking Worker

**Role:** Analyses the user's monitoring journal history and summarises trends: most frequent foods, recurring comfort or discomfort patterns, improvement tendencies.

**Required output fields:** `data.summary`

```json
{
  "worker": "progress-tracking",
  "status": "success",
  "data": {
    "summary": "Pe parcursul ultimelor 14 zile, simptomele s-au redus în zilele fără lactate. Balonarea apare frecvent după mesele de seară cu alimente cu FODMAP ridicat.",
    "trendWeight": null,
    "weeklyReport": {
      "avgWellbeing": 6.8,
      "avgSymptomIntensity": 4.2,
      "topFoods": ["fulgi de ovăz", "pui la grătar", "orez"],
      "topSymptoms": ["balonare", "oboseală"]
    }
  },
  "notes": []
}
```

---

### 10. Shopping List Worker

**Role:** Generates a categorised shopping list based on the meal ideas produced by the meal-plan-generator.

**Required output fields:** `data.items`

```json
{
  "worker": "shopping-list",
  "status": "success",
  "data": {
    "items": ["fulgi de ovăz GF", "lapte de migdale", "piept de pui", "quinoa", "cartofi dulci", "somon"],
    "groupedByCategory": {
      "Cereale": ["fulgi de ovăz GF", "quinoa"],
      "Lactate alternative": ["lapte de migdale"],
      "Proteine": ["piept de pui", "somon"],
      "Legume": ["cartofi dulci", "fasole verde", "brocoli"]
    }
  },
  "notes": []
}
```

---

## Compliance Summary

| Validation Rule | Status |
|---|---|
| Medical diagnoses in output | Blocked by semantic validator + correction engine |
| Calorie/macro values in output | Not required — no validation bounds on non-nutrition workers |
| Supplement prescriptions | Blocked — supplement-advisor repurposed to lifestyle tips |
| Disclaimer enforcement | Only `medical-safety` requires disclaimer |
| Ingredient repetition across workers | Blocked by diversity engine blacklist |
| Culturally irrelevant food recommendations | Mitigated by GEO engine injection |

---

## Adding New Workers

To add a new worker to the system:

1. Define its schema in `ai/schemas/workerSchemas.ts`
2. Add its built-in role prompt (RO + EN) to `realWorkerExecutor.ts` → `WORKER_ROLES`
3. Add it to the routing table in `orchestrator.ts` → `INTENT_WORKER_ROUTES`
4. Add semantic validation rules in `validators/semanticValidator.ts` (if needed)
5. Enable it in the admin console (it will appear automatically)

No other changes required.

---

*NutriAID Acquisition Portal — Confidential — June 2026*
