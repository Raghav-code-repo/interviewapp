import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, UserPlus } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectOption } from '../components/ui/Select';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';
import {
  ExperienceBand,
  LanguagePreference,
  PreparationGoal,
} from '../types';

const EXPERIENCE_BANDS: SelectOption[] = [
  { value: '0', label: '0 years — Student / Fresher' },
  { value: '0-2', label: '0-2 years — Junior' },
  { value: '2-5', label: '2-5 years — Mid-level' },
  { value: '5-8', label: '5-8 years — Senior' },
  { value: '8-12', label: '8-12 years — Staff' },
  { value: '12-15', label: '12-15 years — Lead' },
  { value: '15-20', label: '15-20 years — Principal' },
  { value: '20+', label: '20+ years — Distinguished' },
];

const LANGUAGES: SelectOption[] = [
  { value: 'both', label: 'Python & Java' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
];

const GOALS: SelectOption[] = [
  { value: 'placement', label: 'Campus placement / first job' },
  { value: 'switch', label: 'Switching companies' },
  { value: 'promotion', label: 'Promotion preparation' },
  { value: 'screening', label: 'Passing a screening round' },
  { value: 'senior', label: 'Targeting senior roles' },
  { value: 'learning', label: 'General skill building' },
];

const TARGET_ROLES: SelectOption[] = [
  'Python Developer',
  'Java Developer',
  'Full Stack Developer',
  'Backend Engineer',
  'Senior Software Engineer',
  'Software Architect',
  'AI/ML Engineer',
  'GenAI Engineer',
  'Engineering Manager',
].map((role) => ({ value: role, label: role }));

type FieldName = 'name' | 'email' | 'password' | 'confirmPassword';
type FieldErrors = Partial<Record<FieldName, string>>;

export const RegisterPage: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [experienceBand, setExperienceBand] = useState<ExperienceBand>('2-5');
  const [language, setLanguage] = useState<LanguagePreference>('both');
  const [targetRole, setTargetRole] = useState('Backend Engineer');
  const [goal, setGoal] = useState<PreparationGoal>('switch');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const errors: FieldErrors = {};

    if (!name.trim()) {
      errors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match.';
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
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        experienceBand,
        language,
        targetRole,
        goal,
      });
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'VALIDATION_ERROR' && err.details) {
          const mapped: FieldErrors = {};
          for (const detail of err.details) {
            if (detail.path === 'name') mapped.name = detail.message;
            if (detail.path === 'email') mapped.email = detail.message;
            if (detail.path === 'password') mapped.password = detail.message;
          }
          if (Object.keys(mapped).length > 0) setFieldErrors(mapped);
          else setFormError(err.message);
        } else if (err.code === 'USER_EXISTS' || err.code === 'CONFLICT') {
          setFieldErrors({ email: 'An account with this email already exists.' });
          setFormError(err.message);
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError('Something went wrong while creating your account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFieldError = (field: FieldName) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Tell us where you are today so we can build the right roadmap."
      hero={{
        eyebrow: 'Start your roadmap',
        headlineLead: 'Build a preparation plan',
        headlineAccent: 'shaped around your level.',
        body: 'Create an account and we will calibrate every question to your experience band, target role and preparation goal — then keep tracking it for you.',
      }}
      proof={{
        stats: [
          { value: '8', label: 'Domains' },
          { value: '9', label: 'Target roles' },
          { value: '2', label: 'Languages' },
        ],
        quote: {
          text: 'Difficulty recalibrates as you improve, so you spend your time on questions that still stretch you instead of ones you already know.',
          attribution: 'Why DevPath',
        },
      }}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
            Sign in
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
          type="text"
          name="name"
          label="Full name"
          autoComplete="name"
          placeholder="Alex Rivera"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearFieldError('name');
          }}
          error={fieldErrors.name}
          required
        />

        <Input
          type="email"
          name="email"
          label="Email address"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError('email');
          }}
          error={fieldErrors.email}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="password"
            name="password"
            label="Password"
            autoComplete="new-password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError('password');
            }}
            error={fieldErrors.password}
            helperText={!fieldErrors.password ? 'At least 6 characters.' : undefined}
            required
          />
          <Input
            type="password"
            name="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearFieldError('confirmPassword');
            }}
            error={fieldErrors.confirmPassword}
            required
          />
        </div>

        <Select
          label="Years of professional experience"
          name="experienceBand"
          value={experienceBand}
          onChange={(e) => setExperienceBand(e.target.value as ExperienceBand)}
          options={EXPERIENCE_BANDS}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Target role"
            name="targetRole"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            options={TARGET_ROLES}
          />
          <Select
            label="Preparation goal"
            name="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value as PreparationGoal)}
            options={GOALS}
          />
        </div>

        <Select
          label="Preferred language"
          name="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguagePreference)}
          options={LANGUAGES}
          helperText="Determines which code examples appear alongside each question."
        />

        <Button type="submit" variant="accent" size="lg" isLoading={isSubmitting} className="w-full">
          {!isSubmitting && <UserPlus className="w-4 h-4" />}
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Your password is hashed with bcrypt before it is stored, and is never returned by the
          API.
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
