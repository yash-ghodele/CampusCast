/**
 * @file admin/src/app/page.tsx
 * @description CampusCast Admin Command Center — Executive Operations Dashboard (`/`).
 * 
 * Provides real-time metrics, corridor screen status telemetry, recent publications feed,
 * manual announcement publishing wizard, emergency security broadcast override, and Cloud Firestore synchronization.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Notice,
  User,
  Screen,
  AuditLog,
  DEPARTMENT_THEMES,
  NoticeCategory,
  formatHeartbeatTimestamp,
  formatDurationHHMMSS,
  detectMediaType,
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
  Megaphone,
  Briefcase,
  GraduationCap,
  Trophy,
  Calendar,
  Zap,
  TrendingUp,
  Activity,
  MessageSquare,
  Eye,
  Sparkles,
  FileText,
} from 'lucide-react';
import {
  saveNoticeToFirestore,
  saveAuditToFirestore,
  subscribeToAdminNotices,
  subscribeToScreens,
  pingScreensInFirestore,
} from '@/lib/firebase';
import { verifyMasterSecurityPin } from '@/lib/security';
import { getStoredAuthUser } from '@/lib/auth';

const REGISTERED_SCREENS: Screen[] = [
  { id: 'ECE-MAIN-DISPLAY',   departmentId: 'ECE',  label: 'ECE Corridor Smart TV',        lastSeenAt: Date.now() },
  { id: 'CSE-LAB-DISPLAY',    departmentId: 'CSE',  label: 'CSE Block Main Entrance',       lastSeenAt: Date.now() },
  { id: 'AIML-FOYER-DISPLAY', departmentId: 'AIML', label: 'AIML Lab Foyer Screen',         lastSeenAt: Date.now() },
  { id: 'MECH-HALL-DISPLAY',  departmentId: 'MECH', label: 'Mechanical Workshop Hall',       lastSeenAt: Date.now() },
  { id: 'CIVIL-DEPT-DISPLAY', departmentId: 'CIVIL',label: 'Civil Dept Corridor',            lastSeenAt: Date.now() },
  { id: 'EEE-POWER-DISPLAY',  departmentId: 'EEE',  label: 'EEE Power Lab Screen',          lastSeenAt: Date.now() },
];

export default function DashboardPage() {
  const [screens, setScreens] = useState<Screen[]>(REGISTERED_SCREENS);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [currentAuthUser, setCurrentAuthUser] = useState<User | null>(null);
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
    const authUser = getStoredAuthUser();
    if (authUser) {
      setCurrentAuthUser(authUser);
      if (authUser.role !== 'super_admin' && authUser.departments?.length > 0) {
        setWDept(authUser.departments[0]);
      }
    }

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

  // Screen Heartbeat Sync from Firestore & LocalStorage
  useEffect(() => {
    pingScreensInFirestore(REGISTERED_SCREENS.map((s) => s.id));

    const pingInterval = setInterval(() => {
      pingScreensInFirestore(REGISTERED_SCREENS.map((s) => s.id));
    }, 20000);

    const unsubscribeScreens = subscribeToScreens((liveScreens) => {
      const liveMap: Record<string, number> = {};
      liveScreens.forEach((ls) => {
        if (ls.id && ls.lastSeenAt) liveMap[ls.id] = ls.lastSeenAt;
      });

      setScreens((prev) =>
        prev.map((s) => ({
          ...s,
          lastSeenAt: liveMap[s.id] || s.lastSeenAt || Date.now(),
        }))
      );
    });

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
      clearInterval(pingInterval);
      unsubscribeScreens();
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

    const detectedType = detectMediaType(wMediaUrl);
    const newNotice: Notice = {
      id: `ntc-${Date.now()}`,
      departmentId: wDept,
      title: wTitle,
      category: wCategory,
      content: wContent,
      eventDate: wEventDate,
      eventTime: wEventTime,
      mediaUrl: wMediaUrl || null,
      mediaType: detectedType,
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

  const handleEmergencyBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyMasterSecurityPin(modalPin)) {
      alert('Invalid Security PIN! Please enter your configured master PIN.');
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/notices"
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all text-[#475569] hover:text-[#111111] hover:bg-[#F1F5F9]"
            >
              <div className="flex items-center gap-3">
                <Kanban className="w-4 h-4" />
                <span>Notices</span>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#E2E8F0] text-[#475569]">
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
              Dashboard Overview
            </h2>
            <span className="text-xs font-medium text-[#64748B]">Real-Time Campus Communication Platform</span>
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
        <main className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Notices</span>
                <div className="text-4xl font-black text-[#2563EB] mt-1">{notices.length}</div>
                <span className="text-xs text-[#22C55E] font-semibold mt-1 inline-flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Live cloud ledger
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center border border-[#2563EB]/20">
                <MessageSquare className="w-7 h-7" />
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Active Screens</span>
                <div className="text-4xl font-black text-[#22C55E] mt-1">
                  {onlineScreensCount} <span className="text-lg text-[#64748B] font-normal">/ {screens.length}</span>
                </div>
                <span className="text-xs text-[#22C55E] font-semibold mt-1 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Real hardware registered
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center border border-[#22C55E]/20">
                <Tv className="w-7 h-7" />
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Active Notices</span>
                <div className="text-4xl font-black text-[#111111] mt-1">{activeNotices.length}</div>
                <span className="text-xs text-[#60A5FA] font-semibold mt-1 inline-flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Streaming to live kiosks
                </span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#60A5FA]/10 text-[#2563EB] flex items-center justify-center border border-[#60A5FA]/20">
                <Eye className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* ZERO-COST SERVERLESS WHATSAPP PIPELINE BANNER */}
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md border border-slate-700/60">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 text-[#2563EB]">
                <Radio className="w-6 h-6 text-[#60A5FA]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-black tracking-tight">Zero-Cost Ingestion & Cron Gateway</span>
                  <span className="bg-[#22C55E]/15 text-[#22C55E] text-[10px] font-bold px-2 py-0.5 rounded border border-[#22C55E]/30">
                    ONLINE & ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Inbound Webhook: <code className="bg-black/40 px-1.5 py-0.5 rounded font-mono text-blue-300">/api/webhook/twilio</code> | Twilio Sandbox Hotline: <strong className="text-white">+1 415 523 8886</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/settings"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                Sandbox Configuration →
              </Link>
            </div>
          </div>

          {/* MESSAGES OVER TIME ANALYTICS CHART */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#111111]">Messages Over Time</h3>
                <p className="text-xs text-[#64748B]">
                  Daily publication frequency across all campus departments.
                </p>
              </div>
              <span className="text-xs font-bold text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-lg">
                Active Notices: {notices.length}
              </span>
            </div>

            {/* Dynamic Daily Notice Counts */}
            {(() => {
              const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const dayCounts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
              notices.forEach((n) => {
                if (n.createdAt) {
                  const day = daysOfWeek[new Date(n.createdAt).getDay()];
                  if (dayCounts[day] !== undefined) dayCounts[day]++;
                }
              });
              const maxDayCount = Math.max(...Object.values(dayCounts), 1);
              const chartBars = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
                day,
                count: dayCounts[day],
                height: dayCounts[day] > 0 ? `${Math.max(15, (dayCounts[day] / maxDayCount) * 90)}%` : '6%'
              }));

              return (
                <div className="h-48 w-full pt-4 flex items-end justify-between gap-4 px-4 border-b border-[#E5E7EB] pb-2">
                  {chartBars.map((bar) => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-xs font-bold text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.count}
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-[#2563EB] to-[#60A5FA] rounded-t-lg transition-all group-hover:brightness-110"
                        style={{ height: bar.height }}
                      />
                      <span className="text-xs font-semibold text-[#64748B]">{bar.day}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* LIVE SCREEN STATUS MAP */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#111111]">Live Screen Status Map</h3>
                <p className="text-xs text-[#64748B]">
                  Real-time telemetry heartbeat status for campus Smart TV browsers.
                </p>
              </div>
              <Link
                href="/displays"
                className="text-xs text-[#2563EB] font-bold hover:underline"
              >
                Manage All Screens →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {screens.map((sc) => {
                const diffMs = Date.now() - (sc.lastSeenAt || 0);
                const isOnline = sc.lastSeenAt ? diffMs < 120000 : false;
                const theme = (DEPARTMENT_THEMES && DEPARTMENT_THEMES[sc.departmentId]) || {
                  primary: '#2563EB',
                  badgeBg: '#DBEAFE',
                  badgeText: '#1E40AF',
                  border: '#60A5FA',
                };

                return (
                  <div
                    key={sc.id}
                    className="bg-[#F8FAFC] border border-[#E5E7EB] p-4 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded border uppercase"
                        style={{
                          backgroundColor: theme.badgeBg,
                          color: theme.badgeText,
                          borderColor: theme.border,
                        }}
                      >
                        {sc.departmentId}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-[#111111] truncate max-w-[150px]">
                          {sc.label}
                        </div>
                        <div className="text-[11px] text-[#64748B] font-mono">
                          {sc.lastSeenAt ? `${formatHeartbeatTimestamp(sc.lastSeenAt)} (${formatDurationHHMMSS(diffMs)} ago)` : 'Never (--:--:--)'}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        isOnline
                          ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                          : 'bg-red-500/15 text-red-600 border border-red-500/30'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#22C55E] animate-pulse' : 'bg-red-500'}`} />
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
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
                    <option value="ALL">ALL - All Campus Screens (Campus-Wide Broadcast)</option>
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

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#111111] font-bold mb-1">Event Date (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 15 Oct 2026"
                      value={wEventDate}
                      onChange={(e) => setWEventDate(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#111111] font-bold mb-1">Event Time (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM"
                      value={wEventTime}
                      onChange={(e) => setWEventTime(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#111111] font-bold mb-1">Poster / Media Attachment URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/poster.jpg or .pdf"
                    value={wMediaUrl}
                    onChange={(e) => setWMediaUrl(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] font-mono"
                  />
                </div>

                {/* Intelligent Auto-Arrangement Feedback */}
                {wMediaUrl ? (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>
                      {detectMediaType(wMediaUrl) === 'image'
                        ? 'Auto-Arranging: Visual Poster Showcase Block (7-Col Featured Media Spotlight)'
                        : detectMediaType(wMediaUrl) === 'pdf'
                        ? 'Auto-Arranging: Official Document / Circular Block (with QR Instant Access)'
                        : 'Auto-Arranging: Dynamic Attachment Feed'}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#64748B] text-xs font-semibold flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#64748B] shrink-0" />
                    <span>Auto-Arranging: High-Impact Typographic Announcement Bulletin Block</span>
                  </div>
                )}

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

                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E5E7EB] space-y-1.5">
                  <div className="font-bold text-[#111111]">Review Notice Target & Arrangement</div>
                  <div className="text-[#64748B]">Target Scope: <span className="font-bold text-[#2563EB]">{wDept === 'ALL' ? 'ALL CAMPUS SCREENS' : `${wDept} Department`}</span></div>
                  <div className="text-[#64748B]">Headline: <span className="font-bold text-[#111111]">{wTitle}</span></div>
                  <div className="text-[#64748B]">
                    Smart Layout Block: <span className="font-bold text-[#22C55E]">
                      {detectMediaType(wMediaUrl) === 'image'
                        ? 'Visual Poster Showcase Block'
                        : detectMediaType(wMediaUrl) === 'pdf'
                        ? 'Official Document Circular Block'
                        : 'Typographic Bulletin Feed'}
                    </span>
                  </div>
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

      {/* EMERGENCY BROADCAST PIN MODAL */}
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
                <label className="block text-red-600 font-bold mb-1">Enter Master Security PIN</label>
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
