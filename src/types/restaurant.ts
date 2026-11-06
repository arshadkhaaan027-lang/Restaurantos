export interface DishIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface Dish {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  fallbackGradient: string;
  isBestSeller?: boolean;
  calories?: string;
  prepTime?: string;
  features: {
    icon: string;
    title: string;
    desc: string;
  }[];
  donenessOptions?: string[];
  sauceOptions?: string[];
  unitLabel?: string;
  isAvailable?: boolean;
  isTodaysSpecial?: boolean;
  specialPrice?: number;
  recipeIngredients?: DishIngredient[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  costPerUnit: number;
  supplierId?: string;
  supplierName?: string;
  expiryDate?: string;
  lastRestocked?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface SpecialOffer {
  id: string;
  title: string;
  discountPercent: number;
  code: string;
  description: string;
  validUntil: string;
  minOrderValue: number;
  active: boolean;
  badgeText?: string;
  imageUrl?: string;
  dishId?: string;
}

export interface SupplierRecord {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  leadTimeDays: number;
  outstandingBalance: number;
  lastPurchaseDate?: string;
}

export interface QRMenuCustomization {
  brandName: string;
  brandTagline: string;
  primaryColor: string;
  accentColor: string;
  bannerHeadline: string;
  bannerSubtitle: string;
  logoUrl?: string;
  announcementBar?: string;
  showCalories: boolean;
  showPrepTime: boolean;
  wifiPassword?: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  doneness?: string;
  sauce?: string;
  specialInstructions?: string;
}

export interface LoyaltyStamp {
  id: number;
  earned: boolean;
  date?: string;
  orderId?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  stampsRequired: number;
  description: string;
  unlocked: boolean;
  tag: string;
}

export type OrderStatus = 'received' | 'accepted' | 'preparing' | 'woodfire' | 'ready' | 'served' | 'cancelled';

export interface Order {
  id: string;
  ticketNumber: number;
  table: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  service: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt?: number;
  acceptedAt?: number;
  preparingAt?: number;
  readyAt?: number;
  servedAt?: number;
  estimatedMinutes: number;
  kitchenNotes?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  isMember?: boolean;
  customerId?: string;
  cafeId?: string;
  whatsappOptIn?: boolean;
  stampAwarded?: boolean;
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
}

export interface CustomerMembership {
  membershipId?: string;
  uid?: string;
  cafeId?: string;
  phone: string;
  whatsappNumber?: string;
  whatsappOptIn: boolean;
  name?: string;
  fullName?: string;
  email?: string;
  dateOfBirth?: string;
  stamps: number;
  stampedOrderIds?: string[];
  joinedAt: string;
  updatedAt?: string;
}

export interface CustomerProfile {
  uid: string;
  cafeId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  photoURL?: string;
  favouriteDishes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StampTransactionRecord {
  transactionId: string;
  cafeId: string;
  customerId: string;
  orderId: string;
  type: 'award' | 'reversal';
  stampsDelta: number;
  reason: string;
  timestamp: number;
}

export interface CustomerNotification {
  notificationId: string;
  cafeId: string;
  customerId: string;
  orderId?: string;
  title: string;
  message: string;
  status?: string;
  read: boolean;
  timestamp: number;
}

export interface CafeInfo {
  id: string;
  name: string;
  tagline: string;
  address: string;
  currency: string;
  currencySymbol: string;
  minOrderForStamp: number;
  stampsPerOrder: number;
}
