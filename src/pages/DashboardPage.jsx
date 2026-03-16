import { useAuth } from '../store/authContext';
import { useNavigate } from 'react-router-dom';

/**
 * Placeholder dashboard for authenticated users. Replace with full CRM later.
 */
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-800">AI Voice Agent</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            {user?.name ?? user?.email ?? 'User'}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-2xl">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Dashboard</h2>
          <p className="text-slate-600">
            Welcome. This is the protected area. Full CRM dashboard will go here.
          </p>
        </div>
      </main>
    </div>
  );
}
