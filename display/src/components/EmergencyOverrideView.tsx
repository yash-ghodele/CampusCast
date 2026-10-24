/**
 * @file display/src/components/EmergencyOverrideView.tsx
 * @description Mode 3 Emergency Security Broadcast Override Component for Corridor Smart TVs.
 * 
 * Preempts normal rotation carousels when an announcement is flagged with `priority: 'urgent'` or `category: 'emergency'`,
 * rendering a high-contrast full-bleed crimson alert screen with high-decibel visual pulses and security origin attribution.
 * Includes interactive screen/department switching pills so operators and students can always change screens.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Notice } from '@campuscast/shared';
import { AlertTriangle, ShieldAlert, Clock, Radio, Monitor, Eye } from 'lucide-react';

interface EmergencyOverrideViewProps {
  notice: Notice;
  deptCode?: string;
  onDismiss?: () => void;
}

const DEPARTMENTS = [
  { code: 'ALL', label: 'Matrix (All)', href: '/display/all' },
  { code: 'ECE', label: 'ECE', href: '/display/ece' },
  { code: 'CSE', label: 'CSE', href: '/display/cse' },
  { code: 'AIML', label: 'AIML', href: '/display/aiml' },
  { code: 'MECH', label: 'MECH', href: '/display/mech' },
  { code: 'CIVIL', label: 'CIVIL', href: '/display/civil' },
  { code: 'EEE', label: 'EEE', href: '/display/eee' },
];

export const EmergencyOverrideView: React.FC<EmergencyOverrideViewProps> = ({
  notice,
  deptCode = 'ALL',
  onDismiss,
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
    <div className="min-h-screen w-full bg-[#DC2626] flex flex-col justify-between p-6 md:p-8 text-white relative overflow-y-auto urgent-glow z-50 font-sans">
      {/* Top Controls: Screen Navigation & Option to Change Screen */}
      <div className="bg-black/40 border border-white/20 rounded-2xl p-3 px-5 mb-6 flex items-center justify-between flex-wrap gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-black tracking-wider uppercase bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-yellow-300">
            <Monitor className="w-4 h-4" />
            <span>Switch Screen:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {DEPARTMENTS.map((dept) => {
              const isActive = deptCode.toUpperCase() === dept.code;
              return (
                <Link
                  key={dept.code}
                  href={dept.href}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-yellow-400 text-black border-yellow-300 shadow-md scale-105'
                      : 'bg-white/15 hover:bg-white/30 text-white border-white/20 hover:border-white/40'
                  }`}
                >
                  {dept.label}
                </Link>
              );
            })}
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-1.5 rounded-xl border border-white/30 transition-all shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Normal Notices</span>
          </button>
        )}
      </div>

      {/* Warning Banner Header */}
      <div className="flex items-center justify-between border-b-4 border-white/30 pb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white text-[#DC2626] flex items-center justify-center shadow-xl animate-bounce shrink-0">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-3xl lg:text-4xl font-black tracking-wider uppercase">
                URGENT CAMPUS ANNOUNCEMENT
              </span>
              <span className="px-3 py-1 bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-sm">
                {notice.departmentId || 'ALL'} SCOPE
              </span>
            </div>
            <span className="text-sm lg:text-base font-bold text-white/90">
              CAMPUSCAST EMERGENCY BROADCAST SYSTEM
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/30 px-5 py-2.5 rounded-2xl border border-white/20 font-mono text-base lg:text-lg font-bold">
          <Clock className="w-5 h-5 text-white" />
          <span>{formatTime(notice.createdAt)}</span>
          <span className="text-white/60">|</span>
          <span>{formatDate(notice.createdAt)}</span>
        </div>
      </div>

      {/* Main Alert Body Message */}
      <div className="my-auto max-w-5xl mx-auto w-full text-center space-y-6 py-6">
        {notice.title && (
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-yellow-300 drop-shadow-md">
            {notice.title}
          </h1>
        )}

        <div className="text-2xl lg:text-4xl font-extrabold leading-relaxed tracking-wide bg-black/30 p-8 lg:p-10 rounded-3xl border-2 border-white/30 backdrop-blur shadow-2xl whitespace-pre-line">
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
        <div className="text-xl lg:text-2xl font-bold text-white/90 tracking-wide uppercase">
          — Issued by {notice.authorName || notice.createdBy || 'Principal Office & Campus Security'}
        </div>
      </div>

      {/* Bottom Emergency Footer */}
      <div className="border-t-4 border-white/30 pt-4 flex items-center justify-between font-bold text-sm lg:text-base flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-yellow-300" />
          <span>Regular notice carousels paused during emergency alert</span>
        </div>

        <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-xl text-xs font-mono">
          <Radio className="w-4 h-4 text-yellow-300 animate-pulse" />
          <span>Targeted Corridor: {notice.departmentId || 'ALL CAMPUS'}</span>
        </div>
      </div>
    </div>
  );
};
