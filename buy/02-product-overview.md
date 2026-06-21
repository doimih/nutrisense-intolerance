# NutriAID — Product Overview
### Descrierea completă a produsului și funcționalităților

---

## Descrierea platformei

NutriAID este o aplicație web SaaS full-stack construită pe Next.js 14 (frontend) și Next.js 15 (backend admin console), cu PostgreSQL ca bază de date principală și un orchestrator AI proprietar cu arhitectură multi-worker. Platforma este deployată în Docker cu Traefik ca reverse proxy și suportă HTTPS automat prin Let's Encrypt.

Utilizatorul final înregistrează zilnic mesele consumate și simptomele resimțite. Pe baza acestor date, AI-ul NutriAID identifică pattern-uri, corelează alimentele cu simptomele și generează recomandări personalizate care respectă intoleranțele declarate, alergiile și preferințele dietetice ale utilizatorului.

---

## Funcționalități pentru utilizatorul final

### Autentificare și cont
- Înregistrare cu email + parolă (validare email token 24h)
- Login securizat (sesiune JWT HttpOnly, SameSite=Strict)
- Resetare parolă prin email (token 1h)
- Retrimitere email de verificare
- Ștergere cont complet cu toate datele asociate (GDPR)
- Export date personale (JSON + PDF) la cerere

### Trial gratuit 7 zile
- La înregistrare, utilizatorul primește automat acces Pro+ complet timp de 7 zile
- Fără card necesar
- La expirare, apare un modal care ghidează spre upgrade

### Jurnal de monitorizare zilnică
- Înregistrare mese per slot: micul dejun, prânz, cină, gustare
- Selectare alimente consumate (din baza de alimente sau text liber)
- Înregistrare simptome (11 tipuri: balonare, dureri abdominale, greată, diaree, constipație, reflux, erupții cutanate, oboseală, dureri de cap, dificultăți respiratorii, umflături)
- Intensitate simptome: scala 1–10
- Latență de reacție: minute până la apariția simptomelor (util pentru detecția întârziată)
- Stare generală: scala 1–5 (wellbeing)
- Note libere per intrare

### Ghidaj AI personalizat
- Utilizatorul formulează o cerere în limbaj natural ("creează-mi un plan de mese pentru 2 săptămâni", "ce alimente ar trebui să evit?")
- Orchestratorul AI procesează cererea prin 3–6 workeri specializați în funcție de intenție
- Rezultatul include: alimente recomandate, alimente de evitat, exemple de mese, sfaturi nutriționale, disclaimer medical
- Fiecare recomandare este adaptată la planul de abonament (Basic: 8 alimente / Pro: 12 / Pro+: 15)
- Istoricul complet al sesiunilor este salvat și consultabil

### Export PDF
- Orice sesiune de ghidaj poate fi exportată ca PDF profesional
- PDF-ul include: data, cererea utilizatorului, recomandările complete, disclaimer
- Design NutriAID cu header, footer și formatare clară

### Profil personal
- Nume, email (editabil)
- Intoleranțe alimentare declarate (12 tipuri: lactoză, gluten, nuci, histamina, FODMAP, fructoză, sorbitol, sulfiți, ouă, soia, pește, crustacee)
- Preferință dietetică (normal, vegetarian, vegan, low-carb, gluten-free, dairy-free)
- Date fizice: vârstă, înălțime (cm), greutate (kg), nivel activitate fizică
- Stare abonament Stripe cu link direct la portalul de billing

### Pagini publice
- Landing page cu hero, beneficii, CTA
- Pricing dinamic (prețuri și features din admin, nu hardcodate)
- About, Why AI, Trust & testimoniale, FAQ, Contact
- Knowledge Hub: 9 articole informative (simptome frecvente, ghiduri alimentare, GDPR, etc.)
- Pagini legale complete: Privacy Policy, Terms, Cookies, Data Retention, Security Policy, Medical Disclaimer

### Rețete AI — Modul Complet
- Generare rețete personalizate din numele unei mese: ingrediente, pași, macros, alergeni, substituții, sfaturi de gătit
- Bilingv: titlu, ingrediente, instrucțiuni în RO și EN simultan
- GEO-personalizare: rețete adaptate la stilul culinar local (28 țări europene suportate)
- CookingMode: vizualizare pas-cu-pas fullscreen, timer integrat
- RecipeModal: modal detaliat cu toate informațiile rețetei
- Generare batch: pipeline de generare în masă pentru biblioteca de rețete
- Statistici utilizare: context de utilizare (meal_plan, cooking_mode, browse)

