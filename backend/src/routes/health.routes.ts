import { Router, Request, Response } from 'express';
import { config } from '../config';
import { getDatabaseError, getDatabaseStatus, isDatabaseReady } from '../services/prisma';

export const healthRouter = Router();

healthRouter.get('/health', async (_req: Request, res: Response) => {
  // Probe the database so the reported mode reflects real reachability rather
  // than merely whether DATABASE_URL was present in the environment.
  const databaseReachable = await isDatabaseReady();

  let persistence: 'database' | 'in_memory';
  if (!config.isDatabaseConfigured) {
    persistence = 'in_memory';
  } else if (databaseReachable) {
    persistence = 'database';
  } else {
    persistence = 'in_memory';
  }

  res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      service: 'DevPath Interview Academy API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: config.nodeEnv,
      features: {
        database: persistence,
        databaseConfigured: config.isDatabaseConfigured,
        databaseStatus: getDatabaseStatus(),
        ...(getDatabaseError() ? { databaseError: getDatabaseError() } : {}),
        auth: config.usingInsecureDefaultSecret
          ? 'jwt_default_secret'
          : 'jwt_ready',
        curriculumDomains: 8,
      },
    },
  });
});
