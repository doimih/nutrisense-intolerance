# NutriAID — Growth Strategy Report
### Plan complet de creștere, marketing, scalare și extindere

---

## 1. Plan de Creștere (12 luni)

### Faza 0: Pre-launch (Luna 0–1)

**Obiective:**
- Setup complet al platformei pe domeniu propriu
- Configurare Stripe cu planuri reale
- Configurare email profesional (SPF/DKIM)
- Creare conturi sociale (Instagram, TikTok, Facebook)
- Identificare primii 50 utilizatori beta (grupuri wellness RO)

**Costuri:**
- Hosting + domeniu: €30/lună
- Design logo (dacă re-branding): €200–500 one-time
- TOTAL: €230–530 one-time + €30/lună

### Faza 1: Traction (Luna 1–3)

**Obiective:** 0 → 200 utilizatori înregistrați, 50 plătitori

**Canale:**
1. **Grupuri Facebook relevante** (gratuit)
   - Intoleranță la lactoză Romania (18k membri)
   - Boala Celiacă Romania (12k membri)
   - IBS Romania (8k membri)
   - Nutriție și sănătate Romania (45k membri)
   - Post organic: „Am construit o platformă care..."

2. **Reddit /r/Romania + /r/Sanatate** (gratuit)
   - Story post: „Am avut IBS 5 ani, am construit asta"
   - Nu spam, interacțiune autentică

3. **TikTok/Instagram Reels** (organic, 2h/săptămână)
   - Format: „Balonare după brânză? Uite ce am aflat cu NutriAID"
   - Demo rapid al jurnalului și recomandărilor AI

4. **Product Hunt launch** (gratuit, un eveniment)
   - Landing page EN complet
   - Story autentică

**KPIs:** 200 înregistrați, 50 plătitori, MRR €600

### Faza 2: Scale (Luna 3–6)

**Obiective:** 200 → 800 utilizatori, 250 plătitori

**Canale:**
1. **Google Ads** (€500/lună)
   - Keywords: "intoleranță lactoză jurnal", "ce alimente evit gluten", "jurnal simptome digestive"
   - CPC estimat: €0.30–0.80
   - Cost per achiziție estimat: €15–40

2. **Parteneriate influenceri micro** (€100–300 per post)
   - Influenceri wellness RO cu 5k–50k urmăritori (cost mic, engagement ridicat)
   - Suplimentare: cod promoțional -20% primul an

3. **SEO** (cost timp, zero bani)
   - Articole Knowledge Hub: „Ce este intoleranța la histamina"
   - Target: 10 articole optimizate cu volume 500–2.000 căutări/lună

4. **Email marketing trial → paid** (€10/lună Brevo)
   - Secvență 5 emailuri în 7 zile trial:
     - Ziua 1: Welcome + cum să începi
     - Ziua 3: „Ai adăugat primele mese. Iată ce înseamnă datele"
     - Ziua 5: „Ai nevoie de mai mult timp? Iată ce observi la Pro+"
     - Ziua 7: „Trial-ul expiră azi. Continuă cu 33% discount"

**KPIs:** 800 înregistrați, 250 plătitori, MRR €3.500

### Faza 3: Growth (Luna 6–12)

**Obiective:** 800 → 2.000 utilizatori, 600 plătitori

**Canale:**
1. **Google Ads** (€1.500/lună)
   - Extindere la EN pentru piețe Balcani + Central EU
   - Retargeting visitatori site

2. **Parteneriate B2B** — primele clinici
   - Contactare 20 clinici nutriție din RO
   - Propunere: dashboard profesionist per pacient, €99/lună per cabinet
   - Obiectiv: 5 clinici = €495/lună MRR suplimentar

3. **Affiliate program**
   - Comision: 20% din primul an abonament per referral
   - 100 afiliați × 2 referraluri/lună = 200 utilizatori noi/lună

4. **PR media**
   - Articole în Libertatea, G4Media, Totul despre mame
   - Story: „Startup românesc care ajută cu intoleranțele alimentare prin AI"

**KPIs:** 2.000 înregistrați, 600 plătitori, MRR €8.000+

---

## 2. Plan de Marketing

### Positioning și messaging

**Tagline principal:** *"Descoperă ce te face rău. Fiecare zi contează."*

**Tagline EN:** *"Find out what's hurting you. Every meal matters."*

**Mesaje cheie per canal:**
- **Social organic:** Empatie + story personală + soluție concretă
- **Paid ads:** Problemă (simptome) → Soluție (NutriAID) → CTA (trial gratuit)
- **SEO:** Educație + autoritate + intent transacțional
- **B2B:** ROI clinic + eficiență timp + diferențiator față de alte cabinete

### Funnel de achiziție

```
AWARENESS
(Social, SEO, PR, Word of mouth)
          │
          ▼
CONSIDERATION
(Landing page, Demo, Knowledge Hub)
          │
          ▼
TRIAL (7 zile Pro+ gratuit)
          │
          ├─ Email sequence (5 emailuri)
          │
          ▼
PAID SUBSCRIPTION
          │
          ├─ Onboarding în-app
          │
          ▼
RETENTION
(Weekly digest, milestones, feature updates)
          │
          ▼
ADVOCACY
(Referrals, testimoniale, reviews)
```

### Buget marketing lunar recomandat

| Canal | Faza 1 (1-3 luni) | Faza 2 (3-6 luni) | Faza 3 (6-12 luni) |
|---|---|---|---|
| Google Ads | €0 | €500 | €1.500 |
| Social Media Ads | €0 | €200 | €500 |
| Influenceri | €0 | €200 | €300 |
| Email platform | €0 | €10 | €19 |
| Conținut/SEO (timp) | Propriu | Propriu | €200 |
| **Total** | **€0** | **€910** | **€2.519** |

