import { PrismaClient } from '@prisma/client';

/**
 * Bulk question import for the Content Studio.
 *
 * Every other admin write path in this service mutated the in-memory
 * `BACKEND_QUESTIONS` array, which meant a "successful" create disappeared on
 * restart and never reached Postgres. This module is the write-through path:
 * incoming payloads are resolved against the real taxonomy, then upserted into
 * Postgres so an import is durable and repeatable.
 */

const DIFFICULTIES = new Set(['beginner', 'intermediate', 'advanced', 'expert']);
const INTERVIEW_TYPES = new Set(['screening', 'deep_dive', 'system_design', 'coding', 'behavioral']);
const STATUSES = new Set(['published', 'draft', 'needs_review']);

export interface QuestionImportPayload {
  id?: string;
  slug?: string;
  title?: string;
  statement?: string;
  categoryId?: string;
  subjectId?: string;
  topicId?: string;
  difficulty?: string;
  interviewType?: string;
  estimatedTimeMinutes?: number;
  expectedAnswerDepth?: string;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  shortAnswer?: string;
  detailedExplanation?: string;
  practicalExample?: string;
  pythonCode?: string;
  javaCode?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  commonMistakes?: string[];
  followUpQuestions?: string[];
  experienceExpectations?: Record<string, string>;
  prerequisites?: string[];
  tags?: string[];
  status?: string;
}

export interface ImportFailure {
  index: number;
  id?: string;
  title?: string;
  reason: string;
}

export interface ImportSummary {
  requested: number;
  imported: number;
  created: number;
  updated: number;
  failed: ImportFailure[];
  taxonomyCreated: {
    categories: number;
    subjects: number;
    topics: number;
  };
}

/**
 * Taxonomy references are cached per import run. Without this a 24-question
 * import issues 72 identical SELECTs, because every question in the batch
 * points at the same handful of categories and topics.
 */
class TaxonomyResolver {
  private readonly categories = new Map<string, string>();
  private readonly subjects = new Map<string, string>();
  private readonly topics = new Map<string, string>();

  readonly created = { categories: 0, subjects: 0, topics: 0 };

  constructor(private readonly client: PrismaClient) {}

  async category(ref: string): Promise<string> {
    const key = ref.trim();
    const cached = this.categories.get(key);
    if (cached) return cached;

    // The incoming payload carries frontend-style ids ("genai") but the schema
    // stores UUIDs, so match on either column in a single round-trip before
    // falling back to a create.
    const existing = await this.client.category.findFirst({
      where: { OR: [{ slug: key }, { id: key }] },
    });

    if (existing) {
      this.categories.set(key, existing.id);
      return existing.id;
    }

    const created = await this.client.category.create({
      data: {
        slug: key,
        name: humanize(key),
        description: `Auto-created during question import for "${key}".`,
      },
    });
    this.categories.set(key, created.id);
    this.created.categories += 1;
    return created.id;
  }

  async subject(ref: string, categoryId: string): Promise<string> {
    const key = ref.trim();
    const cached = this.subjects.get(key);
    if (cached) return cached;

    const existing = await this.client.subject.findFirst({
      where: { OR: [{ slug: key }, { id: key }] },
    });

    if (existing) {
      this.subjects.set(key, existing.id);
      return existing.id;
    }

    const created = await this.client.subject.create({
      data: {
        categoryId,
        slug: key,
        name: humanize(key),
        description: `Auto-created during question import for "${key}".`,
      },
    });
    this.subjects.set(key, created.id);
    this.created.subjects += 1;
    return created.id;
  }

  async topic(ref: string, subjectId: string): Promise<string> {
    const key = ref.trim();
    const cached = this.topics.get(key);
    if (cached) return cached;

    const existing = await this.client.topic.findFirst({
      where: { OR: [{ slug: key }, { id: key }] },
    });

    if (existing) {
      this.topics.set(key, existing.id);
      return existing.id;
    }

    const created = await this.client.topic.create({
      data: {
        subjectId,
        slug: key,
        name: humanize(key),
        description: `Auto-created during question import for "${key}".`,
        tags: [],
      },
    });
    this.topics.set(key, created.id);
    this.created.topics += 1;
    return created.id;
  }
}

