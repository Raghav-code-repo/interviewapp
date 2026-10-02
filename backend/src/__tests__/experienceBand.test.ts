import { describe, it, expect } from 'vitest';
import { yearsForBand, resolveExperienceYears, isExperienceBand, EXPERIENCE_BANDS } from '../utils/experienceBand';

describe('Experience band resolution', () => {
  it('resolves the lower bound for range bands', () => {
    expect(yearsForBand('0-2')).toBe(0);
    expect(yearsForBand('2-5')).toBe(2);
    expect(yearsForBand('8-12')).toBe(8);
    expect(yearsForBand('15-20')).toBe(15);
  });

  it('resolves "20+" to 20 rather than failing to parse it', () => {
    expect(yearsForBand('20+')).toBe(20);
  });

  it('resolves the exact value for single-year bands', () => {
    expect(yearsForBand('0')).toBe(0);
  });

  it('returns null for unrecognised bands instead of a plausible wrong number', () => {
    // The previous implementation did `parseInt(band.split('-')[0]) || 2`, which
    // silently produced 2 for both '0' and garbage input.
    expect(yearsForBand('banana')).toBeNull();
    expect(yearsForBand('')).toBeNull();
    expect(yearsForBand('5-')).toBeNull();
  });

  it('never reports 0 years as falsy 2 via the fallback helper', () => {
    expect(resolveExperienceYears('0')).toBe(0);
    expect(resolveExperienceYears('0-2')).toBe(0);
  });

  it('falls back to the default band for unusable input', () => {
    expect(resolveExperienceYears('nonsense')).toBe(2);
  });

  it('validates membership of the known band list', () => {
    expect(isExperienceBand('2-5')).toBe(true);
    expect(isExperienceBand('20+')).toBe(true);
    expect(isExperienceBand('99-100')).toBe(false);
    expect(isExperienceBand(42)).toBe(false);
  });

  it('every advertised band resolves to a usable year count', () => {
    for (const band of EXPERIENCE_BANDS) {
      expect(yearsForBand(band)).not.toBeNull();
      expect(resolveExperienceYears(band)).toBeGreaterThanOrEqual(0);
    }
  });
});
