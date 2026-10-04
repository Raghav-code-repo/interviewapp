import crypto from 'crypto';
import { config, type AppConfig } from '../config';

/**
 * Server-side OAuth 2.0 / OpenID Connect handling for Google and Facebook.
 *
 * Client secrets live only here (and in config, which is backend-only). The
 * frontend never sees a client ID or secret: it is handed a one-time code by
 * `grantSocialSession` and exchanges it for the application's own JWT.
 */

export type SocialProvider = 'google' | 'facebook';

export const SOCIAL_PROVIDERS: SocialProvider[] = ['google', 'facebook'];

export interface SocialIdentity {
  provider: SocialProvider;
  providerAccountId: string;
  email: string;
  name: string;
  profileImage: string | null;
}

interface ProviderSettings {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  isConfigured: boolean;
}

export class OAuthError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code = 'OAUTH_ERROR', statusCode = 400) {
    super(message);
    this.name = 'OAuthError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function isSocialProvider(value: string): value is SocialProvider {
  return (SOCIAL_PROVIDERS as string[]).includes(value);
}

export function providerSettings(
  provider: SocialProvider,
  appConfig: AppConfig = config
): ProviderSettings {
  return provider === 'google' ? appConfig.google : appConfig.facebook;
}

/**
 * Rejects a provider whose credentials are not fully configured.
 *
 * Called before any redirect so the user gets "social sign-in is not
 * configured" on the API rather than being bounced to the provider and dropped
 * into a provider-side error page.
 */
export function assertProviderConfigured(
  provider: SocialProvider,
  appConfig: AppConfig = config
): ProviderSettings {
  const settings = providerSettings(provider, appConfig);
  if (!settings.isConfigured) {
    const label = provider === 'google' ? 'Google' : 'Facebook';
    throw new OAuthError(
      `${label} sign-in is not configured on this server.`,
      'PROVIDER_NOT_CONFIGURED',
      503
    );
  }
  return settings;
}

/* -------------------------------------------------------------------------- */
/* state                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * OAuth `state` values are stored server-side rather than being a signed cookie
 * so that nothing sensitive needs to travel through the browser twice.
 *
 * The store is per-process and in-memory: a callback that lands on a different
 * Render instance simply fails closed with an invalid-state error, which is the
 * correct outcome rather than silently accepting it.
 */
interface StateRecord {
  createdAt: number;
  /** Remembered so the SPA can return the user to the page they started from. */
  returnTo: string | null;
}

const STATE_TTL_MS = 10 * 60 * 1000;
const states = new Map<string, StateRecord>();

/** Oldest first, so the map cannot grow without bound on a long-lived process. */
function pruneStates(now: number): void {
  for (const [key, record] of states) {
    if (now - record.createdAt > STATE_TTL_MS) states.delete(key);
  }
}

export function createState(returnTo?: string | null): string {
  const state = crypto.randomBytes(24).toString('base64url');
  const now = Date.now();
  pruneStates(now);
  states.set(state, {
    createdAt: now,
    // Only a same-site absolute path is honoured; an attacker-supplied absolute
    // URL here would turn the callback into an open redirect.
    returnTo: safeReturnTo(returnTo),
  });
  return state;
}

/**
 * Consumes a state value. Returns null when unknown or expired, which the
 * caller must treat as a failed authentication rather than proceeding.
 */
export function consumeState(state: string): { valid: boolean; returnTo: string | null } {
  pruneStates(Date.now());
  const record = states.get(state);
  if (!record) return { valid: false, returnTo: null };
  states.delete(state);
  return { valid: true, returnTo: record.returnTo };
}

