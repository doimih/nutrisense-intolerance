import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/app/legal/_components/LegalLayout";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return { title: isRo ? "Politica de Ștergere a Contului" : "Account Deletion Policy" };
}

export default function AccountDeletionPage() {
  const isRo = getServerLanguage() === "ro";

  return (
    <LegalLayout
      titleRo="Politica de Ștergere a Contului"
      titleEn="Account Deletion Policy"
      lastUpdatedRo="1 ianuarie 2025"
      lastUpdatedEn="1 January 2025"
    >
      {isRo ? (
        <>
          <p>Ai dreptul de a-ți șterge contul NutriAID Intolerances oricând, fără nicio justificare și fără costuri.</p>
          <h2>1. Dreptul la ștergere</h2>
          <p>În conformitate cu GDPR art. 17, ai dreptul de a solicita ștergerea completă a datelor tale personale.</p>
          <h2>2. Cum ștergi contul</h2>
          <h3>Metoda 1: Din aplicație (recomandat)</h3>
          <ul>
            <li>Autentifică-te în contul tău.</li>
            <li>Accesează Dashboard → Profil.</li>
            <li>Derulează până la secțiunea &quot;Zona de pericol&quot;.</li>
            <li>Apasă &quot;Șterge contul&quot; și confirmă acțiunea.</li>
          </ul>
          <h3>Metoda 2: Prin email</h3>
          <ul>
            <li>Trimite un email la contact@nutriaid.eu cu subiectul: &quot;Cerere ștergere cont&quot;.</li>
            <li>Vom procesa cererea în termen de 30 de zile calendaristice.</li>
          </ul>
          <h2>3. Ce se întâmplă la ștergere</h2>
          <ul>
            <li>Contul este dezactivat imediat.</li>
            <li>Toate datele de profil, jurnalul și istoricul de recomandări sunt șterse.</li>
            <li>Ștergerea completă din baza de date se finalizează în 30 de zile.</li>
          </ul>
          <h2>4. Ireversibilitatea ștergerii</h2>
          <p><strong>Atenție:</strong> Ștergerea contului este permanentă și ireversibilă.</p>
          <h2>5. Exportul datelor înainte de ștergere</h2>
          <p>Poți solicita exportul datelor la contact@nutriaid.eu cu subiectul &quot;Export date cont&quot;.</p>
          <h2>6. Contact</h2>
          <p>
            Pentru orice nedumeriri: contact@nutriaid.eu. Detalii despre retenție în{" "}
            <Link href="/legal/data-retention" className="text-green-600 dark:text-green-400 hover:underline">Politica de Retenție</Link>.
          </p>
        </>
      ) : (
        <>
          <p>You have the right to delete your NutriAID Intolerances account at any time, without justification and without cost.</p>
          <h2>1. Right to deletion</h2>
          <p>Under GDPR art. 17, you have the right to request complete deletion of your personal data.</p>
          <h2>2. How to delete your account</h2>
          <h3>Method 1: From the application (recommended)</h3>
          <ul>
            <li>Log in to your account.</li>
            <li>Go to Dashboard → Profile.</li>
            <li>Scroll to the &quot;Danger zone&quot; section.</li>
            <li>Click &quot;Delete account&quot; and confirm.</li>
          </ul>
          <h3>Method 2: By email</h3>
          <ul>
            <li>Send an email to contact@nutriaid.eu with the subject: &quot;Account deletion request&quot;.</li>
            <li>We will process the request within 30 calendar days.</li>
          </ul>
          <h2>3. What happens when you delete</h2>
          <ul>
            <li>The account is deactivated immediately.</li>
            <li>All profile data, journal and recommendation history are deleted.</li>
            <li>Complete removal from the database is finalised within 30 days.</li>
          </ul>
          <h2>4. Irreversibility of deletion</h2>
          <p><strong>Warning:</strong> Account deletion is permanent and irreversible.</p>
          <h2>5. Data export before deletion</h2>
          <p>You can request a data export at contact@nutriaid.eu with the subject &quot;Account data export&quot;.</p>
          <h2>6. Contact</h2>
          <p>
            For any questions: contact@nutriaid.eu. Retention details in the{" "}
            <Link href="/legal/data-retention" className="text-green-600 dark:text-green-400 hover:underline">Data Retention Policy</Link>.
          </p>
        </>
      )}
    </LegalLayout>
  );
}
