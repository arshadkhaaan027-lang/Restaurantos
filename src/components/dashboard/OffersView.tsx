import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Percent,
  Calendar,
  Trash2,
  Check,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { SpecialOffer } from '../../types/restaurant';
import {
  listenToOffers,
  saveOffer,
  deleteOffer,
} from '../../services/restaurantService';

interface OffersViewProps {
  cafeId: string;
  currencySymbol?: string;
}

export const OffersView: React.FC<OffersViewProps> = ({
  cafeId,
  currencySymbol = '₹',
}) => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOffer, setNewOffer] = useState<Partial<SpecialOffer>>({
    title: '',
    code: '',
    discountPercent: 15,
    minOrderValue: 300,
    validUntil: '2026-12-31',
    description: '',
    badgeText: '15% OFF',
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
  });

  useEffect(() => {
    const unsubscribe = listenToOffers(cafeId, (latest) => {
      setOffers(latest);
    });
    return () => unsubscribe();
  }, [cafeId]);

  const handleToggleActive = async (offer: SpecialOffer) => {
    try {
      await saveOffer(cafeId, { ...offer, active: !offer.active });
    } catch (err) {
      console.error('Failed to toggle offer:', err);
    }
  };

  const handleDelete = async (offerId: string) => {
    try {
      await deleteOffer(cafeId, offerId);
    } catch (err) {
      console.error('Failed to delete offer:', err);
    }
  };

  const handleCreateOffer = async () => {
    if (!newOffer.title || !newOffer.code || !newOffer.discountPercent) return;
    try {
      const offerToSave: SpecialOffer = {
        id: `offer_${Date.now()}`,
        title: newOffer.title,
        code: newOffer.code.toUpperCase(),
        discountPercent: Number(newOffer.discountPercent),
        minOrderValue: Number(newOffer.minOrderValue || 0),
        validUntil: newOffer.validUntil || '2026-12-31',
        description: newOffer.description || '',
        badgeText: `${newOffer.discountPercent}% OFF`,
        active: true,
        imageUrl:
          newOffer.imageUrl ||
          'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      };
      await saveOffer(cafeId, offerToSave);
      setIsAddModalOpen(false);
      setNewOffer({
        title: '',
        code: '',
        discountPercent: 15,
        minOrderValue: 300,
        validUntil: '2026-12-31',
        description: '',
        badgeText: '15% OFF',
        active: true,
      });
    } catch (err) {
      console.error('Failed to create offer:', err);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#e11d48]" />
            <span>Offers, Promos & Campaign Vouchers</span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Discounts appear on the customer QR homepage and apply in the cart
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Promo</span>
        </button>
      </div>

      {/* Grid of Offers */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {offers.map((offer) => {
          return (
            <div
              key={offer.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                offer.active ? 'border-stone-200 shadow-xs' : 'border-stone-200 opacity-60'
              }`}
            >
              <div>
                <div className="relative aspect-16/10 bg-stone-100 overflow-hidden">
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-[#e11d48] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                      {offer.badgeText || `${offer.discountPercent}% OFF`}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <span className="font-mono text-xs font-bold text-stone-900 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs">
                      {offer.code}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-stone-900">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2">
                    {offer.description}
                  </p>

                  <div className="pt-2 text-[10px] text-stone-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Min Order Value:</span>
                      <span className="font-semibold text-stone-700">
                        {currencySymbol}{offer.minOrderValue}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Valid Until:</span>
                      <span className="font-semibold text-stone-700">
                        {offer.validUntil}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(offer)}
                  className={`text-xs font-semibold px-2 py-1 rounded-lg border flex items-center gap-1 cursor-pointer ${
                    offer.active
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-stone-100 border-stone-200 text-stone-500'
                  }`}
                >
                  {offer.active ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-600" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-stone-400" />
                      <span>Paused</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(offer.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete offer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="font-bold text-stone-900 text-sm">
                Create Promotional Offer
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
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={newOffer.title || ''}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, title: e.target.value })
                  }
                  placeholder="e.g. Weekend Woodfire Feast"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    value={newOffer.code || ''}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, code: e.target.value })
                    }
                    placeholder="FEAST25"
                    className="w-full px-3 py-2 text-xs font-mono uppercase border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Discount % *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newOffer.discountPercent || ''}
                    onChange={(e) =>
                      setNewOffer({
                        ...newOffer,
                        discountPercent: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Min Order ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={newOffer.minOrderValue || ''}
                    onChange={(e) =>
                      setNewOffer({
                        ...newOffer,
                        minOrderValue: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={newOffer.validUntil || '2026-12-31'}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, validUntil: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Offer Description
                </label>
                <textarea
                  rows={2}
                  value={newOffer.description || ''}
                  onChange={(e) =>
                    setNewOffer({ ...newOffer, description: e.target.value })
                  }
                  placeholder="Offer details shown to diners in cart..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                />
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
                onClick={handleCreateOffer}
                className="px-4 py-1.5 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Create Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
