import { Link } from 'react-router-dom';
import { PageIntro } from '@/components/ui/PageIntro';
import { categories, products } from '@/data/mockData';

function getStatusClass(status: string) {
  if (status === 'Active') {
    return 'bg-success-50 text-success-700';
  }

  if (status === 'Expiring Soon') {
    return 'bg-warning-50 text-warning-700';
  }

  return 'bg-danger-50 text-danger-700';
}

export function ProductsPage() {
  return (
    <section className="stack-page space-y-8">
      <PageIntro
        eyebrow="Catalog"
        title="Products"
        description="Browse your tracked products, review warranty status, and jump into details quickly."
      />

      <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
            <input
              className="input"
              type="search"
              placeholder="Search by name, brand, or category"
            />
            <select className="input" defaultValue="All Categories">
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
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
                <th className="px-4 py-2">Warranty</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="rounded-2xl bg-surface-50">
                  <td className="rounded-l-2xl px-4 py-4">
                    <div>
                      <p className="font-semibold text-surface-900">{product.name}</p>
                      <p className="text-sm text-surface-500">{product.brand}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-surface-600">{product.category}</td>
                  <td className="px-4 py-4 text-sm text-surface-600">{product.purchaseDate}</td>
                  <td className="px-4 py-4 text-sm text-surface-600">{product.warrantyDuration}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(product.status)}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="rounded-r-2xl px-4 py-4">
                    <Link className="button button-secondary" to={`/products/${product.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
