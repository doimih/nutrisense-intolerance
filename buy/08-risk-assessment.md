# NutriAID — Risk Assessment Report
### Evaluarea riscurilor și măsuri de atenuare

---

## Sumarul riscurilor

| Categorie | Nivel risc | Probabilitate | Impact | Mitigat |
|---|---|---|---|---|
| Riscuri tehnice | Mediu | Scăzut | Mediu | ✅ Parțial |
| Riscuri operaționale | Scăzut | Scăzut | Scăzut | ✅ Da |
| Riscuri de scalare | Scăzut | Mediu | Mediu | ✅ Da |
| Riscuri de mentenanță | Scăzut | Mediu | Mediu | ✅ Parțial |
| Riscuri legale/GDPR | Scăzut | Scăzut | Ridicat | ✅ Da |
| Riscuri de piață | Mediu | Mediu | Ridicat | Parțial |

---

## 1. Riscuri Tehnice

### R1.1 — Dependența de API-uri AI externe (MEDIU)

**Risc:** OpenAI sau Google Gemini pot deveni indisponibile, crește prețurile sau modifica termenii de utilizare.

**Probabilitate:** Scăzută pentru down total, medie pentru creștere prețuri.

**Impact:** Serviciul AI indisponibil sau mai scump.

**Mitigare implementată:**
- ✅ Fallback automat la Gemini când GPT-4o eșuează (în cod, fără intervenție umană)
- ✅ Fallback la rule-based engine (cost $0) când ambele API-uri eșuează
- ✅ Suport pentru modele locale (Ollama) — cost $0, zero dependență externă
- ✅ Suport pentru orice provider OpenAI-compatible (Anthropic, Mistral, etc.)
- ✅ Modelul configurabil din admin fără restart

**Risc rezidual:** Creștere prețuri AI → cost operational mai mare. Atenuare: trecere pe Gemini sau local.

---

### R1.2 — Vulnerabilități de securitate (SCĂZUT-MEDIU)

**Risc:** Vulnerabilități în Next.js, Stripe SDK, sau implementarea auth custom.

**Probabilitate:** Scăzută cu update-uri regulate.

**Mitigare implementată:**
- ✅ Parole hash cu scrypt (algoritm modern, recomandat OWASP)
- ✅ JWT semnat HMAC-SHA256, fără stocare server-side
- ✅ HttpOnly + Secure + SameSite=Strict cookies
- ✅ Rate limiting pe toate endpoint-urile de auth
- ✅ Stripe webhooks verificate HMAC înainte de procesare
- ✅ CSP headers, X-Frame-Options, HSTS
- ✅ Separare completă frontend/backend (surface de atac redusă)
- ✅ TOTP 2FA opțional pentru admin

**Acțiuni recomandate post-achiziție:**
- Rulare audit de securitate (Snyk sau similar)
- Setup dependabot pentru update-uri automate
- Penetration test anuală

---

### R1.3 — Pierdere date (SCĂZUT)

**Risc:** Ștergere accidentală PostgreSQL sau fișier `superadmin-db.json`.

**Probabilitate:** Scăzută cu backup activ.

**Mitigare implementată:**
- ✅ Docker volumes separate (postgres_data, backend_data, frontend_data)
- ✅ Backup manual configurat în admin
- ✅ Backup automat S3-compatible (Hetzner Object Storage)
- ✅ Retenție configurabilă: 7/30/90 zile

**Risc rezidual:** Dacă backup S3 nu este configurat și serverul pică fizic → posibilă pierdere date. Mitigare: configurare backup S3 în primele 24h post-deploy.

---

### R1.4 — Compatibilitate viitoare Next.js (SCĂZUT)

**Risc:** Breaking changes în Next.js 15+ care afectează funcționalitățile.

**Probabilitate:** Scăzută în 12 luni (Next.js are politică de compatibilitate).

**Mitigare:** Frontend fixat la Next.js 14.2.35. Backend la 15.5.18. Update-urile sunt opționale și gestionate incremental.

---

## 2. Riscuri Operaționale

### R2.1 — Cunoaștere tehnică insuficientă a cumpărătorului (MEDIU)

**Risc:** Cumpărătorul nu are experiență cu Docker, Next.js sau PostgreSQL.

**Probabilitate:** Medie dacă cumpărătorul este non-tehnic.

**Impact:** Dificultăți la deploy și mentenanță.

