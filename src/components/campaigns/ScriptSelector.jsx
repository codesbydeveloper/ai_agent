import { useState, useEffect } from 'react';

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

export default function ScriptSelector({ value, onChange, scripts = [], disabled }) {
  const hasScripts = Array.isArray(scripts) && scripts.length > 0;

  if (hasScripts) {
    return (
      <div>
        <label className={labelClass}>Script</label>
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          disabled={disabled}
          className={inputClass}
        >
          <option value="">Select script</option>
          {scripts.map((s) => (
            <option key={s.id} value={s.id}>{s.name || `Script ${s.id}`}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label className={labelClass}>Script ID</label>
      <input
        type="number"
        min="1"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        disabled={disabled}
        placeholder="e.g. 1"
        className={inputClass}
      />
      <p className="mt-1.5 text-xs text-slate-500">Add a scripts API later to pick from a list.</p>
    </div>
  );
}
