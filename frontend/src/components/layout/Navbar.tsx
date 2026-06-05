import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Products', to: '/products' },
  { label: 'Profile', to: '/profile' },
];

export function Navbar() {
  return (
    <header className="navbar">
      <Link className="flex items-center gap-3" to="/">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-sm font-bold text-white shadow-soft">
          WV
        </span>
        <span>
          <span className="brand-mark block">WarrantyVault</span>
          <span className="block text-sm text-surface-500">
            Warranty tracking made effortless
          </span>
        </span>
      </Link>

      <nav className="nav-links" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-link${isActive ? ' is-active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-actions">
        <Link className="hidden text-sm font-medium text-surface-500 md:inline-flex" to="/products/new">
          Add Product
        </Link>
        <Link className="button button-secondary" to="/login">
          Login
        </Link>
        <Link className="button" to="/register">
          Get Started
        </Link>
      </div>
    </header>
  );
}
