# NutriAID — Business Report
### Raport business complet pentru cumpărători și investitori

---

## 1. Analiza Pieței

### Piața globală de aplicații de nutriție și wellness

| Metric | Valoare | Sursa estimată |
|---|---|---|
| Piața globală apps nutriție 2023 | $8.5 miliarde | Grand View Research |
| CAGR proiectat 2024–2030 | 21.1% | Același studiu |
| Piața globală wellness digital 2025 | $65 miliarde | Global Wellness Institute |
| Utilizatori apps de sănătate Europa | 200+ milioane | Statista |
| Creștere interes intoleranțe alimentare | +340% în 10 ani | Google Trends |

### Piața intoleranțelor alimentare — contextul specific NutriAID

- **1 din 4 europeni** raportează intoleranță alimentară (studii EAACI)
- **Diagnosticul medical clasic** pentru o intoleranță: 300–1.500 € (alergolog, endoscopie, teste sânge)
- **Dietetician specializat:** 50–150 €/sesiune, 6–12 sesiuni recomandate = 300–1.800 €
- **NutriAID Pro+:** 35.99 €/lună = ~430 €/an — economie de 70–80% față de alternativele clasice

### Piața românească

- Populație: 19.2 milioane, din care ~10 milioane activi online
- Penetrare smartphone: 72%
- Creștere apps wellness în Romania: +23% YoY (2022–2024)
- Putere de cumpărare: salariu mediu net ~900 €/lună, abonament Pro la 14.99 € = 1.6% din venit (accesibil)
- Concurenți locali relevanți: 0 (piață neservită pentru intoleranțe alimentare AI-powered)

---

## 2. Publicul Țintă

### Segmente primare

**Segmentul A — Pacienți cu simptome nediagnosticate (cel mai mare)**
- Vârstă: 25–55 ani
- Profil: persoane cu balonare cronică, oboseală, probleme digestive fără diagnostic clar
- Comportament: caută soluții online, au încercat eliminare alimentară empirică
- WTP (willingness to pay): 10–40 €/lună
- Dimensiune estimată (RO): 500.000+ persoane

**Segmentul B — Persoane cu intoleranțe diagnosticate**
- Vârstă: toate vârstele
- Profil: lactoză, gluten, FODMAP — caută ghidaj zilnic pentru dieta
- Comportament: utilizatori frecvenți de apps nutrition, dispuși să plătească pentru calitate
- WTP: 15–50 €/lună
- Dimensiune estimată (RO): 2 milioane persoane

**Segmentul C — Sportiți și bio-hackeri**
- Vârstă: 20–45 ani
- Profil: optimizare performanță prin nutriție
- Comportament: folosesc multiple apps, sunt early adopters, recomandă activ
- WTP: 30–60 €/lună
- Dimensiune estimată (RO): 200.000 persoane

**Segmentul D — Medici și nutriționiști (B2B)**
- Profil: vor să ofere pacienților un tool de monitorizare între consultații
- Model: licență per clinică sau per pacient
- WTP: 99–299 €/lună per cabinet
- Dimensiune estimată: 5.000+ cabinete nutriție în Romania

---

## 3. Poziționare

### Positioning statement

*"Pentru persoanele cu intoleranțe alimentare nediagnosticate sau greu de gestionat, NutriAID este singura platformă SaaS care combină un jurnal zilnic inteligent cu un orchestrator AI specializat, oferind recomandări personalizate validate medical — la un cost de 10× mai mic decât un dietetician tradițional."*

### Piramida de valoare

```
Nivel 4: Transformare (beneficiu ultim)
"Mă simt bine în fiecare zi"

Nivel 3: Beneficii funcționale
"Știu exact ce alimente îmi cauzează simptome"

Nivel 2: Caracteristici
"Jurnal zilnic + AI care corelează date"

Nivel 1: Atribute
"App web, AI, 3 planuri, bilingv"
```

### Mesaje cheie per segment

| Segment | Mesaj principal | CTA |
|---|---|---|
| Pacienți nediagnosticate | "Găsește ce te face rău — fără teste costisitoare" | Start trial gratuit |
| Intoleranțe diagnosticate | "Ghidaj zilnic care respectă intoleranțele tale" | Încearcă 7 zile gratis |
| Sportiți | "Optimizează nutriția cu date reale, nu ghiceli" | Pro+ — cel mai avansat |
| B2B / Clinici | "Monitorizare pacienți între consultații" | Contactați-ne |

---

## 4. Avantaj Competitiv

### Comparație cu alternativele principale

| Alternativă | Problemă | NutriAID rezolvă |
|---|---|---|
| Alergolog/dietetician | Scump (300–1.800 €), accesibil rar | Ghidaj zilnic la 10–36 €/lună |
| MyFitnessPal / Cronometer | Tracking calorii, nu intoleranțe | Focus exact pe simptome și corelații |
| Cara Care / Zemedy | Specific IBS/FODMAP, niche | Acoperă 12 tipuri de intoleranțe |
| Google / ChatGPT | Răspunsuri generice, date personale nu | Contextualizat cu datele tale reale |
| Eleminare empirică | Lent (3-12 luni), imprecis | Corelații în 2-4 săptămâni de date |

### Bariere la intrare (moat)

1. **Date acumulate per utilizator** — cu cât folosești mai mult, cu atât recomandările sunt mai precise. Utilizatorii nu pleacă ușor.
2. **Orchestrator AI proprietar** — nu există pe piață un produs similar cu validare semantică + auto-corecție în română
3. **Complexitate tehnică** — 1.350 ore estimat rebuild; barieră mare pentru competitori
4. **Brand + comunitate** — primii utilizatori devin ambasadori în communities wellness RO

