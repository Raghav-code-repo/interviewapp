import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * - `default` — white panel with a lit top edge.
   * - `elevated` — deeper shadow, for popovers and floating panels.
   * - `tinted` — pale blue wash, used to break up long runs of white panels.
   * - `outline` — flatter and quieter, for dense/nested regions.
   */
  variant?: 'default' | 'elevated' | 'tinted' | 'outline';
  /** Adds a hover lift. Only use when the whole card is a link or button. */
  interactive?: boolean;
}

const VARIANTS: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-panel-light dark:bg-panel-dark border-slate-200/80 dark:border-slate-700/70',
  elevated: 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-600/70',
  tinted: 'bg-gradient-to-br from-accent-50 to-white dark:from-accent-500/10 dark:to-slate-800/80 border-accent-200/80 dark:border-accent-500/25',
  outline: 'bg-white/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // `shadow-panel` bundles the drop shadow with an inset top highlight,
        // which is what stops light panels reading as flat white.
        'rounded-xl border shadow-panel dark:shadow-panel-dark',
        VARIANTS[variant],
        'transition-all duration-200 ease-out',
        interactive &&
          'cursor-pointer hover:-translate-y-0.5 hover:shadow-lift hover:border-accent-300 dark:hover:border-accent-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 focus-visible:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 border-b border-slate-200/70 p-5 pb-3 dark:border-slate-700/60',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3
    className={cn(
      'text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100',
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-sm text-slate-500 dark:text-slate-400', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-5', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex items-center justify-between border-t border-slate-200/70 p-5 pt-3 dark:border-slate-700/60',
      className
    )}
    {...props}
  >
    {children}
  </div>
);