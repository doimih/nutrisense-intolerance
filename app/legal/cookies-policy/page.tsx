import React from "react";
import type { Metadata } from "next";
import LegalLayout from "@/app/legal/_components/LegalLayout";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return { title: isRo ? "Politica de Cookies" : "Cookies Policy" };
}

export default function CookiesPolicyPage() {
  const isRo = getServerLanguage() === "ro";

  return (
    <LegalLayout
      titleRo="Politica de Cookies"
      titleEn="Cookies Policy"
      lastUpdatedRo="1 ianuarie 2025"
      lastUpdatedEn="1 January 2025"
    >
      {isRo ? (
        <>
          <p>Această politică explică ce sunt cookie-urile, cum le utilizăm în aplicația NutriAID Intolerances și ce opțiuni ai în privința lor.</p>
          <h2>1. Ce sunt cookie-urile?</h2>
          <p>Cookie-urile sunt fișiere text mici stocate pe dispozitivul tău atunci când vizitezi un site web sau utilizezi o aplicație web. Ele permit aplicației să &quot;își amintească&quot; anumite informații despre sesiunea ta.</p>
          <h2>2. Ce tipuri de cookie-uri utilizăm</h2>
          <h3>2.1. Cookie-uri strict necesare</h3>
          <p>Aceste cookie-uri sunt esențiale pentru funcționarea aplicației și nu pot fi dezactivate:</p>
          <ul>
            <li><strong>Cookie de sesiune:</strong> Menține sesiunea ta de autentificare activă pe durata utilizării aplicației.</li>
            <li><strong>Token de autentificare:</strong> Stochează tokenul securizat care confirmă că ești autentificat.</li>
            <li><strong>Preferințe de bază:</strong> Reține preferința ta de temă (dark/light mode).</li>
          </ul>
          <h3>2.2. Cookie-uri de performanță și analiză</h3>
          <p>În prezent, <strong>nu utilizăm</strong> cookie-uri de analiză sau de urmărire a comportamentului (Google Analytics, Hotjar etc.).</p>
          <h3>2.3. Cookie-uri de marketing</h3>
          <p><strong>Nu utilizăm</strong> cookie-uri de marketing, retargeting sau publicitate. Nu există reclame în aplicația noastră.</p>
          <h3>2.4. Cookie-uri terțe</h3>
          <p>Nu integrăm servicii terțe care să plaseze cookie-uri de tracking pe dispozitivul tău.</p>
          <h2>3. Durata de viață a cookie-urilor</h2>
          <ul>
            <li><strong>Cookie-uri de sesiune:</strong> Expiră la închiderea browser-ului.</li>
            <li><strong>Token de autentificare:</strong> Expiră după 24 de ore de inactivitate sau la deconectare.</li>
            <li><strong>Preferințe interfață:</strong> Stocate în localStorage, fără dată de expirare.</li>
          </ul>
          <h2>4. Cum controlezi cookie-urile</h2>
          <p>Poți controla cookie-urile prin setările browser-ului sau prin deconectare din cont.</p>
          <h2>5. Modificări ale politicii de cookies</h2>
          <p>Ne rezervăm dreptul de a actualiza această politică. Modificările semnificative vor fi anunțate în aplicație.</p>
          <h2>6. Contact</h2>
          <p>Întrebări despre utilizarea cookie-urilor: contact@nutriaid.eu</p>
        </>
      ) : (
        <>
          <p>This policy explains what cookies are, how we use them in the NutriAID Intolerances application and what options you have regarding them.</p>
          <h2>1. What are cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit a website or use a web application. They allow the application to &quot;remember&quot; certain information about your session.</p>
          <h2>2. What types of cookies do we use</h2>
          <h3>2.1. Strictly necessary cookies</h3>
          <p>These cookies are essential for the application to function and cannot be disabled:</p>
          <ul>
            <li><strong>Session cookie:</strong> Keeps your authentication session active while using the application.</li>
            <li><strong>Authentication token:</strong> Stores the secure token confirming you are authenticated.</li>
            <li><strong>Basic preferences:</strong> Remembers your theme preference (dark/light mode).</li>
          </ul>
          <h3>2.2. Performance and analytics cookies</h3>
          <p>We currently <strong>do not use</strong> analytics or behaviour-tracking cookies (Google Analytics, Hotjar, etc.).</p>
          <h3>2.3. Marketing cookies</h3>
          <p>We <strong>do not use</strong> marketing, retargeting or advertising cookies. There are no advertisements in our application.</p>
          <h3>2.4. Third-party cookies</h3>
          <p>We do not integrate third-party services that place tracking cookies on your device.</p>
          <h2>3. Cookie lifespan</h2>
          <ul>
            <li><strong>Session cookies:</strong> Expire when the browser is closed.</li>
            <li><strong>Authentication token:</strong> Expires after 24 hours of inactivity or on logout.</li>
            <li><strong>Interface preferences:</strong> Stored in localStorage, no expiry date.</li>
          </ul>
          <h2>4. How to control cookies</h2>
          <p>You can control cookies through your browser settings or by logging out of your account.</p>
          <h2>5. Changes to the cookies policy</h2>
          <p>We reserve the right to update this policy. Significant changes will be announced in the application.</p>
          <h2>6. Contact</h2>
          <p>Questions about cookie usage: contact@nutriaid.eu</p>
        </>
      )}
    </LegalLayout>
  );
}
