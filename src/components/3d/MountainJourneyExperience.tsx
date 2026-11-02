import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Code2, Lightbulb, Users, Briefcase, Trophy,
  FileText, Cpu, TrendingUp, Star, Play, RotateCcw, FastForward,
  Sparkles, CheckCircle2, ChevronRight, Volume2, VolumeX, Eye
} from 'lucide-react';

interface Milestone {
  id: number;
  name: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  x: number; // Percentage on image coordinates (0-100)
  y: number;
}

const MILESTONES: Milestone[] = [
  {
    id: 1,
    name: 'LEARN',
    subtitle: 'Interactive Syllabi & Foundations',
    icon: BookOpen,
    color: '#38bdf8', // Sky blue
    badgeBg: 'rgba(14, 165, 233, 0.25)',
    x: 34,
    y: 57
  },
  {
    id: 2,
    name: 'BUILD',
    subtitle: 'Python 3 Monaco & Pyodide WASM',
    icon: Code2,
    color: '#00D9FF', // Fluorescent cyan
    badgeBg: 'rgba(0, 217, 255, 0.25)',
    x: 42,
    y: 51
  },
  {
    id: 3,
    name: 'EXPLORE',
    subtitle: 'Microservices & Modern Architecture',
    icon: Lightbulb,
    color: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.25)',
    x: 49,
    y: 45
  },
  {
    id: 4,
    name: 'MENTORSHIP SUPPORT',
    subtitle: '1-on-1 Code Review & Doubt Clearance',
    icon: Users,
    color: '#f59e0b', // Amber/gold
    badgeBg: 'rgba(245, 158, 11, 0.25)',
    x: 55,
    y: 38
  },
  {
    id: 5,
    name: 'INTERNSHIPS',
    subtitle: 'Corporate Projects & Cohort Roles',
    icon: Briefcase,
    color: '#ec4899', // Pink/Magenta
    badgeBg: 'rgba(236, 72, 153, 0.25)',
    x: 64,
    y: 31
  },
  {
    id: 6,
    name: 'HACKATHONS',
    subtitle: 'Competitive Coding & Tech Sprints',
    icon: Trophy,
    color: '#a855f7', // Purple
    badgeBg: 'rgba(168, 85, 247, 0.25)',
    x: 70,
    y: 24
  },
  {
    id: 7,
    name: 'RESEARCH PAPERS',
    subtitle: 'Deep Model & System Literature Analysis',
    icon: FileText,
    color: '#06b6d4', // Cyan
    badgeBg: 'rgba(6, 182, 212, 0.25)',
    x: 72,
    y: 20
  },
  {
    id: 8,
    name: 'EMERGING TECHNOLOGIES',
    subtitle: 'Autonomous Agentic AI & WASM',
    icon: Cpu,
    color: '#3b82f6', // Electric blue
    badgeBg: 'rgba(59, 130, 246, 0.25)',
    x: 74,
    y: 17
  },
  {
    id: 9,
    name: 'CAREER GUIDANCE',
    subtitle: 'Tailored Blueprints & Mock Interviews',
    icon: TrendingUp,
    color: '#10b981', // Emerald
    badgeBg: 'rgba(16, 185, 129, 0.25)',
    x: 76,
    y: 13
  },
  {
    id: 10,
    name: 'SUCCESS',
    subtitle: 'Dream Engineering Career Placement',
    icon: Star,
    color: '#fbbf24', // Radiant Gold
    badgeBg: 'rgba(251, 191, 36, 0.35)',
    x: 85,
    y: 6
  }
];

