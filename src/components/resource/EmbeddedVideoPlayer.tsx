import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Tv,
  Film
} from 'lucide-react';

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

  // Determine source type
  const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.startsWith('blob:') || url.startsWith('data:');
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isGoogleDrive = url.includes('drive.google.com') || url.includes('docs.google.com');

  // Format Google Drive embed URL
  const getGoogleDriveEmbedUrl = (rawUrl: string): string => {
    try {
      const match = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
      return rawUrl.replace(/\/view(\?.*)?$/, '/preview');
    } catch {
      return rawUrl;
    }
  };

  // Format YouTube embed URL
  const getYouTubeEmbedUrl = (rawUrl: string): string => {
    try {
      let videoId = '';
      if (rawUrl.includes('youtu.be/')) {
        videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (rawUrl.includes('watch?v=')) {
        videoId = new URL(rawUrl).searchParams.get('v') || '';
      } else if (rawUrl.includes('/embed/')) {
        return rawUrl;
      }
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1` : rawUrl;
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
    setCurrentTime(videoRef.current.currentTime);
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
      containerRef.current.requestFullscreen().catch(err => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
      setIsFullscreen(false);
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
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 group ${className}`}
      style={{ aspectRatio: '16/9' }}
    >
      {/* DIRECT MP4 / HTML5 VIDEO PLAYER */}
      {isDirectVideo ? (
        <>
          <video
            ref={videoRef}
            src={url}
            poster={poster}
            playsInline
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              setIsPlaying(false);
              if (onEnded) onEnded();
            }}
          />

          {/* Top Title Overlay */}
          <div className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#00A3FF]/20 border border-[#00A3FF]/40 flex items-center justify-center text-[#00A3FF]">
                <Film className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-white truncate max-w-md">{title}</h4>
                {subtitle && <p className="text-xs text-white/60 truncate">{subtitle}</p>}
              </div>
            </div>
            <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md text-white/80 border border-white/10">
              HD 1080p
            </span>
          </div>

          {/* Big Center Play Button when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#00A3FF] hover:bg-[#176BFF] text-white flex items-center justify-center shadow-lg shadow-[#00A3FF]/40 transition-transform transform hover:scale-110 active:scale-95"
            >
              <Play className="w-7 h-7 ml-1 fill-white" />
            </button>
          )}

          {/* Bottom Custom Controls Bar */}
          <div className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}>
            {/* Progress Scrubber */}
            <div className="relative mb-3 flex items-center group/scrub">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00A3FF] hover:h-2.5 transition-all"
              />
            </div>

            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <button 
                  onClick={togglePlay} 
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                </button>

                <button 
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                    }
                  }} 
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 group/vol">
                  <button 
                    onClick={toggleMute}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00A3FF]"
                  />
                </div>

                <span className="font-mono text-[11px] text-white/70 ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleFullscreen}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : isGoogleDrive ? (
        /* GOOGLE DRIVE EMBEDDED PLAYER - Responsive within page */
        <div className="relative w-full h-full bg-[#050811]">
          <iframe
            src={getGoogleDriveEmbedUrl(url)}
            title={title}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        </div>
      ) : isYouTube ? (
        /* YOUTUBE EMBEDDED PLAYER - Responsive within page */
        <div className="relative w-full h-full bg-[#050811]">
          <iframe
            src={getYouTubeEmbedUrl(url)}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        /* GENERIC / FALLBACK IFRAME EMBED */
        <div className="relative w-full h-full bg-[#050811] flex flex-col items-center justify-center">
          <iframe
            src={url}
            title={title}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};
