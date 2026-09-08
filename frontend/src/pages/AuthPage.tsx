import type { ReactElement } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  mode: 'login' | 'register';
}

export function AuthPage({ mode }: AuthPageProps): ReactElement {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'buyer' as 'admin' | 'buyer' | 'vendor',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string): void => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: form.role,
        });
      }

      navigate('/dashboard');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Authentication failed';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.24),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.18),transparent_28%)]" />
      <div className="relative w-full max-w-lg rounded-[30px] border border-slate-700/80 bg-slate-900/80 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.8)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-xl font-bold text-white shadow-lg shadow-blue-900/40">D</div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mt-2 text-sm text-slate-300">
            {mode === 'login' ? 'Access your marketplace workspace' : 'Start managing procurement and AI insights'}
          </p>
        </div>

        <div className="mb-5 flex items-center justify-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-100">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Secure workspace · enterprise-ready
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                First name
                <input
                  value={form.firstName}
                  onChange={(event) => handleChange('firstName', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-0 transition focus:border-blue-500"
                  placeholder="Alex"
                  required
                />
              </label>
              <label className="block text-sm text-slate-300">
                Last name
                <input
                  value={form.lastName}
                  onChange={(event) => handleChange('lastName', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-0 transition focus:border-blue-500"
                  placeholder="Morgan"
                  required
                />
              </label>
            </div>
          )}

          {mode === 'register' && (
            <label className="block text-sm text-slate-300">
              Role
              <select
                value={form.role}
                onChange={(event) => handleChange('role', event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-500"
              >
                <option value="buyer">Buyer</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          <label className="block text-sm text-slate-300">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-0 transition focus:border-blue-500"
              placeholder="you@company.com"
              required
            />
          </label>

          <label className="block text-sm text-slate-300">
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => handleChange('password', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-0 transition focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="gradient-btn w-full rounded-xl px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {mode === 'login' ? 'Need an account?' : 'Already have an account?'}{' '}
          <Link to={mode === 'login' ? '/register' : '/login'} className="font-medium text-blue-300 hover:text-blue-200">
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </Link>
        </p>
      </div>
    </main>
  );
}
