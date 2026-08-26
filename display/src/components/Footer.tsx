/**
 * @file apps/display/src/components/Footer.tsx
 * @description Hallway Display Footer Component (48px height fixed bar).
 * 
 * NEED FOR THIS COMPONENT:
 * Displays system branding, active notice counter, and live connection telemetry.
 * When connectivity drops, it shifts the status dot to a yellow pulsing "Reconnecting..."
 * state without destroying or blanking the notice cards rendered on screen.
 */

'use client';

import React from 'react';
import { ListenerStatus } from '../lib/firebase';

interface FooterProps {
  noticeCount: number; // Number of currently active notices rendered
  status: ListenerStatus; // 'connected' | 'reconnecting' | 'error'
}

/**
 * Footer Component
 * 
 * WORKING MECHANISM:
 * Renders platform attribution on the left, active notice count pill on the right,
 * and dynamic connection telemetry status indicator:
 * - 'connected': Emerald green dot with subtle pulse.
 * - 'reconnecting': Amber yellow dot with ping animation (Resilience Mode).
 * - 'error': Red dot.
 */
export const Footer: React.FC<FooterProps> = ({ noticeCount, status }) => {
  return (
    <footer className="h-[48px] w-full px-8 flex items-center justify-between bg-[#0B1220] border-t border-[#222F47] text-sm text-[#8B96A8] select-none">
      {/* Left: Branding */}
      <div className="flex items-center gap-2 font-medium">
        <span className="text-[#3B82F6] font-bold">CampusCast</span>
        <span>• Live Digital Signage System</span>
      </div>

      {/* Right: Telemetry Indicator & Active Notice Count */}
      <div className="flex items-center gap-6 font-medium">
        <div className="flex items-center gap-2">
          {status === 'connected' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400">Live</span>
            </>
          )}
          {status === 'reconnecting' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span className="text-amber-400 font-semibold">Reconnecting…</span>
            </>
          )}
          {status === 'error' && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-red-400 font-semibold">Offline</span>
            </>
          )}
        </div>

        <div className="text-[#F5F7FA] font-semibold bg-[#141C2E] px-3 py-1 rounded border border-[#222F47]">
          {noticeCount} active {noticeCount === 1 ? 'notice' : 'notices'}
        </div>
      </div>
    </footer>
  );
};
