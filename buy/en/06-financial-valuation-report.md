# NutriAID — Financial Valuation Report
### Complete Financial and Valuation Analysis

---

## 1. Valuation Methods Applied

The platform is evaluated using 4 standard methods for SaaS product acquisitions, all converging on a final asking price.

---

## Method 1: Replacement Cost (Build Cost)

The most conservative and direct method: what would it cost to rebuild the platform from scratch?

### Detailed Work Estimate

| Module | Hours | Rate (€/h senior) | Cost |
|---|---|---|---|
| Next.js 14 Frontend — App Router + middleware | 60h | €80 | €4,800 |
| Authentication system (JWT, cookies, email) | 50h | €80 | €4,000 |
| Dashboard (monitoring, guidance, profile, GDPR) | 80h | €80 | €6,400 |
| Public pages (landing, pricing, legal, KB) | 60h | €80 | €4,800 |
| i18n RO/EN system (all pages + emails) | 40h | €80 | €3,200 |
| PWA (manifest, icons, service worker) | 20h | €80 | €1,600 |
| **Frontend Total** | **310h** | | **€24,800** |
| | | | |
| Backend Admin Console — Next.js 15 | 80h | €80 | €6,400 |
| AI Orchestrator (intent detection, chain) | 60h | €80 | €4,800 |
| 11 AI workers + schemas + validation | 100h | €80 | €8,000 |
| Auto-corrector (3-layer) + semantic validator | 80h | €80 | €6,400 |
| Rule-based guidance engine | 60h | €80 | €4,800 |
| Prompt rewriter + configurable prompts | 30h | €80 | €2,400 |
| Admin settings (AI, Stripe, email, PWA, 2FA) | 60h | €80 | €4,800 |
| User management + audit trail | 40h | €80 | €3,200 |
| **Backend Total** | **510h** | | **€40,800** |
| | | | |
| Stripe integration (checkout, portal, webhooks) | 80h | €80 | €6,400 |
| Full GDPR (export, deletion, retention policy) | 50h | €80 | €4,000 |
| Email system (5 templates, bilingual) | 30h | €80 | €2,400 |
| PDF generator (pdfkit, NutriAID design) | 30h | €80 | €2,400 |
| PostgreSQL schema + Drizzle ORM + migrations | 40h | €80 | €3,200 |
| Docker + Traefik configuration | 40h | €80 | €3,200 |
| Security (headers, rate limiting, CSP) | 30h | €80 | €2,400 |
| QA — tests (unit, E2E, smoke) | 80h | €80 | €6,400 |
| Documentation (13 reports) | 60h | €80 | €4,800 |
| **Infrastructure + Shared** | **440h** | | **€35,200** |
| | | | |
| **TOTAL REBUILD** | **1,260h** | | **€100,800** |

**Asking price: €45,000 = 44% of rebuild cost.**

> *Conservative estimate. Rates of €100–150/h for senior specialists in Western Europe are common, which would put rebuild cost at €126,000–189,000.*

---

## Method 2: Revenue Multiple (SaaS Multiplier)

Industry standard: SaaS businesses sell at 3–8× annual revenue.

### Scenario A — Launch (0–6 months)

MRR target: €2,000 (133 Pro subscribers at €14.99)

```
Annual revenue: €24,000
Multiplier applied: 3× (pre-revenue platform)
Valuation: €72,000
```

### Scenario B — Early Traction (6–18 months)

MRR target: €7,500 (500 subscribers, mixed plans)

```
Annual revenue: €90,000
Multiplier applied: 4× (established traction)
Valuation: €360,000
```

### Scenario C — Growth (18–36 months)

MRR target: €17,000 (1,000+ subscribers)

```
Annual revenue: €204,000
Multiplier applied: 5×
Valuation: €1,020,000
```

**The asking price of €45,000 is a 5× discount from the minimum scenario.** For the buyer, this means acquiring a product at the valuation of a platform with 167 paying subscribers — the breakeven is achievable within 12–18 months at realistic growth rates.

---

## Method 3: Asset Value

The platform represents a bundle of valuable assets beyond code:

| Asset | Estimated Value |
|---|---|
| Codebase (1,260h senior dev) | €100,800 |
| AI Architecture (proprietary, 11 workers) | €20,000 |
| Business documentation (13 reports) | €5,000 |
| Legal Pack (NDA, IP transfer templates) | €2,000 |
| Brand (nutriaid.eu domain, design system) | €3,000 |
| Growth strategy (validated, ready to implement) | €5,000 |
| **Total Asset Value** | **€135,800** |

**Asking price of €45,000 = 33% of total asset value.**

---

## Method 4: Opportunity Cost

What does the buyer avoid by buying vs. building?

**Time cost:**
- Build time: 12–18 months for a team of 2–3 developers
- Market window lost: 12–18 months × potential MRR
- At €5,000/month MRR realistic in month 6: lost €30,000–90,000 in revenue

