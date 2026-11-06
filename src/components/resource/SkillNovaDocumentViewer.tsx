import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Presentation as PresIcon, HelpCircle, Lock,
  ExternalLink, Sparkles, AlertCircle, RefreshCw, Eye,
  ChevronLeft, ChevronRight, Maximize2, Minimize2
} from 'lucide-react';
import { resolveResourceUrl } from '../../utils/resourceUrlResolver';

interface SkillNovaDocumentViewerProps {
  url: string;
  title: string;
  resourceType?: 'ppt' | 'notes' | 'interview' | 'pdf' | 'generic';
  startRange?: number;
  endRange?: number;
  totalRange?: number;
  rangeUnit?: 'slides' | 'pages';
  className?: string;
}

export const SkillNovaDocumentViewer: React.FC<SkillNovaDocumentViewerProps> = ({
  url,
  title,
  resourceType = 'notes',
  startRange,
  endRange,
  totalRange,
  rangeUnit = resourceType === 'ppt' ? 'slides' : 'pages',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const minRange = startRange || 1;
  const maxRange = endRange || totalRange || 1;
  const [currentSlide, setCurrentSlide] = useState<number>(minRange);

  useEffect(() => {
    setCurrentSlide(minRange);
  }, [minRange]);

  const resolved = resolveResourceUrl(url, resourceType);

  const hasRangeRestriction = Boolean(startRange && endRange && (startRange > 1 || (totalRange && endRange < totalRange)));

  // Generate slide URL if applicable
  const getSlideEmbedUrl = () => {
    if (!resolved.embedUrl) return '';
    if (resourceType === 'ppt' && resolved.embedUrl.includes('docs.google.com/presentation')) {
      const baseUrl = resolved.embedUrl.split('#')[0];
      return `${baseUrl}#slide=id.p${currentSlide}`;
    }
    return resolved.embedUrl;
  };

  const handlePrevSlide = () => {
    if (currentSlide > minRange) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < maxRange) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const getIcon = () => {
    switch (resourceType) {
      case 'ppt':
        return <PresIcon className="w-4 h-4 text-[#00A8FF]" />;
      case 'interview':
        return <HelpCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return <FileText className="w-4 h-4 text-[#00A8FF]" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 shadow-xl flex flex-col ${className}`}
    >
      
      {/* Top Controls & Restriction Badge Bar */}
      <div className="px-4 py-2.5 bg-slate-900/95 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-[#00A8FF]/20 text-[#00A8FF] flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate max-w-sm">{title}</h4>
            <span className="text-[10px] text-slate-400 font-mono block">
              SkillNova Verified In-Platform Document Reader
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Page / Slide Range Restriction Badge */}
          {startRange && endRange ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#00A8FF]/15 text-[#00E5FF] border border-[#00A8FF]/30">
              <Lock className="w-3 h-3 text-[#00E5FF]" />
              <span>
                Scope: {rangeUnit === 'slides' ? 'Slides' : 'Pages'} {startRange}–{endRange}
                {totalRange ? ` of ${totalRange}` : ''}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <Eye className="w-3 h-3" />
              <span>Full Scope</span>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Iframe Container with External-Link Pop-Out Cover Overlay */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[420px] bg-black">
        
        {/* SKILLNOVA POP-OUT COVER OVERLAY (Part A, Requirement 5) */}
        {/* Placed precisely over the top-right corner to cover external "Pop out" / redirect button */}
        <div
          className="absolute top-2.5 right-2.5 z-30 pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/95 hover:bg-slate-900 text-white border border-white/20 shadow-2xl backdrop-blur-md cursor-default select-none"
          title="SkillNova Protected Learning Environment"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
          <span className="text-[11px] font-bold font-mono tracking-tight text-[#00E5FF]">
            SkillNova Secure
          </span>
        </div>

        {/* Iframe View */}
        {!loadError && resolved.embedUrl ? (
          <iframe
            key={`slide-frame-${currentSlide}`}
            src={getSlideEmbedUrl()}
            title={title}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen"
            allowFullScreen
            loading="lazy"
            onError={() => setLoadError(true)}
          />
        ) : (
          /* Branded Fallback View */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950 text-white space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#00A8FF]/20 border border-[#00A8FF]/40 text-[#00E5FF] flex items-center justify-center shadow-lg shadow-[#00A8FF]/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-2">
              <h4 className="text-base font-bold text-white">Institutional Document Ready</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                This document ({title}) is hosted on {resolved.provider.replace('_', ' ').toUpperCase()}. If the in-browser preview is restricted by external provider permissions, you can access the authorized resource directly.
              </p>
            </div>
            {hasRangeRestriction && (
              <div className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                Restricted to: {rangeUnit === 'slides' ? 'Slides' : 'Pages'} {startRange}–{endRange}
              </div>
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00A8FF] hover:bg-[#176BFF] text-white text-xs font-bold transition shadow-lg shadow-[#00A8FF]/25"
            >
              <span>Open Document Directly</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Slide / Page Navigation Bar for PPTs and Multi-page Docs */}
      {(resourceType === 'ppt' || totalRange || endRange) && (
        <div className="px-4 py-2.5 bg-slate-950 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlide <= minRange}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 transition"
              title="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 font-mono text-xs font-bold">
              {rangeUnit === 'slides' ? 'Slide' : 'Page'} <span className="text-[#00E5FF]">{currentSlide}</span> of {maxRange}
            </div>
            <button
              onClick={handleNextSlide}
              disabled={currentSlide >= maxRange}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 transition"
              title="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            {hasRangeRestriction ? (
              <span>Authorized Scope: {minRange}–{maxRange}</span>
            ) : (
              <span className="text-emerald-400">Interactive Slide Deck</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

