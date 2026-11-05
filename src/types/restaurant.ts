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

export type OrderStatus = 'received' | 'preparing' | 'woodfire' | 'ready' | 'served';

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
  estimatedMinutes: number;
  kitchenNotes?: string;
  customerPhone?: string;
  whatsappOptIn?: boolean;
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
  phone: string;
  whatsappOptIn: boolean;
  name?: string;
  stamps: number;
  joinedAt: string;
}
