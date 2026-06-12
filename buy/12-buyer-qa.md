# NutriAID — Buyer Q&A Report
### Răspunsuri pregătite pentru întrebările frecvente ale cumpărătorilor

---

## Tehnologie

**Q: Ce versiuni de Node.js și Next.js folosiți?**

A: Frontend: Next.js 14.2.35 cu Node.js 20 LTS. Backend admin: Next.js 15.5.18 cu React 19. Ambele sunt versiuni stabile, LTS sau current stable, cu suport minim 12 luni garantat de Vercel/Meta. Nu utilizăm versiuni beta sau experimental.

---

**Q: De ce două aplicații separate (frontend + backend)?**

A: Separarea este o decizie arhitecturală deliberată, nu o lipsă de planificare. Avantaje concrete:
1. **Securitate:** Secretele admin (AI keys, Stripe secret) nu sunt niciodată în aceeași aplicație cu utilizatorii
2. **Scalare independentă:** Frontend-ul cu trafic mare poate fi scalat fără a atinge backend-ul
3. **Surface de atac redusă:** Dacă frontend-ul are o vulnerabilitate, backend-ul admin rămâne izolat
4. **Deployability:** Fiecare aplicație poate fi deployată independent

---

**Q: Platforma poate rula fără Docker?**

A: Da, absolut. Docker este opțional — simplifică deployment-ul dar nu este necesar. Poate rula cu `npm start` direct pe orice server cu Node.js 20 + PostgreSQL 16. Raportul de instalare include instrucțiuni complete pentru ambele variante (cu și fără Docker).

---

**Q: Ce bază de date folosiți și pot fi migrate datele ușor?**

A: PostgreSQL 16 cu Drizzle ORM. Schema este completă în TypeScript (`lib/db/schema.ts`), versionată cu migrații incrementale. Migrarea la alt PostgreSQL (cloud sau on-premise) se face prin schimbarea `DATABASE_URL` în `.env` și rularea `drizzle-kit migrate`. Nu există stored procedures sau extensii nestandardizate.

---

**Q: Există dependențe de servicii third-party de care nu pot scăpa?**

A: Trei dependențe externe opționale, toate înlocuibile:
1. **API AI (OpenAI/Gemini)** — poate fi înlocuit cu orice provider OpenAI-compatible, inclusiv modele locale Ollama (cost $0)
2. **Stripe** — poate fi înlocuit cu LemonSqueezy sau Paddle cu modificări în 3–4 fișiere
3. **Email SMTP** — orice provider SMTP funcționează (self-hosted Postfix, SendGrid, SES, Brevo)

Nu există lock-in la niciun serviciu cloud specific.

---

**Q: Codul este obfuscat sau are licențe restrictive?**

A: Codul este 100% TypeScript sursă deschisă, complet lizibil. Nu există obfuscare, nu există licențe terțe restrictive, nu există componente proprietare third-party. Licența MIT se aplică tuturor dependențelor npm. Cumpărătorul primește drept complet de proprietate intelectuală.

---

## AI

**Q: Platforma folosește ChatGPT sau un model propriu?**

A: Nu este un simplu wrapper ChatGPT. Platforma utilizează un orchestrator proprietar cu 11 workeri specializați (profil, intoleranțe, alergeni, mese, rețete, nutriție, suplimente, progres, siguranță medicală). Fiecare worker are propriul prompt, schemă de validare și logică de corecție. Modelul AI (GPT-4o, Gemini, Claude sau local) este o componentă interschimbabilă în această arhitectură.

---

**Q: Ce se întâmplă dacă API-ul OpenAI cade?**

A: Platforma are trei straturi de reziliență:
1. **Stratul 1:** Fallback automat la Gemini 1.5 Pro (configurat ca model secundar)
2. **Stratul 2:** Dacă și Gemini eșuează → Rule-based engine (algoritmi deterministi, cost $0)
3. **Stratul 3:** Request fingerprinting — dacă cererea este identică cu una anterioară, servește din cache

