import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  AlertCircle, 
  Loader2, 
  Download,
  ShieldCheck,
  Lock,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { pdfjsLib } from '../../utils/pdfSetup';

export interface SkillNovaPdfViewerProps {
  source: string | Blob | ArrayBuffer | Uint8Array;
  title?: string;
  subTitle?: string;
  startPage?: number;
  endPage?: number;
  initialZoom?: number;
  onLoadSuccess?: (info: { totalPages: number }) => void;
  onLoadError?: (error: any) => void;
  onDownload?: () => void;
  className?: string;
  watermarkText?: string;
  showToolbar?: boolean;
  isAccessible?: boolean;
  isScheduled?: boolean;
  isLocked?: boolean;
  scheduledReleaseAt?: string;
}

export const SkillNovaPdfViewer: React.FC<SkillNovaPdfViewerProps> = ({
  source,
  title = 'SkillNova PDF Document',
  subTitle,
  startPage = 1,
  endPage,
  initialZoom = 100,
  onLoadSuccess,
  onLoadError,
  onDownload,
  className = '',
  watermarkText,
  showToolbar = true,
  isAccessible = true,
  isScheduled = false,
  isLocked = false,
  scheduledReleaseAt,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});
  const renderTasksRef = useRef<{ [key: number]: any }>({});
  
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<string>('Initializing PDF engine...');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(initialZoom);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDriveEmbed, setIsDriveEmbed] = useState<boolean>(false);
  const [driveEmbedUrl, setDriveEmbedUrl] = useState<string>('');

  // Determine authorized page bounds
  const effectiveStart = Math.max(1, startPage);
  const effectiveEnd = endPage ? Math.max(effectiveStart, endPage) : totalPages || effectiveStart;

  // 1. Check if source is a Google Drive URL (Google Drive does not allow direct CORS fetches)
  useEffect(() => {
    if (typeof source === 'string') {
      const trimmed = source.trim();
      if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
        let embed = trimmed;
        const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          embed = `https://drive.google.com/file/d/${match[1]}/preview`;
        } else {
          embed = trimmed.replace(/\/view(\?.*)?$/, '/preview');
        }
        setIsDriveEmbed(true);
        setDriveEmbedUrl(embed);
        setIsLoading(false);
        return;
      }
    }
    setIsDriveEmbed(false);
  }, [source]);

  // 2. Load PDF Document via PDF.js
  useEffect(() => {
    if (isDriveEmbed || !isAccessible) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);
    setLoadingProgress('Loading PDF document data...');

    // Cancel existing renders
    Object.values(renderTasksRef.current).forEach(task => {
      try { task.cancel(); } catch {}
    });
    renderTasksRef.current = {};

    async function loadDocument() {
      try {
        let pdfData: Uint8Array | string;

        if (source instanceof Uint8Array) {
          pdfData = source;
        } else if (source instanceof ArrayBuffer) {
          pdfData = new Uint8Array(source);
        } else if (source instanceof Blob) {
          setLoadingProgress('Reading PDF stream...');
          const buf = await source.arrayBuffer();
          pdfData = new Uint8Array(buf);
        } else if (typeof source === 'string') {
          const trimmed = source.trim();
          if (trimmed.startsWith('blob:')) {
            setLoadingProgress('Resolving local PDF blob...');
            const res = await fetch(trimmed);
            if (!res.ok) throw new Error(`Failed to load blob: ${res.statusText}`);
            const buf = await res.arrayBuffer();
            pdfData = new Uint8Array(buf);
          } else if (trimmed.startsWith('data:application/pdf')) {
            setLoadingProgress('Decoding PDF buffer...');
            const base64 = trimmed.split(',')[1];
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            pdfData = bytes;
          } else {
            // Direct URL
            pdfData = trimmed;
          }
        } else {
          throw new Error('Unrecognized PDF source format');
        }

        if (!isMounted) return;

        setLoadingProgress('Parsing PDF structures...');
        const loadingTask = pdfjsLib.getDocument(
          typeof pdfData === 'string'
            ? { url: pdfData, cMapPacked: true }
            : { data: pdfData, cMapPacked: true }
        );

        loadingTask.onProgress = (prog: { loaded: number; total: number }) => {
          if (prog.total > 0) {
            const percent = Math.round((prog.loaded / prog.total) * 100);
            setLoadingProgress(`Loading document: ${percent}%`);
          }
        };

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setIsLoading(false);

        if (onLoadSuccess) {
          onLoadSuccess({ totalPages: doc.numPages });
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('PDF.js loading failed:', err);
        const errMsg = err?.message || 'Failed to render PDF document';
        setLoadError(errMsg);
        setIsLoading(false);
        if (onLoadError) onLoadError(err);
      }
    }

    loadDocument();

    return () => {
      isMounted = false;
      Object.values(renderTasksRef.current).forEach(task => {
        try { task.cancel(); } catch {}
      });
      renderTasksRef.current = {};
    };
  }, [source, isDriveEmbed, isAccessible]);

  // 3. Track Container Width with ResizeObserver for mobile rotation / resizing
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const updateWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };
    updateWidth();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = Math.round(entry.contentRect.width);
        setContainerWidth(prev => (Math.abs(prev - newWidth) > 5 ? newWidth : prev));
      }
    });

    resizeObserver.observe(scrollContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [isLoading]);

  // 4. Render Pages on Canvas
  const renderAllPages = useCallback(async () => {
    if (!pdfDoc || !containerWidth) return;

    const start = Math.max(1, startPage);
    const end = Math.min(pdfDoc.numPages, endPage ? endPage : pdfDoc.numPages);

    // Pixel ratio for Retina / high-DPI Android screens
    const pixelRatio = typeof window !== 'undefined' ? Math.max(window.devicePixelRatio || 1, 2) : 2;

    for (let pageNum = start; pageNum <= end; pageNum++) {
      const canvas = canvasRefs.current[pageNum];
      if (!canvas) continue;

      try {
        const page = await pdfDoc.getPage(pageNum);
        const unscaledViewport = page.getViewport({ scale: 1.0 });

        // Responsive scale calculation
        // On mobile, account for small 12-16px padding; on desktop, 32px padding
        const padding = containerWidth < 500 ? 16 : 32;
        const availableWidth = Math.max(containerWidth - padding, 240);
        const fitScale = availableWidth / unscaledViewport.width;
        const effectiveScale = fitScale * (zoomLevel / 100);

        const viewport = page.getViewport({ scale: effectiveScale });

        // Cancel any active render task on this page
        if (renderTasksRef.current[pageNum]) {
          try {
            renderTasksRef.current[pageNum].cancel();
          } catch {}
        }

        // Set canvas buffer dimensions to Hi-DPI resolution
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);

        // Set CSS display dimensions to logical points
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) continue;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          transform: [pixelRatio, 0, 0, pixelRatio, 0, 0]
        };

        const renderTask = page.render(renderContext);
        renderTasksRef.current[pageNum] = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`Error rendering PDF page ${pageNum}:`, err);
        }
      }
    }
  }, [pdfDoc, containerWidth, zoomLevel, startPage, endPage]);

  useEffect(() => {
    if (pdfDoc && containerWidth > 0 && !isLoading) {
      renderAllPages();
    }
  }, [pdfDoc, containerWidth, zoomLevel, renderAllPages, isLoading]);

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(225, prev + 15));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(65, prev - 15));
  const handleZoomReset = () => setZoomLevel(100);

  // Fullscreen toggle
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

  const pageRangeList: number[] = [];
  if (pdfDoc && totalPages > 0) {
    const start = Math.max(1, startPage);
    const end = Math.min(totalPages, endPage ? endPage : totalPages);
    for (let i = start; i <= end; i++) {
      pageRangeList.push(i);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`skillnova-pdf-viewer relative w-full h-full flex flex-col bg-[#070C18] text-white overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-[99999] rounded-none' : 'rounded-2xl'
      } ${className}`}
    >
      {/* Viewer Header / Toolbar */}
      {showToolbar && (
        <div className="shrink-0 px-3.5 py-2.5 sm:px-5 sm:py-3 bg-[#0A1224] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#176BFF]/20 text-[#00E5FF] flex items-center justify-center border border-[#00E5FF]/30 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0 truncate">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {title}
              </h4>
              {subTitle && (
                <p className="text-[10px] text-slate-400 truncate">{subTitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Page Count Badge */}
            {totalPages > 0 && (
              <span className="text-[10px] sm:text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10 whitespace-nowrap">
                {endPage && endPage < totalPages
                  ? `Pages ${effectiveStart}–${effectiveEnd} of ${totalPages}`
                  : `${totalPages} Page${totalPages > 1 ? 's' : ''}`}
              </span>
            )}

            {/* Zoom Controls */}
            {!isDriveEmbed && !isLoading && !loadError && (
              <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-white/15 text-xs text-white">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 65}
                  className="p-1 hover:text-[#00E5FF] rounded disabled:opacity-30 cursor-pointer"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomReset}
                  className="px-1 font-mono text-[11px] text-slate-200 hover:text-white"
                  title="Reset to Fit Width"
                >
                  {zoomLevel}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 225}
                  className="p-1 hover:text-[#00E5FF] rounded disabled:opacity-30 cursor-pointer"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Optional Download Button in toolbar */}
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="px-2.5 py-1 rounded-lg bg-[#176BFF] hover:bg-[#00A3FF] text-white text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enlarge to Fullscreen'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enlarge to Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-[#00E5FF]" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Main Document Body */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 min-h-0 bg-[#040814] overflow-y-auto overflow-x-hidden p-2 sm:p-4 flex flex-col items-center select-none"
      >
        {isDriveEmbed ? (
          /* GOOGLE DRIVE EMBED PREVIEW */
          <div className="w-full h-full min-h-[480px] rounded-xl overflow-hidden bg-black relative border border-white/10">
            <iframe
              src={driveEmbedUrl}
              title={title}
              className="w-full h-full border-0 block"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        ) : isLoading ? (
          /* LOADING SPINNER WITH PROGRESS */
          <div className="my-auto flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#176BFF]/20 text-[#00E5FF] flex items-center justify-center border border-[#00E5FF]/30 shadow-lg shadow-[#00E5FF]/20">
              <Loader2 className="w-6 h-6 animate-spin text-[#00E5FF]" />
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-bold text-white tracking-wide">Rendering SkillNova Document</h5>
              <p className="text-xs text-slate-400 font-mono">{loadingProgress}</p>
            </div>
          </div>
        ) : loadError ? (
          /* ERROR STATE WITH RETRY AND FALLBACK */
          <div className="my-auto max-w-md p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center space-y-3 mx-4">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h4 className="text-sm font-bold text-rose-200">PDF Rendering Notice</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{loadError}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setLoadError(null);
                  setZoomLevel(100);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              {onDownload && (
                <button
                  type="button"
                  onClick={onDownload}
                  className="px-4 py-2 rounded-xl bg-[#176BFF] hover:bg-[#00A3FF] text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              )}
            </div>
          </div>
        ) : pageRangeList.length > 0 ? (
          /* RENDERED CANVAS PAGES IN VERTICAL SCROLL */
          <div className="w-full flex flex-col items-center space-y-4 sm:space-y-6 py-2">
            {pageRangeList.map((pageNum) => (
              <div
                key={`pdf-page-${pageNum}`}
                className="relative bg-white shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden border border-slate-300 dark:border-white/15 transition-transform"
                style={{
                  maxWidth: '100%'
                }}
              >
                {/* The Canvas on which PDF.js draws the vectors and text */}
                <canvas
                  ref={(el) => {
                    canvasRefs.current[pageNum] = el;
                  }}
                  className="block mx-auto bg-white"
                />

                {/* Subtle Page Indicator on Page Bottom */}
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white/90 text-[10px] font-mono border border-white/10 pointer-events-none select-none">
                  Page {pageNum} of {totalPages}
                </div>

                {/* Optional Security / Watermark Overlay */}
                {watermarkText && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden opacity-10">
                    <span className="text-4xl sm:text-6xl font-black text-slate-900 -rotate-45 tracking-widest uppercase">
                      {watermarkText}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* End of Document Footer Note */}
            <div className="py-4 text-center text-xs text-slate-500 font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SkillNova Verified Learning Document • End of Preview</span>
            </div>
          </div>
        ) : (
          <div className="my-auto text-center text-slate-400 text-xs py-8">
            No pages found in this document.
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillNovaPdfViewer;

