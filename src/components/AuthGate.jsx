import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, KeyRound, LoaderCircle, LockKeyhole, LogIn } from 'lucide-react';
import LogoLight from '../assets/Power by SIGMA - white letters.svg';
import { authConfig, completeNewPassword, getCurrentSession, signIn } from '../auth/cognito';

const initialForm = {
  username: '',
  password: '',
  newPassword: '',
  confirmPassword: '',
};

const getErrorMessage = (error) => {
  if (!error) return '';
  if (typeof error === 'string') return error;
  return error.message || 'Authentication failed.';
};

const PasswordRules = () => (
  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
    New password must be at least 8 characters and include uppercase, lowercase, and a number.
  </div>
);

export default function AuthGate({ children }) {
  const [mode, setMode] = useState('loading');
  const [form, setForm] = useState(initialForm);
  const [authUser, setAuthUser] = useState(null);
  const [challengeUser, setChallengeUser] = useState(null);
  const [challengeAttributes, setChallengeAttributes] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getCurrentSession()
      .then((result) => {
        if (cancelled) return;
        if (result?.profile) {
          setAuthUser(result.profile);
          setMode('authenticated');
          return;
        }
        setMode('sign-in');
      })
      .catch(() => {
        if (!cancelled) {
          setMode('sign-in');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'sign-in') {
        const result = await signIn(form.username, form.password);
        if (result.type === 'new-password-required') {
          setChallengeUser(result.user);
          setChallengeAttributes(result.userAttributes || {});
          setAuthUser(result.profile);
          setMode('new-password');
        } else {
          setAuthUser(result.profile);
          setMode('authenticated');
        }
      } else if (mode === 'new-password') {
        if (form.newPassword !== form.confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const result = await completeNewPassword(challengeUser, form.newPassword, challengeAttributes);
        setAuthUser(result.profile);
        setMode('authenticated');
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === 'authenticated' && authUser) {
    return children(authUser);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_30%),linear-gradient(135deg,_#0f172a,_#111827_50%,_#172554)] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 shadow-[0_30px_120px_rgba(15,23,42,0.55)] backdrop-blur">
        <div className="hidden w-[46%] flex-col justify-between border-r border-white/10 bg-white/5 p-10 lg:flex">
          <div className="space-y-10">
            <div className="space-y-5">
              <div>
                <h1 className="max-w-md text-4xl font-black tracking-tight text-white">GTM AI Innovation Hub</h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                  Sign in with your Sage email to review roadmap priorities, feed new requirements, and manage AI delivery work in one place.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              ['Roadmap visibility', 'Track approved POCs, engineering queue, and active delivery across the portfolio.'],
              ['Rory input channel', 'Add requests directly into the hub without touching source files or Terraform.'],
              ['Protected access', 'Only approved Cognito accounts can open the workspace once auth is enforced.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white">{title}</div>
                <p className="mt-1 text-sm text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 justify-center p-6 sm:p-10">
          <div className="flex min-h-full w-full max-w-md flex-col items-center justify-between gap-6">
            <div className="w-full rounded-[24px] border border-white/10 bg-white px-6 py-8 text-slate-900 shadow-2xl sm:px-8">
              {!authConfig.isConfigured ? (
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Cognito is not configured</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      The frontend is missing the Vite environment variables required for login. Rebuild Amplify after confirming the app has the Cognito environment variables.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6 space-y-2">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      {mode === 'new-password' ? <KeyRound size={22} /> : <LockKeyhole size={22} />}
                    </div>
                    <h2 className="text-2xl font-bold">
                      {mode === 'new-password' ? 'Set your new password' : 'Sign in'}
                    </h2>
                    <p className="text-sm leading-6 text-slate-600">
                      {mode === 'new-password'
                        ? 'This is your first login. Update the temporary password to activate your account.'
                        : 'Use your Sage email address and temporary password from Cognito.'}
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                  {mode === 'sign-in' && (
                    <>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">Email</span>
                        <input
                          autoComplete="username"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                          onChange={(event) => updateField('username', event.target.value)}
                          placeholder="steve.oates@sage.com"
                          value={form.username}
                        />
                      </label>

                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">Password</span>
                        <input
                          autoComplete="current-password"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                          onChange={(event) => updateField('password', event.target.value)}
                          placeholder="Enter your password"
                          type="password"
                          value={form.password}
                        />
                      </label>
                    </>
                  )}

                  {mode === 'new-password' && (
                    <>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        Signed in as <span className="font-semibold">{authUser?.email}</span>
                      </div>
                      <PasswordRules />
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">New password</span>
                        <input
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                          onChange={(event) => updateField('newPassword', event.target.value)}
                          placeholder="Create a new password"
                          type="password"
                          value={form.newPassword}
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-slate-700">Confirm password</span>
                        <input
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                          onChange={(event) => updateField('confirmPassword', event.target.value)}
                          placeholder="Confirm your new password"
                          type="password"
                          value={form.confirmPassword}
                        />
                      </label>
                    </>
                  )}

                    {error && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? <LoaderCircle className="animate-spin" size={16} /> : mode === 'new-password' ? <ArrowRight size={16} /> : <LogIn size={16} />}
                      {isSubmitting ? 'Working...' : mode === 'new-password' ? 'Save new password' : 'Sign in'}
                    </button>
                  </form>
                </>
              )}
            </div>

            <img src={LogoLight} alt="Power by SIGMA" className="mt-auto h-64 w-auto object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
