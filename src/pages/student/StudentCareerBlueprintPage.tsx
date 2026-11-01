import React, { useState } from 'react';
import { 
  Compass, 
  CheckCircle, 
  AlertTriangle, 
  Code, 
  FileCheck, 
  Layers, 
  Search, 
  ChevronRight,
  ShieldAlert,
  FolderGit2
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { CareerBlueprint } from '../../types';

export const StudentCareerBlueprintPage: React.FC = () => {
  const [blueprints] = useState<CareerBlueprint[]>(dataService.getCareerBlueprints());
  const [selectedTrack, setSelectedTrack] = useState<CareerBlueprint>(blueprints[0] || ({} as CareerBlueprint));
  const [search, setSearch] = useState('');

  const filteredTracks = blueprints.filter(bp => {
    const role = (bp.role_name || bp.roleTitle || '').toLowerCase();
    const cat = (bp.category || '').toLowerCase();
    const skills = (bp.mandatory_skills || bp.mandatorySkills || []);
    const term = search.toLowerCase();
    return role.includes(term) || cat.includes(term) || skills.some((s: string) => s.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#397BFF]" />
            Career Blueprint Engine
          </span>
          <span className="text-xs text-[#9BAAC2] font-mono">12+ Engineering Tracks</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F0F5FF]">
          Resume Requirements by Professional Role
        </h1>
        <p className="text-sm text-[#9BAAC2]">
          Understand exactly what top tier engineering teams inspect in candidate resumes. Avoid generic fluff and build verifiable technical proof of competence.
        </p>
      </div>

      {/* Grid: Left Track Selector / Right Blueprint Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Role Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#9BAAC2] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search career role (e.g. AI/ML)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#15233A] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
            />
          </div>

          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredTracks.map((track) => {
              const isSelected = selectedTrack?.id === track.id;
              const roleTitle = track.role_name || track.roleTitle || 'Role';
              const mandatory = track.mandatory_skills || track.mandatorySkills || [];
              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track)}
                  className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#397BFF]/15 border-[#397BFF] text-[#F0F5FF] shadow-[0_0_20px_rgba(57,123,255,0.2)]'
                      : 'bg-[#15233A] border-white/5 text-[#9BAAC2] hover:bg-[#101A2D] hover:text-[#F0F5FF]'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-[#77B4FF] tracking-wider block">
                      {track.category}
                    </span>
                    <h3 className="text-sm font-bold text-[#F0F5FF]">{roleTitle}</h3>
                    <p className="text-[11px] text-[#9BAAC2] line-clamp-1">{mandatory.slice(0, 3).join(', ')}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#77B4FF]' : 'text-[#9BAAC2]'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Role Blueprint */}
        <div className="lg:col-span-8">
          {selectedTrack && selectedTrack.id && (
            <div className="bg-[#15233A] rounded-3xl border border-white/5 p-6 sm:p-8 space-y-8 shadow-2xl">
              {/* Header */}
              <div className="space-y-2 pb-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#77B4FF] uppercase tracking-wider">
                    {selectedTrack.category}
                  </span>
                  <span className="text-xs text-[#9BAAC2]">•</span>
                  <span className="text-xs text-[#9BAAC2] font-mono">Industry Rubric</span>
                </div>
                <h2 className="text-2xl font-black text-[#F0F5FF]">
                  {selectedTrack.role_name || selectedTrack.roleTitle} Blueprint
                </h2>
                <p className="text-xs sm:text-sm text-[#9BAAC2] leading-relaxed pt-1">
                  {selectedTrack.overview}
                </p>
              </div>

              {/* Skills Section: Mandatory vs Preferred */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9BAAC2] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#397BFF]" /> Technical Competency Matrix
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mandatory */}
                  <div className="p-4 rounded-2xl bg-[#080E1C] border border-red-500/25 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                      <ShieldAlert className="w-4 h-4" /> Non-Negotiable Core Skills
                    </div>
                    <p className="text-[11px] text-[#9BAAC2]">
                      Recruiters filter out resumes lacking these exact foundations:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {(selectedTrack.mandatory_skills || selectedTrack.mandatorySkills || []).map((skill: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-300 text-xs font-semibold border border-red-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Preferred */}
                  <div className="p-4 rounded-2xl bg-[#080E1C] border border-blue-500/25 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#77B4FF]">
                      <CheckCircle className="w-4 h-4" /> Preferred / Differentiator Skills
                    </div>
                    <p className="text-[11px] text-[#9BAAC2]">
                      Elevates candidate from top 20% to the interview shortlist:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {(selectedTrack.preferred_skills || selectedTrack.preferredSkills || []).map((skill: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#397BFF]/10 text-[#77B4FF] text-xs font-semibold border border-[#397BFF]/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Projects with Metrics */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9BAAC2] flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#397BFF]" /> High-Impact Recommended Projects
                </h3>
                <div className="space-y-3">
                  {(selectedTrack.recommended_projects || selectedTrack.recommendedProjects || []).map((project: any, idx: number) => {
                    const isObj = typeof project === 'object' && project !== null;
                    const title = isObj ? project.title : project;
                    const desc = isObj ? project.description : '';
                    const stack = isObj && project.tech_stack ? project.tech_stack : [];
                    const highlight = isObj ? project.portfolio_highlight : '';
                    return (
                      <div 
                        key={idx} 
                        className="p-4 rounded-2xl bg-[#101A2D] border border-white/5 flex items-start gap-3.5 hover:border-[#397BFF]/30 transition"
                      >
                        <div className="w-7 h-7 rounded-xl bg-[#397BFF]/20 text-[#77B4FF] text-xs font-bold flex items-center justify-center font-mono flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm font-semibold text-[#F0F5FF] leading-relaxed">
                            {title}
                          </p>
                          {desc && <p className="text-xs text-[#9BAAC2]">{desc}</p>}
                          {stack.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {stack.map((t: string, ti: number) => (
                                <span key={ti} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#77B4FF] font-mono">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          {highlight && (
                            <span className="text-[10px] font-mono text-[#77B4FF] flex items-center gap-1 pt-1">
                              <FolderGit2 className="w-3 h-3" /> {highlight}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resume Structure & Common Pitfalls Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Structure */}
                <div className="p-5 rounded-2xl bg-[#101A2D] border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-[#77B4FF] uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#397BFF]" /> Single-Page Resume Hierarchy
                  </h4>
                  <ol className="space-y-2 text-xs text-[#9BAAC2] list-decimal list-inside leading-relaxed">
                    {(selectedTrack.resume_structure || selectedTrack.resumeStructure || []).map((step: any, idx: number) => {
                      const text = typeof step === 'string' ? step : `${step.section}: ${step.description}`;
                      return (
                        <li key={idx} className="text-[#F0F5FF]">
                          <span className="text-[#9BAAC2]">{text}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                {/* Mistakes */}
                <div className="p-5 rounded-2xl bg-[#101A2D] border border-amber-500/20 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Critical Mistakes to Avoid
                  </h4>
                  <ul className="space-y-2 text-xs text-[#9BAAC2]">
                    {(selectedTrack.common_mistakes || selectedTrack.commonMistakes || []).map((mistake: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interview Topics */}
              <div className="p-4 rounded-2xl bg-[#080E1C] border border-white/5 space-y-2">
                <span className="text-xs font-bold text-[#77B4FF] uppercase tracking-wider">
                  Top Technical Interview Topics for this Role
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(selectedTrack.frequently_asked_interview_topics || selectedTrack.interviewTopics || []).map((topic: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-[#15233A] text-xs text-[#F0F5FF] font-medium border border-white/5">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
