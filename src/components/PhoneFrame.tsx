import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  overlay?: React.ReactNode;
  currentTime?: string;
  className?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  overlay,
  currentTime = '9:41',
  className = '',
}) => {
  return (
    <div
      className={`relative mx-auto w-[385px] h-[795px] max-h-[92vh] bg-[#1a1716] rounded-[52px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-black/40 flex flex-col select-none transition-all duration-300 ${className}`}
    >
      {/* Outer Titanium Bezel highlights */}
      <div className="absolute inset-0 rounded-[52px] pointer-events-none border-[3px] border-[#383330]/80"></div>

      {/* Screen Container */}
      <div className="relative w-full h-full bg-[#faf7f2] rounded-[42px] overflow-hidden flex flex-col">
        {/* iOS Status Bar */}
        <div className="relative z-50 flex items-center justify-between px-7 pt-3.5 pb-2 text-xs font-semibold tracking-tight text-neutral-800">
          <span className="w-12">{currentTime}</span>

          {/* Dynamic Island Pill */}
          <div className="h-5 w-24 bg-black rounded-full flex items-center justify-center gap-2 px-2 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a8a]/40"></div>
          </div>

          <div className="flex items-center gap-1.5 w-12 justify-end">
            <Signal className="w-3.5 h-3.5 stroke-[2.5]" />
            <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
            <BatteryMedium className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col no-scrollbar">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="relative z-40 pb-2 pt-1 flex justify-center bg-transparent pointer-events-none">
          <div className="w-32 h-1 bg-neutral-400/80 rounded-full"></div>
        </div>

        {/* Screen Overlays (Confined to Mobile Frame) */}
        {overlay}
      </div>
    </div>
  );
};
