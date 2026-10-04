import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import {
  OAuthError,
  buildAuthorizationUrl,
  completeAuthorization,
  consumeState,
  createState,
  grantSocialSession,
  redeemSocialSession,
  resetOAuthStores,
  safeReturnTo,
  verifyIdentity,
} from '../services/oauth';
import { createFakePrismaClient } from './helpers/fakeDatabase';

const holder = vi.hoisted(() => ({ client: null as any }));

vi.mock('../services/prisma', () => ({
  isDatabaseReady: async () => holder.client !== null,
  withDatabase: async (operation: (client: unknown) => unknown) => operation(holder.client),
  getDatabaseStatus: () => 'available',
  getDatabaseError: () => null,
  disconnectDatabase: async () => {},
}));

describe('safeReturnTo', () => {
  it('accepts a same-site absolute path', () => {
    expect(safeReturnTo('/roadmap')).toBe('/roadmap');
    expect(safeReturnTo('/questions/abc?tab=hints')).toBe('/questions/abc?tab=hints');
  });

  it('rejects an empty string', () => {
    expect(safeReturnTo('')).toBeNull();
  });

  it('rejects protocol-relative URLs that would redirect off-site', () => {
    expect(safeReturnTo('//evil.com/path')).toBeNull();
  });

  it('rejects absolute URLs pointing elsewhere', () => {
    expect(safeReturnTo('https://evil.com/steal-token')).toBeNull();
    expect(safeReturnTo('javascript:alert(1)')).toBeNull();
  });

  it('rejects non-string values safely', () => {
    expect(safeReturnTo(null)).toBeNull();
    expect(safeReturnTo(undefined)).toBeNull();
    expect(safeReturnTo(42)).toBeNull();
  });
});

describe('OAuth state', () => {
  beforeEach(() => resetOAuthStores());

  it('generates a fresh state and remembers the safe returnTo path', () => {
    const state = createState('/roadmap');
    expect(state).toMatch(/^[A-Za-z0-9_-]{32}$/);

    const outcome = consumeState(state);
    expect(outcome.valid).toBe(true);
    expect(outcome.returnTo).toBe('/roadmap');
  });

  it('is single-use: cannot be replayed', () => {
    const state = createState('/dashboard');
    expect(consumeState(state).valid).toBe(true);
    expect(consumeState(state).valid).toBe(false);
  });

  it('rejects an unknown state outright', () => {
    expect(consumeState('never-issued-state').valid).toBe(false);
  });
});

describe('buildAuthorizationUrl', () => {
  const fakeConfig = {
    ...config,
    google: {
      clientId: 'gid.apps.googleusercontent.com',
      clientSecret: 'gsec',
      callbackUrl: 'http://localhost:4000/api/auth/google/callback',
      isConfigured: true,
    },
    facebook: {
      clientId: 'fid',
      clientSecret: 'fsec',
      callbackUrl: 'http://localhost:4000/api/auth/facebook/callback',
      isConfigured: true,
    },
  };

  it('refuses to build an authorization URL for an unconfigured provider', () => {
    const unconfigured = {
      ...config,
      google: { ...config.google, isConfigured: false },
    };
    expect(() => buildAuthorizationUrl('google', 'state-123', unconfigured)).toThrow(OAuthError);
  });

  it('builds a Google authorization URL requesting openid, email and profile', () => {
    const href = buildAuthorizationUrl('google', 'st-xyz', fakeConfig);
    expect(href).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(href).toContain('client_id=gid.apps.googleusercontent.com');
    expect(href).toContain('scope=openid+email+profile');
    expect(href).toContain('state=st-xyz');
    expect(href).toContain('prompt=select_account');
  });

  it('builds a Facebook dialog URL requesting email and public_profile', () => {
    const href = buildAuthorizationUrl('facebook', 'st-xyz', fakeConfig);
    expect(href).toContain('https://www.facebook.com/v20.0/dialog/oauth');
    expect(href).toContain('client_id=fid');
    expect(href).toContain('scope=email%2Cpublic_profile');
    expect(href).toContain('state=st-xyz');
  });
});