**Mitigare:**
- ✅ Documentație completă de instalare (Raportul 4)
- ✅ Docker Compose simplifică deployment la 3 comenzi
- ✅ Admin console zero-code pentru toate setările operaționale
- ✅ Vendori de managed hosting (Dokploy, Railway, Render) pot gestiona deployment
- **Recomandat:** Include 1–3 luni suport tehnic în prețul de vânzare

---

### R2.2 — Email deliverability (SCĂZUT)

**Risc:** Emailurile de verificare sau resetare parolă ajung în spam.

**Probabilitate:** Medie fără configurare SPF/DKIM.

**Mitigare implementată:**
- ✅ Fallback outbox (emailuri nereușite salvate în JSON)
- ✅ Admin poate retrimite emailuri din consolă
- **Acțiune recomandată:** Configurare SPF + DKIM + DMARC pe domeniu, folosire provider dedicat (Brevo, SendGrid, AWS SES)

---

### R2.3 — Stripe down sau cont suspendat (SCĂZUT)

**Risc:** Stripe devine indisponibil sau contul este suspendat.

**Probabilitate:** Foarte scăzută (Stripe SLA 99.99%).

**Mitigare:**
- ✅ Subscripțiile existente continuă (DB local are planul activ)
- ✅ Utilizatorii nu pierd acces imediat dacă Stripe are probleme
- ✅ Adminul poate modifica manual planul oricărui utilizator din consolă

---

## 3. Riscuri de Scalare

### R3.1 — Performanță la volum mare (MEDIU)

**Risc:** Platforma devine lentă la 5.000+ utilizatori simultani.

**Probabilitate:** Medie fără optimizare prealabilă.

**Mitigare implementată:**
- ✅ Next.js server-side rendering optimizat
- ✅ PostgreSQL cu connection pooling (max 10 conexiuni)
- ✅ Request fingerprinting — cereri identice nu regenerează AI
- ✅ Docker permite scalare verticală instant (upgrade VPS fără downtime cu Hetzner)

**Scalare orizontală necesită:**
- Migrare JSON store backend la PostgreSQL (~1 săptămână developer)
- Shared session storage (Redis) dacă sunt instanțe multiple frontend
- Managed PostgreSQL (Supabase/Neon) pentru izolare DB

---

### R3.2 — Costuri AI explodează la scale (MEDIU)

**Risc:** La 10.000 utilizatori, costul AI devine prohibitiv.

**Calcul:**
```
10.000 utilizatori × 5 req/lună × 50% AI × $0.06 = $1.500/lună
La MRR de $80.000+ → cost AI = 1.9% din venituri (acceptabil)
```

**Mitigare:**
- ✅ Fallback rule-based pentru 50% din cereri (cost $0)
- ✅ Gemini este de 8× mai ieftin decât GPT-4o ca fallback principal
- ✅ Caching/fingerprinting reduce apeluri duplicate
- **La scale mare:** Trecere pe model local (Ollama + H100) → cost fix, zero per-request

---

### R3.3 — PostgreSQL single point of failure (MEDIU)

**Risc:** La scalare orizontală, PostgreSQL pe un singur server devine bottleneck.

**Mitigare la momentul actual:**
- ✅ Suficient pentru 5.000+ utilizatori pe un VPS Hetzner CX52
- **La 5.000+:** Migrare la PostgreSQL managed (Supabase, Neon, AWS RDS) sau PgPool II cu read replicas
- Modificare necesară: `DATABASE_URL` în `.env` → zero cod de schimbat

---

## 4. Riscuri de Mentenanță

### R4.1 — Dependențe npm outdated (SCĂZUT-MEDIU)

**Risc:** Vulnerabilități în pachetele npm vechi.

**Mitigare:**
- ✅ TypeScript strict — orice schimbare de API detectată la compile time
- **Recomandare:** Setup Dependabot sau Renovate pentru update-uri automate cu PR review

---

### R4.2 — Breaking changes Stripe API (SCĂZUT)

**Risc:** Stripe modifică API-ul v1.

**Probabilitate:** Foarte scăzută (Stripe menține backward compatibility ani de zile).

**Mitigare:**
- ✅ SDK Stripe v22 fixat în package.json
- ✅ Zero customizări low-level — doar metode de nivel înalt (checkout, portal, webhooks)

---

### R4.3 — Schimbare model AI (SCĂZUT)

