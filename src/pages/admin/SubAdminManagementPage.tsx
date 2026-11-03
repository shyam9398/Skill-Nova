import React, { useState, useEffect } from 'react';
import {
  UserCheck, Shield, BookOpen, Check, X, Lock, AlertCircle,
  PlusCircle, UserPlus, Key, ShieldCheck, History, Clock, FileText
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { User, Course, AuditLogEntry } from '../../types';

export const SubAdminManagementPage: React.FC = () => {
  const [subAdmins, setSubAdmins] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'subadmins' | 'audit'>('subadmins');

  // Add Sub-admin Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const currentUser = dataService.getCurrentUser();
  const isSuperAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const update = () => {
      setSubAdmins(dataService.getSubAdmins());
      setCourses(dataService.getCourses());
      setAuditLogs(dataService.getAuditLogs());
    };
    update();
    const unsubscribe = dataService.subscribe(update);
    void dataService.syncUsersFromSupabase();
    void dataService.syncCoursesFromSupabase();
    void dataService.syncAuditLogsFromSupabase();
    return () => unsubscribe();
  }, []);

  const handleCreateSubAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    if (!cleanUser || cleanUser.length < 3) {
      setFormError('Username must be at least 3 characters.');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    const res = dataService.addSubAdmin({
      username: cleanUser,
      password: password.trim(),
      full_name: fullName.trim() || `Sub-Admin ${cleanUser.toUpperCase()}`,
      assigned_courses: courses.map(c => c.id) // Full course scope
    });

    if (!res.success) {
      setFormError(res.error || 'Failed to create sub-admin.');
      return;
    }

    setShowAddModal(false);
    setUsername('');
    setPassword('');
    setFullName('');
    setActionNotice(`Sub-admin @${cleanUser} provisioned successfully with full administrative functionality!`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleToggleSubAdminStatus = (id: string) => {
    dataService.toggleUserStatus(id);
    setActionNotice('Sub-admin access status updated.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Notice */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40">
              ROLE DELEGATION
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Full Operational Permissions
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#F0F5FF] flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#77B4FF]" />
            Sub-admin Management
          </h1>
          <p className="text-xs text-[#9BAAC2] mt-0.5">
            Create and manage sub-administrators. Sub-admins have the same operational capabilities as Admins: courses, resources, Drive videos, PPT slide ranges, interview docs, flashcards, quizzes, and releases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab(activeTab === 'subadmins' ? 'audit' : 'subadmins')}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'audit'
                ? 'bg-[#397BFF] text-white border-[#397BFF]'
                : 'bg-[#15233A] text-[#9BAAC2] hover:text-white border-[#1F2E47]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Log ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => {
              setFormError(null);
              setShowAddModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-[#00A3FF]/25 flex items-center gap-2 transition hover:scale-102"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Sub-admin</span>
          </button>
        </div>
      </div>

      {/* Main Tab: Sub-Admins Cards */}
      {activeTab === 'subadmins' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subAdmins.length === 0 ? (
            <div className="col-span-2 p-12 text-center bg-[#101A2D] border border-[#1F2E47] rounded-3xl text-[#9BAAC2] space-y-3">
              <UserCheck className="w-12 h-12 mx-auto text-[#397BFF]/40" />
              <h3 className="text-base font-bold text-[#F0F5FF]">No Sub-admins Provisioned Yet</h3>
              <p className="text-xs max-w-sm mx-auto">
                Click "+ Add Sub-admin" above to create an academic sub-admin with full operational powers over courses, learning resources, and cohorts.
              </p>
            </div>
          ) : (
            subAdmins.map((subAdmin) => {
              const assignedCourses = courses.filter(c => subAdmin.assigned_courses?.includes(c.id));

              return (
                <div
                  key={subAdmin.id}
                  className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={subAdmin.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                        alt={subAdmin.full_name}
                        className="w-12 h-12 rounded-2xl object-cover border border-[#397BFF]/40"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-[#F0F5FF]">{subAdmin.full_name}</h3>
                        <div className="text-xs text-[#00D4B8] font-mono font-semibold">
                          @{subAdmin.username || subAdmin.email.split('@')[0]}
                        </div>
                        <div className="text-[11px] text-[#9BAAC2]">{subAdmin.email}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        subAdmin.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {subAdmin.status}
                    </span>
                  </div>

                  {/* Operational Capabilities List */}
                  <div className="p-3 bg-[#15233A] rounded-2xl border border-white/5 space-y-2">
                    <div className="text-[11px] font-bold text-[#77B4FF] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Operational Academic Capabilities:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#F0F5FF]">
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Manage & Edit Courses</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Add Drive Videos & PPTs</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>DOC & Slide Ranges</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Flashcards & Quizzes</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Release / Hold / Schedule</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Student Cohort Access</span>
                      </div>
                    </div>
                  </div>

                  {/* Constraints Note */}
                  <div className="text-[10px] text-[#9BAAC2] flex items-center gap-1.5 bg-[#0A101D] p-2.5 rounded-xl border border-white/5">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Protected: Cannot remove Primary Administrator or modify root system security.</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1F2E47]">
                    <span className="text-[11px] text-[#9BAAC2]">
                      Created: {new Date(subAdmin.created_at).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => handleToggleSubAdminStatus(subAdmin.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        subAdmin.status === 'active'
                          ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20'
                      }`}
                    >
                      {subAdmin.status === 'active' ? 'Deactivate Sub-admin' : 'Activate Sub-admin'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Audit Log Tab */
        <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl overflow-hidden shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#F0F5FF] flex items-center gap-2">
              <History className="w-5 h-5 text-[#397BFF]" />
              Administrative Operations Audit Trail
            </h3>
            <span className="text-xs text-[#9BAAC2] font-mono">
              Total Recorded Actions: {auditLogs.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs text-[#9BAAC2]">
              <thead className="bg-[#0A101D] text-[#77B4FF] uppercase text-[10px] tracking-wider border-b border-[#1F2E47]">
                <tr>
                  <th className="py-3 px-4">Timestamp (IST)</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource / Course ID</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2E47]/60">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#9BAAC2]">
                      No audit operations logged yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#15233A]/50 transition">
                      <td className="py-3 px-4 font-mono text-[11px] text-[#F0F5FF]">
                        {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {log.performed_by}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/30 font-mono">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#00D4B8]">
                        {log.resource_title || log.resource_id || log.course_id || 'System'}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#9BAAC2]">
                        {log.details || 'Operational modification completed'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Sub-admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-[#9BAAC2] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#397BFF]/20 text-[#397BFF] flex items-center justify-center border border-[#397BFF]/30">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#F0F5FF]">+ Add Sub-admin</h3>
                <p className="text-[11px] text-[#9BAAC2]">Delegate full operational academic administration</p>
              </div>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubAdmin} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold text-[#F0F5FF] block mb-1">
                  Username <span className="text-[#397BFF]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#77B4FF]">@</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. mentor_vikram"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl pl-8 pr-4 py-2.5 text-xs text-[#F0F5FF] font-mono outline-none focus:border-[#397BFF] transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#F0F5FF] block mb-1">
                  Password <span className="text-[#397BFF]">*</span>
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-[#9BAAC2] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF] transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#F0F5FF] block mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Patel"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF] transition"
                />
              </div>

              <div className="p-3 bg-[#15233A] rounded-xl border border-white/5 text-[11px] text-[#9BAAC2]">
                After creation, this sub-admin can sign in to the Administrative Portal with their username or mapped email (<code className="text-[#00D4B8]">@skillnova.edu</code>) and manage courses, learning resources, and cohorts.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9BAAC2] bg-[#15233A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white shadow-lg shadow-[#00A3FF]/25 hover:opacity-95 transition"
                >
                  Create Sub-admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminManagementPage;
