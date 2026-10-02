import { UserProgressItem } from '../types';

/**
 * Spaced-repetition intervals, in days. Mirrors the schedule advertised on the
 * revision page.
 */
export const REVISION_INTERVALS_DAYS = [1, 3, 7, 14];

const MS_PER_DAY = 86400000;

/**
 * A flagged item counts as due when its scheduled date has passed. Items that
 * were flagged without a date are treated as due immediately.
 *
 * The notification bell previously counted *every* `needsRevision` item as due,
 * so it reported "1 due" for revisions scheduled days away.
 */
export function isRevisionDue(item: UserProgressItem): boolean {
  if (!item.needsRevision) return false;
  if (!item.revisionDueDate) return true;
  return new Date(item.revisionDueDate).getTime() <= Date.now();
}

/** Whole days until the revision is due. Negative once it is overdue, 0 if today. */
export function daysUntilRevision(item: UserProgressItem): number {
  if (!item.revisionDueDate) return 0;
  return Math.ceil((new Date(item.revisionDueDate).getTime() - Date.now()) / MS_PER_DAY);
}

/**
 * Splits the revision queue into what needs attention now and what is merely
 * scheduled, soonest first. Overdue items sort ahead of everything else.
 */
export function partitionRevisions(items: UserProgressItem[]) {
  const flagged = items.filter((item) => item.needsRevision);

  const due = flagged
    .filter(isRevisionDue)
    .sort((a, b) => daysUntilRevision(a) - daysUntilRevision(b));

  const upcoming = flagged
    .filter((item) => !isRevisionDue(item))
    .sort((a, b) => daysUntilRevision(a) - daysUntilRevision(b));

  return { due, upcoming, total: flagged.length };
}