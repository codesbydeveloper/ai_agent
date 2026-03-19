import { Link } from 'react-router-dom';

function formatSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') return '—';
  const start = schedule.start ?? schedule.start_time;
  const end = schedule.end ?? schedule.end_time;
  const days = schedule.days;
  const dayStr = Array.isArray(days) && days.length ? `${days.length} days` : '';
  const timeStr = [start, end].filter(Boolean).join('–');
  return [dayStr, timeStr].filter(Boolean).join(' · ') || '—';
}

function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/60',
    scheduled: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60',
    active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
    paused: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
    completed: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60',
  };
  const cls = styles[status] || styles.draft;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status || '—'}
    </span>
  );
}

export default function CampaignTable({ campaigns, onDelete, deleteConfirmId, onConfirmDelete, onCancelDelete }) {
  if (!Array.isArray(campaigns) || campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="rounded-full bg-slate-100 p-4">
          <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-900">No campaigns yet</p>
        <p className="mt-1 text-sm text-slate-500">Create your first campaign to start reaching leads.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
            <th className="hidden px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 md:table-cell">Script</th>
            <th className="hidden px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 lg:table-cell">Schedule</th>
            <th className="hidden px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 lg:table-cell">Timezone</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
            <th className="hidden px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 lg:table-cell">Leads</th>
            <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {campaigns.map((c) => (
            <tr key={c.id} className="bg-white transition-colors hover:bg-slate-50/70">
              <td className="whitespace-nowrap px-6 py-4">
                <Link
                  to={`/dashboard/campaigns/${c.id}`}
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  {c.name ?? '—'}
                </Link>
              </td>
              <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-slate-600 md:table-cell">{c.script_id ?? '—'}</td>
              <td className="hidden px-6 py-4 text-sm text-slate-600 lg:table-cell max-w-[180px] truncate" title={formatSchedule(c.schedule)}>{formatSchedule(c.schedule)}</td>
              <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-slate-600 lg:table-cell">{c.timezone ?? '—'}</td>
              <td className="whitespace-nowrap px-6 py-4">
                <StatusBadge status={c.status} />
              </td>
              <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-slate-600 lg:table-cell">{Array.isArray(c.lead_list) ? c.lead_list.length : 0}</td>
              <td className="whitespace-nowrap px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/dashboard/campaigns/${c.id}`}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
                  >
                    View
                  </Link>
                  {onDelete && (deleteConfirmId === c.id ? (
                    <>
                      <button type="button" onClick={() => onConfirmDelete(c.id)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-500">Confirm</button>
                      <button type="button" onClick={onCancelDelete} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => onDelete(c.id)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
