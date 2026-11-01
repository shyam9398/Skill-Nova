import React, { useState } from 'react';
import { 
  Briefcase, 
  Trophy, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  DollarSign, 
  Clock,
  Sparkles
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Opportunity } from '../../types';

export const StudentOpportunitiesPage: React.FC = () => {
  const [opportunities] = useState<Opportunity[]>(dataService.getOpportunities());
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['opp-1']);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'internship' | 'job' | 'hackathon'>('all');
  const [search, setSearch] = useState('');
  const [onlySaved, setOnlySaved] = useState(false);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filtered = opportunities.filter(opp => {
    const oppType = opp.category || opp.type;
    const matchesCategory = categoryFilter === 'all' || oppType === categoryFilter;
    const matchesSaved = !onlySaved || bookmarkedIds.includes(opp.id);
    const org = opp.organization || opp.company || '';
    const skills = opp.required_skills || opp.requiredSkills || [];
    const matchesSearch = 
      opp.title.toLowerCase().includes(search.toLowerCase()) ||
      org.toLowerCase().includes(search.toLowerCase()) ||
      skills.some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSaved && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#397BFF]" />
            Career Acceleration & Hackathons
          </span>
          <span className="text-xs text-[#9BAAC2] font-mono">Verified Openings</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F0F5FF]">
          Internships, Jobs & Competitions
        </h1>
        <p className="text-sm text-[#9BAAC2]">
          Browse high-growth technical internships, entry-level engineering roles, and global hackathons with fast-track referral portals.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#15233A] p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9BAAC2] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search roles or technologies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080E1C] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {(['all', 'internship', 'job', 'hackathon'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setCategoryFilter(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                categoryFilter === type
                  ? 'bg-[#397BFF] text-white shadow-md'
                  : 'bg-[#101A2D] text-[#9BAAC2] hover:text-[#F0F5FF]'
              }`}
            >
              {type === 'all' ? 'All Openings' : `${type}s`}
            </button>
          ))}

          <button
            onClick={() => setOnlySaved(!onlySaved)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              onlySaved
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-[#101A2D] text-[#9BAAC2] hover:text-[#F0F5FF]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" /> Saved ({bookmarkedIds.length})
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((opp) => {
          const isSaved = bookmarkedIds.includes(opp.id);
          return (
            <div
              key={opp.id}
              className="bg-[#15233A] rounded-2xl border border-white/5 p-6 hover:border-[#397BFF]/50 transition group flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  {(() => {
                    const oppType = opp.category || opp.type;
                    return (
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                        oppType === 'internship'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                          : oppType === 'hackathon'
                          ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      }`}>
                        {oppType}
                      </span>
                    );
                  })()}

                  <button
                    onClick={() => toggleBookmark(opp.id)}
                    className="text-[#9BAAC2] hover:text-amber-400 transition"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#F0F5FF] group-hover:text-[#77B4FF] transition">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-[#9BAAC2] mt-0.5 flex items-center gap-1.5">
                    <span className="text-[#F0F5FF] font-medium">{opp.organization || opp.company}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#397BFF]" /> {opp.location}
                    </span>
                  </p>
                </div>

                {(opp.stipend_salary || opp.stipendOrPrize) && (
                  <div className="p-2.5 rounded-xl bg-[#101A2D] border border-white/5 text-xs text-[#77B4FF] font-semibold flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#397BFF]" />
                    {opp.stipend_salary || opp.stipendOrPrize}
                  </div>
                )}

                <p className="text-xs text-[#9BAAC2] line-clamp-3 leading-relaxed">
                  {opp.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(opp.required_skills || opp.requiredSkills || []).map((s: string, idx: number) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#080E1C] text-[10px] text-[#9BAAC2] font-mono border border-white/5"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-[#9BAAC2] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> Deadline: {opp.deadline}
                </span>

                <a
                  href={opp.apply_url || opp.applyUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#397BFF] hover:bg-[#397BFF]/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(57,123,255,0.3)] transition"
                >
                  Apply Now <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
