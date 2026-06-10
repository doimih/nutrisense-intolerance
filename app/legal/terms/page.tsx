import React from "react";
import type { Metadata } from "next";
import LegalLayout from "@/app/legal/_components/LegalLayout";

export const metadata: Metadata = { title: "Termeni și Condiții" };

export default function TermsPage() {
  return (
    <LegalLayout title="Termeni și Condiții de Utilizare" lastUpdated="10 iunie 2025">
      <p>
        Acești Termeni și Condiții (&quot;Termenii&quot;) guvernează utilizarea aplicației
        web NutriAID Intolerances (&quot;Aplicația&quot;, &quot;Serviciul&quot;). Prin crearea
        unui cont sau utilizarea Aplicației, accepți integral acești Termeni.
        Dacă nu ești de acord, nu utiliza Aplicația.
      </p>

      <h2>1. Descrierea serviciului</h2>
      <p>
        NutriAID Intolerances este o aplicație web gratuită destinată
        persoanelor cu intoleranțe alimentare, care permite:
      </p>
      <ul>
        <li>Gestionarea unui profil personal cu intoleranțe și preferințe alimentare.</li>
        <li>Generarea de recomandări generale cu caracter informativ.</li>
        <li>Menținerea unui jurnal personal de monitorizare a simptomelor.</li>
        <li>Vizualizarea istoricului de recomandări generate.</li>
      </ul>
      <p>
        Serviciul are caracter exclusiv informativ și nu constituie consultanță
        medicală, nutrițională sau de sănătate.
      </p>

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
      <p>
        Nu transmite credențialele contului tău altor persoane. Fiecare
        persoană din familie trebuie să aibă propriul cont.
      </p>

      <h2>4. Utilizare acceptabilă</h2>
      <p>Ești de acord să nu:</p>
      <ul>
        <li>Utilizezi Aplicația în scopuri ilegale sau care încalcă drepturile altora.</li>
        <li>Introduci informații false, înșelătoare sau dăunătoare.</li>
        <li>Încerci să accesezi sau să modifici datele altor utilizatori.</li>
        <li>Automatizezi accesul sau extragi date prin scraping.</li>
        <li>Utilizezi Aplicația pentru a distribui spam sau conținut malițios.</li>
        <li>Faci inginerie inversă sau să copiezi codul aplicației.</li>
      </ul>

      <h2>5. Limitarea răspunderii</h2>
      <p>
        <strong>Aplicația este furnizată &quot;ca atare&quot;.</strong> În măsura permisă
        de lege, nu garantăm că:
      </p>
      <ul>
        <li>Serviciul va fi disponibil neîntrerupt sau fără erori.</li>
        <li>Recomandările generate sunt corecte, complete sau potrivite situației tale.</li>
        <li>Aplicația înlocuiește consultul unui specialist în nutriție sau medicină.</li>
      </ul>
      <p>
        Nu suntem răspunzători pentru prejudicii directe sau indirecte
        rezultate din utilizarea sau imposibilitatea utilizării Serviciului,
        inclusiv prejudicii de sănătate rezultate din ignorarea consultului
        medical profesionist.
      </p>

      <h2>6. Disclaimer medical — precizare esențială</h2>
      <p>
        <strong>
          NutriAID Intolerances nu este o aplicație medicală și nu furnizează
          sfaturi medicale.
        </strong>{" "}
        Orice recomandare generată are caracter general și informativ. Nu
        înlocuiește, sub nicio formă, consultul unui medic, alergolog,
        nutriționist sau alt specialist în sănătate. Consultați întotdeauna
        un profesionist înainte de a face modificări semnificative în
        alimentație, mai ales în cazul alergiilor severe sau afecțiunilor
        cronice.
      </p>

      <h2>7. Delimitarea față de profesia de dietetician (Legea nr. 256/2015)</h2>
      <p>
        Profesia de dietetician este reglementată în România prin Legea nr. 256/2015.{" "}
        <strong>
          Platforma NutriAID Intolerances nu prestează servicii de dietetică în sensul
          Legii nr. 256/2015 și nu înlocuiește intervențiile nutriționale ghidate de un
          dietetician autorizat.
        </strong>
      </p>
      <p>
        Recomandările generate de platforma noastră sunt produse exclusiv pe baza datelor
        introduse de utilizator, prin algoritmi informatici și modele de inteligență artificială,
        fără implicarea unui profesionist în domeniul nutriției sau dieteticii. Acestea au
        caracter exclusiv informativ și orientativ.
      </p>
      <p>
        Pentru orice problemă de sănătate legată de alimentație, intoleranțe sau alergii,
        recomandăm consultarea unui dietetician autorizat, medic nutriționist sau
        alt specialist în sănătate cu drept de liberă practică.
      </p>

      <h2>8. Dreptul de retragere — conținut digital (OUG nr. 34/2014)</h2>
      <p>
        În conformitate cu Ordonanța de Urgență nr. 34/2014 privind drepturile consumatorilor
        în cadrul contractelor încheiate cu profesioniștii, consumatorii beneficiază, în
        principiu, de un drept de retragere de 14 zile calendaristice.
      </p>
      <p>
        <strong>
          Cu toate acestea, prin activarea unui abonament plătit pe platforma NutriAID
          Intolerances, utilizatorul consimte în mod expres la livrarea imediată a conținutului
          digital și, în consecință, își pierde dreptul de retragere de 14 zile, în
          conformitate cu art. 16 lit. m) din OUG nr. 34/2014.
        </strong>
      </p>
      <p>
        Această pierdere a dreptului de retragere intervine deoarece:
      </p>
      <ul>
        <li>Serviciul este un conținut digital furnizat pe un suport imaterial.</li>
        <li>Accesul la funcționalitățile plătite devine disponibil imediat după confirmarea plății.</li>
        <li>
          Utilizatorul și-a exprimat acordul prealabil expres prin inițierea procedurii
          de checkout și activarea abonamentului.
        </li>
      </ul>
      <p>
        Anularea unui abonament activ se poate face oricând din secțiunea <em>Profil → Abonament</em>{" "}
        sau prin contactarea noastră la contact@nutriaid.eu. Anularea oprește reînnoirea
        automată, dar nu generează rambursarea perioadei deja plătite și utilizate.
      </p>

      <h2>9. Proprietate intelectuală</h2>
      <p>
        Toate drepturile de proprietate intelectuală asupra Aplicației,
        inclusiv codul sursă, designul, mărcile și conținutul, aparțin
        NutriAID Intolerances sau licențiatorilor săi. Ești autorizat să
        utilizezi Aplicația exclusiv pentru uz personal, necomercial.
      </p>
      <p>
        Datele pe care le introduci în aplicație (jurnal, profil) rămân
        proprietatea ta.
      </p>

      <h2>10. Modificări ale serviciului</h2>
      <p>
        Ne rezervăm dreptul de a modifica, suspenda sau întrerupe orice
        parte a Serviciului, cu sau fără notificare prealabilă. Modificările
        semnificative vor fi anunțate cu cel puțin 30 de zile înainte.
      </p>

      <h2>11. Modificări ale termenilor</h2>
      <p>
        Putem revizui acești Termeni periodic. Continuarea utilizării
        Aplicației după publicarea modificărilor constituie acceptul lor.
        Dacă nu ești de acord cu noii Termeni, poți șterge contul.
      </p>

      <h2>12. Rezilierea</h2>
      <p>
        Poți șterge contul oricând. Ne rezervăm dreptul de a suspenda sau
        închide conturile care încalcă acești Termeni, fără notificare
        prealabilă în cazul încălcărilor grave.
      </p>

      <h2>13. Legea aplicabilă</h2>
      <p>
        Acești Termeni sunt guvernați de legislația română și a Uniunii
        Europene. Orice litigiu va fi soluționat de instanțele competente
        din România, cu excepția cazului în care legislația aplicabilă
        prevede altfel.
      </p>

      <h2>14. Contact</h2>
      <p>
        Întrebări despre acești Termeni: contact@nutriaid.eu
      </p>
    </LegalLayout>
  );
}
