# NutriAID — Cost Structure

**FILE PATH:** NutriAID-Acquisition-Portal/Business-and-Valuation/Cost-Structure.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Cost-Structure.pdf  
**Classification:** Confidential — Business Due Diligence

---

## Overview

NutriAID is designed for low operational overhead. The platform runs on commodity cloud infrastructure, uses a self-correcting AI pipeline that minimises unnecessary API calls, and has zero licensing fees or proprietary dependencies. This report details the full cost structure at current scale and at projected growth milestones.

---

## Infrastructure Costs

### Current (Single VPS, < 500 MAU)

| Item | Provider | Monthly Cost |
|---|---|---|
| VPS (4 vCPU / 8 GB RAM) | Hetzner CX31 | €12–16 |
| Block storage (40 GB) | Hetzner volumes | €2 |
| DNS management | Cloudflare (free tier) | €0 |
| TLS certificates | Let's Encrypt (free) | €0 |
| Domain name | Namecheap / similar | €1.50 |
| **Total infrastructure** | | **~€17/month** |

### Scale: 5,000 MAU

| Item | Monthly Cost |
|---|---|
| VPS × 2 (8 vCPU / 16 GB) | €60 |
| Managed PostgreSQL (Supabase Pro) | €25 |
| Object storage (S3-compatible) | €5 |
| Load balancer | €10 |
| **Total infrastructure** | **~€100/month** |

### Scale: 50,000 MAU

| Item | Monthly Cost |
|---|---|
| App servers × 4 | €200 |
| Managed PostgreSQL (production tier) | €100 |
| Redis (session caching) | €30 |
| CDN (Cloudflare Pro) | €25 |
| Load balancer | €20 |
| Monitoring (Grafana Cloud) | €20 |
| **Total infrastructure** | **~€395/month** |

---

## AI API Costs

AI cost is the primary variable cost and is directly proportional to the number of guidance requests.

### Cost Per Guidance Request

| Worker | Model | Avg Input Tokens | Avg Output Tokens | Cost Per Call |
|---|---|---|---|---|
| profile-analyzer | gpt-4o | 600 | 300 | €0.0053 |
| intolerance-checker | gpt-4o | 700 | 400 | €0.0065 |
| allergy-checker | gpt-4o | 700 | 350 | €0.0060 |
| meal-plan-generator | gpt-4o | 1,200 | 800 | €0.0145 |
| nutrition-calculator | gpt-4o | 800 | 400 | €0.0075 |
| medical-safety | gpt-4o | 900 | 500 | €0.0090 |
| **Full meal-plan intent (6 workers)** | | | | **~€0.049/request** |

*Pricing based on GPT-4o: $5/1M input tokens, $15/1M output tokens, EUR/USD ≈ 0.93*

### AI Cost at Scale

| MAU | Avg Requests/User/Day | Monthly Requests | Monthly AI Cost |
|---|---|---|---|
| 1,000 | 2 | 60,000 | €2,940 |
| 5,000 | 2 | 300,000 | €14,700 |
| 20,000 | 2 | 1,200,000 | €58,800 |
| 50,000 | 2 | 3,000,000 | €147,000 |

### AI Cost Reduction Strategies

| Strategy | Estimated Savings |
|---|---|
| Route simple intents to gpt-4o-mini | 60–70% reduction for those intents |
| Cache frequently requested meal plans (e.g., common profiles) | 15–25% reduction |
| Rule-based corrector (already implemented) | Saves 1 AI call per correction |
| Per-plan request limits (already implemented) | Directly caps exposure |

**With gpt-4o-mini routing for 60% of intents:**
- Average cost per request drops from €0.049 to ~€0.022
- 50,000 MAU monthly AI cost: **~€66,000** instead of €147,000

---

## Third-Party Service Costs

| Service | Provider | Pricing Model | Monthly Cost (at 5K MAU) |
|---|---|---|---|
| Email delivery | SendGrid | $0.001/email | ~€15 |
| Stripe | Stripe | 1.4% + €0.25/transaction | ~2.9% of revenue |
| reCAPTCHA | Google | Free (up to 1M assessments/month) | €0 |
| TOTP | (self-hosted) | — | €0 |

---

## Personnel Costs

Personnel required to operate NutriAID at different scale levels:

### Current State (Founder-Operated)

| Role | FTE | Cost |
|---|---|---|
| Founder / Full-stack developer | 1.0 | (equity) |
| **Total** | **1.0** | |

### At 5,000 MAU

| Role | FTE | Monthly Cost (EU) |
|---|---|---|
| Full-stack developer | 1.0 | €5,000 |
| Customer support (part-time) | 0.5 | €1,500 |
| Marketing / growth | 0.5 | €2,000 |
| **Total** | **2.0** | **€8,500/month** |

### At 20,000 MAU

| Role | FTE | Monthly Cost (EU) |
|---|---|---|
| CTO / Senior developer | 1.0 | €8,000 |
| Backend developer | 1.0 | €5,500 |
| Frontend developer | 1.0 | €5,000 |
| Customer success | 1.0 | €3,500 |
| Growth / marketing | 1.0 | €5,000 |
| **Total** | **5.0** | **€27,000/month** |

---

## Cost Structure Summary

### At 5,000 MAU, €55,000 MRR (€11 ARPU)

```
Revenue:                    €55,000 / month

Costs:
  Infrastructure             €100   (0.2%)
  AI API                   €14,700 (26.7%)
  Email/Stripe/services      €1,600  (2.9%)
  Personnel                  €8,500 (15.5%)
  Marketing (paid)           €3,000  (5.5%)
  ─────────────────────────────────────────
  Total costs:             €27,900
  
Gross Margin:               €27,100 (49.3%)
```

### At 20,000 MAU, €220,000 MRR (€11 ARPU)

```
Revenue:                   €220,000 / month

Costs:
  Infrastructure               €395   (0.2%)
  AI API (optimised)         €44,000  (20%)
  Email/Stripe/services        €6,500   (3%)
  Personnel                   €27,000  (12%)
  Marketing (paid)            €15,000   (7%)
  ─────────────────────────────────────────
  Total costs:               €92,895

Gross Margin:               €127,105  (57.8%)
```

---

## Capital Expenditure

NutriAID has no hardware assets, physical infrastructure, or inventory. All capital is software (the codebase). There is no CapEx requirement for the acquirer — operational cost begins at deployment.

---

## Cost Efficiency Highlights

- **Rule-based auto-corrector:** Saves AI API calls on every correction — effectively €0 cost for most validation failures
- **JSON store (admin):** Eliminates a second database subscription — no managed PostgreSQL needed for admin state
- **Docker + self-hosted Traefik:** Eliminates load balancer SaaS fees at current scale
- **Let's Encrypt TLS:** Zero certificate authority cost
- **No proprietary AI dependencies:** Any OpenAI-compatible API works — price competition benefits the operator

---

*NutriAID Acquisition Portal — Confidential — June 2026*
