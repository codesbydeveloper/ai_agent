import { Outlet, Link } from 'react-router-dom';

function LogoIcon({ className = 'w-10 h-10' }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="url(#auth-logo-grad)" />
      <path d="M12 20c0-1.5.5-2.8 1.4-3.8l2.2 2.2a5 5 0 107 0l2.2-2.2A8 8 0 1128 20h-2a6 6 0 10-3.4-5.4l-1.4 1.4V14h-2v6h-2v-2.8l-1.4-1.4A6 6 0 0112 20z" fill="white" fillOpacity="0.95" />
      <defs>
        <linearGradient id="auth-logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left: branding (visible on larger screens) */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white flex-col justify-between p-10">
        <Link to="/" className="flex items-center gap-3">
          <LogoIcon className="w-11 h-11" />
          <span className="text-xl font-semibold tracking-tight">AI Voice Agent</span>
        </Link>
        <div>
          <h2 className="text-2xl font-semibold mb-3">CRM for voice agents</h2>
          <p className="text-indigo-100 text-lg max-w-sm">
            Manage campaigns, leads, and AI receptionists from one dashboard.
          </p>
        </div>
        <p className="text-indigo-200 text-sm">© AI Voice Agent</p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-800 hover:text-indigo-600">
              <LogoIcon className="w-9 h-9" />
              <span className="text-lg font-semibold">AI Voice Agent</span>
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-10">
            <Outlet />
          </div>
          <p className="text-center text-slate-400 text-sm mt-8">
            Need help? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
