"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import Button from "@/components/Button";
import ErrorAlert from "@/components/ErrorAlert";
import { resendVerificationEmail } from "@/lib/api/auth";
import { useLanguage } from "@/components/LanguageProvider";

type VerifyResult = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
  email?: string;
};

export default function VerifyEmailPage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [result, setResult] = useState<VerifyResult>({ status: "idle", message: "" });
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setResult({
          status: "error",
          message: isRo
            ? "Lipseste tokenul de verificare din link."
            : "Verification token is missing from URL.",
        });
        return;
      }

      setResult({ status: "loading", message: "" });
      try {
        const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: "GET",
        });
        const payload = (await response.json()) as { message?: string; error?: string; email?: string };

        if (cancelled) return;

        if (!response.ok) {
          setResult({
            status: "error",
            message:
              payload.error ||
              (isRo
                ? "Link invalid sau expirat. Trimite un nou email de verificare."
                : "Invalid or expired link. Request a new verification email."),
            email: payload.email,
          });
          return;
        }

        setResult({
          status: "success",
          message:
            payload.message ||
            (isRo
              ? "Contul tau a fost verificat. Te poti autentifica."
              : "Your account has been verified. You can now sign in."),
          email: payload.email,
        });
      } catch {
        if (cancelled) return;
        setResult({
          status: "error",
          message: isRo ? "A aparut o eroare la verificare." : "Verification failed due to an unexpected error.",
        });
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [isRo, token]);

  const handleResend = async () => {
    if (!result.email) return;
    setResending(true);
    setResendMessage("");
    try {
      const resend = await resendVerificationEmail(result.email);
      setResendMessage(resend.message);
    } catch (err: unknown) {
      setResendMessage(
        err instanceof Error
          ? err.message
          : isRo
          ? "Nu am putut retrimite emailul."
          : "Could not resend verification email."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      title={isRo ? "Verificare email" : "Email verification"}
      subtitle={
        isRo
          ? "Confirmam adresa ta de email pentru activarea contului"
          : "We are confirming your email address to activate your account"
      }
      description={
        isRo
          ? "Dupa verificare, te poti autentifica si accesa platforma."
          : "After verification, you can sign in and access the platform."
      }
      footer={
        <Link href="/auth/login" className="text-green-600 dark:text-green-400 font-medium hover:underline">
          {isRo ? "Mergi la autentificare" : "Go to sign in"}
        </Link>
      }
    >
      {result.status === "loading" && (
        <ErrorAlert
          type="info"
          message={isRo ? "Se valideaza linkul de verificare..." : "Validating your verification link..."}
        />
      )}

      {result.status === "success" && <ErrorAlert type="success" message={result.message} />}

      {result.status === "error" && (
        <>
          <ErrorAlert message={result.message} />
          {result.email && (
            <Button type="button" fullWidth className="mt-4" loading={resending} onClick={handleResend}>
              {isRo ? "Retrimite emailul de verificare" : "Resend verification email"}
            </Button>
          )}
          {resendMessage && <ErrorAlert type="info" message={resendMessage} className="mt-4" />}
        </>
      )}
    </AuthCard>
  );
}