### Motor GEO — Personalizare Geografică
- Detecție IP via ip-api.com cu cache în memorie (TTL 1h)
- CDN headers: Cloudflare (`cf-ipcountry`) și Vercel (`x-vercel-ip-country`) — instant, fără apel extern
- Fallback `Accept-Language` (13 limbi suportate)
- 28 țări europene mapate cu regiune și stil culinar specific
- Aplicat la: generare rețete din mese, orchestrator ghidaj AI

### Newsletter și Growth Suite
- Popup de newsletter la prima vizită (opt-in/opt-out)
- Formular footer pentru abonare publică
- Consimțământ stocat per utilizator cu sursă (`signup_popup` / `footer_form`)
- Integrare Brevo: evenimente marketing (opt-in, opt-out, înregistrare, upgrade plan)
- Program Early Adopter: primii 100 de utilizatori reali primesc acces Pro gratuit
- Banner Early Adopter cu counter de locuri rămase

### Tracking și Achiziție
- TikTok Pixel server-side: PageView, înregistrare, checkout
- Portal achiziție public (`/acquire`): prezentare platformei pentru potențiali cumpărători
- Pagină daily-plan publică (`/daily-plan`)

### Internațional
- Suport complet bilingv: Română (implicit) + Engleză
- Switch de limbă în navbar și sidebar (buton 🇷🇴/🇬🇧)
- Preferință limbă stocată în contul utilizatorului și ca cookie persistent
- Emailuri trimise în limba browserului utilizatorului
- Toate emailurile (verificare, welcome, resetare parolă, ștergere cont) sunt bilingve

---

## AI Brain — Orchestratorul Multi-Worker

### Arhitectura
Orchestratorul primește o cerere în limbaj natural și o rutează printr-un lanț de workeri specializați, în funcție de intenția detectată. Fiecare worker produce un JSON structurat care devine input pentru workerul următor.

### Detecție de intenție
8 intenții suportate:
- `meal-plan` — planuri de mese
- `recipe` — rețete și preparare
- `shopping-list` — liste de cumpărături
- `supplement-advice` — suplimente nutritive
- `nutritional-analysis` — analiză macronutrienți
- `progress-tracking` — analiză progres și tendințe
- `general-nutrition` — întrebări generale nutriție/intoleranțe
- `unknown` — fallback sigur

### Cei 11 Workeri Specializați

| # | Worker | Rol |
|---|---|---|
| 1 | **profile-analyzer** | Extrage: vârstă, sex, înălțime, greutate, obiectiv dietetic, nivel activitate |
| 2 | **intolerance-checker** | Identifică ingrediente incompatibile cu intoleranțele declarate |
| 3 | **allergy-checker** | Detectează alergeni potențiali în alimentele recomandate |
| 4 | **meal-plan-generator** | Generează planuri de mese personalizate cu alternative |
| 5 | **recipe-builder** | Creează rețete detaliate cu pași, ingrediente și substituții |
| 6 | **nutrition-calculator** | Calculează kcal, proteine, carbohidrați, grăsimi per masă |
| 7 | **shopping-list-generator** | Generează liste de cumpărături categorizate |
| 8 | **supplement-advisor** | Recomandă suplimente sigure (nu prescripții) |
| 9 | **progress-tracker** | Analizează jurnalul pentru tendințe și rapoarte săptămânale |
| 10 | **medical-safety** | Revizie finală: elimină diagnostice, tratamente, limbaj absolut |
| 11 | **meal-plan-generator** (alias) | Folosit și în fluxul shopping-list |

---

## Self-Healing Layer — Auto-Corectorul

### Problema rezolvată
AI-urile generează uneori JSON invalid, câmpuri lipsă sau limbaj medical inadecvat. Fără auto-corecție, utilizatorul ar vedea erori sau răspunsuri incomplete.

### Cum funcționează
1. Workerul produce un output
2. Schema Validator verifică: câmpuri obligatorii, tipuri de date, structura JSON
3. Semantic Validator verifică: limbaj medical detectat, respectare intoleranțe, limbaj absolut (întotdeauna, niciodată, garantat)
4. **Dacă validarea eșuează:** Auto-Corrector generează un prompt de corecție cu erorile specifice și apelează GPT-4o
5. **Dacă GPT-4o eșuează:** Fallback la Gemini 1.5 Pro
6. **Dacă ambele eșuează:** Rule-Based Corrector aplică corecții prin pattern matching (cost $0)
7. Output-ul corectat este re-validat înainte de a fi trimis mai departe

---

## Diagnostic Engine — Motorul Rule-Based

Funcționează complet fără AI, la cost $0. Utilizat ca:
- Fallback când API-ul AI nu este disponibil
- Layer primar pentru utilizatori pe trial expirat
- Verificare de sanitate înainte de apelul AI

