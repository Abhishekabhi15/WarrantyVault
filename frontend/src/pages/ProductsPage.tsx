import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { PageIntro } from '@/components/ui/PageIntro';
import { categories } from '@/data/mockData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { api, type Product, type WarrantyStatus } from '@/lib/api';
import {
  formatDate,
  formatWarrantyStatus,
  getWarrantyStatusClass,
  toReadableError,
} from '@/lib/format';

export function ProductsPage() {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState<'all' | WarrantyStatus>('all');
  const [sortValue, setSortValue] = useState('created_at-desc');
  const [skip, setSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { successMessage?: string } | null)?.successMessage ?? null,
  );
  const debouncedSearch = useDebouncedValue(search, 400);
  const limit = 10;

  const [sortBy, sortOrder] = useMemo(() => {
    const [field, order] = sortValue.split('-');
    return [field as 'created_at' | 'purchase_date' | 'warranty_expiry_date' | 'name', order as 'asc' | 'desc'];
  }, [sortValue]);

  useEffect(() => {
    setSkip(0);
  }, [category, debouncedSearch, sortValue, statusFilter]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.listProducts({
          search: debouncedSearch || undefined,
          category: category === 'All Categories' ? undefined : category,
          status: statusFilter === 'all' ? undefined : statusFilter,
          sort_by: sortBy,
          sort_order: sortOrder,
          skip,
          limit,
        });

        if (!cancelled) {
          setProducts(response);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(toReadableError(loadError, 'Unable to load your products.'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [category, debouncedSearch, limit, skip, sortBy, sortOrder, statusFilter]);

  return (
    <section className="stack-page space-y-8">
      <PageIntro
        eyebrow="Catalog"
        title="Products"
        description="Browse your tracked products, review warranty status, and jump into details quickly."
      />

      {successMessage ? (
        <div className="rounded-3xl border border-success-200 bg-success-50 p-5 text-success-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{successMessage}</span>
            <button
              type="button"
              className="text-sm font-medium text-success-700"
              onClick={() => setSuccessMessage(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-3xl border border-danger-200 bg-danger-50 p-5 text-danger-700">
          <p className="font-semibold">Unable to load products.</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : null}

      <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 xl:items-center">
            <input
              className="input"
              type="search"
              placeholder="Search by name, brand, or category"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="input"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as 'all' | WarrantyStatus)
              }
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
            <select
              className="input"
              value={sortValue}
              onChange={(event) => setSortValue(event.target.value)}
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="warranty_expiry_date-asc">Expiry Soonest</option>
              <option value="purchase_date-desc">Recently Purchased</option>
              <option value="name-asc">Name A-Z</option>
            </select>
          </div>
          <Link className="button" to="/products/new">
            Add Product
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-sm font-semibold text-surface-500">
                <th className="px-4 py-2">Product</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Purchase Date</th>
                <th className="px-4 py-2">Expiry Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="rounded-2xl bg-surface-50 px-4 py-8 text-center text-sm text-surface-500">
                    Loading products...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="rounded-2xl bg-surface-50">
                    <td className="rounded-l-2xl px-4 py-4">
                      <div>
                        <p className="font-semibold text-surface-900">{product.name}</p>
                        <p className="text-sm text-surface-500">{product.brand || 'Brand not provided'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-surface-600">{product.category || 'Uncategorized'}</td>
                    <td className="px-4 py-4 text-sm text-surface-600">{formatDate(product.purchase_date)}</td>
                    <td className="px-4 py-4 text-sm text-surface-600">{formatDate(product.warranty_expiry_date)}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${getWarrantyStatusClass(product.warranty_status)}`}
                      >
                        {formatWarrantyStatus(product.warranty_status)}
                      </span>
                    </td>
                    <td className="rounded-r-2xl px-4 py-4">
                      <Link className="button button-secondary" to={`/products/${product.id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="rounded-2xl bg-surface-50 px-4 py-8 text-center text-sm text-surface-500">
                    No products match your current search and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-surface-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-surface-500">
            Showing {products.length} product{products.length === 1 ? '' : 's'}.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="button button-secondary"
              disabled={skip === 0 || isLoading}
              onClick={() => setSkip((current) => Math.max(0, current - limit))}
            >
              Previous
            </button>
            <button
              type="button"
              className="button button-secondary"
              disabled={isLoading || products.length < limit}
              onClick={() => setSkip((current) => current + limit)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
