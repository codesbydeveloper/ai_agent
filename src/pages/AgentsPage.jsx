 import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../store/toastContext';
import {
  createOmniAgent,
  deleteOmniAgent,
  getOmniAgents,
  updateOmniAgent,
} from '../services/omniAgentsService';

const PAGE_SIZES = [10, 20, 25, 50];
const DEFAULT_PAGE_SIZE = 10;

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-shadow disabled:opacity-70';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

const defaultSection = () => ({
  title: '',
  body: '',
  is_enabled: true,
});

function normalizeOmniAgents(res) {
  const body = res?.data ?? res;
  const list =
    body?.agents ??
    body?.items ??
    body?.results ??
    body?.omni_agents ??
    body?.data?.agents ??
    (Array.isArray(body?.data) ? body.data : null) ??
    (Array.isArray(body) ? body : []);

  const total =
    body?.total ??
    body?.count ??
    body?.total_count ??
    body?.pagination?.total ??
    list?.length ??
    0;

  return { list: Array.isArray(list) ? list : [], total: Number(total) || 0 };
}

function getAgentId(a) {
  return a?.id ?? a?.agent_id ?? a?._id ?? a?.omni_agent_id;
}
function getAgentName(a) {
  return a?.name ?? a?.agent_name ?? '';
}
function getAgentWelcome(a) {
  return a?.welcome_message ?? a?.welcomeMessage ?? '';
}
function getAgentDescription(a) {
  return a?.description ?? a?.agent_description ?? a?.agentDescription ?? '';
}
function getContextBreakdown(a) {
  const cb = a?.context_breakdown ?? a?.contextBreakdown ?? [];
  return Array.isArray(cb) ? cb : [];
}

