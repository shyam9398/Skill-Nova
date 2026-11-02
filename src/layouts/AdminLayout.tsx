import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, BookOpen, UploadCloud,
  Briefcase, Calendar, MessageSquare, Rocket, Settings,
  Shield, Sparkles, Globe, UserPlus, LogOut, ChevronRight, HelpCircle
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import { LogoutConfirmationModal } from '../components/common/LogoutConfirmationModal';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, role, logout } = useAuth();

  const isSuperAdmin = role === 'admin';

  // Navigation configured per Section 11 & Homepage Management requirements
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Homepage Management', icon: Globe, path: '/admin/homepage', badge: 'Public Hub' },
    { label: 'Access Requests', icon: UserPlus, path: '/admin/access-requests', badge: 'Approval' },
    { label: 'Student Management', icon: Users, path: '/admin/students' },
    ...(isSuperAdmin ? [{ label: 'Sub-admin Management', icon: UserCheck, path: '/admin/subadmins' }] : []),
    { label: 'Course Management', icon: BookOpen, path: '/admin/courses' },
    { label: 'Learning Resources', icon: UploadCloud, path: '/admin/resources' },
    { label: 'Quiz Management', icon: HelpCircle, path: '/admin/quizzes', badge: 'Evaluations' },
    { label: 'Opportunities', icon: Briefcase, path: '/admin/opportunities' },
    { label: 'Saturday Special', icon: Calendar, path: '/admin/saturday-special' },
    { label: 'Discussion Management', icon: MessageSquare, path: '/admin/discussions', badge: 'Mentorship' },
    { label: 'Pathfinders', icon: Rocket, path: '/admin/pathfinders', badge: 'Blast!' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F9FF] text-[#15243B] flex flex-col font-sans selection:bg-[#00A3FF]/20">
      {/* Single, Unified SkillNova Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-[#DFE9F6] flex flex-col transition-transform duration-300 shadow-sm ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ top: '64px' }}
        >
          {/* Admin Role Status Card */}
          <div className="p-4 border-b border-[#DFE9F6]">
            <div className="bg-[#F5F9FF] rounded-2xl p-3 border border-[#DFE9F6] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#EAF3FF] text-[#176BFF] border border-[#00A3FF]/25">
                <Shield className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-[#15243B] truncate">
                  {isSuperAdmin ? 'Super Administrator' : 'Academic Sub-Admin'}
                </div>
                <div className="text-[10px] text-[#73839B] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Full Content Management
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
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#176BFF] text-white shadow-md shadow-[#00A3FF]/25'
                        : 'text-[#73839B] hover:text-[#15243B] hover:bg-[#F5F9FF]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#176BFF] border border-[#00A3FF]/20">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer with Logout Button */}
          <div className="p-3 border-t border-[#DFE9F6] bg-white space-y-2">
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
              title="Sign Out of Admin Portal"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Logout Admin</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-red-400" />
            </button>

            <div className="px-2 pt-1 flex items-center justify-between text-[11px] text-[#73839B]">
              <span className="font-medium">SkillNova Admin Hub</span>
              <span className="text-[#176BFF] font-mono font-bold">SECURE</span>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-[#15243B]/40 backdrop-blur-xs z-20 lg:hidden"
          />
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F5F9FF]">
          <Outlet />
        </main>
      </div>

      <LogoutConfirmationModal />
    </div>
  );
};

export default AdminLayout;
