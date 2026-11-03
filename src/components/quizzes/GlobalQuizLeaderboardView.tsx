import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy, Medal, Award, Crown, Clock, CheckCircle2,
  Search, User as UserIcon, RotateCcw, ArrowLeft,
  Sparkles, Check, HelpCircle, Flame, Users
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { Quiz, QuizAttempt, QuizLeaderboardEntry } from '../../types';

interface GlobalQuizLeaderboardViewProps {
  quiz: Quiz;
  currentStudentId?: string;
  onPracticeAgain?: () => void;
  onBackToQuizzes?: () => void;
  lastAttempt?: QuizAttempt | null;
}

export const GlobalQuizLeaderboardView: React.FC<GlobalQuizLeaderboardViewProps> = ({
  quiz,
  currentStudentId,
  onPracticeAgain,
  onBackToQuizzes,
  lastAttempt
}) => {
  const [leaderboard, setLeaderboard] = useState<QuizLeaderboardEntry[]>(() =>
    dataService.getQuizLeaderboard(quiz.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Real-time updates subscription
  useEffect(() => {
    void dataService.syncQuizAttemptsFromSupabase();
    const update = () => {
      setLeaderboard(dataService.getQuizLeaderboard(quiz.id));
    };
    return dataService.subscribe(update);
  }, [quiz.id]);

  // Format Helpers
  const formatTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds || 0));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const formatAccuracy = (accuracy: number) => {
    if (accuracy === undefined || isNaN(accuracy)) return '0%';
    const rounded = Number(accuracy.toFixed(2));
    return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2)}%`;
  };

  // Top 3 Winners & Remaining
  const topThree = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const rankFourOnwards = useMemo(() => leaderboard.slice(3), [leaderboard]);

  // Current student's entry in official leaderboard
  const studentEntry = useMemo(
    () => (currentStudentId ? leaderboard.find((e) => e.student_id === currentStudentId) : null),
    [leaderboard, currentStudentId]
  );

  // Search filter for Rank 4 onwards
  const filteredRemaining = useMemo(() => {
    if (!searchQuery.trim()) return rankFourOnwards;
    const q = searchQuery.toLowerCase().trim();
    return rankFourOnwards.filter((e) => e.student_name.toLowerCase().includes(q));
  }, [rankFourOnwards, searchQuery]);

  const totalPages = Math.ceil(filteredRemaining.length / pageSize) || 1;
  const paginatedRemaining = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRemaining.slice(start, start + pageSize);
  }, [filteredRemaining, currentPage, pageSize]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fadeIn text-slate-900 dark:text-white">
      {/* 1. Header & Navigation Controls */}
      <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#00A3FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/30 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                GLOBAL COMPETITION ARENA
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-600 dark:text-[#9BAAC2] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                {quiz.course_title || 'Engineering Course'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {quiz.title} • Official Leaderboard
            </h1>
            <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">
              Shared competition leaderboard evaluated from all official student submissions in Supabase PostgreSQL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
            {onPracticeAgain && (
              <button
                type="button"
                onClick={onPracticeAgain}
                className="px-4 py-2.5 rounded-xl bg-[#176BFF] hover:bg-[#00A3FF] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#176BFF]/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Again</span>
              </button>
            )}

            {onBackToQuizzes && (
              <button
                type="button"
                onClick={onBackToQuizzes}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#15233A] hover:bg-slate-200 dark:hover:bg-[#1F2E47] text-slate-800 dark:text-white text-xs font-bold transition border border-slate-200 dark:border-white/10 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Quizzes</span>
              </button>
            )}
          </div>
        </div>

        {/* Evaluation Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00A3FF]/15 text-[#00A3FF] flex items-center justify-center font-black">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-[#9BAAC2] block">
                Total Participants
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {leaderboard.length} Students
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-black">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-[#9BAAC2] block">
                Max Score
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {quiz.total_marks || 15} Marks
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-black">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-[#9BAAC2] block">
                Total Questions
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {quiz.questions?.length || 3} Questions
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-black">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-[#9BAAC2] block">
                Ranking Rule
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                Score → Acc → Time
              </span>
            </div>
          </div>
        </div>

        {/* Current Student's Official Standing Pill */}
        {studentEntry ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00A3FF]/15 via-[#176BFF]/10 to-transparent border border-[#00A3FF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-[#00A3FF] text-white font-mono font-black text-sm shadow-md shadow-[#00A3FF]/30">
                Rank #{studentEntry.rank}
              </span>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Your Official Standing on Leaderboard
                </span>
                <span className="text-[11px] text-slate-600 dark:text-[#9BAAC2]">
                  Score: <strong className="text-[#00A3FF] font-mono">{studentEntry.score}/{studentEntry.total_marks}</strong> • Correct: <strong className="text-emerald-500 font-mono">{studentEntry.correct_count}/{studentEntry.total_questions}</strong> • Accuracy: <strong className="text-emerald-500 font-mono">{formatAccuracy(studentEntry.accuracy)}</strong> • Time: <strong className="font-mono">{formatTime(studentEntry.time_spent_seconds)}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3 h-3" /> Official First Attempt Locked
              </span>
            </div>
          </div>
        ) : lastAttempt?.is_practice ? (
          <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Practice Attempt Completed: Your official first attempt remains recorded on the leaderboard.</span>
          </div>
        ) : null}
      </div>

      {/* 2. Top Three Winners – Celebration Podium Section */}
      <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Top Three Winners</span>
                <span className="text-xs font-mono font-bold text-amber-500 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                  Podium of Champions
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-[#9BAAC2]">
                Celebrating the top scoring students with highest accuracy and fastest completion times.
              </p>
            </div>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No Quiz Attempts Yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-500 max-w-md mx-auto">
              Be the first student to complete this quiz and claim the #1 Champion position on the podium!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 pb-4">
            {/* 2nd Place – Silver Winner (Left) */}
            <div className="order-2 md:order-1 flex flex-col items-center">
              {topThree[1] ? (
                <div className="w-full flex flex-col items-center space-y-3">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-slate-300 dark:border-slate-300 podium-silver-glow bg-slate-200 dark:bg-slate-800 flex items-center justify-center shadow-lg">
                      {topThree[1].avatar_url ? (
                        <img
                          src={topThree[1].avatar_url}
                          alt={topThree[1].student_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-black text-slate-700 dark:text-slate-200 font-mono">
                          {topThree[1].student_name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="absolute -top-3 -right-1 text-2xl filter drop-shadow">🥈</span>
                    <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-500">
                      Rank #{topThree[1].rank}
                    </span>
                  </div>

                  <div className="text-center space-y-1 w-full pt-1">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate px-2">
                      {topThree[1].student_name}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider block">
                      Second Place
                    </span>
                    <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold pt-1">
                      <span className="text-[#00A3FF]">Score: {topThree[1].score}/{topThree[1].total_marks}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-emerald-500">{formatAccuracy(topThree[1].accuracy)}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-[#9BAAC2] block">
                      ⏱ {formatTime(topThree[1].time_spent_seconds)} • {topThree[1].correct_count}/{topThree[1].total_questions} Correct
                    </span>
                  </div>

                  {/* Podium Base */}
                  <div className="w-full h-24 rounded-2xl bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-2xl font-black font-mono text-slate-400 dark:text-slate-400">2</span>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">SILVER</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-44 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Medal className="w-8 h-8 opacity-40 mb-1" />
                  <span>2nd Place Waiting</span>
                </div>
              )}
            </div>

            {/* 1st Place – Gold Winner Champion (Center, Elevated) */}
            <div className="order-1 md:order-2 flex flex-col items-center relative">
              {/* Confetti particles */}
              <div className="confetti-particle -top-6 left-6 text-amber-400 text-sm">✨</div>
              <div className="confetti-particle -top-8 right-6 text-yellow-300 text-base" style={{ animationDelay: '0.8s' }}>⭐</div>
              <div className="confetti-particle -top-4 left-1/2 text-amber-500 text-xs" style={{ animationDelay: '1.4s' }}>✨</div>

              {topThree[0] ? (
                <div className="w-full flex flex-col items-center space-y-3">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400 podium-gold-glow bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shadow-2xl">
                      {topThree[0].avatar_url ? (
                        <img
                          src={topThree[0].avatar_url}
                          alt={topThree[0].student_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-black text-amber-600 dark:text-amber-300 font-mono">
                          {topThree[0].student_name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="absolute -top-5 inset-x-0 mx-auto w-max text-3xl filter drop-shadow animate-bounce">👑</span>
                    <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-3 py-0.5 rounded-full text-xs font-mono font-black uppercase bg-amber-400 text-slate-950 shadow-md shadow-amber-500/40 border border-amber-300">
                      Champion • #1
                    </span>
                  </div>

                  <div className="text-center space-y-1 w-full pt-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate px-2">
                      {topThree[0].student_name}
                    </h3>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      First Place Winner
                    </span>
                    <div className="flex items-center justify-center gap-2 text-sm font-mono font-bold pt-1">
                      <span className="text-[#00A3FF]">Score: {topThree[0].score}/{topThree[0].total_marks}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-emerald-500">{formatAccuracy(topThree[0].accuracy)}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500 dark:text-[#9BAAC2] block">
                      ⏱ {formatTime(topThree[0].time_spent_seconds)} • {topThree[0].correct_count}/{topThree[0].total_questions} Correct
                    </span>
                  </div>

                  {/* Tallest Podium Base */}
                  <div className="w-full h-32 rounded-2xl bg-gradient-to-t from-amber-300 via-amber-200 to-amber-100 dark:from-amber-950 dark:via-amber-900/50 dark:to-amber-800/30 border-2 border-amber-400/60 flex flex-col items-center justify-center shadow-lg shadow-amber-500/10">
                    <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-1" />
                    <span className="text-3xl font-black font-mono text-amber-700 dark:text-amber-300">1</span>
                    <span className="text-[11px] font-mono font-black tracking-widest uppercase text-amber-800 dark:text-amber-300">CHAMPION</span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* 3rd Place – Bronze Winner (Right) */}
            <div className="order-3 flex flex-col items-center">
              {topThree[2] ? (
                <div className="w-full flex flex-col items-center space-y-3">
                  <div className="relative group">
                    <div className="w-18 h-18 rounded-full overflow-hidden border-3 border-amber-700/60 podium-bronze-glow bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center shadow-lg">
                      {topThree[2].avatar_url ? (
                        <img
                          src={topThree[2].avatar_url}
                          alt={topThree[2].student_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-black text-amber-800 dark:text-amber-500 font-mono">
                          {topThree[2].student_name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="absolute -top-3 -right-1 text-2xl filter drop-shadow">🥉</span>
                    <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-amber-800 text-amber-100 border border-amber-700">
                      Rank #{topThree[2].rank}
                    </span>
                  </div>

                  <div className="text-center space-y-1 w-full pt-1">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate px-2">
                      {topThree[2].student_name}
                    </h3>
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider block">
                      Third Place
                    </span>
                    <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold pt-1">
                      <span className="text-[#00A3FF]">Score: {topThree[2].score}/{topThree[2].total_marks}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-emerald-500">{formatAccuracy(topThree[2].accuracy)}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-[#9BAAC2] block">
                      ⏱ {formatTime(topThree[2].time_spent_seconds)} • {topThree[2].correct_count}/{topThree[2].total_questions} Correct
                    </span>
                  </div>

                  {/* Podium Base */}
                  <div className="w-full h-20 rounded-2xl bg-gradient-to-t from-orange-200 to-amber-100 dark:from-[#2a1708] dark:to-[#3d220e] border border-amber-800/40 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-2xl font-black font-mono text-amber-800 dark:text-amber-500">3</span>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-800 dark:text-amber-400">BRONZE</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-44 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Medal className="w-8 h-8 opacity-40 mb-1" />
                  <span>3rd Place Waiting</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Remaining Students – Rank 4 Onwards Table */}
      <div className="bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Remaining Participants (Rank 4 Onwards)</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9BAAC2] border border-slate-200 dark:border-white/10">
                {rankFourOnwards.length} Students
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#9BAAC2]">
              Complete rankings with official earned scores, correct questions, and verified submission time.
            </p>
          </div>

          {/* Search by student name */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search participant..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 dark:bg-[#060B18] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#00A3FF] transition font-medium"
            />
          </div>
        </div>

        {rankFourOnwards.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-[#9BAAC2]">
            All participants are currently featured on the top 3 winner podium!
          </div>
        ) : filteredRemaining.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-[#9BAAC2]">
            No participants found matching "{searchQuery}".
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#060B18] border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-[#9BAAC2] font-mono uppercase text-[11px]">
                    <th className="py-3 px-4 font-bold">Rank</th>
                    <th className="py-3 px-4 font-bold">Student</th>
                    <th className="py-3 px-4 font-bold text-center">Score</th>
                    <th className="py-3 px-4 font-bold text-center">Correct Answers</th>
                    <th className="py-3 px-4 font-bold text-center">Accuracy</th>
                    <th className="py-3 px-4 font-bold text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5 bg-white dark:bg-[#0A1224]">
                  {paginatedRemaining.map((entry) => {
                    const isCurrentStudent = entry.student_id === currentStudentId;
                    return (
                      <tr
                        key={entry.student_id}
                        className={`transition-colors ${
                          isCurrentStudent
                            ? 'bg-[#00A3FF]/10 dark:bg-[#00A3FF]/15 border-l-4 border-l-[#00A3FF]'
                            : 'hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          #{entry.rank}
                        </td>

                        {/* Profile & Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-300 dark:border-white/10 bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              {entry.avatar_url ? (
                                <img
                                  src={entry.avatar_url}
                                  alt={entry.student_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                                  {entry.student_name.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {entry.student_name}
                              </span>
                              {isCurrentStudent && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-[#00A3FF] text-white shadow-xs">
                                  YOU
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="py-3 px-4 text-center font-mono font-black text-[#00A3FF]">
                          {entry.score} / {entry.total_marks}
                        </td>

                        {/* Correct Answers */}
                        <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {entry.correct_count} / {entry.total_questions}
                        </td>

                        {/* Accuracy */}
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold border ${
                            entry.accuracy >= 80
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : entry.accuracy >= 50
                              ? 'bg-[#00A3FF]/15 text-[#00A3FF] border-[#00A3FF]/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          }`}>
                            {formatAccuracy(entry.accuracy)}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-[#9BAAC2] font-semibold">
                          {formatTime(entry.time_spent_seconds)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#9BAAC2] pt-2">
                <span>
                  Showing page {currentPage} of {totalPages} ({filteredRemaining.length} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

