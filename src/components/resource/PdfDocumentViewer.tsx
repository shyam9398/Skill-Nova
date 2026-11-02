import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  Minimize, 
  ZoomIn, 
  ZoomOut, 
  Lock, 
  Clock, 
  FileText, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import type { PdfPageAllocation } from '../../types';

interface PdfDocumentViewerProps {
  pdfUrl: string;
  title: string;
  subModuleTitle?: string;
  startPage?: number;
  endPage?: number;
  totalPages?: number;
  isAccessible?: boolean;
  isScheduled?: boolean;
  isLocked?: boolean;
  scheduledReleaseAt?: string;
  allocation?: PdfPageAllocation;
  className?: string;
}

export const PdfDocumentViewer: React.FC<PdfDocumentViewerProps> = ({
  pdfUrl,
  title,
  subModuleTitle,
  startPage = 1,
  endPage = 10,
  totalPages = 20,
  isAccessible = true,
  isScheduled = false,
  isLocked = false,
  scheduledReleaseAt,
  allocation,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(startPage);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync starting page when authorized range changes
  useEffect(() => {
    setCurrentPage(startPage);
  }, [startPage, endPage]);

  // Clean Google Drive / PDF embed URL
  const getEmbeddablePdfUrl = (url: string, pageNum: number): string => {
    if (!url) return '';
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
      return url.replace(/\/view(\?.*)?$/, '/preview');
    }
    // Direct PDF URL with page anchor
    return `${url}#page=${pageNum}&zoom=${zoomLevel}`;
  };

  const handlePrevPage = () => {
    if (currentPage > startPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < endPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Format IST timestamp for scheduled documents
  const formattedScheduledTime = scheduledReleaseAt
    ? new Date(scheduledReleaseAt).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
      }) + ' IST'
    : 'Upcoming Scheduled Release';

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col bg-[#070C18] border border-white/10 rounded-2xl overflow-hidden shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full h-[620px]'
      } ${className}`}
    >
      {/* Top Header Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0B132B] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 truncate">
          <div className="w-8 h-8 rounded-lg bg-[#00A3FF]/20 border border-[#00A3FF]/40 flex items-center justify-center text-[#00A3FF] shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-sm font-semibold text-white truncate">{title}</h4>
            {subModuleTitle && (
              <p className="text-xs text-[#00D1FF] truncate">Section: {subModuleTitle}</p>
            )}
          </div>
        </div>

        {/* Center Page Range & Status Badge */}
        <div className="hidden sm:flex items-center gap-3">
          {isAccessible ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Authorized Pages: {startPage} – {endPage} (of {totalPages})
            </span>
          ) : isScheduled ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Scheduled: {formattedScheduledTime}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Access Restricted
            </span>
          )}
        </div>

        {/* Right Tools (Zoom, Fullscreen) */}
        <div className="flex items-center gap-2">
          {isAccessible && (
            <div className="flex items-center gap-1 bg-[#132247] px-2 py-1 rounded-lg border border-white/10 text-xs text-white/80">
              <button 
                onClick={() => setZoomLevel(prev => Math.max(75, prev - 15))}
                className="p-1 hover:text-white rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono px-1">{zoomLevel}%</span>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(175, prev + 15))}
                className="p-1 hover:text-white rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-[#132247] hover:bg-[#1C3266] border border-white/10 text-white/90 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="relative flex-1 bg-[#02050E] overflow-hidden flex items-center justify-center">
        {isAccessible ? (
          /* AUTHORIZED IN-PAGE EMBEDDED VIEWER */
          <div className="w-full h-full relative">
            <iframe
              src={getEmbeddablePdfUrl(pdfUrl, currentPage)}
              title={title}
              className="w-full h-full border-0"
              style={{
                transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out'
              }}
            />
          </div>
        ) : isScheduled ? (
          /* SCHEDULED RELEASE ACCESS RESTRICTION BANNER */
          <div className="max-w-md p-8 rounded-2xl bg-[#091226] border border-amber-500/30 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10 animate-bounce">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Scheduled Learning Material</h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              This document page allocation (Pages {startPage}–{endPage}) is scheduled for automatic release by your instructor.
            </p>
            <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Unlocks on: {formattedScheduledTime}
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Access will activate automatically on this page once the scheduled timestamp is reached.
            </p>
          </div>
        ) : (
          /* LOCKED / UNRELEASED ACCESS RESTRICTION BANNER */
          <div className="max-w-md p-8 rounded-2xl bg-[#091226] border border-rose-500/30 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Document Pages Locked</h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              Pages {startPage}–{endPage} are reserved for this curriculum sub-module and have not been released by the Administrator yet.
            </p>
            <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              Prerequisite Completion Required
            </div>
          </div>
        )}
      </div>

      {/* Bottom Page Navigation Controls */}
      {isAccessible && (
        <div className="flex items-center justify-between px-6 py-3 bg-[#0B132B] border-t border-white/10 shrink-0">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= startPage}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentPage <= startPage
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-[#176BFF] hover:bg-[#00A3FF] text-white shadow-md'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Page
          </button>

          <div className="flex items-center gap-2 text-xs text-white/80 font-mono">
            <span>Accessible Page</span>
            <span className="px-2.5 py-1 rounded-md bg-[#132247] border border-white/10 text-white font-bold text-sm">
              {currentPage}
            </span>
            <span>of {endPage}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= endPage}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentPage >= endPage
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-[#176BFF] hover:bg-[#00A3FF] text-white shadow-md'
            }`}
          >
            Next Page
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