**Capital cost (building from scratch):**
- 2 senior developers × 12 months × €3,000–5,000/month = €72,000–120,000
- Product management, design, testing: additional €15,000–30,000
- **Total build cost for 18 months: €87,000–150,000**

**Buying at €45,000 saves €42,000–105,000 in direct costs + eliminates 12–18 months market delay.**

---

## 2. Revenue Projections

### Conservative Model (Year 1 — Romania only)

| Month | Active Users | Paying (5% conv.) | MRR | Costs | Net |
|---|---|---|---|---|---|
| 1 | 100 | 5 | €75 | €200 | -€125 |
| 3 | 500 | 25 | €375 | €250 | +€125 |
| 6 | 2,000 | 100 | €1,499 | €350 | +€1,149 |
| 9 | 5,000 | 250 | €3,748 | €450 | +€3,298 |
| 12 | 10,000 | 500 | €7,495 | €600 | +€6,895 |

**Year 1 cumulative revenue: ~€38,000**
**Year 1 cumulative net: ~€22,000**
**ROI by month 12: 49%**

### Moderate Model (Year 1 — Romania + Eastern Europe)

| Month | Paying Users | MRR | Costs | Net |
|---|---|---|---|---|
| 6 | 200 | €2,998 | €400 | +€2,598 |
| 12 | 750 | €11,243 | €700 | +€10,543 |

**Year 1 cumulative net: ~€55,000 → ROI: 122% in first year**

### Accelerated Model (with paid marketing, €2,000/month)

| Month | Paying Users | MRR | Costs | Net |
|---|---|---|---|---|
| 3 | 150 | €2,249 | €2,350 | -€101 |
| 6 | 400 | €5,996 | €2,450 | +€3,546 |
| 12 | 1,000 | €14,990 | €2,700 | +€12,290 |

**Year 1 cumulative net: ~€60,000 → ROI: 133%**

---

## 3. Monthly Cost Analysis

### By User Count

| Users | Infrastructure | AI API | Email | Total/Month | Per User |
|---|---|---|---|---|---|
| 100 | €10 | €15 | €0 | €25 | €0.25 |
| 500 | €15 | €75 | €10 | €100 | €0.20 |
| 1,000 | €20 | €150 | €15 | €185 | €0.185 |
| 2,000 | €30 | €300 | €20 | €350 | €0.175 |
| 5,000 | €60 | €750 | €30 | €840 | €0.168 |

AI cost is calculated at $0.06/AI request, 5 requests/month/user, 50% AI/50% rule-based.

### Gross Margin by Plan

| Plan | Price | Cost/User | Gross Margin |
|---|---|---|---|
| Basic €9.99 | €9.99 | €0.185 | **98.1%** |
| Pro €14.99 | €14.99 | €0.185 | **98.8%** |
| Pro+ €35.99 | €35.99 | €0.185 | **99.5%** |

> *Stripe fees not included in the above (2.9% + €0.30 per transaction).*

---

## 4. Breakeven Analysis

**Fixed monthly costs at starter configuration (500 users): ~€100/month**

| Plan | Price (net after Stripe) | Breakeven (users) |
|---|---|---|
| Basic | €9.40 | 11 users |
| Pro | €14.26 | 8 users |
| Pro+ | €34.94 | 3 users |

**With a mixed acquisition of 15 paying users, the platform covers its own costs.** Every user above this threshold is pure profit.

---

## 5. White-Label Revenue Potential

### Sale/Licensing Model

| Type | Amount | Probability | Expected Value |
|---|---|---|---|
| White-label licence (1-time) | €15,000/client | Medium | €15,000 |
| Monthly royalties (5 clients × €300) | €1,500/month | Medium | €18,000/year |
| B2B clinic package | €200/month/clinic | High | €2,400/year/clinic |

### White-Label Scenario (5 clients, Year 2)

```
5 × €15,000 one-time         = €75,000
5 × €300/month × 12 months   = €18,000
──────────────────────────────────────
Total Year 2 from white-label = €93,000
```

**Combined with direct SaaS (Year 2), total revenue potential: €150,000–200,000.**

---

## 6. Valuation Summary

| Method | Valuation |
|---|---|
| Rebuild cost (1,260h × €80) | €100,800 |
| Revenue multiple (conservative, 3× ARR Year 1) | €72,000 |
| Total assets | €135,800 |
| Opportunity cost (avoided build) | €87,000–150,000 |
| **Average across methods** | **€98,900** |
| **Asking price** | **€45,000** |
| **Discount to average** | **54%** |

---

## Conclusion

NutriAID is priced significantly below any standard valuation metric. At €45,000, the buyer acquires:

- A product valued at €100,000+ by rebuild cost
- 12–18 months head start over any competitor building from scratch
- A business that can reach ROI in the first year with reasonable execution
- A white-label asset with €150,000+ resale/licensing potential

**The asking price is not based on current revenue (pre-launch) — it is based on the intrinsic value of the asset and the opportunity it represents.**

---

*Document generated: June 2026 | NutriAID Platform v1.0 — prod branch*
