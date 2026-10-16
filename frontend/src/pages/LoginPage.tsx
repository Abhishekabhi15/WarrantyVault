import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PageIntro } from '@/components/ui/PageIntro';
import { useAuth } from '@/context/AuthContext';
import { toReadableError } from '@/lib/format';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from || '/dashboard', { replace: true });
    } catch (submitError) {
      setError(toReadableError(submitError, 'Unable to sign you in.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="stack-page space-y-6">
      <PageIntro
        eyebrow="Access"
        title="Welcome back"
        description="Sign in to review coverage, expiring warranties, and your latest product records."
      />

      <form className="placeholder-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="current-password"
          />
        </label>
        {error ? (
          <div className="rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
          </div>
        ) : null}
        <div className="flex items-center justify-between text-sm text-surface-500">
          <span>Use your WarrantyVault account credentials.</span>
          <Link className="font-medium text-primary-700" to="/register">
            Need an account?
          </Link>
        </div>
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="helper-copy">
        New here? <Link className="font-medium text-primary-700" to="/register">Create an account</Link>
      </p>
    </div>
  );
}
