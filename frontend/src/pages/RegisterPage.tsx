import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageIntro } from '@/components/ui/PageIntro';
import { useAuth } from '@/context/AuthContext';
import { toReadableError } from '@/lib/format';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (formData.name.trim().length === 0) {
      setError('Please enter your name.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (submitError) {
      setError(toReadableError(submitError, 'Unable to create your account.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="stack-page space-y-6">
      <PageIntro
        eyebrow="Join"
        title="Create your workspace"
        description="Set up your account and start organizing products, receipts, and protection plans in minutes."
      />

      <form className="placeholder-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={(event) =>
              setFormData((current) => ({ ...current, name: event.target.value }))
            }
            required
            autoComplete="name"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(event) =>
              setFormData((current) => ({ ...current, email: event.target.value }))
            }
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={(event) =>
              setFormData((current) => ({ ...current, password: event.target.value }))
            }
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label>
          Confirm Password
          <input
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }))
            }
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        {error ? (
          <div className="rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
          </div>
        ) : null}
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="helper-copy">
        Already have an account? <Link className="font-medium text-primary-700" to="/login">Log in</Link>
      </p>
    </div>
  );
}
