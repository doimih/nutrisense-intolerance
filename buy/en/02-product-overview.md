# NutriAID — Product Overview
### Complete Description of the Product and Its Features

---

## Platform Description

NutriAID is a full-stack SaaS web application built on Next.js 14 (frontend) and Next.js 15 (backend admin console), with PostgreSQL as the primary database and a proprietary AI orchestrator with a multi-worker architecture. The platform is deployed in Docker with Traefik as a reverse proxy and supports automatic HTTPS via Let's Encrypt.

The end user logs daily meals consumed and symptoms experienced. Based on this data, NutriAID's AI identifies patterns, correlates foods with symptoms, and generates personalised recommendations that respect the user's declared intolerances, allergies, and dietary preferences.

---

## End-User Features

### Authentication and Account
- Registration with email + password (24h email token verification)
- Secure login (JWT HttpOnly session, SameSite=Strict)
- Password reset via email (1h token)
- Resend verification email
- Full account deletion with all associated data (GDPR)
- Personal data export (JSON + PDF) on request

### 7-Day Free Trial
- Upon registration, the user automatically receives full Pro+ access for 7 days
- No card required
- On expiry, a modal guides the user towards an upgrade

### Daily Monitoring Journal
- Log meals per slot: breakfast, lunch, dinner, snack
- Select foods consumed (from food database or free text)
- Log symptoms (11 types: bloating, abdominal pain, nausea, diarrhoea, constipation, reflux, skin rashes, fatigue, headaches, breathing difficulties, swelling)
- Symptom intensity: 1–10 scale
- Reaction latency: minutes until symptoms appear (useful for delayed reaction detection)
- General wellbeing: 1–5 scale
- Free notes per entry

### Personalised AI Guidance
- The user submits a request in natural language ("create a 2-week meal plan for me", "what foods should I avoid?")
- The AI orchestrator processes the request through 3–6 specialised workers depending on intent
- The result includes: recommended foods, foods to avoid, meal examples, nutritional tips, medical disclaimer
- Every recommendation is adapted to the subscription plan (Basic: 8 foods / Pro: 12 / Pro+: 15)
- Full session history is saved and accessible

### PDF Export
- Any guidance session can be exported as a professional PDF
- The PDF includes: date, user's request, full recommendations, disclaimer
- NutriAID design with header, footer, and clear formatting

### Personal Profile
- Name, email (editable)
- Declared food intolerances (12 types: lactose, gluten, nuts, histamine, FODMAP, fructose, sorbitol, sulphites, eggs, soy, fish, shellfish)
- Dietary preference (normal, vegetarian, vegan, low-carb, gluten-free, dairy-free)
- Physical data: age, height (cm), weight (kg), physical activity level
- Stripe subscription status with direct link to the billing portal

### Public Pages
- Landing page with hero, benefits, CTA
- Dynamic pricing (prices and features from admin, not hardcoded)
- About, Why AI, Trust & testimonials, FAQ, Contact
- Knowledge Hub: 9 informative articles (common symptoms, dietary guides, GDPR, etc.)
- Complete legal pages: Privacy Policy, Terms, Cookies, Data Retention, Security Policy, Medical Disclaimer

### AI Recipe Module
- AI-generated recipes from a meal name: ingredients, steps, macros, allergens, substitutions, cooking tips
- Bilingual: title, ingredients, and instructions in RO and EN simultaneously
- GEO-personalisation: recipes adapted to local culinary style (28 European countries supported)
- CookingMode: fullscreen step-by-step view with integrated timer
- RecipeModal: detailed modal with all recipe information
- Batch generation: mass generation pipeline for the recipe library
- Usage tracking: per-user recipe usage events (context: meal_plan, cooking_mode, browse)

