import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Search,
  SlidersHorizontal,
  Plus,
  Minus,
  Flame,
  Wine,
  Sparkles,
  Soup,
  Cake,
  Beef,
  MapPin,
  ArrowRight,
  Star,
  Check,
} from 'lucide-react';
import { Dish, CartItem, Order } from '../types/restaurant';
import { CATEGORIES, DISHES } from '../data/menuData';
import { BottomNavigationWithOrderStrip } from './BottomNavigationWithOrderStrip';

interface HomeScreenProps {
  onSelectDish: (dish: Dish) => void;
  cartItems: CartItem[];
  onAddToCart: (dish: Dish, quantity?: number) => void;
  onUpdateQuantity?: (dishId: string, delta: number) => void;
  onOpenCart: () => void;
  onOpenRewards: () => void;
  onOpenTablePicker?: () => void;
  currentTable: string;
  activeNavTab: 'home' | 'rewards' | 'cart';
  setActiveNavTab: (tab: 'home' | 'rewards' | 'cart') => void;
  activeOrder?: Order | null;
  onOpenOrderStatus?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectDish,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onOpenCart,
  onOpenRewards,
  currentTable,
  activeNavTab,
  setActiveNavTab,
  activeOrder,
  onOpenOrderStatus,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter dishes by category and search
  const filteredDishes = DISHES.filter((dish) => {
    const matchesCategory =
      selectedCategory === 'all' || dish.category === selectedCategory;
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const bestSellers = filteredDishes.filter((d) => d.isBestSeller);
  const otherDishes = filteredDishes.filter((d) => !d.isBestSeller);

  // Total items in cart
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Helper to get item count in cart
  const getItemQuantityInCart = (dishId: string) => {
    const found = cartItems.find((item) => item.dish.id === dishId);
    return found ? found.quantity : 0;
  };

  const handlePlusClick = (e: React.MouseEvent, dish: Dish) => {
    e.preventDefault();
    e.stopPropagation(); // Explicitly stop propagation to prevent opening the detail screen
    onAddToCart(dish, 1);
  };

  const handleMinusClick = (e: React.MouseEvent, dish: Dish) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUpdateQuantity) {
      onUpdateQuantity(dish.id, -1);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'beef':
        return <Beef className="w-4 h-4" />;
      case 'soup':
        return <Soup className="w-4 h-4" />;
      case 'flame':
        return <Flame className="w-4 h-4" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'wine':
        return <Wine className="w-4 h-4" />;
      case 'cake':
        return <Cake className="w-4 h-4" />;
      default:
        return <UtensilsCrossed className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#faf7f2] relative overflow-hidden">
      {/* FIXED / PINNED TOP BURGUNDY COLOR BAR - Never scrolls, permanently visible! */}
      <div className="bg-[#82181a] text-white pt-2 pb-4 px-5 rounded-b-[24px] shadow-md z-30 shrink-0">
        {/* Top Bar with Brand & QR Table Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <div className="font-serif text-lg font-bold tracking-tight leading-none">
                Restaurant<span className="text-amber-300">OS</span>
              </div>
              <p className="text-[10px] text-white/80 font-normal mt-0.5">
                Fresh Meals. Better Moments.
              </p>
            </div>
          </div>

          {/* Read-only Table QR Badge (Automatically detected from scanned QR code) */}
          <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-full border border-white/20 text-xs font-medium text-white shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{currentTable}</span>
            <span className="text-[9px] text-amber-300 font-bold uppercase tracking-wider bg-white/10 px-1 py-0.2 rounded">
              QR
            </span>
          </div>
        </div>

        {/* Search Bar with Filter Sliders */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for dishes, cuts, pasta..."
              className="w-full h-10 pl-10 pr-3 bg-white text-stone-900 placeholder:text-stone-400 text-xs rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-amber-300 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {}}
            className="w-10 h-10 rounded-xl bg-white text-stone-800 flex items-center justify-center shadow-sm hover:bg-stone-50 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Filter options"
          >
            <SlidersHorizontal className="w-4 h-4 text-stone-700" />
          </button>
        </div>

        {/* Active Live Order Tracking Banner */}
        {activeOrder && onOpenOrderStatus && (
          <button
            type="button"
            onClick={onOpenOrderStatus}
            className="w-full mt-2.5 bg-black/30 hover:bg-black/45 text-white rounded-xl p-2 px-3 flex items-center justify-between border border-amber-300/40 text-xs shadow-inner cursor-pointer group transition-all animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
              <span className="font-bold text-amber-200 truncate">
                Ticket #{activeOrder.ticketNumber} in Kitchen
              </span>
              <span className="text-[10px] text-white/70 shrink-0">
                ~{activeOrder.estimatedMinutes} min
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-300 group-hover:translate-x-0.5 transition-transform shrink-0">
              Track ➔
            </span>
          </button>
        )}
      </div>

      {/* Scrollable Main Body Content with padding bottom so items are never obscured */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-4 pt-3.5 pb-36 space-y-4">
        {/* Circular Category Navigation Rail on crisp white container */}
        <div className="bg-white rounded-2xl p-2.5 shadow-xs border border-stone-200/60">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? 'bg-[#82181a] text-white shadow-md shadow-[#82181a]/30 scale-105'
                          : 'bg-[#faf7f2] text-stone-600 border border-stone-200/80 group-hover:border-stone-400'
                      }`}
                    >
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <span
                      className={`text-[11px] font-medium tracking-tight ${
                        isActive ? 'text-[#82181a] font-semibold' : 'text-stone-500'
                      }`}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured Promotional Banner */}
          <div
            onClick={() => onSelectDish(DISHES[0])}
            className="relative bg-gradient-to-r from-[#4d0c10] via-[#74151a] to-[#8a1921] rounded-3xl p-4 text-white overflow-hidden shadow-sm cursor-pointer group hover:shadow-md transition-all"
          >
            {/* Subtle background glow */}
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="space-y-1.5 max-w-[170px]">
                <div className="inline-flex items-center gap-1 bg-amber-400/20 border border-amber-300/30 text-amber-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  <Sparkles className="w-2.5 h-2.5" />
                  100% Chef Cut
                </div>
                <h2 className="font-serif text-lg font-bold leading-tight text-white group-hover:text-amber-100 transition-colors">
                  Premium Beef Cuts
                </h2>
                <p className="text-[11px] text-white/80">
                  Naturally Flame Grilled
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white text-[#82181a] px-3 py-1 rounded-full shadow-sm group-hover:bg-amber-100 transition-colors">
                    Order Special <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Banner Food Imagery */}
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-md shrink-0 bg-stone-900">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80"
                  alt="Premium Ribeye Cut"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-[9px] font-bold text-amber-300 px-1.5 py-0.5 rounded-md border border-white/20">
                  A5
                </div>
              </div>
            </div>
          </div>

          {/* "Best Sellers" Section */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-serif text-base font-bold text-stone-900 tracking-tight">
                Best Sellers
              </h3>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-[11px] font-semibold text-stone-500 hover:text-[#82181a] flex items-center gap-0.5 transition-colors"
              >
                <span>See All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Horizontal / Grid of Product Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {bestSellers.slice(0, 3).map((dish) => {
                const qtyInCart = getItemQuantityInCart(dish.id);
                const isSelected = qtyInCart > 0;

                return (
                  <div
                    key={dish.id}
                    className={`rounded-2xl p-2.5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#fdfbf9] border-[#82181a] ring-2 ring-[#82181a]/25 shadow-md'
                        : 'bg-white border-stone-200/70 shadow-xs hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                    {/* UPPER CLICKABLE CARD AREA: ONLY this area opens the product detail screen */}
                    <div
                      onClick={() => onSelectDish(dish)}
                      className="cursor-pointer group/details flex-1"
                      title={`View details for ${dish.name}`}
                    >
                      {/* Image container */}
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-stone-100 mb-2">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/details:scale-108 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        {/* Rating Badge */}
                        <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-[9px] font-semibold text-amber-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-300 stroke-none" />
                          {dish.rating}
                        </div>

                        {/* Selected Indicator Badge on Image */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-[#82181a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm animate-in fade-in zoom-in-95 duration-150">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>{qtyInCart}</span>
                          </div>
                        )}
                      </div>

                      {/* Title & Price */}
                      <div>
                        <h4
                          className={`font-serif text-xs font-bold line-clamp-1 transition-colors ${
                            isSelected
                              ? 'text-[#82181a]'
                              : 'text-stone-900 group-hover/details:text-[#82181a]'
                          }`}
                        >
                          {dish.name}
                        </h4>
                        <div className="flex items-center gap-1 mt-1 font-sans">
                          <span className="text-xs font-bold text-stone-800 tabular-nums">
                            ₹{dish.price.toLocaleString('en-IN')}
                          </span>
                          {dish.unitLabel && (
                            <span className="text-[10px] text-stone-400 font-normal">
                              {dish.unitLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM ACTION BAR: COMPLETELY ISOLATED - CANNOT TRIGGER onSelectDish */}
                    <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-stone-100">
                      {isSelected ? (
                        <>
                          {/* Selected Label */}
                          <span className="text-[10px] font-bold text-[#82181a]">
                            In Order
                          </span>

                          {/* Active Stepper Control: Clearly indicates item is selected and allows quick + / - */}
                          <div className="flex items-center bg-[#82181a] text-white rounded-lg p-0.5 shadow-sm">
                            <button
                              type="button"
                              onClick={(e) => handleMinusClick(e, dish)}
                              className="w-5 h-5 rounded hover:bg-black/20 active:scale-90 flex items-center justify-center text-white cursor-pointer transition-colors"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3 stroke-[2.8]" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold font-sans">
                              {qtyInCart}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handlePlusClick(e, dish)}
                              className="w-5 h-5 rounded hover:bg-black/20 active:scale-90 flex items-center justify-center text-white cursor-pointer transition-colors"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3 stroke-[2.8]" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-[9px] text-stone-400 font-medium">Add</span>

                          {/* Bold red rounded square button containing a white PLUS (+) symbol */}
                          <button
                            type="button"
                            onClick={(e) => handlePlusClick(e, dish)}
                            title={`Add ${dish.name} to order`}
                            className="w-7 h-7 rounded-lg bg-[#82181a] hover:bg-[#6c1214] active:scale-90 text-white flex items-center justify-center shadow-sm transition-all duration-150 cursor-pointer"
                          >
                            <Plus className="w-4 h-4 stroke-[2.8]" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Secondary Section: "Chef's Curated Selection" */}
          {otherDishes.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-serif text-base font-bold text-stone-900 tracking-tight">
                  Curated Kitchen Mains
                </h3>
                <span className="text-[11px] text-stone-500">
                  {otherDishes.length} dishes
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {otherDishes.slice(0, 4).map((dish) => {
                  const qtyInCart = getItemQuantityInCart(dish.id);
                  const isSelected = qtyInCart > 0;

                  return (
                    <div
                      key={dish.id}
                      className={`rounded-2xl p-2.5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#fdfbf9] border-[#82181a] ring-2 ring-[#82181a]/25 shadow-md'
                          : 'bg-white border-stone-200/70 shadow-xs hover:border-stone-300 hover:shadow-sm'
                      }`}
                    >
                      {/* UPPER CLICKABLE AREA */}
                      <div
                        onClick={() => onSelectDish(dish)}
                        className="cursor-pointer group/details flex-1"
                        title={`View details for ${dish.name}`}
                      >
                        <div className="relative w-full h-24 rounded-xl overflow-hidden bg-stone-100 mb-2">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover/details:scale-108 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-[9px] font-semibold text-amber-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-300 stroke-none" />
                            {dish.rating}
                          </div>

                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-[#82181a] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              <span>{qtyInCart}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4
                            className={`font-serif text-xs font-bold line-clamp-1 transition-colors ${
                              isSelected
                                ? 'text-[#82181a]'
                                : 'text-stone-900 group-hover/details:text-[#82181a]'
                            }`}
                          >
                            {dish.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-1 font-sans">
                            <span className="text-xs font-bold text-stone-800 tabular-nums">
                              ₹{dish.price.toLocaleString('en-IN')}
                            </span>
                            {dish.unitLabel && (
                              <span className="text-[10px] text-stone-400 font-normal">
                                {dish.unitLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* BOTTOM ISOLATED ACTION BAR */}
                      <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-stone-100">
                        {isSelected ? (
                          <>
                            <span className="text-[10px] font-bold text-[#82181a]">
                              In Order
                            </span>

                            <div className="flex items-center bg-[#82181a] text-white rounded-lg p-0.5 shadow-sm">
                              <button
                                type="button"
                                onClick={(e) => handleMinusClick(e, dish)}
                                className="w-5 h-5 rounded hover:bg-black/20 active:scale-90 flex items-center justify-center text-white cursor-pointer transition-colors"
                                title="Decrease quantity"
                              >
                                <Minus className="w-3 h-3 stroke-[2.8]" />
                              </button>
                              <span className="w-5 text-center text-xs font-bold font-sans">
                                {qtyInCart}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handlePlusClick(e, dish)}
                                className="w-5 h-5 rounded hover:bg-black/20 active:scale-90 flex items-center justify-center text-white cursor-pointer transition-colors"
                                title="Increase quantity"
                              >
                                <Plus className="w-3 h-3 stroke-[2.8]" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-[9px] text-stone-400 font-medium">Add</span>

                            <button
                              type="button"
                              onClick={(e) => handlePlusClick(e, dish)}
                              title={`Add ${dish.name} to order`}
                              className="w-7 h-7 rounded-lg bg-[#82181a] hover:bg-[#6c1214] active:scale-90 text-white flex items-center justify-center shadow-sm transition-all duration-150 cursor-pointer"
                            >
                              <Plus className="w-4 h-4 stroke-[2.8]" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>


      {/* 3-TAB PERMANENT BOTTOM NAVIGATION & FLOATING ORDER STRIP (Only visible when items are selected) */}
      <BottomNavigationWithOrderStrip
        cartItems={cartItems}
        onOpenCart={onOpenCart}
        onOpenRewards={onOpenRewards}
        onNavigateHome={() => setActiveNavTab('home')}
        activeTab={activeNavTab}
        currentTable={currentTable}
      />
    </div>
  );
};
