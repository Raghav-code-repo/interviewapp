import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Video,
  AlertCircle,
  TrendingUp,
  Code2,
  ChevronRight,
  Target,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useProfile } from '../../context/ProfileContext';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { QUESTIONS, CATEGORIES } from '../../data/seedData';

/** A single KPI tile: icon, value, supporting line and an optional progress bar. */
const KpiTile: React.FC<{
  label: string;
  value: React.ReactNode;
  caption: React.ReactNode;
  icon: React.ElementType;
  tone: 'amber' | 'emerald' | 'blue' | 'violet';
  progress?: number;
}> = ({ label, value, caption, icon: Icon, tone, progress }) => {
  const tones = {
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  } as const;

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1.5 tabular-nums">
            {value}
          </div>
        </div>
        <div className={['w-11 h-11 rounded-xl flex items-center justify-center shrink-0', tones[tone]].join(' ')}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {progress !== undefined && (
        <div
          className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700/70 overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-[width] duration-500 ease-out"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      )}

      <div className="text-xs text-slate-500 dark:text-slate-400 -mt-2">{caption}</div>
    </Card>
  );
};

export const DashboardOverview: React.FC<{ onOpenOnboarding: () => void }> = ({
  onOpenOnboarding,
}) => {
  const { profile } = useProfile();
  const { progressMap, quizResults } = useProgress();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const displayName = user?.name ?? profile.name;
  const firstName = displayName.trim().split(/\s+/)[0] || displayName;

  const {
    totalQuestions,
    masteredCount,
    inProgressCount,
    bookmarkedCount,
    revisionsDue,
    completedToday,
    dailyTarget,
    dailyPercentage,
  } = useMemo(() => {
    const entries = Object.values(progressMap);
    const mastered = entries.filter((p) => p.status === 'mastered').length;
    const inProgress = entries.filter((p) => p.status === 'in_progress').length;
    const revisions = entries.filter((p) => p.needsRevision);

    // "Completed today" previously reused the all-time mastered count, which made
    // the daily-target tile report lifetime progress as if it were today's.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const completedTodayCount = entries.filter((p) => {
      if (p.status !== 'mastered' || !p.lastAttemptedAt) return false;
      return new Date(p.lastAttemptedAt) >= startOfToday;
    }).length;

    const target = profile.dailyGoalQuestions || 5;

    return {
      totalQuestions: QUESTIONS.length,
      masteredCount: mastered,
      inProgressCount: inProgress,
      bookmarkedCount: entries.filter((p) => p.bookmarked).length,
      revisionsDue: revisions,
      completedToday: completedTodayCount,
      dailyTarget: target,
      dailyPercentage: Math.min(Math.round((completedTodayCount / target) * 100), 100),
    };
  }, [progressMap, profile.dailyGoalQuestions]);

  // Domain mastery. `total` is no longer floored at 2 — categories with no seeded
  // questions render as a genuine 0 instead of an invented bar.
  const domainData = useMemo(
    () =>
      CATEGORIES.map((cat) => {
        const catQuestions = QUESTIONS.filter((q) => q.categoryId === cat.id);
        const catMastered = catQuestions.filter((q) => progressMap[q.id]?.status === 'mastered')
          .length;
        return {
          name: cat.name.split(' ')[0],
          fullName: cat.name,
          total: catQuestions.length,
          mastered: catMastered,
        };
      })
      .filter((d) => d.total > 0)
      .slice(0, 6),
    [progressMap]
  );

  // Quiz accuracy. Falls back to an honest "no data" state rather than inventing 85%.
  const quizStats = useMemo(() => {
    const answered = quizResults.reduce((acc, r) => acc + r.totalQuestions, 0);
    const correct = quizResults.reduce((acc, r) => acc + r.score, 0);
    return {
      hasData: answered > 0,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      count: quizResults.length,
    };
  }, [quizResults]);

  // Pie values are used verbatim. The previous version substituted `|| 1`, so a
  // user with nothing mastered was shown a slice labelled "1 Mastered".
  const notStarted = Math.max(totalQuestions - masteredCount - inProgressCount, 0);
  const pieData = [
    { name: 'Mastered', value: masteredCount, color: '#4f46e5' },
    { name: 'In progress', value: inProgressCount, color: '#0ea5e9' },
    { name: 'Not started', value: notStarted, color: isDark ? '#334155' : '#cbd5e1' },
  ];
  const hasAnyProgress = pieData.some((d) => d.value > 0);

  const nextRecommendedQuestion =
    QUESTIONS.find((q) => !progressMap[q.id] || progressMap[q.id].status !== 'mastered') ??
    QUESTIONS[0];

  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      {/* Gradient uses Tailwind's blue scale rather than the custom `navy` ramp —
          navy-900 is #090d16, which read as flat black. The deeper stop stays at
          indigo-900 so white body text keeps a comfortable contrast ratio. */}
      <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-6 sm:p-8 text-white overflow-hidden shadow-elevated border border-blue-800/60">
        <div className="absolute -right-16 -top-24 w-80 h-80 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-32 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        {/* Faint dot grid. Kept well under the body-text contrast floor so it
            reads as texture only. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Solid white chip is the accent; the second chip is a true ghost
                  (no fill). A translucent white fill over a mid-blue background
                  measures ~4.3:1 against white text, which fails WCAG AA for
                  small text — a solid chip and a border-only chip both clear 4.5. */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-blue-700 dark:text-blue-300 text-[11px] font-semibold shadow-sm">
                <Target className="w-3 h-3" />
                {profile.targetRole}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-transparent text-white text-[11px] font-medium border border-white/35">
                {profile.experienceBand} years experience
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-blue-100/85 mt-2 max-w-xl leading-relaxed">
              {masteredCount > 0
                ? `You have mastered ${masteredCount} of ${totalQuestions} questions${
                    revisionsDue.length > 0
                      ? ` and have ${revisionsDue.length} revision${revisionsDue.length === 1 ? '' : 's'} coming up.`
                      : '.'
                  }`
                : 'Start with your recommended question below to build your roadmap, or explore the full question bank.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenOnboarding}
              className="bg-transparent text-white border-white/40 hover:bg-white hover:text-blue-700 hover:border-white"
            >
              Customize target
            </Button>
            <Link to={`/questions/${nextRecommendedQuestion.id}`} className="shrink-0">
              {/* Inverted to white rather than the default indigo: an indigo button
                  sat on the same hue family as the new blue banner and read muddy. */}
              <Button
                variant="primary"
                size="sm"
                className="bg-white text-blue-700 dark:text-blue-300 hover:bg-blue-50 active:bg-blue-100 shadow-lg shadow-blue-900/30"
              >
                Continue learning
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiTile
          label="Today's target"
          icon={Flame}
          tone="amber"
          value={
            <>
              {completedToday}
              <span className="text-base font-medium text-slate-400 dark:text-slate-500">
                {' '}
                / {dailyTarget}
              </span>
            </>
          }
          caption={
            completedToday >= dailyTarget
              ? 'Daily goal complete — nice work.'
              : `${dailyTarget - completedToday} question${dailyTarget - completedToday === 1 ? '' : 's'} to hit today's goal.`
          }
          progress={dailyPercentage}
        />

        <KpiTile
          label="Questions mastered"
          icon={CheckCircle2}
          tone="emerald"
          value={
            <>
              {masteredCount}
              <span className="text-base font-medium text-slate-400 dark:text-slate-500">
                {' '}
                / {totalQuestions}
              </span>
            </>
          }
          caption={
            totalQuestions > 0
              ? `${Math.round((masteredCount / totalQuestions) * 100)}% of the question bank completed.`
              : 'No questions available yet.'
          }
          progress={totalQuestions > 0 ? (masteredCount / totalQuestions) * 100 : 0}
        />

        <KpiTile
          label="Quiz accuracy"
          icon={quizStats.hasData ? TrendingUp : AlertCircle}
          tone="blue"
          value={quizStats.hasData ? `${quizStats.accuracy}%` : '—'}
          caption={
            quizStats.hasData
              ? `Across ${quizStats.count} quiz${quizStats.count === 1 ? '' : 'zes'}.`
              : 'Take a diagnostic quiz to see your accuracy.'
          }
        />

        <KpiTile
          label="Revisions due"
          icon={Clock}
          tone="violet"
          value={revisionsDue.length}
          caption={
            revisionsDue.length > 0
              ? 'Spaced repetition items ready for review.'
              : 'Nothing overdue. Build your queue while studying.'
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Curriculum domain progress</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Mastered questions out of each category in the bank
                </p>
              </div>
              <Link
                to="/explore"
                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold flex items-center gap-0.5 shrink-0"
              >
                Explore
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {domainData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={domainData}
                    margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                    barCategoryGap="28%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke={axisColor}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke={axisColor}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: isDark ? '#1e293b' : '#f1f5f9' }}
                      contentStyle={{
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        border: `1px solid ${gridColor}`,
                        borderRadius: '10px',
                        fontSize: '12px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      }}
                      labelStyle={{ color: isDark ? '#e2e8f0' : '#0f172a', fontWeight: 600 }}
                      itemStyle={{ color: isDark ? '#cbd5e1' : '#475569' }}
                    />
                    <Bar
                      dataKey="total"
                      fill={isDark ? '#334155' : '#cbd5e1'}
                      name="In bank"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={26}
                    />
                    <Bar
                      dataKey="mastered"
                      fill="#4f46e5"
                      name="Mastered"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={26}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <Code2 className="w-7 h-7 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No categorised questions in the bank yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mastery breakdown</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Where you stand across {totalQuestions} questions
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {hasAnyProgress ? (
              <>
                <div className="relative h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={56}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#0f172a' : '#ffffff',
                          border: `1px solid ${gridColor}`,
                          borderRadius: '10px',
                          fontSize: '12px',
                        }}
                        itemStyle={{ color: isDark ? '#cbd5e1' : '#475569' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centre label — the previous donut had none, which read as
                      an unfinished chart. */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {masteredCount}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
                      mastered
                    </div>
                  </div>
                </div>

                <div className="w-full grid grid-cols-3 gap-2 mt-3 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-center">
                  {pieData.map((d) => (
                    <div key={d.name}>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{d.name}</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                        {d.value}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center px-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Nothing started yet
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Open a question to begin tracking your progress.
                </p>
                <Link to="/questions" className="mt-4">
                  <Button variant="outline" size="sm">
                    Browse questions
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations & actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Recommended next
              </span>
              <Badge variant="difficulty" difficulty={nextRecommendedQuestion.difficulty}>
                {nextRecommendedQuestion.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-base mt-2 line-clamp-1">{nextRecommendedQuestion.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {nextRecommendedQuestion.statement}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 font-mono text-[11px]">
                {nextRecommendedQuestion.minExperienceYears}-
                {nextRecommendedQuestion.maxExperienceYears} YOE
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 font-mono text-[11px]">
                ~{nextRecommendedQuestion.estimatedTimeMinutes} min
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 capitalize font-medium">
                {nextRecommendedQuestion.interviewType.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-auto pt-2">
              <Link to={`/questions/${nextRecommendedQuestion.id}`}>
                <Button variant="primary" size="sm" className="w-full">
                  Start study session
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4 h-4 text-amber-500" />
                Revision queue
              </CardTitle>
              <Link
                to="/revision"
                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold shrink-0"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 gap-3">
            {revisionsDue.length > 0 ? (
              revisionsDue.slice(0, 2).map((rev) => {
                const q = QUESTIONS.find((item) => item.id === rev.questionId);
                if (!q) return null;
                return (
                  <div
                    key={rev.questionId}
                    className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/25 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {q.title}
                      </div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-400/90 mt-0.5">
                        Scheduled for retention review
                      </div>
                    </div>
                    <Link to={`/questions/${q.id}`} className="shrink-0">
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        Review
                      </Button>
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No revisions overdue. Add questions to your schedule while reading.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
              <Link to="/quizzes" className="group">
                <div className="h-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Topic quiz
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Diagnostic test
                  </div>
                </div>
              </Link>
              <Link to="/mock-interview" className="group">
                <div className="h-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Video className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    Mock interview
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Timed session
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer stat strip — bookmarks were computed but never surfaced anywhere. */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-400 dark:text-slate-500">
        <span>
          {bookmarkedCount} bookmarked · {inProgressCount} in progress · {masteredCount} mastered
        </span>
        <Link to="/questions" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          View question bank →
        </Link>
      </div>
    </div>
  );
};
