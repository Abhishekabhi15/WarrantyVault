import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function FullPageMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="container-app flex min-h-[50vh] items-center justify-center py-12">
      <div className="max-w-lg rounded-3xl border border-white/80 bg-white/90 p-8 text-center shadow-card">
        <h1 className="text-3xl font-semibold text-surface-900">{title}</h1>
        <p className="mt-3 text-surface-600">{description}</p>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <FullPageMessage
        title="Checking your session"
        description="Please wait while WarrantyVault restores your account access."
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <FullPageMessage
        title="Checking your session"
        description="Please wait while WarrantyVault confirms your sign-in state."
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