---

## 3. Plan de Scalare Tehnică

### Scalare verticală (0–3.000 utilizatori)

Simplu și ieftin: upgrade server Hetzner.

```
Utilizatori    Server          Cost/lună
0–500          CX22 (2/4GB)    €5
500–1.500      CX32 (4/8GB)    €15
1.500–3.000    CX42 (8/16GB)   €30
```

Zero modificări de cod necesare.

### Scalare orizontală (3.000–15.000 utilizatori)

**Milestone 1: Managed PostgreSQL**
- Neon.tech free tier → pro ($19/lună) sau Supabase Pro ($25/lună)
- Modificare: schimbare `DATABASE_URL` în `.env`
- Timp: 30 minute

**Milestone 2: Multiple frontend instances**
- Adăugare load balancer Traefik (deja instalat)
- Deploy 2–3 containere frontend identice
- Sessions JWT sunt stateless → compatibil imediat

**Milestone 3: Backend AI distribuire**
- Migrare JSON store la PostgreSQL tabel (~1 săptămână dev)
- Deploy 2+ instanțe backend
- Redis pentru rate limiting distribuită (~1 zi dev)

### Scalare AI cost

```
0–1.000 utilizatori:   GPT-4o primar, Gemini fallback
1.000–5.000 utilizatori: Gemini primar (8× mai ieftin), GPT-4o fallback
5.000+ utilizatori:     Hybrid: Ollama local pentru cereri simple,
                        GPT-4o doar pentru cazuri complexe
```

---

## 4. Plan de Extindere Geografică

### Faza 1: România (implementat)

- Limbă: Română (implicit)
- Plăți: Stripe EUR
- Hosting: Hetzner Germania (GDPR compliant)
- Status: **Live și funcțional**

### Faza 2: Europa de Est (Luna 6–12)

**Piețe țintă:** Bulgaria, Serbia, Moldova, Georgia

**Cerințe tehnice:**
- i18n framework deja implementat
- Adăugare limbi noi: ~1 săptămână per limbă
- Landing pages localizate: ~2–3 zile per piață
- SEO local: ~1–2 luni per piață

**Go-to-market:** Același playbook ca RO, cu influenceri locali.

### Faza 3: Europa de Vest + UK (Luna 12–24)

**Piețe țintă:** Germania, Franța, UK, Olanda

**Cerințe tehnice:**
- EN implementat complet (deja disponibil)
- Traduceri DE/FR: ~1 săptămână per limbă
- Compliance local (e.g., ICO registration UK): ~1 lună per piață

**Go-to-market:**
- Product Hunt launch (EN)
- Indie Hacker community
- Hackernews Show HN
- Google Ads EN

### Faza 4: Global (24+ luni)

- App Store / Google Play cu wrapper React Native
- Integrare HL7/FHIR pentru piata medicală US (HIPAA compliance)
- Enterprise contracts cu companii de asigurări de sănătate

---

## 5. Plan White-Label

### Model comercial white-label

**Pachet Standard (€15.000 one-time + €300/lună royalties)**
- Rebranding complet (logo, culori, domeniu)
- Setup pe serverul clientului
- Training admin console (4 ore)
- 3 luni suport tehnic inclus

**Pachet Premium (€25.000 one-time + €500/lună royalties)**
- Tot ce include Standard
- Customizare feature-uri (1 worker nou, 2 pagini custom)
- Integrare SSO (SAML/OAuth)
- SLA 99.5% cu monitoring inclus

**Pachet Enterprise (negociabil, >€50.000)**
- Licență perpetuă (fără royalties)
- Cod sursă complet inclus
- 12 luni suport și development
- White-glove deployment

### Piețe white-label potențiale

| Sector | Use case | Potențial client |
|---|---|---|
| Clinici nutriție | Dashboard pacienți + AI recomandări | Nutriwell, Dr. Max nutriție |
| Farmacii | App companion pentru produse intoleranțe | Catena, Dr. Max pharmacy |
| Asigurări sănătate | Wellness app pentru asigurați | Signal Iduna, Allianz |
| Corporații | Employee wellness program | Companii 200+ angajați |
| Spitale private | Monitorizare nutrițională pacienți | Regina Maria, Medicover |

### Procesul de vânzare white-label

```
1. Demo personalizat (30 minute)
   │
   ▼
2. Propunere comercială (48 ore)
   │
   ▼
3. POC/Pilot 30 zile (opțional, €2.000)
   │
   ▼
4. Contract + NDA
   │
   ▼
5. Setup și configurare (1–2 săptămâni)
   │
   ▼
6. Training echipă client (1 zi)
   │
   ▼
7. Go-live + suport
```

---

## 6. Metrici de Succes

### Metrici B2C

| Metric | Luna 3 | Luna 6 | Luna 12 |
|---|---|---|---|
| Utilizatori înregistrați | 300 | 800 | 2.500 |
| Utilizatori plătitori | 80 | 250 | 700 |
| MRR | €1.200 | €3.500 | €10.000 |
| Trial → Paid conversion | 5% | 8% | 12% |
| Monthly churn | <10% | <8% | <5% |
| CAC (cost achiziție) | €20 | €15 | €12 |
| LTV (lifetime value) | €90 | €120 | €150 |

### Metrici B2B/White-label

| Metric | Luna 6 | Luna 12 | Luna 24 |
|---|---|---|---|
| Clinici partenere | 2 | 10 | 30 |
| Licențe white-label | 0 | 1 | 5 |
| MRR B2B | €200 | €1.500 | €10.000 |

---

*Document generat: Iunie 2026 | NutriAID Platform v1.0 — prod branch*
