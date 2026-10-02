import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  FolderTree,
  FileQuestion,
  Terminal,
  HelpCircle,
  Video,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useProfile } from '../../context/ProfileContext';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { profile } = useProfile();
  const { progressMap } = useProgress();
  const { user } = useAuth();

  const revisionCount = Object.values(progressMap).filter((p) => p.needsRevision).length;

  const navItems = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Personalized Roadmap', to: '/roadmap', icon: Compass },
    { name: 'Curriculum & Taxonomy', to: '/explore', icon: FolderTree },
    { name: 'Question Bank', to: '/questions', icon: FileQuestion, badge: '8+' },
    { name: 'Coding Playground', to: '/playground', icon: Terminal },
    { name: 'Topic Quizzes', to: '/quizzes', icon: HelpCircle },
    { name: 'Mock Interview', to: '/mock-interview', icon: Video },
    {
      name: 'Spaced Revision',
      to: '/revision',
      icon: Clock,
      badge: revisionCount > 0 ? String(revisionCount) : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    },
    // Content Studio writes to the question bank, so the API restricts it to
    // admin accounts. Hiding the link avoids offering a route that 403s.
    ...(user?.role === 'admin' ? [{ name: 'Admin Studio', to: '/admin', icon: Settings }] : []),
  ];

  const displayName = user?.name ?? profile.name;
  const initial = (displayName || '?').trim().charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container — light blue in both themes, with a dark counterpart. */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-blue-50 dark:bg-slate-900 border-r border-blue-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-200/70 dark:border-slate-800 bg-blue-100/60 dark:bg-slate-900">
          <NavLink
            to="/"
            onClick={onMobileClose}
            className="flex items-center space-x-3 overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/25 shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base text-blue-950 dark:text-white tracking-tight flex items-center gap-1.5">
                  DevPath{' '}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/10 dark:bg-brand-500/20 text-blue-700 dark:text-brand-300 font-semibold">
                    ACADEMY
                  </span>
                </span>
                <span className="text-[11px] text-blue-800 dark:text-slate-400 font-medium">
                  Interview Mastery (0-20y)
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-blue-800/70 dark:text-slate-400 hover:text-blue-950 dark:hover:text-white hover:bg-blue-200/60 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              (item.to !== '/' && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                    : 'text-blue-950/75 dark:text-slate-400 hover:text-blue-950 dark:hover:text-white hover:bg-blue-100 dark:hover:bg-slate-800'
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-transform group-hover:scale-110',
                    isActive
                      ? 'text-white'
                      : 'text-blue-800 dark:text-slate-400 group-hover:text-blue-900 dark:group-hover:text-white'
                  )}
                />
                {!collapsed && <span className="truncate flex-1 text-left">{item.name}</span>}
                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-bold shrink-0',
                      item.badgeColor || 'bg-blue-100 text-blue-700 dark:bg-slate-700 dark:text-slate-200'
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip on collapsed mode — intentionally dark in both themes
                    so it stays legible against the light-blue pane. */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Candidate Profile Widget at Bottom */}
        <div className="p-3 border-t border-blue-200/70 dark:border-slate-800 bg-blue-100/40 dark:bg-slate-900">
          {!collapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-200/70 dark:border-slate-700">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-blue-950 dark:text-slate-100 truncate">
                  {displayName}
                </div>
                <div className="text-[11px] text-blue-800 dark:text-slate-400 truncate flex items-center gap-1">
                  <span className="text-blue-700 dark:text-brand-400 font-medium">
                    {profile.experienceBand}y
                  </span>{' '}
                  • {profile.targetRole}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div
                className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm"
                title={`${displayName} (${profile.experienceBand} yrs - ${profile.targetRole})`}
              >
                {initial}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
