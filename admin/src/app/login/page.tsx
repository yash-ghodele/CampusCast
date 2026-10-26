/**
 * @file admin/src/app/login/page.tsx
 * @description CampusCast Enterprise Institutional Authentication Portal (/login).
 * 
 * Features a modern split-screen enterprise layout, institutional domain validation (@mit.asia),
 * Firebase Authentication Email/Password sign-in, self-registration with Super Admin approval workflow,
 * and quick-authorization presets for authorized faculty and system leads.
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, AuditLog } from '@campuscast/shared';
import {
  Radio,
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  Building2,
  AlertCircle,
  CheckCircle2,
  Users,
  Eye,
  EyeOff,
  ExternalLink,
  Lock,
  UserPlus,
  LogIn,
  Phone,
  Clock,
  LayoutDashboard,
  Tv,
  Crown,
  ShieldAlert,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import {
  SEED_FACULTY_ROSTER,
  REQUIRED_FACULTY_DOMAIN,
  SUPER_ADMIN_EMAILS,
  isValidMitAsiaEmail,
  isSuperAdminUser,
  loginWithEmailPasswordFirebaseAuth,
  registerFacultyProfile,
  setStoredAuthUser,
  getStoredAuthUser,
  clearStoredAuthUser,
} from '@/lib/auth';
import {
  subscribeToUsers,
  saveAuditToFirestore,
} from '@/lib/firebase';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/notices';

  // Mode: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regDept, setRegDept] = useState('ECE');

  // Shared state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedQuickId, setSelectedQuickId] = useState<string>('');
  const [currentSessionUser, setCurrentSessionUser] = useState<User | null>(null);
  const [facultyRoster, setFacultyRoster] = useState<User[]>(SEED_FACULTY_ROSTER);

  // Load existing session and subscribe to Firestore faculty roster
  useEffect(() => {
    const existing = getStoredAuthUser();
    if (existing) {
      setCurrentSessionUser(existing);
      setLoginEmail(existing.email || '');
      setLoginPassword(existing.password || 'MitAsia@admin2026');
    }

    const unsubscribe = subscribeToUsers((liveUsers) => {
      if (liveUsers && liveUsers.length > 0) {
        setFacultyRoster(liveUsers);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedEmail = loginEmail.trim().toLowerCase();

    // 1. Validate institutional domain
    if (!isValidMitAsiaEmail(trimmedEmail)) {
      setErrorMessage(
        `Access restricted. Institutional credentials must end with "${REQUIRED_FACULTY_DOMAIN}" (e.g. yourname.dept@mit.asia). Commercial email addresses are prohibited.`
      );
      return;
    }

    if (!loginPassword) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      // 2. Authenticate via Firebase Auth Email/Password
      const result = await loginWithEmailPasswordFirebaseAuth(trimmedEmail, loginPassword, facultyRoster);

      if (!result.success || !result.user) {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
        setLoading(false);
        return;
      }

      const authenticatedUser = result.user;

      // 3. Set persistent authenticated session
      setStoredAuthUser(authenticatedUser);
      setCurrentSessionUser(authenticatedUser);
      setSuccessMessage(`Welcome back, ${authenticatedUser.name}! Directing to command console...`);

      // 4. Redirect to destination
      setTimeout(() => {
        router.push(redirectTarget);
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedEmail = regEmail.trim().toLowerCase();

    if (!isValidMitAsiaEmail(trimmedEmail)) {
      setErrorMessage(`Registration requires an official institutional email ending with "${REQUIRED_FACULTY_DOMAIN}".`);
      return;
    }

    if (!regName.trim() || !regPhone.trim()) {
      setErrorMessage('Please complete all profile fields including your official name and contact number.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await registerFacultyProfile(
        {
          name: regName.trim(),
          email: trimmedEmail,
          password: regPassword,
          phone: regPhone.trim(),
          requestedDepartment: regDept,
        },
        facultyRoster
      );

      if (!result.success || !result.user) {
        setErrorMessage(result.error || 'Profile registration failed.');
        setLoading(false);
        return;
      }

      const newUser = result.user;
      setSuccessMessage(
        `Profile created for ${newUser.name} (${newUser.email}). Account credentials have been registered in Firebase Auth. Your account is pending Super Admin department allotment.`
      );

      // Reset register inputs
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegPhone('');

      // Switch to sign-in tab with prefilled credentials
      setLoginEmail(newUser.email || '');
      setLoginPassword(regPassword);
      setActiveTab('login');
    } catch (err: any) {
      setErrorMessage(err.message || 'Profile registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelectFaculty = (faculty: User) => {
    setSelectedQuickId(faculty.id);
    const pwd = faculty.password || 'MitAsia@admin2026';
    setLoginEmail(faculty.email || faculty.phone);
    setLoginPassword(pwd);
    setStoredAuthUser(faculty);
    setCurrentSessionUser(faculty);

    const loginLog: AuditLog = {
      id: `audit-quick-${Date.now()}`,
      type: 'auth_login' as any,
      actorPhone: faculty.email || faculty.phone,
      detail: {
        action: 'quick_select_login',
        actorName: faculty.name,
        domain: REQUIRED_FACULTY_DOMAIN,
        departments: faculty.departments,
        role: faculty.role,
      },
      timestamp: Date.now(),
    };
    saveAuditToFirestore(loginLog);

    setTimeout(() => {
      router.push(redirectTarget);
    }, 500);
  };

  const handleLogoutCurrentSession = () => {
    clearStoredAuthUser();
    setCurrentSessionUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setSelectedQuickId('');
  };

  // Sort roster: Super Admins first (Yash Ghodele leading), then HODs, then Faculty
  const sortedRoster = [...facultyRoster].sort((a, b) => {
    const isYashA = a.email?.includes('yash') || a.phone === '+917666168561';
    const isYashB = b.email?.includes('yash') || b.phone === '+917666168561';
    if (isYashA && !isYashB) return -1;
    if (isYashB && !isYashA) return 1;
    if (a.role === 'super_admin' && b.role !== 'super_admin') return -1;
    if (b.role === 'super_admin' && a.role !== 'super_admin') return 1;
    if (a.role === 'hod' && b.role !== 'hod') return -1;
    if (b.role === 'hod' && a.role !== 'hod') return 1;
    return 0;
  });

  return (
    <div className="min-h-screen w-full bg-[#0F172A] flex flex-col justify-between font-sans antialiased text-[#0F172A]">
      {/* Top Navigation Bar */}
      <header className="h-[70px] bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white/95 flex items-center justify-center p-1.5 shadow-md border border-white/20">
            <img
              src="/logo-icon-transparent.png"
              alt="CampusCast Icon"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-white">CampusCast</span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Production Auth
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              MIT Group of Institutions, Ujjain
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/display"
            target="_blank"
            className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700/60"
          >
            <Tv className="w-3.5 h-3.5 text-blue-400" />
            <span>Live Display Kiosks</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <Link
            href="/"
            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-1.5 px-4 py-2 rounded-xl shadow-lg shadow-blue-600/30"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-7 items-stretch">
          
          {/* Left Column: Brand Hero & Institutional Network Showcase */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900/95 to-blue-950/80 border border-slate-800 rounded-3xl p-7 lg:p-9 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white">
            {/* Luminous Glow Backdrop */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Brand Logo & Institution Header */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Restricted Access: @mit.asia Domain</span>
                </div>

                <div className="pt-1">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl px-5 py-3 w-fit shadow-xl border border-white/20 inline-flex items-center gap-3">
                    <img
                      src="/logo-icon-transparent.png"
                      alt="CampusCast Logo"
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                        CampusCast
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                        MIT Group of Institutions
                      </span>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight text-white">
                  Digital Notice & Display Broadcasting System
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Centralized administrative gateway for authorized faculty and department heads across MIT College of Engineering. Schedule broadcasts, dispatch urgent overrides, and allot screen scopes in real time.
                </p>
              </div>

              {/* Core System Highlights */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <Radio className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Sub-Second Display Synchronization</h4>
                    <p className="text-[11px] text-slate-400">Notices published here update corridor displays instantly via Server-Sent Events.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Multi-Tier Role Governance</h4>
                    <p className="text-[11px] text-slate-400">Strict separation of Super Admin, Department HODs, and Faculty publishing rights.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">PIN-Protected Urgent Override</h4>
                    <p className="text-[11px] text-slate-400">Dedicated security PIN pipeline for campus-wide emergency broadcast takeovers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Campus Screens Status Pill */}
            <div className="relative z-10 pt-6 mt-6 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Physical Kiosks Online: 6 / 6 Active</span>
                </span>
                <span className="text-[11px] font-mono text-blue-400 font-bold uppercase">
                  Connected
                </span>
              </div>

              <div className="flex gap-1.5 flex-wrap text-[10px] font-bold font-mono">
                {['ECE', 'CSE', 'AIML', 'MECH', 'CIVIL', 'EEE'].map((code) => (
                  <span
                    key={code}
                    className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300"
                  >
                    {code} Display
                  </span>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-slate-400 font-mono">
                Super Admin Lead: <strong className="text-white">Yash Ghodele</strong> (+91 7666168561)
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Form & Quick-Login Tray */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-7 lg:p-8 shadow-2xl flex flex-col justify-between border border-slate-200">
            <div>
              {/* Header Tab Switcher */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {activeTab === 'login' ? 'Faculty Sign-In' : 'Register Profile'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeTab === 'login'
                      ? 'Sign in with your @mit.asia institutional email and password.'
                      : 'Create an institutional profile awaiting Super Admin scope allotment.'}
                  </p>
                </div>

                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === 'login'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === 'register'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </button>
                </div>
              </div>

              {/* Active Session Banner */}
              {currentSessionUser && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        Signed in as {currentSessionUser.name}
                      </p>
                      <p className="text-[11px] text-emerald-800 font-mono mt-0.5">
                        {currentSessionUser.email} • Role: {currentSessionUser.role.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(redirectTarget)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      Enter Console
                    </button>
                    <button
                      type="button"
                      onClick={handleLogoutCurrentSession}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors"
                    >
                      Switch
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{successMessage}</span>
                </div>
              )}

              {/* TAB 1: LOGIN FORM */}
              {activeTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Institutional Email Address (@mit.asia)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="yash.ghodele@mit.asia or principal@mit.asia"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-mono"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Must be an authorized institutional email ending with <strong>{REQUIRED_FACULTY_DOMAIN}</strong>.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Account Password
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Standard / Seed Key
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl text-xs transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Verifying Firebase Auth Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In with Email & Password</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* TAB 2: REGISTER PROFILE FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                        Official Full Name
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Dr. Rajesh Sharma"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                        Institutional Email (@mit.asia)
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name.dept@mit.asia"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                        Password (Min. 6 chars)
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Create password"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 pr-9 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                        Confirm Password
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                        WhatsApp Mobile Number
                      </label>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                        Primary Department
                      </label>
                      <select
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                      >
                        <option value="ECE">ECE — Electronics & Comm.</option>
                        <option value="CSE">CSE — Computer Science</option>
                        <option value="AIML">AIML — AI & Machine Learning</option>
                        <option value="MECH">MECH — Mechanical Eng.</option>
                        <option value="CIVIL">CIVIL — Civil Engineering</option>
                        <option value="EEE">EEE — Electrical & Electronics</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Newly created profiles are registered in Firebase Auth and placed in pending status awaiting Super Admin department allotment.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Registering Firebase Auth Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Profile for Super Admin Approval</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Quick-Access Authorized Presets */}
            <div className="pt-6 mt-6 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>1-Click Authorized Faculty Presets</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {sortedRoster.length} Roster Accounts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[170px] overflow-y-auto pr-1">
                {sortedRoster.map((faculty) => {
                  const isSuper = faculty.role === 'super_admin';
                  const isHod = faculty.role === 'hod';
                  const isSelected = selectedQuickId === faculty.id;

                  return (
                    <button
                      key={faculty.id}
                      type="button"
                      onClick={() => handleQuickSelectFaculty(faculty)}
                      className={`text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 shadow-xs group ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
                          : isSuper
                          ? 'bg-purple-50/60 border-purple-200 hover:bg-purple-50'
                          : isHod
                          ? 'bg-amber-50/60 border-amber-200 hover:bg-amber-50'
                          : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {faculty.name}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                          {faculty.email || faculty.phone}
                        </p>
                      </div>

                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          isSuper
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : isHod
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {isSuper ? 'Super Admin' : isHod ? 'HOD' : 'Faculty'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-slate-600">Enterprise Firebase Auth Provider Active</span>
                </span>
                <Link
                  href="/users"
                  className="font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                >
                  <span>Super Admin Console</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-[50px] bg-slate-950 border-t border-slate-850 px-6 lg:px-12 flex items-center justify-between text-xs text-slate-400">
        <div>
          <span>CampusCast — Institutional Digital Signage Platform • MIT College of Engineering</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/audit" className="hover:text-slate-200 transition-colors">
            Audit Logs
          </Link>
          <span>•</span>
          <Link href="/settings" className="hover:text-slate-200 transition-colors">
            Settings
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-3 text-white">
          <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-400">Initializing Institutional Authentication Console...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
