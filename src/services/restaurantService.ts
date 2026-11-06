import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  writeBatch,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { DISHES } from '../data/menuData';
import {
  Dish,
  Order,
  OrderStatus,
  CustomerProfile,
  CustomerMembership,
  CustomerNotification,
  StampTransactionRecord,
  CafeInfo,
  InventoryItem,
  SpecialOffer,
  SupplierRecord,
  QRMenuCustomization,
} from '../types/restaurant';

export const SUPPORTED_CAFES: CafeInfo[] = [
  {
    id: 'cafe_grand_bistro',
    name: 'The Grand Roastery & Cafe',
    tagline: 'Artisanal Specialty Coffee, All-Day Brunch & French Bakes',
    address: '42 Connaught Promenade, Central Square',
    currency: 'INR',
    currencySymbol: '₹',
    minOrderForStamp: 200,
    stampsPerOrder: 1,
  },
  {
    id: 'cafe_artisan_grill',
    name: "L'Artisan Coffee & Bakery",
    tagline: 'Handcrafted Espresso & French Viennoiserie',
    address: '18 Marina Boulevard, South Bay',
    currency: 'INR',
    currencySymbol: '₹',
    minOrderForStamp: 200,
    stampsPerOrder: 1,
  },
];

export const DEFAULT_CAFE_ID = 'cafe_grand_bistro';

/**
 * Fetch or get customer profile
 */