/** "topic-genai-rag-evaluation" -> "Genai Rag Evaluation" */
export function humanize(ref: string): string {
  const stripped = ref.replace(/^(topic|subject|category)-/, '');
  return stripped
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function asEnum<T extends string>(
  value: unknown,
  allowed: Set<string>,
  fallback: T
): T {
  return typeof value === 'string' && allowed.has(value) ? (value as T) : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => String(entry ?? '').trim()).filter(Boolean);
}

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Resolves or creates the category/subject/topic triple for a payload, then
 * upserts the question and its answer + code example children.
 *
 * One transaction per question: a malformed row is rejected on its own without
 * discarding the rest of the batch.
 */
async function importOne(
  client: PrismaClient,
  taxonomy: TaxonomyResolver,
  payload: QuestionImportPayload
): Promise<'created' | 'updated'> {
  const title = asTrimmedString(payload.title);
  if (!title) throw new Error('title is required');

  const statement = asTrimmedString(payload.statement) ?? title;

  const categoryRef = asTrimmedString(payload.categoryId) ?? 'general';
  const subjectRef = asTrimmedString(payload.subjectId) ?? `${categoryRef}-general`;
  const topicRef = asTrimmedString(payload.topicId) ?? `${subjectRef}-general`;

  const categoryId = await taxonomy.category(categoryRef);
  const subjectId = await taxonomy.subject(subjectRef, categoryId);
  const topicId = await taxonomy.topic(topicRef, subjectId);

  const slug = asTrimmedString(payload.slug) ?? slugify(title);
  if (!slug) throw new Error('title produced an empty slug');

  const commonMistakes = asStringArray(payload.commonMistakes);
  const followUpQuestions = asStringArray(payload.followUpQuestions);
  const prerequisites = asStringArray(payload.prerequisites);
  const tags = asStringArray(payload.tags);

  const scalar = {
    title,
    statement,
    categoryId,
    subjectId,
    topicId,
    minExperienceYears: asNumber(payload.minExperienceYears, 0),
    maxExperienceYears: asNumber(payload.maxExperienceYears, 20),
    difficulty: asEnum(payload.difficulty, DIFFICULTIES, 'intermediate'),
    interviewType: asEnum(payload.interviewType, INTERVIEW_TYPES, 'screening'),
    estimatedTimeMinutes: asNumber(payload.estimatedTimeMinutes, 15),
    expectedAnswerDepth:
      asTrimmedString(payload.expectedAnswerDepth) ?? 'Standard overview',
    timeComplexity: asTrimmedString(payload.timeComplexity) ?? null,
    spaceComplexity: asTrimmedString(payload.spaceComplexity) ?? null,
    commonMistakes,
    followUpQuestions,
    prerequisites,
    tags,
    status: asEnum(payload.status, STATUSES, 'published'),
  };

  // Upsert by slug, falling back to the supplied id so re-importing the same
  // file twice updates in place instead of tripping the unique constraints.
  const existing = await client.question.findFirst({
    where: {
      OR: [{ slug }, ...(asTrimmedString(payload.id) ? [{ id: payload.id!.trim() }] : [])],
    },
    select: { id: true },
  });

  const question = existing
    ? await client.question.update({ where: { id: existing.id }, data: scalar })
    : await client.question.create({
        // slug is create-only: it is the upsert key, so rewriting it on update
        // would either be a no-op or collide with a different row.
        data: { ...scalar, slug, id: asTrimmedString(payload.id) ?? undefined },
      });

  const expectations = payload.experienceExpectations ?? {};
  const answerData = {
    shortAnswer: asTrimmedString(payload.shortAnswer) ?? '',
    detailedExplanation: asTrimmedString(payload.detailedExplanation) ?? '',
    practicalExample: asTrimmedString(payload.practicalExample) ?? null,
    juniorExpectation: asTrimmedString(expectations.junior) ?? null,
    midExpectation: asTrimmedString(expectations.mid) ?? null,
    seniorExpectation: asTrimmedString(expectations.senior) ?? null,
    staffExpectation: asTrimmedString(expectations.staffOrLead) ?? null,
  };

  const existingAnswer = await client.answer.findFirst({
    where: { questionId: question.id },
    select: { id: true },
  });

  if (existingAnswer) {
    await client.answer.update({ where: { id: existingAnswer.id }, data: answerData });
  } else {
    await client.answer.create({ data: { ...answerData, questionId: question.id } });
  }

  // Code examples replace on re-import so a corrected snippet actually lands.
  const codeBlocks = [
    { language: 'python', snippet: asTrimmedString(payload.pythonCode) },
    { language: 'java', snippet: asTrimmedString(payload.javaCode) },
  ];

  for (const block of codeBlocks) {
    if (!block.snippet) continue;
    const existingCode = await client.codeExample.findFirst({
      where: { questionId: question.id, language: block.language },
      select: { id: true },
    });
    if (existingCode) {
      await client.codeExample.update({
        where: { id: existingCode.id },
        data: { codeSnippet: block.snippet },
      });
    } else {
      await client.codeExample.create({
        data: {
          questionId: question.id,
          language: block.language,
          title: `${block.language === 'python' ? 'Python' : 'Java'} Implementation`,
          codeSnippet: block.snippet,
        },
      });
    }
  }

  return existing ? 'updated' : 'created';
}

