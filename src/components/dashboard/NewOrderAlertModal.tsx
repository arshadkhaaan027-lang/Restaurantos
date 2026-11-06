import React, { useEffect, useRef } from 'react';
import {
  BellRing,
  ChefHat,
  XCircle,
  Clock,
  User,
  Crown,
  Sparkles,
  ArrowRight,
  Receipt,
  Check,
} from 'lucide-react';
import { Order } from '../../types/restaurant';

interface NewOrderAlertModalProps {
  pendingOrders: Order[];
  onAcceptOrder: (order: Order) => void;
  onRejectOrder: (order: Order) => void;
  onViewInOrders: () => void;
  currencySymbol?: string;
}

// Audio chime generator using Web Audio API (zero external assets needed)
function playNewOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Pleasant 3-note ascending chime
    playTone(523.25, now, 0.25); // C5
    playTone(659.25, now + 0.15, 0.25); // E5
    playTone(783.99, now + 0.3, 0.4); // G5
    playTone(1046.5, now + 0.45, 0.6); // C6
  } catch {
    // Audio context may be blocked by browser until user gesture
  }
}

export const NewOrderAlertModal: React.FC<NewOrderAlertModalProps> = ({
  pendingOrders,
  onAcceptOrder,
  onRejectOrder,
  onViewInOrders,
  currencySymbol = '₹',
}) => {
  const lastPlayedOrderId = useRef<string | null>(null);

  // Focus on the first pending order
  const currentOrder = pendingOrders[0];

  useEffect(() => {
    if (currentOrder && currentOrder.id !== lastPlayedOrderId.current) {
      lastPlayedOrderId.current = currentOrder.id;
      playNewOrderChime();
    }
  }, [currentOrder]);

  if (!currentOrder) return null;

  const totalItemsCount = currentOrder.items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const isMember = Boolean(
    currentOrder.isMember ||
    (currentOrder.customerPhone && currentOrder.customerPhone.trim().length >= 10) ||
    currentOrder.customerEmail ||
    currentOrder.customerId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-[#e11d48] animate-in zoom-in-95 duration-200">
        {/* Animated Top Header */}
        <div className="bg-gradient-to-r from-rose-900 via-[#82181a] to-[#e11d48] p-5 text-white relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 animate-bounce">
                <BellRing className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                    Live Table Order Alert
                  </span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  New Order Needs Acceptance
                </h2>
              </div>
            </div>

            {pendingOrders.length > 1 && (
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full border border-white/30">
                1 of {pendingOrders.length} Pending
              </span>
            )}
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Table & Ticket Meta Box */}
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
                Table Destination
              </span>
              <span className="text-lg font-black text-stone-900">
                {currentOrder.table}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-stone-400 block tracking-wider">
                Ticket Number
              </span>
              <span className="text-base font-bold font-mono text-[#e11d48] bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                #{currentOrder.ticketNumber}
              </span>
            </div>
          </div>

          {/* Customer & Loyalty Membership Identity */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between ${
              isMember
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : 'bg-stone-50 border-stone-200 text-stone-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isMember
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {isMember ? (
                  <Crown className="w-4 h-4 fill-white" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">
                    {isMember ? 'Loyalty Rewards Member' : 'Guest Customer'}
                  </span>
                  {isMember && (
                    <span className="text-[9px] font-bold bg-amber-200/90 text-amber-900 px-1.5 py-0.2 rounded-md">
                      +1 Stamp on Serve
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-500 block">
                  {currentOrder.customerPhone
                    ? `WhatsApp: ${currentOrder.customerPhone}`
                    : currentOrder.customerEmail
                    ? `Email: ${currentOrder.customerEmail}`
                    : 'Direct Table QR Scan (No contact given)'}
                </span>
              </div>
            </div>

            <div className="text-right text-[11px] text-stone-400 font-medium">
              <Clock className="w-3.5 h-3.5 inline mr-1 text-stone-400" />
              <span>Just now</span>
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-stone-100 text-xs font-bold text-stone-700">
              <span>Ordered Items ({totalItemsCount})</span>
              <span>Price</span>
            </div>

            <div className="divide-y divide-stone-100">
              {currentOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="py-2 flex items-start justify-between text-xs"
                >
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">
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
                        <span className="block text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded mt-0.5">
                          Note: {item.specialInstructions}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold font-sans text-stone-800">
                    {currencySymbol}{item.dish.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {currentOrder.kitchenNotes && (
              <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800 mt-2">
                <strong className="font-bold">Kitchen Instructions: </strong>
                <span>{currentOrder.kitchenNotes}</span>
              </div>
            )}
          </div>

          {/* Bill Calculation Total */}
          <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80 flex items-center justify-between text-xs">
            <span className="font-medium text-stone-600">Total Payable Bill</span>
            <span className="text-xl font-black text-[#82181a] font-sans">
              {currencySymbol}{Math.round(currentOrder.total).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-5 bg-stone-50 border-t border-stone-200/80 flex flex-col sm:flex-row items-center gap-3">
          {/* Prominent ACCEPT ORDER button */}
          <button
            onClick={() => onAcceptOrder(currentOrder)}
            className="w-full sm:flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <ChefHat className="w-5 h-5" />
            <span>Accept Order (Start 1-Min Steps)</span>
          </button>

          {/* Reject / Dismiss Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onRejectOrder(currentOrder)}
              className="flex-1 sm:flex-none h-12 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title="Reject or cancel this order"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>

            <button
              onClick={onViewInOrders}
              className="flex-1 sm:flex-none h-12 px-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              View in Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
