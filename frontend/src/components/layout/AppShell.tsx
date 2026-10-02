import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface AppShellProps {
  onOpenOnboarding?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ onOpenOnboarding }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Generate dynamic breadcrumbs
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbName = (part: string) => {
    switch (part) {
      case 'roadmap':
        return 'Personalized Roadmap';
      case 'explore':
        return 'Taxonomy & Subjects';
      case 'questions':
        return 'Question Bank';
      case 'playground':
        return 'Coding Playground';
      case 'quizzes':
        return 'Topic Quizzes';
      case 'mock-interview':
        return 'Mock Interview';
      case 'revision':
        return 'Spaced Revision';
      case 'admin':
        return 'Admin Studio';
      default:
        return part.replace(/-/g, ' ');
    }
  };

  return (
    // Tinted canvas rather than flat slate-50: the radial washes give light mode
    // a sense of depth so the white panels have something to sit against.
    <div className="min-h-screen flex bg-canvas-light dark:bg-canvas-dark bg-fixed">
      {/* Sidebar navigation */}
      <Sidebar isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Sticky Top Bar */}
        <TopNav
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenOnboarding={onOpenOnboarding}
        />

        {/* Breadcrumbs Sub-header (only when deeper than root) */}
        {pathnames.length > 0 && (
          <nav
            aria-label="Breadcrumbs"
            className="sticky top-16 z-20 px-4 lg:px-8 py-2.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md
                       border-b border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5
                       text-xs text-slate-500 dark:text-slate-400 overflow-x-auto"
          >
            <Link to="/" className="hover:text-brand-600 hover:dark:text-brand-300 flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            {pathnames.map((part, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === pathnames.length - 1;

              return (
                <React.Fragment key={routeTo}>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  {isLast ? (
                    <span className="font-semibold text-slate-800 dark:text-slate-300 capitalize truncate max-w-xs">
                      {getBreadcrumbName(part)}
                    </span>
                  ) : (
                    <Link to={routeTo} className="hover:text-brand-600 hover:dark:text-brand-300 capitalize transition-colors truncate">
                      {getBreadcrumbName(part)}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
