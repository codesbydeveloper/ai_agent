import { useEffect, useState } from 'react';
import { getRecentCalls } from '../services/dashboardService';
import RecentCallsTable from '../components/RecentCallsTable';
import { useAuth } from '../store/authContext';
import { getRole } from '../utils/roleUtils';

export default function CallsPage() {
  const { user } = useAuth();
  const role = getRole(user);
  const [calls, setCalls] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRecentCalls()
      .then((data) => { if (!cancelled) setCalls(data); })
      .catch(() => { if (!cancelled) setCalls([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const isViewer = role === 'viewer';

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Calls</h1>
        <p className="text-slate-500 text-sm mt-1">
          {isViewer ? 'Call history, details, transcript, and recording. Read-only.' : 'Live calls, history, and call details.'}
        </p>
      </div>

      {role === 'agent' && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
          <h2 className="text-lg font-semibold text-slate-800">Live Calls</h2>
          <p className="text-sm text-slate-500 mt-1">When you have an active call, it will appear here. No live calls at the moment.</p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Call history</h2>
        <RecentCallsTable data={calls} loading={loading} />
      </div>
    </div>
  );
}
