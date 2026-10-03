import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BACKEND_QUESTIONS } from '../services/seedData';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { isDatabaseReady, withDatabase } from '../services/prisma';
import {
  importQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type QuestionImportPayload,
} from '../services/questionImport';
import { listQuestions } from '../services/questionStore';

export const adminRouter = Router();

// Content Studio endpoints mutate the shared question bank. They were previously
// registered without any guard, which let anonymous callers create and delete
// questions. requireAuth authenticates the caller; requireAdmin then rejects
// anyone whose role is not `admin`. Order matters: requireAdmin reads req.user.
//
// The '/admin' prefix is essential: this router is mounted at '/api', so an
// unscoped `use()` would run these guards on every API request and reject
// unauthenticated traffic to /api/questions, /api/taxonomy, etc.
adminRouter.use('/admin', requireAuth, requireAdmin);

/**
 * Studio payloads are passed through rather than strictly enumerated: the editor
 * sends the whole question object, and dropping unknown keys here would silently
 * discard answers, tags and complexity notes on every save.
 */
const AdminQuestionSchema = z
  .object({
    title: z.string().min(5),
    statement: z.string().min(10),
    categoryId: z.string().optional(),
    subjectId: z.string().optional(),
    topicId: z.string().optional(),
    slug: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    interviewType: z.string().optional(),
    estimatedTimeMinutes: z.number().optional(),
    expectedAnswerDepth: z.string().optional(),
    minExperienceYears: z.number().optional(),
    maxExperienceYears: z.number().optional(),
    shortAnswer: z.string().optional(),
    detailedExplanation: z.string().optional(),
    practicalExample: z.string().optional(),
    pythonCode: z.string().optional(),
    javaCode: z.string().optional(),
    timeComplexity: z.string().optional(),
    spaceComplexity: z.string().optional(),
    commonMistakes: z.array(z.string()).optional(),
    followUpQuestions: z.array(z.string()).optional(),
    prerequisites: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['published', 'draft', 'needs_review']).optional(),
  })
  .passthrough();

/** 503 rather than a silent success when the write target is unreachable. */
async function requireDatabase(res: Response): Promise<boolean> {
  if (await isDatabaseReady()) return true;

  res.status(503).json({
    success: false,
    error: {
      code: 'DATABASE_UNAVAILABLE',
      message:
        'This operation requires a reachable database. Nothing was saved; retry once it is reachable.',
    },
  });
  return false;
}

/**
 * Mirrors a successful database write into the in-memory seed array so the
 * degraded fallback path stays consistent for the rest of the process lifetime.
 */
function mirrorIntoMemory(question: Record<string, unknown>, mode: 'add' | 'replace' | 'remove', id?: string) {
  const list = BACKEND_QUESTIONS as unknown as Record<string, unknown>[];

  if (mode === 'remove') {
    const idx = list.findIndex((q) => q.id === id || q.slug === id);
    if (idx !== -1) list.splice(idx, 1);
    return;
  }

  const existing = list.findIndex((q) => q.id === question.id || q.slug === question.slug);
  if (existing === -1) list.unshift(question);
  else list[existing] = question;
}

adminRouter.post('/admin/questions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = AdminQuestionSchema.parse(req.body);

    if (!(await requireDatabase(res))) return;

    const payload: QuestionImportPayload = {
      ...(data as Record<string, unknown>),
      tags: data.tags ?? [data.categoryId, data.difficulty].filter(Boolean) as string[],
      status: data.status ?? 'published',
    } as QuestionImportPayload;

    const created = await withDatabase((client) => createQuestion(client, payload));

    // Re-read through the store so the response matches what the read path
    // would serve, rather than echoing the un-normalised request body.
    const stored = await listQuestions({});
    const question =
      stored.questions.find((q) => q.id === created.id || q.slug === payload.slug) ??
      ({ ...payload } as unknown as Record<string, unknown>);
    mirrorIntoMemory(question, 'add');

    res.status(201).json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/admin/questions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = AdminQuestionSchema.partial().parse(req.body);

    if (!(await requireDatabase(res))) return;

    const updated = await withDatabase((client) =>
      updateQuestion(client, req.params.id, data as QuestionImportPayload)
    );

    const stored = await listQuestions({});
    const question =
      stored.questions.find((q) => q.id === updated.id) ??
      stored.questions.find((q) => q.slug === req.params.id);
    if (question) mirrorIntoMemory(question, 'replace');

    res.status(200).json({ success: true, data: question ?? { id: updated.id } });
  } catch (err) {
    next(err);
  }
});

/**
 * Bulk import for the Studio JSON uploader.
 *
 * This route did not exist: the uploader POSTed to /admin/questions/bulk and
 * got a 404, then reported success anyway because it only checked res.ok and
 * fell back to a "saved to Studio storage" message. It writes through to
 * Postgres so an import survives a restart and is visible to other clients.
 *
 * Permissive by design — bulk files arrive from third-party generators, so
 * unknown keys are passed through rather than rejected and `importQuestions`
 * applies per-field defaults instead.
 */
const BulkImportSchema = z.array(z.record(z.unknown())).min(1);

adminRouter.post(
  '/admin/questions/bulk',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = BulkImportSchema.parse(req.body);

      if (!(await isDatabaseReady())) {
        return res.status(503).json({
          success: false,
          error: {
            code: 'DATABASE_UNAVAILABLE',
            message:
              'Question import requires a reachable database. Nothing was saved; retry once the database is reachable.',
          },
        });
      }

      const summary = await withDatabase((client) =>
        importQuestions(client, items as Parameters<typeof importQuestions>[1])
      );

      // Partial success is still a success: the rows that failed are reported
      // individually so the operator can fix just those.
      return res.status(summary.failed.length === 0 ? 201 : 207).json({
        success: summary.failed.length === 0,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }
);

adminRouter.delete('/admin/questions/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(await requireDatabase(res))) return;

    // Reports false rather than assuming success, so a delete that matched
    // nothing cannot leave the client believing the record is gone.
    const deleted = await withDatabase((client) => deleteQuestion(client, req.params.id));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `No question found with id "${req.params.id}".`,
        },
      });
    }

    mirrorIntoMemory({ id: req.params.id }, 'remove', req.params.id);
    res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/admin/export', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { questions, source } = await listQuestions({});

    res.status(200).json({
      success: true,
      data: questions,
      meta: {
        exportedAt: new Date().toISOString(),
        count: questions.length,
        source,
      },
    });
  } catch (err) {
    next(err);
  }
});
