import React from "react";
import type { Metadata } from "next";
import LegalLayout from "@/app/legal/_components/LegalLayout";

export const metadata: Metadata = {
  title: "Politica de Confidențialitate",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Politica de Confidențialitate" lastUpdated="1 ianuarie 2025">
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
      <p>
        Nu colectăm informații financiare, numere de card, CNP sau alte
        identificatoare guvernamentale.
      </p>

      <h2>2. Cum utilizăm datele</h2>
      <p>Datele tale sunt utilizate exclusiv pentru:</p>
      <ul>
        <li>Furnizarea funcționalităților aplicației (gestionarea contului, generarea recomandărilor, stocarea jurnalului).</li>
        <li>Asigurarea securității contului tău și prevenirea accesului neautorizat.</li>
        <li>Îmbunătățirea aplicației pe baza utilizării agregate și anonimizate.</li>
        <li>Comunicări tehnice necesare (resetarea parolei, notificări de securitate).</li>
      </ul>
      <p>
        Nu utilizăm datele tale în scopuri de marketing și nu vindem datele
        tale nimănui.
      </p>

      <h2>3. Baza legală pentru prelucrare</h2>
      <p>Prelucrăm datele tale în baza:</p>
      <ul>
        <li><strong>Consimțământului:</strong> dat la crearea contului și acceptarea acestor termeni.</li>
        <li><strong>Contractului:</strong> executarea serviciilor pe care le soliciti prin utilizarea aplicației.</li>
        <li><strong>Interesului legitim:</strong> pentru securitatea platformei și prevenirea fraudei.</li>
      </ul>

      <h2>4. Partajarea datelor cu terți</h2>
      <p>
        Nu vindem, nu închiriem și nu partajăm datele tale cu terți în scopuri
        comerciale. Datele pot fi dezvăluite exclusiv în cazul în care:
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
        Datele tale sunt reținute atât timp cât contul tău este activ. La
        ștergerea contului, toate datele personale sunt eliminate permanent
        în termen de 30 de zile. Datele agregate și anonimizate pot fi
        reținute pentru statistici interne.
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
      <p>
        Pentru exercitarea acestor drepturi, contactează-ne la
        contact@nutriaid.ro. Răspundem în termen de 30 de zile.
      </p>

      <h2>8. Cookie-uri</h2>
      <p>
        Utilizăm cookie-uri strict necesare pentru funcționarea aplicației
        (sesiuni de autentificare). Nu utilizăm cookie-uri de tracking sau
        marketing. Detalii în{" "}
        <a href="/legal/cookies-policy" className="text-green-600 dark:text-green-400 hover:underline">
          Politica de Cookies
        </a>
        .
      </p>

      <h2>9. Transferuri internaționale</h2>
      <p>
        Datele tale sunt stocate în Uniunea Europeană sau în țări cu nivel
        adecvat de protecție recunoscut de Comisia Europeană.
      </p>

      <h2>10. Modificări ale politicii</h2>
      <p>
        Putem actualiza această politică periodic. Te vom notifica prin email
        sau prin notificare în aplicație cu cel puțin 30 de zile înainte de
        intrarea în vigoare a modificărilor semnificative.
      </p>

      <h2>11. Contact</h2>
      <p>
        Pentru orice întrebări privind confidențialitatea datelor, contactează-ne:
      </p>
      <ul>
        <li>Email: contact@nutriaid.ro</li>
        <li>Adresă: [Adresa operatorului de date]</li>
      </ul>
      <p>
        Ai dreptul să depui o plângere la Autoritatea Națională de
        Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP).
      </p>
    </LegalLayout>
  );
}
