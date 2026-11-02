import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Layers, Video, FileText, Sparkles,
  CheckCircle2, Clock, Play, ExternalLink,
  Presentation as PresIcon, Download, BookOpen, Compass, Code2,
  ChevronRight, Lock, Calendar, AlertCircle, Eye, ShieldCheck, Check,
  HelpCircle, RotateCcw
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { EmbeddedVideoPlayer } from '../../components/resource/EmbeddedVideoPlayer';
import { PdfDocumentViewer } from '../../components/resource/PdfDocumentViewer';
import { PresentationSlideViewer } from '../../components/resource/PresentationSlideViewer';
import { FlashcardDeck } from '../../components/practice/FlashcardDeck';
import { PythonCodingLab } from '../../components/coding/PythonCodingLab';
import type { Topic, Presentation, CourseModule, CourseSubModule } from '../../types';

export const StudentCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const queryModuleId = searchParams.get('module');
  const querySubModuleId = searchParams.get('subModule');

  const [course, setCourse] = useState(() => dataService.getCourseById(courseId || ''));
  const [modules, setModules] = useState<CourseModule[]>(() => dataService.getModulesForCourse(courseId || ''));
  const [allTopics, setAllTopics] = useState<Topic[]>(() => dataService.getReleasedTopics(courseId || ''));
  const [allPresentations, setAllPresentations] = useState<Presentation[]>(() => dataService.getPresentations(courseId || ''));

  // Subscribe to realtime updates from Supabase
  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setCourse(dataService.getCourseById(courseId || ''));
      setModules(dataService.getModulesForCourse(courseId || ''));
      setAllTopics(dataService.getReleasedTopics(courseId || ''));
      setAllPresentations(dataService.getPresentations(courseId || ''));
    });
    return () => unsub();
  }, [courseId]);

  // Selected Module & Sub-Module State
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [selectedSubModuleId, setSelectedSubModuleId] = useState<string>('');

  // Workspace Tabs: Modules vs Python Lab vs Feed
  const [activeTab, setActiveTab] = useState<'modules' | 'python_lab' | 'flashcards' | 'all_feed'>('modules');

  // Dedicated PPT Slide-Level Viewer Modal State
  const [activePptPresentation, setActivePptPresentation] = useState<Presentation | null>(null);

  // Active In-Page Video Player Topic
  const [activeVideoTopic, setActiveVideoTopic] = useState<Topic | null>(null);

  // Active In-Page PDF Viewer Topic
  const [activePdfTopic, setActivePdfTopic] = useState<Topic | null>(null);

  // Notes Modal State
  const [activeNotesTopic, setActiveNotesTopic] = useState<Topic | null>(null);

  // Initialize selected module and sub-module on load or modules change
  useEffect(() => {
    if (modules.length > 0) {
      if (queryModuleId && modules.some(m => m.id === queryModuleId)) {
        setSelectedModuleId(queryModuleId);
        const targetMod = modules.find(m => m.id === queryModuleId);
        const subMods = targetMod?.sub_modules || [];
        if (querySubModuleId && subMods.some(sm => sm.id === querySubModuleId)) {
          setSelectedSubModuleId(querySubModuleId);
        } else if (subMods.length > 0) {
          setSelectedSubModuleId(subMods[0].id);
        }
      } else if (!selectedModuleId || !modules.some(m => m.id === selectedModuleId)) {
        const firstMod = modules[0];
        setSelectedModuleId(firstMod.id);
        const subMods = firstMod.sub_modules || [];
        if (subMods.length > 0) {
          setSelectedSubModuleId(subMods[0].id);
        } else {
          setSelectedSubModuleId('');
        }
      }
    }
  }, [modules, queryModuleId, querySubModuleId]);

  // When selected module changes, update active sub-module
  const handleSelectModule = (modId: string) => {
    setSelectedModuleId(modId);
    const targetMod = modules.find(m => m.id === modId);
    const subMods = targetMod?.sub_modules || [];
    if (subMods.length > 0) {
      setSelectedSubModuleId(subMods[0].id);
    } else {
      setSelectedSubModuleId('');
    }
  };

  if (!course) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Course Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">The requested course is not assigned to your account or has been archived.</p>
        <Link to="/student/courses" className="text-xs text-[#00A3FF] font-bold hover:underline">
          Return to My Courses
        </Link>
      </div>
    );
  }

  const activeModule = modules.find(m => m.id === selectedModuleId) || modules[0];
  const activeSubModules = activeModule?.sub_modules || [];
  const activeSubModule = activeSubModules.find(sm => sm.id === selectedSubModuleId) || activeSubModules[0];

  // Filter topics for the currently selected module and sub-module
  const currentTopics = allTopics.filter(t => {
    if (activeSubModule && t.sub_module_id) {
      return t.sub_module_id === activeSubModule.id;
    }
    return t.module_id === activeModule?.id;
  });

  // Resource Categorization for the active sub-module/module:
  // 1. Videos (recordings or embed videos)
  const videoResources = currentTopics.filter(t =>
    t.recording_url || t.recording_link || t.has_recording || t.resource_category === 'video' || t.resource_type === 'drive_video'
  );

  // Auto-select first video when sub-module changes or videoResources load
  useEffect(() => {
    if (videoResources.length > 0) {
      if (!activeVideoTopic || !videoResources.some(v => v.id === activeVideoTopic.id)) {
        setActiveVideoTopic(videoResources[0]);
      }
    } else {
      setActiveVideoTopic(null);
    }
  }, [selectedSubModuleId, videoResources.length]);

  // 2. PPT Presentations (from presentations table or topic ppt attachments)
  const pptList = allPresentations.filter(p => {
    if (activeSubModule) {
      const hasAlloc = p.allocations?.some(a => a.sub_module_id === activeSubModule.id);
      return p.sub_module_id === activeSubModule.id || hasAlloc || p.module_id === activeModule?.id;
    }
    return p.module_id === activeModule?.id;
  });

  // 3. Interview Questions / Notes & Documents
  const notesResources = currentTopics.filter(t =>
    t.drive_notes_url || t.drive_notes_link || t.resource_category === 'doc_questions' || t.resource_category === 'notes' || t.has_notes
  );

  // 4. PDFs
  const pdfResources = currentTopics.filter(t =>
    t.pdf_file_url || t.pdf_url || t.resource_category === 'pdf'
  );

  // Auto-select first PDF when sub-module changes
  useEffect(() => {
    if (pdfResources.length > 0) {
      if (!activePdfTopic || !pdfResources.some(p => p.id === activePdfTopic.id)) {
        setActivePdfTopic(pdfResources[0]);
      }
    } else {
      setActivePdfTopic(null);
    }
  }, [selectedSubModuleId, pdfResources.length]);

  // 5. Flashcards
  const flashcardResources = dataService.getFlashcards(course.id);

  // Roadmap progress
  const roadmapProgress = dataService.getStudentRoadmapProgress(undefined, course.id);
  const isSubModuleCompleted = activeSubModule ? roadmapProgress.completed_sub_modules.includes(activeSubModule.id) : false;

  const handleMarkComplete = async () => {
    if (activeSubModule) {
      await dataService.markSubModuleCompleted('', course.id, activeSubModule.id);
    }
  };

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

          <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-500 dark:text-slate-400">
            <span>
              Mentor: <strong className="text-[#00A3FF]">{course.mentor_name}</strong>
            </span>
            <span>•</span>
            <span>
              {modules.length} Modules • {allTopics.length} Topics
            </span>
          </div>
        </div>

        {/* Syllabus Progress Card */}
        <div className="bg-slate-50 dark:bg-[#060B18] p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 md:min-w-[220px]">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-200">Roadmap Progress</span>
            <span className="text-[#00A3FF] font-mono">{roadmapProgress.progress_percentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#176BFF] to-[#00A3FF] rounded-full transition-all duration-500"
              style={{ width: `${roadmapProgress.progress_percentage}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center pt-1 font-mono">
            {roadmapProgress.completed_sub_modules.length} units completed
          </div>
        </div>
      </div>

      {/* Main Workspace Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'modules'
              ? 'bg-[#00A3FF] text-white shadow-md shadow-[#00A3FF]/20'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Curriculum Modules</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {modules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('python_lab')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'python_lab'
              ? 'bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white shadow-md shadow-[#00A3FF]/25'
              : 'text-slate-600 dark:text-slate-300 hover:text-[#00A3FF] hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Code2 className="w-4 h-4 text-[#00D1FF]" />
          <span>Python Coding Lab</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
            WASM
          </span>
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'flashcards'
              ? 'bg-[#00A3FF] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Flashcard Decks</span>
        </button>

        <button
          onClick={() => setActiveTab('all_feed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'all_feed'
              ? 'bg-[#00A3FF] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Chronological Feed</span>
        </button>
      </div>

      {/* Tab Content 1: Modular Learning Experience */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          {/* Horizontal Module and Sub-Module Navigation */}
          <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[11px] font-mono">
                Course Modules
              </span>
              <span className="text-slate-500 dark:text-slate-400">Select module to display assigned resources</span>
            </div>

            {/* Row 1: Horizontal Scrollable Module Selector */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
              {modules.map((mod, idx) => {
                const isSelected = mod.id === activeModule?.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleSelectModule(mod.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-[#00A3FF] text-white border-[#00A3FF] shadow-md shadow-[#00A3FF]/25 scale-[1.02]'
                        : 'bg-slate-50 dark:bg-[#060B18] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-[#00A3FF]'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[220px]">{mod.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Row 2: Horizontal Scrollable Sub-Module Selector */}
            {activeSubModules.length > 0 && (
              <div className="pt-3 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#00A3FF] text-[11px] font-mono">
                    Sub-Units in {activeModule?.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{activeSubModules.length} lessons</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
                  {activeSubModules.map((subMod) => {
                    const isSubSelected = subMod.id === activeSubModule?.id;
                    const isDone = roadmapProgress.completed_sub_modules.includes(subMod.id);

                    return (
                      <button
                        key={subMod.id}
                        onClick={() => setSelectedSubModuleId(subMod.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
                          isSubSelected
                            ? 'bg-[#00A3FF]/15 text-[#00A3FF] border-[#00A3FF] font-bold shadow-xs'
                            : 'bg-white dark:bg-[#060B18] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-400'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <ChevronRight className={`w-3.5 h-3.5 ${isSubSelected ? 'text-[#00A3FF]' : 'text-slate-400'}`} />
                        )}
                        <span className="truncate max-w-[240px]">{subMod.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sub-Module Header & Mark Completed Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0A1224] p-5 rounded-2xl border border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#00A3FF]">CURRENT LESSON</span>
                {isSubModuleCompleted && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Completed
                  </span>
                )}
              </div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                {activeSubModule?.title || activeModule?.title || 'Learning Resources'}
              </h2>
              {activeSubModule?.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activeSubModule.description}</p>
              )}
            </div>

            <button
              onClick={handleMarkComplete}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                isSubModuleCompleted
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubModuleCompleted ? 'Stage Marked Complete' : 'Mark Lesson Complete'}</span>
            </button>
          </div>

          {/* THE 5 CLEARLY SEPARATED RESOURCE SECTIONS */}
          <div className="space-y-8">
            
            {/* 1. VIDEOS SECTION - INLINE RESPONSIVE VIDEO PLAYER ON SAME PAGE */}
            <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Videos</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Play lecture recordings & masterclasses directly on this page
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                  {videoResources.length} Video{videoResources.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* In-Page Video Player */}
              {activeVideoTopic ? (
                <div className="space-y-3">
                  <EmbeddedVideoPlayer
                    url={activeVideoTopic.recording_url || activeVideoTopic.recording_link || ''}
                    title={activeVideoTopic.title}
                    subtitle={activeSubModule?.title || course.title}
                  />

                  {/* Playlist Selector below the player */}
                  {videoResources.length > 1 && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 font-mono">
                        Available Video Recordings in this Unit:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {videoResources.map((vid) => {
                          const isCurrent = vid.id === activeVideoTopic.id;
                          return (
                            <button
                              key={vid.id}
                              onClick={() => setActiveVideoTopic(vid)}
                              className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-2 ${
                                isCurrent
                                  ? 'bg-[#00A3FF]/15 border-[#00A3FF] text-[#00A3FF]'
                                  : 'bg-slate-50 dark:bg-[#060B18] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#00A3FF]'
                              }`}
                            >
                              <div className="truncate">
                                <h5 className="text-xs font-bold truncate">{vid.title}</h5>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">HD Quality</span>
                              </div>
                              <Play className={`w-4 h-4 shrink-0 ${isCurrent ? 'fill-[#00A3FF]' : ''}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#060B18] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                  No video lectures configured for this sub-module yet.
                </div>
              )}
            </div>

            {/* 2. PPT PRESENTATIONS (With Slide-Level Access Control) */}
            <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30 flex items-center justify-center">
                    <PresIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">2. PPT Presentations</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      In-platform presentation slide viewer with allocated slide-range restrictions
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                  {pptList.length} Deck{pptList.length !== 1 ? 's' : ''}
                </span>
              </div>

              {pptList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#060B18] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                  No presentation slide decks assigned to this unit yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {pptList.map(pres => {
                    const allocAuth = dataService.getAuthorizedSlidesForSubModule(pres.id, activeSubModule?.id || '');
                    const isReleased = allocAuth.isAccessible;
                    const isScheduled = allocAuth.isScheduled;

                    return (
                      <div
                        key={pres.id}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/10 hover:border-[#00A3FF] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pres.title}</h4>
                            {isReleased ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-mono">
                                Released (Slides {allocAuth.startSlide}–{allocAuth.endSlide})
                              </span>
                            ) : isScheduled ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30 font-mono">
                                Scheduled (Slides {allocAuth.startSlide}–{allocAuth.endSlide})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/20 font-mono">
                                Locked
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
                            {pres.description || 'Curriculum presentation slides for active unit.'}
                          </p>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            Total Deck Slides: {pres.total_slides} • Sub-Unit Target: Slides {allocAuth.startSlide} to {allocAuth.endSlide}
                          </div>
                        </div>

                        <button
                          onClick={() => setActivePptPresentation(pres)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shrink-0 transition ${
                            isReleased
                              ? 'bg-[#00A3FF] hover:bg-[#176BFF] text-white shadow-md shadow-[#00A3FF]/25'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          {isReleased ? (
                            <>
                              <Eye className="w-4 h-4" />
                              <span>View Slides ({allocAuth.startSlide}–{allocAuth.endSlide})</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 text-amber-400" />
                              <span>Check Release Schedule</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. INTERVIEW QUESTIONS / NOTES & DOCUMENTS */}
            <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      3. Interview Questions / Notes & Documents
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Curated interview Q&As, code cheat sheets, and technical study notes
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                  {notesResources.length} Document{notesResources.length !== 1 ? 's' : ''}
                </span>
              </div>

              {notesResources.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#060B18] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                  No interview notes or documents assigned to this unit yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notesResources.map(t => (
                    <div
                      key={t.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/10 hover:border-[#00A3FF] transition flex items-center justify-between gap-3"
                    >
                      <div className="overflow-hidden space-y-1">
                        <span className="text-[10px] font-mono font-bold text-[#00A3FF] uppercase block">Interview Sheet</span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.description || 'Technical interview preparation guide'}</p>
                      </div>
                      <button
                        onClick={() => setActiveNotesTopic(t)}
                        className="px-3.5 py-2 rounded-xl bg-[#00A3FF]/15 hover:bg-[#00A3FF] text-[#00A3FF] hover:text-white border border-[#00A3FF]/30 text-xs font-bold shrink-0 transition flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. PDFS - RESPONSIVE VIEWER WITH PAGE-RANGE RESTRICTIONS */}
            <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">4. PDFs</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      In-platform PDF viewer with page-range security and full-screen controls
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                  {pdfResources.length} File{pdfResources.length !== 1 ? 's' : ''}
                </span>
              </div>

              {pdfResources.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#060B18] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                  No PDF reference manuals assigned to this unit yet.
                </div>
              ) : activePdfTopic ? (
                <div className="space-y-4">
                  {/* Page range authorization check */}
                  {(() => {
                    const pdfAuth = dataService.getAuthorizedPdfForSubModule(
                      activePdfTopic.id,
                      activeSubModule?.id || ''
                    );
                    return (
                      <PdfDocumentViewer
                        pdfUrl={activePdfTopic.pdf_file_url || activePdfTopic.pdf_url || ''}
                        title={activePdfTopic.title}
                        subModuleTitle={activeSubModule?.title}
                        startPage={pdfAuth.startPage || 1}
                        endPage={pdfAuth.endPage || 10}
                        totalPages={pdfAuth.totalPages || 20}
                        isAccessible={pdfAuth.isAccessible}
                        isScheduled={pdfAuth.isScheduled}
                        isLocked={pdfAuth.isLocked}
                        scheduledReleaseAt={pdfAuth.scheduledReleaseAt}
                        allocation={pdfAuth.allocation}
                      />
                    );
                  })()}

                  {/* Switch between other PDFs if multiple exist */}
                  {pdfResources.length > 1 && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 font-mono">
                        Other PDFs for this Section:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {pdfResources.map((pdf) => (
                          <button
                            key={pdf.id}
                            onClick={() => setActivePdfTopic(pdf)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                              pdf.id === activePdfTopic.id
                                ? 'bg-[#00A3FF] text-white border-[#00A3FF]'
                                : 'bg-slate-100 dark:bg-[#060B18] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-[#00A3FF]'
                            }`}
                          >
                            {pdf.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* 5. FLASHCARDS */}
            <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">5. Flashcards</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Rapid active-recall memory drills & core concept definitions
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                  {flashcardResources.length} Cards
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeSubModule?.title || course.title} Active Recall Deck
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Test your understanding with double-sided flashcards before attempting weekly evaluations.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className="px-5 py-2.5 rounded-xl bg-[#00A3FF] hover:bg-[#176BFF] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#00A3FF]/25 shrink-0 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Launch Flashcard Deck</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab Content: Python 3 Coding Lab */}
      {activeTab === 'python_lab' && (
        <div className="space-y-4 animate-in fade-in">
          <PythonCodingLab courseId={course.id} courseTitle={course.title} />
        </div>
      )}

      {/* Tab Content: Flashcards Deck */}
      {activeTab === 'flashcards' && (
        <div className="space-y-4">
          <FlashcardDeck cards={flashcardResources} topicTitle={activeSubModule?.title || course.title} />
        </div>
      )}

      {/* Tab Content: Chronological Feed */}
      {activeTab === 'all_feed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Showing latest published topics first (chronological feed)</span>
            <span className="font-mono">{allTopics.length} Total Lessons</span>
          </div>

          <div className="space-y-3">
            {allTopics.map((topic, idx) => (
              <div
                key={topic.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#0A1224] border border-slate-200 dark:border-white/10 shadow-sm hover:border-[#00A3FF] transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#00A3FF]/15 text-[#00A3FF] flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      {allTopics.length - idx}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{topic.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#00A3FF]" />
                    <span>{topic.created_at ? new Date(topic.created_at).toLocaleDateString() : 'Today'}</span>
                  </div>
                </div>

                {topic.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{topic.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dedicated High-Priority Presentation Slide Viewer Modal */}
      {activePptPresentation && (
        <PresentationSlideViewer
          presentation={activePptPresentation}
          subModuleId={activeSubModule?.id || ''}
          subModuleTitle={activeSubModule?.title}
          onClose={() => setActivePptPresentation(null)}
        />
      )}

      {/* Notes / Document Reader Modal */}
      {activeNotesTopic && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 md:p-8 flex items-center justify-center">
          <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-slate-200 dark:border-white/10 max-w-3xl w-full p-6 md:p-8 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00A3FF]/20 text-[#00A3FF] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeNotesTopic.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Class Notes & Interview Sheet</p>
                </div>
              </div>
              <button
                onClick={() => setActiveNotesTopic(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition"
              >
                Close
              </button>
            </div>

            <div className="prose dark:prose-invert max-w-none text-xs md:text-sm text-slate-700 dark:text-slate-300 space-y-3">
              <p className="leading-relaxed">
                {activeNotesTopic.description || 'Core curriculum review notes, foundational architectural principles, and key technical talking points for this unit.'}
              </p>
              {activeNotesTopic.drive_notes_url && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">Document Source Verified</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Access synced directly from instructor resources</p>
                  </div>
                  <a
                    href={activeNotesTopic.drive_notes_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-[#00A3FF] hover:bg-[#176BFF] text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>Open Reference</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
