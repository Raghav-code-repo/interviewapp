import { Prisma } from '@prisma/client';
import { isDatabaseReady, withDatabase } from './prisma';
import { BACKEND_QUESTIONS } from './seedData';

/**
 * Read path for questions.
 *
 * The database normalises a question into Question + Answer + CodeExample rows,
 * but the client contract is one flat object. These helpers fold the children
 * back in and keep the same wire shape the bundled seed data uses, so no
 * frontend component has to change to consume real rows.
 *
 * When the database is unreachable the in-memory seed array is served instead,
 * matching the fallback convention already used by userStore.ts.
 */

const QUESTION_INCLUDE = {
  answers: { take: 1 },
  codeExamples: true,
  category: { select: { slug: true } },
  subject: { select: { slug: true } },
  topic: { select: { slug: true } },
} satisfies Prisma.QuestionInclude;

type QuestionRow = Prisma.QuestionGetPayload<{ include: typeof QUESTION_INCLUDE }>;

export interface QuestionFilters {
  category?: string;
  difficulty?: string;
  expYears?: number;
  query?: string;
  status?: string;
}

export type ContentSource = 'database' | 'memory';

export interface QuestionListResult {
  questions: Record<string, unknown>[];
  source: ContentSource;
}

/**
 * Flattens a joined row into the single-object shape the UI expects.
 *
 * Taxonomy references are emitted as slugs rather than UUIDs: the client keys
 * questions by slug (and its bundled seed data does too), so returning UUIDs
 * would break every filter and lookup by category or topic.
 */
export function toQuestionDto(row: QuestionRow): Record<string, unknown> {
  const answer = row.answers[0];
  const python = row.codeExamples.find((c) => c.language === 'python');
  const java = row.codeExamples.find((c) => c.language === 'java');

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    statement: row.statement,
    categoryId: row.category.slug,
    subjectId: row.subject.slug,
    topicId: row.topic.slug,
    difficulty: row.difficulty,
    interviewType: row.interviewType,
    estimatedTimeMinutes: row.estimatedTimeMinutes,
    expectedAnswerDepth: row.expectedAnswerDepth,
    minExperienceYears: row.minExperienceYears,
    maxExperienceYears: row.maxExperienceYears,
    shortAnswer: answer?.shortAnswer ?? '',
    detailedExplanation: answer?.detailedExplanation ?? '',
    practicalExample: answer?.practicalExample ?? '',
    experienceExpectations: {
      junior: answer?.juniorExpectation ?? '',
      mid: answer?.midExpectation ?? '',
      senior: answer?.seniorExpectation ?? '',
      staffOrLead: answer?.staffExpectation ?? '',
    },
    pythonCode: python?.codeSnippet,
    javaCode: java?.codeSnippet,
    timeComplexity: row.timeComplexity ?? undefined,
    spaceComplexity: row.spaceComplexity ?? undefined,
    commonMistakes: row.commonMistakes,
    followUpQuestions: row.followUpQuestions,
    prerequisites: row.prerequisites,
    tags: row.tags,
    status: row.status,
  };
}

function buildWhere(filters: QuestionFilters): Prisma.QuestionWhereInput {
  const where: Prisma.QuestionWhereInput = {};

  if (filters.category && filters.category !== 'all') {
    // Tolerate either a slug or a raw id so a stale client filter still matches.
    where.OR = [
      { category: { slug: filters.category } },
      { categoryId: filters.category },
    ];
  }

  if (filters.difficulty && filters.difficulty !== 'all') {
    where.difficulty = filters.difficulty;
  }

  if (typeof filters.expYears === 'number' && Number.isFinite(filters.expYears)) {
    where.minExperienceYears = { lte: filters.expYears };
    where.maxExperienceYears = { gte: filters.expYears };
  }

  if (filters.status && filters.status !== 'all') {
    where.status = filters.status;
  }

  if (filters.query) {
    where.AND = [
      {
        OR: [
          { title: { contains: filters.query, mode: 'insensitive' } },
          { statement: { contains: filters.query, mode: 'insensitive' } },
          { tags: { has: filters.query.toLowerCase() } },
        ],
      },
    ];
  }

  return where;
}

function filterMemory(filters: QuestionFilters): Record<string, unknown>[] {
  let results = [...BACKEND_QUESTIONS] as unknown as Record<string, unknown>[];

  if (filters.category && filters.category !== 'all') {
    results = results.filter((q) => q.categoryId === filters.category);
  }
  if (filters.difficulty && filters.difficulty !== 'all') {
    results = results.filter((q) => q.difficulty === filters.difficulty);
  }
  if (typeof filters.expYears === 'number' && Number.isFinite(filters.expYears)) {
    results = results.filter(
      (q) =>
        (q.minExperienceYears as number) <= filters.expYears! &&
        (q.maxExperienceYears as number) >= filters.expYears!
    );
  }
  if (filters.status && filters.status !== 'all') {
    results = results.filter((q) => q.status === filters.status);
  }
  if (filters.query) {
    const needle = filters.query.toLowerCase();
    results = results.filter((q) => {
      const tags = Array.isArray(q.tags) ? (q.tags as string[]) : [];
      return (
        String(q.title).toLowerCase().includes(needle) ||
        String(q.statement).toLowerCase().includes(needle) ||
        tags.some((t) => t.toLowerCase().includes(needle))
      );
    });
  }

  return results;
}

export async function listQuestions(filters: QuestionFilters = {}): Promise<QuestionListResult> {
  if (await isDatabaseReady()) {
    const rows = await withDatabase((prisma) =>
      prisma.question.findMany({
        where: buildWhere(filters),
        include: QUESTION_INCLUDE,
        orderBy: { createdAt: 'asc' },
      })
    );
    return { questions: rows.map(toQuestionDto), source: 'database' };
  }

  return { questions: filterMemory(filters), source: 'memory' };
}

export async function findQuestionByRef(
  ref: string
): Promise<{ question: Record<string, unknown>; source: ContentSource } | null> {
  if (await isDatabaseReady()) {
    const row = await withDatabase((prisma) =>
      prisma.question.findFirst({
        where: { OR: [{ id: ref }, { slug: ref }] },
        include: QUESTION_INCLUDE,
      })
    );
    return row ? { question: toQuestionDto(row), source: 'database' } : null;
  }

  const match = (BACKEND_QUESTIONS as unknown as Record<string, unknown>[]).find(
    (q) => q.id === ref || q.slug === ref
  );
  return match ? { question: match, source: 'memory' } : null;
}