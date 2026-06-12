# NutriAID — Business Report
### Complete Business Report for Buyers and Investors

---

## 1. Market Analysis

### Global Nutrition and Wellness App Market

| Metric | Value | Estimated Source |
|---|---|---|
| Global nutrition app market 2023 | $8.5 billion | Grand View Research |
| Projected CAGR 2024–2030 | 21.1% | Same study |
| Global digital wellness market 2025 | $65 billion | Global Wellness Institute |
| Health app users in Europe | 200+ million | Statista |
| Growth in food intolerance interest | +340% in 10 years | Google Trends |

### Food Intolerance Market — NutriAID's Specific Context

- **1 in 4 Europeans** reports a food intolerance (EAACI studies)
- **Classic medical diagnosis** for an intolerance: €300–1,500 (allergist, endoscopy, blood tests)
- **Specialist dietitian:** €50–150/session, 6–12 sessions recommended = €300–1,800
- **NutriAID Pro+:** €35.99/month = ~€430/year — 70–80% saving over classic alternatives

### The Romanian Market

- Population: 19.2 million, of which ~10 million active online
- Smartphone penetration: 72%
- Wellness app growth in Romania: +23% YoY (2022–2024)
- Purchasing power: average net salary ~€900/month, Pro subscription at €14.99 = 1.6% of income (affordable)
- Relevant local competitors: 0 (underserved market for AI-powered food intolerances)

---

## 2. Target Audience

### Primary Segments

**Segment A — Patients with Undiagnosed Symptoms (Largest)**
- Age: 25–55
- Profile: people with chronic bloating, fatigue, digestive problems with no clear diagnosis
- Behaviour: search for solutions online, have tried empirical food elimination
- WTP (willingness to pay): €10–40/month
- Estimated size (RO): 500,000+ people

**Segment B — People with Diagnosed Intolerances**
- Age: all ages
- Profile: lactose, gluten, FODMAP — seeking daily dietary guidance
- Behaviour: frequent nutrition app users, willing to pay for quality
- WTP: €15–50/month
- Estimated size (RO): 2 million people

**Segment C — Athletes and Biohackers**
- Age: 20–45
- Profile: performance optimisation through nutrition
- Behaviour: use multiple apps, are early adopters, actively recommend products
- WTP: €30–60/month
- Estimated size (RO): 200,000 people

**Segment D — Doctors and Nutritionists (B2B)**
- Profile: want to provide patients with a monitoring tool between consultations
- Model: per-clinic or per-patient licence
- WTP: €99–299/month per practice
- Estimated size: 5,000+ nutrition practices in Romania

---

## 3. Positioning

### Positioning Statement

*"For people with undiagnosed or hard-to-manage food intolerances, NutriAID is the only SaaS platform that combines an intelligent daily journal with a specialised AI orchestrator, delivering medically validated personalised recommendations — at a cost 10× lower than a traditional dietitian."*

### Value Pyramid

```
Level 4: Transformation (ultimate benefit)
"I feel well every day"

Level 3: Functional benefits
"I know exactly which foods cause my symptoms"

Level 2: Features
"Daily journal + AI that correlates data"

Level 1: Attributes
"Web app, AI, 3 plans, bilingual"
```

### Key Messages per Segment

| Segment | Main Message | CTA |
|---|---|---|
| Undiagnosed patients | "Find what's making you feel bad — no expensive tests" | Start free trial |
| Diagnosed intolerances | "Daily guidance that respects your intolerances" | Try 7 days free |
| Athletes | "Optimise nutrition with real data, not guesswork" | Pro+ — the most advanced |
| B2B / Clinics | "Patient monitoring between consultations" | Contact us |

---

## 4. Competitive Advantage

### Comparison with Main Alternatives

| Alternative | Problem | NutriAID Solves |
|---|---|---|
| Allergist/dietitian | Expensive (€300–1,800), rarely accessible | Daily guidance at €10–36/month |
| MyFitnessPal / Cronometer | Calorie tracking, not intolerances | Focus exactly on symptoms and correlations |
| Cara Care / Zemedy | IBS/FODMAP specific, niche | Covers 12 types of intolerances |
| Google / ChatGPT | Generic answers, no personal data | Contextualised with your real data |
| Empirical elimination | Slow (3–12 months), imprecise | Correlations in 2–4 weeks of data |

### Entry Barriers (Moat)

1. **Accumulated user data** — the more you use it, the more precise the recommendations. Users don't leave easily.
2. **Proprietary AI orchestrator** — no similar product exists on the market with semantic validation + auto-correction in Romanian
3. **Technical complexity** — estimated 1,350 hours to rebuild; a high barrier for competitors
4. **Brand + community** — early users become ambassadors in wellness communities

---

## 5. Monthly Operating Costs

