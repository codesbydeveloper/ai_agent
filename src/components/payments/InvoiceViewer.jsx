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

export default function InvoiceViewer({ payment, onClose }) {
  if (!payment) return null;

  const customer = payment.customer ?? {};
  const name = payment.customer_name ?? customer.name ?? '—';
  const email = payment.customer_email ?? customer.email ?? '—';
  const contact = payment.customer_contact ?? customer.contact ?? '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Payment #{(payment.id ?? payment.payment_link_id ?? '—')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Amount & status</h3>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between">
              <span className="text-2xl font-bold text-slate-900">{formatAmount(payment.amount, payment.currency)}</span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                (payment.status || '').toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                (payment.status || '').toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {payment.status ?? '—'}
              </span>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Customer</h3>
            <div className="rounded-xl border border-slate-200 p-4 space-y-2">
              <p className="text-sm font-medium text-slate-900">{name}</p>
              <p className="text-sm text-slate-600">{email}</p>
              <p className="text-sm text-slate-600">{contact}</p>
            </div>
          </section>

          {payment.description && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Description</h3>
              <p className="text-sm text-slate-700">{payment.description}</p>
            </section>
          )}

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Details</h3>
            <dl className="rounded-xl border border-slate-200 divide-y divide-slate-100">
              <div className="flex justify-between px-4 py-3">
                <dt className="text-sm text-slate-500">Created</dt>
                <dd className="text-sm font-medium text-slate-900">{formatDate(payment.created_at ?? payment.createdAt)}</dd>
              </div>
              {payment.payment_link_id && (
                <div className="flex justify-between px-4 py-3">
                  <dt className="text-sm text-slate-500">Payment link ID</dt>
                  <dd className="text-sm font-mono text-slate-700 truncate max-w-[200px]" title={payment.payment_link_id}>{payment.payment_link_id}</dd>
                </div>
              )}
              {payment.lead_id != null && (
                <div className="flex justify-between px-4 py-3">
                  <dt className="text-sm text-slate-500">Lead ID</dt>
                  <dd className="text-sm font-medium text-slate-900">{payment.lead_id}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