Utilizatorul primește întotdeauna un răspuns, chiar dacă API-ul AI este complet down.

---

**Q: Pot schimba modelul AI fără să ating codul?**

A: Da. Din consola admin (`Settings → AI Keys`), poți schimba:
- Primary model (dropdown: gpt-4o, gpt-4-turbo, gemini-1.5-pro, claude-3-opus, etc.)
- Fallback model
- API key
- Temperature și max tokens

Schimbarea se aplică imediat pentru noile cereri, fără restart.

---

**Q: Pot folosi modele AI locale (Ollama, LM Studio) pentru cost zero?**

A: Da. În câmpul "Orchestrator URL" din admin, setezi endpoint-ul local (ex: `http://localhost:11434/v1`). Platforma va folosi acel server OpenAI-compatible. Testat cu Llama 3, Mistral și Qwen2 via Ollama.

---

**Q: Cât costă AI per utilizator per lună?**

A: La configurația GPT-4o + 5 cereri ghidaj/utilizator/lună, cost mediu ~$0.30/utilizator/lună. La 1.000 utilizatori → ~$300/lună AI total. 50% din cereri sunt rezolvate de rule-based engine (cost $0), deci cost real ~$150/lună la 1.000 utilizatori activi.

---

**Q: Ce validare medicală are platforma?**

A: Workerul `medical-safety` procesează fiecare răspuns AI înainte să ajungă la utilizator. Elimină: diagnostice ("ești intolerant la X"), prescripții ("ia medicamentul Y"), limbaj absolut ("niciodată", "garantat", "100%"), conflicte cu intoleranțele declarate. Un validator semantic separat detectează aceste pattern-uri prin regex și scoring. Platforma nu poate recomanda medicamente sau pune diagnostice — arhitectural imposibil.

---

## Costuri

**Q: Care sunt costurile reale lunare de operare?**

A: Configurație realistă pentru primii 500 utilizatori:
- Hosting (Hetzner CX32): €14.90
- AI API (GPT-4o, 500 utilizatori × 5 req × 50% AI): ~€75
- Email (Brevo free): €0
- Backup (Hetzner Object Storage): €3
- **Total: ~€93/lună**

Break-even la ~7 utilizatori pe planul Pro (€14.99/lună). Marjă operațională >90% la scale.

---

**Q: Stripe ia comision? Cât?**

A: Stripe taxează 2.9% + €0.30 per tranzacție. Exemplu: la Pro €14.99/lună → Stripe ia €0.73 → Net €14.26. European Interchange regs pot reduce taxa la 1.5% + €0.10 dacă clientul are card european. Alternativ: LemonSqueezy sau Paddle au comisioane similare sau mai mici.

---

**Q: Există costuri ascunse pe care trebuie să le știu?**

