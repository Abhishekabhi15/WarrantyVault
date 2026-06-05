import { Outlet } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export function DashboardLayout() {
  return (
    <div className="shell shell-dashboard">
      <Navbar />
      <div className="dashboard-grid">
        <Sidebar />
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
