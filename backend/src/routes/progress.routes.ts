import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { optionalAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

export const progressRouter = Router();

// In-memory demo progress tracking state
const demoBookmarks = new Set<string>(['q-py-gil-01']);
const demoMastered = new Set<string>(['q-py-gil-01']);
const demoRevisions = new Map<string, { dueDate: string; intervalDays: number }>([
  ['q-dsa-sliding-01', { dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), intervalDays: 3 }],
]);

progressRouter.get('/progress', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      masteredCount: demoMastered.size,
      bookmarkedCount: demoBookmarks.size,
      revisionsDueCount: demoRevisions.size,
      masteredQuestionIds: Array.from(demoMastered),
      bookmarkedQuestionIds: Array.from(demoBookmarks),
      revisions: Array.from(demoRevisions.entries()).map(([questionId, meta]) => ({
        questionId,
        ...meta,
      })),
    },
  });
});

progressRouter.post('/progress/bookmark', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { questionId } = req.body;
  if (!questionId) {
    return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'questionId required' } });
  }

  const isBookmarked = demoBookmarks.has(questionId);
  if (isBookmarked) {
    demoBookmarks.delete(questionId);
  } else {
    demoBookmarks.add(questionId);
  }

  res.status(200).json({
    success: true,
    data: { questionId, bookmarked: !isBookmarked },
  });
});

progressRouter.post('/progress/status', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { questionId, status } = req.body;
  if (!questionId) {
    return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'questionId required' } });
  }

  if (status === 'mastered') {
    demoMastered.add(questionId);
  } else {
    demoMastered.delete(questionId);
  }

  res.status(200).json({
    success: true,
    data: { questionId, status },
  });
});

progressRouter.post('/progress/revision', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { questionId, days = 3 } = req.body;
  if (!questionId) {
    return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'questionId required' } });
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Number(days));

  demoRevisions.set(questionId, {
    dueDate: dueDate.toISOString(),
    intervalDays: Number(days),
  });

  res.status(200).json({
    success: true,
    data: { questionId, dueDate: dueDate.toISOString(), intervalDays: Number(days) },
  });
});
