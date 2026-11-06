import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  ChefHat,
  Sparkles,
  UtensilsCrossed,
  Ban,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { CustomerNotification } from '../types/restaurant';
import {
  listenToCustomerNotifications,
  markNotificationAsRead,
} from '../services/restaurantService';
import { useAuth } from '../contexts/AuthContext';

interface CustomerNotificationBannerProps {
  onOpenOrderStatus?: (orderId: string) => void;
}

export const CustomerNotificationBanner: React.FC<
  CustomerNotificationBannerProps
> = ({ onOpenOrderStatus }) => {
  const { user, currentCafeId } = useAuth();
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [activeBanner, setActiveBanner] = useState<CustomerNotification | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setActiveBanner(null);
      return;
    }

    const unsubscribe = listenToCustomerNotifications(
      currentCafeId,
      user.uid,
      (notifs) => {
        setNotifications(notifs);

        // Check if there is an unread notification to display as banner
        const latestUnread = notifs.find((n) => !n.read);
        if (latestUnread) {
          setActiveBanner(latestUnread);
        }
      }
    );

    return () => unsubscribe();
  }, [user, currentCafeId]);

  const handleDismissBanner = async (notif: CustomerNotification) => {
    setActiveBanner(null);
    await markNotificationAsRead(currentCafeId, notif.notificationId);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'preparing':
        return <ChefHat className="w-4 h-4 text-amber-300" />;
      case 'woodfire':
        return <Sparkles className="w-4 h-4 text-orange-300" />;
      case 'ready':
        return <Sparkles className="w-4 h-4 text-emerald-300" />;
      case 'served':
        return <UtensilsCrossed className="w-4 h-4 text-emerald-400" />;
      case 'cancelled':
        return <Ban className="w-4 h-4 text-red-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <>
      {/* Real-time Floating Alert Banner */}
      {activeBanner && (
        <div className="absolute top-16 inset-x-3 z-50 animate-in slide-in-from-top-3 duration-300">
          <div className="bg-stone-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-amber-400/40 flex items-start justify-between gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#82181a] flex items-center justify-center shrink-0 shadow-sm">
              {getStatusIcon(activeBanner.status)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-200 truncate">
                  {activeBanner.title}
                </span>
                <span className="text-[9px] uppercase font-bold text-stone-400 bg-white/10 px-1.5 py-0.2 rounded">
                  Live KDS
                </span>
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">
                {activeBanner.message}
              </p>
            </div>

            <button
              onClick={() => handleDismissBanner(activeBanner)}
              className="text-stone-400 hover:text-white p-1 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Notification Bell Badge Trigger (Rendered in Header or Float) */}
      {notifications.length > 0 && (
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="absolute top-3 right-14 z-30 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          title="Notification History"
        >
          <Bell className="w-3.5 h-3.5" />
          {notifications.some((n) => !n.read) && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400"></span>
          )}
        </button>
      )}

      {/* History Drawer Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#faf7f2] rounded-3xl max-w-sm w-full p-4 border border-stone-300 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#82181a]" />
                <h4 className="font-serif text-sm font-bold text-stone-900">
                  Kitchen Notifications
                </h4>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 no-scrollbar">
              {notifications.map((n) => (
                <div
                  key={n.notificationId}
                  className={`p-2.5 rounded-xl border text-xs ${
                    n.read
                      ? 'bg-white border-stone-200'
                      : 'bg-amber-50/80 border-amber-300/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span>{n.title}</span>
                    <span className="text-[9px] text-stone-400 font-normal">
                      {new Date(n.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