### Algoritmi implementați
- **Scoring simptome-aliment:** Corelează frecvența și intensitatea simptomelor cu alimentele consumate
- **Detecție reacție întârziată:** Identifică alimente cu simptome apărute la 30 min – 48h după consum
- **Identificare alimente sigure:** Alimente consumate doar în zilele cu simptome ≤2 și wellbeing ≥4
- **Analiză combinații:** Detectează perechi de alimente care co-apar în intrările cu simptome severe
- **Confidence scoring:** Avertizează utilizatorul când datele sunt insuficiente (<5 intrări)

---

## Prompt Rewriter — Sistemul de Prompturi Configurabile

Fiecare worker are un prompt de sistem implicit în RO și EN. Din consola admin, operatorul poate:
- Seta un prompt global aplicat tuturor workerilor
- Suprascrie promptul oricărui worker individual
- Ajusta temperatura (0–1) și max tokens (512–2048)
- Testa modificările live în AI Test Lab fără a afecta utilizatorii

---

## PDF Generator

- Bazat pe pdfkit (Node.js nativ, fără dependențe externe)
- Generare server-side, fără timeout de browser
- Design NutriAID: header cu logo, secțiuni structurate, footer cu data și disclaimer
- Export disponibil per sesiune de ghidaj sau ca pachet complet ZIP
- Dimensiune tipică: 2–8 pagini per sesiune

---

## UI — Interfața Utilizatorului

### Design System
- **Framework:** Tailwind CSS 3.4 (utility-first)
- **Iconuri:** Lucide React (390+ icoane)
- **Componente:** React 18, complet custom, fără biblioteci UI externe

### Caracteristici UI
- Responsive complet (mobile, tablet, desktop)
- Dark mode (toggle manual, persistent în localStorage)
- PWA (Progressive Web App) — instalabil pe telefon, funcționează offline parțial
- Navbar fixă cu scroll-aware styling (transparent → frosted glass la scroll)
- Dashboard cu sidebar colapsabil pe mobile
- Modal de expirare trial și sesiune cu countdown
- Toast notifications (feedback instant pentru acțiuni)
- Animații CSS subtile (tranziții 150–300ms)
- Accesibilitate: aria-label, focus management, keyboard navigation

### Pagini dashboard
- `/dashboard` — Overview cu statistici personale
- `/dashboard/monitoring` — Jurnal intrări noi + istoric
- `/dashboard/guidance` — Formular cerere AI + rezultate
- `/dashboard/history` — Timeline sesiuni anterioare
- `/dashboard/profile` — Profil, intoleranțe, date fizice, billing
- `/dashboard/recipes` — Biblioteca de rețete AI cu CookingMode
- `/dashboard/gdpr` — Export date + ștergere cont

---

## Arhitectura Modulară

```
NutriAID
├── Frontend (Next.js 14, port 3000)
│   ├── App Router + Middleware
│   ├── Auth (JWT, email verification, user status)
│   ├── Billing (Stripe checkout + webhook)
│   ├── Dashboard (monitoring, guidance, history, profile, recipes)
│   ├── Recipes Module (AI generation, CookingMode, batch, GEO)
│   ├── Growth Suite (newsletter, early adopter, Brevo events)
│   ├── Tracking (TikTok Pixel server-side, Google Analytics)
│   ├── Public pages (landing, pricing, legal, acquire, daily-plan)
│   └── i18n (RO/EN bilingual, language stored per user)
│
├── Backend Admin Console (Next.js 15, port 4028)
│   ├── AI Orchestrator (11 workers + supervisor + GEO context)
│   ├── Auto-Corrector (GPT-4o → Gemini → rule-based)
│   ├── Settings (email, stripe, AI, PWA, 2FA, reCAPTCHA)
│   ├── User Management (+ status, newsletter, early adopter)
│   ├── Visitor Sessions (demo accounts, time-limited)
│   ├── Logs & Audit Trail
│   └── AI Test Lab
│
└── Infrastructure
    ├── PostgreSQL 16 (users, subscriptions, monitoring, guidance, recipes)
    ├── Traefik (HTTPS, routing, HSTS)
    ├── Docker Compose (orchestrare containere)
    └── Backup S3 (Hetzner Object Storage, opțional)
```

Fiecare modul este independent, testabil separat și înlocuibil fără a afecta restul sistemului. Adăugarea unui nou worker AI necesită ~50 linii de cod. Adăugarea unui nou plan de abonament necesită zero cod — se face din admin.

---

*Document generat: Iunie 2026 | NutriAID Platform v1.1 — prod branch*
