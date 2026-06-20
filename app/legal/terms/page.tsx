import React from "react";
import type { Metadata } from "next";
import LegalLayout from "@/app/legal/_components/LegalLayout";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return { title: isRo ? "Termeni și Condiții" : "Terms and Conditions" };
}

export default function TermsPage() {
  const isRo = getServerLanguage() === "ro";

  return (
    <LegalLayout
      titleRo="Termeni și Condiții de Utilizare"
      titleEn="Terms and Conditions of Use"
      lastUpdatedRo="20 iunie 2026"
      lastUpdatedEn="20 June 2026"
    >
      {isRo ? (
        <>
          <p>
            Acești Termeni și Condiții (&quot;Termenii&quot;) guvernează utilizarea aplicației web NutriAID Intolerances (&quot;Aplicația&quot;, &quot;Serviciul&quot;). Prin crearea unui cont sau utilizarea Aplicației, accepți integral acești Termeni. Dacă nu ești de acord, nu utiliza Aplicația.
          </p>
          <h2>1. Descrierea serviciului</h2>
          <p>NutriAID Intolerances este o aplicație web destinată persoanelor cu intoleranțe alimentare, disponibilă atât în variantă gratuită (cu funcționalități de bază), cât și în planuri de abonament plătite (Basic, Pro, Pro+). Aplicația permite:</p>
          <ul>
            <li>Gestionarea unui profil personal cu intoleranțe, alergii și preferințe alimentare.</li>
            <li>Generarea de recomandări nutriționale, planuri de masă și rețete personalizate cu caracter informativ, via AI.</li>
            <li>Menținerea unui jurnal personal de monitorizare a alimentației și simptomelor.</li>
            <li>Vizualizarea istoricului de recomandări generate, cu posibilitate de export PDF.</li>
            <li>Generarea listelor de cumpărături și utilizarea modului de gătit (Cooking Mode).</li>
            <li>Urmărirea progresului nutrițional.</li>
            <li>Instalarea aplicației ca aplicație nativă pe dispozitiv (PWA — Progressive Web App).</li>
          </ul>
          <p>Funcționalitățile disponibile variază în funcție de planul de abonament activ. Serviciul are caracter exclusiv informativ și nu constituie consultanță medicală, nutrițională sau de sănătate.</p>
          <h2>2. Eligibilitate</h2>
          <p>Pentru a utiliza Aplicația trebuie:</p>
          <ul>
            <li>Să ai cel puțin 16 ani. Persoanele cu vârsta între 16 și 18 ani au nevoie de acordul părinților/tutorilor.</li>
            <li>Să furnizezi informații corecte și complete la înregistrare.</li>
            <li>Să utilizezi un singur cont per persoană.</li>
          </ul>
          <h2>3. Contul tău</h2>
          <p>Ești responsabil pentru:</p>
          <ul>
            <li>Confidențialitatea credențialelor contului tău.</li>
            <li>Toate activitățile desfășurate prin contul tău.</li>
            <li>Notificarea noastră imediată în caz de acces neautorizat.</li>
          </ul>
          <h2>4. Utilizare acceptabilă</h2>
          <p>Ești de acord să nu:</p>
          <ul>
            <li>Utilizezi Aplicația în scopuri ilegale sau care încalcă drepturile altora.</li>
            <li>Introduci informații false, înșelătoare sau dăunătoare.</li>
            <li>Încerci să accesezi sau să modifici datele altor utilizatori.</li>
            <li>Automatizezi accesul sau extragi date prin scraping.</li>
            <li>Utilizezi Aplicația pentru a distribui spam sau conținut malițios.</li>
          </ul>
          <h2>5. Limitarea răspunderii</h2>
          <p><strong>Aplicația este furnizată &quot;ca atare&quot;.</strong> În măsura permisă de lege, nu garantăm că:</p>
          <ul>
            <li>Serviciul va fi disponibil neîntrerupt sau fără erori.</li>
            <li>Recomandările generate sunt corecte, complete sau potrivite situației tale.</li>
            <li>Aplicația înlocuiește consultul unui specialist în nutriție sau medicină.</li>
          </ul>
          <h2>6. Disclaimer medical</h2>
          <p>
            <strong>NutriAID Intolerances nu este o aplicație medicală și nu furnizează sfaturi medicale.</strong>{" "}
            Orice recomandare generată are caracter general și informativ. Nu înlocuiește, sub nicio formă, consultul unui medic, alergolog, nutriționist sau alt specialist în sănătate.
          </p>
          <h2>7. Abonamente plătite și facturare</h2>
          <p>
            Platforma oferă planuri de abonament lunar plătit (Basic, Pro, Pro+), procesate prin Stripe. Prețurile sunt afișate pe pagina de prețuri și pot fi modificate cu notificare prealabilă de 30 de zile. Primii 100 de utilizatori înregistrați beneficiază de acces Pro gratuit ca parte a programului Early Adopter.
          </p>
          <p>
            <strong>Dreptul de retragere — conținut digital (OUG nr. 34/2014):</strong> Prin activarea unui abonament plătit, utilizatorul consimte în mod expres la livrarea imediată a conținutului digital și, în consecință, își pierde dreptul de retragere de 14 zile, în conformitate cu art. 16 lit. m) din OUG nr. 34/2014.
          </p>
          <p>
            Anularea abonamentului se poate efectua oricând din secțiunea Profil &gt; Facturare. Accesul la funcționalitățile plătite rămâne activ până la sfârșitul perioadei de facturare curente.
          </p>
          <h2>8. Proprietate intelectuală</h2>
          <p>Toate drepturile de proprietate intelectuală asupra Aplicației aparțin NutriAID Intolerances sau licențiatorilor săi. Datele pe care le introduci în aplicație rămân proprietatea ta.</p>
          <h2>9. Modificări ale termenilor</h2>
          <p>Putem revizui acești Termeni periodic. Continuarea utilizării Aplicației după publicarea modificărilor constituie acceptul lor.</p>
          <h2>10. Legea aplicabilă</h2>
          <p>Acești Termeni sunt guvernați de legislația română și a Uniunii Europene.</p>
          <h2>11. Contact</h2>
          <p>Întrebări despre acești Termeni: contact@nutriaid.eu</p>
        </>
      ) : (
        <>
          <p>
            These Terms and Conditions (&quot;Terms&quot;) govern the use of the NutriAID Intolerances web application (&quot;the Application&quot;, &quot;the Service&quot;). By creating an account or using the Application, you fully accept these Terms. If you do not agree, do not use the Application.
          </p>
          <h2>1. Description of the service</h2>
          <p>NutriAID Intolerances is a web application for people with food intolerances, available both as a free plan (with basic features) and as paid subscription plans (Basic, Pro, Pro+). The application allows:</p>
          <ul>
            <li>Managing a personal profile with intolerances, allergies and dietary preferences.</li>
            <li>Generating AI-powered personalised nutritional recommendations, meal plans, and recipes for informational purposes.</li>
            <li>Maintaining a personal journal for monitoring food intake and symptoms.</li>
            <li>Viewing the history of generated recommendations, with PDF export capability.</li>
            <li>Generating shopping lists and using the step-by-step Cooking Mode.</li>
            <li>Tracking nutritional progress.</li>
            <li>Installing the application as a native app on your device (PWA — Progressive Web App).</li>
          </ul>
          <p>Features available vary depending on your active subscription plan. The Service is exclusively informational and does not constitute medical, nutritional or health advice.</p>
          <h2>2. Eligibility</h2>
          <p>To use the Application you must:</p>
          <ul>
            <li>Be at least 16 years old. Persons aged 16–18 require parental or guardian consent.</li>
            <li>Provide accurate and complete information at registration.</li>
            <li>Use a single account per person.</li>
          </ul>
          <h2>3. Your account</h2>
          <p>You are responsible for:</p>
          <ul>
            <li>The confidentiality of your account credentials.</li>
            <li>All activities conducted through your account.</li>
            <li>Notifying us immediately in case of unauthorised access.</li>
          </ul>
          <h2>4. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Application for illegal purposes or in ways that infringe the rights of others.</li>
            <li>Enter false, misleading or harmful information.</li>
            <li>Attempt to access or modify other users&apos; data.</li>
            <li>Automate access or extract data through scraping.</li>
            <li>Use the Application to distribute spam or malicious content.</li>
          </ul>
          <h2>5. Limitation of liability</h2>
          <p><strong>The Application is provided &quot;as is&quot;.</strong> To the extent permitted by law, we do not guarantee that:</p>
          <ul>
            <li>The Service will be available uninterrupted or error-free.</li>
            <li>Generated recommendations are correct, complete or suitable for your situation.</li>
            <li>The Application replaces consultation with a nutrition or medical specialist.</li>
          </ul>
          <h2>6. Medical disclaimer</h2>
          <p>
            <strong>NutriAID Intolerances is not a medical application and does not provide medical advice.</strong>{" "}
            Any generated recommendation is general and informational in nature. It does not replace, in any way, consultation with a doctor, allergist, dietitian or other health specialist.
          </p>
          <h2>7. Paid subscriptions and billing</h2>
          <p>
            The platform offers paid monthly subscription plans (Basic, Pro, Pro+), processed through Stripe. Prices are displayed on the pricing page and may be modified with 30 days&apos; prior notice. The first 100 registered users receive free Pro access as part of the Early Adopter programme.
          </p>
          <p>
            <strong>Right of withdrawal — digital content:</strong> By activating a paid subscription, the user expressly consents to the immediate delivery of digital content and consequently waives the 14-day right of withdrawal.
          </p>
          <p>
            Subscription cancellation can be carried out at any time from Profile &gt; Billing. Access to paid features remains active until the end of the current billing period.
          </p>
          <h2>8. Intellectual property</h2>
          <p>All intellectual property rights over the Application belong to NutriAID Intolerances or its licensors. Data you enter in the application remains your property.</p>
          <h2>9. Changes to the terms</h2>
          <p>We may revise these Terms periodically. Continued use of the Application after publication of changes constitutes acceptance of them.</p>
          <h2>10. Applicable law</h2>
          <p>These Terms are governed by Romanian law and European Union law.</p>
          <h2>11. Contact</h2>
          <p>Questions about these Terms: contact@nutriaid.eu</p>
        </>
      )}
    </LegalLayout>
  );
}
