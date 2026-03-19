import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCampaignById, updateCampaign, deleteCampaign } from '../services/campaignsService';
import { getLeads } from '../services/leadsService';
import CampaignForm from '../components/campaigns/CampaignForm';

function formatSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') return '—';
  const start = schedule.start ?? schedule.start_time;
  const end = schedule.end ?? schedule.end_time;
  const days = schedule.days;
  const parts = [];
  if (Array.isArray(days) && days.length) parts.push(`${days.length} days/week`);
  if (start && end) parts.push(`${start}–${end}`);
  return parts.length ? parts.join(' · ') : '—';
}

const statusStyles = {
  draft: 'bg-slate-100 text-slate-700',
  scheduled: 'bg-blue-50 text-blue-700',
  active: 'bg-emerald-50 text-emerald-700',
  paused: 'bg-amber-50 text-amber-700',
  completed: 'bg-slate-100 text-slate-600',
};

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [scripts, setScripts] = useState([]);
  const [availableLeads, setAvailableLeads] = useState([]);
  const [leadList, setLeadList] = useState([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    getCampaignById(id)
      .then((res) => {
        const c = res?.data ?? res;
        setCampaign(c);
        setLeadList(Array.isArray(c?.lead_list) ? c.lead_list : []);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || err?.message || 'Failed to load campaign');
        setCampaign(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    getLeads({ limit: 500 }).then((res) => {
      const data = res?.data ?? res;
      const list = Array.isArray(data?.leads) ? data.leads : (Array.isArray(data) ? data : []);
      setAvailableLeads(list);
    }).catch(() => setAvailableLeads([]));
  }, []);

  async function handleSave(payload) {
    setSaving(true);
    setError('');
    try {
      await updateCampaign(id, payload);
      setCampaign((c) => (c ? { ...c, ...payload } : null));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this campaign? This cannot be undone.')) return;
    setError('');
    try {
      await deleteCampaign(id);
      navigate('/dashboard/campaigns');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed');
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-500">Loading campaign…</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-800">{error || 'Campaign not found.'}</p>
        <Link to="/dashboard/campaigns" className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-500">← Back to campaigns</Link>
      </div>
    );
  }

  const statusCls = statusStyles[campaign.status] || statusStyles.draft;

  return (
    <div className="min-h-full">
      <div className="mb-6">
        <Link to="/dashboard/campaigns" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Campaigns
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{campaign.name || 'Campaign details'}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusCls}`}>
              {campaign.status ?? '—'}
            </span>
            <span className="text-sm text-slate-500">ID: {campaign.id}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Delete campaign
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Schedule</h3>
        <p className="mt-2 text-slate-800">{formatSchedule(campaign.schedule)}</p>
        {campaign.call_frequency && <p className="mt-1 text-sm text-slate-600">Frequency: {campaign.call_frequency}</p>}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-semibold text-slate-900">Edit campaign</h3>
        <p className="mt-1 text-sm text-slate-500">Update settings and assigned leads.</p>
        <div className="mt-6">
          <CampaignForm
            campaign={campaign}
            scripts={scripts}
            onSave={handleSave}
            onCancel={() => navigate('/dashboard/campaigns')}
            saving={saving}
            showSchedule
            showLeadList
            leadList={leadList}
            onLeadListChange={setLeadList}
            availableLeads={availableLeads}
          />
        </div>
      </div>
    </div>
  );
}
