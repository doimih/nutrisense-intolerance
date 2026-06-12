# NutriAID — Buyer Q&A
### Prepared answers to frequently asked buyer questions

---

## Technology

**Q: What versions of Node.js and Next.js do you use?**

A: Frontend: Next.js 14.2.35 with Node.js 20 LTS. Backend admin: Next.js 15.5.18 with React 19. Both are stable versions — LTS or current stable — with at least 12 months of guaranteed support from Vercel/Meta. We do not use beta or experimental versions.

---

**Q: Why two separate apps (frontend + backend)?**

A: The separation is a deliberate architectural decision, not a lack of planning. Concrete advantages:
1. **Security:** Admin secrets (AI keys, Stripe secret) are never in the same app as user-facing code
2. **Independent scaling:** The high-traffic frontend can be scaled without touching the backend
3. **Reduced attack surface:** If the frontend has a vulnerability, the admin backend remains isolated
4. **Deployability:** Each app can be deployed independently

---

**Q: Can the platform run without Docker?**

A: Yes, absolutely. Docker is optional — it simplifies deployment but is not required. It can run with `npm start` directly on any server with Node.js 20 + PostgreSQL 16. The installation guide includes complete instructions for both variants (with and without Docker).

---

**Q: What database do you use and can data be migrated easily?**

A: PostgreSQL 16 with Drizzle ORM. The schema is complete in TypeScript (`lib/db/schema.ts`), versioned with incremental migrations. Migrating to another PostgreSQL (cloud or on-premise) is done by changing `DATABASE_URL` in `.env` and running `drizzle-kit migrate`. No stored procedures or non-standard extensions are used.

---

**Q: Are there third-party service dependencies I can't escape?**

A: Three optional external dependencies, all replaceable:
1. **AI API (OpenAI/Gemini)** — can be replaced with any OpenAI-compatible provider, including local Ollama models (cost $0)
2. **Stripe** — can be replaced with LemonSqueezy or Paddle with changes to 3–4 files
3. **Email SMTP** — any SMTP provider works (self-hosted Postfix, SendGrid, SES, Brevo)

There is no lock-in to any specific cloud service.

---

**Q: Is the code obfuscated or under restrictive licences?**

A: The code is 100% TypeScript source, fully readable. No obfuscation, no restrictive third-party licences, no proprietary third-party components. MIT licence applies to all npm dependencies. The buyer receives full intellectual property rights.

---

## AI

**Q: Does the platform use ChatGPT or a proprietary model?**

A: It is not a simple ChatGPT wrapper. The platform uses a proprietary orchestrator with 11 specialised workers (profile, intolerances, allergens, meals, recipes, nutrition, supplements, progress, medical safety). Each worker has its own prompt, validation schema, and correction logic. The AI model (GPT-4o, Gemini, Claude, or local) is a swappable component within this architecture.

---

**Q: What happens if the OpenAI API goes down?**

A: The platform has three resilience layers:
1. **Layer 1:** Automatic fallback to Gemini 1.5 Pro (configured as secondary model)
2. **Layer 2:** If Gemini also fails → Rule-based engine (deterministic algorithms, cost $0)
3. **Layer 3:** Request fingerprinting — if the request is identical to a previous one, serve from cache

The user always receives a response, even if the AI API is completely down.

---

**Q: Can I switch the AI model without touching the code?**

A: Yes. From the admin console (`Settings → AI Keys`), you can change:
- Primary model (dropdown: gpt-4o, gpt-4-turbo, gemini-1.5-pro, claude-3-opus, etc.)
- Fallback model
- API key
- Temperature and max tokens

The change applies immediately to new requests, without restart.

---

**Q: Can I use local AI models (Ollama, LM Studio) for zero cost?**

A: Yes. In the "Orchestrator URL" field in admin, set the local endpoint (e.g., `http://localhost:11434/v1`). The platform will use that OpenAI-compatible server. Tested with Llama 3, Mistral, and Qwen2 via Ollama.

---

**Q: How much does AI cost per user per month?**

A: With GPT-4o configuration + 5 guidance requests/user/month, average cost ~$0.30/user/month. At 1,000 users → ~$300/month total AI. 50% of requests are resolved by the rule-based engine (cost $0), so actual cost ~$150/month at 1,000 active users.

---

**Q: What medical validation does the platform have?**

A: The `medical-safety` worker processes every AI response before it reaches the user. It removes: diagnoses ("you are intolerant to X"), prescriptions ("take medication Y"), absolute language ("never", "guaranteed", "100%"), and conflicts with declared intolerances. A separate semantic validator detects these patterns via regex and scoring. The platform cannot recommend medications or make diagnoses — architecturally impossible.

---

## Costs

**Q: What are the actual monthly operating costs?**

