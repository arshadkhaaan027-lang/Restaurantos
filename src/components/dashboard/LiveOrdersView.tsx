import React, { useState } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ChefHat,
  Filter,
  Search,
  ArrowRight,
  Flame,
  Check,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/restaurant';
import {
  updateKitchenOrderStatus,
  deductInventoryForOrder,
} from '../../services/restaurantService';

interface LiveOrdersViewProps {
  orders: Order[];
  cafeId: string;
  currencySymbol?: string;
}

export const LiveOrdersView: React.FC<LiveOrdersViewProps> = ({
  orders,
  cafeId,
  currencySymbol = '₹',
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'active'
        ? order.status !== 'served' && order.status !== 'cancelled'
        : order.status === filterStatus;

    const matchesSearch = tableSearch
      ? order.table.toLowerCase().includes(tableSearch.toLowerCase()) ||
        String(order.ticketNumber).includes(tableSearch)
      : true;

    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (order: Order, nextStatus: OrderStatus) => {
    setActionLoadingId(order.id);
    try {
      await updateKitchenOrderStatus(cafeId, order.id, nextStatus);
      // If moving from received to preparing, deduct inventory automatically
      if (order.status === 'received' && nextStatus === 'preparing') {
        deductInventoryForOrder(cafeId, order);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500 animate-pulse',
          label: 'New (Needs Accept)',
        };
      case 'accepted':
        return {
          bg: 'bg-violet-50 text-violet-700 border-violet-200',
          dot: 'bg-violet-500 animate-pulse',
          label: 'Order Accepted',
        };
      case 'preparing':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Brewing & Prepping',
        };
      case 'woodfire':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          dot: 'bg-orange-500',
          label: 'Oven & Grill',
        };
      case 'ready':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500 animate-ping',
          label: 'Ready for Table',
        };
      case 'served':
        return {
          bg: 'bg-stone-100 text-stone-600 border-stone-200',
          dot: 'bg-stone-400',
          label: 'Served / Done',
        };
      case 'cancelled':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Cancelled',
        };
      default:
        return {
          bg: 'bg-stone-50 text-stone-700 border-stone-200',
          dot: 'bg-stone-400',
          label: status,
        };
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#e11d48]" />
            <span>Live Dining & QR Orders</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {orders.filter((o) => o.status !== 'served' && o.status !== 'cancelled').length} Active
            </span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-time Firestore stream connected to table QR scans
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Table Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter Table / Ticket #"
              className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48] focus:outline-hidden"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium text-stone-600">
            {['all', 'active', 'received', 'accepted', 'preparing', 'ready', 'served'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white text-stone-900 font-bold shadow-xs'
                    : 'hover:text-stone-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Grid / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <ChefHat className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800">No Orders in Queue</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
            Orders placed via the Customer QR menu will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const isProcessing = actionLoadingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-stone-300 transition-all"
              >
                {/* Order Top Bar */}
                <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200 shadow-xs">
                      #{order.ticketNumber}
                    </span>
                    <span className="font-bold text-xs text-[#e11d48] bg-rose-50 px-2 py-0.5 rounded-md">
                      {order.table}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                </div>

                {/* Items List */}
                <div className="p-4 space-y-2.5 flex-1">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between text-xs border-b border-stone-50 pb-2 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-stone-800 w-5 text-right">
                          {item.quantity}x
                        </span>
                        <div>
                          <span className="font-semibold text-stone-800">
                            {item.dish.name}
                          </span>
                          {(item.doneness || item.sauce) && (
                            <span className="block text-[10px] text-stone-400">
                              {[item.doneness, item.sauce].filter(Boolean).join(' · ')}
                            </span>
                          )}
                          {item.specialInstructions && (
                            <span className="block text-[10px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded mt-0.5">
                              Note: {item.specialInstructions}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="font-medium text-stone-600">
                        {currencySymbol}{item.dish.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bill Summary & Timing */}
                <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {order.customerPhone && (
                      <span className="text-stone-400 text-[10px]">
                        · {order.customerPhone}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-stone-900">
                    Total: {currencySymbol}{order.total}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 bg-white border-t border-stone-100 flex flex-col gap-2">
                  {order.status === 'received' && (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={isProcessing}
                        onClick={() => handleStatusChange(order, 'accepted')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Accept Order (Start 1m Steps)</span>
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleStatusChange(order, 'cancelled')}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Reject Order"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {order.status === 'accepted' && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-[11px] font-semibold text-violet-700 bg-violet-50 px-2.5 py-1.5 rounded-xl border border-violet-200">
                        ⏳ Accepted · Auto-preps in 1 min
                      </div>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleStatusChange(order, 'preparing')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        title="Skip wait and start prepping immediately"
                      >
                        Prep Now
                      </button>
                    </div>
                  )}

                  {order.status === 'preparing' && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-xl border border-blue-200">
                        ☕ Prepping · Auto-ready in 1 min
                      </div>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleStatusChange(order, 'ready')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        title="Skip wait and mark ready"
                      >
                        Ready Now
                      </button>
                    </div>
                  )}

                  {order.status === 'ready' && (
                    <div className="space-y-1">
                      <button
                        disabled={isProcessing}
                        onClick={() => handleStatusChange(order, 'served')}
                        className="w-full py-2 bg-stone-900 hover:bg-black active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Mark as Served (Deliver to {order.table})</span>
                      </button>
                      <span className="block text-[10px] text-center text-stone-400 font-medium">
                        Pauses at Ready until owner explicitly serves
                      </span>
                    </div>
                  )}

                  {order.status === 'served' && (
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 py-1">
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <Check className="w-3.5 h-3.5" />
                        Delivered to {order.table}
                      </span>
                      {order.stampAwarded && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                          👑 +1 Stamp Awarded
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