**Risc:** OpenAI retrage gpt-4o sau îi schimbă comportamentul.

**Mitigare:**
- ✅ Modelul este configurat din admin — schimbare în 30 secunde fără restart
- ✅ Orchestratorul este model-agnostic (orice provider OpenAI-compatible)
- ✅ Prompturile workerilor sunt editate din admin fără cod

---

## 5. Riscuri Legale și GDPR

### R5.1 — Non-conformitate GDPR (SCĂZUT)

**Risc:** Platforma nu respectă GDPR și operatorul este amendat.

**Mitigare implementată:**
- ✅ Ștergere cont hard delete (nu soft delete) cu toate datele asociate
- ✅ Export date GDPR complet (JSON + PDF) la cerere
- ✅ Data retention policies publicate la `/legal/data-retention`
- ✅ Politică de confidențialitate completă la `/legal/privacy-policy`
- ✅ Cookie consent și politică cookies
- ✅ Disclaimer medical la `/legal/medical-disclaimer`
- ✅ Nu se stochează date de plată (Stripe gestionează)

**Acțiune recomandată:** Consultanță juridică locală pentru conformitate completă cu jurisdicția operatorului.

---

### R5.2 — Răspundere medicală (SCĂZUT)

**Risc:** Utilizatorul urmează o recomandare AI care îi agravează starea de sănătate.

**Mitigare implementată:**
- ✅ Worker `medical-safety` elimină diagnostice și prescripții din orice răspuns AI
- ✅ Disclaimer medical pe fiecare recomandare ("Nu substituie sfatul medicului")
- ✅ Pagina `/legal/medical-disclaimer` cu clarificări complete
- ✅ Validare semantică detectează limbaj medical inadecvat
- ✅ Termenii de utilizare exclud răspunderea pentru decizii medicale

---

## 6. Riscuri de Piață

### R6.1 — Jucători mari intră pe segment (MEDIU)

**Risc:** MyFitnessPal, Noom sau Apple Health adaugă feature-uri de intoleranțe.

**Probabilitate:** Medie pe termen de 2–3 ani.

**Mitigare:**
- **Moat:** Datele acumulate per utilizator sunt greu de migrat
- **Moat:** Arhitectura AI proprietară cu 11 workeri — durează 12–18 luni să replici
- **Moat:** White-label și auto-hosting — mare companie nu poate oferi self-hosting
- **Strategie:** Brand local puternic + comunitate activ + feature velocity ridicat

---

### R6.2 — Rată de conversie trial → paid scăzută (MEDIU)

**Risc:** Utilizatorii încearcă 7 zile gratis și nu se abonează.

**Probabilitate:** Medie — standard industrie e 2–8% conversie trial.

**Mitigare:**
- ✅ Trial 7 zile cu acces Pro+ complet — utilizatorul vede valoarea reală
- ✅ Modal de expirare trial cu opțiuni clare
- **Recomandare:** Implementare email sequence de onboarding (3–5 emailuri în trial)
- **Recomandare:** In-app tooltips + ghid de utilizare pentru primele 3 zile

---

### R6.3 — Churn ridicat post-abonare (MEDIU)

**Risc:** Utilizatorii se abonează și anulează după 1–2 luni.

**Mitigare:**
- **Natural retention:** Cu cât ai mai multe date în jurnal, cu atât recomandările sunt mai valoroase → utilizatorul nu pleacă
- **Recomandare:** Milestone notifications ("Ai identificat 3 trigger-uri alimentare!")
- **Recomandare:** Weekly digest email cu progresul

---

## Concluzie: Profilul de Risc General

NutriAID prezintă un **profil de risc scăzut spre mediu**, cu toate riscurile majore deja mitigate prin arhitectura existentă. Riscurile reziduale principale sunt:

1. **Creșterea prețurilor AI** → adresabilă prin switch model (Gemini/local)
2. **Cunoaștere tehnică cumpărător** → adresabilă prin suport inclus în vânzare
3. **Concurență mare** → adresabilă prin viteză de produs și brand local

Platforma este **excepțional de bine construită** pentru a rezista la defecțiuni: trei layere de fallback AI, backup automat, separare completă frontend/backend, și admin console care elimină dependența de dezvoltator pentru operare curentă.

---

*Document generat: Iunie 2026 | NutriAID Platform v1.0 — prod branch*