A: Realistic configuration for the first 500 users:
- Hosting (Hetzner CX32): €14.90
- AI API (GPT-4o, 500 users × 5 req × 50% AI): ~€75
- Email (Brevo free): €0
- Backup (Hetzner Object Storage): €3
- **Total: ~€93/month**

Break-even at ~7 users on the Pro plan (€14.99/month). Operating margin >90% at scale.

---

**Q: Does Stripe charge commission? How much?**

A: Stripe charges 2.9% + €0.30 per transaction. Example: at Pro €14.99/month → Stripe takes €0.73 → Net €14.26. European Interchange regulations can reduce the fee to 1.5% + €0.10 if the customer has a European card. Alternative: LemonSqueezy or Paddle have similar or lower commissions.

---

**Q: Are there hidden costs I should know about?**

A: No. Complete list of potential costs:
- VPS hosting: €5–150/month depending on size
- AI API: variable, ~$0.06/AI request
- Email SMTP: €0–19/month
- Stripe: 2.9% + €0.30 per payment
- Domain: €10–15/year
- S3 Backup: €3–10/month (optional)
- SSL: €0 (Let's Encrypt automatic via Traefik)
- Zero software licence costs (all MIT/open-source dependencies)

---

## Scaling

**Q: How many users can the platform handle on its current configuration?**

A: A Hetzner CX32 VPS (4 vCPU, 8 GB RAM, €14.90/month) comfortably handles 1,000–1,500 simultaneous active users. At 3,000+ users, upgrade to CX42 (€29.90/month). At 10,000+, horizontal scaling with managed PostgreSQL and multiple frontend instances.

---

**Q: Is horizontal scaling possible and how much does it cost?**

A: Yes. Required changes for full horizontal scaling:
1. **PostgreSQL:** Migrate to managed DB (Neon, Supabase, AWS RDS) — change `DATABASE_URL`, zero code
2. **Backend JSON store:** Migrate to PostgreSQL table — ~1 week dev, ~100 lines of code
3. **Session storage:** JWT stateless (already functional with multiple instances)
4. **Rate limiting:** Migrate to Redis for distributed limiting — ~1 day dev

---

## Maintenance

**Q: How much time does monthly maintenance require?**

A: Current operation: 0–2 hours/month for a stable platform without new features:
- Monitoring logs (15 minutes/week)
- npm security updates (1h/month)
- Responding to user support (variable)

The admin console manages everything else (prices, AI, email, users) without code.

---

**Q: What happens if Next.js releases a major version with breaking changes?**

A: Next.js versions are pinned in `package.json`. Updates are optional and incremental. Next.js has a 12+ month deprecation policy. TypeScript strict ensures any breaking change is detected at compile time, not in production.

---

## IP and Transfer

**Q: Do I receive complete source code?**

A: Yes. The sale includes:
- Complete source code (frontend + backend + configurations)
- Git repository access with full history
- All configuration files (Docker, Traefik, env example)
- All database migrations
- All tests

---

**Q: Are there copyright or third-party licences that restrict commercial use?**

A: No. All npm dependencies used are licensed under MIT, Apache 2.0, or ISC — all permit commercial use without restrictions, without royalties. No proprietary third-party code is included. The custom code (orchestrator, workers, admin console) belongs entirely to the seller and is transferred in full.

---

**Q: Can I rebrand and resell the platform?**

A: Yes, completely. The buyer has full rights to:
- Complete rebranding (logo, colours, copy)
- Sale/licensing under any brand
- White-label for third parties
- Complete modification of the code
- Unrestricted commercial use

No non-compete clauses or usage restrictions.

---

## Support

**Q: Do you offer post-sale support?**

A: Standard: 30 days Q&A (answers to technical questions, architectural clarifications). Negotiable: 3–12 months extended technical support with SLA, including assistance for new features. Extended support price is negotiated separately.

---

**Q: Is there sufficient documentation for a developer to take over?**

A: Yes. Documentation includes:
- 13 business reports (the `buy/` folder)
- Complete technical report (architecture, API, DB schema, workers)
- Installation and deployment guide (local, VPS, Docker, Traefik, Dokploy)
- Code comments for non-obvious sections
- E2E and smoke tests as living documentation

A senior developer can take over the platform within 1–2 days of onboarding.

---

**Q: What is physically transferred at sale?**

A: Complete transfer checklist:
- [ ] GitHub repository access (transfer or fork with all branches)
- [ ] Complete source code (ZIP alternative)
- [ ] Domain nutriaid.eu (optional, Namecheap/similar transfer)
- [ ] Hosting credentials (Hetzner or similar)
- [ ] Stripe account (transfer or buyer creates own account)
- [ ] OpenAI account (buyer uses own account)
- [ ] Complete documentation (13 reports + technical guides)
- [ ] Video onboarding session (2–4 hours, optional)

---

*Document generated: June 2026 | NutriAID Platform v1.0 — prod branch*
