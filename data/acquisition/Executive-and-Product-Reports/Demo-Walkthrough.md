# NutriAID — Demo Walkthrough

**FILE PATH:** NutriAID-Acquisition-Portal/Executive-and-Product-Reports/Demo-Walkthrough.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Demo-Walkthrough.pdf  
**Classification:** Confidential — Qualified Buyers Only

---

## Overview

This document provides a step-by-step walkthrough of the NutriAID platform as a qualified buyer would experience it during a live demo session. Each step includes the expected screen, the actions available, and the underlying system behaviour.

**Demo credentials (visitor account):**  
URL: https://backend.nutriaid.eu  
Email: visitor@nutriaid.eu  
Password: NutriDemo@2025!

**Frontend (user-facing):**  
URL: https://nutriaid.eu

---

## Step 1 — Landing Page

**URL:** https://nutriaid.eu

**What the buyer sees:**
- Hero section with headline and primary CTA ("Start your analysis")
- Why-AI section explaining the orchestrator approach
- Pricing section with three plan cards
- Knowledge Hub preview
- Trust section (GDPR, medical disclaimer, technology)
- FAQ section

**Key observations:**
- Page is fully bilingual (language switcher in navigation)
- Structured data markup for AI/LLM indexing (GEO-ready)
- PWA install prompt appears after 30 seconds on mobile

---

## Step 2 — Registration & Email Verification

**URL:** https://nutriaid.eu/register

**Flow:**
1. User enters name, email, password
2. reCAPTCHA v3 validates the submission silently
3. Verification email is sent with a 24h token
4. User clicks the link in the email
5. Account is verified and session is created
6. User is redirected to the dashboard with 7-day Pro+ trial active

**System behaviour:**
- JWT HttpOnly session cookie is set (SameSite=Strict)
- Trial end date is recorded in the database
- Welcome email is sent via configured SMTP

---

## Step 3 — User Profile Setup

**URL:** https://nutriaid.eu/profile (accessible from dashboard)

**Fields:**
- Full name, age, height (cm), weight (kg)
- Dietary preference (omnivore / vegetarian / vegan / gluten-free / dairy-free / keto / paleo)
- Declared food intolerances (multi-select: gluten, lactose, fructose, histamine, FODMAP, etc.)
- Activity level (sedentary / light / moderate / active / very active)
- Nutritional goals (target kcal, protein g, carbs g, fat g)

**Why this matters:** The Profile Analyzer worker reads this data on every AI guidance request. The quality of profile data directly determines the relevance of AI recommendations.

---

## Step 4 — Daily Monitoring Journal

**URL:** https://nutriaid.eu/monitoring-journal

**What the buyer sees:**
- Table of all journal entries (date, meal slot, foods, symptoms, wellbeing)
- "Add Entry" button opens a modal
- Each entry is expandable for full details
- Journal stats: total entries, average wellbeing, most frequent foods

**Adding a new entry (demo):**
1. Click "Add Entry"
2. Select meal time (breakfast / lunch / dinner / snack)
3. Enter consumed foods: "oatmeal with milk, orange juice, coffee with cream"
4. Enter symptoms: "bloating, stomach cramps"
5. Set symptom intensity: 7/10
6. Set reaction latency: 45 minutes
7. Set wellbeing score: 5/10
8. Add note: "Worse than usual after breakfast"
9. Save entry

**System behaviour:**
- Entry is stored in PostgreSQL `monitoring_entries` table
- Dashboard KPI grid updates in real time

---

## Step 5 — AI Guidance Request

**URL:** https://nutriaid.eu/guidance

