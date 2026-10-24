/**
 * @file admin/src/app/not-found.tsx
 * @description Custom 404 Route Not Found Component for CampusCast Admin Command Center.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileQuestion,
  ArrowLeft,
  LayoutDashboard,
  Kanban,
  Tv,
  Settings,
  Radio,
} from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111111] flex flex-col items-center justify-center p-6 select-none font-sans">
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-10 max-w-lg w-full space-y-8 shadow-xl text-center">
        {/* Brand Badge */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center border border-[#2563EB]/20">
            <Radio className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-lg font-black tracking-tight text-[#111111] block">CampusCast</span>
            <span className="text-[10px] font-semibold text-[#60A5FA] uppercase tracking-wider block">
              Management Portal
            </span>
          </div>
        </div>

        {/* 404 Visual Icon & Heading */}
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <FileQuestion className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-red-100 text-red-700">
              Error 404 · Route Not Found
            </span>
            <h2 className="text-2xl font-black text-[#111111] pt-2">Page Does Not Exist</h2>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              The admin control center module you requested is either unavailable or has been relocated.
            </p>
          </div>
        </div>

        {/* Quick Navigation Action Pills */}
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 space-y-2 text-xs text-left">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
            Suggested Quick Routes
          </span>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl font-bold text-[#111111] hover:border-[#2563EB] hover:text-[#2563EB] flex items-center gap-2 transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/notices"
              className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl font-bold text-[#111111] hover:border-[#2563EB] hover:text-[#2563EB] flex items-center gap-2 transition-all"
            >
              <Kanban className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Notices</span>
            </Link>
            <Link
              href="/displays"
              className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl font-bold text-[#111111] hover:border-[#2563EB] hover:text-[#2563EB] flex items-center gap-2 transition-all"
            >
              <Tv className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Screens Wall</span>
            </Link>
            <Link
              href="/settings"
              className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl font-bold text-[#111111] hover:border-[#2563EB] hover:text-[#2563EB] flex items-center gap-2 transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-[#475569]" />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* Primary Return Button */}
        <div>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3 px-6 rounded-2xl text-xs font-bold transition-all shadow-md shadow-[#2563EB]/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Admin Command Center</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
