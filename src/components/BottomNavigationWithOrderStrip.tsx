import React from 'react';
import {
  Home as HomeIcon,
  Award,
  ShoppingBag,
  ArrowRight,
  User as UserIcon,
} from 'lucide-react';
import { CartItem } from '../types/restaurant';

export type CustomerNavTab = 'home' | 'rewards' | 'cart' | 'profile';

interface BottomNavigationWithOrderStripProps {
  cartItems: CartItem[];
  onOpenCart: () => void;
  onOpenRewards: () => void;
  onOpenProfile?: () => void;
  onNavigateHome: () => void;
  activeTab: CustomerNavTab;
  setActiveTab?: (tab: CustomerNavTab) => void;
  currentTable: string;
}

export const BottomNavigationWithOrderStrip: React.FC<
  BottomNavigationWithOrderStripProps
> = ({
  cartItems,
  onOpenCart,
  onOpenRewards,
  onOpenProfile,
  onNavigateHome,
  activeTab,
  currentTable,
}) => {
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.dish.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const service = subtotal * 0.1;
  const totalBill = subtotal + tax + service;

  // Build a concise summary text for the selected items
  const getItemSummary = () => {
    if (cartItems.length === 0) return '';
    if (cartItems.length === 1) {
      return `${cartItems[0].dish.name} (x${cartItems[0].quantity})`;
    }
    const firstItem = cartItems[0].dish.name;
    const remainingCount = totalCartCount - cartItems[0].quantity;
    if (remainingCount > 0) {
      return `${firstItem} + ${remainingCount} more`;
    }
    return `${firstItem} & others`;
  };

  return (
    <>
      {/* FLOATING ORDER SUMMARY STRIP ("PATTI") */}
      {totalCartCount > 0 && (
        <div className="absolute bottom-[60px] inset-x-2.5 z-30 animate-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={onOpenCart}
            title="Click to view bill and confirm table order"
            className="w-full relative overflow-hidden bg-gradient-to-r from-[#590d10] via-[#82181a] to-[#45080b] text-white p-2.5 px-3 rounded-2xl shadow-[0_12px_30px_rgba(130,24,26,0.45)] border border-amber-300/35 flex items-center justify-between active:scale-[0.99] transition-all cursor-pointer group hover:shadow-[0_14px_36px_rgba(130,24,26,0.55)] before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-amber-200/50 before:to-transparent"
          >
            {/* Left side: Golden count badge & summary calculation */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 backdrop-blur-xs flex items-center justify-center font-bold text-xs text-amber-300 shrink-0 border border-amber-300/40 shadow-inner">
                <span>{totalCartCount}</span>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#82181a]"></span>
              </div>

              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-white truncate max-w-[150px] leading-tight drop-shadow-xs">
                    {getItemSummary()}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-amber-300 font-bold bg-black/35 px-1.5 py-0.5 rounded border border-amber-300/25 shrink-0">
                    {currentTable}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-sans text-sm font-extrabold text-amber-200 tabular-nums tracking-normal">
                    ₹{Math.round(totalBill).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-white/75 font-normal tracking-tight">
                    total bill • incl. taxes
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: Luxury "View Order" action button */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 hover:from-amber-200 hover:to-white text-stone-950 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md group-hover:scale-102 transition-all shrink-0">
              <ShoppingBag className="w-3.5 h-3.5 text-stone-900 stroke-[2.3]" />
              <span className="tracking-tight">View Order</span>
              <ArrowRight className="w-3 h-3 text-stone-900 stroke-[2.8] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      )}

      {/* 4-TAB PERMANENT BOTTOM NAVIGATION BAR */}
      {/* Home | Rewards | Cart | Profile */}
      <div className="absolute bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-3 py-2 shadow-lg">
        <div className="grid grid-cols-4 max-w-sm mx-auto items-center">
          {/* 1. Home Tab */}
          <button
            type="button"
            onClick={onNavigateHome}
            className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer py-1 ${
              activeTab === 'home'
                ? 'text-[#82181a] font-bold'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <HomeIcon className="w-5 h-5 fill-current stroke-[1.8]" />
            <span className="text-[10px] tracking-tight">Home</span>
          </button>

          {/* 2. Rewards Tab (Loyalty Stamps) */}
          <button
            type="button"
            onClick={onOpenRewards}
            className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer py-1 relative ${
              activeTab === 'rewards'
                ? 'text-[#82181a] font-bold'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <div className="relative">
              <Award className="w-5 h-5 stroke-[2]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </div>
            <span className="text-[10px] tracking-tight">Rewards</span>
          </button>

          {/* 3. Cart Tab (Opens Bill & Order) */}
          <button
            type="button"
            onClick={onOpenCart}
            className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer py-1 relative ${
              activeTab === 'cart'
                ? 'text-[#82181a] font-bold'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#82181a] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Cart</span>
          </button>

          {/* 4. Profile Tab (Customer Account & Loyalty) */}
          <button
            type="button"
            onClick={onOpenProfile || onOpenRewards}
            className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer py-1 relative ${
              activeTab === 'profile'
                ? 'text-[#82181a] font-bold'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <UserIcon className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] tracking-tight">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
};
