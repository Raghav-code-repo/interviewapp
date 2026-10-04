import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Server } from 'http';
import bcrypt from 'bcryptjs';

process.env.NODE_ENV = 'test';
// Explicitly blank so these tests exercise the in-memory store and never attempt
// a real network connection to a database.
process.env.DATABASE_URL = '';
process.env.JWT_SECRET = 'test-secret-for-auth-suite';

import app from '../app';
import { resetMemoryStore } from '../services/userStore';

let server: Server;
let baseUrl: string;

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: { path: string; message: string }[] };
}

interface TestProfile {
  experienceBand: string;
  experienceYears: number;
  languagePreference: string;
  customRoleName: string | null;
  goal: string;
  dailyGoalQuestions: number;
  customDifficulty: string | null;
}

interface TestUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/** Payload of a successful register/login. */
type SessionData = { token: string; user: TestUser; profile: TestProfile };
/** Payload of GET /auth/me. */
type MeData = { user: TestUser; profile: TestProfile };
/** Payload of PATCH /auth/me/profile. */
type ProfileData = { profile: TestProfile };

async function call<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {}
): Promise<{ status: number; json: Envelope<T> }> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });

  const text = await response.text();
  return {
    status: response.status,
    json: text ? (JSON.parse(text) as Envelope<T>) : { success: true },
  };
}

const validRegistration = {
  email: 'ada.lovelace@devpath.io',
  password: 'analytical1',
  name: 'Ada Lovelace',
  experienceBand: '2-5',
  language: 'python',
  targetRole: 'Backend Engineer',
  goal: 'switch',
};

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('Failed to bind test server to an ephemeral port');
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

beforeEach(() => {
  resetMemoryStore();
});

