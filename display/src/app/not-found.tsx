/**
 * @file apps/display/src/app/not-found.tsx
 * @description Custom 404 Not Found Page for CampusCast Display App — Brand Kit v2 Light Theme.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Tv,
  ArrowLeft,
  Radio,
  ExternalLink,
} from 'lucide-react';

const POPULAR_DEPTS = [
  { code: 'ALL', label: 'All Displays Directory', href: '/display' },
  { code: 'CSE', label: 'CSE Department Kiosk', href: '/display/cse' },
  { code: 'ECE', label: 'ECE Department Kiosk', href: '/display/ece' },
  { code: 'AIML', label: 'AIML Department Kiosk', href: '/display/aiml' },
];

export default function DisplayNotFound() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111111] flex flex-col items-center justify-center p-6 select-none font-sans">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-10 max-w-lg w-full space-y-8 shadow-xl text-center">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center border border-[#2563EB]/20">
            <Radio className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-lg font-black tracking-tight text-[#111111] block">CampusCast</span>
            <span className="text-[10px] font-semibold text-[#60A5FA] uppercase tracking-wider block">
              Digital Notice Display
            </span>
          </div>
        </div>

        {/* 404 Icon & Title */}
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Tv className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-100 text-amber-800">
              Display Kiosk Not Found · 404
            </span>
            <h2 className="text-2xl font-black text-[#111111] pt-2">Screen Channel Unavailable</h2>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              The hallway display kiosk channel you entered does not match a registered campus screen.
            </p>
          </div>
        </div>

        {/* Quick Kiosk Launcher Buttons */}
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 space-y-2 text-xs text-left">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
            Active Hallway Channels
          </span>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_DEPTS.map((d) => (
              <Link
                key={d.code}
                href={d.href}
                className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl font-bold text-[#111111] hover:border-[#2563EB] hover:text-[#2563EB] flex items-center justify-between transition-all group"
              >
                <span>{d.code} Screen</span>
                <ExternalLink className="w-3 h-3 text-[#64748B] group-hover:text-[#2563EB]" />
              </Link>
            ))}
          </div>
        </div>

        {/* Return Button */}
        <div>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 px-6 rounded-2xl text-xs font-bold transition-all shadow-md shadow-[#2563EB]/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Display Launcher</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
