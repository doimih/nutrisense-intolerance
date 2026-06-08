"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import FormField, { Input } from "@/components/FormField";
import Button from "@/components/Button";
import { useLanguage } from "@/components/LanguageProvider";

export default function ForgotPasswordPage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError(isRo ? "Introdu adresa de email." : "Enter your email address."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Reset request failed.");
      }

      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (isRo ? "A aparut o eroare." : "An error occurred."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={isRo ? "Resetare parola" : "Reset password"}
      subtitle={isRo ? "Iti trimitem un link de resetare pe email" : "We will send you a reset link by email"}
      description={
        isRo
          ? "Introdu adresa de email asociata contului tau si iti vom trimite instructiunile de resetare."
          : "Enter the email address associated with your account and we will send reset instructions."
      }
      footer={
        <Link href="/auth/login" className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          {isRo ? "Inapoi la autentificare" : "Back to sign in"}
        </Link>
      }
    >
      {sent ? (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isRo ? (
              <>
                Daca exista un cont cu adresa <strong>{email}</strong>, vei primi
                un email cu instructiunile de resetare in cateva minute.
              </>
            ) : (
              <>
                If an account exists for <strong>{email}</strong>, you will receive
                a reset email in a few minutes.
              </>
            )}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label={isRo ? "Adresa de email" : "Email address"} required error={error}>
            <Input
              type="email"
              placeholder={isRo ? "ana@exemplu.ro" : "anna@example.com"}
              value={email}
              error={!!error}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
            />
          </FormField>
          <Button type="submit" loading={loading} fullWidth size="lg">
            {isRo ? "Trimite link de resetare" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
