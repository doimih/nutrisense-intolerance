import React from "react";
import type { Metadata } from "next";
import LegalLayout from "@/app/legal/_components/LegalLayout";

export const metadata: Metadata = { title: "Politica de Cookies" };

export default function CookiesPolicyPage() {
  return (
    <LegalLayout title="Politica de Cookies" lastUpdated="1 ianuarie 2025">
      <p>
        Această politică explică ce sunt cookie-urile, cum le utilizăm în
        aplicația NutriAID Intolerances și ce opțiuni ai în privința lor.
      </p>

      <h2>1. Ce sunt cookie-urile?</h2>
      <p>
        Cookie-urile sunt fișiere text mici stocate pe dispozitivul tău atunci
        când vizitezi un site web sau utilizezi o aplicație web. Ele permit
        aplicației să &quot;își amintească&quot; anumite informații despre sesiunea ta.
      </p>

      <h2>2. Ce tipuri de cookie-uri utilizăm</h2>

      <h3>2.1. Cookie-uri strict necesare</h3>
      <p>
        Aceste cookie-uri sunt esențiale pentru funcționarea aplicației și nu
        pot fi dezactivate:
      </p>
      <ul>
        <li><strong>Cookie de sesiune:</strong> Menține sesiunea ta de autentificare activă pe durata utilizării aplicației.</li>
        <li><strong>Token de autentificare:</strong> Stochează tokenul securizat care confirmă că ești autentificat.</li>
        <li><strong>Preferințe de bază:</strong> Reține preferința ta de temă (dark/light mode).</li>
      </ul>
      <p>
        Aceste cookie-uri nu colectează informații personale și sunt strict
        necesare pentru furnizarea serviciului solicitat.
      </p>

      <h3>2.2. Cookie-uri de performanță și analiză</h3>
      <p>
        În prezent, <strong>nu utilizăm</strong> cookie-uri de analiză sau
        de urmărire a comportamentului (Google Analytics, Hotjar etc.).
      </p>

      <h3>2.3. Cookie-uri de marketing</h3>
      <p>
        <strong>Nu utilizăm</strong> cookie-uri de marketing, retargeting sau
        publicitate. Nu există reclame în aplicația noastră.
      </p>

      <h3>2.4. Cookie-uri terțe</h3>
      <p>
        Nu integrăm servicii terțe care să plaseze cookie-uri de tracking pe
        dispozitivul tău (social media, rețele de publicitate etc.).
      </p>

      <h2>3. Durata de viață a cookie-urilor</h2>
      <ul>
        <li><strong>Cookie-uri de sesiune:</strong> Expiră la închiderea browser-ului.</li>
        <li><strong>Token de autentificare:</strong> Expiră după 24 de ore de inactivitate sau la deconectare.</li>
        <li><strong>Preferințe interfață:</strong> Stocate în localStorage (nu cookie HTTP), fără dată de expirare.</li>
      </ul>

      <h2>4. Cum controlezi cookie-urile</h2>
      <p>Poți controla cookie-urile prin:</p>
      <ul>
        <li>
          <strong>Setările browser-ului:</strong> Poți configura browser-ul să
          blocheze sau să șteargă cookie-uri. Rețineți că blocarea
          cookie-urilor strict necesare va afecta funcționarea aplicației
          (vei fi deconectat la fiecare vizită).
        </li>
        <li>
          <strong>Deconectarea din cont:</strong> Elimină cookie-ul de sesiune
          imediat.
        </li>
      </ul>
      <p>Instrucțiuni pentru principalele browsere:</p>
      <ul>
        <li>Chrome: Setări → Confidențialitate și securitate → Cookie-uri</li>
        <li>Firefox: Opțiuni → Confidențialitate și securitate</li>
        <li>Safari: Preferințe → Confidențialitate</li>
        <li>Edge: Setări → Cookie-uri și permisiuni site</li>
      </ul>

      <h2>5. localStorage și sessionStorage</h2>
      <p>
        În plus față de cookie-uri, aplicația utilizează localStorage al
        browser-ului pentru a stoca preferințe de interfață (tema selectată)
        și cache temporar al datelor de profil. Aceste date rămân pe
        dispozitivul tău și nu sunt transmise serverului nostru în mod
        automat.
      </p>

      <h2>6. Modificări ale politicii de cookies</h2>
      <p>
        Ne rezervăm dreptul de a actualiza această politică. Modificările
        semnificative vor fi anunțate în aplicație.
      </p>

      <h2>7. Contact</h2>
      <p>
        Întrebări despre utilizarea cookie-urilor: contact@nutriaid.eu
      </p>
    </LegalLayout>
  );
}
