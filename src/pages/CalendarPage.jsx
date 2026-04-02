import { useEffect, useState } from 'react';
import { useToast } from '../store/toastContext';
import { getCalendarEvents } from '../services/calendarService';

function normalizeRows(data) {
  const rows =
    data?.data?.items ??
    data?.data ??
    data?.items ??
    data?.rows ??
    (Array.isArray(data) ? data : []);
  return Array.isArray(rows) ? rows : [];
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function CalendarPage() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getCalendarEvents();
        if (cancelled) return;
        setRows(normalizeRows(res));
      } catch (err) {
        if (cancelled) return;
        setRows([]);
        const msg = err?.response?.data?.message || err?.message || 'Failed to load calendar data.';
        toast.error(msg, { title: 'Calendar load failed' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <header className="relative overflow-hidden rounded-2xl border border-violet-200/50 bg-gradient-to-br from-white via-violet-50/45 to-indigo-50/35 p-6 shadow-md shadow-indigo-950/[0.05] ring-1 ring-violet-100/50 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-28 w-56 rounded-full bg-indigo-400/15 blur-3xl" aria-hidden />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600/90">Calendar</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Google Calendar Data</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">Source: /api/calender/all</p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 sm:p-6">
        {loading ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-600">
            Loading calendar data...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-600">
            No calendar data found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[60rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Start</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, index) => {
                  const title = row?.summary ?? row?.title ?? row?.event_name ?? 'Untitled event';
                  const start = row?.start?.dateTime ?? row?.start?.date ?? row?.date ?? row?.start_time;
                  const key = row?.id ?? row?._id ?? `${title}-${index}`;
                  return (
                    <tr key={key} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-slate-800">{title}</td>
                      <td className="px-4 py-3 text-slate-700">{formatDateTime(start)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
