import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Download, FileText, Sparkles, AlertCircle,
  ShieldCheck, RotateCcw
} from 'lucide-react';
import type { Quiz } from '../../types';
import { generateQuizPdf, type GeneratedPdfResult } from '../../utils/quizPdfGenerator';
import { SkillNovaPdfViewer } from '../resource/SkillNovaPdfViewer';

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
  const [pdfError, setPdfError] = useState<string | null>(null);

  const createPdf = () => {
    setIsGenerating(true);
    setPdfError(null);
    try {
      const result = generateQuizPdf(quiz);
      setPdfResult(result);
    } catch (err: any) {
      console.error('Failed to generate Quiz PDF:', err);
      setPdfError(err?.message || 'Failed to render PDF document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    createPdf();

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

  // Clean up blob URL on unmount or re-render
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

  return createPortal(
    <div
      className="quiz-modal-overlay modal-overlay skillnova-modal-overlay fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pdf-modal-content quiz-modal-content modal-content skillnova-modal-content w-[min(90vw,1100px)] max-w-5xl h-[calc(100vh-40px)] max-h-[calc(100vh-40px)] flex flex-col bg-white dark:bg-[#0A1224] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070D1B] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#176BFF]/15 text-[#176BFF] dark:text-[#00E5FF] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#176BFF] dark:text-[#00E5FF]">
                  SKILLNOVA OFFICIAL STUDY PDF
                </span>
                {pdfResult && (
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                    • {pdfResult.totalPages} Page{pdfResult.totalPages > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                {quiz.title} • Questions & Detailed Explanations
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Single, Primary Download PDF Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating || !pdfResult}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:opacity-95 text-white text-xs font-black shadow-md shadow-[#176BFF]/25 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            {/* Accessible Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center justify-center transition cursor-pointer"
              title="Close Preview (Esc)"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Direct Genuine PDF Preview Area */}
        <div className="modal-body skillnova-modal-body flex-1 min-h-0 bg-slate-100 dark:bg-[#060B18] p-2 sm:p-4 flex flex-col items-center justify-center overflow-hidden">
          {isGenerating ? (
            <div className="my-auto flex flex-col items-center gap-3 text-slate-600 dark:text-[#9BAAC2]">
              <Sparkles className="w-8 h-8 text-[#00A3FF] animate-spin-slow" />
              <span className="text-xs font-mono font-bold">Rendering SkillNova Watermarked PDF...</span>
            </div>
          ) : pdfError ? (
            <div className="my-auto max-w-md p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">PDF Generation Failed</h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">{pdfError}</p>
              <button
                type="button"
                onClick={createPdf}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 inline-flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retry PDF Generation
              </button>
            </div>
          ) : pdfResult ? (
            /* Reliable Multi-Platform Canvas PDF Viewer (supports Android Chrome, Edge, Safari, Desktop) */
            <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-300 dark:border-white/10 shadow-lg bg-slate-900 flex flex-col">
              <SkillNovaPdfViewer
                source={pdfResult.blob}
                title={`${quiz.title} • Questions & Detailed Explanations`}
                subTitle="Official SkillNova Study Document • Vector PDF with Watermark & Solutions"
                onDownload={handleDownload}
                showToolbar={true}
                className="w-full h-full"
              />
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#070D1B] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#9BAAC2]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Official SkillNova Study Document • Vector PDF with Watermark & Solutions</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
