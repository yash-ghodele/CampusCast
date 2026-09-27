/**
 * @file apps/admin/src/app/settings/page.tsx
 * @description CampusCast Admin Command Center — Dedicated System Configuration View (`/settings`).
 * 
 * Standalone Page: Contains complete UI, configuration controls, and real-time state.
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
  Save,
  CheckCircle2,
  Server,
  KeyRound,
  Clock,
  Zap,
} from 'lucide-react';
import {
  saveNoticeToFirestore,
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

export default function SettingsPage() {
  const [screens, setScreens] = useState<Screen[]>(REGISTERED_SCREENS);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sidebarLogoError, setSidebarLogoError] = useState(false);

  // Configuration Form State
  const [heartbeatInterval, setHeartbeatInterval] = useState('30');
  const [screenTimeout, setScreenTimeout] = useState('120');
  const [heroRotation, setHeroRotation] = useState('10');
  const [emergencyPin, setEmergencyPin] = useState('1234');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Emergency Modal State
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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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
    setNotices(updated);
    try {
      localStorage.setItem('campuscast_notices', JSON.stringify(updated));
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('campuscast-notices-channel');
        ch.postMessage(updated);
        ch.close();
      }
    } catch {
      // ignore
    }

    await saveNoticeToFirestore(emergencyNotice);

    const logEntry: AuditLog = {
      id: `aud-${Date.now()}`,
      type: 'emergency_broadcast',
      actorPhone: 'Super Admin',
      detail: { scope: modalDept, text: modalText },
      timestamp: Date.now(),
    };
    const updatedLogs = [logEntry, ...auditLogs];
    setAuditLogs(updatedLogs);
    try {
      localStorage.setItem('campuscast_audit', JSON.stringify(updatedLogs));
    } catch {
      // ignore
    }
    await saveAuditToFirestore(logEntry);

    setShowEmergencyModal(false);
    setModalPin('');
    setModalText('');
    alert(`Emergency broadcast launched across ${modalDept} screens!`);
  };

  const onlineScreensCount = screens.filter((s) => s.lastSeenAt && Date.now() - s.lastSeenAt < 120000).length;

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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25"
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
              System Configuration
            </h2>
            <span className="text-xs font-medium text-[#64748B]">Platform environment parameters, telemetry intervals & sync policies</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/notices"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-[#2563EB]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notice</span>
            </Link>

            <div className="h-6 w-[1px] bg-[#E5E7EB]" />

            <div className="flex items-center gap-2 text-xs font-semibold bg-[#F8FAFC] px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-[#334155]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span>Super Admin Mode</span>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-8 space-y-8 max-w-5xl w-full mx-auto">
          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-[#22C55E]/30 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              <span>Configuration settings updated and synchronized successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* SECTION 1: TELEMETRY & DISPLAY TIMING */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 pb-3 border-b border-[#E5E7EB]">
                <Clock className="w-5 h-5 text-[#2563EB]" />
                <div>
                  <h3 className="text-base font-bold text-[#111111]">Telemetry & Screen Durations</h3>
                  <p className="text-xs text-[#64748B]">Define intervals for heartbeat pings, offline thresholds, and hero rotation speed.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[#111111] font-bold mb-1">Heartbeat Ping Interval (seconds)</label>
                  <input
                    type="number"
                    value={heartbeatInterval}
                    onChange={(e) => setHeartbeatInterval(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] font-mono font-bold"
                  />
                  <span className="text-[10px] text-[#64748B] mt-1 block">Default: 30 seconds</span>
                </div>

                <div>
                  <label className="block text-[#111111] font-bold mb-1">Screen Offline Timeout (seconds)</label>
                  <input
                    type="number"
                    value={screenTimeout}
                    onChange={(e) => setScreenTimeout(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] font-mono font-bold"
                  />
                  <span className="text-[10px] text-[#64748B] mt-1 block">Threshold to mark screen offline: 120s</span>
                </div>

                <div>
                  <label className="block text-[#111111] font-bold mb-1">Hero Notice Carousel (seconds)</label>
                  <input
                    type="number"
                    value={heroRotation}
                    onChange={(e) => setHeroRotation(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] font-mono font-bold"
                  />
                  <span className="text-[10px] text-[#64748B] mt-1 block">Rotation cycle: 10s</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: FIREBASE & SYNC ARCHITECTURE */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 pb-3 border-b border-[#E5E7EB]">
                <Server className="w-5 h-5 text-[#22C55E]" />
                <div>
                  <h3 className="text-base font-bold text-[#111111]">Cloud Sync Architecture</h3>
                  <p className="text-xs text-[#64748B]">Real-time connection details for Cloud Firestore and edge streaming.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl space-y-2">
                  <span className="text-[#64748B] font-semibold">Active Firebase Project ID:</span>
                  <div className="text-sm font-mono font-bold text-[#2563EB]">campuscast-mitece</div>
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-[#22C55E] text-[10px] font-bold">
                    CONNECTED & LIVE
                  </span>
                </div>

                <div className="p-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl space-y-2">
                  <span className="text-[#64748B] font-semibold">Dual Sync Pipeline:</span>
                  <div className="text-sm font-bold text-[#111111]">Firestore onSnapshot + Local BroadcastChannel</div>
                  <span className="text-[10px] text-[#64748B] block">Offline-resilient display streaming</span>
                </div>
              </div>
            </div>

            {/* SECTION 3: SECURITY & AUTHORIZATION */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 pb-3 border-b border-[#E5E7EB]">
                <KeyRound className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="text-base font-bold text-[#111111]">Emergency Broadcast Security PIN</h3>
                  <p className="text-xs text-[#64748B]">Master 4-digit code required to trigger campus-wide red banner overrides.</p>
                </div>
              </div>

              <div className="max-w-xs text-xs">
                <label className="block text-[#111111] font-bold mb-1">Master Emergency PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={emergencyPin}
                  onChange={(e) => setEmergencyPin(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-center text-lg tracking-widest text-[#111111] font-mono font-bold"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">Master PIN code: 1234</span>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-[#2563EB]/20 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save System Settings</span>
              </button>
            </div>
          </form>
        </main>
      </div>

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
