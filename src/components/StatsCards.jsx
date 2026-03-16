const cardStyles = {
  totalCalls: 'bg-white border border-slate-200 rounded-xl p-5 shadow-sm',
  revenue: 'bg-white border border-slate-200 rounded-xl p-5 shadow-sm',
  conversion: 'bg-white border border-slate-200 rounded-xl p-5 shadow-sm',
  completed: 'bg-white border border-slate-200 rounded-xl p-5 shadow-sm',
};

const iconWrap = 'w-10 h-10 rounded-lg flex items-center justify-center';

export default function StatsCards({ stats, loading }) {
  const s = stats || {};
  const cards = [
    {
      label: 'Total Calls',
      value: s.totalCalls ?? s.total_calls ?? s.calls ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      iconBg: 'bg-indigo-100 text-indigo-600',
    },
    {
      label: 'Revenue',
      value: typeof (s.revenue ?? s.totalRevenue ?? s.total_revenue) === 'number'
        ? `₹${(s.revenue ?? s.totalRevenue ?? s.total_revenue).toLocaleString()}`
        : (s.revenue ?? s.totalRevenue ?? s.total_revenue) ?? '₹0',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Conversion Rate',
      value: typeof (s.conversionRate ?? s.conversion_rate) === 'number'
        ? `${(s.conversionRate ?? s.conversion_rate).toFixed(1)}%`
        : (s.conversionRate ?? s.conversion_rate) ?? '0%',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      iconBg: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Completed',
      value: s.completedCalls ?? s.completed_calls ?? s.completed ?? 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-slate-100 text-slate-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-slate-200" />
              <div className="h-8 w-16 rounded bg-slate-200" />
            </div>
            <div className="mt-3 h-4 w-24 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={cardStyles.totalCalls}>
          <div className="flex items-center justify-between">
            <div className={`${iconWrap} ${card.iconBg}`}>{card.icon}</div>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{card.value}</span>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-500">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
