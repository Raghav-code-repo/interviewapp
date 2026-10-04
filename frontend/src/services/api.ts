import {
  AuthSession,
  CandidateProfile,
  Category,
  ExperienceBand,
  LanguagePreference,
  PreparationGoal,
  Question,
  ServerProfile,
} from '../types';
import { CATEGORIES, QUESTIONS } from '../data/seedData';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

const TOKEN_STORAGE_KEY = 'devpath_auth_token';

/**
 * Error carrying the API's machine code and human-readable message so the login
 * and register screens can show something specific ("email already registered")
 * instead of a generic failure.
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: { path: string; message: string }[];

  constructor(
    message: string,
    code: string,
    status: number,
    details?: { path: string; message: string }[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable (private mode / disabled cookies). The session
    // still works for the current page session, it just will not survive reload.
  }
}

/**
 * Performs a request against the API and unwraps the `{ success, data }` envelope.
 *
 * Unlike the previous implementation this does NOT swallow errors: a failed
 * login must surface its reason rather than silently behaving like success.
 */
export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const token = getStoredToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(
      'Unable to reach the DevPath API. Confirm the backend is running.',
      'NETWORK_ERROR',
      0
    );
  }

  let payload: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new ApiError(
        'The API returned an unexpected response.',
        'INVALID_RESPONSE',
        response.status
      );
    }
  }

  if (!response.ok) {
    const error = (payload as { error?: { code?: string; message?: string; details?: any } })
      ?.error;
    throw new ApiError(
      error?.message ?? `Request failed with status ${response.status}.`,
      error?.code ?? 'REQUEST_FAILED',
      response.status,
      error?.details
    );
  }

  return (payload as { data: T })?.data;
}

/* -------------------------------------------------------------------------- */
/* Authentication                                                              */
/* -------------------------------------------------------------------------- */

export const authApi = {
  register: (payload: {
    email: string;
    password: string;
    name: string;
    experienceBand: ExperienceBand;
    language: LanguagePreference;
    targetRole: string;
    goal: PreparationGoal;
  }) => apiRequest<AuthSession>('/auth/register', { method: 'POST', body: payload, auth: false }),

  login: (payload: { email: string; password: string }) =>
    apiRequest<AuthSession>('/auth/login', { method: 'POST', body: payload, auth: false }),

  me: () => apiRequest<{ user: AuthSession['user']; profile: ServerProfile }>('/auth/me'),

  /** Which social providers this deployment has credentials for. */
  socialProviders: () =>
    apiRequest<{ google: boolean; facebook: boolean }>('/auth/providers', { auth: false }),

  /**
   * Trades the one-time code from the OAuth redirect for a normal session.
   *
   * The code is single-use and short-lived, which is why it is safe for it to
   * have travelled in the redirect URL. The result is identical in shape to a
   * password login, so the rest of the app is unaffected by how the user signed in.
   */
  socialExchange: (code: string) =>
    apiRequest<AuthSession>('/auth/social/exchange', { method: 'POST', body: { code }, auth: false }),

  /** Full-page URL that starts the server-side OAuth handshake. */
  socialStartUrl: (provider: 'google' | 'facebook', returnTo?: string) => {
    const params = new URLSearchParams();
    if (returnTo) params.set('returnTo', returnTo);
    const query = params.toString();
    return `${API_BASE}/auth/${provider}${query ? `?${query}` : ''}`;
  },

  updateProfile: (payload: Partial<{
    experienceBand: ExperienceBand;
    language: LanguagePreference;
    targetRole: string;
    goal: PreparationGoal;
    dailyGoalQuestions: number;
  }>) => apiRequest<{ profile: ServerProfile }>('/auth/me/profile', { method: 'PATCH', body: payload }),
};

/* -------------------------------------------------------------------------- */
/* Content (read-only; falls back to bundled seed data when offline)           */
/* -------------------------------------------------------------------------- */

class ApiService {
  async checkHealth(): Promise<{ status: string; features: Record<string, unknown> }> {
    try {
      return await apiRequest<{ status: string; features: Record<string, unknown> }>('/health', {
        auth: false,
      });
    } catch {
      return { status: 'DEMO_STANDALONE', features: { mode: 'client_seed' } };
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      return await apiRequest<Category[]>('/taxonomy/categories', { auth: false });
    } catch {
      return CATEGORIES;
    }
  }

  async getQuestions(filters?: {
    category?: string;
    difficulty?: string;
    query?: string;
  }): Promise<Question[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      if (filters?.query) params.append('query', filters.query);
      const suffix = params.toString() ? `?${params.toString()}` : '';
      return await apiRequest<Question[]>(`/questions${suffix}`, { auth: false });
    } catch {
      return QUESTIONS;
    }
  }

  async getQuestionById(idOrSlug: string): Promise<Question | undefined> {
    try {
      return await apiRequest<Question>(`/questions/${encodeURIComponent(idOrSlug)}`, {
        auth: false,
      });
    } catch {
      return QUESTIONS.find((q) => q.id === idOrSlug || q.slug === idOrSlug);
    }
  }

  /**
   * Pushes a local progress change to the API. Failures are intentionally
   * non-fatal: progress is authoritative in localStorage, so an offline sync
   * failure must not interrupt the user.
   */
  async syncBookmark(questionId: string): Promise<boolean | null> {
    try {
      const data = await apiRequest<{ questionId: string; bookmarked: boolean }>(
        '/progress/bookmark',
        { method: 'POST', body: { questionId } }
      );
      return data.bookmarked;
    } catch {
      return null;
    }
  }

  async syncStatus(questionId: string, status: string): Promise<void> {
    try {
      await apiRequest('/progress/status', { method: 'POST', body: { questionId, status } });
    } catch {
      // Best-effort sync; local state remains the source of truth.
    }
  }
}

export const api = new ApiService();

/** Maps a server-side profile onto the client-side shape used by the UI. */
export function serverProfileToCandidateProfile(
  profile: ServerProfile,
  existing: CandidateProfile
): CandidateProfile {
  return {
    ...existing,
    name: existing.name,
    experienceBand: profile.experienceBand,
    experienceYears: profile.experienceYears,
    language: profile.languagePreference,
    targetRole: profile.customRoleName ?? existing.targetRole,
    goal: profile.goal,
    customDifficulty: profile.customDifficulty ?? existing.customDifficulty,
    dailyGoalQuestions: profile.dailyGoalQuestions,
  };
}
