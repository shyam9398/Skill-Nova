import React from 'react';
import { Rocket, Sparkles, Compass, Shield, ArrowRight, Stars, Zap } from 'lucide-react';

export const PathfindersPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF3FF] text-[#176BFF] border border-[#00A3FF]/30 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#00A3FF]" />
            Stealth Project In Development
          </span>
          <span className="text-xs text-[#73839B] font-mono">v3.0 Preview</span>
        </div>
      </div>

      {/* Hero Showcase Card */}
      <div className="relative rounded-3xl overflow-hidden border border-[#DFE9F6] dark:border-white/10 bg-gradient-to-b from-[#F5F9FF] via-[#EAF3FF] to-white dark:from-[#0B1530] dark:via-[#0D1833] dark:to-[#050816] p-8 md:p-16 text-center shadow-xl transition-colors">
        {/* Glowing Background Radial Accents */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00A3FF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-12 w-80 h-80 bg-[#00D9FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          {/* Rocket Icon Container with Pulse Glow */}
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#176BFF] via-[#00A3FF] to-[#00D9FF] p-1 mx-auto shadow-2xl shadow-[#00A3FF]/30 group hover:scale-105 transition-transform duration-500">
            <div className="w-full h-full bg-white dark:bg-[#0D1833] rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[#EAF3FF]/50 dark:bg-[#00A8FF]/10 animate-pulse" />
              <Rocket className="w-12 h-12 text-[#176BFF] dark:text-[#00E5FF] relative z-10 transform -rotate-45" />
            </div>
          </div>

          {/* Headings */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black text-[#15243B] dark:text-[#F4F7FF] tracking-tight">
              Pathfinders
            </h1>
            <h2 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#176BFF] via-[#00A3FF] to-[#00D9FF]">
              Something Extraordinary Is On Its Way.
            </h2>
          </div>

          {/* Blast Callout Badge */}
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white text-sm font-black shadow-lg shadow-[#00A3FF]/25 tracking-wide">
            <Zap className="w-4 h-4 text-[#00D9FF]" />
            <span>Coming Soon to Blast!</span>
          </div>

          {/* Descriptive Mission Statement */}
          <p className="text-sm md:text-base text-[#73839B] dark:text-[#9BAAC5] leading-relaxed max-w-lg mx-auto">
            Pathfinders is SkillNova's upcoming AI-driven career expedition engine. It bridges student learning roadmaps with proprietary autonomous industry challenges, personalized mentorship sprints, and direct hiring fast-tracks.
          </p>

          {/* Milestone Pillars Preview */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#0D1833]/90 border border-[#DFE9F6] dark:border-white/10 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] dark:bg-[#00A8FF]/20 text-[#176BFF] dark:text-[#00E5FF] flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="text-sm font-bold text-[#15243B] dark:text-[#F4F7FF]">Autonomous Sprints</h4>
              <p className="text-xs text-[#73839B] dark:text-[#9BAAC5]">AI-orchestrated project sprints calibrated to real tech benchmarks.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#0D1833]/90 border border-[#DFE9F6] dark:border-white/10 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] dark:bg-[#00A8FF]/20 text-[#00A3FF] dark:text-[#00E5FF] flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="text-sm font-bold text-[#15243B] dark:text-[#F4F7FF]">Direct Mentor Fast-Track</h4>
              <p className="text-xs text-[#73839B] dark:text-[#9BAAC5]">Private technical advisory and architecture reviews with senior engineers.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#0D1833]/90 border border-[#DFE9F6] dark:border-white/10 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] dark:bg-[#00A8FF]/20 text-[#00D9FF] flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="text-sm font-bold text-[#15243B] dark:text-[#F4F7FF]">Global Talent Pool</h4>
              <p className="text-xs text-[#73839B] dark:text-[#9BAAC5]">Verified competency transcripts shared with premier tech recruiters.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
