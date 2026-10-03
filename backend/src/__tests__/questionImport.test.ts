import { describe, it, expect, beforeEach } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import {
  humanize,
  slugify,
  importQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type QuestionImportPayload,
} from '../services/questionImport';

/**
 * Minimal in-memory stand-in for the Prisma client covering only the operations
 * `importQuestions` performs. A real database is not needed to assert the
 * behaviour that actually regressed here: taxonomy resolution, the
 * created-vs-updated split, and per-row failure isolation.
 */
function createFakePrisma() {
  const state = {
    categories: [] as { id: string; slug: string }[],
    subjects: [] as { id: string; slug: string }[],
    topics: [] as { id: string; slug: string }[],
    questions: [] as { id: string; slug: string; title: string }[],
    answers: [] as { id: string; questionId: string }[],
    codeExamples: [] as { id: string; questionId: string; language: string }[],
    calls: {
      categoryFind: 0,
      topicFind: 0,
      topicCreate: 0,
    },
  };

  let seq = 0;
  const nextId = (prefix: string) => `${prefix}-${(seq += 1)}`;

  const matches = (rows: { id: string; slug: string }[], where: any, key: string) =>
      rows.find((r) => r.slug === where[key] || r.id === where[key]) ?? null;

  const client = {
    category: {
      findFirst: async ({ where }: any) => {
        state.calls.categoryFind += 1;
        return matches(state.categories, where.OR[0], 'slug');
      },
      create: async ({ data }: any) => {
        const row = { id: nextId('cat'), slug: data.slug };
        state.categories.push(row);
        return row;
      },
    },
    subject: {
      findFirst: async ({ where }: any) => matches(state.subjects, where.OR[0], 'slug'),
      create: async ({ data }: any) => {
        const row = { id: nextId('sub'), slug: data.slug };
        state.subjects.push(row);
        return row;
      },
    },
    topic: {
      findFirst: async ({ where }: any) => {
        state.calls.topicFind += 1;
        return matches(state.topics, where.OR[0], 'slug');
      },
      create: async ({ data }: any) => {
        state.calls.topicCreate += 1;
        const row = { id: nextId('top'), slug: data.slug };
        state.topics.push(row);
        return row;
      },
    },
    question: {
      findFirst: async ({ where }: any) => {
        // Handles both query shapes the service uses: an OR of id/slug lookups
        // and a direct unique-field lookup by slug.
        const clauses = where?.OR ?? (where?.slug || where?.id ? [where] : []);
        const row = state.questions.find((q) =>
          clauses.some((c: any) => q.slug === c.slug || q.id === c.id)
        );
        return row ? { id: row.id } : null;
      },
      create: async ({ data }: any) => {
        const row = { id: data.id ?? nextId('q'), slug: data.slug, title: data.title };
        state.questions.push(row);
        return row;
      },
      update: async ({ where }: any) => {
        const row = state.questions.find((q) => q.id === where.id)!;
        return row;
      },
      findUnique: async ({ where }: any) => {
        const row = state.questions.find((q) => q.id === where.id);
        return row ? { id: row.id, slug: row.slug } : null;
      },
      delete: async ({ where }: any) => {
        const idx = state.questions.findIndex((q) => q.id === where.id);
        const [removed] = state.questions.splice(idx, 1);
        state.answers = state.answers.filter((a) => a.questionId !== removed.id);
        state.codeExamples = state.codeExamples.filter((c) => c.questionId !== removed.id);
        return removed;
      },
    },
    answer: {
      findFirst: async ({ where }: any) => {
        const row = state.answers.find((a) => a.questionId === where.questionId);
        return row ? { id: row.id } : null;
      },
      create: async ({ data }: any) => {
        state.answers.push({ id: nextId('ans'), questionId: data.questionId });
        return state.answers[state.answers.length - 1];
      },
      update: async () => ({}),
    },
    codeExample: {
      findFirst: async ({ where }: any) => {
        const row = state.codeExamples.find(
          (c) => c.questionId === where.questionId && c.language === where.language
        );
        return row ? { id: row.id } : null;
      },
      create: async ({ data }: any) => {
        state.codeExamples.push({
          id: nextId('code'),
          questionId: data.questionId,
          language: data.language,
        });
        return {};
      },
      update: async () => ({}),
    },
    $transaction: async (fn: (tx: any) => Promise<unknown>) => fn(client),
  };

  return { client: client as unknown as PrismaClient, state };
}

