import React from "react";
import type { Metadata } from "next";
import LegalLayout from "@/app/legal/_components/LegalLayout";
import { getServerLanguage } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const isRo = getServerLanguage() === "ro";
  return { title: isRo ? "Politica de Securitate" : "Security Policy" };
}

export default function SecurityPolicyPage() {
  const isRo = getServerLanguage() === "ro";

  return (
    <LegalLayout
      titleRo="Politica de Securitate"
      titleEn="Security Policy"
      lastUpdatedRo="1 ianuarie 2025"
      lastUpdatedEn="1 January 2025"
    >
      {isRo ? (
        <>
          <p>Securitatea datelor tale este o prioritate pentru NutriAID Intolerances. Această politică descrie măsurile de securitate implementate și responsabilitățile utilizatorilor.</p>
          <h2>1. Măsuri tehnice de securitate</h2>
          <h3>1.1. Transmiterea datelor</h3>
          <ul>
            <li>Toate comunicațiile sunt criptate folosind TLS 1.2 sau superior (HTTPS).</li>
            <li>Certificatele SSL sunt reînnoite automat și monitorizate permanent.</li>
          </ul>
          <h3>1.2. Stocarea parolelor</h3>
          <ul>
            <li>Parolele sunt stocate exclusiv sub formă de hash, folosind algoritmi securizați (bcrypt sau Argon2).</li>
            <li>Niciun angajat nu poate vedea parola ta în text clar.</li>
          </ul>
          <h3>1.3. Autentificare și sesiuni</h3>
          <ul>
            <li>Sesiunile sunt gestionate prin JWT (JSON Web Tokens) semnate criptografic.</li>
            <li>Tokenele de acces expiră după o perioadă limitată de inactivitate.</li>
          </ul>
          <h2>2. Responsabilitățile utilizatorului</h2>
          <p>Pentru securitatea contului tău, te rugăm:</p>
          <ul>
            <li>Utilizează o parolă puternică, unică pentru acest cont.</li>
            <li>Nu partaja credențialele contului cu alte persoane.</li>
            <li>Deconectează-te după utilizare pe dispozitive partajate sau publice.</li>
          </ul>
          <h2>3. Raportarea vulnerabilităților</h2>
          <p>Dacă ai descoperit o vulnerabilitate de securitate, te rugăm să ne raportezi la <strong>security@nutriaid.ro</strong>. Ne angajăm să confirmăm primirea în 48 de ore și să remediem problema.</p>
          <h2>4. Notificarea breșelor de securitate</h2>
          <p>În cazul unui incident, autoritatea de supraveghere va fi notificată în 72 de ore, iar utilizatorii afectați fără întârzieri nejustificate.</p>
          <h2>5. Contact</h2>
          <p>Probleme de securitate: security@nutriaid.ro</p>
        </>
      ) : (
        <>
          <p>The security of your data is a priority for NutriAID Intolerances. This policy describes the security measures implemented and user responsibilities.</p>
          <h2>1. Technical security measures</h2>
          <h3>1.1. Data transmission</h3>
          <ul>
            <li>All communications are encrypted using TLS 1.2 or higher (HTTPS).</li>
            <li>SSL certificates are automatically renewed and permanently monitored.</li>
          </ul>
          <h3>1.2. Password storage</h3>
          <ul>
            <li>Passwords are stored exclusively as hashes, using secure algorithms (bcrypt or Argon2).</li>
            <li>No employee can see your password in plain text.</li>
          </ul>
          <h3>1.3. Authentication and sessions</h3>
          <ul>
            <li>Sessions are managed through cryptographically signed JWTs (JSON Web Tokens).</li>
            <li>Access tokens expire after a limited period of inactivity.</li>
          </ul>
          <h2>2. User responsibilities</h2>
          <p>To keep your account secure, please:</p>
          <ul>
            <li>Use a strong password, unique to this account.</li>
            <li>Do not share your account credentials with other people.</li>
            <li>Log out after using shared or public devices.</li>
          </ul>
          <h2>3. Reporting vulnerabilities</h2>
          <p>If you have discovered a security vulnerability, please report it responsibly to <strong>security@nutriaid.ro</strong>. We commit to acknowledging receipt within 48 hours and remedying the issue.</p>
          <h2>4. Security breach notification</h2>
          <p>In the event of an incident, the supervisory authority will be notified within 72 hours and affected users without undue delay.</p>
          <h2>5. Contact</h2>
          <p>Security issues: security@nutriaid.ro</p>
        </>
      )}
    </LegalLayout>
  );
}
