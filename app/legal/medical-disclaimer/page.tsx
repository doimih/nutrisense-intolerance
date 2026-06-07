import React from "react";
import type { Metadata } from "next";
import LegalLayout from "@/app/legal/_components/LegalLayout";

export const metadata: Metadata = { title: "Disclaimer Medical" };

export default function MedicalDisclaimerPage() {
  return (
    <LegalLayout title="Disclaimer Medical" lastUpdated="1 ianuarie 2025">
      <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5 mb-6">
        <p className="font-semibold text-orange-800 dark:text-orange-300 text-base">
          ⚠️ Precizare importantă — citește cu atenție
        </p>
        <p className="text-orange-700 dark:text-orange-400 text-sm mt-2">
          NutriSense Intolerances nu este o aplicație medicală și nu furnizează
          sfaturi medicale, nutriționale sau de tratament. Informațiile
          disponibile în această aplicație au exclusiv caracter general și
          informativ.
        </p>
      </div>

      <h2>1. Ce este NutriSense Intolerances</h2>
      <p>
        NutriSense Intolerances este un instrument digital de organizare
        personală, destinat să ajute utilizatorii să:
      </p>
      <ul>
        <li>Noteze și monitorizeze intoleranțele alimentare cunoscute.</li>
        <li>Acceseze informații generale disponibile public despre intoleranțe comune.</li>
        <li>Mențină un jurnal personal al simptomelor și alimentelor consumate.</li>
      </ul>
      <p>
        Aplicația <strong>nu diagnostichează</strong>, <strong>nu prescrie</strong>{" "}
        și <strong>nu tratează</strong> nicio afecțiune medicală.
      </p>

      <h2>2. Limitele informațiilor furnizate</h2>
      <p>
        Recomandările generate de aplicație sunt:
      </p>
      <ul>
        <li>Bazate pe informații generale disponibile public, nu pe evaluare medicală individuală.</li>
        <li>Orientative — nu reprezintă un plan alimentar personalizat.</li>
        <li>Incomplete prin natura lor — nu iau în considerare toate condițiile tale de sănătate.</li>
        <li>Fără valoare diagnostică — nu pot confirma sau infirma o intoleranță sau alergie alimentară.</li>
      </ul>

      <h2>3. Situații care necesită consultul medical obligatoriu</h2>
      <p>
        <strong>Consultați imediat un medic</strong> dacă prezinți:
      </p>
      <ul>
        <li>Reacții alergice severe (anafilaxie): dificultăți de respirație, umflarea feței/gâtului, pierderea cunoștinței.</li>
        <li>Simptome digestive severe sau persistente.</li>
        <li>Pierdere în greutate inexplicabilă.</li>
        <li>Sânge în scaun sau vomă.</li>
        <li>Simptome care se înrăutățesc în ciuda modificărilor alimentare.</li>
      </ul>
      <p>
        În caz de urgență medicală, sunați la 112 (România) sau mergeți imediat
        la cel mai apropiat serviciu de urgențe.
      </p>

      <h2>4. Diferența dintre intoleranță și alergie</h2>
      <p>
        Este important de înțeles că <strong>intoleranța alimentară</strong> și{" "}
        <strong>alergia alimentară</strong> sunt afecțiuni diferite, cu
        mecanisme, severitate și tratament diferite:
      </p>
      <ul>
        <li>
          <strong>Intoleranța alimentară</strong> implică, de regulă, un
          mecanism non-imunologic, cu simptome digestive, și este rareori
          amenințătoare de viață.
        </li>
        <li>
          <strong>Alergia alimentară</strong> implică sistemul imunitar și
          poate duce la reacții severe (anafilaxie), care pot fi
          amenințătoare de viață.
        </li>
      </ul>
      <p>
        Această aplicație nu este concepută pentru gestionarea alergiilor
        alimentare severe. Persoanele cu alergii diagnosticate trebuie să
        urmeze planul de management stabilit de medicul alergolog.
      </p>

      <h2>5. Necesitatea consultului profesionist</h2>
      <p>
        Înainte de a face modificări semnificative în alimentație, în special
        dacă suspectezi o intoleranță sau alergie alimentară, consultă:
      </p>
      <ul>
        <li>Un <strong>medic de familie</strong> sau <strong>gastroenterolog</strong> pentru evaluare inițială.</li>
        <li>Un <strong>alergolog</strong> dacă există suspiciunea unei alergii alimentare.</li>
        <li>Un <strong>nutriționist/dietetician</strong> pentru un plan alimentar personalizat.</li>
      </ul>

      <h2>6. Responsabilitatea utilizatorului</h2>
      <p>
        Prin utilizarea acestei aplicații, recunoști și accepți că:
      </p>
      <ul>
        <li>Ești responsabil pentru deciziile alimentare pe care le iei.</li>
        <li>Informațiile din aplicație nu înlocuiesc consultul medical.</li>
        <li>NutriSense Intolerances nu este răspunzător pentru consecințele unor decizii alimentare luate exclusiv pe baza informațiilor din aplicație.</li>
        <li>Jurnalul de monitorizare este un instrument de uz personal, nu un document medical.</li>
      </ul>

      <h2>7. Limitarea răspunderii</h2>
      <p>
        În măsura permisă de legea aplicabilă, NutriSense Intolerances, echipa
        sa și furnizorii săi nu sunt răspunzători pentru orice prejudicii
        de sănătate, directe sau indirecte, rezultate din utilizarea
        informațiilor disponibile în aplicație în locul consultului medical
        profesionist.
      </p>

      <h2>8. Actualizarea informațiilor</h2>
      <p>
        Deși depunem eforturi pentru a menține informațiile actualizate,
        cunoașterea medicală evoluează constant. Informațiile generale din
        aplicație pot să nu reflecte cele mai recente descoperiri sau
        recomandări clinice. Consultați întotdeauna un specialist actualizat
        în domeniu.
      </p>
    </LegalLayout>
  );
}