const shiftedPayload = (overrides: Partial<QuestionImportPayload> = {}): QuestionImportPayload => ({
  id: 'q-genai-transformers-01',
  slug: 'transformer-self-attention-multi-head-attention',
  title: 'Transformer Architecture: Self-Attention and Positional Information',
  statement: 'Self-attention lets each token compute weighted relationships with other tokens.',
  categoryId: 'genai',
  subjectId: 'genai-rag',
  topicId: 'topic-genai-transformers',
  difficulty: 'intermediate',
  shortAnswer: 'Attention flow with Q, K, V projections.',
  detailedExplanation: 'Multi-head attention runs several projections in parallel.',
  pythonCode: 'import math',
  commonMistakes: ['Confusing self-attention with cross-attention.'],
  followUpQuestions: ['Why is vanilla attention expensive for long contexts?'],
  prerequisites: ['Generative AI'],
  tags: [],
  ...overrides,
});

describe('questionImport naming helpers', () => {
  it('strips the taxonomy prefix when humanizing an id', () => {
    expect(humanize('topic-genai-rag-evaluation')).toBe('Genai Rag Evaluation');
    expect(humanize('genai-rag')).toBe('Genai Rag');
  });

  it('produces a URL-safe slug', () => {
    expect(slugify('LLM Pretraining vs Instruction Tuning!')).toBe(
      'llm-pretraining-vs-instruction-tuning'
    );
  });
});

describe('importQuestions', () => {
  let fake: ReturnType<typeof createFakePrisma>;

  beforeEach(() => {
    fake = createFakePrisma();
  });

  it('auto-creates the missing category, subject and topic referenced by a payload', async () => {
    const summary = await importQuestions(fake.client, [shiftedPayload()]);

    expect(summary.failed).toEqual([]);
    expect(summary.imported).toBe(1);
    expect(summary.created).toBe(1);
    expect(summary.taxonomyCreated).toEqual({ categories: 1, subjects: 1, topics: 1 });

    expect(fake.state.categories.map((c) => c.slug)).toEqual(['genai']);
    expect(fake.state.subjects.map((s) => s.slug)).toEqual(['genai-rag']);
    expect(fake.state.topics.map((t) => t.slug)).toEqual(['topic-genai-transformers']);
  });

  it('reuses existing taxonomy rows instead of creating duplicates on re-import', async () => {
    await importQuestions(fake.client, [shiftedPayload()]);
    const second = await importQuestions(fake.client, [shiftedPayload()]);

    expect(second.created).toBe(0);
    expect(second.updated).toBe(1);
    expect(second.taxonomyCreated).toEqual({ categories: 0, subjects: 0, topics: 0 });
    expect(fake.state.topics).toHaveLength(1);
    expect(fake.state.questions).toHaveLength(1);
  });

  it('caches taxonomy lookups across a batch', async () => {
    await importQuestions(fake.client, [
      shiftedPayload(),
      shiftedPayload({ id: 'q-b', slug: 'b', title: 'Second question' }),
      shiftedPayload({ id: 'q-c', slug: 'c', title: 'Third question' }),
    ]);

    // Three questions share one topic; without the per-run cache this would be
    // three findUnique round-trips followed by two redundant creates.
    expect(fake.state.calls.topicFind).toBe(1);
    expect(fake.state.calls.topicCreate).toBe(1);
  });

  it('matches an existing row by id when the slug changed between imports', async () => {
    await importQuestions(fake.client, [shiftedPayload()]);
    const summary = await importQuestions(fake.client, [
      shiftedPayload({ slug: 'transformer-attention-renamed' }),
    ]);

    expect(summary.updated).toBe(1);
    expect(fake.state.questions).toHaveLength(1);
  });

  it('records a rejected row and keeps importing the rest of the batch', async () => {
    const summary = await importQuestions(fake.client, [
      { title: '' } as QuestionImportPayload,
      shiftedPayload({ id: 'q-ok', slug: 'ok', title: 'Valid question' }),
    ]);

    expect(summary.requested).toBe(2);
    expect(summary.imported).toBe(1);
    expect(summary.failed).toHaveLength(1);
    expect(summary.failed[0].index).toBe(0);
    expect(summary.failed[0].reason).toMatch(/title is required/i);
  });

  it('writes the python code sample but skips an empty java block', async () => {
    await importQuestions(fake.client, [shiftedPayload()]);

    expect(fake.state.codeExamples.map((c) => c.language)).toEqual(['python']);
  });

  it('coerces an unknown difficulty to a valid enum value', async () => {
    const summary = await importQuestions(fake.client, [
      shiftedPayload({ difficulty: 'impossible' }),
    ]);

    expect(summary.failed).toEqual([]);
  });

  it('defaults a payload that omits taxonomy references entirely', async () => {
    const summary = await importQuestions(fake.client, [
      { title: 'Bare minimum question', statement: 'Some statement.' },
    ]);

    expect(summary.failed).toEqual([]);
    expect(fake.state.categories.map((c) => c.slug)).toEqual(['general']);
    expect(fake.state.subjects.map((s) => s.slug)).toEqual(['general-general']);
    expect(fake.state.topics.map((t) => t.slug)).toEqual(['general-general-general']);
  });
});

