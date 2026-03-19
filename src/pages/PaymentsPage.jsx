import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPaymentLink, getPayments } from '../services/paymentService';
import { getLeads } from '../services/leadsService';
import RevenueChart from '../components/charts/RevenueChart';
import PaymentTable from '../components/payments/PaymentTable';
import InvoiceViewer from '../components/payments/InvoiceViewer';

const PAGE_SIZES = [10, 25, 50];
const DEFAULT_PAGE_SIZE = 10;

function safePaymentsList(res) {
  const data = res?.data ?? res;
  const list = Array.isArray(data?.payments) ? data.payments : (Array.isArray(data) ? data : []);
  const total = data?.total ?? data?.count ?? list.length;
  return { list, total };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(null);
  const [form, setForm] = useState({
    amount: 4999,
    currency: 'INR',
    description: 'AI Receptionist Setup',
    customer: { name: '', email: '', contact: '' },
    lead_id: '',
    send_sms: true,
  });

  const [leads, setLeads] = useState([]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: pageSize };
      if (statusFilter) params.status = statusFilter;
      const res = await getPayments(params);
      const { list, total: t } = safePaymentsList(res);
      setPayments(list);
      setTotal(t);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load payments');
      setPayments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  useEffect(() => {
    let cancelled = false;
    getLeads({ limit: 200 })
      .then((res) => {
        const data = res?.data ?? res;
        const list = Array.isArray(data?.leads) ? data.leads : (Array.isArray(data) ? data : []);
        if (!cancelled) setLeads(list);
      })
      .catch(() => { if (!cancelled) setLeads([]); });
    return () => { cancelled = true; };
  }, []);

  const chartData = useMemo(() => {
    const paid = payments.filter((p) => (p.status || '').toLowerCase() === 'paid');
    if (paid.length === 0) return [];
    const byDate = {};
    paid.forEach((p) => {
      const raw = p.created_at ?? p.createdAt;
      const key = raw ? new Date(raw).toLocaleDateString() : `#${p.id}`;
      byDate[key] = (byDate[key] || 0) + Number(p.amount || 0);
    });
    return Object.entries(byDate).map(([name, revenue]) => ({ name, revenue }));
  }, [payments]);

  const summary = useMemo(() => {
    const paid = payments.filter((p) => (p.status || '').toLowerCase() === 'paid');
    const pending = payments.filter((p) => (p.status || '').toLowerCase() === 'pending' || (p.status || '').toLowerCase() === 'created');
    const totalPaid = paid.reduce((s, p) => s + Number(p.amount || 0), 0);
    return { totalPaid, paidCount: paid.length, pendingCount: pending.length };
  }, [payments]);

  async function handleCreateLink(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setCreateSuccess(null);
    try {
      const payload = {
        amount: Number(form.amount) || 0,
        currency: form.currency || 'INR',
        description: (form.description || '').trim() || undefined,
        customer: {
          name: (form.customer?.name || '').trim() || undefined,
          email: (form.customer?.email || '').trim() || undefined,
          contact: (form.customer?.contact || '').trim() || undefined,
        },
        lead_id: form.lead_id ? Number(form.lead_id) : undefined,
        send_sms: !!form.send_sms,
      };
      const res = await createPaymentLink(payload);
      const data = res?.data ?? res;
      // Backend may return link under different keys (Razorpay: short_url, or custom)
      const url =
        data?.short_url ??
        data?.payment_link_url ??
        data?.url ??
        data?.link ??
        data?.payment_link?.short_url ??
        data?.payment_link?.url ??
        (typeof data?.payment_link === 'string' ? data.payment_link : null);
      setCreateSuccess({
        url: url || null,
        send_sms: !!payload.send_sms,
        contact: (payload.customer?.contact || '').trim() || null,
        message: data?.message ?? null,
      });
      // Reset form so fields are empty for the next payment link
      setForm({
        amount: 4999,
        currency: 'INR',
        description: 'AI Receptionist Setup',
        customer: { name: '', email: '', contact: '' },
        lead_id: '',
        send_sms: true,
      });
      // Go to first page and refresh list so the new payment appears in the table
      setPage(1);
      // Fetch with page 1 so the new payment shows up (useEffect will also refetch when page state updates)
      getPayments({ page: 1, limit: pageSize, ...(statusFilter && { status: statusFilter }) }).then((res) => {
        const { list, total: t } = safePaymentsList(res);
        setPayments(list);
        setTotal(t);
      }).catch(() => {});
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create payment link');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">Razorpay payment links, SMS, and invoice storage.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {createSuccess && (
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-sm">
          <p className="font-semibold text-emerald-900">Payment link created</p>

          {createSuccess.url ? (
            <>
              <p className="mt-2 text-emerald-800">Share this link with the customer (they can pay via UPI, card, or net banking):</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createSuccess.url}
                  className="flex-1 min-w-[200px] rounded-lg border border-emerald-200 bg-white px-3 py-2 text-slate-800 text-sm font-mono"
                />
                <a href={createSuccess.url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shrink-0">
                  Open link
                </a>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(createSuccess.url)}
                  className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 shrink-0"
                >
                  Copy link
                </button>
              </div>
            </>
          ) : (
            <p className="mt-2 text-emerald-800">
              Link was created on the server. If your backend returns the URL in the API response, it will show above. Check <strong>Payment history</strong> below for the new payment.
            </p>
          )}

          {createSuccess.send_sms && (
            <p className="mt-3 pt-3 border-t border-emerald-200 text-emerald-800">
              SMS was requested to be sent to the customer’s number{createSuccess.contact ? `: ${createSuccess.contact}` : ''}. If the backend has SMS configured, the link will be sent to that mobile.
            </p>
          )}

          <button type="button" onClick={() => setCreateSuccess(null)} className="mt-3 text-emerald-700 hover:text-emerald-900 underline font-medium">Dismiss</button>
        </div>
      )}

      {/* Create payment link */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Create payment link</h2>
          <p className="text-sm text-slate-500 mt-0.5">Send a Razorpay link to a customer (optional SMS).</p>
        </div>
        <form onSubmit={handleCreateLink} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
              <input
                type="number"
                min={1}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. AI Receptionist Setup"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer name</label>
              <input
                type="text"
                value={form.customer?.name ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, customer: { ...f.customer, name: e.target.value } }))}
                placeholder="Rahul Sharma"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={form.customer?.email ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, customer: { ...f.customer, email: e.target.value } }))}
                placeholder="rahul@example.com"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
              <input
                type="text"
                value={form.customer?.contact ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, customer: { ...f.customer, contact: e.target.value } }))}
                placeholder="+919876543210"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lead (optional)</label>
              <select
                value={form.lead_id}
                onChange={(e) => setForm((f) => ({ ...f, lead_id: e.target.value }))}
                className="w-full min-w-[160px] rounded-xl border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="">None</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>{l.hotel_name || l.owner_name || `Lead #${l.id}`}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={!!form.send_sms}
                onChange={(e) => setForm((f) => ({ ...f, send_sms: e.target.checked }))}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Send SMS</span>
            </label>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create payment link'}
            </button>
          </div>
        </form>
      </div>

      {/* Summary + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          <div className="rounded-2xl border border-slate-200/80 border-l-4 border-l-emerald-500 bg-emerald-50/50 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Paid (this page)</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">₹{summary.totalPaid.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 border-l-4 border-l-amber-500 bg-amber-50/50 p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Pending</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{summary.pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 border-l-4 border-l-indigo-500 bg-indigo-50/50 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-medium text-slate-500">Paid count</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{summary.paidCount}</p>
          </div>
        </div>
        <div className="lg:col-span-2">
          <RevenueChart data={chartData} loading={loading} title="Payment revenue (from list)" />
        </div>
      </div>

      {/* Payment history */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-900">Payment history</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="created">Created</option>
              <option value="expired">Expired</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        <PaymentTable
          payments={payments}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(v) => { setPageSize(v); setPage(1); }}
          onViewInvoice={setSelectedPayment}
        />
      </div>

      {selectedPayment && (
        <InvoiceViewer payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
      )}
    </div>
  );
}
