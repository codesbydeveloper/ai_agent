import { Handle, Position } from 'reactflow';

export default function DecisionNode({ id, data }) {
  const label = data?.label ?? 'Decision';
  const question = data?.question ?? '';
  const onChange = data?.onChange;

  return (
    <div className="w-[340px] rounded-2xl border border-amber-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-amber-100 bg-amber-50 px-3 py-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Decision node</p>
          <p className="truncate text-sm font-semibold text-slate-900">{label}</p>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <label className="block text-xs font-medium text-slate-600">Label</label>
        <input
          value={label}
          onChange={(e) => onChange?.(id, { label: e.target.value })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="e.g. Interested?"
        />
        <label className="block text-xs font-medium text-slate-600 mt-2">Question</label>
        <textarea
          value={question}
          onChange={(e) => onChange?.(id, { question: e.target.value })}
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="What should the AI ask to branch the flow?"
        />

        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-2">
            <p className="font-semibold text-slate-700">Yes path</p>
            <p>Connect from the right-top handle.</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-2">
            <p className="font-semibold text-slate-700">No path</p>
            <p>Connect from the right-bottom handle.</p>
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !bg-slate-400" />
      <Handle id="yes" type="source" position={Position.Right} style={{ top: '35%' }} className="!h-3 !w-3 !bg-emerald-600" />
      <Handle id="no" type="source" position={Position.Right} style={{ top: '70%' }} className="!h-3 !w-3 !bg-rose-600" />
    </div>
  );
}

