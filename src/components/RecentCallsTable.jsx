export default function RecentCallsTable({ data, loading }) {
  const rows = Array.isArray(data) ? data : (data?.calls ?? data?.recent ?? data?.data) ?? [];

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Calls</h2>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Calls</h2>
        </div>
        <div className="p-8 text-center text-slate-500 text-sm">No recent calls yet.</div>
      </div>
    );
  }

  const first = rows[0];
  const keys = typeof first === 'object' && first !== null ? Object.keys(first) : [];
  const displayKeys = keys.filter((k) => !/^_|id$/i.test(k)).slice(0, 6);
  const headers = displayKeys.length
    ? displayKeys
    : ['phone', 'duration', 'status', 'date', 'outcome'].filter((k) => first[k] != null);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
      <div className="px-5 py-4 border-b border-slate-200 min-w-[500px]">
        <h2 className="text-lg font-semibold text-slate-900">Recent Calls</h2>
      </div>
      <table className="w-full min-w-[500px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {headers.map((key) => (
              <th
                key={key}
                className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {key.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.slice(0, 10).map((row, i) => (
            <tr key={row.id ?? i} className="hover:bg-slate-50/50">
              {headers.map((key) => (
                <td key={key} className="px-5 py-3 text-sm text-slate-700">
                  {typeof row[key] === 'object' && row[key] !== null && !(row[key] instanceof Date)
                    ? JSON.stringify(row[key])
                    : String(row[key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
