/**
 * @file apps/display/src/app/display/[deptId]/page.tsx
 * @description Department Fullscreen Live Notice Display Client (`/display/[deptId]`).
 * 
 * NEED FOR THIS PAGE:
 * Serves as the primary public display surface running fullscreen on Smart TV LCD screens in corridors.
 * Supports Mode 1 (Hero View), Mode 2 (News Ticker), Mode 3 (Emergency Override), Mode 4 (Event Carousel),
 * and Mode 5 (Split Screen View) with live Firestore subscription, department themes, and offline resilience.
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Notice } from '@campuscast/shared';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NoticeCard } from '@/components/NoticeCard';
import { EmergencyOverrideView } from '@/components/EmergencyOverrideView';
import { SplitScreenView } from '@/components/SplitScreenView';
import { subscribeToDepartmentNotices, sendScreenHeartbeatToFirestore, ListenerStatus } from '@/lib/firebase';
import { MessageSquarePlus } from 'lucide-react';




export default function DepartmentDisplayPage() {
  const params = useParams();
  const rawDeptCode = (params?.deptId as string) || 'ECE';
  const deptCode = rawDeptCode.toUpperCase();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [status, setStatus] = useState<ListenerStatus>('connected');
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [displayMode, setDisplayMode] = useState<string>('hero');
  const [lastSyncSeconds, setLastSyncSeconds] = useState<number>(0);

  // Hook 1: Real-time Firestore, BroadcastChannel & LocalStorage notice synchronization
  useEffect(() => {
    const syncNotices = (noticeList: Notice[]) => {
      const activeDeptNotices = noticeList.filter(
        (n) =>
          (n.departmentId === deptCode || n.departmentId === 'ALL') &&
          n.status === 'active'
      );
      setNotices(activeDeptNotices);
      setLastSyncSeconds(0);
    };

    const loadLocalNotices = () => {
      try {
        const stored = localStorage.getItem('campuscast_notices');
        if (stored) {
          const allNotices: Notice[] = JSON.parse(stored);
          syncNotices(allNotices);
        }
        // If nothing in storage, display waits — admin portal populates it
      } catch (err) {
        console.warn('LocalStorage notice sync error:', err);
      }
    };

    loadLocalNotices();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'campuscast_notices') {
        loadLocalNotices();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('campuscast-notices-channel');
      channel.onmessage = (event) => {
        if (event.data && Array.isArray(event.data)) {
          syncNotices(event.data);
        }
      };
    }

    const unsubscribe = subscribeToDepartmentNotices(
      deptCode,
      (liveNotices) => {
        if (liveNotices) {
          const now = Date.now();
          const validNotices = liveNotices.filter((n) => !n.expiresAt || n.expiresAt > now);
          setNotices(validNotices);
          setLastSyncSeconds(0);
        }
      },
      (newStatus) => {
        setStatus(newStatus);
      }
    );

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) channel.close();
      unsubscribe();
    };
  }, [deptCode]);

  // Hook 2: Last Sync Counter Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hook 3: Mode 1 Auto Rotation (Rotate Hero Notice every 10s)
  useEffect(() => {
    if (notices.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % notices.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [notices.length]);

  // Hook 4: Screen Heartbeat Telemetry via Firestore + localStorage
  useEffect(() => {
    const screenId = `${deptCode}-MAIN-DISPLAY`;
    const sendHeartbeat = () => {
      try {
        const stored = localStorage.getItem('campuscast_screens');
        const screens: Record<string, number> = stored ? JSON.parse(stored) : {};
        screens[screenId] = Date.now();
        localStorage.setItem('campuscast_screens', JSON.stringify(screens));
        // Broadcast local telemetry
        if (typeof BroadcastChannel !== 'undefined') {
          const ch = new BroadcastChannel('campuscast-screens-channel');
          ch.postMessage({ screenId, lastSeenAt: Date.now() });
          ch.close();
        }
      } catch {
        // silently ignore
      }

      // Send heartbeat to Cloud Firestore for cross-origin and Smart TV monitoring
      sendScreenHeartbeatToFirestore(screenId, deptCode);
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [deptCode]);

  // MODE 3: EMERGENCY OVERRIDE CHECK
  const urgentNotice = notices.find(
    (n) => n.priority === 'urgent' || n.category === 'emergency'
  );

  if (urgentNotice) {
    return <EmergencyOverrideView notice={urgentNotice} />;
  }

  const currentHeroNotice = notices[heroIndex] || notices[0];
  const tickerMessages = notices.map((n) => n.title || n.content);

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#F3F4F6] text-[#111111] overflow-y-auto font-sans">
      {/* Top Header (90px) with Department Theme & Status Layer */}
      <Header
        deptCode={deptCode}
        status={status}
        lastUpdatedSecondsAgo={lastSyncSeconds}
        activeMode={displayMode}
        onSelectMode={setDisplayMode}
      />

      {/* Main Display Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full flex flex-col justify-center">
        {notices.length === 0 ? (
          /* Idle / Empty State (Brand Kit v2 Light Theme) */
          <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-4 py-20">
            <div className="p-6 rounded-full border bg-white border-[#E5E7EB] shadow-lg shadow-blue-500/10">
              <MessageSquarePlus className="w-16 h-16 text-[#2563EB] animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-[#111111]">
              No Active Announcements for {deptCode}
            </h2>
            <p className="text-lg max-w-lg text-[#64748B]">
              Faculty can publish announcements by sending a WhatsApp message to{' '}
              <span className="font-bold text-[#2563EB]">+91 98765 43210</span> or using the Admin Portal.
            </p>
          </div>
        ) : displayMode === 'split' ? (
          /* MODE 5: SPLIT SCREEN VIEW */
          <SplitScreenView notices={notices} deptCode={deptCode} />
        ) : (
          /* MODE 1: HERO NOTICE VIEW (Default) */
          <div className="w-full flex-1 flex items-center justify-center py-4">
            <NoticeCard notice={currentHeroNotice} isHero={true} />
          </div>
        )}
      </main>

      {/* Bottom Footer (Mode 2: News Ticker Marquee) */}
      <Footer
        noticeCount={notices.length}
        status={status}
        tickerMessages={tickerMessages}
        activeMode={displayMode}
        onModeChange={setDisplayMode}
      />
    </div>
  );
}
