import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Layers, Video, FileText, Sparkles,
  CheckCircle2, Clock, Play, ExternalLink,
  Presentation as PresIcon, Download, BookOpen,
  ChevronDown, ChevronUp, Lock, Calendar, AlertCircle, Eye, ShieldCheck, Check,
  HelpCircle, RotateCcw, Circle, PlusCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { EmbeddedVideoPlayer } from '../../components/resource/EmbeddedVideoPlayer';
import { SkillNovaDocumentViewer } from '../../components/resource/SkillNovaDocumentViewer';
import { DynamicFlashcardViewer } from '../../components/practice/DynamicFlashcardViewer';
import type { Topic, Presentation, CourseModule, CourseSubModule, Flashcard, InterviewQuestion } from '../../types';

export const StudentCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const [course, setCourse] = useState(() => dataService.getCourseById(courseId || ''));
  const [modules, setModules] = useState<CourseModule[]>(() => dataService.getModulesForCourse(courseId || ''));
  const [allTopics, setAllTopics] = useState<Topic[]>(() => dataService.getReleasedTopics(courseId || ''));
  const [allPresentations, setAllPresentations] = useState<Presentation[]>(() => dataService.getPresentations(courseId || ''));
  const [allFlashcards, setAllFlashcards] = useState<Flashcard[]>(() => dataService.getFlashcards(courseId || ''));

  // Subscribe to realtime updates from Supabase
  useEffect(() => {
    void dataService.syncCoursesFromSupabase();
    void dataService.syncModulesFromSupabase();
    void dataService.syncSubModulesFromSupabase();
    void dataService.syncTopicsFromSupabase();
    void dataService.syncPresentationsFromSupabase();
    void dataService.syncFlashcardsFromSupabase();
    const unsub = dataService.subscribe(() => {
      setCourse(dataService.getCourseById(courseId || ''));
      setModules(dataService.getModulesForCourse(courseId || ''));
      setAllTopics(dataService.getReleasedTopics(courseId || ''));
      setAllPresentations(dataService.getPresentations(courseId || ''));
      setAllFlashcards(dataService.getFlashcards(courseId || ''));
    });
    return () => unsub();
  }, [courseId]);

  // Selected Module State: 'all' or specific module ID
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);

  // Expanded state for All Modules Accordions
  const [expandedModuleIds, setExpandedModuleIds] = useState<Record<string, boolean>>({});

  // Dedicated Horizontal Resource Category Filter for specific module mode
  type ResourceCategory = 'all' | 'videos' | 'ppt' | 'notes' | 'interview' | 'flashcards';
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('all');

  // Active in-page video
  const [activeVideoTopic, setActiveVideoTopic] = useState<Topic | null>(null);

  // Interactive 5s Countdown Interview Questions State
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>(() => dataService.getInterviewQuestions());
  const [currentInterviewIdx, setCurrentInterviewIdx] = useState(0);
  const [interviewTimeLeft, setInterviewTimeLeft] = useState(5);
  const [isInterviewAnswerRevealed, setIsInterviewAnswerRevealed] = useState(false);
  const [isInterviewTimerRunning, setIsInterviewTimerRunning] = useState(true);
  const interviewTimerRef = useRef<number | null>(null);

  useEffect(() => {
    void dataService.syncInterviewQuestionsFromSupabase();
    const unsub = dataService.subscribe(() => {
      setInterviewQuestions(dataService.getInterviewQuestions());
    });
    return () => unsub();
  }, []);

  const resetInterviewTimer = () => {
    if (interviewTimerRef.current) window.clearInterval(interviewTimerRef.current);
    setInterviewTimeLeft(5);
    setIsInterviewAnswerRevealed(false);
    setIsInterviewTimerRunning(true);
  };

  useEffect(() => {
    resetInterviewTimer();
    return () => {
      if (interviewTimerRef.current) window.clearInterval(interviewTimerRef.current);
    };
  }, [currentInterviewIdx, selectedModuleId]);

  useEffect(() => {
    if (!isInterviewTimerRunning || isInterviewAnswerRevealed) {
      if (interviewTimerRef.current) window.clearInterval(interviewTimerRef.current);
      return;
    }

    interviewTimerRef.current = window.setInterval(() => {
      setInterviewTimeLeft(prev => {
        if (prev <= 1) {
          if (interviewTimerRef.current) window.clearInterval(interviewTimerRef.current);
          setIsInterviewAnswerRevealed(true);
          setIsInterviewTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (interviewTimerRef.current) window.clearInterval(interviewTimerRef.current);
    };
  }, [isInterviewTimerRunning, isInterviewAnswerRevealed]);

  const handleExtendCountdown = () => {
    setInterviewTimeLeft(prev => prev + 5);
    setIsInterviewTimerRunning(true);
    setIsInterviewAnswerRevealed(false);
  };

  const handleRevealNow = () => {
    if (interviewTimerRef.current) window.clearInterval(interviewTimerRef.current);
    setInterviewTimeLeft(0);
    setIsInterviewAnswerRevealed(true);
    setIsInterviewTimerRunning(false);
  };

  // Roadmap progress
  const roadmapProgress = dataService.getStudentRoadmapProgress(undefined, course?.id || '');

  // Helper to determine module completion status (Requirement 2)
  const isModuleCompleted = (mod: CourseModule): boolean => {
    const subMods = mod.sub_modules || [];
    if (subMods.length > 0) {
      return subMods.every(sm => roadmapProgress.completed_sub_modules.includes(sm.id));
    }
    return roadmapProgress.completed_sub_modules.includes(mod.id);
  };

  // Toggle Module Completion handler (persists to Supabase student_progress)
  const handleToggleModuleComplete = async (mod: CourseModule, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!course) return;
    await dataService.toggleModuleCompletion('', course.id, mod.id);
  };

  // Toggle Accordion section in All Modules mode
  const toggleModuleAccordion = (modId: string) => {
    setExpandedModuleIds(prev => ({
      ...prev,
      [modId]: prev[modId] === undefined ? false : !prev[modId]
    }));
  };

  if (!course) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Course Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested course is not assigned to your account or has been archived.
        </p>
        <Link to="/student/courses" className="text-xs text-[#00A3FF] font-bold hover:underline">
          Return to My Courses
        </Link>
      </div>
    );
  }

  // Helper to get grouped resources for any module
  const getModuleResources = (modId: string) => {
    const modTopics = allTopics.filter(t => t.module_id === modId);
    
    // 1. Videos
    const videos = modTopics.filter(t => 
      t.recording_url || t.recording_link || t.resource_type === 'video' || t.resource_type === 'drive_video'
    );

    // 2. PPT Presentations (Strict deduplication by URL and title to prevent double-display)
    const ppts = allPresentations.filter(p => p.module_id === modId);
    const topicPpts = modTopics.filter(t => 
      (t.resource_type === 'ppt' || t.resource_type === 'ppt_presentation' || Boolean(t.ppt_url)) && 
      !ppts.some(p => 
        p.id === t.id || 
        (p.ppt_url && t.ppt_url && p.ppt_url.trim().toLowerCase() === t.ppt_url.trim().toLowerCase()) ||
        (p.title && t.title && p.title.trim().toLowerCase() === t.title.trim().toLowerCase())
      )
    );

    const rawCombinedPpts = [...ppts, ...topicPpts];
    const seenPptKeys = new Set<string>();
    const deduplicatedPpts = rawCombinedPpts.filter(p => {
      const key = (p.ppt_url?.trim() || p.title?.trim() || p.id).toLowerCase();
      if (seenPptKeys.has(key)) return false;
      seenPptKeys.add(key);
      return true;
    });

    // 3. Notes & Documents
    const notes = modTopics.filter(t => 
      (t.resource_type === 'notes' || (t.drive_notes_link && !t.ppt_url)) &&
      t.resource_type !== 'interview' && 
      t.resource_type !== 'doc_questions'
    );

    // 4. Interview Questions
    const interviews = modTopics.filter(t => 
      t.resource_type === 'interview' || t.resource_type === 'doc_questions'
    );

    // 5. Flashcards
    const flashcards = dataService.getFlashcardsForModule(modId, course.id);

    return {
      videos,
      ppts: deduplicatedPpts,
      notes,
      interviews,
      flashcards,
      totalCount: videos.length + deduplicatedPpts.length + notes.length + interviews.length + flashcards.length
    };
  };

  // Active single module resolution
  const activeModule = modules.find(m => m.id === selectedModuleId);
  const activeModuleResources = activeModule ? getModuleResources(activeModule.id) : null;

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Back Link */}
      <Link
        to="/student/courses"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[#00A3FF] transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Enrolled Courses</span>
      </Link>

      {/* Course Header Banner */}
      <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30 font-mono">
              {course.category}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {course.duration_weeks} Weeks Cohort
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {course.title}
          </h1>

          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-500 dark:text-slate-400 font-mono">
            <span>Mentor: <strong className="text-[#00A3FF]">{course.mentor_name}</strong></span>
            <span>•</span>
            <span>{modules.length} Modules • {allTopics.length} Learning Resources</span>
          </div>
        </div>

        {/* Syllabus Progress Card */}
        <div className="bg-slate-50 dark:bg-[#060B18] p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 md:min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-200">Course Mastery</span>
            <span className="text-[#00A3FF] font-mono">{roadmapProgress.progress_percentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#176BFF] to-[#00A3FF] rounded-full transition-all duration-500"
              style={{ width: `${roadmapProgress.progress_percentage}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center pt-1 font-mono">
            {roadmapProgress.completed_sub_modules.length} lessons completed
          </div>
        </div>
      </div>

      {/* COMBINED MODULE DROPDOWN & SELECTION INTERFACE (Requirement 2 & 3) */}
      <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <label className="text-xs font-mono font-bold text-[#00A3FF] uppercase tracking-wider block">
                Curriculum Module Navigation
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Select a specific module or browse All Modules grouped together
              </span>
            </div>
          </div>

          {/* Custom Styled Module Dropdown Container */}
          <div className="relative w-full sm:w-auto sm:min-w-[340px]">
            <button
              type="button"
              onClick={() => setIsModuleDropdownOpen(prev => !prev)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between gap-3 shadow-xs hover:border-[#00A3FF] transition"
            >
              <span className="truncate flex items-center gap-2">
                {selectedModuleId === 'all' ? (
                  <>
                    <span className="text-[#00A3FF] font-black">All Modules</span>
                    <span className="text-slate-400 font-mono">({modules.length} Units)</span>
                  </>
                ) : (
                  <>
                    <span className="text-[#00A3FF] font-black">
                      Module {modules.findIndex(m => m.id === selectedModuleId) + 1} –
                    </span>
                    <span className="truncate">{activeModule?.title}</span>
                    {activeModule && (
                      isModuleCompleted(activeModule) ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-3 h-3 text-slate-400 shrink-0" />
                      )
                    )}
                  </>
                )}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isModuleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Items */}
            {isModuleDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white dark:bg-[#0A1224] rounded-2xl border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden py-1.5 animate-fadeIn max-h-80 overflow-y-auto">
                {/* 1. All Modules Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModuleId('all');
                    setIsModuleDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-xs text-left font-bold flex items-center justify-between transition ${
                    selectedModuleId === 'all'
                      ? 'bg-[#00A3FF]/15 text-[#00A3FF]'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#00A3FF]" />
                    <span>All Modules (Full Curriculum Overview)</span>
                  </span>
                  {selectedModuleId === 'all' && (
                    <span className="w-2 h-2 rounded-full bg-[#00A3FF]" />
                  )}
                </button>

                <div className="border-t border-slate-100 dark:border-white/5 my-1" />

                {/* 2. Individual Modules List with Checkmarks/Circles (Requirement 2) */}
                {modules.map((mod, idx) => {
                  const isCompleted = isModuleCompleted(mod);
                  const isSelected = selectedModuleId === mod.id;

                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        setSelectedModuleId(mod.id);
                        setIsModuleDropdownOpen(false);
                        setActiveCategory('all');
                      }}
                      className={`w-full px-4 py-2.5 text-xs text-left font-semibold flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-[#00A3FF]/15 text-[#00A3FF] font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate pr-3">
                        Module {idx + 1} – {mod.title}
                      </span>

                      {/* Completed = green checkmark (✓), Incomplete = neutral circle (○) */}
                      <span className="shrink-0 flex items-center font-mono">
                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-emerald-500 font-bold" title="Completed Module">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span className="text-[10px]">✓</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold text-xs" title="Incomplete Module">
                            ○
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Single Module Action Bar */}
        {selectedModuleId !== 'all' && activeModule && (
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#00A3FF]">ACTIVE UNIT:</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {activeModule.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => handleToggleModuleComplete(activeModule)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto shrink-0 ${
                isModuleCompleted(activeModule)
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/25'
                  : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10'
              }`}
            >
              {isModuleCompleted(activeModule) ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Module Marked Complete ✓</span>
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mark Module as Complete</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: ALL MODULES SELECTED (Grouped by module, independently collapsible) */}
      {/* ========================================================================= */}
      {selectedModuleId === 'all' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Full Course Curriculum Units ({modules.length} Modules)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Grouped by Module</span>
          </div>

          {modules.map((mod, modIdx) => {
            const isCompleted = isModuleCompleted(mod);
            const isExpanded = expandedModuleIds[mod.id] !== false; // Default expanded
            const res = getModuleResources(mod.id);

            return (
              <div
                key={mod.id}
                className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden transition-all duration-200"
              >
                {/* Module Accordion Header */}
                <div
                  onClick={() => toggleModuleAccordion(mod.id)}
                  className="p-5 sm:p-6 cursor-pointer flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/2 transition select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30 flex items-center justify-center shrink-0 font-bold font-mono">
                      {modIdx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#00A3FF]">
                          Module {modIdx + 1}
                        </span>
                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1 font-mono">
                            <Check className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10 font-mono">
                            ○ In Progress
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {mod.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline-block text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9BAAC5] border border-slate-200 dark:border-white/10">
                      {res.totalCount} Resources
                    </span>
                    <button
                      type="button"
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                      aria-label={isExpanded ? 'Collapse module' : 'Expand module'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Module Resources Body */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-200 dark:border-white/10 space-y-6 animate-fadeIn">
                    {res.totalCount === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#060B18] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                        No learning resources published for this module yet.
                      </div>
                    ) : (
                      <>
                        {/* 1. Videos in this module */}
                        {res.videos.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5 font-mono">
                              <Video className="w-3.5 h-3.5" /> Videos ({res.videos.length})
                            </h5>
                            <div className="space-y-3">
                              {res.videos.map(v => (
                                <EmbeddedVideoPlayer
                                  key={v.id}
                                  url={v.recording_url || v.recording_link || ''}
                                  title={v.title}
                                  subtitle={`Module ${modIdx + 1}: ${mod.title}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 2. PPT Presentations in this module */}
                        {res.ppts.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 font-mono">
                              <PresIcon className="w-3.5 h-3.5" /> PPT Presentations ({res.ppts.length})
                            </h5>
                            <div className="grid grid-cols-1 gap-4">
                              {res.ppts.map(p => (
                                <SkillNovaDocumentViewer
                                  key={p.id}
                                  url={p.ppt_url || ''}
                                  title={p.title}
                                  resourceType="ppt"
                                  startRange={(p as any).slide_start || 1}
                                  endRange={(p as any).slide_end || (p as any).total_slides}
                                  totalRange={(p as any).total_slides}
                                  rangeUnit="slides"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. Notes & Documents in this module */}
                        {res.notes.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5 font-mono">
                              <FileText className="w-3.5 h-3.5" /> Notes & Documents ({res.notes.length})
                            </h5>
                            <div className="grid grid-cols-1 gap-4">
                              {res.notes.map(n => (
                                <SkillNovaDocumentViewer
                                  key={n.id}
                                  url={n.drive_notes_link || n.doc_url || n.pdf_url || ''}
                                  title={n.title}
                                  resourceType="notes"
                                  startRange={n.slide_start}
                                  endRange={n.slide_end}
                                  totalRange={n.total_slides}
                                  rangeUnit="pages"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. Interview Questions in this module */}
                        {res.interviews.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 font-mono">
                              <HelpCircle className="w-3.5 h-3.5" /> Interview Questions ({res.interviews.length})
                            </h5>
                            <div className="grid grid-cols-1 gap-4">
                              {res.interviews.map(iq => (
                                <SkillNovaDocumentViewer
                                  key={iq.id}
                                  url={iq.doc_url || iq.drive_notes_link || iq.pdf_url || ''}
                                  title={iq.title}
                                  resourceType="interview"
                                  startRange={iq.slide_start}
                                  endRange={iq.slide_end}
                                  totalRange={iq.total_slides}
                                  rangeUnit="pages"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 5. Flashcards in this module */}
                        {res.flashcards.length > 0 && (
                          <div className="space-y-3 pt-2">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-purple-500 flex items-center gap-1.5 font-mono">
                              <BookOpen className="w-3.5 h-3.5" /> Dynamic Flashcards ({res.flashcards.length})
                            </h5>
                            <DynamicFlashcardViewer
                              flashcards={res.flashcards}
                              moduleTitle={`Module ${modIdx + 1}: ${mod.title}`}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================================= */
        /* MODE 2: SPECIFIC MODULE SELECTED (Horizontal category tabs & contents)     */
        /* ========================================================================= */
        activeModule && activeModuleResources && (
          <div className="space-y-6">
            {/* Horizontal Resource Category Bar */}
            <div className="bg-white dark:bg-[#0A1224] rounded-2xl border border-slate-200 dark:border-white/10 p-2 shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
                {[
                  { id: 'all' as const, label: 'All Resources', icon: Layers, count: activeModuleResources.totalCount },
                  { id: 'videos' as const, label: 'Videos', icon: Video, count: activeModuleResources.videos.length },
                  { id: 'ppt' as const, label: 'PPT Presentations', icon: PresIcon, count: activeModuleResources.ppts.length },
                  { id: 'notes' as const, label: 'Notes & Documents', icon: FileText, count: activeModuleResources.notes.length },
                  { id: 'interview' as const, label: 'Interview Questions', icon: HelpCircle, count: activeModuleResources.interviews.length },
                  { id: 'flashcards' as const, label: 'Flashcards', icon: BookOpen, count: activeModuleResources.flashcards.length },
                ].map(cat => {
                  const isSelected = activeCategory === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-[#00A8FF] text-white border-[#00A8FF] shadow-md shadow-[#00A8FF]/25 font-bold'
                          : 'bg-slate-50 dark:bg-[#060B18] text-slate-600 dark:text-[#9BAAC5] border-slate-200 dark:border-white/10 hover:border-[#00A8FF]/50 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-[#00A8FF]'}`} />
                      <span>{cat.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-[#9BAAC5]'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Content Area */}
            <div className="space-y-6 animate-fadeIn">
              
              {/* 1. VIDEOS */}
              {(activeCategory === 'videos' || activeCategory === 'all') && (
                <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 md:p-8 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center justify-center">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Curriculum Video Recordings</h4>
                        <p className="text-xs text-slate-500 dark:text-[#9BAAC5]">In-platform video player</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9BAAC5] border border-slate-200 dark:border-white/10">
                      {activeModuleResources.videos.length} Videos
                    </span>
                  </div>

                  {activeModuleResources.videos.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#060B18] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                      No video lectures published yet for this module.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeModuleResources.videos.map(v => (
                        <EmbeddedVideoPlayer
                          key={v.id}
                          url={v.recording_url || v.recording_link || ''}
                          title={v.title}
                          subtitle={activeModule.title}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. PPT PRESENTATIONS */}
              {(activeCategory === 'ppt' || activeCategory === 'all') && (
                <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 md:p-8 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center">
                        <PresIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Presentation Decks & Slides</h4>
                        <p className="text-xs text-slate-500 dark:text-[#9BAAC5]">In-platform viewer with slide restrictions</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9BAAC5] border border-slate-200 dark:border-white/10">
                      {activeModuleResources.ppts.length} Decks
                    </span>
                  </div>

                  {activeModuleResources.ppts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#060B18] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                      No presentation slide decks assigned yet for this module.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {activeModuleResources.ppts.map(p => (
                        <SkillNovaDocumentViewer
                          key={p.id}
                          url={p.ppt_url || ''}
                          title={p.title}
                          resourceType="ppt"
                          startRange={(p as any).slide_start || 1}
                          endRange={(p as any).slide_end || (p as any).total_slides}
                          totalRange={(p as any).total_slides}
                          rangeUnit="slides"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. NOTES & DOCUMENTS */}
              {(activeCategory === 'notes' || activeCategory === 'all') && (
                <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 md:p-8 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 border border-blue-500/30 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Notes & Study Sheets</h4>
                        <p className="text-xs text-slate-500 dark:text-[#9BAAC5]">In-platform scrollable documents</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9BAAC5] border border-slate-200 dark:border-white/10">
                      {activeModuleResources.notes.length} Documents
                    </span>
                  </div>

                  {activeModuleResources.notes.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#060B18] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                      No study notes or documents published yet for this module.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {activeModuleResources.notes.map(n => (
                        <SkillNovaDocumentViewer
                          key={n.id}
                          url={n.drive_notes_link || n.doc_url || n.pdf_url || ''}
                          title={n.title}
                          resourceType="notes"
                          startRange={n.slide_start}
                          endRange={n.slide_end}
                          totalRange={n.total_slides}
                          rangeUnit="pages"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. INTERVIEW QUESTIONS (Embedded 5s Countdown Practice Drill + Question Sheets) */}
              {(activeCategory === 'interview' || activeCategory === 'all') && (() => {
                const moduleQAs = interviewQuestions.filter(q => {
                  if (q.is_published === false) return false;
                  if (q.scheduled_release_at && new Date(q.scheduled_release_at).getTime() > Date.now()) return false;
                  if (selectedModuleId !== 'all') {
                    if (q.topic_id === selectedModuleId) return true;
                    const curMod = modules.find(m => m.id === selectedModuleId);
                    if (curMod?.topics?.some(t => t.id === q.topic_id)) return true;
                    if (q.course_id === course?.id) return true;
                    return false;
                  }
                  return q.course_id === course?.id || !q.course_id;
                });

                const currentQ = moduleQAs[currentInterviewIdx] || moduleQAs[0];

                return (
                  <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 md:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">Technical Interview Questions</h4>
                          <p className="text-xs text-slate-500 dark:text-[#9BAAC5]">Interactive 5s timed drill with industry model explanations</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9BAAC5] border border-slate-200 dark:border-white/10">
                        {moduleQAs.length} Questions
                      </span>
                    </div>

                    {moduleQAs.length === 0 && activeModuleResources.interviews.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#060B18] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                        No interview questions assigned yet for this module.
                      </div>
                    ) : null}

                    {/* INTERACTIVE 5S PRACTICE MODE */}
                    {moduleQAs.length > 0 && currentQ && (
                      <div className="space-y-4">
                        {/* Progress Header */}
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-[#101A2D] p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-bold text-slate-900 dark:text-[#F0F5FF]">
                              Question <span className="text-[#00A3FF]">{currentInterviewIdx + 1}</span> of {moduleQAs.length}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              (currentQ.difficulty || 'medium') === 'hard'
                                ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/25'
                                : (currentQ.difficulty || 'medium') === 'medium'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                            }`}>
                              {currentQ.difficulty || 'medium'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (currentInterviewIdx > 0) setCurrentInterviewIdx(prev => prev - 1);
                              }}
                              disabled={currentInterviewIdx === 0}
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#15233A] hover:bg-slate-100 dark:hover:bg-[#1F2E47] text-slate-700 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-white/10 flex items-center gap-1 transition text-xs font-semibold"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Prev</span>
                            </button>
                            <button
                              onClick={() => {
                                if (currentInterviewIdx < moduleQAs.length - 1) setCurrentInterviewIdx(prev => prev + 1);
                              }}
                              disabled={currentInterviewIdx === moduleQAs.length - 1}
                              className="px-3 py-1.5 rounded-xl bg-[#176BFF] hover:bg-[#00A3FF] text-white disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1 transition text-xs shadow-md shadow-[#176BFF]/20"
                            >
                              <span className="hidden sm:inline">Next</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Question Box */}
                        <div className="bg-slate-50 dark:bg-[#101A2D] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                            <span className="text-[11px] font-mono text-slate-500 dark:text-[#9BAAC2]">
                              Module Question Prompt
                            </span>

                            {/* 5-Second Countdown Indicator */}
                            {!isInterviewAnswerRevealed ? (
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-mono text-xs font-bold animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Revealing answer in: {interviewTimeLeft}s</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Answer Revealed</span>
                              </div>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-[#F0F5FF] leading-snug">
                            {currentQ.question}
                          </h3>

                          {currentQ.role_category && (
                            <span className="inline-block text-[11px] font-mono text-[#00A3FF] bg-[#00A3FF]/10 px-2.5 py-0.5 rounded-md border border-[#00A3FF]/20">
                              Target Role: {currentQ.role_category}
                            </span>
                          )}

                          {/* Countdown Controls (Before Reveal) */}
                          {!isInterviewAnswerRevealed ? (
                            <div className="p-4 rounded-xl bg-white dark:bg-[#15233A] border border-dashed border-amber-500/40 text-center space-y-3">
                              <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">
                                Formulate your thoughts. Auto-revealing in <strong className="text-amber-500 font-mono">{interviewTimeLeft} seconds</strong>.
                              </p>
                              <div className="flex flex-wrap items-center justify-center gap-2.5">
                                <button
                                  onClick={handleExtendCountdown}
                                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  <span>+5s Extend Countdown</span>
                                </button>
                                <button
                                  onClick={handleRevealNow}
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#00A3FF]/25 hover:opacity-95 transition"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Reveal Answer Now</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Answer Revealed */
                            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/10 animate-fadeIn">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#176BFF] dark:text-[#77B4FF] flex items-center gap-1.5 font-mono">
                                  <Sparkles className="w-3.5 h-3.5 text-[#176BFF]" />
                                  Model Answer & Explanation
                                </span>
                                <button
                                  onClick={resetInterviewTimer}
                                  className="text-[11px] text-slate-500 dark:text-[#9BAAC2] hover:text-slate-800 dark:hover:text-white flex items-center gap-1 font-mono transition"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Reset Timer
                                </button>
                              </div>

                              <div className="bg-white dark:bg-[#080E1C] border border-slate-200 dark:border-[#397BFF]/30 p-4 sm:p-5 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-[#F0F5FF] leading-relaxed whitespace-pre-line font-sans shadow-inner">
                                {currentQ.model_answer || currentQ.sampleAnswer || currentQ.answer || 'Detailed answer explanation is being finalized.'}
                              </div>

                              {currentQ.key_talking_points && currentQ.key_talking_points.length > 0 && (
                                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#15233A] border border-slate-200 dark:border-white/10 space-y-1.5">
                                  <span className="text-[10px] font-bold text-slate-600 dark:text-[#9BAAC2] uppercase font-mono block">
                                    Key Talking Points:
                                  </span>
                                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-200">
                                    {currentQ.key_talking_points.map((pt, idx) => (
                                      <li key={idx}>{pt}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Question Sheets / Documents */}
                    {activeModuleResources.interviews.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-[#9BAAC5] uppercase tracking-wider font-mono block">
                          Interview Question Sheets & Reference Guides:
                        </span>
                        <div className="grid grid-cols-1 gap-4">
                          {activeModuleResources.interviews.map(iq => (
                            <SkillNovaDocumentViewer
                              key={iq.id}
                              url={iq.doc_url || iq.drive_notes_link || iq.pdf_url || ''}
                              title={iq.title}
                              resourceType="interview"
                              startRange={iq.slide_start}
                              endRange={iq.slide_end}
                              totalRange={iq.total_slides}
                              rangeUnit="pages"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 5. FLASHCARDS */}
              {(activeCategory === 'flashcards' || activeCategory === 'all') && (
                <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 md:p-8 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Module Dynamic Flashcards</h4>
                        <p className="text-xs text-slate-500 dark:text-[#9BAAC5]">Interactive front/back review cards</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9BAAC5] border border-slate-200 dark:border-white/10">
                      {activeModuleResources.flashcards.length} Cards
                    </span>
                  </div>

                  <DynamicFlashcardViewer
                    flashcards={activeModuleResources.flashcards}
                    moduleTitle={activeModule.title}
                  />
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default StudentCourseDetailPage;
