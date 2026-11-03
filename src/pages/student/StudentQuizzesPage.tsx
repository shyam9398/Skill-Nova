import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Trophy, 
  Medal, 
  Flame, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Play, 
  Lock, 
  Calendar, 
  Check, 
  ChevronRight,
  ShieldAlert,
  User,
  Award,
  HelpCircle
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import type { Quiz, QuizAttempt, QuizLeaderboardEntry, QuizQuestionItem } from '../../types';

export const StudentQuizzesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const studentId = currentUser?.id || 'usr-student-1';

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => dataService.getQuizzesList());
  const [studentAttempts, setStudentAttempts] = useState<QuizAttempt[]>(() => 
    dataService.getQuizAttemptsForStudent(undefined, studentId)
  );

  useEffect(() => {
    void dataService.syncQuizzesFromSupabase();
    void dataService.syncQuizAttemptsFromSupabase();
    const unsub = dataService.subscribe(() => {
      setQuizzes(dataService.getQuizzesList());
      setStudentAttempts(dataService.getQuizAttemptsForStudent(undefined, studentId));
    });
    return unsub;
  }, [studentId]);

  // Tab Filter State
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'upcoming' | 'completed' | 'closed' | 'practice'>('all');

  // Active Quiz Attempt State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);

  // Result and Leaderboard State
  const [activeResultQuiz, setActiveResultQuiz] = useState<Quiz | null>(null);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<{
    attempt: QuizAttempt;
    leaderboardPosition: number;
    totalParticipants: number;
    accuracy: number;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);

  // Active Leaderboard Viewer Modal
  const [viewingLeaderboardQuizId, setViewingLeaderboardQuizId] = useState<string | null>(null);

  // Timer Ref
  const timerRef = useRef<number | null>(null);

  // Start Quiz Handler
  const handleStartQuiz = (quiz: Quiz, practice: boolean = false) => {
    setActiveQuiz(quiz);
    setIsPracticeMode(practice);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    const durationSec = (quiz.duration_minutes || 30) * 60;
    setRemainingSeconds(durationSec);
    setTimeSpentSeconds(0);
    setShowSubmitConfirm(false);
  };

  // Timer tick effect
  useEffect(() => {
    if (!activeQuiz) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeSpentSeconds(prev => prev + 1);
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          // Time expired -> auto-submit
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuiz]);

  // Submit Answer
  const handleSelectOption = (questionId: string, optionKey: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  // Final Submit Handler
  const handleFinalSubmit = async (autoSubmit: boolean = false) => {
    if (!activeQuiz) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const submission = await dataService.submitQuizAttemptRecord({
      quiz_id: activeQuiz.id,
      answers: selectedAnswers,
      time_spent_seconds: timeSpentSeconds,
      is_practice: isPracticeMode
    });

    setLastSubmissionResult(submission);
    setActiveResultQuiz(activeQuiz);
    setActiveQuiz(null);
    setShowSubmitConfirm(false);
  };

  // Filter Quizzes
  const filteredQuizzes = quizzes.filter(q => {
    const attempts = studentAttempts.filter(a => a.quiz_id === q.id);
    const hasCompleted = attempts.some(a => a.is_first_attempt);

    if (filterTab === 'active') return q.status === 'active';
    if (filterTab === 'upcoming') return q.status === 'upcoming';
    if (filterTab === 'completed') return hasCompleted;
    if (filterTab === 'closed') return q.status === 'closed';
    if (filterTab === 'practice') return attempts.some(a => a.is_practice);
    return true;
  });

  // Format IST Date & Time
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
      }) + ' IST';
    } catch {
      return dateStr;
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // -------------------------------------------------------------
  // VIEW: 1. ACTIVE QUIZ-TAKING INTERFACE
  // -------------------------------------------------------------
  if (activeQuiz) {
    const questions = activeQuiz.questions || [];
    const currentQ = questions[currentQuestionIndex];
    const totalQ = questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;
    const isUrgentTimer = remainingSeconds < 300; // < 5 mins

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fadeIn text-slate-900 dark:text-[#F0F5FF]">
        {/* Quiz Taking Header with Live Countdown */}
        <div className="rounded-3xl bg-white dark:bg-[#091226] border border-slate-200 dark:border-white/10 p-6 shadow-md dark:shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
                isPracticeMode
                  ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                  : 'bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30'
              }`}>
                {isPracticeMode ? 'Personal Practice Attempt' : 'Official Evaluated Attempt'}
              </span>
              <span className="text-xs text-slate-500 dark:text-[#9BAAC2] font-mono">
                {activeQuiz.duration_minutes} Mins Duration
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{activeQuiz.title}</h1>
            <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">{activeQuiz.description}</p>
          </div>

          {/* Countdown Clock */}
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${
            isUrgentTimer
              ? 'bg-rose-50 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-300 animate-pulse'
              : 'bg-sky-50 dark:bg-[#101F3B] border-sky-200 dark:border-[#00A3FF]/40 text-[#007acc] dark:text-[#00D1FF]'
          }`}>
            <Clock className="w-5 h-5" />
            <div>
              <span className="text-[10px] font-mono uppercase block font-semibold">Time Remaining</span>
              <span className="text-xl font-black font-mono tracking-wider">{formatTimer(remainingSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Question Navigation Bar (1, 2, 3...) */}
        <div className="rounded-2xl bg-white dark:bg-[#091226] border border-slate-200 dark:border-white/10 p-4 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar shadow-sm">
          <div className="flex items-center gap-2">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(selectedAnswers[q.id]);
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={q.id || idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center shrink-0 border ${
                    isCurrent
                      ? 'bg-[#00A3FF] text-white border-[#00A3FF] shadow-lg shadow-[#00A3FF]/30 scale-105'
                      : isAnswered
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-[#101A2D] border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#9BAAC2] hover:border-slate-300 dark:hover:border-white/30'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="text-right shrink-0 font-mono text-xs text-slate-600 dark:text-[#9BAAC2]">
            Answered: <strong className="text-emerald-600 dark:text-emerald-400">{answeredCount}</strong> / {totalQ}
          </div>
        </div>

        {/* Current Question Card */}
        {currentQ ? (
          <div className="rounded-3xl bg-white dark:bg-[#091226] border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-md dark:shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <span className="text-xs font-mono font-bold text-[#00A3FF]">
                Question {currentQuestionIndex + 1} of {totalQ}
              </span>
              <span className="text-xs font-mono text-slate-600 dark:text-[#9BAAC2] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                Marks: {currentQ.marks || 5}
              </span>
            </div>

            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const optKey = typeof opt === 'string' ? String.fromCharCode(65 + optIdx) : opt.key;
                const optText = typeof opt === 'string' ? opt : opt.text;
                const isSelected = selectedAnswers[currentQ.id] === optKey;

                return (
                  <button
                    key={optKey}
                    onClick={() => handleSelectOption(currentQ.id, optKey)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#00A3FF]/15 border-[#00A3FF] text-slate-900 dark:text-white shadow-md shadow-[#00A3FF]/10 scale-[1.01]'
                        : 'bg-slate-50 dark:bg-[#101A2D] border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100 dark:hover:bg-[#132247]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#00A3FF] text-white border-[#00A3FF]'
                          : 'bg-white dark:bg-[#091226] border-slate-300 dark:border-white/10 text-slate-700 dark:text-[#9BAAC2]'
                      }`}>
                        {optKey}
                      </span>
                      <span className="text-sm font-medium">{optText}</span>
                    </div>

                    {isSelected && (
                      <Check className="w-5 h-5 text-[#00A3FF] dark:text-[#00D1FF] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Previous, Next, Submit Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                  currentQuestionIndex === 0
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-white/5 text-slate-400'
                    : 'bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1C3266] text-slate-800 dark:text-white'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentQuestionIndex < totalQ - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQ - 1, prev + 1))}
                  className="px-6 py-2.5 rounded-xl bg-[#00A3FF] hover:bg-[#176BFF] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#00A3FF]/20 transition"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00A3FF] hover:opacity-95 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Quiz</span>
                </button>
              )}
            </div>
          </div>
        ) : null}

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md p-4 flex items-center justify-center">
            <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-slate-200 dark:border-white/10 max-w-md w-full p-6 md:p-8 space-y-4 shadow-2xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#00A3FF]/20 border border-[#00A3FF]/40 text-[#00A3FF] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Final Submission</h3>
              <p className="text-xs text-slate-600 dark:text-[#9BAAC2] leading-relaxed">
                You have answered <strong className="text-emerald-600 dark:text-emerald-400">{answeredCount}</strong> of <strong className="text-slate-900 dark:text-white">{totalQ}</strong> questions.
                {answeredCount < totalQ && (
                  <span className="block text-amber-600 dark:text-amber-300 font-bold mt-1">
                    Warning: You have {totalQ - answeredCount} unanswered questions!
                  </span>
                )}
                Once submitted, official first-attempt answers are permanently recorded on the leaderboard.
              </p>

              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-white text-xs font-bold transition"
                >
                  Review Answers
                </button>
                <button
                  onClick={() => handleFinalSubmit(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#00A3FF] hover:bg-[#176BFF] text-white text-xs font-black shadow-lg shadow-[#00A3FF]/25 transition"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: 2. QUIZ RESULT & WINNING LEADERBOARD MODAL
  // -------------------------------------------------------------
  if (lastSubmissionResult && activeResultQuiz) {
    const leaderboard = dataService.getQuizLeaderboard(activeResultQuiz.id);
    const topThree = leaderboard.slice(0, 3);
    const remaining = leaderboard.slice(3);

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fadeIn text-slate-900 dark:text-white">
        {/* Score & Accuracy Hero Card */}
        <div className="rounded-3xl bg-white dark:bg-[#0B132B] border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-md dark:shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00A3FF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/30">
            <Trophy className="w-4 h-4" />
            <span>ASSESSMENT COMPLETED</span>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{activeResultQuiz.title}</h1>
            <p className="text-xs text-slate-600 dark:text-[#9BAAC2] mt-1">Result Summary & Verified Evaluation</p>
          </div>

          {/* Scores Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#101A2D] border border-slate-200 dark:border-white/10">
              <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] uppercase font-mono block">Score Earned</span>
              <span className="text-2xl font-black text-[#00A3FF] dark:text-[#00D1FF] font-mono">
                {lastSubmissionResult.attempt.score} / {lastSubmissionResult.attempt.total_marks || 100}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#101A2D] border border-slate-200 dark:border-white/10">
              <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] uppercase font-mono block">Accuracy</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {lastSubmissionResult.accuracy}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#101A2D] border border-slate-200 dark:border-white/10">
              <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] uppercase font-mono block">Correct</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {lastSubmissionResult.correctCount} / {lastSubmissionResult.totalQuestions}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#101A2D] border border-slate-200 dark:border-white/10">
              <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] uppercase font-mono block">Official Rank</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-300 font-mono">
                #{lastSubmissionResult.leaderboardPosition}
              </span>
            </div>
          </div>

          {/* First Attempt vs Practice Mode Banner */}
          <div className="max-w-xl mx-auto p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-[#9BAAC2]">
            {lastSubmissionResult.attempt.is_first_attempt ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                This was your official First Attempt. Your rank has been entered on the official leaderboard.
              </span>
            ) : (
              <span className="text-purple-600 dark:text-purple-300 font-semibold flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Personal Practice Attempt: Your official first-attempt rank is preserved and unaffected.
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleStartQuiz(activeResultQuiz, true)}
              className="px-6 py-2.5 rounded-xl bg-[#176BFF] hover:bg-[#00A3FF] text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-[#176BFF]/25"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Again</span>
            </button>

            <button
              onClick={() => {
                setLastSubmissionResult(null);
                setActiveResultQuiz(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] text-slate-800 dark:text-white text-xs font-bold transition border border-slate-200 dark:border-white/10"
            >
              Back to Quizzes List
            </button>
          </div>
        </div>

        {/* WINNING LEADERBOARD */}
        <div className="rounded-3xl bg-white dark:bg-[#091226] border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-md dark:shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Official Quiz Leaderboard</h3>
                <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">
                  Ranked by Score → Accuracy → Earliest valid completion (First Attempt Rule)
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9BAAC2] border border-slate-200 dark:border-white/10">
              {leaderboard.length} Participants
            </span>
          </div>

          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topThree.map((entry, idx) => {
              const medalEmoji = idx === 0 ? '🥇 1st Place' : idx === 1 ? '🥈 2nd Place' : '🥉 3rd Place';
              const medalColor = idx === 0 ? 'border-amber-500/40 bg-amber-50 dark:bg-amber-500/10' : idx === 1 ? 'border-slate-300/40 bg-slate-100 dark:bg-slate-300/10' : 'border-amber-700/40 bg-orange-50 dark:bg-amber-700/10';

              return (
                <div
                  key={entry.student_id}
                  className={`p-5 rounded-2xl border text-center space-y-2 relative overflow-hidden ${medalColor}`}
                >
                  <span className="text-sm font-bold block">{medalEmoji}</span>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">{entry.student_name}</h4>
                  <div className="text-xs font-mono text-[#00A3FF] dark:text-[#00D1FF] font-bold">
                    Score: {entry.score} • {entry.accuracy}% Accuracy
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-[#9BAAC2] font-mono block">
                    Time: {Math.floor(entry.time_spent_seconds / 60)}m {entry.time_spent_seconds % 60}s
                  </span>
                </div>
              );
            })}
          </div>

          {/* Remaining Participants Table */}
          {remaining.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-500 dark:text-[#9BAAC2] uppercase font-mono block">Remaining Participants</span>
              <div className="divide-y divide-slate-200 dark:divide-white/5 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#101A2D]">
                {remaining.map(entry => (
                  <div key={entry.student_id} className="p-3.5 px-5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 font-mono font-bold text-slate-500 dark:text-[#9BAAC2]">#{entry.rank}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{entry.student_name}</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[11px]">
                      <span className="text-[#00A3FF] dark:text-[#00D1FF] font-bold">Score: {entry.score}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{entry.accuracy}% Acc</span>
                      <span className="text-slate-500 dark:text-[#9BAAC2]">{Math.floor(entry.time_spent_seconds / 60)}m {entry.time_spent_seconds % 60}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: 3. MAIN STUDENT QUIZZES LISTING (Tabs & Cards)
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-fadeIn text-slate-900 dark:text-[#F0F5FF]">
      {/* Top Welcome Banner */}
      <div className="rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#0E1729] dark:via-[#15233A] dark:to-[#0A101D] border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm dark:shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00A3FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/30">
                OFFICIAL QUIZ PORTAL
              </span>
              <span className="text-xs text-slate-500 dark:text-[#9BAAC2] font-mono">
                Asia/Kolkata (IST) Timestamps
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Assessments & Winning Leaderboards
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9BAAC2] max-w-2xl leading-relaxed">
              Complete scheduled cohort assessments to earn ranking points on official leaderboards. Practice mode available after your first official submission.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#101A2D] border border-slate-200 dark:border-white/10 text-right">
              <span className="text-[10px] text-slate-500 dark:text-[#9BAAC2] block uppercase font-mono">Attempted</span>
              <span className="text-lg font-black text-[#00A3FF] dark:text-[#00D1FF] font-mono">{studentAttempts.length} Drills</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Quizzes', count: quizzes.length },
          { id: 'active', label: 'Active Now', count: quizzes.filter(q => q.status === 'active').length },
          { id: 'upcoming', label: 'Upcoming', count: quizzes.filter(q => q.status === 'upcoming').length },
          { id: 'completed', label: 'Completed', count: studentAttempts.filter(a => a.is_first_attempt).length },
          { id: 'closed', label: 'Closed', count: quizzes.filter(q => q.status === 'closed').length },
          { id: 'practice', label: 'Practice Attempts', count: studentAttempts.filter(a => a.is_practice).length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              filterTab === tab.id
                ? 'bg-[#00A3FF] text-white shadow-md shadow-[#00A3FF]/20'
                : 'text-slate-600 dark:text-[#9BAAC2] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-[#9BAAC2]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Quiz Cards Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 dark:text-[#9BAAC2] bg-white dark:bg-[#091226] rounded-3xl border border-dashed border-slate-200 dark:border-white/10 space-y-2">
          <HelpCircle className="w-8 h-8 text-slate-400 dark:text-[#9BAAC2] mx-auto opacity-40" />
          <p>No quizzes matching the "{filterTab}" category at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredQuizzes.map(quiz => {
            const attempts = studentAttempts.filter(a => a.quiz_id === quiz.id);
            const firstAttempt = attempts.find(a => a.is_first_attempt);
            const practiceAttempts = attempts.filter(a => a.is_practice);

            const isActive = quiz.status === 'active';
            const isUpcoming = quiz.status === 'upcoming';
            const isClosed = quiz.status === 'closed';

            return (
              <div
                key={quiz.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#091226] border border-slate-200 dark:border-white/10 hover:border-[#00A3FF]/50 transition-all shadow-sm dark:shadow-xl space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Status & Schedule Badge */}
                  <div className="flex items-center justify-between">
                    {isActive ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active Now
                      </span>
                    ) : isUpcoming ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Upcoming
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                        Closed
                      </span>
                    )}

                    <span className="text-xs font-mono text-[#00A3FF] font-bold">
                      {quiz.total_marks || 20} Marks • {quiz.duration_minutes || 30} Mins
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{quiz.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-[#9BAAC2] line-clamp-2 leading-relaxed">{quiz.description}</p>

                  {/* Schedule Timestamps in IST */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#101A2D] border border-slate-200 dark:border-white/5 space-y-1 text-[11px] font-mono text-slate-600 dark:text-[#9BAAC2]">
                    <div className="flex items-center justify-between">
                      <span>Start Time:</span>
                      <strong className="text-slate-900 dark:text-white">{formatIST(quiz.start_time)}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Close Time:</span>
                      <strong className="text-slate-900 dark:text-white">{formatIST(quiz.end_time)}</strong>
                    </div>
                  </div>

                  {/* Previous Result Badge if completed */}
                  {firstAttempt && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase font-mono block">First Attempt Result</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          Score: {firstAttempt.score}/{firstAttempt.total_marks || 100} ({firstAttempt.accuracy}% Acc)
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-mono">Verified</span>
                    </div>
                  )}

                  {/* Practice Attempts Count */}
                  {practiceAttempts.length > 0 && (
                    <div className="text-[11px] text-purple-600 dark:text-purple-300 font-mono">
                      Personal Practice Attempts: {practiceAttempts.length}
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                  {/* Start Button */}
                  {isActive && !firstAttempt && (
                    <button
                      onClick={() => handleStartQuiz(quiz, false)}
                      className="flex-1 py-2.5 rounded-xl bg-[#00A3FF] hover:bg-[#176BFF] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-[#00A3FF]/25"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Official Quiz</span>
                    </button>
                  )}

                  {/* If active or closed, and first attempt already done: allow Practice Again */}
                  {firstAttempt && !isUpcoming && (
                    <button
                      onClick={() => handleStartQuiz(quiz, true)}
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Practice Again</span>
                    </button>
                  )}

                  {/* Upcoming: disabled button */}
                  {isUpcoming && (
                    <button
                      disabled
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-[#9BAAC2] text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Opens at {formatIST(quiz.start_time)}</span>
                    </button>
                  )}

                  {/* View Leaderboard Button */}
                  <button
                    onClick={() => setViewingLeaderboardQuizId(quiz.id)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] text-slate-800 dark:text-white text-xs font-bold transition border border-slate-200 dark:border-white/10 flex items-center gap-1.5"
                    title="View Leaderboard"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Leaderboard</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Standalone Leaderboard Viewer Modal */}
      {viewingLeaderboardQuizId && (() => {
        const lbQuiz = quizzes.find(q => q.id === viewingLeaderboardQuizId);
        const lbEntries = dataService.getQuizLeaderboard(viewingLeaderboardQuizId);
        const top3 = lbEntries.slice(0, 3);
        const rest = lbEntries.slice(3);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md p-4 md:p-8 flex items-center justify-center">
            <div className="bg-white dark:bg-[#0B132B] rounded-3xl border border-slate-200 dark:border-white/10 max-w-2xl w-full p-6 md:p-8 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{lbQuiz?.title || 'Quiz'} Leaderboard</h3>
                    <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">Official First-Attempt Rankings</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingLeaderboardQuizId(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition text-slate-800 dark:text-white"
                >
                  Close
                </button>
              </div>

              {/* Top 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {top3.map((entry, idx) => (
                  <div
                    key={entry.student_id}
                    className="p-4 rounded-2xl bg-amber-50/50 dark:bg-[#101F3B] border border-amber-500/30 text-center space-y-1.5"
                  >
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {idx === 0 ? '🥇 1st Place' : idx === 1 ? '🥈 2nd Place' : '🥉 3rd Place'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{entry.student_name}</h4>
                    <div className="text-xs font-mono font-bold text-[#00A3FF] dark:text-[#00D1FF]">
                      {entry.score} Pts ({entry.accuracy}%)
                    </div>
                  </div>
                ))}
              </div>

              {/* Rest of students */}
              {rest.length > 0 && (
                <div className="space-y-1.5 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#101A2D]">
                  {rest.map(entry => (
                    <div key={entry.student_id} className="p-3 px-4 flex items-center justify-between text-xs border-b border-slate-200 dark:border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-500 dark:text-[#9BAAC2]">#{entry.rank}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{entry.student_name}</span>
                      </div>
                      <div className="font-mono text-[11px] text-[#00A3FF] dark:text-[#00D1FF]">
                        {entry.score} Pts • {entry.accuracy}% Acc
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {lbEntries.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-[#9BAAC2]">
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

export default StudentQuizzesPage;
