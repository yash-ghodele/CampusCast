/**
 * @file admin/src/app/login/page.tsx
 * @description CampusCast Faculty & Notice Sender Authentication Console (`/login`).
 * 
 * Enforces institutional Gmail authentication restricted to the `@mit.asia` domain.
 * Supports self-registration of faculty profiles where department scopes and administrative
 * privileges are subsequently reviewed, approved, and allotted by the Super Admin.
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  AuditLog,
} from '@campuscast/shared';
import {
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
  Radio,
  ExternalLink,
  Lock,
  UserPlus,
  LogIn,
  Phone,
  Clock,
} from 'lucide-react';
import {
  SEED_FACULTY_ROSTER,
  REQUIRED_FACULTY_DOMAIN,
  isValidMitAsiaEmail,
  verifySenderCredentialsByEmail,
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
  const [loginPin, setLoginPin] = useState('123456');
  const [showPin, setShowPin] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDept, setRegDept] = useState('ECE');

  // Shared state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successUser, setSuccessUser] = useState<User | null>(null);
  const [currentSessionUser, setCurrentSessionUser] = useState<User | null>(null);
  const [facultyRoster, setFacultyRoster] = useState<User[]>(SEED_FACULTY_ROSTER);

  // Load existing session and subscribe to Firestore faculty roster
  useEffect(() => {
    const existing = getStoredAuthUser();
    if (existing) {
      setCurrentSessionUser(existing);
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
    setLoading(true);

    try {
      const result = await verifySenderCredentialsByEmail(loginEmail, loginPin, facultyRoster);

      if (!result.success || !result.user) {
        setErrorMessage(result.error || 'Authentication failed. Please verify your @mit.asia Gmail credentials.');
        setLoading(false);
        return;
      }

      const verifiedUser = result.user;
      setStoredAuthUser(verifiedUser);
      setSuccessUser(verifiedUser);
      setCurrentSessionUser(verifiedUser);

      // Log successful portal authentication event to Firestore
      const loginLog: AuditLog = {
        id: `aud-login-${Date.now()}`,
        type: 'auth_login' as any,
        actorPhone: verifiedUser.phone || verifiedUser.email || 'Web Portal',
        detail: {
          action: 'Institutional Gmail Notice Sender Login',
          name: verifiedUser.name,
          email: verifiedUser.email,
          role: verifiedUser.role,
          departments: verifiedUser.departments,
          verifiedVia: 'Google @mit.asia Domain Auth',
        },
        timestamp: Date.now(),
      };
      await saveAuditToFirestore(loginLog);

      setTimeout(() => {
        router.push(redirectTarget);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected verification error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const result = await registerFacultyProfile(regName, regEmail, regPhone, regDept, facultyRoster);

      if (!result.success || !result.user) {
        setErrorMessage(result.error || 'Registration failed. Please check your details.');
        setLoading(false);
        return;
      }

      setSuccessMessage(
        `Profile registered for ${result.user.name} (${result.user.email})! Your account is pending Super Admin review. The Super Admin will allot your authorized department screens.`
      );
      setRegName('');
      setRegEmail('');
      setRegPhone('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelectFaculty = (faculty: User) => {
    setLoginEmail(faculty.email || '');
    setLoginPin('123456');
    setErrorMessage('');
    setSuccessMessage('');

    if (faculty.status === 'pending') {
      setErrorMessage(
        `Access Pending: Profile for ${faculty.name} is awaiting department access allotment by the Super Admin.`
      );
      return;
    }

    setStoredAuthUser(faculty);
    setSuccessUser(faculty);
    setCurrentSessionUser(faculty);

    const loginLog: AuditLog = {
      id: `aud-login-${Date.now()}`,
      type: 'auth_login' as any,
      actorPhone: faculty.phone || faculty.email || 'Web Portal',
      detail: {
        action: 'Quick-Verified Institutional Sender Session',
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        departments: faculty.departments,
        verifiedVia: '1-Click Faculty Demo Selection',
      },
      timestamp: Date.now(),
    };
    saveAuditToFirestore(loginLog);

    setTimeout(() => {
      router.push(redirectTarget);
    }, 800);
  };

  const handleLogoutCurrentSession = () => {
    clearStoredAuthUser();
    setCurrentSessionUser(null);
    setSuccessUser(null);
    setLoginEmail('');
    setLoginPin('123456');
  };

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 font-black text-white text-lg">
            CC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white">CampusCast</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                @mit.asia Auth
              </span>
            </div>
            <p className="text-xs text-slate-400">Mahakal Institute of Technology & Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/display/all"
            target="_blank"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-800/40"
          >
            <span>Live Display Kiosk</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Institutional Gmail Sign-In / Registration */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-7 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Institutional Domain: @mit.asia</span>
                </div>

                <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === 'login'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
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
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === 'register'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Profile</span>
                  </button>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
                {activeTab === 'login' ? 'Faculty Sign-In' : 'Create Faculty Profile'}
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mb-6">
                {activeTab === 'login'
                  ? 'Sign in using your institutional Gmail address ending in @mit.asia to compose and broadcast official campus notices.'
                  : 'Register your institutional @mit.asia profile. The Super Admin will review your profile and allot your departmental publishing permissions.'}
              </p>

              {/* Active Session Notice if logged in */}
              {currentSessionUser && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-300">
                        Logged in as {currentSessionUser.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {currentSessionUser.email || currentSessionUser.phone} • Scopes: [{currentSessionUser.departments.join(', ') || 'No Allotted Depts'}] • Role: {currentSessionUser.role.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => router.push(redirectTarget)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      Enter Portal
                    </button>
                    <button
                      onClick={handleLogoutCurrentSession}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}

              {/* Success Notification */}
              {successUser && (
                <div className="mb-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-3 animate-pulse">
                  <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
                  <p className="text-xs font-bold text-blue-200">
                    Verified as {successUser.name} ({successUser.email})! Opening Management Portal...
                  </p>
                </div>
              )}

              {/* Registration Success Banner */}
              {successMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-300">Registration Successful</p>
                    <p className="mt-0.5 text-slate-300 leading-relaxed">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-200">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-red-300">Notice Sender Verification Error</p>
                    <p className="mt-0.5 text-slate-300 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* TAB 1: SIGN IN FORM */}
              {activeTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Institutional Gmail Account
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="yourname.dept@mit.asia"
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Must be an official institutional email ending with <code className="text-blue-400 font-bold">@mit.asia</code>.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Security Verification PIN
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={loginPin}
                        onChange={(e) => setLoginPin(e.target.value)}
                        placeholder="Enter 6-digit PIN (default: 123456)"
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Default security verification PIN: <code className="text-blue-400 font-bold">123456</code>.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Verifying @mit.asia Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In with @mit.asia Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* TAB 2: SELF REGISTRATION FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                      Faculty Full Name
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Dr. Priya Patel"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                      Institutional Gmail Address (@mit.asia)
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. priya.patel@mit.asia"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Must end with <code className="text-blue-400 font-bold">@mit.asia</code>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                        WhatsApp Mobile Number
                      </label>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43214"
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                        Primary Department
                      </label>
                      <select
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold"
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

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                    <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Access Control Policy: Registered profiles require Super Admin department allotment before notices can be broadcasted.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Submitting Profile...</span>
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

            <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live MIT.ASIA Domain Gateway</span>
              </span>
              <Link href="/users" className="hover:text-blue-400 transition-colors">
                Super Admin Access Hub →
              </Link>
            </div>
          </div>

          {/* Right Column: 1-Click Fast Faculty Verification Profiles */}
          <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-7 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Authorized Faculty Quick-Login</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {facultyRoster.length} Accounts
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Click any pre-authorized institutional faculty profile to sign in instantly:
              </p>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {facultyRoster.map((faculty) => (
                  <button
                    key={faculty.id}
                    onClick={() => handleQuickSelectFaculty(faculty)}
                    className="w-full text-left p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 transition-all group flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                          {faculty.name}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            faculty.role === 'super_admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : faculty.role === 'hod'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {faculty.role.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                        <span className="text-blue-300 truncate font-semibold">
                          {faculty.email || faculty.phone}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {faculty.status === 'pending' ? (
                          <span className="text-amber-400 font-bold">Pending Super Admin Allotment</span>
                        ) : (
                          <span>Scopes: {faculty.departments.join(', ') || 'Unallotted'}</span>
                        )}
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-700 group-hover:bg-blue-600 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors shrink-0">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-500 space-y-1.5">
              <p className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Super Admin Allotment Policy Enforced</span>
              </p>
              <p>
                Notices broadcasted through the portal will bear the verified sender&apos;s @mit.asia credentials and department authorization.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-900/40 px-6 py-4 text-center text-xs text-slate-500 z-10">
        © 2026 CampusCast Signage Network • Centralized Verification Gateway • Ujjain, MP
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white text-sm">Loading Authentication Console...</div>}>
      <LoginContent />
    </Suspense>
  );
}
