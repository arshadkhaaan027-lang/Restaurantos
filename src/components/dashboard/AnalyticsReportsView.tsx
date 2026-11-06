import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  Percent,
  Clock,
} from 'lucide-react';
import { Order } from '../../types/restaurant';

interface AnalyticsReportsViewProps {
  orders: Order[];
  currencySymbol?: string;
}

export const AnalyticsReportsView: React.FC<AnalyticsReportsViewProps> = ({
  orders,
  currencySymbol = '₹',
}) => {
  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Ticket,Table,Items,Total,Status,Date\n' +
      orders
        .map(
          (o) =>
            `${o.ticketNumber},${o.table},${o.items.length},${o.total},${o.status},${new Date(
              o.createdAt
            ).toISOString()}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'RestaurantOS_Sales_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#e11d48]" />
            <span>Executive Analytics & Financial Reports</span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Turnover metrics, average spend per table, and sales breakdown
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-400 block mb-1">
            Average Order Value (AOV)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">
              {currencySymbol}1,420
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +8.2%
            </span>
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">vs last month</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-400 block mb-1">
            Table Turnover Time
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">
              42 min
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              -6 min
            </span>
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">optimized by QR order</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-400 block mb-1">
            Food Cost Ratio
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">
              28.4%
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Ideal &lt; 30%
            </span>
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">inventory cost health</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-400 block mb-1">
            QR Ordering Adoption
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">
              91.4%
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +14%
            </span>
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">tables order via mobile</span>
        </div>
      </div>

      {/* Hourly Dining Heatmap Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#e11d48]" />
          <span>Peak Kitchen & Dining Hours</span>
        </h2>

        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 text-center text-xs">
          {[
            { hour: '12 PM', load: 60 },
            { hour: '1 PM', load: 95 },
            { hour: '2 PM', load: 80 },
            { hour: '3 PM', load: 30 },
            { hour: '4 PM', load: 20 },
            { hour: '5 PM', load: 45 },
            { hour: '6 PM', load: 70 },
            { hour: '7 PM', load: 90 },
            { hour: '8 PM', load: 100 },
            { hour: '9 PM', load: 95 },
            { hour: '10 PM', load: 65 },
            { hour: '11 PM', load: 25 },
          ].map((h) => (
            <div key={h.hour} className="flex flex-col items-center gap-1.5">
              <div className="w-full h-24 bg-stone-100 rounded-lg overflow-hidden flex flex-col justify-end p-0.5">
                <div
                  className="w-full rounded-md transition-all"
                  style={{
                    height: `${h.load}%`,
                    backgroundColor: h.load > 85 ? '#e11d48' : h.load > 50 ? '#fb7185' : '#fed7aa',
                  }}
                />
              </div>
              <span className="text-[10px] text-stone-500 font-semibold">{h.hour}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
