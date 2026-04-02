import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import { getRole } from '../utils/roleUtils';

/**
 * Renders children only for agent or admin.
 * Viewer is redirected to /dashboard.
 */
export default function AgentOrAdminRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const role = getRole(user);

  if (role !== 'agent' && role !== 'admin') {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return children;
}

