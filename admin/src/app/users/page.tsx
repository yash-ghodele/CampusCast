/**
 * @file admin/src/app/users/page.tsx
 * @description CampusCast Admin Command Center — Authorized Faculty Roster & Super Admin Access Control (`/users`).
 * 
 * Provides Super Admin controls to allot departmental broadcasting scopes, designate Heads of Department (HOD),
 * review and approve self-registered `@mit.asia` faculty profiles, and manage access revocations.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Notice,
  User,
  Screen,
  AuditLog,
  Department,
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
  Crown,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  Mail,
  Phone,
  Trash2,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Check,
} from 'lucide-react';
import {
  saveNoticeToFirestore,
  saveAuditToFirestore,
  subscribeToAdminNotices,
  saveUserToFirestore,
  deleteUserFromFirestore,
  subscribeToUsers,
  subscribeToDepartments,
  saveDepartmentToFirestore,
} from '@/lib/firebase';
import { verifyMasterSecurityPin } from '@/lib/security';
import { getStoredAuthUser, SEED_FACULTY_ROSTER } from '@/lib/auth';

const REGISTERED_SCREENS: Screen[] = [
  { id: 'ECE-MAIN-DISPLAY', departmentId: 'ECE', label: 'ECE Corridor Smart TV', lastSeenAt: null },
  { id: 'CSE-LAB-DISPLAY', departmentId: 'CSE', label: 'CSE Block Main Entrance', lastSeenAt: null },
  { id: 'AIML-FOYER-DISPLAY', departmentId: 'AIML', label: 'AIML Lab Foyer Screen', lastSeenAt: null },
  { id: 'MECH-HALL-DISPLAY', departmentId: 'MECH', label: 'Mechanical Workshop Hall', lastSeenAt: null },
  { id: 'CIVIL-DEPT-DISPLAY', departmentId: 'CIVIL', label: 'Civil Dept Corridor', lastSeenAt: null },
  { id: 'EEE-POWER-DISPLAY', departmentId: 'EEE', label: 'EEE Power Lab Screen', lastSeenAt: null },
];

const DEPARTMENTS_LIST = [
  { code: 'ECE', name: 'Electronics & Communication', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  { code: 'CSE', name: 'Computer Science & Engineering', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  { code: 'AIML', name: 'AI & Machine Learning', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  { code: 'MECH', name: 'Mechanical Engineering', color: '#EA580C', bg: '#FFF7ED', border: '#FFEDD5' },
  { code: 'CIVIL', name: 'Civil Engineering', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  { code: 'EEE', name: 'Electrical & Electronics', color: '#CA8A04', bg: '#FEFCE8', border: '#FEF08A' },
];

export default function UsersPage() {
  const [screens, setScreens] = useState<Screen[]>(REGISTERED_SCREENS);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [users, setUsers] = useState<User[]>(SEED_FACULTY_ROSTER);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sidebarLogoError, setSidebarLogoError] = useState(false);
  const [currentAuthUser, setCurrentAuthUser] = useState<User | null>(null);

  // ALLOT DEPARTMENTS & ACCESS MODAL STATE
  const [allotModalUser, setAllotModalUser] = useState<User | null>(null);
  const [allotSelectedDepts, setAllotSelectedDepts] = useState<string[]>([]);
  const [allotSelectedRole, setAllotSelectedRole] = useState<'faculty' | 'hod' | 'super_admin'>('faculty');
  const [allotSelectedStatus, setAllotSelectedStatus] = useState<'active' | 'suspended' | 'pending'>('active');
  const [allotHodDept, setAllotHodDept] = useState<string>('ECE');

  // QUICK ASSIGN HOD MODAL STATE
  const [showAssignHodModal, setShowAssignHodModal] = useState(false);
  const [hodModalTargetDept, setHodModalTargetDept] = useState<string>('ECE');
  const [hodModalSelectedUserId, setHodModalSelectedUserId] = useState<string>('');

  // ADD FACULTY MODAL STATE
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fRole, setFRole] = useState<'faculty' | 'hod' | 'super_admin'>('faculty');
  const [fDepts, setFDepts] = useState<string[]>(['ECE']);

  // EMERGENCY MODAL STATE
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [modalPin, setModalPin] = useState('');
  const [modalText, setModalText] = useState('');
  const [modalDept, setModalDept] = useState('ALL');

  // Load persisted state & subscribe to Firestore
  useEffect(() => {
    setCurrentAuthUser(getStoredAuthUser());

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

    const unsubNotices = subscribeToAdminNotices((liveNotices) => {
      setNotices(liveNotices);
      try {
        localStorage.setItem('campuscast_notices', JSON.stringify(liveNotices));
      } catch {
        // ignore
      }
    });

    const unsubUsers = subscribeToUsers((liveUsers) => {
      if (liveUsers && liveUsers.length > 0) {
        setUsers(liveUsers);
        try {
          localStorage.setItem('campuscast_users', JSON.stringify(liveUsers));
        } catch {
          // ignore
        }
      }
    });

    const unsubDepts = subscribeToDepartments((liveDepts) => {
      if (liveDepts && liveDepts.length > 0) {
        setDepartments(liveDepts);
      }
    });

    return () => {
      unsubNotices();
      unsubUsers();
      unsubDepts();
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

  // Open Allotment Modal for a specific faculty member
  const handleOpenAllotModal = (user: User) => {
    setAllotModalUser(user);
    setAllotSelectedDepts(user.departments && user.departments.length > 0 ? [...user.departments] : (user.requestedDepartment ? [user.requestedDepartment] : ['ECE']));
    setAllotSelectedRole(user.role || 'faculty');
    setAllotSelectedStatus(user.status || 'active');
    setAllotHodDept(user.departments?.[0] || user.requestedDepartment || 'ECE');
  };

  const toggleDeptInAllot = (deptCode: string) => {
    setAllotSelectedDepts((prev) =>
      prev.includes(deptCode) ? prev.filter((d) => d !== deptCode) : [...prev, deptCode]
    );
  };

  const handleSelectAllDepts = () => {
    setAllotSelectedDepts(DEPARTMENTS_LIST.map((d) => d.code));
  };

  const handleClearAllDepts = () => {
    setAllotSelectedDepts([]);
  };

  // Commit Department Allotment & Role Update by Super Admin
  const handleSaveAllotmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allotModalUser) return;

    let finalDepartments = [...allotSelectedDepts];
    if (allotSelectedRole === 'super_admin') {
      finalDepartments = DEPARTMENTS_LIST.map((d) => d.code);
    } else if (allotSelectedRole === 'hod' && !finalDepartments.includes(allotHodDept)) {
      finalDepartments.push(allotHodDept);
    }

    if (finalDepartments.length === 0) {
      alert('Please allot at least one department for this faculty member.');
      return;
    }

    const updatedUser: User = {
      ...allotModalUser,
      departments: finalDepartments,
      role: allotSelectedRole,
      status: allotSelectedStatus,
    };

    const updatedUsersList = users.map((u) => (u.id === allotModalUser.id ? updatedUser : u));
    setUsers(updatedUsersList);
    try {
      localStorage.setItem('campuscast_users', JSON.stringify(updatedUsersList));
    } catch {
      // ignore
    }

    await saveUserToFirestore(updatedUser);

    // If assigned as HOD, update department record
    if (allotSelectedRole === 'hod') {
      await saveDepartmentToFirestore({
        id: allotHodDept,
        code: allotHodDept,
        name: DEPARTMENTS_LIST.find((d) => d.code === allotHodDept)?.name || `${allotHodDept} Department`,
        screens: [`${allotHodDept}-MAIN-DISPLAY`],
        hodUserId: updatedUser.id,
        hodName: updatedUser.name,
      });
    }

    // Write audit trail entry
    const auditLog: AuditLog = {
      id: `aud-allot-${Date.now()}`,
      type: 'edit',
      actorPhone: currentAuthUser?.email || 'Super Admin',
      detail: {
        action: 'Super Admin Department Allotment & Role Update',
        targetFaculty: updatedUser.name,
        email: updatedUser.email,
        allottedDepartments: finalDepartments,
        role: updatedUser.role,
        status: updatedUser.status,
      },
      timestamp: Date.now(),
    };
    await saveAuditToFirestore(auditLog);

    setAllotModalUser(null);
  };

  // Open Quick HOD Assignment Modal for a department
  const handleOpenAssignHodForDept = (deptCode: string) => {
    setHodModalTargetDept(deptCode);
    const existingHod = users.find((u) => u.role === 'hod' && u.departments?.includes(deptCode));
    setHodModalSelectedUserId(existingHod ? existingHod.id : (users[0]?.id || ''));
    setShowAssignHodModal(true);
  };

  // Commit Quick HOD Assignment
  const handleSaveQuickHodAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find((u) => u.id === hodModalSelectedUserId);
    if (!targetUser) return;

    // Ensure target dept is in their departments
    const currentDepts = targetUser.departments || [];
    const newDepts = currentDepts.includes(hodModalTargetDept)
      ? currentDepts
      : [...currentDepts, hodModalTargetDept];

    const updatedUser: User = {
      ...targetUser,
      role: 'hod',
      departments: newDepts,
      status: 'active',
    };

    const updatedList = users.map((u) => (u.id === targetUser.id ? updatedUser : u));
    setUsers(updatedList);
    try {
      localStorage.setItem('campuscast_users', JSON.stringify(updatedList));
    } catch {
      // ignore
    }

    await saveUserToFirestore(updatedUser);

    await saveDepartmentToFirestore({
      id: hodModalTargetDept,
      code: hodModalTargetDept,
      name: DEPARTMENTS_LIST.find((d) => d.code === hodModalTargetDept)?.name || `${hodModalTargetDept} Department`,
      screens: [`${hodModalTargetDept}-MAIN-DISPLAY`],
      hodUserId: updatedUser.id,
      hodName: updatedUser.name,
    });

    const auditLog: AuditLog = {
      id: `aud-hod-${Date.now()}`,
      type: 'edit',
      actorPhone: currentAuthUser?.email || 'Super Admin',
      detail: {
        action: 'Designated Department HOD',
        department: hodModalTargetDept,
        appointedHOD: updatedUser.name,
        email: updatedUser.email,
      },
      timestamp: Date.now(),
    };
    await saveAuditToFirestore(auditLog);

    setShowAssignHodModal(false);
  };

  // Add Faculty by Super Admin
  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName || !fPhone) return;

    const formattedPhone = fPhone.startsWith('+') ? fPhone : `+${fPhone}`;
    let finalEmail = fEmail.trim().toLowerCase();
    if (!finalEmail) {
      const slug = fName.toLowerCase().replace(/[^a-z0-9]/g, '.');
      finalEmail = `${slug}@mit.asia`;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: fName,
      email: finalEmail,
      phone: formattedPhone,
      role: fRole,
      departments: fRole === 'super_admin' ? DEPARTMENTS_LIST.map((d) => d.code) : fDepts,
      status: 'active',
      registeredAt: Date.now(),
    };

    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    try {
      localStorage.setItem('campuscast_users', JSON.stringify(updatedUsers));
    } catch {
      // ignore
    }

    await saveUserToFirestore(newUser);

    setFName('');
    setFEmail('');
    setFPhone('');
    setFDepts(['ECE']);
    setShowAddFacultyModal(false);
  };

  const toggleUserStatus = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    const nextStatus = targetUser.status === 'active' ? ('suspended' as const) : ('active' as const);
    const updatedUser: User = { ...targetUser, status: nextStatus };

    const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u));
    setUsers(updatedUsers);
    try {
      localStorage.setItem('campuscast_users', JSON.stringify(updatedUsers));
    } catch {
      // ignore
    }

    await saveUserToFirestore(updatedUser);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove faculty member "${userName}" from the roster?`)) return;

    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    try {
      localStorage.setItem('campuscast_users', JSON.stringify(updated));
    } catch {
      // ignore
    }

    await deleteUserFromFirestore(userId);
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
      actorPhone: currentAuthUser?.email || 'Super Admin',
      detail: { scope: modalDept, text: modalText },
      timestamp: Date.now(),
    };
    await saveAuditToFirestore(logEntry);

    setShowEmergencyModal(false);
    setModalPin('');
    setModalText('');
  };

  // Find users awaiting department allotment (pending status or 0 allotted depts)
  const pendingUsers = users.filter(
    (u) => u.status === 'pending' || !u.departments || u.departments.length === 0
  );

  return (
    <div className="flex h-screen bg-[#F3F4F6] text-[#111111] font-sans antialiased overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-[280px] bg-white border-r border-[#E5E7EB] flex flex-col justify-between p-6 shrink-0 shadow-sm z-10">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2">
            {!sidebarLogoError ? (
              <img
                src="/mit-logo.png"
                alt="MIT Logo"
                className="w-10 h-10 object-contain rounded-xl shadow-sm"
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
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25"
            >
              <div className="flex items-center gap-3">
                <UsersIcon className="w-4 h-4" />
                <span>Faculty & Access</span>
              </div>
              <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold">
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
              Faculty Roster & Department Allotment
            </h2>
            <span className="text-xs font-medium text-[#64748B]">Super Admin Access Control & HOD Designation Console</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddFacultyModal(true)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-[#2563EB]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty Member</span>
            </button>

            <div className="h-6 w-[1px] bg-[#E5E7EB]" />

            {/* Authenticated Super Admin Badge */}
            <Link
              href="/login"
              className="flex items-center gap-2.5 text-xs font-semibold bg-[#F8FAFC] hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-[#334155] transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
              <div className="text-left">
                <span className="block font-bold text-[#111111]">
                  Super Admin Control
                </span>
                <span className="block text-[10px] text-slate-500 font-mono">
                  {currentAuthUser?.email || 'principal@mit.asia'} • Switch
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* SECTION 1: HOD EXECUTIVE ROSTER BOARD */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-[#111111]">
                  Department HOD Leadership Board
                </h3>
              </div>
              <span className="text-xs text-[#64748B]">
                Assigned department leaders with administrative notice authorization
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {DEPARTMENTS_LIST.map((dept) => {
                const assignedHod = users.find(
                  (u) => u.role === 'hod' && u.departments?.includes(dept.code)
                );
                return (
                  <div
                    key={dept.code}
                    className="p-3.5 rounded-xl border flex flex-col justify-between transition-all"
                    style={{ backgroundColor: dept.bg, borderColor: dept.border }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="text-xs font-black px-2 py-0.5 rounded uppercase"
                          style={{ color: dept.color, backgroundColor: 'white' }}
                        >
                          {dept.code}
                        </span>
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <p className="text-xs font-bold text-[#111111] line-clamp-1">
                        {assignedHod ? assignedHod.name : 'No HOD Assigned'}
                      </p>
                      <p className="text-[10px] text-[#64748B] font-mono truncate mt-0.5">
                        {assignedHod ? assignedHod.email || assignedHod.phone : 'Pending designation'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenAssignHodForDept(dept.code)}
                      className="mt-3 w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-white transition-all shadow-sm flex items-center justify-center gap-1"
                      style={{ backgroundColor: dept.color }}
                    >
                      <span>{assignedHod ? 'Change HOD' : 'Appoint HOD'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: PENDING SELF-REGISTERED FACULTY PROFILES (Awaiting Allotment) */}
          {pendingUsers.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-amber-800">
                <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                <div>
                  <h4 className="text-sm font-black">
                    {pendingUsers.length} Faculty Profile(s) Awaiting Super Admin Department Allotment
                  </h4>
                  <p className="text-xs text-amber-700">
                    These faculty members registered using their @mit.asia Gmail account. Review and allot their department publishing permissions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {pendingUsers.map((pUser) => (
                  <div
                    key={pUser.id}
                    className="bg-white border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#111111] truncate">{pUser.name}</p>
                      <p className="text-[11px] text-[#64748B] font-mono truncate">{pUser.email || pUser.phone}</p>
                      <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                        Requested: {pUser.requestedDepartment || 'General Faculty'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenAllotModal(pUser)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0 shadow-sm"
                    >
                      Allot Scope
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: COMPLETE FACULTY ROSTER TABLE */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  Authorized Institutional Faculty Roster
                </h3>
                <p className="text-xs text-[#64748B]">
                  Configured publishing scopes across physical corridor screens
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  Total: {users.length} Faculty
                </span>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#475569] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Faculty Member</th>
                  <th className="px-6 py-4">Institutional Gmail (@mit.asia)</th>
                  <th className="px-6 py-4">Role Hierarchy</th>
                  <th className="px-6 py-4">Allotted Department Scope</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#64748B]">
                      No faculty registered yet. Click &quot;Add Faculty Member&quot; to authorize a sender!
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#111111]">{u.name}</div>
                        <div className="text-[11px] font-mono text-[#64748B]">{u.phone}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-mono font-semibold text-blue-600 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          <span>{u.email || 'Not Configured'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {u.role === 'super_admin' ? (
                          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] uppercase border border-purple-200 flex items-center gap-1 w-fit">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Super Admin</span>
                          </span>
                        ) : u.role === 'hod' ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] uppercase border border-amber-200 flex items-center gap-1 w-fit">
                            <Crown className="w-3 h-3 text-amber-600" />
                            <span>Head of Dept</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#2563EB] font-bold text-[10px] uppercase border border-blue-200 w-fit">
                            Faculty
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {u.departments && u.departments.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {u.departments.map((d) => (
                              <span
                                key={d}
                                className="px-2 py-0.5 rounded font-black text-[10px] border uppercase"
                                style={{
                                  backgroundColor: DEPARTMENTS_LIST.find((dp) => dp.code === d)?.bg || '#EFF6FF',
                                  color: DEPARTMENTS_LIST.find((dp) => dp.code === d)?.color || '#2563EB',
                                  borderColor: DEPARTMENTS_LIST.find((dp) => dp.code === d)?.border || '#BFDBFE',
                                }}
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-amber-600 font-bold text-[11px]">
                            Unallotted (Pending Super Admin)
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${u.status === 'active'
                              ? 'bg-emerald-100 text-[#22C55E]'
                              : u.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-600'
                            }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenAllotModal(u)}
                            className="bg-blue-50 hover:bg-blue-100 text-[#2563EB] px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1"
                            title="Allot Departments & Role"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Allot Access</span>
                          </button>

                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-colors ${u.status === 'active'
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                          >
                            {u.status === 'active' ? 'Revoke' : 'Restore'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition-colors"
                            title="Remove User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* MODAL 1: SUPER ADMIN ALLOT DEPARTMENTS & ACCESS MODAL */}
      {allotModalUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-[#111111]">
                  Allot Department Scope & Access Control
                </h3>
                <p className="text-xs text-[#64748B]">
                  Configure publishing rights for {allotModalUser.name}
                </p>
              </div>
              <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded text-slate-600">
                {allotModalUser.email || allotModalUser.phone}
              </span>
            </div>

            <form onSubmit={handleSaveAllotmentSubmit} className="space-y-4">
              {/* Role Selector */}
              <div>
                <label className="block text-[#111111] font-bold mb-1.5 uppercase tracking-wider">
                  Administrative Privilege Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAllotSelectedRole('faculty')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${allotSelectedRole === 'faculty'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    Faculty Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllotSelectedRole('hod')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${allotSelectedRole === 'hod'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Head of Dept</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllotSelectedRole('super_admin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${allotSelectedRole === 'super_admin'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    Super Admin
                  </button>
                </div>
              </div>

              {/* If HOD: Select primary department they lead */}
              {allotSelectedRole === 'hod' && (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-1.5">
                  <label className="block text-amber-900 font-bold uppercase text-[11px]">
                    Designated Department for HOD Leadership:
                  </label>
                  <select
                    value={allotHodDept}
                    onChange={(e) => setAllotHodDept(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-950"
                  >
                    {DEPARTMENTS_LIST.map((dept) => (
                      <option key={dept.code} value={dept.code}>
                        {dept.code} — {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Department Allotment Checkboxes */}
              {allotSelectedRole !== 'super_admin' ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[#111111] font-bold uppercase tracking-wider">
                      Allot Department Screens
                    </label>
                    <div className="flex gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={handleSelectAllDepts}
                        className="text-blue-600 hover:underline font-bold"
                      >
                        Select All
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={handleClearAllDepts}
                        className="text-slate-500 hover:underline font-bold"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {DEPARTMENTS_LIST.map((dept) => {
                      const isSelected = allotSelectedDepts.includes(dept.code);
                      return (
                        <button
                          key={dept.code}
                          type="button"
                          onClick={() => toggleDeptInAllot(dept.code)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${isSelected
                              ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                              : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                          <div>
                            <span className="font-black text-xs block">{dept.code}</span>
                            <span className="text-[10px] text-slate-500 truncate block">
                              {dept.name}
                            </span>
                          </div>
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center text-white ${isSelected ? 'bg-blue-600' : 'border border-slate-300'
                              }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-800 text-xs font-semibold">
                  Super Admin accounts are automatically granted universal publishing and override authority across all 6 campus departments.
                </div>
              )}

              {/* Status Selector */}
              <div>
                <label className="block text-[#111111] font-bold mb-1.5 uppercase tracking-wider">
                  Account Activation Status
                </label>
                <div className="flex gap-2">
                  {(['active', 'pending', 'suspended'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAllotSelectedStatus(st)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold uppercase transition-all ${allotSelectedStatus === st
                          ? st === 'active'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : st === 'pending'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-red-600 text-white border-red-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setAllotModalUser(null)}
                  className="flex-1 bg-[#F8FAFC] hover:bg-slate-100 text-[#64748B] py-2.5 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 rounded-xl font-bold shadow-md shadow-[#2563EB]/20 transition-colors"
                >
                  Save Access Allotment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK ASSIGN HOD MODAL */}
      {showAssignHodModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-2.5 text-amber-600">
              <Crown className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-black text-[#111111]">
                  Appoint Head of Department (HOD)
                </h3>
                <p className="text-xs text-[#64748B]">
                  Designating HOD for {hodModalTargetDept} Department
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveQuickHodAssignment} className="space-y-4">
              <div>
                <label className="block text-[#111111] font-bold mb-1.5 uppercase">
                  Select Faculty Member
                </label>
                <select
                  value={hodModalSelectedUserId}
                  onChange={(e) => setHodModalSelectedUserId(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-[#111111] font-semibold"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email || u.phone}) — Current Role: {u.role.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 leading-relaxed text-[11px]">
                Upon appointment, this faculty member will be granted executive HOD publishing authority for the <strong>{hodModalTargetDept}</strong> department screen.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignHodModal(false)}
                  className="flex-1 bg-[#F8FAFC] text-[#64748B] py-2.5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl font-bold shadow-md shadow-amber-600/20"
                >
                  Confirm HOD Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD FACULTY MEMBER MODAL */}
      {showAddFacultyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="text-xl font-bold text-[#111111]">Register Authorized Faculty</h3>
            <form onSubmit={handleAddFaculty} className="space-y-3.5">
              <div>
                <label className="block text-[#111111] font-bold mb-1">Faculty Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Sharma"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[#111111] font-bold mb-1">
                  Institutional Gmail (@mit.asia)
                </label>
                <input
                  type="email"
                  placeholder="ramesh.sharma@mit.asia"
                  value={fEmail}
                  onChange={(e) => setFEmail(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#111111] font-bold mb-1">WhatsApp Mobile Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+919876543210"
                  value={fPhone}
                  onChange={(e) => setFPhone(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#111111] font-bold mb-1">Role Hierarchy</label>
                <select
                  value={fRole}
                  onChange={(e) => setFRole(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111]"
                >
                  <option value="faculty">Faculty Member</option>
                  <option value="hod">Head of Department (HOD)</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {fRole !== 'super_admin' && (
                <div>
                  <label className="block text-[#111111] font-bold mb-1">Allot Initial Departments</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DEPARTMENTS_LIST.map((dept) => {
                      const isSel = fDepts.includes(dept.code);
                      return (
                        <button
                          key={dept.code}
                          type="button"
                          onClick={() =>
                            setFDepts((prev) =>
                              prev.includes(dept.code)
                                ? prev.filter((d) => d !== dept.code)
                                : [...prev, dept.code]
                            )
                          }
                          className={`py-1.5 px-2 rounded-lg border text-center font-bold text-xs ${isSel
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                        >
                          {dept.code}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFacultyModal(false)}
                  className="flex-1 bg-[#F8FAFC] text-[#64748B] py-2.5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-xl font-bold shadow-md shadow-[#2563EB]/20"
                >
                  Save Faculty Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EMERGENCY BROADCAST PIN MODAL */}
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
                <label className="block text-[#111111] font-bold mb-1">Emergency Announcement Body</label>
                <textarea
                  required
                  rows={3}
                  value={modalText}
                  onChange={(e) => setModalText(e.target.value)}
                  placeholder="Severe weather warning or campus emergency..."
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3 text-[#111111]"
                />
              </div>

              <div>
                <label className="block text-[#111111] font-bold mb-1">Master Emergency PIN</label>
                <input
                  type="password"
                  required
                  placeholder="Enter 4-digit PIN (default: 1234)"
                  value={modalPin}
                  onChange={(e) => setModalPin(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3 text-[#111111] font-mono tracking-widest text-center text-lg"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="flex-1 bg-[#F8FAFC] text-[#64748B] py-3 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#DC2626] hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-md shadow-red-600/20"
                >
                  Broadcast Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
