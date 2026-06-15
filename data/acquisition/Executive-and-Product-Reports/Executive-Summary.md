# NutriAID — Executive Summary

**FILE PATH:** NutriAID-Acquisition-Portal/Executive-and-Product-Reports/Executive-Summary.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Executive-Summary.pdf  
**Classification:** Confidential — Qualified Buyers Only  
**Date:** June 2026 | **Version:** Production Branch

---

## What Is NutriAID?

NutriAID is a production-ready, AI-native SaaS platform that helps individuals identify food intolerances and manage personalised nutrition through an AI orchestration engine with 10 specialised workers, a self-healing validation layer, and a fully configurable zero-code admin console.

The platform is live, tested, bilingual (Romanian and English), and deployable in under one hour using Docker + Traefik.

---

## The Problem

Over 500 million people globally suffer from food intolerances, irritable bowel syndrome (IBS), or diet-related chronic conditions. Most never receive a diagnosis because:

- Clinical testing is expensive (€150–€500 per session)
- Dietitians are scarce and cannot analyse daily data in real time
- Consumer nutrition apps log calories but cannot identify symptom-food correlations
- No existing consumer tool combines meal tracking, symptom analysis, intolerance detection, and AI-guided recommendations in one integrated workflow

---

## The Solution

NutriAID closes this gap with a three-layer approach:

| Layer | What it does |
|---|---|
| Daily Journal | User logs meals, symptoms, intensity (1–10), and wellbeing score |
| AI Orchestrator | Detects intent, routes request through an ordered worker chain |
| Self-Healing Layer | Validates, corrects, and safety-checks every AI output automatically |

The result: personalised, medically safe, contextually accurate guidance — generated in seconds, without a dietitian.

---

## Platform Architecture (Summary)

```
User Request
    │
    ├── GEO Engine  ←── Accept-Language header → country/region/cultural cuisine
    │
    ▼
AI Orchestrator  ←── Intent Detection (7 intents, bilingual RO + EN)
    │
    ▼
Worker Chain  ←── Profile Analyzer → Intolerance Checker → Reaction Pattern Analyzer
    │              → Meal Plan Generator → Recommended Foods Generator
    │              → Medical Safety (always last for sensitive intents)
    │
    ├── Diversity Engine  ←── Cross-worker blacklist, prevents repeated food suggestions
    │
    ▼
Worker Supervisor
    │
    ├── Schema Validation
    ├── Semantic Validation (behavioral compliance, no medical language)
    ├── Behavioral Safety Checks (no kcal, no diagnoses, no supplements)
    ├── Auto-Correction (GPT-4o → Fallback → Rule-Based)
    └── Structured Log
```

**Supported models:** GPT-4o (primary), Gemini 1.5 Pro (fallback), any OpenAI-compatible endpoint  
**Fallback:** Rule-based correction engine at $0 API cost  
**Configuration:** All parameters (model, temperature, prompts, tokens) editable at runtime from admin console  
**Compliance:** Fully behavioral, non-medical approach — no diagnoses, no calorie counts, no supplement prescriptions

---

## Business Model

| Plan | Price | Target User |
|---|---|---|
| Basic | €9.99/month | First-time trackers |
| Pro | €14.99/month | Users seeking AI-powered guidance |
| Pro+ | €35.99/month | Power users, complex conditions |
| Enterprise | Custom | Clinics, pharma wellness, white-label |

**Trial:** 7 days free on Pro+, no card required  
**Billing:** Stripe subscriptions with webhooks, automated retry, and customer portal

**MRR at 500 mixed-plan subscribers:** ~€7,500–€12,000  
**Infrastructure cost at 1,000 users:** <€200/month

---

## Why It Is Valuable

### 1. Built — Not Planned
NutriAID is not an MVP. It is a fully operational platform on the production branch with auth, billing, AI pipeline, admin console, i18n, PWA, 2FA, GDPR export/deletion, PDF generation, and S3 backup — all working.

### 2. Self-Healing — Runs Without Humans
The Worker Supervisor automatically corrects AI errors. The rule-based fallback ensures zero downtime even when all AI APIs are offline. Behavioral compliance rules are enforced at the validation layer — no medical content can reach the user even if the AI ignores instructions.

### 3. GEO-Aware, Culturally Adapted Output
The GEO engine detects the user's country from the HTTP `Accept-Language` header and injects cultural food context into every worker's prompt. Romanian users receive Romanian dishes; French users receive French cuisine. Zero user configuration — fully automatic and stateless.

### 4. Diversity Engine — No Repetitive Recommendations
A cross-worker blacklist tracks all food items mentioned across the worker chain in a single session. Each worker is instructed to avoid repeating any previously mentioned item. Users receive genuinely varied food ideas, not the same 5 foods repeated across 6 workers.

### 5. Zero-Code Operations
Every operational parameter — AI models, prices, SMTP, Stripe keys, worker prompts, reCAPTCHA, PWA — is configurable from the admin console without touching code.

### 6. White-Label Ready
The platform is architected for multi-tenant white-labelling. Nutrition clinics, pharma wellness divisions, and health insurers are the natural B2B channel.

---

## Rebuild Cost vs. Asking Price

| Module | Estimated Rebuild Hours | Cost at €80/h Senior Rate |
|---|---|---|
| Next.js 14 Frontend (30+ pages) | 310h | €24,800 |
| Backend Admin Console (70+ endpoints) | 510h | €40,800 |
| Stripe Billing (checkout, webhooks, portal) | 80h | €6,400 |
| Full GDPR (export, deletion, retention) | 50h | €4,000 |
| Email System (5 bilingual templates) | 30h | €2,400 |
| Docker + Traefik + CI | 60h | €4,800 |
| QA, Tests, Documentation | 80h | €6,400 |
| **TOTAL REBUILD** | **~1,350h** | **€108,000+** |

**Asking price: €70,000–€120,000**  
This represents 65–111% of rebuild cost for a finished, documented, production-deployed product.

---

## Market Opportunity

| Market | Size / Growth |
|---|---|
| Global nutrition app market | $8.5B (2023), 21% CAGR |
| European intolerance management | $1.2B segment, underserved |
| Celiac disease prevalence | 1% of global population (~80M people) |
| Romania / CEE smartphone penetration | >70%, wellness +23% YoY |

---

## Ideal Buyer Profile

- **Strategic acquirer:** Health-tech company adding AI nutrition to their product suite
- **Agency/operator:** Digital health operator seeking a white-label SaaS to resell
- **Individual:** Technical founder or operator with health-tech domain experience
- **Investor:** Portfolio acquirer adding a cash-flowing SaaS with growth optionality

---

## Acquisition Process

1. Download and sign the NDA (Legal Pack)
2. Schedule a live demo session
3. Complete technical and financial due diligence
4. Submit offer and agree on escrow milestones
5. Transfer: source code, domain, Stripe account, hosting, all third-party accounts

**Contact:** acquire@nutriaid.eu  
**Response time:** 24 hours for qualified enquiries

---

*NutriAID Acquisition Portal — Confidential — June 2026*
