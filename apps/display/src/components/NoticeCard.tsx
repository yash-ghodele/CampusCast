/**
 * @file apps/display/src/components/NoticeCard.tsx
 * @description Notice Card Presentation Component for Hallway Display Kiosk.
 * 
 * NEED FOR THIS COMPONENT:
 * Renders individual notice announcements with hallway-grade visual contrast.
 * High-priority urgent notices demand instant visual attention via red left-border accent,
 * warning badges, and subtle pulse glow animations.
 */

'use client';

import React from 'react';
import { Notice } from '@campuscast/shared';
import { AlertTriangle, Clock } from 'lucide-react';

interface NoticeCardProps {
  notice: Notice; // Data model containing priority, content, media, timestamps
}

/**
 * NoticeCard Component
 * 
 * WORKING MECHANISM:
 * 1. Checks `notice.priority === 'urgent'`.
 * 2. If urgent: Applies thick red left border (`#E5484D`), warning badge, and CSS `urgent-glow` animation.
 * 3. If normal: Applies standard blue left border (`#3B82F6`).
 * 4. Formats creation timestamp into clean 12-hour AM/PM string.
 * 5. If `mediaUrl` is present: Renders image inside contained aspect ratio bounds.
 */
export const NoticeCard: React.FC<NoticeCardProps> = ({ notice }) => {
  const isUrgent = notice.priority === 'urgent';

  const formatPostTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div
      className={`relative w-full bg-[#141C2E] rounded-xl p-7 border transition-all duration-300 ${
        isUrgent
          ? 'border-l-[8px] border-l-[#E5484D] border-t-[#E5484D]/40 border-r-[#E5484D]/20 border-b-[#E5484D]/20 urgent-glow'
          : 'border-l-[8px] border-l-[#3B82F6] border-[#222F47]'
      }`}
    >
      {/* Header Badge & Timestamp */}
      <div className="flex items-center justify-between mb-4">
        {isUrgent ? (
          <div className="inline-flex items-center gap-2 bg-[#E5484D]/20 text-[#E5484D] px-3.5 py-1.5 rounded-md border border-[#E5484D]/40 font-bold text-lg tracking-wide uppercase">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
            <span>URGENT ANNOUNCEMENT</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 text-[#8B96A8] text-base font-semibold">
            <Clock className="w-4 h-4 text-[#3B82F6]" />
            <span>Posted at {formatPostTime(notice.createdAt)}</span>
          </div>
        )}

        {isUrgent && (
          <span className="text-sm text-[#8B96A8] font-medium">
            Posted at {formatPostTime(notice.createdAt)}
          </span>
        )}
      </div>

      {/* Main Notice Typography Body (Minimum 28px font size for hallway distance) */}
      <div className="text-2xl md:text-3xl font-semibold text-[#F5F7FA] leading-relaxed whitespace-pre-line tracking-wide">
        {notice.content}
      </div>

      {/* Inline Media Attachment Container */}
      {notice.mediaUrl && (
        <div className="mt-5 rounded-lg overflow-hidden border border-[#222F47] max-h-[400px] bg-[#0B1220] flex items-center justify-center">
          <img
            src={notice.mediaUrl}
            alt="Notice Attachment"
            className="max-h-[380px] w-auto object-contain rounded"
          />
        </div>
      )}
    </div>
  );
};
