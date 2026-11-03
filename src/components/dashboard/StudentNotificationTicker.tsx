import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone, ExternalLink, ArrowRight, CheckCircle2
} from 'lucide-react';
import type { TickerAnnouncement } from '../../types';

interface StudentNotificationTickerProps {
  announcements: TickerAnnouncement[];
}

export const StudentNotificationTicker: React.FC<StudentNotificationTickerProps> = ({ announcements }) => {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);

  const handleClick = (item: TickerAnnouncement) => {
    if (!item.link) return;
    if (item.is_external_link) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.link);
    }
  };

  const getBadgeStyle = (type: TickerAnnouncement['type']) => {
    switch (type) {
      case 'live_meeting':
        return 'bg-red-500/20 text-red-500 dark:text-red-400 border-red-500/40 animate-pulse';
      case 'video':
        return 'bg-[#00D4B8]/20 text-[#00A896] dark:text-[#00D4B8] border-[#00D4B8]/40';
      case 'ppt':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40';
      case 'notes':
        return 'bg-[#397BFF]/20 text-[#176BFF] dark:text-[#77B4FF] border-[#397BFF]/40';
      case 'interview':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40';
      case 'quiz':
        return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40';
    }
  };

  const getTypeLabel = (type: TickerAnnouncement['type']) => {
    switch (type) {
      case 'live_meeting':
        return 'LIVE CLASS';
      case 'video':
        return 'VIDEO';
      case 'ppt':
        return 'PPT';
      case 'notes':
        return 'NOTES';
      case 'interview':
        return 'INTERVIEW';
      case 'quiz':
        return 'QUIZ';
      default:
        return 'ANNOUNCEMENT';
    }
  };

  // Empty state handling
  if (!announcements || announcements.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-[#E0F2FE] dark:bg-[#0A1224] border border-[#BAE6FD] dark:border-white/10 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5 text-xs text-black dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-semibold">You're all caught up! No new course updates.</span>
        </div>
        <span className="text-[11px] font-mono font-bold text-[#00A8FF]">SkillNova Ticker</span>
      </div>
    );
  }

  // Duplicate items array so continuous CSS ticker scroll is perfectly seamless
  const displayItems = [...announcements, ...announcements];

  return (
    <div
      className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#E0F2FE] via-[#EAF4FE] to-[#E0F2FE] dark:from-[#0B1530] dark:via-[#0E1729] dark:to-[#0B1530] border border-[#BAE6FD] dark:border-[#00D9FF]/25 shadow-md shadow-[#00A8FF]/5 flex items-center select-none group transition-colors duration-200"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Student Course Updates Ticker"
    >
      {/* Left fixed badge (Fluorescent Blue/Cyan Accent) */}
      <div className="shrink-0 z-20 flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-[#176BFF] to-[#00A8FF] text-white font-mono font-black text-xs uppercase tracking-wider shadow-md shadow-[#00A8FF]/30">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <Megaphone className="w-3.5 h-3.5 hidden sm:inline-block" />
        <span className="whitespace-nowrap text-[11px]">COHORT UPDATES</span>
      </div>

      {/* Subtle left gradient feather */}
      <div className="absolute left-[125px] sm:left-[155px] top-0 bottom-0 w-8 bg-gradient-to-r from-[#E0F2FE] dark:from-[#0B1530] to-transparent z-10 pointer-events-none" />

      {/* Scrolling Content Track */}
      <div className="overflow-hidden flex-1 py-2.5">
        <div
          className={`animate-ticker flex items-center gap-8 ${isPaused ? 'ticker-paused' : ''}`}
          style={{ animationDuration: `${Math.max(25, announcements.length * 8)}s` }}
        >
          {displayItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => handleClick(item)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClick(item);
                }
              }}
              className={`inline-flex items-center gap-3 shrink-0 px-2 py-0.5 rounded-lg transition-transform hover:scale-102 focus:outline-none focus:ring-1 focus:ring-[#00A8FF] ${
                item.link ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
              }`}
              title={item.link ? 'Click to open resource / link' : undefined}
            >
              {/* Type Chip */}
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border tracking-wider shrink-0 ${getBadgeStyle(item.type)}`}>
                {getTypeLabel(item.type)}
              </span>

              {/* Announcement Title Text */}
              <span className="text-xs font-bold text-black dark:text-[#F0F5FF] tracking-tight">
                {item.title}
              </span>

              {/* Action Indicator Icon */}
              {item.is_external_link ? (
                <ExternalLink className="w-3.5 h-3.5 text-[#00A8FF] shrink-0" />
              ) : item.link ? (
                <ArrowRight className="w-3.5 h-3.5 text-[#00A8FF] shrink-0 opacity-80 group-hover:translate-x-0.5 transition-transform" />
              ) : null}

              {/* Separator Diamond */}
              <span className="text-[#00A8FF] text-[10px] opacity-60 ml-2 select-none">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle right gradient feather */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#E0F2FE] dark:from-[#0B1530] to-transparent z-10 pointer-events-none" />
    </div>
  );
};

