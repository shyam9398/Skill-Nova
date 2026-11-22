import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, UserCheck, Layers, Calendar, Cpu,
  PlusCircle, ArrowUpRight, Clock, CheckCircle2,
  Shield, Briefcase, Search, RefreshCw, Trophy,
  UserX, LogIn, Check, XCircle
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { LiveMeetingManagementCard } from '../../components/admin/LiveMeetingManagementCard';
import type {
  User, Course, Topic, AIGenerationJob,
  StudentAccountAudit, QuizParticipationSummary, Quiz
} from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(dataService.getCurrentUser());
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subAdmins, setSubAdmins] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [aiJobs, setAiJobs] = useState<AIGenerationJob[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // 1. Student Account Audit State
  const [auditData, setAuditData] = useState(() => dataService.getStudentAccountAudits());
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditFilter, setAuditFilter] = useState<'all' | 'logged_in' | 'never_logged_in' | 'recently_created'>('all');
  const [isRefreshingAudits, setIsRefreshingAudits] = useState(false);

  // 2. Quiz Participation Monitoring State
  const [participationSummaries, setParticipationSummaries] = useState<QuizParticipationSummary[]>(() =>
    dataService.getQuizParticipationSummaries()
  );
  const [selectedQuizId, setSelectedQuizId] = useState<string>('all');
  const [participationStatusFilter, setParticipationStatusFilter] = useState<'all' | 'attempted' | 'not_attempted'>('all');
  const [participationSearchQuery, setParticipationSearchQuery] = useState('');
  const [isRefreshingQuizzes, setIsRefreshingQuizzes] = useState(false);

  const loadData = () => {
    setCurrentUser(dataService.getCurrentUser());
    setStudents(dataService.getStudents());
    setCourses(dataService.getCourses());
    setSubAdmins(dataService.getSubAdmins());
    setTopics(dataService.getAllPublishedTopics());
    setAiJobs(dataService.getAIJobs());
    setQuizzes(dataService.getQuizzesList());
    setAuditData(dataService.getStudentAccountAudits());
    setParticipationSummaries(dataService.getQuizParticipationSummaries());
  };

  useEffect(() => {
    void dataService.syncAllFromSupabase();
    loadData();
    return dataService.subscribe(loadData);
  }, []);

  // Refresh Student Account Audits
  const handleRefreshAudits = async () => {
    if (isRefreshingAudits) return;
    setIsRefreshingAudits(true);
    try {
      await Promise.all([
        dataService.syncUsersFromSupabase(),
        dataService.syncAuditLogsFromSupabase(),
      ]);
      setAuditData(dataService.getStudentAccountAudits());
    } finally {
      setIsRefreshingAudits(false);
    }
  };

  // Refresh Quiz Participation
  const handleRefreshParticipation = async () => {
    if (isRefreshingQuizzes) return;
    setIsRefreshingQuizzes(true);
    try {
      await Promise.all([
        dataService.syncQuizzesFromSupabase(),
        dataService.syncQuizAttemptsFromSupabase(),
        dataService.syncUsersFromSupabase(),
      ]);
      setParticipationSummaries(dataService.getQuizParticipationSummaries());
    } finally {
      setIsRefreshingQuizzes(false);
    }
  };

  // Filtered Student Audits Table
  const filteredAudits = useMemo(() => {
    return auditData.audits.filter((s) => {
      // Filter tab
      if (auditFilter === 'logged_in' && !s.has_logged_in) return false;
      if (auditFilter === 'never_logged_in' && s.has_logged_in) return false;
      if (auditFilter === 'recently_created') {
        const createdMs = new Date(s.created_at).getTime();
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if (createdMs < sevenDaysAgo) return false;
      }

      // Search query
      if (auditSearchQuery.trim()) {
        const q = auditSearchQuery.toLowerCase().trim();
        const matchName = s.full_name.toLowerCase().includes(q);
        const matchUser = s.username.toLowerCase().includes(q);
        const matchEmail = s.email.toLowerCase().includes(q);
        if (!matchName && !matchUser && !matchEmail) return false;
      }

      return true;
    });
  }, [auditData.audits, auditFilter, auditSearchQuery]);

  // Selected Quiz Participation Summary & Table
  const currentSummary = useMemo(() => {
    if (selectedQuizId === 'all') {
      const allParticipants = participationSummaries.flatMap((s) => s.participants);
      const totalEligible = participationSummaries.reduce((sum, s) => sum + s.total_eligible_students, 0);
      const totalAttempted = participationSummaries.reduce((sum, s) => sum + s.attempted_count, 0);
      const totalCompleted = participationSummaries.reduce((sum, s) => sum + s.completed_count, 0);
      const totalInProgress = participationSummaries.reduce((sum, s) => sum + s.in_progress_count, 0);

      return {
        quiz_id: 'all',
        quiz_title: 'All Quizzes Aggregated',
        status: 'active' as const,
        total_eligible_students: totalEligible,
        attempted_count: totalAttempted,
        not_attempted_count: Math.max(0, totalEligible - totalAttempted),
        completed_count: totalCompleted,
        in_progress_count: totalInProgress,
        participants: allParticipants,
      };
    }
    return (
      participationSummaries.find((s) => s.quiz_id === selectedQuizId) ||
      participationSummaries[0]
    );
  }, [participationSummaries, selectedQuizId]);

  const filteredParticipants = useMemo(() => {
    if (!currentSummary) return [];
    return currentSummary.participants.filter((p) => {
      if (participationStatusFilter === 'attempted' && !p.has_attempted) return false;
      if (participationStatusFilter === 'not_attempted' && p.has_attempted) return false;

      if (participationSearchQuery.trim()) {
        const q = participationSearchQuery.toLowerCase().trim();
        const matchName = p.student_name.toLowerCase().includes(q);
        const matchUser = p.username.toLowerCase().includes(q);
        const matchEmail = p.email.toLowerCase().includes(q);
        if (!matchName && !matchUser && !matchEmail) return false;
      }
      return true;
    });
  }, [currentSummary, participationStatusFilter, participationSearchQuery]);

  // Format Date Helpers
  const formatDateTime = (iso?: string) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  const pendingAiJobs = aiJobs.filter((j) => j.status === 'pending_review');

  return (
    <div className="space-y-8 pb-16 text-slate-900 dark:text-[#F0F5FF]">
      {/* Top Banner */}
      <div className="dark-section dark-card bg-gradient-to-r from-[#101A2D] via-[#15233A] to-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#397BFF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/30 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>SkillNova Operations Control Center</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white !text-white">
              Welcome back, {currentUser?.full_name || 'Administrator'}
            </h1>
            <p className="text-xs md:text-sm text-[#9BAAC2] max-w-xl">
              Real-time student account auditing, cohort quiz participation tracking, and curriculum operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/resources"
              className="px-4 py-2.5 rounded-xl bg-[#397BFF] text-white text-xs font-bold hover:bg-[#2868ea] shadow-lg shadow-[#397BFF]/30 flex items-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Daily Topic</span>
            </Link>
            <Link
              to="/admin/ai-generator"
              className="px-4 py-2.5 rounded-xl bg-[#15233A] border border-[#1F2E47] text-xs font-bold text-[#F0F5FF] hover:bg-[#1F2E47] flex items-center gap-2 transition"
            >
              <Cpu className="w-4 h-4 text-[#77B4FF]" />
              <span>AI Content Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Classroom Meeting Link Broadcast Control */}
      <LiveMeetingManagementCard />

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#9BAAC2]">
            <span className="text-xs font-medium">Total Students</span>
            <Users className="w-4 h-4 text-[#397BFF]" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-[#F0F5FF]">{students.length}</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            {auditData.loggedInCount} active login accounts
          </div>
        </div>

        <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#9BAAC2]">
            <span className="text-xs font-medium">Active Courses</span>
            <BookOpen className="w-4 h-4 text-[#77B4FF]" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-[#F0F5FF]">{courses.length}</div>
          <div className="text-[10px] text-slate-500 dark:text-[#9BAAC2]">With dynamic roadmaps</div>
        </div>

        <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#9BAAC2]">
            <span className="text-xs font-medium">Mentors & Staff</span>
            <UserCheck className="w-4 h-4 text-[#397BFF]" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-[#F0F5FF]">{subAdmins.length + 1}</div>
          <div className="text-[10px] text-slate-500 dark:text-[#9BAAC2]">Academic sub-admins</div>
        </div>

        <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#9BAAC2]">
            <span className="text-xs font-medium">Configured Quizzes</span>
            <Trophy className="w-4 h-4 text-[#77B4FF]" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-[#F0F5FF]">{quizzes.length}</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Scheduled in IST</div>
        </div>

        <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#9BAAC2]">
            <span className="text-xs font-medium">Published Topics</span>
            <Layers className="w-4 h-4 text-[#397BFF]" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-[#F0F5FF]">{topics.length}</div>
          <div className="text-[10px] text-slate-500 dark:text-[#9BAAC2]">Recordings & Notes</div>
        </div>

        <div className="bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-2xl p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#9BAAC2]">
            <span className="text-xs font-medium">Pending AI Reviews</span>
            <Cpu className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-300">{pendingAiJobs.length}</div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Human-in-the-loop</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: STUDENT ACCOUNT AUDIT LOGS & AUTH MONITORING         */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm dark:shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#397BFF]/15 text-[#176BFF] dark:text-[#00E5FF] border border-[#397BFF]/30 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                ADMINISTRATIVE AUDIT LOGS
              </span>
              <span className="text-xs text-slate-500 dark:text-[#9BAAC2] font-mono">
                Supabase Auth Authenticated Records
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Student Account Audit & Login Activity
            </h2>
            <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">
              Track provisioned student accounts, verify genuine initial and recurring logins, and monitor account status.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleRefreshAudits}
              disabled={isRefreshingAudits}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] text-slate-800 dark:text-white text-xs font-bold transition border border-slate-200 dark:border-white/10 flex items-center gap-2 shadow-xs disabled:opacity-50"
              title="Refresh Student Account Audit Records"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#176BFF] dark:text-[#00E5FF] ${isRefreshingAudits ? 'animate-spin' : ''}`} />
              <span>{isRefreshingAudits ? 'Syncing...' : 'Refresh Audits'}</span>
            </button>
            <Link
              to="/admin/students"
              className="px-4 py-2.5 rounded-xl bg-[#176BFF] hover:bg-[#00A3FF] text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-[#176BFF]/20"
            >
              <span>Manage Students</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Audit Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#101C33] border border-slate-200 dark:border-white/5 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-[#9BAAC2]">
              <span className="text-xs font-bold font-mono uppercase">Total Created</span>
              <Users className="w-4 h-4 text-[#397BFF]" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {auditData.totalStudents}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-[#9BAAC2]">Student accounts in database</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400">
              <span className="text-xs font-bold font-mono uppercase">Logged In</span>
              <LogIn className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
              {auditData.loggedInCount}
            </div>
            <div className="text-[11px] text-emerald-800/80 dark:text-emerald-400 font-medium">
              {Math.round((auditData.loggedInCount / Math.max(1, auditData.totalStudents)) * 100)}% active activation
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-400">
              <span className="text-xs font-bold font-mono uppercase">Never Logged In</span>
              <UserX className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
              {auditData.neverLoggedInCount}
            </div>
            <div className="text-[11px] text-amber-800/80 dark:text-amber-400 font-medium">Pending initial sign-in</div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-500/20 space-y-1">
            <div className="flex items-center justify-between text-sky-800 dark:text-[#00E5FF]">
              <span className="text-xs font-bold font-mono uppercase">Active Status</span>
              <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-[#00E5FF]" />
            </div>
            <div className="text-2xl font-black text-sky-700 dark:text-[#00E5FF] font-mono">
              {students.filter((s) => s.status !== 'inactive').length}
            </div>
            <div className="text-[11px] text-sky-800/80 dark:text-sky-300">Operational accounts</div>
          </div>
        </div>

        {/* Filter Tabs & Search Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {[
              { id: 'all', label: `All Students (${auditData.totalStudents})` },
              { id: 'logged_in', label: `Logged In (${auditData.loggedInCount})` },
              { id: 'never_logged_in', label: `Never Logged In (${auditData.neverLoggedInCount})` },
              { id: 'recently_created', label: 'Recently Created (7d)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAuditFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  auditFilter === tab.id
                    ? 'bg-[#176BFF] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9BAAC2] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, username, email..."
              value={auditSearchQuery}
              onChange={(e) => setAuditSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#101C33] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-[#00A3FF]"
            />
          </div>
        </div>

        {/* Audited Students Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#070D1B] border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-[#9BAAC2] font-mono">
                <th className="py-3 px-4 font-bold">Student Name & Username</th>
                <th className="py-3 px-4 font-bold">Email</th>
                <th className="py-3 px-4 font-bold">Account Created</th>
                <th className="py-3 px-4 font-bold">Last Login Date & Time</th>
                <th className="py-3 px-4 font-bold">Login Count</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#0B1528]">
              {filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-[#9BAAC2]">
                    No students match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredAudits.slice(0, 15).map((s) => (
                  <tr key={s.student_id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{s.full_name}</div>
                      <div className="text-[11px] font-mono text-[#176BFF] dark:text-[#00E5FF]">@{s.username}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-[#9BAAC2] font-mono text-[11px]">
                      {s.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {formatDateTime(s.created_at)}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.has_logged_in ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-semibold">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{formatDateTime(s.last_login_at)}</span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30">
                          Never Logged In
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {s.login_count > 0 ? `${s.login_count} time${s.login_count > 1 ? 's' : ''}` : '0'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          s.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 2: QUIZ PARTICIPATION MONITORING                       */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm dark:shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#00A3FF]/15 text-[#176BFF] dark:text-[#00E5FF] border border-[#00A3FF]/30 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                ACADEMIC PARTICIPATION MONITOR
              </span>
              <span className="text-xs text-slate-500 dark:text-[#9BAAC2] font-mono">
                Course Enrollment Verified
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              Quiz Participation Monitoring
            </h2>
            <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">
              Track real-time cohort participation, completed submissions, and outstanding student attempts per quiz.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleRefreshParticipation}
              disabled={isRefreshingQuizzes}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] text-slate-800 dark:text-white text-xs font-bold transition border border-slate-200 dark:border-white/10 flex items-center gap-2 shadow-xs disabled:opacity-50"
              title="Refresh Quiz Participation Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#176BFF] dark:text-[#00E5FF] ${isRefreshingQuizzes ? 'animate-spin' : ''}`} />
              <span>{isRefreshingQuizzes ? 'Syncing...' : 'Refresh Quizzes'}</span>
            </button>
            <Link
              to="/admin/quizzes"
              className="px-4 py-2.5 rounded-xl bg-[#00A3FF] hover:bg-[#176BFF] text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-[#00A3FF]/20"
            >
              <span>Quiz Manager</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quiz Selector Dropdown & Active Window */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#101C33] border border-slate-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold font-mono text-slate-700 dark:text-[#9BAAC2] uppercase shrink-0">
              Select Assessment:
            </label>
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#080E21] border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-[#00A3FF]"
            >
              <option value="all">All Quizzes (Cohort-Wide Aggregated)</option>
              {participationSummaries.map((s) => (
                <option key={s.quiz_id} value={s.quiz_id}>
                  {s.quiz_title} ({s.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {currentSummary && (
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              {currentSummary.start_time && (
                <span className="text-slate-600 dark:text-[#9BAAC2]">
                  Start: <strong className="text-slate-900 dark:text-white">{formatDateTime(currentSummary.start_time)}</strong>
                </span>
              )}
              {currentSummary.end_time && (
                <span className="text-slate-600 dark:text-[#9BAAC2]">
                  Close: <strong className="text-slate-900 dark:text-white">{formatDateTime(currentSummary.end_time)}</strong>
                </span>
              )}
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  currentSummary.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                    : currentSummary.status === 'upcoming'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                    : 'bg-slate-200 text-slate-800 dark:bg-white/10 dark:text-slate-300 border border-slate-300 dark:border-white/10'
                }`}
              >
                {currentSummary.status}
              </span>
            </div>
          )}
        </div>

        {/* Participation Metric KPI Cards */}
        {currentSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#101C33] border border-slate-200 dark:border-white/5 space-y-1">
              <span className="text-xs font-bold font-mono uppercase text-slate-500 dark:text-[#9BAAC2] block">
                Total Eligible Cohort
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {currentSummary.total_eligible_students} Students
              </div>
              <span className="text-[11px] text-slate-500 dark:text-[#9BAAC2]">Assigned course enrollees</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 space-y-1">
              <span className="text-xs font-bold font-mono uppercase text-emerald-800 dark:text-emerald-400 block">
                Attempted
              </span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {currentSummary.attempted_count}
              </div>
              <span className="text-[11px] text-emerald-800/80 dark:text-emerald-400 font-semibold">
                {Math.round((currentSummary.attempted_count / Math.max(1, currentSummary.total_eligible_students)) * 100)}% participation rate
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 space-y-1">
              <span className="text-xs font-bold font-mono uppercase text-amber-800 dark:text-amber-400 block">
                Not Attempted
              </span>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
                {currentSummary.not_attempted_count}
              </div>
              <span className="text-[11px] text-amber-800/80 dark:text-amber-400 font-semibold">Outstanding submissions</span>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-500/20 space-y-1">
              <span className="text-xs font-bold font-mono uppercase text-sky-800 dark:text-[#00E5FF] block">
                Completed Attempts
              </span>
              <div className="text-2xl font-black text-sky-700 dark:text-[#00E5FF] font-mono">
                {currentSummary.completed_count}
              </div>
              <span className="text-[11px] text-sky-800/80 dark:text-sky-300">
                {currentSummary.in_progress_count > 0 ? `${currentSummary.in_progress_count} in-progress` : '100% graded'}
              </span>
            </div>
          </div>
        )}

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {[
              { id: 'all', label: `All Eligible (${currentSummary?.total_eligible_students || 0})` },
              { id: 'attempted', label: `Attempted (${currentSummary?.attempted_count || 0})` },
              { id: 'not_attempted', label: `Not Attempted (${currentSummary?.not_attempted_count || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setParticipationStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  participationStatusFilter === tab.id
                    ? 'bg-[#00A3FF] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9BAAC2] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by student name/username..."
              value={participationSearchQuery}
              onChange={(e) => setParticipationSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#101C33] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-[#00A3FF]"
            />
          </div>
        </div>

        {/* Detailed Student Participation Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#070D1B] border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-[#9BAAC2] font-mono">
                <th className="py-3 px-4 font-bold">Student Name & Username</th>
                <th className="py-3 px-4 font-bold">Quiz Title</th>
                <th className="py-3 px-4 font-bold">Participation Status</th>
                <th className="py-3 px-4 font-bold">Score</th>
                <th className="py-3 px-4 font-bold">Accuracy</th>
                <th className="py-3 px-4 font-bold">Submission Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#0B1528]">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-[#9BAAC2]">
                    No students match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredParticipants.slice(0, 15).map((p, idx) => (
                  <tr key={`${p.student_id}-${p.quiz_id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{p.student_name}</div>
                      <div className="text-[11px] font-mono text-[#176BFF] dark:text-[#00E5FF]">@{p.username}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold max-w-xs truncate">
                      {p.quiz_title}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.attempt_status === 'completed' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" /> Completed
                        </span>
                      ) : p.attempt_status === 'in_progress' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> In Progress
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" /> Not Attempted
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {p.score !== undefined ? `${p.score} / ${p.total_marks || 100}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {p.accuracy !== undefined ? `${p.accuracy}%` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {p.completed_at ? formatDateTime(p.completed_at) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#9BAAC2] uppercase tracking-wider">
          LMS Operational Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/admin/students"
            className="p-3.5 rounded-xl bg-white dark:bg-[#15233A] hover:bg-slate-50 dark:hover:bg-[#1F2E47] border border-slate-200 dark:border-[#1F2E47] text-left transition group shadow-xs"
          >
            <Users className="w-5 h-5 text-[#397BFF] mb-2 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-slate-900 dark:text-[#F0F5FF]">Create Student</div>
            <div className="text-[10px] text-slate-500 dark:text-[#9BAAC2]">Manual or CSV Import</div>
          </Link>

          <Link
            to="/admin/subadmins"
            className="p-3.5 rounded-xl bg-white dark:bg-[#15233A] hover:bg-slate-50 dark:hover:bg-[#1F2E47] border border-slate-200 dark:border-[#1F2E47] text-left transition group shadow-xs"
          >
            <UserCheck className="w-5 h-5 text-[#77B4FF] mb-2 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-slate-900 dark:text-[#F0F5FF]">Sub-Admin Delegation</div>
            <div className="text-[10px] text-slate-500 dark:text-[#9BAAC2]">Assign course scopes</div>
          </Link>

          <Link
            to="/admin/courses"
            className="p-3.5 rounded-xl bg-white dark:bg-[#15233A] hover:bg-slate-50 dark:hover:bg-[#1F2E47] border border-slate-200 dark:border-[#1F2E47] text-left transition group shadow-xs"
          >
            <BookOpen className="w-5 h-5 text-[#397BFF] mb-2 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-slate-900 dark:text-[#F0F5FF]">Add New Course</div>
            <div className="text-[10px] text-slate-500 dark:text-[#9BAAC2]">Upload visual roadmaps</div>
          </Link>

          <Link
            to="/admin/resources"
            className="p-3.5 rounded-xl bg-white dark:bg-[#15233A] hover:bg-slate-50 dark:hover:bg-[#1F2E47] border border-slate-200 dark:border-[#1F2E47] text-left transition group shadow-xs"
          >
            <Layers className="w-5 h-5 text-[#77B4FF] mb-2 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-slate-900 dark:text-[#F0F5FF]">Publish Resources</div>
            <div className="text-[10px] text-slate-500 dark:text-[#9BAAC2]">Drive video & notes link</div>
          </Link>

          <Link
            to="/admin/opportunities"
            className="p-3.5 rounded-xl bg-white dark:bg-[#15233A] hover:bg-slate-50 dark:hover:bg-[#1F2E47] border border-slate-200 dark:border-[#1F2E47] text-left transition group shadow-xs"
          >
            <Briefcase className="w-5 h-5 text-[#397BFF] mb-2 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-slate-900 dark:text-[#F0F5FF]">Publish Opportunity</div>
            <div className="text-[10px] text-slate-500 dark:text-[#9BAAC2]">Internships & Hackathons</div>
          </Link>

          <Link
            to="/admin/saturday-special"
            className="p-3.5 rounded-xl bg-white dark:bg-[#15233A] hover:bg-slate-50 dark:hover:bg-[#1F2E47] border border-slate-200 dark:border-[#1F2E47] text-left transition group shadow-xs"
          >
            <Calendar className="w-5 h-5 text-[#77B4FF] mb-2 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-slate-900 dark:text-[#F0F5FF]">Saturday Special</div>
            <div className="text-[10px] text-slate-500 dark:text-[#9BAAC2]">Emerging tech workshops</div>
          </Link>
        </div>
      </div>

      {/* Main Two Columns: AI Review Queue & Recent Published Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Pending AI Content Human-Review Queue */}
        <div className="lg:col-span-7 bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1F2E47] pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F0F5FF] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#397BFF]" />
                AI Content Human Review Queue
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">
                Mandatory human review before publishing grounded AI questions to student courses.
              </p>
            </div>
            <Link
              to="/admin/ai-generator"
              className="text-xs text-[#176BFF] dark:text-[#77B4FF] hover:underline font-semibold flex items-center gap-1"
            >
              Open Studio <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {aiJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="bg-slate-50 dark:bg-[#15233A] border border-slate-200 dark:border-[#1F2E47] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#397BFF]/40 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-[#F0F5FF]">{job.document_name}</span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        job.status === 'approved' || job.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#9BAAC2] line-clamp-1">{job.summary}</p>
                  <div className="text-[11px] text-[#176BFF] dark:text-[#77B4FF] flex items-center gap-3">
                    <span>{job.flashcards.length} Flashcards</span>
                    <span>•</span>
                    <span>{job.quiz_questions.length} MCQs</span>
                    <span>•</span>
                    <span>{job.interview_questions.length} Interview Qs</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/admin/ai-generator"
                    className="px-3 py-1.5 rounded-lg bg-[#397BFF] text-white text-xs font-semibold hover:bg-[#2868ea] transition"
                  >
                    Review & Publish
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Published Resources & Activity Feed */}
        <div className="lg:col-span-5 bg-white dark:bg-[#101A2D] border border-slate-200 dark:border-[#1F2E47] rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1F2E47] pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F0F5FF] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#77B4FF]" />
                Recent Academic Activity
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">Chronological resource updates & recordings.</p>
            </div>
            <Link
              to="/admin/resources"
              className="text-xs text-[#176BFF] dark:text-[#77B4FF] hover:underline font-semibold"
            >
              View Feed
            </Link>
          </div>

          <div className="space-y-3">
            {topics.slice(0, 4).map((topic) => (
              <div
                key={topic.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#15233A] border border-slate-200 dark:border-[#1F2E47] text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-[#F0F5FF]">{topic.title}</span>
                  <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] font-mono">{topic.class_date}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  {topic.has_recording && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      Recording Active
                    </span>
                  )}
                  {topic.has_notes && (
                    <span className="px-1.5 py-0.5 rounded bg-[#397BFF]/20 text-[#176BFF] dark:text-[#77B4FF] border border-[#397BFF]/30">
                      Drive Notes
                    </span>
                  )}
                  {topic.has_quiz && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                      AI Quiz Live
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
