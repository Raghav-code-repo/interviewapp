import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import type { Server } from 'http';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = '';
process.env.JWT_SECRET = 'test-secret-for-social-redirect-suite';

// Captured before any stubbing so the request to our own test server still goes
// out for real while provider traffic is faked.
const realFetch = globalThis.fetch;

const holder = vi.hoisted(() => ({ client: null as any }));

vi.mock('../services/prisma', () => ({
  isDatabaseReady: async () => holder.client !== null,
  withDatabase: async (operation: (client: unknown) => unknown) => operation(holder.client),
  getDatabaseStatus: () => 'available',
  getDatabaseError: () => null,
  disconnectDatabase: async () => {},
}));

import app from '../app';
import { config } from '../config';
import { createState, resetOAuthStores } from '../services/oauth';
import { createFakePrismaClient } from './helpers/fakeDatabase';

const GOOGLE_CLIENT_ID = 'google-client-id.apps.googleusercontent.com';
const GOOGLE_SUBJECT = 'google-subject-redirect-1';
const GOOGLE_EMAIL = 'redirect.probe@gmail.com';

let server: Server;
let baseUrl: string;
let savedGoogleConfig: any;
let savedFrontendUrl: string;

interface SessionEnvelope {
  success: boolean;
  data?: {
    token?: string;
    user?: { id: string; email: string; name: string; role: string; providers: string[] };
    profile?: Record<string, unknown>;
  };
  error?: { code: string; message: string };
}

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const address = server.address();
  baseUrl = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

beforeEach(() => {
  resetOAuthStores();
  holder.client = createFakePrismaClient().client;

  savedGoogleConfig = { ...config.google };
  savedFrontendUrl = config.frontendUrl;

  (config as any).google = {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: 'google-client-secret',
    callbackUrl: 'http://localhost:5000/api/auth/google/callback',
    isConfigured: true,
  };

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      if (String(url).startsWith('http://127.0.0.1')) {
        return realFetch(String(url), init as RequestInit);
      }
      if (url === 'https://oauth2.googleapis.com/token') {
        return new Response(JSON.stringify({ access_token: 'at', id_token: 'it' }), {
          status: 200,
        });
      }
      if (url.startsWith('https://oauth2.googleapis.com/tokeninfo')) {
        return new Response(
          JSON.stringify({
            iss: 'https://accounts.google.com',
            aud: GOOGLE_CLIENT_ID,
            sub: GOOGLE_SUBJECT,
            email: GOOGLE_EMAIL,
            email_verified: 'true',
            name: 'Redirect Probe',
            exp: Math.floor(Date.now() / 1000) + 3600,
          }),
          { status: 200 }
        );
      }
      return new Response('Not found', { status: 404 });
    })
  );
});

afterEach(() => {
  (config as any).google = savedGoogleConfig;
  (config as any).frontendUrl = savedFrontendUrl;
  holder.client = null;
  vi.unstubAllGlobals();
});

/** Drives the real callback route and reports where the browser was sent. */
async function runCallback(returnTo: string | null, frontendUrl: string) {
  (config as any).frontendUrl = frontendUrl;

  const state = createState(returnTo);
  const response = await realFetch(
    `${baseUrl}/api/auth/google/callback?code=auth-code-abc&state=${state}`,
    { redirect: 'manual' }
  );

  const location = response.headers.get('location') ?? '';
  return { status: response.status, location, url: new URL(location) };
}

