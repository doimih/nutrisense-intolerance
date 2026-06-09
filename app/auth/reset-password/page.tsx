"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import FormField, { Input } from "@/components/FormField";
import Button from "@/components/Button";
import ErrorAlert from "@/components/ErrorAlert";
import { useLanguage } from "@/components/LanguageProvider";

export default function ResetPasswordPage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!token) {
    return (
      <AuthCard
        title={isRo ? "Link invalid" : "Invalid link"}
        subtitle={isRo ? "Linkul de resetare lipsește" : "Reset link is missing"}
        description={isRo ? "Accesează linkul din emailul de resetare." : "Please use the link from the reset email."}
        footer={
          <Link href="/auth/forgot-password" className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 hover:underline">
            {isRo ? "Solicită un link nou" : "Request a new link"}
          </Link>
        }
      >
        <div />
      </AuthCard>
    );
  }

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.password) errors.password = isRo ? "Parola este obligatorie." : "Password is required.";
    else if (form.password.length < 8) errors.password = isRo ? "Minim 8 caractere." : "At least 8 characters.";
    if (!form.confirmPassword) errors.confirmPassword = isRo ? "Confirmă parola." : "Confirm your password.";
    else if (form.password !== form.confirmPassword) errors.confirmPassword = isRo ? "Parolele nu coincid." : "Passwords do not match.";
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(body.error ?? (isRo ? "Eroare la resetare." : "Reset failed."));
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (isRo ? "A apărut o eroare." : "An error occurred."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={isRo ? "Parolă nouă" : "New password"}
      subtitle={isRo ? "Alege o parolă sigură" : "Choose a secure password"}
      description={isRo ? "Introduceți noua parolă pentru contul dvs. NutriAID." : "Enter the new password for your NutriAID account."}
      footer={
        <Link href="/auth/login" className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          {isRo ? "Înapoi la autentificare" : "Back to sign in"}
        </Link>
      }
    >
      {done ? (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
            {isRo ? "Parola a fost resetată!" : "Password reset successfully!"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isRo ? "Vei fi redirecționat spre autentificare..." : "Redirecting to sign in..."}
          </p>
        </div>
      ) : (
        <>
          {error && <ErrorAlert message={error} className="mb-4" onDismiss={() => setError("")} />}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label={isRo ? "Parolă nouă" : "New password"}
              required
              error={fieldErrors.password}
              inputId="new-password"
            >
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isRo ? "Minim 8 caractere" : "At least 8 characters"}
                  autoComplete="new-password"
                  value={form.password}
                  error={!!fieldErrors.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors({ ...fieldErrors, password: "" }); }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? (isRo ? "Ascunde parola" : "Hide password") : (isRo ? "Arată parola" : "Show password")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            <FormField
              label={isRo ? "Confirmă parola" : "Confirm password"}
              required
              error={fieldErrors.confirmPassword}
              inputId="confirm-password"
            >
              <Input
                id="confirm-password"
                type="password"
                placeholder={isRo ? "Repetă parola" : "Repeat password"}
                autoComplete="new-password"
                value={form.confirmPassword}
                error={!!fieldErrors.confirmPassword}
                onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setFieldErrors({ ...fieldErrors, confirmPassword: "" }); }}
              />
            </FormField>

            <Button type="submit" loading={loading} fullWidth size="lg">
              {isRo ? "Setează parola nouă" : "Set new password"}
            </Button>
          </form>
        </>
      )}
    </AuthCard>
  );
}
