/**
 * @file apps/display/src/app/page.tsx
 * @description Signage Directory Landing Launcher Page (`/`) — Brand Kit v2 Specification.
 * 
 * NEED FOR THIS PAGE:
 * Serves as the primary launcher directory for physical kiosk displays across campus corridors.
 * Matches the official Brand Kit v2 design with 3D Smart TV preview frame, live department filter search,
 * and high-impact visual hierarchy.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Radio,
  ArrowRight,
  Shield,
  Monitor,
  Sparkles,
  Zap,
  Laptop,
  Bot,
  Cog,
  Building2,
  Plug,
  Search,
  Users,
  Tv,
  Calendar,
  Clock,
  MapPin,
  Megaphone,
} from 'lucide-react';

interface DeptItem {
  code: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  iconColor: string;
  cardBorder: string;
}

const DEPARTMENTS: DeptItem[] = [
  {
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    icon: Zap,
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-600 border-orange-200',
    iconBg: 'bg-orange-100/70',
    iconColor: 'text-orange-600',
    cardBorder: 'hover:border-orange-300',
  },
  {
    code: 'CSE',
    name: 'Computer Science & Engineering',
    icon: Laptop,
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-600 border-blue-200',
    iconBg: 'bg-blue-100/70',
    iconColor: 'text-blue-600',
    cardBorder: 'hover:border-blue-300',
  },
  {
    code: 'AIML',
    name: 'Artificial Intelligence & Machine Learning',
    icon: Bot,
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-600 border-purple-200',
    iconBg: 'bg-purple-100/70',
    iconColor: 'text-purple-600',
    cardBorder: 'hover:border-purple-300',
  },
  {
    code: 'MECH',
    name: 'Mechanical Engineering',
    icon: Cog,
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-600 border-rose-200',
    iconBg: 'bg-rose-100/70',
    iconColor: 'text-rose-600',
    cardBorder: 'hover:border-rose-300',
  },
  {
    code: 'CIVIL',
    name: 'Civil Engineering',
    icon: Building2,
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-600 border-emerald-200',
    iconBg: 'bg-emerald-100/70',
    iconColor: 'text-emerald-600',
    cardBorder: 'hover:border-emerald-300',
  },
  {
    code: 'EEE',
    name: 'Electrical & Electronics Engineering',
    icon: Plug,
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-600 border-amber-200',
    iconBg: 'bg-amber-100/70',
    iconColor: 'text-amber-600',
    cardBorder: 'hover:border-amber-300',
  },
];

export default function DisplayIndexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [logoError, setLogoError] = useState(false);

  const filteredDepts = DEPARTMENTS.filter(
    (dept) =>
      dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111111] font-sans selection:bg-[#2563EB] selection:text-white flex flex-col justify-between relative overflow-x-hidden">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
            {logoError ? (
              <Radio className="w-7 h-7 text-[#2563EB]" />
            ) : (
              <img
                src="/logo-transparent.png"
                alt="CampusCast Logo"
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-[#111111]">CampusCast</span>
            <span className="text-[10px] font-semibold text-[#64748B] tracking-widest uppercase">
              YOUR CAMPUS. YOUR VOICE.
            </span>
          </div>
        </Link>

        <Link
          href="/display"
          className="flex items-center gap-2 text-xs font-bold text-[#2563EB] bg-white hover:bg-blue-50/80 px-4 py-2.5 rounded-full border border-blue-100 shadow-sm transition-all hover:scale-105"
        >
          <Tv className="w-4 h-4 text-[#2563EB]" />
          <span>Smart TV Browser Kiosk Launcher</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* HERO SECTION WITH SPLIT MOCKUP */}
      <section className="max-w-7xl w-full mx-auto px-6 py-8 lg:py-12 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & CTA */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-[#2563EB]/10 text-[#2563EB] px-4 py-1.5 rounded-full border border-[#2563EB]/25 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              <span>CAMPUS COMMUNICATION OPERATING SYSTEM V2.0</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-[#111111]">
              Select Department <br />
              <span className="text-[#2563EB] bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">
                Display Screen
              </span>
            </h1>

            <p className="text-lg text-[#64748B] font-medium leading-relaxed max-w-xl">
              Launch real-time digital notice boards with Hero Notice mode, News Ticker marquee, and Emergency Override capabilities.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/display"
                className="inline-flex items-center gap-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-xl shadow-[#2563EB]/30 hover:scale-105"
              >
                <Monitor className="w-5 h-5" />
                <span>Launch General All-Campus Screen</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </div>

            {/* Feature Badges Row */}
            <div className="pt-6 border-t border-[#E2E8F0] flex items-center gap-6 flex-wrap text-xs font-bold text-[#475569]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Zap className="w-4 h-4 text-[#2563EB]" />
                </div>
                <span>Real-time Updates</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Users className="w-4 h-4 text-[#2563EB]" />
                </div>
                <span>For the Entire Campus</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Shield className="w-4 h-4 text-[#2563EB]" />
                </div>
                <span>Reliable & Trustworthy</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Smart TV Frame Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[620px] group">
              {/* TV Bezel */}
              <div className="bg-[#0F172A] p-3 rounded-2xl shadow-2xl border-4 border-slate-800 relative">
                {/* TV Screen Container (16:9 Aspect Ratio) */}
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#0B1220] flex flex-col justify-between border border-slate-700/60 shadow-inner">
                  {/* Campus Image Background */}
                  <img
                    src="https://images.unsplash.com/photo-1562774053-701939374585?w=1000&auto=format&fit=crop&q=80"
                    alt="Campus Building Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
                  />

                  {/* Top Bar inside TV Preview */}
                  <div className="relative z-10 px-4 py-2.5 bg-[#0B1220]/90 backdrop-blur border-b border-slate-700/60 flex items-center justify-between text-[11px] text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-[#2563EB] flex items-center justify-center p-0.5">
                        <Radio className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-bold">CampusCast</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <span>ECE Department</span>
                      <span>|</span>
                      <span>Tue, 23 Sep 2026 10:45 AM</span>
                    </div>
                  </div>

                  {/* Notice Content inside TV Preview */}
                  <div className="relative z-10 p-5 flex-1 flex flex-col justify-center text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold uppercase w-fit mb-2">
                      <Zap className="w-3 h-3" />
                      <span>EXAM NOTICE</span>
                    </div>

                    <h3 className="text-xl font-black text-white tracking-tight mb-1">
                      MIDTERM EXAMINATION
                    </h3>

                    <p className="text-xs text-slate-200 line-clamp-2 mb-3">
                      Semester Midterm Examination begins from 5th October 2026 as per the revised schedule.
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-300 font-medium">
                      <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                        <Calendar className="w-3 h-3 text-[#2563EB]" />
                        <span>05 Oct 2026</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                        <Clock className="w-3 h-3 text-[#22C55E]" />
                        <span>10:00 AM Onwards</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>MIT Campus</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Ticker Bar inside TV Preview */}
                  <div className="relative z-10 h-7 bg-[#141C2E] border-t border-slate-700/60 flex items-center text-[10px]">
                    <div className="bg-[#2563EB] text-white px-2.5 h-full flex items-center gap-1 font-bold">
                      <Megaphone className="w-3 h-3" />
                      <span>Latest Updates</span>
                    </div>
                    <div className="flex-1 overflow-hidden px-3 text-slate-300 font-medium truncate">
                      Robotics Workshop Registration Open | Placement Drive by Infosys on Monday | Hostel Fee Deadline
                    </div>
                  </div>
                </div>
              </div>

              {/* TV Stand Legs */}
              <div className="w-32 h-3 bg-slate-800 mx-auto rounded-b-md shadow-md border-t border-slate-700" />
            </div>
          </div>
        </div>
      </section>

      {/* CHOOSE DEPARTMENT SECTION */}
      <section className="max-w-7xl w-full mx-auto px-6 py-12 z-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-[#111111] tracking-tight">Choose Department</h2>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-[#64748B] absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 rounded-full pl-11 pr-4 py-2.5 text-xs font-semibold text-[#111111] placeholder:text-[#94A3B8] shadow-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* 6 Department Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredDepts.map((dept) => {
            const DeptIcon = dept.icon;

            return (
              <Link
                key={dept.code}
                href={`/display/${dept.code.toLowerCase()}`}
                className={`group bg-white border border-[#E2E8F0] ${dept.cardBorder} rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between relative overflow-hidden`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    {/* Icon Box */}
                    <div className={`w-12 h-12 rounded-2xl ${dept.iconBg} flex items-center justify-center border border-current/10 shadow-xs`}>
                      <DeptIcon className={`w-6 h-6 ${dept.iconColor}`} />
                    </div>

                    {/* Department Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border tracking-wider ${dept.badgeBg} ${dept.badgeText}`}>
                      {dept.code}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#111111] group-hover:text-[#2563EB] transition-colors leading-snug">
                    {dept.name}
                  </h3>
                </div>

                <div className="mt-8 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#64748B]">Launch Screen Kiosk</span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-all group-hover:translate-x-1 shadow-xs">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl w-full mx-auto px-6 py-6 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B] font-medium z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#22C55E]" />
          <span>Zero-Hardware Smart TV Model • Firebase Firestore Realtime Stream</span>
        </div>
        <span>CampusCast © 2026 — All Rights Reserved</span>
      </footer>
    </div>
  );
}