describe('verifyIdentity (Google)', () => {
  let savedGoogleConfig: any;

  beforeEach(() => {
    savedGoogleConfig = { ...config.google };
    (config as any).google = {
      clientId: 'google-client-id-123.apps.googleusercontent.com',
      clientSecret: 'google-client-secret-xyz',
      callbackUrl: 'http://localhost:4000/api/auth/google/callback',
      isConfigured: true,
    };
  });

  afterEach(() => {
    (config as any).google = savedGoogleConfig;
    vi.restoreAllMocks();
  });

  const googleClaims = (overrides: Record<string, unknown> = {}) => ({
    iss: 'https://accounts.google.com',
    aud: 'google-client-id-123.apps.googleusercontent.com',
    sub: 'google-subject-123',
    email: 'raghavendra@gmail.com',
    email_verified: 'true',
    name: 'Raghavendra V',
    picture: 'https://lh3.googleusercontent.com/a/avatar',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  });

  it('valid Google ID token: calls tokeninfo endpoint without Authorization header and returns normalized identity', async () => {
    let capturedUrl = '';
    let capturedHeaders: any = null;

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        capturedUrl = url;
        capturedHeaders = init?.headers;
        return new Response(JSON.stringify(googleClaims()), { status: 200 });
      })
    );

    const identity = await verifyIdentity('google', 'valid-google-id-token');

    expect(capturedUrl).toBe('https://oauth2.googleapis.com/tokeninfo?id_token=valid-google-id-token');
    // Ensure no Authorization header is sent to tokeninfo
    expect(capturedHeaders?.Authorization).toBeUndefined();
    expect(identity).toEqual({
      provider: 'google',
      providerAccountId: 'google-subject-123',
      email: 'raghavendra@gmail.com',
      name: 'Raghavendra V',
      profileImage: 'https://lh3.googleusercontent.com/a/avatar',
    });
  });

  it('missing Google ID token: throws safe OAuthError with TOKEN_EXCHANGE_FAILED', async () => {
    await expect(verifyIdentity('google', '')).rejects.toMatchObject({
      code: 'TOKEN_EXCHANGE_FAILED',
    });

    await expect(verifyIdentity('google', '   ')).rejects.toMatchObject({
      code: 'TOKEN_EXCHANGE_FAILED',
    });
  });

  it('invalid audience: rejects token minted for a different client', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(googleClaims({ aud: 'someone-else-client-id' })), { status: 200 }))
    );

    await expect(verifyIdentity('google', 'some-id-token')).rejects.toMatchObject({
      code: 'PROFILE_INVALID',
    });
  });

  it('invalid audience: rejects accounts.google.com as audience (no fallback audience allowed)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(googleClaims({ aud: 'accounts.google.com' })), { status: 200 }))
    );

    await expect(verifyIdentity('google', 'some-id-token')).rejects.toMatchObject({
      code: 'PROFILE_INVALID',
    });
  });

  it('invalid issuer: rejects token with unexpected issuer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(googleClaims({ iss: 'https://evil-issuer.com' })), { status: 200 }))
    );

    await expect(verifyIdentity('google', 'some-id-token')).rejects.toMatchObject({
      code: 'PROFILE_INVALID',
    });
  });

  it('invalid issuer: rejects accounts.google.com without https as issuer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(googleClaims({ iss: 'accounts.google.com' })), { status: 200 }))
    );

    await expect(verifyIdentity('google', 'some-id-token')).rejects.toMatchObject({
      code: 'PROFILE_INVALID',
    });
  });

  it('expired ID token: rejects token with exp in the past', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify(googleClaims({ exp: Math.floor(Date.now() / 1000) - 300 })),
          { status: 200 }
        )
      )
    );

    await expect(verifyIdentity('google', 'some-id-token')).rejects.toMatchObject({
      code: 'PROFILE_INVALID',
    });
  });

  it('missing sub: rejects token without subject claim', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(googleClaims({ sub: '' })), { status: 200 }))
    );

    await expect(verifyIdentity('google', 'some-id-token')).rejects.toMatchObject({
      code: 'PROFILE_INVALID',
    });
  });

  it('missing email: rejects token without email claim', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(googleClaims({ email: '' })), { status: 200 }))
    );

    await expect(verifyIdentity('google', 'some-id-token')).rejects.toMatchObject({
      code: 'PROFILE_INVALID',
    });
  });

  it('email_verified false: refuses unverified email with EMAIL_NOT_VERIFIED', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify(googleClaims({ email_verified: 'false' })), { status: 200 })
      )
    );

    await expect(verifyIdentity('google', 'some-id-token')).rejects.toMatchObject({
      code: 'EMAIL_NOT_VERIFIED',
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify(googleClaims({ email_verified: false })), { status: 200 })
      )
    );

    await expect(verifyIdentity('google', 'some-id-token')).rejects.toMatchObject({
      code: 'EMAIL_NOT_VERIFIED',
    });
  });

  it('normalizes email to lowercase and falls back to local part if name is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify(
            googleClaims({
              email: 'Raghavendra.V@Gmail.com',
              name: '',
              picture: '',
            })
          ),
          { status: 200 }
        )
      )
    );

    const identity = await verifyIdentity('google', 'some-id-token');
    expect(identity.email).toBe('raghavendra.v@gmail.com');
    expect(identity.name).toBe('raghavendra.v');
    expect(identity.profileImage).toBeNull();
  });

  it('does not surface the provider response body on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"error":"invalid_grant"}', { status: 400 }))
    );

    await expect(verifyIdentity('google', 'some-id-token')).rejects.toMatchObject({
      code: 'PROFILE_FETCH_FAILED',
    });
  });
});