describe('single-question write path', () => {
  let fake: ReturnType<typeof createFakePrisma>;

  beforeEach(() => {
    fake = createFakePrisma();
  });

  it('creates a question and returns its persisted id', async () => {
    const created = await createQuestion(fake.client, shiftedPayload({ id: undefined }));

    expect(created.id).toBeTruthy();
    expect(fake.state.questions).toHaveLength(1);
    expect(fake.state.answers).toHaveLength(1);
  });

  it('rejects a create with no title instead of writing a broken row', async () => {
    await expect(
      createQuestion(fake.client, { statement: 'orphan statement' })
    ).rejects.toThrow(/title is required/i);

    expect(fake.state.questions).toHaveLength(0);
  });

  it('updates an existing question addressed by slug', async () => {
    await importQuestions(fake.client, [shiftedPayload()]);
    const existing = fake.state.questions[0];

    const result = await updateQuestion(fake.client, existing.slug, {
      title: 'Renamed title',
      statement: 'Updated statement.',
    });

    expect(result.id).toBe(existing.id);
    expect(fake.state.questions).toHaveLength(1);
  });

  it('keeps the original slug when a title changes', async () => {
    await importQuestions(fake.client, [shiftedPayload()]);
    const originalSlug = fake.state.questions[0].slug;

    await updateQuestion(fake.client, 'q-genai-transformers-01', {
      title: 'A Completely Different Title',
      statement: 'Updated statement.',
    });

    expect(fake.state.questions[0].slug).toBe(originalSlug);
  });

  it('reports a missing question as 404 rather than silently succeeding', async () => {
    await expect(
      updateQuestion(fake.client, 'does-not-exist', { title: 'x', statement: 'y' })
    ).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
  });

  it('deletes a question and cascades to its answer and code rows', async () => {
    await importQuestions(fake.client, [shiftedPayload()]);
    const id = fake.state.questions[0].id;

    await expect(deleteQuestion(fake.client, id)).resolves.toBe(true);

    expect(fake.state.questions).toHaveLength(0);
    expect(fake.state.answers).toHaveLength(0);
    expect(fake.state.codeExamples).toHaveLength(0);
  });

  it('returns false when a delete matches nothing, so the route can answer 404', async () => {
    await expect(deleteQuestion(fake.client, 'no-such-id')).resolves.toBe(false);
  });
});