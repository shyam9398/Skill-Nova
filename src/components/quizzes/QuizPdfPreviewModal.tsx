import React, { useState, useEffect } from 'react';
import {
  X, Download, FileText, CheckCircle2, ChevronRight,
  ZoomIn, ZoomOut, Sparkles, ExternalLink, ShieldCheck,
  Eye, HelpCircle, Layers, Printer
} from 'lucide-react';
import type { Quiz } from '../../types';
import { generateQuizPdf, type GeneratedPdfResult } from '../../utils/quizPdfGenerator';

interface QuizPdfPreviewModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
}

export const QuizPdfPreviewModal: React.FC<QuizPdfPreviewModalProps> = ({
  quiz,
  isOpen,
  onClose,
}) => {
  const [pdfResult, setPdfResult] = useState<GeneratedPdfResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'interactive' | 'pdf'>('interactive');
  const [zoomScale, setZoomScale] = useState<number>(100);

  useEffect(() => {
    if (!isOpen) return;

    setIsGenerating(true);
    try {
      const result = generateQuizPdf(quiz);
      setPdfResult(result);
    } catch (err) {
      console.error('Failed to generate Quiz PDF:', err);
    } finally {
      setIsGenerating(false);
    }

    // Lock background scroll
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, quiz, onClose]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfResult?.blobUrl) {
        URL.revokeObjectURL(pdfResult.blobUrl);
      }
    };
  }, [pdfResult]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!pdfResult) return;
    pdfResult.doc.save(pdfResult.filename);
  };

  const questions = quiz.questions || [];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl h-[92vh] flex flex-col bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden relative animate-scaleUp">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070D1B] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#176BFF]/15 text-[#176BFF] dark:text-[#00E5FF] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#176BFF] dark:text-[#00E5FF]">
                  SKILLNOVA STUDY GUIDE
                </span>
                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                  • {pdfResult?.totalPages || 1} Pages
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                {quiz.title} • Questions & Explanations
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-200 dark:bg-white/5 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('interactive')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'interactive'
                    ? 'bg-white dark:bg-[#15233A] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#9BAAC2] hover:text-slate-900'
                }`}
              >
                Paper Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pdf')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'pdf'
                    ? 'bg-white dark:bg-[#15233A] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#9BAAC2] hover:text-slate-900'
                }`}
              >
                PDF Stream
              </button>
            </div>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating || !pdfResult}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:opacity-95 text-white text-xs font-black shadow-md shadow-[#176BFF]/25 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition"
              title="Close Preview (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Document Pages */}
        <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#060B18] p-3 sm:p-6 md:p-8 flex flex-col items-center">
          {isGenerating ? (
            <div className="my-auto flex flex-col items-center gap-3 text-slate-600 dark:text-[#9BAAC2]">
              <Sparkles className="w-8 h-8 text-[#00A3FF] animate-spin-slow" />
              <span className="text-xs font-mono font-bold">Generating Watermarked SkillNova PDF...</span>
            </div>
          ) : activeTab === 'pdf' && pdfResult?.blobUrl ? (
            // Native PDF Embed View
            <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-300 dark:border-white/10 shadow-lg bg-white">
              <iframe
                src={`${pdfResult.blobUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title="SkillNova Quiz PDF Preview"
              />
            </div>
          ) : (
            // Interactive Paper Layout Preview with SkillNova Watermark
            <div
              className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl border border-slate-300 shadow-2xl p-6 sm:p-10 relative overflow-hidden space-y-6 select-text transition-transform"
              style={{ minHeight: '800px' }}
            >
              {/* Subtle Repeating SkillNova Watermarks */}
              <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
                <div className="absolute top-[20%] left-[25%] -translate-x-1/2 -rotate-35 text-5xl sm:text-6xl font-black text-[#00A8FF]/[0.05] tracking-widest uppercase">
                  SkillNova
                </div>
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -rotate-35 text-5xl sm:text-6xl font-black text-[#00A8FF]/[0.05] tracking-widest uppercase">
                  SkillNova
                </div>
                <div className="absolute top-[80%] left-[75%] -translate-x-1/2 -rotate-35 text-5xl sm:text-6xl font-black text-[#00A8FF]/[0.05] tracking-widest uppercase">
                  SkillNova
                </div>
              </div>

              {/* Document Header */}
              <div className="relative z-10 border-b border-slate-200 pb-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span className="font-black text-[#176BFF] uppercase tracking-wider">
                    SKILLNOVA LEARNING PLATFORM
                  </span>
                  <span>Official Question Bank & Detailed Explanations</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  {quiz.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-mono">
                  <span>Questions: <strong>{questions.length}</strong></span>
                  <span>•</span>
                  <span>Marks: <strong>{quiz.total_marks || 10}</strong></span>
                  <span>•</span>
                  <span>Duration: <strong>{quiz.duration_minutes || 15} Mins</strong></span>
                  {quiz.course_title && (
                    <>
                      <span>•</span>
                      <span className="text-[#176BFF] font-bold">{quiz.course_title}</span>
                    </>
                  )}
                </div>

                {quiz.description && (
                  <p className="text-xs text-slate-600 italic pt-1">
                    {quiz.description}
                  </p>
                )}
              </div>

              {/* Questions List */}
              <div className="relative z-10 space-y-6">
                {questions.map((q, idx) => {
                  const qNum = idx + 1;
                  const rawCorrect = (q.correct_answer || '').trim().toUpperCase();

                  return (
                    <div
                      key={q.id || idx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3"
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                          <strong className="text-[#176BFF] mr-1.5 font-mono">Q{qNum}.</strong>
                          {q.question}
                        </span>
                        <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-[#176BFF] border border-blue-200">
                          {q.marks || 1} Mark{(q.marks || 1) > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="space-y-1.5 pt-1">
                        {(q.options || []).map((opt, optIdx) => {
                          let optKey = String.fromCharCode(65 + optIdx);
                          let optText = '';

                          if (typeof opt === 'string') {
                            optText = opt;
                          } else {
                            optKey = opt.key || optKey;
                            optText = opt.text;
                          }

                          const isCorrect =
                            optKey.toUpperCase() === rawCorrect ||
                            rawCorrect === optText.trim().toUpperCase() ||
                            (rawCorrect.length === 1 && optKey.toUpperCase() === rawCorrect);

                          return (
                            <div
                              key={optKey}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {optKey}
                                </span>
                                <span>{optText}</span>
                              </div>

                              {isCorrect && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black uppercase bg-emerald-200/70 text-emerald-900 flex items-center gap-1 shrink-0">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Correct Answer
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 space-y-1">
                          <span className="font-bold text-[#176BFF] block flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" /> Explanation & Solution:
                          </span>
                          <p className="leading-relaxed text-slate-700">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Document Footer */}
              <div className="relative z-10 border-t border-slate-200 pt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>SkillNova Engineering Cohort • Confidential</span>
                <span>Page 1 of {pdfResult?.totalPages || 1}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070D1B] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#9BAAC2]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Watermarked SkillNova PDF study guide ready for offline review</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-bold transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating || !pdfResult}
              className="px-5 py-2 rounded-xl bg-[#176BFF] hover:bg-[#00A3FF] text-white text-xs font-black shadow-md shadow-[#176BFF]/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Branded PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

