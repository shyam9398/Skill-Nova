import React, { useState, useEffect } from 'react';
import {
  Briefcase, MapPin, Calendar, ExternalLink, Bookmark,
  Award, TrendingUp, Search, Filter, Sparkles, Building
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Opportunity } from '../../types';

export const StudentOpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activeType, setActiveType] = useState<'all' | 'internship' | 'hackathon' | 'job' | 'competition'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    void dataService.syncOpportunitiesFromSupabase();
    const update = () => {
      // Only display active, published opportunities to students
      setOpportunities(all.filter(o => o.is_active !== false));
    };
    const all = dataService.getOpportunities();
    setOpportunities(all.filter(o => o.is_active !== false));
    return dataService.subscribe(update);
  }, []);

  const filtered = opportunities.filter(o => {
    const oppType = o.category || o.type || 'internship';
    const matchesType = activeType === 'all' || oppType === activeType;
    const compName = o.company || o.organization || '';
    const skills = o.tags || o.required_skills || o.requiredSkills || [];
    const matchesSearch =
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      compName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#176BFF] via-[#00A3FF] to-[#00D9FF] p-6 md:p-8 text-white shadow-xl shadow-[#00A3FF]/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            CAREER & INDUSTRY LAUNCHPAD
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Curated Tech Opportunities
          </h1>
          <p className="text-xs md:text-sm text-white/90 leading-relaxed">
            Direct internship openings, hackathons, job placements, and national coding challenges vetted by SkillNova mentors.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0D1833] rounded-2xl border border-[#DFE9F6] dark:border-white/10 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 dark:text-[#73839B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by role, company, or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F9FF] dark:bg-[#060B18] border border-[#DFE9F6] dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#176BFF] transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Opportunities' },
            { id: 'internship', label: 'Internships' },
            { id: 'hackathon', label: 'Hackathons' },
            { id: 'job', label: 'Full-Time Jobs' },
            { id: 'competition', label: 'Competitions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeType === tab.id
                  ? 'bg-[#176BFF] text-white shadow-xs'
                  : 'bg-[#F5F9FF] dark:bg-[#080E1C] text-slate-600 dark:text-[#73839B] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-[#0D1833] rounded-3xl border border-[#DFE9F6] dark:border-white/10 text-slate-600 dark:text-[#73839B] text-xs">
            No active opportunities match the selected criteria.
          </div>
        ) : (
          filtered.map((opp) => {
            const companyDisplay = opp.company || opp.organization || 'Tech Partner';
            const categoryDisplay = opp.category || opp.type || 'Internship';
            const tagsList = opp.tags || opp.required_skills || opp.requiredSkills || ['Python', 'Tech'];
            const stipendDisplay = opp.stipend_or_salary || opp.stipend_salary || opp.stipendOrPrize || 'Competitive / Perks';
            const applyLink = opp.apply_link || opp.apply_url || opp.applyUrl || '#';

            return (
              <div
                key={opp.id}
                className="bg-white dark:bg-[#0D1833] rounded-3xl border border-[#DFE9F6] dark:border-white/10 p-6 space-y-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#EAF3FF] dark:bg-[#080E1C] text-[#176BFF] border border-[#00A3FF]/20 flex items-center justify-center font-black text-sm">
                        {companyDisplay.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">{opp.title}</h3>
                        <div className="text-xs text-slate-500 dark:text-[#9BAAC2] flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          <span>{companyDisplay}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF3FF] dark:bg-[#00A8FF]/20 text-[#176BFF] dark:text-[#00E5FF] font-mono border border-[#00A3FF]/20">
                      {categoryDisplay}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-[#9BAAC2] line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {tagsList.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-[#F5F9FF] dark:bg-[#080E1C] text-slate-800 dark:text-slate-200 border border-[#DFE9F6] dark:border-white/10 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#DFE9F6] dark:border-white/10 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-[#9BAAC2]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#176BFF]" />
                      <span>{opp.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-slate-900 dark:text-[#77B4FF] font-bold">
                      <span>{stipendDisplay}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DFE9F6] dark:border-white/10 flex items-center justify-between">
                  <div className="text-[10px] text-slate-500 dark:text-[#9BAAC2] flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>Deadline: {opp.deadline}</span>
                  </div>

                  <a
                    href={applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1.5"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentOpportunitiesPage;
