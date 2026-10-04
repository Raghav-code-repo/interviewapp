import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';

interface LocationState {
  from?: { pathname: string };
}

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

  // Send an already-authenticated visitor straight to the app. Rendered as a
  // component rather than an imperative navigate() call, which would be a side
  // effect during render.
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const validate = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        // Attach a field-level message for the two cases the user can act on.
        if (err.code === 'VALIDATION_ERROR' && err.details) {
          const mapped: { email?: string; password?: string } = {};
          for (const detail of err.details) {
            if (detail.path === 'email') mapped.email = detail.message;
            if (detail.path === 'password') mapped.password = detail.message;
          }
          if (Object.keys(mapped).length > 0) setFieldErrors(mapped);
          else setFormError(err.message);
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError('Something went wrong while signing in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('alex@devpath.io');
    setPassword('password123');
    setFieldErrors({});
    setFormError(null);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your interview preparation."
      hero={{
        eyebrow: 'Interview preparation, structured',
        headlineLead: 'Prepare for interviews that',
        headlineAccent: 'actually match your level.',
        body: 'Sign in to pick up your roadmap exactly where you left it — every mastered question, bookmark and revision review stays in sync.',
      }}
      proof={{
        stats: [
          { value: '8', label: 'Domains' },
          { value: '9', label: 'Target roles' },
          { value: '2', label: 'Languages' },
        ],
        quote: {
          text: 'Every question is tagged to a domain, a difficulty band and your target role — so nothing on your roadmap is guesswork.',
          attribution: 'Why DevPath',
        },
      }}
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-800 dark:text-red-300"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <Input
          type="email"
          name="email"
          label="Email address"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
          }}
          error={fieldErrors.email}
          required
        />

        <Input
          type="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
          }}
          error={fieldErrors.password}
          required
        />

        <div className="flex items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-accent-600
                         accent-[#0785C9] focus:ring-2 focus:ring-accent-600/20 cursor-pointer"
            />
            <span className="text-[13px] text-ink dark:text-slate-200">Remember me</span>
          </label>
          <button
            type="button"
            className="text-[13px] font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300"
            onClick={() => setFormError('Password recovery is not wired up yet.')}
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" variant="accent" size="lg" isLoading={isSubmitting} className="w-full">
          {!isSubmitting && <LogIn className="w-4 h-4" />}
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>

        <SocialAuthButtons mode="login" />

        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Demo account</span>
              <br />
              <span className="font-mono">alex@devpath.io</span> /{' '}
              <span className="font-mono">password123</span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={fillDemoCredentials}>
              Use demo
            </Button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
