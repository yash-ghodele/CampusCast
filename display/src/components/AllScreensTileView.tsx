/**
 * @file apps/display/src/components/AllScreensTileView.tsx
 * @description All Campus Screens Tile Matrix View — Brand Kit v2 Light Theme.
 * 
 * Displays all campus display screens in an interactive multi-screen tile grid with active notices.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Notice, DEPARTMENT_THEMES } from '@campuscast/shared';
import {
  Zap,
  Laptop,
  Bot,
  Cog,
  Building2,
  Plug,
  ExternalLink,
  Tv,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface ScreenTileConfig {
  code: string;
  name: string;
  location: string;
  icon: React.FC<{ className?: string }>;
}

const SCREENS: ScreenTileConfig[] = [
  { code: 'ECE', name: 'Electronics & Communication', location: 'ECE Corridor Screen', icon: Zap },
  { code: 'CSE', name: 'Computer Science & Engineering', location: 'CSE Block Entrance', icon: Laptop },
  { code: 'AIML', name: 'Artificial Intelligence & ML', location: 'AIML Lab Foyer', icon: Bot },
  { code: 'MECH', name: 'Mechanical Engineering', location: 'Mech Workshop Hall', icon: Cog },
  { code: 'CIVIL', name: 'Civil Engineering', location: 'Civil Dept Corridor', icon: Building2 },
  { code: 'EEE', name: 'Electrical & Electronics', location: 'EEE Power Lab Screen', icon: Plug },
];

interface AllScreensTileViewProps {
  notices: Notice[];
}

export const AllScreensTileView: React.FC<AllScreensTileViewProps> = ({ notices }) => {
  const [cycleIndex, setCycleIndex] = useState<Record<string, number>>({});

  // Cycle notices within each tile if multiple notices exist
  useEffect(() => {
    const interval = setInterval(() => {
      setCycleIndex((prev) => {
        const next = { ...prev };
        SCREENS.forEach((screen) => {
          const deptNotices = notices.filter(
            (n) => n.departmentId === screen.code || n.departmentId === 'ALL'
          );
          if (deptNotices.length > 1) {
            next[screen.code] = ((next[screen.code] || 0) + 1) % deptNotices.length;
          }
        });
        return next;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [notices]);

  return (
    <div className="w-full space-y-6">
      {/* Top Overview Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB]">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#111111] flex items-center gap-2">
              All Campus Screen Matrix
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] font-bold border border-[#22C55E]/30">
                6 Screens Online
              </span>
            </h2>
            <p className="text-xs text-[#64748B]">
              Real-time synchronization across physical hallway TV displays
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="text-[#64748B]">Total Active Broadcasts:</span>
          <span className="bg-[#2563EB] text-white px-3 py-1 rounded-lg font-bold">
            {notices.length} Notices
          </span>
        </div>
      </div>

      {/* 6 Screen Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCREENS.map((screen) => {
          const theme = (DEPARTMENT_THEMES && DEPARTMENT_THEMES[screen.code]) || {
            primary: '#2563EB',
            badgeBg: '#DBEAFE',
            badgeText: '#1E40AF',
            border: '#60A5FA',
          };
          const Icon = screen.icon;

          const screenNotices = notices.filter(
            (n) => n.departmentId === screen.code || n.departmentId === 'ALL'
          );

          const currentIdx = (cycleIndex[screen.code] || 0) % Math.max(1, screenNotices.length);
          const activeNotice = screenNotices[currentIdx] || screenNotices[0];

          return (
            <div
              key={screen.code}
              className="bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Screen Top Header */}
              <div className="p-4 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs"
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                      borderColor: theme.border,
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#111111]">{screen.code} Screen</span>
                      <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                    </div>
                    <span className="text-[10px] text-[#64748B] block">{screen.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase"
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                      borderColor: theme.border,
                    }}
                  >
                    {screenNotices.length} {screenNotices.length === 1 ? 'Notice' : 'Notices'}
                  </span>
                </div>
              </div>

              {/* Notice Content / Screen Preview Area */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {activeNotice ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: theme.badgeBg,
                          color: theme.badgeText,
                          borderColor: theme.border,
                        }}
                      >
                        {activeNotice.category}
                      </span>

                      {activeNotice.departmentId === 'ALL' && (
                        <span className="text-[10px] font-extrabold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          ALL CAMPUS
                        </span>
                      )}

                      {activeNotice.priority === 'urgent' && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" />
                          URGENT
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#111111] group-hover:text-[#2563EB] transition-colors line-clamp-2 leading-snug">
                      {activeNotice.title}
                    </h3>

                    {activeNotice.mediaUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F1F5F9] aspect-[16/9] max-h-36">
                        {activeNotice.mediaType === 'pdf' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-blue-50 text-[#2563EB]">
                            <FileText className="w-8 h-8 mb-1" />
                            <span className="text-xs font-bold">PDF Document Notice</span>
                          </div>
                        ) : (
                          <img
                            src={activeNotice.mediaUrl}
                            alt={activeNotice.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}

                    <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed">
                      {activeNotice.content}
                    </p>

                    <div className="flex items-center gap-3 pt-2 text-[10px] font-semibold text-[#64748B] border-t border-[#F1F5F9]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#2563EB]" />
                        <span>{new Date(activeNotice.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#22C55E]" />
                        <span>Active Stream</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-[#94A3B8]">
                      <Tv className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#475569]">Screen Online</span>
                    <p className="text-[11px] text-[#94A3B8] max-w-[200px]">
                      Standby mode. Ready for incoming broadcasts.
                    </p>
                  </div>
                )}

                {/* Bottom Action / Launch Screen Button */}
                <div className="pt-3">
                  <Link
                    href={`/display/${screen.code.toLowerCase()}`}
                    className="w-full bg-[#F8FAFC] hover:bg-[#2563EB] text-[#475569] hover:text-white border border-[#E5E7EB] hover:border-[#2563EB] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs group-hover:bg-[#2563EB] group-hover:text-white"
                  >
                    <span>Launch {screen.code} Kiosk View</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