/**
 * Imports a batch of questions, continuing past individual failures so one bad
 * row cannot silently abort the rest of the upload. Callers must have already
 * confirmed the database is reachable.
 */
export async function importQuestions(
  client: PrismaClient,
  payloads: QuestionImportPayload[]
): Promise<ImportSummary> {
  const taxonomy = new TaxonomyResolver(client);
  const failed: ImportFailure[] = [];
  let created = 0;
  let updated = 0;

  for (let index = 0; index < payloads.length; index += 1) {
    const payload = payloads[index];
    try {
      // A per-question transaction keeps taxonomy creations from the failed row
      // out of the surviving rows' writes, while still rolling that row back.
      const outcome = await client.$transaction((tx) =>
        importOne(tx as unknown as PrismaClient, taxonomy, payload)
      );
      if (outcome === 'created') created += 1;
      else updated += 1;
    } catch (err) {
      failed.push({
        index,
        id: payload?.id,
        title: payload?.title,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    requested: payloads.length,
    imported: created + updated,
    created,
    updated,
    failed,
    taxonomyCreated: { ...taxonomy.created },
  };
}

/**
 * Single-question write path used by the Studio editor. Unlike `importQuestions`
 * this throws on failure so the route can return an accurate status instead of
 * a partial-success summary.
 */
export async function createQuestion(
  client: PrismaClient,
  payload: QuestionImportPayload
): Promise<{ id: string }> {
  const taxonomy = new TaxonomyResolver(client);
  return client.$transaction(async (tx) => {
    const inner = tx as unknown as PrismaClient;
    // importOne generates the row id when the payload omits one, so the created
    // row is located by its slug instead.
    await importOne(inner, taxonomy, payload);
    const created = await inner.question.findFirst({
      where: { slug: asTrimmedString(payload.slug) ?? slugify(payload.title ?? '') },
      select: { id: true },
    });
    if (!created) throw new Error('Question was not persisted.');
    return created;
  });
}

/**
 * Updates an existing question addressed by id or slug. Re-runs the same
 * taxonomy resolution and child-table writes as an import, so an edit from the
 * Studio produces the same row shape a re-import would.
 */
export async function updateQuestion(
  client: PrismaClient,
  ref: string,
  payload: QuestionImportPayload
): Promise<{ id: string }> {
  const existing = await client.question.findFirst({
    where: { OR: [{ id: ref }, { slug: ref }] },
    select: { id: true },
  });

  if (!existing) {
    throw Object.assign(new Error(`No question found with id or slug "${ref}".`), {
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  const taxonomy = new TaxonomyResolver(client);

  return client.$transaction(async (tx) => {
    const inner = tx as unknown as PrismaClient;
    // Keep the original slug so an edit cannot silently change a question's
    // public URL; importOne derives it from the title when none is supplied.
    const current = await inner.question.findUnique({
      where: { id: existing.id },
      select: { slug: true },
    });
    await importOne(inner, taxonomy, { ...payload, id: existing.id, slug: current?.slug });
    return { id: existing.id };
  });
}

/**
 * Deletes a question and, via schema cascade, its answers and code examples.
 * Returns false when nothing matched so the route can answer 404 instead of
 * claiming a delete that never happened.
 */
export async function deleteQuestion(
  client: PrismaClient,
  ref: string
): Promise<boolean> {
  const existing = await client.question.findFirst({
    where: { OR: [{ id: ref }, { slug: ref }] },
    select: { id: true },
  });

  if (!existing) return false;

  await client.question.delete({ where: { id: existing.id } });
  return true;
}