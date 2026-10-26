/**
 * @file admin/src/app/audit/page.tsx
 * @description CampusCast Admin Command Center — Security Audit Trail & Governance Ledger (`/audit`).
 * 
 * Provides an immutable event log tracking all notice publications, administrative approvals,
 * manual modifications, emergency overrides, unauthorized publish attempts, and CSV export capabilities.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Notice,
  User,
  Screen,
  AuditLog,
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
  Download,
  Trash2,
  CheckCircle2,
  Filter,
  KeyRound,
} from 'lucide-react';
import {
  saveNoticeToFirestore,
  saveAuditToFirestore,
  subscribeToAdminNotices,
  subscribeToAuditLogs,
} from '@/lib/firebase';
import { verifyMasterSecurityPin } from '@/lib/security';

const REGISTERED_SCREENS: Screen[] = [
  { id: 'ECE-MAIN-DISPLAY',   departmentId: 'ECE',  label: 'ECE Corridor Smart TV',        lastSeenAt: null },
  { id: 'CSE-LAB-DISPLAY',    departmentId: 'CSE',  label: 'CSE Block Main Entrance',       lastSeenAt: null },
  { id: 'AIML-FOYER-DISPLAY', departmentId: 'AIML', label: 'AIML Lab Foyer Screen',         lastSeenAt: null },
  { id: 'MECH-HALL-DISPLAY',  departmentId: 'MECH', label: 'Mechanical Workshop Hall',       lastSeenAt: null },
  { id: 'CIVIL-DEPT-DISPLAY', departmentId: 'CIVIL',label: 'Civil Dept Corridor',            lastSeenAt: null },
  { id: 'EEE-POWER-DISPLAY',  departmentId: 'EEE',  label: 'EEE Power Lab Screen',          lastSeenAt: null },
];

export default function AuditPage() {
  const [screens, setScreens] = useState<Screen[]>(REGISTERED_SCREENS);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [sidebarLogoError, setSidebarLogoError] = useState(false);

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

    const unsubAudit = subscribeToAuditLogs((liveLogs) => {
      if (liveLogs && liveLogs.length > 0) {
        setAuditLogs(liveLogs);
        try {
          localStorage.setItem('campuscast_audit', JSON.stringify(liveLogs));
        } catch {
          // ignore
        }
      }
    });

    return () => {
      unsubscribe();
      unsubAudit();
    };
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

  const handleExportCSV = () => {
    if (auditLogs.length === 0) return;
    const headers = ['Event ID', 'Event Type', 'Actor', 'Details / Title', 'Department', 'Timestamp'];
    const rows = filteredLogs.map((log) => [
      log.id,
      log.type,
      `"${log.actorPhone || ''}"`,
      `"${(log.detail?.title || log.detail?.action || JSON.stringify(log.detail)).replace(/"/g, '""')}"`,
      `"${log.detail?.departmentId || log.detail?.dept || log.detail?.department || 'ALL'}"`,
      `"${new Date(log.timestamp).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `campuscast-audit-trail-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'delete') return log.type === 'delete';
    if (selectedFilter === 'publish') return log.type === 'publish';
    if (selectedFilter === 'edit') return log.type === 'edit' || (log.type as any) === 'department_allotment' || (log.type as any) === 'hod_assignment';
    if (selectedFilter === 'auth_login') return (log.type as any) === 'auth_login';
    if (selectedFilter === 'emergency_broadcast') return log.type === 'emergency_broadcast';
    return true;
  });

  return (
    <div className="flex h-screen bg-[#F3F4F6] text-[#111111] font-sans antialiased overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-[280px] bg-white border-r border-[#E5E7EB] flex flex-col justify-between p-6 shrink-0 shadow-sm z-10">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2">
            {!sidebarLogoError ? (
              <img
                src="/logo-icon-transparent.png"
                alt="CampusCast Logo"
                className="w-10 h-10 object-contain rounded-xl drop-shadow-xs"
                onError={() => setSidebarLogoError(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-sm">
                CC
              </div>
            )}
            <div>
              <h1 className="text-base font-black tracking-tight text-[#111111] leading-none">
                CampusCast
              </h1>
              <p className="text-[11px] font-semibold text-[#64748B] tracking-wide mt-1">
                MIT Ujjain Portal
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-[#475569] hover:text-[#111111] hover:bg-[#F1F5F9]"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </Link>

            <Link
              href="/notices"
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all text-[#475569] hover:text-[#111111] hover:bg-[#F1F5F9]"
            >
              <div className="flex items-center gap-3">
                <Kanban className="w-4 h-4" />
                <span>Notice Console</span>
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
                <span>Displays & Kiosks</span>
              </div>
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{screens.length}</span>
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
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25"
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
              Security Audit Trail & Governance Ledger
            </h2>
            <span className="text-xs font-medium text-[#64748B]">Immutable records of publications, deletions, and faculty authorizations</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExportCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-300"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <Link
              href="/notices"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-[#2563EB]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notice</span>
            </Link>

            <div className="h-6 w-[1px] bg-[#E5E7EB]" />

            <Link
              href="/login"
              className="flex items-center gap-2 text-xs font-semibold bg-[#F8FAFC] hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-[#334155] transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span>Super Admin Mode</span>
            </Link>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-[#111111]">Security & Publishing Audit Trail</h3>
              <p className="text-xs text-[#64748B]">
                Immutable ledger tracking all notice broadcasts, emergency overrides, deleted notice snapshots, and credential authorizations.
              </p>
            </div>

            {/* Event Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-bold flex-wrap">
              {[
                { id: 'ALL', label: `All Events (${auditLogs.length})` },
                { id: 'delete', label: 'Deleted Notices' },
                { id: 'publish', label: 'Published' },
                { id: 'edit', label: 'Edits & Allotments' },
                { id: 'auth_login', label: 'Sender Logins' },
                { id: 'emergency_broadcast', label: 'Emergency Alerts' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedFilter === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-[#111111]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#475569] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Event Type</th>
                  <th className="px-6 py-4">Actor / Sender</th>
                  <th className="px-6 py-4">Event Details & Snapshots</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#64748B]">
                      No audit entries matching filter &ldquo;{selectedFilter}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4">
                        {log.type === 'delete' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200 flex items-center gap-1 w-fit">
                            <Trash2 className="w-3 h-3 text-red-600" />
                            <span>Deleted Notice</span>
                          </span>
                        ) : (log.type as any) === 'auth_login' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 w-fit">
                            <KeyRound className="w-3 h-3 text-indigo-600" />
                            <span>Login Verified</span>
                          </span>
                        ) : log.type === 'emergency_broadcast' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-600 border border-red-200 w-fit block">
                            Emergency Override
                          </span>
                        ) : log.type === 'publish' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-[#22C55E] border border-emerald-200 w-fit block">
                            Published
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-[#2563EB] border border-blue-200 w-fit block">
                            {log.type.replace('_', ' ')}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-[#111111]">{log.actorPhone}</div>
                      </td>

                      <td className="px-6 py-4">
                        {log.type === 'delete' ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-red-700 line-through text-xs">
                                {log.detail?.title || 'Untitled Notice'}
                              </span>
                              <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border border-red-200">
                                {log.detail?.departmentId || 'ALL'}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {log.detail?.category}
                              </span>
                            </div>
                            {log.detail?.content && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                                &ldquo;{log.detail.content}&rdquo;
                              </p>
                            )}
                            <div className="text-[10px] text-slate-400">
                              Author: {log.detail?.authorName || log.detail?.createdBy || 'Unknown'} • ID: {log.detail?.noticeId}
                            </div>
                          </div>
                        ) : (log.type as any) === 'auth_login' ? (
                          <div>
                            <span className="font-bold text-[#111111]">{log.detail?.name || 'Faculty'}</span>
                            <span className="text-[11px] text-[#64748B] ml-2 font-mono">({log.detail?.email || log.actorPhone})</span>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Role: {log.detail?.role?.toUpperCase()} • Scopes: [{log.detail?.departments?.join(', ') || 'All'}] • Method: {log.detail?.verifiedVia || 'Domain Google Auth'}
                            </div>
                          </div>
                        ) : (
                          <div className="font-mono text-[11px] text-[#64748B]">
                            {JSON.stringify(log.detail)}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-[#64748B] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
