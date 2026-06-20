# NutriAID — Terms of Sale

**FILE PATH:** NutriAID-Acquisition-Portal/Legal-Pack/Terms-of-Sale.pdf  
**DOWNLOAD LINK:** https://nutriaid.com/acquisition/download?file=Terms-of-Sale.pdf  
**Classification:** Legal — Confidential

---

> **IMPORTANT NOTICE:** This document is provided as a reference template for the acquisition transaction. The parties should seek independent legal counsel before executing any binding agreement. This template does not constitute legal advice.

---

## TERMS OF SALE — NUTRIAID PLATFORM ACQUISITION

**Effective Date:** _________________ ("Effective Date")

**Seller:**  
Name: _____________________________________  
Address: ___________________________________  
Jurisdiction: Romania  
(hereinafter "the Seller")

**Buyer:**  
Name: _____________________________________  
Address: ___________________________________  
(hereinafter "the Buyer")

---

## 1. Subject Matter

### 1.1 Assets Being Sold

The Seller agrees to sell, and the Buyer agrees to purchase, the following assets (collectively, "the Assets"):

a) The complete NutriAID software platform, including all source code, configuration files, AI orchestration code, AI worker definitions, database schemas and migration files, Docker/Traefik infrastructure code, PWA implementation, TikTok Pixel integration, Brevo newsletter system, and all other associated code;

b) All intellectual property rights associated with the Platform as described in the IP Transfer Agreement included in the Legal Pack;

c) The domain name(s): `nutriaid.eu`, `nutriaid-intolerances.ro` (if registered), and all associated subdomains;

d) All brand assets: logo files (Figma, SVG, PNG), colour system, typography guidelines, and brand standards documentation;

e) All technical documentation, acquisition portal content, and user-facing content in both Romanian and English;

f) All third-party service accounts and API integrations, to the extent transferable, including: Stripe (payment processing), Brevo/Sendinblue (newsletter and transactional email), OpenAI or compatible AI API, Google reCAPTCHA, TikTok Pixel, S3-compatible backup storage, and hosting/server accounts;

g) Any existing user data, subject to GDPR compliance requirements and the data transfer obligations set out in Section 5.3.

### 1.2 Assets Not Included

Unless separately agreed in writing, the following are not included in the sale:

- Any cash or bank account balances of the Seller
- Any third-party contractual obligations of the Seller not specifically listed
- Any pending litigation or regulatory proceedings involving the Seller

---

## 2. Purchase Price

### 2.1 Total Price

The total purchase price for the Assets is:

**€ ______________ (EUR)** ("Purchase Price")

within the range of **€50,000 – €120,000** as described in the Valuation Report.

### 2.2 Payment Structure

**Option A — Full Payment at Closing:**  
100% of the Purchase Price due within 7 calendar days of execution of this Agreement.

**Option B — Milestone-Based Payment:**  
- 70% due at execution: **€ __________**
- 30% due at 30-day post-transfer milestone: **€ __________**

The Milestone-Based Payment option is subject to negotiation and must be agreed in writing.

### 2.3 Currency and Method

All payments shall be made in Euro (EUR) by international bank transfer (IBAN/SWIFT) or via Escrow.com or an equivalent escrow service agreed in writing by both Parties. Currency exchange costs, if applicable, are borne by the Buyer.

### 2.4 No Refunds

Except in the event of material misrepresentation by the Seller (see Section 6), all payments are non-refundable upon receipt.

---

## 3. Closing Process

### 3.1 Timeline

| Event | Day |
|---|---|
| Agreement signed by both parties | Day 0 |
| Initial payment received by Seller | Day 0–7 |
| Source code and repository transferred | Day 7–14 |
| Domain names transferred | Day 7–14 |
| Third-party service accounts transferred | Day 7–14 |
| Transition support period begins | Day 14 |
| Milestone payment due (if applicable) | Day 44 |
| Transition support period ends | Day 44 |

### 3.2 Deliverables

The Seller shall deliver within 14 calendar days of payment confirmation:

1. Complete source code via Git repository transfer or encrypted archive
2. All environment variable templates and `.env.example` files
3. Database migration files, Drizzle ORM schema, and schema documentation
4. Domain name transfer authorisation codes
5. Access credentials for all third-party service accounts (Stripe, Brevo, AI API, Google reCAPTCHA, TikTok Pixel, S3 backup, hosting)
6. Original design asset files (Figma, SVG, PNG formats)
7. Written confirmation of deletion of Seller's retained copies

---

## 4. Transition Support

### 4.1 Included Support

The Seller shall provide transition support for **30 (thirty) calendar days** from the date of asset delivery, including:

