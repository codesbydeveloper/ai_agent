import { useEffect, useState } from 'react';
import { getDashboardStats, getRevenue } from '../services/dashboardService';
import RevenueChart from '../components/charts/RevenueChart';
import CallsChart from '../components/charts/CallsChart';
import ConversionChart from '../components/charts/ConversionChart';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getDashboardStats(), getRevenue()])
      .then(([statsRes, revenueData]) => {
        if (cancelled) return;
        setStats(statsRes?.data ?? statsRes);
        setRevenue(revenueData);
      })
      .catch(() => { if (!cancelled) setStats({}); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  let revenueSeries = [];
  if (Array.isArray(revenue)) revenueSeries = revenue;
  else if (revenue != null && typeof revenue === 'object') {
    const transactions = revenue?.recent_transactions ?? revenue?.transactions;
    if (Array.isArray(transactions) && transactions.length) {
      revenueSeries = transactions.map((tx, i) => ({
        label: tx.reference ?? tx.id?.toString() ?? `#${i + 1}`,
        value: Number(tx.amount) || 0,
      }));
    } else {
      const arr = revenue?.data ?? revenue?.series ?? revenue?.revenue;
      if (Array.isArray(arr)) revenueSeries = arr;
    }
  }
  if (revenueSeries.length === 0 && stats != null && typeof (stats.revenue ?? stats.total_revenue) === 'number') {
    revenueSeries = [{ name: 'Total', revenue: stats.revenue ?? stats.total_revenue }];
  }

  const callsSeries = Array.isArray(stats?.callsByPeriod) ? stats.callsByPeriod : (stats?.calls_by_period ?? []);
  let callsChartData = callsSeries.length ? callsSeries : [];
  if (callsChartData.length === 0 && stats != null && typeof (stats.calls_made ?? stats.total_calls) === 'number') {
    callsChartData = [{ name: 'Total', calls: stats.calls_made ?? stats.total_calls }];
  }

  const conversionSeries = Array.isArray(stats?.conversionByPeriod) ? stats.conversionByPeriod : (stats?.conversion_by_period ?? []);
  const singleConversion = stats && (stats.conversionRate != null || stats.conversion_rate != null);
  const conversionChartData = conversionSeries.length ? conversionSeries : (singleConversion ? [{ label: 'Rate', value: stats.conversionRate ?? stats.conversion_rate }] : []);

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Revenue, conversion, and call performance. Read-only.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={revenueSeries} loading={loading} title="Revenue" />
        <CallsChart data={callsChartData} loading={loading} title="Call performance" />
        <ConversionChart data={conversionChartData} loading={loading} title="Conversion rate" />
      </div>
    </div>
  );
}
