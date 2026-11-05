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
} from 'lucide-react';
import { PhoneFrame } from './components/PhoneFrame';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { RewardsScreen } from './components/RewardsScreen';
import { OrderStatusScreen } from './components/OrderStatusScreen';
import { CartDrawer } from './components/CartDrawer';
import { TriptychView } from './components/TriptychView';
import { Dish, CartItem, Order, OrderStatus } from './types/restaurant';
import { DISHES } from './data/menuData';

type ViewMode = 'interactive' | 'triptych' | 'responsive';
type ScreenType = 'onboarding' | 'home' | 'detail' | 'rewards' | 'order_status';
type NavTab = 'home' | 'rewards' | 'cart';

const DEMO_TABLES = ['Table 4', 'Table 7', 'Table 14', 'Table 21', 'VIP Lounge'];

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('interactive');
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('home');
  const [selectedDish, setSelectedDish] = useState<Dish>(DISHES[0]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

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

  // Update table in localStorage and URL state
  const handleTableChange = (newTable: string) => {
    setCurrentTable(newTable);
    try {
      localStorage.setItem('restaurantos_table', newTable);
    } catch {
      // Ignore
    }
  };

  // Handle adding items to cart (or increasing quantity if already added)
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

  const handleUpdateOrderStatus = (newStatus: OrderStatus) => {
    if (activeOrder) {
      const updated = { ...activeOrder, status: newStatus };
      setActiveOrder(updated);
      try {
        localStorage.setItem('restaurantos_active_order', JSON.stringify(updated));
      } catch {
        // Ignore
      }
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

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
                  QR Ordering
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Dynamic QR Table · Live Kitchen Tracking · WhatsApp Member Club · Coupons
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-stone-900/90 p-1 rounded-xl border border-stone-800 shadow-inner">
            <button
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'interactive'
                  ? 'bg-[#82181a] text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Interactive single mobile phone simulator"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Single Device</span>
            </button>

            <button
              onClick={() => setViewMode('triptych')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'triptych'
                  ? 'bg-[#82181a] text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="View all 3 phones side-by-side matching reference image"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">3-Screen Studio</span>
            </button>

            <button
              onClick={() => setViewMode('responsive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'responsive'
                  ? 'bg-[#82181a] text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Full width viewport"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Full Width</span>
            </button>
          </div>

          {/* Table Switcher & Cart button */}
          <div className="flex items-center gap-2">
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
            onOpenCart={() => setIsCartOpen(true)}
            onOpenRewards={() => {
              setViewMode('interactive');
              setCurrentScreen('rewards');
              setActiveNavTab('rewards');
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
                4. Loyalty & WhatsApp
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
                  5. Kitchen Ticket
                </button>
              )}
            </div>

            <PhoneFrame>
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
                  currentTable={currentTable}
                  activeNavTab={activeNavTab}
                  setActiveNavTab={(tab) => {
                    setActiveNavTab(tab);
                    if (tab === 'rewards') setCurrentScreen('rewards');
                    if (tab === 'home') setCurrentScreen('home');
                    if (tab === 'cart') setIsCartOpen(true);
                  }}
                  activeOrder={activeOrder}
                  onOpenOrderStatus={() => setCurrentScreen('order_status')}
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
                    activeNavTab={activeNavTab}
                    setActiveNavTab={(tab) => {
                      setActiveNavTab(tab);
                      if (tab === 'rewards') setCurrentScreen('rewards');
                      if (tab === 'home') setCurrentScreen('home');
                      if (tab === 'cart') setIsCartOpen(true);
                    }}
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
                />
              )}
            </PhoneFrame>
          </div>
        )}

        {/* VIEW MODE 3: FULL WIDTH RESPONSIVE VIEW */}
        {viewMode === 'responsive' && (
          <div className="w-full max-w-2xl bg-[#faf7f2] rounded-3xl shadow-xl border border-stone-300 overflow-hidden min-h-[85vh] flex flex-col">
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
                currentTable={currentTable}
                activeNavTab={activeNavTab}
                setActiveNavTab={(tab) => {
                  setActiveNavTab(tab);
                  if (tab === 'rewards') setCurrentScreen('rewards');
                  if (tab === 'home') setCurrentScreen('home');
                  if (tab === 'cart') setIsCartOpen(true);
                }}
                activeOrder={activeOrder}
                onOpenOrderStatus={() => setCurrentScreen('order_status')}
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
                  activeNavTab={activeNavTab}
                  setActiveNavTab={(tab) => {
                    setActiveNavTab(tab);
                    if (tab === 'rewards') setCurrentScreen('rewards');
                    if (tab === 'home') setCurrentScreen('home');
                    if (tab === 'cart') setIsCartOpen(true);
                  }}
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
              />
            )}
          </div>
        )}
      </main>

      {/* Bill & Order Drawer Overlay */}
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

      {/* Footer Design Notes */}
      <footer className="py-3 px-4 text-center text-xs text-stone-500 bg-[#ede8e1] border-t border-stone-300">
        <p className="max-w-xl mx-auto">
          RestaurantOS Customer QR Interface · Dynamic QR Table ({currentTable}), live order tracking, WhatsApp Diner Club, and promo coupon engine.
        </p>
      </footer>
    </div>
  );
}
