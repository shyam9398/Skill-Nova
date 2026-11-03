import React, { useState, useEffect, useRef } from 'react';
import {
  X, ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Lock, Calendar, Clock, ShieldCheck, CheckCircle2,
  Layers, AlertTriangle, BookOpen, Presentation as PresIcon,
  Sparkles, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import type { Presentation, PresentationSlideAllocation } from '../../types';
import { dataService } from '../../services/dataService';

interface PresentationSlideViewerProps {
  presentation: Presentation;
  subModuleId: string;
  subModuleTitle?: string;
  onClose: () => void;
}

export const PresentationSlideViewer: React.FC<PresentationSlideViewerProps> = ({
  presentation,
  subModuleId,
  subModuleTitle,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'embedded' | 'interactive'>(() => {
    return presentation.ppt_url ? 'embedded' : 'interactive';
  });

  const getEmbeddablePptUrl = (rawUrl?: string): string => {
    if (!rawUrl) return '';
    const clean = rawUrl.trim();
    if (clean.includes('docs.google.com/presentation')) {
      return clean.replace(/\/edit(\?.*)?$/, '/embed?start=false&loop=false&delayms=3000').replace(/\/pub(\?.*)?$/, '/embed?start=false&loop=false&delayms=3000');
    }
    if (clean.includes('drive.google.com')) {
      const match = clean.match(/\/d\/([a-zA-Z0-9_-]+)/) || clean.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
      return clean.replace(/\/view(\?.*)?$/, '/preview');
    }
    if (clean.endsWith('.ppt') || clean.endsWith('.pptx') || clean.includes('.ppt') || clean.includes('.pptx')) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(clean)}`;
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(clean)}&embedded=true`;
  };

  // Get authorization for this sub-module
  const authInfo = dataService.getAuthorizedSlidesForSubModule(presentation.id, subModuleId);
  const startSlide = authInfo.startSlide || 1;
  const endSlide = authInfo.endSlide || 1;
  const totalAccessible = Math.max(1, endSlide - startSlide + 1);

  // Current slide index relative to the accessible range (0-indexed: 0 = startSlide)
  const [currentRelativeIndex, setCurrentRelativeIndex] = useState<number>(0);

  const currentGlobalSlide = startSlide + currentRelativeIndex;

  // Format scheduled date to IST
  const formatIST = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' (IST)';
    } catch {
      return dateStr;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        if (currentRelativeIndex < totalAccessible - 1) {
          setCurrentRelativeIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentRelativeIndex > 0) {
          setCurrentRelativeIndex(prev => prev - 1);
        }
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRelativeIndex, totalAccessible, onClose]);

  // Handle Fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Helper to generate pedagogical slide content when slide images aren't pre-rendered
  const getSlideContent = (globalSlideNum: number) => {
    const slideTopics: Record<number, { title: string; subtitle: string; bullets: string[]; code?: string; note?: string }> = {
      1: {
        title: 'Introduction & Architecture Fundamentals',
        subtitle: 'Foundational Concepts & Industry Standards',
        bullets: [
          'High-level architectural blueprint and modern runtime mechanics.',
          'Separation of concerns: UI layer, business domain, and persistence abstraction.',
          'Strict type systems eliminate 80%+ of typical production runtime failures.',
          'Memory lifecycle, immutable data structures, and deterministic state transitions.'
        ],
        code: `// Enterprise Architectural Contract Example\ninterface ArchitecturePipeline<TInput, TOutput> {\n  readonly pipelineId: string;\n  process(payload: TInput): Promise<TOutput>;\n  validate(payload: TInput): boolean;\n}`,
        note: 'Always adhere to contract-driven design before building concrete service layers.'
      },
      2: {
        title: 'Type Narrowing & Generic Constraints',
        subtitle: 'Production-Grade Type Safety',
        bullets: [
          'Discriminated unions provide exhaustive pattern matching at compile time.',
          'Extending constraints with "extends keyof T" ensures zero type drift.',
          'Runtime validation layers (Zod/Valibot) bind external JSON securely.',
          'Avoiding the "any" type anti-pattern in mission-critical applications.'
        ],
        code: `type Result<T, E = Error> =\n  | { success: true; data: T }\n  | { success: false; error: E };\n\nfunction handleResponse<T>(res: Result<T>): T {\n  if (!res.success) throw res.error;\n  return res.data; // Compiler knows res is success\n}`,
        note: 'Never cast with "as unknown as T" without runtime verification.'
      },
      3: {
        title: 'Component Composition & Custom Hooks',
        subtitle: 'Reusable React 19 State Patterns',
        bullets: [
          'Keep components pure and decouple side-effects into specialized custom hooks.',
          'State colocation: Keep state as close as possible to where it is used.',
          'Context vs Signals vs Micro-state: Choose the right primitive for reactivity.',
          'Clean subscription teardowns prevent memory leaks and zombie child renders.'
        ],
        code: `export function useResourceSubscription<T>(resourceId: string) {\n  const [data, setData] = useState<T | null>(null);\n  useEffect(() => {\n    const unsub = dataService.subscribe(() => refresh());\n    return () => unsub();\n  }, [resourceId]);\n  return data;\n}`,
        note: 'Profile rendering pipelines with React DevTools before optimizing.'
      },
      4: {
        title: 'Performance Profiling & Micro-Frontends',
        subtitle: 'Scale, Latency & Bundle Budgets',
        bullets: [
          'Route splitting and code dynamic imports: Lazy load heavy sub-systems.',
          'Web Workers offload heavy computational threads without blocking UI.',
          'Edge caching and distributed stale-while-revalidate protocols.',
          'Comprehensive automated testing: Unit, Integration, and End-to-End.'
        ],
        code: `// Dynamic chunk splitting\nconst AnalyticsModule = React.lazy(() => import('./AnalyticsDashboard'));\n<Suspense fallback={<LoadingState />}>\n  <AnalyticsModule />\n</Suspense>`,
        note: 'Benchmark Core Web Vitals (LCP, FID, CLS) in continuous integration.'
      },
      5: {
        title: 'Variables, Scope & Memory Allocation',
        subtitle: 'Stack vs Heap Execution Contexts',
        bullets: [
          'Lexical environments, hoisting, and closure variable capture.',
          'Temporal Dead Zone (TDZ) mechanics with let and const declarations.',
          'Garbage collection algorithms: Mark-and-sweep and reference cycles.',
          'Optimizing object shapes for V8 hidden classes.'
        ],
        code: `function createCounter() {\n  let count = 0; // Captured in closure scope\n  return {\n    increment: () => ++count,\n    value: () => count\n  };\n}`,
        note: 'Avoid accidental global references that hinder garbage collection.'
      },
      6: {
        title: 'Data Structures: Arrays, Sets & Hash Tables',
        subtitle: 'Algorithmic Complexity & O(1) Lookups',
        bullets: [
          'Contiguous memory arrays vs linked node traversal tradeoffs.',
          'Hash collision resolution: Chaining vs open addressing.',
          'Time complexities: Amortized insertion, search, and deletion costs.',
          'Spatial locality and CPU cache line efficiency.'
        ],
        code: `const cache = new Map<string, CacheEntry>();\nfunction getFast(key: string) {\n  if (cache.has(key)) return cache.get(key);\n  const val = computeExpensive(key);\n  cache.set(key, val);\n  return val;\n}`,
        note: 'Prefer Map over raw Object for dynamic keys and memory longevity.'
      },
      7: {
        title: 'Asynchronous Programming & Event Loop',
        subtitle: 'Promises, Microtasks & Async/Await',
        bullets: [
          'The Call Stack, Task Queue, and Microtask Queue priority order.',
          'Promise.all vs Promise.allSettled error isolation strategies.',
          'Handling unhandled promise rejections in production environments.',
          'Cancellation tokens and AbortController for pending network requests.'
        ],
        code: `const controller = new AbortController();\nconst timeout = setTimeout(() => controller.abort(), 5000);\nconst res = await fetch('/api/data', { signal: controller.signal });\nclearTimeout(timeout);`,
        note: 'Always pass AbortSignal into asynchronous network calls.'
      },
      8: {
        title: 'Review, Synthesis & Module Milestone',
        subtitle: 'Practical Application & Coding Challenge',
        bullets: [
          'Complete end-to-end coding challenge in the Python 3 / WebAssembly lab.',
          'Self-assessment quiz covering all conceptual pillars.',
          'Prepare for Saturday Special Interactive Mentor Session.',
          'Submit your code repository link for mentor code review.'
        ],
        code: `// Assessment Milestone Checklist\n// [x] Completed all slides and practical coding exercises\n// [x] Passed Flashcards Revision with 80%+ accuracy\n// [x] Ready for live cohort masterclass`,
        note: 'Review flashcards before taking the module quiz.'
      }
    };

    return slideTopics[globalSlideNum] || {
      title: `${presentation.title} • Slide ${globalSlideNum}`,
      subtitle: `Module Lecture Notes & Concepts`,
      bullets: [
        `Detailed lecture curriculum for slide ${globalSlideNum}.`,
        'Focus on production application and clean coding best practices.',
        'Follow along with hands-on coding drills in the interactive lab.',
        'Review documentation and supplemental reference notes.'
      ],
      code: `// Technical Architecture Drill (Slide ${globalSlideNum})\nconst activeSlide = ${globalSlideNum};\nconsole.log('Mastering concept for slide:', activeSlide);`,
      note: 'Refer to the Notes & Documents section for expanded syllabus explanations.'
    };
  };

  const slideData = getSlideContent(currentGlobalSlide);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1220]/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div
        ref={containerRef}
        className="bg-[#0D1527] rounded-2xl md:rounded-3xl border border-[#1E293B] shadow-2xl w-full max-w-6xl h-[94vh] flex flex-col overflow-hidden text-white"
      >
        {/* Top Header Bar */}
        <div className="h-16 px-4 md:px-6 bg-[#0F172A] border-b border-[#1E293B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#176BFF] to-[#00A3FF] flex items-center justify-center text-white shadow-md shadow-[#176BFF]/20 shrink-0">
              <PresIcon className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {presentation.title}
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#176BFF]/20 text-[#38BDF8] border border-[#176BFF]/30">
                  Slide Range: {startSlide}–{endSlide}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {subModuleTitle || 'Active Sub-Module'} • Total Slides in Deck: {presentation.total_slides}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle when PPT URL exists */}
            {presentation.ppt_url && (
              <div className="flex items-center p-0.5 rounded-xl bg-[#1E293B] border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('embedded')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    viewMode === 'embedded'
                      ? 'bg-[#176BFF] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Presentation View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('interactive')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    viewMode === 'interactive'
                      ? 'bg-[#176BFF] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Interactive Slides
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-1 bg-[#1E293B] px-2 py-1 rounded-xl text-xs text-slate-300">
              <button
                onClick={() => setZoomLevel(prev => Math.max(80, prev - 10))}
                className="p-1 hover:text-white transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 font-mono text-[11px]">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
                className="p-1 hover:text-white transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1 hover:text-white transition border-l border-slate-700 ml-1"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
              title="Close Presentation Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-auto bg-[#090E1A] p-3 sm:p-6 flex items-center justify-center">
          {/* Locked / Scheduled Check */}
          {!authInfo.isAccessible ? (
            <div className="max-w-xl w-full bg-[#0F172A] border border-[#1E293B] rounded-3xl p-8 sm:p-10 text-center shadow-2xl">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/10">
                <Lock className="w-10 h-10" />
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4 font-mono">
                {authInfo.isScheduled ? 'Scheduled Slide Release' : 'Content Restricted'}
              </span>

              <h4 className="text-xl sm:text-2xl font-bold text-white mb-3">
                {authInfo.isScheduled ? 'Slides Pending Scheduled Release' : 'Slides Locked by Instructor'}
              </h4>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                These slides will become available when they are released by your instructor.
              </p>

              {authInfo.isScheduled && authInfo.scheduledReleaseAt && (
                <div className="bg-[#1E293B]/70 border border-[#334155] rounded-2xl p-4 mb-6 text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8]">
                    <Clock className="w-4 h-4 text-[#38BDF8]" />
                    <span>Configured Release Schedule</span>
                  </div>
                  <p className="text-sm text-white font-mono">
                    {formatIST(authInfo.scheduledReleaseAt)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    System will automatically unlock slides {startSlide} through {endSlide} when the scheduled release time arrives.
                  </p>
                </div>
              )}

              <div className="text-xs text-slate-500 font-mono">
                Allocated Slide Range: {startSlide}–{endSlide} • Presentation: {presentation.title}
              </div>
            </div>
          ) : viewMode === 'embedded' && presentation.ppt_url ? (
            /* Embedded In-Platform Presentation View */
            <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden border border-[#334155] shadow-2xl bg-black flex flex-col">
              <iframe
                src={getEmbeddablePptUrl(presentation.ppt_url)}
                title={presentation.title}
                className="w-full h-full border-0 flex-1"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          ) : (
            /* Accessible Slide Stage */
            <div
              className="w-full max-w-4xl aspect-[16/10] bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl border border-[#334155] shadow-2xl flex flex-col overflow-hidden transition-all duration-200"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
            >
              {/* Slide Header */}
              <div className="px-6 py-4 border-b border-[#334155]/60 bg-[#0F172A]/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#176BFF] text-white">
                    SLIDE {currentGlobalSlide}
                  </span>
                  <span className="text-xs text-slate-400 truncate max-w-sm hidden sm:inline">
                    {presentation.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-emerald-400 text-[11px]">Authorized Slide</span>
                </div>
              </div>

              {/* Slide Main Content */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
                <div>
                  <div className="mb-6">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-semibold">
                      {slideData.subtitle}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1 tracking-tight">
                      {slideData.title}
                    </h2>
                  </div>

                  {/* Bullet points */}
                  <ul className="space-y-3 mb-6">
                    {slideData.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-slate-200 leading-relaxed">
                        <span className="w-2 h-2 rounded-full bg-[#00A3FF] mt-2 shrink-0 shadow-sm shadow-[#00A3FF]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Code / Visual Box */}
                  {slideData.code && (
                    <div className="rounded-xl bg-[#090E1A] border border-[#334155] p-4 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner">
                      <pre>{slideData.code}</pre>
                    </div>
                  )}
                </div>

                {/* Slide Footer Note */}
                {slideData.note && (
                  <div className="mt-6 pt-4 border-t border-[#334155]/60 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{slideData.note}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">
                      SkillNova Academic System
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="h-20 px-4 md:px-8 bg-[#0F172A] border-t border-[#1E293B] flex items-center justify-between shrink-0">
          {/* Previous Slide Button */}
          <button
            onClick={() => setCurrentRelativeIndex(prev => Math.max(0, prev - 1))}
            disabled={!authInfo.isAccessible || currentRelativeIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white text-xs sm:text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed border border-[#334155]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous Slide</span>
          </button>

          {/* Slide Progress / Thumbnails */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-mono">
                Slide {currentRelativeIndex + 1} of {totalAccessible}
              </span>
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                (Global #{currentGlobalSlide} of {presentation.total_slides})
              </span>
            </div>

            {/* Quick Slide Pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalAccessible }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentRelativeIndex(idx)}
                  className={`w-7 h-2 rounded-full transition-all ${
                    idx === currentRelativeIndex
                      ? 'bg-gradient-to-r from-[#176BFF] to-[#00A3FF] w-9'
                      : 'bg-[#334155] hover:bg-[#475569]'
                  }`}
                  title={`Go to Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Next Slide Button */}
          <button
            onClick={() => setCurrentRelativeIndex(prev => Math.min(totalAccessible - 1, prev + 1))}
            disabled={!authInfo.isAccessible || currentRelativeIndex >= totalAccessible - 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:from-[#1b5ecc] hover:to-[#008bd9] text-white text-xs sm:text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#176BFF]/20"
          >
            <span className="hidden sm:inline">Next Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