export const MountainJourneyExperience: React.FC = () => {
  // Animation Scene Stages:
  // 1: Darkness & Stars
  // 2: Mountain Reveal
  // 3: Student Reveal
  // 4: Pathway Traversal & Milestones 1-9
  // 5: Summit Star Reached
  // 6: Brand Reveal ("SkillNova - Your Path to Success Starts Here")
  const [currentScene, setCurrentScene] = useState<number>(1);
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [unlockedMilestoneCount, setUnlockedMilestoneCount] = useState<number>(0);
  const [isSkipped, setIsSkipped] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setPrefersReducedMotion(true);
      skipToEnd();
    }
  }, []);

  // Main Cinema Director Timeline
  useEffect(() => {
    if (isSkipped || isPaused || prefersReducedMotion) return;

    let sceneTimer: any;

    if (currentScene === 1) {
      // Scene 1: Darkness & Starry Atmosphere (1.4s)
      sceneTimer = setTimeout(() => {
        setCurrentScene(2);
      }, 1400);
    } else if (currentScene === 2) {
      // Scene 2: Mountain Landscape Emerges (1.6s)
      sceneTimer = setTimeout(() => {
        setCurrentScene(3);
      }, 1600);
    } else if (currentScene === 3) {
      // Scene 3: Student Reveal on the Lower Path (1.4s)
      sceneTimer = setTimeout(() => {
        setCurrentScene(4);
      }, 1400);
    } else if (currentScene === 4) {
      // Scene 4 & 5: Glowing Pathway Travels Upward and Illuminates Milestones 1-10
      const milestoneInterval = setInterval(() => {
        setUnlockedMilestoneCount((prev) => {
          if (prev >= MILESTONES.length) {
            clearInterval(milestoneInterval);
            setCurrentScene(5);
            return prev;
          }
          setProgress((prev + 1) / MILESTONES.length);
          return prev + 1;
        });
      }, 750); // Reveal each milestone smoothly

      return () => clearInterval(milestoneInterval);
    } else if (currentScene === 5) {
      // Scene 5: Summit Star Brightens (1.5s)
      sceneTimer = setTimeout(() => {
        setCurrentScene(6);
      }, 1500);
    }

    return () => clearTimeout(sceneTimer);
  }, [currentScene, isSkipped, isPaused, prefersReducedMotion]);

  const skipToEnd = () => {
    setIsSkipped(true);
    setCurrentScene(6);
    setProgress(1);
    setUnlockedMilestoneCount(MILESTONES.length);
  };

  const replayExperience = () => {
    setIsSkipped(false);
    setProgress(0);
    setUnlockedMilestoneCount(0);
    setCurrentScene(1);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#00D9FF]/30 shadow-[0_20px_60px_-15px_rgba(0,163,255,0.3)] bg-[#040812] select-none">
      {/* 1. Cinematic Stage Container (Aspect ratio matched to panoramic mountain reference) */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] overflow-hidden">
        {/* Layer A: Deep Base Cosmic Sky Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#02050E] via-[#081226] to-[#0A1A36]" />

        {/* Layer B: Starry Atmosphere Canvas Particles */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
            currentScene >= 1 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Subtle Twinkling Star Points */}
          <div className="absolute top-[8%] left-[15%] w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-80" />
          <div className="absolute top-[12%] right-[22%] w-1 h-1 rounded-full bg-[#00D9FF] animate-pulse opacity-90" />
          <div className="absolute top-[6%] left-[45%] w-1 h-1 rounded-full bg-white opacity-60" />
          <div className="absolute top-[18%] left-[70%] w-1.5 h-1.5 rounded-full bg-white animate-pulse opacity-70" />
          <div className="absolute top-[15%] left-[85%] w-1 h-1 rounded-full bg-[#38bdf8] opacity-75" />
          <div className="absolute top-[22%] left-[30%] w-1 h-1 rounded-full bg-white opacity-40" />
        </div>

        {/* Layer C: High-Fidelity Mountain Journey Landscape Image */}
        <div
          className={`absolute inset-0 transition-all duration-1500 ease-out ${
            currentScene >= 2
              ? 'opacity-100 scale-100 filter brightness-100 contrast-105'
              : 'opacity-0 scale-105 filter brightness-10 contrast-125'
          }`}
        >
          <img
            src="/mountain-journey.jpg"
            alt="SkillNova Mountain Ascent"
            className="w-full h-full object-cover object-center"
          />

          {/* Cinematic Sunset Horizon & Fog Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#040812] via-transparent to-transparent opacity-80" />
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#02050E] via-[#02050E]/60 to-transparent pointer-events-none" />
        </div>

        {/* Layer D: Scene 3 – Student Spotlight Glow */}
        <div
          className={`absolute bottom-[18%] left-[16%] sm:left-[19%] md:left-[21%] w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-[#176BFF]/40 to-[#00D9FF]/20 blur-xl pointer-events-none transition-opacity duration-1000 ${
            currentScene >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        />

        {/* Layer E: Glowing Energy Trail traveling along the Winding Mountain Pathway */}
        {currentScene >= 4 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pathwayGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#176BFF" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#00D9FF" stopOpacity="1" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="1" />
              </linearGradient>

              <filter id="fluorescentGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing Fluorescent Path Ribbon */}
            <path
              d="M 230 650 Q 340 570 420 510 T 550 380 T 700 240 T 850 60"
              fill="none"
              stroke="url(#pathwayGlow)"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#fluorescentGlow)"
              strokeDasharray="1200"
              strokeDashoffset={Math.max(0, 1200 * (1 - progress))}
              className="transition-all duration-700 ease-out"
            />
          </svg>
        )}

        {/* Layer F: Scene 5 – 10 Milestone Markers Illuminating Progressively */}
        {MILESTONES.map((m, index) => {
          const isRevealed = unlockedMilestoneCount >= index + 1;
          const Icon = m.icon;

          return (
            <div
              key={m.id}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-700 transform ${
                isRevealed
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-50 translate-y-3 pointer-events-none'
              }`}
            >
              {/* Milestone Waypoint Orb with Aura */}
              <div className="relative group cursor-pointer">
                {/* Outer Fluorescent Pulse Ring */}
                <div
                  className="absolute -inset-2.5 rounded-full blur-md opacity-80 group-hover:opacity-100 transition-opacity animate-pulse"
                  style={{ backgroundColor: m.color }}
                />

                {/* Badge Container */}
                <div
                  className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border shadow-xl backdrop-blur-md transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: 'rgba(8, 14, 28, 0.85)',
                    borderColor: m.color,
                    boxShadow: `0 0 16px ${m.color}88`
                  }}
                >
                  <div
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: m.color }}
                  >
                    <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black font-black" />
                  </div>
                  <span className="text-[9px] sm:text-[11px] font-black tracking-wide text-white font-mono whitespace-nowrap">
                    {m.name}
                  </span>
                </div>

                {/* Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                  <div className="px-3 py-1.5 rounded-xl bg-[#080E1C]/95 border border-[#00D9FF]/40 text-center shadow-2xl backdrop-blur-md whitespace-nowrap">
                    <div className="text-[10px] font-mono font-bold text-[#00D9FF]">
                      Milestone {m.id} of 10
                    </div>
                    <div className="text-xs font-bold text-white">{m.subtitle}</div>
                  </div>
                  <div className="w-2 h-2 bg-[#080E1C] rotate-45 -mt-1 border-r border-b border-[#00D9FF]/40" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Layer G: Scene 6 – Summit Brilliant Star (Success Point) */}
        <div
          className={`absolute top-[4%] right-[11%] sm:right-[13%] -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none transition-all duration-1000 ${
            currentScene >= 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
        >
          {/* Radiant Flare Rays */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-32 h-32 sm:w-44 sm:h-44 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 rounded-full blur-2xl opacity-60 animate-pulse" />
            <div className="absolute w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full blur-lg opacity-90" />
            <Star className="w-10 h-10 sm:w-16 sm:h-16 text-yellow-300 drop-shadow-[0_0_20px_#fde047] fill-yellow-200 animate-spin-slow" />
          </div>
        </div>

        {/* Layer H: Scene 7 – Brand Reveal Ribbon ("SkillNova - Your Path to Success Starts Here") */}
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] sm:w-auto text-center transition-all duration-1000 ${
            currentScene >= 6
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
          }`}
        >
          <div className="relative inline-flex flex-col items-center px-6 sm:px-10 py-3 sm:py-4 rounded-3xl bg-[#080E1C]/85 border border-[#00D9FF]/40 shadow-[0_0_40px_rgba(0,217,255,0.3)] backdrop-blur-md">
            {/* Ambient Brand Star Emblem */}
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles className="w-4 h-4 text-[#00D9FF] animate-pulse" />
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Skill<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#176BFF] via-[#00A3FF] to-[#00D9FF]">Nova</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#E0EBF7] tracking-wide">
              Your Path to Success Starts Here.
            </p>
          </div>
        </div>

        {/* Top Control Overlay: Scene indicator & Skip Intro */}
        <div className="absolute top-4 inset-x-4 sm:inset-x-6 z-40 flex items-center justify-between pointer-events-auto">
          {/* Left: Active Scene Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#080E1C]/80 border border-[#00D9FF]/30 text-xs font-mono text-[#00D9FF] backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#00D9FF] animate-pulse" />
            <span className="hidden sm:inline">Scene {currentScene} of 6:</span>
            <span className="text-white font-bold">
              {currentScene === 1 && 'Darkness'}
              {currentScene === 2 && 'Mountain Emerges'}
              {currentScene === 3 && 'Student at Base'}
              {currentScene === 4 && `Ascent: Milestone ${unlockedMilestoneCount}/10`}
              {currentScene === 5 && 'Summit Success'}
              {currentScene >= 6 && 'SkillNova Revealed'}
            </span>
          </div>

          {/* Right: Quick Controls (Skip Intro, Replay) */}
          <div className="flex items-center gap-2">
            {!isSkipped && currentScene < 6 && (
              <button
                onClick={skipToEnd}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition backdrop-blur-md shadow-xs"
                title="Skip to final view"
              >
                <span>Skip Intro</span>
                <FastForward className="w-3.5 h-3.5" />
              </button>
            )}

            {currentScene >= 6 && (
              <button
                onClick={replayExperience}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#176BFF]/30 hover:bg-[#176BFF]/50 border border-[#00A3FF]/40 text-[#00D9FF] text-xs font-bold transition backdrop-blur-md shadow-xs"
                title="Replay cinematic journey"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Ascent</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Milestone Sequence Interactive Legend Footer */}
      <div className="p-4 sm:p-5 bg-[#080E1C] border-t border-[#1F2E47]/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#176BFF] to-[#00D9FF] p-0.5">
            <div className="w-full h-full bg-[#080E1C] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#00D9FF]" />
            </div>
          </div>
          <div>
            <div className="text-xs font-black text-white">The 10-Step Mountain Journey</div>
            <div className="text-[11px] text-[#9BAAC2]">
              From initial learning to industry engineering success.
            </div>
          </div>
        </div>

        {/* Milestone Steps Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {MILESTONES.map((m, idx) => {
            const isReached = unlockedMilestoneCount >= idx + 1;
            return (
              <div
                key={m.id}
                title={`${m.name}: ${m.subtitle}`}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all whitespace-nowrap border ${
                  isReached
                    ? 'bg-[#15233A] text-white border-[#00D9FF]/50 shadow-xs'
                    : 'bg-white/5 text-[#9BAAC2] border-white/5'
                }`}
              >
                {idx + 1}. {m.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MountainJourneyExperience;