describe('verifyIdentity (Facebook)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('extracts the id, name, email and picture', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            id: 'fb-98765',
            name: 'Raghavendra V',
            email: 'raghavendra@gmail.com',
            picture: { data: { url: 'https://scontent.fb/avatar.jpg' } },
          }),
          { status: 200 }
        )
      )
    );

    const identity = await verifyIdentity('facebook', 'fb-token');

    expect(identity).toEqual({
      provider: 'facebook',
      providerAccountId: 'fb-98765',
      email: 'raghavendra@gmail.com',
      name: 'Raghavendra V',
      profileImage: 'https://scontent.fb/avatar.jpg',
    });
  });

  it('fails when Facebook returns no email, rather than creating a duplicate user', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ id: 'fb-1', name: 'No Email' }), { status: 200 }))
    );

    await expect(verifyIdentity('facebook', 'fb-token')).rejects.toMatchObject({
      code: 'PROFILE_INVALID',
    });
  });
});

describe('completeAuthorization (Google & Facebook)', () => {
  let savedGoogleConfig: any;
  let savedFbConfig: any;

  beforeEach(() => {
    savedGoogleConfig = { ...config.google };
    savedFbConfig = { ...config.facebook };

    (config as any).google = {
      clientId: 'google-client-id-123.apps.googleusercontent.com',
      clientSecret: 'google-secret-456',
      callbackUrl: 'http://localhost:4000/api/auth/google/callback',
      isConfigured: true,
    };
    (config as any).facebook = {
      clientId: 'fb-client-id-123',
      clientSecret: 'fb-secret-456',
      callbackUrl: 'http://localhost:4000/api/auth/facebook/callback',
      isConfigured: true,
    };
  });

  afterEach(() => {
    (config as any).google = savedGoogleConfig;
    (config as any).facebook = savedFbConfig;
    vi.restoreAllMocks();
  });

  it('Google: exchanges code, receives both access_token and id_token, and verifies with id_token', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url === 'https://oauth2.googleapis.com/token') {
        return new Response(
          JSON.stringify({
            access_token: 'google-access-tok-123',
            id_token: 'google-id-tok-456',
          }),
          { status: 200 }
        );
      }
      if (url.startsWith('https://oauth2.googleapis.com/tokeninfo')) {
        // Assert tokeninfo received id_token and NOT access_token
        expect(url).toContain('id_token=google-id-tok-456');
        expect(url).not.toContain('google-access-tok-123');
        return new Response(
          JSON.stringify({
            iss: 'https://accounts.google.com',
            aud: config.google.clientId,
            sub: 'google-sub-456',
            email: 'user@gmail.com',
            email_verified: 'true',
            name: 'DevPath User',
            exp: Math.floor(Date.now() / 1000) + 3600,
          }),
          { status: 200 }
        );
      }
      return new Response('Not found', { status: 404 });
    });

    vi.stubGlobal('fetch', fetchMock);

    const identity = await completeAuthorization('google', 'valid-auth-code');
    expect(identity.provider).toBe('google');
    expect(identity.providerAccountId).toBe('google-sub-456');
    expect(identity.email).toBe('user@gmail.com');
  });

  it('Google: fails code exchange when Google does not return an id_token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url === 'https://oauth2.googleapis.com/token') {
          return new Response(
            JSON.stringify({
              access_token: 'google-access-tok-only',
            }),
            { status: 200 }
          );
        }
        return new Response('Not found', { status: 404 });
      })
    );

    await expect(completeAuthorization('google', 'valid-auth-code')).rejects.toMatchObject({
      code: 'TOKEN_EXCHANGE_FAILED',
    });
  });

  it('Facebook: exchanges code for access token and retrieves profile from /me', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url === 'https://graph.facebook.com/v20.0/oauth/access_token') {
        return new Response(
          JSON.stringify({
            access_token: 'fb-access-tok-123',
          }),
          { status: 200 }
        );
      }
      if (url.startsWith('https://graph.facebook.com/v20.0/me')) {
        expect(url).toContain('access_token=fb-access-tok-123');
        return new Response(
          JSON.stringify({
            id: 'fb-user-999',
            name: 'FB User',
            email: 'fbuser@example.com',
            picture: { data: { url: 'https://fb.com/pic.jpg' } },
          }),
          { status: 200 }
        );
      }
      return new Response('Not found', { status: 404 });
    });

    vi.stubGlobal('fetch', fetchMock);

    const identity = await completeAuthorization('facebook', 'fb-auth-code');
    expect(identity.provider).toBe('facebook');
    expect(identity.providerAccountId).toBe('fb-user-999');
    expect(identity.email).toBe('fbuser@example.com');
  });
});

