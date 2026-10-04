import { Router, Request, Response, NextFunction } from 'express';
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
  linkSocialIdentity,
  SocialLinkUnavailableError,
  SocialAccountLinkRequiredError,
  UserRecord,
} from '../services/userStore';
import {
  OAuthError,
  buildAuthorizationUrl,
  completeAuthorization,
  consumeState,
  createState,
  grantSocialSession,
  isSocialProvider,
  redeemSocialSession,
  type SocialProvider,
} from '../services/oauth';
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

const SocialCodeSchema = z.object({
  code: z.string().min(10).max(200),
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
  // A social-only account has no hash, so it can never satisfy a password check.
  return user !== null && user.passwordHash !== null && matches;
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

/* -------------------------------------------------------------------------- */
/* Social sign-in (Google / Facebook)                                         */
/* -------------------------------------------------------------------------- */

/**
 * Which providers this deployment can actually serve.
 *
 * The SPA reads this to hide buttons that would fail, rather than letting a user
 * click "Continue with Google" on a server with no Google credentials.
 */
authRouter.get('/providers', (_req, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      google: config.google.isConfigured,
      facebook: config.facebook.isConfigured,
    },
  });
});

/** Starts the server-side OAuth handshake for a provider. */
function socialStart(provider: SocialProvider) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const state = createState(typeof req.query.returnTo === 'string' ? req.query.returnTo : null);
      res.redirect(302, buildAuthorizationUrl(provider, state));
    } catch (err) {
      next(err);
    }
  };
}

authRouter.get('/google', socialStart('google'));
authRouter.get('/facebook', socialStart('facebook'));

/**
 * The SPA route that completes a social sign-in.
 *
 * It is the only place the one-time code is exchanged for a JWT, so a callback
 * that lands anywhere else leaves the browser with no session at all.
 */
const SOCIAL_CALLBACK_PATH = '/auth/social/callback';

/**
 * Where the SPA picks up after the provider redirect.
 *
 * This MUST resolve to {@link SOCIAL_CALLBACK_PATH}. Redirecting to the bare
 * frontend origin instead drops the browser on `/` — the protected dashboard —
 * which has no session yet and immediately bounces to /login, so the sign-in
 * appears to succeed but never completes.
 *
 * `FRONTEND_URL` is a server-side value, so the target cannot be steered by a
 * client; only a relative `returnTo` travels through the browser, and the client
 * validates that before honouring it. Both forms of `FRONTEND_URL` (bare origin,
 * or origin with the callback path already appended) resolve to the same route.
 */
function socialRedirect(res: Response, params: Record<string, string>): void {
  const target = new URL(config.frontendUrl);
  if (target.pathname === '' || target.pathname === '/') {
    target.pathname = SOCIAL_CALLBACK_PATH;
  }
  for (const [key, value] of Object.entries(params)) {
    target.searchParams.set(key, value);
  }
  res.redirect(302, target.toString());
}

function socialCallback(provider: SocialProvider) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // The provider reports user-facing refusals here (e.g. "decline"), which is
      // not an error condition on our side.
      if (typeof req.query.error === 'string') {
        const description =
          typeof req.query.error_description === 'string'
            ? req.query.error_description
            : req.query.error;
        return socialRedirect(res, { socialError: description });
      }

      const code = typeof req.query.code === 'string' ? req.query.code : '';
      const state = typeof req.query.state === 'string' ? req.query.state : '';

      // Fail closed: an unrecognised state could be a forged callback.
      const stateResult = consumeState(state);
      if (!stateResult.valid) {
        return socialRedirect(res, {
          socialError: 'Your sign-in session expired or was invalid. Please try again.',
        });
      }

      const identity = await completeAuthorization(provider, code);
      const { user, outcome } = await linkSocialIdentity({
        provider: identity.provider,
        providerAccountId: identity.providerAccountId,
        email: identity.email,
        name: identity.name,
        profileImage: identity.profileImage,
      });

      // Reuse the application's existing JWT — no second token architecture.
      const token = issueToken(user);
      const handoff = grantSocialSession(token);

      console.log(
        `[auth] ${provider} sign-in: user=${user.id} outcome=${outcome} providers=${user.providers.join(',')}`
      );

      return socialRedirect(res, {
        socialCode: handoff,
        returnTo: stateResult.returnTo ?? '',
        socialNewUser: outcome === 'created' ? '1' : '',
      });
    } catch (err) {
      if (err instanceof OAuthError) {
        console.warn(`[auth] ${provider} sign-in failed: ${err.code}`);
        return socialRedirect(res, { socialError: err.message });
      }
      if (err instanceof SocialAccountLinkRequiredError) {
        console.warn(`[auth] ${provider} sign-in requires account linking: ${err.message}`);
        return socialRedirect(res, { socialError: err.message });
      }
      if (err instanceof SocialLinkUnavailableError) {
        return socialRedirect(res, { socialError: err.message });
      }
      return next(err);
    }
  };
}

authRouter.get('/google/callback', socialCallback('google'));
authRouter.get('/facebook/callback', socialCallback('facebook'));

/**
 * Trades the one-time handoff code for a normal session.
 *
 * The code is single-use and expires in ~60s, so it is safe to have travelled
 * through the browser during the redirect. From here on the client behaves
 * exactly as it does after an email/password login.
 */
authRouter.post('/social/exchange', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = SocialCodeSchema.parse(req.body);
    const token = redeemSocialSession(code);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SOCIAL_CODE',
          message: 'This sign-in link has expired. Please try again.',
        },
      });
    }

    // Re-read the user rather than trusting the token payload, so a deleted or
    // changed account cannot be resurrected by a valid-looking code.
    const claims = jwt.verify(token, config.jwtSecret) as { id?: string };
    const user = claims.id ? await findUserById(claims.id) : null;

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
        token,
        user: toPublicUser(user),
        profile: user.profile,
      },
    });
  } catch (err) {
    next(err);
  }
});
