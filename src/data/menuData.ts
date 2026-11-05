import { Dish, RewardItem } from '../types/restaurant';

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'utensils' },
  { id: 'steaks', label: 'Steaks', icon: 'beef' },
  { id: 'pasta', label: 'Pasta', icon: 'soup' },
  { id: 'woodfire', label: 'Woodfire', icon: 'flame' },
  { id: 'starters', label: 'Starters', icon: 'sparkles' },
  { id: 'drinks', label: 'Drinks', icon: 'wine' },
  { id: 'desserts', label: 'Desserts', icon: 'cake' },
];

export const DISHES: Dish[] = [
  {
    id: 'ribeye-steak',
    name: 'Ribeye Steak',
    category: 'steaks',
    price: 1299,
    unitLabel: '/ cut',
    rating: 4.8,
    reviewCount: 320,
    isBestSeller: true,
    description:
      'Rich marbling, tender texture, and bold wood-fired flavor. Finished with roasted rosemary garlic butter, flaky Maldon sea salt, and blistered cherry vine tomatoes.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-amber-900 to-red-950',
    calories: '680 kcal',
    prepTime: '15-20 min',
    donenessOptions: ['Rare', 'Medium-Rare', 'Medium', 'Medium-Well', 'Well-Done'],
    sauceOptions: ['Chimichurri Herb Butter', 'Black Truffle Demi-Glace', 'Green Peppercorn Cognac', 'Bearnaise Sauce'],
    features: [
      {
        icon: 'utensils',
        title: 'Freshly Cut',
        desc: 'Dry-Aged 28 Days',
      },
      {
        icon: 'shield',
        title: 'Halal Certified',
        desc: '100% Prime Angus',
      },
      {
        icon: 'truck',
        title: 'Table Express',
        desc: 'Hot Wood-Fired',
      },
    ],
  },
  {
    id: 'sirloin-steak',
    name: 'Sirloin Steak',
    category: 'steaks',
    price: 999,
    unitLabel: '/ cut',
    rating: 4.7,
    reviewCount: 215,
    isBestSeller: true,
    description:
      'Lean yet remarkably juicy striploin cut, seasoned with coarse black pepper and grilled over Japanese binchotan charcoal for deep smoky notes.',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-red-950 to-stone-900',
    calories: '540 kcal',
    prepTime: '15 min',
    donenessOptions: ['Rare', 'Medium-Rare', 'Medium', 'Medium-Well'],
    sauceOptions: ['Garlic Herb Butter', 'Red Wine Reduction', 'Smoked Sea Salt'],
    features: [
      { icon: 'utensils', title: 'Lean & Tender', desc: 'Center-Cut Strip' },
      { icon: 'shield', title: 'Halal Certified', desc: 'Grain Fed' },
      { icon: 'truck', title: 'Table Express', desc: 'Express Serve' },
    ],
  },
  {
    id: 'wagyu-smash-burger',
    name: 'Wagyu Mince Burger',
    category: 'steaks',
    price: 649,
    unitLabel: '/ plate',
    rating: 4.9,
    reviewCount: 412,
    isBestSeller: true,
    description:
      'Double smashed A5 Wagyu patties with crispy lacy edges, melted aged Gruyère cheese, caramelized shallots, and house truffle aioli on toasted brioche.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-amber-950 to-stone-900',
    calories: '720 kcal',
    prepTime: '12 min',
    donenessOptions: ['Chef Standard Smash'],
    sauceOptions: ['Truffle Aioli', 'Smoky Bourbon BBQ', 'Extra Gruyère Melt'],
    features: [
      { icon: 'utensils', title: 'Fresh Ground', desc: 'Daily Mince' },
      { icon: 'shield', title: 'A5 Blend', desc: 'Wagyu Reserve' },
      { icon: 'truck', title: 'Crispy Fries', desc: 'Included' },
    ],
  },
  {
    id: 'truffle-tagliolini',
    name: 'Truffle Tagliolini',
    category: 'pasta',
    price: 799,
    unitLabel: '/ bowl',
    rating: 4.9,
    reviewCount: 189,
    isBestSeller: true,
    description:
      'Silky handmade egg pasta tossed in cultured French butter and Parmigiano-Reggiano, crowned with generous shavings of black Umbrian truffle.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-amber-900 to-yellow-950',
    calories: '610 kcal',
    prepTime: '14 min',
    features: [
      { icon: 'utensils', title: 'Hand Rolled', desc: 'Fresh Pasta' },
      { icon: 'shield', title: 'Black Truffle', desc: 'Umbria D.O.P.' },
      { icon: 'truck', title: 'Table Express', desc: 'Al Dente' },
    ],
  },
  {
    id: 'woodfire-margherita',
    name: 'Woodfire Margherita',
    category: 'woodfire',
    price: 549,
    unitLabel: '/ pie',
    rating: 4.8,
    reviewCount: 304,
    isBestSeller: false,
    description:
      'Naturally leavened 48-hour sourdough crust, San Marzano tomato sauce, creamy buffalo mozzarella, sweet basil, and extra virgin olive oil.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-red-900 to-amber-950',
    calories: '780 kcal',
    prepTime: '10 min',
    features: [
      { icon: 'utensils', title: '48h Ferment', desc: 'Artisan Crust' },
      { icon: 'shield', title: 'D.O.P. Certified', desc: 'San Marzano' },
      { icon: 'truck', title: 'Wood-Fired', desc: '450°C Stone Oven' },
    ],
  },
  {
    id: 'burrata-heirloom',
    name: 'Burrata & Heirlooms',
    category: 'starters',
    price: 499,
    unitLabel: '/ plate',
    rating: 4.7,
    reviewCount: 142,
    isBestSeller: false,
    description:
      'Creamy Pugliese burrata cheese paired with ripe multi-colored heirloom tomatoes, basil oil infusion, aged balsamic reduction, and warm grilled focaccia.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-emerald-950 to-stone-900',
    calories: '420 kcal',
    prepTime: '8 min',
    features: [
      { icon: 'utensils', title: 'Puglia Burrata', desc: 'Imported Weekly' },
      { icon: 'shield', title: 'Organic Produce', desc: 'Local Farms' },
      { icon: 'truck', title: 'Warm Focaccia', desc: 'Freshly Baked' },
    ],
  },
  {
    id: 'pan-seared-salmon',
    name: 'King Salmon Fillet',
    category: 'steaks',
    price: 1199,
    unitLabel: '/ plate',
    rating: 4.8,
    reviewCount: 178,
    isBestSeller: false,
    description:
      'Wild king salmon pan-seared to crispy-skin perfection over velvety parsnip puree, baby asparagus, and Meyer lemon brown butter emulsion.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-orange-950 to-stone-900',
    calories: '510 kcal',
    prepTime: '15 min',
    features: [
      { icon: 'utensils', title: 'Wild Salmon', desc: 'Sustainably Caught' },
      { icon: 'shield', title: 'Omega Rich', desc: 'Fresh Daily' },
      { icon: 'truck', title: 'Pan Crisp', desc: 'Made to Order' },
    ],
  },
  {
    id: 'valrhona-fondant',
    name: 'Valrhona Chocolate',
    category: 'desserts',
    price: 399,
    unitLabel: '/ plate',
    rating: 4.9,
    reviewCount: 260,
    isBestSeller: false,
    description:
      'Warm 70% dark chocolate lava cake with a flowing liquid center, topped with Tahitian vanilla bean gelato and crushed pistachio praline.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-stone-950 to-amber-950',
    calories: '490 kcal',
    prepTime: '10 min',
    features: [
      { icon: 'utensils', title: '70% Valrhona', desc: 'Grand Cru' },
      { icon: 'shield', title: 'Artisan Gelato', desc: 'Tahitian Bean' },
      { icon: 'truck', title: 'Served Hot', desc: 'Baked to Order' },
    ],
  },
  {
    id: 'smoked-old-fashioned',
    name: 'Smoked Old Fashioned',
    category: 'drinks',
    price: 449,
    unitLabel: '/ glass',
    rating: 4.9,
    reviewCount: 195,
    isBestSeller: false,
    description:
      'Single-barrel Kentucky bourbon infused with smoked cherrywood, raw Demerara syrup, Angostura bitters, and flamed orange peel over a hand-carved ice sphere.',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    fallbackGradient: 'from-amber-950 to-red-950',
    calories: '180 kcal',
    prepTime: '5 min',
    features: [
      { icon: 'utensils', title: 'Hand Carved', desc: 'Crystal Clear Ice' },
      { icon: 'shield', title: 'Small Batch', desc: 'Aged Bourbon' },
      { icon: 'truck', title: 'Table Smoked', desc: 'Under Cloche' },
    ],
  },
];