describe('OAuth redirect back into the SPA', () => {
  it('lands on the social callback route, not the protected dashboard', async () => {
    const { status, url } = await runCallback(
      '/login',
      'https://interviewapp-theta.vercel.app'
    );

    expect(status).toBe(302);
    // Regression guard: `/` is the protected Dashboard and would redirect to
    // /login with no session established.
    expect(url.pathname).toBe('/auth/social/callback');
    expect(url.searchParams.get('socialCode')).toBeTruthy();
    expect(url.searchParams.get('returnTo')).toBe('/login');
    expect(url.searchParams.get('socialNewUser')).toBe('1');
  });

  it('resolves the same route when FRONTEND_URL is a bare origin with a trailing slash', async () => {
    const { url } = await runCallback('/roadmap', 'http://localhost:5173/');

    expect(url.pathname).toBe('/auth/social/callback');
    expect(url.searchParams.get('returnTo')).toBe('/roadmap');
  });

  it('does not double up the path when FRONTEND_URL already carries it', async () => {
    const { url } = await runCallback(
      '/roadmap',
      'http://localhost:5173/auth/social/callback'
    );

    expect(url.pathname).toBe('/auth/social/callback');
    expect(url.searchParams.get('returnTo')).toBe('/roadmap');
  });

  it('sends provider refusals to the callback route so the SPA can show the error', async () => {
    (config as any).frontendUrl = 'https://interviewapp-theta.vercel.app';

    const response = await realFetch(
      `${baseUrl}/api/auth/google/callback?error=access_denied&error_description=User+declined`,
      { redirect: 'manual' }
    );

    const url = new URL(response.headers.get('location') ?? '');

    expect(url.pathname).toBe('/auth/social/callback');
    expect(url.searchParams.get('socialError')).toBe('User declined');
  });

  it('rejects an unrecognised state instead of issuing a session', async () => {
    (config as any).frontendUrl = 'https://interviewapp-theta.vercel.app';

    const response = await realFetch(
      `${baseUrl}/api/auth/google/callback?code=auth-code-abc&state=never-issued`,
      { redirect: 'manual' }
    );

    const url = new URL(response.headers.get('location') ?? '');

    expect(url.pathname).toBe('/auth/social/callback');
    expect(url.searchParams.get('socialError')).toBeTruthy();
    expect(url.searchParams.get('socialCode')).toBeNull();
  });
});

describe('the code the callback hands to the SPA', () => {
  it('exchanges for a complete session that /auth/me then accepts', async () => {
    const { url } = await runCallback('/login', 'http://localhost:5173');
    const socialCode = url.searchParams.get('socialCode') ?? '';

    const exchange = await realFetch(`${baseUrl}/api/auth/social/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: socialCode }),
    });
    const exchangeBody = (await exchange.json()) as SessionEnvelope;

    expect(exchange.status).toBe(200);
    expect(exchangeBody.success).toBe(true);
    expect(exchangeBody.data?.user?.email).toBe(GOOGLE_EMAIL);
    expect(exchangeBody.data?.profile).toBeTruthy();
    // Never assert on or log the token itself, only that one was issued.
    expect(Boolean(exchangeBody.data?.token)).toBe(true);

    const me = await realFetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${exchangeBody.data?.token}` },
    });
    const meBody = (await me.json()) as SessionEnvelope;

    expect(me.status).toBe(200);
    expect(meBody.data?.user?.id).toBe(exchangeBody.data?.user?.id);
  });

  it('is single-use', async () => {
    const { url } = await runCallback('/login', 'http://localhost:5173');
    const socialCode = url.searchParams.get('socialCode') ?? '';

    const body = JSON.stringify({ code: socialCode });
    const first = await realFetch(`${baseUrl}/api/auth/social/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const second = await realFetch(`${baseUrl}/api/auth/social/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    expect(first.status).toBe(200);
    expect(second.status).toBe(401);
    expect(((await second.json()) as SessionEnvelope).error?.code).toBe(
      'INVALID_SOCIAL_CODE'
    );
  });

  it('marks a returning user as not new so the SPA sends them to the dashboard', async () => {
    const first = await runCallback('/login', 'http://localhost:5173');
    // Consume the first handoff so the second callback is a returning sign-in.
    await realFetch(`${baseUrl}/api/auth/social/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: first.url.searchParams.get('socialCode') }),
    });

    const second = await runCallback('/login', 'http://localhost:5173');

    expect(second.url.searchParams.get('socialNewUser')).toBe('');
    expect(second.url.searchParams.get('socialCode')).toBeTruthy();
  });
});
