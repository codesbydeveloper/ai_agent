import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import LandingPage from './LandingPage';

export default function LandingRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

