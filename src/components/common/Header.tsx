import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell, Shield, GraduationCap, Users, LogOut,
  Menu, Sparkles, ChevronDown, Check, Sun, Moon, User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { dataService } from '../../services/dataService';
import type { Notification } from '../../types';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>(
    currentUser ? dataService.getNotifications(currentUser.id) : []
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const notificationsRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout(); // Triggers confirmation dialog
  };

  // Close floating popovers on page navigation
  useEffect(() => {
    setShowNotifications(false);
    setShowRoleDropdown(false);
  }, [location.pathname]);

  // Outside click and Escape key listeners
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(target)) {
        setShowRoleDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="h-16 bg-white/95 dark:bg-[#070D1E]/95 backdrop-blur-md border-b border-[#DFE9F6] dark:border-white/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-all">
      {/* Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-[#EAF3FF] dark:bg-[#0B1530] text-[#15243B] dark:text-[#F4F7FF] hover:bg-[#DFE9F6] dark:hover:bg-[#132247] border border-[#DFE9F6] dark:border-white/10 transition"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5 text-[#176BFF] dark:text-[#00A8FF]" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#176BFF] via-[#00A3FF] to-[#00D9FF] p-0.5 shadow-md shadow-[#00A3FF]/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white dark:bg-[#0D1833] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#176BFF] dark:text-[#00A8FF]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-black dark:text-[#F4F7FF]">
                Skill<span className="text-[#176BFF] dark:text-[#00A8FF]">Nova</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EAF3FF] dark:bg-[#00A8FF]/20 text-[#00A3FF] dark:text-[#00E5FF] border border-[#00A3FF]/25">
                Portal
              </span>
            </div>
            <p className="text-[10px] text-black dark:text-[#9BAAC5] -mt-0.5 font-semibold hidden sm:block">
              Your Path to Success Starts Here.
            </p>
          </div>
        </Link>
      </div>

      {/* Right Controls: Role Pill, Notifications, User Profile & Logout */}
      <div className="flex items-center gap-3">
        {/* Role Identity Badge & Menu */}
        <div ref={roleDropdownRef} className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EAF3FF] dark:bg-[#0B1530] hover:bg-[#DFE9F6] dark:hover:bg-[#132247] border border-[#DFE9F6] dark:border-white/10 text-xs font-semibold text-[#15243B] dark:text-[#F4F7FF] transition shadow-xs"
          >
            {role === 'admin' ? (
              <Shield className="w-3.5 h-3.5 text-[#176BFF] dark:text-[#00A8FF]" />
            ) : role === 'sub_admin' ? (
              <Users className="w-3.5 h-3.5 text-[#00A3FF]" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 text-[#176BFF] dark:text-[#00A8FF]" />
            )}
            <span className="capitalize">{role === 'sub_admin' ? 'Sub-Admin' : role}</span>
            <ChevronDown className="w-3 h-3 text-[#73839B] dark:text-[#9BAAC5]" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0D1833] border border-[#DFE9F6] dark:border-white/10 rounded-2xl shadow-xl p-3 z-50 animate-fadeIn space-y-2">
              <div className="px-2 py-1">
                <span className="text-[10px] font-bold text-black dark:text-[#9BAAC5] uppercase tracking-wider block font-mono">
                  Signed in Account
                </span>
                <div className="text-xs font-bold text-black dark:text-[#F4F7FF] truncate">
                  {currentUser?.full_name || 'SkillNova User'}
                </div>
                <div className="text-[11px] text-black dark:text-[#9BAAC5] font-mono truncate font-semibold">
                  {currentUser?.email || ''}
                </div>
              </div>

              <div className="pt-2 border-t border-[#DFE9F6] dark:border-white/10 space-y-1">
                {role === 'student' ? (
                  <Link
                    to="/student/profile"
                    onClick={() => setShowRoleDropdown(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#15243B] dark:text-[#F4F7FF] hover:bg-[#F5F9FF] dark:hover:bg-[#132247] transition"
                  >
                    <UserIcon className="w-4 h-4 text-[#00A3FF]" />
                    <span>My Profile & Settings</span>
                  </Link>
                ) : (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setShowRoleDropdown(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#15243B] dark:text-[#F4F7FF] hover:bg-[#F5F9FF] dark:hover:bg-[#132247] transition"
                  >
                    <Shield className="w-4 h-4 text-[#00A3FF]" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowRoleDropdown(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Notifications Dropdown Popover */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-[#0B1530] hover:bg-[#F5F9FF] dark:hover:bg-[#132247] border border-[#DFE9F6] dark:border-white/10 text-[#73839B] dark:text-[#9BAAC5] hover:text-[#176BFF] dark:hover:text-[#00A8FF] transition relative shadow-xs"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0D1833] border border-[#DFE9F6] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-3.5 bg-[#F5F9FF] dark:bg-[#0B1530] border-b border-[#DFE9F6] dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#176BFF] dark:text-[#00A8FF]" />
                  <span className="font-bold text-xs text-[#15243B] dark:text-[#F4F7FF]">Notifications</span>
                  <span className="text-[10px] bg-[#EAF3FF] dark:bg-[#00A8FF]/20 text-[#176BFF] dark:text-[#00E5FF] px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                </div>
                {currentUser && (
                  <button
                    onClick={() => {
                      dataService.markAllNotificationsRead(currentUser.id);
                      setNotifications(dataService.getNotifications(currentUser.id));
                    }}
                    className="text-[11px] text-[#73839B] dark:text-[#9BAAC5] hover:text-[#176BFF] dark:hover:text-[#00A8FF] font-medium transition"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#DFE9F6] dark:divide-white/10">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#73839B] dark:text-[#9BAAC5]">
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
                        notif.read ? 'bg-white dark:bg-[#0D1833] text-[#73839B] dark:text-[#9BAAC5]' : 'bg-[#F5F9FF] dark:bg-[#0B1530] text-[#15243B] dark:text-[#F4F7FF]'
                      } hover:bg-[#EAF3FF] dark:hover:bg-[#132247]`}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#00A3FF]" />
                      <div className="flex-1">
                        <div className="font-bold text-xs text-[#15243B] dark:text-[#F4F7FF]">{notif.title}</div>
                        <div className="text-[#73839B] dark:text-[#9BAAC5] mt-0.5 text-[11px] leading-relaxed">{notif.message}</div>
                        <div className="text-[10px] text-[#73839B] dark:text-[#9BAAC5] mt-1 font-mono">
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

        {/* Global Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center shrink-0 shadow-xs ${
            theme === 'dark'
              ? 'bg-[#0D1833] hover:bg-[#132247] border-white/10 text-amber-300 hover:text-amber-200 shadow-[0_0_12px_rgba(255,215,0,0.2)]'
              : 'bg-white hover:bg-[#EAF3FF] border-[#DFE9F6] text-[#176BFF] hover:text-[#00A8FF]'
          }`}
          title={theme === 'dark' ? 'Switch to Clean Light Theme' : 'Switch to Cosmic Dark Theme'}
          aria-label="Toggle dark/light theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#DFE9F6] dark:border-white/10">
          <div className="hidden md:block text-right">
            <div className="text-xs font-bold text-black dark:text-[#F4F7FF] truncate max-w-[130px]">
              {currentUser?.full_name || 'SkillNova User'}
            </div>
            <div className="text-[10px] text-black dark:text-[#9BAAC5] font-semibold">
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
            className="p-2 rounded-xl text-[#73839B] dark:text-[#9BAAC5] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-200 dark:hover:border-red-800/30 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
