import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { SupplierRecord } from '../../types/restaurant';
import {
  listenToSuppliers,
  saveSupplier,
} from '../../services/restaurantService';

interface SuppliersPurchasesViewProps {
  cafeId: string;
  currencySymbol?: string;
}

export const SuppliersPurchasesView: React.FC<SuppliersPurchasesViewProps> = ({
  cafeId,
  currencySymbol = '₹',
}) => {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = listenToSuppliers(cafeId, (latest) => {
      setSuppliers(latest);
    });
    return () => unsubscribe();
  }, [cafeId]);

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#e11d48]" />
            <span>Suppliers & Purchases Directory</span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Procurement contacts, delivery lead times, and outstanding purveyor ledgers
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search supplier, contact, category..."
            className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Vendor / Purveyor</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Contact Person</th>
                <th className="px-4 py-3">Phone & Email</th>
                <th className="px-4 py-3">Lead Time</th>
                <th className="px-4 py-3">Last Purchase</th>
                <th className="px-4 py-3 text-right">Outstanding Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((sup) => (
                <tr key={sup.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-4 py-3 font-bold text-stone-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
                        <Truck className="w-4 h-4" />
                      </div>
                      <span>{sup.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                      {sup.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-800">
                    {sup.contactPerson}
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    <div>{sup.phone}</div>
                    <div className="text-[10px] text-stone-400">{sup.email}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    {sup.leadTimeDays} days
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {sup.lastPurchaseDate || 'Recent'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-stone-900">
                    {currencySymbol}{sup.outstandingBalance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
