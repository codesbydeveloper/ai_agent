const iconWrap = 'w-11 h-11 rounded-xl flex items-center justify-center shrink-0';

const agentCardsConfig = [
  {
    label: 'Calls handled',
    valueKey: 'totalCalls',
    altKeys: ['total_calls', 'calls_made', 'calls'],
    format: (v) => (v != null ? Number(v).toLocaleString() : '0'),
    icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    accent: 'border-l-indigo-500 bg-indigo-50/50',
    iconBg: 'bg-indigo-100 text-indigo-600',
  },
  {
    label: 'Assigned leads',
    valueKey: 'assignedLeads',
    altKeys: ['assigned_leads'],
    format: (v) => (v != null ? Number(v).toLocaleString() : '0'),
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    accent: 'border-l-emerald-500 bg-emerald-50/50',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    label: 'Conversion rate',
    valueKey: 'conversionRate',
    altKeys: ['conversion_rate'],
    format: (v) => (typeof v === 'number' ? `${v.toFixed(1)}%` : v ?? '0%'),
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    accent: 'border-l-amber-500 bg-amber-50/50',
    iconBg: 'bg-amber-100 text-amber-600',
  },
];

const cardsConfig = [
  {
    label: 'Total Calls',
    valueKey: 'totalCalls',
    altKeys: ['total_calls', 'calls_made', 'calls'],
    format: (v) => (v != null ? Number(v).toLocaleString() : '0'),
    icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    accent: 'border-l-indigo-500 bg-indigo-50/50',
    iconBg: 'bg-indigo-100 text-indigo-600',
  },
  {
    label: 'Revenue',
    valueKey: 'revenue',
    altKeys: ['totalRevenue', 'total_revenue'],
    format: (v) => (typeof v === 'number' ? `₹${v.toLocaleString()}` : v ?? '₹0'),
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    accent: 'border-l-emerald-500 bg-emerald-50/50',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    label: 'Meetings',
    valueKey: 'meetings',
    altKeys: ['totalMeetings', 'total_meetings', 'scheduledMeetings'],
    format: (v) => (v != null ? Number(v).toLocaleString() : '0'),
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    accent: 'border-l-violet-500 bg-violet-50/50',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  {
    label: 'Active Campaigns',
    valueKey: 'activeCampaigns',
    altKeys: ['active_campaigns', 'campaigns', 'totalCampaigns'],
    format: (v) => (v != null ? Number(v).toLocaleString() : '0'),
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    accent: 'border-l-sky-500 bg-sky-50/50',
    iconBg: 'bg-sky-100 text-sky-600',
  },
  {
    label: 'Conversion Rate',
    valueKey: 'conversionRate',
    altKeys: ['conversion_rate'],
    format: (v) => (typeof v === 'number' ? `${v.toFixed(1)}%` : v ?? '0%'),
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    accent: 'border-l-amber-500 bg-amber-50/50',
    iconBg: 'bg-amber-100 text-amber-600',
  },
];

function getValue(s, config) {
  let v = s[config.valueKey];
  for (const k of config.altKeys || []) {
    if (v != null) break;
    v = s[k];
  }
  return v;
}

export default function StatsCards({ stats, loading, variant }) {
  const s = stats?.data ?? stats ?? {};
  const config = variant === 'agent' ? agentCardsConfig : cardsConfig;

  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${variant === 'agent' ? 'lg:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-5'} gap-4`}>
        {(variant === 'agent' ? [1, 2, 3] : [1, 2, 3, 4, 5]).map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm animate-pulse">
            <div className="flex items-start justify-between">
              <div className="h-11 w-11 rounded-xl bg-slate-200" />
              <div className="h-8 w-20 rounded-lg bg-slate-200" />
            </div>
            <div className="mt-4 h-4 w-28 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${variant === 'agent' ? 'lg:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-5'} gap-4`}>
      {config.map((card) => {
        const value = getValue(s, card);
        const display = card.format(value);
        return (
          <div
            key={card.label}
            className={`bg-white rounded-2xl border border-slate-200/80 border-l-4 ${card.accent} p-5 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`${iconWrap} ${card.iconBg}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
              <span className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">{display}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-500">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
