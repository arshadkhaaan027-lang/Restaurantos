import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Star,
  Plus,
  Minus,
  Sparkles,
  ChefHat,
  Flame,
  Check,
  ShieldCheck,
  Clock,
  FlameKindling,
} from 'lucide-react';
import { Dish, CartItem } from '../types/restaurant';
import { DISHES } from '../data/menuData';

interface ProductDetailScreenProps {
  dish: Dish;
  onBack: () => void;
  onAddToCart: (dish: Dish, quantity: number, doneness?: string, sauce?: string) => void;
  onOpenCart: () => void;
  cartItems: CartItem[];
  onSelectRelatedDish: (dish: Dish) => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  dish,
  onBack,
  onAddToCart,
  onOpenCart,
  cartItems,
  onSelectRelatedDish,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [selectedDoneness, setSelectedDoneness] = useState<string>(
    dish.donenessOptions ? dish.donenessOptions[1] || dish.donenessOptions[0] : ''
  );
  const [selectedSauce, setSelectedSauce] = useState<string>(
    dish.sauceOptions ? dish.sauceOptions[0] : ''
  );
  const [showAddedToast, setShowAddedToast] = useState<boolean>(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Recommendations: Other dishes
  const relatedDishes = DISHES.filter((d) => d.id !== dish.id).slice(0, 3);

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    onAddToCart(dish, quantity, selectedDoneness, selectedSauce);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 1500);
  };

  const totalPrice = dish.price * quantity;

  return (
    <div className="flex-1 flex flex-col bg-[#faf7f2] relative pb-24">
      {/* Top Media Section with Large Realistic Food Photography */}
      <div className="relative w-full h-[320px] bg-stone-900 overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {/* Subtle Vignette Scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30 pointer-events-none"></div>

        {/* Floating Top Controls Bar matching reference image */}
        <div className="absolute top-3 inset-x-0 px-4 flex items-center justify-between z-20">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-stone-800 hover:bg-white active:scale-90 transition-all cursor-pointer"
            title="Back to menu"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Right Action Icons: Favorite & Cart */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-stone-800 hover:bg-white active:scale-90 transition-all cursor-pointer"
              title="Add to wishlist"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorited
                    ? 'fill-[#82181a] text-[#82181a]'
                    : 'text-stone-700 stroke-[2]'
                }`}
              />
            </button>

            <button
              onClick={onOpenCart}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-stone-800 hover:bg-white active:scale-90 transition-all relative cursor-pointer"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-stone-800 stroke-[2]" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#82181a] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Rising Editorial Rounded Sheet */}
      <div className="relative -mt-8 z-10 bg-[#faf7f2] rounded-t-[32px] pt-6 px-5 space-y-4 shadow-xl">
        {/* Best Seller Pill & Prep Badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#82181a] bg-[#82181a]/10 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-[#82181a]" />
            {dish.isBestSeller ? 'Best Seller' : 'Chef Special'}
          </span>

          {dish.prepTime && (
            <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3" />
              {dish.prepTime}
            </span>
          )}
        </div>

        {/* Product Title & Price */}
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 leading-tight">
            {dish.name}
          </h1>
          <div className="flex items-baseline gap-1.5 mt-1 font-sans">
            <span className="text-2xl font-extrabold text-stone-900 tabular-nums">
              ₹{dish.price.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {dish.unitLabel || '/ plate'}
            </span>
          </div>
        </div>

        {/* Rating Stars & Reviews */}
        <div className="flex items-center gap-2 pb-1 border-b border-stone-200/60">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400"
              />
            ))}
          </div>
          <span className="text-xs font-bold text-stone-900">{dish.rating}</span>
          <span className="text-xs text-stone-500">
            ({dish.reviewCount} table reviews)
          </span>
        </div>

        {/* Paragraph Description */}
        <p className="text-stone-600 text-[13px] leading-relaxed">
          {dish.description}
        </p>

        {/* 3 Feature Highlights matching reference image */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {dish.features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-2.5 border border-stone-200/70 shadow-xs flex flex-col items-center text-center"
            >
              <div className="w-7 h-7 rounded-full bg-[#82181a]/10 text-[#82181a] flex items-center justify-center mb-1">
                {idx === 0 ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : idx === 1 ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <FlameKindling className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="text-[11px] font-bold text-stone-900 leading-tight">
                {feat.title}
              </span>
              <span className="text-[9px] text-stone-500 mt-0.5 leading-tight">
                {feat.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Optional Doneness Selection for Steaks */}
        {dish.donenessOptions && dish.donenessOptions.length > 0 && (
          <div className="pt-2">
            <label className="block text-xs font-bold text-stone-900 mb-2">
              Select Temperature
            </label>
            <div className="flex flex-wrap gap-1.5">
              {dish.donenessOptions.map((opt) => {
                const isSelected = selectedDoneness === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setSelectedDoneness(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#82181a] text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-stone-200/80 hover:border-stone-400'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Optional Sauce Selection */}
        {dish.sauceOptions && dish.sauceOptions.length > 0 && (
          <div className="pt-1">
            <label className="block text-xs font-bold text-stone-900 mb-2">
              Chef's House Butter / Sauce
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {dish.sauceOptions.map((opt) => {
                const isSelected = selectedSauce === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setSelectedSauce(opt)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-left truncate transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#82181a] text-white shadow-xs font-semibold'
                        : 'bg-white text-stone-700 border border-stone-200/80 hover:border-stone-400'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* "You May Also Like" carousel section with BOLD RED PLUS buttons */}
        <div className="pt-4 border-t border-stone-200/60">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-serif text-sm font-bold text-stone-900">
              You May Also Like
            </h3>
            <span className="text-[11px] font-medium text-stone-500">
              Chef Pairings
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {relatedDishes.map((rel) => {
              const relQty =
                cartItems.find((c) => c.dish.id === rel.id)?.quantity || 0;
              const isRelSelected = relQty > 0;

              return (
                <div
                  key={rel.id}
                  className={`rounded-2xl p-2 border transition-all flex flex-col justify-between ${
                    isRelSelected
                      ? 'bg-[#fdfbf9] border-[#82181a] ring-1 ring-[#82181a]/25 shadow-xs'
                      : 'bg-white border-stone-200/70 shadow-xs hover:shadow-sm'
                  }`}
                >
                  {/* Upper clickable area to switch to this dish */}
                  <div
                    onClick={() => onSelectRelatedDish(rel)}
                    className="cursor-pointer group flex-1"
                    title={`View details for ${rel.name}`}
                  >
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-stone-100 mb-1.5">
                      <img
                        src={rel.image}
                        alt={rel.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      {isRelSelected && (
                        <div className="absolute top-1 right-1 bg-[#82181a] text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-sm">
                          <Check className="w-2 h-2 stroke-[3]" />
                          <span>{relQty}</span>
                        </div>
                      )}
                    </div>
                    <h4
                      className={`font-serif text-[11px] font-bold line-clamp-1 transition-colors ${
                        isRelSelected ? 'text-[#82181a]' : 'text-stone-900'
                      }`}
                    >
                      {rel.name}
                    </h4>
                  </div>

                  {/* Bottom row with isolated PLUS button */}
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-stone-100">
                    <span className="text-xs font-bold text-stone-800 font-sans tabular-nums">
                      ₹{rel.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onAddToCart(rel, 1);
                      }}
                      title={`Add ${rel.name} to cart`}
                      className={`w-6 h-6 rounded-md flex items-center justify-center shadow-xs cursor-pointer active:scale-90 transition-all ${
                        isRelSelected
                          ? 'bg-[#82181a] text-white ring-1 ring-white/50'
                          : 'bg-[#82181a] hover:bg-[#6c1214] text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Added Toast Notification */}
      {showAddedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Added {quantity}x to order!</span>
        </div>
      )}

      {/* Sticky Bottom Action Bar matching reference image */}
      {/* Contains Quantity Stepper and the Main Add to Cart button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-5 py-3 shadow-2xl">
        <div className="flex items-center gap-3 max-w-sm mx-auto">
          {/* Stepper [- 1 +] */}
          <div className="flex items-center bg-[#faf7f2] border border-stone-200/80 rounded-2xl p-1 gap-2 shrink-0">
            <button
              onClick={handleDecrement}
              className="w-8 h-8 rounded-xl bg-white hover:bg-stone-100 active:scale-90 text-stone-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="text-sm font-bold text-stone-900 w-5 text-center font-sans">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              className="w-8 h-8 rounded-xl bg-white hover:bg-stone-100 active:scale-90 text-stone-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* MAIN ADD TO CART BUTTON (Explicitly preserved as requested) */}
          <button
            onClick={handleAddToCart}
            className="flex-1 h-12 rounded-2xl bg-[#82181a] hover:bg-[#6e1214] active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#82181a]/25 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
            <span className="font-sans font-bold tabular-nums">Add to Cart • ₹{totalPrice.toLocaleString('en-IN')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
