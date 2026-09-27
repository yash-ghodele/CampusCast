/**
 * @file apps/admin/src/app/notices/page.tsx
 * @description CampusCast Admin Command Center — Dedicated Notice Management View (`/notices`).
 * 
 * Standalone Page: Contains complete UI, Kanban board, Notice Creation Wizard, and Firestore live sync.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Notice,
  User,
  Screen,
  AuditLog,
  NoticeCategory,
  formatHeartbeatTimestamp,
  formatDurationHHMMSS,
} from '@campuscast/shared';
import {
  LayoutDashboard,
  Kanban,
  Tv,
  Building2,
  Users as UsersIcon,
  BarChart3,
  ShieldAlert,
  Settings as SettingsIcon,
  Radio,
  Plus,
  AlertTriangle,
  Lock,
  Clock,
  CheckCircle2,
  XCircle,
  Megaphone,
  Briefcase,
  GraduationCap,
  Trophy,
  Calendar,
  Zap,
} from 'lucide-react';
import {
  saveNoticeToFirestore,
  deleteNoticeFromFirestore,
  saveAuditToFirestore,
  subscribeToAdminNotices,
} from '@/lib/firebase';

const REGISTERED_SCREENS: Screen[] = [
  { id: 'ECE-MAIN-DISPLAY',   departmentId: 'ECE',  label: 'ECE Corridor Smart TV',        lastSeenAt: null },
  { id: 'CSE-LAB-DISPLAY',    departmentId: 'CSE',  label: 'CSE Block Main Entrance',       lastSeenAt: null },
  { id: 'AIML-FOYER-DISPLAY', departmentId: 'AIML', label: 'AIML Lab Foyer Screen',         lastSeenAt: null },
  { id: 'MECH-HALL-DISPLAY',  departmentId: 'MECH', label: 'Mechanical Workshop Hall',       lastSeenAt: null },
  { id: 'CIVIL-DEPT-DISPLAY', departmentId: 'CIVIL',label: 'Civil Dept Corridor',            lastSeenAt: null },
  { id: 'EEE-POWER-DISPLAY',  departmentId: 'EEE',  label: 'EEE Power Lab Screen',          lastSeenAt: null },
];

export default function NoticesPage() {
  const [screens, setScreens] = useState<Screen[]>(REGISTERED_SCREENS);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [noticeViewMode, setNoticeViewMode] = useState<'kanban' | 'list'>('kanban');
  const [sidebarLogoError, setSidebarLogoError] = useState(false);

  // WIZARD MODAL STATE
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wCategory, setWCategory] = useState<NoticeCategory>('announcement');
  const [wTitle, setWTitle] = useState('');
  const [wContent, setWContent] = useState('');
  const [wDept, setWDept] = useState('ECE');
  const [wMediaUrl, setWMediaUrl] = useState('');
  const [wEventDate, setWEventDate] = useState('');
  const [wEventTime, setWEventTime] = useState('');
  const [wScheduleType, setWScheduleType] = useState<'now' | 'later'>('now');

  // EMERGENCY MODAL STATE
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [modalPin, setModalPin] = useState('');
  const [modalText, setModalText] = useState('');
  const [modalDept, setModalDept] = useState('ALL');

  // Load persisted state & subscribe to Firestore
  useEffect(() => {
    try {
      const storedNotices = localStorage.getItem('campuscast_notices');
      if (storedNotices) setNotices(JSON.parse(storedNotices));

      const storedUsers = localStorage.getItem('campuscast_users');
      if (storedUsers) setUsers(JSON.parse(storedUsers));

      const storedAudit = localStorage.getItem('campuscast_audit');
      if (storedAudit) setAuditLogs(JSON.parse(storedAudit));
    } catch (err) {
      console.warn('LocalStorage load error:', err);
    }

    const unsubscribe = subscribeToAdminNotices((liveNotices) => {
      setNotices(liveNotices);
      try {
        localStorage.setItem('campuscast_notices', JSON.stringify(liveNotices));
      } catch {
        // ignore
      }
    });

    return () => unsubscribe();
  }, []);

  // Screen Heartbeat Sync
  useEffect(() => {
    try {
      const stored = localStorage.getItem('campuscast_screens');
      if (stored) {
        const heartbeats: Record<string, number> = JSON.parse(stored);
        setScreens((prev) =>
          prev.map((s) =>
            heartbeats[s.id] ? { ...s, lastSeenAt: heartbeats[s.id] } : s
          )
        );
      }
    } catch {
      // ignore
    }

    let ch: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      ch = new BroadcastChannel('campuscast-screens-channel');
      ch.onmessage = (e) => {
        if (e.data && e.data.screenId) {
          setScreens((prev) =>
            prev.map((s) =>
              s.id === e.data.screenId ? { ...s, lastSeenAt: e.data.lastSeenAt || Date.now() } : s
            )
          );
        }
      };
    }
    return () => {
      if (ch) ch.close();
    };
  }, []);

  const updateNoticesAndSync = (newNotices: Notice[]) => {
    setNotices(newNotices);
    try {
      localStorage.setItem('campuscast_notices', JSON.stringify(newNotices));
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('campuscast-notices-channel');
        channel.postMessage(newNotices);
        channel.close();
      }
    } catch {
      // ignore
    }
  };

  const handleCreateNoticeSubmit = async () => {
    if (!wTitle || !wContent) return;

    const newNotice: Notice = {
      id: `ntc-${Date.now()}`,
      departmentId: wDept,
      title: wTitle,
      category: wCategory,
      content: wContent,
      eventDate: wEventDate,
      eventTime: wEventTime,
      mediaUrl: wMediaUrl || null,
      mediaType: wMediaUrl ? 'image' : null,
      priority: 'normal',
      status: wScheduleType === 'now' ? 'active' : 'scheduled',
      createdBy: 'Admin Command Center',
      createdAt: Date.now(),
      scheduledAt: wScheduleType === 'later' ? Date.now() + 3600000 : null,
      expiresAt: Date.now() + 86400000,
    };

    const updated = [newNotice, ...notices];
    updateNoticesAndSync(updated);
    await saveNoticeToFirestore(newNotice);

    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      type: 'publish',
      actorPhone: 'Admin Command Center',
      detail: { dept: wDept, title: wTitle },
      timestamp: Date.now(),
    };
    const updatedAudit = [newLog, ...auditLogs];
    setAuditLogs(updatedAudit);
    try {
      localStorage.setItem('campuscast_audit', JSON.stringify(updatedAudit));
    } catch {
      // ignore
    }
    await saveAuditToFirestore(newLog);

    setShowWizard(false);
    setWizardStep(1);
    setWTitle('');
    setWContent('');
    setWMediaUrl('');
    setWEventDate('');
    setWEventTime('');
  };

  const expireNotice = async (id: string) => {
    const updated = notices.map((n) => (n.id === id ? { ...n, status: 'expired' as const } : n));
    updateNoticesAndSync(updated);
    const target = updated.find((n) => n.id === id);
    if (target) await saveNoticeToFirestore(target);
  };

  const approveNotice = async (id: string) => {
    const updated = notices.map((n) => (n.id === id ? { ...n, status: 'active' as const } : n));
    updateNoticesAndSync(updated);
    const target = updated.find((n) => n.id === id);
    if (target) await saveNoticeToFirestore(target);
  };

  const deleteNotice = async (id: string) => {
    const updated = notices.filter((n) => n.id !== id);
    updateNoticesAndSync(updated);
    await deleteNoticeFromFirestore(id);
  };

  const handleEmergencyBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalPin !== '1234') {
      alert('Invalid Security PIN! Please enter master PIN (1234).');
      return;
    }

    const emergencyNotice: Notice = {
      id: `emergency-${Date.now()}`,
      departmentId: modalDept,
      title: 'EMERGENCY CAMPUS OVERRIDE',
      category: 'emergency',
      content: modalText,
      mediaUrl: null,
      mediaType: null,
      priority: 'urgent',
      status: 'active',
      createdBy: 'Principal Office & Campus Security',
      createdAt: Date.now(),
      scheduledAt: null,
      expiresAt: Date.now() + 86400000,
    };

    const updated = [emergencyNotice, ...notices];
    updateNoticesAndSync(updated);
    await saveNoticeToFirestore(emergencyNotice);

    const emergencyLog: AuditLog = {
      id: `aud-${Date.now()}`,
      type: 'emergency_broadcast',
      actorPhone: 'Super Admin',
      detail: { scope: modalDept, text: modalText },
      timestamp: Date.now(),
    };
    const updatedAudit = [emergencyLog, ...auditLogs];
    setAuditLogs(updatedAudit);
    try {
      localStorage.setItem('campuscast_audit', JSON.stringify(updatedAudit));
    } catch {
      // ignore
    }
    await saveAuditToFirestore(emergencyLog);

    setShowEmergencyModal(false);
    setModalPin('');
    setModalText('');
    alert(`Emergency broadcast launched across ${modalDept} screens!`);
  };

  const onlineScreensCount = screens.filter((s) => s.lastSeenAt && Date.now() - s.lastSeenAt < 120000).length;
  const activeNotices = notices.filter((n) => n.status === 'active');
  const scheduledNotices = notices.filter((n) => n.status === 'scheduled');
  const expiredNotices = notices.filter((n) => n.status === 'expired');

  return (
    <div className="min-h-screen w-full flex bg-[#F3F4F6] text-[#111111] font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between p-5 shrink-0 overflow-y-auto max-h-screen sticky top-0 shadow-sm">
        <div>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-[#E5E7EB] pb-5 group">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              {sidebarLogoError ? (
                <Radio className="w-7 h-7 text-[#2563EB]" />
              ) : (
                <img
                  src="/logo-transparent.png"
                  alt="CampusCast Logo"
                  className="w-full h-full object-contain"
                  onError={() => setSidebarLogoError(true)}
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#111111]">CampusCast</span>
              <span className="text-[10px] font-semibold text-[#60A5FA] uppercase tracking-wider">
                Your Campus. Your Voice.
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-[#475569] hover:text-[#111111] hover:bg-[#F1F5F9]"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/notices"
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25"
            >
              <div className="flex items-center gap-3">
                <Kanban className="w-4 h-4" />
                <span>Notices</span>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/20 text-white">
                {notices.length}
              </span>
            </Link>

            <Link
              href="/displays"
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all text-[#475569] hover:text-[#111111] hover:bg-[#F1F5F9]"
            >
              <div className="flex items-center gap-3">
                <Tv className="w-4 h-4" />
                <span>Screens</span>
              </div>
              <span className="bg-[#22C55E]/15 text-[#22C55E] px-2 py-0.5 rounded text-xs font-bold border border-[#22C55E]/30">
                {onlineScreensCount}/{screens.length}
              </span>
            </Link>

            <Link
              href="/departments"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-[#475569] hover:text-[#111111] hover:bg-[#F1F5F9]"
            >
              <Building2 className="w-4 h-4" />
              <span>Departments</span>
            </Link>

            <Link
              href="/users"
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all text-[#475569] hover:text-[#111111] hover:bg-[#F1F5F9]"
            >
              <div className="flex items-center gap-3">
                <UsersIcon className="w-4 h-4" />
                <span>Faculty Roster</span>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#E2E8F0] text-[#475569]">
                {users.length}
              </span>
            </Link>

            <Link
              href="/analytics"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-[#475569] hover:text-[#111111] hover:bg-[#F1F5F9]"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </Link>

            <Link
              href="/audit"
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all text-[#475569] hover:text-[#111111] hover:bg-[#F1F5F9]"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4" />
                <span>Audit Logs</span>
              </div>
              <span className="bg-amber-500/15 text-amber-600 px-2 py-0.5 rounded text-xs font-bold border border-amber-500/30">
                {auditLogs.length}
              </span>
            </Link>

            <Link
              href="/settings"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-[#475569] hover:text-[#111111] hover:bg-[#F1F5F9]"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* Emergency Trigger */}
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl space-y-3 mt-6">
          <div className="flex items-center gap-2 text-red-600 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>URGENT ALERT OVERRIDE</span>
          </div>
          <p className="text-xs text-[#64748B]">
            Broadcast PIN-protected urgent alert across all campus screens.
          </p>
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="w-full bg-[#DC2626] hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Launch Emergency</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col overflow-y-auto min-h-screen">
        {/* TOP BAR */}
        <header className="h-[75px] bg-white border-b border-[#E5E7EB] px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black tracking-tight text-[#111111]">
              Notice Management
            </h2>
            <span className="text-xs font-medium text-[#64748B]">Publish, schedule, and curate live campus announcements</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowWizard(true)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-[#2563EB]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notice (Wizard)</span>
            </button>

            <div className="h-6 w-[1px] bg-[#E5E7EB]" />

            <div className="flex items-center gap-2 text-xs font-semibold bg-[#F8FAFC] px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-[#334155]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span>Super Admin Mode</span>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#111111]">Campus Notice Management</h3>
              <p className="text-xs text-[#64748B]">
                Real-time status transitions: Drafts → Scheduled → Active Hallway Broadcasts → Expired.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] p-1 rounded-xl flex gap-1 text-xs font-bold">
                <button
                  onClick={() => setNoticeViewMode('kanban')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    noticeViewMode === 'kanban'
                      ? 'bg-white shadow text-[#2563EB]'
                      : 'text-[#64748B] hover:text-[#111111]'
                  }`}
                >
                  Kanban Board
                </button>
                <button
                  onClick={() => setNoticeViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    noticeViewMode === 'list'
                      ? 'bg-white shadow text-[#2563EB]'
                      : 'text-[#64748B] hover:text-[#111111]'
                  }`}
                >
                  Table List
                </button>
              </div>

              <button
                onClick={() => setShowWizard(true)}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-[#2563EB]/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create Notice</span>
              </button>
            </div>
          </div>

          {/* KANBAN BOARD */}
          {noticeViewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* COLUMN 1: SCHEDULED */}
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-[#111111]">SCHEDULED</span>
                  </div>
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">
                    {scheduledNotices.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
                  {scheduledNotices.length === 0 ? (
                    <div className="text-center py-10 text-xs text-[#64748B]">No scheduled notices</div>
                  ) : (
                    scheduledNotices.map((n) => (
                      <div
                        key={n.id}
                        className="bg-white border border-[#E5E7EB] p-4 rounded-xl space-y-3 shadow-sm hover:shadow transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200">
                            {n.departmentId}
                          </span>
                          <span className="text-[10px] text-[#64748B] font-mono">
                            {n.scheduledAt ? new Date(n.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Future'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#111111]">{n.title}</h4>
                        <p className="text-xs text-[#475569] line-clamp-2">{n.content}</p>
                        <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                          <button
                            onClick={() => approveNotice(n.id)}
                            className="text-xs text-[#22C55E] font-bold hover:underline"
                          >
                            Push Active Now
                          </button>
                          <button
                            onClick={() => deleteNotice(n.id)}
                            className="text-xs text-red-500 font-semibold hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 2: ACTIVE */}
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                    <span className="text-sm font-bold text-[#111111]">ACTIVE ON KIOSKS</span>
                  </div>
                  <span className="bg-emerald-100 text-[#22C55E] px-2 py-0.5 rounded text-xs font-bold">
                    {activeNotices.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
                  {activeNotices.length === 0 ? (
                    <div className="text-center py-10 text-xs text-[#64748B]">No active notices streaming</div>
                  ) : (
                    activeNotices.map((n) => (
                      <div
                        key={n.id}
                        className="bg-white border-2 border-[#2563EB]/20 p-4 rounded-xl space-y-3 shadow-sm hover:shadow transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200 uppercase">
                            {n.departmentId}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#22C55E]">
                            {n.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#111111]">{n.title}</h4>
                        <p className="text-xs text-[#475569] line-clamp-2">{n.content}</p>
                        <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                          <button
                            onClick={() => expireNotice(n.id)}
                            className="text-xs text-amber-600 font-bold hover:underline"
                          >
                            Expire Notice
                          </button>
                          <button
                            onClick={() => deleteNotice(n.id)}
                            className="text-xs text-red-500 font-semibold hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 3: EXPIRED */}
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-[#64748B]" />
                    <span className="text-sm font-bold text-[#111111]">EXPIRED / ARCHIVED</span>
                  </div>
                  <span className="bg-slate-200 text-[#475569] px-2 py-0.5 rounded text-xs font-bold">
                    {expiredNotices.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
                  {expiredNotices.length === 0 ? (
                    <div className="text-center py-10 text-xs text-[#64748B]">No archived notices</div>
                  ) : (
                    expiredNotices.map((n) => (
                      <div
                        key={n.id}
                        className="bg-white/60 border border-[#E5E7EB] p-4 rounded-xl space-y-3 opacity-75"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-[#64748B]">
                            {n.departmentId}
                          </span>
                          <span className="text-[10px] text-[#64748B]">Archived</span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#64748B]">{n.title}</h4>
                        <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
                          <button
                            onClick={() => approveNotice(n.id)}
                            className="text-xs text-[#2563EB] font-bold hover:underline"
                          >
                            Re-publish
                          </button>
                          <button
                            onClick={() => deleteNotice(n.id)}
                            className="text-xs text-red-500 font-semibold hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* TABLE LIST VIEW */
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#475569] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Title & Scope</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created By</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {notices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[#64748B]">
                        No notices created yet. Use the Create Notice button above!
                      </td>
                    </tr>
                  ) : (
                    notices.map((n) => (
                      <tr key={n.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#111111]">{n.title}</div>
                          <div className="text-[11px] text-[#2563EB] font-semibold">{n.departmentId} Department</div>
                        </td>
                        <td className="px-6 py-4 capitalize font-semibold text-[#475569]">{n.category}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              n.status === 'active'
                                ? 'bg-emerald-100 text-[#22C55E]'
                                : n.status === 'scheduled'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-[#64748B]'
                            }`}
                          >
                            {n.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#64748B]">{n.createdBy}</td>
                        <td className="px-6 py-4 space-x-2">
                          {n.status !== 'active' && (
                            <button
                              onClick={() => approveNotice(n.id)}
                              className="text-[#2563EB] font-bold hover:underline"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotice(n.id)}
                            className="text-red-600 font-bold hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* CREATE NOTICE WIZARD MODAL */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#111111]">Create New Campus Notice</h3>
                <p className="text-xs text-[#64748B]">Step {wizardStep} of 3</p>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="text-[#64748B] hover:text-[#111111] text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* STEP 1: CATEGORY & SCOPE */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#111111] font-bold mb-1">Target Department Scope</label>
                  <select
                    value={wDept}
                    onChange={(e) => setWDept(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] font-bold"
                  >
                    <option value="ECE">ECE - Electronics & Communication</option>
                    <option value="CSE">CSE - Computer Science & Engineering</option>
                    <option value="AIML">AIML - Artificial Intelligence & ML</option>
                    <option value="MECH">MECH - Mechanical Engineering</option>
                    <option value="CIVIL">CIVIL - Civil Engineering</option>
                    <option value="EEE">EEE - Electrical & Electronics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#111111] font-bold mb-2">Notice Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'announcement', label: 'Announcement', icon: Megaphone },
                      { id: 'exam', label: 'Examination', icon: GraduationCap },
                      { id: 'event', label: 'Event / Fest', icon: Calendar },
                      { id: 'placement', label: 'Placement', icon: Briefcase },
                      { id: 'achievement', label: 'Achievement', icon: Trophy },
                      { id: 'emergency', label: 'Urgent Alert', icon: AlertTriangle },
                    ].map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = wCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setWCategory(cat.id as any)}
                          className={`p-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${
                            isSelected
                              ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]'
                              : 'border-[#E5E7EB] text-[#475569] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl font-bold shadow-md shadow-[#2563EB]/20"
                  >
                    Next: Content Formulation →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CONTENT */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#111111] font-bold mb-1">Notice Headline Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midterm Examination Schedule Released"
                    value={wTitle}
                    onChange={(e) => setWTitle(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[#111111] font-bold mb-1">Notice Body Content</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full description of the notice..."
                    value={wContent}
                    onChange={(e) => setWContent(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[#111111] font-bold mb-1">Poster / Media URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/poster.jpg"
                    value={wMediaUrl}
                    onChange={(e) => setWMediaUrl(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="flex-1 bg-[#F8FAFC] text-[#64748B] py-2.5 rounded-xl font-bold"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      if (wTitle && wContent) setWizardStep(3);
                    }}
                    disabled={!wTitle || !wContent}
                    className="flex-1 bg-[#2563EB] disabled:opacity-50 text-white py-2.5 rounded-xl font-bold shadow-md shadow-[#2563EB]/20"
                  >
                    Next: Schedule & Publish →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SCHEDULE & PUBLISH */}
            {wizardStep === 3 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#111111] font-bold mb-2">Publishing Timing</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWScheduleType('now')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                        wScheduleType === 'now'
                          ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]'
                          : 'border-[#E5E7EB] text-[#475569]'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>Publish Immediately</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWScheduleType('later')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                        wScheduleType === 'later'
                          ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]'
                          : 'border-[#E5E7EB] text-[#475569]'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Schedule for Later</span>
                    </button>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E5E7EB] space-y-1">
                  <div className="font-bold text-[#111111]">Review Notice Target</div>
                  <div className="text-[#64748B]">Department: <span className="font-bold text-[#2563EB]">{wDept}</span></div>
                  <div className="text-[#64748B]">Headline: <span className="font-bold text-[#111111]">{wTitle}</span></div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="flex-1 bg-[#F8FAFC] text-[#64748B] py-2.5 rounded-xl font-bold"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleCreateNoticeSubmit}
                    className="flex-1 bg-[#22C55E] hover:bg-emerald-600 text-white py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20"
                  >
                    Confirm & Publish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FORCE EMERGENCY BROADCAST PIN MODAL */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-red-500 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
              <div>
                <h3 className="text-xl font-black text-[#111111]">Emergency Broadcast PIN Authorization</h3>
                <p className="text-xs text-[#64748B]">High-priority display override</p>
              </div>
            </div>

            <form onSubmit={handleEmergencyBroadcastSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#111111] font-bold mb-1">Target Department Scope</label>
                <select
                  value={modalDept}
                  onChange={(e) => setModalDept(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] font-bold"
                >
                  <option value="ALL">ALL CAMPUS SCREENS</option>
                  <option value="ECE">ECE Screens</option>
                  <option value="CSE">CSE Screens</option>
                  <option value="AIML">AIML Screens</option>
                  <option value="MECH">MECH Screens</option>
                  <option value="CIVIL">CIVIL Screens</option>
                  <option value="EEE">EEE Screens</option>
                </select>
              </div>

              <div>
                <label className="block text-[#111111] font-bold mb-1">Emergency Notice Text</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter urgent campus emergency alert message..."
                  value={modalText}
                  onChange={(e) => setModalText(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] font-medium"
                />
              </div>

              <div>
                <label className="block text-red-600 font-bold mb-1">Enter Master Security PIN (1234)</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="••••"
                  value={modalPin}
                  onChange={(e) => setModalPin(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-red-500 rounded-xl px-3 py-2.5 text-center text-xl tracking-widest text-[#111111] font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="flex-1 bg-[#F8FAFC] text-[#64748B] py-2.5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#DC2626] hover:bg-red-700 text-white py-2.5 rounded-xl font-bold shadow-md shadow-red-600/20"
                >
                  Trigger Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