A: Nu. Lista completă a costurilor potențiale:
- Hosting VPS: €5–150/lună în funcție de dimensiune
- AI API: variabil, ~$0.06/cerere AI
- Email SMTP: €0–19/lună
- Stripe: 2.9% + €0.30 per plată
- Domeniu: €10–15/an
- Backup S3: €3–10/lună (opțional)
- SSL: €0 (Let's Encrypt automat via Traefik)
- Zero costuri de licență software (toate dependențele MIT/open-source)

---

## Scalare

**Q: La câți utilizatori poate ține platforma pe configurația actuală?**

A: Un VPS Hetzner CX32 (4 vCPU, 8 GB RAM, €14.90/lună) suportă confortabil 1.000–1.500 utilizatori activi simultani. La 3.000+ utilizatori, upgrade la CX42 (€29.90/lună). La 10.000+, scalare orizontală cu managed PostgreSQL și multiple instanțe frontend.

---

**Q: Scalare orizontală este posibilă și cât costă?**

A: Da. Modificări necesare pentru scalare orizontală completă:
1. **PostgreSQL:** Migrare la managed DB (Neon, Supabase, AWS RDS) — modificare `DATABASE_URL`, zero cod
2. **Backend JSON store:** Migrare la PostgreSQL tabel — ~1 săptămână dev, ~100 linii cod
3. **Session storage:** JWT stateless (deja funcțional cu multiple instanțe)
4. **Rate limiting:** Migrare Redis pentru distribuire — ~1 zi dev

---

## Mentenanță

**Q: Cât timp necesită mentenanța lunară?**

A: Operare curentă: 0–2 ore/lună pentru o platformă stabilă fără features noi:
- Monitoring logs (15 minute/săptămână)
- Update-uri npm de securitate (1h/lună)
- Răspuns la support utilizatori (variabil)

Admin console gestionează tot restul (prețuri, AI, email, utilizatori) fără cod.

---

**Q: Ce se întâmplă dacă Next.js lansează o versiune majoră cu breaking changes?**

A: Versiunile Next.js sunt fixate în `package.json`. Update-urile sunt opționale și incrementale. Next.js are politică de deprecation cu 12+ luni de avans. TypeScript strict asigură că orice breaking change este detectat la compile time, nu în producție.

---

## Licențe și Transfer IP

**Q: Primesc codul sursă complet?**

A: Da. Vânzarea include:
- Codul sursă complet (frontend + backend + configurări)
- Accesul la repository Git cu toată istoria
- Toate fișierele de configurare (Docker, Traefik, env example)
- Toate migrările bazei de date
- Toate testele

---

**Q: Există drepturi de autor sau licențe terțe care restricționează utilizarea comercială?**

A: Nu. Toate dependențele npm utilizate sunt licențiate MIT, Apache 2.0 sau ISC — toate permit utilizare comercială fără restricții, fără royalties. Nu există cod proprietary third-party inclus. Codul custom (orchestrator, workeri, admin console) este complet al vânzătorului și transferat integral.

---

**Q: Pot rebrandui și revinde platforma?**

A: Da, complet. Cumpărătorul are drept deplin de:
- Rebranding complet (logo, culori, text)
- Vânzare/licențiere sub orice brand
- White-label pentru terți
- Modificare completă a codului
- Utilizare comercială nerestricționată

Nu există clauze de non-compete sau restricții de utilizare.

---

## Suport

**Q: Oferiți suport post-vânzare?**

A: Standard: 30 zile Q&A (răspuns la întrebări tehnice, clarificări arhitecturale). Negociabil: 3–12 luni suport tehnic extins cu SLA, include și asistență pentru features noi. Prețul de suport extins este negociat separat.

---

**Q: Există documentație suficientă pentru un developer să preia?**

A: Da. Documentația include:
- 13 rapoarte de business (folderul `buy/`)
- Raport tehnic complet (arhitectură, API, DB schema, workeri)
- Ghid de instalare și deployment (local, VPS, Docker, Traefik, Dokploy)
- Comentarii în cod pentru secțiunile non-evidente
- Teste E2E și smoke tests ca documentație vie

Un developer senior poate prelua platforma în 1–2 zile de onboarding.

---

**Q: Ce se transferă fizic la vânzare?**

A: Checklist complet de transfer:
- [ ] Acces repository GitHub (transfer sau fork cu toate branch-urile)
- [ ] Cod sursă complet (ZIP alternativ)
- [ ] Domeniu nutriaid.eu (opțional, transfer Namecheap/similar)
- [ ] Credențiale hosting (Hetzner sau similar)
- [ ] Cont Stripe (transfer sau cumpărătorul își creează cont propriu)
- [ ] Cont OpenAI (cumpărătorul folosește propriul cont)
- [ ] Documentație completă (13 rapoarte + ghiduri tehnice)
- [ ] Sesiune de onboarding video (2–4 ore, opțional)

---

*Document generat: Iunie 2026 | NutriAID Platform v1.0 — prod branch*
