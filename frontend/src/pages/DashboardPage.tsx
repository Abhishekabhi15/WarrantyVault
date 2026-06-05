import { PageIntro } from '@/components/ui/PageIntro';
import { dashboardStats, products } from '@/data/mockData';

function getToneClass(tone: string) {
  if (tone === 'success') {
    return 'border-success-200 bg-success-50/70';
  }

  if (tone === 'warning') {
    return 'border-warning-200 bg-warning-50/70';
  }

  if (tone === 'danger') {
    return 'border-danger-200 bg-danger-50/70';
  }

  return 'border-primary-200 bg-primary-50/70';
}

export function DashboardPage() {
  return (
    <section className="stack-page space-y-8">
      <PageIntro
        eyebrow="Workspace"
        title="Dashboard"
        description="A high-level view of your products, coverage health, and warranty actions that need attention."
      />

      <div className="stats-grid">
        {dashboardStats.map((card) => (
          <article
            key={card.label}
            className={`stat-card border ${getToneClass(card.tone)}`}
          >
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p className="mt-2 text-sm text-surface-500">{card.trend}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-kicker">Recent Products</p>
              <h2 className="mt-2 text-2xl font-semibold text-surface-900">Latest warranty records</h2>
            </div>
            <span className="rounded-full bg-surface-100 px-3 py-1 text-sm text-surface-600">Mock data</span>
          </div>

          <div className="mt-6 space-y-4">
            {products.slice(0, 3).map((product) => (
              <article key={product.id} className="flex flex-col gap-3 rounded-2xl border border-surface-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900">{product.name}</h3>
                  <p className="text-sm text-surface-500">
                    {product.brand} · {product.category} · Purchased {product.purchaseDate}
                  </p>
                </div>
                <div className="text-sm text-surface-600">
                  <p className="font-medium text-surface-900">{product.status}</p>
                  <p>{product.expiresIn}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card">
          <p className="text-kicker">Focus List</p>
          <h2 className="mt-2 text-2xl font-semibold text-surface-900">Upcoming actions</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-warning-50 p-4">
              <p className="font-semibold text-warning-700">Review expiring audio warranty</p>
              <p className="mt-1 text-sm text-surface-600">Sony WH-1000XM5 expires in 19 days.</p>
            </div>
            <div className="rounded-2xl bg-success-50 p-4">
              <p className="font-semibold text-success-700">Upload missing receipt</p>
              <p className="mt-1 text-sm text-surface-600">Dyson V15 is active, but purchase proof is incomplete.</p>
            </div>
            <div className="rounded-2xl bg-danger-50 p-4">
              <p className="font-semibold text-danger-700">Archive expired record</p>
              <p className="mt-1 text-sm text-surface-600">Samsung QLED warranty expired three months ago.</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
