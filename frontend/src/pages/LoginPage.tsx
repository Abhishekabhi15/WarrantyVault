import { Link } from 'react-router-dom';
import { PageIntro } from '@/components/ui/PageIntro';

export function LoginPage() {
  return (
    <div className="stack-page space-y-6">
      <PageIntro
        eyebrow="Access"
        title="Welcome back"
        description="Sign in to review coverage, expiring warranties, and your latest product records."
      />

      <form className="placeholder-form">
        <label>
          Email
          <input type="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" placeholder="Enter your password" />
        </label>
        <div className="flex items-center justify-between text-sm text-surface-500">
          <span>Mock authentication only</span>
          <Link className="font-medium text-primary-700" to="/register">
            Need an account?
          </Link>
        </div>
        <button type="button" className="button">
          Login
        </button>
      </form>

      <p className="helper-copy">
        New here? <Link className="font-medium text-primary-700" to="/register">Create an account</Link>
      </p>
    </div>
  );
}
