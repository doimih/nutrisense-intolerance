# NutriAID — Risk Assessment
### Risk Analysis and Mitigation Strategies

---

## Overview

Every SaaS product carries risks. The purpose of this document is to identify and honestly evaluate all material risks associated with acquiring and operating NutriAID — along with the mitigation strategies already built in or available to the buyer.

**Overall Risk Level: LOW-MEDIUM**

The platform has multiple layers of technological protection (self-healing AI, GDPR, medical validation) and a business model with inherently low operational costs.

---

## 1. Technical Risks

### Risk T1: Third-Party AI API Dependency
**Description:** The platform primarily uses OpenAI GPT-4o and Google Gemini. If these APIs become unavailable, raise prices significantly, or change their terms.

**Probability: LOW** | **Impact: MEDIUM**

**Existing Mitigations:**
- 3-layer self-healing: GPT-4o → Gemini → Rule-based (cost $0)
- Rule-based engine operates completely independently of any AI API
- Support for any OpenAI-compatible model (Anthropic, Mistral, local Ollama)
- AI model changeable from admin console without any code change or restart

**Available Mitigations for Buyer:**
- Migrate to local model (Ollama + Llama3) for zero AI cost
- Use multiple API keys (load balanced across providers)
- Add Anthropic Claude as additional fallback (one config line)

**Residual Risk: VERY LOW** — the rule-based engine ensures the platform never returns zero results even without any AI API.

---

### Risk T2: Stripe Dependency
**Description:** Stripe could raise fees, change terms, or exit a market.

**Probability: VERY LOW** | **Impact: HIGH**

**Existing Mitigations:**
- Stripe integration is cleanly isolated in 3 files (`api/billing/*`, `lib/server/stripe.ts`)
- Webhook handling is HMAC-verified but abstract

**Available Mitigations for Buyer:**
- Migrate to LemonSqueezy: 3–5 days of work, ~4 files to modify
- Migrate to Paddle: similar effort
- Paddle/LemonSqueezy have simpler EU VAT handling

**Residual Risk: LOW**

---

### Risk T3: Next.js / Dependency Updates
**Description:** Future Next.js version with breaking changes.

**Probability: LOW** | **Impact: LOW-MEDIUM**

**Existing Mitigations:**
- All packages are pinned in `package.json` (no automatic updates)
- TypeScript strict catches breaking changes at compile time
- Next.js has 12-month deprecation policy for breaking changes
- Codebase avoids experimental features

**Residual Risk: LOW**

---

### Risk T4: Security Vulnerabilities
**Description:** Undetected vulnerabilities in the application code.

**Probability: LOW** | **Impact: HIGH**

**Existing Mitigations:**
- Passwords: scrypt (native Node.js, not bcrypt) + 64-byte salt
- Sessions: HttpOnly, Secure, SameSite=Strict cookies
- Rate limiting on all auth routes (5 req/60s per IP)
- CSP, X-Frame-Options, HSTS headers
- Stripe webhooks: HMAC verification
- No SQL injection risk (Drizzle ORM with parameterised queries)
- No direct env variable exposure (Next.js runtime boundaries)

**Available Mitigations for Buyer:**
- Regular `npm audit` runs (monthly recommended)
- Implement Snyk or Dependabot for automatic security PRs
- Penetration testing ($500–2,000 one-time) for high-value deployment

**Residual Risk: LOW-MEDIUM** — no platform is 100% secure; the existing implementations follow current best practices.

---

### Risk T5: PostgreSQL Data Loss
**Description:** Database failure causing user data loss.

**Probability: VERY LOW** | **Impact: HIGH**

**Existing Mitigations:**
- Daily backup support via admin console (S3-compatible)
- Docker volume for data persistence
- pg_dump restore in minutes

**Available Mitigations for Buyer:**
- Migrate to managed DB (Supabase, Neon, AWS RDS) — automatic replication
- Point-in-time recovery on managed services
- Cross-region backup for critical deployments

**Residual Risk: VERY LOW** with backups configured

---

## 2. Business Risks

### Risk B1: No Existing Revenue
**Description:** The platform is pre-revenue at time of sale. The buyer must generate their own user base.

**Probability: CERTAIN** (known) | **Impact: HIGH for inexperienced buyers**

**Context:**
This is the most significant risk and the reason for the favourable valuation. The seller has built and documented a complete, functional product. User acquisition remains the buyer's responsibility.

