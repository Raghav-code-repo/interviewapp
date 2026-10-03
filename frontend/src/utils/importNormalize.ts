import type { ExperienceExpectations } from '../types';

/**
 * Repairs field-shift damage in bulk question JSON before normalization.
 *
 * Some bulk-export generators emit every field one slot late relative to the
 * Question schema. The reliable tell is `spaceComplexity`: the column is a
 * single string, so an array there means everything after it slid left by one.
 * A corrected record is left untouched, so this is safe to run over mixed files.
 */

export interface ImportRepair {
  field: string;
  detail: string;
}

export interface RepairResult {
  repaired: Record<string, unknown>;
  repairs: ImportRepair[];
}

const EXPERIENCE_LEVELS = ['junior', 'mid', 'senior', 'staffOrLead'] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asText(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => asText(entry)).filter((entry): entry is string => !!entry);
}

/**
 * True for a short single-line prose note. Complexity annotations look like
 * this; real source code does not. Braces and line breaks are the reliable
 * discriminators — a semicolon is not, because prose routinely uses one
 * ("memory is proportional to chunk size; persistent storage is not").
 */
function isProseNote(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 300) return false;
  return !/[{}]/.test(trimmed) && !trimmed.includes('\n');
}

const JAVA_MARKERS =
  /\b(public\s+(?:interface|class|enum|static|void|abstract)|System\.out|implements\s|extends\s|@Override|throws\s+\w+Exception)/;

const PYTHON_MARKERS = /^\s*(def|class|import|from)\s|^\s*#|\bself\b|\bprint\(/m;

function looksLikeJava(value: unknown): boolean {
  return typeof value === 'string' && JAVA_MARKERS.test(value) && !PYTHON_MARKERS.test(value);
}

function coerceExperienceExpectations(
  value: unknown
): ExperienceExpectations | undefined {
  if (!isPlainObject(value)) return undefined;

  const read = (level: (typeof EXPERIENCE_LEVELS)[number]) =>
    asText(value[level]) ?? '';

  const result: ExperienceExpectations = {
    junior: read('junior'),
    mid: read('mid'),
    senior: read('senior'),
    staffOrLead: read('staffOrLead'),
  };

  return EXPERIENCE_LEVELS.some((level) => result[level].length > 0)
    ? result
    : undefined;
}

export function repairShiftedQuestionFields(item: unknown): RepairResult {
  const repairs: ImportRepair[] = [];

  if (!isPlainObject(item)) {
    return { repaired: isPlainObject(item) ? item : {}, repairs };
  }

  const repaired: Record<string, unknown> = { ...item };

  // --- Block 1: the spaceComplexity shift -----------------------------------
  // spaceComplexity holds commonMistakes, commonMistakes holds followUpQuestions,
  // and javaCode/timeComplexity hold each other's complexity notes.
  if (Array.isArray(item.spaceComplexity)) {
    const mistakes = asStringArray(item.spaceComplexity);
    const followUps = asStringArray(item.commonMistakes);

    repaired.commonMistakes = mistakes;
    if (followUps.length > 0) repaired.followUpQuestions = followUps;

    const javaField = asText(item.javaCode);
    const timeField = asText(item.timeComplexity);
    // An empty javaCode means this record never carried the shifted note, so the
    // swap is skipped and timeComplexity keeps its (already correct) value.
    if (javaField && timeField && isProseNote(javaField) && isProseNote(timeField)) {
      repaired.timeComplexity = javaField;
      repaired.spaceComplexity = timeField;
      delete repaired.javaCode;
    } else {
      delete repaired.spaceComplexity;
    }

    repairs.push({ field: 'commonMistakes', detail: `Recovered ${mistakes.length} entries from spaceComplexity` });
    if (followUps.length > 0) {
      repairs.push({ field: 'followUpQuestions', detail: `Recovered ${followUps.length} entries from commonMistakes` });
    }
    if (repaired.timeComplexity !== item.javaCode) {
      repairs.push({ field: 'timeComplexity', detail: 'Restored from javaCode and spaceComplexity' });
    }
  }

  // --- Block 2: the followUpQuestions object shift ---------------------------
  // An object here is the level-by-level expectation block; its array
  // siblings are the real prerequisites and tags.
  if (isPlainObject(item.followUpQuestions)) {
    const expectations = coerceExperienceExpectations(item.followUpQuestions);
    if (expectations) {
      repaired.experienceExpectations = expectations;
      repairs.push({ field: 'experienceExpectations', detail: 'Recovered level expectations from followUpQuestions' });
    }

    const prereqs = asStringArray(item.experienceExpectations);
    if (prereqs.length > 0) {
      repaired.prerequisites = prereqs;
      repairs.push({ field: 'prerequisites', detail: `Recovered ${prereqs.length} entries from experienceExpectations` });
    }

    if (asStringArray(item.tags).length === 0 && asStringArray(item.prerequisites).length > 0) {
      repaired.tags = asStringArray(item.prerequisites);
      repairs.push({ field: 'tags', detail: 'Recovered tags from prerequisites' });
    }
  }

  // --- Block 3: Java source parked in the python field -----------------------
  if (looksLikeJava(item.pythonCode) && !asText(item.javaCode)) {
    repaired.javaCode = item.pythonCode;
    delete repaired.pythonCode;
    repairs.push({ field: 'javaCode', detail: 'Moved Java source out of pythonCode' });
  }

  return { repaired, repairs };
}