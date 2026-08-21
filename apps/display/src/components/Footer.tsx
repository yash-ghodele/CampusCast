'use client';

import React from 'react';
import { ListenerStatus } from '../lib/firebase';

interface FooterProps {
  noticeCount: number;
  status: ListenerStatus;
}

export const Footer: React.FC<FooterProps> = ({ noticeCount, status }) => {
  return (
    <footer className="h-[48px] w-full px-8 flex items-center justify-between bg-[#0B1220] border-t border-[#222F47] text-sm text-[#8B96A8] select-none">
      <div className="flex items-center gap-2 font-medium">
        <span className="text-[#3B82F6] font-bold">CampusCast</span>
        <span>• Live Digital Signage System</span>
      </div>

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
