import { Link } from 'react-router-dom';

function LogoMark() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="lg-home" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="14" fill="url(#lg-home)" />
      <path
        d="M15 22.5c0-2.9 2.3-5.2 5.2-5.2h2.6c2.9 0 5.2 2.3 5.2 5.2 0 2.1-1.2 3.9-3 4.7l-.5.2v3.1H18.9v-3.1l-.5-.2c-1.8-.8-3-2.6-3-4.7Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M22 11.5c-2.5 0-4.9 1-6.7 2.8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M22 33.1c2.5 0 4.9-1 6.7-2.8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="w-full">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div className="leading-tight">
              <div className="text-lg font-semibold text-slate-900">AI Voice Agent</div>
              <div className="text-sm text-slate-600">CRM for voice agents</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <section className="pt-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                Handle leads and meetings with an AI receptionist
              </h1>
              <p className="mt-4 text-slate-600 text-lg">
                Campaigns, leads, scripts, payments, and calendar scheduling—connected to one voice agent dashboard.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/register"
                  className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/20"
                >
                  Get started
                </Link>
                <Link to="/login" className="text-sm font-semibold text-indigo-700 hover:text-indigo-800">
                  I already have an account
                </Link>
              </div>

              <div className="mt-8 grid sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">Leads</div>
                  <div className="text-xs text-slate-500 mt-1">Search, import, update status</div>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">Meetings</div>
                  <div className="text-xs text-slate-500 mt-1">Availability, booking, reschedule</div>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">Payments</div>
                  <div className="text-xs text-slate-500 mt-1">Links, status, history</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 lg:p-6">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-slate-100 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="text-sm font-semibold text-indigo-700">Live dashboard</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">Dashboard goes here</div>
                  <div className="mt-2 text-sm text-slate-600">
                    After login, you will see leads, calls, campaigns, scripts, payments, and calendar actions.
                  </div>
                  <div className="mt-6">
                    <Link
                      to="/login"
                      className="inline-flex items-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Sign in to continue
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div className="text-xs font-semibold text-slate-900">Protected API</div>
                  <div className="text-xs text-slate-600 mt-1">JWT/session cookies attached automatically</div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div className="text-xs font-semibold text-slate-900">Calendar OAuth</div>
                  <div className="text-xs text-slate-600 mt-1">Link Google account per user</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

