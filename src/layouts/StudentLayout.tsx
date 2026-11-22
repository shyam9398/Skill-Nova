import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, MessageSquare, Rocket,
  Bell, User, Code2, HelpCircle, LogOut, CheckCircle2, ChevronRight,
  Briefcase, Calendar, Layers, Sparkles, PanelLeftClose, PanelLeftOpen,
  ChevronLeft
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import { LogoutConfirmationModal } from '../components/common/LogoutConfirmationModal';

export const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('skillnova_student_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('skillnova_student_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  // Updated student navigation per Section 12:
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { label: 'My Enrolled Courses', icon: BookOpen, path: '/student/courses' },
    { label: 'Python Code Lab', icon: Code2, path: '/student/python-lab', badge: 'Python 3' },
    { label: 'Discussion Room', icon: MessageSquare, path: '/student/discussion', badge: 'Community' },
    { label: 'Quizzes', icon: HelpCircle, path: '/student/quizzes', badge: 'Drill' },
    { label: 'Flashcard Decks', icon: Sparkles, path: '/student/flashcards', badge: 'Flip' },
    { label: 'Opportunities', icon: Briefcase, path: '/student/opportunities', badge: 'Careers' },
    { label: 'Saturday Special', icon: Calendar, path: '/student/saturday-special', badge: 'Live' },
    { label: 'Pathfinders', icon: Rocket, path: '/student/pathfinders', badge: 'Blast!' },
    { label: 'Notifications', icon: Bell, path: '/student/notifications' },
    { label: 'My Profile', icon: User, path: '/student/profile' },
  ];

  return (
    <div
      className={`h-screen w-screen max-w-full overflow-hidden bg-[#F5F9FF] dark:bg-[#050816] text-slate-900 dark:text-[#F4F7FF] flex flex-col font-sans selection:bg-[#00A8FF]/20 transition-colors duration-300 student-layout-root ${
        isCollapsed ? 'sidebar-collapsed' : ''
      }`}
      style={{
        '--header-height': '4rem',
        '--sidebar-width': isCollapsed ? '5rem' : '16rem',
      } as React.CSSProperties}
    >
      {/* Single, Unified SkillNova Header */}
      <div className="shrink-0 z-40">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Responsive Stationary & Collapsible Sidebar */}
        <aside
          className={`fixed lg:relative inset-y-0 left-0 z-30 h-full bg-white dark:bg-[#0B1530] border-r border-[#DFE9F6] dark:border-white/10 flex flex-col shrink-0 transition-all duration-300 shadow-sm ${
            isCollapsed ? 'w-64 lg:w-20' : 'w-64'
          } ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Collapse/Expand Toggle Header Button */}
          <div className="hidden lg:flex items-center justify-between px-3.5 py-2.5 border-b border-[#DFE9F6] dark:border-white/10 bg-slate-50/70 dark:bg-[#080E21]">
            {!isCollapsed && (
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-[#9BAAC5]">
                STUDENT PORTAL
              </span>
            )}
            <button
              type="button"
              onClick={toggleCollapsed}
              className={`p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-[#9BAAC5] hover:text-slate-900 dark:hover:text-white transition ${
                isCollapsed ? 'mx-auto' : ''
              }`}
              title={isCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse Sidebar to Icons'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-[#176BFF] dark:text-[#00E5FF]" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Student Profile Card */}
          <div className={`shrink-0 border-b border-[#DFE9F6] dark:border-white/10 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            <div
              className={`bg-[#F5F9FF] dark:bg-[#0D1833] rounded-2xl border border-[#DFE9F6] dark:border-white/10 flex items-center transition-all ${
                isCollapsed ? 'p-2 justify-center' : 'p-3 gap-3'
              }`}
              title={currentUser?.full_name || 'Enrolled Student'}
            >
              <img
                src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt="Student Avatar"
                className="w-10 h-10 rounded-full object-cover border border-[#00A3FF]/30 shrink-0 shadow-xs"
              />
              {!isCollapsed && (
                <div className="overflow-hidden min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser?.full_name || 'Enrolled Student'}
                  </div>
                  <div className="text-[10px] text-[#176BFF] truncate font-medium">
                    {currentUser?.branch || 'Computer Science & Eng'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-[#9BAAC5] font-semibold truncate">
                    {currentUser?.year_of_study || 'Batch 2027'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl text-xs font-bold transition-all group relative ${
                      isCollapsed
                        ? 'justify-center p-3'
                        : 'justify-between px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-[#176BFF] text-white shadow-md shadow-[#00A8FF]/25'
                        : 'text-slate-600 dark:text-[#9BAAC5] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0D1833]'
                    }`
                  }
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3FF] dark:bg-[#00A8FF]/20 text-[#176BFF] dark:text-[#00E5FF] border border-[#00A8FF]/20 shrink-0">
                      {item.badge}
                    </span>
                  )}

                  {/* Dot indicator when collapsed if item has badge */}
                  {isCollapsed && item.badge && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00E5FF] ring-2 ring-white dark:ring-[#0B1530]" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Visible Logout Option at the Bottom of Student Sidebar */}
          <div className="shrink-0 p-3 border-t border-[#DFE9F6] dark:border-white/10 bg-white dark:bg-[#0B1530] space-y-2">
            <button
              onClick={() => logout()}
              className={`w-full flex items-center rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-200 dark:hover:border-red-800/30 transition ${
                isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
              }`}
              title="Sign Out of SkillNova"
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </div>
              {!isCollapsed && <ChevronRight className="w-3.5 h-3.5 text-red-400" />}
            </button>

            {!isCollapsed && (
              <div className="px-2 pt-1 text-[11px] flex items-center justify-between text-[#73839B] dark:text-[#9BAAC5]">
                <span className="font-medium">Active Batch 2027</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  VERIFIED
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="sidebar-drawer-backdrop fixed inset-0 bg-[#050816]/70 backdrop-blur-xs z-20 lg:hidden"
          />
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 h-full overflow-y-auto p-3 sm:p-4 md:p-8 bg-[#F5F9FF] dark:bg-[#050816] relative transition-colors duration-300">
          <Outlet />
        </main>
      </div>

      {/* Global Confirmation Modal */}
      <LogoutConfirmationModal />
    </div>
  );
};

export default StudentLayout;
