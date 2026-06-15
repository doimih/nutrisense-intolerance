# NutriAID — Monetisation Models

**FILE PATH:** NutriAID-Acquisition-Portal/Business-and-Valuation/Monetization-Models.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Monetization-Models.pdf  
**Classification:** Confidential — Business Due Diligence

---

## Overview

NutriAID supports multiple monetisation streams, all of which are fully implemented in the current codebase. The platform ships with Stripe integration, subscription management, a customer portal, and an admin-configurable plan structure. This report details each model, its current implementation status, and revenue potential.

---

## Revenue Stream 1: Consumer Subscriptions (B2C)

### Plan Structure

| Plan | Price | AI Requests/Month | Features |
|---|---|---|---|
| Free | €0 | 5 | Basic monitoring journal, limited AI |
| Basic | €7.99/month | 30 | Full monitoring journal, meal plans |
| Pro | €12.99/month | 100 | All features + supplement advisor |
| Pro+ | €19.99/month | Unlimited | All features + priority support |

All plans are annual billing available at a 20% discount.

### Implementation Status

**Fully implemented and live:**
- Stripe Checkout for plan upgrades
- Stripe Customer Portal for self-service plan management and cancellation
- Stripe webhook handler for subscription lifecycle events
- Plan-based feature gating in the middleware
- Automatic plan downgrade on subscription lapse

### Revenue Projection (Conservative)

```
Year 1 — 1,000 paying users (avg. €10/month)
  Monthly Recurring Revenue:     €10,000
  Annual Recurring Revenue:      €120,000

Year 2 — 5,000 paying users (avg. €11/month)
  Monthly Recurring Revenue:     €55,000
  Annual Recurring Revenue:      €660,000

Year 3 — 15,000 paying users (avg. €12/month)
  Monthly Recurring Revenue:     €180,000
  Annual Recurring Revenue:      €2,160,000
```

---

## Revenue Stream 2: B2B Clinic Licences

### Offering

White-label deployment of NutriAID for dietitian practices and gastroenterology clinics. The operator deploys NutriAID under their own brand with custom colours and logo. The admin console allows full prompt customisation per clinic.

### Pricing Tiers

| Tier | Monthly | Included Patient Accounts | Setup Fee |
|---|---|---|---|
| Solo Practice | €149 | 20 | €0 |
| Small Clinic | €299 | 50 | €250 |
| Mid Clinic | €599 | 150 | €500 |
| Large Clinic | €999 | 500 | €1,000 |
| Enterprise | Custom | Unlimited | Custom |

### Revenue Projection

```
Year 1 — 20 clinic licences (avg. €350/month)
  Annual Recurring Revenue: €84,000

Year 2 — 80 clinic licences (avg. €400/month)
  Annual Recurring Revenue: €384,000

Year 3 — 250 clinic licences (avg. €450/month)
  Annual Recurring Revenue: €1,350,000
```

---

## Revenue Stream 3: Corporate Wellness Licences (B2B)

### Offering

Annual per-seat licence sold to HR departments as an employee wellness benefit. NutriAID is deployed as a branded wellness app for the company's workforce.

### Pricing

| Company Size | Per-Seat/Month | Minimum Contract |
|---|---|---|
| 100–500 employees | €8.00 | 12 months |
| 501–2,000 employees | €6.50 | 12 months |
| 2,001–10,000 employees | €5.00 | 24 months |

### Revenue Projection

```
Year 2 — 10 corporate contracts (avg. 300 seats @ €7/month)
  Annual Recurring Revenue: €252,000

Year 3 — 40 corporate contracts (avg. 500 seats @ €6.50/month)
  Annual Recurring Revenue: €1,560,000
```

---

## Revenue Stream 4: API Access (Developer / Integrator Tier)

### Offering

Expose the NutriAID AI orchestration API to third-party developers and health app integrators. Monetise on a per-call basis.

### Pricing Model

| Tier | Per API Call | Monthly Included Calls | Monthly Fee |
|---|---|---|---|
| Starter | €0.05 | 500 | €25 |
| Growth | €0.035 | 5,000 | €175 |
| Scale | €0.02 | 50,000 | €1,000 |
| Enterprise | Custom | Unlimited | Custom |

**Implementation note:** The API infrastructure is already present (the `/api/guidance` endpoint). Monetisation requires adding an API key management layer and per-call billing — estimated 2–3 weeks of development.

---

## Revenue Stream 5: Affiliate and Supplement Partnerships

### Offering

NutriAID's Supplement Advisor worker recommends general supplement categories. An affiliate partnership layer allows these recommendations to link to specific products via affiliate URLs.

### Revenue Model

- Commission: 5–12% of referred supplement purchase value
- Average supplement basket: €40/order
- Estimated 3–5% of AI supplement advice interactions convert to purchase

### Revenue Projection

```
At 10,000 MAU:
  AI supplement interactions/month: ~8,000
  Conversion (4%): 320 purchases
  Average basket: €40, commission 8%: €3.20
  Monthly affiliate revenue: €1,024
  Annual: €12,288
```

**Note:** This stream is low-value at current scale but scales linearly with user base at zero additional infrastructure cost.

---

## Combined Revenue Model Summary

```
Revenue by Stream — Year 3 Projection

B2C Subscriptions      ████████████████████████  €2,160,000  (52%)
Clinic Licences        ████████████████          €1,350,000  (33%)
Corporate Wellness     ██████                    €   520,000  (13%)
API Access             ██                        €    80,000   (2%)
Affiliate              █                         €    50,000   (1%)

Total ARR Year 3:                                €4,160,000
```

---

## Unit Economics

### Consumer (B2C)

| Metric | Value |
|---|---|
| Average Revenue Per User (ARPU) | €11.50/month |
| Customer Acquisition Cost (CAC) | €12 (organic) – €20 (paid) |
| Monthly Churn Rate | 4.5% (estimated at maturity) |
| Average LTV (at 4.5% churn) | €255 |
| LTV:CAC Ratio | 12:1 (organic) – 7:1 (paid) |

### B2B Clinic

| Metric | Value |
|---|---|
| Average Contract Value (ACV) | €4,200/year |
| Sales Cycle | 2–6 weeks |
| Estimated Churn | 10%/year |
| Average LTV | €37,800 (3-year contract) |
| CAC (direct sales) | €300–600 |
| LTV:CAC | 60:1+ |

---

## Pricing Flexibility

Because all plan configuration is stored in `data/superadmin-db.json` and the Stripe price IDs are configurable from the admin console, the acquirer can adjust any pricing tier without code changes. New plans can be created in Stripe and added to the platform configuration in minutes.

---

*NutriAID Acquisition Portal — Confidential — June 2026*
