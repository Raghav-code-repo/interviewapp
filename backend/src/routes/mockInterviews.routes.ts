import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { optionalAuth } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import { BACKEND_QUESTIONS } from '../services/seedData';

export const mockInterviewsRouter = Router();

const StartSessionSchema = z.object({
  targetRole: z.string().default('Backend Engineer'),
  experienceBand: z.string().default('2-5'),
  durationMinutes: z.number().default(30),
});

const SubmitSessionSchema = z.object({
  responses: z.array(
    z.object({
      questionId: z.string(),
      candidateAnswer: z.string(),
      timeSpentSeconds: z.number().default(300),
    })
  ),
});

mockInterviewsRouter.post('/mock-interviews/start', optionalAuth, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = StartSessionSchema.parse(req.body);

    const questions = BACKEND_QUESTIONS.slice(0, 3);

    res.status(201).json({
      success: true,
      data: {
        sessionId: `session-${Date.now()}`,
        targetRole: data.targetRole,
        experienceBand: data.experienceBand,
        durationMinutes: data.durationMinutes,
        questions,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

mockInterviewsRouter.post('/mock-interviews/:id/submit', optionalAuth, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { responses } = SubmitSessionSchema.parse(req.body);

    const evaluated = responses.map((r) => {
      const isThorough = r.candidateAnswer.length > 100;
      return {
        questionId: r.questionId,
        score: isThorough ? 8.5 : 5.0,
        strengths: [
          'Direct conceptual answer aligned with question requirements.',
          'Demonstrated understanding of performance implications.',
        ],
        areasToImprove: [
          'Elaborate more on distributed failure modes and retry policies.',
        ],
        aiDisclaimer: 'Simulated evaluation feedback based on standard engineering rubrics.',
      };
    });

    const overallScore = Number(
      (evaluated.reduce((acc, curr) => acc + curr.score, 0) / evaluated.length).toFixed(1)
    );

    res.status(200).json({
      success: true,
      data: {
        sessionId: req.params.id,
        overallScore,
        summaryFeedback: `Candidate demonstrated solid reasoning across key topics. Suggested focus: deepen exploration of edge cases and cache invalidation.`,
        responses: evaluated,
        completedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});
