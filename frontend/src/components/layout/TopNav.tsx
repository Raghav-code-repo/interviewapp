import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  Code2,
  Award,
  ChevronDown,
  CheckCircle,
  RotateCcw,
  LogIn,
  LogOut,
  Clock,
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useTheme } from '../../context/ThemeContext';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import { SearchModal } from './SearchModal';
import { useDismissable } from '../../hooks/useDismissable';
import { partitionRevisions, daysUntilRevision } from '../../utils/revision';
import { QUESTIONS } from '../../data/seedData';
import { ExperienceBand, LanguagePreference } from '../../types';

interface TopNavProps {
  onMobileMenuToggle: () => void;
  onOpenOnboarding?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onMobileMenuToggle, onOpenOnboarding }) => {
  const { profile, updateProfile, resetProfile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const { progressMap } = useProgress();
  const { user, logout, syncProfile } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const closeNotifications = useCallback(() => setNotificationsOpen(false), []);
  const closeProfileDropdown = useCallback(() => setProfileDropdownOpen(false), []);

  const notificationsRef = useDismissable<HTMLDivElement>(notificationsOpen, closeNotifications);
  const profileRef = useDismissable<HTMLDivElement>(profileDropdownOpen, closeProfileDropdown);

  // Drop any open panel when the session changes, so a stale dropdown cannot
  // survive a login or logout. Route changes are covered by the link handlers.
  useEffect(() => {
    setNotificationsOpen(false);
    setProfileDropdownOpen(false);
  }, [user]);

  const { due: dueRevisions, upcoming: upcomingRevisions } = partitionRevisions(
    Object.values(progressMap)
  );

  // Resolves the question behind each entry so notifications read as titles
  // rather than raw IDs. Progress entries for questions missing from the
  // catalog are dropped rather than shown unlabelled.
  const resolveRevision = (questionId: string) =>
    QUESTIONS.find((question) => question.id === questionId);

  const experienceBands: ExperienceBand[] = ['0', '0-2', '2-5', '5-8', '8-12', '12-15', '15-20', '20+'];

  return (
    <>
      <header className="h-16 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
        {/* Left Side: Mobile Menu + Search Bar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:dark:text-slate-100 hover:bg-slate-100 hover:dark:bg-slate-500/15 lg:hidden"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search Launcher */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-500/15 hover:bg-slate-200/70 border border-slate-200 dark:border-slate-500/30 text-slate-500 dark:text-slate-400 text-xs transition-colors w-44 sm:w-64 md:w-80"
          >
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate flex-1 text-left">Search topics & questions...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-800/70 border border-slate-300 dark:border-slate-500/40 rounded text-slate-500 dark:text-slate-400 font-mono shadow-xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Side: Filters, Badges & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Experience Band Selector Pill */}
          <div className="hidden md:flex items-center">
            <label htmlFor="exp-select" className="sr-only">Experience Level</label>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-200 text-xs">
              <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300 shrink-0" />
              <span className="font-semibold">{profile.experienceBand}y</span>
              <select
                id="exp-select"
                value={profile.experienceBand}
                onChange={(e) => {
                  const experienceBand = e.target.value as ExperienceBand;
                  // Optimistic local update, then persist to the account.
                  updateProfile({ experienceBand });
                  syncProfile({ experienceBand });
                }}
                className="bg-transparent text-xs font-medium text-indigo-900 dark:text-indigo-200 cursor-pointer focus:outline-none"
              >
                {experienceBands.map((band) => (
                  <option key={band} value={band}>
                    {band} Years
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Language Switcher Pill */}
          <div className="hidden sm:flex items-center">
            <label htmlFor="lang-select" className="sr-only">Language</label>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-500/15 border border-slate-200 dark:border-slate-500/30 text-slate-700 dark:text-slate-300 text-xs">
              <Code2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <select
                id="lang-select"
                value={profile.language}
                onChange={(e) => {
                  const language = e.target.value as LanguagePreference;
                  updateProfile({ language });
                  syncProfile({ language });
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-300 capitalize cursor-pointer focus:outline-none"
              >
                <option value="both">Python & Java</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:dark:text-slate-100 hover:bg-slate-100 hover:dark:bg-slate-500/15 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Notifications / Revision Alert */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((open) => !open);
                setProfileDropdownOpen(false);
              }}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:dark:text-slate-100 hover:bg-slate-100 hover:dark:bg-slate-500/15 transition-colors relative"
              aria-label={
                dueRevisions.length > 0
                  ? `View notifications, ${dueRevisions.length} due for review`
                  : 'View notifications'
              }
              aria-haspopup="menu"
              aria-expanded={notificationsOpen}
            >
              <Bell className="w-4 h-4" />
              {/* The dot tracks revisions that are actually due, not merely
                  scheduled — otherwise it stayed lit for days. */}
              {dueRevisions.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div
                role="menu"
                aria-label="Notifications"
                className="absolute right-0 mt-2 w-80 bg-panel-light dark:bg-panel-dark rounded-xl shadow-lift border border-slate-200 dark:border-slate-600/70 z-50 animate-enter overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Notifications
                  </span>
                  {dueRevisions.length > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                      {dueRevisions.length} due now
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {upcomingRevisions.length > 0
                        ? `${upcomingRevisions.length} scheduled`
                        : 'All clear'}
                    </span>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {dueRevisions.length === 0 && upcomingRevisions.length === 0 ? (
                    <div className="text-center py-8 px-4 text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-1.5">
                      <CheckCircle className="w-7 h-7 text-emerald-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        No revisions due
                      </span>
                      <span className="text-[11px]">
                        Flag questions from their detail page to schedule review.
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1.5">
                      {dueRevisions.map((rev) => {
                        const q = resolveRevision(rev.questionId);
                        if (!q) return null;
                        return (
                          <Link
                            key={rev.questionId}
                            to={`/questions/${q.id}`}
                            onClick={closeNotifications}
                            role="menuitem"
                            className="block p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/30 hover:bg-amber-100/80 dark:hover:bg-amber-500/20 transition-colors"
                          >
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                              <Clock className="w-3 h-3" />
                              {daysUntilRevision(rev) < 0
                                ? `Overdue by ${Math.abs(daysUntilRevision(rev))}d`
                                : 'Due now'}
                            </div>
                            <div className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                              {q.title}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                              {q.difficulty} &middot; Review now
                            </div>
                          </Link>
                        );
                      })}

                      {upcomingRevisions.map((rev) => {
                        const q = resolveRevision(rev.questionId);
                        if (!q) return null;
                        const days = daysUntilRevision(rev);
                        return (
                          <Link
                            key={rev.questionId}
                            to={`/questions/${q.id}`}
                            onClick={closeNotifications}
                            role="menuitem"
                            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-500/10 border border-slate-200/80 dark:border-slate-500/30 hover:bg-slate-100 dark:hover:bg-slate-500/20 transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                            <span className="min-w-0 flex-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                              {q.title}
                            </span>
                            <span className="shrink-0 text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              in {days}d
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="px-3 py-2 border-t border-slate-200/70 dark:border-slate-700/60">
                  <Link
                    to="/revision"
                    onClick={closeNotifications}
                    className="text-[11px] font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300"
                  >
                    View full revision schedule
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Unauthenticated Quick Action Buttons */}
          {!user && (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-brand-500 shadow-xs transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-sm shadow-brand-500/20 transition-all"
              >
                <span>Register</span>
              </Link>
            </div>
          )}

          {/* Profile Menu Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileDropdownOpen((open) => !open);
                setNotificationsOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={profileDropdownOpen}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 hover:dark:bg-slate-500/15 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {(user?.name ?? profile.name).charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            </button>

            {profileDropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 bg-panel-light dark:bg-panel-dark rounded-xl shadow-lift border border-slate-200 dark:border-slate-600/70 p-2 z-50 animate-enter"
              >
                <div className="p-2.5 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {user?.name ?? profile.name}
                  </div>
                  {user?.email && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{user.email}</div>
                  )}
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{profile.targetRole}</div>
                  {user?.role === 'admin' && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/10 text-[10px] font-semibold text-brand-700 dark:text-brand-300">
                      Admin
                    </div>
                  )}
                </div>

                <div className="py-1">
                  {onOpenOnboarding && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenOnboarding();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:dark:bg-slate-500/15 flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      Re-run Onboarding Wizard
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      resetProfile();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:dark:bg-slate-500/15 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    Reset Profile to Default
                  </button>

                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-600 dark:text-red-300 hover:bg-red-50 hover:dark:bg-red-500/10 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:dark:bg-slate-500/15 flex items-center gap-2"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign in
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
