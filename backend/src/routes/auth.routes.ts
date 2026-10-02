import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticatedRequest } from '../types';
import { requireAuth } from '../middleware/auth';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
  toPublicUser,
  UserRecord,
} from '../services/userStore';
import {
  DEFAULT_EXPERIENCE_BAND,
  EXPERIENCE_BANDS,
  isExperienceBand,
  resolveExperienceYears,
} from '../utils/experienceBand';

export const authRouter = Router();

const RegisterSchema = z
  .object({
    email: z.string().trim().email('Please provide a valid email address.'),
    // Minimum length matches the seeded demo password so accounts behave consistently.
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters.')
      .max(200, 'Password must be 200 characters or fewer.'),
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(120, 'Name must be 120 characters or fewer.'),
    experienceBand: z
      .string()
      .refine(isExperienceBand, { message: 'Unsupported experience band.' })
      .default(DEFAULT_EXPERIENCE_BAND),
    language: z.enum(['python', 'java', 'both']).default('both'),
    targetRole: z.string().trim().min(2).max(120).default('Backend Engineer'),
    goal: z
      .enum(['placement', 'switch', 'promotion', 'screening', 'senior', 'learning'])
      .default('switch'),
  })
  .refine((data) => data.password === data.password.trim(), {
    message: 'Password must not start or end with whitespace.',
    path: ['password'],
  });

const LoginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const UpdateProfileSchema = z.object({
  experienceBand: z.string().refine(isExperienceBand).optional(),
  language: z.enum(['python', 'java', 'both']).optional(),
  targetRole: z.string().trim().min(2).max(120).optional(),
  goal: z
    .enum(['placement', 'switch', 'promotion', 'screening', 'senior', 'learning'])
    .optional(),
  dailyGoalQuestions: z.number().int().min(1).max(100).optional(),
});

function issueToken(user: UserRecord): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    config.jwtSecret,
    // `expiresIn` is typed against the `ms` StringValue union, so a plain string
    // from env needs narrowing before it is accepted.
    { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

/**
 * Compares the supplied password against the stored hash.
 *
 * When the email is unknown we still run a bcrypt comparison against a dummy hash
 * so the response time does not reveal whether an account exists.
 */
const DUMMY_HASH = bcrypt.hashSync('devpath-timing-equalizer', 10);

async function verifyPassword(user: UserRecord | null, password: string): Promise<boolean> {
  const hash = user?.passwordHash ?? DUMMY_HASH;
  const matches = await bcrypt.compare(password, hash);
  return user !== null && matches;
}

authRouter.post('/register', async (req, res: Response, next: NextFunction) => {
  try {
    const data = RegisterSchema.parse(req.body);

    const existing = await findUserByEmail(data.email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'An account with this email already exists.',
        },
      });
    }

    const created = await createUser({
      email: data.email,
      password: data.password,
      name: data.name,
      experienceBand: data.experienceBand,
      languagePreference: data.language,
      customRoleName: data.targetRole,
      goal: data.goal,
    });

    // Lost a race with a concurrent registration for the same address.
    if (!created) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'An account with this email already exists.',
        },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        token: issueToken(created),
        user: toPublicUser(created),
        profile: created.profile,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res: Response, next: NextFunction) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await findUserByEmail(email);
    const isValidPassword = await verifyPassword(user, password);

    if (!user || !isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        token: issueToken(user),
        user: toPublicUser(user),
        profile: user.profile,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.get(
  '/me',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication token required.' },
        });
      }

      // Read through the store rather than echoing the JWT payload, so a stale
      // token cannot report a revoked or renamed account as current.
      const user = await findUserById(userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'The account for this session no longer exists.',
          },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user: toPublicUser(user),
          profile: user.profile,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

authRouter.patch(
  '/me/profile',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication token required.' },
        });
      }

      const data = UpdateProfileSchema.parse(req.body);

      const profile = await updateUserProfile(userId, {
        ...(data.experienceBand !== undefined ? { experienceBand: data.experienceBand } : {}),
        ...(data.language !== undefined ? { languagePreference: data.language } : {}),
        ...(data.targetRole !== undefined ? { customRoleName: data.targetRole } : {}),
        ...(data.goal !== undefined ? { goal: data.goal } : {}),
        ...(data.dailyGoalQuestions !== undefined
          ? { dailyGoalQuestions: data.dailyGoalQuestions }
          : {}),
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Candidate profile not found.' },
        });
      }

      res.status(200).json({ success: true, data: { profile } });
    } catch (err) {
      next(err);
    }
  }
);

/** Exposes the supported experience bands so the client cannot drift from the API. */
authRouter.get('/meta', (_req, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      experienceBands: EXPERIENCE_BANDS.map((band) => ({
        band,
        years: resolveExperienceYears(band),
      })),
    },
  });
});