### Starter Configuration (0–500 users)

| Cost | Monthly Amount |
|---|---|
| VPS 2 vCPU / 4 GB RAM (Hetzner CX22) | €5–10 |
| PostgreSQL (self-hosted on same VPS) | €0 |
| Email SMTP (self-hosted or Brevo free) | €0–10 |
| AI API (OpenAI, 500 users × 5 req/month × $0.06) | €150 |
| Backup (Hetzner Object Storage 10 GB) | €3 |
| Domain + SSL (Let's Encrypt) | €1 |
| **TOTAL** | **€159–174/month** |

### Growth Configuration (500–2,000 users)

| Cost | Monthly Amount |
|---|---|
| VPS 4 vCPU / 8 GB RAM (Hetzner CX32) | €20–30 |
| Managed PostgreSQL (Supabase/Neon) | €25 |
| Email (Brevo or Amazon SES) | €10–20 |
| AI API (2,000 users × 5 req × $0.03 avg) | €300 |
| CDN (optional Cloudflare) | €0 (free tier) |
| Monitoring (Uptime Robot) | €0–7 |
| **TOTAL** | **€355–382/month** |

### Fast Break-Even

At the Pro price (€14.99/month), break-even on starter configuration:
- `€174 ÷ €14.99 = 12 paying users` to cover hosting + AI

---

## 6. Monetisation Models

### Model 1: Direct SaaS (Current)

3 recurring plans:
- **Basic** — €9.99/month → covers casual users
- **Pro** — €14.99/month → main segment, most recommended
- **Pro+** — €35.99/month → power users, athletes, serious users

**Trial:** 7 days Pro+ free, no card → easier conversion.

**Conservative projection at 1,000 paying users (40/40/20 mix):**
```
400 × Basic  €9.99  = €3,996
400 × Pro    €14.99 = €5,996
200 × Pro+   €35.99 = €7,198
─────────────────────────────
Total MRR              €17,190
Monthly costs          €-380
─────────────────────────────
Gross profit           €16,810/month = €201,720/year
```

### Model 2: White-Label for Clinics

Sell the platform as white-label under the clinic's brand:
- Setup licence: €2,000–5,000 one-time
- Monthly licence: €200–500/month per clinic
- 20 clinics × €300/month = €6,000 additional MRR

### Model 3: B2B Per-Patient Licence

The clinic pays per active patient:
- €5/patient/month
- Clinic with 200 active patients = €1,000/month
- Scalable: clinic earns through consultations, NutriAID through licences

### Model 4: Data Analytics (Future)

Anonymised and aggregated data about food-symptom correlations is valuable for:
- The food industry (product reformulation)
- Pharmaceuticals (intolerance studies)
- Health insurance (risk profiling)

*Requires additional explicit GDPR consent and a separate commercial model.*

### Model 5: Premium Feature Add-ons

Premium features available as paid extras:
- Video consultation with partner dietitian: €30–80/session
- Medical PDF report for doctor: €5 per export
- Personalised AI coaching: €15/month additional

---

## 7. Scaling Potential

### Geographic Scaling
- **Phase 1 (0–6 months):** Romania — primary market, already implemented in Romanian
- **Phase 2 (6–18 months):** Eastern Europe (Bulgaria, Poland, Hungary) — locales added, landing pages translated
- **Phase 3 (18+ months):** Western Europe + UK — EN fully implemented, PPC marketing in EN
- **EN market potential:** 300 million potential users

### Product Scaling
- Adding a native mobile app (React Native) — the Next.js codebase is compatible
- Wearables integration (Garmin, Apple Watch) for automatic physical activity data
- Conversational AI coaching (real-time chat vs. point-in-time requests)
- Supermarket integration (barcode scan → intolerance alert)
- Validated recipe marketplace per user profile

### B2B Scaling
- Multi-patient dashboard for nutritionists
- EMR (Electronic Medical Records) integration
- Public API for integration into other health platforms

---

## 8. White-Label Potential

The platform is 100% rebrandable without structural changes:

**What changes for white-label:**
- Logo, colours, fonts (Tailwind config — 30 minutes)
- Domain and email (environment variables — 5 minutes)
- Landing page and email copy (i18n files — a few hours)
- Prices and plans (admin console — 5 minutes)

**What doesn't change:**
- AI Orchestrator — remains intact
- Database — remains PostgreSQL
- Stripe Billing — reconnects to the client's Stripe account

**White-label revenue model for the new owner:**
- Sell white-label licence at €15,000–30,000 one-time
- Plus royalties: 15–20% of the licensee's MRR
- 5 white-label clients = €75,000–150,000 one-time + €3,000–6,000/month recurring

---

*Document generated: June 2026 | NutriAID Platform v1.0 — prod branch*
