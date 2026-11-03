import React, { useState } from 'react';
import {
  RotateCcw, ChevronLeft, ChevronRight, Sparkles, BookOpen,
  CheckCircle2, HelpCircle, Layers, Lightbulb
} from 'lucide-react';
import type { Flashcard } from '../../types';

interface DynamicFlashcardViewerProps {
  flashcards: Flashcard[];
  moduleTitle?: string;
  className?: string;
}

export const DynamicFlashcardViewer: React.FC<DynamicFlashcardViewerProps> = ({
  flashcards,
  moduleTitle,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="py-12 px-6 text-center bg-slate-50 dark:bg-[#0B1530] rounded-3xl border border-dashed border-slate-200 dark:border-white/10 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Flashcards Assigned Yet</h4>
        <p className="text-xs text-slate-500 dark:text-[#9BAAC5] max-w-md mx-auto">
          Instructor-created flashcards for {moduleTitle || 'this module'} will appear here for dynamic revision.
        </p>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, flashcards.length - 1);
  const currentCard = flashcards[safeIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev < flashcards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : flashcards.length - 1));
  };

  const cardAccents = [
    {
      border: 'border-[#00A8FF]/40',
      glow: 'shadow-[#00A8FF]/15',
      badge: 'bg-[#00A8FF]/20 text-[#00E5FF] border-[#00A8FF]/30',
      gradient: 'from-[#0D1833] via-[#0A1A3F] to-[#07132B]'
    },
    {
      border: 'border-purple-500/40',
      glow: 'shadow-purple-500/15',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      gradient: 'from-[#140F2D] via-[#1D1244] to-[#0E0B20]'
    },
    {
      border: 'border-cyan-500/40',
      glow: 'shadow-cyan-500/15',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      gradient: 'from-[#0A1E29] via-[#0D293A] to-[#07151D]'
    },
    {
      border: 'border-indigo-500/40',
      glow: 'shadow-indigo-500/15',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      gradient: 'from-[#0F172A] via-[#1E1B4B] to-[#0F172A]'
    }
  ];

  const accent = cardAccents[safeIndex % cardAccents.length];

  return (
    <div className={`space-y-4 max-w-3xl mx-auto ${className}`}>
      {/* Top Status & Controls Bar */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-500 dark:text-slate-400 font-bold">
          Active Flashcard Deck ({flashcards.length} Cards)
        </span>
        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold border border-slate-200 dark:border-white/10">
          Card {safeIndex + 1} of {flashcards.length}
        </span>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(prev => !prev)}
        className={`w-full min-h-[300px] sm:min-h-[340px] rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 border-2 select-none flex flex-col justify-between shadow-2xl relative overflow-hidden bg-gradient-to-br ${accent.gradient} ${accent.border} ${accent.glow} hover:scale-[1.01]`}
      >
        {/* Subtle Ambient Background Light */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A8FF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${accent.badge}`}>
              {isFlipped ? 'Model Answer / Reverse' : 'Question / Front'}
            </span>
            {currentCard.difficulty && (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
                {currentCard.difficulty}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <RotateCcw className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Click to flip</span>
          </div>
        </div>

        {/* Card Content (Front vs Back) */}
        <div className="py-6 sm:py-8 z-10 flex-1 flex flex-col justify-center">
          {!isFlipped ? (
            /* FRONT: Question Prompt */
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider block flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-[#00E5FF]" />
                Technical Examination Question
              </span>
              <h3 className="text-lg sm:text-2xl font-black text-white leading-relaxed">
                {currentCard.question}
              </h3>
            </div>
          ) : (
            /* BACK: Answer Explanation */
            <div className="space-y-3 animate-fadeIn">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Verified Model Solution
              </span>
              <div className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {currentCard.answer}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer Hint */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono z-10">
          <span>{moduleTitle || 'Curriculum Revision'}</span>
          <span className="text-[#00E5FF] font-bold">
            {isFlipped ? 'Answer Revealed' : 'Tap Card to Reveal Solution'}
          </span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handlePrev}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0B1530] hover:bg-slate-200 dark:hover:bg-[#132247] text-slate-800 dark:text-white text-xs font-bold transition flex items-center gap-2 border border-slate-200 dark:border-white/10 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Card</span>
        </button>

        <button
          type="button"
          onClick={() => setIsFlipped(prev => !prev)}
          className="px-4 py-2.5 rounded-xl bg-[#00A8FF]/15 hover:bg-[#00A8FF]/25 text-[#00A8FF] text-xs font-bold transition flex items-center gap-2 border border-[#00A8FF]/30"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Flip Card</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-5 py-2.5 rounded-xl bg-[#00A8FF] hover:bg-[#176BFF] text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-[#00A8FF]/25"
        >
          <span>Next Card</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

