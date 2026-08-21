'use client';

import React from 'react';
import { Notice } from '@campuscast/shared';
import { AlertTriangle, Clock } from 'lucide-react';

interface NoticeCardProps {
  notice: Notice;
}

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
      {/* Header Badge */}
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

      {/* Main Notice Body */}
      <div className="text-2xl md:text-3xl font-semibold text-[#F5F7FA] leading-relaxed whitespace-pre-line tracking-wide">
        {notice.content}
      </div>

      {/* Optional Media Container */}
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
