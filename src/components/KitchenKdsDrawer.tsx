import React, { useState, useEffect } from 'react';
import {
  X,
  ChefHat,
  Flame,
  CheckCircle2,
  Sparkles,
  UtensilsCrossed,
  Ban,
  Clock,
  Award,
  Filter,
  Check,
  Phone,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/restaurant';
import {
  listenToCafeOrders,
  updateKitchenOrderStatus,
  SUPPORTED_CAFES,
} from '../services/restaurantService';

interface KitchenKdsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cafeId: string;
}

export const KitchenKdsDrawer: React.FC<KitchenKdsDrawerProps> = ({
  isOpen,
  onClose,
  cafeId,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Authorized staff passcode gate (default unlocked for demo management)
  const [isStaffAuthorized, setIsStaffAuthorized] = useState<boolean>(true);

  const activeCafe =
    SUPPORTED_CAFES.find((c) => c.id === cafeId) || SUPPORTED_CAFES[0];

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = listenToCafeOrders(cafeId, (fetched) => {
      setOrders(fetched);
    });
    return () => unsubscribe();
  }, [isOpen, cafeId]);

  if (!isOpen) return null;

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setIsProcessing(orderId);
    setActionFeedback(null);
    try {
      await updateKitchenOrderStatus(cafeId, orderId, newStatus);
      setActionFeedback(`Order #${orderId.slice(-4)} updated to ${newStatus}`);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: any) {
      setActionFeedback('Failed to update status. Check permissions.');
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatusFilter === 'all') return true;
    if (selectedStatusFilter === 'active')
      return o.status !== 'served' && o.status !== 'cancelled';
    return o.status === selectedStatusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#1c1917] text-white rounded-3xl max-w-4xl w-full h-[90vh] border border-stone-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-stone-900 px-6 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#82181a] flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold">
                  Kitchen Display System (KDS)
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Live Orders
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {activeCafe.name} · Real-time order dispatch & automatic loyalty stamps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar & Action Toast */}
        <div className="bg-stone-900/60 px-6 py-2.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-400 font-semibold mr-1">Filter:</span>
            {['all', 'active', 'received', 'preparing', 'woodfire', 'ready', 'served'].map(
              (filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setSelectedStatusFilter(filterKey)}
                  className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                    selectedStatusFilter === filterKey
                      ? 'bg-[#82181a] text-white shadow-xs'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  {filterKey}
                </button>
              )
            )}
          </div>

          {actionFeedback && (
            <span className="text-xs font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-lg animate-in fade-in">
              {actionFeedback}
            </span>
          )}
        </div>

        {/* Orders Queue Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-stone-500 space-y-2">
              <ChefHat className="w-12 h-12 mx-auto stroke-[1.5] text-stone-600" />
              <p className="font-serif text-lg text-stone-400">No Orders in this Status Queue</p>
              <p className="text-xs max-w-sm mx-auto">
                Table QR orders submitted from the mobile interface appear here immediately via Firestore listeners.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => {
                const isProcessingThis = isProcessing === order.id;

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      order.status === 'received'
                        ? 'bg-amber-950/30 border-amber-600/70 shadow-lg ring-1 ring-amber-500/40'
                        : order.status === 'preparing'
                        ? 'bg-blue-950/20 border-blue-600/60'
                        : order.status === 'ready'
                        ? 'bg-emerald-950/30 border-emerald-600/70'
                        : order.status === 'cancelled'
                        ? 'bg-stone-900 border-red-900/60 opacity-60'
                        : 'bg-stone-900/80 border-stone-800'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-sm font-bold text-amber-300">
                              #{order.ticketNumber}
                            </span>
                            <span className="text-[10px] font-bold uppercase bg-white/10 px-2 py-0.5 rounded text-stone-200">
                              {order.table}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Current Status Badge */}
                        <div className="text-right">
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                              order.status === 'received'
                                ? 'bg-amber-500 text-stone-950 font-extrabold animate-pulse'
                                : order.status === 'preparing'
                                ? 'bg-blue-500 text-white'
                                : order.status === 'ready'
                                ? 'bg-emerald-500 text-stone-950 font-bold'
                                : order.status === 'served'
                                ? 'bg-stone-700 text-stone-300'
                                : 'bg-red-900 text-red-200'
                            }`}
                          >
                            {order.status}
                          </span>
                          {order.stampAwarded && (
                            <span className="block text-[9px] text-amber-300 font-semibold mt-0.5 flex items-center justify-end gap-0.5">
                              <Award className="w-2.5 h-2.5 text-amber-400" />
                              <span>Stamp Issued</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Customer Info */}
                      {order.customerPhone && (
                        <div className="text-[11px] text-stone-400 flex items-center gap-1 mb-2 bg-black/20 p-1.5 rounded-lg">
                          <Phone className="w-3 h-3 text-stone-500" />
                          <span>Guest: {order.customerPhone}</span>
                        </div>
                      )}

                      {/* Items List */}
                      <div className="space-y-1.5 py-1">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between text-xs"
                          >
                            <span className="font-semibold text-stone-200">
                              <span className="text-amber-400 font-mono font-bold mr-1.5">
                                {item.quantity}×
                              </span>
                              {item.dish.name}
                              {(item.doneness || item.sauce) && (
                                <span className="block text-[10px] text-stone-400 ml-5 font-normal">
                                  {[item.doneness, item.sauce].filter(Boolean).join(' • ')}
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-stone-400 tabular-nums">
                              ₹{item.dish.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.kitchenNotes && (
                        <div className="mt-2 p-2 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-200">
                          <span className="font-bold text-amber-400">Notes: </span>
                          {order.kitchenNotes}
                        </div>
                      )}
                    </div>

                    {/* Action Controls & Total */}
                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-400">Total Bill:</span>
                        <span className="font-mono font-bold text-sm text-white">
                          ₹{order.total}
                        </span>
                      </div>

                      {/* Status Transition Action Buttons */}
                      <div className="grid grid-cols-2 gap-1.5">
                        {order.status === 'received' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'preparing')}
                            disabled={isProcessingThis}
                            className="col-span-2 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Accept Order (+ Award Stamp)</span>
                          </button>
                        )}

                        {order.status === 'preparing' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(order.id, 'woodfire')}
                              disabled={isProcessingThis}
                              className="py-1.5 rounded-lg bg-orange-700 hover:bg-orange-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Flame className="w-3 h-3" />
                              <span>Woodfire Grill</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id, 'ready')}
                              disabled={isProcessingThis}
                              className="py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Mark Ready</span>
                            </button>
                          </>
                        )}

                        {order.status === 'woodfire' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'ready')}
                            disabled={isProcessingThis}
                            className="col-span-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Ready for Plating</span>
                          </button>
                        )}

                        {order.status === 'ready' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'served')}
                            disabled={isProcessingThis}
                            className="col-span-2 py-2 rounded-xl bg-[#82181a] hover:bg-[#6c1214] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5" />
                            <span>Served to Table</span>
                          </button>
                        )}

                        {order.status !== 'served' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'cancelled')}
                            disabled={isProcessingThis}
                            className="col-span-2 py-1 rounded-lg bg-stone-800 hover:bg-red-950/70 text-stone-400 hover:text-red-400 text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Cancel Order (Reverse Stamp)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
