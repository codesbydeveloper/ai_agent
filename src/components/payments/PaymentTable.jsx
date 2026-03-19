import { useMemo } from 'react';

const PAGE_SIZES = [10, 25, 50];
const STATUS_STYLES = {
  paid: 'bg-emerald-100 text-emerald-800',
  created: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-100 text-amber-800',
  expired: 'bg-slate-100 text-slate-500',
  failed: 'bg-red-100 text-red-800',
};

function StatusPill({ status }) {
  const s = (status || 'created').toLowerCase();
  const c = STATUS_STYLES[s] || STATUS_STYLES.created;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c}`}>{s}</span>;
}

function formatDate(val) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleString();
  } catch {
    return val;
  }
}

function formatAmount(amount, currency = 'INR') {
  if (amount == null) return '—';
  const n = Number(amount);
  if (Number.isNaN(n)) return String(amount);
  const sym = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency + ' ';
  return `${sym}${n.toLocaleString()}`;
}

export default function PaymentTable({
  payments = [],
  loading,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onPageSizeChange,
  statusFilter = '',
  onStatusFilterChange,
  onViewInvoice,
}) {
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const startRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = total === 0 ? 0 : Math.min(page * pageSize, total);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500">Loading payments…</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-slate-700 font-semibold">No payments yet</p>
        <p className="mt-1 text-sm text-slate-500">Create a payment link to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID / Link</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Created</th>
            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {payments.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50/50">
              <td className="px-6 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">#{p.id}</p>
                  {p.payment_link_id && (
                    <p className="truncate max-w-[180px] text-xs text-slate-500" title={p.payment_link_id}>{p.payment_link_id}</p>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{p.customer_name ?? p.customer?.name ?? '—'}</p>
                  <p className="text-xs text-slate-500">{p.customer_email ?? p.customer?.email ?? '—'}</p>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-slate-800">
                {formatAmount(p.amount, p.currency)}
              </td>
              <td className="px-6 py-4">
                <StatusPill status={p.status} />
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{formatDate(p.created_at ?? p.createdAt)}</td>
              <td className="px-6 py-4 text-right">
                {onViewInvoice && (
                  <button
                    type="button"
                    onClick={() => onViewInvoice(p)}
                    className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    View
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(onPageChange || onPageSizeChange) && totalPages >= 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-t border-slate-100 bg-slate-50/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              Showing <strong className="font-semibold text-slate-800">{startRow}-{endRow}</strong> of <strong className="font-semibold text-slate-800">{total}</strong> results
            </span>
            {onPageSizeChange && (
              <>
                <span className="text-sm text-slate-600">Per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </>
            )}
          </div>
          {onPageChange && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => onPageChange(1)} disabled={page <= 1} className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:text-slate-400 disabled:hover:bg-transparent">First</button>
              <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:text-slate-400 disabled:hover:bg-transparent">Previous</button>
              <span className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-indigo-600 px-3 text-sm font-semibold text-white">{page}</span>
              <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:text-slate-400 disabled:hover:bg-transparent">Next</button>
              <button type="button" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages} className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:text-slate-400 disabled:hover:bg-transparent">Last</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
