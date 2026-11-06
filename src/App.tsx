/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Columns,
  Maximize2,
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  Sparkles,
  QrCode,
  User,
  ChefHat,
  Bell,
  MapPin,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { PhoneFrame } from './components/PhoneFrame';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { RewardsScreen } from './components/RewardsScreen';
import { OrderStatusScreen } from './components/OrderStatusScreen';
import { CustomerProfileScreen } from './components/CustomerProfileScreen';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { KitchenKdsDrawer } from './components/KitchenKdsDrawer';
import { CustomerNotificationBanner } from './components/CustomerNotificationBanner';
import { CartDrawer } from './components/CartDrawer';
import { TriptychView } from './components/TriptychView';
import { CustomerNavTab } from './components/BottomNavigationWithOrderStrip';
import { OwnerDashboard } from './components/dashboard/OwnerDashboard';
import { Dish, CartItem, Order, OrderStatus } from './types/restaurant';
import { DISHES } from './data/menuData';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import {
  updateKitchenOrderStatus,
  SUPPORTED_CAFES,
  listenToCafeOrders,
  listenToDishes,
} from './services/restaurantService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './services/firebase';

type ViewMode = 'interactive' | 'triptych' | 'responsive';
type ScreenType =
  | 'onboarding'
  | 'home'
  | 'detail'
  | 'rewards'
  | 'order_status'
  | 'profile';

const DEMO_TABLES = ['Table 4', 'Table 7', 'Table 14', 'Table 21', 'VIP Lounge'];

