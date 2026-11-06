import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, UserCheck, Layers, Calendar, Cpu,
  Sparkles, PlusCircle, ArrowUpRight, Clock, CheckCircle2,
  AlertCircle, Shield, FileText, Briefcase
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { LiveMeetingManagementCard } from '../../components/admin/LiveMeetingManagementCard';
import type { User, Course, Topic, AIGenerationJob } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(dataService.getCurrentUser());
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subAdmins, setSubAdmins] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [aiJobs, setAiJobs] = useState<AIGenerationJob[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    void dataService.syncAllFromSupabase();
    const refresh = () => {
      setCurrentUser(dataService.getCurrentUser());
      setStudents(dataService.getStudents());
      setCourses(dataService.getCourses());
      setSubAdmins(dataService.getSubAdmins());
      setTopics(dataService.getAllPublishedTopics());
      setAiJobs(dataService.getAIJobs());
    };
    refresh();
    return dataService.subscribe(refresh);
  }, []);

  const pendingAiJobs = aiJobs.filter(j => j.status === 'pending_review');

  return (
    <div className="space-y-8">
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
              Cohort tracking, daily resource publishing, and AI-grounded curriculum management.
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
        <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[#9BAAC2]">
            <span className="text-xs font-medium">Total Students</span>
            <Users className="w-4 h-4 text-[#397BFF]" />
          </div>
          <div className="text-2xl font-black text-[#F0F5FF]">{students.length}</div>
          <div className="text-[10px] text-emerald-400 font-medium">Target: 50 enrolled</div>
        </div>

        <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[#9BAAC2]">
            <span className="text-xs font-medium">Active Courses</span>
            <BookOpen className="w-4 h-4 text-[#77B4FF]" />
          </div>
          <div className="text-2xl font-black text-[#F0F5FF]">{courses.length}</div>
          <div className="text-[10px] text-[#9BAAC2]">With dynamic roadmaps</div>
        </div>

        <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[#9BAAC2]">
            <span className="text-xs font-medium">Mentors & Staff</span>
            <UserCheck className="w-4 h-4 text-[#397BFF]" />
          </div>
          <div className="text-2xl font-black text-[#F0F5FF]">{subAdmins.length + 1}</div>
          <div className="text-[10px] text-[#9BAAC2]">Academic sub-admins</div>
        </div>

        <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[#9BAAC2]">
            <span className="text-xs font-medium">Published Topics</span>
            <Layers className="w-4 h-4 text-[#77B4FF]" />
          </div>
          <div className="text-2xl font-black text-[#F0F5FF]">{topics.length}</div>
          <div className="text-[10px] text-emerald-400">Recordings & Notes</div>
        </div>

        <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[#9BAAC2]">
            <span className="text-xs font-medium">Saturday Sessions</span>
            <Calendar className="w-4 h-4 text-[#397BFF]" />
          </div>
          <div className="text-2xl font-black text-[#F0F5FF]">4</div>
          <div className="text-[10px] text-[#9BAAC2]">Beyond Classroom</div>
        </div>

        <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-[#9BAAC2]">
            <span className="text-xs font-medium">Pending AI Reviews</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{pendingAiJobs.length}</div>
          <div className="text-[10px] text-amber-400 font-semibold">Human-in-the-loop</div>
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
            className="p-3.5 rounded-xl bg-[#15233A] hover:bg-[#1F2E47] border border-[#1F2E47] text-left transition group"
          >
            <Users className="w-5 h-5 text-[#397BFF] mb-2 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-[#F0F5FF]">Create Student</div>
            <div className="text-[10px] text-[#9BAAC2]">Manual or CSV Import</div>
          </Link>

          <Link
            to="/admin/subadmins"
            className="p-3.5 rounded-xl bg-[#15233A] hover:bg-[#1F2E47] border border-[#1F2E47] text-left transition group"
          >
            <UserCheck className="w-5 h-5 text-[#77B4FF] mb-2 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-[#F0F5FF]">Sub-Admin Delegation</div>
            <div className="text-[10px] text-[#9BAAC2]">Assign course scopes</div>
          </Link>

          <Link
            to="/admin/courses"
            className="p-3.5 rounded-xl bg-[#15233A] hover:bg-[#1F2E47] border border-[#1F2E47] text-left transition group"
          >
            <BookOpen className="w-5 h-5 text-[#397BFF] mb-2 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-[#F0F5FF]">Add New Course</div>
            <div className="text-[10px] text-[#9BAAC2]">Upload visual roadmaps</div>
          </Link>

          <Link
            to="/admin/resources"
            className="p-3.5 rounded-xl bg-[#15233A] hover:bg-[#1F2E47] border border-[#1F2E47] text-left transition group"
          >
            <Layers className="w-5 h-5 text-[#77B4FF] mb-2 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-[#F0F5FF]">Publish Resources</div>
            <div className="text-[10px] text-[#9BAAC2]">Drive video & notes link</div>
          </Link>

          <Link
            to="/admin/opportunities"
            className="p-3.5 rounded-xl bg-[#15233A] hover:bg-[#1F2E47] border border-[#1F2E47] text-left transition group"
          >
            <Briefcase className="w-5 h-5 text-[#397BFF] mb-2 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-[#F0F5FF]">Publish Opportunity</div>
            <div className="text-[10px] text-[#9BAAC2]">Internships & Hackathons</div>
          </Link>

          <Link
            to="/admin/saturday-special"
            className="p-3.5 rounded-xl bg-[#15233A] hover:bg-[#1F2E47] border border-[#1F2E47] text-left transition group"
          >
            <Calendar className="w-5 h-5 text-[#77B4FF] mb-2 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-[#F0F5FF]">Saturday Special</div>
            <div className="text-[10px] text-[#9BAAC2]">Emerging tech workshops</div>
          </Link>
        </div>
      </div>

      {/* Main Two Columns: AI Review Queue & Recent Published Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Pending AI Content Human-Review Queue */}
        <div className="lg:col-span-7 bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F2E47] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#F0F5FF] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#397BFF]" />
                AI Content Human Review Queue
              </h3>
              <p className="text-xs text-[#9BAAC2]">
                Mandatory human review before publishing grounded AI questions to student courses.
              </p>
            </div>
            <Link
              to="/admin/ai-generator"
              className="text-xs text-[#77B4FF] hover:underline font-semibold flex items-center gap-1"
            >
              Open Studio <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {aiJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="bg-[#15233A] border border-[#1F2E47] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#397BFF]/40 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F0F5FF]">{job.document_name}</span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        job.status === 'approved' || job.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-[#9BAAC2] line-clamp-1">{job.summary}</p>
                  <div className="text-[11px] text-[#77B4FF] flex items-center gap-3">
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
        <div className="lg:col-span-5 bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F2E47] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#F0F5FF] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#77B4FF]" />
                Recent Academic Activity
              </h3>
              <p className="text-xs text-[#9BAAC2]">Chronological resource updates & recordings.</p>
            </div>
            <Link
              to="/admin/resources"
              className="text-xs text-[#77B4FF] hover:underline font-semibold"
            >
              View Feed
            </Link>
          </div>

          <div className="space-y-3">
            {topics.slice(0, 4).map((topic) => (
              <div
                key={topic.id}
                className="p-3 rounded-xl bg-[#15233A] border border-[#1F2E47] text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F0F5FF]">{topic.title}</span>
                  <span className="text-[10px] text-[#9BAAC2] font-mono">{topic.class_date}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  {topic.has_recording && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Recording Active
                    </span>
                  )}
                  {topic.has_notes && (
                    <span className="px-1.5 py-0.5 rounded bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/30">
                      Drive Notes
                    </span>
                  )}
                  {topic.has_quiz && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
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
