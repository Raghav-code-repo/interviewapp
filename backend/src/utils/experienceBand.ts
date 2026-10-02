export const EXPERIENCE_BANDS = [
  '0',
  '0-2',
  '2-5',
  '5-8',
  '8-12',
  '12-15',
  '15-20',
  '20+',
] as const;

export type ExperienceBand = (typeof EXPERIENCE_BANDS)[number];

export const DEFAULT_EXPERIENCE_BAND: ExperienceBand = '2-5';

export function isExperienceBand(value: unknown): value is ExperienceBand {
  return (
    typeof value === 'string' &&
    (EXPERIENCE_BANDS as readonly string[]).includes(value)
  );
}

/**
 * Resolves the representative years of experience for a band label.
 *
 * The previous implementation used `parseInt(band.split('-')[0]) || 2`, which was
 * wrong in two ways: `parseInt('0') || 2` turned the '0' band into 2 years
 * (because 0 is falsy), and '20+' was silently accepted despite not being a band
 * this module knows about. Returns `null` for unrecognised input so callers can
 * decide on a fallback rather than receiving a plausible-looking wrong number.
 */
export function yearsForBand(band: string): number | null {
  if (band === '20+') return 20;

  const match = /^(\d+)(?:-(\d+))?$/.exec(band.trim());
  if (!match) return null;

  const lower = Number.parseInt(match[1], 10);
  if (!Number.isFinite(lower)) return null;
  return lower;
}

/**
 * Same as `yearsForBand` but guaranteed to return a usable number, falling back
 * to the lower bound of the default band.
 */
export function resolveExperienceYears(band: string): number {
  const years = yearsForBand(band);
  if (years !== null) return years;
  return yearsForBand(DEFAULT_EXPERIENCE_BAND) ?? 2;
}
