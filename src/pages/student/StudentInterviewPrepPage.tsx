import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Search,
  Filter,
  Award,
  Clock,
  RotateCcw,
  PlusCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  List,
  Play
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { InterviewQuestion } from '../../types';

export const StudentInterviewPrepPage: React.FC = () => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>(() => dataService.getInterviewQuestions());
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'practice' | 'list'>('practice');

  // Practice Mode State (Requirement 6)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(5);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const timerRef = useRef<number | null>(null);

  // List mode state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    void dataService.syncInterviewQuestionsFromSupabase();
    const update = () => {
      const q = dataService.getInterviewQuestions();
      setQuestions(q);
      setExpandedId(prev => prev ?? (q[0]?.id || null));
    };
    update();
    return dataService.subscribe(update);
  }, []);

  const filtered = questions.filter(q => {
    // Only show published questions (or those past scheduled release)
    if (q.is_published === false) return false;
    if (q.scheduled_release_at && new Date(q.scheduled_release_at).getTime() > Date.now()) {
      return false;
    }
    const diff = q.difficulty || 'medium';
    const matchesDiff = difficultyFilter === 'all' || diff === difficultyFilter;
    const answer = q.model_answer || q.sampleAnswer || q.answer || '';
    const matchesSearch = 
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      answer.toLowerCase().includes(search.toLowerCase());
    return matchesDiff && matchesSearch;
  });

  // Reset timer on question change
  const resetTimerForQuestion = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setTimeLeft(5);
    setIsAnswerRevealed(false);
    setIsTimerRunning(true);
  };

  useEffect(() => {
    resetTimerForQuestion();
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [currentIndex, filtered.length]);

  // Countdown timer effect
  useEffect(() => {
    if (!isTimerRunning || isAnswerRevealed) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          setIsAnswerRevealed(true);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isAnswerRevealed]);

  const handleExtendCountdown = () => {
    setTimeLeft(prev => prev + 5);
    setIsTimerRunning(true);
    setIsAnswerRevealed(false);
  };

  const handleRevealNow = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setTimeLeft(0);
    setIsAnswerRevealed(true);
    setIsTimerRunning(false);
  };

  const handleNextQuestion = () => {
    if (currentIndex < filtered.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentQuestion = filtered[currentIndex] || filtered[0];

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/40 flex items-center gap-1.5 font-mono">
              <BookOpen className="w-3.5 h-3.5 text-[#397BFF]" />
              TECHNICAL INTERVIEW DRILLS
            </span>
            <span className="text-xs text-[#9BAAC2] font-mono">5s Timed Auto-Reveal</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">
            Interview Question Practice
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9BAAC2] mt-1">
            Simulate real interview pressure. Review questions, formulate your answer, and inspect industry model explanations.
          </p>
        </div>

        {/* View Mode Toggle: Interactive Drill vs Browse All List */}
        <div className="dark-card flex items-center gap-2 bg-[#15233A] p-1.5 rounded-2xl border border-white/5">
          <button
            onClick={() => setViewMode('practice')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              viewMode === 'practice'
                ? 'bg-[#397BFF] text-white shadow-lg'
                : 'text-[#9BAAC2] hover:text-[#F0F5FF]'
            }`}
          >
            <Play className="w-3.5 h-3.5" /> Interactive Practice
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              viewMode === 'list'
                ? 'bg-[#397BFF] text-white shadow-lg'
                : 'text-[#9BAAC2] hover:text-[#F0F5FF]'
            }`}
          >
            <List className="w-3.5 h-3.5" /> All Questions ({filtered.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="dark-section dark-card bg-[#15233A] p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9BAAC2] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search interview questions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full bg-[#080E1C] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#F0F5FF] focus:outline-none focus:border-[#397BFF]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setDifficultyFilter(diff);
                setCurrentIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                difficultyFilter === diff
                  ? 'bg-[#397BFF] text-white shadow-md'
                  : 'bg-[#101A2D] text-[#9BAAC2] hover:text-[#F0F5FF]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#101A2D] border border-white/10 rounded-3xl p-12 text-center text-[#9BAAC2] space-y-3">
          <HelpCircle className="w-10 h-10 text-[#397BFF] mx-auto opacity-60" />
          <h4 className="text-base font-bold text-[#F0F5FF]">No Interview Questions Found</h4>
          <p className="text-xs">Try adjusting your search query or difficulty filters.</p>
        </div>
      ) : viewMode === 'practice' ? (
        /* INTERACTIVE PRACTICE MODE (Requirement 6) */
        <div className="dark-section space-y-6">
          {/* Progress & Navigation Bar */}
          <div className="flex items-center justify-between bg-[#101A2D] p-4 rounded-2xl border border-white/10 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-[#F0F5FF] text-sm">
                Question <span className="text-[#00D4B8]">{currentIndex + 1}</span> of {filtered.length}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                (currentQuestion.difficulty || 'medium') === 'hard'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                  : (currentQuestion.difficulty || 'medium') === 'medium'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
              }`}>
                {currentQuestion.difficulty || 'medium'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevQuestion}
                disabled={currentIndex === 0}
                className="px-3 py-1.5 rounded-xl bg-[#15233A] hover:bg-[#1F2E47] text-white disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentIndex === filtered.length - 1}
                className="px-3 py-1.5 rounded-xl bg-[#397BFF] hover:bg-[#176BFF] text-white disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1 transition shadow-lg shadow-[#397BFF]/20"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Box (Always on Top) */}
          <div className="bg-[#101A2D] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-[#397BFF]/20 text-[#77B4FF] flex items-center justify-center font-bold text-xs font-mono">
                  Q{currentIndex + 1}
                </span>
                <span className="text-xs text-[#9BAAC2] font-mono">Interview Prompt</span>
              </div>

              {/* 5-Second Countdown Indicator */}
              {!isAnswerRevealed ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold animate-pulse">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Revealing answer in: {timeLeft}s</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Answer Revealed</span>
                </div>
              )}
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#F0F5FF] leading-snug">
                {currentQuestion.question}
              </h2>
              {currentQuestion.role_category && (
                <span className="inline-block text-[11px] font-mono text-[#00D4B8] bg-[#00D4B8]/10 px-2.5 py-0.5 rounded-md border border-[#00D4B8]/20">
                  Target Role: {currentQuestion.role_category}
                </span>
              )}
            </div>

            {/* Countdown Action Controls (Before Answer Revealed) */}
            {!isAnswerRevealed ? (
              <div className="p-6 rounded-2xl bg-[#15233A] border border-dashed border-amber-500/40 text-center space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#F0F5FF]">
                    Take a moment to formulate your solution before looking at the industry model response.
                  </p>
                  <p className="text-xs text-[#9BAAC2]">
                    The countdown will automatically reveal the answer in <strong className="text-amber-400 font-mono text-sm">{timeLeft} seconds</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleExtendCountdown}
                    className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+5s Extend Countdown</span>
                  </button>

                  <button
                    onClick={handleRevealNow}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#00A3FF]/25 hover:opacity-95 transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Reveal Answer Now</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ANSWER CONTAINER (Displayed directly below question after 5 seconds) */
              <div className="space-y-4 pt-4 border-t border-white/10 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#77B4FF] flex items-center gap-2 font-mono">
                    <Sparkles className="w-4 h-4 text-[#397BFF]" />
                    Model Answer & Engineering Explanation
                  </h3>
                  <button
                    onClick={() => {
                      setTimeLeft(5);
                      setIsAnswerRevealed(false);
                      setIsTimerRunning(true);
                    }}
                    className="text-[11px] text-[#9BAAC2] hover:text-white flex items-center gap-1 font-mono transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Timer
                  </button>
                </div>

                <div className="bg-[#080E1C] border border-[#397BFF]/30 p-5 sm:p-6 rounded-2xl shadow-inner text-sm text-[#F0F5FF] leading-relaxed whitespace-pre-line font-sans">
                  {currentQuestion.model_answer || currentQuestion.sampleAnswer || currentQuestion.answer || 'Comprehensive model answer is currently being finalized.'}
                </div>

                {currentQuestion.key_talking_points && currentQuestion.key_talking_points.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#15233A] border border-white/10 space-y-2">
                    <span className="text-xs font-mono font-bold text-[#00D4B8] uppercase block">
                      Key Talking Points to Mention:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#9BAAC2]">
                      {currentQuestion.key_talking_points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-[#15233A]/60 border border-white/5 flex items-center justify-between text-xs text-[#9BAAC2] font-mono">
                  <span>Syllabus: {currentQuestion.source_ref || currentQuestion.sourceCitation || 'Course Lecture Curriculum'}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Industry Verified
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* LIST / ACCORDION MODE */
        <div className="dark-section space-y-4">
          {filtered.map((item, idx) => {
            const isExpanded = expandedId === item.id;
            return (
              <div 
                key={item.id}
                className="bg-[#15233A] rounded-2xl border border-white/5 overflow-hidden transition shadow-md hover:border-[#397BFF]/30"
              >
                <button
                  onClick={() => setExpandedId(prev => prev === item.id ? null : item.id)}
                  className="w-full p-5 flex items-start justify-between text-left gap-4 hover:bg-[#101A2D]/50 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-[#397BFF]/15 text-[#77B4FF] text-xs font-bold flex items-center justify-center font-mono shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[#F0F5FF] leading-snug">
                        {item.question}
                      </h3>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          (item.difficulty || 'medium') === 'hard'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                            : (item.difficulty || 'medium') === 'medium'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        }`}>
                          {item.difficulty || 'medium'}
                        </span>
                        <span className="text-[#9BAAC2] font-mono text-[11px]">
                          Citation: {item.source_ref || item.sourceCitation || 'Course Lecture Notes'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#080E1C] text-[#9BAAC2] shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-6 bg-[#101A2D] border-t border-white/5 space-y-4 animate-fadeIn">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#77B4FF] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#397BFF]" /> Model Industry Response
                      </h4>
                      <p className="text-xs sm:text-sm text-[#F0F5FF] leading-relaxed bg-[#080E1C] p-4 rounded-xl border border-white/5 whitespace-pre-line">
                        {item.model_answer || item.sampleAnswer || item.answer}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#15233A] border border-white/5 flex items-center justify-between text-xs text-[#9BAAC2]">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#397BFF]" />
                        Grounded in syllabus document: {item.source_ref || item.sourceCitation || 'Course Lecture Notes'}
                      </span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Mentor Verified
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentInterviewPrepPage;
