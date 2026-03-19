import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../store/authContext';
import { getRole } from '../utils/roleUtils';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  importLeads,
} from '../services/leadsService';
import LeadForm from '../components/LeadForm';
import ImportLeadsModal from '../components/ImportLeadsModal';

const STATUS_OPTIONS = ['', 'new', 'contacted', 'qualified', 'converted', 'lost', 'not_interested'];
const AGENT_STATUS_OPTIONS = ['interested', 'not_interested', 'callback'];
const PAGE_SIZES = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

function formatDate(val) {
  if (!val) return '—';
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleDateString();
  } catch {
    return val;
  }
}

function StatusPill({ status }) {
  const styles = {
    converted: 'bg-emerald-100 text-emerald-800',
    qualified: 'bg-blue-100 text-blue-800',
    contacted: 'bg-amber-100 text-amber-800',
    interested: 'bg-emerald-100 text-emerald-800',
    callback: 'bg-blue-100 text-blue-800',
    not_interested: 'bg-slate-100 text-slate-500',
    new: 'bg-slate-100 text-slate-700',
    lost: 'bg-slate-100 text-slate-500',
  };
  const c = styles[status] || 'bg-slate-100 text-slate-700';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c}`}>{status || '—'}</span>;
}

export default function LeadsPage() {
  const { user } = useAuth();
  const role = getRole(user);
  const isViewer = role === 'viewer';
  const isAgent = role === 'agent';
  const isAdmin = role === 'admin';

  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formModal, setFormModal] = useState({ open: false, lead: null });
  const [formSaving, setFormSaving] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [notesEdit, setNotesEdit] = useState({}); // id -> notes text

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: pageSize };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      // Optional: if (isAgent) params.assigned = true; — backend can filter assigned leads
      const res = await getLeads(params);
      const data = res?.data ?? res;
      const list = Array.isArray(data?.leads) ? data.leads : (Array.isArray(data) ? data : []);
      setLeads(list);
      setTotal(data?.total ?? data?.count ?? list.length);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load leads');
      setLeads([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, isAgent]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  function openCreate() { setFormModal({ open: true, lead: null }); }
  async function openEdit(id) {
    try {
      const res = await getLeadById(id);
      setFormModal({ open: true, lead: res?.data ?? res });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load lead');
    }
  }
  function closeForm() { setFormModal({ open: false, lead: null }); }

  async function handleSave(payload) {
    setFormSaving(true);
    setError('');
    try {
      if (formModal.lead?.id) await updateLead(formModal.lead.id, payload);
      else await createLead(payload);
      closeForm();
      fetchLeads();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed');
    } finally {
      setFormSaving(false);
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await deleteLead(id);
      setDeleteConfirm(null);
      fetchLeads();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed');
    }
  }

  async function handleImport(formData) {
    setImporting(true);
    setError('');
    try {
      await importLeads(formData);
      setImportModalOpen(false);
      fetchLeads();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  async function handleAgentStatusChange(leadId, newStatus) {
    setUpdatingId(leadId);
    setError('');
    try {
      await updateLead(leadId, { status: newStatus });
      fetchLeads();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAgentNotesSave(leadId, notes) {
    setUpdatingId(leadId);
    setError('');
    try {
      await updateLead(leadId, { notes });
      setNotesEdit((prev) => ({ ...prev, [leadId]: undefined }));
      fetchLeads();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  }

  const totalCount = total > 0 ? total : leads.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startRow = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = totalCount === 0 ? 0 : Math.min(page * pageSize, totalCount);

  const showToolbarButtons = isAdmin;
  const viewerColumnsOnly = isViewer;

  return (
    <div className="space-y-4">
      <p className="text-slate-500 text-sm">
        {isViewer && 'View lead list. Read-only.'}
        {isAgent && 'Your assigned leads. Update status and add notes.'}
        {isAdmin && 'Manage your hotel leads. Search, filter, and add or import leads.'}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 flex-1 min-w-0">
          <input
            type="search"
            placeholder="Search…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full sm:max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            {(isAgent ? ['', ...AGENT_STATUS_OPTIONS] : STATUS_OPTIONS).map((s) => (
              <option key={s || 'all'} value={s}>{s || 'All statuses'}</option>
            ))}
          </select>
        </div>
        {showToolbarButtons && (
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setImportModalOpen(true)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">Import CSV</button>
            <button type="button" onClick={openCreate} className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700">Add lead</button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">{error}</div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="mt-3 text-sm text-slate-500">Loading…</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-slate-600 font-medium">No leads yet</p>
            <p className="text-sm text-slate-500 mt-1">{isViewer ? 'No leads to display.' : 'Add a lead or import from CSV to get started.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Hotel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</th>
                  {!viewerColumnsOnly && <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>}
                  {!viewerColumnsOnly && <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Rooms</th>}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  {isAgent && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</th>}
                  {!viewerColumnsOnly && <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Created</th>}
                  {isAdmin && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{lead.hotel_name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{lead.owner_name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{lead.phone ?? '—'}</td>
                    {!viewerColumnsOnly && <td className="hidden md:table-cell px-4 py-3 text-sm text-slate-600">{lead.email ?? '—'}</td>}
                    {!viewerColumnsOnly && <td className="hidden lg:table-cell px-4 py-3 text-sm text-slate-600">{lead.rooms ?? '—'}</td>}
                    <td className="px-4 py-3 text-sm text-slate-600">{lead.location ?? '—'}</td>
                    <td className="px-4 py-3">
                      {isAgent ? (
                        <select
                          value={lead.status || ''}
                          onChange={(e) => handleAgentStatusChange(lead.id, e.target.value)}
                          disabled={updatingId === lead.id}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-800 disabled:opacity-50"
                        >
                          {AGENT_STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <StatusPill status={lead.status} />
                      )}
                    </td>
                    {isAgent && (
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Add notes…"
                          value={notesEdit[lead.id] !== undefined ? notesEdit[lead.id] : (lead.notes ?? '')}
                          onChange={(e) => setNotesEdit((p) => ({ ...p, [lead.id]: e.target.value }))}
                          onBlur={(e) => {
                            const v = e.target.value?.trim();
                            if (v !== (lead.notes ?? '')) handleAgentNotesSave(lead.id, v || '');
                          }}
                          className="w-full max-w-[180px] rounded-lg border border-slate-300 px-2 py-1 text-xs"
                        />
                      </td>
                    )}
                    {!viewerColumnsOnly && <td className="hidden lg:table-cell px-4 py-3 text-sm text-slate-500">{formatDate(lead.created_at)}</td>}
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => openEdit(lead.id)} className="px-2 py-1 rounded text-sm text-indigo-600 hover:bg-indigo-50">Edit</button>
                          {deleteConfirm === lead.id ? (
                            <>
                              <button type="button" onClick={() => handleDelete(lead.id)} className="px-2 py-1 rounded text-sm text-red-600 font-medium hover:bg-red-50">Confirm</button>
                              <button type="button" onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
                            </>
                          ) : (
                            <button type="button" onClick={() => setDeleteConfirm(lead.id)} className="px-2 py-1 rounded text-sm text-slate-500 hover:text-red-600 hover:bg-red-50">Delete</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && (leads.length > 0 || total > 0) && totalPages >= 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              Showing <strong className="font-semibold text-slate-800">{startRow}-{endRow}</strong> of <strong className="font-semibold text-slate-800">{totalCount}</strong> results
            </span>
            <span className="text-sm text-slate-600">Per page</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
            >
              First
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
            >
              Previous
            </button>
            <span
              className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-indigo-600 px-3 text-sm font-semibold text-white"
              aria-current="page"
            >
              {page}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {formModal.open && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeForm}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{formModal.lead?.id ? 'Edit lead' : 'Add lead'}</h2>
            <LeadForm lead={formModal.lead} onSave={handleSave} onCancel={closeForm} saving={formSaving} />
          </div>
        </div>
      )}

      {importModalOpen && (
        <ImportLeadsModal onImport={handleImport} onClose={() => setImportModalOpen(false)} importing={importing} />
      )}
    </div>
  );
}
