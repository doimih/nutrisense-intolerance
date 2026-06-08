'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';

type AuthTab = 'login' | 'register';

interface LoginFormData {
  email: string;
  password: string;
  otpCode: string;
  rememberMe: boolean;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  diet_preference: 'normal' | 'vegetarian' | 'vegan' | 'low-carb';
}

const DIET_PREFERENCE_OPTIONS = [
  { value: 'normal', label: 'No restrictions', description: 'Standard diet' },
  { value: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
  { value: 'vegan', label: 'Vegan', description: 'No animal products' },
  { value: 'low-carb', label: 'Low-Carb', description: 'Reduced carbohydrates' },
] as const;

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', otpCode: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/superadmin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          otpCode: data.otpCode,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        user?: { name?: string };
      };

      if (!response.ok) {
        throw new Error(payload.error || 'Invalid email or password.');
      }

      toast.success(`Welcome back, ${payload.user?.name || 'Super Admin'}!`);
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="login-email" className="label-text">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className={`input-field ${errors.email ? 'border-negative focus:ring-negative' : ''}`}
          placeholder="you@example.com"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          })}
        />
        {errors.email && <p className="error-text">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="login-otp" className="label-text">
          2FA code
        </label>
        <input
          id="login-otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          className="input-field"
          placeholder="123456"
          {...register('otpCode')}
        />
        <p className="helper-text">Required only if 2FA is enabled for this account.</p>
      </div>

      <div>
        <label htmlFor="login-password" className="label-text">
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className={`input-field pr-10 ${errors.password ? 'border-negative focus:ring-negative' : ''}`}
            placeholder="••••••••"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="error-text">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-input text-primary focus:ring-ring"
            {...register('rememberMe')}
          />
          <span className="text-sm text-muted-foreground">Remember me</span>
        </label>
        <button type="button" className="text-sm text-primary font-medium hover:underline">
          Forgot password?
        </button>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Signing in…
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
}

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: { diet_preference: 'normal' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    void data;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.error('Self-registration is disabled. Contact the platform owner.');
  };

  const passwordValue = watch('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="reg-name" className="label-text">
          Full name
        </label>
        <input
          id="reg-name"
          type="text"
          autoComplete="name"
          className={`input-field ${errors.name ? 'border-negative focus:ring-negative' : ''}`}
          placeholder="Sofia Chen"
          {...register('name', {
            required: 'Full name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          })}
        />
        {errors.name && <p className="error-text">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="reg-email" className="label-text">
          Email address
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          className={`input-field ${errors.email ? 'border-negative focus:ring-negative' : ''}`}
          placeholder="you@example.com"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          })}
        />
        {errors.email && <p className="error-text">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="reg-password" className="label-text">
          Password
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={`input-field pr-10 ${errors.password ? 'border-negative focus:ring-negative' : ''}`}
            placeholder="Min. 8 characters"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Include uppercase, lowercase, and a number',
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="error-text">{errors.password.message}</p>}
        <p className="helper-text">Must contain uppercase, lowercase, and a number</p>
      </div>

      <div>
        <label htmlFor="reg-confirm" className="label-text">
          Confirm password
        </label>
        <div className="relative">
          <input
            id="reg-confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            className={`input-field pr-10 ${errors.confirmPassword ? 'border-negative focus:ring-negative' : ''}`}
            placeholder="Repeat your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === passwordValue || 'Passwords do not match',
            })}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirm ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
      </div>

      <div>
        <label htmlFor="reg-diet" className="label-text">
          Diet preference
        </label>
        <p className="helper-text mb-2">This helps us personalise your food recommendations</p>
        <select
          id="reg-diet"
          className={`input-field ${errors.diet_preference ? 'border-negative focus:ring-negative' : ''}`}
          {...register('diet_preference', { required: 'Please select a diet preference' })}
        >
          {DIET_PREFERENCE_OPTIONS.map((opt) => (
            <option key={`diet-${opt.value}`} value={opt.value}>
              {opt.label} — {opt.description}
            </option>
          ))}
        </select>
        {errors.diet_preference && <p className="error-text">{errors.diet_preference.message}</p>}
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Creating account…
          </>
        ) : (
          'Create Account'
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center pt-1">
        By creating an account you agree to our{' '}
        <Link href="#" className="text-primary hover:underline font-medium">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="#" className="text-primary hover:underline font-medium">
          Privacy Policy
        </Link>
      </p>
    </form>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  useEffect(() => {
    let active = true;
    fetch('/api/superadmin/auth/session')
      .then((response) => {
        if (!active || !response.ok) return;
        router.replace('/dashboard');
      })
      .catch(() => {
        // remain on login
      });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-primary p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">NutriSense</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            Know what your body
            <br />
            can and cannot handle
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Track food intolerances, log symptoms, and receive AI-powered dietary guidance —
            personalised to your biology.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            { icon: '🥗', text: 'AI-generated meal recommendations based on your intolerances' },
            { icon: '📊', text: 'Symptom intensity tracking with trend visualisation' },
            { icon: '📓', text: 'Daily food journal with pattern detection' },
          ].map((item, i) => (
            <div
              key={`feature-${i}`}
              className="flex items-start gap-3 bg-white/10 rounded-xl px-4 py-3"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-white/90 text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="font-bold text-foreground text-lg tracking-tight">NutriSense</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {activeTab === 'login' ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {activeTab === 'login'
                ? 'Welcome back — your health data is waiting.'
                : 'Start managing your food intolerances today.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            {(['login', 'register'] as AuthTab[]).map((tab) => (
              <button
                key={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Forms */}
          <div className="animate-fade-in">
            {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {activeTab === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => setActiveTab('register')}
                  className="text-primary font-semibold hover:underline"
                >
                  Create one free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