---

## 5. Costuri Lunare de Operare

### Configurație starter (0–500 utilizatori)

| Cost | Sumă lunară |
|---|---|
| VPS 2 vCPU / 4 GB RAM (Hetzner CX22) | €5–10 |
| PostgreSQL (self-hosted pe același VPS) | €0 |
| Email SMTP (self-hosted sau Brevo free) | €0–10 |
| AI API (OpenAI, 500 utilizatori × 5 req/lună × $0.06) | €150 |
| Backup (Hetzner Object Storage 10 GB) | €3 |
| Domenii + SSL (Let's Encrypt) | €1 |
| **TOTAL** | **€159–174/lună** |

### Configurație growth (500–2.000 utilizatori)

| Cost | Sumă lunară |
|---|---|
| VPS 4 vCPU / 8 GB RAM (Hetzner CX32) | €20–30 |
| PostgreSQL managed (Supabase/Neon) | €25 |
| Email (Brevo sau Amazon SES) | €10–20 |
| AI API (2000 utilizatori × 5 req × $0.03 avg) | €300 |
| CDN (opțional Cloudflare) | €0 (free tier) |
| Monitoring (Uptime Robot) | €0–7 |
| **TOTAL** | **€355–382/lună** |

### Break-even rapid

La prețul Pro (€14.99/lună), break-even la configurație starter:
- `€174 ÷ €14.99 = 12 utilizatori plătitori` pentru a acoperi hosting+AI

---

## 6. Modele de Monetizare

### Model 1: SaaS Direct (actual)

3 planuri recurente:
- **Basic** — €9.99/lună → acoperă utilizatorii casual
- **Pro** — €14.99/lună → segmentul principal, cel mai recomandat
- **Pro+** — €35.99/lună → power users, sportiți, utilizatori serioși

**Trial:** 7 zile Pro+ gratuit, fără card → conversie mai ușoară.

**Proiecție conservatoare la 1.000 utilizatori plătitori (mix 40/40/20):**
```
400 × Basic  €9.99  = €3.996
400 × Pro    €14.99 = €5.996
200 × Pro+   €35.99 = €7.198
─────────────────────────────
MRR total              €17.190
Costuri lunare         €-380
─────────────────────────────
Profit brut            €16.810/lună = €201.720/an
```

### Model 2: White-Label pentru clinici

Vinde platforma ca white-label sub brandul clinicii:
- Licență setup: €2.000–5.000 one-time
- Licență lunară: €200–500/lună per clinică
- 20 clinici × €300/lună = €6.000 MRR suplimentar

### Model 3: Licență B2B per pacient

Clinica plătește per pacient activ:
- €5/pacient/lună
- Clinică cu 200 pacienți activi = €1.000/lună
- Scalabil: clinica câștigă prin consultații, NutriAID prin licențe

### Model 4: Data Analytics (viitor)

Datele anonimizate + agregate despre corelații aliment-simptome sunt valoroase pentru:
- Industria alimentară (reformulare produse)
- Farmaceutice (studii intoleranțe)
- Asigurări de sănătate (profilare risc)

*Necesită GDPR consent explicit suplimentar și model comercial separat.*

### Model 5: Premium Features add-on

Funcționalități premium la plată extra:
- Consultare video cu dietetician partenere: €30–80/sesiune
- Raport medical PDF pentru medic: €5 per export
- AI coaching personalizat: €15/lună suplimentar

---

## 7. Potențial de Scalare

### Scalare geografică
- **Faza 1 (0–6 luni):** România — piață primară, deja implementat în română
- **Faza 2 (6–18 luni):** Europa de Est (Bulgaria, Polonia, Ungaria) — locale adăugate, landing pages traduse
- **Faza 3 (18+ luni):** Europa de Vest + UK — EN complet implementat, marketing PPC în EN
- **Piața EN potențială:** 300 milioane utilizatori potențiali

### Scalare produs
- Adăugare app mobile nativ (React Native) — codebase-ul Next.js e compatibil
- Integrare wearables (Garmin, Apple Watch) pentru date activitate fizică automată
- AI coaching conversațional (chat real-time vs. cereri punctuale)
- Integrare cu supermarketuri (scanare cod de bare → alertă intoleranțe)
- Marketplace de rețete validate per profil de utilizator

### Scalare B2B
- Dashboard multi-pacient pentru nutriționiști
- Integrare EMR (Electronic Medical Records)
- API public pentru integrare în alte platforme de sănătate

---

## 8. Potențial White-Label

Platforma este 100% rebrandabilă fără modificări structurale:

**Ce se schimbă pentru white-label:**
- Logo, culori, fonturi (Tailwind config — 30 minute)
- Domeniu și email (variabile de mediu — 5 minute)
- Texte landing page și emails (fișiere i18n — câteva ore)
- Prețuri și planuri (admin console — 5 minute)

**Ce nu se schimbă:**
- Orchestrator AI — rămâne intact
- Baza de date — rămâne PostgreSQL
- Billing Stripe — se reconectează la cont Stripe al clientului

**Model de revenue white-label pentru noul proprietar:**
- Vinde licență white-label la €15.000–30.000 one-time
- Plus royalties: 15–20% din MRR al licensiatorului
- 5 clienți white-label = €75.000–150.000 one-time + €3.000–6.000/lună recurent

---

*Document generat: Iunie 2026 | NutriAID Platform v1.0 — prod branch*