**What the buyer sees:**
- Context summary (profile data loaded from user's profile)
- Text input for natural language request
- Submit button triggers AI orchestration

**Demo request:**
> "Create a weekly meal plan for me that avoids my food intolerances and supports weight loss."

**Orchestrator execution (visible in admin AI Test Lab):**

```
Intent detected: meal-plan

Worker sequence:
  1. profile-analyzer        ← reads profile data
  2. intolerance-checker     ← flags incompatible ingredients
  3. allergy-checker         ← checks allergen safety
  4. meal-plan-generator     ← generates 7-day meal plan
  5. nutrition-calculator    ← calculates kcal and macros
  6. medical-safety          ← safety review + disclaimer

Supervision per worker:
  - Schema validation: PASS
  - Semantic validation: PASS
  - Safety check: PASS
  - Corrections applied: 0
  - Total execution time: ~3.2 seconds
```

**What the user receives:**
- A structured 7-day meal plan avoiding all flagged intolerances
- Nutritional breakdown (kcal, protein, carbs, fat per day)
- Medical disclaimer
- "Export as PDF" button

---

## Step 6 — PDF Export

**Action:** Click "Export as PDF" on the guidance result page

**What the buyer sees:**
- A server-rendered PDF downloaded immediately
- Contains: guidance content, intolerance summary, nutritional breakdown, NutriAID branding, medical disclaimer
- File name: `NutriAID-Guidance-{date}.pdf`

---

## Step 7 — Dashboard Overview

**URL:** https://nutriaid.eu/dashboard

**What the buyer sees:**
- **KPI bento grid:** symptom trend (last 7 days), wellbeing trend, total entries
- **Intolerance badge strip:** flagged foods highlighted in amber
- **Symptom trend chart:** time-series line chart of symptom intensity
- **Recent journal feed:** last 5 entries with quick-view
- **Quick actions:** new journal entry, request guidance

---

## Step 8 — Admin Console Login

**URL:** https://backend.nutriaid.eu  
**Credentials:** visitor@nutriaid.eu / NutriDemo@2025!

**What the buyer sees after login:**
- Admin dashboard with live metrics
- Navigation: Dashboard, Guidance, History, Monitoring Journal, Admin panels

---

## Step 9 — Admin Settings — AI Brain

**URL:** https://backend.nutriaid.eu/admin/settings → AI Brain tab

**Live configuration options:**
- Primary model: `gpt-4o` (changeable to any model)
- Fallback model: `gpt-4o-mini`
- Temperature: 0.4 (slider 0–1)
- Max tokens: 1024 (slider 512–4096)
- Global system prompt (textarea — overrides all workers)
- Per-worker custom prompts (each worker has its own textarea)
- Enable/disable individual workers (toggle)

**Buyer takeaway:** Changing AI behaviour requires no code. It takes effect on the next guidance request.

---

## Step 10 — AI Test Lab

**URL:** https://backend.nutriaid.eu/admin/ai-test-lab

**Tabs:**
1. **Chat** — Type a user message, see the full AI response with worker trace
2. **Orchestrator** — Select intent manually, run orchestration, inspect each worker's supervision report
3. **Workers** — Test a single worker with custom JSON input, see raw output + supervision report
4. **Platform** — Run health checks on AI API connectivity, database, email, and Stripe

**What to show a technical buyer:**
- Run a full orchestration in the Orchestrator tab
- Show the per-worker supervision report (schema valid / semantic valid / corrections applied)
- Trigger a correction by injecting an invalid worker output

---

## Step 11 — Acquisition Downloads Panel

**URL:** https://backend.nutriaid.eu/admin/settings → Acquisition tab

**What the buyer sees:**
- Total download count across all 31 documents
- Per-document download count with bar chart
- Download log table: timestamp (UTC), IP, country, document, user-agent
- Filters by document and date
- Export CSV button

---

## Step 12 — Billing Settings

**URL:** https://backend.nutriaid.eu/admin/settings → Stripe / Pricing tabs

**What the buyer sees:**
- Stripe publishable key, secret key, webhook secret (all masked)
- Billing mode (subscription / one-time / usage)
- Products table: Basic, Pro, Pro+ with their Stripe product and price IDs
- Sync Prices button (pulls live prices from Stripe)
- Pricing editor: change price, description, features, currency, billing interval without touching Stripe dashboard

---

## Summary — What Transfers on Acquisition

| Asset | Status |
|---|---|
| Complete source code (frontend + backend) | Included |
| PostgreSQL database (schema + data) | Included |
| Domain names (nutriaid.eu + variants) | Included |
| Stripe account (products, prices, webhooks) | Transfer on request |
| SMTP configuration | Transfer on request |
| Hosting/VPS setup | Transfer on request |
| All third-party API credentials | Transfer on request |
| 30 days of post-sale support | Included |
| Full documentation (31 documents) | Included |

---

*NutriAID Acquisition Portal — Confidential — June 2026*
