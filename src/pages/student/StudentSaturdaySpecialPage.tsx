import React, { useState, useEffect } from 'react';
import {
  Calendar, Video, Presentation, FileText, ExternalLink,
  Sparkles, Clock, Users, ArrowUpRight, CheckCircle2, Play
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { SaturdaySpecial } from '../../types';

export const StudentSaturdaySpecialPage: React.FC = () => {
  const [sessions, setSessions] = useState<SaturdaySpecial[]>([]);

  useEffect(() => {
    const update = () => {
      // Students only see released Saturday sessions
      setSessions(dataService.getSaturdaySpecials());
    };
    update();
    return dataService.subscribe(update);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#176BFF] via-[#00A3FF] to-[#00D9FF] p-6 md:p-8 text-white shadow-xl shadow-[#00A3FF]/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            WEEKEND MASTERCLASSES & WORKSHOPS
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Saturday Special Sessions
          </h1>
          <p className="text-xs md:text-sm text-white/90 leading-relaxed">
            Live technical deep-dives on Generative AI, Distributed Systems, WebAssembly, and Cloud Architecture with industry practitioners.
          </p>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-3xl border border-[#DFE9F6] p-6 space-y-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative h-48 rounded-2xl overflow-hidden border border-[#DFE9F6]">
                <img
                  src={session.cover_image || session.coverImageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'}
                  alt={session.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white font-mono border border-white/20">
                  {session.category}
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[#176BFF] text-[10px] font-bold text-white font-mono shadow-sm">
                  {session.session_date || session.date}
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-[#15243B]">{session.title}</h3>
                <div className="text-xs text-[#73839B] mt-0.5">
                  Speaker: <strong className="text-[#15243B]">{session.speaker}</strong> ({session.speaker_role})
                </div>
                <p className="text-xs text-[#73839B] mt-2 leading-relaxed">
                  {session.description}
                </p>
              </div>
            </div>

            {/* Links and Materials */}
            <div className="pt-3 border-t border-[#DFE9F6] flex flex-wrap items-center gap-2">
              {(session.recording_url || session.recordingUrl) && (
                <a
                  href={session.recording_url || session.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Session Recording</span>
                  <ExternalLink className="w-3 h-3 text-rose-400" />
                </a>
              )}

              {session.slides_url && (
                <a
                  href={session.slides_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 text-xs font-bold border border-amber-200 flex items-center gap-1.5 transition"
                >
                  <Presentation className="w-3.5 h-3.5" />
                  <span>Presentation PPT</span>
                  <ExternalLink className="w-3 h-3 text-amber-500" />
                </a>
              )}

              {(session.resources_url || session.resourceDocUrl) && (
                <a
                  href={session.resources_url || session.resourceDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-[#176BFF] text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Curriculum Material</span>
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentSaturdaySpecialPage;
