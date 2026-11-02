import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, Shield, GraduationCap, Users, LogOut,
  Menu, X, Sparkles, ChevronDown, Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import type { Notification } from '../../types';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, role, logout, switchRole } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(
    currentUser ? dataService.getNotifications(currentUser.id) : []
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout(); // Triggers confirmation dialog
  };

  const handleSwitchRole = (newRole: 'admin' | 'sub_admin' | 'student') => {
    switchRole(newRole);
    setShowRoleDropdown(false);
    if (newRole === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#DFE9F6] px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-all">
      {/* Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-[#EAF3FF] text-[#15243B] hover:bg-[#DFE9F6] border border-[#DFE9F6] transition"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5 text-[#176BFF]" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#176BFF] via-[#00A3FF] to-[#00D9FF] p-0.5 shadow-md shadow-[#00A3FF]/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#176BFF]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-[#15243B]">
                Skill<span className="text-[#176BFF]">Nova</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#00A3FF] border border-[#00A3FF]/25">
                Portal
              </span>
            </div>
            <p className="text-[10px] text-[#73839B] -mt-0.5 font-medium hidden sm:block">
              Your Path to Success Starts Here.
            </p>
          </div>
        </Link>
      </div>

      {/* Right Controls: Role Pill, Notifications, User Profile & Logout */}
      <div className="flex items-center gap-3">
        {/* Role Quick-Switch Pill for Evaluators */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EAF3FF] hover:bg-[#DFE9F6] border border-[#DFE9F6] text-xs font-semibold text-[#15243B] transition shadow-xs"
          >
            {role === 'admin' ? (
              <Shield className="w-3.5 h-3.5 text-[#176BFF]" />
            ) : role === 'sub_admin' ? (
              <Users className="w-3.5 h-3.5 text-[#00A3FF]" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 text-[#176BFF]" />
            )}
            <span className="capitalize">{role === 'sub_admin' ? 'Sub-Admin' : role}</span>
            <ChevronDown className="w-3 h-3 text-[#73839B]" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#DFE9F6] rounded-2xl shadow-xl p-2 z-50 animate-fadeIn">
              <div className="text-[11px] font-bold text-[#73839B] uppercase tracking-wider px-2.5 py-1.5">
                Switch Evaluation Role
              </div>
              <button
                onClick={() => handleSwitchRole('student')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  role === 'student'
                    ? 'bg-[#EAF3FF] text-[#176BFF]'
                    : 'text-[#15243B] hover:bg-[#F5F9FF]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#176BFF]" />
                  <span>Student (Aarav)</span>
                </div>
                {role === 'student' && <Check className="w-3.5 h-3.5 text-[#176BFF]" />}
              </button>

              <button
                onClick={() => handleSwitchRole('sub_admin')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  role === 'sub_admin'
                    ? 'bg-[#EAF3FF] text-[#00A3FF]'
                    : 'text-[#15243B] hover:bg-[#F5F9FF]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#00A3FF]" />
                  <span>Mentor / Sub-Admin</span>
                </div>
                {role === 'sub_admin' && <Check className="w-3.5 h-3.5 text-[#00A3FF]" />}
              </button>

              <button
                onClick={() => handleSwitchRole('admin')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  role === 'admin'
                    ? 'bg-[#EAF3FF] text-[#176BFF]'
                    : 'text-[#15243B] hover:bg-[#F5F9FF]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#176BFF]" />
                  <span>Super Admin</span>
                </div>
                {role === 'admin' && <Check className="w-3.5 h-3.5 text-[#176BFF]" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-white hover:bg-[#EAF3FF] border border-[#DFE9F6] text-[#73839B] hover:text-[#176BFF] transition shadow-xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#176BFF] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#DFE9F6] rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-3.5 bg-[#F5F9FF] border-b border-[#DFE9F6] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#176BFF]" />
                  <span className="font-bold text-xs text-[#15243B]">Notifications</span>
                  <span className="text-[10px] bg-[#EAF3FF] text-[#176BFF] px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                </div>
                {currentUser && (
                  <button
                    onClick={() => {
                      dataService.markAllNotificationsRead(currentUser.id);
                      setNotifications(dataService.getNotifications(currentUser.id));
                    }}
                    className="text-[11px] text-[#73839B] hover:text-[#176BFF] font-medium transition"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#DFE9F6]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#73839B]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        dataService.markNotificationRead(notif.id);
                        setNotifications(dataService.getNotifications(currentUser?.id || ''));
                        if (notif.link) {
                          navigate(notif.link);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3 text-xs cursor-pointer transition flex gap-2.5 items-start ${
                        notif.read ? 'bg-white text-[#73839B]' : 'bg-[#F5F9FF] text-[#15243B]'
                      } hover:bg-[#EAF3FF]`}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#00A3FF]" />
                      <div className="flex-1">
                        <div className="font-bold text-xs text-[#15243B]">{notif.title}</div>
                        <div className="text-[#73839B] mt-0.5 text-[11px] leading-relaxed">{notif.message}</div>
                        <div className="text-[10px] text-[#73839B] mt-1 font-mono">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#DFE9F6]">
          <div className="hidden md:block text-right">
            <div className="text-xs font-bold text-[#15243B] truncate max-w-[130px]">
              {currentUser?.full_name || 'SkillNova User'}
            </div>
            <div className="text-[10px] text-[#73839B] font-medium">
              {currentUser?.role === 'admin'
                ? 'Super Administrator'
                : currentUser?.role === 'sub_admin'
                ? 'Faculty Mentor'
                : currentUser?.year_of_study || 'Student'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-xl text-[#73839B] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
