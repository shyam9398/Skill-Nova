import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Clock, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import type { Notification } from '../../types';

export const StudentNotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      void dataService.syncNotificationsFromSupabase();
      setNotifications(dataService.getNotifications(currentUser.id));
      const unsub = dataService.subscribe(() => {
        setNotifications(dataService.getNotifications(currentUser.id));
      });
      return unsub;
    }
  }, [currentUser]);

  const handleMarkAllRead = () => {
    if (!currentUser) return;
    dataService.markAllNotificationsRead(currentUser.id);
    setNotifications(dataService.getNotifications(currentUser.id));
  };

  const handleNotificationClick = (notif: Notification) => {
    dataService.markNotificationRead(notif.id);
    setNotifications(dataService.getNotifications(currentUser?.id || ''));
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-[#DFE9F6]">
        <div>
          <h1 className="text-2xl font-black text-[#15243B] flex items-center gap-2">
            Notifications Center
            <span className="text-xs font-bold text-[#176BFF] px-2.5 py-0.5 rounded-full bg-[#EAF3FF] border border-[#00A3FF]/25 font-mono">
              Real-time
            </span>
          </h1>
          <p className="text-xs text-[#73839B] mt-0.5">
            Academic updates, published lecture notes, mentor feedback, and opportunity alerts.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#176BFF] bg-[#EAF3FF] hover:bg-[#DFE9F6] border border-[#00A3FF]/25 transition"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DFE9F6] p-12 text-center text-xs text-[#73839B] shadow-xs space-y-3">
          <Bell className="w-12 h-12 text-[#00A3FF] mx-auto opacity-40" />
          <h3 className="text-base font-bold text-[#15243B]">All caught up!</h3>
          <p className="text-xs text-[#73839B] max-w-sm mx-auto">
            You have no pending notifications. When your faculty publishes new materials or mentors reply to your doubts, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 shadow-xs ${
                notif.read ? 'bg-white border-[#DFE9F6]' : 'bg-[#EAF3FF]/40 border-[#00A3FF]/30'
              } hover:border-[#176BFF]`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#EAF3FF] text-[#176BFF] flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-[#176BFF]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-[#15243B]">{notif.title}</h3>
                  <span className="text-[10px] text-[#73839B] font-mono">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-[#73839B] mt-1 leading-relaxed">{notif.message}</p>
                {notif.link && (
                  <div className="text-[11px] font-bold text-[#176BFF] flex items-center gap-1 mt-2">
                    <span>View resource</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
