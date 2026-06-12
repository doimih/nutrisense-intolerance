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
      lastUpdatedRo="1 ianuarie 2025"
      lastUpdatedEn="1 January 2025"
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
          <p>Colectăm exclusiv datele pe care le furnizezi voluntar:</p>
          <ul>
            <li><strong>Date de cont:</strong> Numele tău, adresa de email și parola (stocată criptat).</li>
            <li><strong>Date de profil:</strong> Preferințele alimentare și intoleranțele pe care le setezi în aplicație.</li>
            <li><strong>Date de jurnal:</strong> Alimentele consumate, simptomele înregistrate, intensitatea acestora și notele personale.</li>
            <li><strong>Date tehnice:</strong> Adresa IP, tipul de browser, sesiunile de utilizare — exclusiv în scopul asigurării securității și funcționării aplicației.</li>
          </ul>
          <p>Nu colectăm informații financiare, numere de card, CNP sau alte identificatoare guvernamentale.</p>
          <h2>2. Cum utilizăm datele</h2>
          <p>Datele tale sunt utilizate exclusiv pentru:</p>
          <ul>
            <li>Furnizarea funcționalităților aplicației (gestionarea contului, generarea recomandărilor, stocarea jurnalului).</li>
            <li>Asigurarea securității contului tău și prevenirea accesului neautorizat.</li>
            <li>Îmbunătățirea aplicației pe baza utilizării agregate și anonimizate.</li>
            <li>Comunicări tehnice necesare (resetarea parolei, notificări de securitate).</li>
          </ul>
          <p>Nu utilizăm datele tale în scopuri de marketing și nu vindem datele tale nimănui.</p>
          <h2>3. Baza legală pentru prelucrare</h2>
          <p>Prelucrăm datele tale în baza:</p>
          <ul>
            <li><strong>Consimțământului:</strong> dat la crearea contului și acceptarea acestor termeni.</li>
            <li><strong>Contractului:</strong> executarea serviciilor pe care le soliciti prin utilizarea aplicației.</li>
            <li><strong>Interesului legitim:</strong> pentru securitatea platformei și prevenirea fraudei.</li>
          </ul>
          <h2>4. Partajarea datelor cu terți</h2>
          <p>
            Nu vindem, nu închiriem și nu partajăm datele tale cu terți în scopuri comerciale. Datele pot fi dezvăluite exclusiv în cazul în care:
          </p>
          <ul>
            <li>Există o obligație legală (ordin judecătoresc, cerere autoritate competentă).</li>
            <li>Este necesar pentru protejarea drepturilor și securității utilizatorilor.</li>
            <li>Utilizăm furnizori de servicii tehnice (hosting, email transacțional) care prelucrează date strict în baza instrucțiunilor noastre și cu garanții adecvate.</li>
          </ul>
          <h2>5. Securitatea datelor</h2>
          <p>Implementăm măsuri tehnice și organizatorice adecvate pentru protejarea datelor tale:</p>
          <ul>
            <li>Parolele sunt stocate criptat folosind algoritmi de hashing securizați.</li>
            <li>Comunicațiile sunt protejate prin HTTPS/TLS.</li>
            <li>Accesul la datele utilizatorilor este restricționat strict.</li>
            <li>Realizăm verificări periodice de securitate.</li>
          </ul>
          <h2>6. Retenția datelor</h2>
          <p>
            Datele tale sunt reținute atât timp cât contul tău este activ. La ștergerea contului, toate datele personale sunt eliminate permanent în termen de 30 de zile. Datele agregate și anonimizate pot fi reținute pentru statistici interne.
          </p>
          <h2>7. Drepturile tale</h2>
          <p>În conformitate cu GDPR, ai dreptul la:</p>
          <ul>
            <li><strong>Acces:</strong> Să soliciți o copie a datelor tale personale.</li>
            <li><strong>Rectificare:</strong> Să corectezi datele incorecte sau incomplete.</li>
            <li><strong>Ștergere:</strong> Să soliciți ștergerea datelor (&quot;dreptul de a fi uitat&quot;).</li>
            <li><strong>Restricționare:</strong> Să limitezi prelucrarea datelor în anumite situații.</li>
            <li><strong>Portabilitate:</strong> Să primești datele în format structurat, lizibil automat.</li>
            <li><strong>Opoziție:</strong> Să te opui prelucrării bazate pe interesul legitim.</li>
            <li><strong>Retragerea consimțământului:</strong> Oricând, fără a afecta legalitatea prelucrării anterioare.</li>
          </ul>
          <p>Pentru exercitarea acestor drepturi, contactează-ne la contact@nutriaid.eu. Răspundem în termen de 30 de zile.</p>
          <h2>8. Cookie-uri</h2>
          <p>
            Utilizăm cookie-uri strict necesare pentru funcționarea aplicației (sesiuni de autentificare). Nu utilizăm cookie-uri de tracking sau marketing. Detalii în{" "}
            <a href="/legal/cookies-policy" className="text-green-600 dark:text-green-400 hover:underline">Politica de Cookies</a>.
          </p>
          <h2>9. Transferuri internaționale</h2>
          <p>Datele tale sunt stocate în Uniunea Europeană sau în țări cu nivel adecvat de protecție recunoscut de Comisia Europeană.</p>
          <h2>10. Modificări ale politicii</h2>
          <p>Putem actualiza această politică periodic. Te vom notifica prin email sau prin notificare în aplicație cu cel puțin 30 de zile înainte de intrarea în vigoare a modificărilor semnificative.</p>
          <h2>11. Contact</h2>
          <p>Pentru orice întrebări privind confidențialitatea datelor, contactează-ne:</p>
          <ul>
            <li>Email: contact@nutriaid.eu</li>
          </ul>
          <p>Ai dreptul să depui o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP).</p>
        </>
      ) : (
        <>
          <p>
            This Privacy Policy describes how NutriAID Intolerances (&quot;we&quot;, &quot;our&quot;) collects, uses and protects the personal data of users (&quot;you&quot;, &quot;the user&quot;) within the web application.
          </p>
          <p>By creating an account and using the application, you agree to the terms of this Privacy Policy.</p>
          <h2>1. Data we collect</h2>
          <p>We collect only the data you voluntarily provide:</p>
          <ul>
            <li><strong>Account data:</strong> Your name, email address and password (stored encrypted).</li>
            <li><strong>Profile data:</strong> Dietary preferences and intolerances you set in the application.</li>
            <li><strong>Journal data:</strong> Foods consumed, symptoms recorded, their intensity and personal notes.</li>
            <li><strong>Technical data:</strong> IP address, browser type, usage sessions — solely for security and application functionality purposes.</li>
          </ul>
          <p>We do not collect financial information, card numbers, or government identifiers.</p>
          <h2>2. How we use your data</h2>
          <p>Your data is used exclusively for:</p>
          <ul>
            <li>Providing application features (account management, generating recommendations, storing the journal).</li>
            <li>Ensuring the security of your account and preventing unauthorised access.</li>
            <li>Improving the application based on aggregated and anonymised usage.</li>
            <li>Necessary technical communications (password reset, security notifications).</li>
          </ul>
          <p>We do not use your data for marketing purposes and we do not sell your data to anyone.</p>
          <h2>3. Legal basis for processing</h2>
          <p>We process your data on the basis of:</p>
          <ul>
            <li><strong>Consent:</strong> given when creating your account and accepting these terms.</li>
            <li><strong>Contract:</strong> performing the services you request by using the application.</li>
            <li><strong>Legitimate interest:</strong> for platform security and fraud prevention.</li>
          </ul>
          <h2>4. Sharing data with third parties</h2>
          <p>We do not sell, rent or share your data with third parties for commercial purposes. Data may be disclosed only when:</p>
          <ul>
            <li>There is a legal obligation (court order, competent authority request).</li>
            <li>Necessary to protect the rights and security of users.</li>
            <li>We use technical service providers (hosting, transactional email) who process data strictly on our instructions and with adequate guarantees.</li>
          </ul>
          <h2>5. Data security</h2>
          <p>We implement appropriate technical and organisational measures to protect your data:</p>
          <ul>
            <li>Passwords are stored encrypted using secure hashing algorithms.</li>
            <li>Communications are protected via HTTPS/TLS.</li>
            <li>Access to user data is strictly restricted.</li>
            <li>We carry out periodic security checks.</li>
          </ul>
          <h2>6. Data retention</h2>
          <p>Your data is retained for as long as your account is active. Upon account deletion, all personal data is permanently removed within 30 days. Aggregated and anonymised data may be retained for internal statistics.</p>
          <h2>7. Your rights</h2>
          <p>Under GDPR, you have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data.</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data.</li>
            <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;).</li>
            <li><strong>Restriction:</strong> Limit processing of your data in certain situations.</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interest.</li>
            <li><strong>Withdrawal of consent:</strong> At any time, without affecting the lawfulness of prior processing.</li>
          </ul>
          <p>To exercise these rights, contact us at contact@nutriaid.eu. We respond within 30 days.</p>
          <h2>8. Cookies</h2>
          <p>
            We use strictly necessary cookies for application functionality (authentication sessions). We do not use tracking or marketing cookies. Details in the{" "}
            <a href="/legal/cookies-policy" className="text-green-600 dark:text-green-400 hover:underline">Cookies Policy</a>.
          </p>
          <h2>9. International transfers</h2>
          <p>Your data is stored in the European Union or in countries with an adequate level of protection recognised by the European Commission.</p>
          <h2>10. Policy changes</h2>
          <p>We may update this policy periodically. We will notify you by email or in-app notification at least 30 days before significant changes take effect.</p>
          <h2>11. Contact</h2>
          <p>For any questions regarding data privacy, contact us:</p>
          <ul>
            <li>Email: contact@nutriaid.eu</li>
          </ul>
          <p>You have the right to lodge a complaint with your national data protection authority.</p>
        </>
      )}
    </LegalLayout>
  );
}
