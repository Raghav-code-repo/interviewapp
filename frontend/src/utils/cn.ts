import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

/**
 * Difficulty palette.
 *
 * `bgDark`/`textDark`/`borderDark` are appended after the light classes so a
 * badge stays legible in dark mode without every call site having to know which
 * difficulty colour is in play.
 */
export function getDifficultyColor(difficulty: string): {
  bg: string;
  text: string;
  border: string;
  bgDark: string;
  textDark: string;
  borderDark: string;
} {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        bgDark: 'dark:bg-emerald-500/15',
        textDark: 'dark:text-emerald-300',
        borderDark: 'dark:border-emerald-500/30',
      };
    case 'intermediate':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        bgDark: 'dark:bg-blue-500/15',
        textDark: 'dark:text-blue-300',
        borderDark: 'dark:border-blue-500/30',
      };
    case 'advanced':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        bgDark: 'dark:bg-amber-500/15',
        textDark: 'dark:text-amber-300',
        borderDark: 'dark:border-amber-500/30',
      };
    case 'expert':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        bgDark: 'dark:bg-purple-500/15',
        textDark: 'dark:text-purple-300',
        borderDark: 'dark:border-purple-500/30',
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        bgDark: 'dark:bg-slate-700/50',
        textDark: 'dark:text-slate-300',
        borderDark: 'dark:border-slate-600',
      };
  }
}
