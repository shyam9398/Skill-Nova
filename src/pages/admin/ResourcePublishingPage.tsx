import React, { useState, useEffect } from 'react';
import {
  UploadCloud, Video, Presentation, FileText, HelpCircle,
  Layers, CheckCircle2, AlertCircle, Clock, Trash2, Edit3,
  Calendar, Eye, Play, Sparkles, Plus, X, Check, Save,
  ChevronRight, RefreshCw, Lock, ShieldCheck, AlertTriangle, BookOpen
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { resolveResourceUrl } from '../../utils/resourceUrlResolver';
import type { Course, CourseModule, CourseSubModule, Topic, Flashcard } from '../../types';

export type ResourceType = 'video' | 'ppt' | 'notes' | 'interview' | 'flashcards';

export const ResourcePublishingPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [subModules, setSubModules] = useState<CourseSubModule[]>([]);
  const [selectedSubModuleId, setSelectedSubModuleId] = useState('');

  // Exactly the 5 Resource Types required
  const [selectedType, setSelectedType] = useState<ResourceType>('video');

  // Shared form fields
  const [topicTitle, setTopicTitle] = useState('');
  const [curriculumName, setCurriculumName] = useState('Core Engineering Track');
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [topicDesc, setTopicDesc] = useState('');

  // 1. Video URL
  const [videoUrl, setVideoUrl] = useState('');

  // 2. PPT Presentation URL & Slide Restrictions
  const [pptUrl, setPptUrl] = useState('');
  const [pptTotalSlides, setPptTotalSlides] = useState(60);
  const [pptSlideStart, setPptSlideStart] = useState(1);
  const [pptSlideEnd, setPptSlideEnd] = useState(20);

  // 3. Notes & Documents URL & Page Restrictions
  const [notesDocUrl, setNotesDocUrl] = useState('');
  const [notesTotalPages, setNotesTotalPages] = useState(30);
  const [notesPageStart, setNotesPageStart] = useState(1);
  const [notesPageEnd, setNotesPageEnd] = useState(15);

  // 4. Interview Questions URL & Page Restrictions
  const [interviewDocUrl, setInterviewDocUrl] = useState('');
  const [interviewTotalPages, setInterviewTotalPages] = useState(25);
  const [interviewPageStart, setInterviewPageStart] = useState(1);
  const [interviewPageEnd, setInterviewPageEnd] = useState(10);

  // 5. Flashcards Form
  const [fcQuestion, setFcQuestion] = useState('');
  const [fcAnswer, setFcAnswer] = useState('');
  const [fcDifficulty, setFcDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Release / Hold Scheduling management in Asia/Kolkata (IST)
  const [releaseAction, setReleaseAction] = useState<'release' | 'hold'>('release');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleHour, setScheduleHour] = useState('10');
  const [scheduleMinute, setScheduleMinute] = useState('00');
  const [schedulePeriod, setSchedulePeriod] = useState<'AM' | 'PM'>('AM');
  const [selectedTimezone] = useState('Asia/Kolkata');

  // Feedback banner
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [existingResources, setExistingResources] = useState<Topic[]>([]);
  const [existingFlashcards, setExistingFlashcards] = useState<Flashcard[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Module creation modal
  const [showQuickAddModule, setShowQuickAddModule] = useState(false);
  const [quickModuleTitle, setQuickModuleTitle] = useState('');
  const [quickModuleDesc, setQuickModuleDesc] = useState('');

  useEffect(() => {
    void dataService.syncCoursesFromSupabase();
    void dataService.syncModulesFromSupabase();
    void dataService.syncSubModulesFromSupabase();
    void dataService.syncTopicsFromSupabase();
    void dataService.syncPresentationsFromSupabase();
    void dataService.syncFlashcardsFromSupabase();
    loadData();
    const unsubscribe = dataService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const loadData = () => {
    const list = dataService.getCoursesForCurrentUser();
    setCourses(list);
    const activeCourseId = selectedCourseId || (list.length > 0 ? list[0].id : '');
    if (activeCourseId) {
      if (!selectedCourseId) setSelectedCourseId(activeCourseId);
      const mods = dataService.getModulesForCourse(activeCourseId);
      setModules(mods);
      if (mods.length > 0) {
        const activeModId = (selectedModuleId && mods.some(m => m.id === selectedModuleId)) ? selectedModuleId : mods[0].id;
        setSelectedModuleId(activeModId);
        const subMods = dataService.getSubModules(activeModId, activeCourseId);
        setSubModules(subMods);
        if (subMods.length > 0 && (!selectedSubModuleId || !subMods.some(s => s.id === selectedSubModuleId))) {
          setSelectedSubModuleId(subMods[0].id);
        }
      } else {
        setSelectedModuleId('');
        setSubModules([]);
        setSelectedSubModuleId('');
      }
    }
    setExistingResources(dataService.getAllAdminTopics());
    setExistingFlashcards(dataService.getFlashcards());
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    const mods = dataService.getModulesForCourse(courseId);
    setModules(mods);
    if (mods.length > 0) {
      setSelectedModuleId(mods[0].id);
      const subMods = dataService.getSubModules(mods[0].id, courseId);
      setSubModules(subMods);
      if (subMods.length > 0) {
        setSelectedSubModuleId(subMods[0].id);
      } else {
        setSelectedSubModuleId('');
      }
    } else {
      setSelectedModuleId('');
      setSubModules([]);
      setSelectedSubModuleId('');
    }
  };

  const handleModuleChange = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    const subMods = dataService.getSubModules(moduleId, selectedCourseId);
    setSubModules(subMods);
    if (subMods.length > 0) {
      setSelectedSubModuleId(subMods[0].id);
    } else {
      setSelectedSubModuleId('');
    }
  };

  // Validation function for page / slide restrictions (Requirement 9)
  const validateRange = (total: number, start: number, end: number, label: string): string | null => {
    if (total <= 0) return `${label} total must be greater than 0.`;
    if (start < 1) return `${label} starting position must be at least 1.`;
    if (end < start) return `${label} ending position cannot be less than starting position.`;
    if (end > total) return `${label} ending position (${end}) cannot exceed total (${total}).`;
    return null;
  };

  // Save Resource Handler
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedModuleId) {
      setFeedback({ type: 'error', message: 'Please select a Course and Curriculum Module.' });
      return;
    }

    // Special case for flashcard creation
    if (selectedType === 'flashcards') {
      if (!fcQuestion.trim() || !fcAnswer.trim()) {
        setFeedback({ type: 'error', message: 'Flashcard Question and Model Answer are both required.' });
        return;
      }

      setIsSubmitting(true);
      try {
        await dataService.addFlashcard({
          course_id: selectedCourseId,
          topic_id: selectedSubModuleId || selectedModuleId,
          question: fcQuestion.trim(),
          answer: fcAnswer.trim(),
          difficulty: fcDifficulty,
          is_published: true
        });

        setFcQuestion('');
        setFcAnswer('');
        setFeedback({ type: 'success', message: 'Flashcard created and saved directly to Supabase!' });
        setTimeout(() => setFeedback(null), 4000);
      } catch (err: any) {
        setFeedback({ type: 'error', message: err?.message || 'Failed to save flashcard to Supabase.' });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Standard Topic / Document / Video / PPT Resource validation
    if (!topicTitle.trim()) {
      setFeedback({ type: 'error', message: 'Resource Title is required.' });
      return;
    }

    // Restriction validations
    if (selectedType === 'ppt') {
      const err = validateRange(pptTotalSlides, pptSlideStart, pptSlideEnd, 'Slide restriction');
      if (err) {
        setFeedback({ type: 'error', message: err });
        return;
      }
    } else if (selectedType === 'notes') {
      const err = validateRange(notesTotalPages, notesPageStart, notesPageEnd, 'Document page restriction');
      if (err) {
        setFeedback({ type: 'error', message: err });
        return;
      }
    } else if (selectedType === 'interview') {
      const err = validateRange(interviewTotalPages, interviewPageStart, interviewPageEnd, 'Interview document restriction');
      if (err) {
        setFeedback({ type: 'error', message: err });
        return;
      }
    }

    const isReleased = releaseAction === 'release';
    let hour24 = parseInt(scheduleHour, 10) || 10;
    if (schedulePeriod === 'PM' && hour24 < 12) hour24 += 12;
    if (schedulePeriod === 'AM' && hour24 === 12) hour24 = 0;
    const hourStr = String(hour24).padStart(2, '0');
    const minStr = String(parseInt(scheduleMinute, 10) || 0).padStart(2, '0');
    const scheduledIso = !isReleased
      ? new Date(`${scheduleDate}T${hourStr}:${minStr}:00+05:30`).toISOString()
      : undefined;

    let payload: Partial<Topic> = {
      course_id: selectedCourseId,
      module_id: selectedModuleId,
      sub_module_id: selectedSubModuleId || undefined,
      title: topicTitle.trim(),
      description: topicDesc.trim() || `${selectedType.toUpperCase()} resource for ${curriculumName}`,
      class_date: classDate,
      resource_type: selectedType,
      curriculum_name: curriculumName,
      timezone: selectedTimezone,
      is_published: isReleased,
      release_status: isReleased ? 'released' : 'scheduled',
      scheduled_release_at: scheduledIso,
      released_at: isReleased ? new Date().toISOString() : undefined,
      released_by: 'Administrator'
    };

    setIsSubmitting(true);
    try {
      if (selectedType === 'video') {
        const resolved = resolveResourceUrl(videoUrl, 'video');
        payload.recording_link = videoUrl.trim();
        payload.recording_url = resolved.embedUrl || videoUrl.trim();
        payload.drive_video_url = videoUrl.trim();
        payload.has_recording = true;
      } else if (selectedType === 'ppt') {
        const resolved = resolveResourceUrl(pptUrl, 'ppt');
        payload.ppt_url = pptUrl.trim();
        payload.ppt_file_url = resolved.embedUrl || pptUrl.trim();
        payload.total_slides = pptTotalSlides;
        payload.slide_start = pptSlideStart;
        payload.slide_end = pptSlideEnd;

        // Dedicated presentations table
        const pres = await dataService.addPresentation({
          course_id: selectedCourseId,
          module_id: selectedModuleId,
          sub_module_id: selectedSubModuleId || undefined,
          title: topicTitle.trim(),
          description: topicDesc.trim(),
          ppt_url: pptUrl.trim(),
          total_slides: pptTotalSlides,
          uploaded_by: 'Administrator'
        });

        await dataService.addSlideAllocation({
          presentation_id: pres.id,
          sub_module_id: selectedSubModuleId || undefined,
          start_slide: pptSlideStart,
          end_slide: pptSlideEnd,
          release_status: isReleased ? 'released' : 'scheduled',
          scheduled_release_at: scheduledIso,
        });
      } else if (selectedType === 'notes') {
        const resolved = resolveResourceUrl(notesDocUrl, 'notes');
        payload.drive_notes_link = notesDocUrl.trim();
        payload.doc_url = resolved.embedUrl || notesDocUrl.trim();
        payload.pdf_url = notesDocUrl.trim();
        payload.has_notes = true;
        payload.doc_page_range = `Pages ${notesPageStart}–${notesPageEnd} of ${notesTotalPages}`;
        payload.total_slides = notesTotalPages;
        payload.slide_start = notesPageStart;
        payload.slide_end = notesPageEnd;
      } else if (selectedType === 'interview') {
        const resolved = resolveResourceUrl(interviewDocUrl, 'interview');
        payload.drive_notes_link = interviewDocUrl.trim();
        payload.doc_url = resolved.embedUrl || interviewDocUrl.trim();
        payload.pdf_url = interviewDocUrl.trim();
        payload.doc_page_range = `Pages ${interviewPageStart}–${interviewPageEnd} of ${interviewTotalPages}`;
        payload.total_slides = interviewTotalPages;
        payload.slide_start = interviewPageStart;
        payload.slide_end = interviewPageEnd;
      }

      const createdTopic = await dataService.addTopic(payload);

      // Reset form
      setTopicTitle('');
      setTopicDesc('');
      setVideoUrl('');
      setPptUrl('');
      setNotesDocUrl('');
      setInterviewDocUrl('');

      setFeedback({
        type: 'success',
        message: `Resource "${createdTopic.title}" saved successfully to Supabase! Status: ${
          isReleased ? 'RELEASED Immediately' : `SCHEDULED for ${scheduleDate} at ${scheduleHour}:${scheduleMinute} ${schedulePeriod} (IST)`
        }`
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to persist resource to database. Please try again.'
      });
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick module creation
  const handleQuickAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !quickModuleTitle.trim()) return;

    try {
      const createdMod = await dataService.addModule(
        selectedCourseId,
        quickModuleTitle.trim(),
        quickModuleDesc.trim() || undefined,
        modules.length + 1
      );

      setShowQuickAddModule(false);
      setQuickModuleTitle('');
      setQuickModuleDesc('');
      setSelectedModuleId(createdMod.id);
      setFeedback({ type: 'success', message: `Module "${createdMod.title}" created in Supabase!` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Error creating module.' });
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const selectedModule = modules.find((m) => m.id === selectedModuleId);

  // Filter existing resources by current course and module
  const currentFilteredResources = existingResources.filter(t => {
    const matchCourse = t.course_id === selectedCourseId;
    const matchModule = !selectedModuleId || t.module_id === selectedModuleId;
    if (!matchCourse || !matchModule) return false;

    if (selectedType === 'video') return t.resource_type === 'video' || t.resource_type === 'drive_video' || Boolean(t.recording_url || t.recording_link);
    if (selectedType === 'ppt') return t.resource_type === 'ppt' || t.resource_type === 'ppt_presentation' || Boolean(t.ppt_url);
    if (selectedType === 'notes') return t.resource_type === 'notes' || (t.resource_type !== 'interview' && Boolean(t.drive_notes_link && !t.ppt_url));
    if (selectedType === 'interview') return t.resource_type === 'interview' || t.resource_type === 'doc_questions';
    return false;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-lg transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40">
            CURRICULUM PROVISIONING
          </span>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Supabase Synchronized
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-[#F0F5FF] flex items-center gap-2">
          <UploadCloud className="w-7 h-7 text-[#397BFF]" />
          Learning Resources Management
        </h1>
        <p className="text-xs text-[#9BAAC2] mt-0.5 max-w-3xl">
          Provision curriculum learning materials matching the 5 student resource categories: Videos, PPT Presentations, Notes & Documents, Interview Questions, and Flashcards.
        </p>
      </div>

      {/* Course & Module Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#101A2D] border border-[#1F2E47] p-5 rounded-3xl shadow-xl">
        {/* Course Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#F0F5FF] uppercase tracking-wider font-mono block">
            1. Select Course / Track *
          </label>
          <select
            aria-label="Select Course Track"
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="w-full bg-[#15233A] text-xs text-[#F0F5FF] font-semibold px-4 py-2.5 rounded-xl border border-[#1F2E47] outline-none focus:border-[#397BFF] transition cursor-pointer"
          >
            {courses.length === 0 ? (
              <option value="">No authorized courses found</option>
            ) : (
              courses.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#11192A]">
                  {c.title}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Module Dropdown */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#F0F5FF] uppercase tracking-wider font-mono block">
              2. Select Curriculum Module *
            </label>
            <button
              type="button"
              onClick={() => setShowQuickAddModule(true)}
              className="text-[11px] font-bold text-[#397BFF] hover:text-[#77B4FF] flex items-center gap-1 transition"
            >
              <Plus className="w-3 h-3" />
              <span>+ Add Module</span>
            </button>
          </div>
          <select
            aria-label="Select Curriculum Module"
            value={selectedModuleId}
            onChange={(e) => handleModuleChange(e.target.value)}
            className="w-full bg-[#15233A] text-xs text-[#F0F5FF] font-semibold px-4 py-2.5 rounded-xl border border-[#1F2E47] outline-none focus:border-[#397BFF] transition cursor-pointer"
          >
            {modules.length === 0 ? (
              <option value="" className="bg-[#11192A]">No modules found. Click "+ Add Module" to create.</option>
            ) : (
              modules.map((m, idx) => (
                <option key={m.id} value={m.id} className="bg-[#11192A]">
                  Module {idx + 1}: {m.title}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Exactly the 5 Resource Category Selectors (Part B, Requirement 7 & 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { type: 'video' as const, label: '1. Videos', icon: Video, color: 'text-rose-400', count: existingResources.filter(t => t.resource_type === 'video' || t.resource_type === 'drive_video' || t.recording_url).length },
          { type: 'ppt' as const, label: '2. PPT Presentations', icon: Presentation, color: 'text-amber-400', count: existingResources.filter(t => t.resource_type === 'ppt' || t.resource_type === 'ppt_presentation' || t.ppt_url).length },
          { type: 'notes' as const, label: '3. Notes & Documents', icon: FileText, color: 'text-blue-400', count: existingResources.filter(t => t.resource_type === 'notes' || (t.resource_type !== 'interview' && t.drive_notes_link && !t.ppt_url)).length },
          { type: 'interview' as const, label: '4. Interview Questions', icon: HelpCircle, color: 'text-emerald-400', count: existingResources.filter(t => t.resource_type === 'interview' || t.resource_type === 'doc_questions').length },
          { type: 'flashcards' as const, label: '5. Flashcards', icon: BookOpen, color: 'text-purple-400', count: existingFlashcards.length },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedType === item.type;

          return (
            <button
              key={item.type}
              type="button"
              onClick={() => setSelectedType(item.type)}
              className={`p-4 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-2 text-center ${
                isSelected
                  ? 'bg-[#00A8FF] text-white border-[#00A8FF] shadow-lg shadow-[#00A8FF]/25 scale-102'
                  : 'bg-[#101A2D] text-[#9BAAC2] hover:text-[#F0F5FF] border-[#1F2E47] hover:bg-[#15233A]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : item.color}`} />
              <span>{item.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-[#9BAAC2]'
              }`}>
                {item.count} Records
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Creation Form Card */}
      <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="border-b border-[#1F2E47] pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#F0F5FF] capitalize flex items-center gap-2">
              <span>{selectedType.toUpperCase()} Creation & Provisioning</span>
            </h3>
            <p className="text-xs text-[#9BAAC2]">
              Configuring for: <strong className="text-white">{selectedCourse?.title}</strong> • {selectedModule?.title || 'Selected Module'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveResource} className="space-y-5">
          
          {/* CATEGORY 5: FLASHCARDS FORM */}
          {selectedType === 'flashcards' ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#15233A] rounded-2xl border border-purple-500/20 space-y-4">
                <span className="text-xs font-bold text-purple-300 uppercase font-mono block">
                  New Flashcard Q&A Item
                </span>

                <div>
                  <label className="text-xs font-bold text-white block mb-1">
                    Question / Front Prompt *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. What is the time complexity of B-Tree database index lookups?"
                    value={fcQuestion}
                    onChange={(e) => setFcQuestion(e.target.value)}
                    className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-xl p-3 text-xs text-[#F0F5FF] outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1">
                    Model Answer / Reverse Explanation *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. O(log N) logarithmic depth. B-Trees maintain balanced node branching factors, minimizing physical disk seeks."
                    value={fcAnswer}
                    onChange={(e) => setFcAnswer(e.target.value)}
                    className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-xl p-3 text-xs text-[#F0F5FF] outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#9BAAC2]">Difficulty:</span>
                  {(['easy', 'medium', 'hard'] as const).map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setFcDifficulty(diff)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                        fcDifficulty === diff
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-[#0A101D] border border-white/10 text-slate-400'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-[#00A8FF] text-white text-xs font-black shadow-lg shadow-purple-600/25 hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving to Supabase...' : 'Save Flashcard to Supabase'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* STANDARD RESOURCE CATEGORIES (1: Videos, 2: PPT, 3: Notes, 4: Interview) */
            <>
              {/* Title & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#F0F5FF] block mb-1">
                    Resource Title <span className="text-[#397BFF]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Consensus & Raft Architecture"
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#F0F5FF] block mb-1">Curriculum Class Date *</label>
                  <input
                    type="date"
                    required
                    value={classDate}
                    onChange={(e) => setClassDate(e.target.value)}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-[#F0F5FF] block mb-1">Description / Syllabus Notes</label>
                <textarea
                  rows={2}
                  placeholder="Outline key learning outcomes and competencies for students..."
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl p-3 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                />
              </div>

              {/* 1. VIDEOS FORM */}
              {selectedType === 'video' && (
                <div className="p-4 bg-[#15233A] rounded-2xl border border-rose-500/20 space-y-3">
                  <label className="text-xs font-bold text-rose-300 block flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-rose-400" />
                    Video Recording URL (Google Drive, YouTube, Vimeo, or MP4) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/file/d/.../view or https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-rose-500 font-mono"
                  />
                  <p className="text-[11px] text-[#9BAAC2]">
                    The SkillNova Resource Resolver automatically converts Drive links to in-page iframe preview players and protects external redirect icons.
                  </p>
                </div>
              )}

              {/* 2. PPT PRESENTATIONS & SLIDE RESTRICTION CONTROLS (Requirement 9) */}
              {selectedType === 'ppt' && (
                <div className="p-4 bg-[#15233A] rounded-2xl border border-amber-500/20 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-amber-300 block flex items-center gap-1.5 mb-1">
                      <Presentation className="w-4 h-4 text-amber-400" />
                      PPT Presentation URL (Google Slides, Drive preview, Office Web Apps) *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://docs.google.com/presentation/d/.../edit or public .pptx link"
                      value={pptUrl}
                      onChange={(e) => setPptUrl(e.target.value)}
                      className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* Slide Range Restriction Controls */}
                  <div className="p-4 rounded-xl bg-[#0A101D] border border-amber-500/30 space-y-3">
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Slide Restriction Controls (Allocated Slide Permissions)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-[#9BAAC2] block mb-1">Total Deck Slides *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={pptTotalSlides}
                          onChange={(e) => setPptTotalSlides(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#9BAAC2] block mb-1">Starting Slide *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={pptSlideStart}
                          onChange={(e) => setPptSlideStart(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#9BAAC2] block mb-1">Ending Slide *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={pptSlideEnd}
                          onChange={(e) => setPptSlideEnd(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-[#9BAAC2] font-mono">
                      Student Access Scope: Slides <strong className="text-amber-400">{pptSlideStart}</strong> to <strong className="text-amber-400">{pptSlideEnd}</strong> are accessible. Remaining slides outside this range are restricted.
                    </div>
                  </div>
                </div>
              )}

              {/* 3. NOTES & DOCUMENTS & PAGE RESTRICTION CONTROLS (Requirement 9) */}
              {selectedType === 'notes' && (
                <div className="p-4 bg-[#15233A] rounded-2xl border border-blue-500/20 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-blue-300 block flex items-center gap-1.5 mb-1">
                      <FileText className="w-4 h-4 text-blue-400" />
                      Notes & Document URL (Google Docs, Drive preview, PDF) *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://docs.google.com/document/d/... or Google Drive PDF link"
                      value={notesDocUrl}
                      onChange={(e) => setNotesDocUrl(e.target.value)}
                      className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  {/* Document Page Range Controls */}
                  <div className="p-4 rounded-xl bg-[#0A101D] border border-blue-500/30 space-y-3">
                    <span className="text-xs font-mono font-bold text-blue-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Document Page Restrictions
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-[#9BAAC2] block mb-1">Total Document Pages *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={notesTotalPages}
                          onChange={(e) => setNotesTotalPages(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#9BAAC2] block mb-1">Starting Page *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={notesPageStart}
                          onChange={(e) => setNotesPageStart(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#9BAAC2] block mb-1">Ending Page *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={notesPageEnd}
                          onChange={(e) => setNotesPageEnd(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-[#9BAAC2] font-mono">
                      Student Access Scope: Pages <strong className="text-blue-400">{notesPageStart}</strong> to <strong className="text-blue-400">{notesPageEnd}</strong> (Total {notesTotalPages} pages).
                    </div>
                  </div>
                </div>
              )}

              {/* 4. INTERVIEW QUESTIONS & RESTRICTIONS (Requirement 9) */}
              {selectedType === 'interview' && (
                <div className="p-4 bg-[#15233A] rounded-2xl border border-emerald-500/20 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-emerald-300 block flex items-center gap-1.5 mb-1">
                      <HelpCircle className="w-4 h-4 text-emerald-400" />
                      Interview Question Document URL (Google Docs, Drive PDF, Cheat Sheet) *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://docs.google.com/document/d/... or Drive PDF link"
                      value={interviewDocUrl}
                      onChange={(e) => setInterviewDocUrl(e.target.value)}
                      className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* Interview Page Range Controls */}
                  <div className="p-4 rounded-xl bg-[#0A101D] border border-emerald-500/30 space-y-3">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Interview Sheet Page Restrictions
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-[#9BAAC2] block mb-1">Total Document Pages *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={interviewTotalPages}
                          onChange={(e) => setInterviewTotalPages(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#9BAAC2] block mb-1">Starting Page *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={interviewPageStart}
                          onChange={(e) => setInterviewPageStart(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#9BAAC2] block mb-1">Ending Page *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={interviewPageEnd}
                          onChange={(e) => setInterviewPageEnd(parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-[#9BAAC2] font-mono">
                      Allocated Scope: Pages <strong className="text-emerald-400">{interviewPageStart}</strong> to <strong className="text-emerald-400">{interviewPageEnd}</strong> of {interviewTotalPages}.
                    </div>
                  </div>
                </div>
              )}

              {/* Release Schedule Selector (Immediate vs Scheduled in IST) */}
              <div className="p-4 bg-[#15233A] rounded-2xl border border-white/5 space-y-3">
                <span className="text-xs font-bold text-white uppercase font-mono block">
                  Release & Publishing Automation
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                      releaseAction === 'release'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-[#0A101D] border-white/5 text-[#9BAAC2]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="release_action"
                      checked={releaseAction === 'release'}
                      onChange={() => setReleaseAction('release')}
                      className="w-4 h-4 text-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">RELEASE Immediately</div>
                      <div className="text-[10px] text-[#9BAAC2]">Instantly available to enrolled students</div>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                      releaseAction === 'hold'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                        : 'bg-[#0A101D] border-white/5 text-[#9BAAC2]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="release_action"
                      checked={releaseAction === 'hold'}
                      onChange={() => setReleaseAction('hold')}
                      className="w-4 h-4 text-amber-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">HOLD / Scheduled Release</div>
                      <div className="text-[10px] text-[#9BAAC2]">Hidden until scheduled timestamp arrives</div>
                    </div>
                  </label>
                </div>

                {releaseAction === 'hold' && (
                  <div className="p-4 bg-[#0A101D] rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Automated Release Schedule
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/40">
                        Timezone: Asia/Kolkata (IST)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-[#9BAAC2] block mb-1">
                          Release Date *
                        </label>
                        <input
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#9BAAC2] block mb-1">
                          Release Time (IST) *
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            aria-label="Select Release Hour"
                            value={scheduleHour}
                            onChange={(e) => setScheduleHour(e.target.value)}
                            className="bg-[#15233A] border border-[#1F2E47] rounded-xl px-2.5 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                          >
                            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                              <option key={h} value={h} className="bg-[#11192A]">{h}</option>
                            ))}
                          </select>
                          <span className="text-white font-bold">:</span>
                          <select
                            aria-label="Select Release Minute"
                            value={scheduleMinute}
                            onChange={(e) => setScheduleMinute(e.target.value)}
                            className="bg-[#15233A] border border-[#1F2E47] rounded-xl px-2.5 py-2 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
                          >
                            {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                              <option key={m} value={m} className="bg-[#11192A]">{m}</option>
                            ))}
                          </select>

                          <div className="flex items-center rounded-xl bg-[#15233A] border border-[#1F2E47] p-0.5">
                            <button
                              type="button"
                              onClick={() => setSchedulePeriod('AM')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                schedulePeriod === 'AM' ? 'bg-[#00A3FF] text-white shadow-sm' : 'text-[#9BAAC2] hover:text-white'
                              }`}
                            >
                              AM
                            </button>
                            <button
                              type="button"
                              onClick={() => setSchedulePeriod('PM')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                schedulePeriod === 'PM' ? 'bg-[#00A3FF] text-white shadow-sm' : 'text-[#9BAAC2] hover:text-white'
                              }`}
                            >
                              PM
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#9BAAC2] font-mono bg-white/5 p-2 rounded-lg">
                      Scheduled Availability: <strong className="text-white">{scheduleDate} at {scheduleHour}:{scheduleMinute} {schedulePeriod} (IST)</strong>.
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-[#00A3FF]/25 flex items-center gap-2 transition hover:scale-102 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving to Database...' : `Save & Publish ${selectedType.toUpperCase()}`}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {/* Previously Added Resources for Current Type */}
      <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2E47]">
          <h3 className="text-base font-bold text-[#F0F5FF] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#397BFF]" />
            Existing {selectedType.toUpperCase()} Resources in Selected Module
          </h3>
          <span className="text-xs text-[#9BAAC2]">
            Synchronized with Supabase
          </span>
        </div>

        {selectedType === 'flashcards' ? (
          /* Flashcards List */
          <div className="space-y-3">
            {existingFlashcards.length === 0 ? (
              <div className="p-8 text-center text-[#9BAAC2] text-xs">
                No flashcards created yet for this track. Use the form above to add Q&A cards.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {existingFlashcards.map(fc => (
                  <div key={fc.id} className="p-4 rounded-2xl bg-[#15233A] border border-white/5 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300">
                        {fc.difficulty || 'Medium'}
                      </span>
                      <button
                        onClick={async () => {
                          await dataService.deleteFlashcard(fc.id);
                          setExistingFlashcards(dataService.getFlashcards());
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1 opacity-70 hover:opacity-100 transition"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h5 className="text-xs font-bold text-white">Q: {fc.question}</h5>
                    <p className="text-[11px] text-slate-300">A: {fc.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Standard Resource List */
          <div className="space-y-3">
            {currentFilteredResources.length === 0 ? (
              <div className="p-8 text-center text-[#9BAAC2] text-xs">
                No {selectedType.toUpperCase()} resources added yet for this module.
              </div>
            ) : (
              currentFilteredResources.map((topic) => {
                const isLive = topic.release_status === 'released' || topic.is_published;

                return (
                  <div
                    key={topic.id}
                    className="p-4 rounded-2xl bg-[#15233A] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                            isLive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isLive ? 'Released' : 'Scheduled / Held'}
                        </span>
                        {topic.doc_page_range && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {topic.doc_page_range}
                          </span>
                        )}
                        {topic.total_slides && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Slides {topic.slide_start || 1}–{topic.slide_end || topic.total_slides} of {topic.total_slides}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white">{topic.title}</h4>
                      <p className="text-[11px] text-[#9BAAC2] line-clamp-1">{topic.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          const newStatus = isLive ? 'held' : 'released';
                          await dataService.updateTopic(topic.id, {
                            release_status: newStatus,
                            is_published: newStatus === 'released',
                            released_at: newStatus === 'released' ? new Date().toISOString() : undefined
                          });
                          loadData();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          isLive
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        {isLive ? 'Hold' : 'Release Now'}
                      </button>

                      <button
                        onClick={async () => {
                          if (window.confirm(`Delete resource "${topic.title}"?`)) {
                            await dataService.deleteTopic(topic.id);
                            loadData();
                          }
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-400 border border-white/5 hover:border-rose-500/30 transition"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Quick Add Module Modal */}
      {showQuickAddModule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 flex items-center justify-center">
          <div className="bg-[#101A2D] rounded-3xl border border-[#1F2E47] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F2E47] pb-3">
              <h3 className="text-sm font-bold text-white">Create Curriculum Module</h3>
              <button onClick={() => setShowQuickAddModule(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleQuickAddModule} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white block mb-1">Module Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asynchronous Microservices & Event Streams"
                  value={quickModuleTitle}
                  onChange={(e) => setQuickModuleTitle(e.target.value)}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#397BFF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-white block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Module objectives and competencies..."
                  value={quickModuleDesc}
                  onChange={(e) => setQuickModuleDesc(e.target.value)}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl p-3 text-xs text-white outline-none focus:border-[#397BFF]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModule(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9BAAC2] bg-[#15233A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A8FF] text-white text-xs font-bold hover:bg-[#176BFF]"
                >
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcePublishingPage;