export function safeReturnTo(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

/* -------------------------------------------------------------------------- */
/* redirect + code exchange                                                   */
/* -------------------------------------------------------------------------- */

export function buildAuthorizationUrl(
  provider: SocialProvider,
  state: string,
  appConfig: AppConfig = config
): string {
  const settings = assertProviderConfigured(provider, appConfig);

  if (provider === 'google') {
    const params = new URLSearchParams({
      client_id: settings.clientId,
      redirect_uri: settings.callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      // Without these two Google returns an id_token only and no identity claims.
      access_type: 'offline',
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  const params = new URLSearchParams({
    client_id: settings.clientId,
    redirect_uri: settings.callbackUrl,
    response_type: 'code',
    // email is required to be able to link to an existing DevPath account.
    scope: 'email,public_profile',
    state,
  });
  return `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;
}

export interface TokenExchangeResult {
  accessToken: string;
  idToken?: string;
}

/**
 * Exchanges an authorization code for provider tokens.
 *
 * - For Google: requires and returns BOTH access_token and id_token.
 * - For Facebook: returns accessToken and no idToken.
 */
export async function exchangeCodeForToken(
  provider: SocialProvider,
  code: string,
  appConfig: AppConfig = config
): Promise<TokenExchangeResult> {
  const settings = assertProviderConfigured(provider, appConfig);

  const url = provider === 'google'
    ? 'https://oauth2.googleapis.com/token'
    : `https://graph.facebook.com/v20.0/oauth/access_token`;

  const body = new URLSearchParams({
    client_id: settings.clientId,
    client_secret: settings.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: settings.callbackUrl,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const text = await response.text();
  if (!response.ok) {
    // The provider's response body can echo the client secret back in some
    // error shapes, so log the status only and never forward the body.
    throw new OAuthError(
      'The identity provider rejected the sign-in attempt.',
      'TOKEN_EXCHANGE_FAILED',
      502
    );
  }

  let payload: { access_token?: string; id_token?: string };
  try {
    payload = JSON.parse(text) as { access_token?: string; id_token?: string };
  } catch {
    throw new OAuthError(
      'The identity provider returned an unexpected response.',
      'TOKEN_EXCHANGE_FAILED',
      502
    );
  }

  if (!payload.access_token) {
    throw new OAuthError(
      'The identity provider did not return an access token.',
      'TOKEN_EXCHANGE_FAILED',
      502
    );
  }

  if (provider === 'google') {
    if (!payload.id_token) {
      throw new OAuthError(
        'Google did not return an ID token.',
        'TOKEN_EXCHANGE_FAILED',
        502
      );
    }
    return {
      accessToken: payload.access_token,
      idToken: payload.id_token,
    };
  }

  return {
    accessToken: payload.access_token,
  };
}

export const exchangeCodeForTokens = exchangeCodeForToken;

/* -------------------------------------------------------------------------- */
/* identity verification                                                      */
/* -------------------------------------------------------------------------- */

async function fetchJson(url: string, accessToken: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new OAuthError(
      'Unable to read your profile from the identity provider.',
      'PROFILE_FETCH_FAILED',
      502
    );
  }

  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    throw new OAuthError(
      'The identity provider returned an unexpected profile.',
      'PROFILE_FETCH_FAILED',
      502
    );
  }
}

function firstString(...candidates: unknown[]): string | null {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) return candidate.trim();
  }
  return null;
}

/**
 * Reads and validates the provider's identity claims.
 *
 * Google:
 *   Validates the ID token via Google's tokeninfo endpoint.
 *   Does NOT send an Authorization Bearer header.
 *   Validates:
 *     - iss is exactly "https://accounts.google.com" (accounts.google.com is NOT accepted)
 *     - aud is exactly config.google.clientId (accounts.google.com is NOT accepted)
 *     - exp exists and is greater than current Unix timestamp
 *     - sub exists and is non-empty
 *     - email exists and is non-empty
 *     - email_verified is true
 *
 * Facebook:
 *   Validates the access token via Facebook Graph /me endpoint.
 */
export async function verifyIdentity(
  provider: SocialProvider,
  token: string
): Promise<SocialIdentity> {
  if (provider === 'google') {
    const idToken = token;
    if (!idToken || !idToken.trim()) {
      throw new OAuthError(
        'Google did not return an ID token.',
        'TOKEN_EXCHANGE_FAILED',
        502
      );
    }

    // Call Google's tokeninfo endpoint with id_token query parameter.
    // Do NOT send an Authorization Bearer header.
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken.trim())}`
    );

    if (!response.ok) {
      throw new OAuthError(
        'Unable to read your profile from the identity provider.',
        'PROFILE_FETCH_FAILED',
        502
      );
    }

    let info: Record<string, unknown>;
    try {
      info = (await response.json()) as Record<string, unknown>;
    } catch {
      throw new OAuthError(
        'The identity provider returned an unexpected profile.',
        'PROFILE_FETCH_FAILED',
        502
      );
    }

    // 1. Validate issuer: exactly "https://accounts.google.com"
    if (info.iss !== 'https://accounts.google.com') {
      throw new OAuthError(
        'Google token issuer is invalid.',
        'PROFILE_INVALID',
        401
      );
    }

    // 2. Validate audience: strictly config.google.clientId.
    // accounts.google.com is NOT accepted and no fallback is permitted.
    if (!config.google.clientId || info.aud !== config.google.clientId) {
      throw new OAuthError(
        'Google token audience does not match configured client ID.',
        'PROFILE_INVALID',
        401
      );
    }

    // 3. Validate expiration: exists and is greater than current Unix timestamp
    const expNum = typeof info.exp === 'number' ? info.exp : Number(info.exp);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!info.exp || isNaN(expNum) || expNum <= nowSeconds) {
      throw new OAuthError(
        'Google token has expired.',
        'PROFILE_INVALID',
        401
      );
    }

    // 4. Validate subject: exists and is non-empty
    const subject = firstString(info.sub);
    if (!subject) {
      throw new OAuthError(
        'Google did not return a valid subject claim.',
        'PROFILE_INVALID',
        502
      );
    }

    // 5. Validate email: exists and is non-empty
    const email = firstString(info.email);
    if (!email) {
      throw new OAuthError(
        'Google did not return an email address.',
        'PROFILE_INVALID',
        502
      );
    }

    // 6. Validate email_verified: must be true
    if (info.email_verified !== 'true' && info.email_verified !== true) {
      throw new OAuthError(
        'Your Google email address is not verified.',
        'EMAIL_NOT_VERIFIED',
        403
      );
    }

    return {
      provider: 'google',
      providerAccountId: subject,
      email: email.toLowerCase(),
      name: firstString(info.name) ?? email.toLowerCase().split('@')[0],
      profileImage: firstString(info.picture) ?? null,
    };
  }

  // Facebook provider
  const accessToken = token;
  if (!accessToken || !accessToken.trim()) {
    throw new OAuthError(
      'Facebook did not return an access token.',
      'TOKEN_EXCHANGE_FAILED',
      502
    );
  }

  const raw = await fetchJson(
    `https://graph.facebook.com/v20.0/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken.trim())}`,
    accessToken.trim()
  );

  const email = firstString(raw.email);
  const subject = firstString(raw.id);
  const picture = raw.picture as { data?: { url?: unknown } } | undefined;

  if (!email || !subject) {
    throw new OAuthError(
      'Facebook did not return an email address. Grant the email permission and try again.',
      'PROFILE_INVALID',
      502
    );
  }

  return {
    provider: 'facebook',
    providerAccountId: subject,
    email: email.toLowerCase(),
    name: firstString(raw.name) ?? email.toLowerCase().split('@')[0],
    profileImage: firstString(picture?.data?.url) ?? null,
  };
}

