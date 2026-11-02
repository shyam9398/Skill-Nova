import React from 'react';
import { 
  User as UserIcon, 
  Mail, 
  BookOpen, 
  Award, 
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
  Check
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { useTheme } from '../../context/ThemeContext';

export const StudentProfilePage: React.FC = () => {
  const { theme, setTheme } = useTheme();

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
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/40 flex items-center gap-1.5 font-mono">
            <UserIcon className="w-3.5 h-3.5 text-[#00A3FF]" />
            Student Identity & Verified Credentials
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Roll: SN-2026-001</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">
          My Academic Profile & Settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#9BAAC2]">
          Authorized institutional learning identity, theme preferences, and verified competency records.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-200 dark:border-white/10 text-center sm:text-left">
          <div className="relative">
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user.full_name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-[#00A3FF] shadow-[0_0_20px_rgba(0,163,255,0.3)]"
            />
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
              Active
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{user.full_name}</h2>
            <p className="text-xs text-slate-500 dark:text-[#9BAAC2] flex items-center justify-center sm:justify-start gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-[#00A3FF]" /> {user.email}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#060B18] text-xs text-[#00A3FF] border border-slate-200 dark:border-white/5 font-mono">
                {user.college || 'National Institute of Technology'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#060B18] text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 font-mono">
                {user.branch || 'Computer Science & Engineering'} • {user.year_of_study || '3rd Year'}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9BAAC2] uppercase tracking-wider">Status</span>
            <p className="text-sm font-bold text-emerald-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Enrolled & Verified
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9BAAC2] uppercase tracking-wider">Tracks</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#00A3FF]" /> {enrolledCourses.length} Enrolled Courses
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9BAAC2] uppercase tracking-wider">Assessments</span>
            <p className="text-sm font-bold text-[#00A3FF] flex items-center gap-1.5 font-mono">
              <Award className="w-4 h-4 text-[#00A3FF]" /> {attempts.length} Completed
            </p>
          </div>
        </div>

        {/* THEME CUSTOMIZATION SECTION */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00A3FF]" />
                <span>Portal Theme Customization</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#9BAAC2]">
                Choose your visual workspace aesthetic. Persisted to your Supabase profile across all logins.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/30 font-bold uppercase">
              Current: {theme}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Theme Card */}
            <div
              onClick={() => setTheme('light')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                theme === 'light'
                  ? 'border-[#00A3FF] bg-[#EAF4FF] shadow-lg shadow-[#00A3FF]/15 scale-[1.02]'
                  : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060B18] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#00A3FF]/30 text-[#00A3FF] flex items-center justify-center shadow-sm">
                    <Sun className="w-5 h-5 text-[#00A3FF]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Light Theme</h4>
                    <span className="text-[10px] text-[#00A3FF] font-mono font-bold">Fluorescent Blue Accents</span>
                  </div>
                </div>
                {theme === 'light' && (
                  <span className="w-6 h-6 rounded-full bg-[#00A3FF] text-white flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Clean light background with electric-blue highlights, clear dark typography, subtle blue shadows, and restrained blue sprinkles.
              </p>

              {/* Theme Preview Swatches */}
              <div className="flex items-center gap-2 pt-1">
                <span className="w-4 h-4 rounded-full bg-white border border-slate-300" title="Clean White" />
                <span className="w-4 h-4 rounded-full bg-[#00A3FF]" title="Fluorescent Blue" />
                <span className="w-4 h-4 rounded-full bg-[#176BFF]" title="Electric Accent" />
                <span className="w-4 h-4 rounded-full bg-[#F0F7FF]" title="Soft Highlight" />
              </div>
            </div>

            {/* Dark Theme Card */}
            <div
              onClick={() => setTheme('dark')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                theme === 'dark'
                  ? 'border-[#00A3FF] bg-[#0A1A3F] shadow-lg shadow-[#00A3FF]/20 scale-[1.02]'
                  : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#060B18] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#050811] border border-[#00A3FF]/40 text-[#00D1FF] flex items-center justify-center shadow-sm">
                    <Moon className="w-5 h-5 text-[#00D1FF]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Dark Theme</h4>
                    <span className="text-[10px] text-[#00D1FF] font-mono font-bold">Black & Fluorescent Blue</span>
                  </div>
                </div>
                {theme === 'dark' && (
                  <span className="w-6 h-6 rounded-full bg-[#00A3FF] text-white flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Deep black background with luminous fluorescent blue bottom glow, falling sparkling particles, and high-contrast text.
              </p>

              {/* Theme Preview Swatches */}
              <div className="flex items-center gap-2 pt-1">
                <span className="w-4 h-4 rounded-full bg-[#050811] border border-white/20" title="Deep Black" />
                <span className="w-4 h-4 rounded-full bg-[#00A3FF]" title="Fluorescent Blue" />
                <span className="w-4 h-4 rounded-full bg-[#00D1FF]" title="Luminous Cyan" />
                <span className="w-4 h-4 rounded-full bg-[#0A1A3F]" title="Bottom Glow" />
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses Summary */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9BAAC2] font-mono">
            Assigned Technology Tracks
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {enrolledCourses.map((c: any) => (
              <div 
                key={c.id} 
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-[#9BAAC2] font-mono">Mentor: {c.mentor_name || 'Senior Mentor'}</p>
                </div>
                <span className="text-xs font-bold text-[#00A3FF] font-mono">
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

export default StudentProfilePage;
