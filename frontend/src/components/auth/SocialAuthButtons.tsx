import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";

/**
 * Google and Facebook sign-in buttons.
 *
 * Both buttons are always rendered to preserve layout and provide clear feedback
 * on provider availability. When a provider is not configured on the backend,
 * its button remains visible but is disabled with explanatory text.
 */
export const SocialAuthButtons: React.FC<{
  /** 'login' or 'register' wording; the endpoints are identical. */
  mode: "login" | "register";
  /** Called when the server reports it cannot serve any social provider. */
  onUnavailable?: (reason: string) => void;
}> = ({ mode, onUnavailable }) => {
  const { beginSocialLogin } = useAuth();
  const [available, setAvailable] = useState<{
    google: boolean;
    facebook: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [busy, setBusy] = useState<"google" | "facebook" | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setHasError(false);
        const providers = await authApi.socialProviders();
        if (cancelled) return;
        setAvailable(providers);
      } catch {
        if (!cancelled) {
          setAvailable({ google: false, facebook: false });
          setHasError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (available && !available.google && !available.facebook) {
      onUnavailable?.(
        "Social sign-in is not configured on this server yet. Use email and password to continue.",
      );
    }
  }, [available, onUnavailable]);

  const isGoogleConfigured = Boolean(available?.google);
  const isFacebookConfigured = Boolean(available?.facebook);

  const isGoogleEnabled = !loading && !hasError && isGoogleConfigured;
  const isFacebookEnabled = !loading && !hasError && isFacebookConfigured;

  const start = (provider: "google" | "facebook") => {
    if (busy !== null) return;
    if (provider === "google" && !isGoogleEnabled) return;
    if (provider === "facebook" && !isFacebookEnabled) return;
    setBusy(provider);
    beginSocialLogin(provider);
  };

  const label = mode === "login" ? "Continue with" : "Sign up with";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          or
        </span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* Google */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => start("google")}
          disabled={!isGoogleEnabled || busy !== null}
          aria-busy={busy === "google"}
          className={`w-full inline-flex items-center justify-center gap-3 px-4 h-11 rounded-lg
                     bg-[#1877F2] text-white
																  
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2]/40
                     transition-colors ${
                       isFacebookEnabled && busy === null
                         ? "hover:bg-[#166FE5] cursor-pointer"
                         : "opacity-60 cursor-not-allowed"
                     }`}
        >
          {busy === "google" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <GoogleMark />
          )}
          <span>
            {busy === "google" ? "Connecting to Google..." : `${label} Google`}
          </span>
        </button>
        {!loading && !hasError && !isGoogleConfigured && (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Google sign-in is not configured yet.
          </p>
        )}
      </div>

      {/* Facebook */}
      {/* <div className="space-y-1">
        <button
          type="button"
          onClick={() => start("facebook")}
          disabled={!isFacebookEnabled || busy !== null}
          aria-busy={busy === "facebook"}
          className={`w-full inline-flex items-center justify-center gap-3 px-4 h-11 rounded-lg
                     bg-[#1877F2] text-white
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2]/40
                     transition-colors ${
                       isFacebookEnabled && busy === null
                         ? "hover:bg-[#166FE5] cursor-pointer"
                         : "opacity-60 cursor-not-allowed"
                     }`}
        >
          {busy === "facebook" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FacebookMark />
          )}
          <span>
            {busy === "facebook"
              ? "Connecting to Facebook..."
              : `${label} Facebook`}
          </span>
        </button>
        {!loading && !hasError && !isFacebookConfigured && (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Facebook sign-in is not configured yet.
          </p>
        )}
      </div> */}

      {/* Loading state indicator */}
      {loading && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
          Checking social sign-in availability...
        </p>
      )}

      {/* Error state indicator */}
      {hasError && (
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Social sign-in availability could not be checked.
        </p>
      )}
    </div>
  );
};

/** Inline SVG so no third-party brand-icon package is needed. */
const GoogleMark: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H1v2.34A9 9 0 0 0 9 18Z"
    />
    <path
      fill="#FBBC05"
      d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H1a9 9 0 0 0 0 8.12l2.97-2.34Z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A9 9 0 0 0 1 4.94l2.97 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
    />
  </svg>
);

const FacebookMark: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      fill="currentColor"
      d="M18 9a9 9 0 1 0-10.34 8.46v-5.98H5.29V9h2.37V7.19c0-2.35 1.4-3.65 3.54-3.65 1.03 0 2.1.18 2.1.18v2.31h-1.18c-1.17 0-1.53.73-1.53 1.47V9h2.6l-.42 2.48h-2.18v5.98A9 9 0 0 0 18 9Z"
    />
  </svg>
);

export default SocialAuthButtons;
