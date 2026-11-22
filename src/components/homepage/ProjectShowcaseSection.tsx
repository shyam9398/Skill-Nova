import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, ArrowUpRight, FolderGit2, Tag, Layers } from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Project } from '../../types';

export const ProjectShowcaseSection: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(dataService.getProjects('published'));
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    void dataService.syncProjectsFromSupabase();
    const update = () => {
      setProjects(dataService.getProjects('published'));
    };
    return dataService.subscribe(update);
  }, []);

  // Compute unique categories present in published projects
  const availableCategories = ['All', ...Array.from(new Set(projects.map((p) => p.category || 'Other')))];

  const filteredProjects = projects.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  return (
    <section
      id="projects"
      className="py-20 lg:py-28 bg-[#F8FAFC] dark:bg-[#070D1E] border-b border-[#E2E8F0] dark:border-white/10 transition-colors relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#176BFF]/5 dark:bg-[#176BFF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D9FF]/5 dark:bg-[#00D9FF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#176BFF]/10 dark:bg-[#176BFF]/20 text-[#176BFF] dark:text-[#00E5FF] text-xs font-mono font-bold border border-[#176BFF]/25">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STUDENT INNOVATION HUB</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0B1220] dark:text-white">
            Student Projects & Innovations
          </h2>

          <p className="text-sm sm:text-base text-[#475569] dark:text-[#CBD5E1] leading-relaxed font-medium">
            Explore innovative projects built by our talented SkillNova learners. Discover ideas, creativity, and real-world solutions.
          </p>

          {/* Category Filter Pills */}
          {availableCategories.length > 2 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-[#176BFF] text-white shadow-md shadow-[#176BFF]/30 scale-105'
                      : 'bg-white dark:bg-[#0D1833] text-[#475569] dark:text-[#9BAAC5] hover:text-[#111827] dark:hover:text-white border border-[#DFE9F6] dark:border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Project Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white dark:bg-[#0D1833] rounded-3xl border border-[#DFE9F6] dark:border-white/10 p-12 text-center max-w-lg mx-auto space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] dark:bg-[#00A8FF]/15 text-[#176BFF] dark:text-[#00E5FF] flex items-center justify-center mx-auto">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827] dark:text-white">
              Innovative Projects In Development
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
              Our engineering cohort capstones and client-side research projects are currently undergoing review. Check back soon for live demonstrations!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-3xl bg-white dark:bg-[#0D1833] border border-[#DFE9F6] dark:border-white/10 hover:border-[#176BFF] dark:hover:border-[#00D9FF] shadow-lg shadow-[#176BFF]/5 hover:shadow-2xl hover:shadow-[#176BFF]/15 transition-all duration-300 flex flex-col justify-between overflow-hidden group transform hover:-translate-y-1.5"
              >
                <div>
                  {/* Project Image with Category Badge */}
                  <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-[#050816]">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600';
                      }}
                    />
                    {project.category && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-mono font-bold text-[#00E5FF] border border-[#00E5FF]/30 shadow-md">
                        {project.category}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 space-y-3">
                    <h3 className="text-lg sm:text-xl font-black text-[#111827] dark:text-white group-hover:text-[#176BFF] dark:group-hover:text-[#00E5FF] transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Explore Project Button */}
                <div className="px-6 sm:px-7 pb-6 pt-2">
                  {project.project_url ? (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl bg-[#176BFF] hover:bg-[#1258d4] text-white text-xs font-bold shadow-md shadow-[#176BFF]/25 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span>Explore Project</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  ) : (
                    <div className="text-center py-2 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-[#DFE9F6] dark:border-white/5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      SkillNova Cohort Capstone
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectShowcaseSection;

