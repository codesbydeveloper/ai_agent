import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import { getRole } from '../utils/roleUtils';

/**
 * Renders children only for admin. Viewer and Agent are redirected to dashboard.
 */
export default function AdminOnlyRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const role = getRole(user);

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return children;
}
