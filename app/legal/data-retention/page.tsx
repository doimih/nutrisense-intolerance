import React from "react";
import type { Metadata } from "next";
import LegalLayout from "@/app/legal/_components/LegalLayout";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return { title: isRo ? "Politica de Retenție a Datelor" : "Data Retention Policy" };
}

export default function DataRetentionPage() {
  const isRo = getServerLanguage() === "ro";

  return (
    <LegalLayout
      titleRo="Politica de Retenție a Datelor"
      titleEn="Data Retention Policy"
      lastUpdatedRo="1 ianuarie 2025"
      lastUpdatedEn="1 January 2025"
    >
      {isRo ? (
        <>
          <p>Această politică descrie perioadele de retenție pentru fiecare categorie de date pe care le procesăm și procedurile de ștergere aplicabile.</p>
          <p>Retenționăm datele personale numai atât timp cât este necesar pentru scopul pentru care au fost colectate sau atât timp cât legea impune.</p>
          <h2>1. Categorii de date și perioadele de retenție</h2>
          <h3>1.1. Date de cont</h3>
          <ul>
            <li><strong>Tip:</strong> Nume, email, parolă criptată.</li>
            <li><strong>Perioadă:</strong> Pe durata existenței contului + 30 de zile după ștergerea solicitată.</li>
            <li><strong>Motiv:</strong> Necesar pentru furnizarea serviciului și securitate.</li>
          </ul>
          <h3>1.2. Date de profil</h3>
          <ul>
            <li><strong>Tip:</strong> Intoleranțe, preferințe alimentare.</li>
            <li><strong>Perioadă:</strong> Pe durata existenței contului.</li>
            <li><strong>Motiv:</strong> Furnizarea funcționalităților de recomandări.</li>
          </ul>
          <h3>1.3. Jurnal de monitorizare</h3>
          <ul>
            <li><strong>Tip:</strong> Alimente consumate, simptome, notițe personale.</li>
            <li><strong>Perioadă:</strong> Pe durata existenței contului; poți șterge orice înregistrare oricând.</li>
            <li><strong>Motiv:</strong> Furnizarea funcționalității de jurnal personal.</li>
          </ul>
          <h3>1.4. Istoric recomandări</h3>
          <ul>
            <li><strong>Tip:</strong> Recomandările generate, configurarea acestora.</li>
            <li><strong>Perioadă:</strong> Maxim 24 de luni sau până la ștergerea contului.</li>
          </ul>
          <h3>1.5. Date tehnice și log-uri</h3>
          <ul>
            <li><strong>Tip:</strong> Adrese IP, activitate sesiuni, log-uri tehnice.</li>
            <li><strong>Perioadă:</strong> Maxim 90 de zile.</li>
          </ul>
          <h3>1.6. Date pentru conformitate legală</h3>
          <ul>
            <li><strong>Tip:</strong> Evidențe de consimțământ, log-uri de ștergere.</li>
            <li><strong>Perioadă:</strong> Minim 3 ani (cerință legală).</li>
          </ul>
          <h2>2. Ștergerea datelor</h2>
          <h3>2.1. Ștergere automată</h3>
          <p>La ștergerea contului, toate datele personale identificabile sunt eliminate în termen de 30 de zile calendaristice.</p>
          <h3>2.2. Ștergere la cerere</h3>
          <p>Poți solicita ștergerea imediată a contului și datelor din secțiunea Profil sau prin email la contact@nutriaid.eu.</p>
          <h2>3. Anonimizarea datelor</h2>
          <p>Date statistice complet anonimizate pot fi reținute pe termen nedefinit pentru îmbunătățirea serviciului.</p>
          <h2>4. Contact</h2>
          <p>Întrebări despre retenția datelor: contact@nutriaid.eu</p>
        </>
      ) : (
        <>
          <p>This policy describes the retention periods for each category of data we process and the applicable deletion procedures.</p>
          <p>We retain personal data only for as long as necessary for the purpose for which it was collected or as required by law.</p>
          <h2>1. Data categories and retention periods</h2>
          <h3>1.1. Account data</h3>
          <ul>
            <li><strong>Type:</strong> Name, email, encrypted password.</li>
            <li><strong>Period:</strong> For the duration of the account + 30 days after requested deletion.</li>
            <li><strong>Reason:</strong> Required to provide the service and for security.</li>
          </ul>
          <h3>1.2. Profile data</h3>
          <ul>
            <li><strong>Type:</strong> Intolerances, dietary preferences.</li>
            <li><strong>Period:</strong> For the duration of the account.</li>
            <li><strong>Reason:</strong> Providing recommendation features.</li>
          </ul>
          <h3>1.3. Monitoring journal</h3>
          <ul>
            <li><strong>Type:</strong> Foods consumed, symptoms, personal notes.</li>
            <li><strong>Period:</strong> For the duration of the account; you can delete any entry at any time.</li>
            <li><strong>Reason:</strong> Providing personal journal functionality.</li>
          </ul>
          <h3>1.4. Recommendation history</h3>
          <ul>
            <li><strong>Type:</strong> Generated recommendations and their configuration.</li>
            <li><strong>Period:</strong> Maximum 24 months or until account deletion.</li>
          </ul>
          <h3>1.5. Technical data and logs</h3>
          <ul>
            <li><strong>Type:</strong> IP addresses, session activity, technical logs.</li>
            <li><strong>Period:</strong> Maximum 90 days.</li>
          </ul>
          <h3>1.6. Legal compliance data</h3>
          <ul>
            <li><strong>Type:</strong> Consent records, deletion logs.</li>
            <li><strong>Period:</strong> Minimum 3 years (legal requirement).</li>
          </ul>
          <h2>2. Data deletion</h2>
          <h3>2.1. Automatic deletion</h3>
          <p>Upon account deletion, all identifiable personal data is removed within 30 calendar days.</p>
          <h3>2.2. Deletion on request</h3>
          <p>You can request immediate deletion of your account and data from the Profile section or by emailing contact@nutriaid.eu.</p>
          <h2>3. Data anonymisation</h2>
          <p>Fully anonymised statistical data may be retained indefinitely for service improvement.</p>
          <h2>4. Contact</h2>
          <p>Questions about data retention: contact@nutriaid.eu</p>
        </>
      )}
    </LegalLayout>
  );
}
