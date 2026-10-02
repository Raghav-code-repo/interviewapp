import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium text-ink dark:text-slate-200"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            // Pale-blue field with a subtle gray-blue border; rounded and flat.
            'w-full px-3.5 py-2.5 text-[14px] rounded-lg border transition-colors',
            'bg-accent-100 dark:bg-slate-900/70',
            'text-ink dark:text-slate-100 placeholder:text-muted/70 dark:placeholder:text-slate-500',
            'dark:[color-scheme:dark]',
            'focus:outline-none focus:bg-white dark:focus:bg-slate-900',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15'
              : 'border-slate-200 dark:border-slate-600 focus:border-accent-600 focus:ring-2 focus:ring-accent-600/15',
            className
          )}
          {...props}
        />
        {error && <p className="text-[12px] text-red-600 dark:text-red-400 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-[12px] text-muted dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
