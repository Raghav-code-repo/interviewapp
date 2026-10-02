import React from 'react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[13px] font-medium text-ink dark:text-slate-200"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3.5 py-2.5 text-[14px] rounded-lg border transition-colors',
            'bg-accent-100 dark:bg-slate-900/70',
            'text-ink dark:text-slate-100',
            'dark:[color-scheme:dark]',
            'focus:outline-none focus:bg-white dark:focus:bg-slate-900',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15'
              : 'border-slate-200 dark:border-slate-600 focus:border-accent-600 focus:ring-2 focus:ring-accent-600/15',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[12px] text-red-600 dark:text-red-400 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-[12px] text-muted dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
