import { useState, useEffect } from 'react';
import ScriptSelector from './ScriptSelector';
import ScheduleSettings, { scheduleToApi } from './ScheduleSettings';

const STATUS_OPTIONS = ['draft', 'scheduled', 'active', 'paused', 'completed'];

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-shadow";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

export default function CampaignForm({
  campaign,
  scripts = [],
  onSave,
  onCancel,
  saving,
  showSchedule = true,
  showLeadList = true,
  leadList = [],
  onLeadListChange,
  availableLeads = [],
}) {
  const [name, setName] = useState('');
  const [scriptId, setScriptId] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [callFrequency, setCallFrequency] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    if (campaign) {
      setName(campaign.name ?? '');
      setScriptId(campaign.script_id ?? null);
      setSchedule(campaign.schedule ?? null);
      setTimezone(campaign.timezone ?? 'Asia/Kolkata');
      setCallFrequency(campaign.call_frequency !== undefined && campaign.call_frequency !== null ? String(campaign.call_frequency) : '');
      setStatus(campaign.status ?? 'draft');
    } else {
      setName('');
      setScriptId(null);
      setSchedule(null);
      setTimezone('Asia/Kolkata');
      setCallFrequency('');
      setStatus('draft');
    }
  }, [campaign]);

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      name: name.trim() || undefined,
      script_id: scriptId ?? undefined,
      schedule: scheduleToApi(schedule),
      timezone: timezone || undefined,
      call_frequency: callFrequency === '' || callFrequency == null ? undefined : Number(callFrequency),
      status,
      lead_list: (Array.isArray(leadList) ? leadList : []).map((l) => (typeof l === 'object' ? l.id : l)),
    };
    onSave(payload);
  }

  function addLead(lead) {
    if (!onLeadListChange || !lead?.id) return;
    const list = Array.isArray(leadList) ? [...leadList] : [];
    if (list.some((l) => l.id === lead.id || l === lead.id)) return;
    list.push(typeof lead === 'object' ? lead.id : lead);
    onLeadListChange(list);
  }

  function removeLead(id) {
    if (!onLeadListChange) return;
    const list = (Array.isArray(leadList) ? leadList : []).filter((l) => (typeof l === 'object' ? l.id : l) !== id);
    onLeadListChange(list);
  }

  const selectedIds = Array.isArray(leadList) ? leadList.map((l) => (typeof l === 'object' ? l.id : l)) : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Basic info</h4>
        <div>
          <label className={labelClass}>Campaign name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Q1 Hotel Outreach"
            className={inputClass}
          />
        </div>
        <ScriptSelector value={scriptId} onChange={setScriptId} scripts={scripts} />
      </section>

      {showSchedule && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
          <ScheduleSettings schedule={schedule} onChange={setSchedule} />
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <h4 className="sm:col-span-2 text-sm font-semibold uppercase tracking-wider text-slate-500">Settings</h4>
        <div>
          <label className={labelClass}>Timezone</label>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass}>
            <option value="UTC">UTC</option>
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Call frequency (number)</label>
          <input
            type="number"
            min={0}
            value={callFrequency}
            onChange={(e) => setCallFrequency(e.target.value)}
            placeholder="e.g. 3"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">Calls per lead per period (e.g. 3).</p>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </section>

      {showLeadList && (
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Assign leads</h4>
          {availableLeads.length > 0 ? (
            <>
              <select
                className={inputClass}
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) return;
                  const lead = availableLeads.find((l) => String(l.id) === id);
                  if (lead) addLead(lead);
                  e.target.value = '';
                }}
              >
                <option value="">Add a lead…</option>
                {availableLeads.filter((l) => !selectedIds.includes(l.id)).map((l) => (
                  <option key={l.id} value={l.id}>{l.hotel_name || l.owner_name || l.email || `Lead ${l.id}`}</option>
                ))}
              </select>
              <ul className="mt-3 flex flex-wrap gap-2">
                {(Array.isArray(leadList) ? leadList : []).map((item) => {
                  const id = typeof item === 'object' ? item.id : item;
                  const lead = availableLeads.find((l) => l.id === id) || { id, hotel_name: `Lead ${id}` };
                  return (
                    <li
                      key={id}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 py-1.5 pl-3 pr-1.5 text-sm text-slate-800"
                    >
                      <span>{lead.hotel_name || lead.owner_name || `Lead ${id}`}</span>
                      <button type="button" onClick={() => removeLead(id)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-red-600" aria-label="Remove">×</button>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="text-sm text-slate-500">No leads available. Add leads from the Leads page first.</p>
          )}
        </section>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {saving ? 'Saving…' : (campaign?.id ? 'Update campaign' : 'Create campaign')}
        </button>
      </div>
    </form>
  );
}
