import React from "react";
import type { Metadata } from "next";
import LegalLayout from "@/app/legal/_components/LegalLayout";

export const metadata: Metadata = { title: "Politica de Securitate" };

export default function SecurityPolicyPage() {
  return (
    <LegalLayout title="Politica de Securitate" lastUpdated="1 ianuarie 2025">
      <p>
        Securitatea datelor tale este o prioritate pentru NutriSense
        Intolerances. Această politică descrie măsurile de securitate
        implementate și responsabilitățile utilizatorilor.
      </p>

      <h2>1. Măsuri tehnice de securitate</h2>

      <h3>1.1. Transmiterea datelor</h3>
      <ul>
        <li>Toate comunicațiile sunt criptate folosind TLS 1.2 sau superior (HTTPS).</li>
        <li>Certificatele SSL sunt reînnoite automat și monitorizate permanent.</li>
        <li>Conexiunile HTTP sunt redirecționate automat către HTTPS.</li>
      </ul>

      <h3>1.2. Stocarea parolelor</h3>
      <ul>
        <li>Parolele sunt stocate exclusiv sub formă de hash, folosind algoritmi de hashing securizați (bcrypt sau Argon2).</li>
        <li>Niciun angajat nu poate vedea parola ta în text clar.</li>
        <li>Resetarea parolei se realizează prin link securizat cu expirare.</li>
      </ul>

      <h3>1.3. Autentificare și sesiuni</h3>
      <ul>
        <li>Sesiunile sunt gestionate prin JWT (JSON Web Tokens) semnate criptografic.</li>
        <li>Tokenele de acces expiră după o perioadă limitată de inactivitate.</li>
        <li>La deconectare, toate sesiunile active sunt invalidate.</li>
      </ul>

      <h3>1.4. Baza de date</h3>
      <ul>
        <li>Datele sunt stocate pe servere securizate, cu acces restricționat.</li>
        <li>Backup-uri automate periodice cu criptare.</li>
        <li>Separarea datelor prin izolare la nivel de aplicație.</li>
      </ul>

      <h2>2. Măsuri organizatorice</h2>
      <ul>
        <li>Accesul la datele utilizatorilor este restricționat la personalul autorizat pe baza principiului &quot;minim necesar&quot;.</li>
        <li>Angajații au obligații contractuale de confidențialitate.</li>
        <li>Verificări periodice de securitate și teste de penetrare.</li>
        <li>Proceduri de răspuns la incidente documentate și testate.</li>
      </ul>

      <h2>3. Responsabilitățile utilizatorului</h2>
      <p>Pentru securitatea contului tău, te rugăm:</p>
      <ul>
        <li>Utilizează o parolă puternică, unică pentru acest cont (minim 8 caractere, combinație de litere, cifre și caractere speciale).</li>
        <li>Nu partaja credențialele contului cu alte persoane.</li>
        <li>Deconectează-te după utilizare pe dispozitive partajate sau publice.</li>
        <li>Menține software-ul (browser, sistem de operare) actualizat.</li>
        <li>Fii atent la tentative de phishing — nu vom solicita niciodată parola prin email.</li>
      </ul>

      <h2>4. Raportarea vulnerabilităților</h2>
      <p>
        Dacă ai descoperit o vulnerabilitate de securitate, te rugăm să ne
        raportezi responsabil la <strong>security@nutrisense.ro</strong> înainte de
        a o face publică. Ne angajăm să:
      </p>
      <ul>
        <li>Confirmăm primirea raportului în 48 de ore.</li>
        <li>Investigăm și remediem problema în timp rezonabil.</li>
        <li>Te informăm despre progresul remedierii.</li>
        <li>Recunoaștem contribuția ta (dacă dorești).</li>
      </ul>

      <h2>5. Notificarea breșelor de securitate</h2>
      <p>
        În cazul unui incident de securitate care afectează datele tale
        personale, te vom notifica conform cerințelor GDPR:
      </p>
      <ul>
        <li>Autoritatea de supraveghere (ANSPDCP) va fi notificată în 72 de ore de la descoperire.</li>
        <li>Utilizatorii afectați vor fi notificați fără întârzieri nejustificate dacă incidentul prezintă un risc ridicat pentru drepturile lor.</li>
        <li>Notificarea va include natura incidentului, datele afectate, măsurile luate și recomandările pentru utilizatori.</li>
      </ul>

      <h2>6. Limitele securității</h2>
      <p>
        Deși implementăm măsuri riguroase de securitate, nicio metodă de
        transmitere sau stocare electronică nu este 100% sigură. Nu putem
        garanta securitate absolută, dar ne angajăm să menținem standarde
        ridicate și să acționăm prompt în caz de incident.
      </p>

      <h2>7. Contact securitate</h2>
      <p>
        Pentru probleme de securitate: security@nutrisense.ro<br />
        Pentru alte întrebări: contact@nutrisense.ro
      </p>
    </LegalLayout>
  );
}
