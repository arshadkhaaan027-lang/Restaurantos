import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Palette,
  Sparkles,
  Smartphone,
  Save,
  Check,
  Eye,
  Wifi,
  Flame,
  Clock,
  Layers,
} from 'lucide-react';
import { QRMenuCustomization } from '../../types/restaurant';
import {
  DEFAULT_QR_CONFIG,
  listenToQRMenuConfig,
  saveQRMenuConfig,
} from '../../services/restaurantService';

interface QRMenuCustomizationViewProps {
  cafeId: string;
}

export const QRMenuCustomizationView: React.FC<QRMenuCustomizationViewProps> = ({
  cafeId,
}) => {
  const [config, setConfig] = useState<QRMenuCustomization>(DEFAULT_QR_CONFIG);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToQRMenuConfig(cafeId, (latest) => {
      setConfig(latest);
    });
    return () => unsubscribe();
  }, [cafeId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveQRMenuConfig(cafeId, config);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 pb-12">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#e11d48]" />
            <span>QR Menu Customization & Branding</span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure how your diners experience the mobile QR dining portal
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Published Live!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Publishing...' : 'Publish to QR Tables'}</span>
            </>
          )}
        </button>
      </div>

      {/* Grid: Editor on Left, Live Mobile Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Brand Identity */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#e11d48]" />
              <span>Brand Identity & Header</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Restaurant Brand Name
              </label>
              <input
                type="text"
                value={config.brandName}
                onChange={(e) =>
                  setConfig({ ...config, brandName: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tagline / Culinary Subtitle
              </label>
              <input
                type="text"
                value={config.brandTagline}
                onChange={(e) =>
                  setConfig({ ...config, brandTagline: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) =>
                      setConfig({ ...config, primaryColor: e.target.value })
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer border border-stone-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) =>
                      setConfig({ ...config, primaryColor: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 text-xs font-mono border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={(e) =>
                      setConfig({ ...config, accentColor: e.target.value })
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer border border-stone-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={config.accentColor}
                    onChange={(e) =>
                      setConfig({ ...config, accentColor: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 text-xs font-mono border border-stone-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Promotional Banner & Announcement */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#e11d48]" />
              <span>Welcome Banner & Announcement Bar</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Banner Headline
              </label>
              <input
                type="text"
                value={config.bannerHeadline}
                onChange={(e) =>
                  setConfig({ ...config, bannerHeadline: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Banner Subtitle / Description
              </label>
              <textarea
                rows={2}
                value={config.bannerSubtitle}
                onChange={(e) =>
                  setConfig({ ...config, bannerSubtitle: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Live Announcement Marquee / Ribbon
              </label>
              <input
                type="text"
                value={config.announcementBar || ''}
                onChange={(e) =>
                  setConfig({ ...config, announcementBar: e.target.value })
                }
                placeholder="e.g. 🍷 Complimentary wine pairing on Chef Tasting Menu..."
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#e11d48]"
              />
            </div>
          </div>

          {/* In-Dining Features */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#e11d48]" />
              <span>Diner Information Display</span>
            </h2>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 cursor-pointer">
                <div>
                  <span className="block text-xs font-bold text-stone-800">
                    Display Nutritional Calories
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Shows calorie estimates on product detail popups
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showCalories}
                  onChange={(e) =>
                    setConfig({ ...config, showCalories: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#e11d48]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 cursor-pointer">
                <div>
                  <span className="block text-xs font-bold text-stone-800">
                    Display Kitchen Prep Times
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Helps manage diner expectations during peak dinner rush
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showPrepTime}
                  onChange={(e) =>
                    setConfig({ ...config, showPrepTime: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#e11d48]"
                />
              </label>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Guest Wi-Fi Password Display
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Wifi className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={config.wifiPassword || ''}
                      onChange={(e) =>
                        setConfig({ ...config, wifiPassword: e.target.value })
                      }
                      placeholder="e.g. GrandBistroGuest2026"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-stone-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Mobile Device Simulator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-20 flex flex-col items-center w-full">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 mb-3">
              <Eye className="w-3.5 h-3.5 text-[#e11d48]" />
              <span>Live Phone Preview (What Diners See)</span>
            </div>

            {/* Mock Phone Frame */}
            <div className="w-[310px] h-[580px] bg-stone-900 rounded-[44px] p-3 shadow-2xl border-4 border-stone-800 relative flex flex-col overflow-hidden">
              {/* Phone Notch */}
              <div className="w-24 h-4 bg-stone-900 rounded-b-xl mx-auto absolute top-3 left-1/2 -translate-x-1/2 z-30" />

              {/* Screen Area */}
              <div className="w-full h-full bg-[#faf7f2] rounded-[34px] overflow-hidden flex flex-col relative text-stone-900">
                {/* Announcement Bar */}
                {config.announcementBar && (
                  <div className="bg-[#1c1917] text-amber-300 text-[9px] font-bold py-1 px-3 text-center truncate">
                    {config.announcementBar}
                  </div>
                )}

                {/* Simulated Header */}
                <div
                  className="p-4 pt-6 text-white"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <span className="text-[9px] tracking-widest uppercase font-bold text-white/70 block">
                    Table 14 · QR Dine-in
                  </span>
                  <h3 className="text-base font-bold tracking-tight">
                    {config.brandName}
                  </h3>
                  <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                    {config.brandTagline}
                  </p>
                </div>

                {/* Simulated Hero Banner */}
                <div className="p-3">
                  <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#e11d48] block mb-0.5">
                      Chef&apos;s Recommendation
                    </span>
                    <h4 className="text-xs font-bold text-stone-900">
                      {config.bannerHeadline}
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-2">
                      {config.bannerSubtitle}
                    </p>
                  </div>
                </div>

                {/* Sample Food Cards */}
                <div className="px-3 space-y-2 flex-1 overflow-y-auto">
                  <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80"
                      alt="Sample"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <span className="block text-xs font-bold text-stone-800">
                        Charcoal Wagyu Sirloin
                      </span>
                      <div className="flex items-center gap-2 text-[9px] text-stone-400">
                        {config.showPrepTime && <span>⏱️ 18 min</span>}
                        {config.showCalories && <span>⚡ 650 kcal</span>}
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: config.accentColor }}
                    >
                      ₹1,250
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 flex items-center gap-2.5">
                    <img
                      src="https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=200&auto=format&fit=crop&q=80"
                      alt="Sample"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <span className="block text-xs font-bold text-stone-800">
                        Tagliatelle al Tartufo
                      </span>
                      <div className="flex items-center gap-2 text-[9px] text-stone-400">
                        {config.showPrepTime && <span>⏱️ 14 min</span>}
                        {config.showCalories && <span>⚡ 580 kcal</span>}
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: config.accentColor }}
                    >
                      ₹620
                    </span>
                  </div>
                </div>

                {/* Wi-Fi Pill at Bottom */}
                {config.wifiPassword && (
                  <div className="p-2 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-[9px] text-stone-600 px-4">
                    <span className="flex items-center gap-1 font-medium">
                      <Wifi className="w-2.5 h-2.5 text-[#e11d48]" />
                      Guest Wi-Fi:
                    </span>
                    <span className="font-mono font-bold text-stone-900">
                      {config.wifiPassword}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
