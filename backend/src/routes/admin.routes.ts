import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BACKEND_QUESTIONS } from '../services/seedData';
import { requireAuth, requireAdmin } from '../middleware/auth';

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

const AdminQuestionSchema = z.object({
  title: z.string().min(5),
  statement: z.string().min(10),
  categoryId: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  minExperienceYears: z.number().default(0),
  maxExperienceYears: z.number().default(20),
  shortAnswer: z.string().default(''),
  detailedExplanation: z.string().default(''),
  status: z.enum(['published', 'draft', 'needs_review']).default('published'),
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

adminRouter.post('/admin/questions', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = AdminQuestionSchema.parse(req.body);
    const newQuestion = {
      id: `q-adm-${Date.now()}`,
      slug: slugify(data.title),
      ...data,
      interviewType: 'screening',
      estimatedTimeMinutes: 15,
      expectedAnswerDepth: 'Standard overview',
      practicalExample: '',
      commonMistakes: [],
      followUpQuestions: [],
      prerequisites: [],
      tags: [data.categoryId, data.difficulty],
    };

    BACKEND_QUESTIONS.unshift(newQuestion as never);

    res.status(201).json({
      success: true,
      data: newQuestion,
    });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/admin/questions/:id', (req: Request, res: Response) => {
  const idx = BACKEND_QUESTIONS.findIndex((q) => q.id === req.params.id);

  // Previously always reported success, even when nothing matched, which left the
  // client believing a delete had happened when the record was still present.
  if (idx === -1) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `No question found with id "${req.params.id}".`,
      },
    });
  }

  BACKEND_QUESTIONS.splice(idx, 1);
  res.status(200).json({ success: true, message: 'Question deleted successfully' });
});

adminRouter.get('/admin/export', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: BACKEND_QUESTIONS,
    meta: {
      exportedAt: new Date().toISOString(),
      count: BACKEND_QUESTIONS.length,
    },
  });
});
