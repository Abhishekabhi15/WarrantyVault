import { Outlet } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';

export function AuthLayout() {
  return (
    <div className="shell shell-auth">
      <main className="auth-frame">
        <section className="auth-hero">
          <p className="auth-kicker">WarrantyVault</p>
          <h1>Keep every receipt and warranty one click away.</h1>
          <p>
            Build a reliable paper trail for electronics, appliances, and
            household products with a modern tracking workspace.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-soft">
              <p className="text-kicker">Organize</p>
              <h3 className="mt-2 text-lg font-semibold text-surface-900">Receipts and invoices</h3>
            </article>
            <article className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-soft">
              <p className="text-kicker">Track</p>
              <h3 className="mt-2 text-lg font-semibold text-surface-900">Coverage deadlines</h3>
            </article>
            <article className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-soft">
              <p className="text-kicker">Prepare</p>
              <h3 className="mt-2 text-lg font-semibold text-surface-900">Claim-ready records</h3>
            </article>
          </div>
        </section>

        <section className="auth-card">
          <Outlet />
        </section>
      </main>
      <Footer />
    </div>
  );
}
