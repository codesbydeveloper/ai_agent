/**
 * Revenue chart - accepts array of { label, value } or { period, revenue } etc.
 */
function normalizeData(data) {
  if (!Array.isArray(data)) {
    const d = data?.data ?? data?.revenue ?? data?.series ?? [];
    return Array.isArray(d) ? d : [];
  }
  return data;
}

function getLabel(item) {
  return item?.label ?? item?.period ?? item?.month ?? item?.date ?? item?.name ?? '';
}

function getValue(item) {
  const n = item?.value ?? item?.revenue ?? item?.amount ?? item?.total ?? 0;
  return Number(n) || 0;
}

export default function RevenueChart({ data, loading, title = 'Revenue' }) {
  const items = normalizeData(data);
  const values = items.map(getValue);
  const max = Math.max(1, ...values);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
        <div className="h-48 rounded-lg bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No revenue data yet.</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      <div className="flex items-end gap-2 h-48">
        {items.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div
              className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t transition-all hover:from-indigo-600 hover:to-indigo-500"
              style={{ height: `${(getValue(item) / max) * 100}%`, minHeight: getValue(item) ? 4 : 0 }}
            />
            <span className="text-xs text-slate-500 truncate w-full text-center" title={getLabel(item)}>
              {getLabel(item)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
