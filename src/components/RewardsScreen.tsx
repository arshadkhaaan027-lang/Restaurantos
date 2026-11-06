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
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  registerLoyaltyMembership,
  SUPPORTED_CAFES,
} from '../services/restaurantService';
import { REWARDS } from '../data/menuData';
import { RewardItem, CartItem } from '../types/restaurant';
import { BottomNavigationWithOrderStrip, CustomerNavTab } from './BottomNavigationWithOrderStrip';

interface RewardsScreenProps {
  onBack: () => void;
  currentTable: string;
  cartItems?: CartItem[];
  onOpenCart?: () => void;
  onNavigateHome?: () => void;
  onOpenProfile?: () => void;
  activeNavTab?: CustomerNavTab;
  setActiveNavTab?: (tab: CustomerNavTab) => void;
  onOpenAuthModal?: () => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({
  onBack,
  currentTable,
  cartItems = [],
  onOpenCart,
  onNavigateHome,
  onOpenProfile,
  activeNavTab = 'rewards',
  setActiveNavTab,
  onOpenAuthModal,
}) => {
  const {
    user,
    customerProfile,
    loyaltyMembership,
    refreshMembership,
    currentCafeId,
    loginWithPhone,
  } = useAuth();

  // Registration Form State
  const [fullName, setFullName] = useState<string>(
    customerProfile?.fullName || ''
  );
  const [whatsappNumber, setWhatsappNumber] = useState<string>(
    customerProfile?.phone || localStorage.getItem('restaurantos_customer_phone') || ''
  );
  const [email, setEmail] = useState<string>(customerProfile?.email || '');
  const [dob, setDob] = useState<string>(customerProfile?.dateOfBirth || '');
  const [privacyConsent, setPrivacyConsent] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Rewards Claiming State
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);
  const [claimSuccessToast, setClaimSuccessToast] = useState<string | null>(null);

  const activeCafe =
    SUPPORTED_CAFES.find((c) => c.id === currentCafeId) || SUPPORTED_CAFES[0];

  // Current stamp count from Firestore membership (defaults to 0 if not enrolled)
  const earnedCount = loyaltyMembership ? loyaltyMembership.stamps : 0;
  const stampsRemaining = Math.max(0, 10 - earnedCount);

  // Array of 10 stamps
  const stampSlots = Array.from({ length: 10 }, (_, i) => i < earnedCount);

