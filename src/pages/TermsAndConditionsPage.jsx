import { Link } from 'react-router-dom';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Terms &amp; Conditions</h1>
          <Link
            to="/"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to home
          </Link>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-slate-700 sm:text-base">
          <p>
            By using AI Voice Agent, you agree to use the website and platform responsibly, follow applicable laws,
            and provide accurate account and business information.
          </p>
          <p>
            The platform is intended for campaign management, call operations, lead handling, and related business
            workflows. You are responsible for your team activity and all content submitted under your account.
          </p>
          <p>
            You must not misuse services, attempt unauthorized access, or use the platform for unlawful, harmful, or
            deceptive activity.
          </p>
          <p>
            Service availability may include maintenance windows and periodic updates. We may improve or modify
            features to keep the platform reliable and secure.
          </p>
          <p>
            Continued use of the website means acceptance of these terms and future policy updates published on this
            page.
          </p>
          <p className="text-xs text-slate-500 sm:text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
