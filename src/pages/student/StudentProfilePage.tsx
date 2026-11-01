import React from 'react';
import { 
  User as UserIcon, 
  Mail, 
  BookOpen, 
  Award, 
  ShieldCheck
} from 'lucide-react';
import { dataService } from '../../services/dataService';

export const StudentProfilePage: React.FC = () => {
  const user = dataService.getCurrentUser() || {
    id: 'usr-student-1',
    full_name: 'Aarav Sharma',
    email: 'aarav.sharma@skillnova.edu',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    college: 'National Institute of Technology',
    branch: 'Computer Science & Engineering',
    year_of_study: '3rd Year',
    status: 'active' as const
  };

  const enrolledCourses = dataService.getEnrolledCourses(user.id);
  const attempts = dataService.getQuizAttempts(user.id);

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40 flex items-center gap-1.5">
            <UserIcon className="w-3.5 h-3.5 text-[#397BFF]" />
            Student Identity & Verified Credentials
          </span>
          <span className="text-xs text-[#9BAAC2] font-mono">Roll: SN-2026-001</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F0F5FF]">
          My Academic Profile
        </h1>
        <p className="text-sm text-[#9BAAC2]">
          Authorized institutional learning identity, enrolled technology tracks, and verified competency records.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-[#15233A] rounded-3xl border border-white/5 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-white/10 text-center sm:text-left">
          <div className="relative">
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user.full_name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-[#397BFF] shadow-[0_0_20px_rgba(57,123,255,0.3)]"
            />
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider">
              Active
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#F0F5FF]">{user.full_name}</h2>
            <p className="text-xs text-[#9BAAC2] flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#397BFF]" /> {user.email}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#101A2D] text-xs text-[#77B4FF] border border-white/5 font-mono">
                {user.college || 'National Institute of Technology'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#101A2D] text-xs text-[#F0F5FF] border border-white/5 font-mono">
                {user.branch || 'Computer Science & Engineering'} • {user.year_of_study || '3rd Year'}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#101A2D] border border-white/5 space-y-1">
            <span className="text-[11px] font-semibold text-[#9BAAC2] uppercase tracking-wider">Institutional Status</span>
            <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Enrolled & Verified
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#101A2D] border border-white/5 space-y-1">
            <span className="text-[11px] font-semibold text-[#9BAAC2] uppercase tracking-wider">Active Technologies</span>
            <p className="text-sm font-bold text-[#F0F5FF] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#397BFF]" /> {enrolledCourses.length} Courses
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#101A2D] border border-white/5 space-y-1">
            <span className="text-[11px] font-semibold text-[#9BAAC2] uppercase tracking-wider">AI Assessments Taken</span>
            <p className="text-sm font-bold text-[#77B4FF] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#77B4FF]" /> {attempts.length} Completed
            </p>
          </div>
        </div>

        {/* Enrolled Courses Summary */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9BAAC2]">
            Assigned Technology Tracks
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {enrolledCourses.map((c: any) => (
              <div 
                key={c.id} 
                className="p-4 rounded-2xl bg-[#101A2D] border border-white/5 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#F0F5FF]">{c.title}</h4>
                  <p className="text-[11px] text-[#9BAAC2] font-mono">Mentor: {c.mentor_name || c.assignedMentor || 'Senior Mentor'}</p>
                </div>
                <span className="text-xs font-bold text-[#77B4FF] font-mono">
                  {c.progressPercentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
