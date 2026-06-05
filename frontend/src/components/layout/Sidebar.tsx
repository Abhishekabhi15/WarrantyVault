import { NavLink } from 'react-router-dom';

const sidebarItems = [
  { label: 'Overview', to: '/dashboard' },
  { label: 'Products', to: '/products' },
  { label: 'Add Product', to: '/products/new' },
  { label: 'Profile', to: '/profile' },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-panel">
        <p className="sidebar-kicker">Vault Navigation</p>
        <h2>Manage every purchase, warranty, and renewal in one place.</h2>
        <p className="mt-3 text-sm text-surface-500">
          Stay ahead of expirations with a clean, focused dashboard.
        </p>
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' is-active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-3xl border border-primary-100 bg-primary-50 p-5 shadow-soft">
        <p className="text-sm font-semibold text-primary-700">Upcoming Review</p>
        <h3 className="mt-2 text-lg font-semibold text-surface-900">
          3 warranties need action this week
        </h3>
        <p className="mt-2 text-sm text-surface-600">
          Review expiring coverage and prepare claim documents before deadlines.
        </p>
      </div>
    </aside>
  );
}
