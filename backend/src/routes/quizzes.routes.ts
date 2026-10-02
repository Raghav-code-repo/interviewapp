import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { optionalAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

export const quizzesRouter = Router();

const SubmitQuizSchema = z.object({
  topicId: z.string().optional(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      userAnswerIndex: z.number(),
    })
  ),
  timeSpentSeconds: z.number().default(0),
});

quizzesRouter.post('/quizzes/submit', optionalAuth, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { answers, timeSpentSeconds } = SubmitQuizSchema.parse(req.body);

    const totalQuestions = answers.length;
    // Calculate demo score
    const score = answers.length > 0 ? Math.ceil(answers.length * 0.8) : 0;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        attemptId: `attempt-${Date.now()}`,
        score,
        totalQuestions,
        percentage,
        timeSpentSeconds,
        feedback: percentage >= 70 ? 'Excellent proficiency in targeted topics!' : 'Review incorrect concepts in your revision queue.',
        completedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});
