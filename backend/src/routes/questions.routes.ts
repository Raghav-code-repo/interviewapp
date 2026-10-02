import { Router, Request, Response } from 'express';
import { BACKEND_QUESTIONS } from '../services/seedData';

export const questionsRouter = Router();

questionsRouter.get('/questions', (req: Request, res: Response) => {
  const { category, difficulty, expYears, query } = req.query;

  let results = [...BACKEND_QUESTIONS];

  if (category && category !== 'all') {
    results = results.filter((q) => q.categoryId === category);
  }

  if (difficulty && difficulty !== 'all') {
    results = results.filter((q) => q.difficulty === difficulty);
  }

  if (expYears) {
    const years = Number(expYears);
    if (!isNaN(years)) {
      results = results.filter(
        (q) => years >= q.minExperienceYears && years <= q.maxExperienceYears
      );
    }
  }

  if (query) {
    const qStr = String(query).toLowerCase();
    results = results.filter(
      (q) =>
        q.title.toLowerCase().includes(qStr) ||
        q.statement.toLowerCase().includes(qStr) ||
        q.tags.some((t) => t.toLowerCase().includes(qStr))
    );
  }

  res.status(200).json({
    success: true,
    data: results,
    meta: {
      total: results.length,
      timestamp: new Date().toISOString(),
    },
  });
});

questionsRouter.get('/questions/:idOrSlug', (req: Request, res: Response) => {
  const param = req.params.idOrSlug;
  const question = BACKEND_QUESTIONS.find(
    (q) => q.id === param || q.slug === param
  );

  if (!question) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Question not found' },
    });
  }

  res.status(200).json({
    success: true,
    data: question,
  });
});
