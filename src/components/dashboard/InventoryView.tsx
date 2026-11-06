import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  Truck,
  X,
  Package,
} from 'lucide-react';
import { InventoryItem } from '../../types/restaurant';
import {
  listenToInventory,
  saveInventoryItem,
  restockInventoryItem,
} from '../../services/restaurantService';

interface InventoryViewProps {
  cafeId: string;
  currencySymbol?: string;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  cafeId,
  currencySymbol = '₹',
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(5);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'Coffee Beans',
    currentStock: 10,
    minStockLevel: 5,
    unit: 'kg',
    costPerUnit: 450,
    supplierName: 'Blue Tokai Coffee Roasters',
  });

  useEffect(() => {
    const unsubscribe = listenToInventory(cafeId, (latest) => {
      setItems(latest);
    });
    return () => unsubscribe();
  }, [cafeId]);

  const categories = ['All', ...new Set(items.map((i) => i.category))];

  const filteredItems = items.filter((item) => {
    const matchesCat =
      filterCategory === 'All' ? true : item.category === filterCategory;
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplierName?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCat && matchesSearch;
  });

  const lowStockCount = items.filter(
    (i) => i.status === 'low_stock' || i.status === 'out_of_stock'
  ).length;

  const handleExecuteRestock = async () => {
    if (!restockModalItem || restockQty <= 0) return;
    try {
      await restockInventoryItem(cafeId, restockModalItem.id, restockQty);
      setRestockModalItem(null);
    } catch (err) {
      console.error('Restock failed:', err);
    }
  };

  const handleAddNewItem = async () => {
    if (!newItem.name || !newItem.currentStock) return;
    try {
      const itemToSave: InventoryItem = {
        id: `inv_${Date.now()}`,
        name: newItem.name,
        category: newItem.category || 'Produce',
        currentStock: Number(newItem.currentStock),
        minStockLevel: Number(newItem.minStockLevel || 5),
        unit: newItem.unit || 'kg',
        costPerUnit: Number(newItem.costPerUnit || 100),
        supplierName: newItem.supplierName || 'Local Purveyor',
        lastRestocked: new Date().toISOString().split('T')[0],
      };
      await saveInventoryItem(cafeId, itemToSave);
      setIsAddModalOpen(false);
      setNewItem({
        name: '',
        category: 'Coffee Beans',
        currentStock: 10,
        minStockLevel: 5,
        unit: 'kg',
        costPerUnit: 450,
      });
    } catch (err) {
      console.error('Add inventory item failed:', err);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12">
      {/* Top Banner & Low Stock Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#e11d48]" />
            <span>Kitchen Inventory & Recipe Tracking</span>
            {lowStockCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {lowStockCount} Need Restock
              </span>
            )}
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Automatic stock deduction when diners place orders on table QR codes
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
              placeholder="Search ingredient / roast / milk..."
              className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Ingredient</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterCategory === cat
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Ingredient / Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Current Stock</th>
                <th className="px-4 py-3">Min. Level</th>
                <th className="px-4 py-3">Unit Cost</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => {
                const isLow = item.status === 'low_stock' || item.currentStock <= item.minStockLevel;
                const isOut = item.status === 'out_of_stock' || item.currentStock <= 0;

                return (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-stone-900">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-stone-400" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-stone-900 text-sm">
                        {item.currentStock}
                      </span>
                      <span className="text-[10px] text-stone-400 ml-1 font-medium">
                        {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {item.minStockLevel} {item.unit}
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-700">
                      {currencySymbol}{item.costPerUnit} / {item.unit}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {item.supplierName || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Optimal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setRestockModalItem(item);
                          setRestockQty(10);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-[#e11d48] hover:text-white text-stone-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Restock +
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="font-bold text-stone-900 text-sm">
                Restock {restockModalItem.name}
              </h3>
              <button
                onClick={() => setRestockModalItem(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Current Stock: <span className="font-bold text-stone-800">{restockModalItem.currentStock} {restockModalItem.unit}</span>
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Quantity to Add ({restockModalItem.unit})
              </label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRestockModalItem(null)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRestock}
                className="px-4 py-1.5 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Ingredient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="font-bold text-stone-900 text-sm">
                Add New Inventory Item
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Fresh Rosemary & Thyme"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newItem.category || 'Fresh Produce'}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                  >
                    <option value="Meat & Poultry">Meat & Poultry</option>
                    <option value="Fresh Produce">Fresh Produce</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Dry Goods">Dry Goods</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Oils & Condiments">Oils & Condiments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Unit (kg, L, pcs)
                  </label>
                  <input
                    type="text"
                    value={newItem.unit || 'kg'}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={newItem.currentStock || ''}
                    onChange={(e) =>
                      setNewItem({ ...newItem, currentStock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Min Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={newItem.minStockLevel || ''}
                    onChange={(e) =>
                      setNewItem({ ...newItem, minStockLevel: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewItem}
                className="px-4 py-1.5 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
