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
  ChevronDown,
  ChevronUp,
  Receipt,
  Sparkles,
  ArrowLeft,
  Check,
  Crown,
  Award,
  Coffee,
  HeartHandshake,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/restaurant';
import { checkAndAdvanceOrderSteps } from '../services/restaurantService';

interface OrderStatusScreenProps {
  order: Order;
  onBackToMenu: () => void;
  onOrderMore: () => void;
  onUpdateStatus?: (newStatus: OrderStatus) => void;
  onNavigateToRewards?: () => void;
}

const STEPS: { status: OrderStatus; label: string; desc: string; icon: React.ElementType }[] = [
  {
    status: 'received',
    label: 'Order Placed',
    desc: 'Ticket sent to cafe kitchen',
    icon: CheckCircle2,
  },
  {
    status: 'accepted',
    label: 'Order Accepted',
    desc: 'Owner accepted! Prepping begins in 1 min',
    icon: ChefHat,
  },
  {
    status: 'preparing',
    label: 'Brewing & Prepping',
    desc: 'Barista & chef are preparing your order fresh',
    icon: Sparkles,
  },
  {
    status: 'ready',
    label: 'Ready for Service',
    desc: 'Plated & awaiting server delivery to your table',
    icon: UtensilsCrossed,
  },
  {
    status: 'served',
    label: 'Served to Table',
    desc: 'Delivered hot to your table. Enjoy your meal!',
    icon: CheckCircle2,
  },
];

