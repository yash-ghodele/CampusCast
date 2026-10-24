/**
 * @file display/src/components/EmergencyOverrideView.tsx
 * @description Mode 3 Emergency Security Broadcast Override Component for Corridor Smart TVs.
 * 
 * Preempts normal rotation carousels when an announcement is flagged with `priority: 'urgent'` or `category: 'emergency'`,
 * rendering a high-contrast full-bleed crimson alert screen with high-decibel visual pulses and security origin attribution.
 */

'use client';

import React from 'react';
import { Notice } from '@campuscast/shared';
import { AlertTriangle, ShieldAlert, Clock, Radio } from 'lucide-react';

interface EmergencyOverrideViewProps {
  notice: Notice;
  onClearEmergency?: () => void;
}

export const EmergencyOverrideView: React.FC<EmergencyOverrideViewProps> = ({
  notice,
}) => {
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

  return (
    <div className="min-h-screen w-full bg-[#DC2626] flex flex-col justify-between p-6 md:p-10 text-white relative overflow-y-auto urgent-glow z-50">
      {/* Top Warning Banner Header */}
      <div className="flex items-center justify-between border-b-4 border-white/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white text-[#DC2626] flex items-center justify-center shadow-xl animate-bounce">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-black tracking-wider uppercase">
              URGENT CAMPUS ANNOUNCEMENT
            </span>
            <span className="text-lg font-bold text-white/90">
              CAMPUSCAST EMERGENCY BROADCAST SYSTEM
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/30 px-6 py-3 rounded-2xl border border-white/20 font-mono text-xl font-bold">
          <Clock className="w-6 h-6 text-white" />
          <span>{formatTime(notice.createdAt)}</span>
          <span className="text-white/60">|</span>
          <span>{formatDate(notice.createdAt)}</span>
        </div>
      </div>

      {/* Main Alert Body Message */}
      <div className="my-auto max-w-6xl mx-auto w-full text-center space-y-8 py-8">
        {notice.title && (
          <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-yellow-300 drop-shadow-md">
            {notice.title}
          </h1>
        )}

        <div className="text-3xl lg:text-5xl font-extrabold leading-tight tracking-wide bg-black/25 p-10 rounded-3xl border-2 border-white/30 backdrop-blur shadow-2xl">
          {notice.content}
        </div>

        {/* Media Attachment if present */}
        {notice.mediaUrl && (
          <div className="rounded-2xl overflow-hidden border-4 border-white/40 max-h-[300px] bg-black/40 inline-block p-2 shadow-2xl">
            <img
              src={notice.mediaUrl}
              alt="Emergency Attachment"
              className="max-h-[280px] w-auto object-contain rounded-xl"
            />
          </div>
        )}

        {/* Issuer Signature */}
        <div className="text-2xl font-bold text-white/90 tracking-wide uppercase">
          — Issued by {notice.createdBy || 'Principal Office & Campus Security'}
        </div>
      </div>

      {/* Bottom Emergency Footer */}
      <div className="border-t-4 border-white/30 pt-6 flex items-center justify-between font-bold text-lg">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-yellow-300" />
          <span>All regular notice carousels paused during emergency broadcast</span>
        </div>

        <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-xl text-sm">
          <Radio className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span>Broadcast Target: {notice.departmentId || 'ALL CAMPUS'}</span>
        </div>
      </div>
    </div>
  );
};
