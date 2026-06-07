import React from "react";
import type { Metadata } from "next";
import LegalLayout from "@/app/legal/_components/LegalLayout";

export const metadata: Metadata = { title: "Politica de Retenție a Datelor" };

export default function DataRetentionPage() {
  return (
    <LegalLayout title="Politica de Retenție a Datelor" lastUpdated="1 ianuarie 2025">
      <p>
        Această politică descrie perioadele de retenție pentru fiecare
        categorie de date pe care le procesăm și procedurile de ștergere
        aplicabile.
      </p>
      <p>
        Retenționăm datele personale numai atât timp cât este necesar pentru
        scopul pentru care au fost colectate sau atât timp cât legea impune.
      </p>

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
        <li><strong>Motiv:</strong> Permite accesul la recomandările anterioare.</li>
      </ul>

      <h3>1.5. Date tehnice și log-uri</h3>
      <ul>
        <li><strong>Tip:</strong> Adrese IP, activitate sesiuni, log-uri tehnice.</li>
        <li><strong>Perioadă:</strong> Maxim 90 de zile.</li>
        <li><strong>Motiv:</strong> Securitate, depanare tehnică, prevenirea abuzurilor.</li>
      </ul>

      <h3>1.6. Date pentru conformitate legală</h3>
      <ul>
        <li><strong>Tip:</strong> Evidențe de consimțământ, log-uri de ștergere.</li>
        <li><strong>Perioadă:</strong> Minim 3 ani (cerință legală).</li>
        <li><strong>Motiv:</strong> Obligații legale de documentare.</li>
      </ul>

      <h2>2. Ștergerea datelor</h2>

      <h3>2.1. Ștergere automată</h3>
      <p>
        La ștergerea contului (de către utilizator sau din cauza inactivității
        prelungite), toate datele personale identificabile sunt eliminate
        în termen de 30 de zile calendaristice. Log-urile tehnice sunt
        eliminate conform perioadei de retenție de 90 de zile.
      </p>

      <h3>2.2. Ștergere la cerere</h3>
      <p>
        Poți solicita ștergerea imediată a contului și datelor din:
      </p>
      <ul>
        <li>Secțiunea Profil din aplicație → &quot;Șterge contul&quot;.</li>
        <li>Email la: contact@nutrisense.ro, cu subiectul &quot;Cerere ștergere cont&quot;.</li>
      </ul>
      <p>
        Ștergerea este procesată în termen de 30 de zile și este permanentă
        și ireversibilă. Vei primi confirmare prin email.
      </p>

      <h3>2.3. Date care nu pot fi șterse imediat</h3>
      <p>
        Anumite date pot fi reținute și după solicitarea de ștergere, strict
        în măsura necesară pentru:
      </p>
      <ul>
        <li>Respectarea obligațiilor legale de raportare.</li>
        <li>Soluționarea litigiilor în curs.</li>
        <li>Prevenirea fraudelor și asigurarea securității platformei.</li>
      </ul>
      <p>
        În aceste cazuri, datele sunt izolate și utilizate exclusiv în
        scopul specificat, iar accesul la ele este strict restricționat.
      </p>

      <h2>3. Anonimizarea datelor</h2>
      <p>
        Date statistice complet anonimizate (fără identificatori personali)
        pot fi reținute pe termen nedefinit pentru îmbunătățirea serviciului.
        Aceste date nu pot fi utilizate pentru a te identifica.
      </p>

      <h2>4. Revizuirea periodică</h2>
      <p>
        Această politică este revizuită anual sau ori de câte ori apar
        modificări semnificative ale serviciului sau ale cerințelor legale.
      </p>

      <h2>5. Contact</h2>
      <p>
        Întrebări despre retenția datelor: contact@nutrisense.ro
      </p>
    </LegalLayout>
  );
}
