"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import FormField, { Input } from "@/components/FormField";
import Button from "@/components/Button";
import ErrorAlert from "@/components/ErrorAlert";
import { login } from "@/lib/api/auth";
import { useLanguage } from "@/components/LanguageProvider";
import { getUiCopy } from "@/lib/i18n/ui";

export default function LoginPage() {
  const { lang } = useLanguage();
  const isRo = lang === "ro";
  const copy = getUiCopy(lang);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.email) errors.email = isRo ? "Email-ul este obligatoriu." : "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = isRo ? "Introdu un email valid." : "Enter a valid email.";
    if (!form.password) errors.password = isRo ? "Parola este obligatorie." : "Password is required.";
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      const redirectPath = searchParams.get("redirect");
      const safeRedirect =
        redirectPath && redirectPath.startsWith("/dashboard") ? redirectPath : "/dashboard";
      router.push(safeRedirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : isRo ? "Autentificare esuata." : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={copy.auth.login.title}
      subtitle={copy.auth.login.subtitle}
      description={copy.auth.login.description}
      footer={
        <>
          {copy.auth.login.noAccountYet}
          <Link
            href="/auth/register"
            className="text-green-600 dark:text-green-400 font-medium hover:underline"
          >
            {copy.auth.login.createOneFree}
          </Link>
        </>
      }
    >
      {error && (
        <ErrorAlert message={error} className="mb-4" onDismiss={() => setError("")} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label={copy.auth.login.email}
          required
          error={fieldErrors.email}
          inputId="login-email"
        >
          <Input
            id="login-email"
            type="email"
            placeholder={isRo ? "ana@exemplu.ro" : "ana@example.com"}
            autoComplete="email"
            value={form.email}
            error={!!fieldErrors.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setFieldErrors({ ...fieldErrors, email: "" });
            }}
          />
        </FormField>

        <FormField
          label={copy.auth.login.password}
          required
          error={fieldErrors.password}
          inputId="login-password"
        >
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder={isRo ? "Parola ta" : "Your password"}
              autoComplete="current-password"
              value={form.password}
              error={!!fieldErrors.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setFieldErrors({ ...fieldErrors, password: "" });
              }}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? (isRo ? "Ascunde parola" : "Hide password") : isRo ? "Arata parola" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            {copy.auth.login.forgotPassword}
          </Link>
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg">
          {loading ? copy.auth.login.signingIn : copy.auth.login.signIn}
        </Button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          {copy.auth.login.termsIntro}
          <Link href="/legal/terms" className="underline hover:text-slate-700 dark:hover:text-slate-200">
            {copy.auth.login.terms}
          </Link>{" "}
          {copy.auth.login.and}
          <Link href="/legal/privacy-policy" className="underline hover:text-slate-700 dark:hover:text-slate-200">
            {copy.auth.login.privacy}
          </Link>
          .
        </p>
      </div>
    </AuthCard>
  );
}
