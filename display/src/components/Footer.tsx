/**
 * @file apps/display/src/components/Footer.tsx
 * @description Hallway Display Footer Component with Bottom Scrolling News Ticker.
 * 
 * NEED FOR THIS COMPONENT:
 * Implements Mode 2 (News Ticker) at the bottom of the screen, ensuring that secondary 
 * announcements and quick alerts remain continuously visible to passing students.
 */

'use client';

import React from 'react';
import { ListenerStatus } from '@/lib/firebase';
import { Megaphone, LayoutGrid, Image as ImageIcon } from 'lucide-react';

interface FooterProps {
  noticeCount: number;
  status: ListenerStatus;
  tickerMessages?: string[];
  activeMode?: string;
  onModeChange?: (mode: string) => void;
}


export const Footer: React.FC<FooterProps> = ({
  noticeCount,
  status,
  tickerMessages = [],
  activeMode = 'hero',
  onModeChange,
}) => {
  const combinedTickerText = tickerMessages.join('   •••   ');

  return (
    <footer className="w-full bg-white border-t border-[#E5E7EB] select-none z-30">
      {/* Top Bar: Mode Switcher & Counter (40px) */}
      <div className="h-[40px] px-8 flex items-center justify-between border-b border-[#F1F5F9] text-xs font-semibold">
        {/* Left: Display Modes */}
        <div className="flex items-center gap-2">
          <span className="text-[#64748B] font-medium mr-2">Display Mode:</span>
          <button
            onClick={() => onModeChange?.('hero')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              activeMode === 'hero'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'bg-[#F3F4F6] text-[#64748B] hover:text-[#111111] hover:bg-[#E5E7EB]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Hero View (Mode 1)</span>
          </button>

          <button
            onClick={() => onModeChange?.('split')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              activeMode === 'split'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'bg-[#F3F4F6] text-[#64748B] hover:text-[#111111] hover:bg-[#E5E7EB]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Split Screen (Mode 5)</span>
          </button>
        </div>

        {/* Right: Notice Counter & System Attribution */}
        <div className="flex items-center gap-4 text-[#64748B]">
          <div className="bg-[#F3F4F6] px-3 py-0.5 rounded border border-[#E5E7EB] text-[#111111] font-bold">
            {noticeCount} Active Announcements
          </div>
          <span>CampusCast Communication OS</span>
        </div>
      </div>

      {/* Bottom Bar: Mode 2 News Ticker Marquee (44px) */}
      <div className="h-[44px] bg-[#F8FAFC] flex items-center overflow-hidden border-t border-[#E5E7EB] relative">
        <div className="bg-[#2563EB] text-white px-4 h-full flex items-center gap-2 font-bold text-xs z-10 shadow-md shrink-0">
          <Megaphone className="w-4 h-4" />
          <span className="uppercase tracking-wider">LIVE TICKER</span>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap py-2 text-sm font-semibold text-[#334155] flex items-center gap-8 px-4">
            <span>{combinedTickerText}</span>
            <span>{combinedTickerText}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};


