import { Link } from 'react-router-dom';
import { PageIntro } from '@/components/ui/PageIntro';

export function RegisterPage() {
  return (
    <div className="stack-page space-y-6">
      <PageIntro
        eyebrow="Join"
        title="Create your workspace"
        description="Set up your account and start organizing products, receipts, and protection plans in minutes."
      />

      <form className="placeholder-form">
        <label>
          Name
          <input type="text" placeholder="Jane Doe" />
        </label>
        <label>
          Email
          <input type="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" placeholder="Create a password" />
        </label>
        <label>
          Confirm Password
          <input type="password" placeholder="Confirm your password" />
        </label>
        <button type="button" className="button">
          Register
        </button>
      </form>

      <p className="helper-copy">
        Already have an account? <Link className="font-medium text-primary-700" to="/login">Log in</Link>
      </p>
    </div>
  );
}