export async function getCustomerProfile(
  cafeId: string,
  uid: string
): Promise<CustomerProfile | null> {
  const path = `cafes/${cafeId}/customers/${uid}`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'customers', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CustomerProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save or update customer profile
 */
export async function saveCustomerProfile(
  cafeId: string,
  profile: CustomerProfile
): Promise<void> {
  const path = `cafes/${cafeId}/customers/${profile.uid}`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'customers', profile.uid);
    await setDoc(docRef, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Get customer loyalty membership
 */
export async function getLoyaltyMembership(
  cafeId: string,
  uid: string
): Promise<CustomerMembership | null> {
  const path = `cafes/${cafeId}/memberships/${uid}`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'memberships', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CustomerMembership;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Register customer loyalty membership (Join Rewards Club)
 */
export async function registerLoyaltyMembership(
  cafeId: string,
  membership: CustomerMembership
): Promise<CustomerMembership> {
  if (!membership.uid) throw new Error('Customer UID is required for membership');
  const path = `cafes/${cafeId}/memberships/${membership.uid}`;

  try {
    const membershipId =
      membership.membershipId ||
      `ROS-M-${Math.floor(100000 + Math.random() * 900000)}`;

    const fullMembership: CustomerMembership = {
      ...membership,
      membershipId,
      cafeId,
      stamps: membership.stamps ?? 1, // 1 welcome stamp
      stampedOrderIds: membership.stampedOrderIds ?? ['welcome_bonus'],
      joinedAt: membership.joinedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(db, 'cafes', cafeId, 'memberships', membership.uid);
    await setDoc(docRef, fullMembership, { merge: true });

    // Also record welcome stamp transaction
    const txId = `tx_welcome_${Date.now()}`;
    const txRef = doc(db, 'cafes', cafeId, 'stamp_transactions', txId);
    await setDoc(txRef, {
      transactionId: txId,
      cafeId,
      customerId: membership.uid,
      orderId: 'welcome_gift',
      type: 'award',
      stampsDelta: 1,
      reason: 'Welcome bonus stamp upon joining Diner Club',
      timestamp: Date.now(),
    });

    return fullMembership;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Award manual bonus loyalty stamps to customer (e.g. from Owner Dashboard)
 */
export async function awardManualStamps(
  cafeId: string,
  customerId: string,
  stampsToAdd: number = 1,
  reason: string = 'Owner Courtesy Bonus'
): Promise<void> {
  const memberRef = doc(db, 'cafes', cafeId, 'memberships', customerId);
  try {
    await runTransaction(db, async (transaction) => {
      const memberDoc = await transaction.get(memberRef);
      if (!memberDoc.exists()) {
        transaction.set(memberRef, {
          membershipId: `ROS-M-${Math.floor(100000 + Math.random() * 900000)}`,
          uid: customerId,
          cafeId,
          stamps: stampsToAdd,
          whatsappOptIn: false,
          phone: '',
          joinedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        const data = memberDoc.data() as CustomerMembership;
        const current = data.stamps || 0;
        transaction.update(memberRef, {
          stamps: current + stampsToAdd,
          updatedAt: new Date().toISOString(),
        });
      }

      // Write auditable transaction record
      const txId = `tx_manual_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const txRef = doc(db, 'cafes', cafeId, 'stamp_transactions', txId);
      transaction.set(txRef, {
        transactionId: txId,
        cafeId,
        customerId,
        orderId: 'MANUAL_BONUS',
        type: 'award',
        stampsDelta: stampsToAdd,
        reason,
        timestamp: Date.now(),
      });
    });
  } catch (error) {
    console.warn('Manual stamp error fallback:', error);
  }
}

/**
 * Create a new table order in Firestore
 */
export async function placeRestaurantOrder(
  cafeId: string,
  order: Order
): Promise<Order> {
  const path = `cafes/${cafeId}/orders/${order.id}`;
  try {
    const orderRef = doc(db, 'cafes', cafeId, 'orders', order.id);
    const cleanOrder: Order = {
      ...order,
      cafeId,
      status: 'received',
      createdAt: order.createdAt || Date.now(),
      updatedAt: Date.now(),
      stampAwarded: false,
    };
    await setDoc(orderRef, cleanOrder);

    // If customer is known, send initial received notification
    if (cleanOrder.customerId) {
      await sendCustomerNotification(cafeId, {
        notificationId: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        cafeId,
        customerId: cleanOrder.customerId,
        orderId: cleanOrder.id,
        title: 'Order Placed at ' + cleanOrder.table,
        message: `Ticket #${cleanOrder.ticketNumber} sent to kitchen. Awaiting chef acceptance.`,
        status: 'received',
        read: false,
        timestamp: Date.now(),
      });
    }

    return cleanOrder;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Listen to all cafe orders (for Kitchen Staff KDS)
 */
export function listenToCafeOrders(
  cafeId: string,
  onOrdersUpdated: (orders: Order[]) => void
): Unsubscribe {
  const path = `cafes/${cafeId}/orders`;
  const ordersRef = collection(db, 'cafes', cafeId, 'orders');
  const q = query(ordersRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((docSnap) => docSnap.data() as Order);
      onOrdersUpdated(orders);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Listen to customer's own orders
 */
export function listenToCustomerOrders(
  cafeId: string,
  customerId: string,
  onOrdersUpdated: (orders: Order[]) => void
): Unsubscribe {
  const path = `cafes/${cafeId}/orders`;
  const ordersRef = collection(db, 'cafes', cafeId, 'orders');
  const q = query(
    ordersRef,
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((docSnap) => docSnap.data() as Order);
      onOrdersUpdated(orders);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Kitchen order status progression & ATOMIC loyalty stamp awarding / reversal
 */
export async function updateKitchenOrderStatus(
  cafeId: string,
  orderId: string,
  newStatus: OrderStatus,
  staffNotes?: string
): Promise<void> {
  const orderRef = doc(db, 'cafes', cafeId, 'orders', orderId);

  // Status-specific customer message
  let notifTitle = '';
  let notifMessage = '';

  switch (newStatus) {
    case 'accepted':
      notifTitle = 'Order Accepted by Kitchen!';
      notifMessage = 'The owner and chef have accepted your ticket. Fresh preparation starts in 1 minute.';
      break;
    case 'preparing':
      notifTitle = 'Kitchen is Crafting Your Order!';
      notifMessage = 'Barista & chef are preparing your dishes fresh.';
      break;
    case 'woodfire':
      notifTitle = 'Baking & Grilling!';
      notifMessage = 'Baking in the oven and warming up for perfection.';
      break;
    case 'ready':
      notifTitle = 'Your Order is Plated & Ready!';
      notifMessage = 'Plated, inspected, and ready at the counter. Awaiting table delivery.';
      break;
    case 'served':
      notifTitle = 'Order Served at Table!';
      notifMessage = 'Dishes served hot to your table. Enjoy your meal!';
      break;
    case 'cancelled':
      notifTitle = 'Order Cancelled';
      notifMessage = staffNotes || 'Your order was cancelled by the cafe manager.';
      break;
    default:
      notifTitle = 'Order Status Updated';
      notifMessage = `Your order status changed to ${newStatus}.`;
  }

  // Use a Firestore transaction for atomic updates and stamp awards
  try {
    let earnedStampThisEvent = false;

    await runTransaction(db, async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists()) {
        throw new Error(`Order ${orderId} does not exist`);
      }

      const orderData = orderDoc.data() as Order;
      const cafeConfig =
        SUPPORTED_CAFES.find((c) => c.id === cafeId) || SUPPORTED_CAFES[0];

      let stampAwarded = orderData.stampAwarded || false;
      const updates: Partial<Order> = {
        status: newStatus,
        updatedAt: Date.now(),
      };

      // Record stage timestamps
      if (newStatus === 'accepted' && !orderData.acceptedAt) {
        updates.acceptedAt = Date.now();
      } else if (newStatus === 'preparing' && !orderData.preparingAt) {
        updates.preparingAt = Date.now();
      } else if (newStatus === 'ready' && !orderData.readyAt) {
        updates.readyAt = Date.now();
      } else if (newStatus === 'served' && !orderData.servedAt) {
        updates.servedAt = Date.now();
      }

      // CRITICAL REQUIREMENT:
      // When order is marked 'served' (delivered to table):
      // Only award stamp & stamp notification to customers who joined membership
      // with WhatsApp number or email
      const isMemberCustomer = Boolean(
        orderData.isMember ||
        (orderData.customerPhone && orderData.customerPhone.trim().length >= 10) ||
        (orderData.customerEmail && orderData.customerEmail.includes('@')) ||
        orderData.customerId
      );

      if (newStatus === 'served' && !stampAwarded && isMemberCustomer) {
        const memberKey = orderData.customerId || orderData.customerPhone || 'guest_member';
        const memberRef = doc(db, 'cafes', cafeId, 'memberships', memberKey);
        const memberDoc = await transaction.get(memberRef);

        const currentMemberData: CustomerMembership = memberDoc.exists()
          ? (memberDoc.data() as CustomerMembership)
          : {
              membershipId: `ROS-M-${Date.now()}`,
              uid: memberKey,
              cafeId,
              phone: orderData.customerPhone || '',
              whatsappNumber: orderData.customerPhone || '',
              email: orderData.customerEmail || '',
              fullName: orderData.customerName || 'Cafe Member',
              whatsappOptIn: Boolean(orderData.whatsappOptIn),
              stamps: 0,
              stampedOrderIds: [],
              joinedAt: new Date().toISOString(),
            };

        const currentStamped = currentMemberData.stampedOrderIds || [];

        if (!currentStamped.includes(orderId)) {
          const newStamps = Math.min(
            10,
            (currentMemberData.stamps || 0) + (cafeConfig.stampsPerOrder || 1)
          );
          const updatedStamped = [...currentStamped, orderId];

          transaction.set(
            memberRef,
            {
              ...currentMemberData,
              stamps: newStamps,
              stampedOrderIds: updatedStamped,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );

          // Write auditable stamp transaction record
          const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          const txRef = doc(db, 'cafes', cafeId, 'stamp_transactions', txId);
          transaction.set(txRef, {
            transactionId: txId,
            cafeId,
            customerId: memberKey,
            orderId,
            type: 'award',
            stampsDelta: cafeConfig.stampsPerOrder || 1,
            reason: `Earned for Table Order #${orderData.ticketNumber} (${orderData.table})`,
            timestamp: Date.now(),
          });

          stampAwarded = true;
          earnedStampThisEvent = true;
        }
      }

      // Reversal if order was marked served with stamp, but is now cancelled
      if (newStatus === 'cancelled' && stampAwarded) {
        const memberKey = orderData.customerId || orderData.customerPhone || 'guest_member';
        const memberRef = doc(db, 'cafes', cafeId, 'memberships', memberKey);
        const memberDoc = await transaction.get(memberRef);

        if (memberDoc.exists()) {
          const memberData = memberDoc.data() as CustomerMembership;
          const newStamps = Math.max(0, (memberData.stamps || 0) - (cafeConfig.stampsPerOrder || 1));
          const updatedStamped = (memberData.stampedOrderIds || []).filter(
            (id) => id !== orderId
          );

          transaction.update(memberRef, {
            stamps: newStamps,
            stampedOrderIds: updatedStamped,
            updatedAt: new Date().toISOString(),
          });

          const txId = `tx_rev_${Date.now()}_${Math.random().toString(36).substring(7)}`;
          const txRef = doc(db, 'cafes', cafeId, 'stamp_transactions', txId);
          transaction.set(txRef, {
            transactionId: txId,
            cafeId,
            customerId: memberKey,
            orderId,
            type: 'reversal',
            stampsDelta: -(cafeConfig.stampsPerOrder || 1),
            reason: `Reversed due to cancellation of Order #${orderData.ticketNumber}`,
            timestamp: Date.now(),
          });

          stampAwarded = false;
        }
      }

      updates.stampAwarded = stampAwarded;
      transaction.update(orderRef, updates);
    });

    // If order was accepted, trigger recipe inventory deduction
    if (newStatus === 'accepted') {
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        const ord = snap.data() as Order;
        deductInventoryForOrder(cafeId, ord);
      }
    }

    // Send real-time notification to customer
    const snap = await getDoc(orderRef);
    if (snap.exists()) {
      const orderData = snap.data() as Order;
      const targetCustomerUid = orderData.customerId;

      if (targetCustomerUid) {
        // If stamp was earned upon serving, send specific stamp notification
        if (earnedStampThisEvent) {
          notifTitle = '🎉 +1 Cafe Loyalty Stamp Earned!';
          notifMessage = `Your order #${orderData.ticketNumber} was served! 1 stamp has been credited to your loyalty card.`;
        }

        await sendCustomerNotification(cafeId, {
          notificationId: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          cafeId,
          customerId: targetCustomerUid,
          orderId,
          title: notifTitle,
          message: notifMessage,
          status: newStatus,
          read: false,
          timestamp: Date.now(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `cafes/${cafeId}/orders/${orderId}`);
  }
}

/**
 * Automatically check and advance order steps after 1 minute each:
 * 1. 'accepted' -> 'preparing' after 60s
 * 2. 'preparing' -> 'ready' after 60s
 * 3. 'ready' -> DOES NOT auto-advance (Requires owner to click 'Mark Served')
 */
export async function checkAndAdvanceOrderSteps(
  cafeId: string,
  order: Order
): Promise<boolean> {
  const now = Date.now();
  const ONE_MINUTE_MS = 60 * 1000;

  if (order.status === 'accepted') {
    const startTime = order.acceptedAt || order.updatedAt || order.createdAt;
    if (now - startTime >= ONE_MINUTE_MS) {
      await updateKitchenOrderStatus(cafeId, order.id, 'preparing');
      return true;
    }
  } else if (order.status === 'preparing') {
    const startTime = order.preparingAt || order.updatedAt || order.createdAt;
    if (now - startTime >= ONE_MINUTE_MS) {
      await updateKitchenOrderStatus(cafeId, order.id, 'ready');
      return true;
    }
  }
  // 'ready' stays ready until owner serves!
  return false;
}

/**
 * Send in-app notification to customer
 */
export async function sendCustomerNotification(
  cafeId: string,
  notification: CustomerNotification
): Promise<void> {
  const path = `cafes/${cafeId}/notifications/${notification.notificationId}`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'notifications', notification.notificationId);
    await setDoc(docRef, notification);
  } catch (error) {
    // Non-fatal if notification writing fails, log cleanly
    console.warn('Could not post notification:', error);
  }
}

/**
 * Listen to real-time customer notifications
 */
export function listenToCustomerNotifications(
  cafeId: string,
  customerId: string,
  onNotificationsUpdated: (notifications: CustomerNotification[]) => void
): Unsubscribe {
  const path = `cafes/${cafeId}/notifications`;
  const notifRef = collection(db, 'cafes', cafeId, 'notifications');
  const q = query(
    notifRef,
    where('customerId', '==', customerId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifs = snapshot.docs.map(
        (docSnap) => docSnap.data() as CustomerNotification
      );
      onNotificationsUpdated(notifs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  cafeId: string,
  notificationId: string
): Promise<void> {
  try {
    const docRef = doc(db, 'cafes', cafeId, 'notifications', notificationId);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    console.warn('Could not mark notification read:', error);
  }
}

// -------------------------------------------------------------
// OWNER DASHBOARD & SYNC SERVICES
// -------------------------------------------------------------

/**
 * Seed initial dishes if Firestore collection is empty
 */
export async function seedInitialDishes(cafeId: string): Promise<void> {
  try {
    const dishesCol = collection(db, 'cafes', cafeId, 'dishes');
    const snap = await getDocs(dishesCol);
    const hasLegacy = !snap.empty && snap.docs.some((d) => d.id === 'ribeye-steak' || d.id === 'sirloin-steak');
    if (!snap.empty && !hasLegacy) return;

    const batch = writeBatch(db);
    // If legacy steakhouse dishes existed, clean them up
    if (hasLegacy) {
      snap.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
    }

    DISHES.forEach((dish, idx) => {
      const docRef = doc(db, 'cafes', cafeId, 'dishes', dish.id);
      const enhancedDish: Dish = {
        ...dish,
        isAvailable: true,
        isTodaysSpecial: idx === 0 || idx === 3,
        specialPrice: idx === 0 ? 180 : idx === 3 ? 320 : undefined,
      };
      batch.set(docRef, enhancedDish);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Initial dishes seed fallback:', err);
  }
}

/**
 * Real-time listener for Cafe dishes
 */
export function listenToDishes(
  cafeId: string,
  onDishesUpdated: (dishes: Dish[]) => void
): Unsubscribe {
  const path = `cafes/${cafeId}/dishes`;
  const dishesRef = collection(db, 'cafes', cafeId, 'dishes');

  // Attempt initial seed in background
  seedInitialDishes(cafeId);

  return onSnapshot(
    dishesRef,
    (snapshot) => {
      if (snapshot.empty) {
        onDishesUpdated(DISHES.map(d => ({ ...d, isAvailable: true })));
      } else {
        const list = snapshot.docs.map((docSnap) => docSnap.data() as Dish);
        onDishesUpdated(list);
      }
    },
    (error) => {
      console.warn('Dishes listener fallback to local menu:', error);
      onDishesUpdated(DISHES.map(d => ({ ...d, isAvailable: true })));
    }
  );
}

/**
 * Save / Update a Dish
 */
export async function saveDish(cafeId: string, dish: Dish): Promise<void> {
  const path = `cafes/${cafeId}/dishes/${dish.id}`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'dishes', dish.id);
    await setDoc(docRef, dish, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a Dish
 */
export async function deleteDish(cafeId: string, dishId: string): Promise<void> {
  const path = `cafes/${cafeId}/dishes/${dishId}`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'dishes', dishId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Toggle Dish 86'd / Availability (instantly updates customer QR menu)
 */
export async function toggleDishAvailability(
  cafeId: string,
  dishId: string,
  isAvailable: boolean
): Promise<void> {
  const path = `cafes/${cafeId}/dishes/${dishId}`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'dishes', dishId);
    await setDoc(docRef, { isAvailable }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Toggle Today's Special for a dish
 */
export async function toggleDishTodaysSpecial(
  cafeId: string,
  dishId: string,
  isTodaysSpecial: boolean,
  specialPrice?: number
): Promise<void> {
  const path = `cafes/${cafeId}/dishes/${dishId}`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'dishes', dishId);
    const updateData: any = { isTodaysSpecial };
    if (specialPrice !== undefined) updateData.specialPrice = specialPrice;
    await setDoc(docRef, updateData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -------------------------------------------------------------
// INVENTORY & RECIPES
// -------------------------------------------------------------

export const DEFAULT_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'inv_coffee_beans',
    name: 'Single-Origin Arabica Coffee Beans',
    category: 'Coffee & Tea',
    currentStock: 18,
    minStockLevel: 5,
    unit: 'kg',
    costPerUnit: 1200,
    supplierName: 'Blue Tokai Coffee Roasters',
    status: 'in_stock',
    lastRestocked: '2026-11-05',
  },
  {
    id: 'inv_oat_milk',
    name: 'Barista Grade Oat & Almond Milk',
    category: 'Dairy & Milks',
    currentStock: 32,
    minStockLevel: 10,
    unit: 'L',
    costPerUnit: 180,
    supplierName: 'Dairy Guild Farms',
    status: 'in_stock',
    lastRestocked: '2026-11-05',
  },
  {
    id: 'inv_dairy_milk',
    name: 'Fresh Farm Whole Milk',
    category: 'Dairy & Milks',
    currentStock: 45,
    minStockLevel: 15,
    unit: 'L',
    costPerUnit: 65,
    supplierName: 'Dairy Guild Farms',
    status: 'in_stock',
    lastRestocked: '2026-11-06',
  },
  {
    id: 'inv_avocados',
    name: 'Fresh Organic Hass Avocados',
    category: 'Fresh Produce',
    currentStock: 34,
    minStockLevel: 12,
    unit: 'pcs',
    costPerUnit: 85,
    supplierName: 'Earth & Vine Organics',
    status: 'in_stock',
    lastRestocked: '2026-11-04',
  },
  {
    id: 'inv_sourdough',
    name: 'Artisan 48h Ferment Sourdough Loaves',
    category: 'Bakery',
    currentStock: 16,
    minStockLevel: 6,
    unit: 'loaves',
    costPerUnit: 160,
    supplierName: 'French Crust Bakery',
    status: 'in_stock',
    lastRestocked: '2026-11-06',
  },
  {
    id: 'inv_butter_croissant',
    name: 'French AOP Butter Croissant Dough',
    category: 'Bakery',
    currentStock: 42,
    minStockLevel: 20,
    unit: 'pcs',
    costPerUnit: 45,
    supplierName: 'French Crust Bakery',
    status: 'in_stock',
    lastRestocked: '2026-11-06',
  },
  {
    id: 'inv_belgian_chocolate',
    name: 'Belgian 65% Dark Chocolate Callets',
    category: 'Pantry & Syrups',
    currentStock: 14,
    minStockLevel: 4,
    unit: 'kg',
    costPerUnit: 850,
    supplierName: 'French Crust Bakery',
    status: 'in_stock',
    lastRestocked: '2026-11-03',
  },
  {
    id: 'inv_matcha',
    name: 'Japanese Uji Ceremonial Matcha',
    category: 'Coffee & Tea',
    currentStock: 2.5,
    minStockLevel: 1,
    unit: 'kg',
    costPerUnit: 2800,
    supplierName: 'Blue Tokai Coffee Roasters',
    status: 'in_stock',
    lastRestocked: '2026-11-02',
  },
  {
    id: 'inv_cream_cheese',
    name: 'Artisan Cream Cheese for Basque Cake',
    category: 'Dairy & Milks',
    currentStock: 12,
    minStockLevel: 4,
    unit: 'kg',
    costPerUnit: 540,
    supplierName: 'Dairy Guild Farms',
    status: 'in_stock',
    lastRestocked: '2026-11-04',
  },
];

/**
 * Seed default inventory if empty
 */
async function seedDefaultInventory(cafeId: string): Promise<void> {
  try {
    const invCol = collection(db, 'cafes', cafeId, 'inventory');
    const snap = await getDocs(invCol);
    const hasLegacyInv = !snap.empty && snap.docs.some((d) => d.id === 'inv_wagyu' || d.id === 'inv_tenderloin');
    if (!snap.empty && !hasLegacyInv) return;

    const batch = writeBatch(db);
    if (hasLegacyInv) {
      snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
    }
    DEFAULT_INVENTORY_ITEMS.forEach((item) => {
      const docRef = doc(db, 'cafes', cafeId, 'inventory', item.id);
      batch.set(docRef, item);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Inventory seed fallback:', err);
  }
}

/**
 * Listen to live inventory
 */
export function listenToInventory(
  cafeId: string,
  onInventoryUpdated: (items: InventoryItem[]) => void
): Unsubscribe {
  const path = `cafes/${cafeId}/inventory`;
  const invRef = collection(db, 'cafes', cafeId, 'inventory');

  seedDefaultInventory(cafeId);

  return onSnapshot(
    invRef,
    (snapshot) => {
      if (snapshot.empty) {
        onInventoryUpdated(DEFAULT_INVENTORY_ITEMS);
      } else {
        const items = snapshot.docs.map((d) => d.data() as InventoryItem);
        onInventoryUpdated(items);
      }
    },
    (err) => {
      console.warn('Inventory listener error:', err);
      onInventoryUpdated(DEFAULT_INVENTORY_ITEMS);
    }
  );
}

/**
 * Save inventory item
 */
export async function saveInventoryItem(
  cafeId: string,
  item: InventoryItem
): Promise<void> {
  const path = `cafes/${cafeId}/inventory/${item.id}`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'inventory', item.id);
    const status: 'in_stock' | 'low_stock' | 'out_of_stock' =
      item.currentStock <= 0
        ? 'out_of_stock'
        : item.currentStock <= item.minStockLevel
        ? 'low_stock'
        : 'in_stock';

    await setDoc(docRef, { ...item, status }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Restock inventory item
 */
export async function restockInventoryItem(
  cafeId: string,
  itemId: string,
  quantityToAdd: number
): Promise<void> {
  const path = `cafes/${cafeId}/inventory/${itemId}`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'inventory', itemId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const cur = snap.data() as InventoryItem;
      const newStock = Math.max(0, (cur.currentStock || 0) + quantityToAdd);
      const status =
        newStock <= 0
          ? 'out_of_stock'
          : newStock <= cur.minStockLevel
          ? 'low_stock'
          : 'in_stock';
      await updateDoc(docRef, {
        currentStock: newStock,
        status,
        lastRestocked: new Date().toISOString().split('T')[0],
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Deduct inventory automatically when order is accepted / prepared
 */
export async function deductInventoryForOrder(
  cafeId: string,
  order: Order
): Promise<void> {
  try {
    const inventoryCol = collection(db, 'cafes', cafeId, 'inventory');
    const snap = await getDocs(inventoryCol);
    if (snap.empty) return;

    const items = snap.docs.map((d) => d.data() as InventoryItem);
    const batch = writeBatch(db);

    order.items.forEach((cartItem) => {
      const name = cartItem.dish.name.toLowerCase();
      items.forEach((inv) => {
        let deductAmount = 0;
        if ((name.includes('cortado') || name.includes('macchiato') || name.includes('cold brew')) && inv.name.toLowerCase().includes('beans')) {
          deductAmount = 0.02 * cartItem.quantity;
        } else if ((name.includes('cortado') || name.includes('latte') || name.includes('macchiato')) && inv.name.toLowerCase().includes('milk')) {
          deductAmount = 0.2 * cartItem.quantity;
        } else if (name.includes('avocado') && inv.name.toLowerCase().includes('avocado')) {
          deductAmount = 1 * cartItem.quantity;
        } else if ((name.includes('toast') || name.includes('panini') || name.includes('melt')) && inv.name.toLowerCase().includes('sourdough')) {
          deductAmount = 0.1 * cartItem.quantity;
        } else if (name.includes('croissant') && inv.name.toLowerCase().includes('croissant')) {
          deductAmount = 1 * cartItem.quantity;
        } else if (name.includes('cheesecake') && inv.name.toLowerCase().includes('cream cheese')) {
          deductAmount = 0.15 * cartItem.quantity;
        } else if (name.includes('matcha') && inv.name.toLowerCase().includes('matcha')) {
          deductAmount = 0.015 * cartItem.quantity;
        }

        if (deductAmount > 0) {
          const docRef = doc(db, 'cafes', cafeId, 'inventory', inv.id);
          const newStock = Math.max(0, Number((inv.currentStock - deductAmount).toFixed(2)));
          const newStatus =
            newStock <= 0
              ? 'out_of_stock'
              : newStock <= inv.minStockLevel
              ? 'low_stock'
              : 'in_stock';
          batch.update(docRef, {
            currentStock: newStock,
            status: newStatus,
          });
        }
      });
    });

    await batch.commit();
  } catch (err) {
    console.warn('Inventory deduction warning:', err);
  }
}

// -------------------------------------------------------------
// OFFERS & PROMOTIONS
// -------------------------------------------------------------

export const DEFAULT_OFFERS: SpecialOffer[] = [
  {
    id: 'offer_cortado',
    title: 'Cortado & Cold Brew Combo',
    discountPercent: 12,
    code: 'BREW12',
    description: 'Specialty coffee pairing with any morning bakery treat.',
    validUntil: '2026-12-31',
    minOrderValue: 300,
    active: true,
    badgeText: '12% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'offer_avocado',
    title: 'Weekend Avocado Sourdough Brunch',
    discountPercent: 20,
    code: 'BRUNCH20',
    description: 'Fresh Hass avocado toast with soft poached eggs & Danish feta.',
    validUntil: '2026-12-31',
    minOrderValue: 400,
    active: true,
    badgeText: '20% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'offer_basque',
    title: 'Basque Cheesecake & Bakes',
    discountPercent: 15,
    code: 'BAKE15',
    description: 'Caramelized molten Spanish cheesecake with fruit compote.',
    validUntil: '2026-12-31',
    minOrderValue: 350,
    active: true,
    badgeText: '15% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'offer_matcha',
    title: 'Matcha Latte & Blended Coolers',
    discountPercent: 10,
    code: 'COOL10',
    description: 'Chilled Uji Matcha and tropical passionfruit sparkling coolers.',
    validUntil: '2026-12-31',
    minOrderValue: 250,
    active: true,
    badgeText: '10% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80',
  },
];

/**
 * Seed default offers if empty
 */
async function seedDefaultOffers(cafeId: string): Promise<void> {
  try {
    const colRef = collection(db, 'cafes', cafeId, 'offers');
    const snap = await getDocs(colRef);
    const hasLegacyOffer = !snap.empty && snap.docs.some((d) => d.id === 'offer_spring' || d.id === 'offer_satay');
    if (!snap.empty && !hasLegacyOffer) return;

    const batch = writeBatch(db);
    if (hasLegacyOffer) {
      snap.docs.forEach((d) => batch.delete(d.ref));
    }
    DEFAULT_OFFERS.forEach((off) => {
      const docRef = doc(db, 'cafes', cafeId, 'offers', off.id);
      batch.set(docRef, off);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Offers seed fallback:', err);
  }
}

/**
 * Listen to live offers
 */
export function listenToOffers(
  cafeId: string,
  onOffersUpdated: (offers: SpecialOffer[]) => void
): Unsubscribe {
  const path = `cafes/${cafeId}/offers`;
  const offersRef = collection(db, 'cafes', cafeId, 'offers');

  seedDefaultOffers(cafeId);

  return onSnapshot(
    offersRef,
    (snapshot) => {
      if (snapshot.empty) {
        onOffersUpdated(DEFAULT_OFFERS);
      } else {
        const offers = snapshot.docs.map((d) => d.data() as SpecialOffer);
        onOffersUpdated(offers);
      }
    },
    (err) => {
      console.warn('Offers listener fallback:', err);
      onOffersUpdated(DEFAULT_OFFERS);
    }
  );
}

/**
 * Save Special Offer
 */
export async function saveOffer(cafeId: string, offer: SpecialOffer): Promise<void> {
  const path = `cafes/${cafeId}/offers/${offer.id}`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'offers', offer.id);
    await setDoc(docRef, offer, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete Offer
 */
export async function deleteOffer(cafeId: string, offerId: string): Promise<void> {
  const path = `cafes/${cafeId}/offers/${offerId}`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'offers', offerId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// QR MENU CUSTOMIZATION & CONFIG
// -------------------------------------------------------------

export const DEFAULT_QR_CONFIG: QRMenuCustomization = {
  brandName: 'The Grand Roastery & Cafe',
  brandTagline: 'Artisanal Specialty Coffee, All-Day Brunch & French Bakes',
  primaryColor: '#82181a',
  accentColor: '#e11d48',
  bannerHeadline: 'Artisanal Single-Origin Roasts',
  bannerSubtitle: 'Handcrafted cortados, slow-steeped cold brews & warm sourdough brunch table-side.',
  announcementBar: '☕ Morning Bake Alert: Warm Belgian Chocolate Croissants fresh out of the oven!',
  showCalories: true,
  showPrepTime: true,
  wifiPassword: 'GrandCafeGuest2026',
};

/**
 * Listen to QR Menu Customization Config
 */
export function listenToQRMenuConfig(
  cafeId: string,
  onConfigUpdated: (config: QRMenuCustomization) => void
): Unsubscribe {
  const configRef = doc(db, 'cafes', cafeId, 'config', 'qr_menu');

  return onSnapshot(
    configRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onConfigUpdated(snapshot.data() as QRMenuCustomization);
      } else {
        onConfigUpdated(DEFAULT_QR_CONFIG);
      }
    },
    (err) => {
      console.warn('QR Config listener fallback:', err);
      onConfigUpdated(DEFAULT_QR_CONFIG);
    }
  );
}

/**
 * Save QR Menu Customization Config
 */
export async function saveQRMenuConfig(
  cafeId: string,
  config: QRMenuCustomization
): Promise<void> {
  const path = `cafes/${cafeId}/config/qr_menu`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'config', 'qr_menu');
    await setDoc(docRef, config, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// SUPPLIERS & PURCHASES
// -------------------------------------------------------------

export const DEFAULT_SUPPLIERS: SupplierRecord[] = [
  {
    id: 'sup_1',
    name: 'Blue Tokai Coffee Roasters',
    contactPerson: 'David Vance',
    phone: '+91 98201 54321',
    email: 'beans@bluetokaicoffee.com',
    category: 'Specialty Coffee Beans',
    leadTimeDays: 2,
    outstandingBalance: 24500,
    lastPurchaseDate: '2026-11-04',
  },
  {
    id: 'sup_2',
    name: 'Earth & Vine Organics',
    contactPerson: 'Sunita Rao',
    phone: '+91 98765 43210',
    email: 'orders@earthandvine.in',
    category: 'Avocados & Fresh Produce',
    leadTimeDays: 1,
    outstandingBalance: 12800,
    lastPurchaseDate: '2026-11-05',
  },
  {
    id: 'sup_3',
    name: 'French Crust Bakery & Viennoiserie',
    contactPerson: 'Matteo Rossi',
    phone: '+91 99345 67890',
    email: 'bake@frenchcrust.com',
    category: 'Croissants & Sourdough',
    leadTimeDays: 1,
    outstandingBalance: 18900,
    lastPurchaseDate: '2026-11-05',
  },
  {
    id: 'sup_4',
    name: 'Dairy Guild Farms',
    contactPerson: 'Karan Mehra',
    phone: '+91 98112 34567',
    email: 'dairy@dairyguild.in',
    category: 'Farm Milk & Plant Mylks',
    leadTimeDays: 1,
    outstandingBalance: 8400,
    lastPurchaseDate: '2026-11-06',
  },
];

/**
 * Listen to suppliers
 */
export function listenToSuppliers(
  cafeId: string,
  onSuppliersUpdated: (suppliers: SupplierRecord[]) => void
): Unsubscribe {
  const supRef = collection(db, 'cafes', cafeId, 'suppliers');
  return onSnapshot(
    supRef,
    (snapshot) => {
      if (snapshot.empty) {
        onSuppliersUpdated(DEFAULT_SUPPLIERS);
      } else {
        const list = snapshot.docs.map((d) => d.data() as SupplierRecord);
        onSuppliersUpdated(list);
      }
    },
    (err) => {
      console.warn('Suppliers listener fallback:', err);
      onSuppliersUpdated(DEFAULT_SUPPLIERS);
    }
  );
}

/**
 * Save Supplier
 */
export async function saveSupplier(
  cafeId: string,
  supplier: SupplierRecord
): Promise<void> {
  const path = `cafes/${cafeId}/suppliers/${supplier.id}`;
  try {
    const docRef = doc(db, 'cafes', cafeId, 'suppliers', supplier.id);
    await setDoc(docRef, supplier, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
