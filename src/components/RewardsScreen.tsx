import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  QrCode,
  CheckCircle2,
  Gift,
  ArrowRight,
  ShieldCheck,
  Check,
  Lock,
  Flame,
  UtensilsCrossed,
} from 'lucide-react';
import { INITIAL_LOYALTY_STAMPS, REWARDS } from '../data/menuData';
import { RewardItem, CartItem } from '../types/restaurant';
import { BottomNavigationWithOrderStrip } from './BottomNavigationWithOrderStrip';

interface RewardsScreenProps {
  onBack: () => void;
  currentTable: string;
  cartItems?: CartItem[];
  onOpenCart?: () => void;
  onNavigateHome?: () => void;
  activeNavTab?: 'home' | 'rewards' | 'cart';
  setActiveNavTab?: (tab: 'home' | 'rewards' | 'cart') => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({
  onBack,
  currentTable,
  cartItems = [],
  onOpenCart,
  onNavigateHome,
  activeNavTab = 'rewards',
  setActiveNavTab,
}) => {
  const [stamps, setStamps] = useState<boolean[]>(INITIAL_LOYALTY_STAMPS);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);
  const [stampSuccessToast, setStampSuccessToast] = useState<boolean>(false);

  const earnedCount = stamps.filter(Boolean).length;
  const stampsRemaining = Math.max(0, 10 - earnedCount);

  const handleSimulateStamp = () => {
    const nextIndex = stamps.findIndex((s) => !s);
    if (nextIndex !== -1) {
      const newStamps = [...stamps];
      newStamps[nextIndex] = true;
      setStamps(newStamps);
      setStampSuccessToast(true);
      setTimeout(() => setStampSuccessToast(false), 2000);
    }
  };