function DeleteConfirmModal({
  open,
  agentName,
  agentId,
  deleting,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  const title = agentName?.trim() || 'this agent';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-900/45 p-4 pb-8 backdrop-blur-[2px] sm:items-center sm:pb-4"
      role="presentation"
      onClick={deleting ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-100/90"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-agent-title"
        aria-describedby="delete-agent-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-red-100/80 bg-gradient-to-br from-red-50/90 via-white to-orange-50/20 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 ring-1 ring-red-200/60">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 id="delete-agent-title" className="text-lg font-bold tracking-tight text-slate-900">
                Delete agent?
              </h2>
              <p id="delete-agent-desc" className="mt-1 text-sm leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-800">{title}</span>
                {agentId != null && <span className="text-slate-500"> (ID {agentId})</span>}{' '}
                will be removed permanently. This cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition-opacity hover:from-red-500 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2.5"
          >
            {deleting ? 'Deleting…' : 'Delete agent'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AgentWizard({
  mode,
  initialAgent,
  onCancel,
  onSubmit,
  submitting,
}) {
  const isEdit = mode === 'edit';
  const [step, setStep] = useState(1);
  const [name, setName] = useState(getAgentName(initialAgent));
  const [welcomeMessage, setWelcomeMessage] = useState(getAgentWelcome(initialAgent));
  const [description, setDescription] = useState(getAgentDescription(initialAgent));
  const [contextBreakdown, setContextBreakdown] = useState(() => {
    const cb = getContextBreakdown(initialAgent);
    return cb.length ? cb : [defaultSection()];
  });

  useEffect(() => {
    if (!initialAgent) return;
    setName(getAgentName(initialAgent));
    setWelcomeMessage(getAgentWelcome(initialAgent));
    setDescription(getAgentDescription(initialAgent));
    const cb = getContextBreakdown(initialAgent);
    setContextBreakdown(cb.length ? cb : [defaultSection()]);
    setStep(1);
  }, [initialAgent]);

  const canProceedStep1 = useMemo(() => {
    if (isEdit) return true;
    const n = String(name || '').trim();
    const w = String(welcomeMessage || '').trim();
    const d = String(description || '').trim();
    return n.length > 0 && w.length > 0 && d.length > 0;
  }, [isEdit, name, welcomeMessage, description]);

  function addSection() {
    setContextBreakdown((prev) => [...(Array.isArray(prev) ? prev : []), defaultSection()]);
  }

  function removeSection(idx) {
    setContextBreakdown((prev) => {
      const next = (Array.isArray(prev) ? prev : []).filter((_, i) => i !== idx);
      return next.length ? next : [defaultSection()];
    });
  }

  function updateSection(idx, patch) {
    setContextBreakdown((prev) => {
      const next = [...(Array.isArray(prev) ? prev : [])];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  async function submit(e) {
    e.preventDefault();

    if (isEdit) {
      const context_breakdown = (Array.isArray(contextBreakdown) ? contextBreakdown : [])
        .map((s) => ({
          title: String(s?.title || '').trim(),
          body: String(s?.body || '').trim(),
          is_enabled: s?.is_enabled == null ? true : !!s.is_enabled,
        }))
        .filter((s) => s.title.length > 0 || s.body.length > 0);

      const normalized = context_breakdown.length ? context_breakdown : [defaultSection()];
      // Match your example PUT payload: only context_breakdown is sent.
      await onSubmit({ context_breakdown: normalized });
      return;
    }

    await onSubmit({
      name: String(name || '').trim() || undefined,
      welcome_message: String(welcomeMessage || '').trim() || undefined,
      description: String(description || '').trim() || undefined,
    });
  }

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-2xl border border-violet-200/50 bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/30 p-6 shadow-md shadow-indigo-950/[0.04] ring-1 ring-violet-100/50">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-10 left-1/4 h-36 w-56 rounded-full bg-indigo-400/15 blur-3xl" aria-hidden />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600/90">Omni agents</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {isEdit ? 'Edit agent' : 'Create support agent'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {isEdit ? 'Update the context sections for this agent.' : 'Create with name, welcome message, and description.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100/80 transition-colors hover:bg-slate-50/60"
          >
            Back to list
          </button>
        </div>

        {isEdit ? (
          <div className="mt-5 flex items-center gap-3">
            <span className={`h-2 w-2 rounded-full ${step === 1 ? 'bg-indigo-600' : 'bg-slate-300'}`} aria-hidden />
            <span className={`h-2 w-2 rounded-full ${step === 2 ? 'bg-indigo-600' : 'bg-slate-300'}`} aria-hidden />
            <span className="text-xs font-semibold text-slate-500">
              Step {step} of 2
            </span>
          </div>
        ) : null}
      </header>

      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-900/[0.04] ring-1 ring-slate-100/90">
        <form onSubmit={submit} className="p-5 sm:p-7 space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Name {isEdit ? null : '*'}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Support Agent"
                    className={inputClass}
                    disabled={isEdit}
                  />
                </div>
                <div>
                  <label className={labelClass}>Welcome message {isEdit ? null : '*'}</label>
                  <input
                    type="text"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Hello!"
                    className={inputClass}
                    disabled={isEdit}
                  />
                </div>
                {!isEdit && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Description *</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Support for vehicle questions and booking"
                      className={inputClass}
                      disabled={isEdit}
                    />
                  </div>
                )}
                {isEdit && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={inputClass}
                      disabled={true}
                    />
                  </div>
                )}
              </section>

              {isEdit ? (
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-slate-500">
                    In edit mode, only context sections are updated.
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="btn-primary-gradient w-full sm:w-auto rounded-xl px-5 py-3 text-sm font-semibold shadow-md shadow-indigo-900/10 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              ) : (
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary-gradient w-full sm:w-auto rounded-xl px-5 py-3 text-sm font-semibold shadow-md shadow-indigo-900/10 disabled:opacity-50"
                  >
                    {submitting ? 'Creating…' : 'Create agent'}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && isEdit && (
            <div className="space-y-6">
              <section className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">Context sections</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Add multiple sections. Each section becomes an item inside `context_breakdown`.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addSection}
                    className="rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm hover:bg-violet-50/50"
                  >
                    + Add section
                  </button>
                </div>

                {(Array.isArray(contextBreakdown) ? contextBreakdown : []).map((s, idx) => (
                  <div
                    key={`section-${idx}`}
                    className="rounded-2xl border border-slate-200/90 bg-slate-50/40 p-4 shadow-sm ring-1 ring-slate-100/70"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-800/90">
                          Section {idx + 1}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {String(s?.title || '').trim() ? String(s.title).trim() : 'Untitled'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                          <input
                            type="checkbox"
                            checked={s?.is_enabled == null ? true : !!s.is_enabled}
                            onChange={(e) => updateSection(idx, { is_enabled: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          Enabled
                        </label>
                        <button
                          type="button"
                          onClick={() => removeSection(idx)}
                          disabled={(contextBreakdown || []).length <= 1}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50/70 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Title *</label>
                        <input
                          type="text"
                          value={s.title}
                          onChange={(e) => updateSection(idx, { title: e.target.value })}
                          placeholder="Purpose"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Body *</label>
                        <textarea
                          value={s.body}
                          onChange={(e) => updateSection(idx, { body: e.target.value })}
                          placeholder="Handles support."
                          rows={3}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50/70"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary-gradient w-full sm:w-auto rounded-xl px-5 py-3 text-sm font-semibold shadow-md shadow-indigo-900/10 disabled:opacity-50"
                >
                  {submitting ? (isEdit ? 'Updating…' : 'Creating…') : isEdit ? 'Update agent' : 'Create agent'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agents, setAgents] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [view, setView] = useState('list'); // list | create | edit
  const [editingAgent, setEditingAgent] = useState(null);

  const [deleteAgent, setDeleteAgent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getOmniAgents({ page, page_size: pageSize });
      const normalized = normalizeOmniAgents(res);
      setAgents(normalized.list);
      setTotal(normalized.total);
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.detail ??
        err?.message ??
        'Failed to load agents';
      setError(msg);
      toast.error(msg, { title: 'Agents load failed' });
      setAgents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, toast]);

  useEffect(() => {
    if (view !== 'list') return;
    fetchAgents();
  }, [fetchAgents, view]);

  const totalCount = total > 0 ? total : agents.length;
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  const startRow = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = totalCount === 0 ? 0 : Math.min(page * pageSize, totalCount);

  const openCreate = () => {
    setEditingAgent(null);
    setView('create');
  };

  const openEdit = (agent) => {
    setEditingAgent(agent);
    setView('edit');
  };

  const closeWizard = () => {
    setView('list');
    setEditingAgent(null);
  };

  async function handleCreate(payload) {
    await createOmniAgent(payload);
    toast.success('Agent created successfully.', { title: 'Success' });
    closeWizard();
    fetchAgents();
  }

  async function handleUpdate(payload) {
    if (!editingAgent) return;
    const id = getAgentId(editingAgent);
    if (!id) return;
    await updateOmniAgent(id, payload);
    toast.success('Agent updated successfully.', { title: 'Success' });
    closeWizard();
    fetchAgents();
  }

  async function handleDelete() {
    if (!deleteAgent) return;
    const id = getAgentId(deleteAgent);
    if (!id) return;
    setDeleting(true);
    setError('');
    try {
      await deleteOmniAgent(id);
      toast.success('Agent deleted.', { title: 'Success' });
      setDeleteAgent(null);
      fetchAgents();
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.detail ??
        err?.message ??
        'Failed to delete agent';
      setError(msg);
      toast.error(msg, { title: 'Delete failed' });
    } finally {
      setDeleting(false);
    }
  }

  const [submitting, setSubmitting] = useState(false);
  const submitWrapper = async (payload) => {
    setSubmitting(true);
    try {
      if (view === 'create') {
        await handleCreate(payload);
      } else {
        await handleUpdate(payload);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.detail ??
        err?.message ??
        'Failed to save agent';
      setError(msg);
      toast.error(msg, { title: 'Save failed' });
    } finally {
      setSubmitting(false);
    }
  };

  if (view === 'create') {
    return (
      <AgentWizard
        mode="create"
        initialAgent={{}}
        onCancel={closeWizard}
        onSubmit={submitWrapper}
        submitting={submitting}
      />
    );
  }

  if (view === 'edit') {
    return (
      <AgentWizard
        mode="edit"
        initialAgent={editingAgent || {}}
        onCancel={closeWizard}
        onSubmit={submitWrapper}
        submitting={submitting}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <header className="relative overflow-hidden rounded-2xl border border-violet-200/50 bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/30 p-6 shadow-md shadow-indigo-950/[0.04] ring-1 ring-violet-100/50">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-10 left-1/4 h-36 w-56 rounded-full bg-indigo-400/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600/90">Omni agents</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Agent history</h1>
            <p className="mt-2 text-sm text-slate-600">
              There are <span className="font-semibold text-slate-900">{totalCount}</span> agent{totalCount === 1 ? '' : 's'}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              type="button"
              onClick={openCreate}
              className="btn-primary-gradient rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md shadow-indigo-900/10"
            >
              + Create agent
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="flex gap-3 rounded-xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-900 shadow-sm ring-1 ring-red-100/60" role="alert">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-900/[0.03] ring-1 ring-slate-100/80">
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-indigo-50/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Agents</h2>
            <p className="mt-1 text-sm text-slate-600">Edit context sections or delete an agent.</p>
          </div>
          <span className="text-xs rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-semibold text-indigo-700 w-fit">
            Page {page} / {totalPages}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="mt-3 text-sm text-slate-600">Loading agents…</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-base font-semibold text-slate-900">No agents yet</p>
            <p className="mt-2 text-sm text-slate-500">Create the first agent to start support automation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] border-collapse text-left">
              <caption className="sr-only">Omni agent history</caption>
              <thead>
                <tr className="border-b border-indigo-200/50 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-violet-50/20">
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5">Name</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5">Welcome</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5">Sections</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5">Status</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 sm:px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agents.map((a) => {
                  const id = getAgentId(a);
                  const name = getAgentName(a) || '—';
                  const welcome = getAgentWelcome(a);
                  const cb = getContextBreakdown(a);
                  const enabledCount = cb.filter((s) => s?.is_enabled).length;
                  const isActive = cb.length > 0 && enabledCount === cb.length;
                  const statusText = cb.length === 0 ? 'No sections' : isActive ? 'Active' : 'Partial';

                  return (
                    <tr key={String(id || name)} className="bg-white transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-3.5 align-middle text-sm font-semibold text-slate-900 sm:px-5">{name}</td>
                      <td className="px-4 py-3.5 align-middle text-sm text-slate-600 sm:px-5">
                        <div className="max-w-[260px] truncate" title={welcome || ''}>
                          {welcome || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-sm text-slate-700 sm:px-5">
                        {cb.length} section{cb.length === 1 ? '' : 's'}
                        {enabledCount < cb.length && cb.length > 0 ? (
                          <span className="ml-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            {enabledCount} enabled
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 align-middle text-sm sm:px-5">
                        {cb.length === 0 ? (
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                            No sections
                          </span>
                        ) : isActive ? (
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                            Partial
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right align-middle sm:px-5">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(a)}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200 bg-indigo-50 hover:bg-indigo-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteAgent(a)}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 ring-1 ring-red-200 bg-red-50 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && agents.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{startRow}-{endRow}</span> of{' '}
              <span className="font-semibold text-slate-900">{totalCount}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="text-sm text-slate-500">Per page</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
                >
                  Prev
                </button>
                <span className="btn-primary-gradient flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-3 text-sm font-semibold" aria-current="page">
                  {page}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={deleteAgent != null}
        agentName={deleteAgent ? getAgentName(deleteAgent) : ''}
        agentId={deleteAgent ? getAgentId(deleteAgent) : null}
        deleting={deleting}
        onClose={() => !deleting && setDeleteAgent(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

