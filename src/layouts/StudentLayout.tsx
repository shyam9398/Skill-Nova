import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, MessageSquare, Rocket,
  Bell, User, Code2, HelpCircle, LogOut, CheckCircle2, ChevronRight,
  Briefcase, Calendar
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import { LogoutConfirmationModal } from '../components/common/LogoutConfirmationModal';

export const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Updated student navigation per Section 12:
  // 1. Dashboard
  // 2. My Enrolled Courses
  // 3. Python Code Lab
  // 4. Discussion Room
  // 5. Quizzes
  // 6. Opportunities
  // 7. Saturday Special
  // 8. Pathfinders
  // 9. Notifications
  // 10. My Profile
  // 11. Logout (visible button below)
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { label: 'My Enrolled Courses', icon: BookOpen, path: '/student/courses' },
    { label: 'Python Code Lab', icon: Code2, path: '/student/python-lab', badge: 'Python 3' },
    { label: 'Discussion Room', icon: MessageSquare, path: '/student/discussion', badge: 'Community' },
    { label: 'Quizzes', icon: HelpCircle, path: '/student/quizzes', badge: 'Drill' },
    { label: 'Opportunities', icon: Briefcase, path: '/student/opportunities', badge: 'Careers' },
    { label: 'Saturday Special', icon: Calendar, path: '/student/saturday-special', badge: 'Live' },
    { label: 'Pathfinders', icon: Rocket, path: '/student/pathfinders', badge: 'Blast!' },
    { label: 'Notifications', icon: Bell, path: '/student/notifications' },
    { label: 'My Profile', icon: User, path: '/student/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F9FF] dark:bg-[#050816] text-black dark:text-[#F4F7FF] flex flex-col font-sans selection:bg-[#00A8FF]/20 transition-colors duration-300">
      {/* Single, Unified SkillNova Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#0B1530] border-r border-[#DFE9F6] dark:border-white/10 flex flex-col transition-transform duration-300 shadow-sm ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ top: '64px' }}
        >
          {/* Student Profile Card */}
          <div className="p-4 border-b border-[#DFE9F6] dark:border-white/10">
            <div className="bg-[#F5F9FF] dark:bg-[#0D1833] rounded-2xl p-3 border border-[#DFE9F6] dark:border-white/10 flex items-center gap-3">
              <img
                src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt="Student Avatar"
                className="w-10 h-10 rounded-full object-cover border border-[#00A3FF]/30 shrink-0"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-black dark:text-white truncate">
                  {currentUser?.full_name || 'Enrolled Student'}
                </div>
                <div className="text-[10px] text-[#176BFF] truncate font-medium">
                  {currentUser?.branch || 'Computer Science & Eng'}
                </div>
                <div className="text-[10px] text-black dark:text-[#9BAAC5] font-semibold truncate">
                  {currentUser?.year_of_study || 'Batch 2027'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#176BFF] text-white shadow-md shadow-[#00A8FF]/25'
                        : 'text-black dark:text-[#9BAAC5] hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0D1833]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3FF] dark:bg-[#00A8FF]/20 text-[#176BFF] dark:text-[#00E5FF] border border-[#00A8FF]/20">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Visible Logout Option at the Bottom of Student Sidebar */}
          <div className="p-3 border-t border-[#DFE9F6] dark:border-white/10 bg-white dark:bg-[#0B1530] space-y-2">
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-200 dark:hover:border-red-800/30 transition"
              title="Sign Out of SkillNova"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>Logout</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-red-400" />
            </button>

            <div className="px-2 pt-1 text-[11px] flex items-center justify-between text-[#73839B] dark:text-[#9BAAC5]">
              <span className="font-medium">Active Batch 2027</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                VERIFIED
              </span>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-[#050816]/70 backdrop-blur-xs z-20 lg:hidden"
          />
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 bg-[#F5F9FF] dark:bg-[#050816] relative transition-colors duration-300">
          <Outlet />
        </main>
      </div>

      {/* Global Confirmation Modal */}
      <LogoutConfirmationModal />
    </div>
  );
};

export default StudentLayout;
