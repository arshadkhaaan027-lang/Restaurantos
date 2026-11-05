import React from 'react';
import { UtensilsCrossed, ShieldCheck, Flame, ArrowRight, Sparkles, ChefHat } from 'lucide-react';

interface OnboardingScreenProps {
  onStart: () => void;
  onSkip?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onStart, onSkip }) => {
  return (
    <div className="flex-1 flex flex-col justify-between bg-[#faf7f2] relative overflow-hidden">
      {/* Top Header */}
      <div className="px-6 pt-2 pb-2 flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#82181a] flex items-center justify-center text-white shadow-sm">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
            Restaurant<span className="text-[#82181a]">OS</span>
          </span>
        </div>

        {/* Skip action */}
        <button
          onClick={onSkip || onStart}
          className="text-xs font-semibold text-stone-500 hover:text-stone-900 px-2 py-1 rounded transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Hero Headline & Subtitle */}
      <div className="px-6 pt-3 pb-2 space-y-2">
        <h1 className="font-serif text-[34px] leading-[1.12] font-bold text-stone-900 tracking-tight">
          Good Food <br />
          <span className="text-[#82181a]">Brighter Days</span>
        </h1>
        <p className="text-stone-600 text-[13px] leading-relaxed max-w-[280px]">
          Artisan culinary dining, sourced responsibly and prepared over woodfire for healthier, happier moments.
        </p>
      </div>

      {/* 3 Feature Highlights in horizontal row */}
      <div className="px-6 py-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/80 border border-stone-200/70 rounded-2xl p-2.5 flex flex-col items-center text-center shadow-xs">
            <div className="w-7 h-7 rounded-full bg-[#82181a]/10 flex items-center justify-center text-[#82181a] mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-semibold text-stone-900">Farm Fresh</span>
            <span className="text-[9px] text-stone-500">Organic Pick</span>
          </div>

          <div className="bg-white/80 border border-stone-200/70 rounded-2xl p-2.5 flex flex-col items-center text-center shadow-xs">
            <div className="w-7 h-7 rounded-full bg-[#82181a]/10 flex items-center justify-center text-[#82181a] mb-1.5">
              <ChefHat className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-semibold text-stone-900">Master Chef</span>
            <span className="text-[9px] text-stone-500">Artisan Cut</span>
          </div>

          <div className="bg-white/80 border border-stone-200/70 rounded-2xl p-2.5 flex flex-col items-center text-center shadow-xs">
            <div className="w-7 h-7 rounded-full bg-[#82181a]/10 flex items-center justify-center text-[#82181a] mb-1.5">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-semibold text-stone-900">Table Express</span>
            <span className="text-[9px] text-stone-500">Fast Serving</span>
          </div>
        </div>
      </div>

      {/* Curved Visual Backdrop with Realistic Culinary Photo */}
      <div className="relative mt-2 flex-1 flex flex-col justify-end">
        {/* Curving Burgundy Swoosh Layer */}
        <div className="absolute inset-x-0 bottom-0 top-6 overflow-hidden">
          <svg
            className="absolute top-0 left-0 w-full h-16 text-[#82181a]"
            viewBox="0 0 400 60"
            preserveAspectRatio="none"
          >
            <path
              d="M0,45 C120,0 260,70 400,20 L400,60 L0,60 Z"
              fill="currentColor"
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 top-12 bg-gradient-to-b from-[#82181a] via-[#6d1316] to-[#450a0a]"></div>
        </div>

        {/* Realistic Hero Steak / Dish Photography Platter */}
        <div className="relative z-10 px-5 pt-3 pb-4 flex flex-col items-center">
          <div className="relative w-full max-w-[290px] h-[190px] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-stone-900 group">
            <img
              src="/public/assets/aistudio/f9e7d2e0998568af1b7621d01eca76a5_14f57414.jpg"
              alt="Prime Dry-Aged Ribeye Platter"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                // Fallback to Unsplash steak if needed
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

            {/* Floating Tag */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 text-white text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Woodfire Seared · Table 14
            </div>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center gap-1.5 mt-4 mb-3">
            <div className="w-5 h-1.5 rounded-full bg-[#82181a]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
          </div>

          {/* Bold Red CTA Button */}
          <button
            onClick={onStart}
            className="w-full max-w-[310px] h-12 bg-[#82181a] hover:bg-[#6e1315] active:scale-[0.98] text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#82181a]/25 transition-all cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
