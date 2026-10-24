/**
 * @file display/src/components/Footer.tsx
 * @description Hallway Display Footer Component with Continuous Scrolling News Marquee.
 * 
 * Implements the Mode 2 News Ticker pinned to the bottom of corridor TV screens, ensuring secondary
 * announcements, reminders, and broadcast tickers remain continuously visible to passing students.
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
}) => {
  const combinedTickerText =
    tickerMessages.length > 0
      ? tickerMessages.join('   •••   ')
      : 'CampusCast Digital Hallway Signage • Realtime Firestore Cloud Stream';

  return (
    <footer className="w-full bg-white border-t border-[#E5E7EB] select-none z-30 shadow-sm">
      {/* Mode 2 News Ticker Marquee (48px) */}
      <div className="h-[48px] bg-[#F8FAFC] flex items-center overflow-hidden relative">
        <div className="bg-[#2563EB] text-white px-5 h-full flex items-center gap-2.5 font-black text-xs z-10 shadow-md shrink-0 tracking-wider uppercase">
          <Megaphone className="w-4 h-4" />
          <span>Live Ticker</span>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap py-2 text-sm font-semibold text-[#334155] flex items-center gap-8 px-4">
            <span>{combinedTickerText}</span>
            <span>{combinedTickerText}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 px-4 h-full bg-white border-l border-[#E5E7EB] text-xs font-bold text-[#64748B] shrink-0 z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[#111111]">{noticeCount} Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};


