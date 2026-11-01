import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, MessageSquare, Rocket,
  Bell, User, Shield, Compass, Sparkles
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';

export const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();

  // Simplified and focused student navigation per Section 6
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { label: 'My Enrolled Courses', icon: BookOpen, path: '/student/courses' },
    { label: 'Discussion Room', icon: MessageSquare, path: '/student/discussion', badge: 'Community' },
    { label: 'Pathfinders', icon: Rocket, path: '/student/pathfinders', badge: 'Blast!' },
    { label: 'Notifications', icon: Bell, path: '/student/notifications' },
    { label: 'My Profile', icon: User, path: '/student/profile' },
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
          {/* Student Profile Card */}
          <div className="p-4 border-b border-[#DFE9F6]">
            <div className="bg-[#F5F9FF] rounded-2xl p-3 border border-[#DFE9F6] flex items-center gap-3">
              <img
                src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt="Student Avatar"
                className="w-10 h-10 rounded-full object-cover border border-[#00A3FF]/30 shrink-0"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-[#15243B] truncate">
                  {currentUser?.full_name || 'Enrolled Student'}
                </div>
                <div className="text-[10px] text-[#176BFF] truncate font-medium">
                  {currentUser?.branch || 'Computer Science & Eng'}
                </div>
                <div className="text-[10px] text-[#73839B] truncate">
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

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#DFE9F6] bg-[#F5F9FF]/60 text-xs text-[#73839B]">
            <div className="text-[11px] flex items-center justify-between">
              <span className="font-medium">Active Batch 2027</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
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
            className="fixed inset-0 bg-[#15243B]/40 backdrop-blur-xs z-20 lg:hidden"
          />
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F5F9FF]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
