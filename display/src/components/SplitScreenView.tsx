/**
 * @file display/src/components/SplitScreenView.tsx
 * @description Mode 5 Split-Screen Dual Column Component for Corridor Smart TVs.
 * 
 * Partitions the display terminal into a 7:5 ratio during symposiums, conferences, and placement drives,
 * featuring event poster graphics on the left while streaming active announcements on the right.
 */

'use client';

import React from 'react';
import { Notice } from '@campuscast/shared';
import { NoticeCard } from './NoticeCard';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

interface SplitScreenViewProps {
  notices: Notice[];
  deptCode: string;
}

export const SplitScreenView: React.FC<SplitScreenViewProps> = ({
  notices,
  deptCode,
}) => {
  const mediaNotice = notices.find((n) => n.mediaUrl !== null) || notices[0];

  return (
    <div className="flex-1 w-full p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto">
      {/* Left Column (7 Cols): Event Poster / Featured Media */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E5E7EB] flex flex-col justify-between shadow-lg shadow-blue-500/8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-[#2563EB]/10 text-[#2563EB] px-3.5 py-1.5 rounded-lg border border-[#2563EB]/30 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>FEATURED EVENT POSTER</span>
          </div>
          <span className="text-xs font-semibold text-[#64748B]">
            {deptCode} DEPARTMENT
          </span>
        </div>

        {mediaNotice?.mediaUrl ? (
          <div className="flex-1 rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-center p-4">
            <img
              src={mediaNotice.mediaUrl}
              alt="Event Poster"
              className="max-h-[500px] w-auto object-contain rounded-lg shadow-xl"
            />
          </div>
        ) : (
          <div className="flex-1 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="p-4 bg-white rounded-full border border-[#E5E7EB] shadow-sm">
              <ImageIcon className="w-12 h-12 text-[#2563EB]" />
            </div>
            <h3 className="text-xl font-bold text-[#111111]">Event Poster Display</h3>
            <p className="text-sm text-[#64748B] max-w-sm">
              Faculty can attach poster images or PDF circulars via WhatsApp to feature them live here.
            </p>
          </div>
        )}

        {mediaNotice && (
          <div className="mt-4 pt-4 border-t border-[#E5E7EB] text-[#111111] font-semibold text-lg truncate">
            {mediaNotice.title || mediaNotice.content}
          </div>
        )}
      </div>

      {/* Right Column (5 Cols): Live Announcement Feed */}
      <div className="lg:col-span-5 flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-2">
        <div className="text-xs font-black uppercase tracking-widest text-[#64748B] bg-white px-4 py-2 rounded-xl border border-[#E5E7EB] flex items-center justify-between shadow-sm">
          <span>LIVE ANNOUNCEMENT FEED</span>
          <span className="text-[#2563EB] font-bold">{notices.length} Notices</span>
        </div>

        {notices.map((notice) => (
          <NoticeCard key={notice.id} notice={notice} isHero={false} />
        ))}
      </div>
    </div>
  );
};