  const handleClaim = (reward: RewardItem) => {
    if (!claimedRewards.includes(reward.id)) {
      setClaimedRewards([...claimedRewards, reward.id]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf7f2] relative overflow-hidden">
      {/* Top Header - Pinned so it never scrolls */}
      <div className="bg-[#82181a] text-white pt-3 pb-5 px-5 rounded-b-[24px] shadow-md z-30 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-amber-300">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold leading-none">
                Diner Club Rewards
              </h2>
              <p className="text-[10px] text-white/80 mt-0.5">
                Table Loyalty Stamps · {currentTable}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold bg-amber-400 text-stone-900 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Gold Member
          </span>
        </div>

        <p className="text-xs text-white/90 leading-relaxed max-w-[280px]">
          Earn 1 loyalty stamp for every dining visit. Collect 10 stamps for a
          complimentary prime steak.
        </p>
      </div>

      {/* Scrollable Container with padding bottom for strip and nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pt-3 px-4 pb-36 space-y-4">
          {/* The 10-Stamp Loyalty Card */}
          <div className="bg-white rounded-3xl p-4 shadow-md border border-stone-200/80 relative overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#82181a]">
                  RestaurantOS Pass
                </span>
                <h3 className="font-serif text-base font-bold text-stone-900 leading-tight">
                  Loyalty Stamp Card
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-stone-900 font-sans">
                  {earnedCount} / 10
                </span>
                <p className="text-[9px] text-stone-400">Stamps Collected</p>
              </div>
            </div>

            {/* 10 Stamps Grid (2 rows of 5) */}
            <div className="grid grid-cols-5 gap-2.5 py-4">
              {stamps.map((isEarned, index) => {
                const stampNumber = index + 1;
                const isMilestone = stampNumber === 5 || stampNumber === 10;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isEarned
                          ? 'bg-gradient-to-br from-[#82181a] to-[#5b0f11] text-amber-200 shadow-sm shadow-[#82181a]/20 scale-100'
                          : 'bg-[#faf7f2] border-2 border-dashed border-stone-300 text-stone-400'
                      }`}
                    >
                      {isEarned ? (
                        <div className="flex flex-col items-center justify-center">
                          <UtensilsCrossed className="w-4 h-4 text-amber-200 stroke-[2.2]" />
                          <span className="text-[8px] font-bold text-amber-300 -mt-0.5">
                            ✓
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-stone-400">
                          {stampNumber}
                        </span>
                      )}

                      {/* Milestone Crown */}
                      {isMilestone && !isEarned && (
                        <Gift className="w-3 h-3 text-amber-500 absolute -top-1.5 -right-1.5" />
                      )}
                    </div>
                    <span className="text-[9px] font-medium text-stone-500">
                      {stampNumber === 10
                        ? '★ Grand'
                        : stampNumber === 5
                        ? '★ Gift'
                        : `#${stampNumber}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar & Next Perk */}
            <div className="bg-[#faf7f2] rounded-2xl p-3 border border-stone-200/60 mt-1">
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="text-stone-700 font-semibold">Progress to Next Gift</span>
                <span className="text-[#82181a] font-bold">
                  {stampsRemaining > 0
                    ? `${stampsRemaining} stamps remaining`
                    : 'All Rewards Unlocked!'}
                </span>
              </div>
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#82181a] to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${(earnedCount / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Interactive QR Stamp Button */}
            <div className="pt-3">
              <button
                onClick={handleSimulateStamp}
                disabled={earnedCount >= 10}
                className="w-full h-11 bg-stone-900 hover:bg-black active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
                <span>
                  {earnedCount >= 10
                    ? 'Card Fully Completed!'
                    : 'Tap to Scan Table QR Stamp'}
                </span>
              </button>
            </div>
          </div>

          {/* WhatsApp VIP Club Membership Box */}
          <div className="bg-gradient-to-br from-emerald-900 to-[#123624] text-white rounded-3xl p-4 shadow-sm space-y-2.5 border border-emerald-700/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-serif text-xs font-bold leading-tight">WhatsApp VIP Club</h4>
                  <p className="text-[10px] text-emerald-200">Exclusive discounts & birthday treats</p>
                </div>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                Active Member
              </span>
            </div>

            <div className="bg-black/25 rounded-2xl p-2.5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                  Linked:
                </span>
                <span className="text-xs font-bold text-white font-sans tabular-nums">
                  {localStorage.getItem('restaurantos_customer_phone')
                    ? `+91 ${localStorage.getItem('restaurantos_customer_phone')}`
                    : '+91 98765 43210 (Demo)'}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> Verified
              </span>
            </div>
          </div>

          {/* Claimable Rewards Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h3 className="font-serif text-sm font-bold text-stone-900">
                Unlocked Perks & Rewards
              </h3>
              <span className="text-[11px] text-stone-500">Dine-In Perks</span>
            </div>

            <div className="space-y-2">
              {REWARDS.map((reward) => {
                const isUnlocked = earnedCount >= reward.stampsRequired;
                const isClaimed = claimedRewards.includes(reward.id);

                return (
                  <div
                    key={reward.id}
                    className={`bg-white rounded-2xl p-3.5 border transition-all ${
                      isUnlocked
                        ? 'border-stone-200/80 shadow-xs'
                        : 'border-stone-200/50 opacity-75 bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isUnlocked
                              ? 'bg-[#82181a]/10 text-[#82181a]'
                              : 'bg-stone-200 text-stone-400'
                          }`}
                        >
                          {isUnlocked ? (
                            <Gift className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-serif text-xs font-bold text-stone-900 leading-tight">
                            {reward.title}
                          </h4>
                          <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                            {reward.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-600">
                        Requires {reward.stampsRequired} Stamps
                      </span>

                      {isUnlocked ? (
                        <button
                          onClick={() => handleClaim(reward)}
                          disabled={isClaimed}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            isClaimed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-[#82181a] text-white hover:bg-[#6c1214] shadow-xs active:scale-95'
                          }`}
                        >
                          {isClaimed ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Claimed at {currentTable}
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              Claim Reward
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-medium">
                          {reward.stampsRequired - earnedCount} more stamps
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      {/* Success Toast */}
      {stampSuccessToast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-[#82181a] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Stamp Collected! ({earnedCount}/10)</span>
        </div>
      )}

      {/* 3-TAB PERMANENT BOTTOM NAVIGATION & FLOATING ORDER STRIP */}
      {onOpenCart && onNavigateHome && (
        <BottomNavigationWithOrderStrip
          cartItems={cartItems}
          onOpenCart={onOpenCart}
          onOpenRewards={() => {}}
          onNavigateHome={onNavigateHome}
          activeTab={activeNavTab}
          setActiveTab={setActiveNavTab}
          currentTable={currentTable}
        />
      )}
    </div>
  );
};
