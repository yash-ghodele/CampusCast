/**
 * @file display/src/components/AdaptiveSmartLayout.tsx
 * @description Intelligent Adaptive Multi-Block Signage Layout Component for Corridor Smart TVs.
 * 
 * Semantically categorizes active announcements into distinct presentation blocks based on payload type:
 * image posters, PDF document circulars, scheduled event timetables, and text bulletins,
 * adapting split-screen column ratios to optimize hallway visibility.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Notice, DEPARTMENT_THEMES, getSafeUrl } from '@campuscast/shared';
import { NoticeCard } from './NoticeCard';
import {
  Sparkles,
  FileText,
  Calendar,
  Clock,
  QrCode,
  Megaphone,
  GraduationCap,
  Briefcase,
  Trophy,
  AlertTriangle,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface AdaptiveSmartLayoutProps {
  notices: Notice[];
  deptCode: string;
}

export const AdaptiveSmartLayout: React.FC<AdaptiveSmartLayoutProps> = ({
  notices,
  deptCode,
}) => {
  const [activePosterIndex, setActivePosterIndex] = useState(0);

  // Classify notices into intelligent media blocks
  const posterNotices = notices.filter(
    (n) => n.mediaType === 'image' || (n.mediaUrl && !n.mediaUrl.toLowerCase().includes('.pdf'))
  );

  const pdfCircularNotices = notices.filter(
    (n) => n.mediaType === 'pdf' || (n.mediaUrl && n.mediaUrl.toLowerCase().includes('.pdf'))
  );

  const eventNotices = notices.filter(
    (n) => (n.eventDate || n.eventTime) && !posterNotices.includes(n) && !pdfCircularNotices.includes(n)
  );

  const textBulletins = notices.filter(
    (n) => !posterNotices.includes(n) && !pdfCircularNotices.includes(n) && !eventNotices.includes(n)
  );

  // Auto-rotate poster showcase every 8 seconds if multiple posters exist
  useEffect(() => {
    if (posterNotices.length <= 1) return;
    const interval = setInterval(() => {
      setActivePosterIndex((prev) => (prev + 1) % posterNotices.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [posterNotices.length]);

  const currentPoster = posterNotices[activePosterIndex] || posterNotices[0];
  const deptTheme = (DEPARTMENT_THEMES && DEPARTMENT_THEMES[deptCode.toUpperCase()]) || {
    primary: '#2563EB',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
    border: '#60A5FA',
  };

  // Case 1: Mixed / Poster-rich layout (Split into Left Showcase + Right Feeds)
  if (posterNotices.length > 0) {
    return (
      <div className="flex-1 w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
        {/* Left Column (7 Cols): Intelligent Poster Showcase Block */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#E5E7EB] flex flex-col justify-between shadow-xl shadow-blue-500/5">
          <div>
            {/* Header pill */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 bg-[#2563EB]/10 text-[#2563EB] px-3.5 py-1.5 rounded-full border border-[#2563EB]/25 font-black text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>INTELLIGENT MEDIA SHOWCASE</span>
                {posterNotices.length > 1 && (
                  <span className="bg-[#2563EB] text-white px-2 py-0.5 rounded-full text-[10px] ml-1">
                    {activePosterIndex + 1} / {posterNotices.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {currentPoster?.category && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-blue-50 text-[#2563EB] border border-blue-200">
                    {currentPoster.category}
                  </span>
                )}
                <span
                  className="px-3 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider"
                  style={{
                    backgroundColor: deptTheme.badgeBg,
                    color: deptTheme.badgeText,
                    borderColor: deptTheme.border,
                  }}
                >
                  {currentPoster?.departmentId || deptCode} SCOPE
                </span>
              </div>
            </div>

            {/* Poster Image Container */}
            {currentPoster?.mediaUrl && (
              <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-center p-3 max-h-[460px] shadow-sm relative group mb-4">
                <img
                  src={currentPoster.mediaUrl}
                  alt={currentPoster.title || 'Event Poster'}
                  className="max-h-[430px] w-auto object-contain rounded-xl shadow-md transition-transform duration-500 group-hover:scale-[1.01]"
                />
              </div>
            )}

            {/* Complete Notice Headline & Body Content */}
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[#111111] leading-tight">
                {currentPoster?.title || currentPoster?.content}
              </h3>
              <p className="text-sm text-[#334155] font-medium leading-relaxed whitespace-pre-line">
                {currentPoster?.content}
              </p>
            </div>
          </div>

          {/* Bottom Poster Metadata & QR */}
          <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-wrap text-xs font-semibold text-[#475569]">
              {currentPoster?.eventDate && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-[#2563EB]">
                  <Calendar className="w-4 h-4 text-[#2563EB]" />
                  <span>{currentPoster.eventDate}</span>
                </div>
              )}
              {currentPoster?.eventTime && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-[#22C55E]">
                  <Clock className="w-4 h-4 text-[#22C55E]" />
                  <span>{currentPoster.eventTime}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
                <span>Issued by:</span>
                <span className="font-bold text-[#111111]">{currentPoster?.createdBy || 'Department Office'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <QrCode className="w-6 h-6 text-[#111111]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#111111]">Instant Access</span>
                <span className="text-[9px] text-[#64748B]">Scan for full details</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Secondary Media Blocks & Text Feeds */}
        <div className="lg:col-span-5 flex flex-col space-y-4 overflow-y-auto pr-1">
          {/* Block 2: PDF Document Circulars (If Any) */}
          {pdfCircularNotices.length > 0 && (
            <div className="bg-gradient-to-br from-white to-amber-50/50 border border-amber-200/80 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700 font-extrabold text-xs tracking-wider uppercase">
                  <FileText className="w-4 h-4" />
                  <span>OFFICIAL CIRCULAR / PDF NOTICE</span>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  {pdfCircularNotices.length} Attached
                </span>
              </div>

              {pdfCircularNotices.slice(0, 2).map((pdfNotice) => (
                <div
                  key={pdfNotice.id}
                  className="bg-white p-3 rounded-xl border border-amber-100 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 border border-red-200">
                      PDF
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-bold text-[#111111] line-clamp-1">
                        {pdfNotice.title || pdfNotice.content}
                      </h4>
                      <span className="text-[11px] text-[#64748B]">
                        Issued by {pdfNotice.createdBy || 'Department Office'}
                      </span>
                    </div>
                  </div>

                  <a
                    href={getSafeUrl(pdfNotice.mediaUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[11px] flex items-center gap-1 border border-amber-200"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View</span>
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Block 3: Upcoming Event Dates (If Any) */}
          {eventNotices.length > 0 && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#2563EB] font-extrabold text-xs tracking-wider uppercase">
                <Calendar className="w-4 h-4" />
                <span>UPCOMING SCHEDULE & KEY DATES</span>
              </div>

              <div className="space-y-2">
                {eventNotices.slice(0, 2).map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#111111] line-clamp-1">
                        {ev.title || ev.content}
                      </span>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B]">
                        {ev.eventDate && (
                          <span className="flex items-center gap-1 font-semibold text-[#2563EB]">
                            <Calendar className="w-3.5 h-3.5" /> {ev.eventDate}
                          </span>
                        )}
                        {ev.eventTime && (
                          <span className="flex items-center gap-1 font-semibold text-[#22C55E]">
                            <Clock className="w-3.5 h-3.5" /> {ev.eventTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Block 4: Live Text Announcement Bulletins */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-widest text-[#64748B] bg-white px-4 py-2 rounded-xl border border-[#E5E7EB] flex items-center justify-between shadow-xs">
              <span className="flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>BULLETIN FEED</span>
              </span>
              <span className="text-[#2563EB] font-bold">
                {textBulletins.length} Bulletins
              </span>
            </div>

            {textBulletins.length === 0 && pdfCircularNotices.length === 0 && eventNotices.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] text-center text-[#64748B] text-xs">
                All announcements featured in visual showcase.
              </div>
            ) : (
              textBulletins.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} isHero={false} />
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Pure Text / Mixed Bulletins (Multi-Column Grid Arrangement)
  return (
    <div className="flex-1 w-full p-4 lg:p-6 space-y-6 overflow-y-auto">
      {/* Top Section: PDF Circulars Banner (If present) */}
      {pdfCircularNotices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pdfCircularNotices.map((pdf) => (
            <div
              key={pdf.id}
              className="bg-white border-2 border-red-200 p-5 rounded-2xl shadow-md flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-black text-sm border border-red-300">
                  PDF
                </div>
                <div>
                  <div className="text-xs font-bold text-red-600 uppercase tracking-wider">
                    Official Document Circular
                  </div>
                  <h4 className="text-base font-black text-[#111111]">{pdf.title || pdf.content}</h4>
                  <p className="text-xs text-[#64748B] line-clamp-1">{pdf.content}</p>
                </div>
              </div>

              <div className="p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] shrink-0 text-center">
                <QrCode className="w-8 h-8 text-[#111111] mx-auto" />
                <span className="text-[9px] font-bold text-[#64748B] block mt-0.5">Scan to View</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid: Arranged Notice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notices.map((notice, idx) => (
          <div key={notice.id} className={idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''}>
            <NoticeCard notice={notice} isHero={idx === 0} />
          </div>
        ))}
      </div>
    </div>
  );
};