export const INITIAL_LOYALTY_STAMPS: boolean[] = [
  true,  // Stamp 1
  true,  // Stamp 2
  true,  // Stamp 3
  true,  // Stamp 4
  true,  // Stamp 5 (Unlocked First Reward)
  true,  // Stamp 6
  true,  // Stamp 7
  false, // Stamp 8 (Locked)
  false, // Stamp 9 (Locked)
  false, // Stamp 10 (Grand Reward)
];

export const REWARDS: RewardItem[] = [
  {
    id: 'rw-1',
    title: 'Artisanal Mocktail or Dessert',
    stampsRequired: 5,
    description: 'Claim any handcrafted cocktail, mocktail, or chocolate lava cake with your meal.',
    unlocked: true,
    tag: 'Ready to Claim',
  },
  {
    id: 'rw-2',
    title: 'Complimentary Truffle Fries',
    stampsRequired: 3,
    description: 'Crisp russet potato fries tossed with black truffle oil and 24-month parmigiano.',
    unlocked: true,
    tag: 'Ready to Claim',
  },
  {
    id: 'rw-3',
    title: '50% Off Any Prime Steak Cut',
    stampsRequired: 10,
    description: 'Enjoy 50% discount on Dry-Aged Ribeye or Center-Cut Sirloin on your 10th dining visit.',
    unlocked: false,
    tag: '3 Stamps Away',
  },
];

export const AVAILABLE_COUPONS = [
  {
    code: 'TASTE100',
    title: 'Flat ₹100 Off',
    description: 'Save ₹100 on table orders above ₹800',
    discountType: 'fixed' as const,
    discountValue: 100,
    minOrder: 800,
  },
  {
    code: 'WELCOME50',
    title: 'Diner Welcome ₹50',
    description: 'Flat ₹50 discount on your meal (min. ₹400)',
    discountType: 'fixed' as const,
    discountValue: 50,
    minOrder: 400,
  },
  {
    code: 'CHEF15',
    title: 'Chef Special 15% Off',
    description: 'Get 15% off on artisan kitchen orders above ₹1,000',
    discountType: 'percentage' as const,
    discountValue: 15,
    minOrder: 1000,
  },
];
