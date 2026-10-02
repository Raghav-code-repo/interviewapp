import React from 'react';
import { cn, getDifficultyColor } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'purple' | 'difficulty';
  difficulty?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  difficulty,
  children,
  ...props
}) => {
  if (variant === 'difficulty' && difficulty) {
    const { bg, text, border, bgDark, textDark, borderDark } = getDifficultyColor(difficulty);
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize',
          bg,
          text,
          border,
          bgDark,
          textDark,
          borderDark,
          className
        )}
        {...props}
      >
        {children || difficulty}
      </span>
    );
  }

  const variants = {
    default:
      'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/30',
    outline:
      'bg-transparent text-slate-600 border-slate-300 dark:text-slate-300 dark:border-slate-600',
    success:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    warning:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    purple:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant as keyof typeof variants] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
