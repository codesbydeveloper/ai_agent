import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Privacy Policy</h1>
          <Link
            to="/"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to home
          </Link>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-slate-700 sm:text-base">
          <p>
            AI Voice Agent respects your privacy. This page explains what data we collect, how we use it, and how we
            protect it while you use our website and dashboard.
          </p>
          <p>
            We may collect account details (name, email, phone), workspace usage data (campaigns, calls, scripts,
            leads), and technical data required to keep the platform secure and stable.
          </p>
          <p>
            We use this information to provide services, improve product performance, support customer operations, and
            maintain account security. We do not sell personal data.
          </p>
          <p>
            Access to workspace data is role-based. We use secure sessions, standard API authentication, and internal
            access controls to reduce unauthorized access risk.
          </p>
          <p>
            If you need account-data updates or deletion requests, contact the website administrator through official
            support channels.
          </p>
          <p className="text-xs text-slate-500 sm:text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