**Mitigation Strategies:**
- 7-day free trial (no card) reduces conversion friction
- Romanian market has no direct competitor — first-mover advantage
- Pricing is competitive (€9.99 Basic = very accessible)
- Content marketing (Knowledge Hub with 9 articles already built)
- SEO-ready public pages (structured content, FAQ, legal)

**Growth Channels (available to buyer from day 1):**
1. SEO: "food intolerance app", "lactose intolerance help", "IBS tracking app" — low competition
2. Facebook/Instagram: targeting wellness, digestive health, dietary restriction communities
3. Partnership with Romanian nutritionists/dietitians (B2B lead gen)
4. Reddit/forums: IBS, FODMAP, digestive health communities
5. PR: first AI-powered intolerance app in Romania — newsworthy

**Residual Risk: MEDIUM** — real for any pre-revenue product; manageable with consistent marketing effort.

---

### Risk B2: Competitive Response
**Description:** A well-funded competitor (e.g., Cara Care, international app) enters the Romanian market.

**Probability: LOW** | **Impact: MEDIUM**

**Why it's low probability:**
- Romania is a small market relative to Western Europe — not attractive for funded startups
- Building a competitive product requires 12–18 months and €100,000+ investment
- NutriAID's white-label capability lets it co-exist with, rather than directly compete with, large players

**Mitigation:**
- First-mover advantage in Romania
- Build user base and data network effects quickly
- Pivot to B2B (white-label for clinics) — not a consumer app competition

**Residual Risk: LOW**

---

### Risk B3: AI Regulatory Changes
**Description:** EU regulations on AI medical advice (EU AI Act) could restrict health recommendation features.

**Probability: MEDIUM** | **Impact: MEDIUM**

**Current Status:**
- The medical-safety worker already strips all diagnoses, prescriptions, and medical claims
- All responses include a medical disclaimer
- The platform positions itself as "nutrition guidance," not medical advice
- Full GDPR compliance already implemented

**Mitigation:**
- Monitor EU AI Act developments (effective 2025–2026 for high-risk AI)
- NutriAID's classification: likely "limited risk" or "minimal risk" (no medical diagnosis)
- Add explicit consent for AI-generated content if required by regulation
- Consult a legal specialist in digital health for the deployment jurisdiction

**Residual Risk: LOW-MEDIUM** — the existing medical safety layer significantly reduces regulatory exposure.

---

### Risk B4: User Acquisition Cost
**Description:** The cost to acquire paying users is higher than expected.

**Probability: MEDIUM** | **Impact: MEDIUM**

**Benchmarks:**
- Nutrition app CAC (Customer Acquisition Cost): €5–25 via paid social
- Organic CAC (SEO, content): €0.50–5
- B2B referral CAC: €10–50

**Mitigation:**
- 7-day free trial maximises conversion rate
- SEO-ready platform (public pages, Knowledge Hub)
- Viral coefficient: satisfied users refer friends (intolerance is a family/social topic)
- Pro+ at €35.99 amortises high CAC faster

**Residual Risk: MEDIUM** — manageable with content strategy and selective paid campaigns.

---

## 3. Operational Risks

### Risk O1: Technical Complexity for Non-Technical Buyer
**Description:** A buyer without technical background may have difficulty operating or modifying the platform.

**Probability: MEDIUM** | **Impact: MEDIUM**

**Existing Mitigations:**
- Admin console handles all operations without code
- Docker Compose simplifies deployment to 3 commands
- 13 detailed documentation reports
- Installation guide for multiple deployment scenarios

**Available Mitigations:**
- 30-day Q&A support included in sale
- Extensive documentation covers even advanced scenarios
- Hire a freelancer for one-time changes (€50–100/hour, 1–2 hours typical)

**Residual Risk: LOW** — the admin console was specifically designed for non-technical operators.

---

### Risk O2: Infrastructure Failure
**Description:** VPS server, Docker, or Traefik failure causing platform downtime.

**Probability: LOW** | **Impact: MEDIUM**

**Existing Mitigations:**
- Docker Compose auto-restart policy
- Traefik health checks
- Simple recovery: `docker compose up -d` restores all services

**Available Mitigations:**
- Monitoring: Uptime Robot (free tier) for external health checks
- Hetzner VPS has 99.9% uptime SLA
- Dokploy: automatic rollback and deployment monitoring

**Residual Risk: LOW**

---

### Risk O3: Email Deliverability
**Description:** Platform emails (verification, password reset) end up in spam.

