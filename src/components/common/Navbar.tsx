import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, Shield, GraduationCap, Users, LogOut, CheckCircle2,
  ExternalLink, Sparkles, Menu, X
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { User, Notification } from '../../types';

export const RoleSwitcherBanner: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(dataService.getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    return dataService.subscribe(() => {
      setCurrentUser(dataService.getCurrentUser());
    });
  }, []);

  const handleSwitch = (role: 'admin' | 'sub_admin' | 'student') => {
    dataService.switchRole(role);
    const updated = dataService.getCurrentUser();
    if (updated?.role === 'admin' || updated?.role === 'sub_admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="bg-[#101A2D] border-b border-[#1F2E47] px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 z-50">
      <div className="flex items-center gap-2 text-[#9BAAC2]">
        <span className="w-2 h-2 rounded-full bg-[#397BFF] animate-pulse" />
        <span className="font-medium text-[#F0F5FF]">SkillNova Simulation Sandbox:</span>
        <span className="hidden sm:inline">Active User:</span>
        <span className="text-[#77B4FF] font-semibold bg-[#15233A] px-2 py-0.5 rounded border border-[#1F2E47]">
          {currentUser ? `${currentUser.full_name} (${currentUser.role.toUpperCase()})` : 'Guest'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[#9BAAC2] mr-1 hidden md:inline">Quick Role Switch:</span>
        <button
          onClick={() => handleSwitch('admin')}
          className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 font-medium ${
            currentUser?.role === 'admin'
              ? 'bg-[#397BFF] text-white shadow-[0_0_12px_rgba(57,123,255,0.5)]'
              : 'bg-[#15233A] text-[#9BAAC2] hover:text-[#F0F5FF] hover:bg-[#1F2E47]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </button>

        <button
          onClick={() => handleSwitch('sub_admin')}
          className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 font-medium ${
            currentUser?.role === 'sub_admin'
              ? 'bg-[#397BFF] text-white shadow-[0_0_12px_rgba(57,123,255,0.5)]'
              : 'bg-[#15233A] text-[#9BAAC2] hover:text-[#F0F5FF] hover:bg-[#1F2E47]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Sub-Admin / Mentor</span>
        </button>

        <button
          onClick={() => handleSwitch('student')}
          className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 font-medium ${
            currentUser?.role === 'student'
              ? 'bg-[#397BFF] text-white shadow-[0_0_12px_rgba(57,123,255,0.5)]'
              : 'bg-[#15233A] text-[#9BAAC2] hover:text-[#F0F5FF] hover:bg-[#1F2E47]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student</span>
        </button>
      </div>
    </div>
  );
};

export const AppHeader: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(dataService.getCurrentUser());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => {
      const user = dataService.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setNotifications(dataService.getNotifications(user.id));
      }
    };
    update();
    return dataService.subscribe(update);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    dataService.logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-[#080E1C]/90 backdrop-blur-md border-b border-[#1F2E47] px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg bg-[#15233A] text-[#9BAAC2] hover:text-white border border-[#1F2E47]"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#397BFF] to-[#101A2D] p-0.5 shadow-[0_0_15px_rgba(57,123,255,0.4)] group-hover:shadow-[0_0_20px_rgba(57,123,255,0.7)] transition-all">
            <div className="w-full h-full bg-[#080E1C] rounded-[6px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#77B4FF] animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-[#F0F5FF]">Skill<span className="text-[#397BFF]">Nova</span></span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/30">
                3D LMS
              </span>
            </div>
            <p className="text-[10px] text-[#9BAAC2] hidden sm:block -mt-1 font-medium">Learn. Build. Explore. Grow.</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-[#15233A] text-[#9BAAC2] hover:text-white hover:bg-[#1F2E47] border border-[#1F2E47] transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#397BFF] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(57,123,255,0.8)]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#101A2D] border border-[#1F2E47] rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-3 bg-[#15233A] border-b border-[#1F2E47] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#397BFF]" />
                  <span className="font-semibold text-sm text-[#F0F5FF]">Notifications</span>
                  <span className="text-xs bg-[#397BFF]/20 text-[#77B4FF] px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                </div>
                {currentUser && (
                  <button
                    onClick={() => {
                      dataService.markAllNotificationsRead(currentUser.id);
                    }}
                    className="text-xs text-[#9BAAC2] hover:text-[#77B4FF] transition"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#1F2E47]/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#9BAAC2]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        dataService.markNotificationRead(notif.id);
                        if (notif.link) {
                          navigate(notif.link);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3 text-xs cursor-pointer transition flex gap-2.5 items-start ${
                        notif.read ? 'bg-transparent text-[#9BAAC2]' : 'bg-[#15233A]/70 text-[#F0F5FF]'
                      } hover:bg-[#15233A]`}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#397BFF]" />
                      <div className="flex-1">
                        <div className="font-semibold text-[13px]">{notif.title}</div>
                        <div className="text-[#9BAAC2] mt-0.5 text-[11px] leading-relaxed">{notif.message}</div>
                        <div className="text-[10px] text-[#9BAAC2]/70 mt-1">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge & Actions */}
        {currentUser ? (
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#1F2E47]">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={currentUser.full_name}
              className="w-8 h-8 rounded-full object-cover border border-[#397BFF]/40"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-[#F0F5FF] leading-tight">{currentUser.full_name}</div>
              <div className="text-[10px] text-[#77B4FF] uppercase tracking-wider font-bold">
                {currentUser.role === 'admin' ? 'Super Admin' : currentUser.role === 'sub_admin' ? 'Academic Sub-Admin' : 'Student'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#9BAAC2] hover:text-red-400 hover:bg-[#15233A] transition ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/student/login"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#15233A] text-[#F0F5FF] hover:bg-[#1F2E47] border border-[#1F2E47] transition"
            >
              Student Login
            </Link>
            <Link
              to="/admin/login"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#397BFF] text-white hover:bg-[#2868ea] shadow-[0_0_12px_rgba(57,123,255,0.4)] transition"
            >
              Admin Portal
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
