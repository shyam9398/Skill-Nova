import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map, 
  CheckCircle2, 
  Circle, 
  Lock, 
  Compass, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  ZoomIn, 
  RotateCcw, 
  Maximize2
} from 'lucide-react';
import type { Course, CourseModule, StudentRoadmapProgress } from '../../types';
import { InteractiveRoadmapViewer } from '../courses/InteractiveRoadmapViewer';

interface InteractiveDashboardRoadmapProps {
  course: Course;
  modules: CourseModule[];
  roadmapProgress: StudentRoadmapProgress;
}

export const InteractiveDashboardRoadmap: React.FC<InteractiveDashboardRoadmapProps> = ({
  course,
  modules,
  roadmapProgress
}) => {
  const navigate = useNavigate();
  const [showFullImageModal, setShowFullImageModal] = useState(false);

  const completedSet = new Set(roadmapProgress.completed_sub_modules || []);
  const allSubModules = modules.flatMap(m => (m.sub_modules || []).map(sm => ({ ...sm, module_title: m.title })));
  const totalStages = Math.max(1, allSubModules.length);
  const completedCount = allSubModules.filter(sm => completedSet.has(sm.id)).length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalStages) * 100));

  const handleStageClick = (moduleId: string, subModuleId: string, isLocked: boolean) => {
    if (isLocked) return;
    navigate(`/student/courses/${course.id}?module=${moduleId}&subModule=${subModuleId}`);
  };

  return (
    <div className="dark-section rounded-3xl bg-[#0B132B] border border-white/10 p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Decorative fluorescent blue background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#00A3FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#176BFF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/40 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-[#00D1FF] uppercase">
              Interactive Learning Journey
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Curriculum Roadmap: {course.title}
          </h2>
          <p className="text-xs text-[#9BAAC2]">
            Visual progression of modules & sub-units. Click any unlocked stage to launch study materials.
          </p>
        </div>

        {/* Progress Metric & Full Image View Button */}
        <div className="flex items-center gap-3">
          <div className="bg-[#101A2D] px-4 py-2 rounded-xl border border-white/10 text-right">
            <span className="text-[10px] text-[#9BAAC2] block uppercase font-mono font-semibold">Mastery</span>
            <span className="text-lg font-black text-[#00D1FF] font-mono">{progressPercent}%</span>
          </div>

          <button
            onClick={() => setShowFullImageModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#176BFF] hover:bg-[#00A3FF] text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-[#176BFF]/25"
          >
            <Map className="w-3.5 h-3.5" />
            <span>Pan/Zoom Blueprint</span>
          </button>
        </div>
      </div>

      {/* Horizontal Visual Progression Line */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between text-xs text-[#9BAAC2] font-mono">
          <span>{completedCount} of {totalStages} Stages Cleared</span>
          <span>Target: Full Engineering Cohort Mastery</span>
        </div>

        {/* The Visual Journey Path */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod, modIdx) => {
            const modSubMods = mod.sub_modules || [];
            const modCompleted = modSubMods.length > 0 && modSubMods.every(sm => completedSet.has(sm.id));
            const modActive = !modCompleted && modSubMods.some(sm => completedSet.has(sm.id) || sm.id === roadmapProgress.current_stage);

            return (
              <div 
                key={mod.id} 
                className={`dark-card p-5 rounded-2xl border transition-all duration-300 relative ${
                  modCompleted
                    ? 'bg-[#101F3B] border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : modActive
                    ? 'bg-[#13254C] border-[#00A3FF] shadow-lg shadow-[#00A3FF]/15 scale-[1.02]'
                    : 'bg-[#0E1729] border-white/5 opacity-80'
                }`}
              >
                {/* Module Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    modCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : modActive
                      ? 'bg-[#00A3FF]/20 text-[#00D1FF] border border-[#00A3FF]/40'
                      : 'bg-white/5 text-[#9BAAC2]'
                  }`}>
                    Module {modIdx + 1}
                  </span>
                  
                  {modCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </span>
                  ) : modActive ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#00D1FF] animate-pulse">
                      <Sparkles className="w-3.5 h-3.5" /> Current
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-[#73839B]">
                      <Lock className="w-3 h-3" /> Upcoming
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mb-3 line-clamp-1">
                  {mod.title}
                </h3>

                {/* Sub-modules inside this module */}
                <div className="space-y-2">
                  {modSubMods.map((sm, smIdx) => {
                    const isCompleted = completedSet.has(sm.id);
                    const isCurrent = sm.id === roadmapProgress.current_stage || (!isCompleted && smIdx === 0 && modIdx === 0);
                    const isLocked = !isCompleted && !isCurrent && modIdx > 1 && !completedSet.has(modSubMods[Math.max(0, smIdx - 1)]?.id);

                    return (
                      <div
                        key={sm.id}
                        onClick={() => handleStageClick(mod.id, sm.id, isLocked)}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                            : isCurrent
                            ? 'bg-[#00A3FF]/15 border-[#00A3FF] text-[#00D1FF] font-bold hover:bg-[#00A3FF]/25 shadow-sm'
                            : isLocked
                            ? 'bg-white/5 border-white/5 text-white/40 cursor-not-allowed'
                            : 'bg-[#15233A] border-white/10 text-white/80 hover:text-white hover:border-[#176BFF]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : isCurrent ? (
                            <Circle className="w-3.5 h-3.5 text-[#00A3FF] fill-[#00A3FF] shrink-0 animate-ping" />
                          ) : isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-white/30 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-[#73839B] shrink-0" />
                          )}
                          <span className="truncate">{sm.title}</span>
                        </div>

                        {!isLocked && (
                          <ArrowRight className="w-3 h-3 text-white/50 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Pan/Zoom Interactive Image Modal */}
      {showFullImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 md:p-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-5xl h-[85vh] flex flex-col">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowFullImageModal(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              >
                Close Roadmap Viewer
              </button>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden border border-white/20">
              <InteractiveRoadmapViewer
                courseTitle={course.title}
                roadmapUrl={course.roadmap_image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
