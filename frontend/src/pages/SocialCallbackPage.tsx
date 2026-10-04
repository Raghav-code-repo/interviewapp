import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * Landing route for the OAuth redirect.
 *
 * The backend sends the browser here with a single-use code. Exchanging it here
 * — rather than putting a JWT in the URL — keeps the long-lived token out of
 * browser history, server logs and the Referer header.
 *
 * The code is consumed exactly once, so this must not re-run on a re-render or a
 * React StrictMode double-invoke; the ref below makes the exchange one-shot.
 */
export const SocialCallbackPage: React.FC = () => {
  const [params] = useSearchParams();
  const { completeSocialLogin } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    const socialError = params.get("socialError");

    if (socialError) {
      setError(socialError);
      return;
    }

    const code = params.get("socialCode");

    if (!code) {
      setError(
        "This sign-in link is missing its authorisation code. Please try again.",
      );
      return;
    }

    (async () => {
      try {
        const user = await completeSocialLogin(code);

        // A first-time social user has no DevPath-specific answers yet, so send
        // them to onboarding rather than dropping them on an empty dashboard.
        const isFirstTime = params.get("socialNewUser") === "1";

        const returnTo = params.get("returnTo");

        /*
         * Validate the return destination before navigating.
         *
         * When social login is started from /login, the frontend sends:
         *
         *     returnTo=/login
         *
         * Without this check, a successful Google/Facebook/GitHub login would
         * send an existing user straight back to the login page.
         *
         * Authentication pages and the OAuth callback itself are never valid
         * destinations after a successful login.
         */
        const isSafeReturnTo =
          !!returnTo &&
          returnTo.startsWith("/") &&
          returnTo !== "/login" &&
          returnTo !== "/register" &&
          returnTo !== "/auth/social/callback";

        const safeReturnTo = isSafeReturnTo ? returnTo : "/";

        /*
         * First-time users go through onboarding.
         * Existing users go to their original destination, unless that
         * destination was an authentication/OAuth page.
         */
        const destination = isFirstTime ? "/onboarding" : safeReturnTo;

        navigate(destination, { replace: true });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "We could not complete your sign-in. Please try again.",
        );
      }
    })();
  }, [completeSocialLogin, navigate, params]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-500/10 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm p-6 text-center">
          <div className="mx-auto w-11 h-11 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
            Sign-in unsuccessful
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {error}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 h-10 rounded-lg
                         bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium transition-colors"
            >
              Back to sign in
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center px-4 h-10 rounded-lg
                         border border-slate-300 dark:border-slate-600 text-sm font-medium
                         text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-500/10 px-4">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-xs font-medium">Completing your sign-in...</span>
      </div>
    </div>
  );
};

export default SocialCallbackPage;
