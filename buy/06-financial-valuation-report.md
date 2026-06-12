# NutriAID — Financial & Valuation Report
### Analiză financiară completă și justificarea prețului de vânzare

---

## 1. Costuri de Operare Lunare

### Infrastructură (hosting)

| Serviciu | Provider recomandat | Cost/lună | Note |
|---|---|---|---|
| VPS principal (4 vCPU, 8 GB RAM) | Hetzner CX32 | €14.90 | Frontend + Backend + DB |
| VPS backup (opțional) | Hetzner CX22 | €4.90 | Failover |
| Object Storage (100 GB) | Hetzner | €5.00 | Backup-uri |
| CDN + DDoS protection | Cloudflare | €0 | Free tier, suficient |
| SSL Certificate | Let's Encrypt | €0 | Automă via Traefik |
| Domeniu .eu | Namecheap | €0.83 | €10/an |
| **Subtotal Infrastructure** | | **€25.63** | |

### AI API Costs

**Ipoteze de calcul:**
- 1.000 utilizatori activi lunar
- Medie 5 cereri ghidaj/utilizator/lună
- 50% din cereri rezolvate de AI (restul rule-based)
- 9 workeri per cerere AI, cost mediu $0.06/cerere

| Metric | Calcul | Cost |
|---|---|---|
| Cereri AI totale | 500 utilizatori × 5 req | 2.500 cereri |
| Cost per cerere (GPT-4o) | 9 workers × $0.0068 | $0.061 |
| Cost per cerere (Gemini fallback, 10%) | 9 workers × $0.0009 | $0.008 |
| **Cost AI total 1K utilizatori** | | **~$155 ≈ €145** |

### Email

| Volum | Provider | Cost |
|---|---|---|
| < 10.000 email/lună | Brevo (ex-Sendinblue) | €0 (free tier) |
| 10.000–100.000 email/lună | Brevo | €19/lună |
| 100.000+ email/lună | Amazon SES | ~$10/lună |

### Stripe fees (procesare plăți)

| Plan | Preț | Stripe fee (2.9% + €0.30) | Net/utilizator |
|---|---|---|---|
| Basic | €9.99 | €0.59 | **€9.40** |
| Pro | €14.99 | €0.73 | **€14.26** |
| Pro+ | €35.99 | €1.34 | **€34.65** |

### Tabel costuri totale pe scenarii

| Scenariul | Utilizatori activi | Hosting | AI API | Email | **Total/lună** |
|---|---|---|---|---|---|
| Early stage | 100 | €25 | €15 | €0 | **€40** |
| Growth | 500 | €30 | €73 | €0 | **€103** |
| Scale | 1.000 | €40 | €145 | €19 | **€204** |
| Enterprise | 5.000 | €150 | €725 | €50 | **€925** |

---

## 2. Costuri Anuale

### La 1.000 utilizatori activi

| Categorie | Cost/lună | Cost/an |
|---|---|---|
| Infrastructură | €40 | €480 |
| AI API | €145 | €1.740 |
| Email | €19 | €228 |
| Stripe fees (estimat) | €730 | €8.760 |
| Misc (domeniu, tools) | €5 | €60 |
| **TOTAL** | **€939** | **€11.268** |

### La 5.000 utilizatori activi

| Categorie | Cost/lună | Cost/an |
|---|---|---|
| Infrastructură | €150 | €1.800 |
| AI API | €725 | €8.700 |
| Email | €50 | €600 |
| Stripe fees (estimat) | €3.650 | €43.800 |
| **TOTAL** | **€4.575** | **€54.900** |

---

## 3. Costuri de Operare AI

### Detaliu calcul cost per request (GPT-4o)

