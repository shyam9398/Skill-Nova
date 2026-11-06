import React from 'react';
import { Video, ExternalLink, Calendar, Repeat, Radio } from 'lucide-react';

interface StudentLiveMeetingBannerProps {
  meetingUrl?: string;
  meetingTitle?: string;
  meetingTime?: string;
  isActive?: boolean;
  isDaily?: boolean;
}

export const StudentLiveMeetingBanner: React.FC<StudentLiveMeetingBannerProps> = ({
  meetingUrl,
  meetingTitle,
  meetingTime,
  isActive,
  isDaily = true
}) => {
  if (!isActive || !meetingUrl || !meetingUrl.trim()) {
    return null;
  }

  const handleJoin = () => {
    window.open(meetingUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="dark-section dark-card rounded-3xl bg-gradient-to-r from-[#0D1833] via-[#101F3B] to-[#0A1224] border border-[#00D9FF]/35 p-5 sm:p-6 shadow-xl shadow-[#00A8FF]/10 relative overflow-hidden text-white animate-fadeIn"
      style={{ color: '#FFFFFF' }}
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A8FF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-[#00D4B8]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              LIVE CLASS ROOM
            </span>

            {isDaily && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#00A8FF]/20 text-[#00E5FF] border border-[#00A8FF]/30 flex items-center gap-1">
                <Repeat className="w-3 h-3 text-[#00E5FF]" />
                Daily Recurring Class (Same Link Everyday)
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2" style={{ color: '#FFFFFF' }}>
            <Video className="w-5 h-5 text-[#00A8FF] shrink-0" />
            <span style={{ color: '#FFFFFF' }}>{meetingTitle || 'Daily Engineering Cohort Masterclass'}</span>
          </h2>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium" style={{ color: '#CBD5E1' }}>
            <Calendar className="w-4 h-4 text-[#00D4B8] shrink-0" />
            <span style={{ color: '#CBD5E1' }}>Class Time: <strong className="font-mono font-bold" style={{ color: '#FFFFFF' }}>{meetingTime || 'Everyday at 07:00 PM IST'}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          <button
            onClick={handleJoin}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#176BFF] to-[#00A8FF] hover:opacity-95 text-white text-xs sm:text-sm font-black shadow-xl shadow-[#00A8FF]/30 flex items-center gap-2 transition transform hover:scale-102 active:scale-98"
            style={{ color: '#FFFFFF' }}
          >
            <span style={{ color: '#FFFFFF' }}>Join Live Class Now</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

