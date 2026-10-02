import React, { useState } from 'react';
import {
  User,
  Briefcase,
  Code2,
  Target,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useProfile } from '../../context/ProfileContext';
import { ExperienceBand, LanguagePreference, PreparationGoal, TargetRole } from '../../types';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPERIENCE_OPTIONS: Array<{ band: ExperienceBand; label: string; desc: string }> = [
  { band: '0', label: '0 Years (Student / Beginner)', desc: 'Foundations, syntax, core logic & entry-level coding' },
  { band: '0-2', label: '0 – 2 Years (Associate / Junior)', desc: 'Standard DSA, frameworks, basic system architecture' },
  { band: '2-5', label: '2 – 5 Years (Mid-Level Engineer)', desc: 'Concurrency, internals, DB indexing, microservices' },
  { band: '5-8', label: '5 – 8 Years (Senior Software Engineer)', desc: 'Deep system design, latency tuning, resilience, tradeoffs' },
  { band: '8-12', label: '8 – 12 Years (Lead / Staff Engineer)', desc: 'Multi-system scale, tech vision, cross-service sagas' },
  { band: '12-15', label: '12 – 15 Years (Principal Engineer)', desc: 'Enterprise architecture, distributed consensus, governance' },
  { band: '15-20', label: '15 – 20 Years (Software Architect)', desc: 'Org-wide tech strategy, fault tolerance, multi-cloud' },
  { band: '20+', label: '20+ Years (Distinguished / Director)', desc: 'Engineering leadership, executive technical governance' },
];

const PREDEFINED_ROLES: TargetRole[] = [
  'Python Developer',
  'Java Developer',
  'Full Stack Developer',
  'Backend Engineer',
  'Senior Software Engineer',
  'Software Architect',
  'AI/ML Engineer',
  'GenAI Engineer',
  'Engineering Manager',
];

