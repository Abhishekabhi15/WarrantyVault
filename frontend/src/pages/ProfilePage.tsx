import { useAuth } from '@/context/AuthContext';
import { PageIntro } from '@/components/ui/PageIntro';
import { formatDateTime } from '@/lib/format';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <section className="stack-page space-y-8">
      <PageIntro
        eyebrow="Account"
        title="Profile"
        description="Review the authenticated account details provided by the WarrantyVault backend."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <article className="detail-card">
          <span>Profile Summary</span>
          <strong>{user?.name || 'Unknown User'}</strong>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4">
              <p className="text-sm font-medium text-surface-500">Email</p>
              <p className="mt-2 font-semibold text-surface-900">{user?.email || '—'}</p>
            </div>
            <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4">
              <p className="text-sm font-medium text-surface-500">Account Created</p>
              <p className="mt-2 font-semibold text-surface-900">
                {user ? formatDateTime(user.created_at) : '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4">
              <p className="text-sm font-medium text-surface-500">Active Status</p>
              <p className="mt-2 font-semibold text-surface-900">{user?.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4">
              <p className="text-sm font-medium text-surface-500">Role</p>
              <p className="mt-2 font-semibold text-surface-900">{user?.is_admin ? 'Admin' : 'Standard User'}</p>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card">
          <p className="text-kicker">Profile Settings</p>
          <h2 className="mt-2 text-2xl font-semibold text-surface-900">Read-only account information</h2>
          <p className="mt-3 text-surface-600">
            Profile editing is not supported by the current backend APIs, so these fields remain read-only for now.
          </p>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-surface-700">
              Name
              <input className="input" value={user?.name || ''} disabled readOnly />
            </label>
            <label className="grid gap-2 text-sm font-medium text-surface-700">
              Email
              <input className="input" value={user?.email || ''} disabled readOnly />
            </label>
            <button type="button" className="button button-secondary" disabled>
              Profile editing coming soon
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