/**
 * Full server-side handshake:
 *
 * Google:
 *   authorization code -> token endpoint -> access_token + id_token -> verify Google ID token -> SocialIdentity
 *
 * Facebook:
 *   authorization code -> access_token -> Facebook /me -> SocialIdentity
 */
export async function completeAuthorization(
  provider: SocialProvider,
  code: string,
  appConfig: AppConfig = config
): Promise<SocialIdentity> {
  if (!code) {
    throw new OAuthError('The identity provider did not return an authorization code.');
  }

  const tokens = await exchangeCodeForToken(provider, code, appConfig);

  if (provider === 'google') {
    return verifyIdentity('google', tokens.idToken!);
  }

  return verifyIdentity('facebook', tokens.accessToken);
}

/* -------------------------------------------------------------------------- */
/* one-time handoff code                                                      */
/* -------------------------------------------------------------------------- */

interface SessionRecord {
  token: string;
  expiresAt: number;
}

const sessions = new Map<string, SessionRecord>();

function pruneSessions(now: number): void {
  for (const [key, record] of sessions) {
    if (record.expiresAt <= now) sessions.delete(key);
  }
}

/**
 * Issues a short-lived, single-use code that stands in for the JWT during the
 * redirect back to the SPA.
 *
 * A real token in the redirect URL would end up in browser history, server
 * access logs and the Referer header. This code lives ~60s, is destroyed on
 * first use, and cannot mint anything on its own.
 */
export function grantSocialSession(token: string, appConfig: AppConfig = config): string {
  const code = crypto.randomBytes(32).toString('base64url');
  const now = Date.now();
  pruneSessions(now);
  sessions.set(code, { token, expiresAt: now + appConfig.socialCodeTtlMs });
  return code;
}

/** Exchanges a handoff code for the JWT. Returns null when invalid or expired. */
export function redeemSocialSession(code: string, appConfig: AppConfig = config): string | null {
  const now = Date.now();
  pruneSessions(now);
  const record = sessions.get(code);
  if (!record || record.expiresAt <= now) return null;
  sessions.delete(code);
  return record.token;
}

/** Test helper: drops all pending handoffs and state values. */
export function resetOAuthStores(): void {
  sessions.clear();
  states.clear();
}
