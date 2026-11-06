import React, { useState } from 'react';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  Maximize2,
  Smartphone,
  ChevronDown,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { SUPPORTED_CAFES } from '../../services/restaurantService';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  onSwitchToCustomerMenu: () => void;
  currentCafeId: string;
  onSelectCafe: (id: string) => void;
  pendingOrdersCount?: number;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  onSwitchToCustomerMenu,
  currentCafeId,
  onSelectCafe,
  pendingOrdersCount = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showCafeDropdown, setShowCafeDropdown] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const activeCafe =
    SUPPORTED_CAFES.find((c) => c.id === currentCafeId) || SUPPORTED_CAFES[0];

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200 sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between">
      {/* Left section: Hamburger & Search */}
      <div className="flex items-center gap-3 lg:gap-5 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar matching reference screenshot */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything's"
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#e11d48]/20 focus:border-[#e11d48] transition-all"
          />
        </div>
      </div>

      {/* Right controls matching reference screenshot */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Switch to Diner QR Menu button */}
        <button
          onClick={onSwitchToCustomerMenu}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-xs cursor-pointer transition-all"
          title="Open Diner QR Menu Simulator"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Diner QR Menu</span>
          <span className="sm:hidden text-[10px]">QR Menu</span>
        </button>

        {/* Multi-tenant Cafe Selector */}
        <div className="relative">
          <button
            onClick={() => setShowCafeDropdown(!showCafeDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-medium text-stone-700 cursor-pointer transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#e11d48]" />
            <span className="hidden md:inline max-w-[130px] truncate">
              {activeCafe.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {showCafeDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-stone-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Select Location
              </div>
              {SUPPORTED_CAFES.map((cafe) => (
                <button
                  key={cafe.id}
                  onClick={() => {
                    onSelectCafe(cafe.id);
                    setShowCafeDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 text-xs rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                    currentCafeId === cafe.id
                      ? 'bg-rose-50 text-[#e11d48] font-bold'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="truncate">{cafe.name}</span>
                  {currentCafeId === cafe.id && (
                    <CheckCircle className="w-3.5 h-3.5 text-[#e11d48]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme pill matching sun/moon toggle in reference screenshot */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200/80">
          <button
            onClick={() => setIsDarkMode(false)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              !isDarkMode ? 'bg-white text-amber-500 shadow-xs' : 'text-stone-400'
            }`}
            title="Light mode"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsDarkMode(true)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? 'bg-stone-800 text-stone-100 shadow-xs' : 'text-stone-400'
            }`}
            title="Dark mode"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fullscreen icon */}
        <button
          onClick={handleToggleFullscreen}
          className="hidden md:flex p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setShowNotificationToast(!showNotificationToast)}
          className="relative p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {pendingOrdersCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#e11d48] ring-2 ring-white"></span>
          )}
        </button>

        {/* Profile Avatar matching reference screenshot */}
        <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Owner Avatar"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-stone-200"
          />
          <div className="hidden xl:block text-left">
            <span className="block text-xs font-bold text-stone-800 leading-tight">
              Aarav Sen
            </span>
            <span className="block text-[10px] text-stone-400 font-medium">
              Head Restaurateur
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