function RestaurantOSApp() {
  const {
    user,
    customerProfile,
    currentCafeId,
    setCurrentCafeId,
    refreshMembership,
  } = useAuth();

  const [appMode, setAppMode] = useState<'customer' | 'owner'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('mode') === 'owner' || params.get('dashboard') === 'true'
        ? 'owner'
        : 'customer';
    } catch {
      return 'customer';
    }
  });
  const [liveDishes, setLiveDishes] = useState<Dish[]>(DISHES);

  useEffect(() => {
    const unsubscribe = listenToDishes(currentCafeId, (dishes) => {
      setLiveDishes(dishes);
    });
    return () => unsubscribe();
  }, [currentCafeId]);

  const [viewMode, setViewMode] = useState<ViewMode>('interactive');
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [activeNavTab, setActiveNavTab] = useState<CustomerNavTab>('home');
  const [selectedDish, setSelectedDish] = useState<Dish>(DISHES[0]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isKdsOpen, setIsKdsOpen] = useState<boolean>(false);
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);

  // Dynamic QR Table parsing from URL parameter (?table=X or ?t=X) with localStorage fallback
  const [currentTable, setCurrentTable] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get('table') || params.get('t');
      if (urlTable) {
        const clean = urlTable.toLowerCase().startsWith('table')
          ? urlTable
          : `Table ${urlTable}`;
        localStorage.setItem('restaurantos_table', clean);
        return clean;
      }
      return localStorage.getItem('restaurantos_table') || 'Table 14';
    } catch {
      return 'Table 14';
    }
  });

  // Active Order state persisted in localStorage
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem('restaurantos_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Cart starts empty initially so bottom order line only appears when items are selected
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Listen for real-time kitchen status changes on active order from Firestore
  useEffect(() => {
    if (!activeOrder?.id) return;

    try {
      const orderRef = doc(db, 'cafes', currentCafeId, 'orders', activeOrder.id);
      const unsubscribe = onSnapshot(orderRef, (snap) => {
        if (snap.exists()) {
          const freshOrder = snap.data() as Order;
          setActiveOrder(freshOrder);
          localStorage.setItem('restaurantos_active_order', JSON.stringify(freshOrder));
          // When order status is updated by kitchen, refresh loyalty balance if stamp awarded
          if (freshOrder.stampAwarded) {
            refreshMembership();
          }
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Real-time order listener fallback:', err);
    }
  }, [activeOrder?.id, currentCafeId]);

  // Track active kitchen tickets count for KDS badge
  useEffect(() => {
    const unsubscribe = listenToCafeOrders(currentCafeId, (orders) => {
      const activeCount = orders.filter(
        (o) => o.status !== 'served' && o.status !== 'cancelled'
      ).length;
      setActiveOrdersCount(activeCount);
    });
    return () => unsubscribe();
  }, [currentCafeId]);

  // Update table in localStorage and URL state
  const handleTableChange = (newTable: string) => {
    setCurrentTable(newTable);
    try {
      localStorage.setItem('restaurantos_table', newTable);
    } catch {
      // Ignore
    }
  };

  // Handle adding items to cart
  const handleAddToCart = (
    dish: Dish,
    quantity = 1,
    doneness?: string,
    sauce?: string
  ) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.dish.id === dish.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            dish,
            quantity,
            doneness: doneness || dish.donenessOptions?.[0],
            sauce: sauce || dish.sauceOptions?.[0],
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (dishId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.dish.id === dishId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (dishId: string) => {
    setCartItems((prev) => prev.filter((item) => item.dish.id !== dishId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSelectDish = (dish: Dish) => {
    setSelectedDish(dish);
    setCurrentScreen('detail');
  };

  const handleOrderConfirmed = (order: Order) => {
    setActiveOrder(order);
    setCurrentScreen('order_status');
    setIsCartOpen(false);
  };

  const handleUpdateOrderStatus = async (newStatus: OrderStatus) => {
    if (activeOrder) {
      const updated = { ...activeOrder, status: newStatus };
      setActiveOrder(updated);
      try {
        localStorage.setItem('restaurantos_active_order', JSON.stringify(updated));
        await updateKitchenOrderStatus(currentCafeId, activeOrder.id, newStatus);
      } catch (err) {
        console.warn('Could not sync status with Firestore:', err);
      }
    }
  };

  const handleNavTabClick = (tab: CustomerNavTab) => {
    setActiveNavTab(tab);
    if (tab === 'home') setCurrentScreen('home');
    if (tab === 'rewards') setCurrentScreen('rewards');
    if (tab === 'cart') setIsCartOpen(true);
    if (tab === 'profile') setCurrentScreen('profile');
  };

  const activeCafe =
    SUPPORTED_CAFES.find((c) => c.id === currentCafeId) || SUPPORTED_CAFES[0];

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (appMode === 'owner') {
    return (
      <OwnerDashboard
        cafeId={currentCafeId}
        onSelectCafe={setCurrentCafeId}
        onSwitchToCustomerMenu={() => setAppMode('customer')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#ede8e1] flex flex-col font-sans text-stone-900 antialiased selection:bg-[#82181a] selection:text-white">
      {/* Top Studio Control Bar */}
      <header className="sticky top-0 z-40 bg-[#1c1917] text-white border-b border-stone-800 px-4 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#82181a] flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm tracking-tight">
                  Restaurant<span className="text-amber-400">OS</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/10 text-stone-300 px-2 py-0.5 rounded-full border border-white/10">
                  QR Dining
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                {activeCafe.name} · Real-time KDS & Automatic Loyalty Stamps
              </p>
            </div>
          </div>

          {/* Primary View Switcher: Customer QR Menu vs Owner Dashboard */}
          <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 shadow-inner">
            <button
              onClick={() => {
                setAppMode('customer');
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('mode');
                  window.history.replaceState({}, '', url.toString());
                } catch {}
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                appMode === 'customer'
                  ? 'bg-[#82181a] text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Diner QR Menu</span>
            </button>

            <button
              onClick={() => {
                setAppMode('owner');
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.set('mode', 'owner');
                  window.history.replaceState({}, '', url.toString());
                } catch {}
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-white bg-[#e11d48] hover:bg-[#be123c] shadow-sm ring-1 ring-white/20"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-rose-200" />
              <span>Owner Dashboard</span>
            </button>
          </div>

          {/* Customer View Modes (Single / 3-Screen / Full Width) */}
          <div className="hidden md:flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'interactive'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Interactive single mobile phone simulator"
            >
              <Smartphone className="w-3 h-3" />
              <span>Single</span>
            </button>

            <button
              onClick={() => setViewMode('triptych')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'triptych'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="View all 3 phones side-by-side"
            >
              <Columns className="w-3 h-3" />
              <span>3-Screen</span>
            </button>

            <button
              onClick={() => setViewMode('responsive')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'responsive'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Full width viewport"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Full Width</span>
            </button>
          </div>

          {/* Management & Table Controls */}
          <div className="flex items-center gap-2">

            {/* Multi-Restaurant Cafe Switcher */}
            <div className="relative group hidden lg:block">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-200 bg-stone-800/90 hover:bg-stone-800 px-2.5 py-1.5 rounded-lg border border-stone-700/80 cursor-pointer shadow-inner">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span className="max-w-[120px] truncate">{activeCafe.name}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </div>
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#1c1917] border border-stone-700 rounded-xl shadow-2xl p-1 z-50 hidden group-hover:block animate-in fade-in duration-150">
                <span className="block text-[9px] uppercase font-bold text-stone-400 px-2 py-1">
                  Select Restaurant Cafe
                </span>
                {SUPPORTED_CAFES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCurrentCafeId(c.id)}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      currentCafeId === c.id
                        ? 'bg-[#82181a] text-white font-bold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Kitchen KDS Management Display Button */}
            <button
              onClick={() => setIsKdsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800/90 hover:bg-stone-700 text-amber-300 border border-stone-700 shadow-sm cursor-pointer transition-colors relative"
              title="Open Kitchen Management & KDS"
            >
              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Kitchen KDS</span>
              {activeOrdersCount > 0 && (
                <span className="bg-amber-400 text-stone-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            {/* Customer Account Button */}
            <button
              onClick={() => {
                if (user) {
                  setCurrentScreen('profile');
                  setActiveNavTab('profile');
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800/90 hover:bg-stone-700 text-stone-200 border border-stone-700 shadow-sm cursor-pointer transition-colors"
              title="Customer Profile & Auth"
            >
              <User className="w-3.5 h-3.5 text-stone-300" />
              <span className="hidden md:inline">
                {user ? customerProfile?.fullName?.split(' ')[0] || 'Diner' : 'Sign In'}
              </span>
            </button>

            {/* Dynamic Table Selector for testing QR Scans */}
            <div className="relative group">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-stone-800/90 hover:bg-stone-800 px-2.5 py-1.5 rounded-lg border border-stone-700/80 cursor-pointer shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{currentTable}</span>
                <span className="text-[9px] uppercase font-bold text-stone-400 bg-black/40 px-1 py-0.2 rounded">
                  QR
                </span>
              </div>

              {/* Table Switcher Dropdown */}
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-[#1c1917] border border-stone-700 rounded-xl shadow-2xl p-1 z-50 hidden group-hover:block animate-in fade-in duration-150">
                <span className="block text-[9px] uppercase font-bold text-stone-400 px-2 py-1">
                  Simulate QR Table
                </span>
                {DEMO_TABLES.map((tbl) => (
                  <button
                    key={tbl}
                    onClick={() => handleTableChange(tbl)}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                      currentTable === tbl
                        ? 'bg-[#82181a] text-white font-bold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {tbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Order Status Indicator Chip if Order Active */}
            {activeOrder && (
              <button
                onClick={() => setCurrentScreen('order_status')}
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1.5 rounded-lg shadow-sm cursor-pointer hover:bg-emerald-900/60"
                title="View active kitchen ticket"
              >
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>#{activeOrder.ticketNumber} In Kitchen</span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-8 h-8 rounded-lg bg-[#82181a] hover:bg-[#6c1214] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              title="Open Bill & Order"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-stone-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="flex-1 flex flex-col justify-center items-center py-6 px-3 relative">
        {/* VIEW MODE 1: TRIPTYCH 3-SCREEN STUDIO VIEW */}
        {viewMode === 'triptych' && (
          <TriptychView
            onSelectDish={handleSelectDish}
            selectedDish={selectedDish}
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onOpenCart={() => {
              setViewMode('interactive');
              setIsCartOpen(true);
            }}
            onOpenRewards={() => {
              setViewMode('interactive');
              setCurrentScreen('rewards');
              setActiveNavTab('rewards');
            }}
            onOpenProfile={() => {
              setViewMode('interactive');
              setCurrentScreen('profile');
              setActiveNavTab('profile');
            }}
            currentTable={currentTable}
            onNavigateToHome={() => {
              setViewMode('interactive');
              setCurrentScreen('home');
            }}
          />
        )}

        {/* VIEW MODE 2: INTERACTIVE SINGLE MOBILE DEVICE */}
        {viewMode === 'interactive' && (
          <div className="flex flex-col items-center">
            {/* Quick Screen Switcher for Testing */}
            <div className="mb-3 flex items-center gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-2xl border border-stone-300 shadow-xs">
              <button
                onClick={() => setCurrentScreen('onboarding')}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  currentScreen === 'onboarding'
                    ? 'bg-[#82181a] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                1. Splash
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('home');
                  setActiveNavTab('home');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  currentScreen === 'home'
                    ? 'bg-[#82181a] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                2. Menu
              </button>
              <button
                onClick={() => setCurrentScreen('detail')}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  currentScreen === 'detail'
                    ? 'bg-[#82181a] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                3. Detail
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('rewards');
                  setActiveNavTab('rewards');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  currentScreen === 'rewards'
                    ? 'bg-[#82181a] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                4. Rewards
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('profile');
                  setActiveNavTab('profile');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  currentScreen === 'profile'
                    ? 'bg-[#82181a] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                5. Profile
              </button>
              {activeOrder && (
                <button
                  onClick={() => setCurrentScreen('order_status')}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                    currentScreen === 'order_status'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-emerald-800 hover:text-emerald-950 bg-emerald-50'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  6. Ticket
                </button>
              )}
            </div>

            <PhoneFrame
              overlay={
                <CartDrawer
                  isOpen={isCartOpen}
                  onClose={() => setIsCartOpen(false)}
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onClearCart={handleClearCart}
                  currentTable={currentTable}
                  onOrderConfirmed={handleOrderConfirmed}
                />
              }
            >
              {/* Real-time Order Alert Banner */}
              <CustomerNotificationBanner
                onOpenOrderStatus={() => setCurrentScreen('order_status')}
              />

              {currentScreen === 'onboarding' && (
                <OnboardingScreen
                  onStart={() => setCurrentScreen('home')}
                  onSkip={() => setCurrentScreen('home')}
                />
              )}

              {currentScreen === 'home' && (
                <HomeScreen
                  onSelectDish={handleSelectDish}
                  cartItems={cartItems}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onOpenCart={() => setIsCartOpen(true)}
                  onOpenRewards={() => {
                    setCurrentScreen('rewards');
                    setActiveNavTab('rewards');
                  }}
                  onOpenProfile={() => {
                    setCurrentScreen('profile');
                    setActiveNavTab('profile');
                  }}
                  currentTable={currentTable}
                  activeNavTab={activeNavTab}
                  setActiveNavTab={handleNavTabClick}
                  activeOrder={activeOrder}
                  onOpenOrderStatus={() => setCurrentScreen('order_status')}
                  dishes={liveDishes}
                />
              )}

              {currentScreen === 'detail' && (
                <ProductDetailScreen
                  dish={selectedDish}
                  onBack={() => setCurrentScreen('home')}
                  onAddToCart={(dish, qty, doneness, sauce) =>
                    handleAddToCart(dish, qty, doneness, sauce)
                  }
                  onOpenCart={() => setIsCartOpen(true)}
                  cartItems={cartItems}
                  onSelectRelatedDish={handleSelectDish}
                />
              )}

              {currentScreen === 'rewards' && (
                <div className="flex-1 flex flex-col h-full">
                  <div className="bg-[#82181a] px-4 pt-3 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setCurrentScreen('home');
                        setActiveNavTab('home');
                      }}
                      className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      ← Back to Menu
                    </button>
                  </div>
                  <RewardsScreen
                    onBack={() => {
                      setCurrentScreen('home');
                      setActiveNavTab('home');
                    }}
                    currentTable={currentTable}
                    cartItems={cartItems}
                    onOpenCart={() => setIsCartOpen(true)}
                    onNavigateHome={() => {
                      setCurrentScreen('home');
                      setActiveNavTab('home');
                    }}
                    onOpenProfile={() => {
                      setCurrentScreen('profile');
                      setActiveNavTab('profile');
                    }}
                    activeNavTab={activeNavTab}
                    setActiveNavTab={handleNavTabClick}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  />
                </div>
              )}

              {currentScreen === 'profile' && (
                <div className="flex-1 flex flex-col h-full">
                  <div className="bg-[#82181a] px-4 pt-3 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setCurrentScreen('home');
                        setActiveNavTab('home');
                      }}
                      className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      ← Back to Menu
                    </button>
                  </div>
                  <CustomerProfileScreen
                    onBackToMenu={() => {
                      setCurrentScreen('home');
                      setActiveNavTab('home');
                    }}
                    onOpenRewards={() => {
                      setCurrentScreen('rewards');
                      setActiveNavTab('rewards');
                    }}
                    onOpenCart={() => setIsCartOpen(true)}
                    onOpenOrderStatus={(ord) => {
                      setActiveOrder(ord);
                      setCurrentScreen('order_status');
                    }}
                    onSelectDish={handleSelectDish}
                    currentTable={currentTable}
                    cartItems={cartItems}
                    activeNavTab={activeNavTab}
                    setActiveNavTab={handleNavTabClick}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  />
                </div>
              )}

              {currentScreen === 'order_status' && activeOrder && (
                <OrderStatusScreen
                  order={activeOrder}
                  onBackToMenu={() => {
                    setCurrentScreen('home');
                    setActiveNavTab('home');
                  }}
                  onOrderMore={() => {
                    setCurrentScreen('home');
                    setActiveNavTab('home');
                  }}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onNavigateToRewards={() => {
                    setCurrentScreen('rewards');
                    setActiveNavTab('rewards');
                  }}
                />
              )}
            </PhoneFrame>
          </div>
        )}

        {/* VIEW MODE 3: FULL WIDTH RESPONSIVE VIEW */}
        {viewMode === 'responsive' && (
          <div className="w-full max-w-2xl bg-[#faf7f2] rounded-3xl shadow-xl border border-stone-300 overflow-hidden min-h-[85vh] flex flex-col relative">
            <CustomerNotificationBanner
              onOpenOrderStatus={() => setCurrentScreen('order_status')}
            />

            {currentScreen === 'onboarding' && (
              <OnboardingScreen
                onStart={() => setCurrentScreen('home')}
                onSkip={() => setCurrentScreen('home')}
              />
            )}

            {currentScreen === 'home' && (
              <HomeScreen
                onSelectDish={handleSelectDish}
                cartItems={cartItems}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
                onOpenCart={() => setIsCartOpen(true)}
                onOpenRewards={() => {
                  setCurrentScreen('rewards');
                  setActiveNavTab('rewards');
                }}
                onOpenProfile={() => {
                  setCurrentScreen('profile');
                  setActiveNavTab('profile');
                }}
                currentTable={currentTable}
                activeNavTab={activeNavTab}
                setActiveNavTab={handleNavTabClick}
                activeOrder={activeOrder}
                onOpenOrderStatus={() => setCurrentScreen('order_status')}
                dishes={liveDishes}
              />
            )}

            {currentScreen === 'detail' && (
              <ProductDetailScreen
                dish={selectedDish}
                onBack={() => setCurrentScreen('home')}
                onAddToCart={(dish, qty, doneness, sauce) =>
                  handleAddToCart(dish, qty, doneness, sauce)
                }
                onOpenCart={() => setIsCartOpen(true)}
                cartItems={cartItems}
                onSelectRelatedDish={handleSelectDish}
              />
            )}

            {currentScreen === 'rewards' && (
              <div className="flex-1 flex flex-col h-full relative">
                <div className="bg-[#82181a] px-4 pt-3 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setCurrentScreen('home');
                      setActiveNavTab('home');
                    }}
                    className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to Menu
                  </button>
                </div>
                <RewardsScreen
                  onBack={() => {
                    setCurrentScreen('home');
                    setActiveNavTab('home');
                  }}
                  currentTable={currentTable}
                  cartItems={cartItems}
                  onOpenCart={() => setIsCartOpen(true)}
                  onNavigateHome={() => {
                    setCurrentScreen('home');
                    setActiveNavTab('home');
                  }}
                  onOpenProfile={() => {
                    setCurrentScreen('profile');
                    setActiveNavTab('profile');
                  }}
                  activeNavTab={activeNavTab}
                  setActiveNavTab={handleNavTabClick}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                />
              </div>
            )}

            {currentScreen === 'profile' && (
              <div className="flex-1 flex flex-col h-full relative">
                <div className="bg-[#82181a] px-4 pt-3 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setCurrentScreen('home');
                      setActiveNavTab('home');
                    }}
                    className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to Menu
                  </button>
                </div>
                <CustomerProfileScreen
                  onBackToMenu={() => {
                    setCurrentScreen('home');
                    setActiveNavTab('home');
                  }}
                  onOpenRewards={() => {
                    setCurrentScreen('rewards');
                    setActiveNavTab('rewards');
                  }}
                  onOpenCart={() => setIsCartOpen(true)}
                  onOpenOrderStatus={(ord) => {
                    setActiveOrder(ord);
                    setCurrentScreen('order_status');
                  }}
                  onSelectDish={handleSelectDish}
                  currentTable={currentTable}
                  cartItems={cartItems}
                  activeNavTab={activeNavTab}
                  setActiveNavTab={handleNavTabClick}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                />
              </div>
            )}

            {currentScreen === 'order_status' && activeOrder && (
              <OrderStatusScreen
                order={activeOrder}
                onBackToMenu={() => {
                  setCurrentScreen('home');
                  setActiveNavTab('home');
                }}
                onOrderMore={() => {
                  setCurrentScreen('home');
                  setActiveNavTab('home');
                }}
                onUpdateStatus={handleUpdateOrderStatus}
                onNavigateToRewards={() => {
                  setCurrentScreen('rewards');
                  setActiveNavTab('rewards');
                }}
              />
            )}

            {/* In-Frame Cart Drawer */}
            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              currentTable={currentTable}
              onOrderConfirmed={handleOrderConfirmed}
            />
          </div>
        )}
      </main>

      {/* Customer Authentication Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setCurrentScreen('profile');
          setActiveNavTab('profile');
        }}
      />

      {/* Kitchen Management & KDS Drawer */}
      <KitchenKdsDrawer
        isOpen={isKdsOpen}
        onClose={() => setIsKdsOpen(false)}
        cafeId={currentCafeId}
      />

      {/* Footer Design Notes */}
      <footer className="py-3 px-4 text-center text-xs text-stone-500 bg-[#ede8e1] border-t border-stone-300">
        <p className="max-w-xl mx-auto">
          RestaurantOS QR Interface · Multi-Tenant ({activeCafe.name}), Live KDS Kitchen Order Management, Phone OTP Customer Auth & Atomic Loyalty Stamp Engine.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RestaurantOSApp />
    </AuthProvider>
  );
}
