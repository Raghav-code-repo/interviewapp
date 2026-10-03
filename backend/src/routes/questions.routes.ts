import { Router, Request, Response } from 'express';
import { listQuestions, findQuestionByRef } from '../services/questionStore';

export const questionsRouter = Router();

/**
 * Reads from Postgres via questionStore, falling back to the bundled in-memory
 * seed array only when the database is unreachable. `meta.source` tells the
 * client which one answered, so a degraded response is never mistaken for
 * authoritative content.
 */
questionsRouter.get('/questions', async (req: Request, res: Response) => {
  const { category, difficulty, expYears, query, status } = req.query;

  const years = Number(expYears);

  const { questions, source } = await listQuestions({
    category: typeof category === 'string' ? category : undefined,
    difficulty: typeof difficulty === 'string' ? difficulty : undefined,
    expYears: expYears !== undefined && !Number.isNaN(years) ? years : undefined,
    query: typeof query === 'string' && query.trim() ? query.trim() : undefined,
    status: typeof status === 'string' ? status : undefined,
  });

  res.status(200).json({
    success: true,
    data: questions,
    meta: {
      total: questions.length,
      source,
      timestamp: new Date().toISOString(),
    },
  });
});

questionsRouter.get('/questions/:idOrSlug', async (req: Request, res: Response) => {
  const result = await findQuestionByRef(req.params.idOrSlug);

  if (!result) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Question not found' },
    });
  }

  res.status(200).json({
    success: true,
    data: result.question,
    meta: { source: result.source },
  });
});