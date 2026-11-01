import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, MapPin, Sparkles, Download } from 'lucide-react';

interface RoadmapViewerProps {
  roadmapUrl: string;
  courseTitle: string;
  allowReplace?: boolean;
  onReplaceUrl?: (newUrl: string) => void;
}

export const InteractiveRoadmapViewer: React.FC<RoadmapViewerProps> = ({
  roadmapUrl,
  courseTitle,
  allowReplace = false,
  onReplaceUrl,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [newUrlInput, setNewUrlInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.6));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    handleReset();
  };

  return (
    <div className={`relative bg-[#080E1C] rounded-2xl border border-[#1F2E47] overflow-hidden transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'w-full shadow-lg'
    }`}>
      {/* Roadmap Header Controls */}
      <div className="bg-[#101A2D]/95 backdrop-blur-md px-4 py-3 border-b border-[#1F2E47] flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/30">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold text-[#F0F5FF] flex items-center gap-2">
              <span>Interactive Learning Roadmap</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#397BFF]/20 text-[#77B4FF] border border-[#397BFF]/30">
                ZOOM & PAN ENABLED
              </span>
            </h3>
            <p className="text-[11px] text-[#9BAAC2]">{courseTitle} • Dynamic Curriculum Progression</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-[#15233A] text-[#9BAAC2] hover:text-[#F0F5FF] hover:bg-[#1F2E47] border border-[#1F2E47] transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-[#77B4FF] px-2 bg-[#15233A] py-1 rounded border border-[#1F2E47]">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-[#15233A] text-[#9BAAC2] hover:text-[#F0F5FF] hover:bg-[#1F2E47] border border-[#1F2E47] transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-[#15233A] text-[#9BAAC2] hover:text-[#F0F5FF] hover:bg-[#1F2E47] border border-[#1F2E47] transition"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-[#15233A] text-[#9BAAC2] hover:text-[#F0F5FF] hover:bg-[#1F2E47] border border-[#1F2E47] transition ml-1"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {allowReplace && onReplaceUrl && (
            <button
              onClick={() => setShowReplaceModal(true)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-[#397BFF]/20 text-[#77B4FF] hover:bg-[#397BFF]/30 border border-[#397BFF]/40 font-medium transition ml-2 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Replace Roadmap</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Canvas / Image Viewer */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative overflow-hidden cursor-grab active:cursor-grabbing bg-radial from-[#101A2D] to-[#080E1C] flex items-center justify-center select-none ${
          isFullscreen ? 'flex-1' : 'h-[360px] md:h-[480px]'
        }`}
      >
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#397BFF_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative max-w-full max-h-full flex items-center justify-center p-4"
        >
          <img
            src={roadmapUrl}
            alt={`${courseTitle} Roadmap`}
            draggable={false}
            className="rounded-xl shadow-2xl border border-[#397BFF]/30 object-contain max-h-[440px] pointer-events-none"
            onError={(e) => {
              // Fallback roadmap graphic if external image fails
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* Floating helper tooltip */}
        <div className="absolute bottom-3 left-4 text-[11px] text-[#9BAAC2] bg-[#101A2D]/80 backdrop-blur px-3 py-1 rounded-full border border-[#1F2E47] pointer-events-none flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#77B4FF]" />
          Click and drag to pan • Use + / - to inspect topic branches
        </div>
      </div>

      {/* Admin Replace Roadmap Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#101A2D] border border-[#1F2E47] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-[#F0F5FF] mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#397BFF]" />
              Update Course Roadmap Image
            </h3>
            <p className="text-xs text-[#9BAAC2] mb-4">
              Enter a direct image or PDF link (PNG, JPG, WebP) to update the learning map. Changes will reflect instantly on the student portal without breaking existing student progress.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#9BAAC2] block mb-1">Roadmap Image URL</label>
                <input
                  type="text"
                  placeholder="https://.../roadmap-v2.png"
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  className="w-full bg-[#15233A] border border-[#1F2E47] rounded-lg px-3 py-2 text-xs text-[#F0F5FF] focus:border-[#397BFF] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowReplaceModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#9BAAC2] hover:text-[#F0F5FF] bg-[#15233A]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newUrlInput.trim() && onReplaceUrl) {
                      onReplaceUrl(newUrlInput.trim());
                      setShowReplaceModal(false);
                      setNewUrlInput('');
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#397BFF] text-white hover:bg-[#2868ea] shadow-lg shadow-[#397BFF]/30"
                >
                  Save & Publish Roadmap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