export const OrderStatusScreen: React.FC<OrderStatusScreenProps> = ({
  order,
  onBackToMenu,
  onOrderMore,
  onUpdateStatus,
  onNavigateToRewards,
}) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status || 'received');
  const [minutesLeft, setMinutesLeft] = useState<number>(order.estimatedMinutes || 12);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [serviceCallToast, setServiceCallToast] = useState<string | null>(null);
  const [secondsRemainingInStep, setSecondsRemainingInStep] = useState<number | null>(null);

  // Sync with live Firestore order updates
  useEffect(() => {
    if (order.status) {
      setCurrentStatus(order.status);
    }
  }, [order.status]);

  // 1-minute step timer tracking & auto-advancement:
  // 'accepted' -> 60s -> 'preparing' -> 60s -> 'ready' -> STOPS!
  // 'ready' NEVER auto-advances until owner marks 'served'.
  useEffect(() => {
    const cafeId = order.cafeId || 'cafe_grand_bistro';

    const timer = setInterval(() => {
      const now = Date.now();
      const ONE_MINUTE_MS = 60 * 1000;

      if (currentStatus === 'accepted') {
        const startTime = order.acceptedAt || order.updatedAt || order.createdAt;
        const elapsed = now - startTime;
        const remaining = Math.max(0, Math.ceil((ONE_MINUTE_MS - elapsed) / 1000));
        setSecondsRemainingInStep(remaining);

        if (elapsed >= ONE_MINUTE_MS) {
          checkAndAdvanceOrderSteps(cafeId, order).catch((e) =>
            console.warn('Advance step:', e)
          );
        }
      } else if (currentStatus === 'preparing') {
        const startTime = order.preparingAt || order.updatedAt || order.createdAt;
        const elapsed = now - startTime;
        const remaining = Math.max(0, Math.ceil((ONE_MINUTE_MS - elapsed) / 1000));
        setSecondsRemainingInStep(remaining);

        if (elapsed >= ONE_MINUTE_MS) {
          checkAndAdvanceOrderSteps(cafeId, order).catch((e) =>
            console.warn('Advance step:', e)
          );
        }
      } else {
        setSecondsRemainingInStep(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStatus, order]);

  // General countdown for overall minutes left
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
      case 'accepted':
        return 1;
      case 'preparing':
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
    const nextStatuses: OrderStatus[] = ['received', 'accepted', 'preparing', 'ready', 'served'];
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

  const isMemberCustomer = Boolean(
    order.isMember ||
    (order.customerPhone && order.customerPhone.trim().length >= 10) ||
    order.customerEmail ||
    order.customerId
  );

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
            <span className="font-serif text-base font-bold tracking-tight">Live Table Order</span>
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
        {/* CURRENT STATUS HIGHLIGHT BANNER */}
        {currentStatus === 'received' && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-4 text-white shadow-md text-center animate-pulse">
            <div className="inline-flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Waiting for Cafe Acceptance</span>
            </div>
            <h3 className="text-lg font-bold">Order Received by Kitchen</h3>
            <p className="text-xs text-white/90 mt-1 max-w-[280px] mx-auto">
              Ticket #{order.ticketNumber} is sent. Waiting for owner to tap accept.
            </p>
          </div>
        )}

        {currentStatus === 'accepted' && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-4 text-white shadow-md text-center animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-1">
              <Check className="w-3.5 h-3.5 text-amber-300 stroke-[3]" />
              <span>Order Accepted by Kitchen</span>
            </div>
            <h3 className="text-lg font-bold">Owner Accepted Your Order!</h3>
            <p className="text-xs text-white/90 mt-1">
              Chef and barista are starting preparations in:
            </p>
            {secondsRemainingInStep !== null && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-black/25 px-3 py-1 rounded-full font-mono text-sm font-bold text-amber-300">
                <Clock className="w-4 h-4 animate-spin" />
                <span>{secondsRemainingInStep}s until brewing starts</span>
              </div>
            )}
          </div>
        )}

        {currentStatus === 'preparing' && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-4 text-white shadow-md text-center">
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-1">
              <Coffee className="w-3.5 h-3.5 text-amber-300" />
              <span>Brewing & Prepping</span>
            </div>
            <h3 className="text-lg font-bold">Barista & Kitchen Prepping</h3>
            <p className="text-xs text-white/90 mt-1">
              Fresh single-origin extraction & warm bakes underway.
            </p>
            {secondsRemainingInStep !== null && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-black/25 px-3 py-1 rounded-full font-mono text-sm font-bold text-amber-300">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Plating & ready in: {secondsRemainingInStep}s</span>
              </div>
            )}
          </div>
        )}

        {currentStatus === 'ready' && (
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 rounded-3xl p-4 text-white shadow-md text-center">
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ready for Table Service</span>
            </div>
            <h3 className="text-lg font-bold">Plated & Inspected at Counter</h3>
            <p className="text-xs text-white/90 mt-1 max-w-[280px] mx-auto">
              Your server is on their way to deliver the dishes to <strong className="underline">{order.table}</strong>.
            </p>
            <div className="mt-2.5 inline-block text-[11px] font-semibold bg-black/20 px-3 py-1 rounded-xl text-amber-200">
              ⚡ Paused at Ready until server marks served
            </div>
          </div>
        )}

        {/* SERVED HERO: SHOWS STAMP NOTIFICATION ONLY TO ENROLLED MEMBERS */}
        {currentStatus === 'served' && (
          <div className="space-y-3 animate-in zoom-in-95 duration-300">
            {order.stampAwarded || isMemberCustomer ? (
              /* Celebratory Stamp Awarded Notification for Enrolled Members */
              <div className="bg-gradient-to-br from-amber-500 via-[#82181a] to-rose-950 rounded-3xl p-5 text-white shadow-xl border-2 border-amber-300/60 relative overflow-hidden text-center">
                <div className="absolute top-2 right-3 text-amber-300/20 text-5xl font-black">
                  ★
                </div>

                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <Award className="w-7 h-7" />
                </div>

                <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-300/40 px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-amber-300 mb-1">
                  <Crown className="w-3.5 h-3.5 fill-amber-300" />
                  <span>Loyalty Stamp Credited!</span>
                </div>

                <h3 className="text-xl font-black tracking-tight text-white">
                  🎉 +1 Stamp Added to Your Card!
                </h3>

                <p className="text-xs text-amber-100/90 mt-1.5 leading-relaxed max-w-[290px] mx-auto">
                  Your order at <strong className="text-white">{order.table}</strong> has been served! Thank you for being a registered Rewards Member.
                </p>

                {/* 10-Slot Stamp Visual Strip */}
                <div className="bg-black/30 backdrop-blur-xs rounded-2xl p-3 mt-3.5 border border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-200 mb-2 px-1">
                    <span>Cafe Stamp Card</span>
                    <span>1 Stamp Collected</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((slot) => {
                      const isStamped = slot <= 1; // At least this newly earned stamp
                      return (
                        <div
                          key={slot}
                          className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                            isStamped
                              ? 'bg-amber-400 text-stone-950 font-bold shadow-md shadow-amber-400/30 ring-2 ring-white/50'
                              : 'bg-white/10 border border-white/20 text-white/40'
                          }`}
                        >
                          {isStamped ? (
                            <Coffee className="w-4 h-4 fill-stone-950" />
                          ) : (
                            <span className="text-[10px] font-mono">{slot}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {onNavigateToRewards && (
                  <button
                    onClick={onNavigateToRewards}
                    className="mt-3.5 w-full py-2 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    View Unlocked Rewards & Free Treats →
                  </button>
                )}
              </div>
            ) : (
              /* Non-Member Guest Order Served Message (NO Stamp Awarded) */
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  Order Served to Table!
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-[270px] mx-auto leading-relaxed">
                  Your dishes have been delivered hot to <strong className="text-stone-900">{order.table}</strong>. Enjoy your meal!
                </p>

                <div className="mt-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-left">
                  <div className="flex items-center gap-2 text-stone-800 text-xs font-bold mb-1">
                    <HeartHandshake className="w-4 h-4 text-[#82181a]" />
                    <span>Join Rewards on Next Visit</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    Enter your WhatsApp number or email during order checkout to collect stamps and unlock free specialty coffee.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Step Progression Card */}
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
                  <div className="pl-2 flex-1">
                    <div className="flex items-center justify-between">
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
                            Active
                          </span>
                        )}
                      </div>

                      {isCurrent && (step.status === 'accepted' || step.status === 'preparing') && (
                        <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {secondsRemainingInStep !== null ? `${secondsRemainingInStep}s` : '1 min'}
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