describe('POST /api/auth/register', () => {
  it('creates an account and returns a signed token', async () => {
    const res = await call<SessionData>('/api/auth/register', { method: 'POST', body: validRegistration });

    expect(res.status).toBe(201);
    expect(res.json.success).toBe(true);
    expect(res.json.data?.user.email).toBe('ada.lovelace@devpath.io');
    expect(res.json.data?.user.role).toBe('candidate');
    expect(typeof res.json.data?.token).toBe('string');
  });

  it('never returns the password hash to the client', async () => {
    const res = await call<SessionData>('/api/auth/register', { method: 'POST', body: validRegistration });
    const serialised = JSON.stringify(res.json);

    expect(serialised).not.toContain('passwordHash');
    // The bare word "password" is legitimate now: `providers` advertises which
    // login methods work ("password", "google"). What must never appear is hash
    // material, so assert on the bcrypt markers instead of the plain word.
    expect(serialised).not.toContain('$2a$');
    expect(serialised).not.toContain('$2b$');
    expect(serialised).not.toContain('$2y$');
    expect(serialised).not.toContain(validRegistration.password);
  });

  it('hashes the password with bcrypt instead of storing it verbatim', async () => {
    await call<SessionData>('/api/auth/register', { method: 'POST', body: validRegistration });

    // Reach into the store the route wrote to and confirm the hash verifies.
    const { findUserByEmail } = await import('../services/userStore');
    const stored = await findUserByEmail('ada.lovelace@devpath.io');

    expect(stored).not.toBeNull();
    // passwordHash is nullable now (social-only accounts have none), but a user
    // created through /register must always have a real bcrypt hash.
    expect(stored?.passwordHash).not.toBeNull();
    expect(stored?.passwordHash).not.toBe('analytical1');
    expect(stored?.passwordHash?.startsWith('$2')).toBe(true);
    await expect(bcrypt.compare('analytical1', stored!.passwordHash!)).resolves.toBe(true);
  });

  it('normalises the email to lowercase so duplicates are case-insensitive', async () => {
    await call<SessionData>('/api/auth/register', { method: 'POST', body: validRegistration });

    const res = await call<SessionData>('/api/auth/register', {
      method: 'POST',
      body: { ...validRegistration, email: 'ADA.LOVELACE@devPath.io' },
    });

    expect(res.status).toBe(409);
    expect(res.json.error?.code).toBe('USER_EXISTS');
  });

  it('rejects a duplicate registration with 409', async () => {
    await call<SessionData>('/api/auth/register', { method: 'POST', body: validRegistration });
    const res = await call<SessionData>('/api/auth/register', { method: 'POST', body: validRegistration });

    expect(res.status).toBe(409);
    expect(res.json.error?.code).toBe('USER_EXISTS');
  });

  it('rejects a password shorter than 6 characters', async () => {
    const res = await call<SessionData>('/api/auth/register', {
      method: 'POST',
      body: { ...validRegistration, password: '123' },
    });

    expect(res.status).toBe(400);
    expect(res.json.error?.code).toBe('VALIDATION_ERROR');
  });

  it('rejects an invalid email address', async () => {
    const res = await call<SessionData>('/api/auth/register', {
      method: 'POST',
      body: { ...validRegistration, email: 'not-an-email' },
    });

    expect(res.status).toBe(400);
  });

  it('rejects an unknown experience band', async () => {
    const res = await call<SessionData>('/api/auth/register', {
      method: 'POST',
      body: { ...validRegistration, experienceBand: '99-100' },
    });

    expect(res.status).toBe(400);
  });

  it('stores 0 experience years for the "0-2" band instead of the falsy-value fallback', async () => {
    const res = await call<SessionData>('/api/auth/register', {
      method: 'POST',
      body: { ...validRegistration, experienceBand: '0-2' },
    });

    expect(res.status).toBe(201);
    expect(res.json.data?.profile.experienceYears).toBe(0);
  });

  it('maps "20+" to 20 years', async () => {
    const res = await call<SessionData>('/api/auth/register', {
      method: 'POST',
      body: { ...validRegistration, experienceBand: '20+' },
    });

    expect(res.status).toBe(201);
    expect(res.json.data?.profile.experienceYears).toBe(20);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await call<SessionData>('/api/auth/register', { method: 'POST', body: validRegistration });
  });

  it('issues a token for correct credentials', async () => {
    const res = await call<SessionData>('/api/auth/login', {
      method: 'POST',
      body: { email: 'ada.lovelace@devpath.io', password: 'analytical1' },
    });

    expect(res.status).toBe(200);
    expect(typeof res.json.data?.token).toBe('string');
    expect(res.json.data?.user.email).toBe('ada.lovelace@devpath.io');
  });

  it('matches the email case-insensitively', async () => {
    const res = await call<SessionData>('/api/auth/login', {
      method: 'POST',
      body: { email: 'ADA.Lovelace@devpath.io', password: 'analytical1' },
    });

    expect(res.status).toBe(200);
  });

  it('rejects a wrong password with 401', async () => {
    const res = await call<SessionData>('/api/auth/login', {
      method: 'POST',
      body: { email: 'ada.lovelace@devpath.io', password: 'wrongpassword' },
    });

    expect(res.status).toBe(401);
    expect(res.json.error?.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns the same error for an unknown email so accounts cannot be enumerated', async () => {
    const unknown = await call<SessionData>('/api/auth/login', {
      method: 'POST',
      body: { email: 'nobody@devpath.io', password: 'whatever123' },
    });
    const wrongPassword = await call<SessionData>('/api/auth/login', {
      method: 'POST',
      body: { email: 'ada.lovelace@devpath.io', password: 'wrongpassword' },
    });

    expect(unknown.status).toBe(401);
    expect(unknown.json.error).toEqual(wrongPassword.json.error);
  });
});

describe('GET /api/auth/me', () => {
  let token: string;

  beforeEach(async () => {
    const res = await call<SessionData>('/api/auth/register', { method: 'POST', body: validRegistration });
    token = res.json.data!.token;
  });

  it('returns the current user for a valid token', async () => {
    const res = await call<MeData>('/api/auth/me', { token });

    expect(res.status).toBe(200);
    expect(res.json.data?.user.email).toBe('ada.lovelace@devpath.io');
  });

  it('rejects a request with no token', async () => {
    const res = await call<MeData>('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.json.error?.code).toBe('UNAUTHORIZED');
  });

  it('rejects a malformed token', async () => {
    const res = await call<MeData>('/api/auth/me', { token: 'not.a.jwt' });

    expect(res.status).toBe(401);
    expect(res.json.error?.code).toBe('INVALID_TOKEN');
  });

  it('rejects a token signed with a different secret', async () => {
    const jwt = await import('jsonwebtoken');
    const forged = jwt.default.sign(
      { id: 'someone-else', email: 'attacker@evil.com', name: 'Attacker', role: 'admin' },
      'a-different-secret'
    );

    const res = await call<MeData>('/api/auth/me', { token: forged });
    expect(res.status).toBe(401);
  });

  it('refuses a token whose account no longer exists', async () => {
    const jwt = await import('jsonwebtoken');
    // Sign with config.jwtSecret (not process.env) so the token verifies at the
    // middleware and the request reaches the /me account lookup.
    const { config } = await import('../config');
    const orphan = jwt.default.sign(
      { id: 'deleted-user-id', email: 'ghost@devpath.io', name: 'Ghost', role: 'candidate' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    const res = await call<MeData>('/api/auth/me', { token: orphan });
    expect(res.status).toBe(401);
    expect(res.json.error?.code).toBe('ACCOUNT_NOT_FOUND');
  });
});

describe('Authorization on admin routes', () => {
  it('rejects an anonymous request to the admin question endpoint', async () => {
    const res = await call('/api/admin/questions', {
      method: 'POST',
      body: {
        title: 'Should never be created',
        statement: 'This write must be rejected without admin credentials.',
        categoryId: 'python',
        difficulty: 'beginner',
      },
    });

    expect(res.status).toBe(401);
  });

  it('rejects a non-admin candidate with 403', async () => {
    const registered = await call<SessionData>('/api/auth/register', {
      method: 'POST',
      body: validRegistration,
    });

    const res = await call('/api/admin/export', { token: registered.json.data!.token });
    expect(res.status).toBe(403);
    expect(res.json.error?.code).toBe('FORBIDDEN');
  });

  it('leaves public content routes reachable without a token', async () => {
    const categories = await call('/api/taxonomy/categories');
    const questions = await call('/api/questions');

    expect(categories.status).toBe(200);
    expect(questions.status).toBe(200);
  });
});

describe('Routing fallbacks', () => {
  it('returns 404 for an unknown API route rather than 500', async () => {
    const res = await call('/api/definitely-not-a-route');

    expect(res.status).toBe(404);
    expect(res.json.error?.code).toBe('NOT_FOUND');
  });
});

describe('PATCH /api/auth/me/profile', () => {
  it('updates and persists the candidate profile', async () => {
    const registered = await call<SessionData>('/api/auth/register', {
      method: 'POST',
      body: validRegistration,
    });
    const token = registered.json.data!.token;

    const updated = await call<ProfileData>('/api/auth/me/profile', {
      method: 'PATCH',
      token,
      body: { experienceBand: '8-12', language: 'java', dailyGoalQuestions: 12 },
    });

    expect(updated.status).toBe(200);
    expect(updated.json.data?.profile.experienceBand).toBe('8-12');
    // Years should follow the band automatically.
    expect(updated.json.data?.profile.experienceYears).toBe(8);
    expect(updated.json.data?.profile.languagePreference).toBe('java');
    expect(updated.json.data?.profile.dailyGoalQuestions).toBe(12);

    const me = await call<MeData>('/api/auth/me', { token });
    expect(me.json.data?.profile.experienceBand).toBe('8-12');
  });

  it('requires authentication', async () => {
    const res = await call<ProfileData>('/api/auth/me/profile', {
      method: 'PATCH',
      body: { experienceBand: '5-8' },
    });

    expect(res.status).toBe(401);
  });
});