**Probability: MEDIUM** (self-hosted SMTP) | **Impact: MEDIUM**

**Existing Mitigations:**
- Admin console supports any SMTP provider configuration
- Brevo (free tier, 300 emails/day) works out of the box

**Available Mitigations:**
- Use Brevo, Amazon SES, or SendGrid for professional deliverability
- Configure SPF, DKIM, DMARC on domain
- Warm up sending IP gradually

**Residual Risk: LOW** with a proper email provider.

---

## 4. Legal and Compliance Risks

### Risk L1: GDPR Compliance
**Description:** Operating in the EU requires full GDPR compliance.

**Probability of non-compliance issue: LOW** | **Impact: HIGH (potential fines)**

**Existing Mitigations:**
- Full user data deletion (hard delete, cascade)
- Data export on request (JSON + PDF)
- Published: Privacy Policy, Terms, Cookies Policy, Data Retention Policy
- Medical Disclaimer published
- No user data shared with third parties beyond Stripe (payment processing) and OpenAI/Gemini (AI processing)

**Recommended for Buyer:**
- Review and update privacy policy for your jurisdiction
- Add cookie consent banner if not present
- Verify Data Processing Agreement with OpenAI and Stripe
- Consult GDPR lawyer for formal compliance audit ($500–2,000 one-time)

**Residual Risk: LOW** — existing implementation is solid; formal legal review recommended.

---

### Risk L2: Medical Liability
**Description:** Risk of liability if AI-generated recommendations are misused as medical advice.

**Probability: VERY LOW** | **Impact: HIGH**

**Existing Mitigations:**
- medical-safety worker: all diagnoses and prescriptions are architecturally stripped from responses
- Published Medical Disclaimer: "Not medical advice, consult a doctor"
- Semantic validator: detects and blocks medical claims before user delivery
- Platform is positioned as "nutrition guidance," not medical diagnosis

**Recommended for Buyer:**
- Ensure medical disclaimer is prominent in the UX
- Add disclaimer to onboarding flow
- Do not modify medical-safety worker to allow diagnoses
- Consult digital health lawyer for jurisdiction-specific requirements

**Residual Risk: VERY LOW** — architecture makes it structurally impossible to deliver diagnoses or prescriptions.

---

### Risk L3: Third-Party Intellectual Property
**Description:** Risk that some component of the codebase infringes third-party IP.

**Probability: VERY LOW** | **Impact: HIGH**

**Existing Mitigations:**
- All npm dependencies are MIT, Apache 2.0, or ISC licensed
- No proprietary third-party code included
- All custom code (orchestrator, workers, admin console) is original

**Buyer Verification:**
- Run `license-checker` npm package: `npx license-checker --production`
- Review all non-MIT/Apache-2.0/ISC packages before commercial deployment

**Residual Risk: VERY LOW**

---

## 5. Risk Summary Matrix

| Risk | Probability | Impact | Residual Risk | Priority |
|---|---|---|---|---|
| T1: AI API unavailable | Low | Medium | Very Low | Low |
| T2: Stripe dependency | Very Low | High | Low | Low |
| T3: Next.js updates | Low | Low | Low | Very Low |
| T4: Security vulnerabilities | Low | High | Low-Medium | Medium |
| T5: Data loss | Very Low | High | Very Low | Low |
| B1: No existing revenue | Certain | High | Medium | **HIGH** |
| B2: Competitive response | Low | Medium | Low | Low |
| B3: AI regulation | Medium | Medium | Low-Medium | Medium |
| B4: User acquisition cost | Medium | Medium | Medium | **MEDIUM** |
| O1: Technical complexity | Medium | Medium | Low | Low |
| O2: Infrastructure failure | Low | Medium | Low | Low |
| O3: Email deliverability | Medium | Medium | Low | Low |
| L1: GDPR | Low | High | Low | Low |
| L2: Medical liability | Very Low | High | Very Low | Low |
| L3: Third-party IP | Very Low | High | Very Low | Low |

---

## Conclusion

NutriAID's primary risk is user acquisition — a commercial challenge, not a technical one. The platform is technically robust, legally prepared, and architecturally protected against the most common failure modes. A buyer with a clear go-to-market strategy (content, SEO, partnerships) can mitigate the main risk effectively.

The technical and legal risks are significantly lower than a typical early-stage SaaS, precisely because the seller has invested in building a complete, production-grade platform rather than an MVP.

---

*Document generated: June 2026 | NutriAID Platform v1.0 — prod branch*
