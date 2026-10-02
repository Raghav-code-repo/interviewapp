import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AuthSession,
  AuthUser,
  CandidateProfile,
  ExperienceBand,
  LanguagePreference,
  PreparationGoal,
  ServerProfile,
} from '../types';
import {
  ApiError,
  authApi,
  getStoredToken,
  serverProfileToCandidateProfile,
  storeToken,
} from '../services/api';
import { useProfile } from './ProfileContext';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    experienceBand: ExperienceBand;
    language: LanguagePreference;
    targetRole: string;
    goal: PreparationGoal;
  }) => Promise<void>;
  logout: () => void;
  /** Re-reads the session from the API. Used on boot and after profile edits. */
  refresh: () => Promise<void>;
  /**
   * Persists a profile change to the server. The caller is responsible for the
   * optimistic local update; this keeps the database in step without making the
   * UI wait on a network round-trip. Failures are swallowed so an offline user
   * does not lose their change locally.
   */
  syncProfile: (changes: {
    experienceBand?: ExperienceBand;
    language?: LanguagePreference;
    targetRole?: string;
    goal?: PreparationGoal;
    dailyGoalQuestions?: number;
  }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'devpath_auth_user';

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch {
    // Non-fatal: see storeToken().
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateProfile } = useProfile();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Guards against setting state after unmount (e.g. user navigates away mid-call).
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  });

  /** Pushes the server profile into the client profile store used across the UI. */
  const applyServerProfile = useCallback(
    (serverProfile: ServerProfile, name: string) => {
      updateProfile({
        ...serverProfileToCandidateProfile(serverProfile, profile),
        name,
      } as Partial<CandidateProfile>);
    },
    [profile, updateProfile]
  );

  const adoptSession = useCallback(
    (session: AuthSession) => {
      storeToken(session.token);
      writeStoredUser(session.user);
      if (!mounted.current) return;
      setToken(session.token);
      setUser(session.user);
      setStatus('authenticated');
      applyServerProfile(session.profile, session.user.name);
    },
    [applyServerProfile]
  );

  const clearSession = useCallback(() => {
    storeToken(null);
    writeStoredUser(null);
    if (!mounted.current) return;
    setToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  /**
   * On mount, restore the session from the stored token. The cached user is used
   * to avoid a blank frame, then verified against /auth/me so a revoked or
   * expired token cannot leave the UI in an authenticated state.
   */
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        if (!cancelled) setStatus('unauthenticated');
        return;
      }

      const cachedUser = readStoredUser();
      if (cachedUser && !cancelled) {
        setUser(cachedUser);
        setToken(storedToken);
      }

      try {
        const data = await authApi.me();
        if (cancelled) return;
        storeToken(getStoredToken());
        setToken(getStoredToken());
        setUser(data.user);
        writeStoredUser(data.user);
        setStatus('authenticated');
        applyServerProfile(data.profile, data.user.name);
      } catch (err) {
        if (cancelled) return;
        // An expired or invalid token must not strand the user in a
        // half-authenticated state.
        if (err instanceof ApiError && (err.status === 401 || err.status === 0)) {
          clearSession();
        } else {
          // Transient server problem: trust the cached identity rather than
          // forcing a logout on a network blip.
          if (cachedUser) {
            setStatus('authenticated');
          } else {
            setStatus('unauthenticated');
          }
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
    // Intentionally runs once on mount; `applyServerProfile` identity changes
    // must not re-trigger the session bootstrap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const session = await authApi.login(payload);
      adoptSession(session);
    },
    [adoptSession]
  );

  const register = useCallback(
    async (payload: {
      email: string;
      password: string;
      name: string;
      experienceBand: ExperienceBand;
      language: LanguagePreference;
      targetRole: string;
      goal: PreparationGoal;
    }) => {
      const session = await authApi.register(payload);
      adoptSession(session);
    },
    [adoptSession]
  );

  const refresh = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data.user);
      writeStoredUser(data.user);
      applyServerProfile(data.profile, data.user.name);
    } catch {
      // Leave the current session intact on a failed refresh.
    }
  }, [applyServerProfile]);

  const syncProfile = useCallback<AuthContextType['syncProfile']>(
    (changes) => {
      if (!getStoredToken()) return;
      authApi
        .updateProfile(changes)
        .then(({ profile }) => {
          if (!mounted.current) return;
          applyServerProfile(profile, user?.name ?? profile.experienceBand);
        })
        .catch(() => {
          // Best-effort: local state stays authoritative when offline.
        });
    },
    [applyServerProfile, user?.name]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      status,
      user,
      token,
      isAuthenticated: status === 'authenticated' && Boolean(user),
      login,
      register,
      logout: clearSession,
      refresh,
      syncProfile,
    }),
    [status, user, token, login, register, clearSession, refresh, syncProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
