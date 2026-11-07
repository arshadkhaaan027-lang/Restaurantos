import React, { useState, useMemo } from 'react';
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
  Calendar,
  UtensilsCrossed,
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
  const [orderTypeTimeframe, setOrderTypeTimeframe] = useState<'Today' | 'Week' | 'Month' | 'All Time'>('All Time');
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);

  // 1. REAL-TIME ORDERS & STATUS CALCULATIONS
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(
    (o) => o.status !== 'served' && o.status !== 'cancelled'
  ).length;

  // 2. REAL REVENUE CALCULATIONS
  const { todayRevenue, allTimeRevenue, todayOrdersCount, yesterdayRevenue } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    let todayRev = 0;
    let yesterdayRev = 0;
    let allRev = 0;
    let todayCount = 0;

    orders.forEach((o) => {
      const rev = Number(o.total) || 0;
      allRev += rev;

      const orderTime = o.createdAt
        ? typeof o.createdAt === 'string'
          ? new Date(o.createdAt).getTime()
          : Number(o.createdAt)
        : 0;

      if (orderTime >= todayStart) {
        todayRev += rev;
        todayCount += 1;
      } else if (orderTime >= yesterdayStart && orderTime < todayStart) {
        yesterdayRev += rev;
      }
    });

    return {
      todayRevenue: todayRev,
      allTimeRevenue: allRev,
      todayOrdersCount: todayCount,
      yesterdayRevenue: yesterdayRev,
    };
  }, [orders]);

  // Revenue trend percentage compared to yesterday
  const revenueTrendPercent = useMemo(() => {
    if (yesterdayRevenue === 0) {
      return todayRevenue > 0 ? '+100%' : '0%';
    }
    const diff = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
    const sign = diff >= 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)}%`;
  }, [todayRevenue, yesterdayRevenue]);

  // 3. REAL CUSTOMER ANALYTICS (Unique customers from orders)
  const totalUniqueCustomers = useMemo(() => {
    const customerIds = new Set<string>();
    orders.forEach((o) => {
      const key =
        o.customerPhone ||
        o.customerEmail ||
        o.customerId ||
        (o.table ? `table_${o.table}` : null);
      if (key) customerIds.add(key);
    });
    return customerIds.size;
  }, [orders]);

  // 4. REAL TOP SELLING ITEMS (Aggregated from real order line items)
  const topSellingItems = useMemo(() => {
    const salesMap = new Map<
      string,
      { dishId?: string; name: string; price: number; image: string; count: number }
    >();

    // Scan all orders and their items
    orders.forEach((ord) => {
      (ord.items || []).forEach((item) => {
        const dishObj = item.dish;
        const dishId = dishObj?.id || (item as any).dishId || 'unknown';
        const dishName = dishObj?.name || (item as any).name || 'Special Item';
        const dishPrice = dishObj?.price ?? (item as any).price ?? 0;
        const key = dishId || dishName;

        const existing = salesMap.get(key);
        if (existing) {
          existing.count += item.quantity || 1;
        } else {
          // Find matching dish from menu catalog for rich metadata if not on item.dish
          const matched =
            dishObj ||
            dishes.find(
              (d) => d.id === dishId || d.name.toLowerCase() === dishName.toLowerCase()
            );
          salesMap.set(key, {
            dishId,
            name: dishName,
            price: dishPrice,
            image:
              matched?.image ||
              'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=80',
            count: item.quantity || 1,
          });
        }
      });
    });

    const sorted = Array.from(salesMap.values()).sort((a, b) => b.count - a.count);

    if (sorted.length >= 3) {
      return sorted.slice(0, 3).map((item, idx) => ({
        id: item.dishId || `top_${idx}`,
        name: item.name,
        price: item.price,
        orders: item.count,
        rating: 5.0,
        image: item.image,
      }));
    }

    // Fallback: Populate from actual active menu dishes with actual live counts
    return dishes.slice(0, 3).map((d) => {
      const sold = salesMap.get(d.id)?.count || 0;
      return {
        id: d.id,
        name: d.name,
        price: d.price,
        orders: sold,
        rating: d.rating || 5.0,
        image: d.image,
      };
    });
  }, [orders, dishes]);

  // 5. REAL MONTHLY REVENUE (Jan - Dec from actual orders)
  const monthlyRevenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    const monthlyTotals = months.map((month, idx) => {
      let income = 0;
      orders.forEach((o) => {
        if (!o.createdAt) return;
        const d = new Date(o.createdAt);
        if (d.getMonth() === idx && d.getFullYear() === currentYear) {
          income += Number(o.total) || 0;
        }
      });
      // 40% estimated ingredient expense, 5% GST
      const expense = Math.round(income * 0.4);
      const tax = Math.round(income * 0.05);

      return {
        month,
        income,
        expense,
        tax,
      };
    });

    const maxIncome = Math.max(...monthlyTotals.map((m) => m.income), 1000);

    return {
      monthlyTotals,
      maxIncome,
    };
  }, [orders]);

  // 6. REAL WEEKLY ORDERS (Mon - Sun from actual orders)
  const weeklyOrdersData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    orders.forEach((o) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      const jsDay = d.getDay(); // 0 is Sun
      const dayIndex = jsDay === 0 ? 6 : jsDay - 1; // Mon=0..Sun=6
      counts[dayIndex] += 1;
    });

    const maxCount = Math.max(...counts, 5);
    const weeklyPoints = days.map((day, idx) => ({
      day,
      count: counts[idx],
    }));

    return {
      weeklyPoints,
      maxCount,
    };
  }, [orders]);

  // 7. REAL CUSTOMER ANALYTICS (Unique customers per day of week)
  const customerAnalyticsData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const daySets = [new Set<string>(), new Set<string>(), new Set<string>(), new Set<string>(), new Set<string>(), new Set<string>(), new Set<string>()];

    orders.forEach((o) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      const jsDay = d.getDay();
      const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
      const id = o.customerPhone || o.customerEmail || o.customerId || o.table || 'guest';
      daySets[dayIndex].add(id);
    });

    const counts = daySets.map((s) => s.size);
    const maxCount = Math.max(...counts, 5);

    return {
      bars: days.map((day, idx) => ({
        day,
        count: counts[idx],
      })),
      maxCount,
    };
  }, [orders]);

  // 8. REAL ORDER TYPES (Dine-in, Takeaway, Online QR, Counter)
  const orderTypesData = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
    const monthStart = todayStart - 30 * 24 * 60 * 60 * 1000;

    const filtered = orders.filter((o) => {
      if (orderTypeTimeframe === 'All Time') return true;
      if (!o.createdAt) return true;
      const time = new Date(o.createdAt).getTime();
      if (orderTypeTimeframe === 'Today') return time >= todayStart;
      if (orderTypeTimeframe === 'Week') return time >= weekStart;
      if (orderTypeTimeframe === 'Month') return time >= monthStart;
      return true;
    });

    const total = filtered.length || 1; // avoid division by zero
    let dineInCount = 0;
    let takeawayCount = 0;
    let onlineCount = 0;
    let counterCount = 0;

    filtered.forEach((o) => {
      const tbl = (o.table || '').toLowerCase();
      if (tbl.includes('takeaway') || tbl.includes('parcel') || tbl.includes('pickup')) {
        takeawayCount += 1;
      } else if (tbl.includes('counter') || tbl.includes('bar') || tbl.includes('express')) {
        counterCount += 1;
      } else if (o.customerPhone || o.customerEmail || (o.customerId && !o.customerId.startsWith('table_'))) {
        onlineCount += 1;
      } else {
        dineInCount += 1;
      }
    });

    return [
      {
        name: 'Dine-in Table',
        icon: '🍽️',
        count: dineInCount,
        percent: filtered.length > 0 ? Math.round((dineInCount / total) * 100) : 0,
        color: 'border-[#e11d48] text-[#e11d48] bg-rose-50',
      },
      {
        name: 'Takeaway / Parcel',
        icon: '🛍️',
        count: takeawayCount,
        percent: filtered.length > 0 ? Math.round((takeawayCount / total) * 100) : 0,
        color: 'border-emerald-500 text-emerald-600 bg-emerald-50',
      },
      {
        name: 'Online QR Members',
        icon: '📱',
        count: onlineCount,
        percent: filtered.length > 0 ? Math.round((onlineCount / total) * 100) : 0,
        color: 'border-amber-500 text-amber-600 bg-amber-50',
      },
      {
        name: 'Counter Express',
        icon: '☕',
        count: counterCount,
        percent: filtered.length > 0 ? Math.round((counterCount / total) * 100) : 0,
        color: 'border-sky-500 text-sky-600 bg-sky-50',
      },
    ];
  }, [orders, orderTypeTimeframe]);

  // 9. REAL HOT & TRENDING MENU (From actual cafe dishes catalog)
  const trendingItems = useMemo(() => {
    // Pick dishes that have specials or are bestsellers, or the first 4 cafe dishes
    const specials = dishes.filter((d) => d.isTodaysSpecial || d.isBestSeller);
    const candidates = specials.length >= 4 ? specials : [...specials, ...dishes.filter((d) => !specials.includes(d))];
    const sliced = candidates.slice(0, 4);

    return sliced.map((d, index) => {
      let discountText = 'SPECIAL';
      let discountColor = 'bg-amber-100 text-amber-800 border-amber-300';

      if (d.specialPrice && d.specialPrice < d.price) {
        const pct = Math.round(((d.price - d.specialPrice) / d.price) * 100);
        discountText = `${pct}% OFF`;
        discountColor = 'bg-rose-100 text-rose-700 border-rose-300';
      } else if (d.isTodaysSpecial) {
        discountText = "CHEF'S SPECIAL";
        discountColor = 'bg-rose-100 text-rose-700 border-rose-300';
      } else if (d.isBestSeller) {
        discountText = 'POPULAR';
        discountColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      } else if (index === 0) {
        discountText = 'FEATURED';
        discountColor = 'bg-amber-100 text-amber-800 border-amber-300';
      }

      return {
        id: d.id,
        name: d.name,
        price: d.specialPrice || d.price,
        discount: discountText,
        discountColor,
        image: d.image,
      };
    });
  }, [dishes]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-time live analytics connected directly to your cafe orders & menu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('orders')}
            className="px-3 py-1.5 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Manage Orders ({pendingOrdersCount} Active)</span>
          </button>
        </div>
      </div>

      {/* ROW 1: 4 Top KPI Cards + Top Selling on Left, Revenue Overview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side (7 Cols on LG): 4 Top Cards + Top Selling Cards */}
        <div className="lg:col-span-7 space-y-5">
          {/* 4 Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Total Orders (Real Count) */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-stone-400 block mb-1">
                  Total Orders
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-stone-900 tracking-tight">
                    {totalOrdersCount.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                    Live
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  {todayOrdersCount} placed today
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-[#e11d48]">
                <ShoppingCart className="w-6 h-6 stroke-[2]" />
              </div>
            </div>

            {/* Card 2: Revenue Today (Real Revenue) */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-stone-400 block mb-1">
                  Revenue Today
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-stone-900 tracking-tight">
                    {currencySymbol}{todayRevenue.toLocaleString()}
                  </span>
                  {todayRevenue > 0 && (
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                      <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                      {revenueTrendPercent}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  All-time: {currencySymbol}{allTimeRevenue.toLocaleString()}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <DollarSign className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>

            {/* Card 3: Pending Deliveries / Orders (Real Live Pending) */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-stone-400 block mb-1">
                  Pending Deliveries
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-stone-900 tracking-tight">
                    {pendingOrdersCount}
                  </span>
                  <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    pendingOrdersCount > 0 ? 'text-amber-700 bg-amber-50' : 'text-emerald-600 bg-emerald-50'
                  }`}>
                    {pendingOrdersCount > 0 ? 'In Kitchen' : 'All Clear'}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Requires server delivery
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
                <PackageCheck className="w-6 h-6 stroke-[2]" />
              </div>
            </div>

            {/* Card 4: Total Customers (Real Unique Customers) */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-stone-400 block mb-1">
                  Total Customers
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-stone-900 tracking-tight">
                    {totalUniqueCustomers.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    <Users className="w-2.5 h-2.5 mr-0.5" />
                    Verified
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Unique diners & pass holders
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
            </div>
          </div>

          {/* Top Selling Section (Derived directly from actual order items) */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-stone-900">
                  Top Selling Dishes
                </h2>
                <p className="text-[10px] text-stone-400">
                  Calculated from live order line items
                </p>
              </div>
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
                    <span className="text-[10px] text-stone-500 font-medium">
                      ({item.orders} sold)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side (5 Cols on LG): Revenue Overview Stacked Bar & Line Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Revenue Overview
              </h2>
              <p className="text-[10px] text-stone-400">
                Monthly income based on completed orders
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-stone-400">
              <span className="text-[11px] font-semibold text-stone-500">
                {new Date().getFullYear()} Fiscal
              </span>
            </div>
          </div>

          {/* SVG Chart with Real Income Bars, Expense Bars, and Tax Line */}
          <div className="relative h-64 w-full">
            <svg
              className="w-full h-full"
              viewBox="0 0 460 220"
              preserveAspectRatio="none"
            >
              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = 190 - ratio * 160;
                const val = Math.round(ratio * monthlyRevenueData.maxIncome);
                const displayVal = val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val;
                return (
                  <g key={ratio}>
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
                      {displayVal}
                    </text>
                  </g>
                );
              })}

              {/* Monthly Grouped Bars: Coral (Income) & Amber (Expenses) */}
              {monthlyRevenueData.monthlyTotals.map((d, i) => {
                const xBase = 50 + i * 33;
                const ratio = monthlyRevenueData.maxIncome > 0 ? d.income / monthlyRevenueData.maxIncome : 0;
                const expRatio = monthlyRevenueData.maxIncome > 0 ? d.expense / monthlyRevenueData.maxIncome : 0;
                const incomeH = Math.max(ratio * 160, d.income > 0 ? 4 : 1.5);
                const expenseH = Math.max(expRatio * 160, d.expense > 0 ? 3 : 1.5);

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

              {/* Tax Deduction Line across points */}
              <polyline
                fill="none"
                stroke="#e11d48"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={monthlyRevenueData.monthlyTotals
                  .map((d, i) => {
                    const x = 50 + i * 33;
                    const taxRatio = monthlyRevenueData.maxIncome > 0 ? d.tax / monthlyRevenueData.maxIncome : 0;
                    const y = 190 - Math.max(taxRatio * 160, 2);
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />

              {/* Markers for Tax line */}
              {monthlyRevenueData.monthlyTotals.map((d, i) => {
                const x = 50 + i * 33;
                const taxRatio = monthlyRevenueData.maxIncome > 0 ? d.tax / monthlyRevenueData.maxIncome : 0;
                const y = 190 - Math.max(taxRatio * 160, 2);
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

          {/* Chart Legend */}
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
              <span>Tax (5% GST)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Orders Overview (Spline Area) + Order Types + Customer Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Orders Overview (6 Cols on LG): Curved Spline Area Chart */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Orders Overview
              </h2>
              <p className="text-[10px] text-stone-400">
                Daily order volume (Mon - Sun)
              </p>
            </div>
            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
              Weekly Distribution
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
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = 160 - ratio * 140;
                const val = Math.round(ratio * weeklyOrdersData.maxCount);
                return (
                  <g key={ratio}>
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

              {/* Dynamic Path Points */}
              {(() => {
                const points = weeklyOrdersData.weeklyPoints.map((d, i) => {
                  const x = 50 + i * 54.1;
                  const ratio = weeklyOrdersData.maxCount > 0 ? d.count / weeklyOrdersData.maxCount : 0;
                  const y = 160 - ratio * 140;
                  return { x, y };
                });

                // Generate SVG path string with curve
                let pathD = `M ${points[0].x} ${points[0].y}`;
                for (let i = 0; i < points.length - 1; i++) {
                  const xc = (points[i].x + points[i + 1].x) / 2;
                  const yc = (points[i].y + points[i + 1].y) / 2;
                  pathD += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
                }
                const last = points[points.length - 1];
                pathD += ` T ${last.x} ${last.y}`;

                const areaD = `${pathD} L ${last.x} 160 L ${points[0].x} 160 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#roseGradient)" />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </>
                );
              })()}

              {/* Dots on points */}
              {weeklyOrdersData.weeklyPoints.map((d, i) => {
                const x = 50 + i * 54.1;
                const ratio = weeklyOrdersData.maxCount > 0 ? d.count / weeklyOrdersData.maxCount : 0;
                const y = 160 - ratio * 140;
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

        {/* Order Types (3 Cols on LG): 4 Categories based on real order types */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 relative">
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Order Types
              </h2>
              <p className="text-[10px] text-stone-400">
                Real order breakdown
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
                className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-50 hover:bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-lg cursor-pointer"
              >
                <span>{orderTypeTimeframe}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {showTimeframeDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-20 py-1 min-w-[100px]">
                  {(['Today', 'Week', 'Month', 'All Time'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => {
                        setOrderTypeTimeframe(tf);
                        setShowTimeframeDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                        orderTypeTimeframe === tf
                          ? 'bg-rose-50 text-[#e11d48] font-bold'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {orderTypesData.map((type) => (
              <div
                key={type.name}
                className="flex items-center justify-between p-2 rounded-xl bg-stone-50/70"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${type.color.split(' ')[2]}`}>
                    {type.icon}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-stone-800">
                      {type.name}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {type.count} orders
                    </span>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${type.color.split(' ')[0]} ${type.color.split(' ')[1]}`}>
                  {type.percent}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Analytics (3 Cols on LG): Real Daily Diners */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Customer Footfall
              </h2>
              <p className="text-[10px] text-stone-400">
                Unique diners per day
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('customers')}
              className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              title="View Customers"
            >
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
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = 160 - ratio * 140;
                const val = Math.round(ratio * customerAnalyticsData.maxCount);
                return (
                  <g key={ratio}>
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

              {/* Vertical Bars */}
              {customerAnalyticsData.bars.map((item, i) => {
                const x = 36 + i * 23;
                const ratio = customerAnalyticsData.maxCount > 0 ? item.count / customerAnalyticsData.maxCount : 0;
                const barHeight = Math.max(ratio * 140, item.count > 0 ? 5 : 2);
                return (
                  <g key={item.day}>
                    <rect
                      x={x}
                      y={160 - barHeight}
                      width="9"
                      height={barHeight}
                      rx="3"
                      fill={i === 6 ? '#e11d48' : item.count > 0 ? '#f43f5e' : '#e2e8f0'}
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

      {/* ROW 3: Hot & Trending Menu from Real Cafe Menu */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#e11d48]" />
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Hot & Trending Menu
              </h2>
              <p className="text-[10px] text-stone-400">
                Live dishes featured on customer QR menu
              </p>
            </div>
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

              {/* Round Plate Image */}
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
