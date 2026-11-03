import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  HelpCircle, 
  Calendar, 
  FileText, 
  Check, 
  Layers,
  Search,
  ExternalLink,
  ChevronDown,
  X
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import type { Quiz, QuizQuestionItem, Course } from '../../types';

const SAMPLE_BULK_INPUT = `Q1. What is Python?
A. Programming Language
B. Operating System
C. Database
D. Browser
Correct Answer: A
Explanation: Python is a high-level programming language.

Q2. Which keyword is used to define a function in Python?
A. function
B. def
C. define
D. fun
Correct Answer: B
Explanation: The def keyword is used to define a function.

Q3. Which of the following data types is immutable in Python?
A. list
B. dict
C. tuple
D. set
Correct Answer: C
Explanation: Tuples are immutable sequence types in Python.`;

export const AdminQuizManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => dataService.getQuizzesList());
  const [courses, setCourses] = useState<Course[]>(() => dataService.getCoursesForCurrentUser());

  useEffect(() => {
    void dataService.syncQuizzesFromSupabase();
    void dataService.syncCoursesFromSupabase();
    const unsub = dataService.subscribe(() => {
      setQuizzes(dataService.getQuizzesList());
      setCourses(dataService.getCoursesForCurrentUser());
    });
    return unsub;
  }, []);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  // Form State
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || 'course-fs-101');
  const [totalMarks, setTotalMarks] = useState(25);
  const [durationMinutes, setDurationMinutes] = useState(30);

  // Default to today and 7 days later in local IST string
  const formatForDateTimeInput = (date: Date) => {
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [startTimeInput, setStartTimeInput] = useState(() => formatForDateTimeInput(new Date()));
  const [endTimeInput, setEndTimeInput] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return formatForDateTimeInput(d);
  });

  // Bulk parser state
  const [bulkText, setBulkText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState<QuizQuestionItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  // Leaderboard Modal
  const [selectedLeaderboardQuiz, setSelectedLeaderboardQuiz] = useState<Quiz | null>(null);

  // Notification / Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleParseBulk = () => {
    setParseError(null);
    if (!bulkText.trim()) {
      setParseError('Please paste questions in the structured text format.');
      return;
    }
    const questions = dataService.parseBulkQuizText(bulkText);
    if (questions.length === 0) {
      setParseError('Could not parse any questions. Please verify format (e.g. Q1. ... A. ... Correct Answer: A).');
      return;
    }
    setParsedQuestions(questions);
    setTotalMarks(questions.length * 5);
    showToast(`Successfully parsed ${questions.length} question(s)!`);
  };

  const handleOpenCreateModal = (quizToEdit?: Quiz) => {
    if (quizToEdit) {
      setEditingQuizId(quizToEdit.id);
      setQuizTitle(quizToEdit.title);
      setQuizDescription(quizToEdit.description);
      setSelectedCourseId(quizToEdit.course_id || courses[0]?.id || 'course-fs-101');
      setTotalMarks(quizToEdit.total_marks);
      setDurationMinutes(quizToEdit.duration_minutes);
      setStartTimeInput(formatForDateTimeInput(new Date(quizToEdit.start_time)));
      setEndTimeInput(formatForDateTimeInput(new Date(quizToEdit.end_time)));
      setParsedQuestions(quizToEdit.questions || []);
      setBulkText('');
    } else {
      setEditingQuizId(null);
      setQuizTitle('');
      setQuizDescription('Comprehensive scheduled assessment on core topics.');
      setSelectedCourseId(courses[0]?.id || 'course-fs-101');
      setTotalMarks(25);
      setDurationMinutes(30);
      setStartTimeInput(formatForDateTimeInput(new Date()));
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setEndTimeInput(formatForDateTimeInput(d));
      setParsedQuestions([]);
      setBulkText(SAMPLE_BULK_INPUT);
    }
    setParseError(null);
    setIsCreateModalOpen(true);
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      setParseError('Quiz title is required.');
      return;
    }
    if (parsedQuestions.length === 0) {
      setParseError('Please parse or add at least one question before saving.');
      return;
    }

    const startIso = new Date(startTimeInput).toISOString();
    const endIso = new Date(endTimeInput).toISOString();

    if (new Date(endIso) <= new Date(startIso)) {
      setParseError('Close time must be after the start time.');
      return;
    }

    if (editingQuizId) {
      await dataService.updateQuiz(editingQuizId, {
        title: quizTitle,
        description: quizDescription,
        course_id: selectedCourseId,
        total_marks: totalMarks,
        duration_minutes: durationMinutes,
        start_time: startIso,
        end_time: endIso,
        questions: parsedQuestions
      });
      showToast('Quiz assessment updated successfully.');
    } else {
      await dataService.addQuiz({
        title: quizTitle,
        description: quizDescription,
        course_id: selectedCourseId,
        total_marks: totalMarks,
        duration_minutes: durationMinutes,
        start_time: startIso,
        end_time: endIso,
        questions: parsedQuestions,
        created_by: currentUser?.full_name || 'Administrator'
      });
      showToast('New scheduled quiz created and published to Supabase.');
    }

    setIsCreateModalOpen(false);
  };

  const handleDeleteQuiz = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete quiz "${title}" and all its records?`)) {
      await dataService.deleteQuiz(id);
      showToast(`Quiz "${title}" deleted.`);
    }
  };

  const handleUpdateQuestion = (index: number, updates: Partial<QuizQuestionItem>) => {
    setParsedQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleDeleteQuestion = (index: number) => {
    setParsedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddBlankQuestion = () => {
    const newQ: QuizQuestionItem = {
      id: `qq-custom-${Date.now()}`,
      quiz_id: '',
      question: 'New Question Text',
      options: [
        { key: 'A', text: 'Option A' },
        { key: 'B', text: 'Option B' },
        { key: 'C', text: 'Option C' },
        { key: 'D', text: 'Option D' }
      ],
      correct_answer: 'A',
      explanation: 'Explanation for correct answer',
      marks: 5,
      order_index: parsedQuestions.length + 1
    };
    setParsedQuestions(prev => [...prev, newQ]);
  };

  // Format IST
  const formatIST = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' IST';
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn text-[#F0F5FF]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-[#00A3FF] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0E1729] via-[#15233A] to-[#0A101D] border border-white/10 p-6 md:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/30">
              ADMINISTRATIVE QUIZ SUITE
            </span>
            <span className="text-xs text-[#9BAAC2] font-mono">
              Bulk Text Parser & Auto-Scheduler
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Quiz Management & Scheduling
          </h1>

          <p className="text-xs sm:text-sm text-[#9BAAC2] max-w-2xl leading-relaxed">
            Create multi-question assessments by pasting text in standard bulk format. Configure release deadlines in IST, enforce first-attempt leaderboards, and sync permanently with Supabase.
          </p>
        </div>

        <button
          onClick={() => handleOpenCreateModal()}
          className="px-6 py-3 rounded-2xl bg-[#00A3FF] hover:bg-[#176BFF] text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-[#00A3FF]/25 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Quizzes Overview Table */}
      <div className="rounded-3xl bg-[#091226] border border-white/10 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00A3FF]" />
            <span>Configured Assessments ({quizzes.length})</span>
          </h2>
          <span className="text-xs font-mono text-[#9BAAC2]">Asia/Kolkata (IST) Active Timers</span>
        </div>

        {quizzes.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#9BAAC2]">
            No quizzes created yet. Click "Create New Quiz" to bulk-paste questions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#9BAAC2] font-mono">
                  <th className="pb-3 font-semibold">Quiz Title & Info</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Start Time (IST)</th>
                  <th className="pb-3 font-semibold">Close Time (IST)</th>
                  <th className="pb-3 font-semibold">Questions</th>
                  <th className="pb-3 font-semibold">Total Marks</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {quizzes.map(quiz => {
                  const questionsCount = quiz.questions?.length || 0;
                  const isActive = quiz.status === 'active';
                  const isUpcoming = quiz.status === 'upcoming';

                  return (
                    <tr key={quiz.id} className="hover:bg-white/5 transition">
                      <td className="py-4 pr-3">
                        <div className="font-bold text-white text-sm">{quiz.title}</div>
                        <div className="text-[11px] text-[#9BAAC2] max-w-xs truncate">{quiz.description}</div>
                      </td>

                      <td className="py-4 pr-3">
                        {isActive ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                            Active
                          </span>
                        ) : isUpcoming ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
                            Upcoming
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-white/10 font-mono">
                            Closed
                          </span>
                        )}
                      </td>

                      <td className="py-4 pr-3 font-mono text-[11px] text-slate-300">
                        {formatIST(quiz.start_time)}
                      </td>

                      <td className="py-4 pr-3 font-mono text-[11px] text-slate-300">
                        {formatIST(quiz.end_time)}
                      </td>

                      <td className="py-4 pr-3 font-mono text-[#00A3FF] font-bold">
                        {questionsCount} Qs
                      </td>

                      <td className="py-4 pr-3 font-mono text-white font-bold">
                        {quiz.total_marks} Pts ({quiz.duration_minutes}m)
                      </td>

                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedLeaderboardQuiz(quiz)}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition"
                            title="View Leaderboard"
                          >
                            <Trophy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenCreateModal(quiz)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition"
                            title="Edit Quiz"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                            title="Delete Quiz"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT QUIZ MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 md:p-8 flex items-center justify-center">
          <div className="bg-[#0B132B] rounded-3xl border border-white/10 max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingQuizId ? 'Edit Quiz Assessment' : 'Create & Schedule New Quiz'}
                </h3>
                <p className="text-xs text-[#9BAAC2]">
                  Paste bulk questions, preview parsed structures, and configure release window in IST
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {parseError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Form Fields: Metadata & Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Quiz Title *</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={e => setQuizTitle(e.target.value)}
                  placeholder="e.g. Python Fundamentals Assessment"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101A2D] border border-white/10 text-white text-xs focus:border-[#00A3FF] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Target Course *</label>
                <select
                  value={selectedCourseId}
                  onChange={e => setSelectedCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101A2D] border border-white/10 text-white text-xs focus:border-[#00A3FF] outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Start Date & Time (IST) *</label>
                <input
                  type="datetime-local"
                  value={startTimeInput}
                  onChange={e => setStartTimeInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101A2D] border border-white/10 text-white text-xs focus:border-[#00A3FF] outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Close Date & Time (IST) *</label>
                <input
                  type="datetime-local"
                  value={endTimeInput}
                  onChange={e => setEndTimeInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101A2D] border border-white/10 text-white text-xs focus:border-[#00A3FF] outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Time Limit (Minutes)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  min={5}
                  max={180}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101A2D] border border-white/10 text-white text-xs focus:border-[#00A3FF] outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Total Marks</label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={e => setTotalMarks(Number(e.target.value))}
                  min={5}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101A2D] border border-white/10 text-white text-xs focus:border-[#00A3FF] outline-none font-mono"
                />
              </div>
            </div>

            {/* Bulk Text Parser Box */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#00A3FF]" />
                  <span>Paste Questions in Structured Text Format</span>
                </label>
                <button
                  type="button"
                  onClick={() => setBulkText(SAMPLE_BULK_INPUT)}
                  className="text-xs text-[#00A3FF] hover:underline font-mono"
                >
                  Insert Sample Questions
                </button>
              </div>

              <textarea
                rows={6}
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                placeholder={`Q1. What is Python?\nA. Programming Language\nB. Operating System\nCorrect Answer: A\nExplanation: ...`}
                className="w-full p-3.5 rounded-2xl bg-[#070C18] border border-white/10 text-white text-xs font-mono leading-relaxed focus:border-[#00A3FF] outline-none"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleParseBulk}
                  className="px-5 py-2 rounded-xl bg-[#00A3FF]/20 hover:bg-[#00A3FF]/30 text-[#00A3FF] border border-[#00A3FF]/40 text-xs font-bold transition flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Parse & Preview Questions</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddBlankQuestion}
                  className="text-xs text-slate-300 hover:text-white transition flex items-center gap-1 font-mono"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Blank Question
                </button>
              </div>
            </div>

            {/* PREVIEW OF PARSED QUESTIONS */}
            {parsedQuestions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Parsed Questions Preview ({parsedQuestions.length})</span>
                  </h4>
                  <span className="text-xs text-[#9BAAC2] font-mono">
                    Verify options and correct answer keys before saving
                  </span>
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  {parsedQuestions.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      className="p-4 rounded-2xl bg-[#101A2D] border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#00A3FF]">
                          Question #{qIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(qIdx)}
                          className="p-1 text-rose-400 hover:text-rose-300"
                          title="Delete this question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Question Text */}
                      <input
                        type="text"
                        value={q.question}
                        onChange={e => handleUpdateQuestion(qIdx, { question: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#070C18] border border-white/10 text-white text-xs outline-none focus:border-[#00A3FF]"
                      />

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const optKey = typeof opt === 'string' ? String.fromCharCode(65 + oIdx) : opt.key;
                          const optText = typeof opt === 'string' ? opt : opt.text;
                          const isCorrect = q.correct_answer === optKey;

                          return (
                            <div
                              key={optKey}
                              onClick={() => handleUpdateQuestion(qIdx, { correct_answer: optKey })}
                              className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition ${
                                isCorrect
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                                  : 'bg-[#070C18] border-white/5 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className={`w-5 h-5 rounded-md font-mono text-[10px] flex items-center justify-center font-bold ${
                                  isCorrect ? 'bg-emerald-500 text-white' : 'bg-white/10 text-[#9BAAC2]'
                                }`}>
                                  {optKey}
                                </span>
                                <span className="truncate">{optText}</span>
                              </div>
                              {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={e => handleUpdateQuestion(qIdx, { explanation: e.target.value })}
                        placeholder="Answer explanation..."
                        className="w-full px-3 py-1.5 rounded-lg bg-[#070C18] border border-white/10 text-[#9BAAC2] text-[11px] outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveQuiz}
                className="px-6 py-2.5 rounded-xl bg-[#00A3FF] hover:bg-[#176BFF] text-white text-xs font-black shadow-lg shadow-[#00A3FF]/25 transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Schedule Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD VIEWER MODAL */}
      {selectedLeaderboardQuiz && (() => {
        const entries = dataService.getQuizLeaderboard(selectedLeaderboardQuiz.id);
        const top3 = entries.slice(0, 3);
        const remaining = entries.slice(3);

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 md:p-8 flex items-center justify-center">
            <div className="bg-[#0B132B] rounded-3xl border border-white/10 max-w-2xl w-full p-6 md:p-8 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedLeaderboardQuiz.title}</h3>
                    <p className="text-xs text-[#9BAAC2]">Official First-Attempt Verified Leaderboard</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLeaderboardQuiz(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-bold hover:bg-white/20 transition text-white"
                >
                  Close
                </button>
              </div>

              {/* Podium */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {top3.map((entry, idx) => (
                  <div
                    key={entry.student_id}
                    className="p-4 rounded-2xl bg-[#101F3B] border border-amber-500/30 text-center space-y-1.5"
                  >
                    <span className="text-xs font-bold text-amber-400">
                      {idx === 0 ? '🥇 1st Place' : idx === 1 ? '🥈 2nd Place' : '🥉 3rd Place'}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">{entry.student_name}</h4>
                    <div className="text-xs font-mono font-bold text-[#00D1FF]">
                      Score: {entry.score} • {entry.accuracy}% Acc
                    </div>
                  </div>
                ))}
              </div>

              {/* Remaining */}
              {remaining.length > 0 && (
                <div className="divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden bg-[#101A2D]">
                  {remaining.map(entry => (
                    <div key={entry.student_id} className="p-3 px-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[#9BAAC2]">#{entry.rank}</span>
                        <span className="font-semibold text-white">{entry.student_name}</span>
                      </div>
                      <div className="font-mono text-[11px] text-[#00D1FF]">
                        {entry.score} Pts • {entry.accuracy}% Acc
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {entries.length === 0 && (
                <div className="py-8 text-center text-xs text-[#9BAAC2]">
                  No submitted attempts recorded yet for this quiz.
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AdminQuizManagementPage;
