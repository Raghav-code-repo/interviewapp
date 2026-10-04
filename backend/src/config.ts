import dotenv from 'dotenv';
import path from 'path';

// This module MUST be imported before any other module that reads process.env at
// import time. In CommonJS, all `import` statements are hoisted and evaluated
// before the importing module's own body runs, so calling dotenv.config() inside
// index.ts meant that every route/middleware module had already captured
// `process.env.JWT_SECRET` (falling back to the hardcoded dev secret) by the time
// the .env file was actually read. Centralising the load here fixes that, since
// consumers read lazily through `config` instead of caching at import time.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const PLACEHOLDER_PATTERN = /\[YOUR[^\]]*\]/;

/**
 * Returns the trimmed env value, or `fallback` when unset/blank.
 */
function readEnv(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.trim() ? value.trim() : fallback;
}

/**
 * Builds an OAuth provider's credentials from env.
 *
 * The `.env.example` ships with blank values rather than `[YOUR_...]` tokens, so
 * PLACEHOLDER_PATTERN is also applied here: a copied-but-unedited example must
 * read as "not configured" rather than as a real client ID.
 */
function readProvider(idKey: string, secretKey: string, extra: { callbackUrl: string }) {
  const clientId = readEnv(idKey, '');
  const clientSecret = readEnv(secretKey, '');
  const usable =
    clientId.length > 0 && clientSecret.length > 0 &&
    !PLACEHOLDER_PATTERN.test(clientId) && !PLACEHOLDER_PATTERN.test(clientSecret);

  return {
    clientId,
    clientSecret,
    callbackUrl: extra.callbackUrl,
    isConfigured: usable,
  };
}

const nodeEnv = readEnv('NODE_ENV', 'development');
const isProduction = nodeEnv === 'production';

const rawDatabaseUrl = readEnv('DATABASE_URL', '');

// The shipped .env.example still contains literal placeholders. Treating those as
// "configured" would make Prisma throw an opaque connection error at runtime, so
// they are normalised to "not configured" and the app falls back to demo storage.
const isDatabaseUrlUsable =
  rawDatabaseUrl.length > 0 && !PLACEHOLDER_PATTERN.test(rawDatabaseUrl);

const jwtSecret = readEnv('JWT_SECRET', '');

// A hardcoded fallback secret is a real vulnerability: it ships in source control,
// so anyone can mint a valid admin token. In production we refuse to boot without
// a real secret. In development we still fall back so the demo runs out of the box,
// but the choice is explicit and surfaced by /api/health.
const usingInsecureDefaultSecret = !jwtSecret;
if (usingInsecureDefaultSecret && isProduction) {
  throw new Error(
    'JWT_SECRET must be set to a strong, unique value when NODE_ENV=production. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
  );
}

export const config = {
  nodeEnv,
  isProduction,
  isTest: nodeEnv === 'test',
  port: Number.parseInt(readEnv('PORT', '5000'), 10),
  corsOrigin: readEnv('CORS_ORIGIN', '*'),

  jwtSecret: jwtSecret || 'devpath-super-secret-jwt-key-2026',
  usingInsecureDefaultSecret,

  jwtExpiresIn: readEnv('JWT_EXPIRES_IN', '7d'),

  databaseUrl: rawDatabaseUrl,
  directUrl: readEnv('DIRECT_URL', rawDatabaseUrl),
  isDatabaseConfigured: isDatabaseUrlUsable,

  // Bound how long we wait on a DB probe before degrading to in-memory storage.
  databaseProbeTimeoutMs: Number.parseInt(readEnv('DATABASE_PROBE_TIMEOUT_MS', '4000'), 10),

  /**
   * Where the SPA lives. Used to build the redirect back to the frontend after an
   * OAuth callback. Kept separate from `corsOrigin` because the two legitimately
   * differ in some setups (e.g. an API on a subdomain), and because an OAuth
   * redirect target must never be derived from a client-supplied value.
   */
  frontendUrl: readEnv('FRONTEND_URL', 'http://localhost:5173'),

  /**
   * OAuth client credentials. These are read only here and only ever used by
   * `services/oauth.ts`; nothing in the React bundle can see them because this
   * module is backend-only. A provider is treated as configured only when both
   * halves of its credential are present, so a half-filled .env cannot produce
   * a confusing runtime failure mid-redirect.
   */
  google: readProvider('GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', {
    callbackUrl: readEnv('GOOGLE_CALLBACK_URL', 'http://localhost:5000/api/auth/google/callback'),
  }),
  facebook: readProvider('FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', {
    callbackUrl: readEnv('FACEBOOK_CALLBACK_URL', 'http://localhost:5000/api/auth/facebook/callback'),
  }),

  /** Lifetime of the one-time code handed to the SPA after a callback. */
  socialCodeTtlMs: Number.parseInt(readEnv('SOCIAL_CODE_TTL_MS', '60000'), 10),
} as const;

export type AppConfig = typeof config;
