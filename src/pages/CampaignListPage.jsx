import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import { getRole } from '../utils/roleUtils';
import { getCampaigns, deleteCampaign } from '../services/campaignsService';
import CampaignTable from '../components/campaigns/CampaignTable';

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ['', 'draft', 'scheduled', 'active', 'paused', 'completed'];

export default function CampaignListPage() {
  const { user } = useAuth();
  const role = getRole(user);
  const isAdmin = role === 'admin';

  const [campaigns, setCampaigns] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      const res = await getCampaigns(params);
      const data = res?.data ?? res;
      const list = Array.isArray(data?.campaigns) ? data.campaigns : (Array.isArray(data) ? data : []);
      setCampaigns(list);
      setTotal(data?.total ?? data?.count ?? list.length);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load campaigns');
      setCampaigns([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  async function handleConfirmDelete(id) {
    setError('');
    try {
      await deleteCampaign(id);
      setDeleteConfirmId(null);
      fetchCampaigns();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed');
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Campaigns</h1>
        <p className="mt-1 text-sm text-slate-500">Create and manage outbound calling campaigns.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <input
              type="search"
              placeholder="Search campaigns…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s || 'all'} value={s}>{s ? s : 'All statuses'}</option>
              ))}
            </select>
          </div>
          {isAdmin && (
            <Link
              to="/dashboard/campaigns/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New campaign
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="mt-3 text-sm text-slate-500">Loading campaigns…</p>
          </div>
        ) : (
          <CampaignTable
            campaigns={campaigns}
            onDelete={isAdmin ? setDeleteConfirmId : undefined}
            deleteConfirmId={deleteConfirmId}
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={() => setDeleteConfirmId(null)}
          />
        )}

        {!loading && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-3">
            <p className="text-sm text-slate-600">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