- Up to **10 (ten) hours** of technical consultation (video call or asynchronous)
- Assistance with initial deployment and environment setup (Docker, Traefik, environment variables, database provisioning)
- Answers to questions regarding AI orchestrator configuration, admin console, Brevo newsletter system, TikTok Pixel configuration, Stripe webhook registration, and codebase structure

### 4.2 Extended Support

Additional transition support may be arranged by separate agreement at the Seller's standard consulting rate.

---

## 5. Representations and Warranties

### 5.1 Seller Representations

The Seller represents and warrants that:

a) The Seller has full legal authority to sell the Assets;

b) The Assets are free and clear of all liens, encumbrances, and third-party claims;

c) The source code does not knowingly infringe any third-party intellectual property;

d) The Platform does not contain any intentional backdoors, malware, or undisclosed security defects;

e) All third-party libraries and components used in the Platform are used in compliance with their respective open-source or commercial licences;

f) The Platform has been developed with GDPR compliance in mind, including lawful basis documentation for all data processing activities, data minimisation principles, right to erasure implementation (account deletion removes all user data within 30 days), GDPR-compliant newsletter consent recording (timestamp and source), and appropriate disclosure of third-party processors (Stripe, Brevo, Google reCAPTCHA, TikTok Pixel) in the platform privacy policy;

g) The TikTok Pixel integration requires explicit user consent prior to activation and does not fire tracking events for non-consenting users;

h) The Seller has not entered into any agreement that would conflict with this Transaction.

### 5.2 Buyer Representations

The Buyer represents and warrants that:

a) The Buyer has full legal authority to enter into this Agreement;

b) The Buyer has conducted its own due diligence and is purchasing the Assets based on its own assessment;

c) The Buyer will comply with all applicable laws in its operation of the Platform, including GDPR, the EU AI Act, applicable consumer protection laws, and the terms of service of all third-party integrations (Stripe, Brevo, TikTok, Google).

### 5.3 GDPR Data Transfer

Upon transfer of any user data included in the Assets, the Buyer becomes the data controller for all such data. The Buyer acknowledges and agrees to assume full responsibility for GDPR compliance from the Effective Date, including notification obligations to data subjects where required by law.

---

## 6. Limitations and Disclaimers

### 6.1 "As-Is" Basis

Except for the representations in Section 5.1, the Assets are sold "as is." The Seller makes no representations or warranties regarding future revenue, user growth, AI model performance, third-party API pricing, or market conditions.

### 6.2 Financial Projections

All revenue projections, market analyses, and valuation estimates included in the Acquisition Portal are forward-looking statements based on assumptions. Actual results may differ materially. The Buyer acknowledges that such projections are not guarantees.

### 6.3 Third-Party API Dependency

The Platform's AI features rely on third-party AI APIs (configurable at runtime: OpenAI, Google Gemini, or any OpenAI-compatible endpoint). The Seller makes no representations regarding the continued availability, pricing, or terms of service of any third-party AI provider.

### 6.4 Limitation of Liability

The Seller's total liability to the Buyer under this Agreement shall not exceed the Purchase Price. Neither party shall be liable for indirect, consequential, or incidental damages.

---

## 7. Post-Sale Obligations

### 7.1 Seller Post-Sale

The Seller agrees to:

a) Permanently delete all copies of the source code and proprietary data within 14 days of transfer;

b) Not operate any competing platform under the "NutriAID" brand;

c) Maintain confidentiality of Buyer's identity and transaction terms for 12 months.

### 7.2 Non-Compete

The Seller agrees not to develop, operate, or invest in a substantially similar AI-powered nutrition intolerance management platform targeting the same geographic market for a period of **24 (twenty-four) months** from the Effective Date.

---

## 8. Dispute Resolution

### 8.1 Negotiation

The Parties shall first attempt to resolve any dispute through good-faith negotiation for a period of 30 days.

### 8.2 Governing Law and Jurisdiction

This Agreement shall be governed by the laws of Romania. Any unresolved dispute shall be submitted to the exclusive jurisdiction of the courts of Bucharest, Romania.

---

## 9. Entire Agreement

This Agreement, together with the NDA, IP Transfer Agreement, and any schedules attached hereto, constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, and agreements.

---

## Signatures

**Seller:**

Signature: ________________________  
Name: ____________________________  
Title: _____________________________  
Date: _____________________________

**Buyer:**

Signature: ________________________  
Name: ____________________________  
Title: _____________________________  
Date: _____________________________

---

*NutriAID Acquisition Portal — Legal Pack — June 2026*  
*This document is a reference template. Consult qualified legal counsel before execution.*