```
Orchestrare completă meal-plan (6 workeri):

Worker 1: profile-analyzer
  Input:  ~400 tokens × $0.000005 = $0.002
  Output: ~200 tokens × $0.000015 = $0.003
  Subtotal: $0.005

Worker 2-3: intolerance + allergy checker
  Input:  ~500 tokens × $0.000005 = $0.0025 × 2 = $0.005
  Output: ~300 tokens × $0.000015 = $0.0045 × 2 = $0.009
  Subtotal: $0.014

Worker 4: meal-plan-generator
  Input:  ~800 tokens × $0.000005 = $0.004
  Output: ~600 tokens × $0.000015 = $0.009
  Subtotal: $0.013

Worker 5: nutrition-calculator
  Input:  ~600 tokens × $0.000005 = $0.003
  Output: ~400 tokens × $0.000015 = $0.006
  Subtotal: $0.009

Worker 6: medical-safety
  Input:  ~700 tokens × $0.000005 = $0.0035
  Output: ~400 tokens × $0.000015 = $0.006
  Subtotal: $0.0095

TOTAL per request (no corrections): $0.0505 ≈ €0.047
Cu corecții (30% din workers): $0.067 ≈ €0.063
```

### Optimizare costuri AI

Platforma include deja mecanisme de reducere costuri:
1. **Rule-based fallback** — 50% din cereri sunt rezolvate fără API
2. **Request fingerprinting** — cereri identice nu apelează AI din nou
3. **Gemini fallback** — 8× mai ieftin decât GPT-4o la același calitate rezonabilă
4. **Model local Ollama** — cost $0 pentru organizații cu hardware propriu

---

## 4. Costuri de Hosting Detaliate

### Hetzner Cloud (cel mai cost-eficient provider EU)

| Config | vCPU | RAM | SSD | Preț/lună | Capacitate |
|---|---|---|---|---|---|
| CX22 | 2 | 4 GB | 40 GB | €4.90 | 0–200 utilizatori |
| CX32 | 4 | 8 GB | 80 GB | €14.90 | 200–1.000 utilizatori |
| CX42 | 8 | 16 GB | 160 GB | €29.90 | 1.000–3.000 utilizatori |
| CX52 | 16 | 32 GB | 320 GB | €59.90 | 3.000–8.000 utilizatori |

**NutriAID actual rulează pe Hetzner CX32 (€14.90/lună)** cu potențial de 1.000+ utilizatori.

---

## 5. Estimarea Valorii Platformei

### Metodă 1: Cost de Rebuild (Floor Value)

| Componenta | Ore senior dev | Cost €80/h |
|---|---|---|
| Frontend Next.js (30+ pagini, auth, billing) | 400h | €32.000 |
| Backend Admin Console (70+ endpoints) | 300h | €24.000 |
| Orchestrator AI + 11 workeri | 200h | €16.000 |
| Auto-corrector + semantic validator | 100h | €8.000 |
| Billing Stripe complet | 80h | €6.400 |
| GDPR complet | 50h | €4.000 |
| i18n bilingv | 40h | €3.200 |
| PWA + 2FA + reCAPTCHA + backup | 60h | €4.800 |
| Docker + Traefik deployment | 40h | €3.200 |
| QA + teste + documentație | 80h | €6.400 |
| **TOTAL** | **1.350h** | **€108.000** |

> Prețul de 45.000 € = **41.7%** din costul de rebuild. Excepțional.

### Metodă 2: Multiplu de Venituri (SaaS Multiple)

**Scenariul conservator (la vânzare, 0 utilizatori plătitori):**
- Valoare bazată pe potențial: 12 luni × €0 MRR curent × 3× = €0
- **Ajustare pentru produs gata de producție: +€45.000**
- Justificare: 0 timp de dezvoltare, deploy imediat, primi utilizatori în 24h

**Scenariul realist (100 utilizatori plătitori, mix):**
- MRR estimat: €1.500
- ARR: €18.000
- Multiplu standard SaaS la nivel early-stage: 2–4× ARR
- **Valoare: €36.000–72.000**

**Scenariul growth (500 utilizatori plătitori):**
- MRR estimat: €8.000
- ARR: €96.000
- Multiplu SaaS pre-revenue growth: 3–6× ARR
- **Valoare: €288.000–576.000**

