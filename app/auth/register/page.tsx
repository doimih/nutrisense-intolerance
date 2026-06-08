'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import AuthCard from '@/components/AuthCard';
import FormField, { Input, Checkbox } from '@/components/FormField';
import Button from '@/components/Button';
import ErrorAlert from '@/components/ErrorAlert';
import { register } from '@/lib/api/auth';
import { useLanguage } from '@/components/LanguageProvider';
import { getUiCopy } from '@/lib/i18n/ui';

function PasswordStrength({ password }: { password: string }) {
  const { lang } = useLanguage();
  const isRo = lang === 'ro';
  const checks = [
    { label: isRo ? 'Minim 8 caractere' : 'At least 8 characters', ok: password.length >= 8 },
    { label: isRo ? 'Litera mare' : 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: isRo ? 'Cifra' : 'Number', ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;

  if (!password) return null;

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < score
                ? score === 1
                  ? 'bg-red-400'
                  : score === 2
                  ? 'bg-yellow-400'
                  : 'bg-green-500'
                : 'bg-gray-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`flex items-center gap-1 text-xs ${
              c.ok ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { lang } = useLanguage();
  const isRo = lang === 'ro';
  const copy = getUiCopy(lang);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = isRo ? 'Numele este obligatoriu.' : 'Name is required.';
    if (!form.email) errors.email = isRo ? 'Email-ul este obligatoriu.' : 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = isRo ? 'Introdu un email valid.' : 'Enter a valid email.';
    if (!form.password) errors.password = isRo ? 'Parola este obligatorie.' : 'Password is required.';
    else if (form.password.length < 8)
      errors.password = isRo ? 'Parola trebuie sa aiba minim 8 caractere.' : 'Password must have at least 8 characters.';
    if (!form.confirmPassword) errors.confirmPassword = isRo ? 'Confirma parola.' : 'Confirm password.';
    else if (form.password !== form.confirmPassword)
      errors.confirmPassword = isRo ? 'Parolele nu coincid.' : 'Passwords do not match.';
    if (!form.acceptTerms)
      errors.acceptTerms = isRo ? 'Trebuie sa accepti termenii pentru a continua.' : 'You must accept the terms to continue.';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await register(form);
      const redirectPath = searchParams.get("redirect");
      const safeRedirect =
        redirectPath && redirectPath.startsWith("/dashboard") ? redirectPath : "/dashboard";
      router.push(safeRedirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : isRo ? 'Inregistrare esuata.' : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={copy.auth.register.title}
      subtitle={copy.auth.register.subtitle}
      description={copy.auth.register.description}
      footer={
        <>
          {copy.auth.register.alreadyHaveAccount}
          <Link href="/auth/login" className="text-green-600 dark:text-green-400 font-medium hover:underline">
            {copy.auth.register.signIn}
          </Link>
        </>
      }
    >
      {error && <ErrorAlert message={error} className="mb-4" onDismiss={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label={copy.auth.register.fullName} required error={fieldErrors.name} inputId="register-name">
          <Input
            id="register-name"
            placeholder={isRo ? 'Ana Ionescu' : 'Anna Johnson'}
            autoComplete="name"
            value={form.name}
            error={!!fieldErrors.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              setFieldErrors({ ...fieldErrors, name: '' });
            }}
          />
        </FormField>

        <FormField label={copy.auth.register.email} required error={fieldErrors.email} inputId="register-email">
          <Input
            id="register-email"
            type="email"
            placeholder={isRo ? 'ana@exemplu.ro' : 'anna@example.com'}
            autoComplete="email"
            value={form.email}
            error={!!fieldErrors.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setFieldErrors({ ...fieldErrors, email: '' });
            }}
          />
        </FormField>

        <FormField label={copy.auth.register.password} required error={fieldErrors.password} inputId="register-password">
          <div className="relative">
            <Input
              id="register-password"
              type={showPass ? 'text' : 'password'}
              placeholder={isRo ? 'Minim 8 caractere' : 'At least 8 characters'}
              autoComplete="new-password"
              value={form.password}
              error={!!fieldErrors.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                setFieldErrors({ ...fieldErrors, password: '' });
              }}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              aria-label={showPass ? (isRo ? 'Ascunde parola' : 'Hide password') : isRo ? 'Arata parola' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={form.password} />
        </FormField>

        <FormField
          label={copy.auth.register.confirmPassword}
          required
          error={fieldErrors.confirmPassword}
          inputId="register-confirm-password"
        >
          <div className="relative">
            <Input
              id="register-confirm-password"
              type={showConfirmPass ? 'text' : 'password'}
              placeholder={isRo ? 'Repeta parola' : 'Repeat password'}
              autoComplete="new-password"
              value={form.confirmPassword}
              error={!!fieldErrors.confirmPassword}
              onChange={(e) => {
                setForm({ ...form, confirmPassword: e.target.value });
                setFieldErrors({ ...fieldErrors, confirmPassword: '' });
              }}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              aria-label={showConfirmPass ? (isRo ? 'Ascunde confirmarea parolei' : 'Hide confirm password') : isRo ? 'Arata confirmarea parolei' : 'Show confirm password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FormField>

        <div>
          <Checkbox
            checked={form.acceptTerms}
            onChange={(e) => {
              setForm({ ...form, acceptTerms: e.target.checked });
              setFieldErrors({ ...fieldErrors, acceptTerms: '' });
            }}
            label={
              <>
                {copy.auth.register.acceptTerms}
                <Link
                  href="/legal/terms"
                  className="text-green-600 dark:text-green-400 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.auth.register.terms}
                </Link>{' '}
                {copy.auth.register.and}
                <Link
                  href="/legal/privacy-policy"
                  className="text-green-600 dark:text-green-400 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.auth.register.privacy}
                </Link>
              </>
            }
          />
          {fieldErrors.acceptTerms && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldErrors.acceptTerms}</p>}
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg">
          {loading ? copy.auth.register.creatingAccount : copy.auth.register.createAccount}
        </Button>
      </form>
    </AuthCard>
  );
}
