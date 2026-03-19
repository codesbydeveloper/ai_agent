import { useState, useEffect } from 'react';

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'converted', 'lost', 'not_interested'];

export default function LeadForm({ lead, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    hotel_name: '',
    owner_name: '',
    phone: '',
    email: '',
    rooms: '',
    location: '',
    status: 'new',
    tags: '',
    notes: '',
  });

  useEffect(() => {
    if (lead?.id) {
      setForm({
        hotel_name: lead.hotel_name ?? '',
        owner_name: lead.owner_name ?? '',
        phone: lead.phone ?? '',
        email: lead.email ?? '',
        rooms: lead.rooms ?? '',
        location: lead.location ?? '',
        status: lead.status ?? 'new',
        tags: Array.isArray(lead.tags) ? lead.tags.join(', ') : (lead.tags ?? ''),
        notes: lead.notes ?? '',
      });
    } else {
      setForm({
        hotel_name: '',
        owner_name: '',
        phone: '',
        email: '',
        rooms: '',
        location: '',
        status: 'new',
        tags: '',
        notes: '',
      });
    }
  }, [lead]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      rooms: form.rooms === '' ? undefined : Number(form.rooms) || 0,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    onSave(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hotel name *</label>
          <input name="hotel_name" value={form.hotel_name} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Hotel name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Owner name *</label>
          <input name="owner_name" value={form.owner_name} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Owner name" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="+91..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="email@example.com" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rooms</label>
          <input name="rooms" type="number" min="0" value={form.rooms} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
          <input name="location" value={form.location} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="City, State" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
        <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none">
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
        <input name="tags" value={form.tags} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="vip, follow-up" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Notes..." />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
          {saving ? 'Saving…' : (lead?.id ? 'Update lead' : 'Create lead')}
        </button>
      </div>
    </form>
  );
}