### GEO Engine — Geographic Personalisation
- IP geolocation via ip-api.com with in-memory cache (TTL 1h)
- CDN headers: Cloudflare (`cf-ipcountry`) and Vercel (`x-vercel-ip-country`) — instant, no external call
- `Accept-Language` fallback (13 languages supported)
- 28 European countries mapped with region and local cuisine style
- Applied to: recipe generation from meals, AI guidance orchestrator

### Newsletter and Growth Suite
- Newsletter popup on first visit (opt-in / opt-out)
- Footer form for public subscription
- Consent stored per user with source tracking (`signup_popup` / `footer_form`)
- Brevo integration: marketing events (opt-in, opt-out, registration, plan upgrade)
- Early Adopter programme: first 100 real users receive free Pro access
- Early Adopter banner with remaining slot counter

### Tracking and Acquisition
- TikTok Pixel server-side: PageView, registration, checkout events
- Public acquisition portal (`/acquire`): platform presentation for prospective buyers
- Daily plan public page (`/daily-plan`)

### International
- Full bilingual support: Romanian (default) + English
- Language switcher in navbar and sidebar (🇷🇴/🇬🇧 button)
- Language preference stored in the user account and as a persistent cookie
- Emails sent in the user's selected language
- All emails (verification, welcome, password reset, account deletion) are bilingual

---

## AI Brain — The Multi-Worker Orchestrator

### Architecture
The orchestrator receives a natural language request and routes it through a chain of specialised workers, based on the detected intent. Each worker produces a structured JSON which becomes the input for the next worker.

### Intent Detection
8 supported intents:
- `meal-plan` — meal plans
- `recipe` — recipes and preparation
- `shopping-list` — shopping lists
- `supplement-advice` — nutritional supplements
- `nutritional-analysis` — macronutrient analysis
- `progress-tracking` — progress and trend analysis
- `general-nutrition` — general nutrition/intolerance questions
- `unknown` — safe fallback

### The 11 Specialised Workers

| # | Worker | Role |
|---|---|---|
| 1 | **profile-analyzer** | Extracts: age, sex, height, weight, dietary goal, activity level |
| 2 | **intolerance-checker** | Identifies ingredients incompatible with declared intolerances |
| 3 | **allergy-checker** | Detects potential allergens in recommended foods |
| 4 | **meal-plan-generator** | Generates personalised meal plans with alternatives |
| 5 | **recipe-builder** | Creates detailed recipes with steps, ingredients, and substitutions |
| 6 | **nutrition-calculator** | Calculates kcal, protein, carbohydrates, fat per meal |
| 7 | **shopping-list-generator** | Generates categorised shopping lists |
| 8 | **supplement-advisor** | Recommends safe supplements (not prescriptions) |
| 9 | **progress-tracker** | Analyses the journal for trends and weekly reports |
| 10 | **medical-safety** | Final review: removes diagnoses, treatments, absolute language |
| 11 | **meal-plan-generator** (alias) | Also used in the shopping-list flow |

---

## Self-Healing Layer — The Auto-Corrector

### Problem Solved
AI models sometimes generate invalid JSON, missing fields, or inappropriate medical language. Without auto-correction, the user would see errors or incomplete responses.

### How It Works
1. The worker produces an output
2. Schema Validator checks: required fields exist, data types, JSON structure
3. Semantic Validator checks: detected medical language, intolerances respected, absolute language ("always", "never", "guaranteed")
4. **If validation fails:** Auto-Corrector generates a correction prompt with specific errors and calls GPT-4o
5. **If GPT-4o fails:** Fallback to Gemini 1.5 Pro
6. **If both fail:** Rule-Based Corrector applies corrections via pattern matching (cost $0)
7. The corrected output is re-validated before being forwarded

---

## Diagnostic Engine — The Rule-Based Engine

Operates completely without AI, at $0 cost. Used as:
- Fallback when the AI API is unavailable
- Primary layer for users on an expired trial
- Sanity check before the AI call

