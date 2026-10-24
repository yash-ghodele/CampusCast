/**
 * @file display/src/components/Header.tsx
 * @description Fixed Hallway Display Header Component (90px height fixed bar).
 * 
 * Renders the CampusCast brand logo, academic department identity badge with dynamic color theming,
 * live digital clock (12-hour AM/PM format with date), and real-time screen telemetry status indicator.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Radio, Wifi, Clock } from 'lucide-react';
import { ListenerStatus } from '@/lib/firebase';
import { DEPARTMENT_THEMES, formatDurationHHMMSS } from '@campuscast/shared';

interface HeaderProps {
  deptCode: string; // Short code e.g. "ECE", "CSE", "AIML"
  deptFullName?: string;
  status?: ListenerStatus;
  lastUpdatedSecondsAgo?: number;
  activeMode?: string;
  onSelectMode?: (mode: string) => void;
}

const DEPT_NAMES: Record<string, string> = {
  ECE: 'Electronics & Communication Engineering',
  CSE: 'Computer Science & Engineering',
  AIML: 'Artificial Intelligence & Machine Learning',
  MECH: 'Mechanical Engineering',
  CIVIL: 'Civil Engineering',
  EEE: 'Electrical & Electronics Engineering',
  ALL: 'All Campus Departments',
};

const ALL_DEPTS = ['ALL', 'ECE', 'CSE', 'AIML', 'MECH', 'CIVIL', 'EEE'];

export const Header: React.FC<HeaderProps> = ({
  deptCode,
  deptFullName,
  status = 'connected',
  lastUpdatedSecondsAgo = 5,
  activeMode = 'hero',
  onSelectMode,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const normalizedCode = deptCode.toUpperCase();
  const theme = (DEPARTMENT_THEMES && DEPARTMENT_THEMES[normalizedCode]) || {
    primary: '#2563EB',
    accent: '#1D4ED8',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
    border: '#60A5FA',
  };
  const fullName = deptFullName || DEPT_NAMES[normalizedCode] || 'Campus Notice System';

  return (
    <header className="h-[90px] w-full px-8 flex items-center justify-between bg-white/95 backdrop-blur border-b border-[#E5E7EB] text-[#111111] select-none z-30 transition-colors duration-300">
      {/* Left: Brand Logo & Tagline */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
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
            <span className="text-2xl font-black tracking-tight text-[#111111] flex items-center gap-2">
              CampusCast
              <span className="text-xs px-2 py-0.5 rounded bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/30 font-semibold uppercase">
                OS
              </span>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">
              YOUR CAMPUS. YOUR VOICE.
            </span>
          </div>
        </Link>

        <div className="h-10 w-[1px] bg-[#E5E7EB]" />

        {/* Department Scope Badge */}
        <div className="flex items-center gap-3">
          <span
            className="text-lg font-bold px-3.5 py-1.5 rounded-lg border uppercase tracking-wide shadow-sm"
            style={{
              backgroundColor: theme.badgeBg,
              color: theme.badgeText,
              borderColor: theme.border,
            }}
          >
            {normalizedCode} Department
          </span>
          <span className="text-sm font-medium text-[#64748B] hidden xl:inline-block max-w-xs truncate">
            {fullName}
          </span>
        </div>
      </div>

      {/* Center: Quick Department Filter Selector Pills */}
      <div className="hidden lg:flex items-center gap-1.5 bg-[#F3F4F6] p-1.5 rounded-xl border border-[#E5E7EB]">
        {ALL_DEPTS.map((dept) => {
          const isActive = normalizedCode === dept;
          return (
            <Link
              key={dept}
              href={dept === 'ALL' ? '/display/all' : `/display/${dept.toLowerCase()}`}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/30'
                  : 'text-[#64748B] hover:text-[#111111] hover:bg-white'
              }`}
            >
              {dept}
            </Link>
          );
        })}
      </div>

      {/* Right: Telemetry Status & Live Clock */}
      <div className="flex items-center gap-5">
        {/* Display Status Layer */}
        <div className="flex flex-col items-end text-xs font-semibold">
          <div className="flex items-center gap-2">
            {status === 'connected' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-[#22C55E]">Live</span>
              </>
            ) : status === 'reconnecting' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-amber-500">Reconnecting</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-red-500">Offline</span>
              </>
            )}
          </div>
          <span className="text-[#64748B] mt-0.5 font-mono">
            Updated {formatDurationHHMMSS(lastUpdatedSecondsAgo)} ago
          </span>
        </div>

        <div className="h-10 w-[1px] bg-[#E5E7EB]" />

        {/* Live Digital Clock */}
        <div className="flex flex-col items-end">
          <div className="text-2xl font-bold font-mono text-[#111111] tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#2563EB]" />
            <span>{timeStr || '10:45 AM'}</span>
          </div>
          <div className="text-xs font-medium text-[#64748B] mt-0.5">
            {dateStr || '20 May 2026'}
          </div>
        </div>
      </div>
    </header>
  );
};
