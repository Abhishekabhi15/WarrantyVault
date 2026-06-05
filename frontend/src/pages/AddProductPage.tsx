import { PageIntro } from '@/components/ui/PageIntro';
import { categories } from '@/data/mockData';

export function AddProductPage() {
  return (
    <section className="stack-page space-y-8">
      <PageIntro
        eyebrow="Create"
        title="Add Product"
        description="Create a new product record with purchase and coverage details using mock-only form inputs."
      />

      <form className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-surface-700">
            Product Name
            <input className="input" type="text" placeholder="Noise Cancelling Headphones" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-surface-700">
            Brand
            <input className="input" type="text" placeholder="Sony" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-surface-700">
            Category
            <select className="input" defaultValue="">
              <option value="" disabled>
                Select a category
              </option>
              {categories
                .filter((category) => category !== 'All Categories')
                .map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-surface-700">
            Purchase Date
            <input className="input" type="date" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-surface-700 md:col-span-2">
            Warranty Duration
            <input className="input" type="text" placeholder="e.g. 12 months or 24 months" />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-surface-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-surface-500">
            This form is UI-only for Phase 1 and does not persist data.
          </p>
          <button type="button" className="button">
            Save Product
          </button>
        </div>
      </form>

      <div className="rounded-3xl border border-surface-200 bg-surface-50 p-6">
        <p className="text-kicker">Tips</p>
        <h2 className="mt-2 text-2xl font-semibold text-surface-900">Recommended fields for future phases</h2>
        <p className="mt-3 text-surface-600">
          Consider adding serial number, invoice upload, seller information, and renewal reminders when backend support is ready.
        </p>
      </div>
    </section>
  );
}