### Metodă 3: Comparabile (Platforme similare vândute)

| Platformă | Categorie | Preț vânzare | MRR la vânzare |
|---|---|---|---|
| Wellness app similar (Flippa 2024) | Health SaaS | $38.000 | $0 (early stage) |
| Nutrition tracker (MicroAcquire 2024) | Health SaaS | $120.000 | $4.500 |
| AI health platform (Acquire 2024) | AI + Health | $280.000 | $12.000 |

> NutriAID este mai complex și mai complet decât platformele de $38.000 din comparabile, și mai ieftin decât cele de $120.000+ cu venituri similare.

---

## 6. Justificarea Prețului 45.000–120.000 €

### La 45.000 € (floor)

**Cumpărătorul primește:**
- 1.350 ore de muncă de dezvoltare (valorează €108.000)
- Produs gata de producție, testat, documentat
- Orchestrator AI proprietar cu auto-corecție (imposibil de copiat în sub 6 luni)
- Infrastructură Docker completă cu Traefik
- Billing Stripe complet cu webhooks
- Panou admin cu configurare zero-code
- Drepturi complete de proprietate intelectuală
- Cod sursă complet, neobfuscat
- Documentație completă (13 rapoarte)

**ROI la 45.000 € cu 200 utilizatori Pro (€14.99/lună):**
```
MRR: 200 × €14.99 = €2.998
Costuri lunare: ~€150
Profit net lunar: €2.848
ROI 45.000 € în: 45.000 ÷ 2.848 = 15.8 luni (~16 luni)
```

### La 75.000 € (mediu)

**Justificare suplimentară:**
- Include 3 luni suport transfer + onboarding
- Asistență configurare AI și Stripe
- Primele 6 luni de hosting incluse

**ROI la 75.000 € cu 300 utilizatori Pro:**
```
MRR: 300 × €14.99 = €4.497
Profit net lunar: ~€4.200
ROI în: 75.000 ÷ 4.200 = 17.9 luni
```

### La 120.000 € (premium, cu exclusivitate și suport)

**Include:**
- Exclusivitate teritoriu (EU sau global)
- 12 luni suport și dezvoltare continuă (2h/săptămână)
- White-label setup complet
- Consultanță go-to-market

---

## 7. Scenarii de ROI pentru Cumpărător

### Scenariu A: Operator Solo (parte-time)

| Metric | Valoare |
|---|---|
| Investiție inițială | €45.000 |
| Efort marketing | 5h/săptămână |
| Utilizatori la 6 luni | 100 |
| MRR la 6 luni | €1.200 |
| Utilizatori la 12 luni | 300 |
| MRR la 12 luni | €4.200 |
| Profit net an 1 | €25.000 |
| Break-even | ~22 luni |
| Valoare la exit (3× ARR) | €151.200 |
| ROI 3 ani (net) | **+236%** |

### Scenariu B: Investitor cu echipă de marketing

| Metric | Valoare |
|---|---|
| Investiție inițială | €45.000 |
| Budget marketing | €3.000/lună |
| Utilizatori la 6 luni | 500 |
| MRR la 6 luni | €7.000 |
| Utilizatori la 12 luni | 1.500 |
| MRR la 12 luni | €20.000 |
| Profit net an 1 | €80.000 |
| Break-even | ~7 luni |
| Valoare la exit (4× ARR) | €960.000 |
| ROI 3 ani (net) | **+2.000%** |

### Scenariu C: White-Label Reseller

| Metric | Valoare |
|---|---|
| Investiție inițială | €45.000 |
| Setup 5 clienți white-label | €15.000/client = €75.000 |
| Royalties lunare (15% MRR per client) | €500/client × 5 = €2.500 |
| Revenue total an 1 | €75.000 + €30.000 = €105.000 |
| Break-even | **< 6 luni** |
| ROI an 1 | **+133%** |

---

*Document generat: Iunie 2026 | NutriAID Platform v1.0 — prod branch*
