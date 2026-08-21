'use client';

import React, { useState } from 'react';
import { User, Screen, Notice, AuditLog } from '@campuscast/shared';
import {
  Users,
  Tv,
  FileText,
  ShieldAlert,
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Copy,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

// Demo initial state for Admin management UI
const MOCK_USERS: User[] = [
  { id: 'usr-1', name: 'Dr. Sarah Sharma', phone: '+919876543210', role: 'hod', departments: ['ECE'], status: 'active' },
  { id: 'usr-2', name: 'Prof. Rajesh Kumar', phone: '+919876543211', role: 'faculty', departments: ['ECE', 'CSE'], status: 'active' },
  { id: 'usr-3', name: 'Dr. Amit Patel', phone: '+919876543212', role: 'faculty', departments: ['MECH'], status: 'suspended' },
];

const MOCK_SCREENS: Screen[] = [
  { id: 'ECE-MAIN-DISPLAY', departmentId: 'ECE', label: 'ECE Corridor Main Screen', lastSeenAt: Date.now() - 30000 },
  { id: 'CSE-LAB-DISPLAY', departmentId: 'CSE', label: 'CSE Lab 2 Display', lastSeenAt: Date.now() - 120000 },
  { id: 'MECH-HALL-DISPLAY', departmentId: 'MECH', label: 'Mechanical Block Foyer', lastSeenAt: Date.now() - 86400000 },
];

const MOCK_NOTICES: Notice[] = [
  {
    id: 'ntc-101',
    departmentId: 'ECE',
    content: '⚡ URGENT: Microprocessor Lab exam shifted to 2:30 PM.',
    mediaUrl: null,
    mediaType: null,
    priority: 'urgent',
    status: 'active',
    createdBy: '+919876543210',
    createdAt: Date.now() - 1000 * 60 * 20,
    scheduledAt: null,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24
  },
  {
    id: 'ntc-102',
    departmentId: 'CSE',
    content: 'Hackathon registration closes today at 5:00 PM.',
    mediaUrl: null,
    mediaType: null,
    priority: 'normal',
    status: 'active',
    createdBy: '+919876543211',
    createdAt: Date.now() - 1000 * 60 * 90,
    scheduledAt: null,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24
  }
];

const MOCK_AUDIT: AuditLog[] = [
  { id: 'aud-1', type: 'publish', actorPhone: '+919876543210', detail: { dept: 'ECE', noticeId: 'ntc-101' }, timestamp: Date.now() - 1000 * 60 * 20 },
  { id: 'aud-2', type: 'unauthorized_attempt', actorPhone: '+919999988888', detail: { reason: 'Number not in active roster', text: 'Free pizza in canteen' }, timestamp: Date.now() - 1000 * 60 * 45 },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'roster' | 'screens' | 'notices' | 'audit'>('roster');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [screens] = useState<Screen[]>(MOCK_SCREENS);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [auditLogs] = useState<AuditLog[]>(MOCK_AUDIT);
  const [searchQuery, setSearchQuery] = useState('');

  // Add User Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'super_admin' | 'hod' | 'faculty'>('faculty');
  const [newDepts, setNewDepts] = useState('ECE');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const formattedPhone = newPhone.startsWith('+') ? newPhone : `+${newPhone}`;
    const deptsArray = newDepts.split(',').map((s) => s.trim().toUpperCase());

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: newName,
      phone: formattedPhone,
      role: newRole,
      departments: deptsArray,
      status: 'active',
    };

    setUsers([newUser, ...users]);
    setNewName('');
    setNewPhone('');
    setShowAddModal(false);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
      )
    );
  };

  const expireNotice = (noticeId: string) => {
    setNotices(
      notices.map((n) => (n.id === noticeId ? { ...n, status: 'expired' } : n))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A]">
      {/* Top Admin Header */}
      <header className="bg-[#1E293B] border-b border-[#334155] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-black text-xl">
            CC
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CampusCast Admin Portal</h1>
            <p className="text-xs text-slate-400">Institutions Signage & Access Controller</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Normal
          </span>
          <span className="text-slate-400">Super Admin Mode</span>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="bg-[#1E293B]/50 border-b border-[#334155] px-8 flex gap-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'roster'
              ? 'border-blue-500 text-blue-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faculty Roster</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('screens')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'screens'
              ? 'border-blue-500 text-blue-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Displays & Screens</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300">
            {screens.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'notices'
              ? 'border-blue-500 text-blue-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Notice History</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300">
            {notices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-blue-500 text-blue-400 bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Security & Audit Log</span>
          <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Roster Tab */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Authorized Faculty Roster</h2>
                <p className="text-sm text-slate-400">
                  Manage WhatsApp phone numbers authorized to publish announcements.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Authorized Number</span>
              </button>
            </div>

            <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-[#334155]">
                  <tr>
                    <th className="px-6 py-4">Faculty Name</th>
                    <th className="px-6 py-4">WhatsApp Phone</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Department Scope</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-semibold text-white">{u.name}</td>
                      <td className="px-6 py-4 font-mono">{u.phone}</td>
                      <td className="px-6 py-4">
                        <span className="uppercase text-xs font-bold px-2.5 py-1 rounded bg-slate-700 text-slate-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {u.departments.map((d) => (
                            <span key={d} className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold px-2 py-0.5 rounded">
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-xs bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
                            u.status === 'active'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Screens Tab */}
        {activeTab === 'screens' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Department Screens Registry</h2>
              <p className="text-sm text-slate-400">
                Registered hardware displays and their real-time telemetry heartbeat status.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {screens.map((sc) => {
                const isOnline = Date.now() - (sc.lastSeenAt || 0) < 120000;
                return (
                  <div key={sc.id} className="bg-[#1E293B] border border-[#334155] rounded-xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-500/15 text-blue-400 font-bold px-3 py-1 rounded border border-blue-500/30 text-xs">
                        {sc.departmentId}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                        isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`} />
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white">{sc.label}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-1">ID: {sc.id}</p>
                    </div>

                    <div className="pt-3 border-t border-[#334155] flex items-center justify-between text-xs text-slate-400">
                      <span>Last Seen:</span>
                      <span className="font-semibold text-slate-200">
                        {sc.lastSeenAt ? `${Math.round((Date.now() - sc.lastSeenAt) / 1000)}s ago` : 'Never'}
                      </span>
                    </div>

                    <button
                      onClick={() => alert(`Display URL: http://localhost:3000/display/${sc.departmentId.toLowerCase()}`)}
                      className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg text-xs font-semibold border border-[#334155] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Copy Display URL</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Notice Audit & Control</h2>
                <p className="text-sm text-slate-400">
                  Searchable notice log across all institution departments.
                </p>
              </div>

              <div className="relative w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              {notices.map((n) => (
                <div key={n.id} className="bg-[#1E293B] border border-[#334155] rounded-xl p-5 flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-500/15 text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-500/30">
                        {n.departmentId}
                      </span>
                      {n.priority === 'urgent' && (
                        <span className="bg-red-500/15 text-red-400 text-xs font-bold px-2.5 py-0.5 rounded border border-red-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> URGENT
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono">Publisher: {n.createdBy}</span>
                    </div>

                    <p className="text-base text-slate-100 font-medium">{n.content}</p>

                    <div className="text-xs text-slate-400">
                      Posted: {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {n.status === 'active' && (
                    <button
                      onClick={() => expireNotice(n.id)}
                      className="text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                    >
                      Force Expire
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Security & Audit Event Log</h2>
              <p className="text-sm text-slate-400">
                Immutable audit trail of notice publications, edits, and blocked unauthorized attempts.
              </p>
            </div>

            <div className="bg-[#1E293B] border border-[#334155] rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-[#334155]">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Event Type</th>
                    <th className="px-6 py-4">Sender Phone</th>
                    <th className="px-6 py-4">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#334155]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {log.type === 'unauthorized_attempt' ? (
                          <span className="bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-bold px-2.5 py-1 rounded">
                            UNAUTHORIZED ATTEMPT
                          </span>
                        ) : (
                          <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-bold px-2.5 py-1 rounded">
                            PUBLISH
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono">{log.actorPhone}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-300">
                        {JSON.stringify(log.detail)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Add Authorized Faculty</h3>

            <form onSubmit={handleAddUser} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Jane Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">WhatsApp Phone (E.164)</label>
                <input
                  type="text"
                  required
                  placeholder="+919876543210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="faculty">Faculty</option>
                  <option value="hod">HOD</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department Codes (comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="ECE, CSE"
                  value={newDepts}
                  onChange={(e) => setNewDepts(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-semibold transition-colors shadow-lg shadow-blue-600/20"
                >
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
