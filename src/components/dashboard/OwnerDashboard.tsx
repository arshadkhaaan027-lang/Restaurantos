import React, { useState, useEffect } from 'react';
import { Sidebar, DashboardTab } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { DashboardOverview } from './DashboardOverview';
import { LiveOrdersView } from './LiveOrdersView';
import { MenuManagementView } from './MenuManagementView';
import { QRMenuCustomizationView } from './QRMenuCustomizationView';
import { InventoryView } from './InventoryView';
import { OffersView } from './OffersView';
import { TodaysSpecialView } from './TodaysSpecialView';
import { CustomersLoyaltyView } from './CustomersLoyaltyView';
import { AnalyticsReportsView } from './AnalyticsReportsView';
import { SuppliersPurchasesView } from './SuppliersPurchasesView';
import { SettingsView } from './SettingsView';
import { Dish, Order } from '../../types/restaurant';
import {
  listenToDishes,
  listenToCafeOrders,
  updateKitchenOrderStatus,
  checkAndAdvanceOrderSteps,
  SUPPORTED_CAFES,
} from '../../services/restaurantService';
import { NewOrderAlertModal } from './NewOrderAlertModal';

interface OwnerDashboardProps {
  cafeId: string;
  onSelectCafe: (id: string) => void;
  onSwitchToCustomerMenu: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  cafeId,
  onSelectCafe,
  onSwitchToCustomerMenu,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dismissedOrderIds, setDismissedOrderIds] = useState<string[]>([]);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const activeCafe =
    SUPPORTED_CAFES.find((c) => c.id === cafeId) || SUPPORTED_CAFES[0];

  // Subscribe to live Dishes
  useEffect(() => {
    const unsubscribe = listenToDishes(cafeId, (latestDishes) => {
      setDishes(latestDishes);
    });
    return () => unsubscribe();
  }, [cafeId]);

  // Subscribe to live Orders from customer QR menu
  useEffect(() => {
    const unsubscribe = listenToCafeOrders(cafeId, (latestOrders) => {
      setOrders(latestOrders);
    });
    return () => unsubscribe();
  }, [cafeId]);

  // Automated 1-minute step ticker:
  // Checks active orders and advances 'accepted' -> 'preparing' (after 1m) and 'preparing' -> 'ready' (after 1m).
  // 'ready' NEVER auto-advances to 'served' (waits for owner manual action).
  useEffect(() => {
    const interval = setInterval(() => {
      orders.forEach((order) => {
        if (order.status === 'accepted' || order.status === 'preparing') {
          checkAndAdvanceOrderSteps(cafeId, order).catch((err) =>
            console.warn('Auto step progression:', err)
          );
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [cafeId, orders]);

  // Orders that are brand new ('received') and need owner acceptance
  const unacceptedOrders = orders.filter(
    (o) => o.status === 'received' && !dismissedOrderIds.includes(o.id)
  );

  const handleAcceptOrder = async (order: Order) => {
    try {
      await updateKitchenOrderStatus(cafeId, order.id, 'accepted');
      setActionToast(`Order #${order.ticketNumber} Accepted! Preparation timer started (1 min).`);
      setTimeout(() => setActionToast(null), 4000);
    } catch (err) {
      console.error('Failed to accept order:', err);
    }
  };

  const handleRejectOrder = async (order: Order) => {
    try {
      await updateKitchenOrderStatus(cafeId, order.id, 'cancelled', 'Declined by cafe manager');
      setDismissedOrderIds((prev) => [...prev, order.id]);
    } catch (err) {
      console.error('Failed to reject order:', err);
    }
  };

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'served' && o.status !== 'cancelled'
  ).length;

  return (
    <div className="min-h-screen bg-[#faf9f8] flex flex-col antialiased text-stone-900 font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        liveOrdersCount={activeOrdersCount}
      />

      {/* Main Content Area - Shifted 64 (16rem) on large screens for fixed sidebar */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Sticky Navbar */}
        <TopNavbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onSwitchToCustomerMenu={onSwitchToCustomerMenu}
          currentCafeId={cafeId}
          onSelectCafe={onSelectCafe}
          pendingOrdersCount={activeOrdersCount}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              orders={orders}
              dishes={dishes}
              onNavigateToTab={setActiveTab}
              currencySymbol={activeCafe.currencySymbol || '₹'}
            />
          )}

          {activeTab === 'orders' && (
            <LiveOrdersView
              orders={orders}
              cafeId={cafeId}
              currencySymbol={activeCafe.currencySymbol || '₹'}
            />
          )}

          {(activeTab === 'products' || activeTab === 'menu_management') && (
            <MenuManagementView
              dishes={dishes}
              cafeId={cafeId}
              currencySymbol={activeCafe.currencySymbol || '₹'}
            />
          )}

          {activeTab === 'qr_customization' && (
            <QRMenuCustomizationView cafeId={cafeId} />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              cafeId={cafeId}
              currencySymbol={activeCafe.currencySymbol || '₹'}
            />
          )}

          {activeTab === 'offers' && (
            <OffersView
              cafeId={cafeId}
              currencySymbol={activeCafe.currencySymbol || '₹'}
            />
          )}

          {activeTab === 'todays_special' && (
            <TodaysSpecialView
              dishes={dishes}
              cafeId={cafeId}
              currencySymbol={activeCafe.currencySymbol || '₹'}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersLoyaltyView cafeId={cafeId} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsReportsView
              orders={orders}
              currencySymbol={activeCafe.currencySymbol || '₹'}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersPurchasesView
              cafeId={cafeId}
              currencySymbol={activeCafe.currencySymbol || '₹'}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              cafeId={cafeId}
              currencySymbol={activeCafe.currencySymbol || '₹'}
            />
          )}
        </main>
      </div>

      {/* GLOBAL NEW ORDER ALERT POP-UP (Visible across any active screen) */}
      <NewOrderAlertModal
        pendingOrders={unacceptedOrders}
        onAcceptOrder={handleAcceptOrder}
        onRejectOrder={handleRejectOrder}
        onViewInOrders={() => setActiveTab('orders')}
        currencySymbol={activeCafe.currencySymbol || '₹'}
      />

      {/* Floating Action Confirmation Toast */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-500/50 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{actionToast}</span>
        </div>
      )}
    </div>
  );
};
