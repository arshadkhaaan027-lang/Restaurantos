import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  UtensilsCrossed,
  QrCode,
  Boxes,
  Tag,
  Sparkles,
  Users,
  BarChart3,
  Truck,
  Settings,
  ChevronRight,
  X,
  Flame,
} from 'lucide-react';

export type DashboardTab =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'menu_management'
  | 'qr_customization'
  | 'inventory'
  | 'offers'
  | 'todays_special'
  | 'customers'
  | 'analytics'
  | 'suppliers'
  | 'settings';

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  isOpen: boolean;
  onClose: () => void;
  liveOrdersCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  liveOrdersCount = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard' as DashboardTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'orders' as DashboardTab,
      label: 'Orders',
      icon: ShoppingCart,
      badge: liveOrdersCount > 0 ? liveOrdersCount : null,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'products' as DashboardTab,
      label: 'Products',
      icon: Package,
      badge: null,
    },
    {
      id: 'menu_management' as DashboardTab,
      label: 'Menu Management',
      icon: UtensilsCrossed,
      badge: null,
    },
    {
      id: 'qr_customization' as DashboardTab,
      label: 'QR Menu Customization',
      icon: QrCode,
      badge: 'Live',
      badgeColor: 'bg-amber-100 text-amber-800 text-[10px]',
    },
    {
      id: 'inventory' as DashboardTab,
      label: 'Inventory',
      icon: Boxes,
      badge: null,
    },
    {
      id: 'offers' as DashboardTab,
      label: 'Offers & Promotions',
      icon: Tag,
      badge: '4 Active',
      badgeColor: 'bg-rose-100 text-rose-700 text-[10px]',
    },
    {
      id: 'todays_special' as DashboardTab,
      label: "Today's Special",
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'customers' as DashboardTab,
      label: 'Customers & Loyalty',
      icon: Users,
      badge: null,
    },
    {
      id: 'analytics' as DashboardTab,
      label: 'Analytics & Reports',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'suppliers' as DashboardTab,
      label: 'Suppliers & Purchases',
      icon: Truck,
      badge: null,
    },
    {
      id: 'settings' as DashboardTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-stone-200 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header matching reference screenshot */}
        <div className="h-16 px-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#e11d48] flex items-center justify-center text-white shadow-sm">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-lg tracking-tight text-stone-900">
                  Restro<span className="text-[#e11d48]">Panel</span>
                </span>
              </div>
              <span className="text-[10px] text-stone-400 font-medium tracking-wider uppercase block -mt-0.5">
                RestaurantOS Hub
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Main Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-[#e11d48] text-white shadow-sm shadow-[#e11d48]/25'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {!item.badge && !isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick QR Dining Status footer card */}
        <div className="p-3 border-t border-stone-100 bg-stone-50/70">
          <div className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-stone-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                QR Ordering Active
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                Live Sync
              </span>
            </div>
            <p className="text-[10px] text-stone-500 leading-relaxed">
              Price, 86 status, and offers update in diners&apos; phones instantly.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
