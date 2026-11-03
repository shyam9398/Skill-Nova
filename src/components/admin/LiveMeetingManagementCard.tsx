import React, { useState, useEffect } from 'react';
import {
  Video, ExternalLink, Calendar, Repeat, CheckCircle2,
  AlertCircle, Radio, Clock, Sparkles, Link2, RefreshCw
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { HomepageSettings } from '../../types';

export const LiveMeetingManagementCard: React.FC = () => {
  const [settings, setSettings] = useState<HomepageSettings>(dataService.getHomepageSettings());
  const [meetingUrl, setMeetingUrl] = useState(settings.live_meeting_url || '');
  const [meetingTitle, setMeetingTitle] = useState(settings.live_meeting_title || 'Daily Engineering Cohort Masterclass');
  const [meetingTime, setMeetingTime] = useState(settings.live_meeting_time || 'Everyday at 07:00 PM IST');
  const [isActive, setIsActive] = useState(settings.live_meeting_is_active || false);
  const [isDaily, setIsDaily] = useState(settings.live_meeting_is_daily_recurring !== false);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    void dataService.syncHomepageFromSupabase();
    const update = () => {
      const s = dataService.getHomepageSettings();
      setSettings(s);
      setMeetingUrl(s.live_meeting_url || '');
      setMeetingTitle(s.live_meeting_title || 'Daily Engineering Cohort Masterclass');
      setMeetingTime(s.live_meeting_time || 'Everyday at 07:00 PM IST');
      setIsActive(s.live_meeting_is_active || false);
      setIsDaily(s.live_meeting_is_daily_recurring !== false);
    };
    return dataService.subscribe(update);
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await dataService.updateLiveMeeting({
        url: meetingUrl.trim(),
        title: meetingTitle.trim(),
        time: meetingTime.trim(),
        isActive,
        isDaily
      });
      setToast({
        type: 'success',
        message: 'Live meeting link updated and broadcasted to all student dashboards & ticker in real time!'
      });
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err?.message || 'Failed to update meeting link.'
      });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2E47]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#176BFF] to-[#00A8FF] flex items-center justify-center text-white shadow-lg shadow-[#00A8FF]/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00A8FF]">
                LIVE CLASSROOM BROADCAST
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-white/10 text-[#9BAAC2] border-white/15'
              }`}>
                {isActive ? 'Live / Active' : 'Offline'}
              </span>
            </div>
            <h3 className="text-lg font-black text-[#F0F5FF]">
              Daily Live Meeting Link & Timestamp
            </h3>
          </div>
        </div>

        {meetingUrl && (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-[#15233A] hover:bg-[#1F2E47] border border-white/10 text-xs font-bold text-[#00A8FF] flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <span>Test Meet Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {toast && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
          toast.type === 'success'
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/15 border border-red-500/30 text-red-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#F0F5FF] block mb-1.5 flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5 text-[#00A8FF]" />
              Meeting URL (Google Meet / Zoom / MS Teams) <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="e.g. https://meet.google.com/abc-defg-hij"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] font-mono outline-none focus:border-[#00A8FF] transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#F0F5FF] block mb-1.5 flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-[#00A8FF]" />
              Meeting Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Daily Engineering Cohort Masterclass"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#00A8FF] transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#F0F5FF] block mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#00D4B8]" />
              Meeting Schedule / Timestamp (IST)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Everyday at 07:00 PM IST or 03 Nov 2026, 07:00 PM IST"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#00A8FF] transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-[#15233A] rounded-xl border border-white/5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Resume Everyday</span>
              <span className="text-[11px] text-[#9BAAC2] block">Keep same link active for daily classes</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDaily}
                onChange={(e) => setIsDaily(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A8FF]"></div>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#00A8FF] focus:ring-[#00A8FF] bg-[#15233A] border-[#1F2E47]"
            />
            <span className="text-xs font-bold text-white">
              Broadcast Live Session to All Student Dashboards & Ticker
            </span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A8FF] hover:opacity-95 text-white text-xs font-bold transition shadow-lg shadow-[#00A8FF]/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Broadcasting...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save & Broadcast Link</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

