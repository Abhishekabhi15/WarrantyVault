import { useEffect, useState } from 'react';
import { PageIntro } from '@/components/ui/PageIntro';
import { api, type DashboardData } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  formatDaysRemaining,
  formatWarrantyStatus,
  getWarrantyStatusClass,
  toReadableError,
} from '@/lib/format';

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.getDashboard();
        if (!cancelled) {
          setDashboard(response);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(toReadableError(loadError, 'Unable to load dashboard data.'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      label: 'Total Products',
      value: dashboard?.total_products ?? 0,
      trend: 'Tracked in your account',
      className: 'border-primary-200 bg-primary-50/70',
    },
    {
      label: 'Active Warranties',
      value: dashboard?.active_warranties ?? 0,
      trend: 'More than 30 days remain',
      className: 'border-success-200 bg-success-50/70',
    },
    {
      label: 'Expiring Soon',
      value: dashboard?.expiring_soon ?? 0,
      trend: 'Within the next 30 days',
      className: 'border-warning-200 bg-warning-50/70',
    },
    {
      label: 'Expired Warranties',
      value: dashboard?.expired_warranties ?? 0,
      trend: 'Already past coverage',
      className: 'border-danger-200 bg-danger-50/70',
    },
  ];

  return (
    <section className="stack-page space-y-8">
      <PageIntro
        eyebrow="Workspace"
        title="Dashboard"
        description="A high-level view of your products, coverage health, and warranty actions that need attention."
      />

      {error ? (
        <div className="rounded-3xl border border-danger-200 bg-danger-50 p-5 text-danger-700">
          <p className="font-semibold">Unable to load your dashboard.</p>
          <p className="mt-2 text-sm text-danger-700">{error}</p>
          <button type="button" className="button mt-4" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="stats-grid">
        {stats.map((card) => (
          <article
            key={card.label}
            className={`stat-card border ${card.className}`}
          >
            <span>{card.label}</span>
            <strong>{isLoading ? '...' : card.value}</strong>
            <p className="mt-2 text-sm text-surface-500">{card.trend}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-kicker">Upcoming Expiries</p>
              <h2 className="mt-2 text-2xl font-semibold text-surface-900">Nearest warranty deadlines</h2>
            </div>
            <span className="rounded-full bg-surface-100 px-3 py-1 text-sm text-surface-600">
              {dashboard?.upcoming_expiries.length ?? 0} items
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="rounded-2xl border border-surface-200 p-4 text-sm text-surface-500">
                Loading upcoming warranties...
              </div>
            ) : dashboard && dashboard.upcoming_expiries.length > 0 ? (
              dashboard.upcoming_expiries.map((product) => (
                <article key={product.id} className="flex flex-col gap-3 rounded-2xl border border-surface-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-surface-900">{product.name}</h3>
                    <p className="text-sm text-surface-500">
                      {product.brand || 'Brand not provided'} · Expires {formatDate(product.warranty_expiry_date)}
                    </p>
                  </div>
                  <div className="text-sm text-surface-600">
                    <p
                      className={`inline-flex rounded-full px-3 py-1 font-medium ${getWarrantyStatusClass(product.warranty_status)}`}
                    >
                      {formatWarrantyStatus(product.warranty_status)}
                    </p>
                    <p className="mt-2">{formatDaysRemaining(product.days_remaining)}</p>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-surface-200 p-4 text-sm text-surface-500">
                No upcoming warranty expiries yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card">
          <p className="text-kicker">Portfolio Summary</p>
          <h2 className="mt-2 text-2xl font-semibold text-surface-900">Coverage and document totals</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-primary-50 p-4">
              <p className="font-semibold text-primary-700">Total documents stored</p>
              <p className="mt-1 text-sm text-surface-600">
                {isLoading ? 'Loading...' : `${dashboard?.total_documents ?? 0} uploaded files`}
              </p>
            </div>
            <div className="rounded-2xl bg-success-50 p-4">
              <p className="font-semibold text-success-700">Total purchase value</p>
              <p className="mt-1 text-sm text-surface-600">
                {isLoading ? 'Loading...' : formatCurrency(dashboard?.total_purchase_value ?? '0')}
              </p>
            </div>
            <div className="rounded-2xl bg-warning-50 p-4">
              <p className="font-semibold text-warning-700">Products needing attention</p>
              <p className="mt-1 text-sm text-surface-600">
                {isLoading
                  ? 'Loading...'
                  : `${dashboard?.expiring_soon ?? 0} expiring soon, ${dashboard?.expired_warranties ?? 0} expired.`}
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
