import React, { useState } from 'react';
import { RotateCw, CheckCircle, HelpCircle, ArrowLeft, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import type { Flashcard } from '../../types';
import confetti from 'canvas-confetti';

interface FlashcardDeckProps {
  cards?: Flashcard[];
  flashcards?: Flashcard[];
  topicTitle?: string;
  onComplete?: () => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ 
  cards, 
  flashcards,
  topicTitle,
  onComplete 
}) => {
  const activeCards = cards || flashcards || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  if (!activeCards || activeCards.length === 0) {
    return (
      <div className="dark-card bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-8 sm:p-12 text-center shadow-lg">
        <BookOpen className="w-12 h-12 text-[#00A8FF] mx-auto mb-3" />
        <h4 className="text-lg font-bold text-white">No Flashcards Available</h4>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
          Instructor-created flashcards for this course will appear here for dynamic recall and mastery practice.
        </p>
      </div>
    );
  }

  const currentCard = activeCards[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / activeCards.length) * 100);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < activeCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      if (onComplete) onComplete();
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const markMastered = () => {
    const updated = new Set(masteredIds);
    updated.add(currentCard.id);
    setMasteredIds(updated);
    handleNext();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Deck Header & Progress */}
      <div className="dark-card flex items-center justify-between text-xs text-slate-300 bg-[#101A2D] px-4 py-3 rounded-xl border border-[#1F2E47] shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00A8FF]" />
          <span className="font-bold text-white">
            Card {currentIndex + 1} of {activeCards.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#00A8FF] font-semibold">
            Mastered: {masteredIds.size} / {activeCards.length}
          </span>
          <div className="w-28 h-2 bg-[#15233A] rounded-full overflow-hidden border border-[#1F2E47]">
            <div
              className="h-full bg-gradient-to-r from-[#176BFF] to-[#00A8FF] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 cursor-pointer [perspective:1000px] group select-none"
      >
        <div
          className={`relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] rounded-2xl ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Card Front (Question) */}
          <div className="dark-card absolute inset-0 w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-[#15233A] to-[#101A2D] border border-[#1F2E47] group-hover:border-[#00A8FF]/50 rounded-2xl p-8 flex flex-col justify-between shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-[#00A8FF]/20 text-[#00E5FF] border border-[#00A8FF]/30 font-bold">
                {(currentCard.difficulty || 'medium').toUpperCase()} DIFFICULTY
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                <RotateCw className="w-3.5 h-3.5 text-[#00A8FF] animate-spin-slow" />
                Click anywhere to flip
              </span>
            </div>

            <div className="my-auto text-center px-4">
              <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                {currentCard.question}
              </h3>
              {currentCard.topic_title && (
                <p className="text-xs text-slate-300 mt-3 font-medium">
                  Topic: {currentCard.topic_title}
                </p>
              )}
            </div>

            <div className="text-center text-[11px] text-slate-400">
              SkillNova AI Flashcard Deck • Grounded Knowledge
            </div>
          </div>

          {/* Card Back (Answer & Grounding) */}
          <div className="dark-card absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-[#101A2D] to-[#080E1C] border border-[#00A8FF]/40 rounded-2xl p-8 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F2E47] pb-3">
              <span className="text-xs font-bold text-[#00E5FF] flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#00A8FF]" />
                Target Knowledge Answer
              </span>
              <span className="text-[11px] font-mono text-slate-300 bg-[#15233A] px-2 py-0.5 rounded border border-white/5">
                Grounded Reference
              </span>
            </div>

            <div className="my-auto px-2">
              <p className="text-sm md:text-base text-white leading-relaxed font-medium">
                {currentCard.answer}
              </p>

              {currentCard.source_ref && (
                <div className="mt-4 p-2.5 rounded-lg bg-[#15233A]/90 border border-[#1F2E47] text-left">
                  <div className="text-[10px] uppercase font-bold text-[#00E5FF] tracking-wider">
                    Source Document Grounding
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5 italic">
                    "{currentCard.source_ref}"
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-[11px] text-slate-400">
              Click to flip back to question
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-xl bg-white dark:bg-[#15233A] text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1F2E47] disabled:opacity-40 disabled:cursor-not-allowed border border-slate-300 dark:border-[#1F2E47] shadow-xs flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNext()}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#15233A] text-xs font-bold text-slate-700 dark:text-[#9BAAC2] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2E47] border border-slate-300 dark:border-[#1F2E47] shadow-xs transition flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            Review Later
          </button>
          <button
            onClick={markMastered}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] text-xs font-bold text-white hover:opacity-95 shadow-md shadow-[#00A3FF]/25 transition flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            Got It! (Mastered)
          </button>
        </div>

        <button
          onClick={handleNext}
          className="px-4 py-2 rounded-xl bg-white dark:bg-[#15233A] text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#1F2E47] border border-slate-300 dark:border-[#1F2E47] shadow-xs flex items-center gap-1.5 transition"
        >
          {currentIndex === activeCards.length - 1 ? 'Finish' : 'Next'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
