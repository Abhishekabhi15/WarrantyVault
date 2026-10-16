import { Link } from 'react-router-dom';
import { PageIntro } from '@/components/ui/PageIntro';
import { features } from '@/data/mockData';

export function LandingPage() {
  return (
    <section className="landing-page space-y-12">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-8">
          <PageIntro
            eyebrow="Modern Warranty Management"
            title="Track every product warranty before important coverage slips away."
            description="WarrantyVault gives households and growing teams a calm, modern workspace for products, receipts, warranty timelines, and renewal decisions."
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="button" to="/register">
              Start Free
            </Link>
            <Link className="button button-secondary" to="/dashboard">
              Explore Dashboard
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-soft">
              <p className="text-kicker">Products Tracked</p>
              <h3 className="mt-2 text-3xl font-semibold text-surface-900">4.2k</h3>
              <p className="mt-2 text-sm text-surface-500">Across personal and small business inventories.</p>
            </div>
            <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-soft">
              <p className="text-kicker">Coverage Saved</p>
              <h3 className="mt-2 text-3xl font-semibold text-surface-900">91%</h3>
              <p className="mt-2 text-sm text-surface-500">Of expiring items flagged before deadline.</p>
            </div>
            <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-soft">
              <p className="text-kicker">Claim Ready</p>
              <h3 className="mt-2 text-3xl font-semibold text-surface-900">24/7</h3>
              <p className="mt-2 text-sm text-surface-500">Documentation is organized whenever support calls.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-card backdrop-blur">
          <div className="rounded-[1.75rem] bg-surface-900 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-primary-200">Live Snapshot</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Warranty command center</h2>
              </div>
              <span className="rounded-full bg-success-500/20 px-3 py-1 text-sm font-medium text-success-300">
                Protected
              </span>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl bg-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-100">Next expiring warranty</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Sony WH-1000XM5</h3>
                  </div>
                  <p className="rounded-full bg-warning-400/20 px-3 py-1 text-sm text-warning-200">19 days left</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/10 p-5">
                  <p className="text-sm text-primary-100">Active plans</p>
                  <h3 className="mt-2 text-3xl font-semibold text-white">31</h3>
                </div>
                <div className="rounded-3xl bg-white/10 p-5">
                  <p className="text-sm text-primary-100">Receipts stored</p>
                  <h3 className="mt-2 text-3xl font-semibold text-white">48</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="max-w-2xl">
          <p className="text-kicker">Features</p>
          <h2 className="mt-2 text-4xl font-semibold text-surface-900">
            Built for modern product ownership and fast warranty decisions.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-soft">
              <div className="mb-4 h-12 w-12 rounded-2xl bg-primary-50" />
              <h3 className="text-xl font-semibold text-surface-900">{feature.title}</h3>
              <p className="mt-3 text-surface-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>


    </section>
  );
}
