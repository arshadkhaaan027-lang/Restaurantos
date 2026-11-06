import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Award,
  Clock,
  Heart,
  LogOut,
  Camera,
  Edit2,
  Trash2,
  Check,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  ShieldCheck,
  Receipt,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  CustomerProfile,
  Order,
  Dish,
  CartItem,
} from '../types/restaurant';
import {
  listenToCustomerOrders,
  SUPPORTED_CAFES,
} from '../services/restaurantService';
import { DISHES } from '../data/menuData';
import { BottomNavigationWithOrderStrip, CustomerNavTab } from './BottomNavigationWithOrderStrip';

interface CustomerProfileScreenProps {
  onBackToMenu: () => void;
  onOpenRewards: () => void;
  onOpenCart: () => void;
  onOpenOrderStatus?: (order: Order) => void;
  onSelectDish: (dish: Dish) => void;
  currentTable: string;
  cartItems: CartItem[];
  activeNavTab: CustomerNavTab;
  setActiveNavTab: (tab: CustomerNavTab) => void;
  onOpenAuthModal: () => void;
}

export const CustomerProfileScreen: React.FC<CustomerProfileScreenProps> = ({
  onBackToMenu,
  onOpenRewards,
  onOpenCart,
  onOpenOrderStatus,
  onSelectDish,
  currentTable,
  cartItems,
  activeNavTab,
  setActiveNavTab,
  onOpenAuthModal,
}) => {
  const {
    user,
    customerProfile,
    loyaltyMembership,
    updateProfileData,
    logout,
    currentCafeId,
    setCurrentCafeId,
  } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editDob, setEditDob] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize edit inputs when profile loads
  useEffect(() => {
    if (customerProfile) {
      setEditName(customerProfile.fullName || '');
      setEditPhone(customerProfile.phone || '');
      setEditEmail(customerProfile.email || '');
      setEditDob(customerProfile.dateOfBirth || '');
    }
  }, [customerProfile]);

  // Real-time Firestore order listener for this customer
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    const unsubscribe = listenToCustomerOrders(currentCafeId, user.uid, (freshOrders) => {
      setOrders(freshOrders);
    });
    return () => unsubscribe();
  }, [user, currentCafeId]);

  const activeCafe =
    SUPPORTED_CAFES.find((c) => c.id === currentCafeId) || SUPPORTED_CAFES[0];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileData({
      fullName: editName,
      phone: editPhone,
      email: editEmail,
      dateOfBirth: editDob,
    });
    setIsEditing(false);
    setSaveToast('Profile updated in Firestore');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        await updateProfileData({ photoURL: base64 });
        setSaveToast('Profile photo updated');
        setTimeout(() => setSaveToast(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    await updateProfileData({ photoURL: '' });
    setSaveToast('Profile picture removed');
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Get favorite dishes
  const favDishObjects = DISHES.filter((d) =>
    (customerProfile?.favouriteDishes || ['dish_ribeye', 'dish_carbonara']).includes(d.id)
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf7f2] relative overflow-hidden">
      {/* Pinned Header */}
      <div className="bg-[#82181a] text-white pt-3 pb-5 px-5 rounded-b-[24px] shadow-md z-30 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-amber-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold leading-none">
                Diner Account
              </h2>
              <p className="text-[10px] text-white/80 mt-0.5">
                {activeCafe.name} · {currentTable}
              </p>
            </div>
          </div>

          {user ? (
            <button
              onClick={logout}
              className="flex items-center gap-1 text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/20 cursor-pointer transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Log out</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="text-[10px] font-bold bg-amber-400 text-stone-900 px-3 py-1 rounded-full shadow-sm cursor-pointer hover:bg-amber-300"
            >
              Sign In / Join
            </button>
          )}
        </div>

        <p className="text-xs text-white/90 leading-relaxed max-w-[280px]">
          Manage dining profile, live kitchen orders, rewards club membership, and taste preferences.
        </p>
      </div>

      {/* Toast alert */}
      {saveToast && (
        <div className="absolute top-20 inset-x-4 z-40 p-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl text-center shadow-lg border border-stone-700 animate-in fade-in slide-in-from-top-2">
          {saveToast}
        </div>
      )}

      {/* Main Scrollable View */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-3 px-4 pb-36 space-y-4">
        {!user ? (
          /* GUEST PROMPT */
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-md text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#82181a] flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Unlock Member Dining & Stamps
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                Sign in with mobile OTP or email to collect loyalty stamps for Table {currentTable}, track live orders, and unlock member perks.
              </p>
            </div>
            <button
              onClick={onOpenAuthModal}
              className="w-full py-2.5 rounded-xl bg-[#82181a] hover:bg-[#6c1214] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Sign In with Mobile OTP / Email
            </button>
          </div>
        ) : (
          /* AUTHENTICATED PROFILE */
          <>
            {/* Identity Card */}
            <div className="bg-white rounded-3xl p-4 shadow-md border border-stone-200/80 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Photo Avatar with upload trigger */}
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-2xl bg-stone-100 border-2 border-amber-300/60 overflow-hidden shadow-sm flex items-center justify-center">
                      {customerProfile?.photoURL ? (
                        <img
                          src={customerProfile.photoURL}
                          alt="Customer Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#82181a] to-[#45080b] text-white flex items-center justify-center font-serif text-xl font-bold">
                          {customerProfile?.fullName?.charAt(0) || 'D'}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#82181a] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                      title="Upload photo"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-serif text-base font-bold text-stone-900">
                        {customerProfile?.fullName || 'Valued Guest'}
                      </h3>
                      {loyaltyMembership && (
                        <span className="text-[9px] uppercase font-bold tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded-full">
                          Gold
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{customerProfile?.phone || 'No phone registered'}</span>
                    </p>
                    <p className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-stone-400" />
                      <span>{customerProfile?.email || 'No email registered'}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                  title="Edit Profile"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {customerProfile?.photoURL && (
                <div className="mt-2 text-right">
                  <button
                    onClick={handleRemovePhoto}
                    className="text-[10px] text-red-600 hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <span>Remove photo</span>
                  </button>
                </div>
              )}

              {/* INLINE EDIT PROFILE FORM */}
              {isEditing && (
                <form
                  onSubmit={handleSaveProfile}
                  className="mt-3 pt-3 border-t border-stone-100 space-y-2.5 animate-in fade-in duration-150"
                >
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#82181a]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#82181a]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        className="w-full bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#82181a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#82181a]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-[#82181a] hover:bg-[#6c1214] shadow-xs cursor-pointer"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Loyalty Membership Card */}
            <div className="bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#1c1917] rounded-3xl p-4 text-white shadow-md border border-amber-400/20 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-amber-300 font-bold block">
                    RestaurantOS Diner Club
                  </span>
                  <h4 className="font-serif text-sm font-bold text-white">
                    {loyaltyMembership ? 'Active Pass' : 'Not Enrolled'}
                  </h4>
                </div>
                {loyaltyMembership && (
                  <span className="text-[10px] font-mono font-bold text-stone-300 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                    {loyaltyMembership.membershipId}
                  </span>
                )}
              </div>

              {loyaltyMembership ? (
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-sans text-2xl font-extrabold text-amber-300 tabular-nums">
                        {loyaltyMembership.stamps}
                      </span>
                      <span className="text-xs text-stone-400">/ 10 Stamps</span>
                    </div>
                    <p className="text-[10px] text-stone-300 mt-0.5">
                      {10 - loyaltyMembership.stamps > 0
                        ? `${10 - loyaltyMembership.stamps} more stamps until complimentary Prime Steak`
                        : '🎉 Prime Steak reward unlocked!'}
                    </p>
                  </div>

                  <button
                    onClick={onOpenRewards}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 text-xs font-bold shadow-md cursor-pointer transition-colors"
                  >
                    <span>View Card</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-stone-300">
                    Earn 1 stamp for every table visit. Free steak at 10.
                  </p>
                  <button
                    onClick={onOpenRewards}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Join Club
                  </button>
                </div>
              )}
            </div>

            {/* Favorite Dishes Rail */}
            <div className="bg-white rounded-3xl p-4 shadow-md border border-stone-200/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[#82181a] fill-current" />
                  <h4 className="font-serif text-sm font-bold text-stone-900">
                    Favourite Dishes
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-stone-400">
                  {favDishObjects.length} Saved
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {favDishObjects.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => onSelectDish(dish)}
                    className="p-2 rounded-2xl bg-[#faf7f2] border border-stone-200/80 hover:border-amber-400/60 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-full h-18 rounded-xl overflow-hidden mb-1.5 bg-stone-200">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs font-bold text-stone-900 line-clamp-1">
                        {dish.name}
                      </p>
                      <p className="text-[10px] text-stone-500 line-clamp-1">
                        {dish.category}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/50">
                      <span className="text-xs font-extrabold text-[#82181a] tabular-nums">
                        ₹{dish.price}
                      </span>
                      <span className="text-[9px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                        ★ {dish.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Order History from Firestore */}
            <div className="bg-white rounded-3xl p-4 shadow-md border border-stone-200/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-stone-700" />
                  <h4 className="font-serif text-sm font-bold text-stone-900">
                    Order History
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-stone-400">
                  {orders.length} Tickets
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-4 text-xs text-stone-400">
                  No previous orders placed yet. Place your first table order from the menu!
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => onOpenOrderStatus && onOpenOrderStatus(ord)}
                      className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-stone-900">
                            Ticket #{ord.ticketNumber}
                          </span>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full ${
                              ord.status === 'served'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-900 animate-pulse'
                            }`}
                          >
                            {ord.status}
                          </span>
                          {ord.stampAwarded && (
                            <span className="text-[9px] font-bold text-amber-900 bg-amber-100 px-1 py-0.2 rounded flex items-center gap-0.5">
                              <Award className="w-2.5 h-2.5 text-amber-600" />
                              <span>+1 Stamp</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {ord.table} • {ord.items.length} items • ₹{ord.total}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Restaurant Branch / Multi-tenant Switcher */}
            <div className="bg-stone-100 rounded-2xl p-3 border border-stone-200 text-xs">
              <span className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                Active Dining Location
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900">{activeCafe.name}</p>
                  <p className="text-[10px] text-stone-500">{activeCafe.address}</p>
                </div>
                <select
                  value={currentCafeId}
                  onChange={(e) => setCurrentCafeId(e.target.value)}
                  className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs font-semibold cursor-pointer"
                >
                  {SUPPORTED_CAFES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4-Tab Bottom Navigation */}
      <BottomNavigationWithOrderStrip
        cartItems={cartItems}
        onOpenCart={onOpenCart}
        onOpenRewards={onOpenRewards}
        onOpenProfile={() => setActiveNavTab('profile')}
        onNavigateHome={onBackToMenu}
        activeTab={activeNavTab}
        setActiveTab={setActiveNavTab}
        currentTable={currentTable}
      />
    </div>
  );
};
