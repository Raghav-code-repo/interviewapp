import { Router, Request, Response } from 'express';
import { BACKEND_CATEGORIES } from '../services/seedData';

export const taxonomyRouter = Router();

taxonomyRouter.get('/categories', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: BACKEND_CATEGORIES,
    meta: {
      total: BACKEND_CATEGORIES.length,
      timestamp: new Date().toISOString(),
    },
  });
});

taxonomyRouter.get('/categories/:slug', (req: Request, res: Response) => {
  const category = BACKEND_CATEGORIES.find(
    (c) => c.slug === req.params.slug || c.id === req.params.slug
  );

  if (!category) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Category not found' },
    });
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});
