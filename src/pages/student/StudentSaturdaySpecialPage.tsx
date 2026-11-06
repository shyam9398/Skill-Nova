import React, { useState, useEffect } from 'react';
import {
  Calendar, Video, Presentation, FileText, ExternalLink,
  Sparkles, Clock, Users, ArrowUpRight, CheckCircle2, Play,
  ArrowLeft, BookOpen, Link as LinkIcon, Download, Eye, Layers
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { EmbeddedVideoPlayer } from '../../components/resource/EmbeddedVideoPlayer';
import { SkillNovaDocumentViewer } from '../../components/resource/SkillNovaDocumentViewer';
import type { SaturdaySpecial } from '../../types';

export const StudentSaturdaySpecialPage: React.FC = () => {
  const [sessions, setSessions] = useState<SaturdaySpecial[]>([]);
  const [activeSession, setActiveSession] = useState<SaturdaySpecial | null>(null);

  useEffect(() => {
    void dataService.syncSaturdaySpecialsFromSupabase();
    const update = () => {
      // Students only see released Saturday sessions
      const all = dataService.getSaturdaySpecials();
      const released = all.filter(s => s.release_status !== 'hold' && s.is_published !== false);
      setSessions(released);
    };
    update();
    return dataService.subscribe(update);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-6xl mx-auto">
      {/* If an active session is selected, display the detailed session workshop portal */}
      {activeSession ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Back Button */}
          <button
            onClick={() => setActiveSession(null)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#00A3FF] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Saturday Special Workshops</span>
          </button>

          {/* Session Banner */}
          <div className="dark-section dark-card bg-[#101A2D] rounded-3xl border border-[#1F2E47] p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full font-bold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/30 font-mono">
                {activeSession.category}
              </span>
              <span className="text-[#9BAAC2] font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#397BFF]" /> {activeSession.session_date || activeSession.date || 'Live Session'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#F0F5FF] tracking-tight">
              {activeSession.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#9BAAC2] leading-relaxed max-w-3xl">
              {activeSession.description}
            </p>

            {activeSession.speaker && (
              <div className="text-xs text-slate-400 font-mono">
                Session Mentor: <strong className="text-white">{activeSession.speaker}</strong> {activeSession.speaker_role ? `(${activeSession.speaker_role})` : ''}
              </div>
            )}
          </div>

          {/* 1. SESSION RECORDING (EmbeddedVideoPlayer with Expand / Theatre Mode) */}
          {(activeSession.recording_url || activeSession.recordingUrl) && (
            <div className="dark-card bg-[#101A2D] rounded-3xl border border-[#1F2E47] p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F0F5FF]">Session Masterclass Recording</h3>
                    <p className="text-xs text-[#9BAAC2]">High-definition full length workshop lecture</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Full Session
                </span>
              </div>

              <EmbeddedVideoPlayer
                url={activeSession.recording_url || activeSession.recordingUrl || ''}
                title={activeSession.title}
                subtitle={`${activeSession.category} • Saturday Special`}
              />
            </div>
          )}

          {/* 2. PPT SLIDES (SkillNovaDocumentViewer with slide navigation) */}
          {(activeSession.ppt_url || activeSession.slides_url) && (
            <div className="dark-card bg-[#101A2D] rounded-3xl border border-[#1F2E47] p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Presentation className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F0F5FF]">Presentation Slide Deck</h3>
                    <p className="text-xs text-[#9BAAC2]">In-platform slide viewer with controls</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Interactive PPT
                </span>
              </div>

              <SkillNovaDocumentViewer
                url={activeSession.ppt_url || activeSession.slides_url || ''}
                title={`${activeSession.title} - Slide Deck`}
                resourceType="ppt"
              />
            </div>
          )}

          {/* 3. NOTES / PDF */}
          {(activeSession.notes_url || activeSession.doc_url) && (
            <div className="dark-card bg-[#101A2D] rounded-3xl border border-[#1F2E47] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#F0F5FF]">Notes / PDF Documents</h4>
                    <p className="text-xs text-[#9BAAC2]">Official lecture notes, handouts, and session whitepaper</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Notes & PDF
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {activeSession.notes_url && (
                  <a
                    href={activeSession.notes_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-[#15233A] hover:bg-[#1F2E47] text-[#77B4FF] border border-white/5 flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#397BFF]/20 text-[#397BFF]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-[#77B4FF] transition">
                          Session Lecture Notes
                        </div>
                        <div className="text-[10px] text-[#9BAAC2]">Google Docs / Markdown</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#9BAAC2] group-hover:text-white transition" />
                  </a>
                )}

                {activeSession.doc_url && (
                  <a
                    href={activeSession.doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl bg-[#15233A] hover:bg-[#1F2E47] text-emerald-300 border border-white/5 flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                          Reference PDF Document
                        </div>
                        <div className="text-[10px] text-[#9BAAC2]">Downloadable Reference Material</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#9BAAC2] group-hover:text-white transition" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SESSIONS CATALOG GRID */
        <>
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
          {sessions.length === 0 ? (
            <div className="dark-card bg-[#101A2D] border border-white/10 rounded-3xl p-12 text-center text-[#9BAAC2] space-y-3">
              <Sparkles className="w-10 h-10 text-[#397BFF] mx-auto opacity-60" />
              <h4 className="text-base font-bold text-[#F0F5FF]">No Saturday Specials Scheduled Yet</h4>
              <p className="text-xs">Upcoming workshops will appear here as soon as published by instructors.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="dark-card bg-[#101A2D] rounded-3xl border border-[#1F2E47] overflow-hidden p-6 space-y-4 shadow-xl hover:border-[#397BFF]/40 transition flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="relative h-48 rounded-2xl overflow-hidden border border-[#1F2E47]">
                      <img
                        src={session.cover_image || session.coverImageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'}
                        alt={session.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold text-white font-mono border border-white/20">
                        {session.category}
                      </div>
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[#176BFF] text-[10px] font-bold text-white font-mono shadow-md">
                        {session.session_date || session.date}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-[#F0F5FF] group-hover:text-[#77B4FF] transition">
                        {session.title}
                      </h3>
                      {session.speaker && (
                        <div className="text-xs text-[#9BAAC2] mt-0.5 font-mono">
                          Speaker: <strong className="text-white">{session.speaker}</strong> {session.speaker_role ? `(${session.speaker_role})` : ''}
                        </div>
                      )}
                      <p className="text-xs text-[#9BAAC2] mt-2 line-clamp-2 leading-relaxed">
                        {session.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Launch Workshop Portal */}
                  <div className="pt-3 border-t border-[#1F2E47] flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-[#9BAAC2]">
                      {(session.recording_url || session.recordingUrl) && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          Recording
                        </span>
                      )}
                      {(session.ppt_url || session.slides_url) && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          PPT
                        </span>
                      )}
                      {(session.notes_url || session.doc_url) && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          Notes / PDF
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveSession(session)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#00A3FF]/20 transition hover:scale-102"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Session</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentSaturdaySpecialPage;
