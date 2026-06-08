import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/app/legal/_components/LegalLayout";

export const metadata: Metadata = { title: "Politica de Ștergere a Contului" };

export default function AccountDeletionPage() {
  return (
    <LegalLayout title="Politica de Ștergere a Contului" lastUpdated="1 ianuarie 2025">
      <p>
        Ai dreptul de a-ți șterge contul NutriAID Intolerances oricând,
        fără nicio justificare și fără costuri. Această politică descrie
        procesul de ștergere și consecințele acestuia.
      </p>

      <h2>1. Dreptul la ștergere</h2>
      <p>
        În conformitate cu Regulamentul General privind Protecția Datelor
        (GDPR), art. 17, ai dreptul de a solicita ștergerea completă a
        datelor tale personale. NutriAID Intolerances respectă și
        facilitează exercitarea acestui drept.
      </p>

      <h2>2. Cum ștergi contul</h2>

      <h3>Metoda 1: Din aplicație (recomandat)</h3>
      <ul>
        <li>Autentifică-te în contul tău.</li>
        <li>Accesează Dashboard → Profil.</li>
        <li>Derulează până la secțiunea &quot;Zona de pericol&quot;.</li>
        <li>Apasă &quot;Șterge contul&quot; și confirmă acțiunea.</li>
        <li>Ștergerea este procesată imediat.</li>
      </ul>

      <h3>Metoda 2: Prin email</h3>
      <ul>
        <li>Trimite un email la contact@nutriaid.ro cu subiectul: &quot;Cerere ștergere cont&quot;.</li>
        <li>Include în email adresa de email a contului de șters.</li>
        <li>Vom procesa cererea în termen de 30 de zile calendaristice.</li>
        <li>Vei primi confirmare la adresa furnizată.</li>
      </ul>

      <h2>3. Ce se întâmplă la ștergere</h2>
      <p>La ștergerea contului tău:</p>
      <ul>
        <li>Contul este dezactivat imediat.</li>
        <li>Nu mai poți accesa aplicația cu aceste credențiale.</li>
        <li>Toate datele de profil (intoleranțe, preferințe) sunt șterse.</li>
        <li>Toate înregistrările din jurnal sunt șterse.</li>
        <li>Istoricul de recomandări este șters.</li>
        <li>Ștergerea completă din baza de date se finalizează în 30 de zile.</li>
      </ul>

      <h2>4. Date care pot fi reținute temporar</h2>
      <p>
        Conform{" "}
        <Link href="/legal/data-retention" className="text-green-600 dark:text-green-400 hover:underline">
          Politicii de Retenție a Datelor
        </Link>
        , anumite date pot fi reținute temporar:
      </p>
      <ul>
        <li>Log-uri tehnice anonimizate (maxim 90 de zile) — pentru securitate.</li>
        <li>Evidențe de conformitate GDPR (maxim 3 ani) — obligație legală.</li>
        <li>Date necesare soluționării litigiilor în curs.</li>
      </ul>

      <h2>5. Ireversibilitatea ștergerii</h2>
      <p>
        <strong>Atenție:</strong> Ștergerea contului este permanentă și
        ireversibilă. Nu putem recupera datele după finalizarea procesului
        de ștergere. Dacă dorești o pauză de la utilizare, poți pur și
        simplu nu te mai autentifica, fără a șterge contul.
      </p>

      <h2>6. Exportul datelor înainte de ștergere</h2>
      <p>
        Înainte de a-ți șterge contul, poți solicita exportul datelor tale
        în format JSON sau CSV:
      </p>
      <ul>
        <li>Trimite cerere la contact@nutriaid.ro cu subiectul &quot;Export date cont&quot;.</li>
        <li>Furnizăm exportul în termen de 30 de zile.</li>
        <li>Datele exportate includ: profilul, jurnalul și istoricul de recomandări.</li>
      </ul>

      <h2>7. Ștergerea conturilor inactive</h2>
      <p>
        Conturile care nu au fost accesate timp de 3 ani consecutivi pot fi
        șterse automat, după notificare prealabilă cu 60 de zile la adresa
        de email înregistrată. Dacă email-ul nu mai este valid, contul va
        fi șters fără notificare.
      </p>

      <h2>8. Contact</h2>
      <p>
        Pentru orice nedumeriri legate de ștergerea contului:
        contact@nutriaid.ro
      </p>
    </LegalLayout>
  );
}
