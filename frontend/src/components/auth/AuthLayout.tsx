import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Sun,
  Moon,
  Layers,
  SlidersHorizontal,
  RefreshCw,
  Quote,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/** A blue line icon inside a pale-blue rounded square. */
const FeatureIcon: React.FC<{ icon: LucideIcon }> = ({ icon: Icon }) => (
  <div
    className="shrink-0 w-10 h-10 rounded-card bg-accent-100 dark:bg-accent-500/15 text-accent-600 dark:text-accent-300
               flex items-center justify-center border border-accent-200 dark:border-accent-500/30"
  >
    <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
  </div>
);

export interface AuthStat {
  value: string;
  label: string;
}

export interface AuthProof {
  /** Short numeric highlights rendered as a three-up strip. */
  stats: AuthStat[];
  /** Pull-quote styled as a product statement rather than a customer review. */
  quote: { text: string; attribution: string };
}

export interface AuthLayoutProps {
  /** Right-pane form heading. */
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  /**
   * Left-pane hero copy. Each page supplies its own wording so the register
   * screen never shows sign-in copy. `headlineAccent` renders in the primary blue.
   */
  hero: {
    eyebrow: string;
    headlineLead: string;
    headlineAccent: string;
    body: string;
  };
  /** Optional proof points rendered beneath the feature list. */
  proof?: AuthProof;
}

/** Feature rows are identical across both auth screens. */
const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Layers,
    title: 'Structured curriculum',
    body: 'Eight domains mapped from fundamentals to system design, built around how interviews are actually run.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Adaptive to your level',
    body: 'Question difficulty recalibrates from your experience band, target role and preparation goal.',
  },
  {
    icon: RefreshCw,
    title: 'Progress that persists',
    body: 'Mastered questions, bookmarks and revision queues stay synced to your account across devices.',
  },
];

/**
 * Two-column authentication shell: a light-gray brand/hero panel on the left and
 * a white panel centring the form card on the right.
 *
 * 50/50 split from `lg` upward; below that the panels stack into a single
 * column so the page scrolls naturally on phones.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footer,
  hero,
  proof,
}) => {
  const { theme, toggleTheme } = useTheme();
  const otherTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 lg:grid lg:grid-cols-2">
      {/* ------------------------------------------------ Left panel */}
      <section className="relative flex flex-col overflow-hidden bg-panel dark:bg-slate-900">
        {/* Decoration: faint dot grid plus a soft accent wash. Both are inert
            and sit behind the content, so they never trap pointer events. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(7, 133, 201, 0.13) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 -right-24 h-72 w-72 rounded-full
                     bg-accent-100 dark:bg-accent-500/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 -left-20 h-64 w-64 rounded-full
                     bg-accent-50 dark:bg-accent-500/5 blur-3xl"
        />

        {/* Content rides above the decoration. */}
        <div className="relative flex flex-1 flex-col px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          {/* Brand header, top-left */}
          <Link to="/" className="inline-flex w-fit items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card
                         bg-accent-600 text-white shadow-sm"
            >
              <GraduationCap className="h-[18px] w-[18px]" strokeWidth={2} />
            </div>
            <span className="leading-tight">
              <span className="block text-[15px] font-bold tracking-tight text-ink dark:text-white">
                DevPath
              </span>
              <span className="block text-[11px] font-medium tracking-tight text-muted dark:text-slate-400">
                Interview Academy
              </span>
            </span>
          </Link>

          {/* Hero + feature list + proof, vertically centred where there is room */}
          <div className="flex flex-1 flex-col justify-center py-10 lg:py-12">
            {/* Eyebrow */}
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-accent-200 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-700 dark:border-accent-500/30 dark:bg-slate-800/70 dark:text-accent-300">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-600 dark:bg-accent-400" />
              {hero.eyebrow}
            </div>

            <h2
              className="max-w-md text-[26px] font-bold leading-[1.2] tracking-tight
                         text-ink dark:text-white sm:text-[30px] lg:text-[34px]"
            >
              {hero.headlineLead}
              <span className="text-accent-600 dark:text-accent-400"> {hero.headlineAccent}</span>
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted dark:text-slate-400">
              {hero.body}
            </p>

            <ul className="mt-8 space-y-5">
              {FEATURES.map(({ icon: Icon, title: itemTitle, body }) => (
                <li key={itemTitle} className="flex gap-4">
                  <FeatureIcon icon={Icon} />
                  <div className="min-w-0 pt-0.5">
                    <div className="text-[14px] font-semibold leading-snug text-ink dark:text-slate-100">
                      {itemTitle}
                    </div>
                    <div className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted dark:text-slate-400">
                      {body}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* ------------------------------------------- Social proof */}
            {proof && (
              <>
                <dl className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
                  {proof.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-card border border-slate-200/80 bg-white/70 px-3 py-3
                                 backdrop-blur-[2px] dark:border-slate-700/80 dark:bg-slate-800/60 sm:px-4"
                    >
                      <dt className="sr-only">{stat.label}</dt>
                      <dd className="text-[20px] font-bold leading-none tracking-tight text-ink dark:text-white sm:text-[22px]">
                        {stat.value}
                      </dd>
                      <dd className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted dark:text-slate-400">
                        {stat.label}
                      </dd>
                    </div>
                  ))}
                </dl>

                <figure
                  className="mt-6 rounded-card border border-slate-200/80 bg-white/60 p-4
                             dark:border-slate-700/80 dark:bg-slate-800/50 sm:p-5"
                >
                  <Quote
                    className="h-4 w-4 text-accent-500"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <blockquote
                    className="mt-2.5 text-[13px] leading-relaxed text-muted dark:text-slate-300"
                  >
                    {proof.quote.text}
                  </blockquote>
                  <figcaption className="mt-2.5 text-[12px] font-semibold text-ink dark:text-slate-100">
                    {proof.quote.attribution}
                  </figcaption>
                </figure>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-5 dark:border-slate-800">
            <p className="text-[12px] text-muted dark:text-slate-500">
              &copy; {new Date().getFullYear()} DevPath Academy
            </p>
            <div className="flex items-center gap-4 text-[12px] text-muted dark:text-slate-500">
              <span className="cursor-default transition-colors hover:text-ink dark:hover:text-slate-300">
                Privacy
              </span>
              <span className="cursor-default transition-colors hover:text-ink dark:hover:text-slate-300">
                Terms
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Right panel */}
      <section className="relative flex items-center justify-center bg-white px-6 py-10 dark:bg-slate-950 sm:px-10 lg:px-14 lg:py-12">
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute right-5 top-5 rounded-lg p-2 text-muted transition-colors
                     hover:bg-slate-100 hover:text-ink dark:text-slate-400 dark:hover:bg-slate-800
                     dark:hover:text-slate-100 lg:right-8 lg:top-6"
          title={`Switch to ${otherTheme} theme`}
          aria-label={`Switch to ${otherTheme} theme`}
        >
          {theme === 'light' ? (
            <Moon className="h-[18px] w-[18px]" />
          ) : (
            <Sun className="h-[18px] w-[18px]" />
          )}
        </button>

        <div className="w-full max-w-[420px]">
          {/* Centred heading */}
          <div className="text-center">
            <h1 className="text-[24px] font-bold tracking-tight text-ink dark:text-white sm:text-[26px]">
              {title}
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-muted dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          <div className="mt-8">{children}</div>

          <div className="mt-7 border-t border-slate-200 pt-5 text-center text-[13px] text-muted dark:border-slate-800 dark:text-slate-400">
            {footer}
          </div>
        </div>
      </section>
    </div>
  );
};