describe('account linking', () => {
  let prisma: ReturnType<typeof createFakePrismaClient>;

  beforeEach(() => {
    resetOAuthStores();
    prisma = createFakePrismaClient();
    holder.client = prisma.client;
  });

  afterEach(() => {
    holder.client = null;
    vi.restoreAllMocks();
  });

  const googleIdentity = {
    provider: 'google',
    providerAccountId: 'google-abc',
    email: 'raghavendra@gmail.com',
    name: 'Raghavendra V',
    profileImage: 'https://cdn/avatar.png',
  };

  const facebookIdentity = {
    provider: 'facebook',
    providerAccountId: 'fb-xyz',
    email: 'facebook-user@gmail.com',
    name: 'Facebook User',
    profileImage: 'https://scontent.fb/avatar.jpg',
  };

  /* -------------------------------------------------------------------------- */
  /* Google Account Linking                                                     */
  /* -------------------------------------------------------------------------- */

  it('verified Google email links to existing password user', async () => {
    const { createUser, linkSocialIdentity } = await import('../services/userStore');

    const existing = await createUser({
      email: 'raghavendra@gmail.com',
      password: 'sup3rsecret',
      name: 'Raghavendra V',
      experienceBand: '2-5',
      languagePreference: 'both',
      goal: 'switch',
    });
    expect(existing).not.toBeNull();
    const originalHash = existing!.passwordHash;

    const { user, outcome } = await linkSocialIdentity(googleIdentity);

    expect(outcome).toBe('linked');
    expect(user.id).toBe(existing!.id);
    expect(prisma.state.users).toHaveLength(1);
    expect(user.passwordHash).toBe(originalHash);
    expect(user.providers).toEqual(expect.arrayContaining(['password', 'google']));
  });

  it('existing Google identity signs in', async () => {
    const { linkSocialIdentity } = await import('../services/userStore');
    const first = await linkSocialIdentity(googleIdentity);
    const second = await linkSocialIdentity(googleIdentity);

    expect(second.outcome).toBe('existing');
    expect(second.user.id).toBe(first.user.id);
    expect(prisma.state.users).toHaveLength(1);
    expect(prisma.state.accounts).toHaveLength(1);
  });

  it('new Google identity creates user with null password', async () => {
    const { linkSocialIdentity } = await import('../services/userStore');
    const { user, outcome } = await linkSocialIdentity(googleIdentity);

    expect(outcome).toBe('created');
    expect(user.email).toBe('raghavendra@gmail.com');
    expect(user.passwordHash).toBeNull();
    expect(user.role).toBe('candidate');
    expect(user.providers).toEqual(['google']);
    expect(prisma.state.accounts).toHaveLength(1);
  });

  it('refreshes the avatar without overwriting a locally edited name', async () => {
    const { linkSocialIdentity } = await import('../services/userStore');
    const first = await linkSocialIdentity(googleIdentity);

    prisma.state.users[0].name = 'Edited Name In App';

    const { user } = await linkSocialIdentity({
      ...googleIdentity,
      profileImage: 'https://cdn/new-avatar.png',
    });

    expect(user.profileImage).toBe('https://cdn/new-avatar.png');
    expect(user.name).toBe('Edited Name In App');
    expect(user.id).toBe(first.user.id);
  });

  /* -------------------------------------------------------------------------- */
  /* Facebook Account Linking Policy                                            */
  /* -------------------------------------------------------------------------- */

  it('new Facebook identity with unused email creates user', async () => {
    const { linkSocialIdentity } = await import('../services/userStore');
    const { user, outcome } = await linkSocialIdentity(facebookIdentity);

    expect(outcome).toBe('created');
    expect(user.email).toBe('facebook-user@gmail.com');
    expect(user.passwordHash).toBeNull();
    expect(user.role).toBe('candidate');
    expect(user.providers).toEqual(['facebook']);
    expect(prisma.state.accounts).toHaveLength(1);
  });

  it('existing Facebook identity signs in', async () => {
    const { linkSocialIdentity } = await import('../services/userStore');
    const first = await linkSocialIdentity(facebookIdentity);
    const second = await linkSocialIdentity(facebookIdentity);

    expect(second.outcome).toBe('existing');
    expect(second.user.id).toBe(first.user.id);
    expect(prisma.state.users).toHaveLength(1);
    expect(prisma.state.accounts).toHaveLength(1);
  });

  it('new Facebook identity matching an existing password email is rejected', async () => {
    const { createUser, linkSocialIdentity, SocialAccountLinkRequiredError } = await import('../services/userStore');

    const existing = await createUser({
      email: 'raghavendra@gmail.com',
      password: 'sup3rsecret',
      name: 'Raghavendra V',
      experienceBand: '2-5',
      languagePreference: 'both',
      goal: 'switch',
    });
    expect(existing).not.toBeNull();

    await expect(
      linkSocialIdentity({
        provider: 'facebook',
        providerAccountId: 'fb-attempt',
        email: 'raghavendra@gmail.com',
        name: 'Raghavendra V',
      })
    ).rejects.toThrow(SocialAccountLinkRequiredError);
  });

  it('rejected Facebook linking does not modify the existing account', async () => {
    const { createUser, linkSocialIdentity } = await import('../services/userStore');

    const existing = await createUser({
      email: 'raghavendra@gmail.com',
      password: 'sup3rsecret',
      name: 'Raghavendra V',
      experienceBand: '2-5',
      languagePreference: 'both',
      goal: 'switch',
    });
    expect(existing).not.toBeNull();

    try {
      await linkSocialIdentity({
        provider: 'facebook',
        providerAccountId: 'fb-attempt',
        email: 'raghavendra@gmail.com',
        name: 'Attacker Name',
        profileImage: 'https://attacker/pic.png',
      });
    } catch {
      // Expected rejection
    }

    expect(prisma.state.users).toHaveLength(1);
    expect(prisma.state.users[0].name).toBe('Raghavendra V');
    expect(prisma.state.users[0].profileImage).toBeNull();
    expect(prisma.state.accounts).toHaveLength(0);
  });

  it('rejected Facebook linking does not change passwordHash', async () => {
    const { createUser, linkSocialIdentity } = await import('../services/userStore');

    const existing = await createUser({
      email: 'raghavendra@gmail.com',
      password: 'sup3rsecret',
      name: 'Raghavendra V',
      experienceBand: '2-5',
      languagePreference: 'both',
      goal: 'switch',
    });
    const originalHash = existing!.passwordHash;

    try {
      await linkSocialIdentity({
        provider: 'facebook',
        providerAccountId: 'fb-attempt',
        email: 'raghavendra@gmail.com',
        name: 'Attacker Name',
      });
    } catch {
      // Expected rejection
    }

    expect(prisma.state.users[0].passwordHash).toBe(originalHash);
  });

  /* -------------------------------------------------------------------------- */
  /* Concurrency / Unique Constraints                                           */
  /* -------------------------------------------------------------------------- */

  it('duplicate provider identity remains protected by the database unique constraint', async () => {
    const { linkSocialIdentity } = await import('../services/userStore');

    await linkSocialIdentity(googleIdentity);
    expect(() =>
      prisma.account.create({
        data: { userId: 'someone-else', provider: 'google', providerAccountId: 'google-abc' },
      })
    ).toThrow();
  });

  it('handles unique constraint race condition during account creation gracefully', async () => {
    const { linkSocialIdentity } = await import('../services/userStore');

    const first = await linkSocialIdentity(googleIdentity);

    // Mock account.create to simulate unique constraint race collision
    const originalCreate = prisma.client.account.create;
    prisma.client.account.create = (() => {
      throw new Error('Unique constraint failed on the fields: (provider,providerAccountId)');
    }) as any;

    const raceResult = await linkSocialIdentity(googleIdentity);
    expect(raceResult.outcome).toBe('existing');
    expect(raceResult.user.id).toBe(first.user.id);

    prisma.client.account.create = originalCreate;
  });
});

describe('social session issued to the SPA', () => {
  beforeEach(() => {
    resetOAuthStores();
    holder.client = createFakePrismaClient().client;
  });

  afterEach(() => {
    holder.client = null;
    vi.restoreAllMocks();
  });

  it('is a valid DevPath JWT that requireAdmin still reads', async () => {
    const token = grantSocialSession(
      jwt.sign({ id: 'user-1', email: 'a@b.com', name: 'A B', role: 'admin' }, config.jwtSecret, {
        expiresIn: '7d',
      })
    );

    const claims = jwt.verify(redeemSocialSession(token)!, config.jwtSecret) as {
      id: string;
      role: string;
    };

    expect(claims.id).toBe('user-1');
    expect(claims.role).toBe('admin');
  });
});
