import React, { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  ChefHat,
  Flame,
  BellRing,
  Droplets,
  Plus,
  Share2,
  ChevronDown,
  ChevronUp,
  Receipt,
  Sparkles,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/restaurant';

interface OrderStatusScreenProps {
  order: Order;
  onBackToMenu: () => void;
  onOrderMore: () => void;
  onUpdateStatus?: (newStatus: OrderStatus) => void;
}

const STEPS: { status: OrderStatus; label: string; desc: string; icon: React.ElementType }[] = [
  {
    status: 'received',
    label: 'Order Received',
    desc: 'Ticket sent to kitchen POS',
    icon: CheckCircle2,
  },
  {
    status: 'preparing',
    label: 'Chef Preparing',
    desc: 'Ingredients & cuts prepped',
    icon: ChefHat,
  },
  {
    status: 'woodfire',
    label: 'Woodfire & Searing',
    desc: 'Cooking over 450°C charcoal grill',
    icon: Flame,
  },
  {
    status: 'ready',
    label: 'Plating & Garnishing',
    desc: 'Final inspection & garnish',
    icon: Sparkles,
  },
  {
    status: 'served',
    label: 'Served to Table',
    desc: 'Delivered hot to your table',
    icon: UtensilsCrossed,
  },
];

export const OrderStatusScreen: React.FC<OrderStatusScreenProps> = ({
  order,
  onBackToMenu,
  onOrderMore,
  onUpdateStatus,
}) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status || 'received');
  const [minutesLeft, setMinutesLeft] = useState<number>(order.estimatedMinutes || 15);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [serviceCallToast, setServiceCallToast] = useState<string | null>(null);

  // Realistic simulation timer advancing status over time for dynamic demo
  useEffect(() => {
    const timer = setInterval(() => {
      setMinutesLeft((prev) => (prev > 1 ? prev - 1 : 1));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 0;
      case 'preparing':
        return 1;
      case 'woodfire':
        return 2;
      case 'ready':
        return 3;
      case 'served':
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  const handleAdvanceStatus = () => {
    const nextStatuses: OrderStatus[] = ['received', 'preparing', 'woodfire', 'ready', 'served'];
    const nextIdx = Math.min(activeIndex + 1, nextStatuses.length - 1);
    const next = nextStatuses[nextIdx];
    setCurrentStatus(next);
    if (onUpdateStatus) {
      onUpdateStatus(next);
    }
  };

  const handleCallServer = (type: 'server' | 'water' | 'bill') => {
    const message =
      type === 'server'
        ? `Server notified for ${order.table}`
        : type === 'water'
        ? `Water refill requested for ${order.table}`
        : `Bill checkout requested for ${order.table}`;
    setServiceCallToast(message);
    setTimeout(() => setServiceCallToast(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf7f2] relative overflow-hidden">
      {/* Pinned Top Navigation Bar */}
      <div className="bg-[#82181a] text-white pt-3 pb-4 px-5 rounded-b-[24px] shadow-md z-30 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBackToMenu}
            className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all cursor-pointer"
            title="Back to menu"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="text-center">
            <span className="font-serif text-base font-bold tracking-tight">Live Kitchen Ticket</span>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-amber-300 font-bold bg-black/30 px-2 py-0.2 rounded-full border border-amber-300/30">
                {order.table}
              </span>
              <span className="text-[10px] text-white/80 font-medium">Ticket #{order.ticketNumber}</span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-24 space-y-3.5">
        {/* Estimated Prep Hero Card */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-sm relative overflow-hidden text-center">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200/60 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Estimated Kitchen Time</span>
          </div>

          <div className="font-sans text-3xl font-extrabold text-stone-900 tabular-nums">
            ~{minutesLeft} <span className="text-base font-semibold text-stone-500">minutes</span>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-[270px] mx-auto leading-relaxed">
            Your dishes are being prepared fresh for <strong className="text-stone-900">{order.table}</strong>.
          </p>

          {/* WhatsApp Confirmation Chip if opted in */}
          {order.customerPhone && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Digital bill sent to WhatsApp ({order.customerPhone})</span>
            </div>
          )}
        </div>

        {/* Live Step Progression */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="font-serif text-sm font-bold text-stone-900">Preparation Progress</span>
            <button
              onClick={handleAdvanceStatus}
              className="text-[10px] font-bold text-[#82181a] bg-[#82181a]/10 hover:bg-[#82181a]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="Simulate kitchen advancing order"
            >
              Simulate Next Step ⚡
            </button>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-200">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div key={step.status} className="relative flex items-start gap-3">
                  {/* Step Marker Dot */}
                  <div
                    className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#82181a] text-white ring-4 ring-[#82181a]/20 shadow-sm scale-110'
                        : 'bg-stone-200 text-stone-400'
                    }`}
                  >
                    {isPast ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <StepIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                    )}
                  </div>

                  {/* Step Text Info */}
                  <div className="pl-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-[#82181a]'
                            : isPast
                            ? 'text-stone-900'
                            : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] bg-[#82181a] text-white px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider animate-pulse">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Table Server Call Actions */}
        <div className="bg-white rounded-3xl p-3.5 border border-stone-200/90 shadow-sm">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2.5 px-1">
            Table Assistance
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleCallServer('server')}
              className="bg-[#faf7f2] hover:bg-stone-100 active:scale-95 border border-stone-200/80 rounded-2xl p-2.5 flex flex-col items-center text-center transition-all cursor-pointer"
            >
              <BellRing className="w-4 h-4 text-[#82181a] mb-1" />
              <span className="text-[11px] font-bold text-stone-900">Call Server</span>
            </button>

            <button
              onClick={() => handleCallServer('water')}
              className="bg-[#faf7f2] hover:bg-stone-100 active:scale-95 border border-stone-200/80 rounded-2xl p-2.5 flex flex-col items-center text-center transition-all cursor-pointer"
            >
              <Droplets className="w-4 h-4 text-sky-600 mb-1" />
              <span className="text-[11px] font-bold text-stone-900">Water Refill</span>
            </button>

            <button
              onClick={onOrderMore}
              className="bg-[#faf7f2] hover:bg-stone-100 active:scale-95 border border-stone-200/80 rounded-2xl p-2.5 flex flex-col items-center text-center transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="text-[11px] font-bold text-stone-900">Add Dishes</span>
            </button>
          </div>
        </div>

        {/* Expandable Order Ticket Bill Receipt */}
        <div className="bg-white rounded-3xl p-4 border border-stone-200/90 shadow-sm">
          <button
            onClick={() => setIsReceiptOpen(!isReceiptOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#82181a]" />
              <span className="font-serif text-sm font-bold text-stone-900">
                Itemized Ticket Bill ({order.items.reduce((acc, i) => acc + i.quantity, 0)} items)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#82181a] font-sans tabular-nums">
                ₹{Math.round(order.total).toLocaleString('en-IN')}
              </span>
              {isReceiptOpen ? (
                <ChevronUp className="w-4 h-4 text-stone-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-400" />
              )}
            </div>
          </button>

          {isReceiptOpen && (
            <div className="mt-3 pt-3 border-t border-stone-100 space-y-2 text-xs animate-in fade-in duration-150">
              {order.items.map((item) => (
                <div key={item.dish.id} className="flex justify-between items-center text-stone-700">
                  <div className="min-w-0 pr-2">
                    <span className="font-medium">
                      {item.quantity}x {item.dish.name}
                    </span>
                    {item.doneness && (
                      <span className="block text-[10px] text-stone-400 font-sans">
                        {item.doneness} {item.sauce ? `· ${item.sauce}` : ''}
                      </span>
                    )}
                  </div>
                  <span className="font-bold font-sans tabular-nums text-stone-900 shrink-0">
                    ₹{(item.dish.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}

              <div className="pt-2 border-t border-dashed border-stone-200 space-y-1 text-[11px] text-stone-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-sans tabular-nums">
                    ₹{Math.round(order.subtotal).toLocaleString('en-IN')}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount ({order.couponCode})</span>
                    <span className="font-sans tabular-nums">
                      -₹{Math.round(order.discount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes & Kitchen Service (18%)</span>
                  <span className="font-sans tabular-nums">
                    ₹{Math.round(order.tax + order.service).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold text-stone-900 pt-1 border-t border-stone-100">
                  <span>Grand Total</span>
                  <span className="font-sans text-sm text-[#82181a] tabular-nums">
                    ₹{Math.round(order.total).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Service Notification Toast */}
      {serviceCallToast && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-150 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span>{serviceCallToast}</span>
        </div>
      )}

      {/* Sticky Bottom Actions */}
      <div className="absolute bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-4 py-3 shadow-lg">
        <button
          onClick={onOrderMore}
          className="w-full h-11 rounded-2xl bg-[#82181a] hover:bg-[#6c1214] active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add More Dishes for {order.table}</span>
        </button>
      </div>
    </div>
  );
};
