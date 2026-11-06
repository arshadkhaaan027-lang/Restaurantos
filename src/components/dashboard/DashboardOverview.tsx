import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  PackageCheck,
  Users,
  Star,
  ChevronDown,
  MoreHorizontal,
  ArrowUpRight,
  Sparkles,
  Percent,
} from 'lucide-react';
import { Order, Dish } from '../../types/restaurant';

interface DashboardOverviewProps {
  orders: Order[];
  dishes: Dish[];
  onNavigateToTab: (tab: any) => void;
  currencySymbol?: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  orders,
  dishes,
  onNavigateToTab,
  currencySymbol = '₹',
}) => {
  const [orderTypeTimeframe, setOrderTypeTimeframe] = useState<'Today' | 'Week' | 'Month'>('Today');

  // Compute live counts or use reference metrics
  const liveTotalOrders = orders.length > 0 ? 2360 + orders.length : 2367;
  const livePending = orders.filter((o) => o.status !== 'served' && o.status !== 'cancelled').length;
  const pendingOrdersDisplay = livePending > 0 ? livePending : 865;

  // Monthly Revenue Data (Jan - Dec) matching reference screenshot
  const monthlyRevenue = [
    { month: 'Jan', income: 72, expense: 50, tax: 65 },
    { month: 'Feb', income: 84, expense: 58, tax: 74 },
    { month: 'Mar', income: 68, expense: 48, tax: 60 },
    { month: 'Apr', income: 88, expense: 62, tax: 78 },
    { month: 'May', income: 70, expense: 52, tax: 66 },
    { month: 'Jun', income: 90, expense: 64, tax: 80 },
    { month: 'Jul', income: 82, expense: 56, tax: 72 },
    { month: 'Aug', income: 94, expense: 68, tax: 86 },
    { month: 'Sep', income: 76, expense: 54, tax: 70 },
    { month: 'Oct', income: 92, expense: 66, tax: 82 },
    { month: 'Nov', income: 86, expense: 60, tax: 76 },
    { month: 'Dec', income: 98, expense: 72, tax: 88 },
  ];

  // Weekly Spline Curve Data (Mon - Sun)
  const weeklyOrders = [
    { day: 'Mon', count: 180 },
    { day: 'Tue', count: 420 },
    { day: 'Wed', count: 280 },
    { day: 'Thu', count: 520 },
    { day: 'Fri', count: 680 },
    { day: 'Sat', count: 720 },
    { day: 'Sun', count: 640 },
  ];

  // Customer Analytics Column Data
  const customerBars = [
    { day: 'Mon', count: 520 },
    { day: 'Tue', count: 320 },
    { day: 'Wed', count: 280 },
    { day: 'Thu', count: 460 },
    { day: 'Fri', count: 310 },
    { day: 'Sat', count: 220 },
    { day: 'Sun', count: 680 },
  ];

  // Top Selling Items matching cafe favorites
  const topSellingItems = [
    {
      id: 'ts_1',
      name: 'Spanish Cortado Cream',
      rating: 5.0,
      price: 210,
      orders: 842,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'ts_2',
      name: 'Smashed Avocado Toast',
      rating: 5.0,
      price: 380,
      orders: 724,
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'ts_3',
      name: 'Burnt Basque Cheesecake',
      rating: 5.0,
      price: 290,
      orders: 618,
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&auto=format&fit=crop&q=80',
    },
  ];

  // Hot & Trending Menu with discount stickers matching cafe promos
  const trendingItems = [
    {
      id: 'tr_1',
      name: 'Hazelnut Cold Brew',
      discount: '12% OFF',
      discountColor: 'bg-amber-100 text-amber-800 border-amber-300',
      price: 240,
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'tr_2',
      name: 'Blueberry Ricotta Hotcakes',
      discount: '20% OFF',
      discountColor: 'bg-rose-100 text-rose-700 border-rose-300',
      price: 350,
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'tr_3',
      name: 'Smoked Chicken Panini',
      discount: '15% OFF',
      discountColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      price: 360,
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'tr_4',
      name: 'Uji Matcha Iced Latte',
      discount: '10% OFF',
      discountColor: 'bg-amber-100 text-amber-800 border-amber-300',
      price: 260,
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-time analytics and QR kitchen ordering stream
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('orders')}
            className="px-3 py-1.5 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Manage Orders</span>
          </button>
        </div>
      </div>

      {/* ROW 1: 4 Top KPI Cards + Top Selling on Left, Revenue Overview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side (7 Cols on LG): 4 Top Cards + Top Selling Cards */}
        <div className="lg:col-span-7 space-y-5">
          {/* 4 Top KPI Cards matching reference screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Total Orders */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-stone-400 block mb-1">
                  Total Orders
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-stone-900 tracking-tight">
                    {liveTotalOrders.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                    +4%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-[#e11d48]">
                <ShoppingCart className="w-6 h-6 stroke-[2]" />
              </div>
            </div>

            {/* Card 2: Revenue Today */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-stone-400 block mb-1">
                  Revenue Today
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-stone-900 tracking-tight">
                    {currencySymbol}12,736
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                    +3.4%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <DollarSign className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>

            {/* Card 3: Pending Deliveries / Orders */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-stone-400 block mb-1">
                  Pending Deliveries
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-stone-900 tracking-tight">
                    {pendingOrdersDisplay}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                    +2.1%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
                <PackageCheck className="w-6 h-6 stroke-[2]" />
              </div>
            </div>

            {/* Card 4: Total Customers */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-stone-400 block mb-1">
                  Total Customers
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-stone-900 tracking-tight">
                    6,352
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                    <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                    -1.4%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
            </div>
          </div>

          {/* Top Selling Section matching reference screenshot */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-stone-900">
                Top Selling
              </h2>
              <button
                onClick={() => onNavigateToTab('menu_management')}
                className="text-[11px] font-semibold text-[#e11d48] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Menu</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topSellingItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-50/70 p-2.5 rounded-xl border border-stone-100 flex flex-col group hover:shadow-xs hover:border-stone-200 transition-all cursor-pointer"
                  onClick={() => onNavigateToTab('menu_management')}
                >
                  <div className="relative aspect-4/3 rounded-lg overflow-hidden mb-2 bg-stone-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {currencySymbol}{item.price}
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-stone-800 line-clamp-1 group-hover:text-[#e11d48] transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium">
                      ({item.orders} sold)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side (5 Cols on LG): Revenue Overview Stacked Bar & Line Chart matching reference screenshot */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-stone-900">
              Revenue Overview
            </h2>
            <div className="flex items-center gap-1.5 text-stone-400">
              <span className="text-[11px] font-semibold text-stone-500">2026 Fiscal</span>
            </div>
          </div>

          {/* SVG Chart with Income Bars, Expense Bars, and Tax Line */}
          <div className="relative h-64 w-full">
            <svg
              className="w-full h-full"
              viewBox="0 0 460 220"
              preserveAspectRatio="none"
            >
              {/* Horizontal Grid lines */}
              {[0, 20, 40, 60, 80, 100].map((val) => {
                const y = 190 - (val / 100) * 160;
                return (
                  <g key={val}>
                    <line
                      x1="35"
                      y1={y}
                      x2="450"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="2,2"
                      strokeWidth="1"
                    />
                    <text
                      x="28"
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                      fontWeight="500"
                    >
                      {val === 0 ? '0K' : `${val}K`}
                    </text>
                  </g>
                );
              })}

              {/* Monthly Grouped Bars: Coral (Income) & Amber (Expenses) */}
              {monthlyRevenue.map((d, i) => {
                const xBase = 50 + i * 33;
                const incomeH = (d.income / 100) * 160;
                const expenseH = (d.expense / 100) * 160;

                return (
                  <g key={d.month}>
                    {/* Income Bar (Coral) */}
                    <rect
                      x={xBase - 6}
                      y={190 - incomeH}
                      width="5.5"
                      height={incomeH}
                      rx="2.5"
                      fill="#f43f5e"
                    />
                    {/* Expense Bar (Amber) */}
                    <rect
                      x={xBase + 1}
                      y={190 - expenseH}
                      width="5.5"
                      height={expenseH}
                      rx="2.5"
                      fill="#f59e0b"
                    />
                    {/* Month Label */}
                    <text
                      x={xBase}
                      y="206"
                      textAnchor="middle"
                      fontSize="8.5"
                      fill="#64748b"
                      fontWeight="500"
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}

              {/* Tax Deduction Line across points matching red line in reference screenshot */}
              <polyline
                fill="none"
                stroke="#e11d48"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={monthlyRevenue
                  .map((d, i) => {
                    const x = 50 + i * 33;
                    const y = 190 - (d.tax / 100) * 160;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Markers for Tax line */}
              {monthlyRevenue.map((d, i) => {
                const x = 50 + i * 33;
                const y = 190 - (d.tax / 100) * 160;
                return (
                  <circle
                    key={`dot-${i}`}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#ffffff"
                    stroke="#e11d48"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>

          {/* Chart Legend matching reference screenshot */}
          <div className="flex items-center justify-center gap-5 pt-3 border-t border-stone-100 text-[10px] font-semibold text-stone-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></span>
              <span>Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
              <span>Expenses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]"></span>
              <span>Tax Deduction</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Orders Overview (Spline Area) + Order Types + Customer Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Orders Overview (6 Cols on LG): Curved Spline Area Chart */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-stone-900">
              Orders Overview
            </h2>
            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
              Weekly Trend
            </span>
          </div>

          <div className="relative h-56 w-full">
            <svg
              className="w-full h-full"
              viewBox="0 0 400 180"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 200, 400, 600, 800, 1000].map((val) => {
                const y = 160 - (val / 1000) * 140;
                return (
                  <g key={val}>
                    <line
                      x1="30"
                      y1={y}
                      x2="390"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="2,2"
                      strokeWidth="1"
                    />
                    <text
                      x="24"
                      y={y + 3}
                      textAnchor="end"
                      fontSize="8"
                      fill="#94a3b8"
                      fontWeight="500"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area under spline */}
              <path
                d="M 50 134.8 Q 105 101.2 160 120.8 T 270 64.8 T 375 70.4 L 375 160 L 50 160 Z"
                fill="url(#roseGradient)"
              />

              {/* Spline Path */}
              <path
                d="M 50 134.8 Q 105 101.2 160 120.8 T 270 64.8 T 375 70.4"
                fill="none"
                stroke="#e11d48"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Dots on points */}
              {weeklyOrders.map((d, i) => {
                const x = 50 + i * 54.1;
                const y = 160 - (d.count / 1000) * 140;
                return (
                  <g key={d.day}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#ffffff"
                      stroke="#e11d48"
                      strokeWidth="2.5"
                    />
                    <text
                      x={x}
                      y="174"
                      textAnchor="middle"
                      fontSize="9"
                      fill="#64748b"
                      fontWeight="500"
                    >
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Order Types (3 Cols on LG): 4 Categories matching reference screenshot */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-stone-900">
              Order Types
            </h2>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-lg cursor-pointer">
              <span>{orderTypeTimeframe}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </div>
          </div>

          <div className="space-y-3">
            {/* Dine-in Insights */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#e11d48] flex items-center justify-center font-bold text-xs">
                  🍽️
                </div>
                <div>
                  <span className="block text-xs font-bold text-stone-800">
                    Dine-in Insights
                  </span>
                  <span className="text-[10px] text-stone-400">530 orders</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#e11d48] flex items-center justify-center text-[10px] font-bold text-[#e11d48]">
                75%
              </div>
            </div>

            {/* Takeaway Orders */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  🛍️
                </div>
                <div>
                  <span className="block text-xs font-bold text-stone-800">
                    Takeaway Orders
                  </span>
                  <span className="text-[10px] text-stone-400">350 orders</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                62%
              </div>
            </div>

            {/* Online Orders */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                  📱
                </div>
                <div>
                  <span className="block text-xs font-bold text-stone-800">
                    Online Orders
                  </span>
                  <span className="text-[10px] text-stone-400">280 orders</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center text-[10px] font-bold text-amber-600">
                85%
              </div>
            </div>

            {/* Drive-Thru */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-xs">
                  🚗
                </div>
                <div>
                  <span className="block text-xs font-bold text-stone-800">
                    Drive-Thru
                  </span>
                  <span className="text-[10px] text-stone-400">190 orders</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-rose-400 flex items-center justify-center text-[10px] font-bold text-rose-500">
                55%
              </div>
            </div>
          </div>
        </div>

        {/* Customer Analytics (3 Cols on LG): Vertical Bar Chart matching reference screenshot */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-stone-900">
              Customer
            </h2>
            <button className="text-stone-400 hover:text-stone-700 p-1">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="relative h-56 w-full">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 180"
              preserveAspectRatio="none"
            >
              {/* Y Axis Grid lines */}
              {[0, 140, 280, 420, 560, 700].map((val) => {
                const y = 160 - (val / 700) * 140;
                return (
                  <g key={val}>
                    <line
                      x1="24"
                      y1={y}
                      x2="195"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="2,2"
                      strokeWidth="1"
                    />
                    <text
                      x="20"
                      y={y + 3}
                      textAnchor="end"
                      fontSize="7.5"
                      fill="#94a3b8"
                      fontWeight="500"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Bars matching the reference screenshot */}
              {customerBars.map((item, i) => {
                const x = 36 + i * 23;
                const barHeight = (item.count / 700) * 140;
                return (
                  <g key={item.day}>
                    <rect
                      x={x}
                      y={160 - barHeight}
                      width="9"
                      height={barHeight}
                      rx="3"
                      fill={i === 6 ? '#e11d48' : '#f87171'}
                    />
                    <text
                      x={x + 4.5}
                      y="174"
                      textAnchor="middle"
                      fontSize="8"
                      fill="#64748b"
                      fontWeight="500"
                    >
                      {item.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* ROW 3: Hot & Trending Menu with 4 Round Dishes & Discount Badges matching reference screenshot */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#e11d48]" />
            <h2 className="text-sm font-bold text-stone-900">
              Hot & Trending Menu
            </h2>
          </div>
          <button
            onClick={() => onNavigateToTab('offers')}
            className="text-[11px] font-semibold text-[#e11d48] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Manage Promos & Discounts</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trendingItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigateToTab('todays_special')}
              className="flex flex-col items-center text-center p-3 rounded-2xl bg-stone-50/60 border border-stone-100 hover:border-stone-200 hover:shadow-xs transition-all cursor-pointer group"
            >
              {/* Discount Badge */}
              <div className="w-full flex justify-start mb-2">
                <span
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${item.discountColor}`}
                >
                  {item.discount}
                </span>
              </div>

              {/* Round Plate Image matching reference screenshot */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden p-1 bg-white border border-stone-200/80 shadow-xs mb-3 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <h3 className="text-xs font-bold text-stone-800 line-clamp-1 group-hover:text-[#e11d48] transition-colors">
                {item.name}
              </h3>
              <span className="text-[11px] font-semibold text-stone-500 mt-0.5">
                {currencySymbol}{item.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
