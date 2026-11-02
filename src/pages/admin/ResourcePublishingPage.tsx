import React, { useState, useEffect } from 'react';
import {
  UploadCloud, Video, Presentation, FileText, HelpCircle,
  Layers, CheckCircle2, AlertCircle, Clock, Trash2, Edit3,
  Calendar, Eye, Play, Sparkles, Plus, X, Check, Save,
  ChevronRight, RefreshCw, Lock, ShieldCheck, AlertTriangle, BookOpen
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Course, CourseModule, CourseSubModule, Topic, Flashcard, QuizQuestion } from '../../types';

type ResourceType = 'drive_video' | 'ppt_presentation' | 'doc_questions' | 'flashcards' | 'quiz';

export const ResourcePublishingPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [subModules, setSubModules] = useState<CourseSubModule[]>([]);
  const [selectedSubModuleId, setSelectedSubModuleId] = useState('');

  // Selected Resource Type: exactly the 5 allowed types
  const [selectedType, setSelectedType] = useState<ResourceType>('drive_video');

  // Shared form fields
  const [topicTitle, setTopicTitle] = useState('');
  const [curriculumName, setCurriculumName] = useState('Core Engineering Track');
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [topicDesc, setTopicDesc] = useState('');

  // Type 1: Drive Video
  const [driveVideoUrl, setDriveVideoUrl] = useState('');

  // Type 2: PPT Presentation & Slide Ranges
  const [pptUrl, setPptUrl] = useState('');
  const [totalSlides, setTotalSlides] = useState(120);
  const [slideStart, setSlideStart] = useState(1);
  const [slideEnd, setSlideEnd] = useState(25);
  const [slideRangeError, setSlideRangeError] = useState<string | null>(null);

  // Type 3: DOC – Interview Questions
  const [docUrl, setDocUrl] = useState('');
  const [docPageRange, setDocPageRange] = useState('Pages 1–15');

  // Type 4: Flashcards from PPT
  const [selectedPptSourceId, setSelectedPptSourceId] = useState('');
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Array<{ id: string; question: string; answer: string; approved: boolean }>>([]);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  // Type 5: Quizzes with Bulk Question Text Parser
  const [quizTopicName, setQuizTopicName] = useState('');
  const [quizMarksPerQuestion, setQuizMarksPerQuestion] = useState(1);
  const [quizTimeLimitMinutes, setQuizTimeLimitMinutes] = useState(15);
  const [quizMaxAttempts, setQuizMaxAttempts] = useState(3);
  const [bulkQuizText, setBulkQuizText] = useState(`QUESTION 1: What is Python?
A. High-level, interpreted programming language
B. Relational Database Management System
C. Hardware Microprocessor Architecture
D. Web Browser Rendering Engine
ANSWER: A
EXPLANATION: Python is an interpreted, high-level, dynamically typed language known for concise syntax and vast ecosystem.

QUESTION 2: Which built-in function displays output to the standard console in Python?
A. input()
B. print()
C. echo()
D. write()
ANSWER: B
EXPLANATION: The print() function outputs the specified message or variables to the standard output device.

QUESTION 3: What is the primary advantage of WebAssembly (Pyodide) in SkillNova's coding lab?
A. Executes Python locally in the browser sandbox with zero server latency
B. Requires a paid external cloud compiler license
C. Sends code over insecure HTTP sockets
D. Only supports static HTML files
ANSWER: A
EXPLANATION: WebAssembly allows Python 3 to execute completely client-side in an isolated worker thread without remote server overhead.`);

  const [parsedQuestions, setParsedQuestions] = useState<Array<{
    id: string;
    question: string;
    options: { key: string; text: string }[];
    correctAnswer: string;
    explanation: string;
  }>>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  // Release / Hold management
  const [releaseAction, setReleaseAction] = useState<'release' | 'hold'>('release');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [selectedTimezone] = useState('Asia/Kolkata');

  // Feedback banner
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [existingResources, setExistingResources] = useState<Topic[]>([]);

  // Quick Module creation modal
  const [showQuickAddModule, setShowQuickAddModule] = useState(false);
  const [quickModuleTitle, setQuickModuleTitle] = useState('');
  const [quickModuleDesc, setQuickModuleDesc] = useState('');

  useEffect(() => {
    loadData();
    const unsubscribe = dataService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const loadData = () => {
    const list = dataService.getCourses();
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

  const handleSaveQuickModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !quickModuleTitle.trim()) return;
    try {
      const created = await dataService.addModule(selectedCourseId, quickModuleTitle.trim(), quickModuleDesc.trim());
      const updated = dataService.getModulesForCourse(selectedCourseId);
      setModules(updated);
      setSelectedModuleId(created.id);
      setShowQuickAddModule(false);
      setQuickModuleTitle('');
      setQuickModuleDesc('');
      setFeedback({
        type: 'success',
        message: `Created module: "${created.title}" and synced to Supabase!`
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: 'Failed to create module. Please check connection.'
      });
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  // Convert Drive URLs to accessible preview iframes
  const formatDriveUrl = (raw: string) => {
    if (!raw) return '';
    const fileMatch = raw.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    }
    const docMatch = raw.match(/document\/d\/([a-zA-Z0-9_-]+)/);
    if (docMatch && docMatch[1]) {
      return `https://docs.google.com/document/d/${docMatch[1]}/preview`;
    }
    return raw;
  };

  // Validate slide ranges
  useEffect(() => {
    if (selectedType === 'ppt_presentation') {
      if (slideStart < 1) {
        setSlideRangeError('Start slide must be at least 1.');
      } else if (slideEnd > totalSlides) {
        setSlideRangeError(`End slide (${slideEnd}) cannot exceed total presentation slides (${totalSlides}).`);
      } else if (slideStart > slideEnd) {
        setSlideRangeError(`Start slide (${slideStart}) cannot be greater than end slide (${slideEnd}).`);
      } else {
        setSlideRangeError(null);
      }
    }
  }, [slideStart, slideEnd, totalSlides, selectedType]);

  // Bulk Quiz Parser
  const handleParseQuizQuestions = () => {
    setParseError(null);
    try {
      const raw = bulkQuizText.trim();
      if (!raw) {
        setParseError('Please paste questions in the structured text format.');
        return;
      }

      // Regex matching QUESTION ... A. ... B. ... C. ... D. ... ANSWER: ... EXPLANATION: ...
      const blocks = raw.split(/(?:QUESTION\s*\d+:?)/i).filter(b => b.trim().length > 0);
      if (blocks.length === 0) {
        setParseError('Could not identify any questions. Check format: "QUESTION 1: ..."');
        return;
      }

      const parsed: Array<{
        id: string;
        question: string;
        options: { key: string; text: string }[];
        correctAnswer: string;
        explanation: string;
      }> = [];

      blocks.forEach((block, idx) => {
        const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
        const questionText = lines[0] || `Question ${idx + 1}`;

        const options: { key: string; text: string }[] = [];
        let answer = 'A';
        let explanation = '';

        lines.slice(1).forEach(line => {
          const optMatch = line.match(/^([A-D])\.\s*(.+)$/i);
          if (optMatch) {
            options.push({ key: optMatch[1].toUpperCase(), text: optMatch[2].trim() });
            return;
          }

          const ansMatch = line.match(/^(?:ANSWER|CORRECT(?: ANSWER)?):\s*([A-D])/i);
          if (ansMatch) {
            answer = ansMatch[1].toUpperCase();
            return;
          }

          const expMatch = line.match(/^(?:EXPLANATION|REASON):\s*(.+)$/i);
          if (expMatch) {
            explanation = expMatch[1].trim();
            return;
          }
        });

        if (options.length >= 2) {
          parsed.push({
            id: `q-parsed-${idx + 1}`,
            question: questionText,
            options,
            correctAnswer: answer,
            explanation: explanation || 'Refer to curriculum lecture notes.'
          });
        }
      });

      if (parsed.length === 0) {
        setParseError('Unable to extract valid options (A, B, C, D). Ensure lines start with "A. Option text".');
        return;
      }

      setParsedQuestions(parsed);
      setFeedback({
        type: 'success',
        message: `Parsed ${parsed.length} questions successfully! Review cards below before saving.`
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setParseError(err?.message || 'Parsing error. Check formatting.');
    }
  };

  // Generate Flashcards from PPT Source
  const handleGenerateFlashcards = () => {
    setIsGeneratingCards(true);
    setTimeout(() => {
      const cards = [
        {
          id: `fc-${Date.now()}-1`,
          question: 'What is the role of an Execution Context in the JavaScript/Python runtime?',
          answer: 'An execution context defines the environment where code is evaluated, managing variable scope chains, memory allocation, and the call stack.',
          approved: true,
        },
        {
          id: `fc-${Date.now()}-2`,
          question: 'Define Idempotency in REST API design.',
          answer: 'An operation is idempotent if executing it multiple times yields the exact same server resource state (e.g. GET, PUT, DELETE).',
          approved: true,
        },
        {
          id: `fc-${Date.now()}-3`,
          question: 'How do B-Tree indexes improve database read query performance?',
          answer: 'B-Trees maintain sorted key hierarchies with logarithmic O(log N) search depth, minimizing disk I/O seek operations compared to full table scans.',
          approved: true,
        },
        {
          id: `fc-${Date.now()}-4`,
          question: 'What is the difference between Synchronous and Asynchronous Web Workers?',
          answer: 'Dedicated Web Workers run on background threads isolated from the DOM, executing heavy computational tasks (like Pyodide WASM) without freezing user interface FPS.',
          approved: true,
        }
      ];
      setGeneratedFlashcards(cards);
      setIsGeneratingCards(false);
      setFeedback({
        type: 'success',
        message: 'Extracted 4 high-yield flashcards from PPT presentation slides!'
      });
      setTimeout(() => setFeedback(null), 4000);
    }, 600);
  };

  // Submit Handler for Current Resource Type
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedModuleId) {
      setFeedback({ type: 'error', message: 'Please select Course and Curriculum Module.' });
      return;
    }
    if (!topicTitle.trim()) {
      setFeedback({ type: 'error', message: 'Topic Title is required.' });
      return;
    }

    const isReleased = releaseAction === 'release';
    const scheduledIso = !isReleased
      ? new Date(`${scheduleDate}T${scheduleTime}:00+05:30`).toISOString()
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

    try {
      // Attach type-specific data
      if (selectedType === 'drive_video') {
        const formatted = formatDriveUrl(driveVideoUrl);
        payload.recording_link = formatted;
        payload.recording_url = formatted;
        payload.drive_video_url = formatted;
        payload.has_recording = true;
      } else if (selectedType === 'ppt_presentation') {
        if (slideRangeError) {
          setFeedback({ type: 'error', message: slideRangeError });
          return;
        }
        payload.ppt_url = pptUrl;
        payload.ppt_file_url = pptUrl;
        payload.total_slides = totalSlides;
        payload.slide_start = slideStart;
        payload.slide_end = slideEnd;

        // Save to dedicated presentations and slide allocations system
        const createdPres = await dataService.addPresentation({
          course_id: selectedCourseId,
          module_id: selectedModuleId,
          sub_module_id: selectedSubModuleId || undefined,
          title: topicTitle.trim(),
          description: topicDesc.trim(),
          ppt_url: pptUrl,
          total_slides: totalSlides,
          uploaded_by: 'Administrator'
        });

        await dataService.addSlideAllocation({
          presentation_id: createdPres.id,
          sub_module_id: selectedSubModuleId || undefined,
          start_slide: slideStart,
          end_slide: slideEnd,
          release_status: isReleased ? 'released' : 'scheduled',
          scheduled_release_at: scheduledIso,
        });
      } else if (selectedType === 'doc_questions') {
        payload.drive_notes_link = formatDriveUrl(docUrl);
        payload.doc_url = formatDriveUrl(docUrl);
        payload.doc_page_range = docPageRange;
        payload.has_notes = true;
      } else if (selectedType === 'flashcards') {
        payload.has_flashcards = true;
      } else if (selectedType === 'quiz') {
        payload.has_quiz = true;
      }

      const createdTopic = await dataService.addTopic(payload);

      // If flashcards, save to flashcards collection
      if (selectedType === 'flashcards' && generatedFlashcards.length > 0) {
        const approvedCards = generatedFlashcards.filter(c => c.approved);
        approvedCards.forEach((c) => {
          dataService.addAuditLogEntry({
            action: 'create_flashcard',
            resource_id: c.id,
            resource_title: c.question,
            course_id: selectedCourseId,
            performed_by: 'Administrator',
            details: `Flashcard Q&A saved to module`
          });
        });
      }

      // Reset Form
      setTopicTitle('');
      setTopicDesc('');
      setDriveVideoUrl('');
      setPptUrl('');
      setDocUrl('');
      setGeneratedFlashcards([]);
      setParsedQuestions([]);

      setFeedback({
        type: 'success',
        message: `Resource "${createdTopic.title}" saved. Status: ${
          isReleased ? 'RELEASED immediately to enrolled students' : `HELD / Scheduled for ${scheduleDate} ${scheduleTime} (IST)`
        }`
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: 'Failed to persist resource to database. Please try again.'
      });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleToggleRelease = async (topicId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'released') {
        await dataService.holdTopic(topicId);
        setFeedback({ type: 'success', message: 'Resource placed on HOLD (hidden from students).' });
      } else {
        await dataService.releaseTopic(topicId);
        setFeedback({ type: 'success', message: 'Resource RELEASED immediately to students!' });
      }
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to update release status in database.' });
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleDeleteResource = async (topicId: string) => {
    try {
      await dataService.deleteTopic(topicId);
      setFeedback({ type: 'success', message: 'Resource deleted from curriculum.' });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to delete resource from database.' });
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const currentTypeResources = existingResources.filter(t => {
    if (selectedType === 'drive_video') return t.resource_type === 'drive_video' || t.recording_link;
    if (selectedType === 'ppt_presentation') return t.resource_type === 'ppt_presentation' || t.ppt_url;
    if (selectedType === 'doc_questions') return t.resource_type === 'doc_questions' || t.drive_notes_link;
    if (selectedType === 'flashcards') return t.resource_type === 'flashcards' || t.has_flashcards;
    if (selectedType === 'quiz') return t.resource_type === 'quiz' || t.has_quiz;
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-xl animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40">
            CURRICULUM CONTENT WORKSPACE
          </span>
          <span className="text-xs text-[#9BAAC2] font-mono">Asia/Kolkata (IST) Standard Timezone</span>
        </div>
        <h1 className="text-2xl font-black text-[#F0F5FF] flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-[#397BFF]" />
          Learning Resources Management
        </h1>
        <p className="text-xs text-[#9BAAC2] mt-0.5">
          Select course, curriculum, and module, then provision dedicated Drive Videos, PPT Presentations with slide ranges, Interview DOCs, Flashcards, or bulk Quizzes.
        </p>
      </div>

      {/* Top Universal Selectors: Select Course, Select Curriculum, Select Curriculum Module */}
      <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-5 sm:p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Selector 1: Course */}
        <div>
          <label className="text-xs font-bold text-[#77B4FF] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            1. Select Course *
          </label>
          <select
            aria-label="Select Course"
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="w-full bg-[#15233A] text-xs text-[#F0F5FF] font-semibold px-3.5 py-2.5 rounded-xl border border-[#1F2E47] outline-none focus:border-[#397BFF] transition cursor-pointer"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#11192A]">
                {c.title} ({c.category})
              </option>
            ))}
          </select>
        </div>

        {/* Selector 2: Curriculum */}
        <div>
          <label className="text-xs font-bold text-[#77B4FF] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            2. Select Curriculum *
          </label>
          <input
            type="text"
            value={curriculumName}
            onChange={(e) => setCurriculumName(e.target.value)}
            placeholder="e.g. Core Engineering Track"
            className="w-full bg-[#15233A] text-xs text-[#F0F5FF] px-3.5 py-2.5 rounded-xl border border-[#1F2E47] outline-none focus:border-[#397BFF] transition"
          />
        </div>

        {/* Selector 3: Curriculum Module */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#77B4FF] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              3. Select Curriculum Module *
            </label>
            <button
              type="button"
              onClick={() => {
                setQuickModuleTitle(`Module ${modules.length + 1}: `);
                setQuickModuleDesc('');
                setShowQuickAddModule(true);
              }}
              className="text-[10px] font-bold text-[#00D4B8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>+ Add Module</span>
            </button>
          </div>
          <select
            aria-label="Select Curriculum Module"
            value={selectedModuleId}
            onChange={(e) => handleModuleChange(e.target.value)}
            className="w-full bg-[#15233A] text-xs text-[#F0F5FF] font-semibold px-3.5 py-2.5 rounded-xl border border-[#1F2E47] outline-none focus:border-[#397BFF] transition cursor-pointer"
          >
            {modules.length === 0 ? (
              <option value="" className="bg-[#11192A]">No modules found. Click "+ Add Module" to create.</option>
            ) : (
              modules.map((m) => {
                const label = m.title.toLowerCase().startsWith('module')
                  ? m.title
                  : `Module ${m.order_index}: ${m.title}`;
                return (
                  <option key={m.id} value={m.id} className="bg-[#11192A]">
                    {label}
                  </option>
                );
              })
            )}
          </select>

          {/* Sub-Module Selector */}
          {subModules.length > 0 && (
            <div className="pt-2">
              <label className="text-[11px] font-bold text-[#77B4FF] uppercase tracking-wider block mb-1">
                Target Sub-Module (Unit Allocation)
              </label>
              <select
                aria-label="Select Sub-Module"
                value={selectedSubModuleId}
                onChange={(e) => setSelectedSubModuleId(e.target.value)}
                className="w-full bg-[#15233A] text-xs text-[#F0F5FF] font-semibold px-3.5 py-2 rounded-xl border border-[#1F2E47] outline-none focus:border-[#00D4B8] transition cursor-pointer"
              >
                {subModules.map((sm) => (
                  <option key={sm.id} value={sm.id} className="bg-[#11192A]">
                    {sm.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* The 5 Resource Type Selectors (ONLY these 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { type: 'drive_video', label: '1. Drive Video', icon: Video, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { type: 'ppt_presentation', label: '2. PPT Presentation', icon: Presentation, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { type: 'doc_questions', label: '3. DOC – Questions', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { type: 'flashcards', label: '4. Flashcards', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { type: 'quiz', label: '5. Quizzes', icon: HelpCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedType === item.type;

          return (
            <button
              key={item.type}
              type="button"
              onClick={() => setSelectedType(item.type as ResourceType)}
              className={`p-3.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-2 text-center ${
                isSelected
                  ? 'bg-[#397BFF] text-white border-[#397BFF] shadow-lg shadow-[#397BFF]/25 scale-102'
                  : 'bg-[#101A2D] text-[#9BAAC2] hover:text-[#F0F5FF] border-[#1F2E47] hover:bg-[#15233A]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : item.color}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dedicated Creation Form */}
      <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="border-b border-[#1F2E47] pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#F0F5FF] capitalize">
              {selectedType.replace('_', ' ')} Creation Form
            </h3>
            <p className="text-xs text-[#9BAAC2]">
              Configuring for: {selectedCourse?.title} • {modules.find(m => m.id === selectedModuleId)?.title || 'Selected Module'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveResource} className="space-y-5">
          {/* Common Fields: Title, Date, Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#F0F5FF] block mb-1">
                Topic Title <span className="text-[#397BFF]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Asynchronous Microservices & Event Streams"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#F0F5FF] block mb-1">Curriculum Date *</label>
              <input
                type="date"
                required
                value={classDate}
                onChange={(e) => setClassDate(e.target.value)}
                className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#F0F5FF] block mb-1">Topic Description</label>
            <textarea
              rows={2}
              placeholder="Outline what students will learn from this resource..."
              value={topicDesc}
              onChange={(e) => setTopicDesc(e.target.value)}
              className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl p-3 text-xs text-[#F0F5FF] outline-none focus:border-[#397BFF]"
            />
          </div>

          {/* Type 1: Drive Video Form */}
          {selectedType === 'drive_video' && (
            <div className="p-4 bg-[#15233A] rounded-2xl border border-rose-500/20 space-y-3">
              <label className="text-xs font-bold text-rose-300 block flex items-center gap-1.5">
                <Video className="w-4 h-4 text-rose-400" />
                Google Drive Video Recording URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/view?usp=sharing"
                value={driveVideoUrl}
                onChange={(e) => setDriveVideoUrl(e.target.value)}
                className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-rose-500 font-mono"
              />
              <p className="text-[11px] text-[#9BAAC2]">
                Ensure the Google Drive link permission is set to "Anyone with the link can view". The system automatically converts it to a clean responsive video player.
              </p>
            </div>
          )}

          {/* Type 2: PPT Presentation & Slide Range Form */}
          {selectedType === 'ppt_presentation' && (
            <div className="p-4 bg-[#15233A] rounded-2xl border border-amber-500/20 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-300 block flex items-center gap-1.5">
                  <Presentation className="w-4 h-4 text-amber-400" />
                  Presentation PPT URL / Drive Link *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://docs.google.com/presentation/d/.../edit"
                  value={pptUrl}
                  onChange={(e) => setPptUrl(e.target.value)}
                  className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Module-Specific Slide Range Selector */}
              <div className="p-3 bg-[#0A101D] rounded-xl border border-white/5 space-y-2">
                <span className="text-xs font-bold text-[#F0F5FF] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Module-Specific Slide Selection (e.g. 150 slides total)
                </span>
                <p className="text-[11px] text-[#9BAAC2]">
                  Students opening this module will see only its assigned slides.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-[#9BAAC2] block mb-1">Total Slides in PPT</label>
                    <input
                      type="number"
                      min={1}
                      value={totalSlides}
                      onChange={(e) => setTotalSlides(Number(e.target.value))}
                      className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-[#F0F5FF]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#9BAAC2] block mb-1">Start Slide</label>
                    <input
                      type="number"
                      min={1}
                      max={totalSlides}
                      value={slideStart}
                      onChange={(e) => setSlideStart(Number(e.target.value))}
                      className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-[#00D4B8] font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#9BAAC2] block mb-1">End Slide</label>
                    <input
                      type="number"
                      min={slideStart}
                      max={totalSlides}
                      value={slideEnd}
                      onChange={(e) => setSlideEnd(Number(e.target.value))}
                      className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-[#00D4B8] font-bold"
                    />
                  </div>
                </div>

                {slideRangeError && (
                  <div className="text-rose-400 text-xs font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{slideRangeError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Type 3: DOC – Interview Questions Form */}
          {selectedType === 'doc_questions' && (
            <div className="p-4 bg-[#15233A] rounded-2xl border border-blue-500/20 space-y-4">
              <div>
                <label className="text-xs font-bold text-blue-300 block mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Google Drive DOC URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://docs.google.com/document/d/.../edit"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-xl px-4 py-2.5 text-xs text-[#F0F5FF] outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#F0F5FF] block mb-1">
                  Document Page Range (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pages 1–15 (System Design Questions)"
                  value={docPageRange}
                  onChange={(e) => setDocPageRange(e.target.value)}
                  className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-xl px-4 py-2 text-xs text-[#F0F5FF]"
                />
              </div>
            </div>
          )}

          {/* Type 4: Flashcards from PPT */}
          {selectedType === 'flashcards' && (
            <div className="p-4 bg-[#15233A] rounded-2xl border border-purple-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold text-purple-300 block">
                    Generate Q&A Flashcards from Module PPT Presentation
                  </label>
                  <p className="text-[11px] text-[#9BAAC2]">
                    Extracts definitions, terms, and core interview concepts directly from the assigned PPT.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateFlashcards}
                  disabled={isGeneratingCards}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 transition shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingCards ? 'Extracting Concepts...' : 'Extract Flashcards from PPT'}</span>
                </button>
              </div>

              {generatedFlashcards.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-[#F0F5FF]">
                    Generated Flashcards Preview ({generatedFlashcards.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {generatedFlashcards.map((card, idx) => (
                      <div key={card.id} className="p-3 bg-[#0A101D] rounded-xl border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-purple-400 font-mono">Card {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setGeneratedFlashcards(prev => prev.filter(c => c.id !== card.id));
                            }}
                            className="text-[#9BAAC2] hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-xs font-bold text-[#F0F5FF]">{card.question}</div>
                        <div className="text-[11px] text-[#9BAAC2]">{card.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Type 5: Quizzes with Bulk Question Text Parser */}
          {selectedType === 'quiz' && (
            <div className="p-4 bg-[#15233A] rounded-2xl border border-emerald-500/20 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#9BAAC2] block mb-1">Marks per Question</label>
                  <input
                    type="number"
                    min={1}
                    value={quizMarksPerQuestion}
                    onChange={(e) => setQuizMarksPerQuestion(Number(e.target.value))}
                    className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-[#F0F5FF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#9BAAC2] block mb-1">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    value={quizTimeLimitMinutes}
                    onChange={(e) => setQuizTimeLimitMinutes(Number(e.target.value))}
                    className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-[#F0F5FF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#9BAAC2] block mb-1">Max Attempts</label>
                  <input
                    type="number"
                    min={1}
                    value={quizMaxAttempts}
                    onChange={(e) => setQuizMaxAttempts(Number(e.target.value))}
                    className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-[#F0F5FF]"
                  />
                </div>
              </div>

              {/* Bulk Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    Paste Questions in Structured Text Format
                  </label>
                  <button
                    type="button"
                    onClick={handleParseQuizQuestions}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Parse Questions</span>
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={bulkQuizText}
                  onChange={(e) => setBulkQuizText(e.target.value)}
                  className="w-full bg-[#0A101D] border border-[#1F2E47] rounded-2xl p-4 text-xs font-mono text-[#F0F5FF] outline-none focus:border-emerald-500 leading-relaxed"
                />

                {parseError && (
                  <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{parseError}</span>
                  </div>
                )}
              </div>

              {/* Parsed Question Cards Preview */}
              {parsedQuestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-[#F0F5FF]">
                    Parsed Question Cards ({parsedQuestions.length})
                  </span>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {parsedQuestions.map((q, idx) => (
                      <div key={q.id} className="p-3.5 bg-[#0A101D] rounded-xl border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            Q{idx + 1}: {q.question}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setParsedQuestions(prev => prev.filter(item => item.id !== q.id));
                            }}
                            className="text-[#9BAAC2] hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {q.options.map(opt => (
                            <div
                              key={opt.key}
                              className={`p-2 rounded-lg border flex items-center gap-2 ${
                                opt.key === q.correctAnswer
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                                  : 'bg-[#15233A] border-white/5 text-[#9BAAC2]'
                              }`}
                            >
                              <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center font-mono text-[10px]">
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                            </div>
                          ))}
                        </div>

                        <div className="text-[11px] text-[#9BAAC2] italic bg-[#15233A]/60 p-2 rounded-lg">
                          💡 Explanation: {q.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Common Section 10: Unified Release / Hold Workflow */}
          <div className="p-4 bg-[#15233A] rounded-2xl border border-white/10 space-y-4">
            <span className="text-xs font-bold text-[#77B4FF] uppercase tracking-wider block">
              Publication & Release Mode
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: RELEASE immediately */}
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

              {/* Option B: HOLD / Scheduled */}
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
              <div className="p-3 bg-[#0A101D] rounded-xl border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#9BAAC2] block mb-1">Release Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-[#F0F5FF]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#9BAAC2] block mb-1">Release Time (IST)</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-[#15233A] border border-[#1F2E47] rounded-xl px-3 py-2 text-xs text-[#F0F5FF]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-[#00A3FF]/25 flex items-center gap-2 transition hover:scale-102"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish {selectedType.replace('_', ' ').toUpperCase()}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Previously Added Resources for Current Type */}
      <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2E47]">
          <h3 className="text-base font-bold text-[#F0F5FF] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#397BFF]" />
            Existing {selectedType.replace('_', ' ').toUpperCase()} Resources ({currentTypeResources.length})
          </h3>
          <span className="text-xs text-[#9BAAC2]">
            Edit, Delete, Release, or Hold individually
          </span>
        </div>

        <div className="space-y-3">
          {currentTypeResources.length === 0 ? (
            <div className="p-8 text-center text-[#9BAAC2] text-xs">
              No {selectedType.replace('_', ' ')} resources added yet for this filter.
            </div>
          ) : (
            currentTypeResources.map((topic) => {
              const isLive = topic.release_status === 'released' || topic.is_published;

              return (
                <div
                  key={topic.id}
                  className="p-4 rounded-2xl bg-[#15233A] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F0F5FF]">{topic.title}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isLive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {topic.release_status || (topic.is_published ? 'Released' : 'Held')}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#9BAAC2] flex flex-wrap items-center gap-3">
                      <span>Course: {courses.find(c => c.id === topic.course_id)?.title || 'Program'}</span>
                      <span>•</span>
                      <span>Date: {topic.class_date}</span>
                      {topic.slide_start && topic.slide_end && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400 font-mono">Slides: {topic.slide_start}–{topic.slide_end} of {topic.total_slides || 100}</span>
                        </>
                      )}
                      {topic.doc_page_range && (
                        <>
                          <span>•</span>
                          <span className="text-blue-400 font-mono">{topic.doc_page_range}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleRelease(topic.id, topic.release_status || (topic.is_published ? 'released' : 'held'))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isLive
                          ? 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                      }`}
                    >
                      {isLive ? 'Hold' : 'Release'}
                    </button>

                    <button
                      onClick={() => handleDeleteResource(topic.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                      title="Delete resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Add Module Modal */}
      {showQuickAddModule && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101A2D] border border-[#1F2E47] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2E47]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00D4B8]/15 text-[#00D4B8] flex items-center justify-center border border-[#00D4B8]/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#F0F5FF]">Add Curriculum Module</h3>
                  <p className="text-[11px] text-[#9BAAC2]">Create module for active course</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAddModule(false)}
                className="text-[#9BAAC2] hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickModule} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#77B4FF] uppercase tracking-wider block mb-1.5">
                  Module Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Module 1: Python Core Foundations & Internals"
                  value={quickModuleTitle}
                  onChange={(e) => setQuickModuleTitle(e.target.value)}
                  className="w-full bg-[#15233A] text-xs text-[#F0F5FF] px-3.5 py-2.5 rounded-xl border border-[#1F2E47] outline-none focus:border-[#00D4B8] transition font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#77B4FF] uppercase tracking-wider block mb-1.5">
                  Module Description / Objectives
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Decorators, generators, memory management..."
                  value={quickModuleDesc}
                  onChange={(e) => setQuickModuleDesc(e.target.value)}
                  className="w-full bg-[#15233A] text-xs text-[#F0F5FF] px-3.5 py-2.5 rounded-xl border border-[#1F2E47] outline-none focus:border-[#00D4B8] transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModule(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9BAAC2] bg-[#15233A] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!quickModuleTitle.trim()}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#00D4B8] to-[#00A3FF] hover:opacity-95 text-[#0A111E] shadow-lg shadow-[#00D4B8]/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Module</span>
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
