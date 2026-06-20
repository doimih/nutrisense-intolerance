import React from "react";
import type { Metadata } from "next";
import LegalLayout from "@/app/legal/_components/LegalLayout";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return {
    title: isRo ? "Politica de Confidențialitate" : "Privacy Policy",
  };
}

export default function PrivacyPolicyPage() {
  const isRo = getServerLanguage() === "ro";

  return (
    <LegalLayout
      titleRo="Politica de Confidențialitate"
      titleEn="Privacy Policy"
      lastUpdatedRo="20 iunie 2026"
      lastUpdatedEn="20 June 2026"
    >
      {isRo ? (
        <>
          <p>
            Această Politică de Confidențialitate descrie modul în care NutriAID
            Intolerances (&quot;noi&quot;, &quot;al nostru&quot;) colectează, utilizează și protejează
            datele personale ale utilizatorilor (&quot;tu&quot;, &quot;utilizatorul&quot;) în cadrul
            aplicației web disponibile la nutriaid-intolerances.ro.
          </p>
          <p>
            Prin crearea unui cont și utilizarea aplicației, ești de acord cu
            termenii acestei Politici de Confidențialitate.
          </p>

          <h2>1. Datele pe care le colectăm</h2>
          <p>Colectăm exclusiv datele pe care le furnizezi voluntar sau care sunt generate în mod necesar prin utilizarea platformei:</p>
          <ul>
            <li><strong>Date de cont:</strong> Numele tău, adresa de email și parola (stocată criptat prin algoritm de hashing securizat).</li>
            <li><strong>Date de profil:</strong> Preferințele alimentare, intoleranțele și alergiile pe care le setezi în aplicație.</li>
            <li><strong>Date de jurnal:</strong> Alimentele consumate, simptomele înregistrate, intensitatea acestora și notele personale.</li>
            <li><strong>Date de rețete:</strong> Rețetele generate și salvate, planurile de masă, listele de cumpărături și istoricul utilizării modului de gătit (Cooking Mode).</li>
            <li><strong>Date de ghidaj AI:</strong> Istoricul recomandărilor generate de AI și rapoartele de progres nutrițional, inclusiv exporturile PDF solicitate.</li>
            <li><strong>Date de abonament:</strong> Planul de abonament activ (Basic / Pro / Pro+), statusul trial-ului, data de debut și statusul Early Adopter. Datele de card bancar sunt procesate exclusiv de Stripe Inc. și nu sunt stocate pe serverele noastre.</li>
            <li><strong>Date de consimțământ newsletter:</strong> Preferința de abonare la newsletter, timestamp-ul consimțământului și sursa înregistrării (popup post-înregistrare sau formular footer), exclusiv dacă ți-ai dat acordul explicit.</li>
            <li><strong>Date tehnice:</strong> Adresa IP, tipul de browser, sesiunile de utilizare — exclusiv în scopul asigurării securității și funcționării aplicației.</li>
            <li><strong>Date de securitate 2FA:</strong> Cheia secretă TOTP dacă activezi autentificarea în doi pași (stocată criptat).</li>
          </ul>
          <p>Nu colectăm numere de card, CNP sau alte identificatoare guvernamentale.</p>

          <h2>2. Cum utilizăm datele</h2>
          <p>Datele tale sunt utilizate exclusiv pentru:</p>
          <ul>
            <li>Furnizarea funcționalităților aplicației (gestionarea contului, generarea recomandărilor AI, stocarea jurnalului, generarea rețetelor și planurilor de masă).</li>
            <li>Personalizarea rețetelor și ghidajului nutrițional conform profilului tău de intoleranțe și preferințe.</li>
            <li>Gestionarea abonamentului și procesarea plăților prin Stripe.</li>
            <li>Asigurarea securității contului tău și prevenirea accesului neautorizat (inclusiv via reCAPTCHA și 2FA).</li>
            <li>Trimiterea comunicărilor newsletter dacă ți-ai dat consimțământul explicit și câtă vreme nu l-ai retras.</li>
            <li>Îmbunătățirea aplicației pe baza utilizării agregate și anonimizate.</li>
            <li>Comunicări tehnice necesare (resetarea parolei, notificări de securitate).</li>
            <li>Analiza performanței campaniilor de marketing prin TikTok Pixel, exclusiv dacă ai acceptat cookie-urile de marketing.</li>
          </ul>
          <p>Nu vindem datele tale nimănui.</p>

          <h2>3. Baza legală pentru prelucrare</h2>
          <p>Prelucrăm datele tale în baza:</p>
          <ul>
            <li><strong>Consimțământului (Art. 6(1)(a) GDPR):</strong> dat la crearea contului, la abonarea la newsletter și la acceptarea cookie-urilor de marketing (TikTok Pixel).</li>
            <li><strong>Contractului (Art. 6(1)(b) GDPR):</strong> executarea serviciilor pe care le soliciti prin utilizarea aplicației și a abonamentului plătit.</li>
            <li><strong>Interesului legitim (Art. 6(1)(f) GDPR):</strong> securitatea platformei, prevenirea fraudei și analiza anonimizată a utilizării.</li>
            <li><strong>Obligației legale (Art. 6(1)(c) GDPR):</strong> păstrarea înregistrărilor financiare conform legislației fiscale aplicabile.</li>
          </ul>
          <p>
            <strong>Date de sănătate (Art. 9 GDPR):</strong> Datele privind intoleranțele alimentare și alergiile pot constitui date speciale de sănătate conform Art. 9 GDPR. Prelucrăm aceste date exclusiv în baza consimțământului tău explicit, dat la completarea profilului.
          </p>

          <h2>4. Parteneri și procesatori de date terți</h2>
          <p>
            Nu vindem, nu închiriem și nu partajăm datele tale cu terți în scopuri comerciale. Lucrăm cu următorii procesatori de date tehnici, fiecare acționând strict în baza instrucțiunilor noastre sau ca operator independent de date:
          </p>
          <ul>
            <li>
              <strong>Stripe Inc.</strong> (SUA) — procesarea plăților prin card bancar. Stripe este operator independent de date pentru informațiile financiare. Noi nu stocăm datele de card pe serverele noastre. Consultă <a href="https://stripe.com/privacy" className="text-green-600 dark:text-green-400 hover:underline" target="_blank" rel="noopener noreferrer">Politica de Confidențialitate Stripe</a>.
            </li>
            <li>
              <strong>Brevo (Sendinblue SAS)</strong> (Franța, UE) — livrarea emailurilor de newsletter și a comunicărilor transacționale (resetare parolă, notificări). Datele transferate: adresa de email, prenumele, preferința de limbă. Brevo procesează date în UE.
            </li>
            <li>
              <strong>Google LLC</strong> (SUA) — serviciul reCAPTCHA v3 pentru protecție anti-bot la autentificare și înregistrare. reCAPTCHA colectează date comportamentale și amprentă browser și le transferă în SUA în baza clauzelor contractuale standard ale Comisiei Europene. Consultă <a href="https://policies.google.com/privacy" className="text-green-600 dark:text-green-400 hover:underline" target="_blank" rel="noopener noreferrer">Politica de Confidențialitate Google</a>.
            </li>
            <li>
              <strong>TikTok Technology Limited</strong> (Irlanda / Singapore / SUA) — pixel de marketing TikTok, utilizat pentru măsurarea performanței reclamelor și analiza audienței. Pixelul colectează date privind vizitele pe pagini, evenimentele platformei și adresa IP (parțial anonimizată). <strong>Aceste date pot fi transferate și stocate în afara Spațiului Economic European (SEE), inclusiv în SUA și Singapore.</strong> Poți retrage consimțământul pentru TikTok Pixel oricând din setările de cookies. Consultă <a href="https://www.tiktok.com/legal/privacy-policy" className="text-green-600 dark:text-green-400 hover:underline" target="_blank" rel="noopener noreferrer">Politica de Confidențialitate TikTok</a>.
            </li>
            <li>
              <strong>Furnizori de hosting / infrastructură:</strong> serverele aplicației și ale bazei de date sunt găzduite în UE sau în țări cu nivel adecvat de protecție recunoscut de Comisia Europeană.
            </li>
            <li>
              <strong>Furnizori de modele AI:</strong> solicitările AI ale utilizatorilor sunt procesate via API-uri externe (ex. OpenAI, Google Gemini sau endpoint-uri compatibile, configurabile de operator). Solicitările conțin exclusiv datele de profil și jurnal relevante generării răspunsului; nu transmitem date de identificare directă (email, nume) furnizorilor de AI.
            </li>
          </ul>
          <p>Datele pot fi dezvăluite autorităților competente exclusiv în cazul unei obligații legale (ordin judecătoresc, cerere ANSPDCP sau altă autoritate cu atribuții legale).</p>

          <h2>5. Securitatea datelor</h2>
          <p>Implementăm măsuri tehnice și organizatorice adecvate pentru protejarea datelor tale:</p>
          <ul>
            <li>Parolele sunt stocate criptat folosind algoritmi de hashing securizați (bcrypt).</li>
            <li>Comunicațiile sunt protejate prin HTTPS/TLS.</li>
            <li>Sesiunile sunt gestionate prin cookie-uri HttpOnly, securizate, fără expunere JavaScript.</li>
            <li>Accesul la datele utilizatorilor este restricționat strict (control de acces bazat pe rol).</li>
            <li>Autentificarea în doi pași (2FA/TOTP) disponibilă opțional pentru toți utilizatorii.</li>
            <li>Backup-uri automate programate cu stocare criptată S3-compatibilă.</li>
            <li>Realizăm verificări periodice de securitate și audituri de cod.</li>
          </ul>

          <h2>6. Retenția datelor</h2>
          <p>
            Datele tale sunt reținute atât timp cât contul tău este activ sau cât este necesar pentru furnizarea serviciului. La ștergerea contului, toate datele personale (profil, jurnal, rețete, istoricul AI, preferințe newsletter) sunt eliminate permanent în termen de 30 de zile. Datele de facturare pot fi reținute pentru o perioadă de 5 ani conform obligațiilor legale fiscale. Datele agregate și anonimizate pot fi reținute pentru statistici interne.
          </p>

          <h2>7. Drepturile tale (GDPR)</h2>
          <p>În conformitate cu GDPR, ai dreptul la:</p>
          <ul>
            <li><strong>Acces (Art. 15):</strong> Să soliciți o copie a datelor tale personale — inclusiv via funcția de export JSON din secțiunea Confidențialitate & GDPR din dashboard.</li>
            <li><strong>Rectificare (Art. 16):</strong> Să corectezi datele incorecte sau incomplete din Profil.</li>
            <li><strong>Ștergere (Art. 17):</strong> Să soliciți ștergerea datelor (&quot;dreptul de a fi uitat&quot;) — inclusiv via butonul de ștergere cont din dashboard.</li>
            <li><strong>Restricționare (Art. 18):</strong> Să limitezi prelucrarea datelor în anumite situații.</li>
            <li><strong>Portabilitate (Art. 20):</strong> Să primești datele în format structurat, lizibil automat (JSON) — disponibil direct din dashboard.</li>
            <li><strong>Opoziție (Art. 21):</strong> Să te opui prelucrării bazate pe interesul legitim sau în scop de marketing.</li>
            <li><strong>Retragerea consimțământului:</strong> Oricând, fără a afecta legalitatea prelucrării anterioare. Dezabonarea din newsletter se face din dashboard (secțiunea GDPR) sau din linkul de dezabonare din fiecare email.</li>
          </ul>
          <p>Pentru exercitarea acestor drepturi, contactează-ne la contact@nutriaid.eu. Răspundem în termen de 30 de zile.</p>

          <h2>8. Cookie-uri și tehnologii similare</h2>
          <p>Utilizăm mai multe categorii de cookie-uri:</p>
          <ul>
            <li><strong>Cookie-uri strict necesare:</strong> sesiunile de autentificare (HttpOnly, securizate) — fără acestea aplicația nu funcționează. Nu necesită consimțământ.</li>
            <li><strong>Cookie-uri de marketing (opționale):</strong> TikTok Pixel utilizează cookie-uri și mecanisme de stocare locală pentru a măsura performanța reclamelor. Aceste cookie-uri necesită consimțământul tău explicit înainte de a fi activate. Poți retrage consimțământul oricând.</li>
          </ul>
          <p>
            Detalii complete în{" "}
            <a href="/legal/cookies-policy" className="text-green-600 dark:text-green-400 hover:underline">Politica de Cookies</a>.
          </p>

          <h2>9. Transferuri internaționale de date</h2>
          <p>
            Datele tale pot fi transferate în afara Spațiului Economic European (SEE) în cazul utilizării serviciilor Stripe (SUA), Google reCAPTCHA (SUA) și TikTok Pixel (SUA/Singapore). Aceste transferuri se realizează în baza clauzelor contractuale standard adoptate de Comisia Europeană (Art. 46 GDPR) sau a altor mecanisme de transfer adecvate. Datele de găzduire a aplicației și bazei de date sunt stocate în SEE.
          </p>

          <h2>10. Modificări ale politicii</h2>
          <p>Putem actualiza această politică periodic. Te vom notifica prin email sau prin notificare în aplicație cu cel puțin 30 de zile înainte de intrarea în vigoare a modificărilor semnificative.</p>

          <h2>11. Contact și autoritate de supraveghere</h2>
          <p>Pentru orice întrebări privind confidențialitatea datelor, contactează-ne:</p>
          <ul>
            <li>Email: contact@nutriaid.eu</li>
          </ul>
          <p>Ai dreptul să depui o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP) — <a href="https://www.dataprotection.ro" className="text-green-600 dark:text-green-400 hover:underline" target="_blank" rel="noopener noreferrer">www.dataprotection.ro</a>.</p>
        </>
      ) : (
        <>
          <p>
            This Privacy Policy describes how NutriAID Intolerances (&quot;we&quot;, &quot;our&quot;) collects, uses and protects the personal data of users (&quot;you&quot;, &quot;the user&quot;) within the web application available at nutriaid-intolerances.ro.
          </p>
          <p>By creating an account and using the application, you agree to the terms of this Privacy Policy.</p>

          <h2>1. Data we collect</h2>
          <p>We collect only the data you voluntarily provide or that is necessarily generated through your use of the platform:</p>
          <ul>
            <li><strong>Account data:</strong> Your name, email address and password (stored encrypted using a secure hashing algorithm).</li>
            <li><strong>Profile data:</strong> Dietary preferences, food intolerances and allergies you set in the application.</li>
            <li><strong>Journal data:</strong> Foods consumed, symptoms recorded, their intensity and personal notes.</li>
            <li><strong>Recipe data:</strong> Generated and saved recipes, meal plans, shopping lists, and usage history of the Cooking Mode feature.</li>
            <li><strong>AI guidance data:</strong> History of AI-generated recommendations and nutritional progress reports, including any PDF exports you request.</li>
            <li><strong>Subscription data:</strong> Your active subscription plan (Basic / Pro / Pro+), trial status, start date, and Early Adopter status. Payment card data is processed exclusively by Stripe Inc. and is never stored on our servers.</li>
            <li><strong>Newsletter consent data:</strong> Newsletter subscription preference, consent timestamp and consent source (post-registration popup or footer form), only if you have given explicit consent.</li>
            <li><strong>Technical data:</strong> IP address, browser type, usage sessions — solely for security and application functionality purposes.</li>
            <li><strong>2FA security data:</strong> TOTP secret key if you enable two-factor authentication (stored encrypted).</li>
          </ul>
          <p>We do not collect card numbers, national identification numbers, or other government identifiers.</p>

          <h2>2. How we use your data</h2>
          <p>Your data is used exclusively for:</p>
          <ul>
            <li>Providing application features (account management, AI recommendations, journal storage, recipe generation, and meal planning).</li>
            <li>Personalising recipes and nutritional guidance according to your intolerance profile and preferences.</li>
            <li>Managing your subscription and processing payments through Stripe.</li>
            <li>Ensuring the security of your account and preventing unauthorised access (including via reCAPTCHA and 2FA).</li>
            <li>Sending newsletter communications if you have given explicit consent and have not withdrawn it.</li>
            <li>Improving the application based on aggregated and anonymised usage data.</li>
            <li>Necessary technical communications (password reset, security notifications).</li>
            <li>Analysing marketing campaign performance via TikTok Pixel, only if you have accepted marketing cookies.</li>
          </ul>
          <p>We do not sell your data to anyone.</p>

          <h2>3. Legal basis for processing</h2>
          <p>We process your data on the basis of:</p>
          <ul>
            <li><strong>Consent (Art. 6(1)(a) GDPR):</strong> given when creating your account, subscribing to the newsletter, and accepting marketing cookies (TikTok Pixel).</li>
            <li><strong>Contract (Art. 6(1)(b) GDPR):</strong> performing the services you request through the use of the application and any paid subscription.</li>
            <li><strong>Legitimate interest (Art. 6(1)(f) GDPR):</strong> platform security, fraud prevention, and anonymised usage analysis.</li>
            <li><strong>Legal obligation (Art. 6(1)(c) GDPR):</strong> retention of financial records in accordance with applicable tax law.</li>
          </ul>
          <p>
            <strong>Health data (Art. 9 GDPR):</strong> Food intolerance and allergy data may constitute special category health data under Art. 9 GDPR. We process this data solely on the basis of your explicit consent given when completing your profile.
          </p>

          <h2>4. Third-party partners and data processors</h2>
          <p>
            We do not sell, rent or share your data with third parties for commercial purposes. We work with the following technical data processors, each acting strictly on our instructions or as an independent data controller:
          </p>
          <ul>
            <li>
              <strong>Stripe Inc.</strong> (USA) — payment card processing. Stripe is an independent data controller for financial information. We do not store card data on our servers. See the <a href="https://stripe.com/privacy" className="text-green-600 dark:text-green-400 hover:underline" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a>.
            </li>
            <li>
              <strong>Brevo (Sendinblue SAS)</strong> (France, EU) — delivery of newsletter and transactional emails (password reset, notifications). Data transferred: email address, first name, language preference. Brevo processes data within the EU.
            </li>
            <li>
              <strong>Google LLC</strong> (USA) — reCAPTCHA v3 service for anti-bot protection at login and registration. reCAPTCHA collects behavioural data and browser fingerprints and transfers them to the USA under European Commission Standard Contractual Clauses. See the <a href="https://policies.google.com/privacy" className="text-green-600 dark:text-green-400 hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
            </li>
            <li>
              <strong>TikTok Technology Limited</strong> (Ireland / Singapore / USA) — TikTok marketing pixel, used to measure advertising performance and analyse audiences. The pixel collects data about page visits, platform events, and IP addresses (partially anonymised). <strong>This data may be transferred to and stored outside the European Economic Area (EEA), including in the USA and Singapore.</strong> You may withdraw consent for TikTok Pixel at any time via the cookie settings. See the <a href="https://www.tiktok.com/legal/privacy-policy" className="text-green-600 dark:text-green-400 hover:underline" target="_blank" rel="noopener noreferrer">TikTok Privacy Policy</a>.
            </li>
            <li>
              <strong>Hosting / infrastructure providers:</strong> the application and database servers are hosted within the EU or in countries with an adequate level of protection recognised by the European Commission.
            </li>
            <li>
              <strong>AI model providers:</strong> user AI requests are processed via external APIs (e.g. OpenAI, Google Gemini, or compatible endpoints, configurable by the operator). Requests contain only the profile and journal data relevant to generating the response; we do not transmit direct identification data (email, name) to AI providers.
            </li>
          </ul>
          <p>Data may be disclosed to competent authorities only where there is a legal obligation (court order, competent authority request).</p>

          <h2>5. Data security</h2>
          <p>We implement appropriate technical and organisational measures to protect your data:</p>
          <ul>
            <li>Passwords are stored encrypted using secure hashing algorithms (bcrypt).</li>
            <li>Communications are protected via HTTPS/TLS.</li>
            <li>Sessions are managed via HttpOnly, secure cookies with no JavaScript exposure.</li>
            <li>Access to user data is strictly restricted (role-based access control).</li>
            <li>Two-factor authentication (2FA/TOTP) is available optionally for all users.</li>
            <li>Automated scheduled backups with encrypted S3-compatible storage.</li>
            <li>We carry out periodic security reviews and code audits.</li>
          </ul>

          <h2>6. Data retention</h2>
          <p>
            Your data is retained for as long as your account is active or as long as necessary to provide the service. Upon account deletion, all personal data (profile, journal, recipes, AI history, newsletter preferences) is permanently removed within 30 days. Billing data may be retained for up to 5 years in accordance with applicable tax law obligations. Aggregated and anonymised data may be retained for internal statistics.
          </p>

          <h2>7. Your rights (GDPR)</h2>
          <p>Under GDPR, you have the right to:</p>
          <ul>
            <li><strong>Access (Art. 15):</strong> Request a copy of your personal data — also available via the JSON export feature in the Privacy & GDPR section of your dashboard.</li>
            <li><strong>Rectification (Art. 16):</strong> Correct inaccurate or incomplete data in your Profile.</li>
            <li><strong>Erasure (Art. 17):</strong> Request deletion of your data (&quot;right to be forgotten&quot;) — also available via the account deletion button in your dashboard.</li>
            <li><strong>Restriction (Art. 18):</strong> Limit processing of your data in certain situations.</li>
            <li><strong>Portability (Art. 20):</strong> Receive your data in a structured, machine-readable format (JSON) — available directly from your dashboard.</li>
            <li><strong>Objection (Art. 21):</strong> Object to processing based on legitimate interest or for marketing purposes.</li>
            <li><strong>Withdrawal of consent:</strong> At any time, without affecting the lawfulness of prior processing. You can unsubscribe from the newsletter via your dashboard (GDPR section) or via the unsubscribe link in any newsletter email.</li>
          </ul>
          <p>To exercise these rights, contact us at contact@nutriaid.eu. We respond within 30 days.</p>

          <h2>8. Cookies and similar technologies</h2>
          <p>We use several categories of cookies:</p>
          <ul>
            <li><strong>Strictly necessary cookies:</strong> authentication sessions (HttpOnly, secure) — without these the application cannot function. These do not require consent.</li>
            <li><strong>Marketing cookies (optional):</strong> TikTok Pixel uses cookies and local storage mechanisms to measure advertising performance. These cookies require your explicit consent before being activated. You may withdraw consent at any time.</li>
          </ul>
          <p>
            Full details in the{" "}
            <a href="/legal/cookies-policy" className="text-green-600 dark:text-green-400 hover:underline">Cookies Policy</a>.
          </p>

          <h2>9. International data transfers</h2>
          <p>
            Your data may be transferred outside the European Economic Area (EEA) in connection with the use of Stripe (USA), Google reCAPTCHA (USA), and TikTok Pixel (USA/Singapore). These transfers are carried out on the basis of Standard Contractual Clauses adopted by the European Commission (Art. 46 GDPR) or other adequate transfer mechanisms. Application and database hosting data is stored within the EEA.
          </p>

          <h2>10. Policy changes</h2>
          <p>We may update this policy periodically. We will notify you by email or in-app notification at least 30 days before significant changes take effect.</p>

          <h2>11. Contact and supervisory authority</h2>
          <p>For any questions regarding data privacy, contact us:</p>
          <ul>
            <li>Email: contact@nutriaid.eu</li>
          </ul>
          <p>You have the right to lodge a complaint with the National Supervisory Authority for Personal Data Processing (ANSPDCP) in Romania — <a href="https://www.dataprotection.ro" className="text-green-600 dark:text-green-400 hover:underline" target="_blank" rel="noopener noreferrer">www.dataprotection.ro</a> — or with your national data protection authority.</p>
        </>
      )}
    </LegalLayout>
  );
}
