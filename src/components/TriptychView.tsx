import React from 'react';
import { PhoneFrame } from './PhoneFrame';
import { OnboardingScreen } from './OnboardingScreen';
import { HomeScreen } from './HomeScreen';
import { ProductDetailScreen } from './ProductDetailScreen';
import { Dish, CartItem } from '../types/restaurant';
import { DISHES } from '../data/menuData';

interface TriptychViewProps {
  onSelectDish: (dish: Dish) => void;
  selectedDish: Dish;
  cartItems: CartItem[];
  onAddToCart: (dish: Dish, quantity?: number) => void;
  onUpdateQuantity?: (dishId: string, delta: number) => void;
  onOpenCart: () => void;
  onOpenRewards: () => void;
  currentTable: string;
  onNavigateToHome: () => void;
}

export const TriptychView: React.FC<TriptychViewProps> = ({
  onSelectDish,
  selectedDish,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  onOpenCart,
  onOpenRewards,
  currentTable,
  onNavigateToHome,
}) => {
  return (
    <div className="w-full overflow-x-auto py-6 px-4 no-scrollbar">
      <div className="flex items-center justify-center gap-6 min-w-[1240px] mx-auto">
        {/* Phone 1: Welcome / Onboarding Screen */}
        <div className="flex flex-col items-center">
          <div className="text-center mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#82181a] bg-[#82181a]/10 px-2.5 py-0.5 rounded-full">
              Screen 1: Welcome & Table Onboarding
            </span>
          </div>
          <PhoneFrame>
            <OnboardingScreen
              onStart={onNavigateToHome}
              onSkip={onNavigateToHome}
            />
          </PhoneFrame>
        </div>

        {/* Phone 2: Main Menu & Ordering Screen */}
        <div className="flex flex-col items-center">
          <div className="text-center mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#82181a] bg-[#82181a]/10 px-2.5 py-0.5 rounded-full">
              Screen 2: Category Rail & Best Sellers (+ Buttons)
            </span>
          </div>
          <PhoneFrame>
            <HomeScreen
              onSelectDish={onSelectDish}
              cartItems={cartItems}
              onAddToCart={onAddToCart}
              onUpdateQuantity={onUpdateQuantity}
              onOpenCart={onOpenCart}
              onOpenRewards={onOpenRewards}
              currentTable={currentTable}
              activeNavTab="home"
              setActiveNavTab={() => {}}
            />
          </PhoneFrame>
        </div>

        {/* Phone 3: Product Detail Screen */}
        <div className="flex flex-col items-center">
          <div className="text-center mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#82181a] bg-[#82181a]/10 px-2.5 py-0.5 rounded-full">
              Screen 3: Editorial Dish Detail & Add To Cart
            </span>
          </div>
          <PhoneFrame>
            <ProductDetailScreen
              dish={selectedDish || DISHES[0]}
              onBack={onNavigateToHome}
              onAddToCart={(dish, qty, doneness, sauce) =>
                onAddToCart(dish, qty)
              }
              onOpenCart={onOpenCart}
              cartItems={cartItems}
              onSelectRelatedDish={onSelectDish}
            />
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
};
