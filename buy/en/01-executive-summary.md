# NutriAID — Executive Summary
### AI-Powered Personalised Nutrition SaaS Platform

---

## What is NutriAID?

NutriAID is a complete, production-ready SaaS platform that helps users identify food intolerances through intelligent correlation analysis of meals and symptoms. The platform combines an AI orchestrator with 11 specialised workers, a rule-based fallback analysis engine, and a modern bilingual (RO/EN) interface with a full admin console.

---

## What Problem Does It Solve?

**The Problem:** Millions of people suffer from chronic digestive symptoms (bloating, abdominal pain, fatigue, skin rashes) without being able to identify the exact cause. Classic medical tests are expensive, slow, and often incomplete. Dietitians cost €50–150/session and cannot analyse daily data in real time.

**The NutriAID Solution:**
- The user logs daily what they ate and what symptoms they experienced
- The AI analyses correlations in real time, detects patterns, and delivers personalised recommendations
- Every recommendation passes through a validation chain (intolerances → allergens → medical safety)
- Results are presented clearly, in the user's language, with PDF export

---

## Who Is It For?

### End Users (B2C)
- People with undiagnosed food intolerances (lactose, gluten, histamine, FODMAP, etc.)
- People with IBS, SIBO, reflux, or eczema linked to diet
- People following specialised diets who need daily guidance
- Athletes optimising nutrition for performance

### Market Potential
- **Romania:** 19 million people, >70% smartphone penetration, wellness growth +23% YoY
- **Eastern Europe:** 100+ million potential users, underserved nutrition app market
- **Global (EN):** Global nutrition app market = $8.5 billion (2023), CAGR 21%

### Platform Buyers (B2B — white-label)
- Nutrition and dietetics clinics
- Pharma companies with wellness divisions
- Health insurance operators
- Healthtech startup investors

---

## Why Is It Valuable?

### 1. Recurring Revenue (SaaS)
Three monthly subscription plans (Basic €9.99 / Pro €14.99 / Pro+ €35.99) plus a free 7-day trial. With 500 paying users on Pro (mixed), estimated MRR: **€7,500–12,000**.

### 2. Extremely Low Operational Costs
- Infrastructure: €30–60/month (VPS + PostgreSQL + Traefik)
- AI API: ~€82/1,000 active users/month
- Email: €0–20/month
- **Total operations: under €200/month for the first 1,000 users**

### 3. Autonomous and Self-Healing
The platform runs without human intervention. The AI orchestrator auto-corrects itself, the rule-based engine covers API failures, and the admin panel allows complete configuration without writing code.

### 4. Fully Configurable Without Code
Pricing, copy, AI models, API keys, SMTP, Stripe, PWA, 2FA — all modifiable from the admin console in real time.

---

## Why Is It Unique?

| Feature | NutriAID | Typical Nutrition Apps |
|---|---|---|
| AI orchestrator with 11 specialised workers | ✅ | ❌ |
| Auto-correction and semantic validation | ✅ | ❌ |
| Rule-based fallback (cost $0) | ✅ | ❌ |
| Fully configurable admin console | ✅ | ❌ |
| Multi-model support (GPT-4o, Gemini, Claude) | ✅ | ❌ |
| Full GDPR (export + data deletion) | ✅ | Partial |
| White-label ready | ✅ | ❌ |
| Bilingual RO + EN | ✅ | Rare |
| Docker + Traefik deploy in <1 hour | ✅ | ❌ |
| Stripe integration with webhooks | ✅ | ❌ |

---

## Why Is It Worth €45,000+?

### Conservative Value Calculation

| Component | Estimated Rebuild Time | Market Cost (€80/h senior dev) |
|---|---|---|
| Next.js 14 Frontend (30+ pages, auth, billing) | 400h | €32,000 |
| Backend Admin Console (70+ endpoints, AI config) | 300h | €24,000 |
| AI Orchestrator + 11 workers + supervisor | 200h | €16,000 |
| Auto-corrector + semantic validation | 100h | €8,000 |
| Full Stripe billing system | 80h | €6,400 |
| Full GDPR (export, deletion, retention) | 50h | €4,000 |
| Bilingual i18n (RO + EN) | 40h | €3,200 |
| PWA, 2FA, reCAPTCHA, S3 backup | 60h | €4,800 |
| Docker + Traefik + deployment | 40h | €3,200 |
| QA, tests, smoke tests | 80h | €6,400 |
| **TOTAL REBUILD** | **1,350h** | **€108,000** |

**The asking price of €45,000 represents 41% of the rebuild cost** — an exceptional acquisition for a fully functional, tested, production-ready product.

### SaaS Multiple
With just 500 active users and MRR of €7,500, value at 5× annual MRR = **€450,000**. The price of €45,000 is 0.1× of the 1-year potential.

---

## Conclusion

NutriAID is a fully functional SaaS platform with real AI, real billing, a real admin console, and real users. It is not an MVP or a prototype — it is a finished, documented, tested product ready to scale. The buyer receives a 12–18 month head start in development at a fraction of the true cost.

---

*Document generated: June 2026 | Platform version: prod branch*
