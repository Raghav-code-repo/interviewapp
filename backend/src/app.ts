// `../config` must be the first import so dotenv populates process.env before any
// other module reads configuration from it during module initialisation.
import { config } from './config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.routes';
import { authRouter } from './routes/auth.routes';
import { taxonomyRouter } from './routes/taxonomy.routes';
import { questionsRouter } from './routes/questions.routes';
import { quizzesRouter } from './routes/quizzes.routes';
import { mockInterviewsRouter } from './routes/mockInterviews.routes';
import { progressRouter } from './routes/progress.routes';
import { adminRouter } from './routes/admin.routes';
import { errorHandler } from './middleware/errorHandler';

/**
 * The configured Express application, with no listener attached.
 *
 * Kept separate from index.ts so tests can import the app and bind an ephemeral
 * port without triggering the module-level `listen()` side effect.
 */
export const app = express();

app.disable('x-powered-by');

// Security & Cross-Origin Configuration
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '5mb' }));

// Request logger middleware
if (!config.isTest) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });
}

// Mount Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/taxonomy', taxonomyRouter);
app.use('/api', questionsRouter);
app.use('/api', quizzesRouter);
app.use('/api', mockInterviewsRouter);
app.use('/api', progressRouter);
app.use('/api', adminRouter);

// Unknown API route handler. Without this, unmatched paths fell through to the
// error handler and were reported as 500 INTERNAL_SERVER_ERROR.
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `No API route matches ${req.method} ${req.originalUrl}`,
    },
  });
});

// Centralized error handler (must stay last)
app.use(errorHandler);

export default app;
