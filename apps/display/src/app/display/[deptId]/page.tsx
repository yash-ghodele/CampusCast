'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Notice } from '@campuscast/shared';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NoticeCard } from '@/components/NoticeCard';
import { subscribeToDepartmentNotices, ListenerStatus } from '@/lib/firebase';
import { Radio, MessageSquarePlus } from 'lucide-react';

// Student-centric demonstration notices for instant hallway display preview
const MOCK_NOTICES: Record<string, Notice[]> = {
  ECE: [
    {
      id: 'demo-1',
      departmentId: 'ECE',
      content: '⚡ URGENT: Microprocessor & Microcontroller Practical Exam shifted to 2:30 PM today in Lab 3 (ECE Block).',
      mediaUrl: null,
      mediaType: null,
      priority: 'urgent',
      status: 'active',
      createdBy: '+919876543210',
      createdAt: Date.now() - 1000 * 60 * 15,
      scheduledAt: null,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24
    },
    {
      id: 'demo-2',
      departmentId: 'ECE',
      content: '📢 Attention 3rd & 4th Year Students: Submission deadline for Major Project Phase-1 Synopsis extended to Friday, 5:00 PM at HOD Desk.',
      mediaUrl: null,
      mediaType: null,
      priority: 'normal',
      status: 'active',
      createdBy: '+919876543210',
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
      scheduledAt: null,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24
    },
    {
      id: 'demo-3',
      departmentId: 'ECE',
      content: '🎓 Placement Drive Alert: Texas Instruments pre-placement talk & online technical assessment tomorrow at 10:00 AM in Seminar Hall B.',
      mediaUrl: null,
      mediaType: null,
      priority: 'normal',
      status: 'active',
      createdBy: '+919876543210',
      createdAt: Date.now() - 1000 * 60 * 60 * 5,
      scheduledAt: null,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24
    }
  ],
  CSE: [
    {
      id: 'demo-cse-1',
      departmentId: 'CSE',
      content: '⚡ URGENT: Data Structures & Algorithms Lab session moved from Lab 1 to Computer Center 4.',
      mediaUrl: null,
      mediaType: null,
      priority: 'urgent',
      status: 'active',
      createdBy: '+919876543211',
      createdAt: Date.now() - 1000 * 60 * 30,
      scheduledAt: null,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24
    },
    {
      id: 'demo-cse-2',
      departmentId: 'CSE',
      content: '🚀 Campus Hackathon 2026: Team registration deadline closes today at 6:00 PM. Submit project titles online.',
      mediaUrl: null,
      mediaType: null,
      priority: 'normal',
      status: 'active',
      createdBy: '+919876543211',
      createdAt: Date.now() - 1000 * 60 * 60 * 3,
      scheduledAt: null,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24
    }
  ],
  MECH: [
    {
      id: 'demo-mech-1',
      departmentId: 'MECH',
      content: '⚡ URGENT: Thermodynamics lecture shifted to Main Auditorium at 11:30 AM.',
      mediaUrl: null,
      mediaType: null,
      priority: 'urgent',
      status: 'active',
      createdBy: '+919876543212',
      createdAt: Date.now() - 1000 * 60 * 10,
      scheduledAt: null,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24
    },
    {
      id: 'demo-mech-2',
      departmentId: 'MECH',
      content: '🔧 Industrial Visit: Tata Motors Manufacturing Plant visit scheduled for Monday. Campus departure at 8:00 AM sharp.',
      mediaUrl: null,
      mediaType: null,
      priority: 'normal',
      status: 'active',
      createdBy: '+919876543212',
      createdAt: Date.now() - 1000 * 60 * 60 * 4,
      scheduledAt: null,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24
    }
  ]
};

export default function DepartmentDisplayPage() {
  const params = useParams();
  const rawDeptCode = (params?.deptId as string) || 'ECE';
  const deptCode = rawDeptCode.toUpperCase();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [status, setStatus] = useState<ListenerStatus>('connected');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to live Firestore notice feed
  useEffect(() => {
    let isSubscribed = true;

    const unsubscribe = subscribeToDepartmentNotices(
      deptCode,
      (liveNotices) => {
        if (isSubscribed) {
          if (liveNotices.length === 0 && MOCK_NOTICES[deptCode]) {
            // Fallback to sample notices if Firestore is empty during demo
            setNotices(MOCK_NOTICES[deptCode]);
          } else {
            setNotices(liveNotices);
          }
        }
      },
      (newStatus) => {
        if (isSubscribed) {
          setStatus(newStatus);
        }
      }
    );

    // Initial mock fallback if listener hasn't fired yet
    if (MOCK_NOTICES[deptCode]) {
      setNotices(MOCK_NOTICES[deptCode]);
    }

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [deptCode]);

  // Screen Heartbeat telemetry loop (every 60s)
  useEffect(() => {
    const screenId = `${deptCode}-MAIN-DISPLAY`;

    const sendHeartbeat = async () => {
      try {
        await fetch('http://localhost:5001/campuscast/us-central1/screenHeartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ screenId }),
        });
      } catch {
        // Silent catch for local standalone mode
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, [deptCode]);

  // Auto-scroll loop for multi-card overflow
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (el.scrollHeight > el.clientHeight) {
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
          el.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ top: 300, behavior: 'smooth' });
        }
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [notices]);

  return (
    <div className="w-screen h-screen flex flex-col justify-between bg-[#0B1220] overflow-hidden select-none">
      {/* Header (90px) */}
      <Header deptCode={deptCode} />

      {/* Main Notice Feed Area */}
      <main
        ref={scrollRef}
        className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-6 max-w-7xl mx-auto w-full"
      >
        {notices.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-4 py-20">
            <div className="p-6 bg-[#141C2E] rounded-full border border-[#222F47]">
              <MessageSquarePlus className="w-16 h-16 text-[#3B82F6] animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold text-[#F5F7FA]">
              No Active Notices for {deptCode}
            </h2>
            <p className="text-xl text-[#8B96A8] max-w-lg">
              Authorized faculty can publish announcements directly by sending a WhatsApp message.
            </p>
          </div>
        ) : (
          notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))
        )}
      </main>

      {/* Footer (48px) */}
      <Footer noticeCount={notices.length} status={status} />
    </div>
  );
}
