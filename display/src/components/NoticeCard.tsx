/**
 * @file apps/display/src/components/NoticeCard.tsx
 * @description Hero & Standard Notice Presentation Component — Brand Kit v2 Light Theme.
 * 
 * NEED FOR THIS COMPONENT:
 * Implements Mode 1 (Hero View) and standard notice cards with strong typography hierarchy,
 * category badges (EXAM, PLACEMENT, EVENT, URGENT), date/time chips, QR code snippets, and department themes.
 */

'use client';

import React from 'react';
import { Notice, DEPARTMENT_THEMES } from '@campuscast/shared';
import {
  AlertTriangle,
  Calendar,
  Clock,
  QrCode,
  Tag,
  Briefcase,
  GraduationCap,
  Trophy,
  Megaphone,
} from 'lucide-react';

interface NoticeCardProps {
  notice: Notice;
  isHero?: boolean;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: React.FC<{ className?: string }>; bg: string; text: string; border: string }
> = {
  exam: {
    label: 'EXAMINATION',
    icon: GraduationCap,
    bg: 'bg-[#2563EB]/15',
    text: 'text-[#2563EB]',
    border: 'border-[#2563EB]/40',
  },
  placement: {
    label: 'PLACEMENT DRIVE',
    icon: Briefcase,
    bg: 'bg-[#22C55E]/15',
    text: 'text-[#22C55E]',
    border: 'border-[#22C55E]/40',
  },
  event: {
    label: 'CAMPUS EVENT',
    icon: Calendar,
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-600',
    border: 'border-indigo-500/40',
  },
  achievement: {
    label: 'ACHIEVEMENT',
    icon: Trophy,
    bg: 'bg-amber-500/15',
    text: 'text-amber-600',
    border: 'border-amber-500/40',
  },
  emergency: {
    label: 'URGENT ALERT',
    icon: AlertTriangle,
    bg: 'bg-[#DC2626]/15',
    text: 'text-[#DC2626]',
    border: 'border-[#DC2626]/50',
  },
  announcement: {
    label: 'ANNOUNCEMENT',
    icon: Megaphone,
    bg: 'bg-[#2563EB]/15',
    text: 'text-[#2563EB]',
    border: 'border-[#2563EB]/40',
  },
};

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, isHero = false }) => {
  const [imgError, setImgError] = React.useState(false);
  const isUrgent = notice.priority === 'urgent' || notice.category === 'emergency';
  const categoryKey = notice.category || (isUrgent ? 'emergency' : 'announcement');
  const catConfig = CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG.announcement;
  const CategoryIcon = catConfig.icon;

  const deptCode = (notice.departmentId || 'ECE').toUpperCase();
  const deptTheme = (DEPARTMENT_THEMES && DEPARTMENT_THEMES[deptCode]) || {
    primary: '#2563EB',
    accent: '#1D4ED8',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
    border: '#60A5FA',
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const eventDateStr = notice.eventDate || formatDate(notice.createdAt);
  const eventTimeStr = notice.eventTime || formatTime(notice.createdAt);

  if (isHero) {
    return (
      <div
        className={`relative w-full rounded-2xl p-8 lg:p-10 border transition-all duration-300 flex flex-col justify-between bg-white shadow-2xl shadow-blue-500/10 ${
          isUrgent
            ? 'border-l-[12px] border-l-[#DC2626] border-[#FCA5A5]'
            : 'border-l-[12px] border-[#2563EB] border-[#E5E7EB]'
        }`}
        style={{
          borderLeftColor: isUrgent ? '#DC2626' : deptTheme.primary,
        }}
      >
        {/* Top Featured Header */}
        <div>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded bg-[#F3F4F6] text-[#475569] border border-[#E5E7EB]">
                FEATURED NOTICE
              </span>
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-bold text-xs tracking-wider uppercase ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
              >
                <CategoryIcon className="w-4 h-4" />
                <span>{catConfig.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F3F4F6] text-[#475569] border border-[#E5E7EB]">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <span>Posted at {formatTime(notice.createdAt)}</span>
            </div>
          </div>

          {/* Headline Title */}
          <h2 className="text-3xl lg:text-4xl font-black text-[#111111] tracking-tight leading-snug mb-4">
            {notice.title || notice.content.slice(0, 80)}
          </h2>

          {/* Full Body Content */}
          <div className="text-xl lg:text-2xl text-[#334155] font-medium leading-relaxed whitespace-pre-line mb-8">
            {notice.content}
          </div>
        </div>

        {/* Media Attachment View */}
        {notice.mediaUrl && !imgError && (
          <div className="mb-6 rounded-xl overflow-hidden border border-[#E2E8F0] max-h-[350px] bg-[#F8FAFC] flex items-center justify-center p-2">
            <img
              src={notice.mediaUrl}
              alt="Notice Attachment"
              onError={() => setImgError(true)}
              className="max-h-[330px] w-auto object-contain rounded-lg shadow-sm"
            />
          </div>
        )}

        {/* Bottom Metadata & Interactive QR Code */}
        <div className="pt-6 border-t border-[#E5E7EB] flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
              <Calendar className="w-5 h-5 text-[#2563EB]" />
              <span className="text-sm font-semibold text-[#1E293B]">{eventDateStr}</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
              <Clock className="w-5 h-5 text-[#22C55E]" />
              <span className="text-sm font-semibold text-[#1E293B]">{eventTimeStr}</span>
            </div>

            <span
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold border uppercase tracking-wider shadow-xs"
              style={{
                backgroundColor: deptTheme.badgeBg,
                color: deptTheme.badgeText,
                borderColor: deptTheme.border,
              }}
            >
              {deptCode} SCOPE
            </span>
          </div>

          {/* Interactive QR Code for WhatsApp / Details */}
          <div className="flex items-center gap-3 p-2.5 px-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="w-10 h-10 bg-white p-1 rounded-lg flex items-center justify-center border border-[#CBD5E1] shadow-xs">
              <QrCode className="w-8 h-8 text-[#111111]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#111111]">Scan for Details</span>
              <span className="text-[11px] text-[#64748B]">WhatsApp Instant Access</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Notice Card View
  return (
    <div
      className={`relative w-full rounded-xl p-6 border transition-all duration-300 bg-white shadow-md ${
        isUrgent
          ? 'border-l-[8px] border-l-[#DC2626] border-[#FCA5A5]'
          : 'border-l-[8px] border-l-[#2563EB] border-[#E5E7EB] hover:border-[#2563EB]'
      }`}
      style={{
        borderLeftColor: isUrgent ? '#DC2626' : deptTheme.primary,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border font-bold text-xs tracking-wider uppercase ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}
        >
          <CategoryIcon className="w-3.5 h-3.5" />
          <span>{catConfig.label}</span>
        </div>

        <span className="text-xs font-medium text-[#64748B]">
          {formatDate(notice.createdAt)} • {formatTime(notice.createdAt)}
        </span>
      </div>

      <div className="text-xl font-semibold text-[#111111] leading-relaxed whitespace-pre-line mb-3">
        {notice.content}
      </div>

      {notice.mediaUrl && !imgError && (
        <div className="mt-3 rounded-lg overflow-hidden border border-[#E2E8F0] max-h-[200px] bg-[#F8FAFC] flex items-center justify-center p-2">
          <img
            src={notice.mediaUrl}
            alt="Notice Attachment"
            onError={() => setImgError(true)}
            className="max-h-[180px] w-auto object-contain rounded"
          />
        </div>
      )}
    </div>
  );
};