### Implemented Algorithms
- **Symptom-food scoring:** Correlates symptom frequency and intensity with consumed foods
- **Delayed reaction detection:** Identifies foods with symptoms appearing 30 min – 48h after consumption
- **Safe food identification:** Foods consumed only on days with symptoms ≤2 and wellbeing ≥4
- **Combination analysis:** Detects pairs of foods that co-occur in high-symptom entries
- **Confidence scoring:** Warns the user when data is insufficient (<5 entries)

---

## Prompt Rewriter — Configurable Prompt System

Each worker has a default system prompt in RO and EN. From the admin console, the operator can:
- Set a global prompt applied to all workers
- Override any individual worker's prompt
- Adjust temperature (0–1) and max tokens (512–2048)
- Test changes live in the AI Test Lab without affecting users

---

## PDF Generator

- Based on pdfkit (native Node.js, no external dependencies)
- Server-side generation, no browser timeout
- NutriAID design: logo header, structured sections, footer with date and disclaimer
- Export available per guidance session or as a complete ZIP package
- Typical size: 2–8 pages per session

---

## UI — User Interface

### Design System
- **Framework:** Tailwind CSS 3.4 (utility-first)
- **Icons:** Lucide React (390+ icons)
- **Components:** React 18, fully custom, no external UI libraries

### UI Features
- Fully responsive (mobile, tablet, desktop)
- Dark mode (manual toggle, persistent in localStorage)
- PWA (Progressive Web App) — installable on mobile, partially works offline
- Fixed navbar with scroll-aware styling (transparent → frosted glass on scroll)
- Dashboard with collapsible sidebar on mobile
- Trial and session expiry modal with countdown
- Toast notifications (instant feedback for actions)
- Subtle CSS animations (150–300ms transitions)
- Accessibility: aria-label, focus management, keyboard navigation

### Dashboard Pages
- `/dashboard` — Overview with personal statistics
- `/dashboard/monitoring` — Journal new entries + history
- `/dashboard/guidance` — AI request form + results
- `/dashboard/history` — Previous sessions timeline
- `/dashboard/profile` — Profile, intolerances, physical data, billing
- `/dashboard/recipes` — AI recipe library with CookingMode
- `/dashboard/gdpr` — Data export + account deletion

---

## Modular Architecture

```
NutriAID
├── Frontend (Next.js 14, port 3000)
│   ├── App Router + Middleware
│   ├── Auth (JWT, email verification, user status)
│   ├── Billing (Stripe checkout + webhook)
│   ├── Dashboard (monitoring, guidance, history, profile, recipes)
│   ├── Recipes Module (AI generation, CookingMode, batch, GEO)
│   ├── Growth Suite (newsletter, early adopter, Brevo events)
│   ├── Tracking (TikTok Pixel server-side, Google Analytics)
│   ├── Public pages (landing, pricing, legal, acquire, daily-plan)
│   └── i18n (RO/EN bilingual, language stored per user)
│
├── Backend Admin Console (Next.js 15, port 4028)
│   ├── AI Orchestrator (11 workers + supervisor + GEO context)
│   ├── Auto-Corrector (GPT-4o → Gemini → rule-based)
│   ├── Settings (email, stripe, AI, PWA, 2FA, reCAPTCHA)
│   ├── User Management (+ status, newsletter, early adopter)
│   ├── Visitor Sessions (demo accounts, time-limited)
│   ├── Logs & Audit Trail
│   └── AI Test Lab
│
└── Infrastructure
    ├── PostgreSQL 16 (users, subscriptions, monitoring, guidance, recipes)
    ├── Traefik (HTTPS, routing, HSTS)
    ├── Docker Compose (container orchestration)
    └── S3 Backup (Hetzner Object Storage, optional)
```

Every module is independent, separately testable, and replaceable without affecting the rest of the system. Adding a new AI worker requires ~50 lines of code. Adding a new subscription plan requires zero code — done from the admin console.

---

*Document generated: June 2026 | NutriAID Platform v1.1 — prod branch*