  const handleJoinClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);

    if (!fullName.trim()) {
      setJoinError('Please enter your full name.');
      return;
    }

    if (!whatsappNumber.trim()) {
      setJoinError('Please enter your WhatsApp mobile number.');
      return;
    }

    if (!privacyConsent) {
      setJoinError('Please accept the membership privacy terms.');
      return;
    }

    setIsSubmitting(true);
    try {
      let activeUid = user?.uid;

      // If user is not yet logged in with Firebase, automatically create or log in via phone
      if (!activeUid) {
        await loginWithPhone(whatsappNumber, '654321');
        // Retrieve fresh user UID from auth
        activeUid = user?.uid || `guest_${Date.now()}`;
      }

      await registerLoyaltyMembership(currentCafeId, {
        uid: activeUid,
        phone: whatsappNumber,
        whatsappNumber,
        whatsappOptIn: true,
        name: fullName,
        fullName,
        email: email.trim() || undefined,
        dateOfBirth: dob || undefined,
        stamps: 1, // 1 welcome bonus stamp upon joining!
        joinedAt: new Date().toISOString(),
      });

      await refreshMembership();
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join club. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimReward = (reward: RewardItem) => {
    if (earnedCount < reward.stampsRequired) return;
    if (!claimedRewards.includes(reward.id)) {
      setClaimedRewards([...claimedRewards, reward.id]);
      setClaimSuccessToast(`Voucher for ${reward.title} unlocked! Inform table server.`);
      setTimeout(() => setClaimSuccessToast(null), 3500);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf7f2] relative overflow-hidden">
      {/* Pinned Top Header */}
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
                {activeCafe.name} · {currentTable}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold bg-amber-400 text-stone-900 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {loyaltyMembership ? 'Enrolled Member' : 'Guest Pass'}
          </span>
        </div>

        <p className="text-xs text-white/90 leading-relaxed max-w-[280px]">
          Earn 1 loyalty stamp for every dining visit. Collect 10 stamps for a
          complimentary prime steak.
        </p>
      </div>

      {/* Claim Toast */}
      {claimSuccessToast && (
        <div className="absolute top-20 inset-x-4 z-40 p-2.5 bg-emerald-900 text-emerald-100 text-xs font-semibold rounded-xl text-center shadow-lg border border-emerald-700 animate-in fade-in slide-in-from-top-2">
          {claimSuccessToast}
        </div>
      )}

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-3 px-4 pb-36 space-y-4">
        {/* CASE 1: NOT ENROLLED IN LOYALTY -> SHOW "JOIN OUR REWARDS CLUB" */}
        {!loyaltyMembership ? (
          <div className="bg-white rounded-3xl p-5 shadow-md border border-stone-200/80 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#82181a] bg-[#82181a]/10 px-2.5 py-0.5 rounded-full">
                Exclusive Invitation
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Join Our Rewards Club
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Collect digital stamps on every table visit and unlock artisanal culinary privileges.
              </p>
            </div>

            {/* Membership Benefits List */}
            <div className="bg-[#faf7f2] rounded-2xl p-3.5 border border-stone-200/80 space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Member Privileges
              </span>
              <div className="grid grid-cols-1 gap-2 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>1 Loyalty Stamp for every dining visit over ₹{activeCafe.minOrderForStamp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Gift className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>Complimentary Artisanal Appetizer at 5 stamps</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>Complimentary Signature Prime Steak at 10 stamps</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>Instant 1 Welcome Bonus Stamp upon joining today!</span>
                </div>
              </div>
            </div>

            {joinError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl">
                {joinError}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleJoinClub} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#82181a]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  WhatsApp Number <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+91 98201 54321"
                    className="w-full bg-stone-50 pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#82181a]"
                    required
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Used to deliver digital stamp notifications and e-receipts.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-stone-50 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#82181a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-stone-50 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#82181a]"
                  />
                </div>
              </div>

              {/* Privacy Consent */}
              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="rounded border-stone-300 text-[#82181a] focus:ring-[#82181a] mt-0.5"
                />
                <span className="text-[11px] text-stone-600 leading-tight">
                  I agree to enroll in {activeCafe.name} Diner Club and receive table order receipts and loyalty balance updates.
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-[#82181a] hover:bg-[#6c1214] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isSubmitting ? 'Enrolling...' : 'Join Now & Claim 1 Welcome Stamp'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          /* CASE 2: ALREADY ENROLLED -> DISPLAY DIGITAL LOYALTY CARD & MILESTONES */
          <>
            {/* The 10-Stamp Loyalty Card */}
            <div className="bg-white rounded-3xl p-4 shadow-md border border-stone-200/80 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#82181a]">
                      RestaurantOS Pass
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-stone-100 px-1.5 py-0.2 rounded text-stone-600">
                      {loyaltyMembership.membershipId}
                    </span>
                  </div>
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
                {stampSlots.map((isEarned, index) => {
                  const stampNumber = index + 1;
                  const isMilestone = stampNumber === 5 || stampNumber === 10;

                  return (
                    <div key={index} className="flex flex-col items-center gap-1">
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
                        {isMilestone ? (stampNumber === 5 ? 'Free Dish' : 'Prime Steak') : `Visit ${stampNumber}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress Summary */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500">
                  {stampsRemaining > 0
                    ? `${stampsRemaining} more stamps to unlock Prime Steak`
                    : '🎉 Grand Prize Unlocked!'}
                </span>
                <span className="font-bold text-[#82181a] font-mono">
                  {Math.round((earnedCount / 10) * 100)}% Complete
                </span>
              </div>
            </div>

            {/* Unlocked & Available Rewards */}
            <div className="bg-white rounded-3xl p-4 shadow-md border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-stone-900">
                    Tier Rewards
                  </h4>
                  <p className="text-[10px] text-stone-500">
                    Redeem vouchers at your table during order payment
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#82181a] bg-stone-100 px-2 py-0.5 rounded-full">
                  {earnedCount} Stamps Ready
                </span>
              </div>

              <div className="space-y-2.5">
                {REWARDS.map((reward) => {
                  const isUnlocked = earnedCount >= reward.stampsRequired;
                  const isClaimed = claimedRewards.includes(reward.id);

                  return (
                    <div
                      key={reward.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isUnlocked
                          ? 'bg-amber-50/50 border-amber-300/80 shadow-xs'
                          : 'bg-stone-50/70 border-stone-200/70 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isUnlocked
                                ? 'bg-amber-400 text-stone-900 shadow-sm'
                                : 'bg-stone-200 text-stone-400'
                            }`}
                          >
                            <Gift className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-xs font-bold text-stone-900">
                                {reward.title}
                              </h5>
                              <span className="text-[9px] uppercase font-bold text-stone-500 bg-black/5 px-1.5 py-0.2 rounded">
                                {reward.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              {reward.description}
                            </p>
                          </div>
                        </div>

                        {/* Claim action button */}
                        {isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => handleClaimReward(reward)}
                            disabled={isClaimed}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                              isClaimed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#82181a] hover:bg-[#6c1214] text-white shadow-xs'
                            }`}
                          >
                            {isClaimed ? 'Voucher Active ✓' : 'Redeem'}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-stone-400 bg-stone-200/60 px-2 py-1 rounded-lg shrink-0">
                            <Lock className="w-3 h-3" />
                            <span>{reward.stampsRequired} Stamps</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reward Redemption History */}
            {claimedRewards.length > 0 && (
              <div className="bg-white rounded-3xl p-4 shadow-md border border-stone-200/80">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Active Redemptions for {currentTable}
                </span>
                <div className="space-y-1.5">
                  {claimedRewards.map((id) => {
                    const rew = REWARDS.find((r) => r.id === id);
                    return (
                      <div
                        key={id}
                        className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold">{rew?.title}</span>
                        <span className="text-[10px] text-emerald-700">Ready at checkout</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 4-Tab Bottom Navigation */}
      <BottomNavigationWithOrderStrip
        cartItems={cartItems}
        onOpenCart={onOpenCart || (() => {})}
        onOpenRewards={() => setActiveNavTab && setActiveNavTab('rewards')}
        onOpenProfile={onOpenProfile}
        onNavigateHome={onNavigateHome || onBack}
        activeTab={activeNavTab}
        setActiveTab={setActiveNavTab}
        currentTable={currentTable}
      />
    </div>
  );
};
