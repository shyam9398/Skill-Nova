import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Play, 
  FileText, 
  ExternalLink, 
  Tag, 
  Search,
  Filter,
  CheckCircle,
  Video
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { SaturdaySpecialSession } from '../../types';

export const StudentSaturdaySpecialPage: React.FC = () => {
  const [sessions] = useState<SaturdaySpecialSession[]>(dataService.getSaturdaySpecialSessions());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(sessions.map(s => s.category)))];

  const filtered = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(search.toLowerCase()) ||
                          session.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || session.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#101A2D] via-[#15233A] to-[#101A2D] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#77B4FF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#397BFF]" />
              Beyond the Classroom
            </span>
            <span className="text-xs text-[#9BAAC2] font-mono">Industry Innovation Series</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F0F5FF]">
            Saturday Special Technology Sessions
          </h1>
          <p className="text-xs sm:text-sm text-[#9BAAC2] leading-relaxed">
            Every weekend, we explore breakthrough technologies beyond regular syllabus boundaries—Agentic AI, Reasoning LLMs, Cloud Infrastructure, and Research Paper breakdowns.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#15233A] p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9BAAC2] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search sessions (e.g. Agentic AI)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080E1C] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#397BFF] text-white shadow-md'
                  : 'bg-[#101A2D] text-[#9BAAC2] hover:text-[#F0F5FF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Discovery Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((session) => (
          <div
            key={session.id}
            className="bg-[#15233A] rounded-2xl border border-white/5 overflow-hidden hover:border-[#397BFF]/40 transition group flex flex-col justify-between shadow-xl"
          >
            <div className="relative h-48 overflow-hidden bg-[#101A2D]">
              <img
                src={session.coverImageUrl || session.cover_image}
                alt={session.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#15233A] via-transparent to-black/40" />
              <span className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#080E1C]/80 backdrop-blur-md text-[#77B4FF] border border-white/10 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-[#397BFF]" /> {session.category}
              </span>
              <span className="absolute bottom-2 right-3 text-xs text-[#9BAAC2] font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#397BFF]" /> {session.date || session.session_date}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[#F0F5FF] group-hover:text-[#77B4FF] transition line-clamp-2">
                  {session.title}
                </h3>
                <p className="text-xs text-[#9BAAC2] line-clamp-3 leading-relaxed">
                  {session.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-2">
                  {(session.recordingUrl || session.recording_url) && (
                    <a
                      href={session.recordingUrl || session.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-xl bg-[#397BFF] hover:bg-[#397BFF]/90 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(57,123,255,0.3)] transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Watch Recording
                    </a>
                  )}

                  {(session.resourceDocUrl || session.resources_url || session.slides_url) && (
                    <a
                      href={session.resourceDocUrl || session.resources_url || session.slides_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#101A2D] hover:bg-[#080E1C] border border-white/10 text-[#77B4FF] text-xs font-semibold flex items-center justify-center transition"
                      title="Download Session Deck / Paper"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
