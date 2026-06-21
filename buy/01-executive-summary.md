# NutriAID — Executive Summary
### Platforma SaaS de nutriție personalizată bazată pe AI

---

## Ce este NutriAID?

NutriAID este o platformă SaaS completă, gata de producție, care ajută utilizatorii să identifice intoleranțele alimentare prin analiza inteligentă a corelațiilor dintre mese și simptome. Platforma combină un orchestrator AI cu 11 workeri specializați, un motor de analiză rule-based ca fallback, și o interfață modernă bilingvă (RO/EN) cu un panou de administrare complet.

---

## Ce problemă rezolvă?

**Problema:** Milioane de oameni suferă de simptome digestive cronice (balonare, dureri abdominale, oboseală, erupții cutanate) fără să poată identifica exact ce le cauzează. Testele medicale clasice sunt scumpe, lente și adesea incomplete. Dieteticienii costă 50–150 €/sesiune și nu pot analiza date zilnice în timp real.

**Soluția NutriAID:**
- Utilizatorul înregistrează zilnic ce a mâncat și ce simptome a avut
- AI-ul analizează corelațiile în timp real, detectează pattern-urile și oferă recomandări personalizate
- Fiecare recomandare trece printr-un lanț de validare (intoleranțe → alergeni → siguranță medicală)
- Rezultatele sunt prezentate clar, în limba utilizatorului, cu export PDF

---

## Cui se adresează?

### Utilizatori finali (B2C)
- Persoane cu intoleranțe alimentare nediagnosticate (lactoza, gluten, histamina, FODMAP etc.)
- Persoane cu IBS, SIBO, reflux, eczeme corelate cu alimentația
- Persoane care urmează diete specializate și au nevoie de ghidaj zilnic
- Sportiți care optimizează nutriția pentru performanță

### Piața potențială
- **România:** 19 milioane locuitori, penetrare smartphone >70%, creștere wellness +23% YoY
- **Europa de Est:** 100+ milioane utilizatori potențiali, piață subservită de aplicații nutriție
- **Global (EN):** Piața globală de aplicații nutriție = $8.5 miliarde (2023), CAGR 21%

### Cumpărători de platformă (B2B — white-label)
- Clinici de nutriție și dietetică
- Companii pharma cu divizie wellness
- Operatori de asigurări de sănătate
- Investitori în startup-uri healthtech

---

## De ce este valoroasă?

### 1. Venituri recurente (SaaS)
Trei planuri de abonament lunar (Basic €9.99 / Pro €14.99 / Pro+ €35.99) plus trial 7 zile gratuit. Cu 500 utilizatori plătitori pe Pro (mixt), MRR estimat: **€7.500–12.000**.

### 2. Costuri operaționale extrem de reduse
- Infrastructure: €30–60/lună (VPS + PostgreSQL + Traefik)
- AI API: ~€82/1.000 utilizatori activi/lună
- Email: €0–20/lună
- **Total operare: sub €200/lună pentru primii 1.000 utilizatori**

### 3. Autonomă și self-healing
Platforma funcționează fără intervenție umană. Orchestratorul AI se auto-corectează, motorul rule-based acoperă căderea API-urilor, iar panoul admin permite configurarea completă fără cod.

### 4. Complet configurabilă fără cod
Prețuri, texte, modele AI, chei API, SMTP, Stripe, PWA, 2FA — toate modificabile din consola admin în timp real.

---

## De ce este unică?

| Caracteristică | NutriAID | Apps nutriție obișnuite |
|---|---|---|
| Orchestrator AI cu 11 workeri specializați | ✅ | ❌ |
| Modul rețete AI bilingv cu GEO personalizare | ✅ | ❌ |
| Motor GEO (IP + CDN headers, 28 țări) | ✅ | ❌ |
| Auto-corecție și validare semantică | ✅ | ❌ |
| Fallback rule-based (cost $0) | ✅ | ❌ |
| Admin console complet configurabil | ✅ | ❌ |
| Suport multi-model (GPT-4o, Gemini, Claude) | ✅ | ❌ |
| GDPR complet (export + ștergere date) | ✅ | Parțial |
| Newsletter + Brevo + Early Adopter (growth suite) | ✅ | ❌ |
| TikTok Pixel server-side | ✅ | Rar |
| White-label ready | ✅ | ❌ |
| Bilingv RO + EN | ✅ | Rar |
| Deploy Docker cu Traefik în <1 oră | ✅ | ❌ |
| Stripe integrat cu webhook | ✅ | ❌ |

---

## De ce merită 45.000+ €?

### Calcul conservator de valoare

| Component | Timp estimat rebuild | Cost piață (€80/h senior dev) |
|---|---|---|
| Frontend Next.js 14 (35+ pagini, auth, billing) | 420h | €33.600 |
| Backend Admin Console (80+ endpoint-uri, AI config) | 300h | €24.000 |
| Orchestrator AI + 11 workeri + supervisor | 200h | €16.000 |
| Auto-corrector + validare semantică | 100h | €8.000 |
| Modul rețete AI (DB, store, workers, API, UI, CookingMode) | 150h | €12.000 |
| Motor GEO (IP + CDN + cache + 28 țări) | 20h | €1.600 |
| Newsletter + Brevo + Early Adopter (growth suite) | 50h | €4.000 |
| TikTok Pixel server-side + portal achiziție | 40h | €3.200 |
| Sistem billing Stripe complet | 80h | €6.400 |
| GDPR complet (export, ștergere, retenție) | 50h | €4.000 |
| i18n bilingv (RO + EN) | 40h | €3.200 |
| PWA, 2FA, reCAPTCHA, backup S3 | 60h | €4.800 |
| Docker + Traefik + deployment | 40h | €3.200 |
| QA, teste, smoke tests | 100h | €8.000 |
| **TOTAL REBUILD** | **1.650h** | **€132.000** |

**Prețul de vânzare 45.000 € reprezintă 34% din costul de rebuild** — o achiziție excepțională pentru un produs funcțional, testat și gata de producție.

### Multiplu SaaS
La doar 500 utilizatori activi și MRR €7.500, valoarea la 5× MRR anual = **€450.000**. Prețul de 45.000 € este 0.1× din potențialul de 1 an.

---

## Concluzie

NutriAID este o platformă SaaS complet funcțională, cu AI real, billing real, admin console real și utilizatori reali. Nu este un MVP sau un prototip — este un produs finalizat, documentat, testat și gata de scale. Cumpărătorul primește un avans de 12–18 luni de dezvoltare la o fracție din costul real.

---

*Document generat: Iunie 2026 | Versiune platformă: prod branch*
