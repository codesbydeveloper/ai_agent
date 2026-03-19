import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authContext';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/calls': 'Calls',
  '/dashboard/leads': 'Leads',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/campaigns': 'Campaigns',
  '/dashboard/campaigns/new': 'New campaign',
  '/dashboard/scripts': 'Scripts',
  '/dashboard/scripts/new': 'New script',
  '/dashboard/payments': 'Payments',
  '/dashboard/users': 'Users',
};

function getPageTitle(pathname) {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith('/dashboard/campaigns/') && pathname !== '/dashboard/campaigns' && pathname !== '/dashboard/campaigns/new') {
    return 'Campaign details';
  }
  if (pathname.startsWith('/dashboard/scripts/') && pathname !== '/dashboard/scripts' && pathname !== '/dashboard/scripts/new') {
    return 'Script builder';
  }
  return 'Dashboard';
}

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pageTitle = getPageTitle(location.pathname);

  function handleLogout() {
    setDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  const displayName = user?.name?.trim() || user?.email || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-slate-900 truncate">
          {pageTitle}
        </h1>
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
            {initial}
          </div>
          <span className="hidden sm:block text-sm text-slate-700 max-w-[120px] truncate">
            {displayName}
          </span>
          <svg className="hidden sm:block w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} aria-hidden="true" />
            <div className="absolute right-0 mt-1 w-52 py-1 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || '—'}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded mx-1"
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
