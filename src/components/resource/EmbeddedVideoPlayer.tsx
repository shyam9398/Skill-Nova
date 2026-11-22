import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Film,
  Sparkles,
  ArrowLeft,
  X
} from 'lucide-react';
import { dataService } from '../../services/dataService';

interface EmbeddedVideoPlayerProps {
  url: string;
  title: string;
  subtitle?: string;
  poster?: string;
  onEnded?: () => void;
  className?: string;
}

export const EmbeddedVideoPlayer: React.FC<EmbeddedVideoPlayerProps> = ({
  url,
  title,
  subtitle,
  poster,
  onEnded,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);
  const hasRecordedActivityRef = useRef<boolean>(false);

  // Mobile Detection and Dedicated Mobile Fullscreen Player State (Requirement 2 & 3)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);
  const scrollPosRef = useRef<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
    };
  }, []);

  const openMobileFullscreen = () => {
    if (typeof window !== 'undefined') {
      scrollPosRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      window.history.pushState({ skillnovaVideoModal: true }, '');
    }
    setIsMobileFullscreen(true);
    recordViewingActivity();

    // Attempt native fullscreen if supported
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}
  };

  const closeMobileFullscreen = () => {
    setIsMobileFullscreen(false);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = '';
      window.scrollTo(0, scrollPosRef.current);
      if (window.history.state?.skillnovaVideoModal) {
        window.history.back();
      }
    }

    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {}
  };

  // Device Back Button & Escape Key Handling for Mobile Fullscreen (Requirement 2)
  useEffect(() => {
    const handlePopState = () => {
      if (isMobileFullscreen) {
        setIsMobileFullscreen(false);
        document.body.style.overflow = '';
        window.scrollTo(0, scrollPosRef.current);
        try {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {}
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileFullscreen) {
        closeMobileFullscreen();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileFullscreen]);

  const cleanUrl = (url || '').trim();

  const recordViewingActivity = () => {
    if (hasRecordedActivityRef.current || !cleanUrl) return;
    hasRecordedActivityRef.current = true;
    const currentUser = dataService.getCurrentUser();
    void dataService.recordStudentActivity({
      student_id: currentUser?.id || 'usr-student-1',
      activity_type: 'video_view',
      item_id: cleanUrl,
      item_title: title || 'Video Lesson',
      xp_earned: 25,
      metadata: { subtitle, duration },
    });
  };

  // Determine source type
  const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(cleanUrl) || cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:');
  const isYouTube = cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be');
  const isGoogleDrive = cleanUrl.includes('drive.google.com') || cleanUrl.includes('docs.google.com');
  const isVimeo = cleanUrl.includes('vimeo.com');

  // For iframe embeds (YouTube / Drive / Vimeo), automatically record after 15s of interaction
  useEffect(() => {
    if (!isDirectVideo && cleanUrl) {
      const timer = window.setTimeout(() => {
        recordViewingActivity();
      }, 15000);
      return () => window.clearTimeout(timer);
    }
  }, [isDirectVideo, cleanUrl]);

  // Format Google Drive embed URL
  const getGoogleDriveEmbedUrl = (rawUrl: string): string => {
    try {
      const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
      return rawUrl.replace(/\/(view|edit|pub)(\?.*)?$/, '/preview');
    } catch {
      return rawUrl;
    }
  };

  // Format YouTube embed URL with mobile playsinline and clean params
  const getYouTubeEmbedUrl = (rawUrl: string): string => {
    try {
      let videoId = '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = rawUrl.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      } else if (rawUrl.includes('youtu.be/')) {
        videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0] || '';
      } else if (rawUrl.includes('watch?v=')) {
        videoId = new URL(rawUrl).searchParams.get('v') || '';
      } else if (rawUrl.includes('/embed/')) {
        const u = new URL(rawUrl);
        u.searchParams.set('playsinline', '1');
        return u.toString();
      }
      return videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`
        : rawUrl;
    } catch {
      return rawUrl;
    }
  };

  // Format Vimeo embed URL
  const getVimeoEmbedUrl = (rawUrl: string): string => {
    try {
      const match = rawUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}?autoplay=0&playsinline=1`;
      }
      return rawUrl;
    } catch {
      return rawUrl;
    }
  };

  // HTML5 controls handling
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(e => console.warn('Video play error:', e));
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);
    if (videoRef.current.duration > 0 && cur / videoRef.current.duration >= 0.8) {
      recordViewingActivity();
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = Number(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMute = !isMuted;
    videoRef.current.muted = newMute;
    setIsMuted(newMute);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = Number(e.target.value);
    videoRef.current.volume = val;
    setVolume(val);
    if (val === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.warn(err));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.warn(err));
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2800);
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`video-wrapper video-container relative w-full max-w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 group ${className}`}
      style={{ aspectRatio: '16/9' }}
    >
      {/* DIRECT MP4 / HTML5 VIDEO PLAYER */}
      {isDirectVideo ? (
        <>
          <video
            ref={videoRef}
            src={cleanUrl}
            poster={poster}
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-contain cursor-pointer block bg-black"
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              setIsPlaying(false);
              recordViewingActivity();
              if (onEnded) onEnded();
            }}
          />

          {/* Top Title Overlay */}
          <div className={`absolute top-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/45 to-transparent flex items-center justify-between transition-opacity duration-300 pointer-events-none z-20 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex items-center gap-2 sm:gap-2.5 overflow-hidden">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#00A3FF]/20 border border-[#00A3FF]/40 flex items-center justify-center text-[#00A3FF] shrink-0">
                <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <div className="truncate min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">{title}</h4>
                {subtitle && <p className="text-[10px] sm:text-xs text-white/60 truncate">{subtitle}</p>}
              </div>
            </div>
            <span className="hidden sm:inline-block text-[10px] sm:text-[11px] font-mono font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-white/10 backdrop-blur-md text-white/80 border border-white/10 shrink-0">
              HD 1080p
            </span>
          </div>

          {/* Big Center Play Button when paused */}
          {!isPlaying && (
            <button
              type="button"
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#00A3FF] hover:bg-[#176BFF] text-white flex items-center justify-center shadow-lg shadow-[#00A3FF]/40 transition-transform transform hover:scale-110 active:scale-95 z-20"
              aria-label="Play Video"
            >
              <Play className="w-5 h-5 sm:w-7 sm:h-7 ml-0.5 sm:ml-1 fill-white" />
            </button>
          )}

          {/* Bottom Custom Controls Bar */}
          <div className={`absolute bottom-0 inset-x-0 p-2.5 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 z-20 ${
            showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}>
            {/* Progress Scrubber */}
            <div className="relative mb-2 sm:mb-3 flex items-center group/scrub">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 sm:h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00A3FF] hover:h-2 transition-all"
                aria-label="Video scrubber"
              />
            </div>

            <div className="flex items-center justify-between text-white text-xs gap-2">
              <div className="flex items-center gap-1.5 sm:gap-3 overflow-hidden">
                <button 
                  type="button"
                  onClick={togglePlay} 
                  className="p-1 sm:p-1.5 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                  title={isPlaying ? 'Pause' : 'Play'}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />}
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                    }
                  }} 
                  className="p-1 sm:p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white shrink-0"
                  title="Rewind 10s"
                  aria-label="Rewind 10s"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <div className="flex items-center gap-1 sm:gap-2 group/vol shrink-0">
                  <button 
                    type="button"
                    onClick={toggleMute}
                    className="p-1 sm:p-1.5 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                    title={isMuted ? 'Unmute' : 'Mute'}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-12 sm:w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00A3FF] hidden sm:block"
                    aria-label="Volume slider"
                  />
                </div>

                <span className="font-mono text-[10px] sm:text-[11px] text-white/70 whitespace-nowrap">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Single Screen Size Enlarge Icon in bottom of video */}
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1 sm:p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/90 hover:text-white"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enlarge Screen'}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enlarge Screen'}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-[#00E5FF]" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : isGoogleDrive ? (
        /* GOOGLE DRIVE EMBEDDED PLAYER - Responsive within page */
        <div className="video-inner-frame absolute inset-0 w-full h-full bg-[#050811] overflow-hidden">
          <iframe
            src={getGoogleDriveEmbedUrl(cleanUrl)}
            title={title}
            className="w-full h-full border-0 block"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : isYouTube ? (
        /* YOUTUBE EMBEDDED PLAYER - Responsive within page */
        <div className="video-inner-frame absolute inset-0 w-full h-full bg-[#050811] overflow-hidden">
          <iframe
            src={getYouTubeEmbedUrl(cleanUrl)}
            title={title}
            className="w-full h-full border-0 block"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : isVimeo ? (
        /* VIMEO EMBEDDED PLAYER - Responsive within page */
        <div className="video-inner-frame absolute inset-0 w-full h-full bg-[#050811] overflow-hidden">
          <iframe
            src={getVimeoEmbedUrl(cleanUrl)}
            title={title}
            className="w-full h-full border-0 block"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : cleanUrl ? (
        /* GENERIC / FALLBACK IFRAME EMBED */
        <div className="video-inner-frame absolute inset-0 w-full h-full bg-[#050811] overflow-hidden">
          <iframe
            src={cleanUrl}
            title={title}
            className="w-full h-full border-0 block"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        </div>
      ) : (
        /* Clean SkillNova-branded fallback screen */
        <div className="video-inner-frame absolute inset-0 w-full h-full bg-[#050811] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#176BFF] to-[#00A3FF] flex items-center justify-center text-white shadow-lg shadow-[#00A3FF]/25">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="text-xl font-black text-white tracking-tight">
              Skill<span className="text-[#00A3FF]">Nova</span> Player
            </span>
            <h4 className="text-sm font-bold text-slate-200">{title}</h4>
            <p className="text-xs text-slate-400">Video lecture is ready for playback</p>
          </div>
        </div>
      )}

      {/* ONLY ONE screen size enlarge icon at the bottom of the video for iframe embeds */}
      {!isDirectVideo && cleanUrl && (
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-30 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isMobile) {
                openMobileFullscreen();
              } else {
                toggleFullscreen();
              }
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black/80 hover:bg-black text-white/90 hover:text-white border border-white/20 shadow-xl backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enlarge Screen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enlarge Screen'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00E5FF]" /> : <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />}
          </button>
        </div>
      )}

      {/* MOBILE TAP-TO-WATCH FULLSCREEN OVERLAY (Requirement 2) */}
      {isMobile && cleanUrl && (
        <div
          onClick={openMobileFullscreen}
          className="absolute inset-0 z-20 cursor-pointer bg-gradient-to-t from-black/90 via-black/45 to-black/65 flex flex-col items-center justify-center p-4 text-center select-none group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openMobileFullscreen();
            }
          }}
          aria-label={`Play ${title} in fullscreen`}
        >
          {/* Top Video Header on Mobile Card */}
          <div className="absolute top-2.5 inset-x-2.5 sm:top-3 sm:inset-x-3 flex items-center justify-between text-left pointer-events-none">
            <span className="text-[10px] sm:text-xs font-bold text-white/90 truncate max-w-[70%]">
              {title}
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/15 text-white border border-white/20">
              1080p HD
            </span>
          </div>

          {/* Central Glowing Play Button */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-[#176BFF] to-[#00A3FF] hover:from-[#00A3FF] hover:to-[#00E5FF] text-white flex items-center justify-center shadow-2xl shadow-[#00A3FF]/60 transform transition group-hover:scale-110 active:scale-95 mb-2">
            <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-1 fill-white" />
          </div>

          <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
            Tap to Watch in Fullscreen
          </span>
          {subtitle && (
            <span className="text-[10px] sm:text-xs text-white/70 font-medium truncate max-w-[85%] mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>

    {/* DEDICATED MOBILE FULLSCREEN MODAL (Requirement 2) */}
    {isMobileFullscreen && typeof document !== 'undefined' && createPortal(
      <div 
        className="fixed inset-0 z-[99999] bg-black text-white flex flex-col justify-between overflow-hidden select-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100dvh',
          zIndex: 99999,
          backgroundColor: '#000000'
        }}
      >
        {/* Top Header Bar with Close/Back Button, Title, and X Button */}
        <div className="shrink-0 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-b from-black/95 via-black/80 to-transparent flex items-center justify-between gap-3 z-30 border-b border-white/10">
          <button
            type="button"
            onClick={closeMobileFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold border border-white/25 backdrop-blur-md transition shadow-md shrink-0"
            aria-label="Back to course page"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>Back</span>
          </button>

          <div className="truncate text-center px-1 flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate">{title}</h4>
            {subtitle && <p className="text-[10px] text-white/70 truncate">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={closeMobileFullscreen}
            className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/25 backdrop-blur-md transition shadow-md shrink-0"
            aria-label="Exit fullscreen"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Centered 16:9 Video Frame: Stays 16:9, Never Stretched or Cropped */}
        <div className="flex-1 flex items-center justify-center w-full px-2 sm:px-4 min-h-0 relative">
          <div 
            className="w-full relative shadow-2xl rounded-2xl overflow-hidden bg-black border border-white/10"
            style={{
              aspectRatio: '16 / 9',
              maxWidth: '100%',
              maxHeight: 'min(calc(100vh - 110px), calc(100dvh - 110px))'
            }}
          >
            {isDirectVideo ? (
              <video
                src={cleanUrl}
                poster={poster}
                playsInline
                controls
                autoPlay
                className="w-full h-full object-contain block bg-black"
              />
            ) : isGoogleDrive ? (
              <iframe
                src={getGoogleDriveEmbedUrl(cleanUrl)}
                title={title}
                className="w-full h-full border-0 block"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : isYouTube ? (
              <iframe
                src={getYouTubeEmbedUrl(cleanUrl)}
                title={title}
                className="w-full h-full border-0 block"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : isVimeo ? (
              <iframe
                src={getVimeoEmbedUrl(cleanUrl)}
                title={title}
                className="w-full h-full border-0 block"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <iframe
                src={cleanUrl}
                title={title}
                className="w-full h-full border-0 block"
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
              />
            )}
          </div>
        </div>

        {/* Bottom Status / Exit Bar */}
        <div className="shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex items-center justify-between text-xs text-white/80 z-30 border-t border-white/10">
          <span className="text-[10px] sm:text-xs font-mono text-[#00A3FF]">
            SkillNova Mobile Cinema
          </span>
          <button
            type="button"
            onClick={closeMobileFullscreen}
            className="text-xs text-white/90 hover:text-white font-bold flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/15"
          >
            <Minimize className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      </div>,
      document.body
    )}
    </>
  );
};
export default EmbeddedVideoPlayer;