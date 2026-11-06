import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Star,
  Edit2,
  Trash2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { Dish } from '../../types/restaurant';
import {
  saveDish,
  deleteDish,
  toggleDishAvailability,
  toggleDishTodaysSpecial,
} from '../../services/restaurantService';

interface MenuManagementViewProps {
  dishes: Dish[];
  cafeId: string;
  currencySymbol?: string;
}

export const MenuManagementView: React.FC<MenuManagementViewProps> = ({
  dishes,
  cafeId,
  currencySymbol = '₹',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Partial<Dish> | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const categories = ['All', ...new Set(dishes.map((d) => d.category))];

  const filteredDishes = dishes.filter((dish) => {
    const matchesCat =
      selectedCategory === 'All' ? true : dish.category === selectedCategory;
    const matchesSearch = searchQuery
      ? dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCat && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingDish({
      id: `dish_${Date.now()}`,
      name: '',
      category: 'coffee',
      price: 240,
      rating: 4.9,
      reviewCount: 12,
      description: '',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      fallbackGradient: 'from-amber-900 to-amber-950',
      calories: '140 kcal',
      prepTime: '5-8 min',
      features: [{ icon: 'Coffee', title: 'Barista Brewed', desc: 'Single-origin roast' }],
      isAvailable: true,
      isTodaysSpecial: false,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (dish: Dish) => {
    setEditingDish({ ...dish });
    setIsEditModalOpen(true);
  };

  const handleSaveDish = async () => {
    if (!editingDish || !editingDish.name || !editingDish.price) return;
    try {
      await saveDish(cafeId, editingDish as Dish);
      setIsEditModalOpen(false);
      setEditingDish(null);
    } catch (err) {
      console.error('Failed to save dish:', err);
    }
  };

  const handleDeleteDish = async (dishId: string) => {
    try {
      await deleteDish(cafeId, dishId);
      setIsDeletingId(null);
    } catch (err) {
      console.error('Failed to delete dish:', err);
    }
  };

  const handleToggleAvailability = async (dish: Dish) => {
    const nextState = dish.isAvailable === false ? true : false;
    await toggleDishAvailability(cafeId, dish.id, nextState);
  };

  const handleToggleTodaysSpecial = async (dish: Dish) => {
    const nextSpecial = !dish.isTodaysSpecial;
    const specialPrice = nextSpecial ? Math.round(dish.price * 0.85) : undefined;
    await toggleDishTodaysSpecial(cafeId, dish.id, nextSpecial, specialPrice);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-[#e11d48]" />
            <span>Menu & Product Management</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
              {dishes.length} Items
            </span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Changes publish directly to diner QR mobile menus in real time
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48] focus:outline-hidden"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-3 py-1.5 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Dishes Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDishes.map((dish) => {
          const isAvail = dish.isAvailable !== false;
          const isSpecial = Boolean(dish.isTodaysSpecial);

          return (
            <div
              key={dish.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                isAvail ? 'border-stone-200 shadow-xs' : 'border-stone-200 opacity-60 bg-stone-50/50'
              }`}
            >
              <div>
                {/* Dish Photo with Badges */}
                <div className="relative aspect-16/9 bg-stone-100 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {dish.category}
                    </span>
                    {isSpecial && (
                      <span className="bg-[#e11d48] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" />
                        Today&apos;s Special
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                        isAvail
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {isAvail ? 'Available' : "86'd / Unavailable"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-stone-900 leading-snug">
                      {dish.name}
                    </h3>
                    <div className="text-right whitespace-nowrap">
                      {isSpecial && dish.specialPrice ? (
                        <>
                          <span className="text-sm font-bold text-[#e11d48]">
                            {currencySymbol}{dish.specialPrice}
                          </span>
                          <span className="text-[10px] text-stone-400 line-through block">
                            {currencySymbol}{dish.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-stone-900">
                          {currencySymbol}{dish.price}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-400">
                    <div className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{dish.rating}</span>
                      <span className="text-stone-400 font-normal">({dish.reviewCount})</span>
                    </div>
                    {dish.prepTime && <span>· ⏱️ {dish.prepTime}</span>}
                    {dish.calories && <span>· ⚡ {dish.calories}</span>}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                {/* 86 Toggle */}
                <button
                  onClick={() => handleToggleAvailability(dish)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isAvail
                      ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  }`}
                  title="Toggle diner availability"
                >
                  {isAvail ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-600" />
                      <span>In Stock</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-rose-600" />
                      <span>Turn On</span>
                    </>
                  )}
                </button>

                {/* Today's Special Toggle */}
                <button
                  onClick={() => handleToggleTodaysSpecial(dish)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition-colors cursor-pointer ${
                    isSpecial
                      ? 'bg-rose-50 border-rose-300 text-[#e11d48]'
                      : 'bg-white border-stone-200 text-stone-500 hover:text-stone-800'
                  }`}
                  title="Promote on diner homepage"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Special</span>
                </button>

                {/* Edit & Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(dish)}
                    className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Edit dish"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDish(dish.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete dish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Dish Modal */}
      {isEditModalOpen && editingDish && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-base font-bold text-stone-900">
                {editingDish.name ? 'Edit Menu Product' : 'Add New Menu Dish'}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Dish Title *
                </label>
                <input
                  type="text"
                  value={editingDish.name || ''}
                  onChange={(e) =>
                    setEditingDish({ ...editingDish, name: e.target.value })
                  }
                  placeholder="e.g. Charcoal Grilled Wagyu Sirloin"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingDish.category || 'coffee'}
                    onChange={(e) =>
                      setEditingDish({ ...editingDish, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white focus:ring-1 focus:ring-[#e11d48]"
                  >
                    <option value="coffee">Specialty Coffee</option>
                    <option value="brunch">All-Day Brunch</option>
                    <option value="sandwiches">Sandwiches & Melts</option>
                    <option value="bakery">Artisan Bakes</option>
                    <option value="beverages">Coolers & Tea</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Price ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    value={editingDish.price || ''}
                    onChange={(e) =>
                      setEditingDish({
                        ...editingDish,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={editingDish.image || ''}
                  onChange={(e) =>
                    setEditingDish({ ...editingDish, image: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingDish.description || ''}
                  onChange={(e) =>
                    setEditingDish({ ...editingDish, description: e.target.value })
                  }
                  placeholder="Artisanal description for diners..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Prep Time
                  </label>
                  <input
                    type="text"
                    value={editingDish.prepTime || '15-20 min'}
                    onChange={(e) =>
                      setEditingDish({ ...editingDish, prepTime: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Calories
                  </label>
                  <input
                    type="text"
                    value={editingDish.calories || '550 kcal'}
                    onChange={(e) =>
                      setEditingDish({ ...editingDish, calories: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDish}
                className="px-5 py-2 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save & Publish to QR Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
