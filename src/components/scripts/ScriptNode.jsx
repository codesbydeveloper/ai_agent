import { Handle, Position } from 'reactflow';

export default function ScriptNode({ id, data }) {
  const label = data?.label ?? 'Step';
  const prompt = data?.prompt ?? '';
  const onChange = data?.onChange;

  return (
    <div className="w-[320px] rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-slate-100 bg-slate-50 px-3 py-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Script node</p>
          <p className="truncate text-sm font-semibold text-slate-900">{label}</p>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <label className="block text-xs font-medium text-slate-600">Label</label>
        <input
          value={label}
          onChange={(e) => onChange?.(id, { label: e.target.value })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="e.g. Greeting"
        />
        <label className="block text-xs font-medium text-slate-600 mt-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => onChange?.(id, { prompt: e.target.value })}
          rows={4}
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="What should the AI say?"
        />
      </div>

      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !bg-slate-400" />
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !bg-indigo-600" />
    </div>
  );
}

