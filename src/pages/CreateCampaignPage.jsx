import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCampaign } from '../services/campaignsService';
import { getLeads } from '../services/leadsService';
import CampaignForm from '../components/campaigns/CampaignForm';

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [scripts, setScripts] = useState([]);
  const [availableLeads, setAvailableLeads] = useState([]);
  const [leadList, setLeadList] = useState([]);

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
      const res = await createCampaign(payload);
      const campaign = res?.data ?? res;
      const id = campaign?.id ?? campaign?.campaign_id;
      if (id) navigate(`/dashboard/campaigns/${id}`);
      else navigate('/dashboard/campaigns');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-full">
      <div className="mb-6">
        <Link to="/dashboard/campaigns" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to campaigns
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Create campaign</h1>
        <p className="mt-1 text-sm text-slate-500">Set name, script, schedule, and assign leads.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <CampaignForm
          campaign={null}
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
  );
}
