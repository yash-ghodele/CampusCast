/**
 * @file display/src/components/DepartmentDisplayView.tsx
 * @description Core Department Fullscreen Live Notice Display Surface for Corridor Smart TVs.
 * 
 * Orchestrates multi-transport real-time state synchronization (Cloud Firestore snapshots,
 * BroadcastChannel inter-tab events, and LocalStorage cache), automatic carousel cycling,
 * screen heartbeat telemetry, layout switching (Hero, Split, Adaptive), and emergency security override preemption.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Notice } from '@campuscast/shared';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NoticeCard } from '@/components/NoticeCard';
import { EmergencyOverrideView } from '@/components/EmergencyOverrideView';
import { SplitScreenView } from '@/components/SplitScreenView';
import { AdaptiveSmartLayout } from '@/components/AdaptiveSmartLayout';
import { AllScreensTileView } from '@/components/AllScreensTileView';
import { subscribeToDepartmentNotices, sendScreenHeartbeatToFirestore, ListenerStatus } from '@/lib/firebase';
import { MessageSquarePlus } from 'lucide-react';

interface DepartmentDisplayViewProps {
  deptCode: string;
}

export const DepartmentDisplayView: React.FC<DepartmentDisplayViewProps> = ({ deptCode }) => {
  const normalizedDept = deptCode.toUpperCase();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [status, setStatus] = useState<ListenerStatus>('connected');
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [displayMode, setDisplayMode] = useState<string>('auto');
  const [lastSyncSeconds, setLastSyncSeconds] = useState<number>(0);

  // Hook 1: Multi-transport synchronization pipeline (Cloud Firestore, BroadcastChannel, LocalStorage)
  useEffect(() => {
    const syncNotices = (noticeList: Notice[]) => {
      const activeDeptNotices = noticeList.filter(
        (n) =>
          (normalizedDept === 'ALL' || n.departmentId === normalizedDept || n.departmentId === 'ALL') &&
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
      normalizedDept,
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
  }, [normalizedDept]);

  // Hook 2: Last Sync Counter Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSyncSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hook 3: Auto-cycle Hero Notice index if in hero mode
  useEffect(() => {
    if (notices.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % notices.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [notices.length]);

  // Hook 4: Hardware screen heartbeat telemetry dispatcher (Cloud Firestore & inter-tab channel)
  useEffect(() => {
    const screenId = `${normalizedDept}-MAIN-DISPLAY`;
    const sendHeartbeat = () => {
      try {
        const stored = localStorage.getItem('campuscast_screens');
        const screens: Record<string, number> = stored ? JSON.parse(stored) : {};
        screens[screenId] = Date.now();
        localStorage.setItem('campuscast_screens', JSON.stringify(screens));
        if (typeof BroadcastChannel !== 'undefined') {
          const ch = new BroadcastChannel('campuscast-screens-channel');
          ch.postMessage({ screenId, lastSeenAt: Date.now() });
          ch.close();
        }
      } catch {
        // silently ignore
      }

      sendScreenHeartbeatToFirestore(screenId, normalizedDept);
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [normalizedDept]);

  const [dismissedEmergencyIds, setDismissedEmergencyIds] = useState<string[]>([]);

  // Evaluation: Preemptive emergency broadcast override with department corridor scoping
  const urgentNotice = notices.find((n) => {
    if (n.priority !== 'urgent' && n.category !== 'emergency') return false;
    if (dismissedEmergencyIds.includes(n.id)) return false;
    if (normalizedDept === 'ALL') {
      return n.departmentId === 'ALL';
    } else {
      return n.departmentId === normalizedDept || n.departmentId === 'ALL';
    }
  });

  // Check if there is an active urgent notice that was dismissed by the screen operator
  const dismissedUrgentNotice = notices.find((n) => {
    if (n.priority !== 'urgent' && n.category !== 'emergency') return false;
    if (!dismissedEmergencyIds.includes(n.id)) return false;
    if (normalizedDept === 'ALL') {
      return n.departmentId === 'ALL';
    } else {
      return n.departmentId === normalizedDept || n.departmentId === 'ALL';
    }
  });

  if (urgentNotice) {
    return (
      <EmergencyOverrideView
        notice={urgentNotice}
        deptCode={normalizedDept}
        onDismiss={() => setDismissedEmergencyIds((prev) => [...prev, urgentNotice.id])}
      />
    );
  }

  const currentHeroNotice = notices[heroIndex] || notices[0];
  const tickerMessages = notices.map((n) => n.title || n.content);

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#F3F4F6] text-[#111111] overflow-y-auto font-sans">
      {/* Top Header with Department Theme & Status Layer */}
      <Header
        deptCode={normalizedDept}
        status={status}
        lastUpdatedSecondsAgo={lastSyncSeconds}
        activeMode={displayMode}
        onSelectMode={setDisplayMode}
      />

      {/* Dismissed Emergency Alert Banner */}
      {dismissedUrgentNotice && (
        <div className="bg-red-600 text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold shadow-md z-40">
          <div className="flex items-center gap-3">
            <span className="bg-white text-red-600 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
              🚨 Active Urgent Alert
            </span>
            <span className="font-semibold truncate max-w-xl">{dismissedUrgentNotice.title}</span>
          </div>
          <button
            onClick={() =>
              setDismissedEmergencyIds((prev) =>
                prev.filter((id) => id !== dismissedUrgentNotice.id)
              )
            }
            className="bg-white text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-sm"
          >
            Reopen Emergency Screen
          </button>
        </div>
      )}

      {/* Main Display Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full flex flex-col justify-center">
        {normalizedDept === 'ALL' ? (
          /* ALL SCREENS TILE MATRIX VIEW */
          <AllScreensTileView notices={notices} />
        ) : notices.length === 0 ? (
          /* Idle / Empty State (Brand Kit v2 Light Theme) */
          <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-4 py-20">
            <div className="p-6 rounded-full border bg-white border-[#E5E7EB] shadow-lg shadow-blue-500/10">
              <MessageSquarePlus className="w-16 h-16 text-[#2563EB] animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-[#111111]">
              No Active Announcements for {normalizedDept}
            </h2>
            <p className="text-lg max-w-lg text-[#64748B]">
              Faculty can publish announcements by sending a WhatsApp message to{' '}
              <span className="font-bold text-[#2563EB]">+91 98765 43210</span> or using the Admin Portal.
            </p>
          </div>
        ) : displayMode === 'split' ? (
          /* MODE 5: SPLIT SCREEN VIEW */
          <SplitScreenView notices={notices} deptCode={normalizedDept} />
        ) : displayMode === 'hero' ? (
          /* MODE 1: HERO NOTICE VIEW */
          <div className="w-full flex-1 flex items-center justify-center py-4">
            <NoticeCard notice={currentHeroNotice} isHero={true} />
          </div>
        ) : (
          /* DEFAULT: ADAPTIVE SMART MEDIA BLOCK ARRANGEMENT */
          <AdaptiveSmartLayout notices={notices} deptCode={normalizedDept} />
        )}
      </main>

      {/* Bottom Footer (Mode 2: News Ticker Marquee) */}
      <Footer
        noticeCount={notices.length}
        status={status}
        tickerMessages={tickerMessages}
      />
    </div>
  );
};
