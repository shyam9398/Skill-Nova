import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  HelpCircle, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Award
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { FlashcardDeck } from '../../components/practice/FlashcardDeck';
import { QuizEngine } from '../../components/practice/QuizEngine';
import type { Course, Topic } from '../../types';

export const StudentPracticePage: React.FC = () => {
  const [, setTick] = useState(0);
  const user = dataService.getCurrentUser();
  const enrolledCourses = dataService.getEnrolledCourses(user?.id);
  const [selectedCourseId, setSelectedCourseId] = useState(enrolledCourses[0]?.id || '');
  const [mode, setMode] = useState<'flashcards' | 'quiz'>('flashcards');

  React.useEffect(() => {
    void dataService.syncCoursesFromSupabase();
    void dataService.syncQuizzesFromSupabase();
    void dataService.syncQuizAttemptsFromSupabase();
    const unsub = dataService.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsub;
  }, []);

  const selectedCourse = enrolledCourses.find(c => c.id === selectedCourseId) || enrolledCourses[0];
  const flashcards = dataService.getFlashcards(selectedCourse?.id);
  const quizQuestions = dataService.getQuizQuestions(selectedCourse?.id);
  const attempts = dataService.getQuizAttempts();

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#176BFF]/15 dark:bg-[#397BFF]/20 text-[#176BFF] dark:text-[#00E5FF] border border-[#176BFF]/30 dark:border-[#397BFF]/40 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#176BFF] dark:text-[#00A8FF]" />
              AI Cognitive Drill Center
            </span>
            <span className="text-xs text-slate-500 dark:text-[#9BAAC2] font-mono">Spaced Repetition & Assessments</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Interactive Practice & Mastery
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9BAAC2] mt-1 leading-relaxed">
            Test your recall with 3D flip flashcards and attempt timed MCQs with grounded explanations.
          </p>
        </div>

        {/* Practice Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-200/70 dark:bg-[#15233A] p-1.5 rounded-2xl border border-slate-300 dark:border-white/5 shadow-xs">
          <button
            onClick={() => setMode('flashcards')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              mode === 'flashcards'
                ? 'bg-[#176BFF] text-white shadow-md'
                : 'text-slate-700 dark:text-[#9BAAC2] hover:text-slate-900 dark:hover:text-[#F0F5FF]'
            }`}
          >
            <Layers className="w-4 h-4" /> Flashcard Deck ({flashcards.length})
          </button>
          <button
            onClick={() => setMode('quiz')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              mode === 'quiz'
                ? 'bg-[#176BFF] text-white shadow-md'
                : 'text-slate-700 dark:text-[#9BAAC2] hover:text-slate-900 dark:hover:text-[#F0F5FF]'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Timed Quiz ({quizQuestions.length})
          </button>
        </div>
      </div>

      {/* Course Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {enrolledCourses.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCourseId(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
              selectedCourse?.id === c.id
                ? 'bg-[#176BFF] text-white shadow-md'
                : 'bg-white dark:bg-[#101A2D] text-slate-700 dark:text-[#9BAAC2] hover:text-slate-900 dark:hover:text-[#F0F5FF] border border-slate-300 dark:border-white/5 shadow-xs'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {c.title}
          </button>
        ))}
      </div>

      {/* Active Component */}
      <div className="space-y-8">
        {mode === 'flashcards' ? (
          <FlashcardDeck
            flashcards={flashcards}
            topicTitle={`${selectedCourse?.title} - Concept Drill`}
          />
        ) : (
          <QuizEngine
            questions={quizQuestions}
            courseId={selectedCourse?.id}
          />
        )}
      </div>

      {/* Past Quiz History */}
      {attempts.length > 0 && (
        <div className="bg-white dark:bg-[#15233A] rounded-2xl border border-slate-200 dark:border-white/5 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#F0F5FF] flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" /> Recent Assessment History
            </h3>
            <span className="text-xs text-slate-500 dark:text-[#9BAAC2] font-mono">{attempts.length} attempts recorded</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {attempts.map((att: any) => {
              const total = att.total_questions || att.totalQuestions || 5;
              const pct = Math.round((att.score / total) * 100);
              return (
                <div key={att.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#101A2D] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-[#F0F5FF]">
                    <span>Assessment Completed</span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-mono">{pct}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#9BAAC2]">
                    <span>Score: {att.score} / {total}</span>
                    <span className="text-[11px] font-mono">{att.completed_at || att.completedAt || 'Recently'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
