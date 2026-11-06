import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Star,
  Check,
  Plus,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Dish } from '../../types/restaurant';
import { toggleDishTodaysSpecial } from '../../services/restaurantService';

interface TodaysSpecialViewProps {
  dishes: Dish[];
  cafeId: string;
  currencySymbol?: string;
  onNavigateToTab: (tab: any) => void;
}

export const TodaysSpecialView: React.FC<TodaysSpecialViewProps> = ({
  dishes,
  cafeId,
  currencySymbol = '₹',
  onNavigateToTab,
}) => {
  const [editingSpecialId, setEditingSpecialId] = useState<string | null>(null);
  const [specialPriceInput, setSpecialPriceInput] = useState<number>(0);

  const specialDishes = dishes.filter((d) => Boolean(d.isTodaysSpecial));
  const otherDishes = dishes.filter((d) => !d.isTodaysSpecial);

  const handleRemoveSpecial = async (dishId: string) => {
    try {
      await toggleDishTodaysSpecial(cafeId, dishId, false);
    } catch (err) {
      console.error('Failed to remove special:', err);
    }
  };

  const handleAddSpecial = async (dish: Dish) => {
    try {
      const discountPrice = Math.round(dish.price * 0.85);
      await toggleDishTodaysSpecial(cafeId, dish.id, true, discountPrice);
    } catch (err) {
      console.error('Failed to add special:', err);
    }
  };

  const handleUpdatePrice = async (dishId: string) => {
    try {
      await toggleDishTodaysSpecial(cafeId, dishId, true, specialPriceInput);
      setEditingSpecialId(null);
    } catch (err) {
      console.error('Failed to update special price:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-[#82181a] to-[#e11d48] p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
              Chef&apos;s Featured Spotlight
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Today&apos;s Specials & Chef Highlights
          </h1>
          <p className="text-xs text-white/80 mt-1 leading-relaxed">
            Highlighted dishes take center stage on diners&apos; mobile phone screens when they scan table QR codes.
          </p>
        </div>
      </div>

      {/* Active Specials Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#e11d48]" />
            <span>Currently Active Specials ({specialDishes.length})</span>
          </h2>
          <span className="text-[11px] text-stone-400">
            Visible on QR Homepage
          </span>
        </div>

        {specialDishes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
            <p className="text-xs text-stone-500">
              No specials currently selected. Pick from the catalog below to feature dishes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {specialDishes.map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/9 bg-stone-100">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#e11d48] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      Today&apos;s Special
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-sm text-stone-900">
                        {dish.name}
                      </h3>
                      <div className="text-right">
                        <span className="text-base font-bold text-[#e11d48]">
                          {currencySymbol}{dish.specialPrice || dish.price}
                        </span>
                        {dish.specialPrice && (
                          <span className="text-[10px] text-stone-400 line-through block">
                            {currencySymbol}{dish.price}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-2">
                      {dish.description}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                  {editingSpecialId === dish.id ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <input
                        type="number"
                        value={specialPriceInput}
                        onChange={(e) =>
                          setSpecialPriceInput(Number(e.target.value))
                        }
                        className="w-24 px-2 py-1 text-xs border rounded-lg"
                      />
                      <button
                        onClick={() => handleUpdatePrice(dish.id)}
                        className="px-2.5 py-1 bg-[#e11d48] text-white text-xs font-bold rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSpecialId(null)}
                        className="px-2 py-1 text-xs text-stone-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingSpecialId(dish.id);
                          setSpecialPriceInput(dish.specialPrice || dish.price);
                        }}
                        className="text-xs text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
                      >
                        Edit Special Price
                      </button>

                      <button
                        onClick={() => handleRemoveSpecial(dish.id)}
                        className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove from Specials
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available to Add Section */}
      <div className="space-y-3 pt-4 border-t border-stone-200">
        <h2 className="text-sm font-bold text-stone-900">
          Add Dishes to Today&apos;s Specials
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {otherDishes.slice(0, 8).map((dish) => (
            <div
              key={dish.id}
              className="bg-white p-3 rounded-2xl border border-stone-200 flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-stone-800 truncate">
                    {dish.name}
                  </h4>
                  <span className="text-[11px] font-semibold text-stone-500">
                    {currencySymbol}{dish.price}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleAddSpecial(dish)}
                className="w-full py-1.5 text-xs font-semibold bg-stone-100 hover:bg-[#e11d48] hover:text-white text-stone-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Feature as Special</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
