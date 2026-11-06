import React, { useState } from 'react';
import {
  Settings,
  Save,
  Check,
  Store,
  DollarSign,
  Clock,
  Volume2,
} from 'lucide-react';

interface SettingsViewProps {
  cafeId: string;
  currencySymbol?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  cafeId,
  currencySymbol = '₹',
}) => {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    restaurantName: 'The Grand Bistro & Woodfire',
    address: '42 Connaught Promenade, Central Square',
    gstRate: 5,
    serviceChargeRate: 10,
    openingTime: '11:00 AM',
    closingTime: '11:30 PM',
    enableKitchenAudioChimes: true,
    autoPrintTickets: false,
    tableCount: 24,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12 max-w-4xl">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#e11d48]" />
            <span>Restaurant & Operations Settings</span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Operational preferences, taxes, and service configurations
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Store className="w-4 h-4 text-[#e11d48]" />
          <span>General Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Restaurant Name
            </label>
            <input
              type="text"
              value={settings.restaurantName}
              onChange={(e) =>
                setSettings({ ...settings, restaurantName: e.target.value })
              }
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Physical Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#e11d48]" />
          <span>Taxes & Service Billing</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              GST / VAT Rate (%)
            </label>
            <input
              type="number"
              value={settings.gstRate}
              onChange={(e) =>
                setSettings({ ...settings, gstRate: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Discretionary Service Charge (%)
            </label>
            <input
              type="number"
              value={settings.serviceChargeRate}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  serviceChargeRate: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#e11d48]" />
          <span>Kitchen Order Alerts</span>
        </h2>

        <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 cursor-pointer">
          <div>
            <span className="block text-xs font-bold text-stone-800">
              Kitchen Chime Audio Alert
            </span>
            <span className="text-[10px] text-stone-400">
              Plays acoustic chime when customer submits new order from QR code
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.enableKitchenAudioChimes}
            onChange={(e) =>
              setSettings({
                ...settings,
                enableKitchenAudioChimes: e.target.checked,
              })
            }
            className="w-4 h-4 accent-[#e11d48]"
          />
        </label>
      </div>
    </div>
  );
};
