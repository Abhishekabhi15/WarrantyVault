import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageIntro } from '@/components/ui/PageIntro';
import { categories } from '@/data/mockData';
import { api } from '@/lib/api';
import { toReadableError } from '@/lib/format';

export function AddProductPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    purchase_date: '',
    purchase_price: '',
    retailer: '',
    serial_number: '',
    warranty_duration_months: '',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.purchase_date || !formData.warranty_duration_months) {
      setError('Please complete the required fields before saving.');
      return;
    }

    const warrantyDuration = Number(formData.warranty_duration_months);
    if (!Number.isInteger(warrantyDuration) || warrantyDuration <= 0) {
      setError('Warranty duration must be a whole number greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdProduct = await api.createProduct({
        name: formData.name.trim(),
        brand: formData.brand.trim() || null,
        category: formData.category || null,
        purchase_date: formData.purchase_date,
        purchase_price: formData.purchase_price ? String(Number(formData.purchase_price)) : null,
        retailer: formData.retailer.trim() || null,
        serial_number: formData.serial_number.trim() || null,
        warranty_duration_months: warrantyDuration,
        notes: formData.notes.trim() || null,
      });

      navigate(`/products/${createdProduct.id}`, {
        replace: true,
        state: { successMessage: 'Product created successfully.' },
      });
    } catch (submitError) {
      setError(toReadableError(submitError, 'Unable to create this product.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="stack-page space-y-8">
      <PageIntro
        eyebrow="Create"
        title="Add Product"
        description="Create a new product record with purchase and coverage details using the live WarrantyVault backend."
      />

      <form className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-surface-700">
            Product Name
            <input
              className="input"
              type="text"
              placeholder="Noise Cancelling Headphones"
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-surface-700">
            Brand
            <input
              className="input"
              type="text"
              placeholder="Sony"
              value={formData.brand}
              onChange={(event) => setFormData((current) => ({ ...current, brand: event.target.value }))}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-surface-700">
            Category
            <select
              className="input"
              value={formData.category}
              onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))}
            >
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
            <input
              className="input"
              type="date"
              value={formData.purchase_date}
              onChange={(event) => setFormData((current) => ({ ...current, purchase_date: event.target.value }))}
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-surface-700">
            Purchase Price
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="1299.99"
              value={formData.purchase_price}
              onChange={(event) =>
                setFormData((current) => ({ ...current, purchase_price: event.target.value }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-surface-700">
            Retailer
            <input
              className="input"
              type="text"
              placeholder="Apple Store"
              value={formData.retailer}
              onChange={(event) => setFormData((current) => ({ ...current, retailer: event.target.value }))}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-surface-700">
            Serial Number
            <input
              className="input"
              type="text"
              placeholder="ABC123XYZ"
              value={formData.serial_number}
              onChange={(event) =>
                setFormData((current) => ({ ...current, serial_number: event.target.value }))
              }
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-surface-700">
            Warranty Duration
            <input
              className="input"
              type="number"
              min="1"
              step="1"
              placeholder="24"
              value={formData.warranty_duration_months}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  warranty_duration_months: event.target.value,
                }))
              }
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-surface-700 md:col-span-2">
            Notes
            <textarea
              className="input min-h-28"
              placeholder="Add any product notes, seller details, or warranty reminders."
              value={formData.notes}
              onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
            />
          </label>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 border-t border-surface-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-surface-500">
            Warranty expiry and status will be calculated automatically by the backend.
          </p>
          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Product...' : 'Save Product'}
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