const GOAL_OPTIONS: Array<{ key: PreparationGoal; title: string; desc: string }> = [
  { key: 'placement', title: 'College / Off-Campus Placement', desc: 'DSA heavy, core CS fundamentals, aptitude & coding rounds' },
  { key: 'switch', title: 'Mid-Career Job Switch', desc: 'Frameworks, concurrency, real-world bug solving, system design' },
  { key: 'promotion', title: 'Internal Promotion (L4 -> L5+)', desc: 'Staff+ impact, architecture tradeoffs, leadership mastery' },
  { key: 'screening', title: 'Urgent Technical Screening', desc: 'Rapid 48-hour high-yield question prep for phone screens' },
  { key: 'senior', title: 'Senior / Staff+ Tech Interviews', desc: 'Deep distributed systems, event-driven sagas, leadership' },
  { key: 'learning', title: 'General Career Mastery', desc: 'Comprehensive self-paced study across Python, Java, and AI' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { profile, completeOnboarding } = useProfile();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(profile.name || '');
  const [experienceBand, setExperienceBand] = useState<ExperienceBand>(profile.experienceBand || '2-5');
  const [language, setLanguage] = useState<LanguagePreference>(profile.language || 'both');
  const [targetRole, setTargetRole] = useState<TargetRole>(profile.targetRole || 'Backend Engineer');
  const [customRole, setCustomRole] = useState('');
  const [isCustomRoleSelected, setIsCustomRoleSelected] = useState(false);
  const [goal, setGoal] = useState<PreparationGoal>(profile.goal || 'switch');
  const [dailyGoal, setDailyGoal] = useState<number>(profile.dailyGoalQuestions || 5);

  if (!isOpen) return null;

  const handleFinish = () => {
    const finalRole = isCustomRoleSelected && customRole.trim() ? customRole.trim() : targetRole;
    completeOnboarding({
      name: name.trim() || 'Alex Rivera',
      experienceBand,
      experienceYears: parseInt(experienceBand.split('-')[0]) || 2,
      language,
      targetRole: finalRole,
      goal,
      dailyGoalQuestions: dailyGoal,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-navy-950/75 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-panel-light dark:bg-panel-dark rounded-3xl shadow-lift border border-slate-200 dark:border-slate-600/70 z-10 overflow-hidden flex flex-col animate-enter">
        {/* Step Header */}
        <div className="bg-slate-900 text-white p-6 pb-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-400" /> DevPath Academy Onboarding
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Step {step} of 5</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            {step === 1 && "What's your name, engineer?"}
            {step === 2 && 'How many years of professional experience do you have?'}
            {step === 3 && 'Choose your primary interview programming language'}
            {step === 4 && 'What is your target software engineering role?'}
            {step === 5 && 'What is your primary preparation goal?'}
          </h2>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[60vh]">
          {/* STEP 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Welcome to DevPath! We tailor interview question depth, algorithm patterns, and system design expectations
                to your exact career stage.
              </p>
              <div className="mt-4">
                <Input
                  label="Candidate Name"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* STEP 2: Experience Band */}
          {step === 2 && (
            <div className="space-y-2.5">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                Select your experience bracket. Senior and staff brackets focus deeper on system design, failure modes,
                and scalability.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.band}
                    type="button"
                    onClick={() => setExperienceBand(opt.band)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      experienceBand === opt.band
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-500/10 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-500/30 hover:border-slate-300 hover:dark:border-slate-500/40 hover:bg-slate-50 hover:dark:bg-slate-500/10'
                    }`}
                  >
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{opt.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Language */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                DevPath provides dual code implementations with detailed memory and concurrency comparisons.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  {
                    key: 'python' as LanguagePreference,
                    title: 'Python Only',
                    desc: 'Dynamic typing, GIL, generators, asyncio, AI/ML tools',
                    badge: 'Python 3.12+',
                  },
                  {
                    key: 'java' as LanguagePreference,
                    title: 'Java Only',
                    desc: 'JVM internals, GC tuning, Spring Boot, multithreading',
                    badge: 'Java 21 LTS',
                  },
                  {
                    key: 'both' as LanguagePreference,
                    title: 'Both (Recommended)',
                    desc: 'Full dual code comparison in Python & Java side-by-side',
                    badge: 'Comprehensive',
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setLanguage(item.key)}
                    className={`text-left p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      language === item.key
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-500/10 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-500/30 hover:border-slate-300 hover:dark:border-slate-500/40 hover:bg-slate-50 hover:dark:bg-slate-500/10'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-300">
                        {item.badge}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-2">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Target Role */}
          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">Select your target engineering title or define a custom role.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {PREDEFINED_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setTargetRole(role);
                      setIsCustomRoleSelected(false);
                    }}
                    className={`text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                      targetRole === role && !isCustomRoleSelected
                        ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-500/10 text-brand-900 dark:text-brand-200 ring-2 ring-brand-500/20'
                        : 'border-slate-200 dark:border-slate-500/30 text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:dark:bg-slate-500/10'
                    }`}
                  >
                    {role}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomRoleSelected(true)}
                  className={`text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                    isCustomRoleSelected
                      ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-500/10 text-brand-900 dark:text-brand-200 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-500/30 text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:dark:bg-slate-500/10'
                  }`}
                >
                  Custom Role...
                </button>
              </div>

              {isCustomRoleSelected && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <Input
                    label="Enter Custom Role"
                    placeholder="e.g. Distributed Systems Infrastructure Engineer"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Goal */}
          {step === 5 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">What are you preparing for right now?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GOAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setGoal(opt.key)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      goal === opt.key
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-500/10 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-500/30 hover:border-slate-300 hover:dark:border-slate-500/40 hover:bg-slate-50 hover:dark:bg-slate-500/10'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">{opt.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-300">Daily Study Target</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Number of interview questions to review daily</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {[3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setDailyGoal(num)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        dailyGoal === num ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-300 hover:bg-slate-200 hover:dark:bg-slate-500/20'
                      }`}
                    >
                      {num}/day
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-500/10 border-t border-slate-200 dark:border-slate-500/30 flex items-center justify-between">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !name.trim()}
            >
              Continue <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleFinish}>
              Generate Roadmap <CheckCircle2 className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
