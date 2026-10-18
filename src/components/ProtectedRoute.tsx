import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from './States';

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { session, loading, isAdmin } = useAuth();

  if (loading) return <LoadingSpinner message="جاري التحميل..." />;

  if (!session) return <Navigate to="/auth" replace />;

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
