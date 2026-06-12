import React from "react";
import type { Metadata } from "next";
import LegalLayout from "@/app/legal/_components/LegalLayout";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return { title: isRo ? "Disclaimer Medical" : "Medical Disclaimer" };
}

export default function MedicalDisclaimerPage() {
  const isRo = getServerLanguage() === "ro";

  return (
    <LegalLayout
      titleRo="Disclaimer Medical"
      titleEn="Medical Disclaimer"
      lastUpdatedRo="1 ianuarie 2025"
      lastUpdatedEn="1 January 2025"
    >
      {isRo ? (
        <>
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5 mb-6">
            <p className="font-semibold text-orange-800 dark:text-orange-300 text-base">⚠️ Precizare importantă — citește cu atenție</p>
            <p className="text-orange-700 dark:text-orange-400 text-sm mt-2">
              NutriAID Intolerances nu este o aplicație medicală și nu furnizează sfaturi medicale, nutriționale sau de tratament. Informațiile disponibile în această aplicație au exclusiv caracter general și informativ.
            </p>
          </div>
          <h2>1. Ce este NutriAID Intolerances</h2>
          <p>NutriAID Intolerances este un instrument digital de organizare personală, destinat să ajute utilizatorii să:</p>
          <ul>
            <li>Noteze și monitorizeze intoleranțele alimentare cunoscute.</li>
            <li>Acceseze informații generale disponibile public despre intoleranțe comune.</li>
            <li>Mențină un jurnal personal al simptomelor și alimentelor consumate.</li>
          </ul>
          <p>Aplicația <strong>nu diagnostichează</strong>, <strong>nu prescrie</strong> și <strong>nu tratează</strong> nicio afecțiune medicală.</p>
          <h2>2. Situații care necesită consultul medical obligatoriu</h2>
          <p><strong>Consultați imediat un medic</strong> dacă prezinți reacții alergice severe, simptome digestive severe sau persistente, sau orice alt simptom grav. În caz de urgență sunați la 112.</p>
          <h2>3. Necesitatea consultului profesionist</h2>
          <p>Înainte de a face modificări semnificative în alimentație, consultă un medic de familie, alergolog sau nutriționist/dietetician.</p>
          <h2>4. Limitarea răspunderii</h2>
          <p>În măsura permisă de legea aplicabilă, NutriAID Intolerances nu este răspunzător pentru prejudicii de sănătate rezultate din utilizarea informațiilor din aplicație în locul consultului medical profesionist.</p>
        </>
      ) : (
        <>
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5 mb-6">
            <p className="font-semibold text-orange-800 dark:text-orange-300 text-base">⚠️ Important notice — please read carefully</p>
            <p className="text-orange-700 dark:text-orange-400 text-sm mt-2">
              NutriAID Intolerances is not a medical application and does not provide medical, nutritional or treatment advice. The information available in this application is exclusively general and informational.
            </p>
          </div>
          <h2>1. What is NutriAID Intolerances</h2>
          <p>NutriAID Intolerances is a personal organisation digital tool designed to help users:</p>
          <ul>
            <li>Record and monitor known food intolerances.</li>
            <li>Access general publicly available information about common intolerances.</li>
            <li>Maintain a personal journal of symptoms and foods consumed.</li>
          </ul>
          <p>The application <strong>does not diagnose</strong>, <strong>does not prescribe</strong> and <strong>does not treat</strong> any medical condition.</p>
          <h2>2. Situations requiring mandatory medical consultation</h2>
          <p><strong>Consult a doctor immediately</strong> if you experience severe allergic reactions, severe or persistent digestive symptoms, or any other serious symptom. In case of emergency call the emergency services.</p>
          <h2>3. Need for professional consultation</h2>
          <p>Before making significant changes to your diet, consult a GP, allergist or registered dietitian/nutritionist.</p>
          <h2>4. Limitation of liability</h2>
          <p>To the extent permitted by applicable law, NutriAID Intolerances is not liable for health damages resulting from using information from the application instead of professional medical consultation.</p>
        </>
      )}
    </LegalLayout>
  );
}
