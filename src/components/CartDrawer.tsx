import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  Sparkles,
  Receipt,
  Check,
  Tag,
  Phone,
  MessageCircle,
  Percent,
} from 'lucide-react';
import { CartItem, Order, Coupon } from '../types/restaurant';
import { AVAILABLE_COUPONS } from '../data/menuData';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (dishId: string, delta: number) => void;
  onRemoveItem: (dishId: string) => void;
  onClearCart: () => void;
  currentTable: string;
  onOrderConfirmed?: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentTable,
  onOrderConfirmed,
}) => {
  const [kitchenNotes, setKitchenNotes] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [whatsappOptIn, setWhatsappOptIn] = useState<boolean>(true);
  const [joinClub, setJoinClub] = useState<boolean>(true);

  // Coupon state
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Load saved phone number if customer previously used it
  useEffect(() => {
    const savedPhone = localStorage.getItem('restaurantos_customer_phone');
    if (savedPhone) {
      setWhatsappNumber(savedPhone);
    }
  }, []);

  if (!isOpen) return null;

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.dish.price * item.quantity,
    0
  );

  // Calculate discount if coupon applied
  let discountAmount = 0;
  if (appliedCoupon) {
    if (subtotal >= appliedCoupon.minOrder) {
      if (appliedCoupon.discountType === 'percentage') {
        discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      } else {
        discountAmount = appliedCoupon.discountValue;
      }
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = discountedSubtotal * 0.08;
  const service = discountedSubtotal * 0.1;
  const total = discountedSubtotal + tax + service;

  const handleApplyCoupon = (couponCode: string) => {
    setCouponError(null);
    setCouponSuccess(null);
    const code = couponCode.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code === code);

    if (!found) {
      setCouponError('Invalid coupon code. Try TASTE100 or WELCOME50.');
      return;
    }

    if (subtotal < found.minOrder) {
      setCouponError(`Min. order of ₹${found.minOrder} required for ${found.code}.`);
      return;
    }

    setAppliedCoupon(found);
    setCouponInput('');
    setCouponSuccess(`Coupon ${found.code} applied! Saved ₹${found.discountType === 'percentage' ? Math.round((subtotal * found.discountValue) / 100) : found.discountValue}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
  };

  const handleSendOrder = () => {
    // Save phone number if entered
    if (whatsappNumber.trim()) {
      localStorage.setItem('restaurantos_customer_phone', whatsappNumber.trim());
      if (joinClub) {
        localStorage.setItem('restaurantos_club_member', 'true');
      }
    }

    // Build Order object
    const ticketNum = Math.floor(100 + Math.random() * 900);
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      ticketNumber: ticketNum,
      table: currentTable,
      items: [...cartItems],
      subtotal,
      tax,
      service,
      discount: discountAmount,
      couponCode: appliedCoupon?.code,
      total,
      status: 'received',
      createdAt: Date.now(),
      estimatedMinutes: 14 + cartItems.length * 2,
      kitchenNotes: kitchenNotes.trim() || undefined,
      customerPhone: whatsappNumber.trim() || undefined,
      whatsappOptIn: whatsappOptIn && !!whatsappNumber.trim(),
    };

    // Save to persistent localStorage order history
    try {
      const existing = JSON.parse(localStorage.getItem('restaurantos_orders') || '[]');
      localStorage.setItem('restaurantos_orders', JSON.stringify([newOrder, ...existing]));
      localStorage.setItem('restaurantos_active_order', JSON.stringify(newOrder));
    } catch {
      // Ignore storage quota
    }

    onClearCart();
    onClose();

    if (onOrderConfirmed) {
      onOrderConfirmed(newOrder);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[430px] max-h-[90vh] bg-[#faf7f2] rounded-t-[32px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-200">
        {/* Drawer Grab Handle */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-3 shrink-0"></div>

        {/* Drawer Header with Table Bill designation */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-stone-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#82181a]/10 text-[#82181a] flex items-center justify-center">
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-stone-900 leading-tight">
                  Table Order & Bill
                </h2>
                <span className="text-[11px] font-bold text-[#82181a] bg-[#82181a]/10 px-2 py-0.5 rounded-full">
                  {currentTable}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} selected · RestaurantOS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 shadow-2xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Empty State */}
        {cartItems.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-stone-200/70 text-stone-400 flex items-center justify-center">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-base font-bold text-stone-900">
              No items selected yet
            </h3>
            <p className="text-xs text-stone-500 max-w-[220px]">
              Tap the red (+) plus button on any dish card to add delicious items to your table order.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 bg-[#82181a] text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          /* Cart Items & Order Review */
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 no-scrollbar">
            {/* Selected Items List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 px-1">
                Selected Dishes ({totalItemCount})
              </span>

              {cartItems.map((item) => (
                <div
                  key={item.dish.id}
                  className="bg-white rounded-2xl p-3 border border-stone-200/80 shadow-xs flex items-center justify-between gap-3"
                >
                  {/* Photo & Details */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.dish.image}
                      alt={item.dish.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-stone-100"
                    />
                    <div className="min-w-0">
                      <h4 className="font-serif text-xs font-bold text-stone-900 truncate">
                        {item.dish.name}
                      </h4>
                      <p className="text-xs text-[#82181a] font-bold font-sans tabular-nums mt-0.5">
                        ₹{(item.dish.price * item.quantity).toLocaleString('en-IN')}
                        <span className="text-[10px] text-stone-400 font-normal ml-1">
                          (₹{item.dish.price.toLocaleString('en-IN')} ea)
                        </span>
                      </p>
                      {item.doneness && (
                        <span className="text-[9px] text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded font-medium">
                          {item.doneness}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stepper & Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-[#faf7f2] border border-stone-200/80 rounded-xl p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.dish.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white hover:bg-stone-100 active:scale-90 text-stone-800 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3 stroke-[2.5]" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-stone-900 font-sans tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.dish.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white hover:bg-stone-100 active:scale-90 text-stone-800 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.dish.id)}
                      className="w-7 h-7 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupons & Offers Section */}
            <div className="bg-white rounded-2xl p-3 border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-stone-900 font-serif">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  Coupons & Offers
                </span>
                {appliedCoupon && (
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-bold text-red-700 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-900 font-sans tracking-wide">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-[10px] text-emerald-700">
                        {appliedCoupon.title} applied on your table order
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-800 font-sans tabular-nums">
                    -₹{discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter promo code (e.g. TASTE100)"
                      className="flex-1 text-xs bg-[#faf7f2] border border-stone-200 rounded-xl px-3 py-2 outline-none uppercase font-semibold text-stone-800 tracking-wider placeholder:normal-case placeholder:font-normal placeholder:tracking-normal focus:ring-1 focus:ring-[#82181a]"
                    />
                    <button
                      onClick={() => handleApplyCoupon(couponInput)}
                      className="px-3.5 py-2 bg-[#82181a] hover:bg-[#6c1214] text-white text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-[10px] text-red-600 font-medium">{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="text-[10px] text-emerald-700 font-medium">{couponSuccess}</p>
                  )}

                  {/* Quick Coupon Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    {AVAILABLE_COUPONS.map((cp) => (
                      <button
                        key={cp.code}
                        type="button"
                        onClick={() => handleApplyCoupon(cp.code)}
                        className="px-2.5 py-1 rounded-lg border border-dashed border-amber-500/70 bg-amber-50/60 hover:bg-amber-100 text-[10px] font-bold text-amber-900 shrink-0 cursor-pointer transition-colors"
                      >
                        {cp.code} • ₹{cp.discountValue} OFF
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp Membership & Bill Updates Section */}
            <div className="bg-white rounded-2xl p-3 border border-stone-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-stone-900 font-serif">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  WhatsApp Bill & Diner Club
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Instant Invoice
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit WhatsApp number"
                  className="w-full text-xs bg-[#faf7f2] border border-stone-200 rounded-xl pl-11 pr-3 py-2 outline-none font-semibold text-stone-800 placeholder:font-normal focus:ring-1 focus:ring-[#82181a]"
                />
              </div>

              <div className="space-y-1.5 pt-0.5">
                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-stone-600">
                  <input
                    type="checkbox"
                    checked={whatsappOptIn}
                    onChange={(e) => setWhatsappOptIn(e.target.checked)}
                    className="mt-0.5 accent-[#82181a] rounded"
                  />
                  <span>Send live order status updates & PDF bill receipt on WhatsApp</span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-stone-600">
                  <input
                    type="checkbox"
                    checked={joinClub}
                    onChange={(e) => setJoinClub(e.target.checked)}
                    className="mt-0.5 accent-[#82181a] rounded"
                  />
                  <span>Join Diner Club to earn table loyalty stamps and secret chef perks</span>
                </label>
              </div>
            </div>

            {/* Kitchen Instructions */}
            <div className="pt-0.5">
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Special Kitchen Notes (Allergies, Sauces)
              </label>
              <input
                type="text"
                value={kitchenNotes}
                onChange={(e) => setKitchenNotes(e.target.value)}
                placeholder="E.g. Sauce on the side, well-toasted bread..."
                className="w-full text-xs bg-white border border-stone-200/80 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-[#82181a]"
              />
            </div>

            {/* Bill Calculation Breakdown */}
            <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                <span className="font-serif font-bold text-stone-900 text-xs">
                  Bill Calculation Breakdown
                </span>
                <span className="text-[10px] text-stone-500">{currentTable}</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})</span>
                <span className="font-sans font-bold text-stone-900 tabular-nums">
                  ₹{Math.round(subtotal).toLocaleString('en-IN')}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span className="font-sans font-bold tabular-nums">
                    -₹{Math.round(discountAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Table Sales Tax (8%)</span>
                <span className="font-sans font-bold text-stone-900 tabular-nums">
                  ₹{Math.round(tax).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Kitchen Service & Gratuity (10%)</span>
                <span className="font-sans font-bold text-stone-900 tabular-nums">
                  ₹{Math.round(service).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-stone-900 font-bold text-sm pt-2 border-t border-stone-100">
                <span>Total Payable Bill</span>
                <span className="text-[#82181a] font-sans font-extrabold text-base tabular-nums">
                  ₹{Math.round(total).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRM ORDER ACTION BUTTON */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t border-stone-200/80 shrink-0">
            <button
              onClick={handleSendOrder}
              className="w-full h-12 rounded-2xl bg-[#82181a] hover:bg-[#6c1214] active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#82181a]/25 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-amber-300 stroke-[3]" />
              <span className="font-sans font-bold tabular-nums">
                Confirm Order • ₹{Math.round(total).toLocaleString('en-IN')}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
